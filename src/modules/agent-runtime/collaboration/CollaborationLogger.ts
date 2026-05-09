import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborationEvent, CollaborationExecutionResult } from "@/modules/agent-runtime/collaboration/types";

const collaborationLogPath = path.join(process.cwd(), "memory", "workflows", "COLLABORATION_LOG.md");

export async function saveCollaborationEvent(supabase: SupabaseClient | null, event: CollaborationEvent) {
  await appendEventFileLog(event).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("agent_collaboration_events").insert({
    organization_id: event.organizationId,
    session_id: event.sessionId,
    event_type: event.eventType,
    actor_agent_id: event.actorAgentId,
    target_agent_id: event.targetAgentId,
    summary: event.summary,
    payload: event.payload
  });

  return { saved: !result.error };
}

export async function saveCollaborationSnapshot(supabase: SupabaseClient | null, result: CollaborationExecutionResult) {
  await appendSnapshotFileLog(result).catch(() => undefined);

  if (!supabase) return { saved: false };

  const session = await supabase.from("agent_collaboration_sessions").insert({
    organization_id: result.session.organizationId,
    session_key: result.session.sessionId,
    title: result.session.title,
    objective: result.session.objective,
    participating_agents: result.session.participatingAgents,
    status: result.session.status,
    context: result.session.context
  });

  return { saved: !session.error };
}

async function appendEventFileLog(event: CollaborationEvent) {
  await mkdir(path.dirname(collaborationLogPath), { recursive: true });
  const content = [`## ${event.createdAt} - ${event.eventType}`, "", `- Session: ${event.sessionId}`, `- Actor: ${event.actorAgentId}`, `- Target: ${event.targetAgentId ?? "none"}`, `- Summary: ${event.summary}`, ""].join("\n");
  await appendFile(collaborationLogPath, `\n${content}`, "utf8");
}

async function appendSnapshotFileLog(result: CollaborationExecutionResult) {
  await mkdir(path.dirname(collaborationLogPath), { recursive: true });
  const content = [
    `## ${new Date().toISOString()} - Session Snapshot`,
    "",
    `- Session: ${result.session.sessionId}`,
    `- Objective: ${result.session.objective}`,
    `- Status: ${result.session.status}`,
    `- Agents: ${result.session.participatingAgents.join(", ")}`,
    `- Messages: ${result.messages.length}`,
    `- Delegations: ${result.delegations.length}`,
    `- Approvals: ${result.approvals.length}`,
    `- Escalations: ${result.escalations.length}`,
    ""
  ].join("\n");
  await appendFile(collaborationLogPath, `\n${content}`, "utf8");
}

export function makeEventId() {
  return `collab-event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
