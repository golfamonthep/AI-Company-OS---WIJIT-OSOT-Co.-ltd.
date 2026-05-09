import { normalizeHarnessResult } from "@/modules/agent-runtime/harness/HarnessResultParser";
import type { HarnessModule } from "@/modules/agent-runtime/harness/types";

export const BrowserHarness: HarnessModule = {
  moduleId: "browser",
  capabilities: [{ moduleId: "browser", action: "browser_task", available: false, requiresApproval: true, description: "Stub for future Playwright or Puppeteer browser automation." }],
  execute: async (task) =>
    normalizeHarnessResult({
      taskId: `harness-${Date.now()}`,
      moduleId: "browser",
      action: task.action,
      status: "unsupported",
      error: "Browser harness is architecture-only for now.",
      attempts: 1,
      startedAt: new Date().toISOString()
    })
};
