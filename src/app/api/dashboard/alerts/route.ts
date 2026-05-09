import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const approvals = await new ApprovalRepository(context.persistence).list(context.organizationId);
    const pendingApprovals = approvals.data.filter((approval) => approval.status === "requested");
    return {
      alerts: [
        ...(context.persistenceMode === "missing_env" ? [{ severity: "medium", title: "Persistence fallback active", message: context.persistenceReason }] : []),
        ...(pendingApprovals.length ? [{ severity: "high", title: "Pending approvals", message: `${pendingApprovals.length} approvals require review.` }] : [])
      ],
      persistenceMode: context.persistenceMode
    };
  });
}
