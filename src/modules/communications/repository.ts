import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentCommunicationEnvelope, AgentRoutingDecision } from "@/modules/communications/types";

export async function createCommunicationEvent(
  supabase: SupabaseClient,
  envelope: AgentCommunicationEnvelope,
  routing?: AgentRoutingDecision
) {
  const threadId = envelope.threadId ?? (await createThreadForEnvelope(supabase, envelope));
  const messageId = await createMessageForEnvelope(supabase, envelope, threadId);

  const eventResult = await supabase
    .from("communication_events")
    .insert({
      organization_id: envelope.organizationId,
      event_type: envelope.type,
      sender_agent_id: envelope.senderAgentId,
      recipient_agent_id: envelope.recipientAgentId,
      department_id: envelope.departmentId,
      thread_id: threadId,
      message_id: messageId,
      workflow_run_id: envelope.workflowRunId,
      task_id: envelope.taskId,
      priority: envelope.priority,
      subject: envelope.subject,
      body: envelope.body,
      payload: {
        memoryReferences: envelope.memoryReferences ?? [],
        targetRole: envelope.targetRole,
        routing,
        metadata: envelope.metadata ?? {}
      }
    })
    .select()
    .single();

  if (eventResult.error || !eventResult.data) return eventResult;

  if (envelope.recipientAgentId) {
    const inboxResult = await supabase.from("agent_inbox_items").insert({
      organization_id: envelope.organizationId,
      agent_id: envelope.recipientAgentId,
      event_id: eventResult.data.id,
      thread_id: threadId,
      message_id: messageId,
      priority: routing?.notificationPriority ?? envelope.priority
    });

    if (inboxResult.error) return { data: eventResult.data, error: inboxResult.error };
  }

  return eventResult;
}

export async function listAgentInbox(supabase: SupabaseClient, agentId: string) {
  return supabase
    .from("agent_inbox_items")
    .select("*, communication_events(*)")
    .eq("agent_id", agentId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });
}

async function createThreadForEnvelope(supabase: SupabaseClient, envelope: AgentCommunicationEnvelope) {
  const result = await supabase
    .from("communication_threads")
    .insert({
      organization_id: envelope.organizationId,
      thread_type: envelope.type,
      title: envelope.subject,
      department_id: envelope.departmentId,
      workflow_run_id: envelope.workflowRunId,
      task_id: envelope.taskId,
      priority: envelope.priority,
      metadata: envelope.metadata ?? {}
    })
    .select("id")
    .single();

  if (result.error || !result.data) throw result.error ?? new Error("Unable to create communication thread");

  await createParticipants(supabase, envelope, result.data.id as string);

  return result.data.id as string;
}

async function createMessageForEnvelope(supabase: SupabaseClient, envelope: AgentCommunicationEnvelope, threadId: string) {
  if (!envelope.senderAgentId) return undefined;

  const result = await supabase
    .from("agent_messages")
    .insert({
      organization_id: envelope.organizationId,
      thread_id: threadId,
      sender_agent_id: envelope.senderAgentId,
      recipient_agent_id: envelope.recipientAgentId,
      message_type: envelope.type,
      subject: envelope.subject,
      body: envelope.body,
      priority: envelope.priority,
      metadata: {
        memoryReferences: envelope.memoryReferences ?? [],
        targetRole: envelope.targetRole,
        ...envelope.metadata
      }
    })
    .select("id")
    .single();

  if (result.error || !result.data) throw result.error ?? new Error("Unable to create agent message");

  return result.data.id as string;
}

async function createParticipants(supabase: SupabaseClient, envelope: AgentCommunicationEnvelope, threadId: string) {
  const agentIds = [envelope.senderAgentId, envelope.recipientAgentId].filter(Boolean) as string[];
  if (!agentIds.length) return;

  const { error } = await supabase.from("communication_participants").upsert(
    agentIds.map((agentId) => ({
      organization_id: envelope.organizationId,
      thread_id: threadId,
      agent_id: agentId,
      participant_role: agentId === envelope.senderAgentId ? "sender" : "recipient"
    })),
    { onConflict: "thread_id,agent_id,user_id" }
  );

  if (error) throw error;
}
