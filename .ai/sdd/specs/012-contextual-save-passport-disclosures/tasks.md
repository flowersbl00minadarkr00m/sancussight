# Feature 012 Implementation Tasks

> Requirements: `@requirements.md`
> Design: `@design.md`
> Status: Approved
> Approval: Operator standing blanket authorization, reconciled 2026-07-24
> Tracking owner: orchestrator task `019f914a-b672-77b1-837f-0c866b6421bb`
> Optional task microworld: declined

## Authority and Execution Rules

- The orchestrator alone writes this file, `.status`, `.ai/sdd/INDEX.md`,
  `.ai/sdd/handoff/sdd-brief.md`, and `understanding.md`.
- Every implementation, browser, deployment, or review ticket requires a
  newly created visible top-level Codex task with a stable lifecycle return.
- Workers acknowledge before mutation, stay within owned surfaces, preserve
  unrelated dirty work, and treat `ready-for-review` as a recommendation.
- Only the orchestrator may reconcile authoritative completion after fresh
  verification.
- Work is serial: `T1 -> T2 -> T3 -> T4 -> R1`.
- Spec 005/T16R5/T16/A-002 remains paused and outside every ticket.

## Requirement Coverage

| Requirement | Tasks | Notes |
|---|---|---|
| FR-001 | T1, T3, T4 | Compact global source truth remains visible locally and hosted |
| FR-002 | T1, T3, T4 | Selected Passport owns dirty/save/result strip |
| FR-003 | T1, T3, T4 | Existing confirmation/controller/conflict/recovery path only |
| FR-004 | T2, T3, T4 | Native six-section disclosures with required defaults |
| FR-005 | T1, T2, T3 | Selection, rerender, narrow focus, and Back behavior |
| FR-006 | T1–T4, R1 | Bounded integration and complete regression/review |
| NFR-001 | T1–T3 | Native semantics, text, live feedback, visible focus/marker |
| NFR-002 | T1–T4 | 320px/effective-200 wrapping and bounded overflow |
| NFR-003 | T1, T3, T4 | Source truth and verified-save feedback remain honest |
| NFR-004 | T1–T4 | No new dependency, schema, route, network, or duplicate DOM |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | Every FR/NFR maps above |
| Requirements are covered by design | Pass | Design mapping covers FR-001–006 and NFR-001–004 |
| Critical Questions are answered | Pass | Requirements decisions and design FAQ resolve ownership/defaults |
| Tasks have blockers, acceptance, files, and verification | Pass | T1–T4 and R1 are fully bounded |
| Verification commands are known | Pass | Feature suites, collector/compiler, core, build, browser, hosted |
| Frontier is non-empty and non-overlapping | Pass | T1 only |
| Independent challenge required | No | All tickets map to standard/high, below Sol High |

The installed `sdd-understanding` skill is unavailable. Readiness evidence is
preserved in `understanding.md` and this table.

## Implementation Slice

- **Goal:** Keep global source truth visible while moving deliberate write
  action/results into a compact, progressively disclosed selected Passport.
- **Tasks:** T1, T2
- **Independent validation:** focused Feature 012 tests plus T3 real-Chromium
  source-write, disclosure, focus, and responsive matrix.

## Frontier

| Task | Blocked By | Frontier Status |
|---|---|---|
| T1 | None | Complete |
| T2 | T1 | Complete |
| T3 | T1–T2 | Complete |
| T4 | T3 and usable existing-project Vercel authentication | Complete |
| R1 | T1–T4 | Complete — needs fixes |
| C1 | R1 | Complete |
| C2 | C1 | Complete |
| C3 | C2 and usable existing-project Vercel authentication | Complete |
| R2 | C1–C3 | Complete — needs fixes |
| C4 | R2 | Complete |
| C5 | C4 | Complete |
| C6 | C5 and usable existing-project Vercel authentication | Complete |
| R3 | C4–C6 | Complete — approved within scope |

## T1 — Contextual source-write strip and compact global truth

