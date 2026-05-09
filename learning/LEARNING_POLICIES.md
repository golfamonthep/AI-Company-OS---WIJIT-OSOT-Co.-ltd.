# Learning Policies

## Purpose

The Self-Improving Learning System helps agents improve through feedback, outcomes, and reviewable improvement proposals.

Learning is controlled. Agents may propose improvements, but they may not apply changes to core runtime, governance, permissions, or audit systems.

## Allowed Learning

- Identify successful output patterns.
- Identify repeated failure patterns.
- Score skill performance.
- Suggest SOP refinements.
- Suggest workflow optimizations.
- Suggest memory promotion, retagging, merging, or archival.
- Suggest prompt refinements for agent-owned skills.

## Restricted Learning

- Do not rewrite governance rules.
- Do not modify permission systems.
- Do not change core runtime architecture.
- Do not remove or weaken audit logging.
- Do not self-authorize new harness tools or external actions.
- Do not auto-edit `AGENT.md`, `SKILLS.md`, workflow docs, or memory files without human approval.

## Review Requirement

Every improvement must enter the LearningReviewQueue.

Human approval is required before:

- SOP changes are applied.
- workflow changes are applied.
- long-term memory is promoted or archived.
- prompt refinements become default behavior.

## Audit Requirement

Every learning event must be traceable:

- feedback processed
- insight generated
- metric updated
- proposal queued
- proposal approved, rejected, or revised
- memory refinement suggested
