import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { SkillRepository } from "@/database/repositories/SkillRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const skills = await new SkillRepository(context.persistence).listSkills(context.organizationId);
    return { skills, persistenceMode: context.persistenceMode };
  });
}
