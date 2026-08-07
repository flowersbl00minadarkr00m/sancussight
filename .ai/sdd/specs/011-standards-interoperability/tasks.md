# Feature 011 Implementation Tasks

> Status: Approved
> Approval: Operator blanket approval for Feature 011 normal SDD progression,
> reconciled 2026-07-24 after coverage, ownership, dependency, privacy,
> verification, and routing review
> Requirements: `@requirements.md`
> Design: `@design.md`
> Tracking owner: visible top-level orchestrator task
> `019f914a-b672-77b1-837f-0c866b6421bb`

## Authority and Execution Rules

- The orchestrator is the sole writer of this file, `.status`,
  `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`.
- Every implementation, browser, deployment, correction, and review ticket
  requires a new visible top-level Codex task.
- Workers acknowledge exact ownership before edits, append only their own
  execution record, and return one stable terminal event.
- `ready-for-review` is a recommendation until the orchestrator inspects the
  owned diff/evidence and reruns fresh verification.
- Writable overlap is serialized by the task chain below.
- No subagent, hidden worker, Pi, provider action, commit, push, or Spec
  005/T16R5/T16/A-002 action is authorized.
- Standard/high is the maximum route. No Sol High-or-stronger dispatch is
  planned, so an independent pre-dispatch challenge is not required.

## Requirement Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T1, T2 |
| FR-002 | T1, T4 |
| FR-003 | T1, T4 |
| FR-004 | T2, T3, T4 |
| FR-005 | T2, T3, T4, T5 |
| FR-006 | T3, T4, T5 |
| FR-007 | T3, T4 |
| FR-008 | T1, R1 |
| NFR-001 | T1–T5, R1 |
| NFR-002 | T1–T5, R1 |
| NFR-003 | T1–T4, R1 |
| NFR-004 | T1–T5, R1 |
| NFR-005 | T3–T5, R1 |

## Dependency Graph

```text
T1 profiles + OpenLineage
  -> T2 telemetry alignment + Statement
  -> T3 preview storage + Evidence Sources UI
  -> T4 local real-Chromium acceptance
  -> T5 exact production deployment + hosted acceptance
  -> R1 independent two-axis review
  -> C1 findings-limited correction
  -> C2 findings-limited local Chromium regression
  -> C3 exact corrected production deployment + hosted regression
  -> R2 findings-limited follow-up review
  -> C4 repository-wide atomic dedupe correction
  -> C5 local findings regression
  -> C6 exact corrected deployment + hosted regression
  -> R3 single-finding follow-up review
```

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | FR-001 through FR-008 mapped |
| Requirements covered by design | Pass | Design mapping complete |
| Critical questions answered | Pass | Signing/live ingestion/policy runtime explicitly deferred |
| Dependencies and owned files defined | Pass | Serial chain; no worker overlap |
| Verification commands known | Pass | Focused, regression, browser, hosted gates named |
| Privacy boundary testable | Pass | Raw identifiers/facets/content negative tests |
| Frontier exists | Pass | T1 has no incomplete blocker |
| Sol High challenge needed | N/A | Standard/high route |

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | none | Complete |
| T2 | T1 | Complete |
| T3 | T2 | Complete |
| T4 | T3 | Complete |
| T5 | T4 and usable Vercel authentication | Complete |
| R1 | T1–T5 | Complete — Needs fixes |
| C1 | R1 | Complete |
| C2 | C1 | Complete |
| C3 | C2 and usable Vercel authentication | Complete |
| R2 | C1–C3 | Complete — Needs fixes |
| C4 | R2 | Complete |
| C5 | C4 | Complete |
| C6 | C5 and usable Vercel authentication | Complete |
| R3 | C4–C6 | Complete |

## T1 — Pinned profiles and bounded OpenLineage projection

