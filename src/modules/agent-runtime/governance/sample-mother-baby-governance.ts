import type { SupabaseClient } from "@supabase/supabase-js";
import { runMotherBabyTikTokCollaboration } from "@/modules/agent-runtime/collaboration/sample-mother-baby-campaign";
import { ApprovalWorkflowManager } from "@/modules/agent-runtime/governance/ApprovalWorkflowManager";
import { createAuditEvent, saveAuditEvent } from "@/modules/agent-runtime/governance/AuditLogger";
import { EmergencyControlManager } from "@/modules/agent-runtime/governance/EmergencyControlManager";
import { GovernancePolicyEngine } from "@/modules/agent-runtime/governance/GovernancePolicyEngine";
import { buildOversightDashboardSnapshot } from "@/modules/agent-runtime/governance/OversightDashboardService";
import type { GovernanceAuditEvent } from "@/modules/agent-runtime/governance/types";

export async function runMotherBabyGovernanceFlow(supabase: SupabaseClient | null = null) {
  const organizationId = "sample-organization";
  const policy = new GovernancePolicyEngine();
  const approvals = new ApprovalWorkflowManager(supabase);
  const emergency = new EmergencyControlManager(supabase);
  const auditEvents: GovernanceAuditEvent[] = [];

  const campaignRequest = policy.evaluate({
    organizationId,
    actorAgentId: "ceo",
    actionType: "workflow_execute",
    workflowId: "content-production",
    summary: "CEO requests Mother-and-baby TikTok Campaign"
  });
  const campaignAudit = createAuditEvent({ organizationId, actorAgentId: "ceo", eventType: "governance_evaluation", severity: campaignRequest.severity, summary: "CEO campaign request evaluated.", decision: campaignRequest.decision, relatedWorkflowId: "content-production", metadata: { campaignRequest } });
  auditEvents.push(campaignAudit);
  await saveAuditEvent(supabase, campaignAudit);

  if (campaignRequest.decision === "denied" || emergency.isWorkflowPaused(organizationId, "content-production")) {
    await emergency.emergencyStop({ organizationId, actorAgentId: "ceo", reason: "Campaign workflow cannot proceed under current governance state.", workflows: ["content-production"] });
    return { collaboration: null, approvals: approvals.listApprovals(), dashboard: buildOversightDashboardSnapshot({ approvals: approvals.listApprovals(), auditEvents, emergencyState: emergency.getState(organizationId) }) };
  }

  const collaboration = await runMotherBabyTikTokCollaboration(supabase);

  const publishingPolicy = policy.evaluate({
    organizationId,
    actorAgentId: "content-creator",
    actionType: "publish",
    workflowId: "content-production",
    summary: "Content Creator generated campaign package before publication.",
    metadata: collaboration.finalReport
  });
  const publishingAudit = createAuditEvent({ organizationId, actorAgentId: "content-creator", eventType: "governance_evaluation", severity: publishingPolicy.severity, summary: "Publishing policy evaluated.", decision: publishingPolicy.decision, relatedWorkflowId: "content-production", metadata: { publishingPolicy } });
  auditEvents.push(publishingAudit);
  await saveAuditEvent(supabase, publishingAudit);

  const approval = await approvals.requestApproval({
    organizationId,
    requesterAgentId: "content-creator",
    domain: "publishing",
    subject: "Approve Mother-and-baby TikTok Campaign before publication",
    summary: "CEO and human approval required before external publication."
  });
  await approvals.decide({ approvalId: approval.approvalId, approverId: "ceo", decision: "approved", notes: "CEO approves draft package. Human approval still required before publication." });

  return {
    collaboration,
    approvals: approvals.listApprovals(),
    emergency: emergency.getState(organizationId) ?? null,
    dashboard: buildOversightDashboardSnapshot({ approvals: approvals.listApprovals(), auditEvents, emergencyState: emergency.getState(organizationId) })
  };
}
