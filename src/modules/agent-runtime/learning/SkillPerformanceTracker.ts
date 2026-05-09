import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningExecutionOutcome, ProcessedFeedback, SkillPerformanceMetric } from "@/modules/agent-runtime/learning/types";

export class SkillPerformanceTracker {
  private readonly metrics = new Map<string, SkillPerformanceMetric>();

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async recordOutcome(outcome: LearningExecutionOutcome, feedback?: ProcessedFeedback) {
    if (!outcome.skillId) return undefined;

    const key = metricKey(outcome.organizationId, outcome.agentId, outcome.skillId);
    const previous = this.metrics.get(key);
    const qualityScore = feedback?.normalizedScore ?? outcome.qualityScore ?? statusScore(outcome.status);

    const executions = (previous?.executions ?? 0) + 1;
    const successes = (previous?.successes ?? 0) + (outcome.status === "success" ? 1 : 0);
    const failures = (previous?.failures ?? 0) + (outcome.status === "failure" ? 1 : 0);
    const partials = (previous?.partials ?? 0) + (outcome.status === "partial" ? 1 : 0);
    const previousAverage = previous?.averageQualityScore ?? qualityScore;
    const averageQualityScore = round(((previousAverage * (executions - 1)) + qualityScore) / executions);
    const successRate = round(successes / executions);

    const metric: SkillPerformanceMetric = {
      organizationId: outcome.organizationId,
      agentId: outcome.agentId,
      skillId: outcome.skillId,
      executions,
      successes,
      failures,
      partials,
      averageQualityScore,
      successRate,
      trend: resolveTrend(previous?.averageQualityScore, averageQualityScore, executions),
      lastUpdated: new Date().toISOString()
    };

    this.metrics.set(key, metric);
    await this.saveMetric(metric);
    return metric;
  }

  getMetric(organizationId: string, agentId: SkillPerformanceMetric["agentId"], skillId: string) {
    return this.metrics.get(metricKey(organizationId, agentId, skillId));
  }

  listMetrics() {
    return [...this.metrics.values()];
  }

  private async saveMetric(metric: SkillPerformanceMetric) {
    if (!this.supabase) return;

    await this.supabase.from("learning_skill_performance_metrics").upsert(
      {
        organization_id: metric.organizationId,
        agent_id: metric.agentId,
        skill_id: metric.skillId,
        executions: metric.executions,
        successes: metric.successes,
        failures: metric.failures,
        partials: metric.partials,
        average_quality_score: metric.averageQualityScore,
        success_rate: metric.successRate,
        trend: metric.trend,
        last_updated: metric.lastUpdated
      },
      { onConflict: "organization_id,agent_id,skill_id" }
    );
  }
}

function metricKey(organizationId: string, agentId: string, skillId: string) {
  return `${organizationId}:${agentId}:${skillId}`;
}

function statusScore(status: LearningExecutionOutcome["status"]) {
  if (status === "success") return 0.85;
  if (status === "partial") return 0.55;
  return 0.2;
}

function resolveTrend(previousAverage: number | undefined, currentAverage: number, executions: number): SkillPerformanceMetric["trend"] {
  if (executions <= 1 || previousAverage === undefined) return "new";
  if (currentAverage - previousAverage >= 0.05) return "improving";
  if (previousAverage - currentAverage >= 0.05) return "declining";
  return "stable";
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
