# TESTING_STRATEGY

The Testing and Quality Assurance Layer protects AI Company OS as a multi-agent infrastructure system. It is additive and lives outside the runtime architecture.

## Goals

- Preserve architecture stability.
- Validate workflow reliability.
- Protect governance and approval integrity.
- Make refactoring safer.
- Keep agent execution predictable.
- Prevent unsafe integration behavior.

## Test Layers

### Unit Tests

Unit tests validate isolated behavior:

- agent fixtures
- skill execution mocks
- memory retrieval injection
- harness permission behavior
- role and permission rules
- report generation

### Integration Tests

Integration tests validate cross-module behavior:

- workflow lifecycle
- API permission assumptions
- approval flow behavior
- memory update behavior
- retry behavior

### Workflow Simulation Tests

Simulation tests model company operations without external services:

- agent handoffs
- approval checkpoints
- failure and retry handling
- learning event generation
- audit event validation

### Governance Safety Tests

Governance tests are mandatory for:

- approval enforcement
- connector write restrictions
- risky claim detection
- emergency stop validation
- audit event expectations

### Regression Tests

Regression tests detect architecture drift:

- required layer files missing
- testing layer moved into runtime layers
- governance docs removed
- future checks for route permission coverage

## Test Commands

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:simulation
npm run test:regression
```

## Mock-First Policy

External systems must be mocked unless a test explicitly targets a configured integration. No test should publish, spend, send, delete, or mutate an external account.

## Current Simulation

The initial full simulation is:

Mother-and-baby TikTok Campaign Simulation

1. CEO AI starts campaign.
2. Marketing AI analyzes audience.
3. Content Creator AI generates scripts.
4. Governance approval is triggered.
5. Human approval is simulated.
6. Workflow completes.
7. Learning event is generated.
8. Audit logs are validated.
