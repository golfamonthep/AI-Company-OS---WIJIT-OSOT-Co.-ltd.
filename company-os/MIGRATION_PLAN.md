# Safe Migration Plan

This migration resets direction without deleting old work.

## Rule

Do not delete existing `src`, `docs`, `supabase`, or root status files. Add canonical structure first, then gradually map old implementation into the new layers.

## Current To Target Mapping

| Current Path | Target Layer | Migration Action |
| --- | --- | --- |
| `src/modules/agents` | Agent Layer | Keep, later load metadata from `company-os/agents/*` |
| `src/modules/skills` | Skill Layer | Keep, later register `SKILLS.md` manuals |
| `src/modules/integrations` | Harness Layer | Keep, expand into harness registry |
| `src/modules/memory` | Memory Layer | Keep, add retrieval and decision log contracts |
| `src/modules/tasks` | Workflow Layer support | Keep as task execution bridge |
| `src/modules/workflows` | Workflow Layer | Keep, refactor around workflow contract |
| `src/modules/communications` | Collaboration bus | Keep as agent communication/event layer |
| `docs/*` | Reference docs | Keep as historical/design reference |
| `supabase/migrations` | Persistence | Keep, future migrations should align to new layers |

## Migration Steps

1. Add canonical folders and markdown definitions.
2. Add TypeScript contracts for each layer.
3. Build registry loaders that reference markdown paths.
4. Update UI to show layer-based structure.
5. Refactor runtime modules behind stable API routes.
6. Keep old docs as supporting references until replaced by canonical docs.

## Completion Criteria

- Every agent has `AGENT.md` and `SKILLS.md`.
- Every runtime tool is registered as harness capability.
- Every workflow references agents, skills, harnesses, memory, and outputs.
- Every important action writes task history or decision log.
- New features start from layer definitions before code.
