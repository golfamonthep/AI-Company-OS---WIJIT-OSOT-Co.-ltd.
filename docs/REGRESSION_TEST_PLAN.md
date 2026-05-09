# REGRESSION_TEST_PLAN

Regression testing prevents accidental drift from the AI Company OS architecture.

## Initial Regression Scope

The first regression suite checks:

- Authentication and workspace layer files remain present.
- Testing layer files remain isolated under `src/testing`.
- Governance rules, approval policies, and audit requirements remain documented.

## Planned Regression Checks

Add checks for:

- all API mutation routes call workspace permission helpers
- connector write routes enforce approval authority
- memory and workflow records are workspace-scoped
- repository methods support in-memory fallback
- dashboard viewer mode hides mutation controls
- learning proposals require review before application
- emergency stop blocks workflow execution

## Architecture Drift Signals

Flag a regression if:

- agents, skills, harnesses, memory, workflows, governance, learning, operations, integrations, persistence, API, auth, or testing become mixed in one module
- runtime code imports test-only mocks
- governance checks are replaced by direct allow logic
- workspace scoping is skipped on new persisted records
- external integrations gain write behavior without approval tests

## Reporting

`TestReportGenerator` creates a simple report object for simulations and regression checks. Future CI can serialize these reports into JSON artifacts.
