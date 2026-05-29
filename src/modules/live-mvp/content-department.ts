import type { ApiContext } from "@/server/api/auth";
import { ApprovalRepository } from "@/database/repositories/ApprovalRepository";
import { AuditLogRepository } from "@/database/repositories/AuditLogRepository";
import { LearningRepository } from "@/database/repositories/LearningRepository";
import { MemoryRepository } from "@/database/repositories/MemoryRepository";
import { WorkflowRepository } from "@/database/repositories/WorkflowRepository";
import { createSupabaseServiceClient } from "@/database/supabaseClient";
import type { ApprovalRecord, WorkflowRecord, WorkflowRunRecord } from "@/database/types";
import { executeContentCreatorAgent } from "@/modules/content-creator-agent/pipeline";
import type { ContentCreatorChannel, ContentCreatorExecutionResult } from "@/modules/content-creator-agent/contracts";
import { analyzeAdsPerformance } from "@/modules/live-mvp/ads-performance";
import type { AdsPerformanceReview } from "@/modules/live-mvp/ads-performance";
import { buildProductionContentPack } from "@/modules/live-mvp/content-pack";
import type { ProductionContentPack } from "@/modules/live-mvp/content-pack";
import { evaluateContentOutputs, summarizeQualityEvaluation } from "@/modules/live-mvp/content-quality-evaluation";
import type { ContentOutputReviewInput, ContentQualityEvaluation } from "@/modules/live-mvp/content-quality-evaluation";
import { curateContentCreatorMemory } from "@/modules/live-mvp/memory-curation";
import type { MemoryCurationResult } from "@/modules/live-mvp/memory-curation";
import { structuredLogger } from "@/infrastructure/StructuredLogger";

export type LiveContentCampaignInput = {
  campaignBrief: string;
  productName?: string;
  targetAudience?: string;
  channel?: ContentCreatorChannel;
  contentGoal?: "awareness" | "engagement" | "conversion" | "education";
  tone?: "friendly" | "professional" | "premium" | "educational" | "urgent";
  constraints?: string[];
};

export type WorkflowReviewDecision = "approved" | "rejected" | "revision_requested" | "changes_requested";

export type ContentPackReviewStatus = "draft" | "pending_review" | "approved" | "rejected" | "revision_requested";

