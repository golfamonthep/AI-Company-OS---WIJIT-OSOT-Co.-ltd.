import { AuthService } from "@/auth/AuthService";
import { WorkspaceService } from "@/auth/WorkspaceService";
import { routeHandler } from "@/server/api/routeHandler";

export async function GET(request: Request) {
  return routeHandler(async () => {
    const session = await new AuthService().getCurrentSession(request);
    const workspaces = await new WorkspaceService().listUserWorkspaces(session.user);
    return {
      user: session.user,
      workspaces,
      mockedAuth: session.isMocked
    };
  });
}
