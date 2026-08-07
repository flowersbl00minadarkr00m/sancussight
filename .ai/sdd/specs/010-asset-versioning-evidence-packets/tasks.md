# Feature 010 Implementation Tasks

> Status: Approved — R1 truthfulness correction
> Original approval: Existing operator blanket approval, reconciled on 2026-07-24 after coverage, ownership, privacy, browser, deployment, and independent-review readiness checks
> Reopened: 2026-07-24 after tracking-owner verification rejected snapshot-only dedupe
> Correction approval: Existing operator blanket approval, reconciled on 2026-07-24 after corrected-design mapping, exact ownership, adversarial acceptance, and downstream blocker review
> Requirements: `@.ai/sdd/specs/010-asset-versioning-evidence-packets/requirements.md`
> Design: `@.ai/sdd/specs/010-asset-versioning-evidence-packets/design.md`
> Tracking owner: orchestrator task `019f914a-b672-77b1-837f-0c866b6421bb`
> Execution: serial, fresh visible top-level Codex task per ticket

## Authority and Execution Rules

- The visible Feature 010 orchestrator is the sole writer of this file,
  `.status`, `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`.
- Every implementation, browser, deployment, and review ticket requires a
  newly created visible top-level Codex task. Subagents, nested/hidden workers,
  reused long-lived tasks, and implementation inside the orchestrator are
  prohibited.
- Workers acknowledge exact ownership before edits, stay inside owned
  surfaces, append their own `execution/<task>.md` and
  `execution/<task>-handoff.md`, and return one stable lifecycle event to the
  tracking task.
- `ready-for-review` is a recommendation only. Completion requires direct
  receipt, scoped inspection, fresh orchestrator verification, and
  authoritative reconciliation.
- Tickets are serialized because types, registry normalization, compiler
  output, App, components, tests, and CSS overlap.
- Existing dirty-tree changes are user-owned and must be preserved.
- Spec 005/T16R5/T16/A-002, producer/provider operations, release-readiness
  claims, commits, pushes, Pi, and unrelated deployment/config changes are
  excluded from every ticket.

## Routing Record

All tickets use a capability-neutral `standard` model class with `high` effort.
The design is explicit and the repository contains suitable patterns, while
privacy, canonical hashing, compatibility, responsive focus, and deployment
continuity require careful verification. No Sol High or equivalent stronger
route is selected, so `high_tier_second_opinion` is `not-required`.

Every ticket carries:

```yaml
tracking_owner: orchestrator task 019f914a-b672-77b1-837f-0c866b6421bb
session_policy: new-top-level-required
freshness_state: fresh-at-dispatch
cumulative_usage: unknown
rollover: before 250k tokens, or earlier after compaction, missing telemetry,
  ownership change, or context uncertainty
```

## Dependency Graph

```text
T1 -> T1R1 -> T2 -> T3 -> T4 -> T5 -> T6 -> R1 -> C1 -> C2 -> C3 -> R2
```

If R1 finds defects, the orchestrator creates new findings-limited correction,
browser, deployment, and R2 tickets as required. R2+ may review only prior
findings, their fixes, and fix-caused regressions unless a comprehensive reset
is explicitly documented.

## Requirement Coverage

| Requirement | Tasks |
|---|---|
| FR-001 | T1, T1R1, T4, T5 |
| FR-002 | T1, T4, T5 |
| FR-003 | T1, T1R1, T4, T5 |
| FR-004 | T1, T1R1, T4, T5 |
| FR-005 | T2, T4, T5 |
| FR-006 | T2, T4, T5 |
| FR-007 | T4, T5, T6 |
| FR-008 | T1, T3, T5 |
| NFR-001 | T4, T5, T6 |
| NFR-002 | T1, T2, T3, T5, T6 |
| NFR-003 | T1, T1R1, T2, T4, T5 |
| NFR-004 | T1, T3, T5 |
| NFR-005 | T2, T4, T5 |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Every Must Have has design and tasks | Pass | Mapping covers FR-001–FR-008 |
| Critical product decisions answered | Pass | Versions, aliases, comparison, packet, compatibility fixed |
| Tasks have blockers and exact surfaces | Pass | T1–T6 and R1 are bounded and serial |
| Writable overlaps coordinated | Pass | One fresh task at a time; orchestrator owns tracking |
| Verification commands known | Pass | Feature, regression, compiler, browser, and hosted gates named |
| Privacy boundary testable | Pass | Fixed snapshot/packet allowlists and adversarial negatives |
| At least one frontier task exists | Pass | T1 has no blocker |
| High-tier challenge required | N/A | Standard/high route, not Sol High equivalent |

