import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { ApiHarnessInput, HarnessModule } from "@/modules/agent-runtime/harness/types";

export const APIHarness: HarnessModule<ApiHarnessInput> = {
  moduleId: "api",
  capabilities: [{ moduleId: "api", action: "api_request", available: true, requiresApproval: false, description: "Call structured HTTP APIs with retry and timeout controls." }],
  execute: async (task) => {
    const startedAt = new Date().toISOString();
    const input = task.input as ApiHarnessInput;
    const attempts = Math.max(1, (task.retries ?? 0) + 1);
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), task.timeoutMs ?? 10000);
      try {
        const response = await fetch(input.url, {
          method: input.method ?? "GET",
          headers: { "Content-Type": "application/json", ...(input.headers ?? {}) },
          body: input.body === undefined ? undefined : JSON.stringify(input.body),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const text = await response.text();
        const parsed = parseMaybeJson(text);

        if (!response.ok) {
          lastError = `API returned ${response.status}`;
          continue;
        }

        return normalizeHarnessResult({ taskId: taskId(), moduleId: "api", action: "api_request", status: "success", output: { status: response.status, body: parsed }, attempts: attempt, startedAt });
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;
      }
    }

    return normalizeHarnessResult({ taskId: taskId(), moduleId: "api", action: "api_request", status: "failed", error: lastError, attempts, startedAt });
  }
};

function parseMaybeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function taskId() {
  return `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
