import type { SupabaseClient } from "@supabase/supabase-js";
import { runMotherBabyLearningFlow } from "@/modules/agent-runtime/learning/sample-mother-baby-learning";
import { saveAgentLearningMemory } from "@/modules/agent-runtime/memory/MemoryWriter";
import { ActionApprovalRouter } from "@/modules/agent-runtime/operations/ActionApprovalRouter";
import { OperationsMonitor } from "@/modules/agent-runtime/operations/OperationsMonitor";
import { OperationsScheduler } from "@/modules/agent-runtime/operations/OperationsScheduler";
import { RecommendationEngine } from "@/modules/agent-runtime/operations/RecommendationEngine";
import { RiskDetector } from "@/modules/agent-runtime/operations/RiskDetector";
import { TriggerEngine } from "@/modules/agent-runtime/operations/TriggerEngine";
import { createOperationsLogEvent, saveOperationsLogEvent } from "@/modules/agent-runtime/operations/OperationsLogger";
import type { GovernanceApprovalRequest } from "@/modules/agent-runtime/governance/types";
import type { OperationRun } from "@/modules/agent-runtime/operations/types";

export async function runWeeklyAICompanyReview(supabase: SupabaseClient | null = null) {
  const organizationId = "sample-organization";
  const monitor = new OperationsMonitor();
  const scheduler = new OperationsScheduler(supabase);
  const triggerEngine = new TriggerEngine();
  const recommendationEngine = new RecommendationEngine(supabase);
  const riskDetector = new RiskDetector();
  const approvalRouter = new ActionApprovalRouter(supabase);

  const schedule = await scheduler.schedule({
    organizationId,
    name: "Weekly AI Company Review",
    workflowId: "weekly-company-review",
    cadence: "weekly",
    ownerAgentId: "ceo",
    nextRunAt: new Date().toISOString(),
    status: "active",
    lowRisk: true
  });

  const weeklyTrigger = triggerEngine.register({
    organizationId,
    type: "scheduled",
    name: "Weekly review trigger",
    condition: "weekly_review",
    workflowId: "weekly-company-review",
    status: "active",
    metadata: { scheduleId: schedule.scheduleId }
  });

  const snapshot = monitor.buildSnapshot({
    organizationId,
    tasks: { backlog: 12, overdue: 2, blocked: 1 },
    workflows: { running: 3, failed: 1, waitingApproval: 2, completedThisWeek: 7 },
    kpis: [
      { name: "content_velocity", current: 8, target: 10, direction: "down" },
      { name: "campaign_ctr", current: 1.9, target: 2.5, direction: "down" }
    ],
    agents: [
      { agentId: "ceo", activeTasks: 3, blockedTasks: 0, performanceScore: 0.82 },
      { agentId: "cfo", activeTasks: 2, blockedTasks: 0, performanceScore: 0.78 },
      { agentId: "marketing", activeTasks: 5, blockedTasks: 1, performanceScore: 0.66 },
      { agentId: "content-creator", activeTasks: 4, blockedTasks: 0, performanceScore: 0.74 }
    ],
    memory: { staleItems: 4, lowQualityItems: 2 }
  });
  const signals = monitor.detectSignals(snapshot);
  const firedTriggers = triggerEngine.evaluate({ snapshot, signals });
  const recommendations = recommendationEngine.recommend({ snapshot, signals });
  await recommendationEngine.saveRecommendations(recommendations);

  const risks = recommendations.map((recommendation) =>
    riskDetector.assessRecommendation({
      organizationId,
      actorAgentId: "workflow-engine",
      recommendation
    })
  );

  const routedApprovals: GovernanceApprovalRequest[] = [];
  for (const recommendation of recommendations) {
    const risk = risks.find((item) => item.actionSummary === recommendation.recommendedAction);
    if (!risk) continue;
    const routed = await approvalRouter.route({ organizationId, requesterAgentId: "ceo", recommendation, risk });
    if (routed.approval) routedApprovals.push(routed.approval);
  }

  const learningSummary = await runMotherBabyLearningFlow(supabase);
  if (learningSummary.approvedProposal?.status === "approved") {
    await saveAgentLearningMemory({
      organizationId,
      agentId: "content-creator",
      workflowId: "weekly-company-review",
      taskIntent: "Weekly AI Company Review approved learning",
      outputSummary: learningSummary.approvedProposal.summary,
      learningNote: learningSummary.approvedProposal.proposedChange,
      tags: ["operations", "weekly-review", "approved-learning"]
    });
  }

  const report = {
    title: "Weekly AI Company Review",
    owner: "ceo",
    workflowId: "weekly-company-review",
    sections: {
      workflowResults: "7 workflows completed this week; 1 failed workflow needs review; 2 runs are waiting for approval.",
      finance: "CFO review placeholder: no financial record changes executed. Budget-impact recommendations require approval.",
      marketing: "Campaign CTR is below target; optimization recommendation routed to approval.",
      content: "Content velocity is below target; backlog triage recommended as low-risk internal task.",
      learning: {
        approvedProposal: learningSummary.approvedProposal?.title,
        futureExecutionGuidance: learningSummary.futureExecutionGuidance,
        memorySuggestions: learningSummary.memorySuggestions
      },
      risks: risks.map((risk) => ({ action: risk.actionSummary, riskLevel: risk.riskLevel, approvalRequired: risk.approvalRequired }))
    },
    recommendations,
    approvalState: "Report and high-impact recommendations routed to governance approval before external action.",
    generatedAt: new Date().toISOString()
  };

  const run: OperationRun = {
    runId: `operation-run-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    organizationId,
    operationType: "scheduled",
    workflowId: "weekly-company-review",
    title: "Weekly AI Company Review",
    status: routedApprovals.length ? "waiting_approval" : "completed",
    trigger: firedTriggers[0] ?? weeklyTrigger,
    schedule,
    recommendations,
    risks,
    approvals: routedApprovals,
    report,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveOperationsRun(supabase, run);
  await saveOperationsLogEvent(
    supabase,
    createOperationsLogEvent({
      organizationId,
      runId: run.runId,
      actorId: "operations-system",
      eventType: "weekly_company_review_generated",
      summary: "Weekly AI Company Review generated and high-impact actions routed for approval.",
      status: run.status,
      metadata: { run }
    })
  );

  return { run, snapshot, signals, learningSummary };
}

async function saveOperationsRun(supabase: SupabaseClient | null, run: OperationRun) {
  if (!supabase) return { saved: false };

  const result = await supabase.from("operations_runs").upsert(
    {
      organization_id: run.organizationId,
      run_key: run.runId,
      operation_type: run.operationType,
      workflow_id: run.workflowId,
      title: run.title,
      status: run.status,
      trigger_payload: run.trigger ?? {},
      schedule_payload: run.schedule ?? {},
      recommendations: run.recommendations,
      risks: run.risks,
      approvals: run.approvals,
      report: run.report ?? {},
      created_at: run.createdAt,
      updated_at: run.updatedAt
    },
    { onConflict: "organization_id,run_key" }
  );

  return { saved: !result.error };
}
