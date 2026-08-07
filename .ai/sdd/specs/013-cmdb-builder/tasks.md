# Tasks: CMDB Builder and Registry Enrichment

> Requirements: `@requirements.md`
> Design: `@design.md`
> Status: Approved

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001–FR-002, FR-009, FR-015 | T1 |
| FR-003–FR-006, FR-010–FR-012, NFR-001–NFR-002 | T2 |
| FR-007, NFR-003 | T3 |
| FR-008–FR-009, FR-013–FR-014, NFR-004–NFR-005 | T4 |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | All Must Have FRs map to T1–T4 |
| Requirements are covered by design | Pass | Design §§3–14 |
| Critical questions are answered | Pass | Requirements Q-001–Q-003 answered |
| Dependencies, ownership, acceptance, files, verification | Pass | Declared per ticket |
| Verification commands known | Pass | Compiler tests/build plus core/build |

## Execution Contract

All tickets use `tracking_owner: orchestrator` and
`session_policy: new-top-level-required`. Each requires a distinct visible
top-level worker session, durable acknowledgment before edits, append-only
`execution/<task-id>.md`, and `ready-for-review` with exact commands, exit
codes, outputs, and changed files. Workers never edit `tasks.md`, `.status`,
`.ai/sdd/INDEX.md`, or `.ai/sdd/handoff/sdd-brief.md`. Roll over before
approximately 250k tokens or earlier after compaction, missing telemetry,
ownership change, or context uncertainty.

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | None | Ready |
| T2 | T1 | Blocked |
| T3 | T1 | Blocked |
| T4 | T1, T2, T3 | Blocked |

## Task T1: CMDB contracts, normalization, and refresh history

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** none  
**Covers:** FR-001, FR-002, FR-009, FR-015, NFR-002  
**Delivers:** Existing compiler proposals normalize into deterministic,
fact-classified CMDB candidates, including reviewable location observations.

**Owned Surfaces:** `packages/registry-compiler/src/cmdb/**`,
`packages/registry-compiler/src/contracts.ts`,
`packages/registry-compiler/src/refresh/**`,
`packages/registry-compiler/src/__tests__/cmdb-normalize*.test.ts`  
**Coordination:** T1 is merge owner for CMDB contracts. Feature 015 must not
edit compiler contracts/output until T4 is reconciled.  
**Routing:** model class `deep`; effort `high`; reason: identity, migration, and
privacy invariants cross compiler layers. `high_tier_second_opinion:
not-required` unless the orchestrator maps to Sol High or stronger, in which
case it becomes pending before dispatch.  
**Lifecycle:** acknowledged → started → ready-for-review; blocked,
contract-conflict, or verification-failed when applicable.

### Work

- Add bounded CMDB field/fact/location contracts and validators.
- Implement deterministic normalization without converting unknown into fact.
- Extend refresh diff/sidecar migration for proposed location changes.
- Add manifest/new/missing/ambiguous fixture coverage.

### Acceptance Criteria

- Unchanged input produces byte-stable candidate and location diffs.
- Recorded, deterministic, external, human, and missing classifications remain distinct.
- Unsupported files are reported as unobserved, not discovered.
- Sidecar v1 migrates without fabricated location history.

### Verification

- `npm run test:registry-compiler`
- `npm run build:registry-compiler`

## Task T2: Bounded enrichment coordinator and source policy

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-003–FR-006, FR-010–FR-012, NFR-001–NFR-002  
**Delivers:** Selected CMDB candidates can request allowlisted fields from
approved first-party adapters, with citations, limits, conflicts, and offline
fallback.

**Owned Surfaces:** `packages/registry-compiler/src/cmdb/enrichment.ts`,
`packages/registry-compiler/src/cmdb/source-policy.ts`,
`packages/registry-compiler/src/cmdb/adapters/**`,
`packages/registry-compiler/src/__tests__/cmdb-enrichment*.test.ts`  
**Coordination:** Consume T1 contracts; do not alter them without a
contract-conflict event.  
**Routing:** model class `deep`; effort `high`; reason: network privacy,
provenance, and partial failure require adversarial validation.
`high_tier_second_opinion: not-required` with the same conditional remap rule.  
**Lifecycle/Freshness:** common execution contract.

