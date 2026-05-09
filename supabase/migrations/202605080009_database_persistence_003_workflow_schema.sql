-- Canonical workflow persistence additions.

alter table if exists public.workflows add column if not exists workflow_key text;
alter table if exists public.workflows add column if not exists purpose text;
alter table if exists public.workflows add column if not exists participating_agents text[] not null default '{}';
alter table if exists public.workflows add column if not exists inputs jsonb not null default '{}'::jsonb;
alter table if exists public.workflows add column if not exists outputs jsonb not null default '{}'::jsonb;
alter table if exists public.workflows add column if not exists approval_points jsonb not null default '[]'::jsonb;
alter table if exists public.workflows add column if not exists success_metrics jsonb not null default '[]'::jsonb;
alter table if exists public.workflows add column if not exists source_path text;
alter table if exists public.workflows add column if not exists status text not null default 'active';

create unique index if not exists workflows_org_workflow_key_idx on public.workflows(organization_id, workflow_key) where workflow_key is not null;

alter table if exists public.workflow_runs add column if not exists run_key text;
alter table if exists public.workflow_runs add column if not exists workflow_key text;
alter table if exists public.workflow_runs add column if not exists objective text;
alter table if exists public.workflow_runs add column if not exists input jsonb not null default '{}'::jsonb;
alter table if exists public.workflow_runs add column if not exists output jsonb not null default '{}'::jsonb;
alter table if exists public.workflow_runs add column if not exists metrics jsonb not null default '{}'::jsonb;
alter table if exists public.workflow_runs add column if not exists started_at timestamptz;
alter table if exists public.workflow_runs add column if not exists completed_at timestamptz;

create index if not exists workflow_runs_org_workflow_status_idx on public.workflow_runs(organization_id, workflow_key, status, created_at desc);
create unique index if not exists workflow_runs_org_run_key_idx on public.workflow_runs(organization_id, run_key);

create table if not exists public.workflow_step_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid references public.workflow_runs(id) on delete cascade,
  workflow_key text,
  step_key text not null,
  step_name text not null,
  owner_agent_key text,
  status text not null default 'pending',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  retry_count integer not null default 0,
  approval_required boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workflow_step_records_run_idx on public.workflow_step_records(organization_id, workflow_run_id, created_at);
create index if not exists workflow_step_records_status_idx on public.workflow_step_records(organization_id, status, created_at desc);

alter table public.workflow_step_records enable row level security;