## Frontier

| Task | Blocked By | Status |
|---|---|---|
| T1 | none | Complete through T1R1 correction |
| T1R1 | T1 returned and corrected design approved | Complete |
| T2 | T1R1 | Complete |
| T3 | T2 | Complete |
| T4 | T3 | Complete |
| T5 | T4 | Complete |
| T6 | T5 and usable Vercel authentication | Complete |
| R1 | T1–T6 | Complete — Needs fixes |
| C1 | R1 findings | Complete |
| C2 | C1 | Complete |
| C3 | C2 and usable Vercel authentication | Complete |
| R2 | C1–C3 | Complete |

## T1 — Bounded asset-version model and schema2 compatibility

> Status: complete through T1R1
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: none
> Model class / effort: standard / high
> Model reason: privacy-sensitive immutable model, deterministic identity,
> comparison semantics, and strict compatibility validation
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f937a-ddae-7853-9649-e2c396cedef6`
> Dispatch event: `sancussight-010-T1-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T1-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before product edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t1-worker-prompt.md`
> Duplicate recovery: visible task
> `019f937b-9a37-7170-9f12-a9d812a18e0a` stopped before acknowledgment or
> edits under `sancussight-010-T1-blocked-duplicate-worker-20260724-01`.
> It changed no product, execution, or shared tracking file and is not
> authorized to resume.
> Ready event: `sancussight-010-T1-ready-20260724-01`
> Tracking-owner reconciliation: not accepted. All named gates passed, but an
> independent reproduction proved a changed verification status is
> incorrectly deduplicated when asset facts are unchanged. The stored prior
> status remains current, so approved regression/recovery comparison is
> unreachable. Original T1 worker is terminal and is not authorized to resume.
> Authoritative reconciliation: complete on 2026-07-24 through corrected T1R1
> after source inspection, independent pass-to-fail reproduction, and fresh
> Feature 010 12/12, Feature 009 24/24, Feature 008 6/6, core, build, and
> scoped whitespace verification.

### Delivers

A pure bounded asset-version model records immutable snapshots, manages
flexible aliases, compares current with immediately previous, and validates
optional schema-version-2 fields without fabricating history.

### Owned Surfaces

- `src/types.ts` only for approved Feature 010 version/comparison contracts
- new `src/lib/asset-versions.ts`
- `src/lib/session.ts` only for strict optional Feature 010 normalization
- focused non-overlapping `feature010-*` model tests under
  `src/lib/__tests__/`
- `package.json` and `package-lock.json` only if needed for additive
  `test:feature010`; no runtime dependency
- worker-owned `execution/T1.md` and `execution/T1-handoff.md`

### Work

- [ ] Add optional version, alias, and current-pointer asset fields and exact
  schema-version-1 subcontracts.
- [ ] Implement canonical projection from current asset plus cataloged
  Feature 009 result metadata.
- [ ] Implement stable SHA-256 version identity, consecutive snapshot dedupe,
  append, 50-version retention, and current pointer.
- [ ] Implement alias add/move/remove with case-insensitive uniqueness and
  fixed bounds.
- [ ] Implement current-versus-previous comparison and the approved transition
  table with no overall score.
- [ ] Extend schema2 normalization to validate present metadata strictly while
  preserving absent metadata unchanged.
- [ ] Add positive, boundary, compatibility, and adversarial tests.

### Acceptance

- [ ] Copy/order changes do not alter snapshot identity.
- [ ] Equivalent consecutive state does not append a version.
- [ ] Missing history remains missing; load never creates a version.
- [ ] One alias cannot point to multiple versions and aliases make no truth
  claim.
- [ ] All regression/recovery classifications follow the fixed table.
- [ ] Unsupported shapes, dangling pointers, duplicate IDs, and over-limit
  metadata fail closed.
- [ ] Existing schema-version-2 demo/local fixtures normalize unchanged.
- [ ] No network, new IndexedDB, score, automatic migration, or Spec 005
  action is introduced.

### Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

### Expected Lifecycle Events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T1R1 — Qualified version-equivalence correction

> Status: complete
> Priority: P0
> Estimate: 1–2 hours
> Blocked By: T1 returned and corrected design approved
> Model class / effort: standard / high
> Model reason: narrow deterministic identity/dedupe correction at a
> privacy-sensitive version-history boundary
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9392-349b-7373-a839-4c8f7df4a7db`
> Dispatch event: `sancussight-010-T1R1-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T1R1-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before product edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t1r1-worker-prompt.md`
> Ready event: `sancussight-010-T1R1-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after corrected
> equivalence/identity/imported-history source inspection, independent
> pass-to-fail reproduction (`recorded`, two versions, stored `fail`), and
> fresh 12/24/6 tests, core, build, and scoped whitespace.

### Delivers

Version equivalence includes qualified source and verification state, so
check-only regressions/recoveries and changed safe evidence record distinct
versions while repeated equivalent observations still deduplicate.

### Owned Surfaces

- `src/lib/asset-versions.ts`
- `src/lib/__tests__/feature010-asset-versions.test.mjs`
- `src/types.ts` only if the corrected approved projection requires a type
  adjustment; avoid if possible
- worker-owned `execution/T1R1.md` and `execution/T1R1-handoff.md`
- no package, session, UI, compiler, packet, or shared tracking file

### Work

- [ ] Implement a canonical equivalence projection containing snapshot,
  source reference hashes, and verification `checkId`, `resultId`, `status`,
  and optional safe evidence hash.
- [ ] Exclude `recordedAt` and verification `evaluatedAt` from equivalence so
  repeated equivalent observation times do not create noise.
- [ ] Include full source and verification metadata in the new version identity
  preimage after equivalence passes.
- [ ] Validate imported histories against consecutive equivalence, not
  snapshot-only equality.
- [ ] Replace the incorrect test expectation and add adversarial cases for
  status change, safe-evidence change, source-reference change, and
  evaluation-time-only repetition.

### Acceptance

- [ ] `pass -> fail` with unchanged asset facts records a second version and
  comparison reports a regression.
- [ ] `fail -> pass` records a recovery.
- [ ] Changed safe evidence or source hash records a distinct version.
- [ ] Same facts/status/evidence/source with a later evaluation timestamp
  deduplicates.
- [ ] Version identity is deterministic, copy/order independent, and includes
  the qualified identity projection.
- [ ] Existing versionless schema2 compatibility, alias, retention, privacy,
  and comparison tests remain green.
- [ ] No new field, migration, score, network, storage, dependency, UI,
  compiler, or Spec 005 action is introduced.

### Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

### Expected Lifecycle Events

`acknowledged`, then one of `blocked`, `contract-conflict`,
`verification-failed`, or `ready-for-review`.

## T2 — Strict Evidence Packet projection and local export

> Status: complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T1R1
> Model class / effort: standard / high
> Model reason: canonical cross-runtime hashing and adversarial privacy boundary
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f93a0-3e37-7893-a523-7ba09fa77720`
> Dispatch event: `sancussight-010-T2-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T2-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t2-worker-prompt.md`
> Ready event: `sancussight-010-T2-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after packet/type/test
> inspection and fresh Feature 010 19/19, Feature 009 24/24, Feature 008 6/6,
> core, build, and scoped whitespace verification.

### Delivers

Asset versions and current Exit Drill results project into a strict,
schema-version-1, digest-verified Evidence Packet that can be downloaded
locally without exporting raw content.

### Owned Surfaces

- new `src/lib/evidence-packet.ts`
- `src/types.ts` only for approved packet contracts after T1
- focused non-overlapping Feature 010 packet/adversarial tests
- `package.json` only if the existing Feature 010 command needs an additive
  glob; no dependency
- worker-owned `execution/T2.md` and `execution/T2-handoff.md`

### Work

- [ ] Implement narrow asset-version and Exit Drill packet builders.
- [ ] Implement exact subject, predicate, producer, run, qualification,
  verification, human-decision, missing-evidence, and comparison projections.
- [ ] Implement recursive canonical JSON and the approved digest preimage.
- [ ] Implement runtime exact-shape validation and digest recomputation.
- [ ] Implement sanitized Blob download with explicit capability failure.
- [ ] Add adversarial tests proving prohibited content cannot enter through
  any builder input or nested output.

### Acceptance

- [ ] Re-exporting the same qualified payload keeps one packet ID even when
  `exportedAt` changes.
- [ ] Changing a qualified payload changes the packet ID.
- [ ] Tampering, unsafe keys, paths, URLs, emails, secrets, prompt/response,
  raw evidence/finding copy, registry objects, and oversized values fail.
- [ ] Packet subject uses a safe hash, not raw asset ID/name.
- [ ] Exit Drill packets contain statuses and safe subject hashes, not notes or
  workflow names.
- [ ] Download creates no network request and does not mutate the registry.
- [ ] No signing, import, external verification, runtime dependency, or
  standards claim is introduced.

### Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T3 — Registry compiler preservation and portable sanitization

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T2
> Model class / effort: standard / high
> Model reason: dirty-tree-sensitive compiler compatibility and local/portable
> privacy parity
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f93b0-fb1a-7633-8321-1e767803bac5`
> Dispatch event: `sancussight-010-T3-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T3-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before compiler edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t3-worker-prompt.md`
> Ready event: `sancussight-010-T3-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after compiler/test
> inspection and fresh Feature 010 19/19, compiler 26/26, Feature 009 24/24,
> Feature 008 6/6, core, build, and scoped whitespace verification.

### Delivers

Confirmed compiler refresh preserves valid optional Feature 010 history by
stable identity in local and portable schema2 outputs without inventing a
version or leaking local-only values.

### Owned Surfaces

- `packages/registry-compiler/src/output/local.ts`
- compiler contracts only if required for the approved optional fields
- focused non-overlapping registry-compiler tests/fixtures for Feature 010
- worker-owned `execution/T3.md` and `execution/T3-handoff.md`

### Work

- [ ] Extend compiler registry types and importability guard for optional
  Feature 010 fields.
- [ ] Preserve valid history, aliases, and current pointer on a confirmed
  stable-identity refresh.
- [ ] Preserve history when an asset becomes missing.
- [ ] Emit no history for a new asset unless the prior registry had it.
- [ ] Apply portable sanitization to retained snapshot provider/capability/
  fallback labels without changing identities or local output.
- [ ] Fail closed on invalid prior history.

### Acceptance

- [ ] Existing version-free schema2 compiler fixtures remain byte-contract
  compatible except for unrelated deterministic timestamps/hashes.
- [ ] Refresh appends no version and performs no silent migration.
- [ ] Local valid history round-trips exactly.
- [ ] Portable history contains no local path, owner, user identifier, raw
  evidence, or prohibited key.
- [ ] Archived/missing assets retain their prior valid history.
- [ ] Compiler and product validators agree on limits and supported versions.

### Verification

```text
npm run test:feature010
npm run test:registry-compiler
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T4 — Asset Passport and Exit Drill product integration

