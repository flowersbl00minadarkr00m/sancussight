# Feature 009 Implementation Tasks

> Status: Review complete
> Requirements: `@.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
> Design: `@.ai/sdd/specs/009-claim-lineage-check-catalog/design.md`
> Tracking owner: orchestrator
> Execution: serial, fresh visible top-level Codex task per ticket
> Approval: User instruction in visible orchestrator task on 2026-07-23 to continue Feature 009 autonomously under the existing blanket approval

## Authority and execution rules

- The visible Feature 009 orchestrator is the sole writer of this file,
  `.status`, `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`.
- Every implementation ticket requires a newly created visible top-level
  worker task. Subagents, nested/hidden workers, reused long-lived tasks, and
  implementation inside the orchestrator are prohibited.
- Workers acknowledge before edits, stay within exact owned surfaces, append
  their own `execution/<task>.md` and `<task>-handoff.md`, and return stable
  lifecycle events to tracking task
  `019f914a-b672-77b1-837f-0c866b6421bb`.
- A worker `ready-for-review` event is only a recommendation. Completion
  requires direct receipt, scoped diff inspection, fresh orchestrator
  verification, and authoritative reconciliation.
- Tickets are serialized because types, App, React components, package
  scripts, and CSS form one overlapping integration path.
- Existing dirty-tree changes are user-owned and must be preserved.
- Spec 005/T16R5/T16/A-002, release operations, producer/provider actions,
  commits, pushes, and Pi are excluded from every ticket.

## Routing record

All tickets use a capability-neutral `standard` model class with `high` effort:
the contracts are explicit, the codebase already contains the required
patterns, and verification is deterministic, but privacy, accessibility,
history, and cross-view state deserve careful reasoning. No Sol High or
equivalent stronger route is selected, so `high_tier_second_opinion` is
`not-required`.

Every ticket carries:

```yaml
tracking_owner: orchestrator
session_policy: new-top-level-required
freshness_state: fresh-at-dispatch
cumulative_usage: unknown
rollover: before 250k tokens, or earlier after compaction, missing telemetry,
  ownership change, or context uncertainty
