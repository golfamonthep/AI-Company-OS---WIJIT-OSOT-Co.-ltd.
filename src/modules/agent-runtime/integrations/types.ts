import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApprovalDomain, CompanyAgentId, GovernanceEvaluation } from "@/modules/agent-runtime/governance/types";

export type ConnectorProvider =
  | "google_workspace"
  | "social_platform"
  | "advertising_platform"
  | "business_tool";

export type ConnectorAuthType = "oauth2" | "api_key" | "webhook" | "manual_stub";

export type ConnectorActionType = "read" | "write" | "external_action";

export type ConnectorExecutionStatus = "success" | "failed" | "denied" | "requires_approval" | "rate_limited" | "unsupported";

export type ConnectorId =
  | "google-gmail"
  | "google-drive"
  | "google-docs"
  | "google-sheets"
  | "google-calendar"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "instagram"
  | "meta-ads"
  | "google-ads"
  | "tiktok-ads"
  | "notion"
  | "slack"
  | "shopify"
  | "stripe"
  | "line-oa";

export type ConnectorAction = {
  actionId: string;
  name: string;
  type: ConnectorActionType;
  description: string;
  requiresApproval: boolean;
  approvalDomain: ApprovalDomain;
};

export type ConnectorDefinition = {
  connectorId: ConnectorId;
  provider: ConnectorProvider;
  name: string;
  authType: ConnectorAuthType;
  permissions: string[];
  readActions: ConnectorAction[];
  writeActions: ConnectorAction[];
  approvalRequirements: string[];
  rateLimitStrategy: string;
  errorHandling: string[];
  auditLogging: string[];
  governancePolicy: string;
  enabled: boolean;
  stubOnly: boolean;
};

export type ConnectorPermissionRequest = {
  organizationId: string;
  agentId: CompanyAgentId;
  connectorId: ConnectorId;
  actionId: string;
  actionType: ConnectorActionType;
  approved?: boolean;
  summary: string;
  metadata?: Record<string, unknown>;
};

export type ConnectorPermissionResult = {
  allowed: boolean;
  status: ConnectorExecutionStatus;
  reason: string;
  requiresApproval: boolean;
  approvalDomain: ApprovalDomain;
  governanceEvaluation?: GovernanceEvaluation;
};

export type ConnectorExecutionTask<TInput = Record<string, unknown>> = ConnectorPermissionRequest & {
  input: TInput;
  idempotencyKey?: string;
};

export type ConnectorExecutionResult<TOutput = Record<string, unknown>> = {
  executionId: string;
  organizationId: string;
  agentId: CompanyAgentId;
  connectorId: ConnectorId;
  actionId: string;
  status: ConnectorExecutionStatus;
  output?: TOutput;
  error?: string;
  auditSummary: string;
  startedAt: string;
  completedAt: string;
  metadata?: Record<string, unknown>;
};

export type OAuthConnectorConfig = {
  connectorId: ConnectorId;
  authType: ConnectorAuthType;
  scopes: string[];
  authorizationUrl?: string;
  tokenUrl?: string;
  redirectUriEnvKey?: string;
  clientIdEnvKey?: string;
  clientSecretEnvKey?: string;
  configured: boolean;
};

export type ConnectorRateLimitState = {
  connectorId: ConnectorId;
  actionId: string;
  windowMs: number;
  maxRequests: number;
  currentRequests: number;
  resetAt: string;
};

export type ConnectorAuditEvent = {
  auditId: string;
  organizationId: string;
  agentId: CompanyAgentId;
  connectorId: ConnectorId;
  actionId: string;
  actionType: ConnectorActionType;
  status: ConnectorExecutionStatus;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ConnectorRuntimeContext = {
  supabase: SupabaseClient | null;
};
