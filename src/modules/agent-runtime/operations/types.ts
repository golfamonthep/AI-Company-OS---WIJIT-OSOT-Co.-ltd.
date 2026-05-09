import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApprovalDomain, CompanyAgentId, GovernanceApprovalRequest, GovernanceEvaluation } from "@/modules/agent-runtime/governance/types";

export type OperationType = "scheduled" | "event_driven" | "recommendation" | "monitoring";

export type OperationStatus = "scheduled" | "triggered" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled";

export type OperationRiskLevel = "low" | "medium" | "high" | "critical";

export type OperationImpactLevel = "low" | "medium" | "high";

export type OperationSignal = {
  signalId: string;
  organizationId: string;
  source: "task" | "workflow" | "kpi" | "agent" | "memory" | "learning" | "finance" | "campaign";
  name: string;
  value: number | string | boolean;
  threshold?: number | string;
  severity: OperationRiskLevel;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type OperationsSnapshot = {
  organizationId: string;
  tasks: {
    backlog: number;
    overdue: number;
    blocked: number;
  };
  workflows: {
    running: number;
    failed: number;
    waitingApproval: number;
    completedThisWeek: number;
  };
  kpis: Array<{
    name: string;
    current: number;
    target: number;
    direction: "up" | "down" | "flat";
  }>;
  agents: Array<{
    agentId: CompanyAgentId;
    activeTasks: number;
    blockedTasks: number;
    performanceScore: number;
  }>;
  memory: {
    staleItems: number;
    lowQualityItems: number;
  };
  createdAt: string;
};

export type OperationTrigger = {
  triggerId: string;
  organizationId: string;
  type: OperationType;
  name: string;
  condition: string;
  workflowId?: string;
  status: "active" | "paused";
  lastTriggeredAt?: string;
  metadata?: Record<string, unknown>;
};

export type ScheduledOperation = {
  scheduleId: string;
  organizationId: string;
  name: string;
  workflowId: string;
  cadence: "daily" | "weekly" | "monthly";
  ownerAgentId: CompanyAgentId;
  nextRunAt: string;
  status: "active" | "paused";
  lowRisk: boolean;
  createdAt: string;
};

export type OperationRecommendation = {
  recommendationId: string;
  organizationId: string;
  title: string;
  summary: string;
  recommendedAction: string;
  operationType: OperationType;
  impact: OperationImpactLevel;
  urgency: OperationImpactLevel;
  score: number;
  riskLevel: OperationRiskLevel;
  requiresApproval: boolean;
  approvalDomain: ApprovalDomain;
  evidence: string[];
  createdByAgentId: CompanyAgentId | "operations-system";
  createdAt: string;
};

export type OperationsRiskAssessment = {
  riskId: string;
  organizationId: string;
  actionSummary: string;
  riskLevel: OperationRiskLevel;
  highImpact: boolean;
  approvalRequired: boolean;
  approvalDomain: ApprovalDomain;
  reasons: string[];
  blockedActions: string[];
  governanceEvaluation?: GovernanceEvaluation;
  createdAt: string;
};

export type OperationRun = {
  runId: string;
  organizationId: string;
  operationType: OperationType;
  workflowId?: string;
  title: string;
  status: OperationStatus;
  trigger?: OperationTrigger;
  schedule?: ScheduledOperation;
  recommendations: OperationRecommendation[];
  risks: OperationsRiskAssessment[];
  approvals: GovernanceApprovalRequest[];
  report?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type OperationsLogEvent = {
  eventId: string;
  organizationId: string;
  runId?: string;
  eventType: string;
  actorId: CompanyAgentId | "operations-system" | "human";
  summary: string;
  status?: OperationStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type OperationsRuntimeContext = {
  supabase: SupabaseClient | null;
};
