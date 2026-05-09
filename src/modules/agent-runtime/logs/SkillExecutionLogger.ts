import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillExecutionResult } from "@/modules/agent-runtime/skills/types";

export async function saveSkillExecutionLog(supabase: SupabaseClient | null, result: SkillExecutionResult) {
  if (!supabase) return { saved: false };

  const log = await supabase.from("skill_execution_logs").insert({
    organization_id: result.input.organizationId,
    agent_id: result.input.agentId,
    skill_id: result.skill.skillId,
    task_intent: result.input.taskIntent,
    input: result.input.inputs,
    output: result.output,
    validation_result: result.validation,
    harness_status: result.harness,
    errors: result.errors,
    improvement_notes: result.improvementNotes,
    workflow_id: result.input.requestedByWorkflowId
  });

  return { saved: !log.error };
}
