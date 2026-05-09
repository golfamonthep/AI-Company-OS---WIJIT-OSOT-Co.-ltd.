# Self-Improving Learning System

The Self-Improving Learning System lets agents improve through controlled, auditable feedback loops.

This is not uncontrolled self-modification. Agents may analyze outcomes and propose improvements, but humans must approve changes before they are applied.

## Architecture

```txt
Execution Outcomes
  -> FeedbackProcessor
  -> SkillPerformanceTracker
  -> LearningAnalyzer
  -> SOPRefinementEngine
  -> MemoryRefinementEngine
  -> LearningReviewQueue
  -> LearningAuditLogger
  -> Human-approved follow-up implementation
```

## Core Rule

Learning creates proposals, not direct mutations.

Protected targets:

- governance rules
- permission systems
- audit systems
- core runtime architecture
- self-authorization boundaries

## Components

### LearningAnalyzer

Analyzes execution outcomes and processed feedback.

It identifies:

- successful patterns
- repeated correction patterns
- failure patterns
- workflow success-rate issues

Output:

- `LearningInsight[]`

### SkillPerformanceTracker

Tracks skill quality over time.

Metrics:

- executions
- successes
- failures
- partials
- average quality score
- success rate
- trend

Supabase table:

- `learning_skill_performance_metrics`

### FeedbackProcessor

Normalizes human and approval feedback.

It converts raw feedback into:

- normalized score
- category
- strengths
- weaknesses
- action hints

Supabase table:

- `learning_feedback`

### SOPRefinementEngine

Creates improvement proposals for skills, workflows, prompts, and decision checklists.

It does not edit `SKILLS.md` or workflow files directly.

### MemoryRefinementEngine

Suggests memory improvements:

- promote
- archive
- merge
- retag
- keep

It does not delete or promote memory directly.

Supabase table:

- `learning_memory_refinement_suggestions`

### LearningReviewQueue

Stores improvement proposals and enforces review status.

Only human review can approve learning proposals. Agent approval attempts are converted to revision requests.

Supabase table:

- `learning_improvement_proposals`

### LearningAuditLogger

Writes learning events to:

- `learning/LEARNING_AUDIT_LOG.md`
- `learning_audit_logs`

## Learning Lifecycle

Mother-and-baby TikTok Campaign sample:

1. Content Creator generates hooks through the existing collaboration sample.
2. Human reviewer scores the hook batch.
3. FeedbackProcessor normalizes feedback.
4. SkillPerformanceTracker updates `hook-generation` metrics.
5. LearningAnalyzer identifies successful and weak patterns.
6. SOPRefinementEngine creates a Hook Generation SOP proposal.
7. LearningReviewQueue stores the proposal.
8. Human approves the proposal.
9. Future execution may use the approved refinement after a controlled implementation step.

Sample module:

- `src/modules/agent-runtime/learning/sample-mother-baby-learning.ts`

## Database Schema

Migration:

- `supabase/migrations/202605080004_self_improving_learning_system.sql`

Tables:

- `learning_audit_logs`
- `learning_feedback`
- `learning_skill_performance_metrics`
- `learning_improvement_proposals`
- `learning_memory_refinement_suggestions`

All tables use organization-scoped RLS through `public.is_org_member(organization_id)`.

## Final Folder Tree

```txt
learning/
  FEEDBACK_SCHEMA.md
  IMPROVEMENT_RULES.md
  LEARNING_POLICIES.md

src/modules/agent-runtime/learning/
  FeedbackProcessor.ts
  LearningAnalyzer.ts
  LearningAuditLogger.ts
  LearningReviewQueue.ts
  MemoryRefinementEngine.ts
  SOPRefinementEngine.ts
  SkillPerformanceTracker.ts
  sample-mother-baby-learning.ts
  types.ts

supabase/migrations/
  202605080004_self_improving_learning_system.sql
```

## Next Step

Wire approved learning proposals into an admin-controlled application flow that can show diffs before modifying `SKILLS.md`, workflow docs, or memory files.
