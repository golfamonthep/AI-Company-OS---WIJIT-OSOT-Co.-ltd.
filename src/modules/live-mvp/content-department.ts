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

export type WorkflowReviewDecision = "approved" | "changes_requested";

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

export type LiveContentWorkflowResult = {
  runKey: string;
  approvalKey: string;
  status: "waiting_approval" | "completed" | "changes_requested";
  campaignName: "Mother-and-baby TikTok Campaign";
  marketing: MarketingAudienceAnalysis;
  adsPerformance: AdsPerformanceReview;
  contentPack: ProductionContentPack;
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

    const decision: WorkflowReviewDecision = input.decision ?? "approved";
    const isApproved = decision === "approved";
    const workflowStatus = isApproved ? "completed" : "changes_requested";
    const feedback = normalizeFeedback(input);
    const qualityEvaluation = evaluateContentOutputs(input.contentReviews);
    const memoryCuration = curateContentCreatorMemory({ evaluation: qualityEvaluation, runKey: input.runKey });
    const effectiveOutputScore = qualityEvaluation?.overallScore ?? feedback.outputScore;
    const approvalKey = `${input.runKey}-human-approval`;
    const approval = await this.approvals.findByKey(this.context.organizationId, approvalKey);
    const completedRun = await this.workflows.saveRun({
      ...run.data,
      status: workflowStatus,
      output: {
        ...(run.data.output ?? {}),
        lifecycle: buildWorkflowLifecycle(workflowStatus),
        activeAgent: "workflow-engine",
        approval: {
          status: decision,
          approvedBy: this.context.userId ?? "demo-user",
          notes: input.approvalNotes ?? (isApproved ? "Approved for MVP content package use." : "Changes requested before approval."),
          decidedAt: new Date().toISOString(),
          feedback,
          qualityEvaluation,
          memoryCuration
        }
      },
      metrics: {
        ...(run.data.metrics ?? {}),
        approvalRequired: !isApproved,
        approved: isApproved,
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
        feedback,
        qualityEvaluation,
        memoryCuration,
        totalElapsedMs: calculateElapsedMs(run.data.created_at, new Date().toISOString()),
        completedAt: isApproved ? new Date().toISOString() : undefined,
        changesRequestedAt: isApproved ? undefined : new Date().toISOString()
      }
    });

    const completedApproval: ApprovalRecord = {
      ...(approval.data ?? buildApprovalRecord(this.context, approvalKey, input.runKey)),
      status: decision,
      decisions: [
        {
          approverId: this.context.userId ?? "human",
          decision,
          notes: input.approvalNotes ?? (isApproved ? "Approved." : "Changes requested."),
          rejectionReason: feedback.rejectionReason,
          outputScore: effectiveOutputScore,
          thumbs: feedback.thumbs,
          workflowSatisfaction: feedback.workflowSatisfaction,
          qualityNotes: feedback.qualityNotes,
          qualityEvaluation,
          memoryCuration,
          decidedAt: new Date().toISOString()
        }
      ],
      metadata: {
        ...(approval.data?.metadata ?? {}),
        feedback,
        qualityEvaluation,
        memoryCuration,
        decidedAt: new Date().toISOString(),
        approvedAt: isApproved ? new Date().toISOString() : undefined
      }
    };
    const approvalSaved = await this.approvals.saveApproval(completedApproval);
    const memoryWrites = await this.persistQualityMemory(input.runKey, approvalKey, feedback, qualityEvaluation, memoryCuration, isApproved, input.approvalNotes);
    const proposalSaved = await this.persistSkillImprovementProposal(input.runKey, approvalKey, memoryCuration);
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
          metadata: { approvalKey, approvalNotes: input.approvalNotes, feedback, qualityEvaluation, memoryCuration, memoryWrites, proposalSaved }
        })
      : await this.memory.saveTaskHistory({
          organization_id: this.context.organizationId,
          workspace_id: this.context.workspaceId,
          agent_key: "content-creator",
          workflow_id: input.runKey,
          title: "Mother-and-baby TikTok campaign changes requested",
          task_intent: "Human reviewer requested changes before approval.",
          input: { runKey: input.runKey },
          output: { feedback, qualityEvaluation },
          result_summary: `${feedback.rejectionReason ?? feedback.qualityNotes ?? "Reviewer requested changes before approval."} ${summarizeQualityEvaluation(qualityEvaluation)}`,
          semantic_tags: ["changes-requested", "content-department", "mother-baby", "tiktok", "feedback"],
          metadata: { status: "changes_requested", approvalKey, feedback, qualityEvaluation, memoryCuration, memoryWrites, proposalSaved }
        });
    const learningSaved = await this.learning.saveEvent({
      organization_id: this.context.organizationId,
      workspace_id: this.context.workspaceId,
      agent_key: "content-creator",
      workflow_id: input.runKey,
      event_type: isApproved ? "content_campaign_approved" : "content_campaign_changes_requested",
      summary: isApproved
        ? `Human approved the live Content Department MVP campaign output. ${summarizeQualityEvaluation(qualityEvaluation)}`
        : `Human requested changes on the live Content Department MVP campaign output. ${summarizeQualityEvaluation(qualityEvaluation)}`,
      status: decision,
      score: effectiveOutputScore,
      evidence: [feedback, qualityEvaluation].filter(Boolean),
      metadata: { approvalKey, workflowName: "Content Production Workflow", feedback, qualityEvaluation, memoryCuration, memoryWrites, proposalSaved }
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
      event_type: isApproved ? "live_content_workflow_approved" : "live_content_workflow_changes_requested",
      action: isApproved ? "approve_mother_baby_tiktok_campaign" : "request_changes_mother_baby_tiktok_campaign",
      severity: "medium",
      summary: isApproved ? "ผู้รีวิวอนุมัติ output ของ Mother-and-baby TikTok Campaign" : "ผู้รีวิวขอแก้ไข output ของ Mother-and-baby TikTok Campaign",
      decision,
      related_workflow_id: input.runKey,
      metadata: { approvalKey, approvalNotes: input.approvalNotes, feedback, qualityEvaluation, memoryCuration, proposalSaved }
    });

    structuredLogger.info({
      layer: "governance",
      event: isApproved ? "live_content_workflow_approved" : "live_content_workflow_changes_requested",
      message: isApproved ? "Human approval completed for Mother-and-baby TikTok Campaign." : "Human requested changes for Mother-and-baby TikTok Campaign.",
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
      persistence: {
        workflowRun: completedRun.status,
        approval: approvalSaved.status,
        memory: memorySaved.status,
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
    const latestApproval = approvals.data.find((approval) => approval.metadata?.workflowRunKey === latest?.run_key || approval.approval_key === latestMetadata.approvalKey);
    const latestAuditLogs = auditLogs.data.filter((log) => !latest?.run_key || log.related_workflow_id === latest.run_key).slice(0, 5);
    const latestMemoryUpdates = [...taskHistory.data, ...companyMemory.data, ...agentMemory.data].filter((memory) => !latest?.run_key || memory.workflow_id === latest.run_key || memory.source_id === latest.run_key).slice(0, 8);
    const latestFeedbackEvents = learningEvents.data.filter((event) => !latest?.run_key || event.workflow_id === latest.run_key).filter((event) => event.metadata?.feedback).slice(0, 5);
    const contentApprovals = approvals.data.filter((approval) => approval.subject.includes("Mother-and-baby"));
    const approvedCount = contentApprovals.filter((approval) => approval.status === "approved").length;
    const rejectedCount = contentApprovals.filter((approval) => approval.status === "changes_requested").length;
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

function buildWorkflowLifecycle(status: "waiting_approval" | "completed" | "changes_requested") {
  const waitingApproval = status === "waiting_approval";
  const changesRequested = status === "changes_requested";
  return [
    { step: "submit_campaign_brief", agent: "user", status: "completed" },
    { step: "marketing_audience_analysis", agent: "marketing", status: "completed" },
    { step: "content_creator_generation", agent: "content-creator", status: "completed" },
    { step: "ads_performance_campaign_review", agent: "ads-performance", status: "completed" },
    { step: "governance_approval_checkpoint", agent: "governance", status: "completed" },
    { step: "human_approval", agent: "human", status: waitingApproval ? "waiting_approval" : changesRequested ? "changes_requested" : "completed" },
    { step: "persist_outputs", agent: "workflow-engine", status: "completed" },
    { step: "memory_update", agent: "memory", status: waitingApproval ? "queued_after_approval" : "completed" },
    { step: "learning_event", agent: "learning", status: waitingApproval ? "pending_human_approval" : "completed" },
    { step: "memory_curation", agent: "memory", status: waitingApproval ? "queued_after_approval" : "completed" },
    { step: "skill_improvement_proposal", agent: "learning", status: waitingApproval ? "pending_human_approval" : "requires_human_approval" },
    { step: "dashboard_snapshot", agent: "dashboard", status: "ready" }
  ];
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
