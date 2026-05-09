create type public.content_channel as enum ('facebook', 'instagram', 'tiktok', 'line', 'website');
create type public.content_format as enum ('social_post', 'short_video_script', 'campaign_ideas', 'content_calendar');
create type public.content_feedback_type as enum ('approved', 'rejected', 'edited', 'high_performance', 'low_performance');

create table public.brand_voice_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  brand_name text not null,
  voice_traits jsonb not null default '[]'::jsonb,
  preferred_words text[] not null default '{}',
  blocked_words text[] not null default '{}',
  tone_examples jsonb not null default '[]'::jsonb,
  compliance_notes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, brand_name)
);

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  channel public.content_channel not null,
  format public.content_format not null,
  hook text not null default '',
  draft text not null,
  cta text not null default '',
  hashtags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_performance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_asset_id uuid not null references public.content_assets(id) on delete cascade,
  channel public.content_channel not null,
  impressions integer not null default 0 check (impressions >= 0),
  reach integer not null default 0 check (reach >= 0),
  engagements integer not null default 0 check (engagements >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  leads integer not null default 0 check (leads >= 0),
  conversions integer not null default 0 check (conversions >= 0),
  revenue numeric(14, 2) not null default 0 check (revenue >= 0),
  performance_score numeric(6, 2) not null default 0,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.audience_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  segment_name text not null,
  pain_points text[] not null default '{}',
  desires text[] not null default '{}',
  objections text[] not null default '{}',
  language_style text not null default '',
  buying_triggers text[] not null default '{}',
  content_preferences jsonb not null default '{}'::jsonb,
  source text not null default 'manual',
  confidence numeric(4, 3) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_feedback_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_asset_id uuid references public.content_assets(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  rating integer check (rating between 1 and 5),
  feedback_type public.content_feedback_type not null,
  comment text,
  edited_version text,
  learning_summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index brand_voice_profiles_org_brand_idx on public.brand_voice_profiles(organization_id, brand_name);
create index brand_voice_profiles_embedding_hnsw_idx on public.brand_voice_profiles using hnsw (embedding vector_cosine_ops);

create index content_assets_org_channel_format_idx on public.content_assets(organization_id, channel, format);
create index content_assets_agent_created_idx on public.content_assets(agent_id, created_at desc);
create index content_assets_embedding_hnsw_idx on public.content_assets using hnsw (embedding vector_cosine_ops);

create index content_performance_asset_observed_idx on public.content_performance(content_asset_id, observed_at desc);
create index content_performance_org_score_idx on public.content_performance(organization_id, performance_score desc);

create index audience_insights_org_segment_idx on public.audience_insights(organization_id, segment_name);
create index audience_insights_embedding_hnsw_idx on public.audience_insights using hnsw (embedding vector_cosine_ops);

create index content_feedback_events_asset_idx on public.content_feedback_events(content_asset_id, created_at desc);
create index content_feedback_events_agent_idx on public.content_feedback_events(agent_id, created_at desc);

alter table public.brand_voice_profiles enable row level security;
alter table public.content_assets enable row level security;
alter table public.content_performance enable row level security;
alter table public.audience_insights enable row level security;
alter table public.content_feedback_events enable row level security;

create policy "Members can read brand voice profiles" on public.brand_voice_profiles for select using (public.is_org_member(organization_id));
create policy "Members can write brand voice profiles" on public.brand_voice_profiles for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read content assets" on public.content_assets for select using (public.is_org_member(organization_id));
create policy "Members can write content assets" on public.content_assets for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read content performance" on public.content_performance for select using (public.is_org_member(organization_id));
create policy "Members can write content performance" on public.content_performance for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read audience insights" on public.audience_insights for select using (public.is_org_member(organization_id));
create policy "Members can write audience insights" on public.audience_insights for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read content feedback events" on public.content_feedback_events for select using (public.is_org_member(organization_id));
create policy "Members can write content feedback events" on public.content_feedback_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
