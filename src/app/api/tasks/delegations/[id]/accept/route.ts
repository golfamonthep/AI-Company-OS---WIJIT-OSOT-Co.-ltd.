import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptDelegationPlan } from "@/modules/tasks/delegation-workflow";
import { recordDelegationAcceptance } from "@/modules/tasks/delegation-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const decisionSchema = z.object({
  organizationId: z.string().min(1),
  taskId: z.string().min(1),
  agentId: z.string().min(1),
  reason: z.string().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = decisionSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid accept payload" }, { status: 400 });
  }

  const plan = acceptDelegationPlan({ ...parsed.data, delegationId: id });
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning acceptance plan only.",
      plan
    });
  }

  const result = await recordDelegationAcceptance(supabase, { ...parsed.data, delegationId: id });
  if (result.error) return NextResponse.json({ error: result.error.message, plan }, { status: 500 });

  return NextResponse.json({
    status: "accepted",
    plan
  });
}
