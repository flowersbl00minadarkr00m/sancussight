# Feature 009 R1 Independent Review

> Comprehensive first review pass over the full approved Feature 009 scope.
> This is a read-only reviewer recommendation at
> `implementation:in-progress`; it does not approve a gate or update shared
> tracking.

## Verdict

**Needs fixes.**

Two High-severity Spec-alignment findings are release-blocking:

1. the lineage builder can present an unrelated same-asset observation as
   verified, stale, or conflicting evidence for a selected check; and
2. multiple results from one rule family on one asset share a history stream,
   producing false current/previous transitions and defeating consecutive
   deduplication.

The implementation otherwise demonstrates substantial approved-scope
coverage: the 20-definition catalog, canonical Attention workspace,
uncataloged handling, metadata-only bounded IndexedDB design, responsive
navigation, production deployment identity, and all named automated suites
passed fresh review verification.

## Review Scope and Authority

- Pass: `R1`, comprehensive initial review.
- Authority gate observed:
  `.ai/sdd/specs/009-claim-lineage-check-catalog/.status` =
  `implementation:in-progress`.
- Reviewed authority: approved requirements, approved design, approved tasks,
  current `.status`, understanding record, SDD handoff brief, R1 prompt, and
  T1-T5R2 execution evidence.
- Reviewed implementation: Feature 009 catalog, projection, lineage, history,
  canonical UI, Asset Passport integration, supporting types/evaluators,
  Feature 009 tests, and named regression surfaces.
- Reviewed runtime evidence: representative local and hosted browser captures,
  hosted browser reports, current production inspection, and immutable
  deployment identity.
- Exclusions preserved: no Spec 005, T16R5, T16, or A-002 activity; no product,
  package, test, deployment, Vercel configuration, shared tracking, prior
  execution evidence, commit, or push mutation.

## Blocking Findings

### R1-SPEC-001 — Unrelated same-asset observations become check evidence

- Severity: **High**
- Axis: **Spec alignment and Standards/code quality**
- Status: **Blocking**
- Contract affected: FR-003, FR-007, NFR-003, TD-004, D-001

`relevantEvidence` accepts an envelope when its subject has the selected
asset's stable ID, even without an exact result evidence reference or a
check-specific binding
(`src/lib/claim-lineage.ts:80-99`). `evidenceState` then labels the resulting
relationship `verified`, `stale`, or `conflicting`
(`src/lib/claim-lineage.ts:101-128`). The canonical UI supplies the entire
accepted evidence collection to this builder
(`src/components/CheckCatalog.tsx:135-142`).

Fresh review reproduction selected a
`portability.provider-fallback.v1` result and supplied one accepted
`unrelated-runtime-health` envelope for the same asset. The emitted shortest
path included that envelope, producer, contract, and claim with every edge
marked `verified`. Local browser evidence also shows two
`synthetic-lineage-observation` Agent Beacon envelopes as conflicting evidence
for the unrelated `governance.accepted-asset-metadata.v1` result.

This invents a support/conflict relationship that the accepted data does not
establish. It contradicts the product's own statement that a verified edge is
deterministically bound to the named rule and result, and crosses the approved
truthfulness boundary.

Required correction:

- require an exact, approved check/result-to-envelope relationship before an
  envelope may enter the lineage;
- do not treat asset co-reference alone as evidence for a deterministic check;
- preserve explicit missing/inferred behavior when exact qualification is
  absent; and
- add negative tests proving unrelated same-asset envelopes cannot become
  verified, stale, or conflicting check evidence.

### R1-SPEC-002 — Same-family results share a false history stream

- Severity: **High**
- Axis: **Spec alignment and Standards/code quality**
- Status: **Blocking**
- Contract affected: FR-002, FR-005, NFR-003, TD-003, D-003

The evaluator emits one `portability.provider-fallback.v1` signal for every
provider dependency (`src/lib/registry.ts:101-108`), but projection identity is
only scope, asset, and check ID (`src/lib/check-catalog.ts:431`). App recording
uses the same three fields (`src/App.tsx:165-174`), history stream selection
uses the same three fields (`src/lib/check-history-store.ts:321-329`), and the
detail reader supplies only those fields
(`src/components/CheckCatalog.tsx:211-215`).

