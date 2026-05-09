import type { SupabaseClient } from "@supabase/supabase-js";
import { makeEventId, saveCollaborationEvent } from "@/modules/agent-runtime/collaboration/CollaborationLogger";
import type { AgentMessage, CollaborationEvent, CollaborationMemoryReference, CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export class AgentCommunicationBus {
  private readonly messages: AgentMessage[] = [];
  private readonly events: CollaborationEvent[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async sendMessage(input: {
    sessionId: string;
    organizationId: string;
    fromAgentId: CompanyAgentId;
    toAgentId: CompanyAgentId;
    subject: string;
    body: string;
    messageType?: AgentMessage["messageType"];
    memoryReferences?: CollaborationMemoryReference[];
  }) {
    const now = new Date().toISOString();
    const message: AgentMessage = {
      messageId: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      subject: input.subject,
      body: input.body,
      messageType: input.messageType ?? "direct",
      memoryReferences: input.memoryReferences ?? [],
      createdAt: now
    };
    this.messages.push(message);

    const event: CollaborationEvent = {
      eventId: makeEventId(),
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      eventType: input.messageType === "handoff" ? "handoff" : "message",
      actorAgentId: input.fromAgentId,
      targetAgentId: input.toAgentId,
      summary: input.subject,
      payload: { message },
      createdAt: now
    };
    this.events.push(event);
    await saveCollaborationEvent(this.supabase, event);
    return message;
  }

  receiveMessages(agentId: CompanyAgentId) {
    return this.messages.filter((message) => message.toAgentId === agentId);
  }

  listMessages() {
    return [...this.messages];
  }

  listEvents() {
    return [...this.events];
  }
}
