import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";

type RouteContext = { params: Promise<{ runKey: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { runKey } = await contextParams.params;
    const context = createApiContext(request);
    const run = await new WorkflowRepository(context.persistence).findRunByKey(context.organizationId, runKey);
    return { runKey, run, persistenceMode: context.persistenceMode };
  });
}
