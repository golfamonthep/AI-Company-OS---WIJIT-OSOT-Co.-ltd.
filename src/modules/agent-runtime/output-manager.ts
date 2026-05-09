import type { SupabaseClient } from "@supabase/supabase-js";
import { saveRuntimeMemory } from "@/modules/agent-runtime/memory/MemoryWriter";
import { createMemoryItem } from "@/modules/memory/repository";
import type {
  AgentRuntimeEvent,
  AgentRuntimeGuardrailReport,
  AgentRuntimeInput,
  AgentRuntimePersistence,
  AgentRuntimeProfile,
  AgentSkillDefinition,
  HarnessToolStatus
} from "@/modules/agent-runtime/contracts";

export async function saveAgentRuntimeOutput<TPayload, TOutput>(input: {
  supabase: SupabaseClient | null;
  runtimeInput: AgentRuntimeInput<TPayload>;
  profile: AgentRuntimeProfile;
  skills: AgentSkillDefinition[];
  selectedSkillIds: string[];
  events: AgentRuntimeEvent[];
  harness: HarnessToolStatus[];
  output: TOutput;
  guardrails: AgentRuntimeGuardrailReport;
  taskSummary: string;
  learningNote: string;
}): Promise<AgentRuntimePersistence> {
  await saveRuntimeMemory({
    organizationId: input.runtimeInput.organizationId,
    agentId: input.runtimeInput.agentId,
    workflowId: input.runtimeInput.workflowId,
    taskIntent: input.runtimeInput.objective,
    outputSummary: input.taskSummary,
    learningNote: input.learningNote,
    tags: ["agent-runtime", input.runtimeInput.agentId, input.runtimeInput.workflowId]
  }).catch(() => undefined);

  if (!input.supabase) {
    return { runtimeRunSaved: false, runtimeEventsSaved: false, runtimeOutputSaved: false, learningSaved: false };
  }

  const run = await input.supabase
    .from("agent_runtime_runs")
    .insert({
      organization_id: input.runtimeInput.organizationId,
      agent_id: input.runtimeInput.agentId,
      workflow_id: input.runtimeInput.workflowId,
      objective: input.runtimeInput.objective,
      input: input.runtimeInput.payload,
      selected_skills: input.selectedSkillIds,
      harness_status: input.harness,
      guardrail_report: input.guardrails,
      output: input.output,
      status: input.guardrails.passed ? "completed" : "requires_approval"
    })
    .select()
    .single();

  if (run.error || !run.data) {
    return { runtimeRunSaved: false, runtimeEventsSaved: false, runtimeOutputSaved: false, learningSaved: false };
  }

  const runtimeRunId = run.data.id as string;
  const eventInsert = await input.supabase.from("agent_runtime_events").insert(
    input.events.map((event) => ({
      organization_id: input.runtimeInput.organizationId,
      runtime_run_id: runtimeRunId,
      agent_id: input.runtimeInput.agentId,
      layer: event.layer,
      state: event.state,
      summary: event.summary,
      metadata: event.metadata ?? {}
    }))
  );

  const outputEvent = await input.supabase.from("agent_runtime_events").insert({
    organization_id: input.runtimeInput.organizationId,
    runtime_run_id: runtimeRunId,
    agent_id: input.runtimeInput.agentId,
    layer: "output",
    state: "output_saved",
    summary: input.taskSummary,
    metadata: {
      selectedSkillIds: input.selectedSkillIds,
      loadedSkillCount: input.skills.length,
      profileLoaded: Boolean(input.profile.agentMarkdown)
    }
  });

  const learning = await createMemoryItem(input.supabase, {
    organizationId: input.runtimeInput.organizationId,
    agentId: input.runtimeInput.agentId,
    memoryType: "lesson",
    content: input.learningNote,
    importance: 6,
    tags: ["agent-runtime", input.runtimeInput.agentId, input.runtimeInput.workflowId]
  });

  return {
    runtimeRunId,
    runtimeRunSaved: true,
    runtimeEventsSaved: !eventInsert.error,
    runtimeOutputSaved: !outputEvent.error,
    learningSaved: !learning.error
  };
}
