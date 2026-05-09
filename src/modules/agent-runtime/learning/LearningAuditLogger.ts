import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningAuditEvent } from "@/modules/agent-runtime/learning/types";

const learningAuditLogPath = path.join(process.cwd(), "learning", "LEARNING_AUDIT_LOG.md");

export function createLearningAuditEvent(input: Omit<LearningAuditEvent, "auditId" | "createdAt">): LearningAuditEvent {
  return {
    ...input,
    auditId: `learning-audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString()
  };
}

export async function saveLearningAuditEvent(supabase: SupabaseClient | null, event: LearningAuditEvent) {
  await appendLearningAuditFile(event).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("learning_audit_logs").insert({
    organization_id: event.organizationId,
    actor_id: event.actorId,
    event_type: event.eventType,
    summary: event.summary,
    source_type: event.sourceType,
    proposal_id: event.proposalId,
    target_id: event.targetId,
    status: event.status,
    metadata: event.metadata ?? {}
  });

  return { saved: !result.error };
}

async function appendLearningAuditFile(event: LearningAuditEvent) {
  await mkdir(path.dirname(learningAuditLogPath), { recursive: true });
  const content = [
    `## ${event.createdAt} - ${event.eventType}`,
    "",
    `- Actor: ${event.actorId}`,
    `- Summary: ${event.summary}`,
    `- Source: ${event.sourceType ?? "none"}`,
    `- Proposal: ${event.proposalId ?? "none"}`,
    `- Target: ${event.targetId ?? "none"}`,
    `- Status: ${event.status ?? "none"}`,
    ""
  ].join("\n");
  await appendFile(learningAuditLogPath, `\n${content}`, "utf8");
}
