import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { approvalDecisionSchema } from "@/server/api/schemas";
import { requireApiApprovalAuthority, requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";

type RouteContext = { params: Promise<{ runKey: string }> };

export function POST(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { runKey } = await contextParams.params;
    const context = createApiContext(request);
    const body = await parseJsonBody(request, approvalDecisionSchema);
    requireApiApprovalAuthority(context, "normal");
    requirePermission(context, { actionType: "approval_decision", approvalDomain: "workflow", summary: `Approve workflow run ${runKey}` });

    const repo = new WorkflowRepository(context.persistence);
    const current = await repo.findRunByKey(context.organizationId, runKey);
    const run = await repo.saveRun({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      created_by: current.data?.created_by ?? context.userId,
      updated_by: context.userId,
      run_key: runKey,
      workflow_key: current.data?.workflow_key ?? "unknown",
      objective: current.data?.objective,
      status: "queued",
      input: current.data?.input ?? {},
      output: current.data?.output ?? {},
      metrics: current.data?.metrics ?? {},
      metadata: { ...(current.data?.metadata ?? {}), approvedBy: body.decisionBy, approvedByUserId: context.userId, approvedByRole: context.userRole, approvalNotes: body.notes }
    });

    await auditApiAction(context, { eventType: "workflow_step_approved", summary: `Workflow approved: ${runKey}`, relatedWorkflowId: current.data?.workflow_key, metadata: { runKey } });
    return { runKey, status: "queued", run, persistenceMode: context.persistenceMode };
  });
}
