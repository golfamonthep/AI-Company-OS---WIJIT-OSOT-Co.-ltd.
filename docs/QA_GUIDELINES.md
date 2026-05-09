# QA_GUIDELINES

QA for AI Company OS follows the existing layer separation.

## Rules

- Do not test external services directly in default CI.
- Do not bypass governance in tests.
- Do not create runtime-only shortcuts for test convenience.
- Keep fixtures deterministic.
- Keep mocks under `src/testing`.
- Keep assertions specific to behavior and layer boundaries.

## Required Coverage Areas

- Agent runtime behavior
- Skill execution behavior
- Memory retrieval and injection
- Workflow lifecycle and retries
- Governance permissions and approvals
- Audit log generation
- Connector permission restrictions
- Emergency stop behavior
- Repository fallback behavior
- API permission flow

## Test Data

Use factory classes for repeatable data:

- `MockAgentFactory`
- `MockWorkflowFactory`
- `MockMemorySystem`
- `MockHarnessExecutor`

Factories should produce valid records by default and accept overrides only for the field being tested.

## Governance QA

Every high-impact action must have a test path showing one of:

- denied
- requires approval
- approved by a role with authority

Connector write and external actions must never succeed in tests unless approval is explicitly simulated.

## Workflow QA

Workflow tests should assert:

- every required step is represented
- dependencies are respected
- approval checkpoints pause execution
- retry behavior is observable
- learning events happen only after approval when required
- audit logs include approval decisions

## Pull Request Expectations

Changes to runtime, governance, integrations, persistence, auth, or API layers should include at least one targeted test or a clear TODO explaining why a test cannot be added yet.
