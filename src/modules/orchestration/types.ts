import type { MemoryItem } from "@/modules/memory/types";
import type { CompanyTask } from "@/modules/tasks/types";

export type CEOCommandIntent = "answer" | "plan" | "create_tasks" | "report" | "start_workflow" | "review_approval";
export type CEOCommandStatus = "received" | "planned" | "delegated" | "waiting_approval" | "completed" | "failed";
export type CEOPlanStatus = "draft" | "ready" | "in_progress" | "waiting_approval" | "completed";
export type DelegatedTaskStatus = "queued" | "assigned" | "in_progress" | "waiting_approval" | "completed" | "blocked";
export type ApprovalCheckpointStatus = "not_required" | "requested" | "approved" | "rejected" | "changes_requested";
export type WorkflowExecutionStatus = "queued" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled";
export type MemoryCandidateStatus = "proposed" | "approved" | "rejected" | "saved";
export type MemoryCandidateScope = "company" | "agent" | "task_history" | "decision" | "workflow";

export type CEOCommand = {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  command: string;
  intent?: CEOCommandIntent;
  requestedBy: "human" | "ceo" | "system";
  status: CEOCommandStatus;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type DelegatedTask = {
  id: string;
  title: string;
  description?: string;
  ownerAgentId: string;
  status: DelegatedTaskStatus;
  priority?: "low" | "medium" | "high" | "critical";
  expectedOutput?: string;
  approvalRequired?: boolean;
  workflowExecutionId?: string;
  metadata?: Record<string, unknown>;
};

export type ApprovalCheckpoint = {
  id: string;
  title: string;
  domain: "publishing" | "campaign" | "budget" | "workflow" | "finance" | "customer_contact" | string;
  requiredApprovers: Array<"human" | "ceo" | "cfo" | "cto" | "marketing" | "rd" | string>;
  status: ApprovalCheckpointStatus;
  riskLevel: "low" | "medium" | "high";
  relatedTaskId?: string;
  relatedWorkflowExecutionId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export type WorkflowExecution = {
  id: string;
  workflowKey: string;
  status: WorkflowExecutionStatus;
  currentStep?: string;
  objective?: string;
  delegatedTaskIds?: string[];
  approvalCheckpoints?: ApprovalCheckpoint[];
  outputSummary?: string;
  metadata?: Record<string, unknown>;
};

export type MemoryCandidate = {
  id: string;
  title: string;
  content: string;
  scope: MemoryCandidateScope;
  sourceType: "ceo_command" | "workflow" | "approval" | "feedback" | "learning" | string;
  status: MemoryCandidateStatus;
  importance?: number;
  tags?: string[];
  relatedCommandId?: string;
  relatedWorkflowExecutionId?: string;
  metadata?: Record<string, unknown>;
};

export type CEOPlan = {
  id: string;
  commandId: string;
  summary: string;
  status: CEOPlanStatus;
  recommendedActions?: string[];
  delegatedTasks: DelegatedTask[];
  approvalCheckpoints: ApprovalCheckpoint[];
  workflowExecutions: WorkflowExecution[];
  memoryCandidates: MemoryCandidate[];
  metadata?: Record<string, unknown>;
};

export type CEOCommandInput = {
  organizationId?: string;
  userId?: string;
  command: string;
};

export type CEOCommandResult = {
  executiveSummary: string;
  recommendedActions: string[];
  createdTasks: CompanyTask[];
  referencedMemory: MemoryItem[];
  confidence: number;
};

export type AgentGraphState = {
  input: CEOCommandInput;
  intent?: CEOCommandIntent;
  memories: MemoryItem[];
  tasks: CompanyTask[];
  result?: CEOCommandResult;
};
