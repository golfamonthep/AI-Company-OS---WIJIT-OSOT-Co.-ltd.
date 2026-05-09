import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { SkillRepository } from "@/database/repositories/SkillRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const executions = await new SkillRepository(context.persistence).listExecutions(context.organizationId);
    const total = executions.data.length;
    const completed = executions.data.filter((execution) => execution.status === "completed").length;
    return {
      performance: {
        totalExecutions: total,
        completedExecutions: completed,
        successRate: total ? completed / total : 0,
        source: "skill_execution_logs"
      },
      persistenceMode: context.persistenceMode
    };
  });
}
