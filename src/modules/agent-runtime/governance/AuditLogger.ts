import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GovernanceAuditEvent } from "@/modules/agent-runtime/governance/types";

const auditLogPath = path.join(process.cwd(), "governance", "AUDIT_LOG.md");

export async function saveAuditEvent(supabase: SupabaseClient | null, event: GovernanceAuditEvent) {
  await appendAuditFile(event).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("governance_audit_logs").insert({
    organization_id: event.organizationId,
    actor_agent_id: event.actorAgentId,
    event_type: event.eventType,
    severity: event.severity,
    summary: event.summary,
    decision: event.decision,
    related_workflow_id: event.relatedWorkflowId,
    related_task_id: event.relatedTaskId,
    metadata: event.metadata ?? {}
  });

  return { saved: !result.error };
}

export function createAuditEvent(input: Omit<GovernanceAuditEvent, "auditId" | "createdAt">): GovernanceAuditEvent {
  return {
    ...input,
    auditId: `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };
}

async function appendAuditFile(event: GovernanceAuditEvent) {
  await mkdir(path.dirname(auditLogPath), { recursive: true });
  const content = [
    `## ${event.createdAt} - ${event.eventType}`,
    "",
    `- Actor: ${event.actorAgentId ?? "system"}`,
    `- Severity: ${event.severity}`,
    `- Decision: ${event.decision ?? "none"}`,
    `- Summary: ${event.summary}`,
    event.relatedWorkflowId ? `- Workflow: ${event.relatedWorkflowId}` : "- Workflow: none",
    ""
  ].join("\n");
  await appendFile(auditLogPath, `\n${content}`, "utf8");
}
