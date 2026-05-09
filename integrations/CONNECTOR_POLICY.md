# Connector Policy

## Purpose

The External Integrations Layer connects AI Company OS to business tools through controlled connector boundaries.

Connectors are stub-only until real OAuth/API credentials, governance approvals, and audit review flows are implemented.

## Allowed Without High-Impact Approval

- Read analytics.
- Read selected documents or files.
- Prepare reports.
- Draft content.
- Create unpublished drafts after workflow approval.

## Requires Approval

- Send emails.
- Publish posts.
- Spend or change ad budget.
- Modify financial data.
- Delete files.
- Change account settings.
- Contact customers.

## Connector Execution Rule

Every connector action must pass:

1. ConnectorRegistry lookup.
2. ConnectorPermissionManager validation.
3. RateLimitManager check.
4. ConnectorExecutor stub execution.
5. ConnectorAuditLogger logging.

No real external accounts are connected in this phase.
