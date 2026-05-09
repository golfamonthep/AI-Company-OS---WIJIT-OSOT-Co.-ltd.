import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { OperationsRepository } from "@/database/repositories/OperationsRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const triggers = await new OperationsRepository(context.persistence).listTriggers(context.organizationId);
    return { triggers, persistenceMode: context.persistenceMode };
  });
}
