create table public.content_creator_agent_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null default 'content-creator',
  brief text not null,
  product_name text,
  target_audience text,
  channel text not null default 'tiktok',
  content_goal text,
  selected_skills text[] not null default '{}',
  harness_status jsonb not null default '{}'::jsonb,
  guardrail_report jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_creator_task_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_run_id uuid not null references public.content_creator_agent_runs(id) on delete cascade,
  event_type text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_creator_learning_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_run_id uuid references public.content_creator_agent_runs(id) on delete cascade,
  note text not null,
  tags text[] not null default '{}',
  promoted_to_memory boolean not null default false,
  created_at timestamptz not null default now()
);

create index content_creator_agent_runs_org_created_idx on public.content_creator_agent_runs(organization_id, created_at desc);
create index content_creator_task_history_run_idx on public.content_creator_task_history(agent_run_id, created_at);
create index content_creator_learning_notes_org_idx on public.content_creator_learning_notes(organization_id, created_at desc);

alter table public.content_creator_agent_runs enable row level security;
alter table public.content_creator_task_history enable row level security;
alter table public.content_creator_learning_notes enable row level security;

create policy "Members can read content creator runs" on public.content_creator_agent_runs for select using (public.is_org_member(organization_id));
create policy "Members can write content creator runs" on public.content_creator_agent_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read content creator task history" on public.content_creator_task_history for select using (public.is_org_member(organization_id));
create policy "Members can write content creator task history" on public.content_creator_task_history for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read content creator learning notes" on public.content_creator_learning_notes for select using (public.is_org_member(organization_id));
create policy "Members can write content creator learning notes" on public.content_creator_learning_notes for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
