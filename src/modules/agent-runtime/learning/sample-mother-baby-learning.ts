import type { SupabaseClient } from "@supabase/supabase-js";
import { runMotherBabyTikTokCollaboration } from "@/modules/agent-runtime/collaboration/sample-mother-baby-campaign";
import { FeedbackProcessor } from "@/modules/agent-runtime/learning/FeedbackProcessor";
import { LearningAnalyzer } from "@/modules/agent-runtime/learning/LearningAnalyzer";
import { createLearningAuditEvent, saveLearningAuditEvent } from "@/modules/agent-runtime/learning/LearningAuditLogger";
import { LearningReviewQueue } from "@/modules/agent-runtime/learning/LearningReviewQueue";
import { MemoryRefinementEngine } from "@/modules/agent-runtime/learning/MemoryRefinementEngine";
import { SkillPerformanceTracker } from "@/modules/agent-runtime/learning/SkillPerformanceTracker";
import { SOPRefinementEngine } from "@/modules/agent-runtime/learning/SOPRefinementEngine";
import type { LearningExecutionOutcome } from "@/modules/agent-runtime/learning/types";

export async function runMotherBabyLearningFlow(supabase: SupabaseClient | null = null) {
  const organizationId = "sample-organization";
  const workflowId = "content-production";
  const skillId = "hook-generation";

  const collaboration = await runMotherBabyTikTokCollaboration(supabase);
  const feedbackProcessor = new FeedbackProcessor(supabase);
  const performanceTracker = new SkillPerformanceTracker(supabase);
  const analyzer = new LearningAnalyzer();
  const sopRefinement = new SOPRefinementEngine();
  const memoryRefinement = new MemoryRefinementEngine(supabase);
  const reviewQueue = new LearningReviewQueue(supabase);

  const humanFeedback = {
    organizationId,
    reviewerId: "human",
    agentId: "content-creator" as const,
    workflowId,
    taskId: "mother-baby-hooks",
    skillId,
    itemId: "mother-baby-hook-batch-001",
    score: 4,
    approvedCount: 8,
    rejectedCount: 2,
    approvedPatterns: ["reassurance framing", "practical checklist angle", "warm parent-first language"],
    rejectedReasons: ["too generic", "implied unsupported product outcome"],
    comments: "Keep practical mother-first hooks. Avoid medical or guaranteed-result claims."
  };

  const processedFeedback = feedbackProcessor.processHumanFeedback(humanFeedback);
  await feedbackProcessor.saveProcessedFeedback(processedFeedback, humanFeedback);
  await saveLearningAuditEvent(
    supabase,
    createLearningAuditEvent({
      organizationId,
      actorId: "human",
      eventType: "feedback_processed",
      summary: "Human reviewer approved 8/10 hooks and rejected 2 hooks.",
      sourceType: "human_feedback",
      targetId: skillId,
      metadata: { processedFeedback }
    })
  );

  const outcome: LearningExecutionOutcome = {
    outcomeId: "mother-baby-content-output-001",
    organizationId,
    agentId: "content-creator",
    workflowId,
    taskId: "mother-baby-hooks",
    skillId,
    objective: "Generate TikTok hooks for a mother-and-baby product.",
    status: "partial",
    outputSummary: "Generated hook batch; 8 approved and 2 rejected by human reviewer.",
    qualityScore: processedFeedback.normalizedScore,
    approvalStatus: "changes_requested",
    correctionNotes: processedFeedback.weaknesses,
    memoryReferences: ["brand-voice", "content-creator-successful-outputs"],
    createdAt: new Date().toISOString()
  };

  const skillMetric = await performanceTracker.recordOutcome(outcome, processedFeedback);
  const insights = analyzer.analyze({ outcomes: [outcome], feedback: [processedFeedback] });
  const sopProposal = sopRefinement.createHookSOPProposal({
    organizationId,
    targetSkillId: skillId,
    highPerformingPatterns: processedFeedback.strengths,
    rejectedPatterns: processedFeedback.weaknesses
  });

  const queuedProposal = await reviewQueue.enqueue(sopProposal);
  const approvedProposal = await reviewQueue.review({
    proposalId: queuedProposal.proposalId,
    reviewerId: "human",
    decision: "approved",
    notes: "Approved as a learning proposal. Apply in a controlled follow-up edit to Content Creator SKILLS.md."
  });

  const memorySuggestions = memoryRefinement.suggestRefinements({
    outcomes: [outcome],
    feedback: [processedFeedback],
    memories: [
      { organizationId, memoryId: "brand-voice", title: "Brand Voice", retrievalCount: 4, successReferences: 3, failureReferences: 0 },
      { organizationId, memoryId: "generic-hook-patterns", title: "Generic Hook Patterns", retrievalCount: 3, successReferences: 0, failureReferences: 2 }
    ]
  });
  await Promise.all(memorySuggestions.map((suggestion) => memoryRefinement.saveSuggestion(suggestion)));

  return {
    collaboration,
    feedback: processedFeedback,
    skillMetric,
    insights,
    queuedProposal,
    approvedProposal,
    memorySuggestions,
    futureExecutionGuidance: approvedProposal?.status === "approved" ? approvedProposal.proposedChange : "No approved SOP refinement is available yet."
  };
}
