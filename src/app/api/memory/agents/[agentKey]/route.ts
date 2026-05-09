import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";

type RouteContext = { params: Promise<{ agentKey: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { agentKey } = await contextParams.params;
    const context = createApiContext(request);
    const memory = await new MemoryRepository(context.persistence).listAgentMemory(context.organizationId);
    return { agentKey, memory: memory.data.filter((item) => item.agent_key === agentKey), persistenceMode: context.persistenceMode };
  });
}