> Status: complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: none
> Model class / effort: standard / high
> Rationale: adversarial parser, privacy, hashing, and evolving-profile
> boundaries need careful cross-checking but no frontier-tier model
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-t1-worker-prompt.md`
> Sole authorized worker: `019f944b-ca85-7f80-bd23-f42218249ff5`
> Acknowledgment: `sancussight-011-T1-acknowledged-20260724-01` delivered
> Completion evidence: `sancussight-011-T1-ready-20260724-01` delivered;
> tracking-owner verification passed 7/31/24/6 tests, core, build, and scoped
> whitespace.
> Dispatch recovery: the source orchestration task created the required fresh
> visible local task. Duplicate task
> `019f944a-8e9f-76a1-8f75-a3f392719998` stopped before product or
> execution-record edits and is not authorized to resume.

### Work

- Add Feature 011 profile and preview types.
- Implement immutable profile registry.
- Implement bounded JSON/JSONL OpenLineage parser and metadata-only projector.
- Add stable rejection/omission codes, domain-separated hashes, ordering,
  byte/record bounds, and hostile facet/privacy tests.
- Add `test:feature011` only if absent, with no runtime dependency.
- Preserve policy preview as research-only; add no runtime policy module.

### Owned Surfaces

- `src/types.ts` only for Feature 011 types
- new `src/lib/standards-profiles.ts`
- new `src/lib/openlineage-import.ts`
- focused T1 tests under `src/lib/__tests__/feature011-*.test.mjs`
- `package.json` and `package-lock.json` only if required for an additive
  `test:feature011` command; no dependency
- `execution/T1.md` and `execution/T1-handoff.md`

### Acceptance

- Exact pinned profile/stability/source metadata.
- 1 MiB/500-record limits and JSON/JSONL handling are deterministic.
- Supported records survive unrelated malformed records.
- Unknown schemas/types/keys fail or report unsupported explicitly.
- Facet values are never traversed into projection.
- Raw producer/schema/run/job/dataset identifiers and hash preimages cannot
  enter returned or stored shapes.
- Output contains only counts, stable codes, canonical times, and safe hashes.

### Verification

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T2 — Telemetry alignment and unsigned Statement v1

> Status: Complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T1
> Model class / effort: standard / high
> Rationale: two pure contract projections with privacy and truth-label
> boundaries; no external integration execution
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-t2-worker-prompt.md`
> Sole authorized worker: `019f945b-11d6-7d61-a046-c597cc1aea2e`
> Acknowledgment: `sancussight-011-T2-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-T2-ready-20260724-01` reconciled
> Tracking-owner verification: Feature 011 17/17, Feature 010 31/31,
> Feature 009 24/24, Feature 008 6/6, `verify:core`, production build
> (1,839 modules), and scoped whitespace all pass
> Duplicate reconciliation: tasks
> `019f945a-8da1-7440-bb1a-3fdc11ea1c9c` and
> `019f945a-fadb-78c3-83cd-99dc8d02fd1c` are permanently stopped. They
> touched only the initial `execution/T2.md` acknowledgment scaffold; the
> designated worker's current record is preserved. Neither duplicate changed
> product, tests, schema, package, shared tracking, or verification state.

### Work

- Project accepted runtime evidence into fixed OTel/OpenInference alignment
  rows.
- Add explicit prohibited-content rows and non-conformance labels.
- Build/validate/canonicalize/download unsigned Statement v1 from a validated
  Evidence Packet.
- Publish the custom predicate JSON Schema.
- Add adversarial privacy, tamper, profile, shape, digest, and capability tests.

### Owned Surfaces

- new `src/lib/telemetry-alignment.ts`
- new `src/lib/in-toto-statement.ts`
- new `public/spec/evidence-packet-interoperability-v1.schema.json`
- focused non-overlapping T2 tests
- `execution/T2.md` and `execution/T2-handoff.md`

### Acceptance

- Alignment consumes only accepted runtime evidence, not raw OTLP.
- Content families remain `omitted-private` and absent from values.
- Every row names profile, state, source field, target field, and limitation.
- Statement exact shape uses official Statement v1 `_type` and custom
  SancusSight predicate type.
- Invalid/tampered packets, unsafe values, unknown profiles, or Web Crypto
  failure create no Statement/download claim.
- Statement is always explicit `unsigned: true` and
  `externallyVerified: false`.

### Verification

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T3 — Preview storage and Evidence Sources workspace

