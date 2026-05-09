import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";
import type { HarnessModuleId } from "@/modules/agent-runtime/harness/types";

export type { CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export type GovernanceDecision = "allowed" | "denied" | "requires_approval" | "requires_revision" | "emergency_stopped";

export type GovernanceSeverity = "info" | "low" | "medium" | "high" | "critical";

export type ApprovalDomain = "publishing" | "campaign" | "budget" | "workflow" | "technical" | "harness_runtime" | "finance" | "strategy" | "ads_targeting" | "product_claims" | "evidence" | "none";

export type AgentPermissionProfile = {
  agentId: CompanyAgentId;
  allowedWorkflows: string[];
  allowedHarnessTools: HarnessModuleId[];
  canApprove: ApprovalDomain[];
  canEscalateTo: Array<CompanyAgentId | "human">;
  executionLimits: string[];
};

export type GovernanceActionRequest = {
  organizationId: string;
  actorAgentId: CompanyAgentId;
  actionType: "workflow_execute" | "harness_execute" | "memory_write" | "approval_decision" | "publish" | "delegate" | "escalate";
  workflowId?: string;
  harnessTool?: HarnessModuleId;
  approvalDomain?: ApprovalDomain;
  summary: string;
  metadata?: Record<string, unknown>;
};

export type GovernanceEvaluation = {
  decision: GovernanceDecision;
  severity: GovernanceSeverity;
  reasons: string[];
  requiredApprovals: ApprovalDomain[];
  restrictions: string[];
};

export type GovernanceApprovalRequest = {
  approvalId: string;
  organizationId: string;
  requesterAgentId: CompanyAgentId;
  approverAgentIds: Array<CompanyAgentId | "human">;
  domain: ApprovalDomain;
  subject: string;
  summary: string;
  status: "requested" | "approved" | "rejected" | "changes_requested" | "emergency_stopped";
  decisions: Array<{
    approverId: CompanyAgentId | "human";
    decision: Exclude<GovernanceApprovalRequest["status"], "requested">;
    notes: string;
    decidedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceAuditEvent = {
  auditId: string;
  organizationId: string;
  actorAgentId?: CompanyAgentId;
  eventType: string;
  severity: GovernanceSeverity;
  summary: string;
  decision?: GovernanceDecision | GovernanceApprovalRequest["status"];
  relatedWorkflowId?: string;
  relatedTaskId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type EmergencyControlState = {
  organizationId: string;
  pausedAgents: CompanyAgentId[];
  pausedWorkflows: string[];
  dangerousExecutionDisabled: boolean;
  reason?: string;
  updatedAt: string;
};

export type GovernanceRuntimeContext = {
  supabase: SupabaseClient | null;
};
