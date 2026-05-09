# Weekly Business Review Workflow

## Workflow ID

weekly-business-review

## Name

Weekly Business Review Workflow

## Purpose

Collect weekly business updates, summarize performance, identify blockers, and prepare CEO review.

## Participating Agents

- ceo
- cfo
- marketing
- ads-performance
- cto

## Inputs

- weekRange
- businessGoals
- departmentUpdates

## Outputs

- weekly summary
- KPI notes
- blockers
- decisions needed
- next-week priorities

## Steps

- collect_updates | Collect department updates | ceo | task | Department update list | Gather updates from business functions.
- finance_review | Review financial notes | cfo | agent_task | Revenue, cost, and risk notes | Summarize finance status.
- marketing_review | Review marketing progress | marketing | agent_task | Campaign and content notes | Summarize marketing status.
- ads_review | Review ads performance | ads-performance | agent_task | Ads performance notes | Summarize ads status.
- technical_review | Review technical blockers | cto | agent_task | Technical blocker notes | Summarize tech status.
- ceo_report | CEO weekly review | ceo | report | Weekly business review | Consolidate summary and decisions.

## Approval Points

- ceo_report

## Memory Updates

- Save weekly report summary.
- Save decisions and blockers.
- Save reusable workflow improvement notes.

## Success Metrics

- Weekly report includes each department.
- Blockers are explicit.
- Decisions needed are clear.

## Failure Handling

- Continue with missing department sections marked as unavailable.
- Escalate missing critical finance or ads data.