```

## Dependency graph

```text
T1 -> T2 -> T3 -> T4 -> T5R1 -> T5R2 -> R1 -> C1 -> C2 -> C3 -> R2
```

## Requirement Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T1, T3, T4 |
| FR-002 | T1, T3, T4 |
| FR-003 | T1, T3, T4 |
| FR-004 | T1, T3, T4 |
| FR-005 | T2, T3, T4 |
| FR-006 | T3, T4 |
| FR-007 | T1, T3, T4 |
| FR-008 | T1, T3, T4 |
| NFR-001 | T3, T4, T5 |
| NFR-002 | T1, T2, T4, T5 |
| NFR-003 | T1, T2, T3, T4 |
| NFR-004 | T1, T3, T4 |
| NFR-005 | T1, T2, T4 |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Every Must Have has design and tasks | Pass | Mapping tables cover FR-001–FR-008 |
| Critical product questions answered | Pass | No critical questions remain |
| Tasks have blockers, acceptance, files, and verification | Pass | T1–T5 are bounded local tickets |
| Writable overlaps coordinated | Pass | Fully serialized; orchestrator is merge/tracking owner |
| Verification commands known | Pass | Feature-local, existing regression, browser, and hosted gates named |
| Privacy/history boundary testable | Pass | Fixed snapshot allowlist and negative tests |
| At least one frontier task exists | Pass | T1 is the initial frontier |
| High-tier challenge required | N/A | Standard model route, no Sol High equivalent |

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | none | Complete |
| T2 | T1 | Complete |
| T3 | T2 | Complete |
| T4 | T3 | Complete |
| T5R1 | T4 and failed T5 manifest guard | Complete |
| T5R2 | T5R1 and usable Vercel authentication | Complete |
| R1 | T1–T5R2 | Complete — Needs fixes |
| C1 | R1 findings | Complete |
| C2 | C1 | Complete |
| C3 | C2 and usable Vercel authentication | Complete |
| R2 | C1–C3 | Complete — green |

## T1 — Stable Check Catalog and bounded claim-lineage model

> Status: complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: none
> Model class / effort: standard / high
> Model reason: pure typed domain work with many truth/privacy edge cases
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f91dd-f2da-7f33-9b3e-2b53c7f28edb`
> Dispatch event: `sancussight-009-T1-dispatched-20260723-01`
> Acknowledgment event: `sancussight-009-T1-acknowledged-20260723-01`
> Dispatch state: active — human-created fresh visible top-level task
> acknowledged the exact ticket before product edits
> Durable user-created-session handoff:
> `.ai/sdd/handoff/feature009-t1-worker-prompt.md`
> Dispatch blocker event:
> `sancussight-009-T1-dispatch-blocked-20260723-01` (resolved by the
> human-created task above)
> Acknowledgment receipt: delivered directly to tracking orchestrator on
> 2026-07-23; return path is usable
> Duplicate-worker recovery: two later visible T1 tasks were stopped under
> `sancussight-009-T1-duplicate-worker-blocked-20260723-01`. Task
> `019f91e0-60c5-7293-b225-8bb40a54ec8a` changed no files. Task
> `019f91df-e490-77b1-bbe0-de5c72beda3e` added only
> `src/lib/__tests__/check-catalog-lineage.test.mjs`, an expected-red focused
> T1 test, and made no other applied change.
> Authoritative-worker pause event:
> `sancussight-009-T1-duplicate-overlap-blocked-20260723-01`.
> Recovery decision: worker `019f91dd-f2da-7f33-9b3e-2b53c7f28edb`
> remains the sole T1 writer and merge owner. It may inspect, retain, and
> reconcile the duplicate-created focused test within the already approved T1
> test surface; it must not delete or revert the file merely to erase the
> duplicate event. No other T1 worker is authorized to resume.
> Later duplicate-dispatch event:
> `sancussight-009-T1-contract-conflict-20260723-01` from visible task
> `019f920f-76c6-7e23-8665-680e94001f54`; it correctly failed closed after
> reading the completed authority and changed no product or execution file.
> Ready event: `sancussight-009-T1-ready-20260723-01`, received directly by
> the tracking orchestrator.
> Authoritative reconciliation: complete on 2026-07-23 after scoped source
> inspection and fresh orchestrator reruns of `test:feature009` (10/10),
> `test:feature008` (6/6), `verify:core`, `build` (1,830 modules), and scoped
> whitespace checks. No contract deviation or unsupported network/storage
> behavior was found.

### Delivers

Every supported deterministic asset check has one explicit stable definition,
and one selected result can be projected into a bounded typed claim path
without parsing copy or invoking a graph/runtime service.

### Owned surfaces

- `src/types.ts`
- `src/lib/registry.ts`
- `src/lib/evidence.ts`
- new `src/lib/check-catalog.ts`
- new `src/lib/claim-lineage.ts`
- new focused non-overlapping tests under `src/lib/__tests__/`
- `package.json` and `package-lock.json` only if needed to add
  `test:feature009`; no runtime dependency
- worker-owned `execution/T1.md` and `execution/T1-handoff.md`

### Work

- [x] Add optional `Signal.checkId` and `Signal.evaluatedAt`.
- [x] Register all currently supported deterministic evaluator rule families
  with unique stable versioned definitions.
- [x] Attach explicit IDs in `evaluateAsset` and the missing evidence-binding
  evaluator; do not catalog accepted external facts.
- [x] Implement definition search, definition/result projection, exact
  remediation/invalidation explanations, and uncataloged fallback.
- [x] Implement bounded lineage nodes, edges, gaps, order, qualification, and
  cardinality limits.
- [x] Cover missing, inferred, stale, conflicting, and verified relationships
  without claiming external truth.
