import path from "node:path";
import type { HarnessPermission, HarnessTask } from "@/modules/agent-runtime/harness/types";

const writableRoots = ["artifacts", "memory"];
const readableRoots = ["artifacts", "memory", "company-os", "docs"];

export function evaluateHarnessPermission(task: HarnessTask, workspaceRoot = process.cwd()): HarnessPermission {
  if (task.requiresApproval && !task.approved) {
    return { allowed: false, reason: "Harness task requires approval." };
  }

  if (task.moduleId === "browser" || task.moduleId === "media") {
    return { allowed: false, reason: "Harness module is a stub and not executable yet." };
  }

  if (task.moduleId === "python" || task.moduleId === "node") {
    return task.approved ? { allowed: true, reason: "Runtime execution approved." } : { allowed: false, reason: "Runtime execution requires explicit approval." };
  }

  if (task.moduleId === "filesystem") {
    const maybePath = (task.input as { path?: string }).path;
    if (!maybePath) return { allowed: false, reason: "Filesystem harness requires a path." };

    const resolved = path.resolve(workspaceRoot, maybePath);
    const roots = task.action === "read_file" ? readableRoots : writableRoots;
    const allowed = roots.some((root) => resolved.startsWith(path.resolve(workspaceRoot, root)));
    return allowed ? { allowed: true, reason: "Path is inside an allowed harness root." } : { allowed: false, reason: "Path is outside allowed harness roots." };
  }

  if (task.moduleId === "api") {
    return { allowed: true, reason: "API harness allowed with retry and timeout controls." };
  }

  return { allowed: false, reason: "Unknown harness permission boundary." };
}
