import type { SupabaseClient } from "@supabase/supabase-js";
import { ConnectorRegistry } from "@/modules/agent-runtime/integrations/ConnectorRegistry";
import { ConnectorPermissionManager } from "@/modules/agent-runtime/integrations/ConnectorPermissionManager";
import { ConnectorErrorHandler } from "@/modules/agent-runtime/integrations/ConnectorErrorHandler";
import { RateLimitManager } from "@/modules/agent-runtime/integrations/RateLimitManager";
import { createConnectorAuditEvent, saveConnectorAuditEvent } from "@/modules/agent-runtime/integrations/ConnectorAuditLogger";
import type { ConnectorExecutionResult, ConnectorExecutionTask } from "@/modules/agent-runtime/integrations/types";

export class ConnectorExecutor {
  private readonly registry = new ConnectorRegistry();
  private readonly permissions = new ConnectorPermissionManager(this.registry);
  private readonly rateLimits = new RateLimitManager();
  private readonly errors = new ConnectorErrorHandler();

  constructor(private readonly supabase: SupabaseClient | null = null) {}

  async execute<TOutput extends Record<string, unknown> = Record<string, unknown>>(task: ConnectorExecutionTask): Promise<ConnectorExecutionResult<TOutput>> {
    const startedAt = new Date().toISOString();
    const action = this.registry.findAction(task.connectorId, task.actionId);

    if (!action) {
      const result = this.errors.unsupported(task, "Connector action is not registered.") as ConnectorExecutionResult<TOutput>;
      await this.audit(task, result, "Connector action is not registered.");
      return result;
    }

    const rate = this.rateLimits.check({ connectorId: task.connectorId, actionId: task.actionId });
    if (!rate.allowed) {
      const result = this.errors.rateLimited(task, `Rate limit exceeded. Reset at ${rate.state.resetAt}.`) as ConnectorExecutionResult<TOutput>;
      await this.audit(task, result, result.auditSummary);
      return result;
    }

    const permission = this.permissions.validate(task);
    if (!permission.allowed) {
      const result = permission.status === "requires_approval" ? this.errors.requiresApproval(task, permission.reason) : this.errors.denied(task, permission.reason);
      await this.audit(task, result, permission.reason);
      return result as ConnectorExecutionResult<TOutput>;
    }

    const output = this.mockExecute(task);
    const completedAt = new Date().toISOString();
    const result: ConnectorExecutionResult<TOutput> = {
      executionId: `connector-execution-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      organizationId: task.organizationId,
      agentId: task.agentId,
      connectorId: task.connectorId,
      actionId: task.actionId,
      status: "success",
      output: output as unknown as TOutput,
      auditSummary: `Stub connector action completed: ${task.connectorId}:${task.actionId}`,
      startedAt,
      completedAt,
      metadata: {
        ...task.metadata,
        stubOnly: true,
        noExternalAccountTouched: true,
        permission
      }
    };

    await this.audit(task, result, result.auditSummary);
    await this.saveExecution(result);
    return result;
  }

  private mockExecute(task: ConnectorExecutionTask) {
    if (task.connectorId === "google-docs" && task.actionId === "docs.create_draft") {
      return {
        draftId: `mock-google-doc-${Date.now()}`,
        title: String(task.input.title ?? "Untitled campaign draft"),
        url: "mock://google-docs/draft",
        status: "draft_created",
        externalWrite: false,
        contentPreview: String(task.input.content ?? "").slice(0, 500)
      };
    }

    return {
      status: "stub_completed",
      connectorId: task.connectorId,
      actionId: task.actionId,
      externalWrite: false,
      inputEcho: task.input
    };
  }

  private async audit(task: ConnectorExecutionTask, result: ConnectorExecutionResult, summary: string) {
    const action = this.registry.findAction(task.connectorId, task.actionId);
    await saveConnectorAuditEvent(
      this.supabase,
      createConnectorAuditEvent({
        organizationId: task.organizationId,
        agentId: task.agentId,
        connectorId: task.connectorId,
        actionId: task.actionId,
        actionType: action?.type ?? task.actionType,
        status: result.status,
        summary,
        metadata: { task: { ...task, input: redactLargeInput(task.input) }, result }
      })
    );
  }

  private async saveExecution(result: ConnectorExecutionResult) {
    if (!this.supabase) return { saved: false };

    const saved = await this.supabase.from("connector_execution_logs").insert({
      organization_id: result.organizationId,
      agent_id: result.agentId,
      connector_id: result.connectorId,
      action_id: result.actionId,
      status: result.status,
      output: result.output ?? {},
      error: result.error,
      metadata: result.metadata ?? {}
    });

    return { saved: !saved.error };
  }
}

function redactLargeInput(input: unknown) {
  const value = JSON.stringify(input ?? {});
  return value.length > 1000 ? `${value.slice(0, 1000)}...` : input;
}
