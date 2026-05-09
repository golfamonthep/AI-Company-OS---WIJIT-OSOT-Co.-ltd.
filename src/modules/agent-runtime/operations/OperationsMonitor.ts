import type { OperationSignal, OperationsSnapshot } from "@/modules/agent-runtime/operations/types";

export class OperationsMonitor {
  buildSnapshot(input: Partial<OperationsSnapshot> & { organizationId: string }): OperationsSnapshot {
    return {
      organizationId: input.organizationId,
      tasks: input.tasks ?? { backlog: 0, overdue: 0, blocked: 0 },
      workflows: input.workflows ?? { running: 0, failed: 0, waitingApproval: 0, completedThisWeek: 0 },
      kpis: input.kpis ?? [],
      agents: input.agents ?? [],
      memory: input.memory ?? { staleItems: 0, lowQualityItems: 0 },
      createdAt: input.createdAt ?? new Date().toISOString()
    };
  }

  detectSignals(snapshot: OperationsSnapshot): OperationSignal[] {
    const signals: OperationSignal[] = [];

    if (snapshot.tasks.overdue > 0) {
      signals.push(createSignal(snapshot.organizationId, "task", "overdue_tasks", snapshot.tasks.overdue, 0, "medium", `${snapshot.tasks.overdue} overdue tasks detected.`));
    }

    if (snapshot.workflows.failed > 0) {
      signals.push(createSignal(snapshot.organizationId, "workflow", "failed_workflows", snapshot.workflows.failed, 0, "high", `${snapshot.workflows.failed} failed workflows detected.`));
    }

    for (const kpi of snapshot.kpis) {
      if (kpi.current < kpi.target && kpi.direction === "down") {
        signals.push(createSignal(snapshot.organizationId, "kpi", `${kpi.name}_drop`, kpi.current, kpi.target, "high", `${kpi.name} dropped below target.`));
      }
    }

    for (const agent of snapshot.agents) {
      if (agent.blockedTasks > 0 || agent.performanceScore < 0.6) {
        signals.push(createSignal(snapshot.organizationId, "agent", `${agent.agentId}_attention_needed`, agent.performanceScore, 0.6, "medium", `${agent.agentId} needs operational attention.`));
      }
    }

    if (snapshot.memory.lowQualityItems > 0) {
      signals.push(createSignal(snapshot.organizationId, "memory", "memory_quality", snapshot.memory.lowQualityItems, 0, "low", "Low-quality memory items detected for review."));
    }

    return signals;
  }
}

function createSignal(
  organizationId: string,
  source: OperationSignal["source"],
  name: string,
  value: OperationSignal["value"],
  threshold: OperationSignal["threshold"],
  severity: OperationSignal["severity"],
  summary: string
): OperationSignal {
  return {
    signalId: `operation-signal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    organizationId,
    source,
    name,
    value,
    threshold,
    severity,
    summary,
    createdAt: new Date().toISOString()
  };
}
