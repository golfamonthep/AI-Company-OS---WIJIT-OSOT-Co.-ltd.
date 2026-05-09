-- Authentication, workspace, and RBAC foundation.
-- Supabase Auth owns auth.users; public.profiles stores app-facing profile data.

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  display_name text not null default 'User',
  avatar_url text,
  locale text not null default 'en',
  timezone text not null default 'Asia/Bangkok',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.profiles add column if not exists email text;
alter table if exists public.profiles add column if not exists organization_id uuid;
alter table if exists public.profiles add column if not exists display_name text not null default 'User';
alter table if exists public.profiles add column if not exists avatar_url text;
alter table if exists public.profiles add column if not exists locale text not null default 'en';
alter table if exists public.profiles add column if not exists timezone text not null default 'Asia/Bangkok';
alter table if exists public.profiles add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  name text not null,
  slug text not null,
  owner_user_id uuid,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table if not exists public.workspace_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  description text,
  rank integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_key text not null references public.workspace_roles(role_key) on delete cascade,
  permission_key text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (role_key, permission_key)
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role_key text not null references public.workspace_roles(role_key),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  invited_by uuid,
  joined_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  default_workspace_id uuid references public.workspaces(id) on delete set null,
  locale text not null default 'en',
  timezone text not null default 'Asia/Bangkok',
  dashboard_settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, setting_key)
);

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role_key text not null references public.workspace_roles(role_key),
  token_hash text,
  invited_by uuid,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.workspace_roles (role_key, name, description, rank)
values
  ('owner', 'Owner', 'Full workspace control and high-impact approval authority.', 100),
  ('admin', 'Admin', 'Manage agents and workflows, approve normal operations.', 80),
  ('manager', 'Manager', 'Review workflows and approve content or reports.', 60),
  ('operator', 'Operator', 'Run workflows, submit tasks, and view dashboards.', 40),
  ('viewer', 'Viewer', 'Read-only workspace access.', 10)
on conflict (role_key) do update set
  name = excluded.name,
  description = excluded.description,
  rank = excluded.rank;

insert into public.role_permissions (role_key, permission_key, description)
values
  ('owner', 'workspace:manage', 'Manage workspace settings and membership.'),
  ('owner', 'approval:approve_all', 'Approve all action impact levels.'),
  ('owner', 'integration:write', 'Allow connector write and external actions.'),
  ('admin', 'agent:manage', 'Manage workspace agents.'),
  ('admin', 'workflow:manage', 'Manage workspace workflows.'),
  ('admin', 'approval:approve_normal', 'Approve normal operations.'),
  ('manager', 'workflow:review', 'Review workflow results.'),
  ('manager', 'approval:approve_content', 'Approve content and reports.'),
  ('operator', 'workflow:start', 'Start allowed workflows.'),
  ('operator', 'operations:run', 'Run approved operations.'),
  ('viewer', 'dashboard:view', 'View dashboard data.'),
  ('viewer', 'workspace:view', 'View workspace information.')
on conflict (role_key, permission_key) do update set description = excluded.description;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.workspace_members enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.workspace_invitations enable row level security;

create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);
create index if not exists idx_workspace_invitations_workspace_id on public.workspace_invitations(workspace_id);