export type ContentPackReviewRecord = {
  contentPackId: string;
  status: ContentPackReviewStatus;
  reviewerNote?: string;
  score?: number;
  approvedPatterns: string[];
  rejectedPatterns: string[];
  improvementSuggestions: string[];
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowFeedbackInput = {
  outputScore?: number;
  thumbs?: "up" | "down";
  workflowSatisfaction?: number;
  qualityNotes?: string;
  rejectionReason?: string;
  contentReviews?: ContentOutputReviewInput[];
};

export type WorkflowReviewInput = WorkflowFeedbackInput & {
  runKey: string;
  decision?: WorkflowReviewDecision;
  approvalNotes?: string;
};

export type MarketingAudienceAnalysis = {
  segment: string;
  painPoints: string[];
  trustTriggers: string[];
  objections: string[];
  contentAngle: string;
};

export type ContentDepartmentWorkflowStep = {
  id:
    | "business_request_received"
    | "ceo_strategy"
    | "content_ideas"
    | "marketing_review"
    | "creative_direction"
    | "user_approval_checkpoint"
    | "final_output_package"
    | "memory_candidate";
  label: string;
  owner: "user" | "ceo" | "content-ai" | "marketing-ai" | "design-ai" | "governance" | "workflow-engine" | "memory";
  status: "completed" | "waiting_approval" | "queued_after_approval";
  summary: string;
};

export type ContentDepartmentExecutionState = {
  state: "waiting_for_approval" | "approved" | "executing" | "review_required" | "completed";
  currentStepId: ContentDepartmentWorkflowStep["id"];
  progressPercent: number;
  nextRequiredAction: string;
};

export type ContentDepartmentWorkflowPackage = {
  campaignAngle: string;
  executionState: ContentDepartmentExecutionState;
  ceoStrategy: string;
  postIdeas: string[];
  captions: string[];
  marketingReview: string[];
  creativeDirection: string[];
  finalOutputPackage: {
    hooks: number;
    captions: number;
    scripts: number;
    creativeDirections: number;
    reviewableItems: number;
  };
  nextRequiredApproval: {
    required: boolean;
    status: "waiting_approval" | "approved" | "rejected" | "revision_requested";
    approvalKey: string;
    label: string;
    reason: string;
  };
  memoryCandidate: {
    type: "campaign_learning";
    title: string;
    summary: string;
    approvalRequired: boolean;
    sourceWorkflowRunKey: string;
  };
  steps: ContentDepartmentWorkflowStep[];
};

export type LiveContentWorkflowResult = {
  runKey: string;
  approvalKey: string;
  status: "waiting_approval" | "completed" | "rejected" | "revision_requested";
  campaignName: "Mother-and-baby TikTok Campaign";
  marketing: MarketingAudienceAnalysis;
  adsPerformance: AdsPerformanceReview;
  contentPack: ProductionContentPack;
  workflowPackage: ContentDepartmentWorkflowPackage;
  contentCreator: ContentCreatorExecutionResult;
  persistence: {
    workflowRun: string;
    approval: string;
    memory: string;
    learning: string;
    audit: string;
  };
};

const contentProductionWorkflowKey = "content-production-workflow";
const motherBabyCampaignWorkflowKey = "mother-and-baby-tiktok-campaign";

export class ContentDepartmentLiveMvpService {
  private readonly workflows: WorkflowRepository;
  private readonly approvals: ApprovalRepository;
  private readonly memory: MemoryRepository;
  private readonly learning: LearningRepository;
  private readonly audit: AuditLogRepository;

  constructor(private readonly context: ApiContext) {
    this.workflows = new WorkflowRepository(context.persistence);
    this.approvals = new ApprovalRepository(context.persistence);
    this.memory = new MemoryRepository(context.persistence);
    this.learning = new LearningRepository(context.persistence);
    this.audit = new AuditLogRepository(context.persistence);
  }

  async startMotherBabyCampaign(input: LiveContentCampaignInput): Promise<LiveContentWorkflowResult> {
    const startedAt = new Date();
    const runKey = `mother-baby-tiktok-${Date.now()}`;
    const approvalKey = `${runKey}-human-approval`;
    await this.ensureContentProductionWorkflowDefinition();
    const marketing = analyzeMotherBabyAudience(input);
    const approvedSkillGuidance = await this.getApprovedHookGenerationGuidance();
    const contentCreator = await executeContentCreatorAgent(
      {
        organizationId: this.context.organizationId,
        brief: input.campaignBrief,
        productName: input.productName ?? "mother-and-baby offer",
        targetAudience: input.targetAudience ?? marketing.segment,
        channel: input.channel ?? "tiktok",
        contentGoal: input.contentGoal ?? "engagement",
        tone: input.tone ?? "friendly",
        constraints: [
          "Do not publish externally.",
          "Do not make unsupported medical or performance claims.",
          ...approvedSkillGuidance,
          ...(input.constraints ?? [])
        ]
      },
      createSupabaseServiceClient().client
    );
    contentCreator.output.hooks = ensureTenThaiMotherBabyHooks(contentCreator.output.hooks, input.productName, marketing.segment);
    const contentPack = buildProductionContentPack({
      campaignBrief: input.campaignBrief,
      productName: input.productName,
      targetAudience: input.targetAudience,
      marketing,
      content: contentCreator.output
    });
    const adsPerformance = analyzeAdsPerformance({
      campaignName: "Mother-and-baby TikTok Campaign",
      marketing,
      content: contentCreator.output,
      productName: input.productName,
      contentGoal: input.contentGoal
    });
    const workflowPackage = buildContentDepartmentWorkflowPackage({
      input,
      runKey,
      approvalKey,
      marketing,
      contentPack,
      adsPerformance
    });

    const workflowRun: WorkflowRunRecord = {
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      run_key: runKey,
      workflow_key: "mother-and-baby-tiktok-campaign",
      objective: input.campaignBrief,
      status: "waiting_approval",
      input: { ...input },
      output: {
        lifecycle: buildWorkflowLifecycle("waiting_approval"),
        activeAgent: "governance",
        marketing,
        contentCreator: contentCreator.output,
        contentPack,
        workflowPackage,
        adsPerformance,
        guardrails: contentCreator.guardrails,
        selectedSkills: contentCreator.selectedSkills,
        runtimeFlow: contentCreator.runtimeFlow,
        approvedSkillGuidance
      },
      metrics: {
        agentExecutionSteps: contentCreator.runtimeFlow.length,
        hooksGenerated: contentCreator.output.hooks.length,
        contentPackItemsGenerated: contentPack.packSummary.totalReviewableItems,
        contentPackAverageQualityScore: contentPack.packSummary.averageQualityScore,
        scriptsGenerated: contentCreator.output.scripts.length,
        captionsGenerated: contentCreator.output.captions.length,
        predictedCtrConfidence: adsPerformance.ctrPrediction.confidence,
        executionTimeMs: Date.now() - startedAt.getTime(),
        approvalRequired: true
      },
      metadata: {
        campaignName: "Mother-and-baby TikTok Campaign",
        workflowName: "Content Production Workflow",
        startedAt: startedAt.toISOString(),
        referenceWorkflowKey: contentProductionWorkflowKey,
        departments: ["content", "ads-performance"],
        activeAgent: "governance",
        approvalStatus: "requested",
        approvalKey,
        workflowPackage,
        contentPackSchemaVersion: contentPack.schemaVersion,
        approvedSkillGuidanceApplied: approvedSkillGuidance,
        realtimeReady: true,
        persistenceMode: this.context.persistenceMode
      }
    };

    const workflowSaved = await this.workflows.saveRun(workflowRun);
    const approvalSaved = await this.approvals.saveApproval(buildApprovalRecord(this.context, approvalKey, runKey));
    await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "marketing",
      user_id: this.context.userId,
      event_type: "live_content_marketing_analysis_completed",
      action: "analyze_target_audience",
      severity: "low",
      summary: `Marketing AI analyzed target segment: ${marketing.segment}`,
      decision: "completed",
      related_workflow_id: runKey,
      metadata: { workflowName: "Content Production Workflow", contentAngle: marketing.contentAngle }
    });
    await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "content-creator",
      user_id: this.context.userId,
      event_type: "live_content_creator_output_generated",
      action: "generate_hooks_captions_scripts",
      severity: "medium",
      summary: `Content Creator AI generated ${contentCreator.output.hooks.length} hooks, ${contentCreator.output.captions.length} captions, and ${contentCreator.output.scripts.length} scripts.`,
      decision: contentCreator.guardrails.passed ? "completed" : "requires_review",
      related_workflow_id: runKey,
      metadata: {
        workflowName: "Content Production Workflow",
        selectedSkills: contentCreator.selectedSkills,
        contentPackSummary: contentPack.packSummary,
        guardrails: contentCreator.guardrails
      }
    });
    await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "ads-performance",
      user_id: this.context.userId,
      event_type: "live_ads_performance_review_completed",
      action: "review_campaign_performance_potential",
      severity: "medium",
      summary: `Ads Performance AI predicted CTR range ${adsPerformance.ctrPrediction.expectedRange} and generated optimization suggestions.`,
      decision: "requires_approval",
      related_workflow_id: runKey,
      metadata: {
        workflowName: "Content Production Workflow",
        ctrPrediction: adsPerformance.ctrPrediction,
        budgetEfficiency: adsPerformance.budgetEfficiency
      }
    });
    const memorySaved = await this.memory.saveTaskHistory({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "content-creator",
      workflow_id: runKey,
      title: "Mother-and-baby TikTok campaign draft generated",
      task_intent: input.campaignBrief,
      input: { ...input },
      output: workflowRun.output,
      result_summary: `Generated ${contentCreator.output.hooks.length} hooks, ${contentCreator.output.scripts.length} scripts, and ${contentCreator.output.captions.length} captions. Waiting for human approval.`,
      semantic_tags: ["content-department", "mother-baby", "tiktok", "workflow-run"],
      metadata: { status: "waiting_approval" }
    });
    await this.memory.saveAgentMemory({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "ads-performance",
      workflow_id: runKey,
      title: "Mother-and-baby TikTok campaign performance review",
      content: adsPerformance.reportingSummary,
      memory_type: "campaign_performance_insight",
      source_type: "workflow",
      source_id: runKey,
      semantic_tags: ["ads-performance", "ctr", "optimization", "mother-baby", "tiktok"],
      importance: 7,
      metadata: { adsPerformance }
    });
    const learningSaved = await this.learning.saveEvent({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "content-creator",
      workflow_id: runKey,
      event_type: "content_campaign_generated",
      summary: "Content Department MVP generated a complete approval-gated TikTok campaign package.",
      status: "pending_human_approval",
      evidence: [marketing, contentPack.packSummary, contentCreator.guardrails],
      metadata: { approvalKey, workflowName: "Content Production Workflow", contentPackSchemaVersion: contentPack.schemaVersion }
    });
    await this.learning.saveEvent({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "ads-performance",
      workflow_id: runKey,
      event_type: "ads_performance_review_generated",
      summary: "Ads Performance AI reviewed generated campaign potential and created paid-test optimization recommendations.",
      status: "pending_human_approval",
      score: adsPerformance.ctrPrediction.confidence,
      evidence: [adsPerformance],
      metadata: { approvalKey, workflowName: "Content Production Workflow", adsPerformance }
    });
    const auditSaved = await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "workflow-engine",
      user_id: this.context.userId,
      event_type: "live_content_workflow_started",
      action: "start_mother_baby_tiktok_campaign",
      severity: "medium",
      summary: "Mother-and-baby TikTok Campaign started and paused for human approval.",
      decision: "requires_approval",
      related_workflow_id: runKey,
      metadata: { approvalKey, workflowRunStatus: workflowSaved.status, activeAgent: "governance" }
    });

    structuredLogger.info({
      layer: "workflow",
      event: "live_content_workflow_started",
      message: "Mother-and-baby TikTok Campaign generated and waiting for approval.",
      organizationId: this.context.organizationId,
      workflowId: runKey,
      agentId: "content-creator",
      metadata: { approvalKey, persistenceMode: this.context.persistenceMode }
    });

    return {
      runKey,
      approvalKey,
      status: "waiting_approval",
      campaignName: "Mother-and-baby TikTok Campaign",
      marketing,
      adsPerformance,
      contentPack,
      workflowPackage,
      contentCreator,
      persistence: {
        workflowRun: workflowSaved.status,
        approval: approvalSaved.status,
        memory: memorySaved.status,
        learning: learningSaved.status,
        audit: auditSaved.status
      }
    };
  }

  async approveMotherBabyCampaign(input: WorkflowReviewInput) {
    const run = await this.workflows.findRunByKey(this.context.organizationId, input.runKey);
    if (!run.data) {
      throw new Error(`Workflow run ${input.runKey} was not found.`);
    }

    const decision = normalizeReviewDecision(input.decision ?? "approved");
    const isApproved = decision === "approved";
    const workflowStatus = isApproved ? "completed" : decision;
    const feedback = normalizeFeedback(input);
    const qualityEvaluation = evaluateContentOutputs(input.contentReviews);
    const memoryCuration = curateContentCreatorMemory({ evaluation: qualityEvaluation, runKey: input.runKey });
    const effectiveOutputScore = qualityEvaluation?.overallScore ?? feedback.outputScore;
    const approvalKey = `${input.runKey}-human-approval`;
    const approval = await this.approvals.findByKey(this.context.organizationId, approvalKey);
    const contentPackReview = buildContentPackReviewRecord({
      run: run.data,
      status: decision,
      feedback,
      qualityEvaluation,
      memoryCuration,
      score: effectiveOutputScore,
      reviewedAt: new Date().toISOString()
    });
    const originalWorkflowPackage = getWorkflowPackage(run.data.output?.workflowPackage) ?? buildFallbackWorkflowPackage(run.data, approvalKey);
    const updatedWorkflowPackage = withWorkflowExecutionState(originalWorkflowPackage, workflowStatus);
    const completedRun = await this.workflows.saveRun({
      ...run.data,
      status: workflowStatus,
      output: {
        ...(run.data.output ?? {}),
        lifecycle: buildWorkflowLifecycle(workflowStatus),
        activeAgent: "workflow-engine",
        contentPackReview,
        workflowPackage: updatedWorkflowPackage,
        approval: {
          status: decision,
          approvedBy: this.context.userId ?? "demo-user",
          notes: input.approvalNotes ?? defaultReviewNote(decision),
          decidedAt: contentPackReview.reviewedAt,
          feedback,
          qualityEvaluation,
          memoryCuration,
          contentPackReview
        }
      },
      metrics: {
        ...(run.data.metrics ?? {}),
        approvalRequired: !isApproved,
        approved: isApproved,
        contentPackReviewStatus: contentPackReview.status,
        outputScore: effectiveOutputScore,
        workflowSatisfaction: feedback.workflowSatisfaction,
        qualityOverallScore: qualityEvaluation?.overallScore,
        reviewedOutputCount: qualityEvaluation?.reviewedOutputs.length,
        approvedOutputCount: qualityEvaluation?.approvedCount,
        rejectedOutputCount: qualityEvaluation?.rejectedCount
      },
      metadata: {
        ...(run.data.metadata ?? {}),
        realtimeReady: true,
        activeAgent: "workflow-engine",
        approvalStatus: decision,
        contentPackReview,
        workflowPackage: updatedWorkflowPackage,
        feedback,
        qualityEvaluation,
        memoryCuration,
        totalElapsedMs: calculateElapsedMs(run.data.created_at, contentPackReview.reviewedAt),
        completedAt: isApproved ? contentPackReview.reviewedAt : undefined,
        rejectedAt: decision === "rejected" ? contentPackReview.reviewedAt : undefined,
        revisionRequestedAt: decision === "revision_requested" ? contentPackReview.reviewedAt : undefined,
        changesRequestedAt: !isApproved ? contentPackReview.reviewedAt : undefined
      }
    });

    const completedApproval: ApprovalRecord = {
      ...(approval.data ?? buildApprovalRecord(this.context, approvalKey, input.runKey)),
      status: decision,
      decisions: [
        {
          approverId: this.context.userId ?? "human",
          decision,
          notes: input.approvalNotes ?? defaultReviewNote(decision),
          rejectionReason: feedback.rejectionReason,
          outputScore: effectiveOutputScore,
          thumbs: feedback.thumbs,
          workflowSatisfaction: feedback.workflowSatisfaction,
          qualityNotes: feedback.qualityNotes,
          qualityEvaluation,
          memoryCuration,
          contentPackReview,
          decidedAt: contentPackReview.reviewedAt
        }
      ],
      metadata: {
        ...(approval.data?.metadata ?? {}),
        contentPackReview,
        feedback,
        qualityEvaluation,
        memoryCuration,
        decidedAt: contentPackReview.reviewedAt,
        approvedAt: isApproved ? contentPackReview.reviewedAt : undefined
      }
    };
    const approvalSaved = await this.approvals.saveApproval(completedApproval);
    const memoryWrites = await this.persistQualityMemory(input.runKey, approvalKey, feedback, qualityEvaluation, memoryCuration, isApproved, input.approvalNotes);
    const proposalSaved = await this.persistSkillImprovementProposal(input.runKey, approvalKey, memoryCuration);
    const contentReviewMemorySaved = await this.persistContentReviewMemoryEvent({
      run: run.data,
      approvalKey,
      contentPackReview,
      feedback,
      qualityEvaluation,
      decision
    });
    const memorySaved = isApproved
      ? await this.memory.saveCompanyMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          title: "Approved Mother-and-baby TikTok campaign package",
          content: `Human approved the live Content Department MVP workflow output. Score: ${effectiveOutputScore ?? "not scored"}/10. ${summarizeQualityEvaluation(qualityEvaluation)} Notes: ${feedback.qualityNotes ?? "none"}.`,
          memory_type: "campaign_learning",
          source_type: "workflow",
          source_id: input.runKey,
          semantic_tags: ["approved", "content-department", "mother-baby", "tiktok", "feedback"],
          importance: 8,
          metadata: { approvalKey, approvalNotes: input.approvalNotes, contentPackReview, feedback, qualityEvaluation, memoryCuration, memoryWrites, contentReviewMemorySaved, proposalSaved }
        })
      : await this.memory.saveTaskHistory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: input.runKey,
          title: decision === "rejected" ? "Mother-and-baby TikTok campaign rejected" : "Mother-and-baby TikTok campaign revision requested",
          task_intent: decision === "rejected" ? "Human reviewer rejected the generated content pack." : "Human reviewer requested revision before approval.",
          input: { runKey: input.runKey },
          output: { contentPackReview, feedback, qualityEvaluation },
          result_summary: `${feedback.rejectionReason ?? feedback.qualityNotes ?? defaultReviewNote(decision)} ${summarizeQualityEvaluation(qualityEvaluation)}`,
          semantic_tags: [decision, "content-department", "mother-baby", "tiktok", "feedback"],
          metadata: { status: decision, approvalKey, contentPackReview, feedback, qualityEvaluation, memoryCuration, memoryWrites, contentReviewMemorySaved, proposalSaved }
        });
    const learningSaved = await this.learning.saveEvent({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "content-creator",
      workflow_id: input.runKey,
      event_type: isApproved ? "content_campaign_approved" : decision === "rejected" ? "content_campaign_rejected" : "content_campaign_revision_requested",
      summary: isApproved
        ? `Human approved the live Content Department MVP campaign output. ${summarizeQualityEvaluation(qualityEvaluation)}`
        : decision === "rejected"
          ? `Human rejected the live Content Department MVP campaign output. ${summarizeQualityEvaluation(qualityEvaluation)}`
          : `Human requested revision on the live Content Department MVP campaign output. ${summarizeQualityEvaluation(qualityEvaluation)}`,
      status: decision,
      score: effectiveOutputScore,
      evidence: [contentPackReview, feedback, qualityEvaluation].filter(Boolean),
      metadata: { approvalKey, workflowName: "Content Production Workflow", contentPackReview, feedback, qualityEvaluation, memoryCuration, memoryWrites, contentReviewMemorySaved, proposalSaved }
    });
    if (qualityEvaluation) {
      await this.learning.saveEvent({
        organization_id: this.context.organizationId,
        workspace_id: this.context.workspaceId,
        agent_key: "content-creator",
        workflow_id: input.runKey,
        event_type: "content_creator_quality_evaluated",
        summary: `Human reviewed ${qualityEvaluation.reviewedOutputs.length} Content Creator output(s). Overall score ${qualityEvaluation.overallScore}/10. Best outputs: ${qualityEvaluation.bestPerformingOutputs.length}. Low-performing alerts: ${qualityEvaluation.lowPerformingOutputs.length}.`,
        status: qualityEvaluation.rejectedCount > 0 ? "changes_requested" : "approved",
        score: qualityEvaluation.overallScore,
        evidence: [qualityEvaluation],
        metadata: {
          approvalKey,
          workflowName: "Content Production Workflow",
          qualityEvaluation,
          contentPackReview,
          memoryCuration,
          learningInsights: qualityEvaluation.learningInsights
        }
      });
    }
    const auditSaved = await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "workflow-engine",
      user_id: this.context.userId,
      event_type: isApproved ? "live_content_workflow_approved" : decision === "rejected" ? "live_content_workflow_rejected" : "live_content_workflow_revision_requested",
      action: isApproved ? "approve_mother_baby_tiktok_campaign" : decision === "rejected" ? "reject_mother_baby_tiktok_campaign" : "request_revision_mother_baby_tiktok_campaign",
      severity: "medium",
      summary: isApproved ? "ผู้รีวิวอนุมัติ output ของ Mother-and-baby TikTok Campaign" : "ผู้รีวิวขอแก้ไข output ของ Mother-and-baby TikTok Campaign",
      decision,
      related_workflow_id: input.runKey,
      metadata: { approvalKey, approvalNotes: input.approvalNotes, contentPackReview, feedback, qualityEvaluation, memoryCuration, proposalSaved }
    });

    structuredLogger.info({
      layer: "governance",
      event: isApproved ? "live_content_workflow_approved" : decision === "rejected" ? "live_content_workflow_rejected" : "live_content_workflow_revision_requested",
      message: isApproved ? "Human approval completed for Mother-and-baby TikTok Campaign." : decision === "rejected" ? "Human rejected Mother-and-baby TikTok Campaign." : "Human requested revision for Mother-and-baby TikTok Campaign.",
      organizationId: this.context.organizationId,
      workflowId: input.runKey,
      agentId: "workflow-engine",
      metadata: { approvalKey }
    });

    return {
      runKey: input.runKey,
      approvalKey,
      status: workflowStatus,
      workflowRun: completedRun.data,
      approval: approvalSaved.data,
      workflowPackage: updatedWorkflowPackage,
      contentPackReview,
      persistence: {
        workflowRun: completedRun.status,
        approval: approvalSaved.status,
        memory: memorySaved.status,
        contentReviewMemory: contentReviewMemorySaved.status,
        learning: learningSaved.status,
        audit: auditSaved.status
      }
    };
  }

  async getDashboardSnapshot() {
    const [runs, approvals, auditLogs, learningEvents, learningProposals, taskHistory, companyMemory, agentMemory] = await Promise.all([
      this.workflows.listRuns(this.context.organizationId),
      this.approvals.list(this.context.organizationId),
      this.audit.list(this.context.organizationId),
      this.learning.listEvents(this.context.organizationId),
      this.learning.listProposals(this.context.organizationId),
      this.memory.listTaskHistory(this.context.organizationId),
      this.memory.listCompanyMemory(this.context.organizationId),
      this.memory.listAgentMemory(this.context.organizationId)
    ]);

    const contentRuns = runs.data.filter((run) => run.workflow_key === "mother-and-baby-tiktok-campaign");
    const latest = contentRuns[0];
    const latestOutput = latest?.output ?? {};
    const latestMetadata = latest?.metadata ?? {};
    const latestContentCreator = latestOutput.contentCreator as ContentCreatorExecutionResult["output"] | undefined;
    const latestContentPack = latestOutput.contentPack as ProductionContentPack | undefined;
    const latestMarketing = latestOutput.marketing as MarketingAudienceAnalysis | undefined;
    const latestAdsPerformance = latestOutput.adsPerformance as AdsPerformanceReview | undefined;
    const latestWorkflowPackage =
      (latestOutput.workflowPackage as ContentDepartmentWorkflowPackage | undefined) ??
      (latestContentPack && latestMarketing && latestAdsPerformance && latest
        ? buildContentDepartmentWorkflowPackage({
            input: {
              campaignBrief: latest.objective ?? "Mother-and-baby TikTok Campaign",
              productName: String(latest.input?.productName ?? ""),
              targetAudience: String(latest.input?.targetAudience ?? "")
            },
            runKey: latest.run_key,
            approvalKey: String(latestMetadata.approvalKey ?? `${latest.run_key}-human-approval`),
            marketing: latestMarketing,
            contentPack: latestContentPack,
            adsPerformance: latestAdsPerformance
          })
        : undefined);
    const latestApproval = approvals.data.find((approval) => approval.metadata?.workflowRunKey === latest?.run_key || approval.approval_key === latestMetadata.approvalKey);
    const latestAuditLogs = auditLogs.data.filter((log) => !latest?.run_key || log.related_workflow_id === latest.run_key).slice(0, 5);
    const latestMemoryUpdates = [...taskHistory.data, ...companyMemory.data, ...agentMemory.data].filter((memory) => !latest?.run_key || memory.workflow_id === latest.run_key || memory.source_id === latest.run_key).slice(0, 8);
    const latestFeedbackEvents = learningEvents.data.filter((event) => !latest?.run_key || event.workflow_id === latest.run_key).filter((event) => event.metadata?.feedback).slice(0, 5);
    const contentApprovals = approvals.data.filter((approval) => approval.subject.includes("Mother-and-baby"));
    const approvedCount = contentApprovals.filter((approval) => approval.status === "approved").length;
    const rejectedCount = contentApprovals.filter((approval) => approval.status === "changes_requested" || approval.status === "revision_requested" || approval.status === "rejected").length;
    const completedCount = contentRuns.filter((run) => run.status === "completed").length;
    const failedCount = contentRuns.filter((run) => run.status === "failed").length;
    const scoredEvents = learningEvents.data
      .filter((event) => typeof event.score === "number")
      .map((event) => Number(event.score));
    const averageSatisfaction = average(
      learningEvents.data
        .map((event) => event.metadata?.feedback)
        .map((feedback) => (isFeedbackRecord(feedback) ? feedback.workflowSatisfaction : undefined))
        .filter((score): score is number => typeof score === "number")
    );
    const averageOutputScore = average(scoredEvents);
    const averageExecutionMs = average(
      contentRuns
        .map((run) => Number(run.metrics?.executionTimeMs ?? run.metadata?.totalElapsedMs))
        .filter((duration) => Number.isFinite(duration) && duration > 0)
    );
    const completionRate = contentRuns.length ? Math.round((completedCount / contentRuns.length) * 100) : 0;
    const approvalRate = contentApprovals.length ? Math.round((approvedCount / contentApprovals.length) * 100) : 0;
    const operationalAlerts = buildOperationalAlerts({
      persistenceMode: this.context.persistenceMode,
      persistenceReason: this.context.persistenceReason,
      pendingApprovals: contentApprovals.filter((approval) => approval.status === "requested").length,
      failedCount,
      rejectedCount,
      averageOutputScore
    });

    return {
      workspace: {
        id: this.context.workspaceId,
        role: this.context.userRole,
        permissions: this.context.permissions,
        persistenceMode: this.context.persistenceMode,
        persistenceReason: this.context.persistenceReason
      },
      contentDepartment: {
        workflowName: "Content Production Workflow",
        campaignName: "Mother-and-baby TikTok Campaign",
        latestRun: latest,
        recentWorkflows: contentRuns.slice(0, 8).map((run) => ({
          runKey: run.run_key,
          status: run.status,
          objective: run.objective,
          createdAt: run.created_at,
          activeAgent: String(run.metadata?.activeAgent ?? run.output?.activeAgent ?? "workflow-engine"),
          approvalStatus: String(run.metadata?.approvalStatus ?? "not_started")
        })),
        activeAgent: String(latestMetadata.activeAgent ?? latestOutput.activeAgent ?? (latest?.status === "waiting_approval" ? "governance" : latest ? "workflow-engine" : "idle")),
        approvalStatus: latestApproval?.status ?? String(latestMetadata.approvalStatus ?? "not_started"),
        generatedOutputs: latestContentCreator
          ? {
              hooks: latestContentCreator.hooks,
              captions: latestContentCreator.captions,
              scripts: latestContentCreator.scripts,
              assumptions: latestContentCreator.assumptions,
              guardrailNotes: latestContentCreator.guardrailNotes
            }
          : null,
        contentPack: latestContentPack ?? null,
        workflowPackage: latestWorkflowPackage ?? null,
        marketingAnalysis: latestMarketing ?? null,
        adsPerformance: latestAdsPerformance ?? null,
        auditLogSummary: latestAuditLogs.map((log) => ({
          eventType: log.event_type,
          action: log.action,
          summary: log.summary,
          decision: log.decision,
          createdAt: log.created_at
        })),
        memoryUpdateSummary: latestMemoryUpdates.map((memory) => ({
          title: memory.title,
          summary: memory.result_summary ?? memory.content,
          type: memory.memory_type ?? "task_history",
          tags: memory.semantic_tags ?? []
        })),
        feedbackSummary: latestFeedbackEvents.map((event) => ({
          eventType: event.event_type,
          status: event.status,
          score: event.score,
          summary: event.summary,
          feedback: event.metadata?.feedback
        })),
        qualityReviewSummary: buildQualityReviewSummary(latest?.metadata?.qualityEvaluation),
        memoryCurationSummary: buildMemoryCurationSummary(latest?.metadata?.memoryCuration),
        bestPerformingOutputs: getQualityEvaluation(latest?.metadata?.qualityEvaluation)?.bestPerformingOutputs ?? [],
        lowPerformingOutputAlerts: getQualityEvaluation(latest?.metadata?.qualityEvaluation)?.lowPerformingOutputs.map((output) => ({
          outputType: output.outputType,
          outputIndex: output.outputIndex,
          text: output.text,
          weightedScore: output.weightedScore,
          reason: output.feedbackNotes ?? output.improvementSuggestion ?? "Low reviewer score or rejected output."
        })) ?? [],
        operationalMetrics: {
          workflowFrequency: contentRuns.length,
          approvalFrequency: contentApprovals.length,
          rejectionFrequency: rejectedCount,
          averageExecutionTimeMs: averageExecutionMs,
          workflowCompletionRate: completionRate,
          approvalRate,
          userSatisfactionAverage: averageSatisfaction,
          outputScoreAverage: averageOutputScore,
          skillPerformanceTrend: scoredEvents.slice(0, 10)
        },
        operationalAlerts,
        workflowHealthIndicators: [
          { label: "ความสำเร็จของ workflow", value: `${completionRate}%`, status: completionRate >= 80 || contentRuns.length === 0 ? "healthy" : "watch" },
          { label: "คิวอนุมัติ", value: String(contentApprovals.filter((approval) => approval.status === "requested").length), status: contentApprovals.some((approval) => approval.status === "requested") ? "watch" : "healthy" },
          { label: "คุณภาพ output", value: averageOutputScore ? `${averageOutputScore.toFixed(1)}/10` : "ยังไม่มีคะแนน", status: !averageOutputScore || averageOutputScore >= 7 ? "healthy" : "watch" },
          { label: "การบันทึกข้อมูล", value: this.context.persistenceMode, status: this.context.persistenceMode === "configured" ? "healthy" : "degraded" }
        ],
        activeRuns: contentRuns.filter((run) => run.status === "waiting_approval" || run.status === "running").length,
        completedRuns: contentRuns.filter((run) => run.status === "completed").length,
        pendingApprovals: approvals.data.filter((approval) => approval.status === "requested" && approval.subject.includes("Mother-and-baby")).length,
        recentApprovals: approvals.data.slice(0, 5),
        recentAuditLogs: auditLogs.data.slice(0, 5),
        learningEvents: learningEvents.data.slice(0, 5),
        skillImprovementProposals: learningProposals.data
          .filter((proposal) => proposal.proposal_type === "skill_improvement" && proposal.target_id === "hook_generation")
          .slice(0, 5)
          .map((proposal) => ({
            proposalKey: proposal.proposal_key ?? "",
            title: proposal.title ?? "Content Creator skill improvement proposal",
            summary: proposal.summary,
            status: proposal.status ?? "proposed",
            score: proposal.score,
            targetSkillId: proposal.target_id ?? "hook_generation",
            proposedChange: proposal.proposed_change,
            approvalRequired: Boolean(proposal.metadata?.approvalRequired ?? true)
          })),
        memoryUpdates: [...taskHistory.data, ...companyMemory.data, ...agentMemory.data].slice(0, 8)
      },
      realtimeReady: {
        source: "repository_snapshot",
        recommendedChannels: ["workflow_runs", "approvals", "audit_logs", "learning_events", "company_memory"]
      }
    };
  }

  private async ensureContentProductionWorkflowDefinition() {
    const workflow: WorkflowRecord = {
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      workflow_key: contentProductionWorkflowKey,
      slug: "content-production",
      name: "Content Production Workflow",
      purpose: "Reference MVP workflow for campaign brief intake, Marketing AI analysis, Content Creator generation, governance approval, persistence, memory, learning, and dashboard visibility.",
      participating_agents: ["marketing", "content-creator", "ads-performance", "governance", "workflow-engine"],
      definition: {
        steps: [
          "submit_campaign_brief",
          "marketing_audience_analysis",
          "content_creator_generation",
          "ads_performance_campaign_review",
          "governance_approval_checkpoint",
          "human_approval",
          "persist_outputs",
          "memory_update",
          "learning_event",
          "memory_curation",
          "skill_improvement_proposal",
          "dashboard_snapshot"
        ]
      },
      inputs: {
        required: ["campaignBrief"],
        optional: ["productName", "targetAudience", "channel", "contentGoal", "tone", "constraints"]
      },
      outputs: {
        marketing: "Target audience analysis",
        contentCreator: "TikTok hooks, captions, and short scripts",
        adsPerformance: "CTR prediction, targeting suggestions, optimization recommendations, and budget efficiency guardrails",
        governance: "Approval request and decision",
        persistence: "Workflow, approval, memory, learning, and audit records"
      },
      approval_points: [{ step: "governance_approval_checkpoint", required: true, approvers: ["human", "ceo"] }],
      success_metrics: ["workflow_completed", "approval_recorded", "memory_saved", "learning_event_logged", "dashboard_updated"],
      source_path: "src/modules/live-mvp/content-department.ts",
      status: "active",
      metadata: {
        referenceCampaignWorkflowKey: motherBabyCampaignWorkflowKey,
        mvpScope: "Content Department AI"
      }
    };

    await this.workflows.saveWorkflow(workflow);
  }

  private async getApprovedHookGenerationGuidance() {
    const proposals = await this.learning.listProposals(this.context.organizationId);
    return proposals.data
      .filter((proposal) => proposal.status === "approved" && proposal.target_id === "hook_generation")
      .slice(0, 3)
      .flatMap((proposal) => {
        const change = proposal.proposed_change as
          | {
              executionNotes?: string[];
              reusePatterns?: string[];
              avoidPatterns?: string[];
              thaiToneGuidance?: string[];
            }
          | undefined;
        return [
          ...(change?.executionNotes ?? []).map((note) => `Approved Hook Generation guidance: ${note}`),
          ...(change?.reusePatterns ?? []).slice(0, 3).map((pattern) => `Reuse approved hook pattern when relevant: ${pattern}`),
          ...(change?.avoidPatterns ?? []).slice(0, 3).map((pattern) => `Avoid rejected hook pattern: ${pattern}`),
          ...(change?.thaiToneGuidance ?? []).slice(0, 3).map((note) => `Thai tone guidance: ${note}`)
        ];
      });
  }

  private async persistContentReviewMemoryEvent(input: {
    run: WorkflowRunRecord;
    approvalKey: string;
    contentPackReview: ContentPackReviewRecord;
    feedback: ReturnType<typeof normalizeFeedback>;
    qualityEvaluation: ContentQualityEvaluation | undefined;
    decision: Exclude<WorkflowReviewDecision, "changes_requested">;
  }) {
    const outputSummary = summarizeContentPackOutput(input.run.output);
    const learnings = [
      ...input.contentPackReview.approvedPatterns.map((pattern) => `ควรจำ: ${pattern}`),
      ...input.contentPackReview.rejectedPatterns.map((pattern) => `ควรหลีกเลี่ยง: ${pattern}`),
      ...input.contentPackReview.improvementSuggestions.map((suggestion) => `ควรปรับปรุง: ${suggestion}`)
    ].slice(0, 12);

    return this.memory.saveCompanyMemory({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      workflow_id: input.run.run_key,
      title: "Content review memory event",
      content: [
        `Decision: ${input.contentPackReview.status}`,
        `Score: ${input.contentPackReview.score ?? "not scored"}/10`,
        `Reviewer note: ${input.contentPackReview.reviewerNote ?? "none"}`,
        ...learnings
      ].join("\n"),
      memory_type: "content_review",
      source_type: "human_review",
      source_id: input.contentPackReview.contentPackId,
      semantic_tags: ["content-review", "human-review", "content-department", "thai-content", input.contentPackReview.status],
      importance: input.decision === "approved" ? 8 : 9,
      metadata: {
        type: "content_review",
        source: "human_review",
        contentPackId: input.contentPackReview.contentPackId,
        briefSummary: String(input.run.objective ?? "").slice(0, 500),
        outputSummary,
        decision: input.contentPackReview.status,
        reviewerNote: input.contentPackReview.reviewerNote,
        score: input.contentPackReview.score,
        learnings,
        timestamp: input.contentPackReview.reviewedAt,
        approvalKey: input.approvalKey,
        feedback: input.feedback,
        qualityEvaluation: input.qualityEvaluation
      }
    });
  }

  private async persistQualityMemory(
    runKey: string,
    approvalKey: string,
    feedback: ReturnType<typeof normalizeFeedback>,
    qualityEvaluation: ContentQualityEvaluation | undefined,
    memoryCuration: MemoryCurationResult | undefined,
    isApproved: boolean,
    approvalNotes?: string
  ) {
    if (!qualityEvaluation) return [];

    const writes = [];
    if (qualityEvaluation.memoryInsights.highPerformingHooks.length) {
      writes.push(
        await this.memory.saveAgentMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: runKey,
          title: "High-performing Thai TikTok hooks from human review",
          content: qualityEvaluation.memoryInsights.highPerformingHooks.join("\n"),
          memory_type: "successful_hook_pattern",
          source_type: "human_review",
          source_id: runKey,
          semantic_tags: ["content-creator", "successful-hooks", "thai", "tiktok", "mother-baby"],
          importance: 9,
          metadata: { approvalKey, qualityEvaluation, memoryCuration, feedback, approvalNotes, curationKind: "approved_pattern" }
        })
      );
    }

    if (qualityEvaluation.memoryInsights.successfulThaiPhrasing.length) {
      writes.push(
        await this.memory.saveAgentMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: runKey,
          title: "Successful Thai phrasing for mother-and-baby TikTok content",
          content: qualityEvaluation.memoryInsights.successfulThaiPhrasing.join("\n"),
          memory_type: "thai_tone_pattern",
          source_type: "human_review",
          source_id: runKey,
          semantic_tags: ["content-creator", "thai-naturalness", "brand-tone", "tiktok"],
          importance: 8,
          metadata: { approvalKey, qualityEvaluation, memoryCuration, feedback, curationKind: "approved_pattern" }
        })
      );
    }

    if (qualityEvaluation.memoryInsights.rejectedPatterns.length) {
      writes.push(
        await this.memory.saveAgentMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: runKey,
          title: "Rejected Thai TikTok output patterns",
          content: qualityEvaluation.memoryInsights.rejectedPatterns.join("\n"),
          memory_type: "failed_output_pattern",
          source_type: "human_review",
          source_id: runKey,
          semantic_tags: ["content-creator", "rejected-patterns", "thai", "tiktok", "quality-review"],
          importance: isApproved ? 7 : 9,
          metadata: { approvalKey, qualityEvaluation, memoryCuration, feedback, curationKind: "rejected_pattern" }
        })
      );
    }

    if (qualityEvaluation.memoryInsights.optimizationNotes.length || qualityEvaluation.memoryInsights.reviewerFeedback.length) {
      writes.push(
        await this.memory.saveCompanyMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          title: "Content Creator quality optimization notes",
          content: [...qualityEvaluation.memoryInsights.optimizationNotes, ...qualityEvaluation.memoryInsights.reviewerFeedback].join("\n"),
          memory_type: "content_quality_feedback",
          source_type: "human_review",
          source_id: runKey,
          semantic_tags: ["learning-quality-loop", "content-creator", "reviewer-feedback", "thai-content"],
          importance: 8,
          metadata: { approvalKey, qualityEvaluation, memoryCuration, feedback, approvalNotes, curationKind: "reviewer_insight" }
        })
      );
    }

    for (const curated of memoryCuration?.rankedMemories ?? []) {
      if (curated.archiveCandidate) continue;
      writes.push(
        await this.memory.saveAgentMemory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: runKey,
          title: curated.title,
          content: curated.content,
          memory_type: curated.kind,
          source_type: "memory_curation",
          source_id: runKey,
          semantic_tags: curated.tags,
          importance: Math.max(5, Math.min(10, Math.round(curated.usefulnessScore / 10))),
          metadata: {
            approvalKey,
            feedback,
            usefulnessScore: curated.usefulnessScore,
            sourceOutputIndexes: curated.sourceOutputIndexes,
            archiveCandidate: curated.archiveCandidate,
            curationKind: curated.kind
          }
        })
      );
    }

    return writes.map((write) => ({ status: write.status, source: write.source, id: write.data?.id }));
  }

  private async persistSkillImprovementProposal(runKey: string, approvalKey: string, memoryCuration: MemoryCurationResult | undefined) {
    const draft = memoryCuration?.skillImprovementProposal;
    if (!draft) return undefined;

    const saved = await this.learning.saveProposal({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      proposal_key: draft.proposalKey,
      agent_key: "content-creator",
      workflow_id: runKey,
      skill_id: draft.targetSkillId,
      proposal_type: "skill_improvement",
      target_type: "skill",
      target_id: draft.targetSkillId,
      title: draft.title,
      summary: draft.summary,
      status: "proposed",
      score: draft.confidenceScore,
      proposed_change: draft.proposedChange,
      evidence: draft.evidence,
      metadata: {
        approvalKey,
        runKey,
        approvalRequired: draft.approvalRequired,
        governanceNote: "Human approval is required before applying this proposal to Content Creator skill execution notes. SKILLS.md is not modified automatically.",
        memoryCuration
      }
    });

    await this.audit.save({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      actor_agent_key: "learning-system",
      user_id: this.context.userId,
      event_type: "content_creator_skill_improvement_proposed",
      action: "propose_hook_generation_skill_update",
      severity: "medium",
      summary: `Learning system proposed Hook Generation Skill improvement: ${draft.title}`,
      decision: "requires_approval",
      related_workflow_id: runKey,
      metadata: { approvalKey, proposalKey: draft.proposalKey, approvalRequired: true }
    });

    return { status: saved.status, source: saved.source, proposalKey: draft.proposalKey };
  }
}

