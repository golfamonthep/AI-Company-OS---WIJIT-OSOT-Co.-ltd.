import type { SupabaseClient } from "@supabase/supabase-js";
import { createDefaultHarnessRegistry } from "@/modules/agent-runtime/harness/HarnessRegistry";
import { saveHarnessExecutionLog } from "@/modules/agent-runtime/harness/HarnessLogger";
import { evaluateHarnessPermission } from "@/modules/agent-runtime/harness/HarnessPermissionManager";
import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { HarnessResult, HarnessTask } from "@/modules/agent-runtime/harness/types";

export async function executeHarnessTask(task: HarnessTask, supabase: SupabaseClient | null = null): Promise<HarnessResult> {
  const startedAt = new Date().toISOString();
  const registry = createDefaultHarnessRegistry();
  const harnessModule = registry.get(task.moduleId);

  if (!harnessModule) {
    const result = normalizeHarnessResult({
      taskId: taskId(),
      moduleId: task.moduleId,
      action: task.action,
      status: "unsupported",
      error: `Harness module ${task.moduleId} is not registered.`,
      attempts: 0,
      startedAt
    });
    await saveHarnessExecutionLog(supabase, task, result);
    return result;
  }

  const permission = evaluateHarnessPermission(task);
  if (!permission.allowed) {
    const result = normalizeHarnessResult({
      taskId: taskId(),
      moduleId: task.moduleId,
      action: task.action,
      status: "denied",
      error: permission.reason,
      attempts: 0,
      startedAt
    });
    await saveHarnessExecutionLog(supabase, task, result);
    return result;
  }

  const attempts = Math.max(1, (task.retries ?? 0) + 1);
  let result: HarnessResult | undefined;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    result = await harnessModule.execute(task, { supabase, workspaceRoot: process.cwd() });
    result = { ...result, attempts: attempt };
    if (result.status === "success" || result.status === "unsupported" || result.status === "denied") break;
  }

  const finalResult =
    result ??
    normalizeHarnessResult({
      taskId: taskId(),
      moduleId: task.moduleId,
      action: task.action,
      status: "failed",
      error: "Harness execution failed without a result.",
      attempts,
      startedAt
    });

  await saveHarnessExecutionLog(supabase, task, finalResult);
  return finalResult;
}

function taskId() {
  return `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
