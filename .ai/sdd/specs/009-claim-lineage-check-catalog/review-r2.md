# Feature 009 R2 Findings-Limited Independent Review

> Requirements: `requirements.md`
> Design: `design.md`
> Tasks: `tasks.md`
> Authority gate observed: `implementation:in-progress`
> Review completed: 2026-07-24

## Verdict

**Green — all four in-scope R1 findings are resolved.**

R2 found no blocking or non-blocking correction within its authorized scope.
This verdict resolves only `R1-SPEC-001` through `R1-SPEC-004`, their C1-C3
corrections, and regressions caused by those corrections. It is not a
comprehensive reset and does not itself mark Feature 009 complete.

## Review Pass History

| Pass | Scope | Trigger | Verdict |
|---|---|---|---|
| R1 | Comprehensive approved Feature 009 scope | Initial independent review | Needs fixes |
| R2 | `R1-SPEC-001` through `R1-SPEC-004`, their C1-C3 fixes, and fix-caused regressions | Required findings follow-up; no reset trigger | Green |

No approved requirement or design change, broad regression signal, new
security/safety signal, or user-authorized comprehensive reset was observed.

## Prior Finding Disposition

| Finding | R2 disposition | Exact evidence |
|---|---|---|
| `R1-SPEC-001` | Resolved | Exact result references are collected and matched only to envelope IDs at `src/lib/claim-lineage.ts:80-90`; absent referenced envelopes become explicit missing state at `src/lib/claim-lineage.ts:180-184`. The adversarial negative test is at `src/lib/__tests__/feature009-claim-lineage.test.mjs:125`. C2 real-Chromium observations record unrelated same-asset and asset-binding evidence absent, with no induced stale/conflict state. |
| `R1-SPEC-002` | Resolved | App records `signal.id` as `resultDiscriminator` at `src/App.tsx:165-175`; read identity includes it at `src/components/CheckCatalog.tsx:211-216`; stream, dedupe, retention, and validation require it at `src/lib/check-history-store.ts:17-25`, `90-118`, `332-343`, and `390-404`. Sibling, legacy-isolation, and retention tests begin at `feature009-check-history.test.mjs:159`, `203`, and `227`. |
| `R1-SPEC-003` | Resolved | Renderer groups an ordered array of all outgoing edges per source at `src/components/ClaimLineageInspector.tsx:17-22` and renders every relationship at `:92-100`. The render-contract regression is at `feature009-check-catalog-ui.test.mjs:89`; C2 displays two conflict labels in stable order. |
| `R1-SPEC-004` | Resolved | `understanding.md:51-78` now retains Planned and appends a current As Built account; `tasks.md:101` and `sdd-brief.md:203-210,268-270` identify C1-C3 complete and R2 as the sole findings-limited frontier. |

## Spec Axis

### Findings-Limited Coverage

| Contract area | Status | Evidence / notes |
|---|---|---|
| FR-003, FR-007, NFR-003 — exact evidence qualification and truth classes | Pass | Only exact referenced envelope IDs enter lineage. Unrelated same-asset evidence and configured asset bindings alone cannot qualify a result. Missing, stale, conflicting, inferred, and verified states remain textual. |
| FR-002, FR-005, NFR-002, NFR-003, NFR-005 — sibling result history | Pass | Stable result discrimination flows from projection through record, storage, read, dedupe, and retention. C2 observed independent `1/1` sibling counts, unchanged-repeat `1/1`, changed sibling `1/2`, correct PASS/FAIL current/previous behavior, and no false previous result for the unchanged sibling. |
| FR-003 — one-to-many conflict relationships | Pass | Both target-outgoing conflict relationships render in the builder’s stable order. |
| FR-006, NFR-001, NFR-004 — fix-caused navigation, focus, responsive, and compatibility regressions | Pass | C2 observed Asset Passport/detail round-trip focus, mutually exclusive narrow DOM, activating-row focus restoration, and no 320px/effective-200% page overflow. Feature 008 and broad compatibility suites passed fresh. |
| NFR-002 — history privacy | Pass | Current snapshots use the fixed seven-field allowlist. Raw evidence/display copy, paths, prompts, responses, credentials, registry objects, and safe-reference preimages remain excluded. |
| Hosted continuity | Pass | Fresh local build reproduced C3's exact 5-file, 592,631-byte static manifest; fresh canonical and immutable deployment inspection resolved to `dpl_ANzB5nVfioTixm5YYY8pqYQUpziK`, target `production`, status `Ready`. |
| Planned / As Built and frontier evidence | Pass | Supporting records are current and do not claim authority over `.status`. |