> Status: Complete
> Priority: P0
> Estimate: 4–6 hours
> Blocked By: T2
> Model class / effort: standard / high
> Rationale: consequential cross-view React integration, IndexedDB privacy,
> responsive/focus behavior, and no-duplicate-DOM requirement
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-t3-worker-prompt.md`
> Sole authorized worker: `019f946b-9d1d-7e00-aeca-5a1226b2c0f4`
> Acknowledgment: `sancussight-011-T3-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-T3-ready-20260724-01` delivered
> Tracking-owner verification: Feature 011 27/27, Feature 010 31/31,
> Feature 009 24/24, Feature 008 6/6, collector 92/92, registry compiler
> 28/28, `verify:core`, production build (1,845 modules), and scoped
> whitespace all pass.
> Duplicate reconciliation: tasks
> `019f946b-1b3c-7703-a37e-ad09090b9c54` and
> `019f946b-ba82-7df3-b707-98e45e99075c` are permanently stopped. Both made
> no filesystem, execution-record, product/test/CSS/store/UI, shared-tracking,
> or verification changes.

### Work

- Add dedicated Feature 011 IndexedDB repository with memory test seam,
  validation, dedupe, retention, unavailable state, and clear.
- Add one Standards Interoperability component under Advanced -> Evidence
  Sources.
- Integrate OpenLineage import, alignment matrix, Evidence Packet input,
  Statement download, preview history, clear, and permanent limitations.
- Preserve existing Evidence Sources rail, navigation, routes, and footer.
- Add static/component/store tests and Feature 011 CSS.

### Owned Surfaces

- new `src/lib/interoperability-store.ts`
- new `src/components/StandardsInteroperability.tsx`
- `src/App.tsx` only for workspace state/render/focus/data wiring
- `src/components/EvidenceSources.tsx` only if a bounded contextual link is
  needed; no source behavior rewrite
- Feature 011 selectors in `src/index.css`
- focused non-overlapping T3 tests
- `execution/T3.md` and `execution/T3-handoff.md`

### Acceptance

- Stored shapes contain only fixed sanitized fields and safe hashes.
- 20/profile and 100/global retention, equivalent dedupe, clear, and storage
  failure behave honestly.
- One main workspace appears only when Evidence Sources is active.
- Local import/download actions have pending/success/failure status.
- Telemetry-empty, unsupported, invalid packet, no-history, and unavailable
  persistence states are explicit.
- Native controls, focus entry/return, 320px, effective 200%, long hashes, and
  one DOM are preserved by design/static tests.
- No new primary/advanced navigation destination, network call, score, signer,
  or policy runtime.

### Verification

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

## T4 — Local real-Chromium integrated acceptance

> Status: Complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T3
> Model class / effort: standard / high
> Rationale: actual browser file, download, IndexedDB, focus, responsive,
> console, and network behavior
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-t4-worker-prompt.md`
> Sole authorized worker: `019f947f-1afd-7f13-a432-732e3800d468`
> Acknowledgment: `sancussight-011-T4-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-T4-ready-20260724-01` delivered
> Tracking-owner verification: installed Chrome matrix 17/17, Feature 011
> 27/27, Feature 010 31/31, Feature 009 24/24, Feature 008 6/6, collector
> 92/92, registry compiler 28/28, `verify:core`, production build (1,845
> modules), and scoped whitespace all pass.
> Retained correction: the T3 component removes the fixed `sha256:` display
> prefix before writing OpenLineage safe hashes into the approved raw 64-hex
> preview-store shape; focused regression coverage pins the boundary.

### Work

- Run the approved local browser matrix against a fresh Vite build.
- Use explicitly labeled synthetic OpenLineage and Evidence Packet fixtures.
- Inspect IndexedDB exact allowlist and clear isolation.
- Retain only bounded corrections inside completed T1–T3 product/test surfaces
  when an approved browser criterion fails.

### Browser Matrix

- safe OpenLineage JSON and JSONL;
- mixed safe/malformed/unknown/facet records;
- raw identifier/facet non-retention;
- empty/no-runtime and populated telemetry alignment;
- valid/tampered packet Statement download and independent validation;
- exact unsigned/non-verified copy;
- persistence/dedupe/retention/clear and unrelated history isolation;
- desktop and narrow workspace/rail behavior;
- focus entry, result focus, clear return, 320px, effective 200%;
- routes, canonical footer, zero Feature 011 console warnings/errors; and
- loopback/same-origin-only traffic with no third-party request.

### Owned Surfaces

