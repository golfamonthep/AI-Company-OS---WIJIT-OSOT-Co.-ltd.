import { NextResponse } from "next/server";
import { z } from "zod";
import { progressUpdatePlan } from "@/modules/tasks/delegation-workflow";
import { recordTaskProgress } from "@/modules/tasks/delegation-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const progressSchema = z.object({
  organizationId: z.string().min(1),
  agentId: z.string().optional(),
  progressPercent: z.number().min(0).max(100),
  summary: z.string().min(1),
  blockers: z.array(z.string()).optional(),
  nextAction: z.string().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = progressSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  const plan = progressUpdatePlan({ ...parsed.data, taskId: id });
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning progress update plan only.",
      plan
    });
  }

  const result = await recordTaskProgress(supabase, { ...parsed.data, taskId: id });
  if (result.error) return NextResponse.json({ error: result.error.message, plan }, { status: 500 });

  return NextResponse.json({
    status: "progress_recorded",
    plan
  });
}