- [x] Add focused tests and the Feature 009 test command.

### Acceptance

- [x] Every emitted deterministic `checkId` resolves to exactly one definition.
- [x] No definition ID contains an asset, provider instance, timestamp, or
  result ID.
- [x] Result mapping never parses `condition` or `finding` text.
- [x] The provider-fallback red/green scenario produces the approved stable
  rule and remediation.
- [x] All five edge states and uncataloged fallback have tests.
- [x] Lineage cardinality is bounded and no network/storage/global graph is
  introduced.
- [x] Existing registry/evidence behavior remains compatible.

### Verification

```text
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

### Expected lifecycle events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T2 — Metadata-only local check-result history

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T1
> Model class / effort: standard / high
> Model reason: privacy-sensitive IndexedDB retention and deterministic dedupe
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f91f1-2f42-7fe3-9e2a-924d01c72c08`
> Dispatch event: `sancussight-009-T2-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level task created by the
> orchestrator; no duplicate T2 worker is authorized
> Acknowledgment event: `sancussight-009-T2-acknowledged-20260723-01`,
> delivered directly before product edits
> Ready event: `sancussight-009-T2-ready-20260723-01`, received directly by
> the tracking orchestrator.
> Authoritative reconciliation: complete on 2026-07-23 after source/privacy
> inspection and fresh orchestrator reruns of `test:feature009` (16/16),
> `test:feature008` (6/6), `verify:core`, `build` (1,830 modules), and scoped
> whitespace checks. The six-field allowlist, hashed preimage boundaries,
> dedupe, stream isolation, retention, clear, and unavailable behavior match
> the approved contract.
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-t2-worker-prompt.md`

### Delivers

Current and immediately previous distinct result metadata can be compared
across browser use without storing raw registry/evidence content.

### Owned surfaces

- new `src/lib/check-history-store.ts`
- new focused history tests under `src/lib/__tests__/` that do not overlap T1
- `src/types.ts` only for the approved history type, after acknowledging T1
- `package.json` only if the existing Feature 009 command needs an additive
  test glob; no dependency
- worker-owned `execution/T2.md` and `execution/T2-handoff.md`

### Work

- [x] Implement registry scope hashing without storing the preimage.
- [x] Implement the fixed snapshot allowlist and safe evidence hash.
- [x] Record, read latest/previous, dedupe equivalent consecutive results, and
  bound retention to 20 per stream and 1,000 globally.
- [x] Isolate streams by registry scope, asset, and check ID.
- [x] Expose explicit unavailable and clear-history behavior.
- [x] Add memory/fake-store seam tests without adding a runtime dependency.

### Acceptance

- [x] Snapshots contain only approved fields.
- [x] Raw finding/evidence text, envelope attributes, paths, prompts,
  responses, credentials, and registry objects cannot enter storage.
- [x] Equivalent consecutive results do not create a second history entry.
- [x] A changed result exposes the immediately previous distinct status/time.
- [x] Retention and scope-isolation tests pass.
- [x] IndexedDB failure does not block current check evaluation.

### Verification

```text
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

### Expected lifecycle events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T3 — Canonical Attention Check Catalog and cross-view integration

> Status: complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T2
> Model class / effort: standard / high
> Model reason: consequential responsive React/focus integration across existing views
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f91fb-5233-70a3-93bd-2bb881b5d5fa`
> Dispatch event: `sancussight-009-T3-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level task; no duplicate T3
> worker is authorized
> Acknowledgment event: `sancussight-009-T3-acknowledged-20260723-01`,
> received before product edits
> Ready event: `sancussight-009-T3-ready-20260723-01`, received directly by
> the tracking orchestrator.
> Authoritative reconciliation: complete on 2026-07-23 after source and
> cross-view contract inspection plus fresh orchestrator reruns of
> `test:feature009` (20/20), `test:feature008` (6/6), `verify:core`, `build`
> (1,835 modules), and scoped whitespace checks. One canonical detail,
> App-owned intent, explicit truth/history states, narrow one-DOM behavior,
> and the no-network/no-scoring boundary match the approved contract.
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-t3-worker-prompt.md`

