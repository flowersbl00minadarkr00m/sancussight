# Feature 011 R2 Findings-Limited Review

## Review Metadata

- **Pass:** R2, limited to the four preserved R1 findings, their corrections,
  and regressions caused by those corrections
- **Reviewer:** fresh visible top-level independent session
  `019f94e5-fdc6-7ba1-94aa-274727be1af4`
- **Review gate inspected:** `implementation:in-progress`
- **Authority:** approved `requirements.md`, `design.md`, and `tasks.md`
- **Prior comprehensive pass:** `review-r1.md`
- **Reset trigger:** none; no comprehensive reset was performed
- **Review axes:** Spec alignment and Standards/code quality
- **Production deployment:** `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`
- **Verdict:** **Needs fixes**

This is a findings-limited recommendation, not an approval or status
transition. The tracking owner remains the sole writer of authoritative task
and feature state.

## Executive Assessment

Fresh review resolves three of the four preserved R1 findings:

- `R1-SPEC-001` passes: official base/input/output facet containers are
  admitted only as wholesale omissions, and hostile values remain absent from
  projection, DOM, safe hashes and 352 inspected hash preimages, console,
  downloads, and IndexedDB.
- `R1-STANDARDS-001` passes: the effective-200 browser path explicitly reopens
  and measures the Standards Interoperability workspace.
- `R1-STANDARDS-002` passes: an invalid persisted record produces honest
  unavailable history while the current sanitized preview remains usable.

`R1-SPEC-002` remains unresolved. The correction places a promise queue on
each `InteroperabilityPreviewStore` instance, but the repository-level
`list -> compare -> put` sequence is still not atomic across store instances.
A fresh two-instance probe against one shared repository returned
`recorded: [true, true]` and persisted two equivalent snapshots. The checked-in
unit and hosted browser probes exercise only the single-instance path and
therefore do not close the approved deterministic-dedupe contract.

## Preserved Finding Disposition

| Finding | Axis | R2 Result | Fresh evidence |
|---|---|---|---|
| `R1-SPEC-001` | Spec | Resolved | Feature 011 tests 29/29; hosted Chrome accepts one record with six exact omissions; all six hostile sentinels absent from 352 SHA-256 preimages and all inspected output/storage surfaces. |
| `R1-SPEC-002` | Spec | **Unresolved** | One-store test and hosted path pass, but a fresh two-store/one-repository concurrent probe returns `[true, true]` and two snapshots. |
| `R1-STANDARDS-001` | Standards | Resolved | Hosted Chrome explicitly reopens `Standards Interoperability`; viewport 320, DPR 2, page overflow 0, workspace 1, rail 1, active heading exact, table 736/258. |
| `R1-STANDARDS-002` | Standards | Resolved | Unit and hosted probes report unavailable history for corrupt state, preserve current preview, and leave unrelated databases unchanged. |

## Spec Axis

### In-Scope Contract Coverage

| Contract | R2 Result | Evidence / Notes |
|---|---|---|
| FR-002 / FR-003 / D-001 / TD-002 | Pass | Direction-specific dataset allowlists accept `facets` plus only `inputFacets` or `outputFacets`; presence is counted through `Object.hasOwn` without reading facet values. |
| FR-007 / NFR-004 / TD-005 corruption behavior | Pass | Invalid repository records make list/record unavailable; no new write proceeds over known corrupt state; UI no longer renders healthy empty-history copy. |
| NFR-003 / FR-007 / TD-005 deterministic dedupe | **Fail** | The mutex is instance-local. Concurrent equivalent calls through separate store instances sharing one repository can both observe an empty list and both insert. |
| NFR-005 effective-200 evidence | Pass | Fresh installed-Chrome matrix proves the correct workspace identity and responsive metrics after reload/reopen. |

### Planned / As Built Reconciliation

- **Planned:** equivalent consecutive previews deduplicate deterministically
  in the dedicated Feature 011 repository, including the C1 acceptance that
  two or more concurrent equivalent records produce exactly one persisted
  snapshot and deterministic recorded results.
