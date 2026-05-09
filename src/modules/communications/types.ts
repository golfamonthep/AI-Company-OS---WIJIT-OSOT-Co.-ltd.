export type CommunicationType =
  | "direct_message"
  | "task_delegation"
  | "workflow_collaboration"
  | "team_discussion"
  | "status_report"
  | "approval_request"
  | "escalation"
  | "memory_reference";

export type CommunicationPriority = "low" | "medium" | "high" | "critical";

export type AgentRoleTarget = "ceo" | "cto" | "marketing" | "content" | "video" | "cfo" | "rd" | "admin";

export type AgentCommunicationEnvelope = {
  organizationId: string;
  type: CommunicationType;
  senderAgentId?: string;
  recipientAgentId?: string;
  targetRole?: AgentRoleTarget;
  departmentId?: string;
  threadId?: string;
  workflowRunId?: string;
  taskId?: string;
  priority: CommunicationPriority;
  subject: string;
  body: string;
  memoryReferences?: string[];
  metadata?: Record<string, unknown>;
};

export type AgentRoutingDecision = {
  targetRole: AgentRoleTarget;
  reason: string;
  requiresApproval: boolean;
  shouldEscalate: boolean;
  notificationPriority: CommunicationPriority;
};
