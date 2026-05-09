import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { IntegrationRepository } from "@/database/repositories/IntegrationRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const auditLogs = await new IntegrationRepository(context.persistence).listConnectorAuditLogs(context.organizationId);
    return { auditLogs, persistenceMode: context.persistenceMode };
  });
}
