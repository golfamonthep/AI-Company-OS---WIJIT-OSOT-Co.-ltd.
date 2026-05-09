import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkflowExecutionState = "pending" | "queued" | "running" | "waiting_approval" | "completed" | "failed" | "retrying" | "cancelled";

export type WorkflowStepType = "task" | "agent_task" | "approval" | "memory_update" | "handoff" | "report";

export type WorkflowStepDefinition = {
  stepId: string;
  name: string;
  type: WorkflowStepType;
  agentId: string;
  description: string;
  dependsOn: string[];
  approvalRequired: boolean;
  maxRetries: number;
  expectedOutput: string;
};

export type WorkflowDefinition = {
  workflowId: string;
  name: string;
  purpose: string;
  participatingAgents: string[];
  inputs: string[];
  outputs: string[];
  steps: WorkflowStepDefinition[];
  approvalPoints: string[];
  memoryUpdates: string[];
  successMetrics: string[];
  failureHandling: string[];
  rawMarkdown: string;
};

export type WorkflowExecutionInput = {
  organizationId: string;
  workflowId: string;
  objective: string;
  payload: Record<string, unknown>;
  humanInTheLoop?: boolean;
  requestedByAgentId?: string;
  requestedByUserId?: string;
};

export type WorkflowStepRun = {
  stepId: string;
  name: string;
  agentId: string;
  state: WorkflowExecutionState;
  attempts: number;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
};

export type WorkflowExecutionEvent = {
  eventType: string;
  state: WorkflowExecutionState;
  stepId?: string;
  agentId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type WorkflowExecutionResult = {
  runId: string;
  definition: WorkflowDefinition;
  input: WorkflowExecutionInput;
  state: WorkflowExecutionState;
  steps: WorkflowStepRun[];
  events: WorkflowExecutionEvent[];
  analytics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    approvalCheckpoints: number;
    routedAgents: string[];
  };
};

export type WorkflowExecutorContext = {
  supabase: SupabaseClient | null;
  input: WorkflowExecutionInput;
  definition: WorkflowDefinition;
};