### Delivers

Attention becomes one searchable Check Catalog/result inspector, and Asset
Passport findings open that exact explanation with selected context.

### Owned surfaces

- `src/App.tsx`
- `src/components/Queue.tsx`
- `src/components/Registry.tsx`
- new `src/components/CheckCatalog.tsx`
- new `src/components/ClaimLineageInspector.tsx`
- Feature 009 selectors in `src/index.css`
- `src/types.ts` navigation/check-intent types only after T1/T2
- focused component/static-contract tests that do not overlap T1/T2
- worker-owned `execution/T3.md` and `execution/T3-handoff.md`

### Work

- [x] Replace the existing Attention content with definition and current-result
  lists plus one canonical detail region.
- [x] Add definition, current result, previous result, inspected evidence,
  claim lineage, remediation, and invalidation sections.
- [x] Add search, explicit no-result/definition-only/uncataloged/history-
  unavailable states, and clear-history action.
- [x] Add App-owned check intent and Asset Passport `Open check explanation`.
- [x] Preserve the canonical `handleSelectAsset` route back to the Passport.
- [x] Implement side-by-side desktop and mutually exclusive narrow list/detail
  with focus entry/return.
- [x] Keep edge and truth classes textual and avoid score-like rollups.

### Acceptance

- [x] Attention and Asset Passport open the same result detail.
- [x] Definitions remain inspectable without a current result.
- [x] Current/previous absence, unavailable history, and uncataloged
  observations are explicit.
- [x] All five relationship states are understandable without color.
- [x] Narrow selection focuses detail; Back restores useful origin focus.
- [ ] 320px and enlarged text avoid page-level horizontal scrolling (T4
  actual-browser acceptance).
- [x] No duplicate interactive list/detail implementation exists.
- [x] No new network, provider, analytics, or upstream action is introduced.

### Verification

```text
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

### Expected lifecycle events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T4 — Integrated local actual-browser acceptance and bounded corrections

> Status: complete
> Priority: P0
> Estimate: 2–4 hours
> Blocked By: T3
> Model class / effort: standard / high
> Model reason: actual-layout, persistence, accessibility, and truth-state verification
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f920d-d4df-77e2-8036-33e408672974`
> Dispatch event: `sancussight-009-T4-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level task; no duplicate T4
> worker is authorized
> Acknowledgment event: `sancussight-009-T4-acknowledged-20260723-01`,
> received directly before browser or product actions
> Ready event: `sancussight-009-T4-ready-20260723-01`, received directly by
> the tracking orchestrator.
> Authoritative reconciliation: complete on 2026-07-23 after browser
> report/structured-observation and representative screenshot inspection plus
> fresh orchestrator reruns of `test:feature009` (20/20), `test:feature008`
> (6/6), `test:collector` (92/92), `test:registry-compiler` (22/22),
> `verify:core`, `build` (1,835 modules), and whitespace checks across all 19
> T4 evidence files. No product correction was required.
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-t4-worker-prompt.md`

### Delivers

The complete local Feature 009 story is proven in a real browser, with only
contract-preserving corrections permitted.

### Owned surfaces

- read access to all completed T1–T3 product surfaces
- correction writes only to completed T1–T3 surfaces when required by a
  failing approved acceptance criterion
- new Feature 009 browser evidence under `execution/T4-browser/`
- worker-owned `execution/T4.md`, `execution/T4-handoff.md`, and browser report

### Required scenarios

