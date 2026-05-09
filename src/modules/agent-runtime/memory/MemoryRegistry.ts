import type { RuntimeMemoryRecord, RuntimeMemorySource } from "@/modules/agent-runtime/memory/types";

export class MemoryRegistry {
  private readonly sources = new Map<string, RuntimeMemorySource>();
  private readonly records = new Map<string, RuntimeMemoryRecord>();

  registerSource(source: RuntimeMemorySource) {
    this.sources.set(source.id, source);
  }

  registerRecords(records: RuntimeMemoryRecord[]) {
    records.forEach((record) => this.records.set(record.id, record));
  }

  listSources() {
    return Array.from(this.sources.values());
  }

  listRecords() {
    return Array.from(this.records.values());
  }

  byCategory(category: RuntimeMemorySource["category"]) {
    return this.listRecords().filter((record) => record.category === category);
  }

  byAgent(agentId: string) {
    return this.listRecords().filter((record) => record.agentId === agentId);
  }
}
