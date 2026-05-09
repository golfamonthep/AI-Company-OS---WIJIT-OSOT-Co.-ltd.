import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { AgentRepository } from "@/database/repositories/AgentRepository";

type RouteContext = { params: Promise<{ agentKey: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { agentKey } = await contextParams.params;
    const context = createApiContext(request);
    const agent = await new AgentRepository(context.persistence).findByKey(context.organizationId, agentKey);
    return {
      agentKey,
      status: agent.data?.status ?? "unknown",
      persistenceMode: context.persistenceMode
    };
  });
}
