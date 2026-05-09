create type public.skill_xp_source as enum ('task_completed', 'feedback_positive', 'feedback_negative', 'content_performance', 'manual_adjustment', 'sop_mastery', 'evaluation');
create type public.prompt_module_type as enum ('instruction', 'style', 'constraint', 'example', 'rubric', 'tool_policy');

create table public.skill_level_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level integer not null check (level between 1 and 10),
  required_xp integer not null check (required_xp >= 0),
  requirements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (skill_id, level)
);

create table public.agent_skill_xp_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  source public.skill_xp_source not null,
  xp_delta integer not null,
  reason text not null,
  task_id uuid references public.tasks(id) on delete set null,
  feedback_id uuid references public.agent_feedback(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.agent_skill_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  current_level integer not null default 1 check (current_level between 1 and 10),
  current_xp integer not null default 0 check (current_xp >= 0),
  xp_to_next_level integer not null default 100 check (xp_to_next_level >= 0),
  specialization_score numeric(6, 3) not null default 0,
  successful_runs integer not null default 0 check (successful_runs >= 0),
  failed_runs integer not null default 0 check (failed_runs >= 0),
  last_improved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, skill_id)
);

create table public.prompt_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  module_type public.prompt_module_type not null,
  content text not null,
  version integer not null default 1 check (version >= 1),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug, version)
);

create table public.skill_prompt_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  prompt_module_id uuid not null references public.prompt_modules(id) on delete cascade,
  min_level integer not null default 1 check (min_level between 1 and 10),
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  unique (skill_id, prompt_module_id)
);

create table public.skill_sop_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  knowledge_document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  min_level integer not null default 1 check (min_level between 1 and 10),
  usage_notes text not null default '',
  created_at timestamptz not null default now(),
  unique (skill_id, knowledge_document_id)
);

create table public.agent_skill_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  tasks_completed integer not null default 0 check (tasks_completed >= 0),
  average_feedback_score numeric(4, 2),
  success_rate numeric(5, 2) not null default 0 check (success_rate >= 0 and success_rate <= 100),
  performance_score numeric(6, 2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table public.skill_feedback_impacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  feedback_id uuid references public.agent_feedback(id) on delete set null,
  impact_score numeric(5, 2) not null default 0,
  improvement_summary text not null,
  suggested_prompt_module_id uuid references public.prompt_modules(id) on delete set null,
  suggested_sop_id uuid references public.knowledge_documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index skill_level_rules_skill_level_idx on public.skill_level_rules(skill_id, level);
create index agent_skill_xp_events_agent_skill_idx on public.agent_skill_xp_events(agent_id, skill_id, created_at desc);
create index agent_skill_progress_agent_idx on public.agent_skill_progress(agent_id, specialization_score desc);
create index prompt_modules_org_active_idx on public.prompt_modules(organization_id, is_active);
create index skill_prompt_modules_skill_idx on public.skill_prompt_modules(skill_id, min_level, priority);
create index skill_sop_attachments_skill_idx on public.skill_sop_attachments(skill_id, min_level);
create index agent_skill_performance_agent_skill_idx on public.agent_skill_performance_snapshots(agent_id, skill_id, period_end desc);
create index skill_feedback_impacts_agent_skill_idx on public.skill_feedback_impacts(agent_id, skill_id, created_at desc);

alter table public.skill_level_rules enable row level security;
alter table public.agent_skill_xp_events enable row level security;
alter table public.agent_skill_progress enable row level security;
alter table public.prompt_modules enable row level security;
alter table public.skill_prompt_modules enable row level security;
alter table public.skill_sop_attachments enable row level security;
alter table public.agent_skill_performance_snapshots enable row level security;
alter table public.skill_feedback_impacts enable row level security;

create policy "Members can read skill level rules" on public.skill_level_rules for select using (public.is_org_member(organization_id));
create policy "Members can write skill level rules" on public.skill_level_rules for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent skill xp events" on public.agent_skill_xp_events for select using (public.is_org_member(organization_id));
create policy "Members can write agent skill xp events" on public.agent_skill_xp_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent skill progress" on public.agent_skill_progress for select using (public.is_org_member(organization_id));
create policy "Members can write agent skill progress" on public.agent_skill_progress for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read prompt modules" on public.prompt_modules for select using (public.is_org_member(organization_id));
create policy "Members can write prompt modules" on public.prompt_modules for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read skill prompt modules" on public.skill_prompt_modules for select using (public.is_org_member(organization_id));
create policy "Members can write skill prompt modules" on public.skill_prompt_modules for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read skill sop attachments" on public.skill_sop_attachments for select using (public.is_org_member(organization_id));
create policy "Members can write skill sop attachments" on public.skill_sop_attachments for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent skill performance snapshots" on public.agent_skill_performance_snapshots for select using (public.is_org_member(organization_id));
create policy "Members can write agent skill performance snapshots" on public.agent_skill_performance_snapshots for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read skill feedback impacts" on public.skill_feedback_impacts for select using (public.is_org_member(organization_id));
create policy "Members can write skill feedback impacts" on public.skill_feedback_impacts for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
