import type { SupabaseClient } from "@supabase/supabase-js";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";

export function runContentCreatorHarnessSample(supabase: SupabaseClient | null = null) {
  return executeContentCreatorAgent(
    {
      organizationId: "sample-organization",
      brief: "Generate TikTok campaign hooks for a mother-and-baby product",
      productName: "Mother and baby product",
      targetAudience: "New mothers",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    },
    supabase
  );
}
