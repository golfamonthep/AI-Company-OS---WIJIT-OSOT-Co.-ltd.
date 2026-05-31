import type {
  ApprovalCheckpoint,
  CEOCommand,
  CEOCommandIntent,
  CEOPlan,
  DelegatedTask,
  MemoryCandidate,
  MemoryCandidateScope,
  WorkflowExecution
} from "@/modules/orchestration/types";
import type { CEOBrainPlan, GenerateCEOBrainPlan } from "@/lib/ai/ceo-brain";

export type CreateCEOPlanInput = {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  command: string;
};

export type ApproveCEOPlanInput = {
  approvedBy: "human" | "ceo" | string;
  notes?: string;
};

export type RequestPlanRevisionInput = {
  requestedBy: "human" | "ceo" | string;
  reason: string;
};

export type CreateMemoryCandidateInput = {
  title: string;
  content: string;
  scope: MemoryCandidateScope;
  relatedCommandId?: string;
  relatedWorkflowExecutionId?: string;
  importance?: number;
  tags?: string[];
};

export type CEOCommandServiceAdapters = {
  now?: () => string;
  createId?: (prefix: string) => string;
  generateCEOBrainPlan?: GenerateCEOBrainPlan;
  savePlan?: (plan: CEOPlan) => Promise<CEOPlan> | CEOPlan;
  saveMemoryCandidate?: (candidate: MemoryCandidate) => Promise<MemoryCandidate> | MemoryCandidate;
  executeWorkflow?: (execution: WorkflowExecution, plan: CEOPlan) => Promise<WorkflowExecution> | WorkflowExecution;
};

export class CEOCommandService {
  private readonly now: () => string;
  private readonly createId: (prefix: string) => string;

