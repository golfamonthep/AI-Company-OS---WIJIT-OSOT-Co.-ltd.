import { spawn } from "node:child_process";
import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { HarnessModule, RuntimeHarnessInput } from "@/modules/agent-runtime/harness/types";

export const PythonHarness: HarnessModule<RuntimeHarnessInput> = {
  moduleId: "python",
  capabilities: [{ moduleId: "python", action: "run_python", available: true, requiresApproval: true, description: "Run approved isolated Python snippets for future data analysis tasks." }],
  execute: async (task, context) => runRuntime("python", ["-c", (task.input as RuntimeHarnessInput).script, ...((task.input as RuntimeHarnessInput).args ?? [])], task.timeoutMs ?? 10000, context.workspaceRoot, "run_python")
};

function runRuntime(command: string, args: string[], timeoutMs: number, cwd: string, action: "run_python") {
  const startedAt = new Date().toISOString();
  const id = `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise<ReturnType<typeof normalizeHarnessResult>>((resolve) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "python", action, status: "timeout", error: "Python harness timed out.", attempts: 1, startedAt }));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "python", action, status: code === 0 ? "success" : "failed", output: { stdout, stderr, code }, error: code === 0 ? undefined : stderr, attempts: 1, startedAt }));
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "python", action, status: "failed", error, attempts: 1, startedAt }));
    });
  });
}
