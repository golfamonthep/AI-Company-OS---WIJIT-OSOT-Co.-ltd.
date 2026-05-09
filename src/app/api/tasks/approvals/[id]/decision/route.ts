import { NextResponse } from "next/server";
import { z } from "zod";
import { recordApprovalDecision } from "@/modules/tasks/approval-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const approvalDecisionSchema = z.object({
  organizationId: z.string().min(1),
  taskId: z.string().optional(),
  approverAgentId: z.string().optional(),
  approverUserId: z.string().optional(),
  decision: z.enum(["approved", "rejected", "changes_requested"]),
  decisionNotes: z.string().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = approvalDecisionSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid approval decision payload" }, { status: 400 });
  }

  const decision = {
    approval_request_id: id,
    organization_id: parsed.data.organizationId,
    task_id: parsed.data.taskId,
    approver_agent_id: parsed.data.approverAgentId,
    approver_user_id: parsed.data.approverUserId,
    decision: parsed.data.decision,
    decision_notes: parsed.data.decisionNotes
  };
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning approval decision plan only.",
      decision
    });
  }

  const result = await recordApprovalDecision(supabase, { ...parsed.data, approvalRequestId: id });

  if (result.error) {
    return NextResponse.json({ error: result.error.message, decision }, { status: 500 });
  }

  return NextResponse.json({
    status: "decision_recorded",
    data: result.data,
    decision
  });
}
