import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { approvalDecisionSchema } from "@/server/api/schemas";
import { requireApiApprovalAuthority, requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

type RouteContext = { params: Promise<{ approvalKey: string }> };

export function POST(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { approvalKey } = await contextParams.params;
    const context = createApiContext(request);
    const body = await parseJsonBody(request, approvalDecisionSchema);
    requireApiApprovalAuthority(context, "normal");
    requirePermission(context, { actionType: "approval_decision", approvalDomain: "workflow", summary: `Approve action ${approvalKey}` });
    const repo = new ApprovalRepository(context.persistence);
    const current = await repo.findByKey(context.organizationId, approvalKey);
    const approval = await repo.saveApproval({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      created_by: current.data?.created_by ?? context.userId,
      updated_by: context.userId,
      approval_key: approvalKey,
      requester_agent_key: current.data?.requester_agent_key ?? "unknown",
      approver_agent_keys: current.data?.approver_agent_keys ?? [body.decisionBy],
      domain: current.data?.domain ?? "workflow",
      subject: current.data?.subject ?? approvalKey,
      summary: current.data?.summary ?? body.notes,
      status: "approved",
      decisions: [...(current.data?.decisions ?? []), { decision: "approved", by: body.decisionBy, userId: context.userId, role: context.userRole, notes: body.notes, decidedAt: new Date().toISOString() }],
      metadata: current.data?.metadata ?? {}
    });
    await auditApiAction(context, { eventType: "approval_approved", summary: `Approval approved: ${approvalKey}`, metadata: { approvalKey } });
    return { approval, persistenceMode: context.persistenceMode };
  });
}
