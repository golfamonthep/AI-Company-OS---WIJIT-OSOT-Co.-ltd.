import { NextResponse } from "next/server";
import { z } from "zod";
import { createApprovalRequest } from "@/modules/tasks/approval-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const approvalSchema = z.object({
  organizationId: z.string().min(1),
  requesterAgentId: z.string().optional(),
  approverAgentId: z.string().optional(),
  approverUserId: z.string().optional(),
  title: z.string().min(1),
  requestBody: z.string().min(1),
  workflowRunId: z.string().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = approvalSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid approval payload" }, { status: 400 });
  }

  const approval = {
    organization_id: parsed.data.organizationId,
    requester_agent_id: parsed.data.requesterAgentId,
    approver_agent_id: parsed.data.approverAgentId,
    approver_user_id: parsed.data.approverUserId,
    task_id: id,
    workflow_run_id: parsed.data.workflowRunId,
    title: parsed.data.title,
    request_body: parsed.data.requestBody,
    status: "requested"
  };
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      status: "planned",
      message: "Supabase env is not configured; returning approval request plan only.",
      approval
    });
  }

  const result = await createApprovalRequest(supabase, { ...parsed.data, taskId: id });

  if (result.error) {
    return NextResponse.json({ error: result.error.message, approval }, { status: 500 });
  }

  return NextResponse.json({
    status: "approval_requested",
    data: result.data,
    approval
  });
}