- definition search and definition-only detail;
- non-passing asset result with exact rule/remediation/invalidation;
- Asset Passport -> check detail -> Asset Passport;
- no previous result, then a bounded changed result showing previous metadata;
- dedupe of an identical repeated result;
- uncataloged observation;
- verified, missing, inferred, stale, and conflicting relationship states;
- desktop list/detail geometry;
- narrow focus entry, Back restoration, 320px, 200% zoom, and no page overflow;
- history-store unavailable fallback;
- no unexpected Feature 009 network request, console error, or warning.

### Acceptance

- [x] Browser report records steps, selected/focused elements, geometry,
  overflow, storage keys/field names, network, and console observations.
- [x] Stored history inspection confirms only the fixed metadata allowlist.
- [x] Any correction stays within approved T1–T3 surfaces and is regression
  tested.
- [x] Full local gate passes in the required sequence.
- [x] No Spec 005 command, producer/provider call, release operation, commit,
  push, or deployment occurs.

### Verification

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

### Expected lifecycle events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T5R1 — Root lockfile engine metadata reconciliation

> Status: complete
> Priority: P0
> Estimate: 30–60 minutes
> Blocked By: T4 and `sancussight-009-T5-verification-failed-20260723-01`
> Model class / effort: standard / high
> Model reason: exact dirty-tree attribution and deterministic manifest repair
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f922d-ea8f-7032-af69-04e87ca607e1`
> Dispatch event: `sancussight-009-T5R1-dispatched-20260723-01`
> Acknowledgment event:
> `sancussight-009-T5R1-acknowledged-20260723-01`
> Ready-for-review event:
> `sancussight-009-T5R1-ready-20260723-01`
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-t5r1-worker-prompt.md`
> Authoritative reconciliation: complete after fresh tracking-owner
> attribution, byte-stable lockfile-only reconciliation, Feature 009 20/20,
> Feature 008 6/6, core, build, and whitespace verification
> Accepted T5R2 lockfile SHA-256:
> `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`

### Delivers

The Vercel-generated root `packages[""].engines.node` lockfile metadata is
reconciled to the already reviewed `package.json` declaration without
rewriting or claiming ownership of any other pre-existing dirty lockfile
content.

### Owned surfaces

- `package-lock.json` only for the root
  `packages[""].engines.node = ">=24.0.0"` synchronization already generated
  by the failed T5 prebuild
- new worker-owned `execution/T5R1.md` and `execution/T5R1-handoff.md`
- no product, dependency version, package.json, shared tracking, deployment,
  or other surface

### Work and acceptance

- [x] Prove the current lockfile differs from the recorded prebuild state only
  by the root engines block for this T5-induced delta; preserve every other
  pre-existing dirty line.
- [x] Confirm the value exactly matches the existing `package.json` engine.
- [x] Run a deterministic lockfile-only no-script reconciliation and prove it
  produces no further byte change.
- [x] Rerun Feature 009, Feature 008, core, build, and scoped whitespace.
- [x] Record the accepted post-reconciliation lockfile hash for T5R2.
- [x] Do not deploy, commit, push, or touch Spec 005/T16R5/T16/A-002.

## T5R2 — Existing-project production deployment retry and hosted verification

