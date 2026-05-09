import type { WorkflowExecutionState } from "@/modules/agent-runtime/workflows/types";

const allowedTransitions: Record<WorkflowExecutionState, WorkflowExecutionState[]> = {
  pending: ["queued", "cancelled"],
  queued: ["running", "cancelled"],
  running: ["waiting_approval", "completed", "failed", "retrying", "cancelled"],
  waiting_approval: ["running", "completed", "failed", "cancelled"],
  retrying: ["running", "failed", "cancelled"],
  completed: [],
  failed: ["retrying", "cancelled"],
  cancelled: []
};

export function canTransitionWorkflow(from: WorkflowExecutionState, to: WorkflowExecutionState) {
  return allowedTransitions[from].includes(to);
}

export function transitionWorkflowState(from: WorkflowExecutionState, to: WorkflowExecutionState) {
  if (!canTransitionWorkflow(from, to)) {
    throw new Error(`Invalid workflow state transition from ${from} to ${to}`);
  }
  return to;
}
