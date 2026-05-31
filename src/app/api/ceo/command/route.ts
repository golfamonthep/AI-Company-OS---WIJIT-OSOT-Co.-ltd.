import { NextResponse } from "next/server";
import { z } from "zod";
import { createCEOBrainPlanWithOpenAI } from "@/lib/ai/openai-provider";
import { createSupabasePersistenceStore } from "@/lib/persistence/supabase-store";
import { CEOCommandService } from "@/modules/orchestration/ceo-command-service";

const commandSchema = z.object({
  command: z.string().min(1),
  organizationId: z.string().optional(),
  workspaceId: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = commandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }

  const persistenceStore = createSupabasePersistenceStore();
  const service = new CEOCommandService({
    generateCEOBrainPlan: createCEOBrainPlanWithOpenAI,
    savePlan: persistenceStore.saveCEOPlan,
    saveMemoryCandidate: async (candidate) => {
      await persistenceStore.saveMemoryItem({
        id: candidate.id,
        organizationId: parsed.data.organizationId,
        workspaceId: parsed.data.workspaceId,
        userId: parsed.data.userId,
        title: candidate.title,
        content: candidate.content,
        scope: candidate.scope,
        sourceType: candidate.sourceType,
        status: candidate.status,
        importance: candidate.importance,
        tags: candidate.tags,
        relatedCommandId: candidate.relatedCommandId,
        relatedWorkflowExecutionId: candidate.relatedWorkflowExecutionId,
        metadata: candidate.metadata
      });
      return candidate;
    }
  });
  const plan = await service.createCEOPlanFromCommand(parsed.data);
  return NextResponse.json({ ok: true, plan, persistence: { mode: persistenceStore.isConfigured() ? "supabase" : "memory_fallback" } });
}
