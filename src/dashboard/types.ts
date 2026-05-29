import type { LucideIcon } from "lucide-react";

export type DashboardSection = "overview" | "agents" | "workflows" | "governance" | "learning" | "operations" | "memory";

export type CompanyHealth = {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "green" | "amber" | "rose" | "violet";
};

export type DashboardAgent = {
  id: string;
  name: string;
  role: string;
  status: "active" | "waiting" | "review" | "idle";
  currentTask: string;
  skillScore: number;
  memoryAccess: string[];
  permission: string;
  workload: number;
  lastEvent: string;
};

export type WorkflowNode = {
  id: string;
  label: string;
  owner: string;
  state: "completed" | "running" | "waiting_approval" | "queued";
  detail: string;
};

export type ApprovalItem = {
  id: string;
  title: string;
  requester: string;
  domain: string;
  risk: "low" | "medium" | "high";
  status: "requested" | "approved" | "changes_requested";
};

export type LearningProposal = {
  id: string;
  title: string;
  target: string;
  score: number;
  status: "proposed" | "approved" | "changes_requested";
  evidence: string;
};

export type OperationItem = {
  id: string;
  name: string;
  type: "scheduled" | "event" | "recommendation" | "monitoring";
  status: "active" | "waiting_approval" | "completed";
  risk: "low" | "medium" | "high";
  nextStep: string;
};

export type MemoryItem = {
  id: string;
  title: string;
  type: "company" | "agent" | "decision" | "workflow";
  relevance: number;
  summary: string;
};

export type MemoryCheckpointCandidate = {
  id: string;
  kind: "approved_campaign_style" | "tone_of_voice" | "preferred_messaging" | "rejected_pattern" | "workflow_preference";
  title: string;
  content: string;
  tags: string[];
  importance: number;
  source: "content_review" | "quality_evaluation" | "memory_curation" | "workflow_feedback";
  editable: boolean;
  save?: boolean;
};

export type MemoryCheckpoint = {
  prompt: "บันทึกสิ่งนี้เป็นความจำของบริษัทหรือไม่?";
  status: "not_ready" | "pending_confirmation" | "saved" | "dismissed";
  sourceWorkflowRunKey: string;
  approvalKey: string;
  candidates: MemoryCheckpointCandidate[];
  savedCandidateIds?: string[];
  confirmedBy?: string;
  confirmedAt?: string;
};

export type TimelineEvent = {
  id: string;
  agent: string;
  event: string;
  time: string;
  icon: LucideIcon;
};

