# ROADMAP

This roadmap resets the project direction toward a structured AI Company OS with agent, skill, harness, memory, workflow, governance, learning, operations, external integrations, database persistence, API, and MVP production readiness layers.

## Phase 0: Safe Architecture Reset

Status: in progress

- Add canonical `company-os/` operating structure
- Define all core agents
- Define skill documentation format
- Separate skill manuals from execution harnesses
- Define memory and workflow layers
- Define governance rules, permissions, approvals, audit requirements, and emergency controls
- Define controlled learning rules, feedback schema, improvement proposals, and review queue
- Define supervised autonomous operations, schedules, trigger rules, risk detection, and approval routing
- Define safe external connector boundaries, permissions, OAuth-ready stubs, and connector audit requirements
- Define persistence repositories, additive migrations, file fallback, and migration bridge
- Define API routes, validation schemas, permission guards, and audit helper
- Preserve existing `src`, `docs`, and `supabase` work

## Phase 1: Layer Contracts

- Create TypeScript contracts for Agent, Skill, Harness, Memory, Workflow, Governance, Learning, Operations, Integrations, Persistence, API
- Map `company-os/agents/*` docs into machine-readable metadata later
- Keep existing app routes stable

## Phase 2: Agent Registry

- Convert CEO, CTO, CFO, Marketing, Ads Performance, Content Creator, Video Editor, and R&D into runtime definitions
- Attach each agent to its `AGENT.md` and `SKILLS.md`
- Add memory access scopes and approval authority

## Phase 3: Skill Registry

- Convert skills from markdown manuals into structured skill definitions
- Add skill input/output validation
- Add guardrail checks before execution

## Phase 4: Harness Registry

- Register actual tool capabilities:
  - Node runtime
  - Python runtime
  - Browser automation
  - File system
  - Supabase/Postgres
  - External API connectors
- Require agents to cite harness/tool runs for real-world actions

## Phase 5: Memory Runtime

- Implement company memory retrieval
- Implement agent memory
- Implement task history
- Implement decision log
- Add embeddings and pgvector retrieval

## Phase 6: Workflow Runtime

- Implement company workflows:
  - Create product
  - Run ads
  - Create content
  - Analyze finance
  - Research market
- Wire workflow steps to agents, skills, harnesses, and memory

## Phase 7: UI

- Show company operating layers in UI
- Add agent profile screens
- Add skill manual screens
- Add harness capability screens
- Add memory explorer
- Add workflow builder and monitor
- Add oversight dashboard for approvals, audit logs, and emergency controls
- Add learning review queue UI for proposed improvements
- Add operations command center for schedules, triggers, risks, recommendations, approvals, and reports
- Add integrations admin UI for connector registry, OAuth status, permission matrix, approval queue, and audit logs
- Connect the AI Company Control Center panels to real backend read APIs and realtime updates

## Phase 8: External Integrations Runtime

- Keep all connectors stub-only until OAuth/API credentials, approval APIs, and audit review UI are implemented
- Add connector settings APIs and encrypted token storage later
- Add Google Docs draft creation as the first live integration only after governance enforcement is verified
- Add read-only analytics connectors before enabling any write-capable connector
- Require explicit approval for publish, send, spend, delete, account setting changes, customer contact, and financial mutations

## Phase 9: Productionization

- Supabase setup and migrations
- RLS tests
- Background workers
- Observability
- Evaluation suite
- Deployment pipeline

## Phase 10: Persistence Hardening

- Run and typecheck `src/database` when package manager is available
- Add repository tests using mocked Supabase responses
- Add RLS policies for new canonical tables after access patterns are finalized
- Add dashboard read APIs backed by repositories
- Add file-to-database migration dry-run and audit report
- Add pgvector embedding jobs after keyword memory retrieval is stable

## Phase 11: API Hardening

- Run and typecheck API routes when package manager is available
- Add route tests for validation errors, permission denials, approval-gated connector writes, and fallback persistence
- Connect dashboard panels to `/api/dashboard/*`

## Phase 12: MVP Production Readiness

- Centralize environment config and validation
- Normalize structured runtime errors
- Add structured logs for runtime, workflow, governance, and integrations
- Add health checks and `/api/health`
- Add API, connector, workflow, and agent rate limiting
- Add retry queue and workflow recovery checkpoints
- Add Docker, Vercel, Supabase, and env template deployment support
- Persist retry and recovery state after MVP in-memory contracts are verified

## Phase 13: First Live MVP Deployment

- Launch Content Department AI as the first operational department
- Support `/login`, `/workspaces`, `/workflows/content-department`, and `/dashboard`
- Run Mother-and-baby TikTok Campaign end-to-end
- Persist workflow runs, approval records, audit logs, task history, company memory, and learning events
- Keep external publishing disabled
- Deploy to Vercel with Supabase configured
- Smoke test the live workflow before expanding to other departments
- Add API auth binding to Supabase session/memberships
- Add OpenAPI-style generated route documentation later
