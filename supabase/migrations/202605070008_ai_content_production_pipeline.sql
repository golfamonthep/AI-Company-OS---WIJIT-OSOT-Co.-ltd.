create type public.content_pipeline_state as enum (
  'objective_received',
  'memory_retrieved',
  'audience_analyzed',
  'strategy_generated',
  'ideas_generated',
  'scripts_generated',
  'captions_generated',
  'thumbnails_generated',
  'schedule_generated',
  'kpi_predicted',
  'waiting_for_human_approval',
  'learning_saved',
  'completed',
  'failed',
  'cancelled'
);

create type public.content_pipeline_artifact_type as enum (
  'audience_analysis',
  'content_strategy',
  'content_ideas',
  'scripts',
  'captions',
  'thumbnail_ideas',
  'posting_schedule',
  'kpi_predictions',
  'learning_summary'
);

create table public.content_pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid references public.workflow_runs(id) on delete set null,
  objective text not null,
  product_name text,
  target_audience text,
  channels text[] not null default '{}',
  state public.content_pipeline_state not null default 'objective_received',
  approval_status public.approval_status not null default 'requested',
  memory_context jsonb not null default '{}'::jsonb,
  analytics jsonb not null default '{}'::jsonb,
  created_by_agent_id uuid references public.agents(id) on delete set null,
  created_by_user_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_pipeline_artifacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pipeline_run_id uuid not null references public.content_pipeline_runs(id) on delete cascade,
  artifact_type public.content_pipeline_artifact_type not null,
  owner_agent_role text not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  requires_human_approval boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.content_pipeline_analytics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pipeline_run_id uuid not null references public.content_pipeline_runs(id) on delete cascade,
  predicted_reach integer not null default 0,
  predicted_engagement_rate numeric(5, 2) not null default 0,
  predicted_conversion_rate numeric(5, 2) not null default 0,
  confidence numeric(4, 2) not null default 0,
  assumptions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_pipeline_learning_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pipeline_run_id uuid not null references public.content_pipeline_runs(id) on delete cascade,
  memory_item_id uuid references public.memory_items(id) on delete set null,
  lesson text not null,
  tags text[] not null default '{}',
  approved_for_memory boolean not null default false,
  created_at timestamptz not null default now()
);

create index content_pipeline_runs_org_state_idx on public.content_pipeline_runs(organization_id, state, created_at desc);
create index content_pipeline_artifacts_run_idx on public.content_pipeline_artifacts(pipeline_run_id, artifact_type);
create index content_pipeline_analytics_run_idx on public.content_pipeline_analytics(pipeline_run_id);
create index content_pipeline_learning_run_idx on public.content_pipeline_learning_events(pipeline_run_id);

alter table public.content_pipeline_runs enable row level security;
alter table public.content_pipeline_artifacts enable row level security;
alter table public.content_pipeline_analytics enable row level security;
alter table public.content_pipeline_learning_events enable row level security;

create policy "Members can read content pipeline runs" on public.content_pipeline_runs for select using (public.is_org_member(organization_id));
create policy "Members can write content pipeline runs" on public.content_pipeline_runs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read content pipeline artifacts" on public.content_pipeline_artifacts for select using (public.is_org_member(organization_id));
create policy "Members can write content pipeline artifacts" on public.content_pipeline_artifacts for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read content pipeline analytics" on public.content_pipeline_analytics for select using (public.is_org_member(organization_id));
create policy "Members can write content pipeline analytics" on public.content_pipeline_analytics for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Members can read content pipeline learning" on public.content_pipeline_learning_events for select using (public.is_org_member(organization_id));
create policy "Members can write content pipeline learning" on public.content_pipeline_learning_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
