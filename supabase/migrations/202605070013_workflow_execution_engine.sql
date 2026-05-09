create table public.workflow_execution_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id text not null,
  objective text not null,
  state text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  analytics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflow_execution_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_execution_runs(id) on delete cascade,
  step_id text not null,
  agent_id text not null,
  state text not null,
  attempts integer not null default 0,
  output jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workflow_execution_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_execution_runs(id) on delete cascade,
  event_type text not null,
  state text not null,
  step_id text,
  agent_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index workflow_execution_runs_org_workflow_created_idx on public.workflow_execution_runs(organization_id, workflow_id, created_at desc);
create index workflow_execution_runs_org_state_created_idx on public.workflow_execution_runs(organization_id, state, created_at desc);
create index workflow_execution_steps_run_idx on public.workflow_execution_steps(workflow_run_id, step_id);
create index workflow_execution_events_run_created_idx on public.workflow_execution_events(workflow_run_id, created_at);

alter table public.workflow_execution_runs enable row level security;
alter table public.workflow_execution_steps enable row level security;
alter table public.workflow_execution_events enable row level security;

create policy "Members can read workflow execution runs" on public.workflow_execution_runs for select using (public.is_org_member(organization_id));
create policy "Members can write workflow execution runs" on public.workflow_execution_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow execution steps" on public.workflow_execution_steps for select using (public.is_org_member(organization_id));
create policy "Members can write workflow execution steps" on public.workflow_execution_steps for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow execution events" on public.workflow_execution_events for select using (public.is_org_member(organization_id));
create policy "Members can write workflow execution events" on public.workflow_execution_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
