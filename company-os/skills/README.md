# Skill Layer

The Skill Layer defines how agents perform work.

A skill is not a prompt. A skill is an operational manual.

## Skill Contract

Every skill should define:

- Purpose
- SOP
- Workflow
- Inputs
- Outputs
- Quality checklist
- Guardrails
- Required harness capabilities
- Memory read/write behavior
- Escalation conditions

## Skill vs Harness

Skill:

- Tells the agent how to work
- Defines quality and process
- Defines input/output contracts
- Defines safety guardrails

Harness:

- Executes real actions
- Runs code
- Reads/writes files
- Calls APIs
- Automates browser
- Queries database

Example:

- Skill: "Paid Campaign Test Plan"
- Harness: ads API connector, browser automation, spreadsheet/file access

## Current Agent Skill Manuals

- `company-os/agents/ceo/SKILLS.md`
- `company-os/agents/cto/SKILLS.md`
- `company-os/agents/cfo/SKILLS.md`
- `company-os/agents/marketing/SKILLS.md`
- `company-os/agents/ads-performance/SKILLS.md`
- `company-os/agents/content-creator/SKILLS.md`
- `company-os/agents/video-editor/SKILLS.md`
- `company-os/agents/rd/SKILLS.md`

## Migration From Existing Code

- Existing `src/modules/skills` becomes the runtime registry for skill metadata.
- Existing skill docs in `docs/modular-ai-skill-system.md` become background reference.
- New canonical skill manuals live with each agent first.

## Next Implementation Step

Create a `SkillDefinition` TypeScript contract that can reference these markdown files and declare required harness capabilities.
