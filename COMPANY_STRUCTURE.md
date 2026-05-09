# COMPANY_STRUCTURE

AI Company OS models the company as an operational AI workforce, not as a chatbot collection.

## Company Layers

1. Agent Layer: executive and specialist agents
2. Skill Layer: SOP, workflow, input/output, guardrail manuals
3. Harness Layer: real runtimes and tools agents can use
4. Memory Layer: company memory, agent memory, task history, decision log
5. Workflow Layer: repeatable company operations
6. Governance Layer: permissions, approval gates, auditability, emergency controls
7. Learning Layer: feedback, metrics, improvement proposals, human review
8. Operations Layer: monitoring, triggers, schedules, recommendations, approval routing
9. External Integrations Layer: connector permissions, OAuth-ready stubs, safe read/write boundaries, audit logs
10. Database and Persistence Layer: durable Supabase schema, repositories, in-memory fallback, migration bridge
11. API Layer: backend interface for dashboard, runtime, repositories, governance, integrations

## Agent Layer

Canonical agent files live in `company-os/agents/<agent-id>/`.

### CEO

- Owns company objectives, planning, prioritization, delegation, and final executive synthesis
- Supervises cross-agent workflows
- Escalation target for strategic conflict

### CTO

- Owns system architecture, automation, technical feasibility, data, integrations, and reliability
- Reviews technical risk before execution

### CFO

- Owns budget, financial analysis, ROI, pricing, cost controls, and finance guardrails
- Approves budget-sensitive workflows

### Marketing

- Owns positioning, audience insight, campaign strategy, channel planning, and growth experiments

### Ads Performance

- Owns ad targeting, budget allocation, performance analysis, testing plans, and optimization loops

### Content Creator

- Owns hooks, scripts, captions, content calendars, brand voice execution, and content quality

### Video Editor

- Owns shot planning, editing instructions, video production workflow, and platform-ready video assets

### R&D

- Owns market research, product research, claims validation, experiments, and innovation pipeline

## Collaboration Model

- CEO creates or receives objective
- CEO selects workflow and delegates work to responsible agents
- Agents use their skills as manuals
- Agents use harness capabilities as execution tools
- Agents retrieve memory before acting
- Agents write task history, decisions, and lessons after acting
- CFO/CEO/human approval gates control sensitive actions
- Governance validates permissions, records audit logs, and can pause unsafe execution
- Learning analyzes outcomes and proposes improvements, but humans approve before changes are applied
- Operations monitors company status and recommends proactive work while routing high-impact actions for approval
- Integrations connect to business tools through stub-only connectors now; write and external actions require governance approval
- Persistence records durable state through repositories while markdown/files remain available during migration
- API routes validate requests, apply permission guards, call repositories/runtime modules, and audit important actions

## Canonical Folder Structure

```txt
company-os/
  agents/
    ceo/
      AGENT.md
      SKILLS.md
    cto/
      AGENT.md
      SKILLS.md
    cfo/
      AGENT.md
      SKILLS.md
    marketing/
      AGENT.md
      SKILLS.md
    ads-performance/
      AGENT.md
      SKILLS.md
    content-creator/
      AGENT.md
      SKILLS.md
    video-editor/
      AGENT.md
      SKILLS.md
    rd/
      AGENT.md
      SKILLS.md
  skills/
    README.md
  harness/
    README.md
  memory/
    README.md
  workflows/
    README.md
governance/
  GOVERNANCE_RULES.md
  PERMISSION_MATRIX.md
  APPROVAL_POLICIES.md
  AUDIT_REQUIREMENTS.md
learning/
  LEARNING_POLICIES.md
  IMPROVEMENT_RULES.md
  FEEDBACK_SCHEMA.md
operations/
  OPERATIONS_POLICY.md
  AUTONOMY_BOUNDARIES.md
  SCHEDULED_OPERATIONS.md
  TRIGGER_RULES.md
integrations/
  CONNECTOR_POLICY.md
  CONNECTOR_PERMISSION_MATRIX.md
  GOOGLE_WORKSPACE.md
  SOCIAL_PLATFORMS.md
  ADS_PLATFORMS.md
  BUSINESS_TOOLS.md
src/
  database/
    PersistenceService.ts
    MigrationBridge.ts
    repositories/
  server/
    api/
workflows/
  weekly-company-review/
    WORKFLOW.md
```
