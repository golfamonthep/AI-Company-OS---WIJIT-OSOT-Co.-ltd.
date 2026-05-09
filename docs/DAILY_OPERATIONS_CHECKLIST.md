# Daily Operations Checklist

Scope: Content Department AI and the Content Production Workflow only.

## Start Of Day

- Open `/api/health` and confirm the app is healthy or only degraded for accepted local fallbacks.
- Open `/dashboard` and review Operational alerts.
- Confirm there are no unexpected workflow failures.
- Review pending approvals before starting new campaigns.
- Confirm external publishing remains disabled.

## Run Content Workflow

- Open `/workflows/content-production`.
- Enter campaign brief, product summary, target audience, and goal.
- Start the workflow.
- Confirm Marketing AI audience analysis appears.
- Confirm Content Creator AI generated hooks, captions, and scripts.
- Review governance warning before approving.

## Review And Approve

- Score output quality from 1 to 5.
- Mark thumbs up/down.
- Add quality notes.
- Approve only if content is usable internally.
- Request changes when claims, tone, targeting, or script quality are not acceptable.
- Always provide a rejection reason when requesting changes.

## End Of Workflow

- Confirm workflow status changed to completed or changes requested.
- Confirm dashboard shows the latest workflow.
- Confirm audit summary is visible.
- Confirm memory update or task-history feedback is visible.
- Confirm learning event includes reviewer feedback.

## End Of Day

- Record number of workflows run.
- Record number of approvals and changes requested.
- Review average output score and satisfaction.
- Note any repeated issues for future SOP improvement.
- Do not enable external publishing until governance and deployment verification are complete.
