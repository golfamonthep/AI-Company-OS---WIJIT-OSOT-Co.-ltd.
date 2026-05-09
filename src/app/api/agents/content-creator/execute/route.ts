import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";

const executeSchema = z.object({
  organizationId: z.string().min(1),
  brief: z.string().min(1),
  productName: z.string().optional(),
  targetAudience: z.string().optional(),
  channel: z.enum(["tiktok", "facebook", "instagram", "line", "website"]).default("tiktok"),
  contentGoal: z.enum(["awareness", "engagement", "conversion", "education"]).default("engagement"),
  tone: z.enum(["friendly", "professional", "premium", "educational", "urgent"]).default("friendly"),
  constraints: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = executeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Content Creator Agent execution payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const result = await executeContentCreatorAgent(parsed.data, supabase);

  return NextResponse.json({
    status: supabase ? "executed" : "executed_without_persistence",
    result
  });
}
