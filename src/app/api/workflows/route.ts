import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const workflows = await new WorkflowRepository(context.persistence).listWorkflows(context.organizationId);
    return { workflows, persistenceMode: context.persistenceMode };
  });
}