export type LiveDashboardSnapshot = {
  workspace: {
    id: string;
    role: string;
    permissions: string[];
    persistenceMode: "supabase" | "memory" | string;
    persistenceReason?: string;
  };
  contentDepartment: {
    workflowName?: string;
    campaignName: string;
    latestRun?: {
      run_key: string;
      workflow_key: string;
      objective?: string;
      status: string;
      output?: Record<string, unknown>;
      metrics?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
    activeAgent?: string;
    approvalStatus?: string;
    generatedOutputs?: {
      hooks: string[];
      captions: Array<{ caption: string; hashtags: string[] }>;
      scripts: Array<{ title: string; scenes: string[] }>;
      assumptions: string[];
      guardrailNotes: string[];
    } | null;
    contentPack?: {
      schemaVersion: "production-content-pack.v1";
      campaignAngle: string;
      targetAudienceInsight: string;
      hooks: string[];
      captions: Array<{ caption: string; hashtags: string[] }>;
      scripts: Array<{ title: string; scenes: string[] }>;
      ctaOptions: string[];
      thumbnailTextIdeas: string[];
      shootingDirection: string[];
      hashtagSuggestions: string[];
      qualityScores: Array<{
        itemId: string;
        outputType: string;
        outputIndex: number;
        text: string;
        score: number;
        category: string;
        rationale: string;
      }>;
      packSummary: {
        totalReviewableItems: number;
        averageQualityScore: number;
        readyForHumanReview: boolean;
        governanceNotes: string[];
      };
    } | null;
    marketingAnalysis?: {
      segment: string;
      painPoints: string[];
      trustTriggers: string[];
      objections: string[];
      contentAngle: string;
    } | null;
    adsPerformance?: {
      ctrPrediction: {
        expectedRange: string;
        confidence: number;
        rationale: string;
      };
      audienceTargeting: {
        primarySegment: string;
        testSegments: string[];
        exclusions: string[];
      };
      creativePerformance: {
        strongestHooks: string[];
        weakSignals: string[];
        contentFeedback: string[];
      };
      optimizationSuggestions: string[];
      budgetEfficiency: {
        recommendation: string;
        riskLevel: "low" | "medium" | "high";
        guardrail: string;
      };
      reportingSummary: string;
      learningSignals: string[];
      governanceNotes: string[];
    } | null;
    auditLogSummary?: Array<{
      eventType: string;
      action?: string;
      summary: string;
      decision?: string;
      createdAt?: string;
    }>;
    memoryUpdateSummary?: Array<{
      title: string;
      summary?: string;
      type?: string;
      tags?: string[];
    }>;
    memoryCheckpoint?: MemoryCheckpoint | null;
    feedbackSummary?: Array<{
      eventType?: string;
      status?: string;
      score?: number;
      summary: string;
      feedback?: unknown;
    }>;
    qualityReviewSummary?: {
      scale: "1-10";
      overallScore: number;
      qualityCategory: string;
      approvedCount: number;
      rejectedCount: number;
      reviewedOutputCount: number;
      categoryAverages: Record<string, number>;
      learningInsights: string[];
    };
    memoryCurationSummary?: {
      approvedPatternCount: number;
      rejectedPatternCount: number;
      reviewerInsightCount: number;
      rankedMemoryCount: number;
      archiveCandidateCount: number;
      repeatedIssueAlerts: string[];
      topRankedMemories: Array<{
        kind: string;
        title: string;
        content: string;
        usefulnessScore: number;
        tags: string[];
        archiveCandidate: boolean;
      }>;
      skillImprovementProposal?: {
        proposalKey: string;
        title: string;
        summary: string;
        confidenceScore: number;
        approvalRequired: true;
      };
    };
    bestPerformingOutputs?: Array<{
      outputType: string;
      outputIndex: number;
      text: string;
      weightedScore: number;
      qualityCategory: string;
    }>;
    lowPerformingOutputAlerts?: Array<{
      outputType: string;
      outputIndex: number;
      text: string;
      weightedScore: number;
      reason: string;
    }>;
    recentWorkflows?: Array<{
      runKey: string;
      status: string;
      objective?: string;
      createdAt?: string;
      activeAgent: string;
      approvalStatus: string;
    }>;
    operationalMetrics?: {
      workflowFrequency: number;
      approvalFrequency: number;
      rejectionFrequency: number;
      averageExecutionTimeMs?: number;
      workflowCompletionRate: number;
      approvalRate: number;
      userSatisfactionAverage?: number;
      outputScoreAverage?: number;
      skillPerformanceTrend: number[];
    };
    operationalAlerts?: Array<{
      level: "info" | "warning" | "critical";
      title: string;
      detail: string;
    }>;
    workflowHealthIndicators?: Array<{
      label: string;
      value: string;
      status: "healthy" | "watch" | "degraded";
    }>;
    activeRuns: number;
    completedRuns: number;
    pendingApprovals: number;
    recentApprovals: Array<{
      approval_key: string;
      requester_agent_key: string;
      domain: string;
      subject: string;
      summary?: string;
      status: string;
      metadata?: Record<string, unknown>;
    }>;
    recentAuditLogs: Array<{
      event_type: string;
      action: string;
      summary: string;
      decision?: string;
      created_at?: string;
    }>;
    learningEvents: Array<{
      event_type: string;
      summary: string;
      status: string;
      score?: number;
      metadata?: Record<string, unknown>;
    }>;
    skillImprovementProposals?: Array<{
      proposalKey: string;
      title: string;
      summary: string;
      status: string;
      score?: number;
      targetSkillId: string;
      proposedChange?: Record<string, unknown>;
      approvalRequired: boolean;
    }>;
    memoryUpdates: Array<{
      title: string;
      result_summary?: string;
      content?: string;
      memory_type?: string;
      semantic_tags?: string[];
      importance?: number;
      metadata?: Record<string, unknown>;
    }>;
  };
  realtimeReady: {
    source: string;
    recommendedChannels: string[];
  };
};