- bounded corrections within completed T1–T3 surfaces only
- `execution/T4.md`, `execution/T4-handoff.md`,
  `execution/T4-browser-report.md`, and `execution/T4-browser/`

### Final Gate Order

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

## T5 — Exact reviewed-artifact production deployment and hosted acceptance

> Status: Complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T4 and usable Vercel authentication
> Model class / effort: standard / high
> Rationale: existing-project exact-artifact deployment with manifest and
> hosted browser guards
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-t5-worker-prompt.md`
> Sole authorized worker: `019f9492-d018-7c93-8681-cb3863aaf566`
> Acknowledgment: `sancussight-011-T5-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-T5-ready-20260724-01` delivered
> Tracking-owner verification: local gates pass; source/config and accepted
> lockfile continuity pass; local/prebuilt static manifests match; canonical
> hosted static bytes match 6/6; installed-Chrome hosted acceptance passes
> 18/18 with zero console warnings/errors, zero page errors, same-origin-only
> requests, and zero scoped Vercel runtime errors.
> Production deployment: `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH`, READY at
> `https://sancussight.vercel.app`, immutable URL
> `https://sancussight-f8zoeu66a-hflowers45-9370s-projects.vercel.app`,
> canonical alias assigned with no alias error.

### Work

- Resolve existing canonical Vercel identity read-only.
- Lock reviewed source, lockfile, and local static manifests.
- Run all local gates, build/prebuild, and require manifest continuity.
- Deploy only the exact prebuilt artifact to the existing project.
- Verify immutable/canonical/project identity, READY/PROMOTED alias, public
  predicate schema, hosted static bytes, real-Chromium matrix, console,
  network, and runtime errors.
- Fail closed on auth, project ambiguity, manifest drift, alias error, or
  non-Ready deployment.

### Owned Surfaces

- read-only reviewed product/config source
- Vercel prebuilt output and exact existing-project production deployment
- `execution/T5.md`, `execution/T5-handoff.md`,
  `execution/T5-hosted-report.md`, and `execution/T5-hosted/`

No product/package/shared-tracking correction is owned.

## R1 — Independent comprehensive two-axis review

> Status: Complete — Needs fixes
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T1–T5
> Model class / effort: standard / high
> Rationale: independent full-scope Spec and Standards review with adversarial
> privacy/truth/conformance analysis
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-r1-review-prompt.md`
> Sole authorized reviewer: `019f94a5-b3b8-7582-97f6-13bbe090eb07`
> Acknowledgment: `sancussight-011-R1-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-R1-findings-20260724-01` delivered
> Verdict: Needs fixes — blocking `R1-SPEC-001` and `R1-SPEC-002`;
> non-blocking `R1-STANDARDS-001` and `R1-STANDARDS-002`

Review every approved requirement, design decision, task acceptance criterion,
local/hosted evidence, external-profile claim, and changed source on:

- **Spec:** exact supported profiles, import isolation, safe hashes,
  alignment states, Statement truth, workspace, storage, policy boundary.
- **Standards/code quality:** privacy, security, accessibility, performance,
  maintainability, simplification, unnecessary concepts/dependencies, and
  user/maintainer decision burden.

R1 owns only `review-r1.md`, `execution/R1.md`, and `execution/R1-handoff.md`.
Any fix route is opened by the orchestrator after finding reconciliation.

## Findings-Limited Correction Route

R1 findings are implementation/evidence defects within the approved
requirements and design. Neither requirements nor design is reopened. The
route below is limited to those findings and regressions caused by their
correction.

### C1 — Correct facet omission, concurrent dedupe, and invalid-record honesty

> Status: Complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: R1
> Covers: FR-002, FR-003, FR-007, NFR-003, NFR-004, TD-002, TD-005;
> `R1-SPEC-001`, `R1-SPEC-002`, `R1-STANDARDS-002`
> Model class / effort: standard / high
> Rationale: parser privacy semantics and repository concurrency/failure
> behavior require adversarial coverage but remain within existing contracts
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c1-worker-prompt.md`
> Sole authorized worker: `019f94b5-a935-7b12-98ea-c459e093b544`
> Acknowledgment: `sancussight-011-C1-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-C1-ready-20260724-01` delivered
> Tracking-owner verification: Feature 011 29/29, Feature 010 31/31,
> Feature 009 24/24, Feature 008 6/6, collector 92/92, registry compiler
> 28/28, `verify:core`, production build (1,845 modules), and scoped
> whitespace all pass.

