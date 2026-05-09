import { spawn } from "node:child_process";
import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { HarnessModule, RuntimeHarnessInput } from "@/modules/agent-runtime/harness/types";

export const NodeHarness: HarnessModule<RuntimeHarnessInput> = {
  moduleId: "node",
  capabilities: [{ moduleId: "node", action: "run_node", available: true, requiresApproval: true, description: "Run approved Node.js snippets for utility tooling." }],
  execute: async (task, context) => runRuntime("node", ["-e", (task.input as RuntimeHarnessInput).script, ...((task.input as RuntimeHarnessInput).args ?? [])], task.timeoutMs ?? 10000, context.workspaceRoot, "run_node")
};

function runRuntime(command: string, args: string[], timeoutMs: number, cwd: string, action: "run_node") {
  const startedAt = new Date().toISOString();
  const id = `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise<ReturnType<typeof normalizeHarnessResult>>((resolve) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "node", action, status: "timeout", error: "Node harness timed out.", attempts: 1, startedAt }));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "node", action, status: code === 0 ? "success" : "failed", output: { stdout, stderr, code }, error: code === 0 ? undefined : stderr, attempts: 1, startedAt }));
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve(normalizeHarnessResult({ taskId: id, moduleId: "node", action, status: "failed", error, attempts: 1, startedAt }));
    });
  });
}