> Status: complete
> Priority: P0
> Estimate: 3–5 hours
> Blocked By: T3
> Model class / effort: standard / high
> Model reason: consequential responsive React/focus integration across two
> existing canonical product flows
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f93bb-73ab-7d31-9fc5-aa14c2e4251a`
> Dispatch event: `sancussight-010-T4-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T4-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before product edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t4-worker-prompt.md`
> Ready event: `sancussight-010-T4-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after source/test
> inspection and fresh Feature 010 23/23, Feature 009 24/24, Feature 008 6/6,
> core, build, and scoped whitespace verification.

### Delivers

Asset Passport History exposes recording, aliases, current-versus-previous
comparison, and asset packet export. Exit Drills expose packet export for the
current result. App remains the sole registry-update owner.

### Owned Surfaces

- `src/App.tsx`
- `src/components/Registry.tsx`
- `src/components/ExitTest.tsx`
- new `src/components/AssetVersionHistory.tsx`
- new `src/components/AssetVersionComparison.tsx` if separation is useful
- new `src/components/EvidencePacketExport.tsx` if separation is useful
- Feature 010 selectors only in `src/index.css`
- focused non-overlapping Feature 010 UI/static tests
- worker-owned `execution/T4.md` and `execution/T4-handoff.md`

### Work

