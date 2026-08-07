# Feature 008 Implementation Tasks

> Status: Approved; implementation in progress
> Requirements: `@.ai/sdd/specs/008-first-value-asset-passport/requirements.md`
> Design: `@.ai/sdd/specs/008-first-value-asset-passport/design.md`
> Orchestration: serial single-writer execution in fresh visible top-level Codex tasks

## Authority and execution rules

- The Feature 008 orchestrator is the sole writer of this file, `.status`,
  `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`.
- Every implementation ticket is dispatched to a newly created visible
  top-level Codex task. No subagent, hidden worker, reused task, or orchestrator
  implementation is authorized.
- Workers acknowledge scope before editing, edit only ticket-owned product
  surfaces plus their own append-preserving execution/handoff records, and
  return a stable lifecycle `event_id`.
- `ready-for-review` is a recommendation. Only the orchestrator may reconcile
  fresh verification and mark a task complete.
- Shared React/CSS surfaces require serial dispatch in the dependency order
  below.
- Spec 005/T16R5/T16/A-002, operational release scripts, provider calls, and
  production deployment are out of scope unless a ticket explicitly says
  otherwise. T5 remains blocked because deployment is not authorized.
- Existing unrelated dirty-tree changes are user-owned and must be preserved.

## Routing record

These are bounded TypeScript/React changes with explicit approved behavior,
strong existing component boundaries, and deterministic acceptance criteria.
Route each local implementation ticket on the user's configured standard
model at medium/high effort; do not request `gpt-5.6-sol` High or an equivalent
stronger tier. Therefore the independent high-tier challenge prerequisite does
not apply. A worker must stop and return if the task requires a material
architecture or contract change.

## Dependency graph

```text
T1 -> T2 -> T3 -> T4 -> T5
```

T1–T4 are authorized local implementation and verification. T5 is an external
deployment/hosted-verification ticket and remains blocked on explicit
deployment authorization.

## T1 — Catalog data contract and deterministic query model

> Status: complete
> Depends on: none
> Model class / effort: standard coding model, high
> Rationale: bounded pure TypeScript contract and test work; no high-tier route needed
> Visible worker task: `019f9174-81ca-7142-b4e7-210d9e5175f2`
> Dispatch event: `sancussight-008-T1-dispatched-20260723-01`
> Acknowledgment event: `sancussight-008-T1-acknowledged-20260723-01`
> Ready event: `sancussight-008-T1-ready-20260723-01`
> Reconciliation event: `sancussight-008-T1-completed-20260723-01`
> Fresh orchestrator verification: 2026-07-23 — 6 focused tests pass,
> production build passes, scoped whitespace check passes; diff and truth
> derivations inspected against approved design

### Outcome

Create the typed, pure catalog model used by the Assets UI without changing
source authority or adding storage/network behavior.

### Owned product surfaces

- `src/types.ts`
- new `src/lib/asset-catalog.ts`
- new focused Feature 008 test file(s) under `src/lib/__tests__/`
- `package.json` and lockfile only if needed to expose a deterministic
  Feature 008 test command; no new runtime dependency
- worker-owned:
  `.ai/sdd/specs/008-first-value-asset-passport/execution/T1.md`
  and `execution/T1-handoff.md`

### Required work

- Add optional browser `Asset.registryState` compatibility for compiler output.
- Implement pure catalog indexing/search/facet/filter functions for owner,
  kind, lifecycle, portability state, provider, and evidence freshness.
- Generate facet values only from recorded or existing deterministic facts.
- Use explicit unavailable/missing states; do not invent lifecycle,
  freshness, portability, or provider claims.
- Preserve AND-between-facets and OR-within-facet behavior.
- Provide deterministic active-criteria/result summaries suitable for the UI.

### Acceptance

- [ ] Compiler-created `registryState` values `active`, `archived`, and
  `missing` remain typed and import-compatible; invalid values are not treated
  as supported.
