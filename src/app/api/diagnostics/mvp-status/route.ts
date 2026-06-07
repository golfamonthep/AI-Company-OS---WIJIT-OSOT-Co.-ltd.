import { NextResponse } from "next/server";
import { createCEOBrainPlanWithOpenAI } from "@/lib/ai/openai-provider";
import { runMvpStatusDiagnostics } from "@/lib/diagnostics/mvp-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/database/supabaseClient";

export async function GET() {
  const supabase = await createDiagnosticsSupabaseClient();
  const diagnostics = await runMvpStatusDiagnostics({
    supabase,
    generateCEOBrainPlan: createCEOBrainPlanWithOpenAI,
    openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4.1"
  });

  return NextResponse.json(diagnostics);
}

async function createDiagnosticsSupabaseClient() {
  const serviceRuntime = createSupabaseServiceClient();
  if (serviceRuntime.client) {
    return serviceRuntime.client;
  }

  try {
    return await createSupabaseServerClient();
  } catch {
    return null;
  }
}