function buildWorkflowLifecycle(status: "waiting_approval" | "completed" | "rejected" | "revision_requested" | "changes_requested") {
  const waitingApproval = status === "waiting_approval";
  const needsHumanFollowup = status === "changes_requested" || status === "revision_requested" || status === "rejected";
  return [
    { step: "business_request_received", agent: "user", status: "completed" },
    { step: "ceo_strategy", agent: "ceo", status: "completed" },
    { step: "content_ideas", agent: "content-creator", status: "completed" },
    { step: "marketing_review", agent: "marketing", status: "completed" },
    { step: "creative_direction", agent: "design-ai", status: "completed" },
    { step: "user_approval_checkpoint", agent: "governance", status: waitingApproval ? "waiting_approval" : needsHumanFollowup ? status : "completed" },
    { step: "human_approval", agent: "human", status: waitingApproval ? "waiting_approval" : needsHumanFollowup ? status : "completed" },
    { step: "final_output_package", agent: "workflow-engine", status: "completed" },
    { step: "memory_candidate", agent: "memory", status: waitingApproval ? "queued_after_approval" : "completed" },
    { step: "learning_event", agent: "learning", status: waitingApproval ? "pending_human_approval" : "completed" },
    { step: "memory_curation", agent: "memory", status: waitingApproval ? "queued_after_approval" : "completed" },
    { step: "skill_improvement_proposal", agent: "learning", status: waitingApproval ? "pending_human_approval" : "requires_human_approval" },
    { step: "dashboard_snapshot", agent: "dashboard", status: "ready" }
  ];
}

