import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { agentConfigSchema } from "@/server/api/schemas";
import { AgentRepository } from "@/database/repositories/AgentRepository";
import { auditApiAction } from "@/server/api/audit";
import { requirePermission } from "@/server/api/permissions";

type RouteContext = { params: Promise<{ agentKey: string }> };

export function GET(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { agentKey } = await contextParams.params;
    const context = createApiContext(request);
    const agent = await new AgentRepository(context.persistence).findByKey(context.organizationId, agentKey);
    return { agent, persistenceMode: context.persistenceMode };
  });
}

export function PATCH(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { agentKey } = await contextParams.params;
    const context = createApiContext(request);
    const body = await parseJsonBody(request, agentConfigSchema.partial().extend({ agentKey: agentConfigSchema.shape.agentKey.optional() }));
    requirePermission(context, { actionType: "workflow_execute", workflowId: "weekly-business-review", summary: `Update agent ${agentKey}` });

    const result = await new AgentRepository(context.persistence).save({
      organization_id: context.organizationId,
      agent_key: body.agentKey ?? agentKey,
      role: body.role ?? agentKey,
      name: body.name ?? agentKey,
      responsibilities: body.responsibilities ?? [],
      kpis: body.kpis ?? [],
      behavior_rules: body.behaviorRules ?? [],
      status: body.status ?? "active",
      metadata: body.metadata ?? {}
    });

    await auditApiAction(context, { eventType: "agent_config_updated", summary: `Agent config updated: ${agentKey}`, metadata: { agentKey } });
    return { result, persistenceMode: context.persistenceMode };
  });
}
