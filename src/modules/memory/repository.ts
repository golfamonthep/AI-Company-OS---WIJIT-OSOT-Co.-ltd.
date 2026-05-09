import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateMemoryInput = {
  organizationId: string;
  agentId?: string;
  memoryType: "fact" | "decision" | "preference" | "lesson" | "sop_improvement" | "report_summary";
  content: string;
  importance?: number;
  tags?: string[];
  embedding?: number[];
};

export async function createMemoryItem(supabase: SupabaseClient, input: CreateMemoryInput) {
  return supabase
    .from("memory_items")
    .insert({
      organization_id: input.organizationId,
      agent_id: input.agentId,
      memory_type: input.memoryType,
      content: input.content,
      importance: input.importance ?? 5,
      tags: input.tags ?? [],
      embedding: input.embedding
    })
    .select()
    .single();
}

export async function listImportantMemory(supabase: SupabaseClient, organizationId: string) {
  return supabase
    .from("memory_items")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("importance", 7)
    .order("importance", { ascending: false })
    .order("created_at", { ascending: false });
}
