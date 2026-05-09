import type { WorkflowExecutionInput, WorkflowStepDefinition } from "@/modules/agent-runtime/workflows/types";

export type ApprovalDecision = {
  required: boolean;
  approved: boolean;
  reason: string;
};

export function evaluateApprovalCheckpoint(step: WorkflowStepDefinition, input: WorkflowExecutionInput): ApprovalDecision {
  if (!step.approvalRequired) {
    return { required: false, approved: true, reason: "No approval required for this step." };
  }

  if (input.humanInTheLoop) {
    return { required: true, approved: false, reason: "Human approval is required before this step can complete." };
  }

  return { required: true, approved: true, reason: "Approval checkpoint recorded in non-blocking mode." };
}
