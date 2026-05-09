import type { SupabaseClient } from "@supabase/supabase-js";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type PersistenceStatus = "success" | "mocked" | "failed";

export type PersistenceResult<T> = {
  status: PersistenceStatus;
  data: T | null;
  error?: string;
  source: "supabase" | "memory";
};

export type PersistenceListResult<T> = {
  status: PersistenceStatus;
  data: T[];
  error?: string;
  source: "supabase" | "memory";
};

export type PersistenceContext = {
  supabase: SupabaseClient | null;
  fallbackMode: boolean;
};

export type BaseRecord = {
  id?: string;
  organization_id: string;
  workspace_id?: string;
  created_by?: string;
  updated_by?: string;
  owner_user_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
};

export type AgentRecord = BaseRecord & {
  agent_key: string;
  role: string;
  name: string;
  responsibilities?: string[];
  kpis?: string[];
  behavior_rules?: string[];
  memory_scope?: Record<string, unknown>;
  permission_profile?: Record<string, unknown>;
  source_path?: string;
  status?: string;
};

export type SkillRecord = BaseRecord & {
  agent_id?: string;
  agent_key?: string;
  skill_id: string;
  name: string;
  description?: string;
  purpose?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  guardrails?: string[];
  quality_checklist?: string[];
  source_path?: string;
};

export type SkillExecutionRecord = BaseRecord & {
  agent_id?: string;
  agent_key?: string;
  skill_id: string;
  workflow_id?: string;
  task_intent?: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  validation_result?: Record<string, unknown>;
  harness_status?: unknown[];
  errors?: string[];
  improvement_notes?: string[];
};

export type MemoryRecord = BaseRecord & {
  table?: "company_memory" | "agent_memory" | "task_history" | "decision_logs";
  agent_key?: string;
  workflow_id?: string;
  title: string;
  content?: string;
  task_intent?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  result_summary?: string;
  decision?: string;
  reasoning?: string;
  memory_type?: string;
  source_type?: string;
  source_id?: string;
  semantic_tags?: string[];
  embedding_model?: string;
  relevance_score?: number;
  importance?: number;
};

export type WorkflowRecord = BaseRecord & {
  workflow_key: string;
  slug?: string;
  name: string;
  purpose?: string;
  participating_agents?: string[];
  definition?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  approval_points?: unknown[];
  success_metrics?: unknown[];
  source_path?: string;
  status?: string;
};

export type WorkflowRunRecord = BaseRecord & {
  run_key: string;
  workflow_key: string;
  workflow_id?: string;
  objective?: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
};

export type ApprovalRecord = BaseRecord & {
  approval_key: string;
  requester_agent_key: string;
  approver_agent_keys?: string[];
  domain: string;
  subject: string;
  summary: string;
  status: string;
  decisions?: unknown[];
  related_workflow_run_id?: string;
  related_task_id?: string;
};

export type AuditLogRecord = BaseRecord & {
  actor_agent_key?: string;
  user_id?: string;
  event_type: string;
  action?: string;
  severity?: string;
  summary: string;
  decision?: string;
  related_workflow_id?: string;
  related_task_id?: string;
};

export type LearningRecord = BaseRecord & {
  proposal_key?: string;
  agent_key?: string;
  workflow_id?: string;
  skill_id?: string;
  event_type?: string;
  proposal_type?: string;
  target_type?: string;
  target_id?: string;
  title?: string;
  summary: string;
  status?: string;
  score?: number;
  proposed_change?: Record<string, unknown>;
  evidence?: unknown[];
};

export type OperationsRecord = BaseRecord & {
  trigger_key: string;
  trigger_type: string;
  name: string;
  description?: string;
  condition?: Record<string, unknown>;
  target_workflow_id?: string;
  status?: string;
};

export type IntegrationRecord = BaseRecord & {
  connector_id: string;
  provider?: string;
  auth_type?: string;
  status?: string;
  scopes?: string[];
  read_actions?: unknown[];
  write_actions?: unknown[];
  approval_requirements?: unknown[];
  action_id?: string;
  action_type?: string;
  summary?: string;
  output?: Record<string, unknown>;
  error?: string;
};

export type ArtifactRecord = BaseRecord & {
  owner_agent_id?: string;
  workflow_run_id?: string;
  artifact_type: string;
  title: string;
  storage_path: string;
  mime_type?: string;
  size_bytes?: number;
  checksum?: string;
  source_type?: string;
  source_id?: string;
};

export type DashboardPersistenceSnapshot = {
  agents: AgentRecord[];
  skillExecutions: SkillExecutionRecord[];
  memory: MemoryRecord[];
  workflowRuns: WorkflowRunRecord[];
  approvals: ApprovalRecord[];
  auditLogs: AuditLogRecord[];
};