> Status: complete
> Priority: P0
> Estimate: 2–4 hours
> Blocked By: none
> Covers: FR-001, FR-002, FR-003, FR-005, FR-006, NFR-001, NFR-003, NFR-004
> Delivers: one honest App-owned save-feedback channel, one contextual
> selected-Passport write strip, and no competing Header save action
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: consequential write-state UI integration with bounded existing
> controller semantics
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Freshness: checkpoint and roll over before approximately 250k cumulative
> tokens or earlier on compaction, ownership change, or context uncertainty
> Sole authorized worker: `019f9525-2ada-7892-b61d-0a0ffc24e510`
> Acknowledgment: `sancussight-012-T1-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-T1-ready-20260724-01` reconciled
> Owner verification: `test:feature012` 4/4, production build, scoped
> whitespace, and owned-diff inspection passed fresh on 2026-07-24

### Work

- Add `SourceWriteStrip` with derived source truth and bounded live feedback.
- Separate deliberate-write feedback from general workspace notices in App.
- Preserve `handleSaveSource` confirmation and `sourceController.save` as the
  only write path.
- Clear stale success feedback on a new dirty mutation.
- Remove the competing Header save action while preserving compact always-
  visible source name, sync/freshness, and read/write permission truth.
- Wire the selected Passport to the strip without changing catalog selection
  semantics.
- Add focused static/component tests and an additive `test:feature012` script
  only if required; no dependency change.

### Acceptance Criteria

- File-backed dirty selected Passport shows exactly one `Unsaved changes` /
  `Save to source` strip; Header exposes no competing save action.
- Pending, success, cancellation, permission, conflict, and failure feedback
  is textual, honest, and cannot override session truth.
- Demo/snapshot has no canonical-write action.
- Existing confirmation, preflight conflict prevention, permission, verified
  save, last-valid recovery, and working-cache behavior remain unchanged.
- No selected asset still leaves compact global Unsaved truth visible.
- No new source state machine, persistence, network, route, or dependency.

### Owned Surfaces

- `src/App.tsx`
- `src/components/Header.tsx`
- `src/components/SourceStatus.tsx`
- new `src/components/SourceWriteStrip.tsx`
- `src/components/Registry.tsx` only for T1 props/render integration
- Feature 012 save/status selectors in `src/index.css`
- focused non-overlapping Feature 012 save-strip tests
- `package.json` only for additive `test:feature012`; `package-lock.json` only
  if npm changes it solely for that script and no dependency
- `execution/T1.md` and `execution/T1-handoff.md`

### Verification

