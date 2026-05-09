import type { SupabaseClient } from "@supabase/supabase-js";

export type CompanyAgentId = "ceo" | "cto" | "cfo" | "marketing" | "ads-performance" | "content-creator" | "video-editor" | "rd" | "workflow-engine";

export type CollaborationEventType = "message" | "task_delegated" | "handoff" | "approval_requested" | "approval_decided" | "escalation" | "workflow_event" | "memory_shared";

export type CollaborationTaskStatus = "requested" | "assigned" | "accepted" | "in_progress" | "review" | "approved" | "rejected" | "completed" | "blocked" | "escalated";

export type CollaborationApprovalStatus = "requested" | "approved" | "rejected" | "changes_requested";

export type CollaborationMemoryReference = {
  memoryId: string;
  source: "company" | "agent" | "task_history" | "decision_log" | "workflow";
  title: string;
  relevance: string;
};

export type CollaborationWorkflowContext = {
  organizationId: string;
  workflowId?: string;
  objective: string;
  campaignName?: string;
  sharedMemory: CollaborationMemoryReference[];
  artifacts: Array<{ label: string; path?: string; summary: string }>;
  metadata?: Record<string, unknown>;
};

export type CollaborationSession = {
  sessionId: string;
  organizationId: string;
  title: string;
  objective: string;
  participatingAgents: CompanyAgentId[];
  context: CollaborationWorkflowContext;
  status: "active" | "waiting_approval" | "completed" | "blocked" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type AgentMessage = {
  messageId: string;
  sessionId: string;
  organizationId: string;
  fromAgentId: CompanyAgentId;
  toAgentId: CompanyAgentId;
  subject: string;
  body: string;
  messageType: "direct" | "request" | "handoff" | "status" | "decision";
  memoryReferences: CollaborationMemoryReference[];
  createdAt: string;
};

export type AgentTaskDelegation = {
  delegationId: string;
  sessionId: string;
  organizationId: string;
  fromAgentId: CompanyAgentId;
  toAgentId: CompanyAgentId;
  title: string;
  instructions: string;
  expectedOutput: string;
  status: CollaborationTaskStatus;
  dependsOn?: string[];
  memoryReferences: CollaborationMemoryReference[];
  createdAt: string;
  updatedAt: string;
};

export type CollaborationApprovalRequest = {
  approvalId: string;
  sessionId: string;
  organizationId: string;
  requesterAgentId: CompanyAgentId;
  approverAgentId: CompanyAgentId | "human";
  subject: string;
  summary: string;
  status: CollaborationApprovalStatus;
  decisionNotes?: string;
  createdAt: string;
  decidedAt?: string;
};

export type CollaborationEscalation = {
  escalationId: string;
  sessionId: string;
  organizationId: string;
  fromAgentId: CompanyAgentId;
  toAgentId: CompanyAgentId;
  severity: "low" | "medium" | "high" | "critical";
  issue: string;
  recommendedAction: string;
  status: "open" | "resolved" | "cancelled";
  createdAt: string;
};

export type CollaborationEvent = {
  eventId: string;
  sessionId: string;
  organizationId: string;
  eventType: CollaborationEventType;
  actorAgentId: CompanyAgentId;
  targetAgentId?: CompanyAgentId | "human";
  summary: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CollaborationExecutionResult = {
  session: CollaborationSession;
  messages: AgentMessage[];
  delegations: AgentTaskDelegation[];
  approvals: CollaborationApprovalRequest[];
  escalations: CollaborationEscalation[];
  events: CollaborationEvent[];
  finalReport: Record<string, unknown>;
};

export type CollaborationRuntimeContext = {
  supabase: SupabaseClient | null;
};
