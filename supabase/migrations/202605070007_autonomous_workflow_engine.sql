create type public.workflow_trigger_type as enum ('manual', 'scheduled', 'event');
create type public.workflow_run_step_status as enum ('queued', 'running', 'waiting_for_agent', 'waiting_for_approval', 'completed', 'failed', 'skipped', 'cancelled');
create type public.workflow_backoff_strategy as enum ('fixed', 'linear', 'exponential');
create type public.workflow_escalation_status as enum ('open', 'acknowledged', 'resolved', 'dismissed');
create type public.workflow_optimization_signal as enum ('success', 'failure', 'delay', 'cost', 'quality', 'manual_override');

create table public.workflow_triggers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  trigger_type public.workflow_trigger_type not null,
  event_type text,
  schedule_cron text,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (trigger_type = 'scheduled' and schedule_cron is not null)
    or (trigger_type = 'event' and event_type is not null)
    or trigger_type = 'manual'
  )
);

create table public.workflow_run_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id) on delete set null,
  step_key text not null,
  status public.workflow_run_step_status not null default 'queued',
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_run_id, step_key)
);

create table public.workflow_run_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_run_step_id uuid references public.workflow_run_steps(id) on delete set null,
  event_type text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.workflow_retry_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id) on delete cascade,
  max_attempts integer not null default 3 check (max_attempts between 1 and 20),
  backoff_strategy public.workflow_backoff_strategy not null default 'exponential',
  backoff_seconds integer not null default 60 check (backoff_seconds > 0),
  retry_on text[] not null default array['transient', 'validation'],
  created_at timestamptz not null default now()
);

create table public.workflow_escalations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_run_step_id uuid references public.workflow_run_steps(id) on delete set null,
  source_agent_id uuid references public.agents(id) on delete set null,
  target_agent_id uuid references public.agents(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  severity public.communication_priority not null default 'high',
  reason text not null,
  status public.workflow_escalation_status not null default 'open',
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.workflow_optimization_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  workflow_run_id uuid references public.workflow_runs(id) on delete cascade,
  signal_type public.workflow_optimization_signal not null,
  summary text not null,
  recommendation text,
  promoted_memory_item_id uuid references public.memory_items(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.workflow_runs
  add column if not exists current_step_key text,
  add column if not exists objective text,
  add column if not exists trigger_type public.workflow_trigger_type,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

create index workflow_triggers_workflow_idx on public.workflow_triggers(workflow_id, enabled);
create index workflow_triggers_event_idx on public.workflow_triggers(organization_id, event_type) where trigger_type = 'event' and enabled = true;
create index workflow_run_steps_run_status_idx on public.workflow_run_steps(workflow_run_id, status);
create index workflow_run_steps_retry_idx on public.workflow_run_steps(status, next_retry_at) where next_retry_at is not null;
create index workflow_run_events_run_created_idx on public.workflow_run_events(workflow_run_id, created_at);
create index workflow_retry_policies_workflow_idx on public.workflow_retry_policies(workflow_id, workflow_step_id);
create index workflow_escalations_status_idx on public.workflow_escalations(organization_id, status, severity, created_at desc);
create index workflow_optimization_events_workflow_idx on public.workflow_optimization_events(workflow_id, created_at desc);

alter table public.workflow_triggers enable row level security;
alter table public.workflow_run_steps enable row level security;
alter table public.workflow_run_events enable row level security;
alter table public.workflow_retry_policies enable row level security;
alter table public.workflow_escalations enable row level security;
alter table public.workflow_optimization_events enable row level security;

create policy "Members can read workflow triggers" on public.workflow_triggers for select using (public.is_org_member(organization_id));
create policy "Members can write workflow triggers" on public.workflow_triggers for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read workflow run steps" on public.workflow_run_steps for select using (public.is_org_member(organization_id));
create policy "Members can write workflow run steps" on public.workflow_run_steps for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read workflow run events" on public.workflow_run_events for select using (public.is_org_member(organization_id));
create policy "Members can write workflow run events" on public.workflow_run_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read workflow retry policies" on public.workflow_retry_policies for select using (public.is_org_member(organization_id));
create policy "Members can write workflow retry policies" on public.workflow_retry_policies for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read workflow escalations" on public.workflow_escalations for select using (public.is_org_member(organization_id));
create policy "Members can write workflow escalations" on public.workflow_escalations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read workflow optimization events" on public.workflow_optimization_events for select using (public.is_org_member(organization_id));
create policy "Members can write workflow optimization events" on public.workflow_optimization_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
