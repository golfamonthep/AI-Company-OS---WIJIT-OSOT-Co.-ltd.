import type { DelegationDecisionInput, ProgressUpdateInput, TaskDelegationInput, TaskStage } from "@/modules/tasks/types";

export const taskStageOrder: TaskStage[] = ["intake", "assigned", "accepted", "in_progress", "review", "approval", "completed"];

export function createDelegationPlan(input: TaskDelegationInput) {
  return {
    task: {
      organization_id: input.organizationId,
      owner_agent_id: input.assigneeAgentId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      current_stage: "assigned",
      progress_percent: 0,
      deadline_at: input.deadlineAt,
      approval_required: input.approvalRequired ?? input.priority === "critical",
      metadata: {
        expectedOutput: input.expectedOutput,
        workflowRunId: input.workflowRunId
      }
    },
    delegation: {
      organization_id: input.organizationId,
      delegator_agent_id: input.delegatorAgentId,
      assignee_agent_id: input.assigneeAgentId,
      workflow_run_id: input.workflowRunId,
      status: "assigned",
      priority: input.priority,
      deadline_at: input.deadlineAt,
      instructions: input.instructions ?? input.description,
      expected_output: input.expectedOutput ?? ""
    },
    activity: {
      organization_id: input.organizationId,
      actor_agent_id: input.delegatorAgentId,
      activity_type: "delegated",
      summary: `Task delegated to agent ${input.assigneeAgentId}`,
      to_stage: "assigned",
      metadata: { priority: input.priority }
    },
    collaborators: input.collaborators ?? []
  };
}

export function acceptDelegationPlan(input: DelegationDecisionInput) {
  return {
    delegationStatus: "accepted",
    taskStage: "accepted" satisfies TaskStage,
    activity: {
      organization_id: input.organizationId,
      task_id: input.taskId,
      actor_agent_id: input.agentId,
      activity_type: "accepted",
      summary: input.reason || "Agent accepted delegated task",
      from_stage: "assigned",
      to_stage: "accepted"
    }
  };
}

export function rejectDelegationPlan(input: DelegationDecisionInput) {
  return {
    delegationStatus: "declined",
    taskStage: "blocked" satisfies TaskStage,
    activity: {
      organization_id: input.organizationId,
      task_id: input.taskId,
      actor_agent_id: input.agentId,
      activity_type: "rejected",
      summary: input.reason || "Agent rejected delegated task",
      from_stage: "assigned",
      to_stage: "blocked"
    }
  };
}

export function progressUpdatePlan(input: ProgressUpdateInput) {
  const nextStage: TaskStage = input.blockers?.length ? "blocked" : input.progressPercent >= 100 ? "review" : "in_progress";

  return {
    taskStage: nextStage,
    taskStatus: nextStage === "blocked" ? "blocked" : nextStage === "review" ? "review" : "in_progress",
    activity: {
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
    }
  };
}
