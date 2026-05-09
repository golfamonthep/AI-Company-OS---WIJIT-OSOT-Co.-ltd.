# External Integrations Layer

The External Integrations Layer lets AI Company OS connect to real business tools through safe, auditable connector boundaries.

This layer is stub-first. No real external account is connected, changed, published to, messaged, or billed in this phase.

## Architecture

```txt
Agent or Workflow
  -> ConnectorRegistry
  -> ConnectorPermissionManager
  -> RateLimitManager
  -> ConnectorExecutor
  -> ConnectorAuditLogger
  -> MemoryWriter
```

## Safety Model

Agents may:

- read analytics
- read selected context
- draft content
- prepare reports
- create unpublished drafts after approval

Agents may not without approval:

- send emails
- publish posts
- spend ad budget
- modify financial data
- delete files
- change account settings
- contact customers

## Components

### ConnectorRegistry

Registers connector definitions for:

- Google Workspace
- social platforms
- advertising platforms
- business tools

Each connector defines:

- connector ID
- provider
- auth type
- permissions
- read actions
- write actions
- approval requirements
- rate limit strategy
- error handling
- audit logging
- governance policy

### ConnectorPermissionManager

Validates connector actions before execution.

It blocks or approval-gates:

- write actions
- external actions
- send, publish, spend, delete, customer-contact, and financial modifications

### ConnectorExecutor

Runs connector actions in stub mode.

Current behavior:

- validates action
- checks rate limit
- checks approval flag
- returns mock output
- logs audit event
- saves execution log when Supabase is configured

### OAuthConfigManager

Provides OAuth-ready configuration stubs.

It does not exchange tokens yet.

### ConnectorAuditLogger

Writes connector events to:

- `integrations/CONNECTOR_AUDIT_LOG.md`
- `connector_audit_logs`

### RateLimitManager

Provides local per-action rate windows now and prepares for provider-specific quotas later.

### ConnectorErrorHandler

Normalizes unsupported, denied, approval-required, rate-limited, and failed connector responses.

## Initial Connectors

Google Workspace:

- Gmail
- Google Drive
- Google Docs
- Google Sheets
- Google Calendar

Social platforms:

- TikTok
- YouTube
- Facebook
- Instagram

Advertising platforms:

- Meta Ads
- Google Ads
- TikTok Ads

Business tools:

- Notion
- Slack
- Shopify
- Stripe
- LINE OA

## Demo Flow

Content Campaign Draft Integration:

1. Content Creator AI generates TikTok campaign hooks.
2. Governance approval is requested for creating an unpublished Google Docs draft.
3. CEO approves draft creation only.
4. Google Docs connector creates a mock draft document.
5. ConnectorAuditLogger logs the action.
6. MemoryWriter saves the integration result.

Sample module:

- `src/modules/agent-runtime/integrations/sample-content-campaign-draft.ts`

## Database Schema

Migration:

- `supabase/migrations/202605080006_external_integrations_layer.sql`

Tables:

- `connector_audit_logs`
- `connector_execution_logs`
- `connector_oauth_configs`

All tables use organization-scoped RLS through `public.is_org_member(organization_id)`.

## Final Folder Tree

```txt
integrations/
  ADS_PLATFORMS.md
  BUSINESS_TOOLS.md
  CONNECTOR_PERMISSION_MATRIX.md
  CONNECTOR_POLICY.md
  GOOGLE_WORKSPACE.md
  SOCIAL_PLATFORMS.md

src/modules/agent-runtime/integrations/
  ConnectorAuditLogger.ts
  ConnectorErrorHandler.ts
  ConnectorExecutor.ts
  ConnectorPermissionManager.ts
  ConnectorRegistry.ts
  OAuthConfigManager.ts
  RateLimitManager.ts
  sample-content-campaign-draft.ts
  types.ts

supabase/migrations/
  202605080006_external_integrations_layer.sql
```

## Next Step

Build connector settings UI and approval APIs before adding real OAuth token exchange or live provider calls.
