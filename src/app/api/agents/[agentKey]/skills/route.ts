import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { SkillRepository } from "@/database/repositories/SkillRepository";

type RouteContext = { params: Promise<{ agentKey: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { agentKey } = await contextParams.params;
    const context = createApiContext(request);
    const skills = await new SkillRepository(context.persistence).listSkills(context.organizationId);
    return {
      agentKey,
      skills: skills.data.filter((skill) => !skill.agent_key || skill.agent_key === agentKey),
      persistenceMode: context.persistenceMode
    };
  });
}
