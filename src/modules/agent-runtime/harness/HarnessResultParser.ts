import type { HarnessAction, HarnessExecutionStatus, HarnessResult } from "@/modules/agent-runtime/harness/types";

export function normalizeHarnessResult(input: {
  taskId: string;
  moduleId: HarnessResult["moduleId"];
  action: HarnessAction;
  status: HarnessExecutionStatus;
  output?: unknown;
  error?: unknown;
  attempts: number;
  startedAt: string;
  metadata?: Record<string, unknown>;
}): HarnessResult {
  return {
    taskId: input.taskId,
    moduleId: input.moduleId,
    action: input.action,
    status: input.status,
    output: input.output,
    error: input.error instanceof Error ? input.error.message : typeof input.error === "string" ? input.error : undefined,
    attempts: input.attempts,
    startedAt: input.startedAt,
    completedAt: new Date().toISOString(),
    metadata: input.metadata
  };
}
