import type { SupabaseClient } from "@supabase/supabase-js";
import { makeEventId, saveCollaborationEvent } from "@/modules/agent-runtime/collaboration/CollaborationLogger";
import type { CollaborationEscalation, CollaborationEvent, CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export class EscalationManager {
  private readonly escalations: CollaborationEscalation[] = [];
  private readonly events: CollaborationEvent[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async escalate(input: {
    sessionId: string;
    organizationId: string;
    fromAgentId: CompanyAgentId;
    toAgentId?: CompanyAgentId;
    severity: CollaborationEscalation["severity"];
    issue: string;
    recommendedAction: string;
  }) {
    const escalation: CollaborationEscalation = {
      escalationId: `escalation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId ?? "ceo",
      severity: input.severity,
      issue: input.issue,
      recommendedAction: input.recommendedAction,
      status: "open",
      createdAt: new Date().toISOString()
    };
    this.escalations.push(escalation);

    const event: CollaborationEvent = {
      eventId: makeEventId(),
      sessionId: escalation.sessionId,
      organizationId: escalation.organizationId,
      eventType: "escalation",
      actorAgentId: escalation.fromAgentId,
      targetAgentId: escalation.toAgentId,
      summary: `${escalation.severity} escalation: ${escalation.issue}`,
      payload: { escalation },
      createdAt: escalation.createdAt
    };
    this.events.push(event);
    await saveCollaborationEvent(this.supabase, event);
    return escalation;
  }

  listEscalations() {
    return [...this.escalations];
  }

  listEvents() {
    return [...this.events];
  }
}