```text
npm run test:feature012
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## T2 — Native Asset Passport disclosures

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T1
> Covers: FR-004, FR-005, FR-006, NFR-001, NFR-002, NFR-004
> Delivers: one six-section Passport DOM using native disclosures with Summary
> open and five named secondary sections closed on each newly selected asset
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: accessibility-sensitive structural UI change with existing
> Feature 008–010 content preservation
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Freshness: same rollover policy as T1
> Sole authorized worker: `019f9530-5618-78e2-a84a-1410bcb47d45`
> Acknowledgment: `sancussight-012-T2-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-T2-ready-20260724-01` reconciled
> Owner verification: `test:feature012` 7/7, production build, scoped
> whitespace, disclosure inventory, defaults, keys, and owned-diff inspection
> passed fresh on 2026-07-24

### Work

- Convert the six existing Passport section wrappers to native
  `<details>/<summary>`.
- Keep Summary initially open; default Portability, Dependencies, Evidence,
  Decisions, and History closed.
- Use stable asset-qualified keys so a new selection resets defaults while
  unrelated rerenders and save feedback preserve user-open state.
- Preserve every existing content owner, including bindings in Evidence and
  versions/aliases/packet/history controls in History.
- Add visible native/CSS chevrons, focus treatment, wrapping, and bounded
  internal overflow without duplicate responsive DOM.
- Add focused structure/default/content-preservation tests.

### Acceptance Criteria

- Exactly six section identities exist once in one Passport DOM.
- Native keyboard and assistive-technology semantics remain intact.
- Summary starts open; the five named secondary sections start closed.
- User-open state survives save feedback and unrelated rerenders.
- Changing asset selection resets the approved defaults.
- Content, callbacks, selected-row association, narrow Back focus, routes, and
  footer remain unchanged.

### Owned Surfaces

- `src/components/Registry.tsx`
- `src/components/AssetVersionHistory.tsx` only if needed to preserve History
  content ownership; no behavior rewrite
- Feature 012 disclosure selectors in `src/index.css`
- focused non-overlapping Feature 012 disclosure tests
- `execution/T2.md` and `execution/T2-handoff.md`

### Verification

Use the T1 verification sequence plus the focused T2 tests and scoped
whitespace checks.

## T3 — Integrated local installed-Chrome acceptance

> Status: complete
> Priority: P0
> Estimate: 2–4 hours
> Blocked By: T1–T2
> Covers: FR-001–006, NFR-001–004
> Delivers: actual-browser evidence and only contract-preserving corrections
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: write confirmation/recovery, native disclosure, focus, and
> responsive behavior require browser proof
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Freshness: same rollover policy as T1
> Sole authorized worker: `019f9539-7370-7660-90bc-a888c1244a29`
> Acknowledgment: `sancussight-012-T3-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-T3-ready-20260724-01` reconciled
> Owner verification: browser matrix 11/11 inspected; Feature 012 7/7 and
> production build rerun fresh; evidence scope and teardown reconciled on
> 2026-07-24

### Work and Acceptance

- Use a fresh local production build and installed Google Chrome.
- Exercise current -> mutation -> unsaved -> cancel -> confirm -> saved and
  bounded failed/permission/conflict recovery with disposable local fixtures.
- Prove Header truth, contextual strip ownership, verified result honesty, and
  no competing save action.
- Prove all six disclosures, native keyboard operation, required defaults,
  rerender stability, asset-selection reset, content completeness, row/detail
  association, narrow focus entry, and Back restoration.
- Prove 320 CSS px and effective 200%, zero page overflow, one Passport DOM,
  bounded internal overflow, clean console/page errors, and same-origin-only
  traffic.
- Corrections are permitted only within completed T1–T2 product/test surfaces
  after a genuine approved criterion failure.

### Owned Surfaces

- bounded T1–T2 product/test corrections only on verified failure
- `execution/T3.md`, `execution/T3-handoff.md`,
  `execution/T3-browser-report.md`, and `execution/T3-browser/`

### Final Verification Order

```text
npm run test:feature012
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

## T4 — Exact reviewed production deployment and hosted acceptance

> Status: complete
> Priority: P0
> Estimate: 2–3 hours
> Blocked By: T3 and usable existing-project Vercel authentication
> Covers: FR-001–006, NFR-001–004
> Delivers: exact T3-reviewed artifact on the existing canonical production
> project with hosted write/disclosure regression evidence
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: exact-artifact deployment and hosted browser verification
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Freshness: same rollover policy as T1
> Sole authorized worker: `019f9552-4507-7e71-adde-65f92ce3c226`
> Acknowledgment: `sancussight-012-T4-acknowledged-20260724-01` delivered
> Duplicate reconciliation: tasks
> `019f9551-403b-7fb3-a9a8-2fbd9c40cd7c` and
> `019f9551-61e3-7951-9d79-2b1ea6dd66d4` stopped before file, build,
> deployment, or T4-evidence mutation
> Ready event: `sancussight-012-T4-ready-20260724-01` reconciled
> Owner verification: Feature 012 7/7 passed fresh; canonical and immutable
> inspections resolve deployment `dpl_8ULGGMT146hkWa1FZM48Vtwr6D2H` as
> production READY with canonical alias; hosted report/static/browser evidence
> inspected on 2026-07-24

Deploy only the exact T3-reviewed prebuilt artifact to the existing canonical
SancusSight Vercel project. Require source/lock/static continuity, exact
project/team identity, production `READY`, canonical alias without error,
hosted static bytes, the safe hosted interaction subset, responsive/focus/
disclosure behavior, footer/routes, console/network/runtime checks, and no
product/package/lock/shared-tracking correction.

### Owned Surfaces

