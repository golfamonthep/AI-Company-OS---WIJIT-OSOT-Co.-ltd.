import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentRuntimeMemoryContext, HarnessToolName, HarnessToolStatus } from "@/modules/agent-runtime/contracts";

export type SkillOutputField = {
  key: string;
  type: "string" | "string[]" | "object" | "object[]" | "number" | "boolean" | "unknown";
  required: boolean;
  description?: string;
};

export type SkillDefinition = {
  skillId: string;
  agentId: string;
  name: string;
  purpose: string;
  whenToUse: string[];
  requiredInputs: string[];
  optionalInputs: string[];
  sopSteps: string[];
  outputSchema: SkillOutputField[];
  guardrails: string[];
  qualityChecklist: string[];
  failureModes: string[];
  examples: string[];
  harnessToolsNeeded: HarnessToolName[];
  memoryUsage: string[];
  successMetrics: string[];
  rawMarkdown: string;
};

export type SkillExecutionInput = {
  organizationId: string;
  agentId: string;
  skillId: string;
  taskIntent: string;
  inputs: Record<string, unknown>;
  memory?: AgentRuntimeMemoryContext;
  requestedByWorkflowId?: string;
};

export type SkillValidationResult = {
  passed: boolean;
  score: number;
  missingInputs: string[];
  missingOutputFields: string[];
  guardrailViolations: string[];
  qualityNotes: string[];
  improvementNotes: string[];
};

export type SkillExecutionResult<TOutput = Record<string, unknown>> = {
  skill: SkillDefinition;
  input: SkillExecutionInput;
  output: TOutput;
  validation: SkillValidationResult;
  harness: HarnessToolStatus[];
  errors: string[];
  improvementNotes: string[];
};

export type SkillExecutorOptions<TOutput> = {
  supabase?: SupabaseClient | null;
  fallbackOutput?: TOutput;
};
