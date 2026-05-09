import type { WorkflowDefinition, WorkflowExecutionEvent, WorkflowExecutionResult, WorkflowExecutionState, WorkflowStepRun } from "@/modules/agent-runtime/workflows/types";
import { MockAgentFactory } from "@/testing/MockAgentFactory";
import { MockHarnessExecutor } from "@/testing/MockHarnessExecutor";
import { MockMemorySystem } from "@/testing/MockMemorySystem";
import { MockWorkflowFactory } from "@/testing/MockWorkflowFactory";

export type WorkflowSimulationInput = {
  organizationId: string;
  workspaceId: string;
  workflow?: WorkflowDefinition;
  objective: string;
  simulateHumanApproval?: boolean;
  failStepIds?: string[];
};

export type WorkflowSimulationResult = WorkflowExecutionResult & {
  workspaceId: string;
  approvalRequested: boolean;
  approvalApproved: boolean;
  auditLogs: WorkflowExecutionEvent[];
  learningEvents: WorkflowExecutionEvent[];
};

export class WorkflowSimulationEngine {
  constructor(
    private readonly agents = new MockAgentFactory(),
    private readonly workflows = new MockWorkflowFactory(),
    private readonly memory = new MockMemorySystem(),
    private readonly harness = new MockHarnessExecutor()
  ) {}

  runMotherBabyTikTokCampaign(input: Partial<WorkflowSimulationInput> = {}) {
    const workspaceId = input.workspaceId ?? "test-workspace";
    this.memory.seedMotherBabyCampaign(workspaceId);

    return this.run({
      organizationId: input.organizationId ?? "test-org",
      workspaceId,
      workflow: input.workflow ?? this.workflows.createContentProductionWorkflow(),
      objective: input.objective ?? "Create a mother-and-baby TikTok campaign with safe reassurance hooks.",
      simulateHumanApproval: input.simulateHumanApproval ?? true,
      failStepIds: input.failStepIds ?? []
    });
  }

  run(input: WorkflowSimulationInput): WorkflowSimulationResult {
    const workflow = input.workflow ?? this.workflows.createContentProductionWorkflow();
    const team = this.agents.createMotherBabyCampaignTeam();
    const steps: WorkflowStepRun[] = [];
    const events: WorkflowExecutionEvent[] = [];
    const auditLogs: WorkflowExecutionEvent[] = [];
    const learningEvents: WorkflowExecutionEvent[] = [];
    let state: WorkflowExecutionState = "running";
    let approvalRequested = false;
    let approvalApproved = false;

    this.record(events, "workflow_started", "running", `Workflow started: ${workflow.workflowId}`);

    for (const step of workflow.steps) {
      const run: WorkflowStepRun = {
        stepId: step.stepId,
        name: step.name,
        agentId: step.agentId,
        state: "running",
        attempts: 1,
        startedAt: new Date().toISOString()
      };

      if (input.failStepIds?.includes(step.stepId)) {
        run.state = step.maxRetries > 0 ? "retrying" : "failed";
        run.error = `Simulated failure at ${step.stepId}`;
        this.record(events, "step_failed", run.state, run.error, step.stepId, step.agentId);
        if (run.state === "retrying") {
          run.attempts += 1;
          this.record(events, "step_retrying", "retrying", `Retrying ${step.stepId}`, step.stepId, step.agentId);
          run.state = "completed";
        } else {
          state = "failed";
          steps.push(run);
          break;
        }
      }

      if (step.type === "approval") {
        approvalRequested = true;
        run.state = "waiting_approval";
        this.record(events, "approval_requested", "waiting_approval", "Human approval requested.", step.stepId, step.agentId);
        this.record(auditLogs, "approval_requested", "waiting_approval", "Approval checkpoint audited.", step.stepId, step.agentId);

        if (input.simulateHumanApproval) {
          approvalApproved = true;
          run.state = "completed";
          run.output = { decision: "approved", approver: "human" };
          this.record(events, "approval_approved", "completed", "Human approval simulated.", step.stepId, step.agentId);
          this.record(auditLogs, "approval_approved", "completed", "Human approval audit event generated.", step.stepId, step.agentId);
        } else {
          run.completedAt = new Date().toISOString();
          steps.push(run);
          this.record(events, "step_completed", run.state, `${step.name}: ${run.state}`, step.stepId, step.agentId);
          state = "waiting_approval";
          break;
        }
      } else if (step.type === "memory_update") {
        const saved = this.memory.write({
          workspaceId: input.workspaceId,
          scope: "learning",
          title: "Mother-and-baby TikTok Campaign Learning",
          content: "Reassurance hooks completed with approval checkpoint.",
          tags: ["mother-baby", "tiktok", "learning"]
        });
        run.state = "completed";
        run.output = { memoryId: saved.id };
        this.record(learningEvents, "learning_event_generated", "completed", saved.title, step.stepId, step.agentId);
      } else {
        const memory = this.memory.retrieve({ workspaceId: input.workspaceId, query: `${input.objective} brand tiktok approval`, limit: 3 });
        const result = this.harness.execute({
          tool: "json_parser",
          action: "generate_step_output",
          input: { objective: input.objective, stepId: step.stepId, memory: memory.map((item) => item.title), team: Object.keys(team) }
        });
        run.state = result.status === "success" ? "completed" : "failed";
        run.output = {
          summary: `${step.agentId} completed ${step.name}.`,
          harness: result.auditSummary,
          injectedMemory: memory.map((item) => item.title)
        };
      }

      run.completedAt = new Date().toISOString();
      steps.push(run);
      this.record(events, "step_completed", run.state, `${step.name}: ${run.state}`, step.stepId, step.agentId);
    }

    if (state !== "failed") state = steps.every((step) => step.state === "completed") ? "completed" : "waiting_approval";
    this.record(events, "workflow_completed", state, `Workflow ended with state ${state}.`);

    return {
      runId: `sim-${workflow.workflowId}-${Date.now()}`,
      workspaceId: input.workspaceId,
      definition: workflow,
      input: {
        organizationId: input.organizationId,
        workflowId: workflow.workflowId,
        objective: input.objective,
        payload: { workspaceId: input.workspaceId },
        humanInTheLoop: true,
        requestedByAgentId: "ceo",
        requestedByUserId: "human"
      },
      state,
      steps,
      events,
      auditLogs,
      learningEvents,
      approvalRequested,
      approvalApproved,
      analytics: {
        totalSteps: workflow.steps.length,
        completedSteps: steps.filter((step) => step.state === "completed").length,
        failedSteps: steps.filter((step) => step.state === "failed").length,
        approvalCheckpoints: workflow.steps.filter((step) => step.approvalRequired).length,
        routedAgents: Array.from(new Set(steps.map((step) => step.agentId)))
      }
    };
  }

  private record(target: WorkflowExecutionEvent[], eventType: string, state: WorkflowExecutionState, summary: string, stepId?: string, agentId?: string) {
    target.push({
      eventType,
      state,
      stepId,
      agentId,
      summary,
      createdAt: new Date().toISOString()
    });
  }
}