- Vercel prebuilt output and exact existing-project production deployment
- `execution/T4.md`, `execution/T4-handoff.md`,
  `execution/T4-hosted-report.md`, and `execution/T4-hosted/`

## R1 — Independent comprehensive Feature 012 review

> Status: complete — needs fixes
> Priority: P0
> Estimate: 2–4 hours
> Blocked By: T1–T4
> Covers: all approved Feature 012 requirements, design, tasks, implementation,
> local/hosted evidence, and predecessor-contract preservation
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: independent two-axis review of consequential write UX and
> accessibility behavior
> High-tier second opinion: not required
> Session policy: new-top-level-required

Review full approved Feature 012 scope on separate Spec and Standards/code-
quality axes. Own only `review-r1.md`, `execution/R1.md`, and
`execution/R1-handoff.md`. Do not implement fixes.

Sole authorized reviewer task
`019f9560-2d27-7d62-b743-48a86952af0b` acknowledged before review execution
under stable event `sancussight-012-R1-acknowledged-20260724-01`. Duplicate
reviewer `019f955f-b7ed-7c03-b480-59a012074795` stopped before acknowledgment,
verification, deployment inspection, or evidence mutation.

Ready event `sancussight-012-R1-findings-20260724-01` was reconciled by the
tracking owner after fresh Feature 012 tests and owned-evidence inspection.
Spec alignment passed. Standards remains open only for
`R1-STANDARDS-001` and `R1-STANDARDS-002`.

## C1 — Explicit build-input boundary and typed pending state

> Status: complete
> Priority: P0
> Estimate: 2–4 hours
> Blocked By: R1
> Covers: R1-STANDARDS-001, R1-STANDARDS-002 and direct regressions
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: bounded build determinism and maintainability correction
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Sole authorized worker: `019f9576-8b77-7363-bbb7-28a5fb6a9b8b`
> Acknowledgment: `sancussight-012-C1-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C1-ready-20260724-01` reconciled
> Owner verification: Feature 012 9/9, deterministic/adversarial build-input
> verification, production build, scoped whitespace, owned diff, and worker
> evidence passed fresh on 2026-07-24

### Work and Acceptance

- Replace repository-wide automatic Tailwind candidate discovery with an
  explicit application source boundary that includes all intended UI inputs
  and excludes generated evidence/output trees.
- Add a durable, deterministic build-input continuity check that enumerates
  every source/config input which can affect the production bundle.
- Prove two clean builds are byte-identical and remain identical after adding
  a hostile Tailwind candidate outside the declared application boundary.
- Replace `SourceWriteStrip`'s user-visible message-prefix inference with an
  explicit typed supplementary operation phase owned by `App`.
- Preserve `RegistrySession` and `ConnectionState` as durable truth, the sole
  controller save path, all visible copy, and all Feature 012 behavior.

### Owned Surfaces

- `src/index.css`
- `vite.config.ts` only if the explicit Tailwind boundary requires it
- `src/App.tsx`
- `src/components/SourceWriteStrip.tsx`
- `src/types.ts` only for the bounded supplementary feedback phase
- a new deterministic Feature 012 build-input verification script under
  `scripts/`
- focused Feature 012 tests for both findings
- `package.json` only for an additive verification command; no dependency
- `execution/C1.md` and `execution/C1-handoff.md`

### Verification

Run the T3 final verification order, the new two-build/adversarial continuity
check, and scoped whitespace verification.

## C2 — Findings-limited local installed-Chrome regression

> Status: complete
> Priority: P0
> Estimate: 1–3 hours
> Blocked By: C1
> Covers: R1-STANDARDS-001, R1-STANDARDS-002 and fix-caused regressions
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized worker: `019f9582-dff9-7432-9296-7e88a4ed3d7e`
> Acknowledgment: `sancussight-012-C2-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C2-ready-20260724-01` reconciled
> Owner verification: Feature 012 9/9, build-input continuity, 12/12
> installed-Chrome evidence, teardown, and evidence hygiene passed fresh on
> 2026-07-24; no product/test correction was retained

