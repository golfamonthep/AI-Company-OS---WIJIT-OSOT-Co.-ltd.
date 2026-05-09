import { RolePermissionService } from "@/auth/RolePermissionService";
import type { ApprovalImpact, Permission, WorkspaceContext } from "@/auth/types";
import { forbidden } from "@/server/api/errors";

const roles = new RolePermissionService();

export function requireWorkspacePermission(context: WorkspaceContext, permission: Permission) {
  if (!roles.hasPermission(context.membership.role, permission)) {
    throw forbidden(`Workspace role ${context.membership.role} does not have permission ${permission}.`, {
      workspaceId: context.workspace.id,
      role: context.membership.role,
      permission
    });
  }
}

export function requireApprovalAuthority(context: WorkspaceContext, impact: ApprovalImpact) {
  if (!roles.canApprove(context.membership.role, impact)) {
    throw forbidden(`Workspace role ${context.membership.role} cannot approve ${impact}-impact actions.`, {
      workspaceId: context.workspace.id,
      role: context.membership.role,
      impact
    });
  }
}
