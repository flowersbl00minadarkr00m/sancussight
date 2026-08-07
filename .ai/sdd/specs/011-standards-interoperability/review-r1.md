# Feature 011 R1 Independent Review

## Review Metadata

- **Pass:** R1, comprehensive across the full approved Feature 011 scope
- **Reviewer:** fresh visible top-level independent session
- **Review gate inspected:** `implementation:done`
- **Authority:** approved `requirements.md`, `design.md`, and `tasks.md`
- **Review axes:** Spec alignment and Standards/code quality
- **Production target:** `https://sancussight.vercel.app`
- **Verdict:** **Needs fixes**
- **Blocking findings:** 2
- **Non-blocking findings:** 2

This is review evidence, not an approval or status transition. The tracking
owner remains the sole writer of authoritative task and feature state.

## Executive Assessment

The implementation has a strong bounded, local-first core. All nine required
local commands passed in the prescribed order, the reviewed source manifest
still matches, the exact production deployment is `READY`, all six hosted
static artifacts match the reviewed build byte-for-byte, and fresh Chromium
inspection found no page overflow, third-party requests, console errors, or
focus-entry regressions in the interoperability workspace.

Two adversarial cases nevertheless break approved Must-Have contracts:

1. valid OpenLineage `inputFacets` and `outputFacets` containers are rejected
   as unknown dataset keys instead of being omitted wholesale; and
2. concurrent equivalent preview writes can both pass the pre-write dedupe
   check and persist duplicate records.

Those failures affect FR-002/FR-003 and NFR-003 respectively, so the review
cannot recommend completion.

## Spec Alignment

### Requirements Coverage

| Requirement | Result | Evidence |
| --- | --- | --- |
| FR-001 | Pass | Pinned profile registry, exact-shape validation, UI labels, and primary-source version checks agree. |
| FR-002 | **Fail** | `R1-SPEC-001`: official dataset facet containers are rejected rather than omitted. |
| FR-003 | **Fail** | `R1-SPEC-001`: an otherwise valid facet-bearing record is counted as rejected with zero omissions. |
| FR-004 | Pass | Alignment projection is local, bounded, metadata-only, and derived from accepted runtime evidence. |
| FR-005 | Pass | Statement v1 builder/validator, canonical export, and explicit unsigned boundary pass tests and browser inspection. |
| FR-006 | Pass | One Advanced Evidence Sources workspace provides the required import, alignment, export, history, and limitations surfaces. |
| FR-007 | Pass with note | IndexedDB/memory fallback and retention behavior pass; invalid-record honesty is covered by `R1-STANDARDS-002`. |
| FR-008 | Pass | Policy preview remains research-only; no runtime policy engine was added. |
| NFR-001 | Pass | Fixed allowlists, prohibited-key checks, domain-separated hashes, and no raw imported identifiers in persisted previews were verified. |
| NFR-002 | Pass | Stability labels and non-claims are explicit and accurate. |
| NFR-003 | **Fail** | `R1-SPEC-002`: deterministic equivalent-preview dedupe is not concurrency-safe. |
| NFR-004 | Pass with note | Local-first isolation passes; corrupted-record reporting is covered by `R1-STANDARDS-002`. |
| NFR-005 | Pass | Fresh real-Chromium inspection confirmed native focus entry, single-DOM responsive behavior, and bounded horizontal overflow. |

### Approved Decisions and Design

| Contract | Result | Notes |
| --- | --- | --- |
| D-001 / TD-002 | **Partial** | The import is local and metadata-only, but official input/output facet containers do not follow the approved wholesale-omission path. |
| D-002 / TD-003 | Pass | Alignment remains a preview and emits no telemetry. |
| D-003 / TD-004 | Pass | Export stops at a canonical unsigned Statement v1; no envelope/signature claim exists. |
| D-004 | Pass | Interoperability is integrated under Advanced Evidence Sources. |
| D-005 | Pass | Policy work remains research only. |
| TD-001 | Pass | No standards SDK dependency was added; pinned local profiles are used. |
| TD-005 | **Partial** | Dedicated storage exists and is bounded in ordinary sequential use, but equivalent-write dedupe is not atomic. |

### Task Reconciliation

