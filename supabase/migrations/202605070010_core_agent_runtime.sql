create table public.agent_runtime_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  workflow_id text not null,
  objective text not null,
  input jsonb not null default '{}'::jsonb,
  selected_skills text[] not null default '{}',
  harness_status jsonb not null default '[]'::jsonb,
  guardrail_report jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_runtime_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  runtime_run_id uuid not null references public.agent_runtime_runs(id) on delete cascade,
  agent_id text not null,
  layer text not null,
  state text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  runtime_run_id uuid references public.agent_runtime_runs(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  from_agent_id text not null,
  to_agent_id text not null,
  subject text not null,
  body text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index agent_runtime_runs_org_agent_created_idx on public.agent_runtime_runs(organization_id, agent_id, created_at desc);
create index agent_runtime_runs_org_workflow_created_idx on public.agent_runtime_runs(organization_id, workflow_id, created_at desc);
create index agent_runtime_events_run_created_idx on public.agent_runtime_events(runtime_run_id, created_at);
create index agent_messages_org_to_status_idx on public.agent_messages(organization_id, to_agent_id, status, created_at desc);

alter table public.agent_runtime_runs enable row level security;
alter table public.agent_runtime_events enable row level security;
alter table public.agent_messages enable row level security;

create policy "Members can read agent runtime runs" on public.agent_runtime_runs for select using (public.is_org_member(organization_id));
create policy "Members can write agent runtime runs" on public.agent_runtime_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent runtime events" on public.agent_runtime_events for select using (public.is_org_member(organization_id));
create policy "Members can write agent runtime events" on public.agent_runtime_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent messages" on public.agent_messages for select using (public.is_org_member(organization_id));
create policy "Members can write agent messages" on public.agent_messages for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
