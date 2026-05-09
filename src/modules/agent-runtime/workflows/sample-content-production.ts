import type { SupabaseClient } from "@supabase/supabase-js";
import { executeWorkflow } from "@/modules/agent-runtime/workflows/WorkflowExecutor";

export function runContentProductionWorkflowSample(supabase: SupabaseClient | null = null) {
  return executeWorkflow(
    {
      organizationId: "sample-organization",
      workflowId: "content-production",
      objective: "Generate TikTok content for a mother-and-baby product launch.",
      humanInTheLoop: false,
      payload: {
        campaignBrief: "Generate 10 TikTok hooks and short-form content direction for a mother-and-baby product.",
        productName: "Mother and baby product",
        targetAudience: "New mothers",
        channel: "tiktok",
        contentGoal: "engagement"
      }
    },
    supabase
  );
}
