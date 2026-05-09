import type { SupabaseClient } from "@supabase/supabase-js";
import type { OperationRecommendation, OperationSignal, OperationsSnapshot } from "@/modules/agent-runtime/operations/types";

export class RecommendationEngine {
  constructor(private readonly supabase: SupabaseClient | null = null) {}

  recommend(input: { snapshot: OperationsSnapshot; signals: OperationSignal[] }): OperationRecommendation[] {
    const recommendations = input.signals.map((signal) => recommendationFromSignal(signal));

    if (!recommendations.length) {
      recommendations.push({
        recommendationId: `operation-recommendation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        organizationId: input.snapshot.organizationId,
        title: "Continue scheduled monitoring",
        summary: "No urgent operational risks detected.",
        recommendedAction: "Prepare routine weekly company review report.",
        operationType: "scheduled",
        impact: "low",
        urgency: "low",
        score: 0.25,
        riskLevel: "low",
        requiresApproval: false,
        approvalDomain: "none",
        evidence: ["No high-severity signals found."],
        createdByAgentId: "operations-system",
        createdAt: new Date().toISOString()
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  async saveRecommendations(recommendations: OperationRecommendation[]) {
    if (!this.supabase || !recommendations.length) return { saved: false };

    const result = await this.supabase.from("operations_recommendations").upsert(
      recommendations.map((recommendation) => ({
        organization_id: recommendation.organizationId,
        recommendation_key: recommendation.recommendationId,
        title: recommendation.title,
        summary: recommendation.summary,
        recommended_action: recommendation.recommendedAction,
        operation_type: recommendation.operationType,
        impact: recommendation.impact,
        urgency: recommendation.urgency,
        score: recommendation.score,
        risk_level: recommendation.riskLevel,
        requires_approval: recommendation.requiresApproval,
        approval_domain: recommendation.approvalDomain,
        evidence: recommendation.evidence,
        created_by_agent_id: recommendation.createdByAgentId,
        created_at: recommendation.createdAt
      })),
      { onConflict: "organization_id,recommendation_key" }
    );

    return { saved: !result.error };
  }
}

function recommendationFromSignal(signal: OperationSignal): OperationRecommendation {
  const impact = signal.severity === "critical" || signal.severity === "high" ? "high" : signal.severity === "medium" ? "medium" : "low";
  const requiresApproval = impact === "high";
  return {
    recommendationId: `operation-recommendation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    organizationId: signal.organizationId,
    title: titleForSignal(signal),
    summary: signal.summary,
    recommendedAction: actionForSignal(signal),
    operationType: signal.source === "kpi" || signal.source === "workflow" ? "event_driven" : "recommendation",
    impact,
    urgency: impact,
    score: scoreForSeverity(signal.severity),
    riskLevel: signal.severity,
    requiresApproval,
    approvalDomain: signal.source === "finance" ? "finance" : signal.source === "campaign" || signal.source === "kpi" ? "campaign" : "workflow",
    evidence: [signal.summary],
    createdByAgentId: "operations-system",
    createdAt: new Date().toISOString()
  };
}

function titleForSignal(signal: OperationSignal) {
  if (signal.source === "kpi") return "Investigate KPI drop";
  if (signal.source === "workflow") return "Review failed workflow";
  if (signal.source === "task") return "Reduce task backlog";
  if (signal.source === "agent") return "Review agent workload";
  if (signal.source === "memory") return "Review memory quality";
  return "Review operational signal";
}

function actionForSignal(signal: OperationSignal) {
  if (signal.source === "kpi") return "Prepare campaign performance review and route proposed corrective actions for approval.";
  if (signal.source === "workflow") return "Open workflow review and identify blockers before retrying.";
  if (signal.source === "task") return "Create low-risk internal triage task and escalate blocked items.";
  if (signal.source === "memory") return "Queue memory refinement suggestions for review.";
  return "Prepare analysis report for CEO review.";
}

function scoreForSeverity(severity: OperationSignal["severity"]) {
  if (severity === "critical") return 1;
  if (severity === "high") return 0.85;
  if (severity === "medium") return 0.6;
  return 0.35;
}
