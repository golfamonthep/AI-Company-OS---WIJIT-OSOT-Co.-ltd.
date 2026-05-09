import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { runOperationSchema } from "@/server/api/schemas";
import { requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, runOperationSchema);
    const evaluation = requirePermission(context, { actionType: "workflow_execute", workflowId: "weekly-business-review", summary: `Run scheduled operation ${body.triggerKey}`, allowApprovalRequired: true });
    const run = {
      operationRunId: `operation-run-${Date.now()}`,
      triggerKey: body.triggerKey,
      status: body.dryRun || evaluation.decision === "requires_approval" ? "prepared_for_approval" : "queued",
      dryRun: body.dryRun,
      governanceEvaluation: evaluation
    };
    await auditApiAction(context, { eventType: "scheduled_operation_requested", summary: `Scheduled operation requested: ${body.triggerKey}`, metadata: run });
    return { run, persistenceMode: context.persistenceMode };
  });
}
