# Ads Campaign Workflow

## Workflow ID

ads-campaign

## Name

Ads Campaign Workflow

## Purpose

Prepare campaign strategy, creative assets, targeting assumptions, budget notes, and approval checkpoints.

## Participating Agents

- marketing
- content-creator
- video-editor
- ads-performance
- cfo
- ceo

## Inputs

- campaignObjective
- productName
- targetAudience
- budget
- channels

## Outputs

- campaign strategy
- creative assets
- targeting suggestions
- budget review
- CEO approval summary

## Steps

- campaign_strategy | Create campaign strategy | marketing | agent_task | Campaign positioning and audience | Define angle and promise.
- creative_assets | Create ad creative assets | content-creator | agent_task | Hooks, captions, scripts | Generate campaign content.
- video_direction | Create video direction | video-editor | handoff | Production notes | Convert scripts into shot plan.
- targeting_plan | Suggest targeting and KPI assumptions | ads-performance | agent_task | Targeting and KPI assumptions | Prepare ads setup notes.
- budget_review | Review budget | cfo | approval | Budget approval recommendation | Check spend and risk.
- ceo_approval | CEO final approval | ceo | approval | Final campaign decision | Approve or request revision.

## Approval Points

- budget_review
- ceo_approval

## Memory Updates

- Save campaign setup.
- Save budget decision.
- Save creative learnings after results exist.

## Success Metrics

- Strategy, creative, targeting, and budget notes exist.
- Approval checkpoints are recorded.
- No unsupported performance claim is made.

## Failure Handling

- Move to waiting_approval when budget or CEO approval is required.
- Retry content asset step once if output validation fails.
