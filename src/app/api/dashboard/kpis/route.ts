import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const workflowRuns = await new WorkflowRepository(context.persistence).listRuns(context.organizationId);
    const approvals = await new ApprovalRepository(context.persistence).list(context.organizationId);
    return {
      kpis: {
        workflowRuns: workflowRuns.data.length,
        completedWorkflowRuns: workflowRuns.data.filter((run) => run.status === "completed").length,
        pendingApprovals: approvals.data.filter((approval) => approval.status === "requested").length
      },
      persistenceMode: context.persistenceMode
    };
  });
}
