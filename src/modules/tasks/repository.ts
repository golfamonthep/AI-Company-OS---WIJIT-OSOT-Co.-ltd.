import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateTaskInput = {
  organizationId: string;
  ownerAgentId?: string;
  createdByUserId?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
};

export async function createTask(supabase: SupabaseClient, input: CreateTaskInput) {
  return supabase
    .from("tasks")
    .insert({
      organization_id: input.organizationId,
      owner_agent_id: input.ownerAgentId,
      created_by_user_id: input.createdByUserId,
      title: input.title,
      description: input.description ?? "",
      priority: input.priority ?? "medium"
    })
    .select()
    .single();
}

export async function listOpenTasks(supabase: SupabaseClient, organizationId: string) {
  return supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("status", "done")
    .order("created_at", { ascending: false });
}