- **As built:** calls through one `InteroperabilityPreviewStore` instance are
  serialized in invocation order. The serialization is not shared by another
  store instance over the same repository, and the IndexedDB equivalence check
  and insertion remain separate transactions.
- **Material divergence:** `R1-SPEC-002` is only partially corrected. The owning
  implementation/review frontier must remain open; requirements and design do
  not need reopening.

## Standards Axis

- Project conventions, privacy boundaries, failure honesty, focused tests,
  effective-200 evidence discipline, and hosted same-origin behavior pass
  within the bounded scope.
- The instance-local queue is a high-signal correctness and maintainability
  gap because the public store abstraction accepts a shared repository while
  presenting deterministic repository behavior. A single transactional
  repository mechanism should own equivalence check and insertion rather than
  relying on caller-instance serialization.
- No unrelated simplification, style, dependency, accessibility, or product
  finding was added.

## Unresolved Finding

### R1-SPEC-002 — Equivalent-preview dedupe is not concurrency-safe across store instances

- **Axis:** Spec alignment
- **Severity:** Medium
- **Blocking:** Yes
- **Affected contract:** NFR-003, FR-007, TD-005, C1 acceptance
- **Source:** `src/lib/interoperability-store.ts:108`,
  `src/lib/interoperability-store.ts:136`,
  `src/lib/interoperability-store.ts:151`,
  `src/lib/interoperability-store.ts:164`

`recordQueue` belongs to one `InteroperabilityPreviewStore`. Two store
instances sharing the same repository own independent queues, so both can
complete `list()` before either `put()`.

Fresh bounded probe:

```json
{
  "recorded": [true, true],
  "availability": "available",
  "count": 2
}
```

The existing focused test creates one store instance, and the installed-Chrome
matrix exercises one module-level store instance. Both pass but do not cover
repository-level concurrency.

**Bounded correction:** make equivalence check and insertion atomic at the
repository boundary, including separate store instances/browser contexts, or
use an equivalent repository-wide uniqueness/serialization mechanism. Add a
deterministic two-instance shared-repository regression and rerun the preserved
local/hosted findings matrix.

## Fresh Verification

The required local commands ran in exact order and all exited 0:

| Order | Command | Result |
|---|---|---|
| 1 | `npm run test:feature011` | Pass — 29/29 |
| 2 | `npm run test:feature010` | Pass — 31/31 |
| 3 | `npm run test:feature009` | Pass — 24/24 |
| 4 | `npm run test:feature008` | Pass — 6/6 |
| 5 | `npm run test:collector` | Pass — 92/92 |
| 6 | `npm run test:registry-compiler` | Pass — 28/28 |
| 7 | `npm run verify:core` | Pass |
| 8 | `npm run build` | Pass — 1,845 modules; pre-existing non-failing chunk advisory |
| 9 | `git -c core.autocrlf=false diff --check` | Pass |

Additional fresh read-only/probe results:

- canonical hosted static comparison: 6/6 exact bytes and SHA-256, PASS;
- findings-limited installed-Chrome production matrix: 14/14, PASS;
- console/page errors: 0/0; 20 requests, canonical same-origin only;
- deployment inspection: exact deployment, production target, `READY`, and
  canonical alias present;
- project identity: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`;
- team identity: `team_Y7ueoZZnBOfX63cjuG9R9SYG`; and
- two-store/one-repository concurrent dedupe probe: FAIL, two equivalent
  snapshots persisted.

## Verdict

**Needs fixes.**

`R1-SPEC-001`, `R1-STANDARDS-001`, and `R1-STANDARDS-002` are resolved.
`R1-SPEC-002` remains blocking because the deterministic dedupe correction is
instance-local rather than repository-concurrency-safe. Preserve all passing
evidence and reopen only that finding plus regressions caused by its bounded
correction.
