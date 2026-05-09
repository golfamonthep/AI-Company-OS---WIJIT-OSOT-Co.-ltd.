import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { startWorkflowSchema } from "@/server/api/schemas";
import { requireApiPermission, requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

export function POST(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const body = await parseJsonBody(request, startWorkflowSchema);
    requireApiPermission(context, "workflow:start");
    const evaluation = requirePermission(context, { actionType: "workflow_execute", workflowId: body.workflowKey, summary: `Start workflow ${body.workflowKey}`, allowApprovalRequired: true });

    const workflowRepo = new WorkflowRepository(context.persistence);
    await workflowRepo.saveWorkflow({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      created_by: context.userId,
      updated_by: context.userId,
      workflow_key: body.workflowKey,
      slug: body.workflowKey,
      name: body.workflowKey.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "),
      purpose: body.objective,
      participating_agents: ["ceo", "marketing", "content-creator"],
      definition: { source: "api" },
      status: "active"
    });

    const runKey = `${body.workflowKey}-${Date.now()}`;
    const run = await workflowRepo.saveRun({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      created_by: context.userId,
      updated_by: context.userId,
      run_key: runKey,
      workflow_key: body.workflowKey,
      objective: body.objective,
      status: body.humanInTheLoop || evaluation.decision === "requires_approval" ? "waiting_approval" : "queued",
      input: body.input,
      output: {},
      metrics: {},
      metadata: { startedBy: context.actorAgentId, governanceEvaluation: evaluation }
    });

    const approval = await new ApprovalRepository(context.persistence).saveApproval({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      created_by: context.userId,
      updated_by: context.userId,
      approval_key: `workflow-approval-${runKey}`,
      requester_agent_key: context.actorAgentId,
      approver_agent_keys: ["ceo"],
      domain: "workflow",
      subject: `Approve workflow: ${body.workflowKey}`,
      summary: body.objective,
      status: "requested",
      decisions: [],
      metadata: { runKey, workflowKey: body.workflowKey }
    });

    await auditApiAction(context, { eventType: "workflow_started", summary: `Workflow started: ${body.workflowKey}`, relatedWorkflowId: body.workflowKey, metadata: { runKey } });
    return {
      workflow_run_id: runKey,
      status: run.data?.status ?? "waiting_approval",
      workspace: { id: context.workspaceId, role: context.userRole, userId: context.userId },
      run,
      approval,
      persistenceMode: context.persistenceMode
    };
  });
}
