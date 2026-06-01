import { NextResponse } from "next/server";
import { z } from "zod";
import { createCEOBrainPlanWithOpenAI } from "@/lib/ai/openai-provider";
import { createSupabasePersistenceStore } from "@/lib/persistence/supabase-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/database/supabaseClient";
import { CEOCommandService } from "@/modules/orchestration/ceo-command-service";

const commandSchema = z.object({
  command: z.string().trim().min(1),
  organizationId: z.string().optional(),
  workspaceId: z.string().optional(),
  userId: z.string().optional()
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "รูปแบบคำสั่งไม่ถูกต้อง กรุณาลองส่งคำสั่งใหม่อีกครั้ง" }, { status: 400 });
  }

  const parsed = commandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "คำสั่งไม่ถูกต้อง กรุณาพิมพ์สิ่งที่ต้องการให้ CEO AI ช่วยวิเคราะห์" }, { status: 400 });
  }

  const persistenceStore = await createCommandPersistenceStore();
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

  try {
    const plan = await service.createCEOPlanFromCommand(parsed.data);
    const writeReport = persistenceStore.getWriteReport();
    return NextResponse.json({
      ok: true,
      plan,
      persistence: {
        mode: writeReport.persistedToSupabase ? "supabase" : "memory_fallback",
        supabaseConfigured: writeReport.supabaseConfigured,
        savedToSupabase: writeReport.persistedToSupabase,
        usedFallback: writeReport.usedFallback,
        lastError: writeReport.lastError
      }
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "CEO AI ยังวิเคราะห์คำสั่งไม่ได้ชั่วคราว กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

async function createCommandPersistenceStore() {
  const serviceRuntime = createSupabaseServiceClient();
  if (serviceRuntime.client) {
    return createSupabasePersistenceStore({ supabase: serviceRuntime.client });
  }

  const serverClient = await tryCreateSupabaseServerClient();
  if (serverClient) {
    return createSupabasePersistenceStore({ supabase: serverClient });
  }

  return createSupabasePersistenceStore({ supabase: null });
}

async function tryCreateSupabaseServerClient() {
  try {
    return await createSupabaseServerClient();
  } catch {
    return null;
  }
}