| Task | Result | Review note |
| --- | --- | --- |
| T1 | **Needs correction** | Core projection is present, but its dataset allowlist misses official `inputFacets`/`outputFacets`. |
| T2 | Pass | Telemetry alignment and Statement v1 behavior align with the approved design. |
| T3 | **Needs correction** | Storage/UI integration is present, but concurrent equivalent writes can persist duplicates. |
| T4 | Pass with evidence correction | Product behavior passes fresh R1 Chromium inspection; the prior effective-200 screenshot did not exercise the feature workspace. |
| T5 | Pass with evidence correction | Exact production identity and static continuity pass independently; the copied effective-200 evidence inherits the T4 scope error. |

## Findings

### R1-SPEC-001 — Official OpenLineage input/output facet containers are rejected

- **Axis:** Spec alignment
- **Severity:** Medium
- **Blocking:** Yes
- **Affected contract:** FR-002, FR-003, D-001, TD-002; design §§3.2, 7, and 9
- **Source:** `src/lib/openlineage-import.ts:52`,
  `src/lib/openlineage-import.ts:281`
- **Primary standard:** OpenLineage 1.0.5 schema defines `inputFacets` on
  `InputDataset` and `outputFacets` on `OutputDataset`, in addition to base
  dataset `facets`.

`DATASET_KEYS` permits only `namespace`, `name`, and `facets`. The validator
therefore returns `unknown-dataset-key` before the projector can omit the
official input/output facet containers.

Fresh adversarial result for an otherwise valid pinned RunEvent:

```json
{
  "ok": true,
  "acceptedCount": 0,
  "rejectedCount": 1,
  "omittedCount": 0,
  "rejectionCodeCounts": [
    { "code": "unknown-dataset-key", "count": 1 }
  ]
}
```

The approved contract requires supported core records to survive facet
presence while facet containers are omitted wholesale and never traversed.
The current behavior converts a privacy-preserving omission into a record
rejection and produces a dishonest omission count for valid standard shapes.

**Bounded correction:** distinguish input and output dataset allowlists, admit
only their official facet-container keys, mark those containers as omitted
without traversing them, and add focused unit plus browser coverage for
`facets`, `inputFacets`, and `outputFacets`.

### R1-SPEC-002 — Concurrent equivalent imports bypass deterministic dedupe

- **Axis:** Spec alignment
- **Severity:** Medium
- **Blocking:** Yes
- **Affected contract:** NFR-003, FR-007, TD-005; design §3.5
- **Source:** `src/lib/interoperability-store.ts:128`

`record()` performs dedupe as a non-atomic `list → compare → put → list`
sequence. Two concurrent calls can both observe no equivalent prior record and
both write.

Fresh repository-level adversarial result:

```json
{
  "recorded": [true, true],
  "count": 2,
  "rawCount": 2
}
```

Fresh canonical-production Chromium reproduction using two simultaneous file
input events for the same synthetic OpenLineage payload:

```json
{
  "count": 2,
  "createdAt": [
    "2026-07-24T15:09:43.911Z",
    "2026-07-24T15:09:43.913Z"
  ]
}
```

This is reachable because the async import path permits a second input event
while the first write is pending. The result violates the approved
deterministic equivalent-preview dedupe contract.

**Bounded correction:** serialize record operations within the store or use a
single IndexedDB transaction/uniqueness strategy covering equivalence check
and insertion. Add a deterministic concurrent-write regression test and a
browser interaction that exercises repeated input while persistence is
pending.

## Standards and Code Quality

### R1-STANDARDS-001 — Prior effective-200 evidence checks the wrong workspace

- **Axis:** Standards/code quality
- **Severity:** Medium
- **Blocking:** No; fresh R1 verification recovered the product claim
- **Affected evidence:** T4 and T5 browser evidence
- **Source:** `execution/T4-browser/browser-matrix.mjs:449`,
  `execution/T5-hosted/hosted-browser-matrix.mjs:472`

Both scripts set device metrics and then reload. The active Advanced Evidence
Sources workspace is in memory rather than route-persisted, so reload returns
to the default Asset Catalog. The saved
`effective-200-percent.png` visibly shows Asset Catalog, yet the reports mark
the effective-200 Feature 011 check as passed.

Fresh R1 Chromium inspection kept the feature workspace active and measured:

