# Tasks: Guided Connection Center

> Requirements: `@requirements.md`
> Design: `@design.md`
> Status: Approved

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-002–FR-003, FR-007, FR-009 | T1 |
| FR-004–FR-006, NFR-002–NFR-004 | T2 |
| FR-001–FR-003, FR-005, FR-008–FR-009, NFR-001 | T3 |
| All requirements | T4 |

## Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have coverage | Pass | T1–T4 cover all Must Haves |
| Design coverage | Pass | Design §§3–14 |
| Critical questions | N/A | None open |
| Ticket quality and ownership | Pass | Explicit below |
| Verification known | Pass | Collector/core/build plus Chromium |

## Execution Contract

Every ticket uses `tracking_owner: orchestrator`,
`session_policy: new-top-level-required`, a distinct visible top-level worker,
durable pre-edit acknowledgment, append-only `execution/<task-id>.md`, exact
verification evidence, and conservative rollover. Workers do not edit
orchestrator-owned tracking surfaces. High-tier challenge becomes mandatory if
host mapping selects Sol High or stronger.

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | None | Ready |
| T2 | T1 | Blocked |
| T3 | T1, T2 | Blocked |
| T4 | T3 | Blocked |

## Task T1: Declarative adapter setup profiles

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** none  
**Covers:** FR-002, FR-003, FR-007, FR-009, NFR-004  
**Delivers:** Each available source has one typed, shared setup profile with
truthful preparation, artifact, boundary, and recovery copy.

**Owned Surfaces:** `src/lib/evidence-catalog.ts`, `src/types.ts`,
`collector/adapters/catalog.ts`,
`src/lib/__tests__/feature014-catalog.test.mjs`  
**Coordination:** Merge owner for `SourceSetupProfile`; T2/T3 consume it.
Feature 015 must not overlap `src/types.ts` until T1 reconciliation.  
**Routing:** standard model, medium effort; bounded type/catalog change.
`high_tier_second_opinion: not-required`.  
**Lifecycle/Freshness:** acknowledged, started, ready-for-review or exception;
new top-level session and common rollover rules.

### Acceptance Criteria

- All current adapters have complete artifact kind, format, producer steps,
  read boundary, exclusions, examples, and safe validation help.
- OpenTelemetry is labelled an alignment/telemetry concept, not a connectable
  path by itself.
- Adding catalog copy requires no source-specific UI branch.

### Verification

- `node --test src/lib/__tests__/feature014-catalog.test.mjs`
- `npm run build`

## Task T2: Non-persisting collector validation endpoint

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-004–FR-006, NFR-002–NFR-004  
**Delivers:** Candidate source artifacts can be safely inspected before the
working configuration changes.

**Owned Surfaces:** `collector/server.ts`, `collector/adapters/types.ts`,
adapter inspection helpers, `src/lib/collector-client.ts`,
`collector/__tests__/source-validation.test.ts`  
**Coordination:** T2 is merge owner for collector routing. Feature 016 server
routes remain blocked until T2 completion is reconciled.  
**Routing:** deep model, high effort; filesystem, adapter, TOCTOU, session/CSRF,
and non-mutation invariants. Conditional high-tier challenge rule applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Validation returns only bounded metadata and stable safe failure codes.
- It never saves config, appends evidence, advances offsets, or creates events.
- Configure revalidates before persistence and refresh.
- Existing working connection survives candidate validation failure.

### Verification

- `npm run test:collector`
- `npm run verify:core`
- `npm run build`

## Task T3: Mode-aware guided connection workflow

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2  
**Covers:** FR-001–FR-005, FR-008–FR-009, NFR-001–NFR-003  
**Delivers:** Hosted and local users see the right next action; local users can
prepare, validate, confirm, and recover through one guided UI.

**Owned Surfaces:** `src/components/EvidenceSources.tsx`,
`src/components/ConnectionWizard.tsx`, `src/lib/use-collector.ts`,
`src/index.css`, `src/lib/__tests__/feature014-ui.test.mjs`  
**Coordination:** Consume catalog/validation contracts without widening them.
T3 is UI merge owner.  
**Routing:** standard model, high effort; stateful accessible UI with four
runtime modes. `high_tier_second_opinion: not-required`.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Hosted mode offers import/local continuation and never a live Connect action.
- Live mode validates before explicit Connect and preserves input on failure.
- Configured cards expose truthful health, refresh, change, and disconnect.
- Keyboard/focus/live-region behavior and 320px/200% layout pass.

### Verification

- Feature 014 UI tests
- `npm run build`
- Manual Chromium matrix for hosted/live/degraded and three named sources

## Task T4: End-to-end connection regression and operator guidance

**Priority:** P1  
**Estimate:** 3h  
**Blocked By:** T3  
**Covers:** All requirements and NFRs  
**Delivers:** The full source setup story is verified without weakening
existing evidence collection or hosted truth.

**Owned Surfaces:** Feature 014 focused tests, collector documentation/README
connection section, `scripts/verify-feature014.ps1` if a bounded script is
needed  
**Coordination:** No production-contract edits; conflicts return to T1–T3.
T4 is verification/guide merge owner.  
**Routing:** standard model, medium effort; integration verification and
operator copy. `high_tier_second_opinion: not-required`.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Praxen, Pipelock, and Runtime telemetry have recorded valid/invalid flows.
- Hosted mode makes no localhost request.
- Existing collector, governance, and snapshot behavior regressions pass.
- Documentation matches actual UI and source contract.

### Verification

- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- Recorded Chromium console/network/accessibility results
