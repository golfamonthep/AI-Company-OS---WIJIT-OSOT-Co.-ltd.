import type { WorkflowRunStep } from "@/modules/workflows/types";

export type WorkflowFailure = {
  category: "transient" | "validation" | "business" | "dependency" | "safety" | "system";
  message: string;
};

export function decideFailureRecovery(step: WorkflowRunStep, failure: WorkflowFailure) {
  const attemptsRemain = step.attemptCount < step.maxAttempts;

  if (["transient", "validation"].includes(failure.category) && attemptsRemain) {
    return {
      action: "retry" as const,
      reason: `${failure.category} failure can be retried`,
      nextStatus: "queued" as const
    };
  }

  if (failure.category === "safety") {
    return {
      action: "approval" as const,
      reason: "Safety-sensitive operation requires approval checkpoint",
      nextStatus: "waiting_for_approval" as const
    };
  }

  return {
    action: "escalate" as const,
    reason: attemptsRemain ? failure.message : "Retry attempts exhausted",
    nextStatus: "failed" as const
  };
}