Fresh review reproduction used one asset with two provider dependencies: one
passing and one failing. After the first unchanged evaluation, the shared
stream contained two entries and reported the failing sibling as current and
the passing sibling as previous. Repeating the identical evaluation produced
four entries, because the stream alternated pass/fail and consecutive
deduplication could not recognize either result as unchanged.

The UI can therefore describe two concurrently evaluated sibling results as a
temporal change to one result. This makes current/previous history misleading
and permits unchanged evaluations to consume retention capacity.

Required correction:

- introduce a stable per-result discriminator into projection, snapshot,
  stream, retention, record, and read identity;
- keep the discriminator deterministic and independent of display copy;
- migrate or safely isolate any existing local records if the storage shape
  changes; and
- add a multi-instance test covering independent streams, correct
  current/previous values, consecutive deduplication, and bounded retention.

## Non-Blocking Findings

### R1-SPEC-003 — Conflict rendering drops one outgoing relationship

- Severity: **Medium**
- Axis: **Spec alignment and Standards/code quality**
- Status: **Non-blocking after R1-SPEC-001 is corrected**
- Contract affected: FR-003

The inspector reduces all edges to a single edge per source node with
`new Map(lineage.edges.map(edge => [edge.from, edge]))`
(`src/components/ClaimLineageInspector.tsx:17`). A conflicting lineage can
contain two edges from the target to two bounded evidence nodes, so the later
entry overwrites the earlier one. The local conflict screenshot visibly
renders the first evidence node without its relationship label.

Required correction: render every bounded outgoing relationship in stable
order, or change the lineage structure so the UI receives a genuinely linear
path. Add a render-level test with two conflicting observations.

### R1-SPEC-004 — Planned/As Built evidence is stale

- Severity: **Medium**
- Axis: **Spec alignment**
- Status: **Non-blocking control-plane correction**

The understanding record still states `.status` is `tasks:approved`
(`understanding.md:5`) and that implementation has not started
(`understanding.md:51-53`). The authoritative status is
`implementation:in-progress`, T1-T5R2 are recorded complete, and production
deployment evidence exists. The handoff brief header similarly says only
T1-T3 are complete and T4 is open (`sdd-brief.md:3-5`), although its later
current-frontier section correctly identifies T1-T5R2 complete and R1 active
(`sdd-brief.md:246-251`).

Required correction: the tracking owner should append the actual As Built
model and refresh the supporting current-state summaries without using them to
approve a gate.

## Spec-Alignment Coverage

### Requirements

| Contract | Result | Review evidence |
|---|---|---|
| FR-001 | Pass | 20 unique, versioned definitions; explicit IDs; deterministic search; authored contract text |
| FR-002 | Fail | Canonical detail exists, but sibling results can share identity/history |
| FR-003 | Fail | Same-asset evidence can be falsely qualified; conflict edge is dropped in rendering |
| FR-004 | Pass | Belief, missing input, pass, remediation, and invalidation text are explicit |
| FR-005 | Fail | Storage is bounded and metadata-only, but multi-instance streams produce false history and failed dedupe |
| FR-006 | Pass | Attention is canonical; Asset Passport opens and returns to the shared detail |
| FR-007 | Fail | Truth classes are textual, but unsupported evidence relationships can be called verified/conflicting |
| FR-008 | Pass | Uncataloged observations remain explicitly uncataloged |
| NFR-001 | Pass | Desktop and narrow/200% browser evidence is usable with no Feature 009 page overflow |
| NFR-002 | Pass | History is local metadata-only; no new Feature 009 network route |
| NFR-003 | Fail | Findings R1-SPEC-001 and R1-SPEC-002 violate deterministic truthfulness |
| NFR-004 | Pass | Feature 008, collector, registry compiler, core, and build verification passed |
| NFR-005 | Pass | Lineage and history remain mechanically bounded despite the identity defect |

### Approved Tasks

| Task | Result | Review evidence |
|---|---|---|
| T1 | Partial | Catalog/projection bounds pass; lineage relevance is not truthful |
| T2 | Fail | Privacy and retention pass; stream identity is insufficient for multi-instance checks |
| T3 | Partial | Canonical integration passes; it consumes the flawed lineage/history and drops a conflict edge |
| T4 | Partial | Browser matrix passed but its conflict fixture corroborates rather than detects the false relationship |
| T5 | Superseded as recorded | Initial prebuild stopped before deploy; no R1 action |
| T5R1 | Pass | Lockfile reconciliation evidence is coherent and accepted |
| T5R2 | Partial | Deployment identity and hosted acceptance pass; deployed product contains the blocking defects |

