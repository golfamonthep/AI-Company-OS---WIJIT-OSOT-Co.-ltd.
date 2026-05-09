# Content Production Workflow

## Workflow ID

content-production

## Name

Content Production Workflow

## Purpose

Turn a campaign brief into audience strategy, content assets, production instructions, and CEO review notes.

## Participating Agents

- marketing
- content-creator
- video-editor
- ceo

## Inputs

- campaignBrief
- productName
- targetAudience
- channel
- contentGoal

## Outputs

- audience analysis
- hooks and scripts
- video production instructions
- CEO review summary
- workflow memory update

## Steps

- receive_campaign_brief | Receive campaign brief | marketing | task | Campaign brief normalized | Capture objective, audience, channel, and constraints.
- audience_strategy | Analyze audience strategy | marketing | agent_task | Audience insight and content angle | Identify audience pain, promise, objections, and positioning.
- generate_content_assets | Generate hooks and scripts | content-creator | agent_task | Structured hooks, scripts, captions, CTAs | Execute Content Creator Agent runtime.
- production_instructions | Create production instructions | video-editor | handoff | Shot plan and editing notes | Prepare video production direction from content assets.
- ceo_review | CEO reviews outputs | ceo | approval | Final review decision | Review strategy, content, and production direction.
- save_workflow_memory | Save workflow history | workflow-engine | memory_update | Workflow memory updated | Save task result and reusable workflow lesson.

## Approval Points

- ceo_review

## Memory Updates

- Save task history.
- Save content production workflow result.
- Save reusable bottleneck or success pattern.

## Success Metrics

- All workflow steps completed.
- Content assets include hooks and scripts.
- Production handoff is clear.
- CEO review checkpoint is recorded.

## Failure Handling

- Retry failed agent task once.
- If approval is blocked, move workflow to waiting_approval.
- If required inputs are missing, fail before content generation.