- [ ] Add App-owned explicit version recording and alias mutations through the
  existing registry update path.
- [ ] Add no-history, one-version, current/previous, dedupe, and error states
  in canonical Asset Passport History.
- [ ] Add alias add/move/remove controls with suggested labels as hints only.
- [ ] Render textual comparison items and bases with no score or generated
  narrative.
- [ ] Add asset-version packet download and honest success/failure status.
- [ ] Add Exit Drill packet export only when a current result exists.
- [ ] Preserve Feature 008 desktop adjacency and deliberate narrow focus/Back
  behavior without a duplicate inspector.

### Acceptance

- [ ] Recording a distinct version marks the local session dirty and selects
  the recorded current version.
- [ ] Equivalent recording reports already recorded and does not mutate.
- [ ] Alias controls are labeled, bounded, keyboard usable, and never presented
  as evidence or environment state.
- [ ] No previous comparison and every transition state are textual.
- [ ] Downloaded packet status is explicit; failure claims no export.
- [ ] Exit Drill export cannot appear to persist or execute a drill.
- [ ] Existing Assets, Attention, source navigation, footer, and Exit Drill
  behavior remain canonical.

### Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T5 — Local real-Chromium integrated acceptance

> Status: complete
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T4
> Model class / effort: standard / high
> Model reason: real-browser mutation, download, focus, storage, privacy, and
> responsive acceptance
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f93c6-d6fe-7b92-8475-e5c9088d58d9`
> Dispatch event: `sancussight-010-T5-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T5-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before browser work
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t5-worker-prompt.md`
> Ready event: `sancussight-010-T5-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after correction/browser
> evidence inspection and fresh Feature 010 24/24, Feature 009 24/24, Feature
> 008 6/6, collector 92/92, compiler 26/26, core, build, and scoped whitespace
> verification.

