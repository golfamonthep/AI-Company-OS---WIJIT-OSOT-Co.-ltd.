import type { MemoryItem } from "@/modules/memory/types";

export type ContentPipelineState =
  | "objective_received"
  | "memory_retrieved"
  | "audience_analyzed"
  | "strategy_generated"
  | "ideas_generated"
  | "scripts_generated"
  | "captions_generated"
  | "thumbnails_generated"
  | "schedule_generated"
  | "kpi_predicted"
  | "waiting_for_human_approval"
  | "learning_saved"
  | "completed";

export type ContentPipelineArtifactType =
  | "audience_analysis"
  | "content_strategy"
  | "content_ideas"
  | "scripts"
  | "captions"
  | "thumbnail_ideas"
  | "posting_schedule"
  | "kpi_predictions"
  | "learning_summary";

export type ContentPipelineInput = {
  organizationId: string;
  objective: string;
  productName?: string;
  targetAudience?: string;
  channels?: string[];
  createdByAgentId?: string;
  createdByUserId?: string;
  humanApprovalMode?: boolean;
};

export type ContentPipelineArtifact = {
  type: ContentPipelineArtifactType;
  ownerAgentRole: "ceo" | "marketing" | "content-creator" | "video-editor" | "ads-performance";
  title: string;
  body: Record<string, unknown>;
  requiresHumanApproval?: boolean;
};

export type ContentPipelineAnalytics = {
  predictedReach: number;
  predictedEngagementRate: number;
  predictedConversionRate: number;
  confidence: number;
  assumptions: string[];
};

export type ContentPipelineResult = {
  runId: string;
  organizationId: string;
  objective: string;
  productName?: string;
  targetAudience: string;
  channels: string[];
  state: ContentPipelineState;
  approvalStatus: "requested" | "approved";
  memoryContext: MemoryItem[];
  states: Array<{ state: ContentPipelineState; ownerAgentRole: string; summary: string }>;
  artifacts: ContentPipelineArtifact[];
  analytics: ContentPipelineAnalytics;
  learning: {
    lesson: string;
    tags: string[];
    approvedForMemory: boolean;
  };
};
