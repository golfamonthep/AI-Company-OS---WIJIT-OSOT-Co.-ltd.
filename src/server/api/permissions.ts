import { GovernancePolicyEngine } from "@/modules/agent-runtime/governance/GovernancePolicyEngine";
import type { ApprovalDomain, CompanyAgentId, GovernanceActionRequest } from "@/modules/agent-runtime/governance/types";
import { forbidden } from "@/server/api/errors";
import type { ApiContext } from "@/server/api/auth";
import { RolePermissionService } from "@/auth/RolePermissionService";
import type { ApprovalImpact, Permission } from "@/auth/types";

const governance = new GovernancePolicyEngine();
const rbac = new RolePermissionService();

export function requireApiPermission(context: ApiContext, permission: Permission) {
  if (!rbac.hasPermission(context.userRole, permission)) {
    throw forbidden(`Workspace role ${context.userRole} does not have permission ${permission}.`, {
      workspaceId: context.workspaceId,
      userRole: context.userRole,
      permission
    });
  }
}

export function requireApiApprovalAuthority(context: ApiContext, impact: ApprovalImpact) {
  if (!rbac.canApprove(context.userRole, impact)) {
    throw forbidden(`Workspace role ${context.userRole} cannot approve ${impact}-impact actions.`, {
      workspaceId: context.workspaceId,
      userRole: context.userRole,
      impact
    });
  }
}

export function requirePermission(
  context: ApiContext,
  input: {
    actionType: GovernanceActionRequest["actionType"];
    workflowId?: string;
    approvalDomain?: ApprovalDomain;
    summary: string;
    metadata?: Record<string, unknown>;
    allowApprovalRequired?: boolean;
  }
) {
  const evaluation = governance.evaluate({
    organizationId: context.organizationId,
    actorAgentId: context.actorAgentId as CompanyAgentId,
    actionType: input.actionType,
    workflowId: input.workflowId,
    approvalDomain: input.approvalDomain,
    summary: input.summary,
    metadata: input.metadata
  });

  if (evaluation.decision === "denied") throw forbidden(evaluation.reasons.join(" "), evaluation);
  if (evaluation.decision === "requires_approval" && !input.allowApprovalRequired) throw forbidden("Action requires approval.", evaluation);
  if (evaluation.decision === "emergency_stopped") throw forbidden("Emergency stop is active.", evaluation);

  return evaluation;
}
