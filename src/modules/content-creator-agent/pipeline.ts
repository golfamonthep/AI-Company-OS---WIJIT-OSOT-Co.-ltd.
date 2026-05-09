import type { SupabaseClient } from "@supabase/supabase-js";
import { executeAgentRuntime } from "@/modules/agent-runtime/runtime";
import type { ContentCreatorExecutionInput, ContentCreatorExecutionResult } from "@/modules/content-creator-agent/contracts";
import { saveContentCreatorExecution } from "@/modules/content-creator-agent/repository";
import { contentCreatorRuntimeAdapter, mapRuntimeSkillIdsToContentSkills } from "@/modules/content-creator-agent/runtime-adapter";

export async function executeContentCreatorAgent(input: ContentCreatorExecutionInput, supabase: SupabaseClient | null): Promise<ContentCreatorExecutionResult> {
  const runtime = await executeAgentRuntime({
    supabase,
    runtimeInput: {
      organizationId: input.organizationId,
      agentId: "content-creator",
      workflowId: "content_creator_execution",
      objective: input.brief,
      payload: input
    },
    adapter: contentCreatorRuntimeAdapter
  });

  const initialResult: ContentCreatorExecutionResult = {
    agent: {
      agentId: "content-creator",
      agentMarkdown: runtime.profile.agentMarkdown,
      skillsMarkdown: runtime.skills.map((skill) => skill.rawMarkdown).join("\n\n"),
      architectureMarkdown: runtime.profile.architectureMarkdown
    },
    input,
    runtimeFlow: runtime.events.map((event) => ({ state: event.state, layer: toContentCreatorFlowLayer(event.layer), summary: event.summary })),
    selectedSkills: mapRuntimeSkillIdsToContentSkills(runtime.selectedSkillIds),
    memoryContext: runtime.memory.injected,
    harness: {
      openai: runtime.harness.find((item) => item.tool === "openai")?.status === "used" ? "used" : "fallback",
      fileSystem: "used",
      memoryRetrieval: runtime.memory.injected.length ? "used" : "fallback",
      webSearch: runtime.harness.find((item) => item.tool === "web_search")?.status === "used" ? "used" : "unavailable",
      jsonParser: "used"
    },
    output: runtime.output,
    guardrails: {
      passed: runtime.guardrails.passed,
      blockedClaims: runtime.guardrails.blockedReasons,
      requiredApprovals: runtime.guardrails.requiredApprovals,
      notes: runtime.guardrails.notes
    },
    taskHistorySaved: false,
    learningNoteSaved: false,
    runtimeRunId: runtime.persistence.runtimeRunId,
    runtimeRunSaved: runtime.persistence.runtimeRunSaved,
    runtimeEventsSaved: runtime.persistence.runtimeEventsSaved,
    runtimeOutputSaved: runtime.persistence.runtimeOutputSaved
  };

  const persistence = await saveContentCreatorExecution(supabase, initialResult);

  return {
    ...initialResult,
    ...persistence
  };
}

function toContentCreatorFlowLayer(layer: string): ContentCreatorExecutionResult["runtimeFlow"][number]["layer"] {
  if (layer === "agent" || layer === "skill" || layer === "harness" || layer === "memory" || layer === "workflow") return layer;
  return "workflow";
}
