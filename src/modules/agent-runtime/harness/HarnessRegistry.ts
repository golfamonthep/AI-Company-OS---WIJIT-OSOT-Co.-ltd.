import type { HarnessCapability, HarnessExecutionContext, HarnessModule, HarnessModuleId, HarnessResult, HarnessTask } from "@/modules/agent-runtime/harness/types";
import { APIHarness } from "@/modules/agent-runtime/harness/api/APIHarness";
import { BrowserHarness } from "@/modules/agent-runtime/harness/browser/BrowserHarness";
import { FileSystemHarness } from "@/modules/agent-runtime/harness/filesystem/FileSystemHarness";
import { MediaHarness } from "@/modules/agent-runtime/harness/media/MediaHarness";
import { NodeHarness } from "@/modules/agent-runtime/harness/node/NodeHarness";
import { PythonHarness } from "@/modules/agent-runtime/harness/python/PythonHarness";

type RegisteredHarnessModule = {
  moduleId: HarnessModuleId;
  capabilities: HarnessCapability[];
  execute: (task: HarnessTask, context: HarnessExecutionContext) => Promise<HarnessResult>;
};

export class HarnessRegistry {
  private readonly modules = new Map<HarnessModuleId, RegisteredHarnessModule>();

  register<TInput, TOutput>(module: HarnessModule<TInput, TOutput>) {
    this.modules.set(module.moduleId, module as unknown as RegisteredHarnessModule);
  }

  get(moduleId: HarnessModuleId) {
    return this.modules.get(moduleId);
  }

  list() {
    return Array.from(this.modules.values());
  }

  capabilities(): HarnessCapability[] {
    return this.list().flatMap((module) => module.capabilities);
  }
}

export function createDefaultHarnessRegistry() {
  const registry = new HarnessRegistry();
  registry.register(FileSystemHarness);
  registry.register(APIHarness);
  registry.register(PythonHarness);
  registry.register(NodeHarness);
  registry.register(BrowserHarness);
  registry.register(MediaHarness);
  return registry;
}