### Work

- Implement fixed request allowlist, outbound disclosure model, and adapter interface.
- Add source qualification, time/size/concurrency limits, and conflict groups.
- Add offline construction guard and isolated safe diagnostics.
- Test prohibited data, redirects/arbitrary URLs, stale/conflicting sources, and partial failure.

### Acceptance Criteria

- No path, registry object, evidence payload, prompt, or prohibited field can enter a request.
- Every proposed value carries field-level citation and qualification.
- Conflicts never auto-select; network failure preserves local normalization.
- `--offline` creates no network adapter or request.

### Verification

- `npm run test:registry-compiler`
- `npm run verify:core`

## Task T3: Field-level CMDB review workflow

**Priority:** P1  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-005–FR-007, NFR-003  
**Delivers:** The existing loopback review page supports normalized fields,
outbound disclosure, conflicts, and bounded human decisions.

**Owned Surfaces:** `packages/registry-compiler/ui/review.html`,
`packages/registry-compiler/src/review/session.ts`,
`packages/registry-compiler/src/__tests__/cmdb-review*.test.ts`  
**Coordination:** T3 owns review state/UI only; T4 consumes its decisions.  
**Routing:** model class `standard`; effort `high`; reason: stateful accessible
review is complex but contracts are fixed. `high_tier_second_opinion:
not-required`.  
**Lifecycle/Freshness:** common execution contract.

### Work

- Add source, normalization, disclosure, field-diff, and publish stages.
- Add search/filter/grouping and bounded empty-field bulk acceptance.
- Preserve decisions through adapter failure and navigation.
- Verify keyboard, focus, textual truth, narrow layout, and no remote UI assets.

### Acceptance Criteria

- Each field shows old/proposed value, fact class, source, and decision.
- Bulk acceptance cannot replace existing/human fields or mix source classes.
- Failure states retain unrelated decisions.
- Full workflow operates at 320 CSS pixels and 200% zoom.

### Verification

- `npm run test:registry-compiler`
- Manual Chromium review-flow matrix recorded in execution evidence

## Task T4: Atomic registry and canonical-index publication

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2, T3  
**Covers:** FR-008–FR-010, FR-013–FR-014, NFR-004–NFR-005  
**Delivers:** One validated atomic transaction publishes local/portable
registries, sidecar, diagnostics, and deterministic labelled indexes.

**Owned Surfaces:** `packages/registry-compiler/src/output/**`,
`packages/registry-compiler/src/cli.ts`,
`packages/registry-compiler/src/__tests__/cmdb-output*.test.ts`,
`packages/registry-compiler/test/cli.test.ts`  
**Coordination:** T4 is final compiler merge owner. Feature 015 compiler work
remains blocked until T4 completion is reconciled by the orchestrator.  
**Routing:** model class `deep`; effort `high`; reason: atomicity, rollback,
path privacy, and compatibility are high-consequence. Conditional high-tier
challenge rule applies.  
**Lifecycle/Freshness:** common execution contract.

### Work

- Generate deterministic local/portable JSON indexes and self-contained read-only HTML index.
- Extend atomic staging, validation, digest summary, rollback generation, and CLI integration.
- Preserve accepted location aliases and missing history without redirects.
- Run compiler, core, and application regression verification.

### Acceptance Criteria

- Registry and index outputs cannot publish at different generations.
- Index creation performs no move/copy/link/delete/overwrite of upstream assets.
- Portable index contains aliases, never exact local paths.
- Interrupted/failed publication leaves the previous generation recoverable.

### Verification

- `npm run test:registry-compiler`
- `npm run build:registry-compiler`
- `npm run verify:core`
- `npm run build`
