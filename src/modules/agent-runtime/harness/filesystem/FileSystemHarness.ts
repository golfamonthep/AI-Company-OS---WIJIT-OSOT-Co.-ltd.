import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { FileSystemHarnessInput, HarnessModule } from "@/modules/agent-runtime/harness/types";

export const FileSystemHarness: HarnessModule<FileSystemHarnessInput> = {
  moduleId: "filesystem",
  capabilities: [
    { moduleId: "filesystem", action: "read_file", available: true, requiresApproval: false, description: "Read files from allowed workspace roots." },
    { moduleId: "filesystem", action: "write_file", available: true, requiresApproval: false, description: "Write artifacts or memory files to allowed workspace roots." },
    { moduleId: "filesystem", action: "create_folder", available: true, requiresApproval: false, description: "Create folders inside allowed workspace roots." }
  ],
  execute: async (task, context) => {
    const startedAt = new Date().toISOString();
    const input = task.input as { path: string; content?: string; encoding?: BufferEncoding; recursive?: boolean };
    const target = path.resolve(context.workspaceRoot, input.path);

    try {
      if (task.action === "read_file") {
        const content = await readFile(target, input.encoding ?? "utf8");
        return normalizeHarnessResult({ taskId: taskId(), moduleId: "filesystem", action: task.action, status: "success", output: { path: input.path, content }, attempts: 1, startedAt });
      }

      if (task.action === "write_file") {
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, input.content ?? "", input.encoding ?? "utf8");
        return normalizeHarnessResult({ taskId: taskId(), moduleId: "filesystem", action: task.action, status: "success", output: { path: input.path, bytes: Buffer.byteLength(input.content ?? "") }, attempts: 1, startedAt });
      }

      if (task.action === "create_folder") {
        await mkdir(target, { recursive: input.recursive ?? true });
        return normalizeHarnessResult({ taskId: taskId(), moduleId: "filesystem", action: task.action, status: "success", output: { path: input.path }, attempts: 1, startedAt });
      }

      return normalizeHarnessResult({ taskId: taskId(), moduleId: "filesystem", action: task.action, status: "unsupported", error: "Unsupported filesystem action.", attempts: 1, startedAt });
    } catch (error) {
      return normalizeHarnessResult({ taskId: taskId(), moduleId: "filesystem", action: task.action, status: "failed", error, attempts: 1, startedAt });
    }
  }
};

function taskId() {
  return `harness-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