- [ ] Search covers the approved bounded recorded fields.
- [ ] All six facet dimensions are supported when their values exist.
- [ ] Combined filters, no-result output, and missing dimensions have tests.
- [ ] No network, storage, analytics, score, or source mutation is introduced.
- [ ] `npm run build` and the focused tests pass.

### Verification

```text
npm run test:feature008
npm run build
git diff --check
```

## T2 — Canonical Assets catalog and Asset Passport

> Status: complete
> Depends on: T1
> Model class / effort: standard coding model, high
> Rationale: consequential but explicit React accessibility/layout work
> Visible worker task: `019f917e-2660-77c3-83ea-a633bd915540`
> Dispatch event: `sancussight-008-T2-dispatched-20260723-01`
> Acknowledgment event: `sancussight-008-T2-acknowledged-20260723-01`
> Ready event: `sancussight-008-T2-ready-20260723-01`
> Reconciliation event: `sancussight-008-T2-completed-20260723-01`
> Fresh orchestrator verification: 2026-07-23 — exact six-section Passport
> and bounded matchMedia contract inspected; focused model suite, production
> build, and scoped whitespace checks pass; browser geometry/focus remains T4

### Outcome

Replace the below-table detail with one canonical desktop master-detail
catalog and Asset Passport, plus the intentional narrow-screen transition.

### Owned product surfaces

- `src/components/Registry.tsx`
- Feature 008 Assets-specific selectors in `src/index.css`
- focused Assets tests/verification fixtures that do not overlap T1 files
- worker-owned `execution/T2.md` and `execution/T2-handoff.md`

### Required work

- Add search, supported filters, active criteria, result count, clear action,
  and recoverable no-results state using T1 primitives.
- Render catalog and neutral/selected Passport as sibling regions on desktop;
  the Passport must never follow below the catalog at supported desktop width.
- Implement the six canonical Passport sections: Summary, Portability,
  Dependencies, Evidence, Decisions, History.
- Label missing data and distinguish recorded facts, deterministic findings,
  evidence states, and human decisions.
- Add non-color selected-row semantics and visible selected text.
- Implement mutually exclusive narrow catalog/passport states with focus into
  the Passport and focus-restoring Back behavior.
- Preserve filters, selection, and useful catalog context across switching and
  breakpoint changes.
- Retain current record-review, verify, and drill actions with their existing
  authority semantics.

### Acceptance

- [ ] Desktop catalog and Passport are side by side at >=900 CSS pixels.
- [ ] No-selection state is explicit and does not select the first row.
- [ ] Selected row uses visible text and programmatic semantics, not color alone.
- [ ] Every canonical Passport section renders with explicit absent states.
- [ ] Narrow selection focuses the Passport heading; Back restores focus to
  the selected/originating row or a documented safe fallback.
- [ ] 320 CSS-pixel width and enlarged text do not cause page-level horizontal
  scrolling.
- [ ] No duplicate simultaneous interactive desktop/mobile catalog is present.
- [ ] Focused tests, `npm run test:feature008`, and `npm run build` pass.

### Verification

```text
npm run test:feature008
npm run build
git diff --check
```

## T3 — First-value paths, navigation loop, context links, and footer

> Status: complete
> Depends on: T2
> Model class / effort: standard coding model, high
> Rationale: bounded shell integration across existing components
> Visible worker task: `019f918a-74db-7152-b5bb-35a14e5994ab`
> Dispatch event: `sancussight-008-T3-dispatched-20260723-01`
> Acknowledgment event: `sancussight-008-T3-acknowledged-20260723-01`
> Ready event: `sancussight-008-T3-ready-20260723-01`
> Reconciliation event: `sancussight-008-T3-completed-20260723-01`
> Fresh orchestrator verification: 2026-07-23 — exact navigation membership,
> compiler command, one-link footer, source convergence, evidence-rail route,
> and canonical Exit Drill linking inspected; focused suite, production build,
> and scoped whitespace checks pass; browser behavior remains T4