function buildContentDepartmentWorkflowPackage(input: {
  input: LiveContentCampaignInput;
  runKey: string;
  approvalKey: string;
  marketing: MarketingAudienceAnalysis;
  contentPack: ProductionContentPack;
  adsPerformance: AdsPerformanceReview;
}): ContentDepartmentWorkflowPackage {
  const productName = input.input.productName?.trim() || "สินค้าแม่และเด็ก";
  const audience = input.input.targetAudience?.trim() || input.marketing.segment;
  const campaignAngle = input.contentPack.campaignAngle;
  const postIdeas = [
    ...input.contentPack.hooks.slice(0, 5),
    ...input.contentPack.thumbnailTextIdeas.slice(0, 2)
  ].slice(0, 6);
  const captions = input.contentPack.captions.map((caption) => caption.caption).slice(0, 5);
  const marketingReview = [
    input.marketing.contentAngle,
    ...input.marketing.painPoints.slice(0, 2),
    input.adsPerformance.ctrPrediction.rationale
  ].filter(Boolean).slice(0, 5);
  const creativeDirection = [
    `ใช้ภาพแนวตั้ง 9:16 ให้เห็น ${productName} ในบริบทการใช้งานจริง`,
    `เปิดคลิปด้วยปัญหาหรือคำถามของ ${audience} ก่อนเสนอคำตอบ`,
    ...input.contentPack.shootingDirection.slice(0, 4)
  ].filter(Boolean).slice(0, 6);

  return {
    campaignAngle,
    executionState: buildWorkflowExecutionState("waiting_approval"),
    ceoStrategy: `CEO AI วางทิศทางให้แคมเปญนี้ช่วย ${audience} เข้าใจวิธีเลือก ${productName} ด้วยภาษาที่ไม่ขายแรง และหยุดก่อนเผยแพร่เพื่อให้ผู้ใช้อนุมัติ`,
    postIdeas,
    captions,
    marketingReview,
    creativeDirection,
    finalOutputPackage: {
      hooks: input.contentPack.hooks.length,
      captions: input.contentPack.captions.length,
      scripts: input.contentPack.scripts.length,
      creativeDirections: input.contentPack.shootingDirection.length,
      reviewableItems: input.contentPack.packSummary.totalReviewableItems
    },
    nextRequiredApproval: {
      required: true,
      status: "waiting_approval",
      approvalKey: input.approvalKey,
      label: "รอผู้ใช้ตรวจและอนุมัติชุดคอนเทนต์",
      reason: "ระบบยังไม่เผยแพร่หรือใช้งานภายนอกจนกว่าผู้ใช้จะอนุมัติ"
    },
    memoryCandidate: {
      type: "campaign_learning",
      title: "บทเรียนจาก Content Department Workflow",
      summary: `รอผลรีวิวจากผู้ใช้เพื่อบันทึกว่าไอเดีย แคปชัน และแนวทางภาพแบบใดเหมาะกับ ${audience}`,
      approvalRequired: true,
      sourceWorkflowRunKey: input.runKey
    },
    steps: [
      {
        id: "business_request_received",
        label: "รับคำขอธุรกิจ",
        owner: "user",
        status: "completed",
        summary: input.input.campaignBrief
      },
      {
        id: "ceo_strategy",
        label: "CEO AI วางกลยุทธ์",
        owner: "ceo",
        status: "completed",
        summary: `กำหนดมุมแคมเปญและกรอบความเสี่ยงสำหรับ ${productName}`
      },
      {
        id: "content_ideas",
        label: "Content AI สร้างไอเดีย",
        owner: "content-ai",
        status: "completed",
        summary: `เตรียม ${input.contentPack.hooks.length} hook, ${input.contentPack.captions.length} caption และ ${input.contentPack.scripts.length} script`
      },
      {
        id: "marketing_review",
        label: "Marketing AI ตรวจทิศทาง",
        owner: "marketing-ai",
        status: "completed",
        summary: input.marketing.contentAngle
      },
      {
        id: "creative_direction",
        label: "Design AI เสนอแนวทางภาพ",
        owner: "design-ai",
        status: "completed",
        summary: creativeDirection[0] ?? "เสนอแนวทางภาพสำหรับทีมถ่ายทำ"
      },
      {
        id: "user_approval_checkpoint",
        label: "จุดอนุมัติจากผู้ใช้",
        owner: "governance",
        status: "waiting_approval",
        summary: "ต้องตรวจคุณภาพและยืนยันก่อนใช้จริง"
      },
      {
        id: "final_output_package",
        label: "เตรียมแพ็กเกจสุดท้าย",
        owner: "workflow-engine",
        status: "completed",
        summary: `รวม ${input.contentPack.packSummary.totalReviewableItems} รายการให้ตรวจ`
      },
      {
        id: "memory_candidate",
        label: "สร้าง memory candidate",
        owner: "memory",
        status: "queued_after_approval",
        summary: "บันทึกบทเรียนหลังผู้ใช้ให้ feedback หรืออนุมัติ"
      }
    ]
  };
}