#### Work

- Distinguish official OpenLineage input/output dataset shapes so `facets`,
  `inputFacets`, and `outputFacets` are admitted only as wholesale omissions.
- Never traverse, copy, stringify, log, hash, return, or persist facet values.
- Make equivalent-preview dedupe deterministic under concurrent record calls
  without weakening profile isolation or retention.
- Make invalid persisted records produce an honest degraded/unavailable result
  or bounded transactional cleanup; never report healthy empty history while
  invalid records remain.
- Add focused adversarial tests for every corrected path.

#### Owned Surfaces

- `src/lib/openlineage-import.ts`
- `src/lib/interoperability-store.ts`
- `src/components/StandardsInteroperability.tsx` only if needed to surface the
  approved honest persistence state
- `src/types.ts` only if the existing Feature 011 operation-result union
  cannot express the approved state
- focused Feature 011 parser/store/workspace tests under `src/lib/__tests__/`
- `execution/C1.md` and `execution/C1-handoff.md`

#### Acceptance

- Otherwise valid input/output datasets with any official facet container are
  accepted, each present container is counted as omitted, and hostile facet
  sentinels cannot enter output, storage, logs, or hash preimages.
- Two or more concurrent equivalent records produce exactly one persisted
  snapshot and deterministic `recorded` results.
- Profile isolation, consecutive-equivalence semantics, 20/profile and
  100/global retention, clear isolation, and unavailable fallback remain
  green.
- Invalid persisted records cannot be silently hidden behind
  `availability: available` with empty healthy history.
- No network, runtime dependency, schema migration, product scope, or
  Feature 008–010 behavior is added.

#### Verification

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

### C2 — Findings-limited local real-Chromium regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C1
> Covers: all four R1 findings and fix-caused regressions
> Model class / effort: standard / high
> Rationale: concurrency, IndexedDB corruption, facet privacy, and responsive
> evidence require an actual browser
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c2-worker-prompt.md`
> Sole authorized worker: `019f94c0-3635-7152-abdf-a8a9dd90e90f`
> Acknowledgment: `sancussight-011-C2-acknowledged-20260724-01` delivered
> Duplicate reconciliation: workers
> `019f94bf-b912-71e0-b9e3-f5da63ee0058` and
> `019f94c0-6835-7f72-b3c9-083cd9818eba` are permanently stopped; the
> authorized worker append-preserved and attributed the duplicate-created
> `execution/C2.md` scaffold before browser or product work
> Completion event: `sancussight-011-C2-ready-20260724-01` delivered
> Tracking-owner verification: installed Chrome matrix 13/13, Feature 011
> 29/29, Feature 010 31/31, Feature 009 24/24, Feature 008 6/6, collector
> 92/92, registry compiler 28/28, `verify:core`, production build (1,845
> modules), and scoped whitespace all pass; no product/test correction was
> required

Run a fresh installed-Chrome matrix for official facet containers, hostile
facet privacy, concurrent equivalent imports, exact persisted count,
invalid-record honesty, focus, 320px, and effective 200%. The effective-200
path must reopen Standards Interoperability after any reload, assert its
heading/workspace, and record layout metrics before claiming pass. Own only
bounded C1 corrections after a genuine approved failure plus
`execution/C2.md`, `C2-handoff.md`, `C2-browser-report.md`, and `C2-browser/`.
Finish with the full C1 gate sequence in exact order.

### C3 — Exact corrected production deployment and hosted regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C2 and usable Vercel authentication
> Covers: all four R1 findings and fix-caused regressions
> Model class / effort: standard / high
> Rationale: exact-artifact deployment and hosted concurrency/privacy/evidence
> checks
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c3-worker-prompt.md`
> Sole authorized worker: `019f94d4-df7f-70d1-a597-9c09959a8c28`
> Acknowledgment: `sancussight-011-C3-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-C3-ready-20260724-01` delivered
> Tracking-owner verification: Feature 011 29/29, Feature 010 31/31,
> Feature 009 24/24, Feature 008 6/6, collector 92/92, registry compiler
> 28/28, `verify:core`, production build (1,845 modules), whitespace,
> deployment identity, canonical hosted bytes 6/6, and installed-Chrome
> hosted findings regression 14/14 all pass.
> Production deployment: `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`, READY at
> `https://sancussight.vercel.app`, immutable URL
> `https://sancussight-47zi3pez1-hflowers45-9370s-projects.vercel.app`,
> canonical alias assigned with no alias error.