### Outcome

Complete the approved entry and navigation hierarchy, route Attention/Home/Exit
Drill assets into the canonical Passport, and enforce the exact footer contract.

### Owned product surfaces

- `src/App.tsx`
- `src/components/LandingGateway.tsx`
- `src/components/WorkspaceNavigation.tsx`
- `src/components/ExitTest.tsx`
- `src/types.ts` navigation constants only, after acknowledging T1's completed
  changes
- navigation/gateway/footer selectors in `src/index.css`, after acknowledging
  T2's completed changes
- focused shell tests/verification fixtures
- worker-owned `execution/T3.md` and `execution/T3-handoff.md`

### Required work

- Present distinct Sample, Existing registry, and Build with local compiler
  paths before workspace entry.
- Compiler guidance must use the checked-in safe local quick start, explain
  review/confirmation, and never run or upload from the hosted page.
- Primary reader-facing navigation becomes Home, Assets, Exit Drills,
  Attention.
- Advanced navigation becomes Evidence Sources, Governance, Release Proofs,
  Activity, Definitions and remains keyboard reachable at every supported
  width.
- Evidence Sources advanced action focuses/scrolls to the existing rail.
- Exit Drill dependency items become asset links through the canonical
  `handleSelectAsset`; Attention and Home retain the same route.
- Persistent workspace footer contains exactly the visible/clickable
  `https://sancussight.vercel.app` and nothing else.

### Acceptance

- [ ] Three entry choices state synthetic, user-selected, and compiler-created
  meaning without silent fallback.
- [ ] All approved primary and advanced navigation labels/surfaces are present.
- [ ] Advanced menu supports keyboard, Escape, focus, and active state.
- [ ] Attention, Home, and Exit Drill asset links open the canonical selected
  Passport.
- [ ] Footer DOM contains one reader-facing link, exact visible text and HTTPS
  href, with no personal name, disclaimer, or second item.
- [ ] No hosted compiler execution, upload, new network call, or deployment occurs.
- [ ] Focused tests, `npm run test:feature008`, and `npm run build` pass.

### Verification

```text
npm run test:feature008
npm run build
git diff --check
```

## T4 — Integrated local acceptance and bounded corrections

> Status: complete
> Depends on: T3
> Model class / effort: standard coding model, high
> Rationale: browser-level accessibility and responsive verification of approved behavior
> Visible worker task: `019f9196-8c84-7003-a0ea-06490398d733`
> Dispatch event: `sancussight-008-T4-dispatched-20260723-01`
> Acknowledgment event: `sancussight-008-T4-acknowledged-20260723-01`
> Ready event: `sancussight-008-T4-ready-20260723-01`
> Reconciliation event: `sancussight-008-T4-completed-20260723-01`
> Fresh orchestrator verification: 2026-07-23 — actual-browser report and
> representative captures inspected; bounded Evidence Sources focus correction
> is contract-preserving; Feature 008 tests 6/6, collector tests 92/92,
> registry-compiler tests 22/22, core verification, production build, and
> scoped whitespace checks pass

### Outcome

Run the complete local Feature 008 story in an actual browser, make only
bounded corrections required by the approved requirements/design, and return
durable evidence.

### Owned product surfaces

- read access to all T1–T3 surfaces
- write access only to T1–T3 product surfaces when a failing approved
  acceptance criterion requires a bounded fix
- new Feature 008 browser verification script/fixtures or planning evidence
  under the feature directory
- worker-owned `execution/T4.md` and `execution/T4-handoff.md`

### Required scenarios

- source-distinct landing choices and safe compiler guidance;
- desktop no-selection, selection, row switching, filtering, selected-outside-
  results, side-by-side geometry, and exact footer;
- narrow detail entry/focus, Back/focus return, retained filter context, 320px
  width, 200% zoom, and no page-level horizontal overflow;
