# Feature 010 R1 Review: Asset Versioning and Evidence Packets

> Requirements: `requirements.md`
> Design: `design.md`
> Tasks: `tasks.md`
> Pass: `R1`
> Scope: complete approved Feature 010 scope
> Trigger: first comprehensive review; no reset
> Gate inspected: `implementation:done`
> Review mode: independent read-only review
> Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`

## Verdict

**Needs fixes.**

Fresh prescribed verification passes, and the exact canonical deployment is
byte-identical to the fresh local build. The implementation is broadly aligned
and the UI/browser/deployment evidence is credible. R1 nevertheless found
three blocking Spec failures and two non-blocking Standards failures. The
tracking owner must decide gate reconciliation; this worker does not update
`.status`, tasks, INDEX, sdd-brief, or understanding.

## Review Pass History

| Pass | Scope | Trigger | Prior findings in scope | Result |
|---|---|---|---|---|
| R1 | Full approved Feature 010 scope | First independent comprehensive review | None | Needs fixes |

## Requirements Coverage

| Requirement | Status | Evidence / Notes |
|---|---|---|
| FR-001 Bounded asset version model | Partial | Explicit recording, dedupe, immutable fixed projection, check-only transitions, 50-entry retention, and absent-field compatibility pass. Imported IDs are accepted by format without verifying the approved deterministic identity preimage (`R1-SPEC-003`). |
| FR-002 Flexible version aliases | Pass | Case-insensitive add/move/remove, one pointer per logical label, multiple labels per version, per-version/per-asset bounds, and truth-boundary copy pass in unit and browser evidence. |
| FR-003 Current-versus-previous comparison | Partial | The immediately previous distinct version is used and state rules pass, but the fixed 100-item slice can omit a later check transition while still returning `ready` (`R1-SPEC-001`). |
| FR-004 Regression/recovery explanations | Fail | A valid comparison with 100 unchanged coverage facts and one check regression returns 100 items but drops the regression entirely (`R1-SPEC-001`). |
| FR-005 Versioned Evidence Packet | Partial | Exact shape, canonical digest, hashed subject, producer/run/qualification sections, and both packet kinds pass. Portable sanitized history can be exported as `recorded` even though its snapshot was modified after recording (`R1-SPEC-002`); the builder also copies caller-supplied comparison claims without deriving them (`R1-STANDARDS-002`). |
| FR-006 Sanitized local export | Pass | Fixed output shape, prohibited key/value checks, tamper mismatch, bounds, local Blob download, filename, and privacy negatives pass. No network export path was found. |
| FR-007 Passport and Exit Drill integration | Pass | One canonical six-section Passport, App-owned mutations, current-version packet action, current-result Exit Drill action, honest pending/success/failure states, and no drill persistence/execution claim. |
| FR-008 Schema-version-2 compatibility | Partial | Versionless schema2 input remains versionless and compiler refresh preserves history without appending. Invalid deterministic IDs are not rejected, and portable preservation changes immutable snapshot values while retaining the same ID (`R1-SPEC-002`, `R1-SPEC-003`). |
| NFR-001 Accessibility | Pass | Textual states, native controls, visible labels/status regions, focus return, one-DOM narrow flow, identifier wrapping, 320 CSS pixels, and effective 200% evidence pass. |
| NFR-002 Privacy/local-first | Pass | Projection excludes raw content and identities, downloads locally, hosted traffic is canonical static GET only, and no runtime function or analytics route exists. |
| NFR-003 Determinism/truthfulness | Fail | Normal paths are deterministic, but identity validation, portable `recorded` qualification, hidden capped regressions, and permissive invalid calendar-date acceptance break the complete truth contract. |
| NFR-004 Compatibility/boundedness | Partial | Named 50/16/32/100 bounds pass, but comparison bounding discards a meaningful transition without an unavailable/truncated state (`R1-SPEC-001`). |
| NFR-005 Security/failure isolation | Partial | Web Crypto/download failure is honest and packet safety fails closed; calendar-impossible ISO-shaped values are accepted by product, packet, and compiler validators (`R1-STANDARDS-001`). |

## Task Completion Check

| Task | Status | Evidence / Notes |
|---|---|---|
| T1 | Partial | Core model, alias, retention, compatibility, and privacy tests pass. Deterministic IDs are created correctly but not revalidated on import (`R1-SPEC-003`). |
| T1R1 | Pass | Qualified equivalence records status/evidence/source changes and ignores evaluation-time-only repetition. Direct pass/fail regression and recovery tests pass. |
| T2 | Partial | Packet shape/digest/privacy/download gates pass. Comparison claims remain caller-provided rather than derived by the packet boundary (`R1-STANDARDS-002`). |
| T3 | Fail | Local preservation passes. Portable sanitization mutates an immutable snapshot while preserving its recorded ID; downstream export labels the derivative snapshot `recorded` (`R1-SPEC-002`). |
| T4 | Pass | Canonical History and Exit Drill integrations match approved ownership and UI boundaries. |
| T5 | Partial | Browser matrix and the valid date-only correction pass. Invalid calendar dates still normalize instead of failing closed (`R1-STANDARDS-001`). |
| T6 | Pass | Fresh gates pass; canonical and immutable Vercel inspections resolve deployment `dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V`; fresh hosted byte comparison is 5/5 exact. |

## Design Check

| Design area / decision | Status | Notes |
|---|---|---|
| D-001 Explicit immutable snapshots | Partial | Explicit recording works, but portable output mutates retained snapshot values and imported ID/content consistency is not verified. |
| D-002 Flexible aliases | Pass | Aliases remain bounded mutable labels outside snapshots and do not imply truth. |
| D-003 Current versus immediately previous | Partial | Pair selection is correct; capped projection can silently omit meaningful later transitions. |
| D-004 Native packet contract | Partial | Canonical digest and strict shape pass; recorded qualification and optional comparison derivation are not end-to-end trustworthy for all accepted inputs. |
| D-005 Schema remains 2 | Pass | Schema version stays 2; absent optional fields remain valid and no automatic migration/version creation was observed. |
| Corrected equivalence projection | Pass | Snapshot/source/status/evidence changes are distinct; evaluated-at-only changes dedupe. |
| Compiler preservation | Partial | Local exact preservation passes; portable projection needs a truthful identity/qualification contract. |
| Product integration/focus | Pass | One canonical workspace, App mutation ownership, responsive/focus evidence, and local export behavior align. |

## Planned / As Built Reconciliation

The Planned model remains visible in `understanding.md`: mutable current asset
state flows through explicit immutable recording, current-versus-previous
comparison, textual transition classification, and a sanitized local packet.
The As Built sections accurately describe the happy path and the T5/T6
evidence. R1 adds these material divergences:

1. comparison boundedness can erase a meaningful transition while reporting a
   ready comparison;
2. imported version IDs are structurally checked but not reconciled with the
   deterministic identity rule;
3. portable compiler output changes recorded snapshot labels while preserving
   the old identity, and a later packet calls that changed projection
   `recorded`;
4. ISO-shaped impossible dates pass through `Date.parse`-based validation; and
5. the packet boundary copies an optional comparison instead of deriving it
   from recorded versions.

`understanding.md` also retains a stale header value
`implementation:in-progress` while its As Built body reaches T6 and the
authority `.status` is `implementation:done`. This is a supporting-evidence
freshness discrepancy, not a separate product finding. The authority gate was
read from `.status`.

## Spec Findings

### R1-SPEC-001 — The 100-item cap can silently discard a real regression

- **Severity:** High
- **Blocking:** yes
- **Affected contract:** FR-003, FR-004, NFR-003, NFR-004, design §3.3
- **Exact evidence:**
  - `src/lib/asset-versions.ts:259-269` appends coverage, fallback,
    dependency, and verification items, then takes the first 100.
  - Fresh adversarial probe used 100 valid unchanged coverage entries plus one
    `pass -> fail` check transition. Result:
    `CAPPED_COUNT 100`,
    `CAPPED_HAS_CHECK_REGRESSION false`,
    `CAPPED_LAST_KEY coverage:p095`.
- **Problem:** The result says `ready` but omits the only meaningful
  regression. FR-004 requires each meaningful changed item to be classified;
  unchanged context must not crowd out the change.
- **Suggested bounded fix:** Reopen the comparison design to define cap
  semantics. At minimum, deterministically prioritize changed items over
  unchanged context and expose explicit truncation/unavailable metadata when
  all meaningful items cannot fit. Add a regression test with more than 95
  earlier fact items and a later check regression.

### R1-SPEC-002 — Portable sanitization turns a modified snapshot into a “recorded” claim

- **Severity:** High
- **Blocking:** yes
- **Affected contract:** FR-001, FR-005, FR-008, NFR-003, design §§3.4, 3.7
- **Exact evidence:**
  - `packages/registry-compiler/src/output/local.ts:263-280` rewrites retained
    snapshot provider/capability/fallback labels for portable output while
    preserving the original version object and ID.
  - `src/lib/evidence-packet.ts:153-180` hashes the changed snapshot but copies
    the preserved version ID and unconditionally sets
    `qualification: 'recorded'`.
  - Fresh compiler tests confirm portable labels differ while version ID is
    preserved; product schema2 normalization accepts that output.
- **Problem:** The portable snapshot is a privacy projection produced after
  the recording event, not the immutable recorded snapshot. After import, the
  UI can export a packet that calls those modified facts `recorded`, creating a
  material identity/qualification overclaim.
- **Suggested bounded fix:** Return to the owning requirements/design gate and
  choose one truthful contract: preserve a safe immutable recorded projection,
  explicitly mark and identify a portable derivative, or omit unsafe history
  from portable output. Packet qualification must distinguish the selected
  outcome and must not call modified facts `recorded`.

### R1-SPEC-003 — Imported version IDs are not verified against the deterministic identity rule

- **Severity:** High
- **Blocking:** yes
- **Affected contract:** FR-001, FR-005, FR-008, NFR-003, design §§3.2, 3.7
- **Exact evidence:**
  - `src/lib/asset-versions.ts:286-303` checks version shapes, uniqueness,
    chronology, equivalence, aliases, and the current pointer but never
    recomputes the approved ID preimage.
  - `packages/registry-compiler/src/output/local.ts:376-379` likewise validates
    only the `av1_<32 hex>` pattern.
  - Fresh adversarial probe replaced a valid version ID with
    `av1_ffffffffffffffffffffffffffffffff`, updated the current pointer, and
    returned `FORGED_VERSION_ID_ACCEPTED true`.
- **Problem:** A schema2 import may claim any syntactically valid ID for
  different recorded content. The compiler preserves it and the packet
  predicate repeats it, contradicting deterministic identity and the
  fail-closed invalid-metadata requirement.
- **Suggested bounded fix:** Add an integrity-verification seam that recomputes
  and checks the approved identity preimage before accepted import, compiler
  preservation, and packet export. If synchronous schema normalization cannot
  perform the required hash, reopen design and define an explicit verified /
  unverified identity state rather than silently accepting it as valid.

## Standards Findings

### R1-STANDARDS-001 — ISO validation accepts impossible calendar dates

- **Severity:** Medium
- **Blocking:** no independently; covered by the blocking verdict above
- **Affected contract:** NFR-003, NFR-005, T5 date-only correction
- **Exact evidence:**
  - `src/lib/asset-versions.ts:731-739`,
    `src/lib/evidence-packet.ts:787-788`, and
    `packages/registry-compiler/src/output/local.ts:472-473` use a shape regex
    plus `Date.parse`.
  - Fresh adversarial probe passed `2026-02-30` and received
    `2026-02-30T00:00:00.000Z`:
    `INVALID_DATE_NORMALIZED [...]`.
- **Problem:** `Date.parse` normalizes some calendar-impossible values instead
  of proving round-trip validity. The stored string remains impossible and the
  same permissive pattern exists at all three validation boundaries.
- **Suggested bounded fix:** Consolidate one strict calendar-aware ISO parser
  shared by product, packet, and compiler validation. Require a canonical
  round trip for date-only and timestamp inputs and add leap-day, month/day,
  offset, and fractional-second cross-runtime tests.

### R1-STANDARDS-002 — The packet builder copies comparison claims instead of deriving them

- **Severity:** Medium
- **Blocking:** no independently; covered by the blocking verdict above
- **Affected contract:** FR-003, FR-004, FR-005, NFR-003, design §3.4
- **Exact evidence:**
  - `src/lib/evidence-packet.ts:140-146` verifies only shape and current version
    ID.
  - `src/lib/evidence-packet.ts:420-439` copies every comparison field.
  - Fresh adversarial probe changed `recovery` to `regression`, recomputed the
    packet digest, and returned
    `RECOMPUTED_COMPARISON_OVERCLAIM_VALID true`.
- **Problem:** The digest proves canonical payload integrity, not that the
  comparison was derived from the named versions. The normal UI caller is
  correct, but the strict packet boundary permits an internal caller to emit a
  validly digested unsupported claim.
- **Suggested bounded fix:** Let the packet builder accept current and previous
  recorded versions and call the one canonical comparison mechanism itself.
  Avoid a second caller-authored representation of the same truth.

## Standards Axis Summary

- Project conventions, TypeScript/build hygiene, local-first ownership,
  browser capability failure, privacy-negative validation, accessibility, and
  deployment discipline are strong.
- No unsupported runtime dependency, route, analytics path, score, signing
  claim, provider action, or competing workspace was found.
- The reusable packet export component and single version model are coherent;
  no removal is recommended there.
- The duplicate ISO validators should be consolidated.
- Caller-authored packet comparison is an avoidable second truth mechanism.
- Portable version projection introduces unjustified maintainer decision
  burden because identity, immutable facts, privacy transformation, and packet
  qualification no longer share one explicit authority.

## Fresh Verification

| Command / check | Exit | Result |
|---|---:|---|
| `npm run test:feature010` | 0 | 24 passed, 0 failed |
| `npm run test:feature009` | 0 | 24 passed, 0 failed |
| `npm run test:feature008` | 0 | 6 passed, 0 failed |
| `npm run test:collector` | 0 | 92 passed, 0 failed |
| `npm run test:registry-compiler` | 0 | 26 passed, 0 failed |
| `npm run verify:core` | 0 | Core assertions passed |
| `npm run build` | 0 | TypeScript and Vite build passed; 1,839 modules |
| `git diff --check` | 0 | No whitespace diagnostics; line-ending warnings only |
| `vercel inspect https://sancussight.vercel.app --scope hflowers45-9370s-projects` | 0 | `dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V`, production, Ready |
| `vercel inspect dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V --scope hflowers45-9370s-projects` | 0 | Same immutable deployment, production, Ready |
| fresh canonical hosted byte comparison | 0 | 5/5 files exact; 632,905 bytes; manifest `EFF3941141DAA58E8035F01FED38A19FBB272BC303DD7A070458AE515EC845A0` |
| adversarial invalid-date/identity/cap/overclaim probe | 0 | Reproduced all four reported gaps |

