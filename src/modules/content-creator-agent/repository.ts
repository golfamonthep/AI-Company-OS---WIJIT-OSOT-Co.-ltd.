import type { SupabaseClient } from "@supabase/supabase-js";
import { createMemoryItem } from "@/modules/memory/repository";
import type { ContentCreatorExecutionResult } from "@/modules/content-creator-agent/contracts";

export async function saveContentCreatorExecution(supabase: SupabaseClient | null, result: ContentCreatorExecutionResult) {
  if (!supabase) {
    return { taskHistorySaved: false, learningNoteSaved: false };
  }

  const runResult = await supabase
    .from("content_creator_agent_runs")
    .insert({
      organization_id: result.input.organizationId,
      brief: result.input.brief,
      product_name: result.input.productName,
      target_audience: result.input.targetAudience,
      channel: result.input.channel ?? "tiktok",
      content_goal: result.input.contentGoal,
      selected_skills: result.selectedSkills,
      harness_status: result.harness,
      guardrail_report: result.guardrails,
      output: result.output
    })
    .select()
    .single();

  if (runResult.error || !runResult.data) {
    return { taskHistorySaved: false, learningNoteSaved: false };
  }

  const runId = runResult.data.id as string;
  const taskHistory = await supabase.from("content_creator_task_history").insert([
    {
      organization_id: result.input.organizationId,
      agent_run_id: runId,
      event_type: "content_creator_execution_completed",
      summary: `Generated ${result.output.hooks.length} hooks, ${result.output.scripts.length} scripts, and ${result.output.captions.length} captions.`,
      payload: { selectedSkills: result.selectedSkills, guardrails: result.guardrails }
    }
  ]);

  const learningText = buildLearningNote(result);
  const learning = await supabase.from("content_creator_learning_notes").insert({
    organization_id: result.input.organizationId,
    agent_run_id: runId,
    note: learningText,
    tags: ["content-creator", "execution", result.input.channel ?? "tiktok"],
    promoted_to_memory: false
  });

  await createMemoryItem(supabase, {
    organizationId: result.input.organizationId,
    agentId: "content-creator",
    memoryType: "lesson",
    content: learningText,
    importance: 6,
    tags: ["content-creator", "draft-learning", result.input.channel ?? "tiktok"]
  });

  return {
    taskHistorySaved: !taskHistory.error,
    learningNoteSaved: !learning.error
  };
}

function buildLearningNote(result: ContentCreatorExecutionResult) {
  return [
    `Content Creator generated structured output for brief: ${result.input.brief}`,
    `Selected skills: ${result.selectedSkills.join(", ")}`,
    `Guardrail passed: ${result.guardrails.passed}`,
    `Assumptions: ${result.output.assumptions.join(" | ")}`
  ].join("\n");
}
