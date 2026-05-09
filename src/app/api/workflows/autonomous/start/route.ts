import { NextResponse } from "next/server";
import { z } from "zod";
import { createWorkflowRunSnapshot, simulateFirstExecutionTick } from "@/modules/workflows/executor";
import { planAutonomousWorkflow } from "@/modules/workflows/planner";
import { persistAutonomousWorkflowRun } from "@/modules/workflows/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const startWorkflowSchema = z.object({
  organizationId: z.string().min(1),
  objective: z.string().min(1),
  createdByAgentId: z.string().optional(),
  createdByUserId: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  triggerType: z.enum(["manual", "scheduled", "event"]).default("manual")
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = startWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid autonomous workflow start payload" }, { status: 400 });
  }

  const plan = planAutonomousWorkflow(parsed.data);
  const snapshot = simulateFirstExecutionTick(createWorkflowRunSnapshot(plan, parsed.data.organizationId));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning autonomous workflow plan and runtime snapshot only.",
      plan,
      snapshot
    });
  }

  const result = await persistAutonomousWorkflowRun(supabase, plan, snapshot);

  if (result.error) {
    return NextResponse.json({ error: result.error.message, plan, snapshot }, { status: 500 });
  }

  return NextResponse.json({
    status: "started",
    data: result.data,
    plan,
    snapshot
  });
}