### Delivers

Fresh local real-Chromium evidence covers version recording, persistence,
comparison, aliases, exact packet JSON/privacy, Exit Drill export, focus,
320px, effective 200% zoom, console, and network. Bounded corrections may
touch completed T1–T4 product/test surfaces only when an approved criterion
fails.

### Owned Surfaces

- bounded corrections within completed T1–T4 surfaces only
- `execution/T5.md`, `execution/T5-handoff.md`,
  `execution/T5-browser-report.md`, and `execution/T5-browser/`

### Acceptance Matrix

- [ ] Existing schema2 registry opens with explicit no-history state and no
  mutation.
- [ ] First record, equivalent dedupe, changed second record, and 50-entry
  retention behave as designed.
- [ ] Alias add, case-insensitive move, removal, keyboard use, and truth label
  pass.
- [ ] Current/previous regression, recovery, changed, unchanged, and no-prior
  states match exact recorded data.
- [ ] Asset packet and Exit Drill packet download as valid canonical JSON with
  matching digest and fixed keys.
- [ ] Downloaded files contain no prohibited key/value, path, URL, email,
  owner, prompt/response, credential, raw finding/evidence, or registry object.
- [ ] Desktop adjacency, narrow one-DOM behavior, useful focus return, 320px,
  and effective 200% zoom pass with zero page overflow.
- [ ] Console has no Feature 010 errors/warnings and traffic remains
  loopback/same-origin only.

### Final Verification Order

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

## T6 — Existing-project production deployment and hosted verification

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T5 and usable Vercel authentication
> Model class / effort: standard / high
> Model reason: external deployment mutation with exact source/project/static
> locks and hosted privacy verification
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f93de-dcb5-7590-bd87-f940406ba4cd`
> Dispatch event: `sancussight-010-T6-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-T6-acknowledged-20260724-01`
> Dispatch state: active — identity reconciled and exact worker acknowledged
> before build or deployment mutation
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-t6-worker-prompt.md`
> Ready event: `sancussight-010-T6-ready-20260724-01`
> Authoritative reconciliation: complete on 2026-07-24 after hosted evidence
> inspection, exact canonical/immutable deployment reconciliation, and fresh
> Feature 010 24/24, Feature 009 24/24, Feature 008 6/6, collector 92/92,
> compiler 26/26, core, build, and full whitespace verification.

### Delivers

The exact T5-reviewed Feature 010 artifact is deployed to the existing
canonical SancusSight Vercel production project and verified at the canonical
URL.

### Deployment Boundary

```text
project: sancussight
project id: prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ
team id: team_Y7ueoZZnBOfX63cjuG9R9SYG
scope: hflowers45-9370s-projects
canonical URL: https://sancussight.vercel.app
```

Fail closed on missing authentication, project mismatch, destructive
replacement, source/lock/static manifest mismatch, or ambiguous alias.

