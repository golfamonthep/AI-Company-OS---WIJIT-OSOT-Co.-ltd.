import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const decisions = await new MemoryRepository(context.persistence).listDecisions(context.organizationId);
    return { decisions, persistenceMode: context.persistenceMode };
  });
}
