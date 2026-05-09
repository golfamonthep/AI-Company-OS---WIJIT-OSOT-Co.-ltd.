import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConnectorAuditEvent } from "@/modules/agent-runtime/integrations/types";

const connectorAuditPath = path.join(process.cwd(), "integrations", "CONNECTOR_AUDIT_LOG.md");

export function createConnectorAuditEvent(input: Omit<ConnectorAuditEvent, "auditId" | "createdAt">): ConnectorAuditEvent {
  return {
    ...input,
    auditId: `connector-audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };
}

export async function saveConnectorAuditEvent(supabase: SupabaseClient | null, event: ConnectorAuditEvent) {
  await appendConnectorAuditFile(event).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("connector_audit_logs").insert({
    organization_id: event.organizationId,
    agent_id: event.agentId,
    connector_id: event.connectorId,
    action_id: event.actionId,
    action_type: event.actionType,
    status: event.status,
    summary: event.summary,
    metadata: event.metadata ?? {}
  });

  return { saved: !result.error };
}

async function appendConnectorAuditFile(event: ConnectorAuditEvent) {
  await mkdir(path.dirname(connectorAuditPath), { recursive: true });
  const content = [
    `## ${event.createdAt} - ${event.connectorId}:${event.actionId}`,
    "",
    `- Agent: ${event.agentId}`,
    `- Action type: ${event.actionType}`,
    `- Status: ${event.status}`,
    `- Summary: ${event.summary}`,
    ""
  ].join("\n");
  await appendFile(connectorAuditPath, `\n${content}`, "utf8");
}