  constructor(private readonly adapters: CEOCommandServiceAdapters = {}) {
    this.now = adapters.now ?? (() => new Date().toISOString());
    this.createId = adapters.createId ?? ((prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  }

  async createCEOPlanFromCommand(input: CreateCEOPlanInput): Promise<CEOPlan> {
    const command = this.createCommand(input);
    const aiPlanResult = await this.tryCreateOpenAIBackedPlan(input, command);
    if (aiPlanResult.plan) {
      return this.persistPlan(aiPlanResult.plan);
    }

    const workflowExecution = this.createWorkflowExecution(command);
    const delegatedTasks = this.createDelegatedTasks(command, workflowExecution.id);
    const approvalCheckpoint = this.createApprovalCheckpoint(command, workflowExecution.id);
    const memoryCandidate = this.createMemoryCandidate({
      title: "CEO command summary",
      content: `CEO AI received command: ${command.command}`,
      scope: "task_history",
      relatedCommandId: command.id,
      relatedWorkflowExecutionId: workflowExecution.id,
      importance: 6,
      tags: ["ceo-command", command.intent ?? "answer"]
    });

    const plan: CEOPlan = {
      id: this.createId("ceo-plan"),
      commandId: command.id,
      summary: this.buildPlanSummary(command),
      status: "waiting_approval",
      recommendedActions: [
        "Confirm the business objective before work starts.",
        "Review the delegated tasks and approval checkpoint.",
        "Approve the plan before any external use or memory promotion."
      ],
      delegatedTasks,
      approvalCheckpoints: [approvalCheckpoint],
      workflowExecutions: [{ ...workflowExecution, delegatedTaskIds: delegatedTasks.map((task) => task.id), approvalCheckpoints: [approvalCheckpoint] }],
      memoryCandidates: [memoryCandidate],
      metadata: {
        command,
        integrationMode: "deterministic_mock",
        ...(aiPlanResult.fallbackReason
          ? {
              aiFallback: {
                reason: aiPlanResult.fallbackReason,
                userMessage: "CEO AI ใช้โหมดสำรองชั่วคราว เพราะยังเชื่อมต่อสมอง AI จริงไม่ได้"
              }
            }
          : {}),
        futureIntegrationPoints: ["ai_planner", "database_repository", "workflow_engine"]
      }
    };

    return this.persistPlan(plan);
  }

  async approveCEOPlan(plan: CEOPlan, input: ApproveCEOPlanInput): Promise<CEOPlan> {
    const approvedAt = this.now();
    return this.persistPlan({
      ...plan,
      status: "ready",
      approvalCheckpoints: plan.approvalCheckpoints.map((checkpoint) => ({
        ...checkpoint,
        status: "approved",
        metadata: { ...(checkpoint.metadata ?? {}), approvedBy: input.approvedBy, approvalNotes: input.notes, approvedAt }
      })),
      metadata: { ...(plan.metadata ?? {}), approvedBy: input.approvedBy, approvalNotes: input.notes, approvedAt }
    });
  }

  async requestPlanRevision(plan: CEOPlan, input: RequestPlanRevisionInput): Promise<CEOPlan> {
    const revisionRequestedAt = this.now();
    return this.persistPlan({
      ...plan,
      status: "draft",
      approvalCheckpoints: plan.approvalCheckpoints.map((checkpoint) => ({
        ...checkpoint,
        status: "changes_requested",
        metadata: { ...(checkpoint.metadata ?? {}), requestedBy: input.requestedBy, revisionReason: input.reason, revisionRequestedAt }
      })),
      metadata: { ...(plan.metadata ?? {}), requestedBy: input.requestedBy, revisionReason: input.reason, revisionRequestedAt }
    });
  }

  async executeApprovedWorkflow(plan: CEOPlan): Promise<CEOPlan> {
    if (plan.status !== "ready") {
      throw new Error("CEO plan must be approved before workflow execution.");
    }

    const executions = await Promise.all(
      plan.workflowExecutions.map(async (execution) => {
        const completed: WorkflowExecution = {
          ...execution,
          status: "completed",
          currentStep: "deterministic_mock_execution",
          outputSummary: `Mock workflow execution completed for ${execution.workflowKey}.`,
          metadata: { ...(execution.metadata ?? {}), executedAt: this.now(), executionMode: "deterministic_mock" }
        };

        return this.adapters.executeWorkflow ? this.adapters.executeWorkflow(completed, plan) : completed;
      })
    );

    return this.persistPlan({
      ...plan,
      status: "completed",
      delegatedTasks: plan.delegatedTasks.map((task) => ({ ...task, status: "completed" })),
      workflowExecutions: executions,
      metadata: { ...(plan.metadata ?? {}), executedAt: this.now(), executionMode: "deterministic_mock" }
    });
  }

  createMemoryCandidate(input: CreateMemoryCandidateInput): MemoryCandidate {
    return {
      id: this.createId("memory-candidate"),
      title: input.title,
      content: input.content,
      scope: input.scope,
      sourceType: "ceo_command",
      status: "proposed",
      importance: input.importance ?? 5,
      tags: input.tags ?? ["ceo-command"],
      relatedCommandId: input.relatedCommandId,
      relatedWorkflowExecutionId: input.relatedWorkflowExecutionId,
      metadata: { createdAt: this.now(), integrationMode: "deterministic_mock" }
    };
  }

  async saveMemoryCandidate(candidate: MemoryCandidate): Promise<MemoryCandidate> {
    const saved: MemoryCandidate = {
      ...candidate,
      status: "saved",
      metadata: { ...(candidate.metadata ?? {}), savedAt: this.now(), persistenceMode: "adapter_ready" }
    };

    return this.adapters.saveMemoryCandidate ? this.adapters.saveMemoryCandidate(saved) : saved;
  }

  private createCommand(input: CreateCEOPlanInput): CEOCommand {
    return {
      id: this.createId("ceo-command"),
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      command: input.command,
      intent: detectIntent(input.command),
      requestedBy: "human",
      status: "planned",
      createdAt: this.now()
    };
  }

  private createWorkflowExecution(command: CEOCommand): WorkflowExecution {
    return {
      id: this.createId("workflow-execution"),
      workflowKey: command.intent === "start_workflow" ? "content-production" : "ceo-command-review",
      status: "queued",
      currentStep: "plan_approval",
      objective: command.command,
      metadata: { commandId: command.id, integrationMode: "workflow_engine_ready" }
    };
  }

  private createDelegatedTasks(command: CEOCommand, workflowExecutionId: string): DelegatedTask[] {
    const ownerAgentId = command.intent === "start_workflow" ? "content-creator" : "ceo";
    return [
      {
        id: this.createId("delegated-task"),
        title: command.intent === "start_workflow" ? "Prepare draft content plan for CEO review" : "Prepare CEO command review",
        description: command.command,
        ownerAgentId,
        status: "queued",
        priority: command.intent === "start_workflow" ? "high" : "medium",
        expectedOutput: "A short plan that can be reviewed before any external action.",
        approvalRequired: true,
        workflowExecutionId,
        metadata: { commandId: command.id }
      }
    ];
  }

  private createApprovalCheckpoint(command: CEOCommand, workflowExecutionId: string): ApprovalCheckpoint {
    const isWorkflow = command.intent === "start_workflow";
    return {
      id: this.createId("approval-checkpoint"),
      title: isWorkflow ? "Approve draft campaign work before external use" : "Approve CEO AI plan before execution",
      domain: isWorkflow ? "publishing" : "workflow",
      requiredApprovers: isWorkflow ? ["human", "ceo"] : ["human"],
      status: "requested",
      riskLevel: isWorkflow ? "medium" : "low",
      relatedWorkflowExecutionId: workflowExecutionId,
      summary: "CEO AI can prepare and coordinate work, but execution stays approval-gated.",
      metadata: { commandId: command.id }
    };
  }

  private async tryCreateOpenAIBackedPlan(
    input: CreateCEOPlanInput,
    command: CEOCommand
  ): Promise<{ plan?: CEOPlan; fallbackReason?: string }> {
    if (!this.adapters.generateCEOBrainPlan) {
      return {};
    }

    try {
      const brainPlan = await this.adapters.generateCEOBrainPlan(input);
      if (!brainPlan) {
        return { fallbackReason: "OPENAI_API_KEY is not configured." };
      }

      return { plan: this.createPlanFromCEOBrain(command, brainPlan) };
    } catch (error) {
      return { fallbackReason: error instanceof Error ? error.message : "OpenAI CEO brain failed." };
    }
  }

  private createPlanFromCEOBrain(command: CEOCommand, brainPlan: CEOBrainPlan): CEOPlan {
    const workflowExecution = this.createWorkflowExecution(command);
    const delegatedTasks = brainPlan.delegatedTasks.map((task) =>
      this.createDelegatedTaskFromCEOBrain(task, command, workflowExecution.id)
    );
    const approvalCheckpoints = brainPlan.approvalCheckpoints.map((checkpoint) =>
      this.createApprovalCheckpointFromCEOBrain(checkpoint, command, workflowExecution.id)
    );
    const memoryCandidate = this.createMemoryCandidate({
      title: brainPlan.title,
      content: `${brainPlan.summary}\n\n${brainPlan.recommendedStrategy}`,
      scope: "task_history",
      relatedCommandId: command.id,
      relatedWorkflowExecutionId: workflowExecution.id,
      importance: 7,
      tags: ["ceo-command", "openai-brain", command.intent ?? "answer"]
    });

    return {
      id: this.createId("ceo-plan"),
      commandId: command.id,
      summary: brainPlan.summary,
      status: "waiting_approval",
      recommendedActions: brainPlan.steps,
      delegatedTasks,
      approvalCheckpoints,
      workflowExecutions: [
        {
          ...workflowExecution,
          delegatedTaskIds: delegatedTasks.map((task) => task.id),
          approvalCheckpoints
        }
      ],
      memoryCandidates: [memoryCandidate],
      metadata: {
        command,
        integrationMode: "openai_responses_api",
        title: brainPlan.title,
        recommendedStrategy: brainPlan.recommendedStrategy,
        risks: brainPlan.risks,
        contentWorkflowSuggestion: brainPlan.contentWorkflowSuggestion
      }
    };
  }

  private createDelegatedTaskFromCEOBrain(
    task: CEOBrainPlan["delegatedTasks"][number],
    command: CEOCommand,
    workflowExecutionId: string
  ): DelegatedTask {
    return {
      id: this.createId("delegated-task"),
      title: task.task,
      description: `${task.department}: ${task.task}`,
      ownerAgentId: toOwnerAgentId(task.agentName),
      status: toDelegatedTaskStatus(task.status),
      priority: command.intent === "start_workflow" ? "high" : "medium",
      expectedOutput: task.expectedOutput,
      approvalRequired: true,
      workflowExecutionId,
      metadata: { commandId: command.id, department: task.department, agentName: task.agentName }
    };
  }

  private createApprovalCheckpointFromCEOBrain(
    checkpoint: CEOBrainPlan["approvalCheckpoints"][number],
    command: CEOCommand,
    workflowExecutionId: string
  ): ApprovalCheckpoint {
    return {
      id: this.createId("approval-checkpoint"),
      title: checkpoint.label,
      domain: command.intent === "start_workflow" ? "publishing" : "workflow",
      requiredApprovers: ["human"],
      status: toApprovalCheckpointStatus(checkpoint.status),
      riskLevel: "medium",
      relatedWorkflowExecutionId: workflowExecutionId,
      summary: checkpoint.description,
      metadata: { commandId: command.id, sourceStatus: checkpoint.status }
    };
  }

  private buildPlanSummary(command: CEOCommand) {
    if (command.intent === "start_workflow") {
      return `CEO AI prepared an approval-gated content workflow plan for: ${command.command}`;
    }

    return `CEO AI prepared a lightweight command plan for: ${command.command}`;
  }

  private async persistPlan(plan: CEOPlan) {
    return this.adapters.savePlan ? this.adapters.savePlan(plan) : plan;
  }
}

function detectIntent(command: string): CEOCommandIntent {
  const lower = command.toLowerCase();
  if (lower.includes("อนุมัติ") || lower.includes("approval") || lower.includes("review")) return "review_approval";
  if (lower.includes("แคมเปญ") || lower.includes("campaign") || lower.includes("tiktok") || lower.includes("workflow")) return "start_workflow";
  if (lower.includes("สร้างงาน") || lower.includes("task") || lower.includes("todo")) return "create_tasks";
  if (lower.includes("รายงาน") || lower.includes("report")) return "report";
  if (lower.includes("แผน") || lower.includes("strategy") || lower.includes("roadmap")) return "plan";
  return "answer";
}

function toOwnerAgentId(agentName: string) {
  const normalized = agentName.toLowerCase();
  if (normalized.includes("marketing")) return "marketing-ai";
  if (normalized.includes("content")) return "content-creator";
  if (normalized.includes("design")) return "design-ai";
  if (normalized.includes("sales")) return "sales-ai";
  if (normalized.includes("finance")) return "finance-ai";
  if (normalized.includes("operations")) return "operations-ai";
  if (normalized.includes("r&d") || normalized.includes("research")) return "rd-ai";
  return "ceo-ai";
}

function toDelegatedTaskStatus(status: string): DelegatedTask["status"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("progress")) return "in_progress";
  if (normalized.includes("approval")) return "waiting_approval";
  if (normalized.includes("complete") || normalized.includes("done")) return "completed";
  if (normalized.includes("block")) return "blocked";
  if (normalized.includes("assign")) return "assigned";
  return "queued";
}

function toApprovalCheckpointStatus(status: string): ApprovalCheckpoint["status"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("approve")) return "approved";
  if (normalized.includes("reject")) return "rejected";
  if (normalized.includes("change") || normalized.includes("revision")) return "changes_requested";
  if (normalized.includes("not")) return "not_required";
  return "requested";
}
