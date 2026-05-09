import { z } from "zod";
import { createSupabaseServiceClient } from "@/database/supabaseClient";
import { PersistenceService } from "@/database/PersistenceService";
import { RolePermissionService } from "@/auth/RolePermissionService";
import type { Permission, WorkspaceContext, WorkspaceRole } from "@/auth/types";

const defaultOrganizationId = "00000000-0000-0000-0000-000000000001";

export type ApiContext = {
  organizationId: string;
  workspaceId: string;
  actorAgentId: string;
  userId?: string;
  userRole: WorkspaceRole;
  permissions: Permission[];
  workspace?: WorkspaceContext["workspace"];
  auth?: WorkspaceContext;
  persistence: PersistenceService;
  persistenceMode: "configured" | "missing_env";
  persistenceReason?: string;
};

const headerSchema = z.object({
  organizationId: z.string().min(1).default(defaultOrganizationId),
  workspaceId: z.string().min(1).default(defaultOrganizationId),
  actorAgentId: z.string().min(1).default("ceo"),
  userId: z.string().optional(),
  userRole: z.enum(["owner", "admin", "manager", "operator", "viewer"]).default("owner")
});

export function createApiContext(request: Request): ApiContext {
  const runtime = createSupabaseServiceClient();
  const requestedWorkspaceId = request.headers.get("x-workspace-id");
  const headers = headerSchema.parse({
    organizationId: request.headers.get("x-organization-id") ?? requestedWorkspaceId ?? defaultOrganizationId,
    workspaceId: requestedWorkspaceId ?? request.headers.get("x-organization-id") ?? defaultOrganizationId,
    actorAgentId: request.headers.get("x-agent-id") ?? "ceo",
    userId: request.headers.get("x-user-id") ?? undefined,
    userRole: request.headers.get("x-workspace-role") ?? "owner"
  });
  const permissionService = new RolePermissionService();

  return {
    organizationId: headers.organizationId,
    workspaceId: headers.workspaceId,
    actorAgentId: headers.actorAgentId,
    userId: headers.userId,
    userRole: headers.userRole,
    permissions: permissionService.getPermissions(headers.userRole),
    persistence: new PersistenceService(runtime.client),
    persistenceMode: runtime.mode,
    persistenceReason: runtime.reason
  };
}
