import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateApprovalRequestInput = {
  organizationId: string;
  taskId: string;
  requesterAgentId?: string;
  approverAgentId?: string;
  approverUserId?: string;
  title: string;
  requestBody: string;
  workflowRunId?: string;
};

export type RecordApprovalDecisionInput = {
  organizationId: string;
  approvalRequestId: string;
  taskId?: string;
  approverAgentId?: string;
  approverUserId?: string;
  decision: "approved" | "rejected" | "changes_requested";
  decisionNotes?: string;
};

export async function createApprovalRequest(supabase: SupabaseClient, input: CreateApprovalRequestInput) {
  const approvalResult = await supabase
    .from("approval_requests")
    .insert({
      organization_id: input.organizationId,
      requester_agent_id: input.requesterAgentId,
      approver_agent_id: input.approverAgentId,
      approver_user_id: input.approverUserId,
      task_id: input.taskId,
      workflow_run_id: input.workflowRunId,
      title: input.title,
      request_body: input.requestBody,
      status: "requested"
    })
    .select()
    .single();

  if (approvalResult.error || !approvalResult.data) return approvalResult;

  const activityResult = await supabase.from("task_activity_log").insert({
    organization_id: input.organizationId,
    task_id: input.taskId,
    actor_agent_id: input.requesterAgentId,
    activity_type: "approval_requested",
    summary: input.title,
    to_stage: "approval",
    metadata: {
      approvalRequestId: approvalResult.data.id,
      approverAgentId: input.approverAgentId,
      approverUserId: input.approverUserId
    }
  });

  if (activityResult.error) return { data: approvalResult.data, error: activityResult.error };

  const taskResult = await supabase.from("tasks").update({ current_stage: "approval", status: "review" }).eq("id", input.taskId);
  if (taskResult.error) return { data: approvalResult.data, error: taskResult.error };

  return approvalResult;
}

export async function recordApprovalDecision(supabase: SupabaseClient, input: RecordApprovalDecisionInput) {
  const decidedAt = new Date().toISOString();
  const nextStage = input.decision === "approved" ? "completed" : input.decision === "changes_requested" ? "review" : "blocked";
  const nextStatus = input.decision === "approved" ? "done" : input.decision === "changes_requested" ? "review" : "blocked";

  const updateResult = await supabase
    .from("approval_requests")
    .update({
      status: input.decision,
      decision_notes: input.decisionNotes,
      decided_at: decidedAt
    })
    .eq("id", input.approvalRequestId)
    .select()
    .single();

  if (updateResult.error || !updateResult.data) return updateResult;

  const decisionResult = await supabase.from("task_approval_decisions").insert({
    organization_id: input.organizationId,
    approval_request_id: input.approvalRequestId,
    task_id: input.taskId,
    approver_agent_id: input.approverAgentId,
    approver_user_id: input.approverUserId,
    decision: input.decision,
    decision_notes: input.decisionNotes
  });

  if (decisionResult.error) return { data: updateResult.data, error: decisionResult.error };

  if (input.taskId) {
    const taskPatch: Record<string, unknown> = {
      current_stage: nextStage,
      status: nextStatus
    };

    if (input.decision === "approved") {
      taskPatch.progress_percent = 100;
      taskPatch.completed_at = decidedAt;
    }

    const taskResult = await supabase.from("tasks").update(taskPatch).eq("id", input.taskId);
    if (taskResult.error) return { data: updateResult.data, error: taskResult.error };

    const activityResult = await supabase.from("task_activity_log").insert({
      organization_id: input.organizationId,
      task_id: input.taskId,
      actor_agent_id: input.approverAgentId,
      actor_user_id: input.approverUserId,
      activity_type: `approval_${input.decision}`,
      summary: input.decisionNotes || `Approval ${input.decision}`,
      from_stage: "approval",
      to_stage: nextStage,
      metadata: { approvalRequestId: input.approvalRequestId }
    });

    if (activityResult.error) return { data: updateResult.data, error: activityResult.error };
  }

  return updateResult;
}
