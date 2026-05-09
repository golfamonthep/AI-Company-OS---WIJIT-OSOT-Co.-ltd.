import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { executeConnectorSchema } from "@/server/api/schemas";
import { requireApiPermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { ConnectorExecutor } from "@/modules/agent-runtime/integrations/ConnectorExecutor";
import type { ConnectorId } from "@/modules/agent-runtime/integrations/types";
import type { CompanyAgentId } from "@/modules/agent-runtime/governance/types";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, executeConnectorSchema);
    requireApiPermission(context, body.actionType === "read" ? "integration:read" : "integration:write");
    const executor = new ConnectorExecutor(null);
    const result = await executor.execute({
      organizationId: context.organizationId,
      agentId: context.actorAgentId as CompanyAgentId,
      connectorId: body.connectorId as ConnectorId,
      actionId: body.actionId,
      actionType: body.actionType,
      approved: body.approved,
      summary: body.summary,
      input: body.input,
      metadata: body.metadata
    });
    await auditApiAction(context, { eventType: "connector_action_requested", summary: `${body.connectorId}:${body.actionId} -> ${result.status}`, severity: result.status === "success" ? "info" : "medium", metadata: { result } });
    return { result, persistenceMode: context.persistenceMode };
  });
}