function withWorkflowExecutionState(
  workflowPackage: ContentDepartmentWorkflowPackage,
  status: "waiting_approval" | "completed" | "rejected" | "revision_requested" | "changes_requested" | "running" | "approved"
): ContentDepartmentWorkflowPackage {
  const nextApprovalStatus =
    status === "completed" || status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "revision_requested" || status === "changes_requested"
          ? "revision_requested"
          : "waiting_approval";

  return {
    ...workflowPackage,
    executionState: buildWorkflowExecutionState(status),
    nextRequiredApproval: {
      ...workflowPackage.nextRequiredApproval,
      status: nextApprovalStatus
    },
    steps: workflowPackage.steps.map((step) => {
      if (step.id === "user_approval_checkpoint") {
        return {
          ...step,
          status:
            status === "waiting_approval"
              ? "waiting_approval"
              : status === "revision_requested" || status === "changes_requested" || status === "rejected"
                ? "waiting_approval"
                : "completed"
        };
      }
      if (step.id === "memory_candidate") {
        return {
          ...step,
          status: status === "completed" || status === "approved" ? "completed" : "queued_after_approval"
        };
      }
      return step;
    })
  };
}

function buildWorkflowExecutionState(
  status: "waiting_approval" | "completed" | "rejected" | "revision_requested" | "changes_requested" | "running" | "approved"
): ContentDepartmentExecutionState {
  if (status === "completed") {
    return {
      state: "completed",
      currentStepId: "memory_candidate",
      progressPercent: 100,
      nextRequiredAction: "พร้อมใช้เป็นข้อมูลอ้างอิงสำหรับรอบถัดไป"
    };
  }

  if (status === "approved") {
    return {
      state: "approved",
      currentStepId: "final_output_package",
      progressPercent: 85,
      nextRequiredAction: "เตรียมแพ็กเกจสุดท้ายและบันทึกบทเรียน"
    };
  }

  if (status === "running") {
    return {
      state: "executing",
      currentStepId: "content_ideas",
      progressPercent: 45,
      nextRequiredAction: "รอให้ทีม AI เตรียมชุดงานให้ครบก่อนตรวจ"
    };
  }

  if (status === "revision_requested" || status === "changes_requested" || status === "rejected") {
    return {
      state: "review_required",
      currentStepId: "user_approval_checkpoint",
      progressPercent: 70,
      nextRequiredAction: "ปรับเนื้อหาตาม feedback แล้วส่งให้ผู้ใช้ตรวจอีกครั้ง"
    };
  }

  return {
    state: "waiting_for_approval",
    currentStepId: "user_approval_checkpoint",
    progressPercent: 75,
    nextRequiredAction: "ตรวจและอนุมัติชุดคอนเทนต์ก่อนใช้งานจริง"
  };
}

