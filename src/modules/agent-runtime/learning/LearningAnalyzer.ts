import type { LearningExecutionOutcome, LearningInsight, ProcessedFeedback } from "@/modules/agent-runtime/learning/types";

export class LearningAnalyzer {
  analyze(input: { outcomes: LearningExecutionOutcome[]; feedback: ProcessedFeedback[] }): LearningInsight[] {
    const insights: LearningInsight[] = [];
    insights.push(...this.analyzeFeedbackPatterns(input.feedback));
    insights.push(...this.analyzeFailurePatterns(input.outcomes));
    insights.push(...this.analyzeWorkflowResults(input.outcomes));
    return insights;
  }

  private analyzeFeedbackPatterns(feedback: ProcessedFeedback[]) {
    const insights: LearningInsight[] = [];
    const bySkill = groupBy(feedback.filter((item) => item.skillId), (item) => `${item.organizationId}:${item.agentId}:${item.skillId}`);

    for (const group of bySkill.values()) {
      const first = group[0];
      const averageScore = group.reduce((sum, item) => sum + item.normalizedScore, 0) / group.length;
      const strengths = unique(group.flatMap((item) => item.strengths));
      const weaknesses = unique(group.flatMap((item) => item.weaknesses));

      if (averageScore >= 0.7 && strengths.length) {
        insights.push(createInsight({
          organizationId: first.organizationId,
          type: "skill_improvement",
          sourceTypes: ["human_feedback"],
          targetAgentId: first.agentId,
          targetSkillId: first.skillId,
          confidence: Math.min(0.95, averageScore),
          riskLevel: "low",
          summary: `High-performing feedback patterns found for ${first.skillId}.`,
          evidence: strengths,
          recommendedAction: `Add successful patterns to the skill quality checklist: ${strengths.join("; ")}.`
        }));
      }

      if (weaknesses.length) {
        insights.push(createInsight({
          organizationId: first.organizationId,
          type: "skill_improvement",
          sourceTypes: ["human_feedback", "correction_pattern"],
          targetAgentId: first.agentId,
          targetSkillId: first.skillId,
          confidence: Math.max(0.45, 1 - averageScore),
          riskLevel: "medium",
          summary: `Repeated correction patterns found for ${first.skillId}.`,
          evidence: weaknesses,
          recommendedAction: `Add explicit avoid/revise guidance to the skill SOP: ${weaknesses.join("; ")}.`
        }));
      }
    }

    return insights;
  }

  private analyzeFailurePatterns(outcomes: LearningExecutionOutcome[]) {
    const failed = outcomes.filter((outcome) => outcome.status === "failure" || outcome.approvalStatus === "rejected");
    if (!failed.length) return [];

    return failed.map((outcome) =>
      createInsight({
        organizationId: outcome.organizationId,
        type: "decision_quality",
        sourceTypes: ["failed_output", "approval_pattern"],
        targetAgentId: outcome.agentId,
        targetSkillId: outcome.skillId,
        targetWorkflowId: outcome.workflowId,
        confidence: 0.7,
        riskLevel: "medium",
        summary: `Failure or rejection detected for ${outcome.objective}.`,
        evidence: [...(outcome.errors ?? []), ...(outcome.correctionNotes ?? [])],
        recommendedAction: "Require a pre-submit quality checklist before this task type is routed for approval."
      })
    );
  }

  private analyzeWorkflowResults(outcomes: LearningExecutionOutcome[]) {
    const byWorkflow = groupBy(outcomes.filter((outcome) => outcome.workflowId), (outcome) => `${outcome.organizationId}:${outcome.workflowId}`);
    const insights: LearningInsight[] = [];

    for (const group of byWorkflow.values()) {
      const first = group[0];
      const successCount = group.filter((outcome) => outcome.status === "success").length;
      const successRate = successCount / group.length;
      if (group.length >= 2 && successRate < 0.6) {
        insights.push(createInsight({
          organizationId: first.organizationId,
          type: "workflow_optimization",
          sourceTypes: ["workflow_result"],
          targetAgentId: first.agentId,
          targetWorkflowId: first.workflowId,
          confidence: 0.65,
          riskLevel: "medium",
          summary: `Workflow ${first.workflowId} has low success rate in sampled outcomes.`,
          evidence: group.map((outcome) => `${outcome.status}: ${outcome.outputSummary}`),
          recommendedAction: "Add earlier review checkpoint before final approval."
        }));
      }
    }

    return insights;
  }
}

function createInsight(input: Omit<LearningInsight, "insightId" | "createdAt">): LearningInsight {
  return {
    ...input,
    insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}
