import { PersistenceService } from "@/database/PersistenceService";
import type { AuthUser, Workspace, WorkspaceContext, WorkspaceMembership, WorkspaceRole } from "@/auth/types";
import { RolePermissionService } from "@/auth/RolePermissionService";

const defaultWorkspaceId = "00000000-0000-0000-0000-000000000001";

export class WorkspaceService {
  constructor(
    private readonly persistence = new PersistenceService(),
    private readonly permissions = new RolePermissionService()
  ) {}

  async getCurrentWorkspace(request: Request | undefined, user: AuthUser): Promise<Workspace> {
    const workspaceId = request?.headers.get("x-workspace-id") ?? request?.headers.get("x-organization-id") ?? defaultWorkspaceId;
    const workspaceName = request?.headers.get("x-workspace-name") ?? "Demo AI Company";

    return {
      id: workspaceId,
      organizationId: workspaceId,
      name: workspaceName,
      slug: workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "demo-ai-company",
      ownerUserId: user.id,
      status: "active",
      settings: { source: "development_fallback" }
    };
  }

  async getMembership(request: Request | undefined, workspace: Workspace, user: AuthUser): Promise<WorkspaceMembership> {
    const requestedRole = request?.headers.get("x-workspace-role") as WorkspaceRole | null;
    const role = this.normalizeRole(requestedRole);

    return {
      id: `${workspace.id}:${user.id}`,
      workspaceId: workspace.id,
      userId: user.id,
      role,
      status: "active"
    };
  }

  async getWorkspaceContext(request: Request | undefined, user: AuthUser, session: WorkspaceContext["session"]): Promise<WorkspaceContext> {
    const workspace = await this.getCurrentWorkspace(request, user);
    const membership = await this.getMembership(request, workspace, user);
    const permissions = this.permissions.getPermissions(membership.role);

    return {
      user,
      session,
      workspace,
      membership,
      permissions,
      readOnly: membership.role === "viewer",
      approvalAuthority: this.permissions.getApprovalAuthority(membership.role)
    };
  }

  async createWorkspace(input: { name: string; ownerUserId: string; slug?: string }) {
    const workspaceId = crypto.randomUUID();
    const workspace: Workspace & { organization_id: string; owner_user_id: string; metadata: Record<string, unknown> } = {
      id: workspaceId,
      organizationId: workspaceId,
      organization_id: workspaceId,
      name: input.name,
      slug: input.slug ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      ownerUserId: input.ownerUserId,
      owner_user_id: input.ownerUserId,
      status: "active",
      metadata: {}
    };

    return this.persistence.create("workspaces", workspace as typeof workspace & Record<string, unknown>);
  }

  async switchWorkspace(workspaceId: string, user: AuthUser) {
    return {
      id: workspaceId,
      organizationId: workspaceId,
      name: "Selected AI Company",
      slug: "selected-ai-company",
      ownerUserId: user.id,
      status: "active" as const,
      settings: { source: "switch_placeholder" }
    };
  }

  async listUserWorkspaces(user: AuthUser): Promise<Workspace[]> {
    return [
      {
        id: defaultWorkspaceId,
        organizationId: defaultWorkspaceId,
        name: "Demo AI Company",
        slug: "demo-ai-company",
        ownerUserId: user.id,
        status: "active",
        settings: { source: "development_fallback" }
      }
    ];
  }

  private normalizeRole(role: WorkspaceRole | null): WorkspaceRole {
    if (role === "owner" || role === "admin" || role === "manager" || role === "operator" || role === "viewer") return role;
    return "owner";
  }
}
