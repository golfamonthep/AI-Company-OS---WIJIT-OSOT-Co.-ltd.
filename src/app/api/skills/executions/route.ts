import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { SkillRepository } from "@/database/repositories/SkillRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const executions = await new SkillRepository(context.persistence).listExecutions(context.organizationId);
    return { executions, persistenceMode: context.persistenceMode };
  });
}