### Task and Design Check

| Area | Status | Notes |
|---|---|---|
| C1 correction acceptance | Pass | All three product findings have direct source, adversarial-test, and browser evidence. |
| C2 local browser acceptance | Pass | Real-Chromium report, structured observations, and four screenshots are internally consistent; no C2 product correction was retained. |
| C3 hosted correction continuity | Pass | Corrected source, accepted lockfile, local/prebuilt/hosted static hash, project, alias, and deployment identity reconcile. |
| TD-003 / D-003 | Pass | One discriminator extends the existing snapshot identity and safely isolates legacy rows without a new migration or user decision. |
| TD-004 / D-001 | Pass | Exact evidence qualification replaces incidental asset co-reference; bounded claim and governance lineage remain separate. |
| D-004 / NFR-001 | Pass | Canonical navigation and focus behavior remain intact after the fixes. |

## Standards Axis

The correction passes the project standards review:

- **Correctness and type boundaries:** `resultDiscriminator` is explicit in
  projection, snapshot, record, read, stream, and render-facing types.
- **Failure handling:** malformed or legacy rows fail snapshot validation;
  IndexedDB failures return `unavailable` without blocking current results.
- **Privacy:** storage remains a fixed seven-field metadata allowlist with
  hashes instead of raw evidence or source content.
- **Accessibility:** all relationship states remain visible text; C2 confirms
  focus entry/return and narrow single-DOM behavior.
- **Test quality:** focused tests are adversarial, including unrelated
  same-asset evidence, independent sibling streams, legacy rows, retention,
  privacy, and multi-edge rendering.
- **Maintainability:** the fix reuses stable `Signal.id` rather than adding a
  second identity generator, and one ordered per-source edge grouping replaces
  the lossy special case.
- **Coherence and simplification:** no removable correction-only concept,
  competing product surface, unsupported configuration, new runtime
  dependency, or unjustified user/maintainer decision was found.

## Findings

### Blocking findings

None.

### Non-blocking findings

None.

## Residual Risks and Human-Only Checks

- C2 fixtures are synthetic and establish deterministic UI/storage behavior,
  not external evidence truth. This is consistent with the approved
  truthfulness boundary.
- Legacy discriminator-less rows remain physically present until the existing
  clear-history action, but fresh inspection and tests confirm they cannot
  become current, previous, dedupe, or retention evidence for a current
  result.
- C3 did not recreate the complete narrow/fixture matrix in production because
  the managed browser bridges could not provide the needed file chooser and
  viewport controls. Continuity is supported by C2's locked browser evidence,
  fresh passing source gates, exact local build reproduction, and byte
  identity with the hosted artifact.

These are bounded evidence limitations, not correction findings.

## Fresh Verification

All commands ran from `C:/Users/henry/sancussight`.

| Command or check | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run test:collector` | 0 | 92/92 passed | PASS |
| `npm run test:registry-compiler` | 0 | 22/22 passed | PASS |
| `npm run verify:core` | 0 | Core deterministic assertions passed | PASS |
| `npm run build` | 0 | TypeScript passed; Vite transformed 1,835 modules | PASS |
| `git diff --check` | 0 | No whitespace errors; line-ending warnings only | PASS |
| deterministic `dist` static-manifest check | 0 | `05506A631F3019D5B72F5BE88E5F66221D98A193FE889D7A4CBB5011AA5E02BC`; 5 files; 592,631 bytes; exact C3/hosted match | PASS |
| `vercel inspect https://sancussight.vercel.app --scope hflowers45-9370s-projects` | 0 | Alias resolves to exact corrected deployment, production target, Ready | PASS |
| `vercel inspect dpl_ANzB5nVfioTixm5YYY8pqYQUpziK --scope hflowers45-9370s-projects` | 0 | Exact immutable deployment is Ready with the canonical alias | PASS |

## Final R2 Recommendation

Return `sancussight-009-R2-ready-20260723-01` to the tracking owner.
The tracking owner must reconcile this recommendation and fresh evidence
before changing shared tracking or Feature 009 authority status.
