import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { auditApiAction } from "@/server/api/audit";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";

type RouteContext = { params: Promise<{ runKey: string }> };

export function POST(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { runKey } = await contextParams.params;
    const context = createApiContext(request);
    const repo = new WorkflowRepository(context.persistence);
    const current = await repo.findRunByKey(context.organizationId, runKey);
    const run = await repo.saveRun({
      organization_id: context.organizationId,
      run_key: runKey,
      workflow_key: current.data?.workflow_key ?? "unknown",
      objective: current.data?.objective,
      status: "cancelled",
      input: current.data?.input ?? {},
      output: current.data?.output ?? {},
      metrics: current.data?.metrics ?? {},
      metadata: { ...(current.data?.metadata ?? {}), cancelledBy: context.actorAgentId }
    });
    await auditApiAction(context, { eventType: "workflow_cancelled", summary: `Workflow cancelled: ${runKey}`, relatedWorkflowId: current.data?.workflow_key, metadata: { runKey } });
    return { runKey, status: "cancelled", run, persistenceMode: context.persistenceMode };
  });
}