### Owned Surfaces

- read-only reviewed product/config source
- Vercel prebuilt output and exact existing canonical production deployment
- `execution/T6.md`, `execution/T6-handoff.md`,
  `execution/T6-hosted-report.md`, and `execution/T6-hosted/`
- no product correction, package mutation, shared tracking, commit, or push

### Acceptance

- [ ] Feature/regression/compiler/core/build/whitespace gates pass before
  deployment.
- [ ] Exact source, accepted lockfile, local static, prebuilt static, and
  hosted static manifests remain continuous.
- [ ] Existing project identity is reconciled before mutation.
- [ ] Deployment reaches `READY`, target `production`, and canonical alias has
  no error.
- [ ] Hosted version/no-history/comparison, local-only packet download,
  Exit Drill export, focus, responsive, footer, console, network, and runtime
  checks pass.
- [ ] Hosted use creates no server-side history, analytics, or third-party
  request.

### Verification

```text
npm run test:feature010
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

## R1 — Independent full-scope review

> Status: complete — Needs fixes
> Priority: P0
> Estimate: 3–4 hours
> Blocked By: T1–T6
> Model class / effort: standard / high
> Model reason: independent spec-alignment and standards challenge across
> immutable data, privacy, UI, compiler, and deployed artifact
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible reviewer task: `019f93f5-52a3-76a2-b163-5b2f2f38e525`
> Dispatch event: `sancussight-010-R1-dispatched-20260724-01`
> Acknowledgment event: `sancussight-010-R1-acknowledged-20260724-01`
> Dispatch state: active — exact reviewer acknowledged before review execution
> Durable review handoff:
> `.ai/sdd/handoff/feature010-r1-review-prompt.md`
> Findings event: `sancussight-010-R1-findings-20260724-01`
> Authoritative reconciliation: accepted with three blocking Spec findings and
> two non-blocking Standards findings; correction scope is C1–C3 and R2.

### Delivers

An independent read-only review of the complete approved Feature 010 scope on
both mandatory axes: Spec alignment and Standards/code quality.

### Owned Surfaces

- read-only requirements/design/tasks/product/test/evidence/deployment
- new `review-r1.md`
- worker-owned `execution/R1.md` and `execution/R1-handoff.md`
- no product, package, deployment, prior evidence, or shared tracking edit

### Review Boundary

- Review every Must Have and NFR, exact version/alias/comparison/packet
  semantics, schema2 compatibility, compiler preservation, privacy negatives,
  accessibility, browser evidence, and deployed identity.
- Attempt adversarial cross-asset/version identity, alias collision, tampered
  digest, unsafe nested data, portable-output leakage, and overclaim cases.
- Within Standards, identify removable or consolidatable additions,
  unsupported abstractions, and unjustified user or maintainer decisions.
- Record findings with severity, blocking state, exact evidence, and affected
  contract. Do not implement fixes.

### Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
inspect exact canonical and immutable deployment
```

## C1 — R1 truthfulness correction

> Status: complete
> Priority: P0
> Estimate: 4–6 hours
> Blocked By: R1
> Model class / effort: standard / high
> Model reason: cross-boundary identity, comparison, compiler, packet, and
> strict-date correction with adversarial truthfulness tests
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9401-d4ff-7592-aedc-5e11cd9f084a`
> Acknowledgment event: `sancussight-010-C1-acknowledged-20260724-01`
> Dispatch state: active — exact worker acknowledged before product edits
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-c1-worker-prompt.md`
> Ready event: `sancussight-010-C1-ready-20260724-01`
> Authoritative reconciliation: complete after source/evidence inspection and
> fresh 31/28/24/6/core/build verification.

### Findings

`R1-SPEC-001`, `R1-SPEC-002`, `R1-SPEC-003`,
`R1-STANDARDS-001`, `R1-STANDARDS-002`.

### Owned Surfaces

- `src/types.ts`
- `src/lib/asset-versions.ts`
- `src/lib/evidence-packet.ts`
- `src/lib/session.ts` and `src/lib/storage.ts` only for verified import
- `src/App.tsx`
- `src/components/AssetVersionHistory.tsx`
- `packages/registry-compiler/src/output/local.ts`
- focused Feature 010 and compiler tests
- worker-owned `execution/C1.md` and `execution/C1-handoff.md`

