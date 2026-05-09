import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowPlan, WorkflowRunSnapshot } from "@/modules/workflows/types";

export async function persistAutonomousWorkflowRun(supabase: SupabaseClient, plan: WorkflowPlan, snapshot: WorkflowRunSnapshot) {
  const workflowResult = await supabase
    .from("workflows")
    .upsert({
      organization_id: snapshot.organizationId,
      slug: plan.template.slug,
      name: plan.template.name,
      definition: {
        description: plan.template.description,
        trigger: plan.template.trigger,
        steps: plan.template.steps
      }
    }, { onConflict: "organization_id,slug" })
    .select()
    .single();

  if (workflowResult.error || !workflowResult.data) return workflowResult;

  const workflowId = workflowResult.data.id as string;
  const stepRows = plan.template.steps.map((step, index) => ({
    organization_id: snapshot.organizationId,
    workflow_id: workflowId,
    step_key: step.key,
    name: step.name,
    step_type: toDatabaseStepType(step.type),
    config: {
      ownerRole: step.ownerRole,
      dependsOn: step.dependsOn ?? [],
      parallelGroup: step.parallelGroup,
      condition: step.condition,
      approval: step.approval,
      retry: step.retry,
      expectedOutput: step.expectedOutput,
      memoryScopes: step.memoryScopes ?? []
    },
    position: index
  }));

  const stepsResult = await supabase
    .from("workflow_steps")
    .upsert(stepRows, { onConflict: "workflow_id,step_key" })
    .select();

  if (stepsResult.error || !stepsResult.data) return { data: workflowResult.data, error: stepsResult.error };

  const stepIdByKey = new Map<string, string>();
  stepsResult.data.forEach((step) => stepIdByKey.set(step.step_key as string, step.id as string));

  const edgeRows = plan.template.steps.flatMap((step) =>
    (step.dependsOn ?? []).map((dependencyKey) => ({
      organization_id: snapshot.organizationId,
      workflow_id: workflowId,
      from_step_id: stepIdByKey.get(dependencyKey),
      to_step_id: stepIdByKey.get(step.key),
      condition_expression: step.condition?.expression
    }))
  ).filter((edge) => edge.from_step_id && edge.to_step_id);

  if (edgeRows.length) {
    const edgesResult = await supabase.from("workflow_step_edges").upsert(edgeRows, { onConflict: "from_step_id,to_step_id" });
    if (edgesResult.error) return { data: workflowResult.data, error: edgesResult.error };
  }

  const runResult = await supabase
    .from("workflow_runs")
    .insert({
      organization_id: snapshot.organizationId,
      workflow_id: workflowId,
      status: snapshot.status,
      objective: snapshot.objective,
      trigger_type: plan.template.trigger,
      current_step_key: snapshot.currentStepKey,
      graph_state: {
        plan,
        snapshot
      },
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (runResult.error || !runResult.data) return runResult;

  const runId = runResult.data.id as string;
  const runStepsResult = await supabase.from("workflow_run_steps").insert(
    snapshot.steps.map((step) => ({
      organization_id: snapshot.organizationId,
      workflow_run_id: runId,
      workflow_step_id: stepIdByKey.get(step.stepKey),
      step_key: step.stepKey,
      status: step.status,
      attempt_count: step.attemptCount,
      max_attempts: step.maxAttempts,
      input: {
        name: step.name,
        type: step.type,
        ownerRole: step.ownerRole,
        dependsOn: step.dependsOn
      },
      output: step.output
    }))
  );

  if (runStepsResult.error) return { data: runResult.data, error: runStepsResult.error };

  const eventsResult = await supabase.from("workflow_run_events").insert(
    snapshot.events.map((event) => ({
      organization_id: snapshot.organizationId,
      workflow_run_id: runId,
      event_type: event.eventType,
      summary: event.summary,
      payload: {
        stepKey: event.stepKey
      }
    }))
  );

  if (eventsResult.error) return { data: runResult.data, error: eventsResult.error };

  return runResult;
}

function toDatabaseStepType(stepType: string) {
  if (stepType === "parallel_group" || stepType === "event_wait") return "conditional";
  return stepType;
}
