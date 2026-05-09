import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeWorkflow } from "@/modules/agent-runtime/workflows/WorkflowExecutor";

const executeWorkflowSchema = z.object({
  organizationId: z.string().min(1),
  workflowId: z.enum(["content-production", "product-research", "ads-campaign", "weekly-business-review"]),
  objective: z.string().min(1),
  payload: z.record(z.unknown()).default({}),
  humanInTheLoop: z.boolean().default(false),
  requestedByAgentId: z.string().optional(),
  requestedByUserId: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = executeWorkflowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workflow execution payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const result = await executeWorkflow(parsed.data, supabase);

  return NextResponse.json({
    status: supabase ? "executed" : "executed_without_database_persistence",
    result
  });
}
