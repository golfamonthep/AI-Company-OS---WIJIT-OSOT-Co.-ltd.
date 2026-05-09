import { AuditLogRepository } from "@/database/repositories/AuditLogRepository";
import type { ApiContext } from "@/server/api/auth";

export async function auditApiAction(
  context: ApiContext,
  event: {
    eventType: string;
    summary: string;
    severity?: string;
    decision?: string;
    relatedWorkflowId?: string;
    relatedTaskId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const repo = new AuditLogRepository(context.persistence);
  return repo.save({
    organization_id: context.organizationId,
    workspace_id: context.workspaceId,
    user_id: context.userId,
    actor_agent_key: context.actorAgentId,
    event_type: event.eventType,
    action: event.eventType,
    severity: event.severity ?? "info",
    summary: event.summary,
    decision: event.decision ?? "allowed",
    related_workflow_id: event.relatedWorkflowId,
    related_task_id: event.relatedTaskId,
    metadata: event.metadata ?? {}
  });
}
