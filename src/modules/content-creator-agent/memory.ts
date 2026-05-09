import type { SupabaseClient } from "@supabase/supabase-js";
import { sampleMemories } from "@/modules/memory/sample";
import { listImportantMemory } from "@/modules/memory/repository";
import type { ContentCreatorExecutionInput } from "@/modules/content-creator-agent/contracts";
import type { MemoryItem } from "@/modules/memory/types";

export async function retrieveContentCreatorMemory(supabase: SupabaseClient | null, input: ContentCreatorExecutionInput): Promise<MemoryItem[]> {
  if (!supabase) return filterSampleMemory(input);

  const result = await listImportantMemory(supabase, input.organizationId);
  if (result.error || !result.data) return filterSampleMemory(input);

  return result.data.slice(0, 8).map((item) => ({
    id: item.id as string,
    agentId: (item.agent_id as string | null) ?? "company",
    type: item.memory_type as MemoryItem["type"],
    content: item.content as string,
    importance: item.importance as number,
    tags: (item.tags as string[]) ?? [],
    createdAt: item.created_at as string
  }));
}

function filterSampleMemory(input: ContentCreatorExecutionInput) {
  const lower = `${input.brief} ${input.productName ?? ""} ${input.targetAudience ?? ""}`.toLowerCase();
  return sampleMemories.filter((memory) => memory.tags.some((tag) => lower.includes(tag)) || memory.tags.includes("thai"));
}
