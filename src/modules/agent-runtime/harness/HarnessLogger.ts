import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { HarnessResult, HarnessTask } from "@/modules/agent-runtime/harness/types";

const harnessLogPath = path.join(process.cwd(), "artifacts", "harness", "HARNESS_EXECUTION_LOG.md");

export async function saveHarnessExecutionLog(supabase: SupabaseClient | null, task: HarnessTask, result: HarnessResult) {
  await appendHarnessFileLog(task, result).catch(() => undefined);

  if (!supabase) return { saved: false };

  const log = await supabase.from("harness_execution_logs").insert({
    organization_id: task.organizationId,
    agent_id: task.agentId,
    module_id: result.moduleId,
    action: result.action,
    status: result.status,
    input: sanitizeInput(task.input),
    output: result.output ?? {},
    error: result.error,
    attempts: result.attempts,
    metadata: result.metadata ?? {}
  });

  return { saved: !log.error };
}

async function appendHarnessFileLog(task: HarnessTask, result: HarnessResult) {
  await mkdir(path.dirname(harnessLogPath), { recursive: true });
  const content = [
    `## ${result.completedAt} - ${result.moduleId}.${result.action}`,
    "",
    `- Agent: ${task.agentId}`,
    `- Status: ${result.status}`,
    `- Attempts: ${result.attempts}`,
    result.error ? `- Error: ${result.error}` : "- Error: none",
    ""
  ].join("\n");
  await appendFile(harnessLogPath, `\n${content}`, "utf8");
}

function sanitizeInput(input: unknown) {
  if (!input || typeof input !== "object") return input;
  const copy = { ...(input as Record<string, unknown>) };
  if ("headers" in copy) copy.headers = "[redacted]";
  return copy;
}
