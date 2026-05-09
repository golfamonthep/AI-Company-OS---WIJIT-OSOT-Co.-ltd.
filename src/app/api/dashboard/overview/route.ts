import { routeHandler } from "@/server/api/routeHandler";
import { createApiContext } from "@/server/api/auth";
import { AgentRepository } from "@/database/repositories/AgentRepository";
import { AuditLogRepository } from "@/database/repositories/AuditLogRepository";
import { LearningRepository } from "@/database/repositories/LearningRepository";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import type { ApprovalRecord, WorkflowRunRecord } from "@/database/types";

export function GET(request: Request) {
  return routeHandler(async () => {
    const context = createApiContext(request);
    const agents = await new AgentRepository(context.persistence).list(context.organizationId);
    const workflowRuns = await context.persistence.listByWorkspace<WorkflowRunRecord & Record<string, unknown>>("workflow_runs", context.workspaceId, context.organizationId);
    const approvals = await context.persistence.listByWorkspace<ApprovalRecord & Record<string, unknown>>("approvals", context.workspaceId, context.organizationId);
    const auditLogs = await new AuditLogRepository(context.persistence).list(context.organizationId);
    const learningProposals = await new LearningRepository(context.persistence).listProposals(context.organizationId);
    const liveContent = await new ContentDepartmentLiveMvpService(context).getDashboardSnapshot();

    const activeAgents = agents.data.filter((agent) => agent.status !== "blocked");
    const activeWorkflows = workflowRuns.data.filter((run) => ["queued", "running", "waiting_approval"].includes(run.status));
    const pendingApprovals = approvals.data.filter((approval) => approval.status === "requested" || approval.status === "pending_review");

    return {
      overview: {
        workspace: {
          id: context.workspaceId,
          role: context.userRole,
          permissions: context.permissions,
          readOnly: context.userRole === "viewer",
          approvalAuthority: context.userRole === "owner" ? ["low", "normal", "high"] : context.userRole === "admin" || context.userRole === "manager" ? ["low", "normal"] : []
        },
        companyStatus: pendingApprovals.length ? "needs_review" : "operational",
        activeAgents: activeAgents.length,
        activeWorkflows: activeWorkflows.length,
        pendingApprovals: pendingApprovals.length,
        recentAuditLogs: auditLogs.data.slice(0, 10),
        recentLearningProposals: learningProposals.data.slice(0, 10),
        kpis: {
          workflowHealth: activeWorkflows.length ? "active" : "idle",
          governanceQueue: pendingApprovals.length,
          learningQueue: learningProposals.data.filter((proposal) => proposal.status === "pending_review").length
        },
        alerts: [
          ...(context.persistenceMode === "missing_env" ? [{ severity: "medium", title: "Supabase env missing", message: context.persistenceReason }] : []),
          ...(pendingApprovals.length ? [{ severity: "high", title: "Approvals pending", message: `${pendingApprovals.length} approval items need review.` }] : [])
        ],
        liveMvp: liveContent.contentDepartment
      },
      persistenceMode: context.persistenceMode
    };
  });
}
