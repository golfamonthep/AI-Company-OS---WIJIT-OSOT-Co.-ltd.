create table public.operations_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_id text,
  event_type text not null,
  actor_id text not null,
  summary text not null,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.operations_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  schedule_key text not null,
  name text not null,
  workflow_id text not null,
  cadence text not null,
  owner_agent_id text not null,
  next_run_at timestamptz not null,
  status text not null default 'active',
  low_risk boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, schedule_key)
);

create table public.operations_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_key text not null,
  operation_type text not null,
  workflow_id text,
  title text not null,
  status text not null,
  trigger_payload jsonb not null default '{}'::jsonb,
  schedule_payload jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  approvals jsonb not null default '[]'::jsonb,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, run_key)
);

create table public.operations_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recommendation_key text not null,
  title text not null,
  summary text not null,
  recommended_action text not null,
  operation_type text not null,
  impact text not null,
  urgency text not null,
  score numeric not null default 0,
  risk_level text not null,
  requires_approval boolean not null default false,
  approval_domain text not null default 'none',
  evidence text[] not null default '{}',
  created_by_agent_id text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, recommendation_key)
);

create index operations_logs_org_created_idx on public.operations_logs(organization_id, created_at desc);
create index operations_logs_run_idx on public.operations_logs(run_id, created_at);
create index operations_schedules_org_status_idx on public.operations_schedules(organization_id, status, next_run_at);
create index operations_runs_org_status_idx on public.operations_runs(organization_id, status, updated_at desc);
create index operations_recommendations_org_score_idx on public.operations_recommendations(organization_id, score desc, created_at desc);

alter table public.operations_logs enable row level security;
alter table public.operations_schedules enable row level security;
alter table public.operations_runs enable row level security;
alter table public.operations_recommendations enable row level security;

create policy "Members can read operations logs" on public.operations_logs for select using (public.is_org_member(organization_id));
create policy "Members can write operations logs" on public.operations_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read operations schedules" on public.operations_schedules for select using (public.is_org_member(organization_id));
create policy "Members can write operations schedules" on public.operations_schedules for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read operations runs" on public.operations_runs for select using (public.is_org_member(organization_id));
create policy "Members can write operations runs" on public.operations_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read operations recommendations" on public.operations_recommendations for select using (public.is_org_member(organization_id));
create policy "Members can write operations recommendations" on public.operations_recommendations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
