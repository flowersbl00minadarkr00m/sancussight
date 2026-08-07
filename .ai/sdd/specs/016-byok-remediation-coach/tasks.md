# Tasks: BYOK Remediation Coach

> Requirements: `@requirements.md`
> Design: `@design.md`
> Status: Approved

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001–FR-004, NFR-001 | T1, T2 |
| FR-003–FR-005, FR-010, NFR-004 | T2 |
| FR-006–FR-012, NFR-002–NFR-004 | T3 |
| FR-001, FR-005–FR-012, NFR-002–NFR-005 | T4 |
| All requirements | T5 |

## Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have coverage | Pass | T1–T5 |
| Design coverage | Pass | Design §§3–16 |
| Critical questions | N/A | None open |
| Dependencies/ownership/acceptance | Pass | Explicit below |
| Verification known | Pass | Collector/core/build, Windows and Chromium matrices |

## Execution Contract

All tickets use `tracking_owner: orchestrator`,
`session_policy: new-top-level-required`, durable acknowledgment before edits,
append-only execution records, exact return evidence, no shared tracking-file
writes, and conservative rollover. Any Sol High-or-stronger host mapping
requires an independent fresh-session challenge before dispatch.

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | None | Ready |
| T2 | T1, Feature 014 T2 | Blocked |
| T3 | T2 | Blocked |
| T4 | T3 | Blocked |
| T5 | T4 | Blocked |

Feature 014 T2 externally serializes shared `collector/server.ts` routing.

## Task T1: Windows credential store and non-secret config

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** none  
**Covers:** FR-002–FR-003, NFR-001, NFR-004  
**Delivers:** Provider secrets can be written, used transiently, replaced, and
deleted through Windows Credential Manager with no plaintext fallback.

**Owned Surfaces:** `collector/byok/secret-store.ts`,
`collector/byok/windows-credential-store.ts`,
`collector/byok/windows-credential.ps1`,
`collector/byok/config-store.ts`, `collector/byok/contracts.ts`,
`collector/__tests__/byok-secret*.test.ts`  
**Coordination:** T1 owns secret/config contracts. Later tasks consume them and
must stop on contract conflict.  
**Routing:** deep model, high effort; credential lifecycle and process boundary
are high-consequence. Conditional high-tier challenge applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Secrets appear in no config file, command argument, environment, log, HTTP response, export, or error.
- Fixed helper operation/path uses stdin and returns no secret to the browser.
- Replace/delete is recoverable and fail-closed; no plaintext fallback exists.
- Buffers are bounded and cleared on every completion path.

### Verification

- BYOK secret-store unit tests
- Windows Credential Manager integration check with disposable test target
- `npm run test:collector`
- `npm run build`

## Task T2: Provider connections, validation, and model discovery API

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, Feature 014 T2  
**Covers:** FR-001, FR-003–FR-005, FR-010, NFR-001, NFR-004  
**Delivers:** A local authenticated user can test, save, enable, discover
models for, disable, replace, and delete a bounded provider connection.

**Owned Surfaces:** `collector/byok/provider.ts`,
`collector/byok/connection-service.ts`, `collector/server.ts`,
provider connection sections of `src/lib/byok-client.ts`,
`collector/__tests__/byok-provider*.test.ts`  
**Coordination:** Feature 014 T2 first owns collector routing. T2 becomes BYOK
route merge owner after that blocker.  
**Routing:** deep model, high effort; SSRF, redirects, auth, provider variance,
rate limits, and cancellation. Conditional high-tier challenge applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Remote endpoints require HTTPS; only explicit loopback HTTP is allowed.
- Redirects, private non-loopback destinations, oversized model lists, and
  unsafe errors fail closed.
- Test-before-enable is enforced; manual model IDs have a compatibility test.
- No provider response or credential is persisted/logged unbounded.

### Verification

- BYOK provider/server tests
- `npm run test:collector`
- `npm run verify:core`
- `npm run build`

## Task T3: Bounded payload and append-only plan service

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2  
**Covers:** FR-006–FR-012, NFR-002–NFR-004  
**Delivers:** Selected findings produce a digest-confirmed model request or
deterministic template and a strictly validated, versioned proposed plan.

**Owned Surfaces:** `collector/remediation/**`, remediation routes in
`collector/server.ts`, remediation sections of `src/lib/byok-client.ts`,
`collector/__tests__/remediation-*.test.ts`  
**Coordination:** T2 owns provider/route foundation; T3 serially extends it and
is plan-service merge owner.  
**Routing:** deep model, high effort; data egress, request lifecycle, strict
parsing, append-only decisions. Conditional high-tier challenge applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Preview and send payloads are byte-equivalent by canonical digest.
- Only allowlisted selected finding fields can leave the machine.
- Timeout/token/retry/concurrency/cancel states are enforced and recorded safely.
- Invalid/cyclic/oversized/executable model output creates no plan mutation.
- Human decisions remain separate; accepted never means completed/verified.
- Deterministic template and sanitized export obey the same boundaries.

### Verification

- Remediation payload/plan/service tests
- `npm run test:collector`
- `npm run verify:core`
- `npm run build`

## Task T4: Local-only Remediation Coach UX

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T3  
**Covers:** FR-001, FR-004–FR-012, NFR-002–NFR-005  
**Delivers:** Users can configure BYOK, inspect egress, generate/cancel, and
govern proposed plan steps without execution controls.

**Owned Surfaces:** `src/components/RemediationCoach.tsx`,
Queue/navigation integration, `src/index.css`,
`src/lib/__tests__/feature016-ui.test.mjs`  
**Coordination:** Consume service contracts; T4 owns UI only.  
**Routing:** standard model, high effort; multi-step secret and async lifecycle
UX with accessibility constraints. `high_tier_second_opinion: not-required`.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Hosted mode disables BYOK and offers deterministic template/local guidance.
- Saved secrets are never redisplayed; replace/delete/test states are truthful.
- Payload review shows exact values, provider/model/host, limits, and policy qualification.
- Plan steps show proposed vs human decision and no run/fix/verify/close actions.
- Keyboard, focus, live states, cancellation, and 320px/200% behavior pass.

### Verification

- Feature 016 UI tests
- `npm run build`
- Recorded Chromium hosted/local/provider-failure matrix

## Task T5: Adversarial security and end-to-end release verification

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T4  
**Covers:** All requirements and NFRs  
**Delivers:** BYOK trust boundaries and complete operator flow have fresh
adversarial and integration evidence.

**Owned Surfaces:** Feature 016 integration/security tests,
`scripts/verify-feature016.ps1` if needed, BYOK operator documentation  
**Coordination:** No production contract edits; route defects to T1–T4.
T5 is verification/documentation merge owner.  
**Routing:** deep model, high effort; independent adversarial review of secret,
SSRF, egress, authority, and failure boundaries. Conditional high-tier
challenge applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Searches and instrumented fixtures find no secret leakage surface.
- SSRF/redirect/session/CSRF/body-limit and malformed-response matrices pass.
- Failure/cancellation never changes findings, evidence, or prior plans.
- Documentation matches implemented platform limitations and no-execution boundary.

### Verification

- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- Windows credential lifecycle matrix
- Chromium network/console/accessibility matrix
