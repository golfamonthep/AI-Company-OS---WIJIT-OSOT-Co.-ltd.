import type { ConnectorExecutionResult, ConnectorExecutionTask } from "@/modules/agent-runtime/integrations/types";

export class ConnectorErrorHandler {
  unsupported(task: ConnectorExecutionTask, reason: string): ConnectorExecutionResult {
    return this.result(task, "unsupported", reason);
  }

  denied(task: ConnectorExecutionTask, reason: string): ConnectorExecutionResult {
    return this.result(task, "denied", reason);
  }

  requiresApproval(task: ConnectorExecutionTask, reason: string): ConnectorExecutionResult {
    return this.result(task, "requires_approval", reason);
  }

  rateLimited(task: ConnectorExecutionTask, reason: string): ConnectorExecutionResult {
    return this.result(task, "rate_limited", reason);
  }

  failed(task: ConnectorExecutionTask, reason: string): ConnectorExecutionResult {
    return this.result(task, "failed", reason);
  }

  private result(task: ConnectorExecutionTask, status: ConnectorExecutionResult["status"], error: string): ConnectorExecutionResult {
    const now = new Date().toISOString();
    return {
      executionId: `connector-execution-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: task.organizationId,
      agentId: task.agentId,
      connectorId: task.connectorId,
      actionId: task.actionId,
      status,
      error,
      auditSummary: error,
      startedAt: now,
      completedAt: now,
      metadata: task.metadata
    };
  }
}
