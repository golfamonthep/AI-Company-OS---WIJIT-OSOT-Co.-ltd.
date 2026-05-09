# Internal Communication Implementation Roadmap

## Phase 1: Communication Foundation

- Apply migration `202605070005_internal_communications.sql`
- Add `communications` domain module
- Add `POST /api/communications/events`
- Store communication events in Postgres
- Use Supabase Realtime on `communication_events` and `agent_inbox_items`

Acceptance:

- Agent can emit communication envelope
- Router returns target role and escalation/approval flags
- Event is auditable and organization-scoped

## Phase 2: Agent Inbox

- Build inbox repository and UI
- Add unread/read/acknowledged states
- Add priority sorting
- Add direct message and status report views

Acceptance:

- Each Agent has inbox items
- Dashboard can display realtime updates
- Agents can acknowledge messages

## Phase 3: Delegation And Collaboration

- Connect task delegation to `tasks`
- Add `agent_task_delegations`
- Add workflow collaborators and workflow step messages
- Resume LangGraph workflow after receiving Agent response

Acceptance:

- CEO AI can delegate to Content AI or CTO AI
- Delegated task has status and result summary
- Workflow step can pause and resume through communication event

## Phase 4: Approvals And Escalations

- Add approval request UI
- Add escalation dashboard
- Route critical issues to CEO AI or human user
- Add SLA and due dates

Acceptance:

- Approval request blocks workflow until decision
- Escalation creates high-priority notification
- Resolved escalation writes audit trail

## Phase 5: Notifications And External Channels

- Add notification preferences
- Add in-app notification center
- Add future adapters: email, LINE, Slack
- Add retry and delivery audit

Acceptance:

- Notification delivery is tracked
- Failed notifications can retry
- Critical events are visible in realtime
