import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyAgentId } from "@/modules/agent-runtime/governance/types";

export type LearningSourceType = "successful_output" | "failed_output" | "human_feedback" | "workflow_result" | "approval_pattern" | "kpi_result" | "collaboration_outcome" | "correction_pattern";

export type LearningImprovementType = "skill_improvement" | "workflow_optimization" | "memory_optimization" | "collaboration_optimization" | "prompt_refinement" | "decision_quality";

export type LearningReviewStatus = "proposed" | "approved" | "rejected" | "changes_requested" | "archived";

export type LearningRiskLevel = "low" | "medium" | "high" | "blocked";

export type LearningExecutionOutcome = {
  outcomeId: string;
  organizationId: string;
  agentId: CompanyAgentId;
  workflowId?: string;
  taskId?: string;
  skillId?: string;
  objective: string;
  status: "success" | "partial" | "failure";
  outputSummary: string;
  qualityScore?: number;
  kpiResults?: Record<string, number | string>;
  approvalStatus?: "approved" | "rejected" | "changes_requested" | "pending";
  errors?: string[];
  correctionNotes?: string[];
  memoryReferences?: string[];
  createdAt: string;
};

export type HumanFeedbackInput = {
  feedbackId?: string;
  organizationId: string;
  reviewerId: string;
  agentId: CompanyAgentId;
  workflowId?: string;
  taskId?: string;
  skillId?: string;
  itemId: string;
  score: number;
  approvedCount?: number;
  rejectedCount?: number;
  approvedPatterns?: string[];
  rejectedReasons?: string[];
  comments: string;
  createdAt?: string;
};

export type ProcessedFeedback = {
  feedbackId: string;
  organizationId: string;
  sourceType: LearningSourceType;
  agentId: CompanyAgentId;
  workflowId?: string;
  taskId?: string;
  skillId?: string;
  itemId: string;
  normalizedScore: number;
  category: "positive" | "negative" | "mixed" | "neutral";
  strengths: string[];
  weaknesses: string[];
  actionHints: string[];
  createdAt: string;
};

export type LearningInsight = {
  insightId: string;
  organizationId: string;
  type: LearningImprovementType;
  sourceTypes: LearningSourceType[];
  targetAgentId?: CompanyAgentId;
  targetSkillId?: string;
  targetWorkflowId?: string;
  confidence: number;
  riskLevel: LearningRiskLevel;
  summary: string;
  evidence: string[];
  recommendedAction: string;
  createdAt: string;
};

export type SkillPerformanceMetric = {
  organizationId: string;
  agentId: CompanyAgentId;
  skillId: string;
  executions: number;
  successes: number;
  failures: number;
  partials: number;
  averageQualityScore: number;
  successRate: number;
  trend: "new" | "improving" | "stable" | "declining";
  lastUpdated: string;
};

export type ImprovementProposal = {
  proposalId: string;
  organizationId: string;
  type: LearningImprovementType;
  targetType: "skill" | "workflow" | "memory" | "collaboration" | "prompt" | "decision";
  targetId: string;
  title: string;
  summary: string;
  rationale: string;
  proposedChange: string;
  expectedBenefit: string;
  createdByAgentId: CompanyAgentId | "learning-system";
  status: LearningReviewStatus;
  riskLevel: LearningRiskLevel;
  requiresHumanApproval: true;
  safeguards: string[];
  evidence: string[];
  reviewerId?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryRefinementSuggestion = {
  suggestionId: string;
  organizationId: string;
  memoryId: string;
  action: "promote" | "archive" | "merge" | "retag" | "keep";
  reason: string;
  confidence: number;
  requiresReview: true;
  createdAt: string;
};

export type LearningAuditEvent = {
  auditId: string;
  organizationId: string;
  actorId: CompanyAgentId | "human" | "learning-system";
  eventType: string;
  summary: string;
  sourceType?: LearningSourceType;
  proposalId?: string;
  targetId?: string;
  status?: LearningReviewStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type LearningRuntimeContext = {
  supabase: SupabaseClient | null;
};