> Status: complete
> Priority: P0
> Estimate: 1–2 hours
> Blocked By: T5R1 and usable Vercel authentication
> Model class / effort: standard / high
> Model reason: external deployment mutation with exact source/project locks
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Retry worker task: `019f9239-8d6d-74c3-8369-e137db7ab3fe`
> Retry dispatch event: `sancussight-009-T5R2-dispatched-20260723-01`
> Retry dispatch state: active — one fresh visible top-level task; no duplicate
> T5R2 worker is authorized
> Retry durable handoff:
> `.ai/sdd/handoff/feature009-t5r2-worker-prompt.md`
> Retry acknowledgment event:
> `sancussight-009-T5R2-acknowledged-20260723-01`
> Retry ready-for-review event:
> `sancussight-009-T5R2-ready-20260723-01`
> Authoritative reconciliation: complete after fresh tracking-owner tests,
> build, lockfile verification, deployment/alias inspection, hosted evidence
> inspection, and canonical HTTP 200 check
> Production deployment:
> `dpl_96UapZ28MvQMrBmk63NyM8mZUN86` (`READY`, target `production`,
> `aliasError: null`)
> Visible worker task: `019f9223-3b40-7123-b34c-8c04604417da`
> Dispatch event: `sancussight-009-T5-dispatched-20260723-01`
> Dispatch state: terminal verification-failed; this worker is not authorized
> to resume
> Acknowledgment event: `sancussight-009-T5-acknowledged-20260723-01`,
> received directly after authenticated read-only identity reconciliation and
> before deployment mutation
> Acknowledgment timestamp reconciliation: the event's typed `occurred_at`
> was nine minutes future-dated; direct delivery actually occurred before
> `2026-07-23T20:23:53-07:00`. This corrects metadata only and is not a second
> lifecycle event.
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-t5-worker-prompt.md`
> Verification-failed event:
> `sancussight-009-T5-verification-failed-20260723-01`. The first T5 worker
> stopped before deployment because `vercel build --prod` added the already
> declared root Node engine to `package-lock.json`, changing the source
> manifest while leaving local `dist` and `.vercel/output/static`
> byte-identical. Production remained on
> `dpl_AwJrVdc7SrwSyHubAmmZBCtc5xWR`. A fresh T5R2 worker is required after
> T5R1 reconciliation; the failed worker is not authorized to resume.

### Delivers

The exact reviewed Feature 009 artifact is deployed to the existing canonical
SancusSight Vercel project and verified at the canonical URL.

### Boundary

Deploy only to the already reconciled project:

```text
project: sancussight
project id: prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ
team id: team_Y7ueoZZnBOfX63cjuG9R9SYG
canonical URL: https://sancussight.vercel.app
```

Fail closed on authentication failure, project mismatch, destructive
replacement, source-manifest mismatch, or ambiguous alias. Do not commit,
push, touch Spec 005, run A-002, or claim release readiness.

### Owned surfaces

- read-only reviewed product source
- Vercel prebuilt output and existing canonical project deployment
- worker-owned `execution/T5R2.md`, `execution/T5R2-handoff.md`,
  `execution/T5R2-hosted-report.md`, and hosted evidence directory
- no product correction; a hosted failure requiring code returns to a new
  approved correction ticket

### Acceptance

- [x] Exact reviewed source/static manifests are recorded before deployment.
- [x] Existing project identity and authentication are reconciled before
  mutation.
- [x] Production deployment reaches `READY` and canonical alias has no error.
- [x] Hosted Check Catalog, Asset Passport route, narrow focus/overflow, and
  truth states pass.
- [x] Browser console/network show no Feature 009 regression or new external
  request.
- [x] No private seeded history is used or exposed in hosted evidence.

### Verification

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
vercel build --prod --yes --scope hflowers45-9370s-projects
vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects
real Chromium acceptance at https://sancussight.vercel.app
```

### Expected lifecycle events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## R1 — Independent full-scope review

