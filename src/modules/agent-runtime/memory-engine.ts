import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentRuntimeInput, AgentRuntimeMemoryContext } from "@/modules/agent-runtime/contracts";
import { buildInjectedMemoryContext, toAgentRuntimeMemoryContext } from "@/modules/agent-runtime/memory/ContextInjector";
import { loadFileMemoryRegistry } from "@/modules/agent-runtime/memory/MemoryLoader";
import { saveMemoryRetrievalLog } from "@/modules/agent-runtime/memory/MemoryRetrievalLogger";
import { retrieveRelevantMemory } from "@/modules/agent-runtime/memory/MemoryRetriever";
import { listImportantMemory } from "@/modules/memory/repository";
import { sampleMemories } from "@/modules/memory/sample";
import type { MemoryItem } from "@/modules/memory/types";

export async function retrieveAgentRuntimeMemory<TPayload>(
  supabase: SupabaseClient | null,
  input: AgentRuntimeInput<TPayload>
): Promise<AgentRuntimeMemoryContext> {
  const fileMemory = await retrieveFileMemory(supabase, input);
  if (fileMemory.injected.length > 0) return fileMemory;

  const memory = supabase ? await retrieveSupabaseMemory(supabase, input.organizationId) : filterSampleMemory(input);
  const agent = memory.filter((item) => item.agentId === input.agentId);
  const decisions = memory.filter((item) => item.type === "decision");
  const workflowHistory = memory.filter((item) => item.tags.includes(input.workflowId) || item.tags.includes("workflow"));
  const company = memory.filter((item) => item.agentId === "company" || !item.agentId);

  return {
    company,
    agent,
    workflowHistory,
    decisions,
    injected: rankMemory([...agent, ...decisions, ...workflowHistory, ...company]).slice(0, 10)
  };
}

async function retrieveFileMemory<TPayload>(supabase: SupabaseClient | null, input: AgentRuntimeInput<TPayload>): Promise<AgentRuntimeMemoryContext> {
  const registry = await loadFileMemoryRegistry(input.agentId);
  const query = {
    organizationId: input.organizationId,
    agentId: input.agentId,
    workflowId: input.workflowId,
    taskIntent: `${input.objective} ${JSON.stringify(input.payload)}`,
    limit: 12,
    maxCharacters: 6000
  };
  const ranked = retrieveRelevantMemory(registry, query);
  await saveMemoryRetrievalLog(supabase, query, ranked).catch(() => undefined);

  return toAgentRuntimeMemoryContext(buildInjectedMemoryContext(ranked, 6000));
}

async function retrieveSupabaseMemory(supabase: SupabaseClient, organizationId: string): Promise<MemoryItem[]> {
  const result = await listImportantMemory(supabase, organizationId);
  if (result.error || !result.data) return [];

  return result.data.map((item) => ({
    id: item.id as string,
    agentId: (item.agent_id as string | null) ?? "company",
    type: item.memory_type as MemoryItem["type"],
    content: item.content as string,
    importance: item.importance as number,
    tags: (item.tags as string[]) ?? [],
    createdAt: item.created_at as string
  }));
}

function filterSampleMemory<TPayload>(input: AgentRuntimeInput<TPayload>) {
  const searchable = JSON.stringify(input).toLowerCase();
  return sampleMemories.filter(
    (memory) => memory.tags.some((tag) => searchable.includes(tag.toLowerCase())) || memory.agentId === input.agentId || memory.agentId === "company"
  );
}

function rankMemory(memory: MemoryItem[]) {
  const seen = new Set<string>();
  return memory
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.importance - a.importance || Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
