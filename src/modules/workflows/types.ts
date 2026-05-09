export type WorkflowTriggerType = "manual" | "scheduled" | "event";
export type WorkflowRunStatus = "queued" | "running" | "waiting_for_approval" | "completed" | "failed" | "cancelled" | "escalated";
export type WorkflowStepStatus = "queued" | "running" | "waiting_for_agent" | "waiting_for_approval" | "completed" | "failed" | "skipped" | "cancelled";
export type WorkflowStepType =
  | "agent_task"
  | "tool_call"
  | "approval"
  | "memory_write"
  | "report_generation"
  | "conditional"
  | "parallel_group"
  | "event_wait";

export type WorkflowAgentRole = "ceo" | "marketing" | "content" | "video" | "ads" | "cfo" | "cto" | "rd" | "admin";

export type WorkflowStepDefinition = {
  key: string;
  name: string;
  type: WorkflowStepType;
  ownerRole?: WorkflowAgentRole;
  dependsOn?: string[];
  parallelGroup?: string;
  condition?: {
    expression: string;
    trueStep?: string;
    falseStep?: string;
  };
  approval?: {
    required: boolean;
    approverRole: WorkflowAgentRole | "human";
    reason: string;
  };
  retry?: {
    maxAttempts: number;
    backoffStrategy: "fixed" | "linear" | "exponential";
    backoffSeconds: number;
  };
  expectedOutput: string;
  memoryScopes?: string[];
};

export type AutonomousWorkflowTemplate = {
  slug: string;
  name: string;
  description: string;
  trigger: WorkflowTriggerType;
  objectivePattern: string;
  ownerRole: WorkflowAgentRole;
  steps: WorkflowStepDefinition[];
};

export type WorkflowObjectiveInput = {
  organizationId: string;
  objective: string;
  createdByAgentId?: string;
  createdByUserId?: string;
  triggerType?: WorkflowTriggerType;
  constraints?: string[];
};

export type WorkflowPlan = {
  template: AutonomousWorkflowTemplate;
  objective: string;
  contextQueries: string[];
  executionMode: "sequential" | "parallel" | "hybrid";
  approvalCheckpoints: string[];
  estimatedDepartments: WorkflowAgentRole[];
};

export type WorkflowRunStep = {
  stepKey: string;
  name: string;
  type: WorkflowStepType;
  ownerRole?: WorkflowAgentRole;
  status: WorkflowStepStatus;
  attemptCount: number;
  maxAttempts: number;
  dependsOn: string[];
  output?: Record<string, unknown>;
  error?: string;
};

export type WorkflowRunSnapshot = {
  runId: string;
  organizationId: string;
  objective: string;
  templateSlug: string;
  status: WorkflowRunStatus;
  currentStepKey?: string;
  steps: WorkflowRunStep[];
  events: Array<{
    eventType: string;
    summary: string;
    stepKey?: string;
    createdAt: string;
  }>;
};
