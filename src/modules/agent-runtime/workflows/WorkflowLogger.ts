import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowExecutionEvent, WorkflowExecutionResult } from "@/modules/agent-runtime/workflows/types";

const workflowLogPath = path.join(process.cwd(), "memory", "workflows", "WORKFLOW_EXECUTION_LOG.md");

export async function saveWorkflowExecutionLog(supabase: SupabaseClient | null, result: WorkflowExecutionResult) {
  await appendWorkflowFileLog(result).catch(() => undefined);

  if (!supabase) return { saved: false };

  const run = await supabase
    .from("workflow_execution_runs")
    .insert({
      organization_id: result.input.organizationId,
      workflow_id: result.definition.workflowId,
      objective: result.input.objective,
      state: result.state,
      input: result.input.payload,
      analytics: result.analytics
    })
    .select()
    .single();

  if (run.error || !run.data) return { saved: false };
  const workflowRunId = run.data.id as string;

  const steps = await supabase.from("workflow_execution_steps").insert(
    result.steps.map((step) => ({
      organization_id: result.input.organizationId,
      workflow_run_id: workflowRunId,
      step_id: step.stepId,
      agent_id: step.agentId,
      state: step.state,
      attempts: step.attempts,
      output: step.output ?? {},
      error: step.error
    }))
  );

  const events = await supabase.from("workflow_execution_events").insert(
    result.events.map((event) => ({
      organization_id: result.input.organizationId,
      workflow_run_id: workflowRunId,
      event_type: event.eventType,
      state: event.state,
      step_id: event.stepId,
      agent_id: event.agentId,
      summary: event.summary,
      metadata: event.metadata ?? {}
    }))
  );

  return { saved: !steps.error && !events.error, workflowRunId };
}

function appendWorkflowFileLog(result: WorkflowExecutionResult) {
  return appendEventLog(result.events, result);
}

async function appendEventLog(events: WorkflowExecutionEvent[], result: WorkflowExecutionResult) {
  await mkdir(path.dirname(workflowLogPath), { recursive: true });
  const content = [
    `## ${new Date().toISOString()} - ${result.definition.workflowId}`,
    "",
    `- Run: ${result.runId}`,
    `- Objective: ${result.input.objective}`,
    `- State: ${result.state}`,
    `- Completed steps: ${result.analytics.completedSteps}/${result.analytics.totalSteps}`,
    ...events.map((event) => `- ${event.state}: ${event.summary}`),
    ""
  ].join("\n");

  await appendFile(workflowLogPath, `\n${content}`, "utf8");
}
