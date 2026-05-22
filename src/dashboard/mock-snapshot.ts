import type { LiveDashboardSnapshot } from "@/dashboard/types";

export function createMockLiveDashboardSnapshot(reason = "Dashboard API is unavailable."): LiveDashboardSnapshot {
  return {
    workspace: {
      id: "mock-workspace",
      role: "owner",
      permissions: ["dashboard:view", "workflow:start", "workflow:review", "approval:approve_content"],
      persistenceMode: "mock_fallback",
      persistenceReason: reason
    },
    contentDepartment: {
      workflowName: "Content Production Workflow",
      campaignName: "Mother-and-baby TikTok Campaign",
      activeAgent: "idle",
      approvalStatus: "not_started",
      generatedOutputs: null,
      contentPack: null,
      marketingAnalysis: null,
      adsPerformance: null,
      auditLogSummary: [],
      memoryUpdateSummary: [],
      feedbackSummary: [],
      qualityReviewSummary: undefined,
      memoryCurationSummary: undefined,
      bestPerformingOutputs: [],
      lowPerformingOutputAlerts: [],
      recentWorkflows: [],
      operationalMetrics: {
        workflowFrequency: 0,
        approvalFrequency: 0,
        rejectionFrequency: 0,
        workflowCompletionRate: 0,
        approvalRate: 0,
        skillPerformanceTrend: []
      },
      operationalAlerts: [
        {
          level: "warning",
          title: "Mock fallback active",
          detail: reason
        }
      ],
      workflowHealthIndicators: [
        { label: "Workflow completion", value: "0%", status: "watch" },
        { label: "Approval queue", value: "0", status: "healthy" },
        { label: "Output quality", value: "unscored", status: "watch" },
        { label: "Persistence", value: "mock_fallback", status: "degraded" }
      ],
      activeRuns: 0,
      completedRuns: 0,
      pendingApprovals: 0,
      recentApprovals: [],
      recentAuditLogs: [],
      learningEvents: [],
      skillImprovementProposals: [],
      memoryUpdates: []
    },
    realtimeReady: {
      source: "structured_mock_snapshot",
      recommendedChannels: ["workflow_runs", "approvals", "audit_logs", "learning_events", "company_memory"]
    }
  };
}
