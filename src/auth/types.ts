export type WorkspaceRole = "owner" | "admin" | "manager" | "operator" | "viewer";

export type Permission =
  | "workspace:manage"
  | "workspace:view"
  | "agent:manage"
  | "agent:view"
  | "workflow:manage"
  | "workflow:start"
  | "workflow:review"
  | "workflow:view"
  | "memory:write"
  | "memory:view"
  | "approval:approve_all"
  | "approval:approve_normal"
  | "approval:approve_content"
  | "approval:view"
  | "integration:manage"
  | "integration:read"
  | "integration:write"
  | "operations:run"
  | "operations:view"
  | "dashboard:view";

export type ApprovalImpact = "low" | "normal" | "high";

export type AuthUser = {
  id: string;
  email?: string;
  displayName: string;
  isMocked: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken?: string;
  expiresAt?: string;
  isMocked: boolean;
};

export type Workspace = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  ownerUserId: string;
  status: "active" | "paused" | "archived";
  settings?: Record<string, unknown>;
};

export type WorkspaceMembership = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: "active" | "invited" | "disabled";
};

export type WorkspaceContext = {
  user: AuthUser;
  session: AuthSession;
  workspace: Workspace;
  membership: WorkspaceMembership;
  permissions: Permission[];
  readOnly: boolean;
  approvalAuthority: ApprovalImpact[];
};

export type UserProfile = {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
};
