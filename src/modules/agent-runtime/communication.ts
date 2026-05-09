import type { SupabaseClient } from "@supabase/supabase-js";

export type AgentMessageInput = {
  organizationId: string;
  fromAgentId: string;
  toAgentId: string;
  subject: string;
  body: string;
  taskId?: string;
  runtimeRunId?: string;
};

export async function sendAgentMessage(supabase: SupabaseClient | null, input: AgentMessageInput) {
  if (!supabase) return { saved: false };

  const result = await supabase.from("agent_messages").insert({
    organization_id: input.organizationId,
    from_agent_id: input.fromAgentId,
    to_agent_id: input.toAgentId,
    subject: input.subject,
    body: input.body,
    task_id: input.taskId,
    runtime_run_id: input.runtimeRunId,
    status: "sent"
  });

  return { saved: !result.error };
}