Deploy only the exact C2-reviewed prebuilt artifact to the existing canonical
Vercel project. Prove source/lock/static continuity, READY/PROMOTED identity,
canonical alias, hosted static bytes, and a findings-limited installed-Chrome
matrix. The effective-200 path must assert the Feature 011 workspace after
reload. Own only Vercel prebuild/deployment and `execution/C3.md`,
`C3-handoff.md`, `C3-hosted-report.md`, and `C3-hosted/`; no product,
package, lockfile, or shared-tracking correction.

### R2 — Findings-limited independent follow-up review

> Status: complete — Needs fixes
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C1–C3
> Model class / effort: standard / high
> Rationale: independent confirmation of four findings, their fixes, and
> fix-caused regressions
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-r2-review-prompt.md`
> Sole authorized reviewer: `019f94e5-fdc6-7ba1-94aa-274727be1af4`
> Acknowledgment: `sancussight-011-R2-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-R2-findings-20260724-01` delivered
> Verdict: Needs fixes — `R1-SPEC-001`, `R1-STANDARDS-001`, and
> `R1-STANDARDS-002` resolved; `R1-SPEC-002` remains blocking because
> equivalent writes through two store instances sharing one repository can
> both record and persist.

Review only `R1-SPEC-001`, `R1-SPEC-002`, `R1-STANDARDS-001`,
`R1-STANDARDS-002`, their corrections, and regressions caused by those
corrections. R2 owns only `review-r2.md`, `execution/R2.md`, and
`execution/R2-handoff.md`.

## R2 Single-Finding Correction Route

Fresh tracking-owner reproduction confirmed the R2 result: two
`InteroperabilityPreviewStore` instances sharing one memory repository
returned `recorded: [true, true]` and persisted two equivalent snapshots.
Requirements and design remain approved. Only `R1-SPEC-002`, its correction,
and fix-caused regressions are reopened below.

### C4 — Repository-wide atomic equivalent-preview dedupe

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: R2
> Covers: `R1-SPEC-002`, NFR-003, FR-007, TD-005
> Model class / effort: standard / high
> Rationale: repository-level concurrency and IndexedDB transaction semantics
> require careful bounded correction and adversarial tests
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c4-worker-prompt.md`
> Sole authorized worker: `019f94ee-f20d-7e80-82a5-1246bbc3bf96`
> Acknowledgment: `sancussight-011-C4-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-C4-ready-20260724-01` delivered
> Tracking-owner verification: independent two-store/one-repository probe
> returned `recorded: [true, false]` with one snapshot; Feature 011 31/31,
> Feature 010 31/31, Feature 009 24/24, Feature 008 6/6, collector 92/92,
> registry compiler 28/28, `verify:core`, production build (1,845 modules),
> and scoped whitespace all pass.

Move equivalence check and insertion to a repository-wide atomic boundary so
separate store instances sharing one repository, and separate browser
contexts using the dedicated IndexedDB store, cannot both persist equivalent
consecutive previews. Preserve invocation-independent deterministic outcomes,
profile isolation, corrupt-record honesty, retention, clear isolation,
privacy, and current-preview fallback. Add a focused two-store shared-memory
regression and an IndexedDB/browser-relevant concurrency seam test.

Owned surfaces:

- `src/lib/interoperability-store.ts`
- focused `src/lib/__tests__/feature011-interoperability-store.test.mjs`
- another focused Feature 011 store test only if non-overlapping and required
- `execution/C4.md` and `execution/C4-handoff.md`

No component/UI, parser, alignment, Statement, package, lockfile, deployment,
shared-tracking, prior-evidence, Feature 012, or Spec 005 surface is owned.
Finish with all nine Feature 011 gates in exact order and scoped whitespace.

