import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { LearningRepository } from "@/database/repositories/LearningRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const proposals = await new LearningRepository(context.persistence).listProposals(context.organizationId);
    return { proposals, persistenceMode: context.persistenceMode };
  });
}
