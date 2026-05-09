import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryItem } from "@/modules/memory/types";
import type { SkillDefinition } from "@/modules/agent-runtime/skills/types";

export type AgentRuntimeLayer =
  | "agent"
  | "skill"
  | "memory"
  | "workflow"
  | "harness"
  | "governance"
  | "learning"
  | "operations"
  | "integrations"
  | "persistence"
  | "api"
  | "dashboard"
  | "output"
  | "communication";

export type AgentRuntimeState =
  | "agent_loaded"
  | "skills_loaded"
  | "memory_retrieved"
  | "workflow_started"
  | "harness_executed"
  | "output_validated"
  | "output_saved"
  | "completed"
  | "failed";

export type AgentRuntimeEvent = {
  state: AgentRuntimeState;
  layer: AgentRuntimeLayer;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AgentRuntimeInput<TPayload> = {
  organizationId: string;
  agentId: string;
  workflowId: string;
  objective: string;
  payload: TPayload;
  requestedByAgentId?: string;
  requestedByUserId?: string;
};

export type AgentRuntimeProfile = {
  agentId: string;
  agentPath: string;
  agentMarkdown: string;
  architectureMarkdown?: string;
  roleMetadata: {
    mission: string;
    authority: string;
    memoryAccess: string;
    collaboration: string;
  };
  responsibilities: string[];
  kpis: string[];
  behaviorRules: string[];
};

export type AgentSkillDefinition = SkillDefinition;

export type AgentRuntimeMemoryContext = {
  company: MemoryItem[];
  agent: MemoryItem[];
  workflowHistory: MemoryItem[];
  decisions: MemoryItem[];
  injected: MemoryItem[];
};

export type HarnessToolName = "openai" | "filesystem" | "memory" | "web_search" | "json_parser" | "node_runtime" | "python_runtime";

export type HarnessToolStatus = {
  tool: HarnessToolName;
  status: "used" | "fallback" | "unavailable" | "skipped" | "failed";
  summary: string;
};

export type AgentRuntimeGuardrailReport = {
  passed: boolean;
  blockedReasons: string[];
  requiredApprovals: string[];
  notes: string[];
};

export type AgentWorkflowAdapter<TPayload, TOutput> = {
  workflowId: string;
  selectSkills: (context: AgentRuntimeContext<TPayload>) => string[];
  execute: (context: AgentRuntimeContext<TPayload>) => Promise<AgentWorkflowExecution<TOutput>>;
  validateOutput: (output: TOutput, context: AgentRuntimeContext<TPayload>) => AgentRuntimeGuardrailReport;
  summarizeTask: (output: TOutput, context: AgentRuntimeContext<TPayload>) => string;
  buildLearningNote: (output: TOutput, guardrails: AgentRuntimeGuardrailReport, context: AgentRuntimeContext<TPayload>) => string;
};

export type AgentWorkflowExecution<TOutput> = {
  output: TOutput;
  harness: HarnessToolStatus[];
};

export type AgentRuntimeContext<TPayload> = {
  input: AgentRuntimeInput<TPayload>;
  supabase: SupabaseClient | null;
  profile: AgentRuntimeProfile;
  skills: AgentSkillDefinition[];
  selectedSkillIds: string[];
  memory: AgentRuntimeMemoryContext;
};

export type AgentRuntimePersistence = {
  runtimeRunId?: string;
  runtimeRunSaved: boolean;
  runtimeEventsSaved: boolean;
  runtimeOutputSaved: boolean;
  learningSaved: boolean;
};

export type AgentRuntimeResult<TPayload, TOutput> = {
  input: AgentRuntimeInput<TPayload>;
  profile: AgentRuntimeProfile;
  skills: AgentSkillDefinition[];
  selectedSkillIds: string[];
  memory: AgentRuntimeMemoryContext;
  events: AgentRuntimeEvent[];
  harness: HarnessToolStatus[];
  output: TOutput;
  guardrails: AgentRuntimeGuardrailReport;
  persistence: AgentRuntimePersistence;
};