> Status: complete
> Priority: P0
> Blocked By: T1–T5R2
> Model class / effort: standard / high
> Model reason: independent full-scope spec-alignment and standards challenge
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible review task: `019f9256-20b6-79f3-8532-8c2ddfe1ef2d`
> Dispatch event: `sancussight-009-R1-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level review task; no
> duplicate R1 reviewer is authorized
> Durable review handoff:
> `.ai/sdd/handoff/feature009-r1-review-prompt.md`
> Acknowledgment event: `sancussight-009-R1-acknowledged-20260723-01`
> Findings event: `sancussight-009-R1-findings-20260723-01`
> Verdict: Needs fixes — R1-SPEC-001 and R1-SPEC-002 blocking;
> R1-SPEC-003 and R1-SPEC-004 non-blocking corrections

### Delivers

An independent read-only review of the complete approved Feature 009 scope on
both required axes: Spec alignment and Standards/code quality.

### Review boundary

- Review the approved requirements, design, tasks, all implementation
  surfaces, tests, local-browser evidence, hosted evidence, and current
  production identity.
- Check every Must Have and NFR, truth/privacy boundaries, accessibility,
  deterministic behavior, compatibility, bounded storage, unsupported states,
  and canonical navigation.
- Within Standards, identify removable or consolidatable additions,
  unsupported concepts, and unjustified user or maintainer decision burden.
- Record findings by severity with exact evidence. Do not edit product,
  package, deployment, shared tracking, or prior execution evidence.
- R1 may review the full approved scope. Any later R2 is limited to R1
  findings, their fixes, and regressions caused by those fixes unless a
  comprehensive-reset trigger is documented.

## C1 — R1 truthfulness and history-identity corrections

> Status: complete
> Priority: P0
> Blocked By: R1
> Model class / effort: standard / high
> Model reason: cross-layer semantic identity and truthfulness corrections
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9264-c33f-7620-95d8-6470ff2487a9`
> Dispatch event: `sancussight-009-C1-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level correction worker; no
> duplicate C1 worker is authorized
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-c1-worker-prompt.md`
> Acknowledgment event: `sancussight-009-C1-acknowledged-20260723-01`
> Ready-for-review event: `sancussight-009-C1-ready-20260723-01`
> Authoritative reconciliation: complete after scoped source/test inspection
> and fresh 24/6/92/22 tests, core, build, and whitespace verification

### Delivers

All three product findings from R1 are corrected without changing the approved
requirements or design:

- `R1-SPEC-001`: exact approved result-to-envelope qualification replaces
  asset co-reference as lineage evidence.
- `R1-SPEC-002`: a stable copy-independent per-result discriminator isolates
  history streams end to end and safely isolates legacy records.
- `R1-SPEC-003`: every bounded outgoing conflict relationship renders in
  stable order.

### Acceptance

- Unrelated same-asset evidence cannot become verified, stale, or conflicting
  evidence for a selected check; absent exact qualification remains explicit.
- Same-family sibling results have independent history streams, stable
  identity, correct current/previous values, working consecutive dedupe, and
  bounded retention.
- Legacy stored records cannot be silently misattributed to the new result
  identity.
- A two-observation conflict renders both outgoing relationship labels.
- Adversarial focused tests cover all three findings and existing suites stay
  green.
- No new raw evidence persistence, network route, score, global graph, user
  configuration, or Spec 005/T16R5/T16/A-002 activity.

## C2 — Targeted local browser regression for R1 fixes

> Status: complete
> Priority: P0
> Blocked By: C1
> Model class / effort: standard / high
> Model reason: real-browser semantic, storage, focus, and responsive evidence
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9272-8101-79d2-b5b2-86263b6d1396`
> Dispatch event: `sancussight-009-C2-dispatched-20260723-01`
> Dispatch state: active — one fresh visible top-level browser worker; no
> duplicate C2 worker is authorized
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-c2-worker-prompt.md`
> Acknowledgment event:
> `sancussight-009-C2-acknowledged-20260723-01`
> Ready-for-review event:
> `sancussight-009-C2-ready-20260723-01`
> Authoritative reconciliation: complete on 2026-07-23 after browser report,
> structured-observation, and screenshot inspection plus fresh tracking-owner
> reruns of Feature 009 24/24, Feature 008 6/6, collector 92/92, registry
> compiler 22/22, core verification, the 1,835-module build, and scoped
> whitespace checks. Exact envelope qualification, sibling stream identity,
> independent dedupe/current/previous behavior, legacy isolation, the
> seven-field storage allowlist, both conflict edges, responsive focus, and
> local console/network boundaries passed. No C2 product correction was
> retained.

### Delivers

Fresh local real-Chromium evidence limited to the three product findings,
their fixes, and regressions caused by those fixes, plus required regression
gates. Bounded corrections may touch only completed C1 surfaces when an
approved criterion fails.

