import type { SupabaseClient } from "@supabase/supabase-js";
import { ApprovalWorkflowManager } from "@/modules/agent-runtime/governance/ApprovalWorkflowManager";
import { ConnectorExecutor } from "@/modules/agent-runtime/integrations/ConnectorExecutor";
import { saveTaskMemory } from "@/modules/agent-runtime/memory/MemoryWriter";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";

export async function runContentCampaignDraftIntegrationDemo(supabase: SupabaseClient | null = null) {
  const organizationId = "sample-organization";
  const content = await executeContentCreatorAgent(
    {
      organizationId,
      brief: "Generate TikTok hooks for a mother-and-baby product and prepare a draft campaign document.",
      productName: "Mother and baby product",
      targetAudience: "New mothers",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    },
    supabase
  );

  const approvals = new ApprovalWorkflowManager(supabase);
  const approval = await approvals.requestApproval({
    organizationId,
    requesterAgentId: "content-creator",
    domain: "workflow",
    subject: "Approve creating Google Docs draft for campaign package",
    summary: "Create an unpublished Google Docs draft containing TikTok hooks, scripts, captions, and CTA. This does not publish or send anything externally."
  });

  const approvalDecision = await approvals.decide({
    approvalId: approval.approvalId,
    approverId: "ceo",
    decision: "approved",
    notes: "Approved to create an unpublished draft document only. No publishing or customer contact allowed."
  });

  const executor = new ConnectorExecutor(supabase);
  const draftResult = await executor.execute({
    organizationId,
    agentId: "content-creator",
    connectorId: "google-docs",
    actionId: "docs.create_draft",
    actionType: "write",
    approved: approvalDecision?.status === "approved",
    summary: "Create unpublished Google Docs draft for Mother-and-baby TikTok campaign.",
    input: {
      title: "Mother-and-baby TikTok Campaign Draft",
      content: [
        "# Mother-and-baby TikTok Campaign Draft",
        "",
        "## Hooks",
        ...content.output.hooks.map((hook, index) => `${index + 1}. ${hook}`),
        "",
        "## Captions",
        ...content.output.captions.map((caption, index) => `${index + 1}. ${caption.caption} ${caption.hashtags.join(" ")}`),
        "",
        "## CTAs",
        ...content.output.ctas.map((cta, index) => `${index + 1}. ${cta}`)
      ].join("\n")
    },
    metadata: {
      approvalId: approval.approvalId,
      workflowId: "content-production",
      externalPublish: false
    }
  });

  await saveTaskMemory({
    organizationId,
    agentId: "content-creator",
    workflowId: "content-production",
    taskIntent: "Content Campaign Draft Integration",
    outputSummary: `Google Docs draft stub result: ${draftResult.status}. No real external account was modified.`,
    tags: ["integration", "google-docs", "draft", "approval-gated"]
  });

  return {
    contentOutput: content.output,
    approval: approvalDecision ?? approval,
    connectorResult: draftResult,
    safety: {
      published: false,
      sent: false,
      externalAccountTouched: false,
      approvalRequired: true
    }
  };
}
