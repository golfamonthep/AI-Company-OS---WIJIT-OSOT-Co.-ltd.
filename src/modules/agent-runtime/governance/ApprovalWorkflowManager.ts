import type { SupabaseClient } from "@supabase/supabase-js";
import { createAuditEvent, saveAuditEvent } from "@/modules/agent-runtime/governance/AuditLogger";
import type { ApprovalDomain, CompanyAgentId, GovernanceApprovalRequest } from "@/modules/agent-runtime/governance/types";

const approvalChains: Record<ApprovalDomain, Array<CompanyAgentId | "human">> = {
  publishing: ["ceo", "human"],
  campaign: ["ceo"],
  budget: ["cfo", "ceo"],
  workflow: ["ceo"],
  technical: ["cto"],
  harness_runtime: ["cto", "human"],
  finance: ["cfo"],
  strategy: ["marketing"],
  ads_targeting: ["ads-performance"],
  product_claims: ["rd"],
  evidence: ["rd"],
  none: []
};

export class ApprovalWorkflowManager {
  private readonly approvals: GovernanceApprovalRequest[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async requestApproval(input: {
    organizationId: string;
    requesterAgentId: CompanyAgentId;
    domain: ApprovalDomain;
    subject: string;
    summary: string;
  }) {
    const now = new Date().toISOString();
    const approval: GovernanceApprovalRequest = {
      approvalId: `gov-approval-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      requesterAgentId: input.requesterAgentId,
      approverAgentIds: approvalChains[input.domain],
      domain: input.domain,
      subject: input.subject,
      summary: input.summary,
      status: "requested",
      decisions: [],
      createdAt: now,
      updatedAt: now
    };
    this.approvals.push(approval);
    await this.saveApprovalRecord(approval);
    await saveAuditEvent(this.supabase, createAuditEvent({ organizationId: input.organizationId, actorAgentId: input.requesterAgentId, eventType: "approval_requested", severity: "medium", summary: input.subject, decision: "requires_approval", metadata: { approval } }));
    return approval;
  }

  async decide(input: {
    approvalId: string;
    approverId: CompanyAgentId | "human";
    decision: Exclude<GovernanceApprovalRequest["status"], "requested">;
    notes: string;
  }) {
    const approval = this.approvals.find((item) => item.approvalId === input.approvalId);
    if (!approval) return undefined;

    approval.decisions.push({ approverId: input.approverId, decision: input.decision, notes: input.notes, decidedAt: new Date().toISOString() });
    approval.status = this.resolveApprovalStatus(approval, input.decision);
    approval.updatedAt = new Date().toISOString();
    await this.saveApprovalRecord(approval);
    await saveAuditEvent(this.supabase, createAuditEvent({ organizationId: approval.organizationId, actorAgentId: input.approverId === "human" ? undefined : input.approverId, eventType: "approval_decision", severity: input.decision === "approved" ? "info" : "high", summary: `${approval.subject}: ${input.decision}`, decision: input.decision, metadata: { approval } }));
    return approval;
  }

  listApprovals() {
    return [...this.approvals];
  }

  private async saveApprovalRecord(approval: GovernanceApprovalRequest) {
    if (!this.supabase) return;

    await this.supabase.from("governance_approval_requests").upsert(
      {
        organization_id: approval.organizationId,
        approval_key: approval.approvalId,
        requester_agent_id: approval.requesterAgentId,
        approver_agent_ids: approval.approverAgentIds,
        domain: approval.domain,
        subject: approval.subject,
        summary: approval.summary,
        status: approval.status,
        decisions: approval.decisions,
        created_at: approval.createdAt,
        updated_at: approval.updatedAt
      },
      { onConflict: "organization_id,approval_key" }
    );
  }

  private resolveApprovalStatus(approval: GovernanceApprovalRequest, latestDecision: Exclude<GovernanceApprovalRequest["status"], "requested">) {
    if (latestDecision !== "approved") return latestDecision;

    const approvedBy = new Set(approval.decisions.filter((decision) => decision.decision === "approved").map((decision) => decision.approverId));
    const allRequiredApproversApproved = approval.approverAgentIds.every((approverId) => approvedBy.has(approverId));
    return allRequiredApproversApproved ? "approved" : "requested";
  }
}
