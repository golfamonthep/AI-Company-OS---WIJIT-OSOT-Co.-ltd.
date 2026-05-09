import { getServerAuthContext } from "@/server/auth";
import type { WorkspaceContext } from "@/auth/types";

export async function getCurrentWorkspaceContext(request?: Request): Promise<WorkspaceContext> {
  return getServerAuthContext(request);
}

export async function getDashboardWorkspaceSession(request?: Request) {
  const context = await getCurrentWorkspaceContext(request);
  return {
    workspaceId: context.workspace.id,
    workspaceName: context.workspace.name,
    role: context.membership.role,
    userName: context.user.displayName,
    permissions: context.permissions,
    approvalAuthority: context.approvalAuthority,
    readOnly: context.readOnly,
    mockedAuth: context.user.isMocked
  };
}
