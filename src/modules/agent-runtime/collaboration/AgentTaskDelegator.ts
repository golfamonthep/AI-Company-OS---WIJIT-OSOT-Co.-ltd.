import type { SupabaseClient } from "@supabase/supabase-js";
import { makeEventId, saveCollaborationEvent } from "@/modules/agent-runtime/collaboration/CollaborationLogger";
import type { AgentTaskDelegation, CollaborationEvent, CollaborationMemoryReference, CollaborationTaskStatus, CompanyAgentId } from "@/modules/agent-runtime/collaboration/types";

export class AgentTaskDelegator {
  private readonly delegations: AgentTaskDelegation[] = [];
  private readonly events: CollaborationEvent[] = [];

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async delegateTask(input: {
    sessionId: string;
    organizationId: string;
    fromAgentId: CompanyAgentId;
    toAgentId: CompanyAgentId;
    title: string;
    instructions: string;
    expectedOutput: string;
    dependsOn?: string[];
    memoryReferences?: CollaborationMemoryReference[];
  }) {
    const now = new Date().toISOString();
    const delegation: AgentTaskDelegation = {
      delegationId: `delegation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sessionId: input.sessionId,
      organizationId: input.organizationId,
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      title: input.title,
      instructions: input.instructions,
      expectedOutput: input.expectedOutput,
      dependsOn: input.dependsOn,
      memoryReferences: input.memoryReferences ?? [],
      status: "assigned",
      createdAt: now,
      updatedAt: now
    };
    this.delegations.push(delegation);
    await this.record(delegation, "task_delegated", input.fromAgentId, input.toAgentId, `Delegated task: ${input.title}`);
    return delegation;
  }

  async updateStatus(delegationId: string, status: CollaborationTaskStatus, actorAgentId: CompanyAgentId, summary?: string) {
    const delegation = this.delegations.find((item) => item.delegationId === delegationId);
    if (!delegation) return undefined;
    delegation.status = status;
    delegation.updatedAt = new Date().toISOString();
    await this.record(delegation, "workflow_event", actorAgentId, delegation.fromAgentId, summary ?? `Delegation ${delegation.title} is ${status}`);
    return delegation;
  }

  listDelegations() {
    return [...this.delegations];
  }

  listEvents() {
    return [...this.events];
  }

  private async record(delegation: AgentTaskDelegation, eventType: CollaborationEvent["eventType"], actorAgentId: CompanyAgentId, targetAgentId: CompanyAgentId, summary: string) {
    const event: CollaborationEvent = {
      eventId: makeEventId(),
      sessionId: delegation.sessionId,
      organizationId: delegation.organizationId,
      eventType,
      actorAgentId,
      targetAgentId,
      summary,
      payload: { delegation },
      createdAt: new Date().toISOString()
    };
    this.events.push(event);
    await saveCollaborationEvent(this.supabase, event);
  }
}
