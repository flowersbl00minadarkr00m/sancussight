# Tasks: Scalable Portability Targets

> Requirements: `@requirements.md`
> Design: `@design.md`
> Status: Approved

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001–FR-003, FR-009–FR-010, NFR-002–NFR-003 | T1 |
| FR-001–FR-002, FR-007–FR-010, NFR-002, NFR-005 | T2 |
| FR-004–FR-008, NFR-001, NFR-004–NFR-005 | T3 |
| All requirements | T4 |

## Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have coverage | Pass | T1–T4 |
| Design coverage | Pass | Design §§3–14 |
| Critical questions | N/A | None open |
| Dependencies/ownership/acceptance | Pass | Explicit below |
| Verification known | Pass | Feature/compiler/core/build and browser |

## Execution Contract

Every ticket uses `tracking_owner: orchestrator` and
`session_policy: new-top-level-required`, requires a fresh visible top-level
worker and durable pre-edit acknowledgment, writes only its owned surfaces plus
append-only execution evidence, and returns exact verification. Workers never
edit shared tracking files. Conditional high-tier challenge and conservative
rollover rules apply.

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | Feature 013 T4 | Externally blocked |
| T2 | T1 | Blocked |
| T3 | T2 | Blocked |
| T4 | T3 | Blocked |

The external blocker serializes shared compiler contracts/output with Feature
013. No ticket is dispatchable until the orchestrator reconciles Feature 013
T4 complete.

## Task T1: Registry schema 3 and loss-aware migration

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** Feature 013 T4  
**Covers:** FR-001–FR-003, FR-009–FR-010, NFR-002–NFR-003  
**Delivers:** Registry v2 imports deterministically into schema 3 with typed
legacy targets and preserved evidence; v3 local/portable output is validated.

**Owned Surfaces:** `src/types.ts`, `src/lib/registry.ts`,
`packages/registry-compiler/src/contracts.ts`,
`packages/registry-compiler/src/output/local.ts`,
schema/migration focused tests  
**Coordination:** Expand-contract merge owner. Consume Feature 013 final
compiler contracts; stop on incompatibility.  
**Routing:** deep model, high effort; system-wide schema/evidence migration.
High-tier challenge becomes pending if mapped to Sol High or stronger.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Every v2 platform becomes a `legacy-platform` target without inferred provider/model/protocol.
- Evidence state and dates are unchanged through migration.
- v3 output is deterministic; compatibility v2 export reports lost dimensions.
- Malformed/ambiguous targets fail safely without corrupting the prior registry.

### Verification

- Feature 015 migration tests
- `npm run test:registry-compiler`
- `npm run build`

## Task T2: Target catalog identity and coverage domain

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-001–FR-002, FR-007–FR-010, NFR-002, NFR-005  
**Delivers:** Stable target identities, aliases, filters, evidence-qualified
coverage, and explicit ambiguity handling work independently of UI.

**Owned Surfaces:** `src/lib/portability-targets.ts`,
`src/lib/__tests__/feature015-targets.test.mjs`,
compiler target proposal tests  
**Coordination:** Do not reopen schema shapes; T1 owns them. T2 owns pure target
operations consumed by UI.  
**Routing:** deep model, high effort; canonical identity and truth propagation.
Conditional high-tier challenge rule applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Canonical tuples produce stable IDs; label changes do not.
- Provider, model, protocol, surface, and runtime remain independent.
- Alias resolution is deterministic and near-duplicates stay reviewable.
- Coverage never inherits from provider/model metadata or sibling targets.
- 400-target filtering remains linear and bounded.

### Verification

- Feature 015 target-domain tests
- `npm run verify:core`
- `npm run build`

## Task T3: Compact target picker and bounded comparison

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2  
**Covers:** FR-004–FR-008, NFR-001, NFR-004–NFR-005  
**Delivers:** The Registry stays compact with many targets and supports an
accessible user-selected comparison of no more than four.

**Owned Surfaces:** `src/components/PortabilityTargetPicker.tsx`,
`src/components/Registry.tsx`, `src/index.css`,
`src/lib/__tests__/feature015-ui.test.mjs`  
**Coordination:** T3 is UI merge owner; no domain/schema edits.  
**Routing:** standard model, high effort; accessible dialog/list filtering and
responsive comparison state. `high_tier_second_opinion: not-required`.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Default view is summary plus small relevant target set, never all columns.
- Picker searches/groups all target dimensions and enforces four selections.
- Every cell uses textual verified/stale/unverified/not-shared/unknown truth.
- Kimi, DeepSeek, and local target fixtures render without component branches.
- Keyboard/focus, 320px/200%, and internal overflow behavior pass.

### Verification

- Feature 015 UI tests
- `npm run build`
- Recorded Chromium accessibility/responsive matrix

## Task T4: Version history, compiler round trip, and contract cleanup

**Priority:** P1  
**Estimate:** 4h  
**Blocked By:** T3  
**Covers:** All requirements and NFRs  
**Delivers:** Asset versions, compiler inputs/outputs, demo data, and exports
consistently use target IDs while the temporary v2 path remains explicit.

**Owned Surfaces:** `src/components/AssetVersionHistory.tsx`,
`src/lib/asset-versions.ts`, `src/lib/storage.ts`,
Feature 015 integration tests, compiler target serializer tests  
**Coordination:** T4 is feature integration merge owner; production schema/UI
contract changes return to T1/T3.  
**Routing:** deep model, high effort; historical evidence and multi-surface
round-trip verification. Conditional high-tier challenge applies.  
**Lifecycle/Freshness:** common execution contract.

### Acceptance Criteria

- Version snapshots retain target identity and original evidence qualification.
- Demo/fixture data illustrates precise and legacy targets truthfully.
- Local and portable v3 compiler round trips pass.
- Temporary v2 compatibility output is labelled and tested; no silent loss.

### Verification

- Feature 015 tests
- `npm run test:registry-compiler`
- `npm run verify:core`
- `npm run build`
