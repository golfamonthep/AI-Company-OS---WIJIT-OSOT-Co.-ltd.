import { getServerAuthContext } from "@/server/auth";
import { routeHandler } from "@/server/api/routeHandler";

export async function GET(request: Request) {
  return routeHandler(async () => {
    const context = await getServerAuthContext(request);
    return {
      user: context.user,
      workspace: context.workspace,
      role: context.membership.role,
      permissions: context.permissions,
      mockedAuth: context.session.isMocked
    };
  });
}
