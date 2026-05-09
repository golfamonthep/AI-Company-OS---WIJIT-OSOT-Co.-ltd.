import type { SupabaseClient } from "@supabase/supabase-js";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";
import { AgentCollaborationManager } from "@/modules/agent-runtime/collaboration/AgentCollaborationManager";
import { AgentCommunicationBus } from "@/modules/agent-runtime/collaboration/AgentCommunicationBus";
import { AgentTaskDelegator } from "@/modules/agent-runtime/collaboration/AgentTaskDelegator";
import { ApprovalCoordinator } from "@/modules/agent-runtime/collaboration/ApprovalCoordinator";
import { EscalationManager } from "@/modules/agent-runtime/collaboration/EscalationManager";
import type { CollaborationMemoryReference } from "@/modules/agent-runtime/collaboration/types";

export async function runMotherBabyTikTokCollaboration(supabase: SupabaseClient | null = null) {
  const organizationId = "sample-organization";
  const sharedMemory: CollaborationMemoryReference[] = [
    { memoryId: "brand-voice", source: "company", title: "Brand Voice", relevance: "Use warm, practical, low-pressure language." },
    { memoryId: "content-creator-successful-outputs", source: "agent", title: "Successful TikTok Hooks", relevance: "Reuse checklist and reassurance patterns." },
    { memoryId: "decision-file-memory", source: "decision_log", title: "File-based Memory Decision", relevance: "Keep memory references explicit and auditable." }
  ];

  const manager = new AgentCollaborationManager(supabase);
  const bus = new AgentCommunicationBus(supabase);
  const delegator = new AgentTaskDelegator(supabase);
  const approvals = new ApprovalCoordinator(supabase);
  const escalations = new EscalationManager(supabase);

  const session = manager.createSession({
    organizationId,
    title: "Mother-and-baby TikTok Campaign",
    objective: "Create a TikTok growth campaign for a mother-and-baby product.",
    workflowId: "content-production",
    campaignName: "Mother-and-baby TikTok Campaign",
    participatingAgents: ["ceo", "marketing", "content-creator", "video-editor", "ads-performance"],
    sharedMemory,
    metadata: { channel: "tiktok", productName: "Mother and baby product" }
  });

  await bus.sendMessage({ sessionId: session.sessionId, organizationId, fromAgentId: "ceo", toAgentId: "marketing", subject: "Create TikTok growth campaign", body: "Analyze audience strategy for new mothers and prepare the content direction.", messageType: "request", memoryReferences: sharedMemory });
  const marketingTask = await delegator.delegateTask({ sessionId: session.sessionId, organizationId, fromAgentId: "ceo", toAgentId: "marketing", title: "Audience strategy", instructions: "Analyze audience pain, positioning, and campaign angle.", expectedOutput: "Audience strategy summary", memoryReferences: sharedMemory });
  await delegator.updateStatus(marketingTask.delegationId, "completed", "marketing", "Audience strategy completed with reassurance/checklist angle.");

  await bus.sendMessage({ sessionId: session.sessionId, organizationId, fromAgentId: "marketing", toAgentId: "content-creator", subject: "Handoff audience strategy", body: "Generate hooks and scripts using reassurance, checklist, and no unsupported claims.", messageType: "handoff", memoryReferences: sharedMemory });
  const contentTask = await delegator.delegateTask({ sessionId: session.sessionId, organizationId, fromAgentId: "marketing", toAgentId: "content-creator", title: "Generate hooks and scripts", instructions: "Generate TikTok hooks and short script options.", expectedOutput: "Hooks, scripts, captions, CTA", dependsOn: [marketingTask.delegationId], memoryReferences: sharedMemory });
  const contentResult = await executeContentCreatorAgent(
    {
      organizationId,
      brief: "Generate TikTok campaign hooks for a mother-and-baby product",
      productName: "Mother and baby product",
      targetAudience: "New mothers",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    },
    supabase
  );
  await delegator.updateStatus(contentTask.delegationId, "completed", "content-creator", "Hooks and scripts generated.");
  manager.addArtifact(session.sessionId, { label: "Content Creator Output", summary: `Generated ${contentResult.output.hooks.length} hooks and ${contentResult.output.scripts.length} scripts.` });

  await bus.sendMessage({ sessionId: session.sessionId, organizationId, fromAgentId: "content-creator", toAgentId: "video-editor", subject: "Create production notes", body: "Turn hooks/scripts into shot list and editing direction.", messageType: "handoff", memoryReferences: sharedMemory });
  const videoTask = await delegator.delegateTask({ sessionId: session.sessionId, organizationId, fromAgentId: "content-creator", toAgentId: "video-editor", title: "Production notes", instructions: "Create visual direction, shot list, and editing notes.", expectedOutput: "Production notes", dependsOn: [contentTask.delegationId], memoryReferences: sharedMemory });
  await delegator.updateStatus(videoTask.delegationId, "completed", "video-editor", "Production notes created as structured handoff placeholder.");

  await bus.sendMessage({ sessionId: session.sessionId, organizationId, fromAgentId: "video-editor", toAgentId: "ads-performance", subject: "Prepare targeting strategy", body: "Use creative angle to suggest targeting and KPI assumptions.", messageType: "handoff", memoryReferences: sharedMemory });
  const adsTask = await delegator.delegateTask({ sessionId: session.sessionId, organizationId, fromAgentId: "video-editor", toAgentId: "ads-performance", title: "Targeting strategy", instructions: "Create targeting recommendation and KPI assumptions.", expectedOutput: "Targeting strategy", dependsOn: [videoTask.delegationId], memoryReferences: sharedMemory });
  await delegator.updateStatus(adsTask.delegationId, "completed", "ads-performance", "Targeting strategy created as structured handoff placeholder.");

  const approval = await approvals.requestApproval({ sessionId: session.sessionId, organizationId, requesterAgentId: "ads-performance", approverAgentId: "ceo", subject: "Review final TikTok campaign", summary: "Review audience strategy, content outputs, production notes, and targeting assumptions." });
  await approvals.decideApproval(approval.approvalId, "approved", "ceo", "Approved as draft campaign package. Human review still required before publishing.");

  if (!contentResult.guardrails.passed) {
    await escalations.escalate({ sessionId: session.sessionId, organizationId, fromAgentId: "content-creator", toAgentId: "rd", severity: "high", issue: "Content guardrail blocked claims.", recommendedAction: "R&D should verify product claims before publishing." });
    manager.setStatus(session.sessionId, "blocked");
  } else {
    manager.setStatus(session.sessionId, "completed");
  }

  const finalSession = manager.getSession(session.sessionId) ?? session;
  const result = {
    session: finalSession,
    messages: bus.listMessages(),
    delegations: delegator.listDelegations(),
    approvals: approvals.listApprovals(),
    escalations: escalations.listEscalations(),
    events: [...bus.listEvents(), ...delegator.listEvents(), ...approvals.listEvents(), ...escalations.listEvents()],
    finalReport: {
      campaign: "Mother-and-baby TikTok Campaign",
      contentOutput: contentResult.output,
      review: "CEO approved draft package. Human approval required before external publishing.",
      sharedMemory
    }
  };
  await manager.save(result);
  return result;
}
