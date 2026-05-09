import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OperationsLogEvent } from "@/modules/agent-runtime/operations/types";

const operationsLogPath = path.join(process.cwd(), "operations", "OPERATIONS_LOG.md");

export function createOperationsLogEvent(input: Omit<OperationsLogEvent, "eventId" | "createdAt">): OperationsLogEvent {
  return {
    ...input,
    eventId: `operations-event-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };
}

export async function saveOperationsLogEvent(supabase: SupabaseClient | null, event: OperationsLogEvent) {
  await appendOperationsLogFile(event).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("operations_logs").insert({
    organization_id: event.organizationId,
    run_id: event.runId,
    event_type: event.eventType,
    actor_id: event.actorId,
    summary: event.summary,
    status: event.status,
    metadata: event.metadata ?? {}
  });

  return { saved: !result.error };
}

async function appendOperationsLogFile(event: OperationsLogEvent) {
  await mkdir(path.dirname(operationsLogPath), { recursive: true });
  const content = [
    `## ${event.createdAt} - ${event.eventType}`,
    "",
    `- Actor: ${event.actorId}`,
    `- Run: ${event.runId ?? "none"}`,
    `- Status: ${event.status ?? "none"}`,
    `- Summary: ${event.summary}`,
    ""
  ].join("\n");
  await appendFile(operationsLogPath, `\n${content}`, "utf8");
}