### Design Decisions

| Decision | Result | Review evidence |
|---|---|---|
| TD-001 / D-002 | Pass | Checked-in catalog is the authority; IDs are explicit and versioned |
| TD-002 / D-004 | Pass | Canonical workspace is shared; `Queue.tsx` aliases rather than duplicates it |
| TD-003 / D-003 | Fail | Dedicated bounded database exists, but the result-stream identity is not honest |
| TD-004 / D-001 | Fail | Models are separate, but asset co-reference is conflated with evidence for a claim |
| TD-005 / D-005 | Pass | Responsive dual-pane/narrow focus behavior is evidenced |

## Standards and Code-Quality Review

Confirmed strengths:

- pure catalog/projection/lineage modules with no added runtime dependency;
- fixed safe history allowlist, hashed scope/reference fields, per-stream and
  global caps, failure-tolerant unavailability handling, and explicit clear;
- one canonical React implementation, with the former Queue surface reduced to
  an alias;
- explicit textual outcome, truth, remediation, and invalidation states;
- no aggregate score, global graph, new network route, or raw evidence copied
  into history; and
- focused Feature 009 tests plus broad named regression suites.

Required quality corrections:

- model evidence qualification as an explicit domain relation, not incidental
  shared asset identity;
- make result identity match evaluator cardinality end to end;
- render one-to-many bounded edges without lossy keying; and
- add adversarial semantic tests for unrelated evidence and repeated
  multi-instance evaluations. Existing tests validate happy-path shape but do
  not protect these truthfulness invariants.

No additional unsupported user concept, duplicated product surface, or
unjustified configuration choice was found.

## Planned / As Built Reconciliation

The implementation follows the planned architecture at a high level:
checked-in definitions project current results into a canonical detail,
metadata-only local history provides bounded context, and a small typed
lineage explains the selected result. Two identity contracts diverge from the
approved intent:

- lineage uses asset identity where the plan requires a qualified result
  relationship; and
- history uses rule-family identity where the plan requires selected-result
  identity.

These are behavioral contract defects rather than approved design changes.
The understanding record also lacks the required appended As Built account.

## Fresh Verification

All commands ran from `C:/Users/henry/sancussight` and exited `0`:

| Command | Result |
|---|---|
| `npm run test:feature009` | 20/20 passed |
| `npm run test:feature008` | 6/6 passed |
| `npm run test:collector` | 92/92 passed |
| `npm run test:registry-compiler` | 22/22 passed |
| `npm run verify:core` | passed |
| `npm run build` | passed; 1,835 modules transformed |
| `git diff --check` | passed; line-ending warnings only |

Two read-only Node diagnostics independently reproduced R1-SPEC-001 and
R1-SPEC-002 using the shipped TypeScript modules. They are review diagnostics,
not changes to the test suite.

Production was freshly reconciled:

- canonical alias: `https://sancussight.vercel.app`
- deployment: `dpl_96UapZ28MvQMrBmk63NyM8mZUN86`
- immutable URL:
  `https://sancussight-r55wc94sa-hflowers45-9370s-projects.vercel.app`
- project: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- target/state: `production` / `READY`, substate `PROMOTED`
- `prebuilt: true`, `aliasAssigned: true`, `aliasError: null`

Representative local and hosted captures inspected:

- `T4-browser/02-provider-result-desktop.png`
- `T4-browser/06-conflicting-lineage.png`
- `T5R2-hosted/02-uncataloged-conflict.png`
- `T5R2-hosted/03-narrow-zoom200.png`
- `T5R2-hosted/04-history-unavailable.png`

## Residual Risk and Next Review Boundary

The production deployment is healthy and exactly identified, but health does
not resolve the two semantic blockers. The browser fixtures are synthetic and
do not establish external data truth; that limitation is acceptable only when
the UI does not invent relationships.

After corrections, R2 must be bounded to these findings, their fixes, and
regressions caused by those fixes unless the tracking owner records a
comprehensive-reset trigger. The tracking owner must freshly verify and
reconcile evidence before changing any authority status.