- primary and advanced navigation, including Evidence Sources;
- Home/Attention/Exit Drill links into the same Asset Passport;
- truth labels for sample, local snapshot, missing data, deterministic
  findings, evidence, and decisions.

### Acceptance

- [x] Browser evidence records viewport, steps, observed focus targets,
  geometry/overflow assertions, and exact footer DOM.
- [x] Any corrections stay within approved Feature 008 surfaces and are
  regression-tested.
- [x] `npm run test:feature008`, `npm run test:collector`,
  `npm run test:registry-compiler`, `npm run verify:core`, and `npm run build`
  pass.
- [x] No Spec 005 operations test, A-002 run, provider call, deployment, or
  release-status change occurs.

### Verification

```text
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
```

## T5 — Production deployment and canonical hosted verification

> Status: complete
> Depends on: T4, usable credentials/session
> Model class / effort: standard coding model, high
> Rationale: bounded deployment and hosted acceptance; external mutation requires separate authority
> Deployment authorization: approved by operator blanket authorization,
> clarified for the existing canonical Vercel project on 2026-07-23
> Visible worker task: `019f91b0-9adc-7ad2-9ff6-1d7899e9ba5c`
> Dispatch event: `sancussight-008-T5-dispatched-20260723-01`
> Acknowledgment event: `sancussight-008-T5-acknowledged-20260723-01`
> Ready event: `sancussight-008-T5-ready-20260723-01`
> Reconciliation event: `sancussight-008-T5-completed-20260723-01`
> Fresh orchestrator verification: 2026-07-23 — canonical Vercel lookup
> independently confirms deployment `dpl_AwJrVdc7SrwSyHubAmmZBCtc5xWR`,
> production `READY`, exact canonical alias, and no alias error; hosted report
> and representative desktop/narrow captures inspected; Feature 008 tests 6/6,
> collector tests 92/92, registry-compiler tests 22/22, core verification,
> production build, and scoped whitespace checks pass

### Outcome

Deploy the reviewed Feature 008 build and verify the canonical hosted artifact.

### Boundary

This ticket is authorized only for deploying the already reviewed Feature 008
source state to the existing canonical SancusSight Vercel project and verifying
that hosted artifact. It must fail closed on credentials/authentication failure,
project ambiguity, destructive replacement, or source-state mismatch. Release
authorization for Spec 005/T16/A-002 remains separate and excluded.

### Acceptance

- [x] Reviewed source state is the exact deployed source state.
- [x] Deployment succeeds at `https://sancussight.vercel.app`.
- [x] Hosted footer is the exact canonical URL link only.
- [x] Hosted desktop and narrow acceptance scenarios pass.
- [x] No personal attribution or stale prior footer is present.
- [x] Deployment evidence records source revision, URL, time, and checks.

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001, FR-011 | T3, T4 |
| FR-002 | T1, T2, T4 |
| FR-003 | T2, T4 |
| FR-004, FR-005 | T2, T4 |
| FR-006 | T2, T4 |
| FR-007 | T3, T4 |
| FR-008 | T3, T4 |
| FR-009 | T3, T4 |
| FR-010 | T5 |
| NFR-001 | T2, T3, T4, T5 |
| NFR-002 | T1, T2, T4 |
| NFR-003 | T1, T3, T4, T5 |
| NFR-004 | T1, T2, T3, T4 |
| NFR-005 | T1, T3, T4 |

## Task-microworld offer

The optional read-only HTML task microworld was treated as declined under the
operator's explicit no-stop instruction. This Markdown dependency/ownership
record remains the authoritative task plan.

## Approval record

The operator's blanket 2026-07-23 authorization prospectively approves aligned
Feature 008 tasks and local implementation. Readiness review confirmed full
requirement coverage, explicit ownership, a serial dependency graph, bounded
model routing, fresh-visible-task dispatch, deterministic verification, and a
fail-closed production deployment boundary. T1 is the only open local frontier.
