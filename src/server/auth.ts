import { AuthService } from "@/auth/AuthService";
import { WorkspaceService } from "@/auth/WorkspaceService";
import type { WorkspaceContext } from "@/auth/types";

export async function getServerAuthContext(request?: Request): Promise<WorkspaceContext> {
  const auth = new AuthService();
  const session = await auth.getCurrentSession(request);
  const workspaceService = new WorkspaceService();
  return workspaceService.getWorkspaceContext(request, session.user, session);
}