### Acceptance

- Meaningful comparison items cannot be crowded out; over-cap meaningful
  changes return explicit unavailable state and unchanged truncation is stated.
- Forged recorded or derivative IDs fail before import, compiler preservation,
  or packet export.
- Portable sanitized history has a new verified derivative ID,
  `portable-projection` qualification, safe source pointer, and remapped
  aliases/current pointer.
- Packet comparison is derived internally from verified versions.
- Impossible ISO dates/timestamps fail in product, packet, and compiler.
- Versionless compatibility, privacy, retention, UI truth labels, and Feature
  008/009 behavior remain green.

### Verification

```text
npm run test:feature010
npm run test:registry-compiler
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## C2 — Findings-limited local real-Chromium regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C1
> Model class / effort: standard / high
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9411-40a8-7bc2-ad88-e21f3648eed5`
> Acknowledgment event: `sancussight-010-C2-acknowledged-20260724-01`
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-c2-worker-prompt.md`
> Ready event: `sancussight-010-C2-ready-20260724-01`
> Authoritative reconciliation: complete after browser evidence inspection and
> fresh Feature 010 31/31, compiler 28/28, and build verification.

Verify only the five R1 findings, their fixes, and fix-caused UI/import/
download regressions. Bounded corrections may touch C1-owned product/test
surfaces only. Capture `execution/C2*` evidence and run the full T5 gate order.

## C3 — Corrected exact-artifact deployment and hosted regression

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C2 and usable Vercel authentication
> Model class / effort: standard / high
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible worker task: `019f9420-2947-7fc3-a306-581c82749835`
> Acknowledgment event: `sancussight-010-C3-acknowledged-20260724-01`
> Durable dispatch handoff:
> `.ai/sdd/handoff/feature010-c3-worker-prompt.md`
> Ready event: `sancussight-010-C3-ready-20260724-01`
> Authoritative reconciliation: complete after hosted report inspection and
> canonical deployment `dpl_A8C9H34nNHkqaJLxizkmvxWN9Xm1` READY verification.

Deploy only the exact C2-reviewed artifact to the existing canonical Vercel
project under the T6 manifest boundary. No product correction is owned. Verify
findings-limited hosted behavior and byte continuity under `execution/C3*`.

## R2 — Findings-limited independent follow-up

> Status: complete — Approved within scope
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: C1–C3
> Model class / effort: standard / high
> High-tier second opinion: not-required
> Session policy: new-top-level-required
> Visible reviewer task: `019f9437-66f0-7a52-ac2e-7e4b9b8fd58e`
> Acknowledgment event: `sancussight-010-R2-acknowledged-20260724-01`
> Durable review handoff:
> `.ai/sdd/handoff/feature010-r2-review-prompt.md`
> Ready event: `sancussight-010-R2-ready-20260724-01`
> Authoritative reconciliation: complete after review evidence inspection,
> fresh Feature 010 31/31, Feature 009 24/24, Feature 008 6/6, collector
> 92/92, compiler 28/28, core, build, whitespace, and corrected canonical /
> immutable deployment inspection.

Review only the five R1 findings, their fixes, and fix-caused regressions. Do
not reopen unrelated comprehensive scope without a documented reset trigger.

R2 resolved `R1-SPEC-001` through `R1-SPEC-003` and
`R1-STANDARDS-001` through `R1-STANDARDS-002`; no fix-caused regression or
comprehensive-reset trigger was found. The preserved R1 comprehensive record
plus this bounded follow-up support the authoritative `review:done` status.

## Task Microworld Offer

```yaml
visualization_offer:
  stage: tasks
  source_revision: feature010-tasks-20260724-01
  recommended: no
  recommendation_reason: The serial dependency, owned surfaces, privacy boundaries, and acceptance gates are explicit; an HTML microworld would not resolve a human decision.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  decision_source: Operator instruction that optional HTML is declined under autonomous no-stop execution.
```

## Approval Checklist

- [x] Every Must Have and important NFR has task coverage
- [x] T1R1 is the only unblocked implementation frontier
- [x] Every task has exact owned surfaces and fresh visible task policy
- [x] Privacy, compatibility, browser, hosted, and review gates are explicit
- [x] Optional task microworld recorded as declined
- [x] Spec 005/T16R5/T16/A-002 remain excluded
- [x] Operator blanket approval reconciled
