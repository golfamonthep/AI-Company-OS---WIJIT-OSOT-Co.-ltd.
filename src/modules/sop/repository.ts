import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateKnowledgeDocumentInput = {
  organizationId: string;
  title: string;
  content: string;
  documentType?: "sop" | "knowledge" | "policy" | "report";
};

export async function createKnowledgeDocument(supabase: SupabaseClient, input: CreateKnowledgeDocumentInput) {
  return supabase
    .from("knowledge_documents")
    .insert({
      organization_id: input.organizationId,
      title: input.title,
      content: input.content,
      document_type: input.documentType ?? "sop"
    })
    .select()
    .single();
}

export async function listKnowledgeDocuments(supabase: SupabaseClient, organizationId: string) {
  return supabase
    .from("knowledge_documents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
}
