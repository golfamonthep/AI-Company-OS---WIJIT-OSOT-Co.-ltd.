-- Canonical persistence foundation.
-- This file is additive and idempotent because timestamped migrations already define
-- several base tables such as organizations, agents, agent_skills, workflows, and workflow_runs.

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table if exists public.agents add column if not exists agent_key text;
alter table if exists public.agents add column if not exists responsibilities jsonb not null default '[]'::jsonb;
alter table if exists public.agents add column if not exists kpis jsonb not null default '[]'::jsonb;
alter table if exists public.agents add column if not exists behavior_rules jsonb not null default '[]'::jsonb;
alter table if exists public.agents add column if not exists memory_scope jsonb not null default '{}'::jsonb;
alter table if exists public.agents add column if not exists permission_profile jsonb not null default '{}'::jsonb;
alter table if exists public.agents add column if not exists source_path text;
alter table if exists public.agents add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists agents_org_agent_key_idx on public.agents(organization_id, agent_key);
create index if not exists agents_org_role_idx on public.agents(organization_id, role);

alter table if exists public.agent_skills add column if not exists skill_id text;
alter table if exists public.agent_skills add column if not exists purpose text;
alter table if exists public.agent_skills add column if not exists input_schema jsonb not null default '{}'::jsonb;
alter table if exists public.agent_skills add column if not exists output_schema jsonb not null default '{}'::jsonb;
alter table if exists public.agent_skills add column if not exists guardrails jsonb not null default '[]'::jsonb;
alter table if exists public.agent_skills add column if not exists quality_checklist jsonb not null default '[]'::jsonb;
alter table if exists public.agent_skills add column if not exists source_path text;
alter table if exists public.agent_skills add column if not exists updated_at timestamptz not null default now();

create unique index if not exists agent_skills_org_skill_id_idx on public.agent_skills(organization_id, skill_id);
create index if not exists agent_skills_org_agent_idx on public.agent_skills(organization_id, agent_id);

create table if not exists public.artifact_metadata (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_agent_id text,
  workflow_run_id uuid,
  artifact_type text not null,
  title text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  checksum text,
  source_type text not null default 'filesystem',
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifact_metadata_org_created_idx on public.artifact_metadata(organization_id, created_at desc);
create index if not exists artifact_metadata_workflow_idx on public.artifact_metadata(organization_id, workflow_run_id);

alter table public.artifact_metadata enable row level security;