Use installed Google Chrome against a fresh corrected production build.
Reprove typed pending presentation across confirm/cancel/success/failure,
disclosure behavior, connected-file safety, narrow/effective-200 layout,
console/network cleanliness, the adversarial outside-boundary build candidate,
and two-build byte equality. Permit corrections only within C1-owned
product/test surfaces after a genuine approved failure. Own only
`execution/C2.md`, `execution/C2-handoff.md`, `execution/C2-browser-report.md`,
and `execution/C2-browser/` otherwise.

## C3 — Corrected exact-artifact deployment and hosted regression

> Status: complete
> Priority: P0
> Estimate: 1–3 hours
> Blocked By: C2 and usable existing-project Vercel authentication
> Covers: R1-STANDARDS-001, R1-STANDARDS-002 and fix-caused regressions
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized worker: `019f958f-6948-7461-9fd8-609bd90d73e8`
> Acknowledgment: `sancussight-012-C3-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C3-ready-20260724-01` reconciled
> Owner verification: Feature 012 9/9 passed fresh; deployment
> `dpl_FEPZQPnJBA54eB26VNyWPTSzxDQn` independently resolves production READY
> with the canonical alias; exact source/lock/static, hosted-browser, runtime,
> and teardown evidence was inspected on 2026-07-24

Deploy only the exact C2-reviewed corrected prebuilt artifact to the existing
canonical SancusSight production project. Require the corrected complete
build-input manifest, lock/static continuity, exact identity, `READY`,
canonical alias, hosted byte equality, safe hosted browser checks, and scoped
runtime errors. No product/package/shared-tracking correction is permitted.
Own only Vercel prebuilt/deployment output and `execution/C3*` evidence.

## R2 — Findings-limited follow-up review

> Status: complete — needs fixes
> Priority: P0
> Estimate: 1–3 hours
> Blocked By: C1–C3
> Covers: R1-STANDARDS-001, R1-STANDARDS-002 and fix-caused regressions only
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized reviewer: `019f959e-b4ab-75e0-828b-f7ef8cf62733`
> Acknowledgment: `sancussight-012-R2-acknowledged-20260724-01` delivered
> Findings event: `sancussight-012-R2-findings-20260724-01` reconciled
> Disposition: `R1-STANDARDS-002` resolved; `R1-STANDARDS-001` remains
> blocking only for project-local Vite-config dependency closure

Independently review only the two R1 findings, their corrections, and direct
fix-caused regressions on separate Spec and Standards axes. Own only
`review-r2.md`, `execution/R2.md`, and `execution/R2-handoff.md`; do not fix.

## C4 — Build-config dependency closure

> Status: complete
> Priority: P0
> Estimate: 1–3 hours
> Blocked By: R2
> Covers: unresolved `R1-STANDARDS-001` only
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Rationale: bounded fail-closed continuity correction
> High-tier second opinion: not required
> Session policy: new-top-level-required
> Sole authorized worker: `019f95a9-02d1-7fa0-9849-d3f702d8040a`
> Acknowledgment: `sancussight-012-C4-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C4-ready-20260724-01` reconciled
> Owner verification: Feature 012 10/10, direct/transitive config-helper
> closure inspection, declared-input hashing, deterministic/adversarial
> verifier, worker evidence, and scoped whitespace passed fresh on 2026-07-24

Extend the existing Feature 012 verifier so its declared input contract closes
over project-local dependencies loaded while Vite evaluates build
configuration, before build plugins can observe modules. A project-local
helper imported by `vite.config.ts` must either be declared and hashed or
cause verification to fail closed. Preserve the existing root/`src`/`public`
missing/extra checks, observed application-module closure, byte-identical
clean builds, hostile outside-boundary `.resize` immunity, and all product
behavior.

Owned surfaces:

- `scripts/verify-feature012-build-inputs.ts`
- `src/lib/__tests__/feature012-build-input-boundary.test.mjs`
- one additional focused Feature 012 verifier test only if required
- `package.json` only if an additive verifier test command is required
- `execution/C4.md` and `execution/C4-handoff.md`

No product/UI/runtime behavior, package-lock, deployment, shared tracking,
Feature 013+, providers/Pi, or Spec 005/T16R5/T16/A-002 change is permitted.

