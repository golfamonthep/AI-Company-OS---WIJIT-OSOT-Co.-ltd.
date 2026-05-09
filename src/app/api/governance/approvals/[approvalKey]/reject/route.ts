import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { parseJsonBody } from "@/server/api/validation";
import { approvalDecisionSchema } from "@/server/api/schemas";
import { requirePermission } from "@/server/api/permissions";
import { auditApiAction } from "@/server/api/audit";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

type RouteContext = { params: Promise<{ approvalKey: string }> };

export function POST(request: Request, contextParams: RouteContext) {
  return routeHandler(async () => {
    const { approvalKey } = await contextParams.params;
    const context = createApiContext(request);
    const body = await parseJsonBody(request, approvalDecisionSchema);
    requirePermission(context, { actionType: "approval_decision", approvalDomain: "workflow", summary: `Reject action ${approvalKey}` });
    const repo = new ApprovalRepository(context.persistence);
    const current = await repo.findByKey(context.organizationId, approvalKey);
    const approval = await repo.saveApproval({
      organization_id: context.organizationId,
      approval_key: approvalKey,
      requester_agent_key: current.data?.requester_agent_key ?? "unknown",
      approver_agent_keys: current.data?.approver_agent_keys ?? [body.decisionBy],
      domain: current.data?.domain ?? "workflow",
      subject: current.data?.subject ?? approvalKey,
      summary: current.data?.summary ?? body.notes,
      status: "rejected",
      decisions: [...(current.data?.decisions ?? []), { decision: "rejected", by: body.decisionBy, notes: body.notes, decidedAt: new Date().toISOString() }],
      metadata: current.data?.metadata ?? {}
    });
    await auditApiAction(context, { eventType: "approval_rejected", summary: `Approval rejected: ${approvalKey}`, severity: "high", decision: "denied", metadata: { approvalKey } });
    return { approval, persistenceMode: context.persistenceMode };
  });
}
