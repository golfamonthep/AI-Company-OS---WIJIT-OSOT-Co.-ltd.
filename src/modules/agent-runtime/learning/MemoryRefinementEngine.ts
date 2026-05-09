import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningExecutionOutcome, MemoryRefinementSuggestion, ProcessedFeedback } from "@/modules/agent-runtime/learning/types";

export type MemoryCandidate = {
  memoryId: string;
  organizationId: string;
  title: string;
  retrievalCount: number;
  successReferences: number;
  failureReferences: number;
  lastUsedAt?: string;
};

export class MemoryRefinementEngine {
  constructor(private readonly supabase: SupabaseClient | null = null) {}

  suggestRefinements(input: {
    memories: MemoryCandidate[];
    outcomes: LearningExecutionOutcome[];
    feedback: ProcessedFeedback[];
  }): MemoryRefinementSuggestion[] {
    return input.memories.map((memory) => this.suggestForMemory(memory));
  }

  private suggestForMemory(memory: MemoryCandidate): MemoryRefinementSuggestion {
    const confidence = calculateConfidence(memory);
    const action = chooseAction(memory);

    return {
      suggestionId: `memory-refinement-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: memory.organizationId,
      memoryId: memory.memoryId,
      action,
      reason: buildReason(memory, action),
      confidence,
      requiresReview: true,
      createdAt: new Date().toISOString()
    };
  }

  async saveSuggestion(suggestion: MemoryRefinementSuggestion) {
    if (!this.supabase) return { saved: false };

    const result = await this.supabase.from("learning_memory_refinement_suggestions").upsert(
      {
        organization_id: suggestion.organizationId,
        suggestion_key: suggestion.suggestionId,
        memory_id: suggestion.memoryId,
        action: suggestion.action,
        reason: suggestion.reason,
        confidence: suggestion.confidence,
        requires_review: suggestion.requiresReview,
        status: "proposed",
        created_at: suggestion.createdAt
      },
      { onConflict: "organization_id,suggestion_key" }
    );

    return { saved: !result.error };
  }
}

function chooseAction(memory: MemoryCandidate): MemoryRefinementSuggestion["action"] {
  if (memory.successReferences >= 3 && memory.failureReferences === 0) return "promote";
  if (memory.failureReferences > memory.successReferences && memory.retrievalCount >= 3) return "retag";
  if (memory.retrievalCount === 0) return "archive";
  return "keep";
}

function buildReason(memory: MemoryCandidate, action: MemoryRefinementSuggestion["action"]) {
  if (action === "promote") return `${memory.title} repeatedly appears in successful outcomes.`;
  if (action === "retag") return `${memory.title} appears in weaker outcomes and should be retagged or rewritten before reuse.`;
  if (action === "archive") return `${memory.title} has no retrieval usage in the sampled outcomes.`;
  return `${memory.title} is still useful but does not need refinement yet.`;
}

function calculateConfidence(memory: MemoryCandidate) {
  const total = Math.max(1, memory.retrievalCount + memory.successReferences + memory.failureReferences);
  return Math.round(((memory.successReferences + memory.failureReferences) / total) * 100) / 100;
}
