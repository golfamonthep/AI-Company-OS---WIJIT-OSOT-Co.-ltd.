import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { HarnessModule } from "@/modules/agent-runtime/harness/types";

export const MediaHarness: HarnessModule = {
  moduleId: "media",
  capabilities: [{ moduleId: "media", action: "media_task", available: false, requiresApproval: true, description: "Stub for future image, video, and audio processing." }],
  execute: async (task) =>
    normalizeHarnessResult({
      taskId: `harness-${Date.now()}`,
      moduleId: "media",
      action: task.action,
      status: "unsupported",
      error: "Media harness is architecture-only for now.",
      attempts: 1,
      startedAt: new Date().toISOString()
    })
};
