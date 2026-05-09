import type { OperationSignal, OperationTrigger, OperationsSnapshot } from "@/modules/agent-runtime/operations/types";

export class TriggerEngine {
  private readonly triggers = new Map<string, OperationTrigger>();

  register(trigger: Omit<OperationTrigger, "triggerId"> & { triggerId?: string }) {
    const registered: OperationTrigger = {
      ...trigger,
      triggerId: trigger.triggerId ?? `operation-trigger-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };
    this.triggers.set(registered.triggerId, registered);
    return registered;
  }

  evaluate(input: { snapshot: OperationsSnapshot; signals: OperationSignal[] }) {
    const activeTriggers = [...this.triggers.values()].filter((trigger) => trigger.status === "active");
    const fired: OperationTrigger[] = [];

    for (const trigger of activeTriggers) {
      if (shouldFire(trigger, input.signals)) {
        const updated = { ...trigger, lastTriggeredAt: new Date().toISOString() };
        this.triggers.set(trigger.triggerId, updated);
        fired.push(updated);
      }
    }

    return fired;
  }

  list() {
    return [...this.triggers.values()];
  }
}

function shouldFire(trigger: OperationTrigger, signals: OperationSignal[]) {
  const condition = trigger.condition.toLowerCase();
  if (condition.includes("weekly_review")) return true;
  if (condition.includes("kpi_drop")) return signals.some((signal) => signal.source === "kpi" && (signal.severity === "high" || signal.severity === "critical"));
  if (condition.includes("workflow_failed")) return signals.some((signal) => signal.source === "workflow" && signal.name.includes("failed"));
  if (condition.includes("backlog")) return signals.some((signal) => signal.source === "task");
  if (condition.includes("memory_quality")) return signals.some((signal) => signal.source === "memory");
  return false;
}
