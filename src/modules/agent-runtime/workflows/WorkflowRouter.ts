import type { WorkflowStepDefinition } from "@/modules/agent-runtime/workflows/types";

export type RoutedWorkflowTask = {
  stepId: string;
  agentId: string;
  routeReason: string;
};

export function routeWorkflowStep(step: WorkflowStepDefinition): RoutedWorkflowTask {
  return {
    stepId: step.stepId,
    agentId: step.agentId,
    routeReason: `Step ${step.stepId} is owned by ${step.agentId} in WORKFLOW.md.`
  };
}
