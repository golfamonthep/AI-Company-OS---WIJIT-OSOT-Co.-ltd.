# Harness Layer

The Harness Layer defines real execution capabilities available to agents.

Harness is not the skill manual. Harness is the tool runtime that can actually do work.

## Harness Categories

### Node Runtime

Use for:

- Next.js APIs
- TypeScript orchestration
- LangGraph runtime
- Supabase client calls
- JSON transformation

### Python Runtime

Use for:

- Data analysis
- CSV/spreadsheet processing
- Financial calculations
- Research summarization helpers
- Batch embedding jobs

### Browser Automation

Use for:

- Browser QA
- Web app testing
- Public website inspection
- Internal dashboard interaction

### File System

Use for:

- Reading project files
- Writing generated documents
- Managing local artifacts
- Import/export workflows

### API Connectors

Use for:

- Supabase
- OpenAI/model provider
- Ads platforms
- Social platforms
- Analytics tools
- File/storage services

## Harness Capability Contract

Each harness capability should declare:

- `id`
- `name`
- `category`
- `available`
- `requiresApproval`
- `allowedAgents`
- `inputs`
- `outputs`
- `auditLogRequired`

## Current Runtime Integration

The current shared harness layer lives in:

- `src/modules/agent-runtime/harness-executor.ts`
- `src/modules/agent-runtime/harness`
- `docs/harness-execution-layer.md`

Current implementation:

- OpenAI JSON generation when `OPENAI_API_KEY` is configured
- deterministic fallback when model access is unavailable
- JSON parser status tracking
- FileSystemHarness for artifact and memory writes
- APIHarness for structured HTTP calls
- PythonHarness and NodeHarness behind explicit approval
- BrowserHarness and MediaHarness as architecture-only stubs

Browser automation and media processing are intentionally not active autonomous tools yet.

## Guardrails

- Agents must not claim external actions unless a harness actually ran.
- Destructive file/database actions require explicit approval.
- Credentials and secrets must not be exposed in agent output.
- Regulated, financial, or publishing actions require approval gates.

## Migration From Existing Code

- `src/modules/integrations/tool-registry.ts` becomes the first runtime registry.
- Supabase client files under `src/lib/supabase` are database harness.
- API routes under `src/app/api` are current application harness surfaces.
- Future connectors should register here before agents depend on them.