## C5 — Config-closure local regression

> Status: complete
> Priority: P0
> Estimate: 1–2 hours
> Blocked By: C4
> Covers: unresolved `R1-STANDARDS-001` and C4-caused regressions only
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized worker: `019f95b3-2f29-74f1-9228-70183bddf999`
> Acknowledgment: `sancussight-012-C5-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C5-ready-20260724-01` reconciled
> Owner verification: isolated direct/transitive config-helper closure and
> digest sensitivity, Feature 012 10/10, 12/12 installed-Chrome continuity,
> unchanged implementation hashes, and cleanup passed fresh on 2026-07-24

Independently reprove in isolated scratch copies that missing/extra enumerated
inputs and undeclared project-local Vite-config helpers fail closed, while a
declared config helper is included in the exact manifest. Reprove clean and
hostile-candidate byte equality, the complete ordered local gate, and
practical installed-Chrome continuity. Permit corrections only within
C4-owned implementation/test surfaces after a genuine approved failure.
Otherwise own only `execution/C5.md`, `execution/C5-handoff.md`,
`execution/C5-browser-report.md`, and `execution/C5-browser/`.

## C6 — Config-closure corrected deployment

> Status: complete
> Priority: P0
> Estimate: 1–3 hours
> Blocked By: C5 and usable existing-project Vercel authentication
> Covers: unresolved `R1-STANDARDS-001` and C4-caused regressions only
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized worker: `019f95be-3460-76e2-bf8b-ff3f0c83894f`
> Acknowledgment: `sancussight-012-C6-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-C6-ready-20260724-01` reconciled
> Owner verification: Feature 012 10/10 passed fresh; deployment
> `dpl_6csbgTQqFq4M7os7phnULkFe7tiQ` independently resolves canonical
> production READY; config digest, lock/static continuity, hosted Chrome,
> runtime, and teardown evidence passed on 2026-07-24

Deploy only the exact C5-reviewed corrected prebuilt artifact to the existing
canonical SancusSight project. Require complete config dependency closure,
source/lock/static continuity, exact production identity, `READY`, canonical
alias, hosted byte equality, practical hosted Chrome continuity, and scoped
runtime errors. No product/package/shared-tracking correction is permitted.
Own only Vercel prebuilt/deployment output and `execution/C6*` evidence.

## R3 — Single-finding follow-up review

> Status: complete
> Priority: P0
> Estimate: 1–2 hours
> Blocked By: C4–C6
> Covers: unresolved `R1-STANDARDS-001`, its fix, and direct regressions only
> Tracking owner: orchestrator
> Model class / effort: standard / high
> Session policy: new-top-level-required
> Sole authorized reviewer: `019f95ca-5cd8-7311-b268-d22bf541b161`
> Acknowledgment: `sancussight-012-R3-acknowledged-20260724-01` delivered
> Ready event: `sancussight-012-R3-ready-20260724-01` reconciled
> Owner verification: the isolated direct/transitive config-closure probe,
> Feature 012 10/10, the 92-input deterministic/adversarial verifier, scoped
> whitespace, and exact canonical deployment inspection passed fresh.
> Verdict: approved within R3 scope; `R1-STANDARDS-001` resolved while R1's
> green Spec verdict and R2's resolved `R1-STANDARDS-002` remain preserved.

Independently review only project-local Vite-config dependency closure, the
C4 fix, C5/C6 evidence, and direct fix-caused regressions. Preserve R1's green
Spec verdict and R2's resolved `R1-STANDARDS-002`. Own only `review-r3.md`,
`execution/R3.md`, and `execution/R3-handoff.md`; do not fix.

## Task Microworld Offer

```yaml
visualization_offer:
  stage: tasks
  source_revision: feature012-tasks-20260724-01
  recommended: yes
  recommendation_reason: The serial route crosses source-write, Passport structure, browser safety, hosted deployment, and independent review.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  output_path:
  screenshot_paths: []
  ui_image_offer: not-applicable
  ui_mockup_paths: []
  decision_source: source orchestration direction applying the operator's standing blanket authorization and declining the task microworld
```
