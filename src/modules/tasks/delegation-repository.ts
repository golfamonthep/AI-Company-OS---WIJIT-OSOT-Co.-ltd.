import type { SupabaseClient } from "@supabase/supabase-js";
import { createDelegationPlan } from "@/modules/tasks/delegation-workflow";
import type { DelegationDecisionInput, ProgressUpdateInput, TaskDelegationInput } from "@/modules/tasks/types";

export async function createDelegatedTask(supabase: SupabaseClient, input: TaskDelegationInput) {
  const plan = createDelegationPlan(input);
  const taskResult = await supabase.from("tasks").insert(plan.task).select().single();

  if (taskResult.error || !taskResult.data) return taskResult;

  const taskId = taskResult.data.id as string;
  const delegationResult = await supabase
    .from("agent_task_delegations")
    .insert({ ...plan.delegation, task_id: taskId })
    .select()
    .single();

  if (delegationResult.error || !delegationResult.data) return { data: null, error: delegationResult.error };

  const activityResult = await supabase.from("task_activity_log").insert({ ...plan.activity, task_id: taskId });
  if (activityResult.error) return { data: null, error: activityResult.error };

  if (plan.collaborators.length) {
    const collaboratorsResult = await supabase.from("task_collaborators").insert(
      plan.collaborators.map((collaborator) => ({
        organization_id: input.organizationId,
        task_id: taskId,
        agent_id: collaborator.agentId,
        role: collaborator.role,
        responsibility: collaborator.responsibility ?? ""
      }))
    );

    if (collaboratorsResult.error) return { data: null, error: collaboratorsResult.error };
  }

  const ownerResult = await supabase.from("task_collaborators").insert({
    organization_id: input.organizationId,
    task_id: taskId,
    agent_id: input.assigneeAgentId,
    role: "owner",
    responsibility: input.expectedOutput ?? input.title
  });

  if (ownerResult.error) return { data: null, error: ownerResult.error };

  return {
    data: {
      task: taskResult.data,
      delegation: delegationResult.data
    },
    error: delegationResult.error
  };
}

export async function recordDelegationAcceptance(supabase: SupabaseClient, input: DelegationDecisionInput) {
  const delegationResult = await supabase
    .from("agent_task_delegations")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), acceptance_notes: input.reason })
    .eq("id", input.delegationId);
  if (delegationResult.error) return delegationResult;

  const taskResult = await supabase.from("tasks").update({ current_stage: "accepted", status: "in_progress" }).eq("id", input.taskId);
  if (taskResult.error) return taskResult;

  const decisionResult = await supabase.from("task_acceptance_decisions").insert({
    organization_id: input.organizationId,
    delegation_id: input.delegationId,
    task_id: input.taskId,
    agent_id: input.agentId,
    decision: "accepted",
    reason: input.reason
  });
  if (decisionResult.error) return decisionResult;

  return supabase.from("task_activity_log").insert({
    organization_id: input.organizationId,
    task_id: input.taskId,
    actor_agent_id: input.agentId,
    activity_type: "accepted",
    summary: input.reason || "Agent accepted delegated task",
    from_stage: "assigned",
    to_stage: "accepted"
  });
}

export async function recordDelegationRejection(supabase: SupabaseClient, input: DelegationDecisionInput) {
  const delegationResult = await supabase
    .from("agent_task_delegations")
    .update({ status: "declined", rejected_at: new Date().toISOString(), rejection_reason: input.reason })
    .eq("id", input.delegationId);
  if (delegationResult.error) return delegationResult;

  const taskResult = await supabase.from("tasks").update({ current_stage: "blocked", status: "blocked" }).eq("id", input.taskId);
  if (taskResult.error) return taskResult;

  const decisionResult = await supabase.from("task_acceptance_decisions").insert({
    organization_id: input.organizationId,
    delegation_id: input.delegationId,
    task_id: input.taskId,
    agent_id: input.agentId,
    decision: "rejected",
    reason: input.reason
  });
  if (decisionResult.error) return decisionResult;

  return supabase.from("task_activity_log").insert({
    organization_id: input.organizationId,
    task_id: input.taskId,
    actor_agent_id: input.agentId,
    activity_type: "rejected",
    summary: input.reason || "Agent rejected delegated task",
    from_stage: "assigned",
    to_stage: "blocked"
  });
}

export async function recordTaskProgress(supabase: SupabaseClient, input: ProgressUpdateInput) {
  const nextStage = input.blockers?.length ? "blocked" : input.progressPercent >= 100 ? "review" : "in_progress";
  const nextStatus = nextStage === "blocked" ? "blocked" : nextStage === "review" ? "review" : "in_progress";

  const progressResult = await supabase.from("task_progress_updates").insert({
    organization_id: input.organizationId,
    task_id: input.taskId,
    agent_id: input.agentId,
    progress_percent: input.progressPercent,
    summary: input.summary,
    blockers: input.blockers ?? [],
    next_action: input.nextAction
  });
  if (progressResult.error) return progressResult;

  const taskResult = await supabase
    .from("tasks")
    .update({ progress_percent: input.progressPercent, current_stage: nextStage, status: nextStatus })
    .eq("id", input.taskId);
  if (taskResult.error) return taskResult;

  return supabase.from("task_activity_log").insert({
    organization_id: input.organizationId,
    task_id: input.taskId,
    actor_agent_id: input.agentId,
    activity_type: "progress_update",
    summary: input.summary,
    to_stage: nextStage,
    metadata: {
      progressPercent: input.progressPercent,
      blockers: input.blockers ?? [],
      nextAction: input.nextAction
    }
  });
}
