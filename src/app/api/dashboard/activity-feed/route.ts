import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { AuditLogRepository } from "@/database/repositories/AuditLogRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const auditLogs = await new AuditLogRepository(context.persistence).list(context.organizationId);
    return { activityFeed: auditLogs.data.slice(0, 25), persistenceMode: context.persistenceMode };
  });
}
