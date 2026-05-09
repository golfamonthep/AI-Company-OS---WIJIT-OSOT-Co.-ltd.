create table public.agent_collaboration_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_key text not null,
  title text not null,
  objective text not null,
  participating_agents text[] not null default '{}',
  status text not null default 'active',
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_collaboration_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_id text not null,
  event_type text not null,
  actor_agent_id text not null,
  target_agent_id text,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index agent_collaboration_sessions_org_status_idx on public.agent_collaboration_sessions(organization_id, status, created_at desc);
create index agent_collaboration_sessions_key_idx on public.agent_collaboration_sessions(session_key);
create index agent_collaboration_events_session_created_idx on public.agent_collaboration_events(session_id, created_at);
create index agent_collaboration_events_org_type_idx on public.agent_collaboration_events(organization_id, event_type, created_at desc);

alter table public.agent_collaboration_sessions enable row level security;
alter table public.agent_collaboration_events enable row level security;

create policy "Members can read collaboration sessions" on public.agent_collaboration_sessions for select using (public.is_org_member(organization_id));
create policy "Members can write collaboration sessions" on public.agent_collaboration_sessions for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read collaboration events" on public.agent_collaboration_events for select using (public.is_org_member(organization_id));
create policy "Members can write collaboration events" on public.agent_collaboration_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
