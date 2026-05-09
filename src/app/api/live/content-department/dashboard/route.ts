import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import { createApiContext } from "@/server/api/auth";
import { requireApiPermission } from "@/server/api/permissions";
import { routeHandler } from "@/server/api/routeHandler";

export async function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    requireApiPermission(context, "dashboard:view");

    const snapshot = await new ContentDepartmentLiveMvpService(context).getDashboardSnapshot();
    return {
      ok: true,
      data: snapshot,
      meta: {
        persistenceMode: context.persistenceMode,
        workspaceId: context.workspaceId,
        realtimeReady: true
      }
    };
  });
}
