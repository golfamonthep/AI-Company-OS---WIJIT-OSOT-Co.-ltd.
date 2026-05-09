import type { SupabaseClient } from "@supabase/supabase-js";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";
import { saveRuntimeMemory } from "@/modules/agent-runtime/memory/MemoryWriter";
import { evaluateApprovalCheckpoint } from "@/modules/agent-runtime/workflows/ApprovalManager";
import { loadWorkflowDefinition } from "@/modules/agent-runtime/workflows/WorkflowRegistry";
import { routeWorkflowStep } from "@/modules/agent-runtime/workflows/WorkflowRouter";
import { transitionWorkflowState } from "@/modules/agent-runtime/workflows/WorkflowStateManager";
import type {
  WorkflowDefinition,
  WorkflowExecutionEvent,
  WorkflowExecutionInput,
  WorkflowExecutionResult,
  WorkflowExecutionState,
  WorkflowStepDefinition,
  WorkflowStepRun
} from "@/modules/agent-runtime/workflows/types";
import { saveWorkflowExecutionLog } from "@/modules/agent-runtime/workflows/WorkflowLogger";

export async function executeWorkflow(input: WorkflowExecutionInput, supabase: SupabaseClient | null): Promise<WorkflowExecutionResult> {
  const definition = await loadWorkflowDefinition(input.workflowId);
  const runId = `workflow-${Date.now()}`;
  const events: WorkflowExecutionEvent[] = [];
  const record = (event: Omit<WorkflowExecutionEvent, "createdAt">) => events.push({ ...event, createdAt: new Date().toISOString() });
  const steps: WorkflowStepRun[] = definition.steps.map((step) => ({
    stepId: step.stepId,
    name: step.name,
    agentId: step.agentId,
    state: "queued",
    attempts: 0
  }));

  let state: WorkflowExecutionState = transitionWorkflowState("pending", "queued");
  record({ eventType: "workflow_queued", state, summary: `Queued workflow ${definition.name}` });
  state = transitionWorkflowState(state, "running");
  record({ eventType: "workflow_started", state, summary: `Started workflow ${definition.name}` });

  for (const definitionStep of definition.steps) {
    const stepRun = steps.find((step) => step.stepId === definitionStep.stepId);
    if (!stepRun) continue;

    const dependenciesComplete = definitionStep.dependsOn.every((dependency) => steps.find((step) => step.stepId === dependency)?.state === "completed");
    if (!dependenciesComplete) {
      stepRun.state = "failed";
      stepRun.error = "Dependency was not completed.";
      record({ eventType: "step_failed", state: "failed", stepId: stepRun.stepId, agentId: stepRun.agentId, summary: `${stepRun.name} dependency failed.` });
      break;
    }

    const route = routeWorkflowStep(definitionStep);
    stepRun.state = "running";
    stepRun.attempts += 1;
    stepRun.startedAt = new Date().toISOString();
    record({ eventType: "step_started", state: "running", stepId: stepRun.stepId, agentId: route.agentId, summary: route.routeReason });

    const approval = evaluateApprovalCheckpoint(definitionStep, input);
    if (approval.required && !approval.approved) {
      stepRun.state = "waiting_approval";
      state = "waiting_approval";
      record({ eventType: "approval_required", state, stepId: stepRun.stepId, agentId: stepRun.agentId, summary: approval.reason });
      break;
    }

    while (stepRun.attempts <= definitionStep.maxRetries && stepRun.state !== "completed") {
      try {
        stepRun.output = await executeStep(definition, definitionStep, input, supabase);
        stepRun.state = "completed";
        stepRun.completedAt = new Date().toISOString();
        record({ eventType: "step_completed", state: "completed", stepId: stepRun.stepId, agentId: stepRun.agentId, summary: `${stepRun.name} completed.` });
      } catch (error) {
        stepRun.error = error instanceof Error ? error.message : "Unknown workflow step error";
        if (stepRun.attempts >= definitionStep.maxRetries) {
          stepRun.state = "failed";
          record({ eventType: "step_failed", state: "failed", stepId: stepRun.stepId, agentId: stepRun.agentId, summary: stepRun.error });
          break;
        }

        stepRun.state = "retrying";
        record({ eventType: "step_retrying", state: "retrying", stepId: stepRun.stepId, agentId: stepRun.agentId, summary: stepRun.error });
        stepRun.attempts += 1;
        stepRun.state = "running";
      }
    }

    if (stepRun.state === "failed") break;
  }

  const failed = steps.some((step) => step.state === "failed");
  const waitingApproval = steps.some((step) => step.state === "waiting_approval");
  const completed = steps.every((step) => step.state === "completed");
  state = failed ? "failed" : waitingApproval ? "waiting_approval" : completed ? "completed" : "running";
  record({ eventType: "workflow_state_changed", state, summary: `Workflow is ${state}.` });

  const result = buildWorkflowResult(runId, definition, input, state, steps, events);
  await saveWorkflowExecutionLog(supabase, result);

  if (state === "completed") {
    await saveRuntimeMemory({
      organizationId: input.organizationId,
      agentId: "workflow-engine",
      workflowId: input.workflowId,
      taskIntent: input.objective,
      outputSummary: `Workflow ${definition.name} completed with ${result.analytics.completedSteps} steps.`,
      learningNote: `Successful workflow pattern: ${definition.steps.map((step) => `${step.agentId}:${step.stepId}`).join(" -> ")}`,
      tags: ["workflow", input.workflowId]
    }).catch(() => undefined);
  }

  return result;
}

async function executeStep(
  definition: WorkflowDefinition,
  step: WorkflowStepDefinition,
  input: WorkflowExecutionInput,
  supabase: SupabaseClient | null
): Promise<Record<string, unknown>> {
  if (definition.workflowId === "content-production" && step.agentId === "content-creator") {
    const contentResult = await executeContentCreatorAgent(
      {
        organizationId: input.organizationId,
        brief: String(input.payload.campaignBrief ?? input.objective),
        productName: input.payload.productName ? String(input.payload.productName) : undefined,
        targetAudience: input.payload.targetAudience ? String(input.payload.targetAudience) : undefined,
        channel: "tiktok",
        contentGoal: "engagement",
        tone: "friendly"
      },
      supabase
    );
    return {
      summary: "Content Creator Agent generated structured content assets.",
      selectedSkills: contentResult.selectedSkills,
      output: contentResult.output,
      guardrails: contentResult.guardrails
    };
  }

  if (step.type === "approval") {
    return { summary: `${step.agentId} review checkpoint recorded.`, approvalMode: input.humanInTheLoop ? "human" : "non_blocking" };
  }

  return {
    summary: `${step.agentId} completed ${step.name}.`,
    expectedOutput: step.expectedOutput,
    handoff: "Structured placeholder until this agent receives a runtime adapter."
  };
}

function buildWorkflowResult(
  runId: string,
  definition: WorkflowDefinition,
  input: WorkflowExecutionInput,
  state: WorkflowExecutionState,
  steps: WorkflowStepRun[],
  events: WorkflowExecutionEvent[]
): WorkflowExecutionResult {
  return {
    runId,
    definition,
    input,
    state,
    steps,
    events,
    analytics: {
      totalSteps: steps.length,
      completedSteps: steps.filter((step) => step.state === "completed").length,
      failedSteps: steps.filter((step) => step.state === "failed").length,
      approvalCheckpoints: definition.steps.filter((step) => step.approvalRequired).length,
      routedAgents: Array.from(new Set(steps.map((step) => step.agentId)))
    }
  };
}