function getWorkflowPackage(value: unknown): ContentDepartmentWorkflowPackage | undefined {
  if (!value || typeof value !== "object") return undefined;
  const maybePackage = value as Partial<ContentDepartmentWorkflowPackage>;
  if (!maybePackage.campaignAngle || !Array.isArray(maybePackage.steps)) return undefined;
  return {
    ...(maybePackage as ContentDepartmentWorkflowPackage),
    executionState: maybePackage.executionState ?? buildWorkflowExecutionState("waiting_approval")
  };
}

function buildFallbackWorkflowPackage(run: WorkflowRunRecord, approvalKey: string): ContentDepartmentWorkflowPackage {
  const output = run.output ?? {};
  const contentPack = output.contentPack as ProductionContentPack | undefined;
  const marketing = output.marketing as MarketingAudienceAnalysis | undefined;
  const adsPerformance = output.adsPerformance as AdsPerformanceReview | undefined;

  if (contentPack && marketing && adsPerformance) {
    return buildContentDepartmentWorkflowPackage({
      input: {
        campaignBrief: run.objective ?? "Mother-and-baby TikTok Campaign",
        productName: String(run.input?.productName ?? ""),
        targetAudience: String(run.input?.targetAudience ?? "")
      },
      runKey: run.run_key,
      approvalKey,
      marketing,
      contentPack,
      adsPerformance
    });
  }

  const executionState = buildWorkflowExecutionState("waiting_approval");
  return {
    campaignAngle: run.objective ?? "Mother-and-baby TikTok Campaign",
    executionState,
    ceoStrategy: "CEO AI เตรียมแผนงาน Content Department เพื่อให้ผู้ใช้ตรวจและอนุมัติก่อนใช้จริง",
    postIdeas: [],
    captions: [],
    marketingReview: [],
    creativeDirection: [],
    finalOutputPackage: {
      hooks: 0,
      captions: 0,
      scripts: 0,
      creativeDirections: 0,
      reviewableItems: 0
    },
    nextRequiredApproval: {
      required: true,
      status: "waiting_approval",
      approvalKey,
      label: "รอผู้ใช้ตรวจและอนุมัติ",
      reason: "ต้องมีการอนุมัติก่อนใช้งานจริง"
    },
    memoryCandidate: {
      type: "campaign_learning",
      title: "บทเรียนจาก Content Department Workflow",
      summary: "รอผลรีวิวจากผู้ใช้ก่อนบันทึกเป็นบทเรียน",
      approvalRequired: true,
      sourceWorkflowRunKey: run.run_key
    },
    steps: [
      { id: "business_request_received", label: "รับคำขอธุรกิจ", owner: "user", status: "completed", summary: run.objective ?? "รับคำขอแล้ว" },
      { id: "ceo_strategy", label: "CEO AI วางกลยุทธ์", owner: "ceo", status: "completed", summary: "เตรียมทิศทางงาน" },
      { id: "content_ideas", label: "Content AI สร้างไอเดีย", owner: "content-ai", status: "completed", summary: "เตรียมเนื้อหา" },
      { id: "marketing_review", label: "Marketing AI ตรวจทิศทาง", owner: "marketing-ai", status: "completed", summary: "ตรวจทิศทางแคมเปญ" },
      { id: "creative_direction", label: "Design AI เสนอแนวทางภาพ", owner: "design-ai", status: "completed", summary: "เตรียมแนวทางภาพ" },
      { id: "user_approval_checkpoint", label: "จุดอนุมัติจากผู้ใช้", owner: "governance", status: "waiting_approval", summary: executionState.nextRequiredAction },
      { id: "final_output_package", label: "เตรียมแพ็กเกจสุดท้าย", owner: "workflow-engine", status: "completed", summary: "เตรียมผลลัพธ์ให้ตรวจ" },
      { id: "memory_candidate", label: "สร้าง memory candidate", owner: "memory", status: "queued_after_approval", summary: "รอบันทึกบทเรียนหลังอนุมัติ" }
    ]
  };
}

