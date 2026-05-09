import { findWorkflowTemplate } from "@/modules/workflows/templates";
import type { WorkflowAgentRole, WorkflowObjectiveInput, WorkflowPlan } from "@/modules/workflows/types";

export function planAutonomousWorkflow(input: WorkflowObjectiveInput): WorkflowPlan {
  const template = findWorkflowTemplate(input.objective);
  const roles = new Set(template.steps.map((step) => step.ownerRole).filter((role): role is WorkflowAgentRole => Boolean(role)));
  const hasParallelSteps = template.steps.some((step) => step.parallelGroup);
  const hasSequentialChain = template.steps.some((step) => step.dependsOn?.length);

  return {
    template,
    objective: input.objective,
    contextQueries: [
      input.objective,
      `historical decisions for ${input.objective}`,
      `successful workflows similar to ${input.objective}`,
      `SOPs and risk constraints for ${input.objective}`
    ],
    executionMode: hasParallelSteps && hasSequentialChain ? "hybrid" : hasParallelSteps ? "parallel" : "sequential",
    approvalCheckpoints: template.steps.filter((step) => step.approval?.required).map((step) => step.key),
    estimatedDepartments: Array.from(roles)
  };
}
