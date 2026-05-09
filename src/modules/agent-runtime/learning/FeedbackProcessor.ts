import type { SupabaseClient } from "@supabase/supabase-js";
import type { HumanFeedbackInput, ProcessedFeedback } from "@/modules/agent-runtime/learning/types";

export class FeedbackProcessor {
  constructor(private readonly supabase: SupabaseClient | null = null) {}

  processHumanFeedback(input: HumanFeedbackInput): ProcessedFeedback {
    const normalizedScore = normalizeScore(input.score);
    const approvedCount = input.approvedCount ?? 0;
    const rejectedCount = input.rejectedCount ?? 0;
    const category = categorizeFeedback(normalizedScore, approvedCount, rejectedCount);

    return {
      feedbackId: input.feedbackId ?? `feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      sourceType: "human_feedback",
      agentId: input.agentId,
      workflowId: input.workflowId,
      taskId: input.taskId,
      skillId: input.skillId,
      itemId: input.itemId,
      normalizedScore,
      category,
      strengths: input.approvedPatterns ?? [],
      weaknesses: input.rejectedReasons ?? [],
      actionHints: buildActionHints(input, category),
      createdAt: input.createdAt ?? new Date().toISOString()
    };
  }

  processApprovalFeedback(input: {
    organizationId: string;
    agentId: HumanFeedbackInput["agentId"];
    workflowId?: string;
    taskId?: string;
    skillId?: string;
    itemId: string;
    approvalStatus: "approved" | "rejected" | "changes_requested";
    notes: string;
  }): ProcessedFeedback {
    const scoreByStatus = {
      approved: 0.9,
      changes_requested: 0.45,
      rejected: 0.2
    };

    return {
      feedbackId: `approval-feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: input.organizationId,
      sourceType: "approval_pattern",
      agentId: input.agentId,
      workflowId: input.workflowId,
      taskId: input.taskId,
      skillId: input.skillId,
      itemId: input.itemId,
      normalizedScore: scoreByStatus[input.approvalStatus],
      category: input.approvalStatus === "approved" ? "positive" : "negative",
      strengths: input.approvalStatus === "approved" ? [input.notes] : [],
      weaknesses: input.approvalStatus !== "approved" ? [input.notes] : [],
      actionHints: input.approvalStatus === "approved" ? ["Reuse approved pattern in similar contexts."] : ["Require revision before promoting this pattern."],
      createdAt: new Date().toISOString()
    };
  }

  async saveProcessedFeedback(feedback: ProcessedFeedback, rawFeedback: Record<string, unknown> = {}) {
    if (!this.supabase) return { saved: false };

    const result = await this.supabase.from("learning_feedback").upsert(
      {
        organization_id: feedback.organizationId,
        feedback_key: feedback.feedbackId,
        source_type: feedback.sourceType,
        agent_id: feedback.agentId,
        workflow_id: feedback.workflowId,
        task_id: feedback.taskId,
        skill_id: feedback.skillId,
        item_id: feedback.itemId,
        normalized_score: feedback.normalizedScore,
        category: feedback.category,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        action_hints: feedback.actionHints,
        raw_feedback: rawFeedback,
        created_at: feedback.createdAt
      },
      { onConflict: "organization_id,feedback_key" }
    );

    return { saved: !result.error };
  }
}

function normalizeScore(score: number) {
  if (score <= 1) return clamp(score);
  return clamp(score / 5);
}

function categorizeFeedback(score: number, approvedCount: number, rejectedCount: number): ProcessedFeedback["category"] {
  if (approvedCount > 0 && rejectedCount > 0) return "mixed";
  if (score >= 0.75) return "positive";
  if (score <= 0.45) return "negative";
  return "neutral";
}

function buildActionHints(input: HumanFeedbackInput, category: ProcessedFeedback["category"]) {
  const hints = [...(input.approvedPatterns ?? []).map((pattern) => `Increase use of pattern: ${pattern}`), ...(input.rejectedReasons ?? []).map((reason) => `Avoid or revise: ${reason}`)];
  if (category === "mixed") hints.push("Split successful and rejected examples before updating SOP.");
  if (!hints.length && input.comments) hints.push(`Review comment: ${input.comments}`);
  return hints;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