function normalizeFeedback(input: WorkflowFeedbackInput) {
  return {
    outputScore: clampTenPointScore(input.outputScore),
    thumbs: input.thumbs,
    workflowSatisfaction: clampTenPointScore(input.workflowSatisfaction),
    qualityNotes: input.qualityNotes?.trim() || undefined,
    rejectionReason: input.rejectionReason?.trim() || undefined
  };
}

function normalizeReviewDecision(decision: WorkflowReviewDecision): Exclude<WorkflowReviewDecision, "changes_requested"> {
  return decision === "changes_requested" ? "revision_requested" : decision;
}

function defaultReviewNote(decision: Exclude<WorkflowReviewDecision, "changes_requested">) {
  if (decision === "approved") return "ผู้รีวิวอนุมัติชุดคอนเทนต์สำหรับใช้งานต่อ";
  if (decision === "rejected") return "ผู้รีวิวปฏิเสธชุดคอนเทนต์นี้";
  return "ผู้รีวิวขอให้แก้ไขชุดคอนเทนต์ก่อนใช้งาน";
}

function buildContentPackReviewRecord(input: {
  run: WorkflowRunRecord;
  status: Exclude<WorkflowReviewDecision, "changes_requested">;
  feedback: ReturnType<typeof normalizeFeedback>;
  qualityEvaluation: ContentQualityEvaluation | undefined;
  memoryCuration: MemoryCurationResult | undefined;
  score?: number;
  reviewedAt: string;
}): ContentPackReviewRecord {
  const contentPackId = String(input.run.metadata?.contentPackId ?? input.run.metadata?.approvalKey ?? `${input.run.run_key}-content-pack`);
  const approvedPatterns = [
    ...(input.memoryCuration?.approvedPatterns ?? []).map((pattern) => pattern.content),
    ...(input.qualityEvaluation?.memoryInsights.highPerformingHooks ?? []),
    ...(input.qualityEvaluation?.memoryInsights.successfulThaiPhrasing ?? [])
  ].filter(Boolean).slice(0, 10);
  const rejectedPatterns = [
    ...(input.memoryCuration?.rejectedPatterns ?? []).map((pattern) => pattern.content),
    ...(input.qualityEvaluation?.memoryInsights.rejectedPatterns ?? [])
  ].filter(Boolean).slice(0, 10);
  const improvementSuggestions = [
    input.feedback.rejectionReason,
    input.feedback.qualityNotes,
    ...(input.qualityEvaluation?.memoryInsights.optimizationNotes ?? []),
    ...(input.qualityEvaluation?.learningInsights ?? [])
  ].filter((item): item is string => Boolean(item?.trim())).slice(0, 10);

  return {
    contentPackId,
    status: input.status,
    reviewerNote: input.feedback.rejectionReason ?? input.feedback.qualityNotes,
    score: input.score,
    approvedPatterns,
    rejectedPatterns,
    improvementSuggestions,
    reviewedAt: input.reviewedAt,
    createdAt: input.run.created_at ?? input.reviewedAt,
    updatedAt: input.reviewedAt
  };
}

function summarizeContentPackOutput(output: Record<string, unknown> | undefined) {
  const contentPack = output?.contentPack as ProductionContentPack | undefined;
  if (!contentPack) return "No content pack summary was available.";
  return [
    `Campaign angle: ${contentPack.campaignAngle}`,
    `Reviewable items: ${contentPack.packSummary.totalReviewableItems}`,
    `Average quality score: ${contentPack.packSummary.averageQualityScore}/10`,
    `Hooks: ${contentPack.hooks.length}, captions: ${contentPack.captions.length}, scripts: ${contentPack.scripts.length}`
  ].join(" ");
}

function clampTenPointScore(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function calculateElapsedMs(createdAt: string | undefined, fallbackEndAt: string) {
  if (!createdAt) return undefined;
  const started = new Date(createdAt).getTime();
  const ended = new Date(fallbackEndAt).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended < started) return undefined;
  return ended - started;
}

