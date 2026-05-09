import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { agentConfigSchema } from "@/server/api/schemas";
import { requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { AgentRepository } from "@/database/repositories/AgentRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const agents = await new AgentRepository(context.persistence).list(context.organizationId);
    return { agents, persistenceMode: context.persistenceMode };
  });
}

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, agentConfigSchema);
    requirePermission(context, { actionType: "workflow_execute", workflowId: "weekly-business-review", summary: `Create or update agent ${body.agentKey}` });

    const result = await new AgentRepository(context.persistence).save({
      organization_id: context.organizationId,
      agent_key: body.agentKey,
      role: body.role,
      name: body.name,
      responsibilities: body.responsibilities,
      kpis: body.kpis,
      behavior_rules: body.behaviorRules,
      status: body.status,
      metadata: body.metadata
    });

    await auditApiAction(context, { eventType: "agent_config_saved", summary: `Agent config saved: ${body.agentKey}`, metadata: { agentKey: body.agentKey } });
    return { result, persistenceMode: context.persistenceMode };
  });
}