## Exact Deployment Reconciliation

- project: `sancussight`
- project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- scope: `hflowers45-9370s-projects`
- deployment ID: `dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V`
- canonical URL: `https://sancussight.vercel.app`
- immutable URL:
  `https://sancussight-7vnb0dj0e-hflowers45-9370s-projects.vercel.app`
- target/status: `production` / `Ready`
- fresh hosted manifest:
  `EFF3941141DAA58E8035F01FED38A19FBB272BC303DD7A070458AE515EC845A0`
- identity conclusion: canonical and immutable inspections resolve the same
  deployment, and every hosted static byte matches the fresh local build.

## Non-Finding Adversarial Notes

- Equivalent qualified states dedupe; check status, safe evidence, source
  reference, or snapshot changes create a distinct version.
- Cross-asset identical version IDs are possible by approved construction, but
  aliases and current pointers are asset-scoped and packet subject hashes
  disambiguate assets. R1 records no separate finding for this approved scope.
- Alias collision/move/removal and 50-entry retention passed.
- Versionless schema2 input remains unmodified.
- Digest mismatch, unsafe nested keys/values, unsupported packet versions,
  oversized named collections, raw registry shapes, unavailable Web Crypto,
  and unavailable download capability fail closed.
- Captured local and hosted screenshots support the stated desktop/narrow/focus
  observations; no visual blocker was found.

## Readiness

- Spec axis: **Fail**
- Standards axis: **Needs fixes**
- Verification gate: **Pass**
- Deployment identity: **Pass**
- Recommended tracking-owner action: reconcile the five findings, reopen the
  owning requirement/design contracts for the three blocking Spec findings,
  and dispatch bounded fix tickets before an R2 follow-up.
