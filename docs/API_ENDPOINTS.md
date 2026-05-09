# API Endpoints

All routes return a JSON envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Errors return:

```json
{
  "ok": false,
  "error": "Message",
  "details": {}
}
```

Optional headers:

- `x-organization-id`: organization scope
- `x-agent-id`: actor agent key, default `ceo`
- `x-user-id`: user identifier for future auth binding

## Agents

- `GET /api/agents`
- `POST /api/agents`
- `GET /api/agents/[agentKey]`
- `PATCH /api/agents/[agentKey]`
- `GET /api/agents/[agentKey]/status`
- `GET /api/agents/[agentKey]/skills`

## Skills

- `GET /api/skills`
- `POST /api/skills/execute`
- `GET /api/skills/executions`
- `POST /api/skills/validate`

## Memory

- `POST /api/memory/search`
- `POST /api/memory`
- `GET /api/memory/company`
- `GET /api/memory/agents/[agentKey]`
- `GET /api/memory/decisions`

## Workflows

- `GET /api/workflows`
- `POST /api/workflows/start`
- `GET /api/workflows/runs/[runKey]`
- `GET /api/workflows/runs/[runKey]/status`
- `POST /api/workflows/runs/[runKey]/approve`
- `POST /api/workflows/runs/[runKey]/cancel`

Existing specialized workflow routes remain preserved.

## Governance

- `GET /api/governance/approvals`
- `POST /api/governance/approvals/[approvalKey]/approve`
- `POST /api/governance/approvals/[approvalKey]/reject`
- `GET /api/governance/audit-logs`
- `POST /api/governance/emergency-stop`

## Learning

- `GET /api/learning/proposals`
- `POST /api/learning/proposals/[proposalKey]/approve`
- `POST /api/learning/proposals/[proposalKey]/reject`
- `GET /api/learning/skill-performance`

## Operations

- `GET /api/operations/triggers`
- `POST /api/operations/run-scheduled`
- `GET /api/operations/recommendations`
- `GET /api/operations/risk-alerts`

## Integrations

- `GET /api/integrations/connectors`
- `GET /api/integrations/connectors/[connectorId]/status`
- `POST /api/integrations/execute`
- `GET /api/integrations/audit-logs`

Connector write and external actions must include approval and are still checked by `ConnectorPermissionManager`.

## Dashboard

- `GET /api/dashboard/overview`
- `GET /api/dashboard/activity-feed`
- `GET /api/dashboard/kpis`
- `GET /api/dashboard/alerts`

## Demo Payload

Start Content Production Workflow:

```json
{
  "workflowKey": "content-production",
  "objective": "Create a mother-and-baby TikTok campaign",
  "input": {
    "productName": "Mother and baby product",
    "channel": "tiktok"
  },
  "humanInTheLoop": true
}
```

Expected response includes:

- `workflow_run_id`
- `status`
- `run`
- `approval`
- `persistenceMode`
