# AI Content Production Pipeline

## Purpose

Turn a business objective into a complete content production package through autonomous agent collaboration.

## Owner

- CEO Agent owns the business objective and final approval.

## Participant Agents

- Marketing: target audience, strategy, schedule, KPI assumptions
- Content Creator: content ideas, scripts, captions
- Video Editor: thumbnail ideas and visual production notes
- Ads Performance: KPI predictions and optimization assumptions
- R&D: optional product/claim validation when content makes factual claims

## Required Skills

- CEO: Executive Objective Planning
- Marketing: Campaign Strategy, Audience Insight
- Content Creator: Content Production, Content Calendar
- Video Editor: Short Video Production Plan
- Ads Performance: Performance Analysis, Paid Campaign Test Plan

## Required Harness Capabilities

- Node runtime for orchestration
- Supabase/Postgres for persistence
- Memory retrieval for company and content knowledge
- File system later for exportable content packages
- Browser/API connectors later for publishing and analytics import

## Workflow States

1. `objective_received`
2. `memory_retrieved`
3. `audience_analyzed`
4. `strategy_generated`
5. `ideas_generated`
6. `scripts_generated`
7. `captions_generated`
8. `thumbnails_generated`
9. `schedule_generated`
10. `kpi_predicted`
11. `waiting_for_human_approval`
12. `learning_saved`
13. `completed`

## Human Approval Checkpoints

Human approval is required before:

- Publishing content externally
- Running paid ads
- Making regulated product/medical/financial claims
- Saving sensitive strategic decisions as company memory

## Memory Behavior

Read before execution:

- Brand voice memory
- Audience insight
- Successful content examples
- Historical campaign decisions
- Content SOPs

Write after execution:

- Content strategy summary
- Useful hooks/scripts
- KPI assumptions
- Lessons and rejected assumptions
- Human approval notes

## Outputs

- Audience analysis
- Content strategy
- Content ideas
- Scripts
- Captions
- Thumbnail ideas
- Posting schedule
- KPI predictions
- Learning memory candidate

## API Endpoints

- `POST /api/workflows/content-production/start`
- `POST /api/workflows/content-production/[id]/approve`

## UI

- `/workflows/content-production`
