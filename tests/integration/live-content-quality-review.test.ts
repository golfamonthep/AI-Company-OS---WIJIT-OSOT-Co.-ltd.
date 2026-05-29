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
    expect(started.workflowPackage).toMatchObject({
      campaignAngle: expect.any(String),
      executionState: {
        state: "waiting_for_approval",
        currentStepId: "user_approval_checkpoint",
        progressPercent: expect.any(Number),
        nextRequiredAction: "ตรวจและอนุมัติชุดคอนเทนต์ก่อนใช้งานจริง"
      },
      nextRequiredApproval: {
        required: true,
        status: "waiting_approval"
      },
      memoryCandidate: {
        type: "campaign_learning",
        approvalRequired: true
      }
    });
    expect(started.workflowPackage.steps.map((step) => step.id)).toEqual([
      "business_request_received",
      "ceo_strategy",
      "content_ideas",
      "marketing_review",
      "creative_direction",
      "user_approval_checkpoint",
      "final_output_package",
      "memory_candidate"
    ]);
    expect(started.workflowPackage.postIdeas.length).toBeGreaterThanOrEqual(5);
    expect(started.workflowPackage.captions.length).toBeGreaterThanOrEqual(5);
    expect(started.workflowPackage.creativeDirection.length).toBeGreaterThanOrEqual(3);

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
    expect(approved.workflowPackage.executionState).toMatchObject({
      state: "completed",
      currentStepId: "memory_candidate",
      progressPercent: 100,
      nextRequiredAction: "พร้อมใช้เป็นข้อมูลอ้างอิงสำหรับรอบถัดไป"
    });
    expect(approved.contentPackReview).toMatchObject({
      status: "approved",
      score: expect.any(Number)
    });
    expect(approved.contentPackReview.approvedPatterns.length).toBeGreaterThan(0);
    expect(approved.persistence.contentReviewMemory).toBe("mocked");
    expect(snapshot.contentDepartment.workflowPackage).toMatchObject({
      campaignAngle: started.workflowPackage.campaignAngle,
      executionState: {
        state: "completed",
        progressPercent: 100
      },
      nextRequiredApproval: {
        required: true
      },
      memoryCandidate: {
        approvalRequired: true
      }
    });
    expect(snapshot.contentDepartment.contentPack?.packSummary.totalReviewableItems).toBe(started.contentPack.packSummary.totalReviewableItems);
    expect(snapshot.contentDepartment.qualityReviewSummary?.reviewedOutputCount).toBe(started.contentCreator.output.hooks.length);
    expect(snapshot.contentDepartment.bestPerformingOutputs.length).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.lowPerformingOutputAlerts.length).toBeGreaterThan(0);
    expect(snapshot.contentDepartment.memoryUpdates.some((memory) => memory.memory_type === "approved_pattern" || memory.memory_type === "successful_hook_pattern")).toBe(true);
    expect(snapshot.contentDepartment.memoryUpdates.some((memory) => memory.memory_type === "content_review" && memory.metadata?.type === "content_review")).toBe(true);
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

  it("marks revision requests as review required with a clear next action", async () => {
    const context = createTestContext();
    const service = new ContentDepartmentLiveMvpService(context);
    const started = await service.startMotherBabyCampaign({
      campaignBrief: "Generate TikTok campaign ideas that need human review",
      productName: "สินค้าแม่และเด็ก",
      targetAudience: "คุณแม่ไทย",
      channel: "tiktok",
      contentGoal: "engagement",
      tone: "friendly"
    });

    const reviewed = await service.approveMotherBabyCampaign({
      runKey: started.runKey,
      decision: "revision_requested",
      approvalNotes: "Needs more specific Thai wording.",
      rejectionReason: "Hooks are too broad for the target buyer.",
      qualityNotes: "Make captions more specific before use.",
      workflowSatisfaction: 5,
      thumbs: "down"
    });
    const snapshot = await service.getDashboardSnapshot();

    expect(reviewed.status).toBe("revision_requested");
    expect(reviewed.workflowPackage.executionState).toMatchObject({
      state: "review_required",
      currentStepId: "user_approval_checkpoint",
      nextRequiredAction: "ปรับเนื้อหาตาม feedback แล้วส่งให้ผู้ใช้ตรวจอีกครั้ง"
    });
    expect(snapshot.contentDepartment.workflowPackage?.executionState).toMatchObject({
      state: "review_required",
      currentStepId: "user_approval_checkpoint"
    });
  });
});