### C5 — Single-finding local installed-Chrome regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C4
> Model class / effort: standard / high
> Rationale: actual IndexedDB concurrency across separate store/page contexts
> plus preserved local findings regression
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c5-worker-prompt.md`
> Sole authorized worker: `019f94f9-dd9c-7402-8bb8-ae461fb9e1ef`
> Acknowledgment: `sancussight-011-C5-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-C5-ready-20260724-01` delivered
> Tracking-owner verification: installed Chrome 13/13; two independently
> loaded pages sharing the dedicated IndexedDB returned
> `recorded`/`deduplicated`, issued one `add`, and each observed one snapshot;
> Feature 011 31/31, Feature 010 31/31, Feature 009 24/24, Feature 008 6/6,
> collector 92/92, registry compiler 28/28, `verify:core`, production build
> (1,845 modules), and whitespace all pass. No product/test correction.

Run a fresh installed-Chrome matrix limited to repository-wide equivalent
dedupe and regressions caused by C4. Prove separate store/page contexts sharing
the dedicated IndexedDB store persist one equivalent snapshot with
deterministic outcomes. Preserve the previously resolved facet privacy,
corrupt-history honesty, effective-200 identity, focus, responsive, console,
network, Statement, retention, and clear checks. Own only bounded C4
product/test corrections after a genuine approved browser failure plus
`execution/C5.md`, `C5-handoff.md`, `C5-browser-report.md`, and `C5-browser/`.

### C6 — Exact corrected production deployment and hosted single-finding regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C5 and usable Vercel authentication
> Model class / effort: standard / high
> Rationale: exact-artifact deployment and hosted repository-concurrency proof
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-c6-worker-prompt.md`
> Sole authorized worker: `019f9505-48e3-78e0-839b-e09b38baa0ae`
> Acknowledgment: `sancussight-011-C6-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-C6-ready-20260724-01` delivered
> Tracking-owner verification: deployment
> `dpl_C1RpuwEBX3Tc8g2n7uMkuFjSk5CE` is production `READY` with canonical
> alias; hosted bytes 6/6, installed Chrome 14/14, Feature 011 31/31, and
> scoped whitespace all pass. No product/test/package/lock correction.

Deploy only the exact C5-reviewed prebuilt artifact to the existing canonical
Vercel project. Prove source/lock/static continuity, READY production identity,
canonical alias, hosted static bytes, and the single-finding installed-Chrome
matrix across separate store/page contexts. Own only Vercel prebuild/
deployment plus `execution/C6.md`, `C6-handoff.md`, `C6-hosted-report.md`, and
`C6-hosted/`; no product/package/lockfile/shared-tracking correction.

### R3 — Single-finding independent follow-up review

> Status: complete
> Priority: P0
> Estimate: 1–2 hours
> Blocked By: C4–C6
> Model class / effort: standard / high
> Rationale: independent confirmation of `R1-SPEC-002`, its correction, and
> fix-caused regressions only
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Durable handoff: `.ai/sdd/handoff/feature011-r3-review-prompt.md`
> Sole authorized reviewer: `019f9513-c7aa-7902-839c-075799edbc91`
> Acknowledgment: `sancussight-011-R3-acknowledged-20260724-01` delivered
> Completion event: `sancussight-011-R3-ready-20260724-01` delivered
> Tracking-owner verdict: approved within R3 scope; `R1-SPEC-002` resolved,
> the other three R1 dispositions remain resolved, and no new in-scope
> finding or fix-caused regression remains

Review only `R1-SPEC-002`, C4–C6, and regressions caused by the atomic-dedupe
correction. R3 owns only `review-r3.md`, `execution/R3.md`, and
`execution/R3-handoff.md`.

## Task Microworld Offer

```yaml
visualization_offer:
  stage: tasks
  source_revision: feature011-tasks-20260724-01
  recommended: no
  recommendation_reason: The serial dependency, ownership, privacy, browser, deployment, and review gates are explicit.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  decision_source: Operator standing no-HTML preference.
```

## Approval Checklist

- [x] Every Must Have and NFR has task coverage
- [x] Every ticket has exact blockers, owned surfaces, and verification
- [x] T1 is the only unblocked frontier
- [x] No Sol High route is planned
- [x] Browser and hosted acceptance are explicit
- [x] Optional task microworld is declined
- [x] Spec 005/T16R5/T16/A-002 remain excluded
