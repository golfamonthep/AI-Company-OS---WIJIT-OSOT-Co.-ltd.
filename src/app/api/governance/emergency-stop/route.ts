import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { emergencyStopSchema } from "@/server/api/schemas";
import { auditApiAction } from "@/server/api/audit";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, emergencyStopSchema);
    const state = {
      organizationId: context.organizationId,
      dangerousExecutionDisabled: true,
      scope: body.scope,
      targetId: body.targetId,
      reason: body.reason,
      updatedAt: new Date().toISOString()
    };
    await auditApiAction(context, { eventType: "emergency_stop", summary: body.reason, severity: "critical", decision: "emergency_stopped", metadata: state });
    return { state, persistenceMode: context.persistenceMode };
  });
}
