create table public.learning_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id text not null,
  event_type text not null,
  summary text not null,
  source_type text,
  proposal_id text,
  target_id text,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.learning_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  feedback_key text not null,
  source_type text not null,
  agent_id text not null,
  workflow_id text,
  task_id text,
  skill_id text,
  item_id text not null,
  normalized_score numeric not null default 0,
  category text not null,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  action_hints text[] not null default '{}',
  raw_feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, feedback_key)
);

create table public.learning_skill_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id text not null,
  skill_id text not null,
  executions integer not null default 0,
  successes integer not null default 0,
  failures integer not null default 0,
  partials integer not null default 0,
  average_quality_score numeric not null default 0,
  success_rate numeric not null default 0,
  trend text not null default 'new',
  last_updated timestamptz not null default now(),
  unique (organization_id, agent_id, skill_id)
);

create table public.learning_improvement_proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  proposal_key text not null,
  improvement_type text not null,
  target_type text not null,
  target_id text not null,
  title text not null,
  summary text not null,
  rationale text not null,
  proposed_change text not null,
  expected_benefit text not null,
  created_by_agent_id text not null,
  status text not null default 'proposed',
  risk_level text not null default 'low',
  requires_human_approval boolean not null default true,
  safeguards text[] not null default '{}',
  evidence text[] not null default '{}',
  reviewer_id text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, proposal_key)
);

create table public.learning_memory_refinement_suggestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  suggestion_key text not null,
  memory_id text not null,
  action text not null,
  reason text not null,
  confidence numeric not null default 0,
  requires_review boolean not null default true,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  unique (organization_id, suggestion_key)
);

create index learning_audit_logs_org_created_idx on public.learning_audit_logs(organization_id, created_at desc);
create index learning_audit_logs_org_event_idx on public.learning_audit_logs(organization_id, event_type, created_at desc);
create index learning_feedback_org_skill_idx on public.learning_feedback(organization_id, agent_id, skill_id, created_at desc);
create index learning_skill_performance_org_skill_idx on public.learning_skill_performance_metrics(organization_id, agent_id, skill_id);
create index learning_improvement_proposals_org_status_idx on public.learning_improvement_proposals(organization_id, status, updated_at desc);
create index learning_memory_refinement_org_status_idx on public.learning_memory_refinement_suggestions(organization_id, status, created_at desc);

alter table public.learning_audit_logs enable row level security;
alter table public.learning_feedback enable row level security;
alter table public.learning_skill_performance_metrics enable row level security;
alter table public.learning_improvement_proposals enable row level security;
alter table public.learning_memory_refinement_suggestions enable row level security;

create policy "Members can read learning audit logs" on public.learning_audit_logs for select using (public.is_org_member(organization_id));
create policy "Members can write learning audit logs" on public.learning_audit_logs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read learning feedback" on public.learning_feedback for select using (public.is_org_member(organization_id));
create policy "Members can write learning feedback" on public.learning_feedback for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read learning skill metrics" on public.learning_skill_performance_metrics for select using (public.is_org_member(organization_id));
create policy "Members can write learning skill metrics" on public.learning_skill_performance_metrics for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read learning proposals" on public.learning_improvement_proposals for select using (public.is_org_member(organization_id));
create policy "Members can write learning proposals" on public.learning_improvement_proposals for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read memory refinement suggestions" on public.learning_memory_refinement_suggestions for select using (public.is_org_member(organization_id));
create policy "Members can write memory refinement suggestions" on public.learning_memory_refinement_suggestions for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
