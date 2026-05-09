import type { MemoryRegistry } from "@/modules/agent-runtime/memory/MemoryRegistry";
import type { MemoryRetrievalQuery, RankedMemoryRecord, RuntimeMemoryRecord } from "@/modules/agent-runtime/memory/types";

export function retrieveRelevantMemory(registry: MemoryRegistry, query: MemoryRetrievalQuery): RankedMemoryRecord[] {
  const terms = tokenize(`${query.taskIntent} ${(query.tags ?? []).join(" ")} ${query.workflowId ?? ""}`);
  const limit = query.limit ?? 12;

  return registry
    .listRecords()
    .map((record) => rankRecord(record, terms, query))
    .filter((record) => record.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || b.importance - a.importance)
    .slice(0, limit);
}

function rankRecord(record: RuntimeMemoryRecord, terms: string[], query: MemoryRetrievalQuery): RankedMemoryRecord {
  const haystack = `${record.title} ${record.content} ${record.tags.join(" ")}`.toLowerCase();
  const matchReasons: string[] = [];
  let score = record.importance * 0.25;

  terms.forEach((term) => {
    if (haystack.includes(term)) {
      score += 2;
      matchReasons.push(`keyword:${term}`);
    }
  });

  if (record.agentId === query.agentId) {
    score += 2;
    matchReasons.push("agent-match");
  }

  if (record.relatedWorkflowId && record.relatedWorkflowId === query.workflowId) {
    score += 2;
    matchReasons.push("workflow-match");
  }

  if (record.category === "company") {
    score += 1;
    matchReasons.push("company-context");
  }

  return { ...record, relevanceScore: score, matchReasons };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9ก-๙]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}
