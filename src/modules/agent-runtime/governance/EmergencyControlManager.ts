import type { SupabaseClient } from "@supabase/supabase-js";
import { createAuditEvent, saveAuditEvent } from "@/modules/agent-runtime/governance/AuditLogger";
import type { CompanyAgentId, EmergencyControlState } from "@/modules/agent-runtime/governance/types";

export class EmergencyControlManager {
  private readonly states = new Map<string, EmergencyControlState>();

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async emergencyStop(input: { organizationId: string; actorAgentId: CompanyAgentId | "human"; reason: string; workflows?: string[]; agents?: CompanyAgentId[] }) {
    const state: EmergencyControlState = {
      organizationId: input.organizationId,
      pausedAgents: input.agents ?? [],
      pausedWorkflows: input.workflows ?? [],
      dangerousExecutionDisabled: true,
      reason: input.reason,
      updatedAt: new Date().toISOString()
    };
    this.states.set(input.organizationId, state);
    await this.saveState(state);
    await saveAuditEvent(this.supabase, createAuditEvent({ organizationId: input.organizationId, actorAgentId: input.actorAgentId === "human" ? undefined : input.actorAgentId, eventType: "emergency_stop", severity: "critical", summary: input.reason, decision: "emergency_stopped", metadata: { state } }));
    return state;
  }

  async resume(input: { organizationId: string; actorAgentId: CompanyAgentId | "human"; reason: string }) {
    const state: EmergencyControlState = {
      organizationId: input.organizationId,
      pausedAgents: [],
      pausedWorkflows: [],
      dangerousExecutionDisabled: false,
      reason: input.reason,
      updatedAt: new Date().toISOString()
    };
    this.states.set(input.organizationId, state);
    await this.saveState(state);
    await saveAuditEvent(this.supabase, createAuditEvent({ organizationId: input.organizationId, actorAgentId: input.actorAgentId === "human" ? undefined : input.actorAgentId, eventType: "emergency_resume", severity: "high", summary: input.reason, decision: "allowed", metadata: { state } }));
    return state;
  }

  isWorkflowPaused(organizationId: string, workflowId: string) {
    const state = this.states.get(organizationId);
    return Boolean(state?.dangerousExecutionDisabled || state?.pausedWorkflows.includes(workflowId));
  }

  getState(organizationId: string) {
    return this.states.get(organizationId);
  }

  private async saveState(state: EmergencyControlState) {
    if (!this.supabase) return;

    await this.supabase.from("governance_emergency_controls").upsert(
      {
        organization_id: state.organizationId,
        control_key: "default",
        paused_agents: state.pausedAgents,
        paused_workflows: state.pausedWorkflows,
        dangerous_execution_disabled: state.dangerousExecutionDisabled,
        reason: state.reason,
        updated_at: state.updatedAt
      },
      { onConflict: "organization_id,control_key" }
    );
  }
}