## C3 — Corrected production deployment and hosted targeted regression

> Status: complete
> Priority: P0
> Blocked By: C2 and usable Vercel authentication
> Model class / effort: standard / high
> Model reason: exact corrected-artifact deployment and hosted verification
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9290-19a9-7b43-bbed-f35d16e2aa7d`
> Dispatch event: `sancussight-009-C3-dispatched-20260723-01`
> Acknowledgment event: `sancussight-009-C3-acknowledged-20260723-01`
> Ready-for-review event: `sancussight-009-C3-ready-20260723-01`
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature009-c3-worker-prompt.md`
> Authoritative reconciliation: complete after hosted report and structured
> observation inspection plus fresh tracking-owner reruns of Feature 009
> 24/24, Feature 008 6/6, collector 92/92, registry compiler 22/22, core,
> build, whitespace, accepted lockfile hash, and canonical/immutable Vercel
> inspection. Corrected production deployment
> `dpl_ANzB5nVfioTixm5YYY8pqYQUpziK` is `READY` and `PROMOTED`, with the
> canonical alias serving the guarded byte-identical bundle.

### Delivers

The exact C1/C2-reviewed artifact replaces the current Feature 009 production
deployment in the existing canonical Vercel project and passes hosted checks
limited to the R1 findings, their fixes, and fix-caused regressions.

## R2 — Findings-limited independent review

> Status: complete
> Priority: P0
> Blocked By: C1–C3
> Model class / effort: standard / high
> Model reason: independent verification of R1 findings and corrected artifact
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Dispatch blocker event:
> `sancussight-009-R2-dispatch-blocked-20260723-01`
> Dispatch state: resolved — the operator created fresh visible top-level
> reviewer task `019f9366-ca4f-7381-ab84-4d5a74f47de3`.
> Visible review task: `019f9366-ca4f-7381-ab84-4d5a74f47de3`
> Dispatch event: `sancussight-009-R2-dispatched-20260723-01`
> Acknowledgment event: `sancussight-009-R2-acknowledged-20260723-01`
> Acknowledgment receipt: delivered directly before review execution
> Ready-for-review event: `sancussight-009-R2-ready-20260723-01`
> Verdict: Green — R1-SPEC-001 through R1-SPEC-004 resolved; no blocking or
> non-blocking fix-caused regression
> Authoritative reconciliation: complete on 2026-07-24 after findings-limited
> source/evidence inspection and fresh tracking-owner reruns of Feature 009
> 24/24, Feature 008 6/6, collector 92/92, registry compiler 22/22, core,
> the 1,835-module build, whitespace, canonical alias inspection, and exact
> corrected deployment inspection.
> Durable user-created-session handoff:
> `.ai/sdd/handoff/feature009-r2-review-prompt.md`

### Boundary

R2 is limited to R1-SPEC-001 through R1-SPEC-004, their corrections, and
regressions caused by those corrections. No comprehensive reset is authorized.

## Task Microworld Offer

```yaml
visualization_offer:
  stage: tasks
  source_revision: feature009-tasks-20260723-01
  recommended: no
  recommendation_reason: The serial dependency, owned surfaces, and acceptance gates are explicit in this artifact; an HTML microworld would not resolve a human decision.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  decision_source: User instruction to continue autonomously and stop only for genuine human intervention.
```

## Readiness Outcome

Understanding depth is `medium`. The dominant difficulty is maintaining the
boundary between stable definitions, current results, metadata-only history,
and claim lineage. T1–T5 cover every Must Have and important NFR, writable
surfaces are serialized, T1 is a valid frontier, and no routine product choice
remains.

## Approval Record

The user's explicit no-stop blanket approval advances this internally verified
task plan. The optional task microworld was declined as non-blocking. T1 is
the only implementation frontier; later tickets remain blocked until the
orchestrator reconciles each predecessor.
