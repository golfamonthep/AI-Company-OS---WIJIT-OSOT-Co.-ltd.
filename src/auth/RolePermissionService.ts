import type { ApprovalImpact, Permission, WorkspaceRole } from "@/auth/types";

export const rolePermissions: Record<WorkspaceRole, Permission[]> = {
  owner: [
    "workspace:manage",
    "workspace:view",
    "agent:manage",
    "agent:view",
    "workflow:manage",
    "workflow:start",
    "workflow:review",
    "workflow:view",
    "memory:write",
    "memory:view",
    "approval:approve_all",
    "approval:approve_normal",
    "approval:approve_content",
    "approval:view",
    "integration:manage",
    "integration:read",
    "integration:write",
    "operations:run",
    "operations:view",
    "dashboard:view"
  ],
  admin: [
    "workspace:view",
    "agent:manage",
    "agent:view",
    "workflow:manage",
    "workflow:start",
    "workflow:review",
    "workflow:view",
    "memory:write",
    "memory:view",
    "approval:approve_normal",
    "approval:approve_content",
    "approval:view",
    "integration:read",
    "operations:run",
    "operations:view",
    "dashboard:view"
  ],
  manager: ["workspace:view", "agent:view", "workflow:review", "workflow:view", "memory:view", "approval:approve_content", "approval:view", "operations:view", "dashboard:view"],
  operator: ["workspace:view", "agent:view", "workflow:start", "workflow:view", "memory:view", "approval:view", "operations:run", "operations:view", "dashboard:view"],
  viewer: ["workspace:view", "agent:view", "workflow:view", "memory:view", "approval:view", "operations:view", "dashboard:view"]
};

const approvalAuthority: Record<WorkspaceRole, ApprovalImpact[]> = {
  owner: ["low", "normal", "high"],
  admin: ["low", "normal"],
  manager: ["low", "normal"],
  operator: [],
  viewer: []
};

export class RolePermissionService {
  getPermissions(role: WorkspaceRole): Permission[] {
    return rolePermissions[role] ?? rolePermissions.viewer;
  }

  hasRole(currentRole: WorkspaceRole, allowedRoles: WorkspaceRole[]) {
    return allowedRoles.includes(currentRole);
  }

  hasPermission(role: WorkspaceRole, permission: Permission) {
    return this.getPermissions(role).includes(permission);
  }

  assertPermission(role: WorkspaceRole, permission: Permission) {
    if (!this.hasPermission(role, permission)) {
      throw new Error(`Role ${role} does not have permission ${permission}.`);
    }
  }

  getApprovalAuthority(role: WorkspaceRole): ApprovalImpact[] {
    return approvalAuthority[role] ?? [];
  }

  canApprove(role: WorkspaceRole, impact: ApprovalImpact) {
    return this.getApprovalAuthority(role).includes(impact);
  }

  enforceApprovalAuthority(role: WorkspaceRole, impact: ApprovalImpact) {
    if (!this.canApprove(role, impact)) {
      throw new Error(`Role ${role} cannot approve ${impact}-impact actions.`);
    }
  }
}
