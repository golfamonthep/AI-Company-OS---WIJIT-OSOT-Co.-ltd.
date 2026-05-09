# AGENT_SYSTEM

This file summarizes agent architecture for quick onboarding in new sessions

## Agent Model

Every agent should have:

- role
- goals
- personality
- system prompt
- skills
- memory
- SOP attachments
- task ownership
- communication ability
- performance tracking
- feedback loop

## Existing Agent Files

- `src/modules/agents/ceo.ts`
- `src/modules/agents/content-creator.ts`
- `src/modules/orchestration/ceo-workflow.ts`
- `src/modules/orchestration/content-workflow.ts`
- `src/modules/orchestration/content-reasoning-pipeline.ts`

## Content Creator AI Pipeline

Current reasoning steps:

1. Analyze objective
2. Plan retrieval
3. Select required skills
4. Generate strategy
5. Draft content
6. Self-evaluate
7. Return reasoning trace

Current output:

- title
- hook
- draft
- hashtags
- CTA
- production notes
- assumptions
- reasoning trace

## Memory System

Core tables:

- `memory_items`
- `brand_voice_profiles`
- `content_assets`
- `content_performance`
- `audience_insights`
- `content_feedback_events`

Memory uses Supabase + pgvector. Long-term memory should be retrieved by similarity, importance, recency, performance and feedback confidence.

## Skill System

Core tables:

- `skills`
- `skill_prerequisites`
- `agent_skill_assignments`
- `skill_level_rules`
- `agent_skill_xp_events`
- `agent_skill_progress`
- `prompt_modules`
- `skill_prompt_modules`
- `skill_sop_attachments`
- `agent_skill_performance_snapshots`
- `skill_feedback_impacts`

Agents specialize over time through XP, feedback, performance and prompt/SOP unlocks.
