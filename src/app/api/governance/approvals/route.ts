import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const approvals = await new ApprovalRepository(context.persistence).list(context.organizationId);
    return { approvals, persistenceMode: context.persistenceMode };
  });
}