```json
{
  "innerWidth": 320,
  "devicePixelRatio": 2,
  "scrollWidth": 320,
  "clientWidth": 320,
  "pageOverflow": 0,
  "workspaceCount": 1,
  "railCount": 1,
  "tableScrollWidth": 736,
  "tableClientWidth": 258,
  "activeHeading": "Standards Interoperability"
}
```

The product passes; the earlier evidence claim is overbroad.

**Bounded correction:** after reload, explicitly reopen the interoperability
workspace before measuring/screenshotting, assert the workspace heading, and
record layout metrics in the result JSON.

### R1-STANDARDS-002 — Invalid persisted records disappear behind “available”

- **Axis:** Standards/code quality
- **Severity:** Low
- **Blocking:** No
- **Affected quality:** failure honesty, maintainability, bounded retention
- **Source:** `src/lib/interoperability-store.ts:116`,
  `src/lib/interoperability-store.ts:326`

`list()` silently drops invalid repository records through `validRecords()` and
still returns `availability: 'available'`. A fresh probe with one invalid
persisted record returned:

```json
{
  "availability": "available",
  "visibleSnapshots": 0,
  "persistedRecords": 1
}
```

The UI can therefore report no history while an unrecognized record remains
stored. Because retention operates only on valid records, ordinary cleanup
does not remove that record.

**Bounded correction:** surface an honest degraded/unavailable state or
transactionally quarantine/delete invalid records, and add corruption-path
coverage that proves the UI does not claim empty healthy storage.

## Fresh Verification Evidence

### Local Gate Sequence

Run in the required order against `C:\Users\henry\sancussight`:

| Order | Command | Result |
| --- | --- | --- |
| 1 | `npm run test:feature011` | Pass — 27/27 |
| 2 | `npm run test:feature010` | Pass — 31/31 |
| 3 | `npm run test:feature009` | Pass — 24/24 |
| 4 | `npm run test:feature008` | Pass — 6/6 |
| 5 | `npm run test:collector` | Pass — 92/92 |
| 6 | `npm run test:registry-compiler` | Pass — 28/28 |
| 7 | `npm run verify:core` | Pass |
| 8 | `npm run build` | Pass — 1,845 modules |
| 9 | `git -c core.autocrlf=false diff --check` | Pass |

`artifact-guard.ps1 -Mode compare-source` also passed against
`T5-hosted/reviewed-source-manifest.json`.

### Exact Production Identity

Independent read-only Vercel inspection confirmed:

- deployment `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH`
- immutable URL
  `sancussight-f8zoeu66a-hflowers45-9370s-projects.vercel.app`
- project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ` (`sancussight`, Vite)
- account/team `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- target `production`
- `readyState: READY`
- canonical alias `sancussight.vercel.app`
- `aliasError: null`
- the same deployment is the project's latest deployment

### Hosted Static Continuity

At `2026-07-24T15:12:58.819Z`, a fresh read-only comparison fetched all six
canonical production artifacts with status 200 and matched the reviewed
manifest's exact byte counts and SHA-256 digests:

- `assets/index-aQw-ZaFl.css`
- `assets/index-gpYwNh6r.js`
- `spec/evidence-packet-interoperability-v1.schema.json`
- `favicon.svg`
- `index.html`
- `sancussight-workspace.webp`

### Hosted Browser Inspection

Fresh canonical-production Chromium inspection confirmed:

- focus enters the `Standards Interoperability` heading;
- exactly one interoperability workspace and one profile rail are rendered;
- only the canonical production origin was requested;
- no console errors/warnings or page errors occurred;
- profile versions/stability labels and unsigned/local-only boundaries render;
- 320 CSS px at DPR 2 has no page-level horizontal overflow;
- the wide comparison table scrolls inside its bounded container; and
- IndexedDB/concurrent-import adversarial paths were exercised in ephemeral
  browser contexts without writing project evidence or changing production.

## Verdict

**Needs fixes.**

Preserve the passing local, production identity, static continuity, responsive
layout, privacy, telemetry-alignment, and unsigned Statement evidence. Reopen
only the affected Feature 011 implementation/review frontier to correct
`R1-SPEC-001` and `R1-SPEC-002`, add focused regressions, rerun the exact local
and hosted gates, and return the fixes for bounded R1 follow-up review.

