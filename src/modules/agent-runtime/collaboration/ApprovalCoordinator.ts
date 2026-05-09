import type { SupabaseClient } from "@supabase/supabase-js";
import { makeEventId, saveCollaborationEvent } from "@/modules/agent-runtime/collaboration/CollaborationLogger";
import type { CollaborationApprovalRequest, CollaborationApprovalStatus, CollaborationEvent, CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export class ApprovalCoordinator {
  private readonly approvals: CollaborationApprovalRequest[] = [];
  private readonly events: CollaborationEvent[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async requestApproval(input: {
    sessionId: string;
    organizationId: string;
    requesterAgentId: CompanyAgentId;
    approverAgentId: CompanyAgentId | "human";
    subject: string;
    summary: string;
  }) {
    const approval: CollaborationApprovalRequest = {
      approvalId: `approval-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      requesterAgentId: input.requesterAgentId,
      approverAgentId: input.approverAgentId,
      subject: input.subject,
      summary: input.summary,
      status: "requested",
      createdAt: new Date().toISOString()
    };
    this.approvals.push(approval);
    await this.record(approval, "approval_requested", input.requesterAgentId, input.approverAgentId, input.subject);
    return approval;
  }

  async decideApproval(approvalId: string, status: Exclude<CollaborationApprovalStatus, "requested">, actorAgentId: CompanyAgentId, decisionNotes?: string) {
    const approval = this.approvals.find((item) => item.approvalId === approvalId);
    if (!approval) return undefined;

    approval.status = status;
    approval.decisionNotes = decisionNotes;
    approval.decidedAt = new Date().toISOString();
    await this.record(approval, "approval_decided", actorAgentId, approval.requesterAgentId, `${approval.subject}: ${status}`);
    return approval;
  }

  listApprovals() {
    return [...this.approvals];
  }

  listEvents() {
    return [...this.events];
  }

  private async record(approval: CollaborationApprovalRequest, eventType: CollaborationEvent["eventType"], actorAgentId: CompanyAgentId, targetAgentId: CompanyAgentId | "human", summary: string) {
    const event: CollaborationEvent = {
      eventId: makeEventId(),
      sessionId: approval.sessionId,
      organizationId: approval.organizationId,
      eventType,
      actorAgentId,
      targetAgentId,
      summary,
      payload: { approval },
      createdAt: new Date().toISOString()
    };
    this.events.push(event);
    await saveCollaborationEvent(this.supabase, event);
  }
}
