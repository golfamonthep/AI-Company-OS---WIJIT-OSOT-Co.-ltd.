import type { WorkflowPlan, WorkflowRunSnapshot, WorkflowRunStep } from "@/modules/workflows/types";

export function createWorkflowRunSnapshot(plan: WorkflowPlan, organizationId: string): WorkflowRunSnapshot {
  const runId = `run-${Date.now()}`;
  const steps: WorkflowRunStep[] = plan.template.steps.map((step) => ({
    stepKey: step.key,
    name: step.name,
    type: step.type,
    ownerRole: step.ownerRole,
    status: step.dependsOn?.length ? "queued" : "running",
    attemptCount: step.dependsOn?.length ? 0 : 1,
    maxAttempts: step.retry?.maxAttempts ?? 3,
    dependsOn: step.dependsOn ?? []
  }));

  return {
    runId,
    organizationId,
    objective: plan.objective,
    templateSlug: plan.template.slug,
    status: "running",
    currentStepKey: steps.find((step) => step.status === "running")?.stepKey,
    steps,
    events: [
      {
        eventType: "workflow_started",
        summary: `Started workflow ${plan.template.name}`,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

export function simulateFirstExecutionTick(snapshot: WorkflowRunSnapshot): WorkflowRunSnapshot {
  const now = new Date().toISOString();
  const firstRunning = snapshot.steps.find((step) => step.status === "running");
  if (!firstRunning) return snapshot;

  const completedFirstStep = {
    ...firstRunning,
    status: "completed" as const,
    output: {
      summary: `${firstRunning.ownerRole ?? "agent"} completed ${firstRunning.name}`,
      next: "Continue dependent workflow steps"
    }
  };

  const completedKeys = new Set([completedFirstStep.stepKey]);
  const nextSteps = snapshot.steps.map((step) => {
    if (step.stepKey === completedFirstStep.stepKey) return completedFirstStep;
    const ready = step.dependsOn.every((dependency) => completedKeys.has(dependency));
    if (step.status === "queued" && ready) {
      return { ...step, status: step.type === "approval" ? ("waiting_for_approval" as const) : ("waiting_for_agent" as const) };
    }
    return step;
  });

  return {
    ...snapshot,
    currentStepKey: nextSteps.find((step) => step.status === "waiting_for_agent" || step.status === "waiting_for_approval")?.stepKey,
    steps: nextSteps,
    events: [
      ...snapshot.events,
      {
        eventType: "step_completed",
        stepKey: completedFirstStep.stepKey,
        summary: `${completedFirstStep.name} completed by ${completedFirstStep.ownerRole ?? "workflow engine"}`,
        createdAt: now
      },
      {
        eventType: "workflow_waiting",
        summary: "Workflow is waiting for agent collaboration or approval on the next step.",
        createdAt: now
      }
    ]
  };
}
