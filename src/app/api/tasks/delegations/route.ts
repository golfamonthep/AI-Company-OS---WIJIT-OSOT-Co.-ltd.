import { NextResponse } from "next/server";
import { z } from "zod";
import { createDelegationPlan } from "@/modules/tasks/delegation-workflow";
import { createDelegatedTask } from "@/modules/tasks/delegation-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const delegationSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  delegatorAgentId: z.string().optional(),
  assigneeAgentId: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  deadlineAt: z.string().optional(),
  workflowRunId: z.string().optional(),
  instructions: z.string().optional(),
  expectedOutput: z.string().optional(),
  approvalRequired: z.boolean().optional(),
  collaborators: z
    .array(
      z.object({
        agentId: z.string().min(1),
        role: z.enum(["collaborator", "reviewer", "approver", "observer"]),
        responsibility: z.string().optional()
      })
    )
    .optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = delegationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task delegation payload" }, { status: 400 });
  }

  const plan = createDelegationPlan(parsed.data);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning delegation plan only.",
      plan
    });
  }

  const result = await createDelegatedTask(supabase, parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error.message, plan }, { status: 500 });
  }

  return NextResponse.json({
    status: "created",
    data: result.data,
    plan
  });
}
