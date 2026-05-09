# AI Company Control Center and Dashboard System

The AI Company Control Center is the central command interface for AI Company OS.

It visualizes the operating system layers without changing backend runtime behavior.

## Architecture

```txt
src/app/dashboard/page.tsx
  -> ControlCenterDashboard
  -> DashboardLayoutSystem
  -> Zustand UI store
  -> Modular panels
  -> Demo data now, realtime/event stream later
```

## UI State Architecture

State lives in:

- `src/dashboard/store.ts`

Current state:

- active dashboard section
- selected agent
- focused approval
- memory search query
- realtime mode flag

This keeps the UI ready for future WebSocket, SSE, or Supabase Realtime data without rewriting panel components.

## Panels

### Executive Overview

- company health
- active workflows
- agent uptime
- risk level
- learning queue
- Recharts KPI analytics

### Agent Management

- agent list
- current tasks
- skill score
- workload
- memory access
- permissions
- execution log snippet

### Workflow Center

- Mother-and-baby TikTok Campaign progression
- agent collaboration timeline
- waiting approval state
- learning memory update node

### Governance Center

- permission model status
- audit logging status
- escalation queue
- emergency controls
- approval queue with approve/revise/reject controls prepared

### Learning Center

- feedback analytics
- skill quality trend
- SOP proposal queue
- approved and proposed improvements

### Operations Center

- scheduled operations
- event-driven triggers
- recommendations
- risk alerts
- next operational action

### Memory Explorer

- company memory
- agent memory
- decision logs
- workflow history
- search interface

## Routing Structure

```txt
src/app/dashboard/page.tsx

src/dashboard/
  agents/
  analytics/
  components/
  governance/
  layout/
  learning/
  memory/
  operations/
  workflows/
```

## Demo Flow

The dashboard visualizes:

1. CEO AI creates Mother-and-baby TikTok campaign.
2. Marketing AI analyzes audience.
3. Content Creator AI generates hooks and scripts.
4. Video Editor AI generates production notes.
5. Governance approval is requested.
6. Human approval is represented in the approval queue.
7. Workflow waits safely before publication.
8. Learning system stores an approved improvement note.

## Realtime Preparation

The current dashboard uses static demo data, but the architecture is ready for:

- realtime workflow updates
- realtime agent status
- live operations logs
- live approval queue
- memory search API
- learning proposal review API

## Final Folder Tree

```txt
src/dashboard/
  agents/AgentMonitoringPanel.tsx
  analytics/CompanyHealthOverview.tsx
  components/ControlCenterDashboard.tsx
  components/dashboard-primitives.tsx
  governance/ApprovalQueuePanel.tsx
  governance/GovernanceControlPanel.tsx
  layout/DashboardLayoutSystem.tsx
  learning/LearningAnalyticsPanel.tsx
  memory/MemoryExplorerPanel.tsx
  operations/OperationsMonitorPanel.tsx
  workflows/WorkflowVisualizationPanel.tsx
  data.ts
  store.ts
  types.ts

src/app/dashboard/
  page.tsx
```

## Next Step

Connect each panel to real backend read APIs and add a realtime event stream endpoint for workflow, governance, learning, and operations updates.
