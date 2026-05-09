import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAgentRuntimeProfile } from "@/modules/agent-runtime/agent-loader";
import type {
  AgentRuntimeContext,
  AgentRuntimeEvent,
  AgentRuntimeInput,
  AgentRuntimeResult,
  AgentWorkflowAdapter
} from "@/modules/agent-runtime/contracts";
import { retrieveAgentRuntimeMemory } from "@/modules/agent-runtime/memory-engine";
import { saveAgentRuntimeOutput } from "@/modules/agent-runtime/output-manager";
import { loadAgentRuntimeSkills } from "@/modules/agent-runtime/skill-loader";
import { executeAgentWorkflow } from "@/modules/agent-runtime/workflow-executor";

export async function executeAgentRuntime<TPayload, TOutput>(input: {
  supabase: SupabaseClient | null;
  runtimeInput: AgentRuntimeInput<TPayload>;
  adapter: AgentWorkflowAdapter<TPayload, TOutput>;
}): Promise<AgentRuntimeResult<TPayload, TOutput>> {
  const events: AgentRuntimeEvent[] = [];
  const record = (event: Omit<AgentRuntimeEvent, "createdAt">) => events.push({ ...event, createdAt: new Date().toISOString() });

  const profile = await loadAgentRuntimeProfile(input.runtimeInput.agentId);
  record({ state: "agent_loaded", layer: "agent", summary: `Loaded ${input.runtimeInput.agentId} AGENT.md.` });

  const skillLoad = await loadAgentRuntimeSkills(input.runtimeInput.agentId);
  record({ state: "skills_loaded", layer: "skill", summary: `Loaded ${skillLoad.skills.length} skill definitions from SKILLS.md.` });

  const memory = await retrieveAgentRuntimeMemory(input.supabase, input.runtimeInput);
  record({ state: "memory_retrieved", layer: "memory", summary: `Injected ${memory.injected.length} memory items.` });

  const contextBase = {
    input: input.runtimeInput,
    supabase: input.supabase,
    profile,
    skills: skillLoad.skills,
    memory
  };
  const selectedSkillIds = input.adapter.selectSkills({ ...contextBase, selectedSkillIds: [] });
  const context: AgentRuntimeContext<TPayload> = { ...contextBase, selectedSkillIds };

  record({ state: "workflow_started", layer: "workflow", summary: `Started ${input.adapter.workflowId} with ${selectedSkillIds.length} selected skills.` });
  const execution = await executeAgentWorkflow(input.adapter, context);
  record({ state: "harness_executed", layer: "harness", summary: `Executed ${execution.harness.length} harness tool statuses.` });

  const guardrails = input.adapter.validateOutput(execution.output, context);
  record({
    state: "output_validated",
    layer: "output",
    summary: guardrails.passed ? "Output passed runtime guardrails." : "Output requires approval before use.",
    metadata: { requiredApprovals: guardrails.requiredApprovals }
  });
  record({
    state: "output_saved",
    layer: "output",
    summary: "Prepared runtime output, task summary, and learning note for persistence."
  });

  const persistence = await saveAgentRuntimeOutput({
    supabase: input.supabase,
    runtimeInput: input.runtimeInput,
    profile,
    skills: skillLoad.skills,
    selectedSkillIds,
    events,
    harness: execution.harness,
    output: execution.output,
    guardrails,
    taskSummary: input.adapter.summarizeTask(execution.output, context),
    learningNote: input.adapter.buildLearningNote(execution.output, guardrails, context)
  });

  record({
    state: "completed",
    layer: "workflow",
    summary: persistence.runtimeRunSaved ? "Runtime execution completed and saved." : "Runtime execution completed without persistence."
  });

  return {
    input: input.runtimeInput,
    profile,
    skills: skillLoad.skills,
    selectedSkillIds,
    memory,
    events,
    harness: execution.harness,
    output: execution.output,
    guardrails,
    persistence
  };
}
