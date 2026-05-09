create type public.skill_category as enum ('strategy', 'technical', 'finance', 'marketing', 'content', 'support', 'operations', 'research', 'creative', 'compliance');
create type public.workflow_step_type as enum ('agent_task', 'tool_call', 'approval', 'memory_write', 'report_generation', 'conditional');

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  description text not null default '',
  category public.skill_category not null,
  level integer not null default 1 check (level between 1 and 10),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.skill_prerequisites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  prerequisite_skill_id uuid not null references public.skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (skill_id, prerequisite_skill_id),
  check (skill_id <> prerequisite_skill_id)
);

create table public.agent_skill_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency integer not null default 1 check (proficiency between 1 and 10),
  learning_goal text,
  last_practiced_at timestamptz,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, skill_id)
);

create table public.department_agent_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null,
  responsibility text not null default '',
  is_lead boolean not null default false,
  created_at timestamptz not null default now(),
  unique (department_id, agent_id, title)
);

create table public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create table public.task_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_agent_id uuid references public.agents(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  step_key text not null,
  name text not null,
  step_type public.workflow_step_type not null,
  agent_id uuid references public.agents(id) on delete set null,
  tool_name text,
  config jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, step_key)
);

create table public.workflow_step_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  from_step_id uuid not null references public.workflow_steps(id) on delete cascade,
  to_step_id uuid not null references public.workflow_steps(id) on delete cascade,
  condition_expression text,
  created_at timestamptz not null default now(),
  unique (from_step_id, to_step_id),
  check (from_step_id <> to_step_id)
);

create table public.workflow_run_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  workflow_step_id uuid references public.workflow_steps(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workflow_run_id, task_id)
);

create index skills_org_category_idx on public.skills(organization_id, category);
create index skill_prerequisites_skill_idx on public.skill_prerequisites(skill_id);
create index agent_skill_assignments_agent_idx on public.agent_skill_assignments(agent_id);
create index department_agent_roles_department_idx on public.department_agent_roles(department_id);
create index task_dependencies_task_idx on public.task_dependencies(task_id);
create index task_events_task_created_idx on public.task_events(task_id, created_at desc);
create index workflow_steps_workflow_position_idx on public.workflow_steps(workflow_id, position);
create index workflow_step_edges_workflow_idx on public.workflow_step_edges(workflow_id);
create index workflow_run_tasks_run_idx on public.workflow_run_tasks(workflow_run_id);

alter table public.skills enable row level security;
alter table public.skill_prerequisites enable row level security;
alter table public.agent_skill_assignments enable row level security;
alter table public.department_agent_roles enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.task_events enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.workflow_step_edges enable row level security;
alter table public.workflow_run_tasks enable row level security;

create policy "Members can read skills" on public.skills for select using (public.is_org_member(organization_id));
create policy "Members can write skills" on public.skills for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read skill prerequisites" on public.skill_prerequisites for select using (public.is_org_member(organization_id));
create policy "Members can write skill prerequisites" on public.skill_prerequisites for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read agent skill assignments" on public.agent_skill_assignments for select using (public.is_org_member(organization_id));
create policy "Members can write agent skill assignments" on public.agent_skill_assignments for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read department agent roles" on public.department_agent_roles for select using (public.is_org_member(organization_id));
create policy "Members can write department agent roles" on public.department_agent_roles for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read task dependencies" on public.task_dependencies for select using (public.is_org_member(organization_id));
create policy "Members can write task dependencies" on public.task_dependencies for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read task events" on public.task_events for select using (public.is_org_member(organization_id));
create policy "Members can write task events" on public.task_events for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow steps" on public.workflow_steps for select using (public.is_org_member(organization_id));
create policy "Members can write workflow steps" on public.workflow_steps for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow step edges" on public.workflow_step_edges for select using (public.is_org_member(organization_id));
create policy "Members can write workflow step edges" on public.workflow_step_edges for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read workflow run tasks" on public.workflow_run_tasks for select using (public.is_org_member(organization_id));
create policy "Members can write workflow run tasks" on public.workflow_run_tasks for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
