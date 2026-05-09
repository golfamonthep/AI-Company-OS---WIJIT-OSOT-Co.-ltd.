export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskStage = "intake" | "assigned" | "accepted" | "in_progress" | "review" | "approval" | "completed" | "blocked" | "cancelled";
export type DelegationStatus = "assigned" | "accepted" | "declined" | "in_progress" | "completed" | "blocked" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type CompanyTask = {
  id: string;
  title: string;
  description: string;
  ownerAgentId: string;
  priority: TaskPriority;
  status: TaskStatus;
  currentStage?: TaskStage;
  progressPercent?: number;
  deadlineAt?: string;
  createdAt: string;
};

export type TaskDelegationInput = {
  organizationId: string;
  title: string;
  description: string;
  delegatorAgentId?: string;
  assigneeAgentId: string;
  priority: TaskPriority;
  deadlineAt?: string;
  workflowRunId?: string;
  instructions?: string;
  expectedOutput?: string;
  approvalRequired?: boolean;
  collaborators?: Array<{ agentId: string; role: "collaborator" | "reviewer" | "approver" | "observer"; responsibility?: string }>;
};

export type DelegationDecisionInput = {
  organizationId: string;
  delegationId: string;
  taskId: string;
  agentId: string;
  reason?: string;
};

export type ProgressUpdateInput = {
  organizationId: string;
  taskId: string;
  agentId?: string;
  progressPercent: number;
  summary: string;
  blockers?: string[];
  nextAction?: string;
};
