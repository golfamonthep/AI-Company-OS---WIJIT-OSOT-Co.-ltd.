# Weekly AI Company Review Workflow

## workflow_id

weekly-company-review

## name

Weekly AI Company Review

## purpose

Create a supervised weekly operating review across company workflows, finance, marketing, content, and learning signals.

## participating_agents

- ceo
- cfo
- marketing
- content-creator
- workflow-engine

## inputs

- workflow results
- financial notes
- campaign performance notes
- content output summary
- learning improvement proposals
- operational risks

## outputs

- weekly company review report
- prioritized recommendations
- escalations
- approval request for high-impact actions
- approved learning memory candidates

## steps

### 1. Receive scheduled trigger

- step_id: scheduled-trigger
- agent: workflow-engine
- type: task
- approval_required: no
- expected_output: weekly review run context

### 2. CEO gathers workflow results

- step_id: ceo-workflow-summary
- agent: ceo
- type: agent_task
- approval_required: no
- expected_output: workflow result summary

### 3. CFO reviews financial notes

- step_id: cfo-financial-review
- agent: cfo
- type: agent_task
- approval_required: no
- expected_output: financial risk and budget notes

### 4. Marketing reviews campaign performance

- step_id: marketing-campaign-review
- agent: marketing
- type: agent_task
- approval_required: no
- expected_output: campaign performance notes

### 5. Content Creator reviews content output

- step_id: content-output-review
- agent: content-creator
- type: agent_task
- approval_required: no
- expected_output: content production summary

### 6. Learning system summarizes improvements

- step_id: learning-summary
- agent: workflow-engine
- type: report
- approval_required: no
- expected_output: approved and pending learning improvements

### 7. CEO generates weekly report

- step_id: ceo-final-report
- agent: ceo
- type: report
- approval_required: yes
- expected_output: weekly company review report

### 8. Human approval checkpoint

- step_id: human-approval
- agent: ceo
- type: approval
- approval_required: yes
- expected_output: approved report or requested revisions

### 9. Save approved learnings to memory

- step_id: memory-update
- agent: workflow-engine
- type: memory_update
- approval_required: yes
- expected_output: approved learning memory candidates

## approval_points

- ceo-final-report
- human-approval
- memory-update

## memory_updates

- weekly company review summary
- approved learning notes
- operational risk notes

## success_metrics

- report completed
- high-impact actions routed for approval
- learning proposals remain reviewable
- no external action executed without approval

## failure_handling

- pause high-risk actions
- escalate blocked operations to CEO
- route budget issues to CFO
- route governance issues to human review
