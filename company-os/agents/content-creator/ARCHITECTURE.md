# Content Creator Agent Architecture

This is the first production-ready agent implementation target for AI Company OS.

## Purpose

Prove that the layered architecture works:

- Agent Layer: `AGENT.md`
- Skill Layer: `SKILLS.md`
- Harness Layer: OpenAI, file system, memory retrieval, web search abstraction, JSON parser
- Memory Layer: company memory, task history, learning notes
- Workflow Layer: content brief execution pipeline

## Runtime Flow

```mermaid
sequenceDiagram
  autonumber
  participant API as Execute API
  participant Loader as Agent Loader
  participant Memory as Memory Harness
  participant Skills as Skill Selector
  participant Model as OpenAI Harness
  participant Parser as JSON Parser
  participant Repo as Task/Memory Repository

  API->>Loader: Load AGENT.md + SKILLS.md
  API->>Memory: Retrieve relevant memory
  API->>Skills: Select skills for brief/channel
  API->>Model: Generate structured content output
  Model-->>Parser: JSON or text response
  Parser-->>API: Valid structured output
  API->>Repo: Save task history
  API->>Repo: Save learning notes
  API-->>API: Return structured output
```

## Execution Contract

Input:

- organizationId
- brief
- productName
- targetAudience
- channel
- contentGoal
- tone
- constraints

Output:

- selected skills
- memory context
- hooks
- content concepts
- scripts
- captions
- CTA variants
- guardrail report
- task history status
- learning note status

## Production Rules

- If OpenAI API is unavailable, return deterministic fallback and mark harness status.
- Do not publish externally.
- Save task history and learning notes when Supabase is configured.
- Do not make unsupported claims.
- Return structured output only.
