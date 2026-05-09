import { describe, expect, it } from "vitest";
import { PersistenceService } from "@/database/PersistenceService";
import { LearningRepository } from "@/database/repositories/LearningRepository";
import { ContentDepartmentLiveMvpService } from "@/modules/live-mvp/content-department";
import type { ApiContext } from "@/server/api/auth";

function createTestContext(): ApiContext {
  return {
    organizationId: `org-quality-${Date.now()}`,
    workspaceId: "workspace-quality",
    actorAgentId: "ceo",
    userId: "reviewer-a",
    userRole: "owner",
    permissions: ["dashboard:view", "workflow:start", "workflow:review", "approval:approve_content"],
    persistence: new PersistenceService(null),
    persistenceMode: "missing_env",
    persistenceReason: "test fallback"
  };
}

describe("live Content Department quality review", () => {
  it("persists detailed hook reviews into workflow, learning, dashboard, and memory", async () => {
    const context = createTestContext();
    const service = new ContentDepartmentLiveMvpService(context);
    const started = await service.startMotherBabyCampaign({
      campaignBrief: "Generate 10 TikTok hooks for a Thai mother-and-baby product",
      productName: "ผลิตภัณฑ์แม่และเด็ก",
      targetAudience: "คุณแม่ไทย",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    });

    expect(started.contentPack.hooks).toHaveLength(10);
    expect(started.contentPack.captions).toHaveLength(5);
    expect(started.contentPack.scripts).toHaveLength(3);
    expect(started.contentPack.ctaOptions.length).toBeGreaterThanOrEqual(5);
    expect(started.contentPack.qualityScores.length).toBeGreaterThan(started.contentCreator.output.hooks.length);

    const reviews = started.contentCreator.output.hooks.map((hook, index) => {
      const score = index < 8 ? 8 : 5;
      return {
        outputType: "hook" as const,
        outputIndex: index,
        text: hook,
        decision: index < 8 ? ("approved" as const) : ("rejected" as const),
        scores: {
          hookStrength: score,
          emotionalImpact: score,
          thaiNaturalness: score,
          retentionPotential: score,
          ctaEffectiveness: score,
          clarity: score,
          businessUsefulness: score,
          audienceRelevance: score
        },
        feedbackNotes: index < 8 ? "Useful for Thai mother audience." : "Too weak for retention.",
        improvementSuggestion: index < 8 ? "Reuse this pattern." : "Make the hook more specific and natural."
      };
    });

    const approved = await service.approveMotherBabyCampaign({
      runKey: started.runKey,
      decision: "approved",
      approvalNotes: "Reviewed all hooks.",
      outputScore: 8,
      workflowSatisfaction: 8,
      thumbs: "up",
      qualityNotes: "Strong Thai hooks promoted to memory.",
      contentReviews: reviews
    });
    const snapshot = await service.getDashboardSnapshot();

    expect(approved.status).toBe("completed");
    expect(snapshot.contentDepartment.contentPack?.packSummary.totalReviewableItems).toBe(started.contentPack.packSummary.totalReviewableItems);
    expect(snapshot.contentDepartment.qualityReviewSummary?.reviewedOutputCount).toBe(started.contentCreator.output.hooks.length);
    expect(snapshot.contentDepartment.bestPerformingOutputs.length).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.lowPerformingOutputAlerts.length).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.memoryUpdates.some((memory) => memory.memory_type === "approved_pattern" || memory.memory_type === "successful_hook_pattern")).toBe(true);
    expect(snapshot.contentDepartment.learningEvents.some((event) => event.event_type === "content_creator_quality_evaluated")).toBe(true);
    expect(snapshot.contentDepartment.memoryCurationSummary?.approvedPatternCount).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.memoryCurationSummary?.rejectedPatternCount).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.skillImprovementProposals?.[0]).toMatchObject({
      status: "proposed",
      targetSkillId: "hook_generation",
      approvalRequired: true
    });

    const proposal = snapshot.contentDepartment.skillImprovementProposals?.[0];
    expect(proposal?.proposalKey).toBeTruthy();
    const learning = new LearningRepository(context.persistence);
    await learning.saveProposal({
      organization_id: context.organizationId,
      workspace_id: context.workspaceId,
      proposal_key: proposal!.proposalKey,
      proposal_type: "skill_improvement",
      target_type: "skill",
      target_id: "hook_generation",
      title: proposal!.title,
      summary: proposal!.summary,
      status: "approved",
      score: proposal!.score,
      proposed_change: proposal!.proposedChange ?? {},
      evidence: [],
      metadata: { approvalRequired: true, reviewerId: "human-test-reviewer" }
    });

    const nextRun = await service.startMotherBabyCampaign({
      campaignBrief: "Generate 10 TikTok hooks for a Thai mother-and-baby product",
      productName: "ผลิตภัณฑ์แม่และเด็ก",
      targetAudience: "คุณแม่ไทย",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    });

    expect(nextRun.contentCreator.output.hooks).toHaveLength(10);
    const guidance = nextRun.contentCreator.input.constraints ?? [];
    expect(guidance.some((item) => item.includes("Approved Hook Generation guidance"))).toBe(true);
  });
});
