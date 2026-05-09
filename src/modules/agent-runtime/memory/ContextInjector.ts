import type { AgentRuntimeMemoryContext } from "@/modules/agent-runtime/contracts";
import type { MemoryItem } from "@/modules/memory/types";
import type { InjectedMemoryContext, RankedMemoryRecord } from "@/modules/agent-runtime/memory/types";

export function buildInjectedMemoryContext(records: RankedMemoryRecord[], maxCharacters = 6000): InjectedMemoryContext {
  const selected: RankedMemoryRecord[] = [];
  let used = 0;

  for (const record of records) {
    const size = record.content.length;
    if (used + size > maxCharacters && selected.length > 0) continue;
    selected.push(record);
    used += size;
  }

  const memoryItems = selected.map(toMemoryItem);

  return {
    company: memoryItems.filter((item) => selected.find((record) => record.id === item.id)?.category === "company"),
    agent: memoryItems.filter((item) => selected.find((record) => record.id === item.id)?.category === "agent"),
    workflowHistory: memoryItems.filter((item) => selected.find((record) => record.id === item.id)?.category === "workflow"),
    decisions: memoryItems.filter((item) => selected.find((record) => record.id === item.id)?.category === "decision_log"),
    taskHistory: memoryItems.filter((item) => selected.find((record) => record.id === item.id)?.category === "task_history"),
    injected: memoryItems,
    ranked: selected,
    summary: selected.map((record) => `[${record.category}] ${record.title}: ${record.content.slice(0, 240)}`).join("\n")
  };
}

export function toAgentRuntimeMemoryContext(context: InjectedMemoryContext): AgentRuntimeMemoryContext {
  return {
    company: context.company,
    agent: context.agent,
    workflowHistory: context.workflowHistory,
    decisions: context.decisions,
    injected: context.injected
  };
}

function toMemoryItem(record: RankedMemoryRecord): MemoryItem {
  return {
    id: record.id,
    agentId: record.agentId ?? (record.category === "company" ? "company" : record.category),
    type: record.category === "decision_log" ? "decision" : record.category === "task_history" || record.category === "workflow" ? "report_summary" : "lesson",
    content: record.content,
    importance: record.importance,
    tags: record.tags,
    createdAt: record.createdAt
  };
}
