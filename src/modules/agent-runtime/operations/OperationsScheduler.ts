import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduledOperation } from "@/modules/agent-runtime/operations/types";

export class OperationsScheduler {
  private readonly schedules = new Map<string, ScheduledOperation>();

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async schedule(input: Omit<ScheduledOperation, "scheduleId" | "createdAt"> & { scheduleId?: string }) {
    const operation: ScheduledOperation = {
      ...input,
      scheduleId: input.scheduleId ?? `operation-schedule-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString()
    };
    this.schedules.set(operation.scheduleId, operation);
    await this.saveSchedule(operation);
    return operation;
  }

  dueOperations(now = new Date()) {
    return [...this.schedules.values()].filter((schedule) => schedule.status === "active" && new Date(schedule.nextRunAt).getTime() <= now.getTime());
  }

  list() {
    return [...this.schedules.values()];
  }

  private async saveSchedule(schedule: ScheduledOperation) {
    if (!this.supabase) return;

    await this.supabase.from("operations_schedules").upsert(
      {
        organization_id: schedule.organizationId,
        schedule_key: schedule.scheduleId,
        name: schedule.name,
        workflow_id: schedule.workflowId,
        cadence: schedule.cadence,
        owner_agent_id: schedule.ownerAgentId,
        next_run_at: schedule.nextRunAt,
        status: schedule.status,
        low_risk: schedule.lowRisk,
        created_at: schedule.createdAt
      },
      { onConflict: "organization_id,schedule_key" }
    );
  }
}
