-- Canonical governance persistence additions.

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  approval_key text not null,
  requester_agent_key text not null,
  approver_agent_keys text[] not null default '{}',
  domain text not null,
  subject text not null,
  summary text not null,
  status text not null default 'requested',
  decisions jsonb not null default '[]'::jsonb,
  related_workflow_run_id uuid,
  related_task_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, approval_key)
);

alter table if exists public.audit_logs add column if not exists actor_agent_key text;
alter table if exists public.audit_logs add column if not exists event_type text;
alter table if exists public.audit_logs add column if not exists severity text not null default 'info';
alter table if exists public.audit_logs add column if not exists decision text;
alter table if exists public.audit_logs add column if not exists related_workflow_id text;
alter table if exists public.audit_logs add column if not exists related_task_id text;
alter table if exists public.audit_logs add column if not exists summary text;

create index if not exists approvals_org_status_idx on public.approvals(organization_id, status, created_at desc);
create index if not exists approvals_domain_idx on public.approvals(organization_id, domain, status);
create index if not exists audit_logs_org_created_idx on public.audit_logs(organization_id, created_at desc);
create index if not exists audit_logs_actor_agent_idx on public.audit_logs(organization_id, actor_agent_key, created_at desc);
create index if not exists audit_logs_event_type_idx on public.audit_logs(organization_id, event_type, created_at desc);

alter table public.approvals enable row level security;
