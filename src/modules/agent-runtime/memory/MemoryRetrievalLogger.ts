import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryRetrievalQuery, RankedMemoryRecord } from "@/modules/agent-runtime/memory/types";

const logPath = path.join(process.cwd(), "memory", "logs", "MEMORY_RETRIEVAL_LOG.md");

export async function saveMemoryRetrievalLog(supabase: SupabaseClient | null, query: MemoryRetrievalQuery, records: RankedMemoryRecord[]) {
  await appendFileLog(query, records).catch(() => undefined);

  if (!supabase) return { saved: false };

  const result = await supabase.from("memory_retrieval_logs").insert({
    organization_id: query.organizationId,
    agent_id: query.agentId,
    workflow_id: query.workflowId,
    task_intent: query.taskIntent,
    retrieved_memory_ids: records.map((record) => record.id),
    retrieved_sources: records.map((record) => record.sourceId),
    ranking_summary: records.map((record) => ({
      id: record.id,
      title: record.title,
      category: record.category,
      relevanceScore: record.relevanceScore,
      matchReasons: record.matchReasons
    }))
  });

  return { saved: !result.error };
}

async function appendFileLog(query: MemoryRetrievalQuery, records: RankedMemoryRecord[]) {
  await mkdir(path.dirname(logPath), { recursive: true });
  const now = new Date().toISOString();
  const content = [
    `## ${now} - ${query.agentId}`,
    "",
    `- Workflow: ${query.workflowId ?? "none"}`,
    `- Task: ${query.taskIntent.slice(0, 240)}`,
    `- Retrieved: ${records.length}`,
    ...records.slice(0, 8).map((record) => `- ${record.category}: ${record.title} (${record.relevanceScore.toFixed(2)})`),
    ""
  ].join("\n");
  await appendFile(logPath, `\n${content}`, "utf8");
}