function isFeedbackRecord(value: unknown): value is { workflowSatisfaction?: number } {
  return Boolean(value && typeof value === "object");
}

function getQualityEvaluation(value: unknown): ContentQualityEvaluation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const maybeEvaluation = value as Partial<ContentQualityEvaluation>;
  if (maybeEvaluation.scale !== "1-10" || typeof maybeEvaluation.overallScore !== "number" || !Array.isArray(maybeEvaluation.reviewedOutputs)) return undefined;
  return maybeEvaluation as ContentQualityEvaluation;
}

function buildQualityReviewSummary(value: unknown) {
  const evaluation = getQualityEvaluation(value);
  if (!evaluation) return undefined;

  return {
    scale: evaluation.scale,
    overallScore: evaluation.overallScore,
    qualityCategory: evaluation.qualityCategory,
    approvedCount: evaluation.approvedCount,
    rejectedCount: evaluation.rejectedCount,
    reviewedOutputCount: evaluation.reviewedOutputs.length,
    categoryAverages: evaluation.categoryAverages,
    learningInsights: evaluation.learningInsights
  };
}

function getMemoryCuration(value: unknown): MemoryCurationResult | undefined {
  if (!value || typeof value !== "object") return undefined;
  const maybeCuration = value as Partial<MemoryCurationResult>;
  if (!Array.isArray(maybeCuration.rankedMemories) || !Array.isArray(maybeCuration.approvedPatterns) || !Array.isArray(maybeCuration.rejectedPatterns)) return undefined;
  return maybeCuration as MemoryCurationResult;
}

function buildMemoryCurationSummary(value: unknown) {
  const curation = getMemoryCuration(value);
  if (!curation) return undefined;

  return {
    approvedPatternCount: curation.approvedPatterns.length,
    rejectedPatternCount: curation.rejectedPatterns.length,
    reviewerInsightCount: curation.reviewerInsights.length,
    rankedMemoryCount: curation.rankedMemories.length,
    archiveCandidateCount: curation.archiveCandidates.length,
    repeatedIssueAlerts: curation.repeatedIssueAlerts,
    topRankedMemories: curation.rankedMemories.slice(0, 5).map((memory) => ({
      kind: memory.kind,
      title: memory.title,
      content: memory.content,
      usefulnessScore: memory.usefulnessScore,
      tags: memory.tags,
      archiveCandidate: memory.archiveCandidate
    })),
    skillImprovementProposal: curation.skillImprovementProposal
      ? {
          proposalKey: curation.skillImprovementProposal.proposalKey,
          title: curation.skillImprovementProposal.title,
          summary: curation.skillImprovementProposal.summary,
          confidenceScore: curation.skillImprovementProposal.confidenceScore,
          approvalRequired: curation.skillImprovementProposal.approvalRequired
        }
      : undefined
  };
}

function buildOperationalAlerts(input: {
  persistenceMode: string;
  persistenceReason?: string;
  pendingApprovals: number;
  failedCount: number;
  rejectedCount: number;
  averageOutputScore?: number;
}) {
  const alerts: Array<{ level: "info" | "warning" | "critical"; title: string; detail: string }> = [];

  if (input.persistenceMode !== "configured") {
    alerts.push({
      level: "warning",
      title: "กำลังใช้โหมดจำลองข้อมูล",
      detail: input.persistenceReason ?? "ยังไม่ได้ตั้งค่า Supabase ข้อมูลใน memory จะหายเมื่อรีสตาร์ตเซิร์ฟเวอร์"
    });
  }

  if (input.pendingApprovals > 0) {
    alerts.push({
      level: "info",
      title: "มีงานรออนุมัติ",
      detail: `มีคำขออนุมัติ Content Production Workflow ${input.pendingApprovals} รายการที่รอมนุษย์รีวิว`
    });
  }

  if (input.failedCount > 0) {
    alerts.push({
      level: "critical",
      title: "พบ workflow ที่ล้มเหลว",
      detail: `มี workflow ${input.failedCount} รายการที่ควรตรวจสอบก่อนใช้งานต่อในรอบวัน`
    });
  }

  if (input.rejectedCount > 0) {
    alerts.push({
      level: "warning",
      title: "มีงานที่ขอแก้ไข",
      detail: `มี output ${input.rejectedCount} รายการที่ถูกส่งกลับไปแก้ไข ควรอ่าน quality notes ก่อนรันซ้ำ`
    });
  }

  if (input.averageOutputScore !== undefined && input.averageOutputScore < 7) {
    alerts.push({
      level: "warning",
      title: "ควรรีวิวคุณภาพ output",
      detail: `คะแนนเฉลี่ยจากผู้รีวิวคือ ${input.averageOutputScore}/10 ควรตรวจ feedback notes ก่อนนำไปใช้จริง`
    });
  }

  if (!alerts.length) {
    alerts.push({
      level: "info",
      title: "พร้อมสำหรับการใช้งานวันนี้",
      detail: "ยังไม่พบ workflow ล้มเหลวหรือคิวอนุมัติที่ติดค้างใน snapshot ปัจจุบัน"
    });
  }

  return alerts;
}

function ensureTenThaiMotherBabyHooks(existingHooks: string[], productName?: string, audience?: string) {
  const product = productName?.trim() || "ผลิตภัณฑ์แม่และเด็ก";
  const target = audience?.trim() || "คุณแม่ไทย";
  const fallbackHooks = [
    `ก่อนเลือก ${product} ให้ลูก แม่ควรเช็ก 3 เรื่องนี้ก่อน`,
    `คุณแม่มือใหม่มักพลาดจุดนี้เวลาเลือกของให้ลูก`,
    `ถ้ายังไม่มั่นใจว่า ${product} เหมาะกับบ้านคุณไหม ลองดูเช็กลิสต์นี้`,
    `ของสำหรับลูกไม่ควรเลือกจากคำว่า "ขายดี" อย่างเดียว`,
    `3 คำถามที่ควรถามก่อนซื้อสินค้าแม่และเด็ก`,
    `แม่หลายคนสบายใจขึ้นเมื่อรู้ว่าต้องเช็กอะไรบ้าง`,
    `อย่าเพิ่งตัดสินใจ ถ้ายังไม่ได้ดูรายละเอียดข้อนี้`,
    `เลือกของให้ลูกแบบไม่กดดัน เริ่มจากเช็กความเหมาะสมก่อน`,
    `${target} ที่อยากได้ข้อมูลชัด ๆ ควรเริ่มจากจุดนี้`,
    `ถ้าต้องการรายละเอียดก่อนตัดสินใจ ทักมาขอข้อมูลเพิ่มได้`
  ];
  const cleanExisting = existingHooks.map((hook) => hook.trim()).filter(Boolean);
  return [...cleanExisting, ...fallbackHooks.filter((hook) => !cleanExisting.includes(hook))].slice(0, 10);
}

function analyzeMotherBabyAudience(input: LiveContentCampaignInput): MarketingAudienceAnalysis {
  const segment = input.targetAudience?.trim() || "Thai mothers and families researching safe, practical baby-care choices";
  return {
    segment,
    painPoints: [
      "ต้องการข้อมูลที่มั่นใจได้ก่อนเลือกสินค้าเกี่ยวกับแม่และเด็ก",
      "กังวลเรื่องความปลอดภัย ความเหมาะสม และคำกล่าวอ้างที่เกินจริง",
      "ต้องการคำแนะนำที่เข้าใจง่ายและไม่กดดันให้ซื้อทันที"
    ],
    trustTriggers: ["คำอธิบายที่เป็นขั้นตอน", "ข้อควรเช็กก่อนตัดสินใจ", "น้ำเสียงอบอุ่นและไม่โอเวอร์เคลม"],
    objections: ["ยังไม่มั่นใจว่าเหมาะกับลูกหรือครอบครัว", "ไม่อยากเจอคอนเทนต์ขายตรงเกินไป", "ต้องการหลักฐานก่อนเชื่อคำกล่าวอ้าง"],
    contentAngle: "ใช้ checklist และ reassurance framing เพื่อช่วยให้ผู้ชมรู้ว่าควรเช็กอะไร ก่อนตัดสินใจหรือทักมาสอบถาม"
  };
}

function buildApprovalRecord(context: ApiContext, approvalKey: string, runKey: string): ApprovalRecord {
  return {
    organization_id: context.organizationId,
    workspace_id: context.workspaceId,
    approval_key: approvalKey,
    requester_agent_key: "content-creator",
    approver_agent_keys: ["human", "ceo"],
    domain: "publishing",
    subject: "Approve Mother-and-baby TikTok Campaign content package",
    summary: "Review hooks, captions, TikTok scripts, assumptions, and guardrail notes before the output is marked approved.",
      status: "requested",
      decisions: [],
    related_workflow_run_id: undefined,
    metadata: {
      campaignName: "Mother-and-baby TikTok Campaign",
      workflowRunKey: runKey,
      risk: "normal",
      blocksExternalPublishing: true
    }
  };
}
