import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentPipelineResult } from "@/modules/workflows/content-production/types";

export async function persistContentPipelineRun(supabase: SupabaseClient, result: ContentPipelineResult) {
  const runResult = await supabase
    .from("content_pipeline_runs")
    .insert({
      organization_id: result.organizationId,
      objective: result.objective,
      product_name: result.productName,
      target_audience: result.targetAudience,
      channels: result.channels,
      state: result.state,
      approval_status: result.approvalStatus,
      memory_context: {
        memories: result.memoryContext,
        states: result.states
      },
      analytics: result.analytics
    })
    .select()
    .single();

  if (runResult.error || !runResult.data) return runResult;

  const pipelineRunId = runResult.data.id as string;
  const artifactsResult = await supabase.from("content_pipeline_artifacts").insert(
    result.artifacts.map((artifact) => ({
      organization_id: result.organizationId,
      pipeline_run_id: pipelineRunId,
      artifact_type: artifact.type,
      owner_agent_role: artifact.ownerAgentRole,
      title: artifact.title,
      body: artifact.body,
      requires_human_approval: artifact.requiresHumanApproval ?? false
    }))
  );

  if (artifactsResult.error) return { data: runResult.data, error: artifactsResult.error };

  const analyticsResult = await supabase.from("content_pipeline_analytics").insert({
    organization_id: result.organizationId,
    pipeline_run_id: pipelineRunId,
    predicted_reach: result.analytics.predictedReach,
    predicted_engagement_rate: result.analytics.predictedEngagementRate,
    predicted_conversion_rate: result.analytics.predictedConversionRate,
    confidence: result.analytics.confidence,
    assumptions: result.analytics.assumptions
  });

  if (analyticsResult.error) return { data: runResult.data, error: analyticsResult.error };

  const learningResult = await supabase.from("content_pipeline_learning_events").insert({
    organization_id: result.organizationId,
    pipeline_run_id: pipelineRunId,
    lesson: result.learning.lesson,
    tags: result.learning.tags,
    approved_for_memory: result.learning.approvedForMemory
  });

  if (learningResult.error) return { data: runResult.data, error: learningResult.error };

  return runResult;
}

export async function approveContentPipelineRun(supabase: SupabaseClient, input: { organizationId: string; pipelineRunId: string; approvalNotes?: string }) {
  const runResult = await supabase
    .from("content_pipeline_runs")
    .update({
      state: "completed",
      approval_status: "approved",
      completed_at: new Date().toISOString(),
      analytics: {
        approvalNotes: input.approvalNotes ?? "Approved for publishing preparation and memory promotion"
      }
    })
    .eq("id", input.pipelineRunId)
    .eq("organization_id", input.organizationId)
    .select()
    .single();

  if (runResult.error || !runResult.data) return runResult;

  await supabase
    .from("content_pipeline_artifacts")
    .update({ approved_at: new Date().toISOString() })
    .eq("pipeline_run_id", input.pipelineRunId)
    .eq("organization_id", input.organizationId)
    .eq("requires_human_approval", true);

  await supabase
    .from("content_pipeline_learning_events")
    .update({ approved_for_memory: true })
    .eq("pipeline_run_id", input.pipelineRunId)
    .eq("organization_id", input.organizationId);

  return runResult;
}
