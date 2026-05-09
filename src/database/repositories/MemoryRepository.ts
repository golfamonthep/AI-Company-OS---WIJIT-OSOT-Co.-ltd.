import { PersistenceService } from "@/database/PersistenceService";
import type { MemoryRecord } from "@/database/types";

export class MemoryRepository {
  constructor(private readonly persistence = new PersistenceService()) {}

  saveCompanyMemory(memory: MemoryRecord) {
    return this.persistence.create("company_memory", {
      organization_id: memory.organization_id,
      workspace_id: memory.workspace_id,
      title: memory.title,
      memory_type: memory.memory_type ?? "company",
      content: memory.content ?? memory.title,
      source_type: memory.source_type ?? "api",
      source_id: memory.source_id,
      semantic_tags: memory.semantic_tags ?? [],
      importance: memory.importance ?? 5,
      relevance_score: memory.relevance_score,
      embedding_model: memory.embedding_model,
      metadata: memory.metadata ?? {}
    } as MemoryRecord & Record<string, unknown>);
  }

  saveAgentMemory(memory: MemoryRecord) {
    return this.persistence.create("agent_memory", {
      organization_id: memory.organization_id,
      workspace_id: memory.workspace_id,
      agent_key: memory.agent_key ?? "unknown-agent",
      title: memory.title,
      memory_type: memory.memory_type ?? "agent",
      content: memory.content ?? memory.title,
      source_type: memory.source_type ?? "api",
      source_id: memory.source_id,
      semantic_tags: memory.semantic_tags ?? [],
      importance: memory.importance ?? 5,
      relevance_score: memory.relevance_score,
      embedding_model: memory.embedding_model,
      metadata: memory.metadata ?? {}
    } as MemoryRecord & Record<string, unknown>);
  }

  saveTaskHistory(memory: MemoryRecord) {
    return this.persistence.create("task_history", {
      organization_id: memory.organization_id,
      workspace_id: memory.workspace_id,
      agent_key: memory.agent_key,
      workflow_id: memory.workflow_id,
      title: memory.title,
      task_intent: memory.task_intent ?? memory.title,
      input: memory.input ?? {},
      output: memory.output ?? {},
      result_summary: memory.result_summary ?? memory.content,
      status: memory.metadata?.status ?? "completed",
      feedback: memory.metadata?.feedback ?? {},
      semantic_tags: memory.semantic_tags ?? [],
      source_type: memory.source_type ?? "api",
      source_id: memory.source_id,
      embedding_model: memory.embedding_model,
      metadata: memory.metadata ?? {}
    } as MemoryRecord & Record<string, unknown>);
  }

  saveDecision(memory: MemoryRecord) {
    return this.persistence.create("decision_logs", {
      organization_id: memory.organization_id,
      workspace_id: memory.workspace_id,
      owner_agent_key: memory.agent_key,
      workflow_id: memory.workflow_id,
      title: memory.title,
      decision: memory.decision ?? memory.title,
      reasoning: memory.reasoning ?? "",
      impact: memory.metadata?.impact ?? "",
      status: memory.metadata?.status ?? "active",
      source_type: memory.source_type ?? "api",
      source_id: memory.source_id,
      semantic_tags: memory.semantic_tags ?? [],
      metadata: memory.metadata ?? {}
    } as MemoryRecord & Record<string, unknown>);
  }

  listCompanyMemory(organizationId: string) {
    return this.persistence.list<MemoryRecord & Record<string, unknown>>("company_memory", organizationId);
  }

  listAgentMemory(organizationId: string) {
    return this.persistence.list<MemoryRecord & Record<string, unknown>>("agent_memory", organizationId);
  }

  listTaskHistory(organizationId: string) {
    return this.persistence.list<MemoryRecord & Record<string, unknown>>("task_history", organizationId);
  }

  listDecisions(organizationId: string) {
    return this.persistence.list<MemoryRecord & Record<string, unknown>>("decision_logs", organizationId);
  }
}
