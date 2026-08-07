# SancusSight Product Enhancement and Release-Recovery Handoff

> Artifact role: Control-plane handoff for a future visible top-level orchestrator session  
> Authority: This document does not approve requirements, design, tasks, implementation, or a new release run  
> Prepared: 2026-07-23  
> Canonical project: `C:/Users/henry/sancussight`

## 0. Superseding live update

The operator explicitly approved pausing the current Spec 005 remediation
frontier so a new visible orchestrator can progress the product-enhancement
roadmap.

Fresh state at this update:

- Spec 005 remains `implementation:in-progress`.
- T16R3 and T16R4 are complete after fresh scoped review.
- T16R5 is held after challenge
  `spec005-a005-t16r5-readiness-challenge-20260723-root-02`.
- The bounded T16R5 task correction is proposed but not approved.
- T16/A-002 remains incomplete, blocked, and unauthorized.
- No provider, release token/run, current-release mutation, or release
  Playwright action is authorized.

This section supersedes older progress snapshots below. Preserve the historical
failure narrative as traceability, not as the enhancement orchestrator's active
frontier.

Direct UI evidence supplied by the operator:

- `C:/Users/henry/AppData/Local/Temp/codex-clipboard-30f49f22-be29-4b5f-bcab-7e0cd6b746e8.png`
- `C:/Users/henry/AppData/Local/Temp/codex-clipboard-209ba8ca-f3f4-49be-be41-632eb9d1e8b4.png`

The screenshots show that the selected asset inspector appears below the
catalog table on desktop, making its relationship to the selected row unclear.
They also show stale hosted footer copy with personal attribution. These are
explicit Feature 008 product decisions:

1. Desktop Assets uses a master-detail split: searchable/filterable catalog
   table on the left and the selected Asset Passport/inspector on the right.
   Selection remains visibly associated and switching rows updates the
   inspector in place without requiring a scroll below the table.
2. Narrow screens use an intentional fallback such as a detail route, drawer,
   or stacked inspector with an obvious selected-state transition, keyboard
   and focus handling, and a clear return to the catalog.
3. The hosted footer contains only a clickable canonical product URL,
   `https://sancussight.vercel.app`. Remove the personal name and verbose
   personal-brand attribution.
4. Verify the deployed Vercel artifact, not only local development, because
   the screenshots and current local source contain different footer copy.

## 1. Mission

Improve SancusSight by selectively adapting proven permissively licensed
open-source product patterns while preserving its distinctive local-first,
deterministic, evidence-qualified portability model.

Run two explicitly separated workstreams:

1. Reconcile and recover the existing Spec 005 release-critical implementation.
2. Plan, approve, and implement the new product-design enhancements through
   their own SDD gates.

Do not use the enhancement request to bypass or silently change Spec 005.
Do not use the current release blocker to collapse the enhancement roadmap into
an unbounded remediation ticket.

## 2. Product Promise

SancusSight should help an AI power user answer:

> Which parts of my AI setup remain portable, controlled, and independently
> usable; what evidence supports that conclusion; and what should I fix next?

The intended primary operating loop is:

```text
Asset Passport -> Exit Drill -> Evidence Chain -> Next Action
```

## 3. Current Authority Snapshot

Resolve the canonical project again before acting. At handoff preparation time:

- Spec: `.ai/sdd/specs/005-operational-evidence-producers/`
- `.status`: `implementation:in-progress`
- T15: complete and reconciled
- T16R: complete and reconciled
- T16: incomplete, latest lifecycle state `verification-failed`
- Release state: **Not ready for release**
- Another A-002 attempt is prohibited without explicit operator direction

Authoritative sources:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `.ai/sdd/specs/005-operational-evidence-producers/design.md`
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`

Supporting evidence:

- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R-handoff.md`
- `artifacts/qa/spec005/a002-t16-spec005-a002-t16-20260723064030-verification-failed.md`

The repository contains a large existing uncommitted implementation. Treat all
unrelated changes as user-owned. Resolve overlap against exact ticket-owned
surfaces before authorizing any worker.

## 4. Current Release Blocker

Fresh run `spec005-a002-t16-20260723064030` passed:

- noninteractive preflight;
- bounded Codex, Claude, and Pi access canaries;
- shared runtime target setup;
- three-runtime metadata-only evidence capture; and
- the mandatory failure/recovery matrix, `15/15`.

It then failed closed at the first Praxen target:

```text
producer: praxen
target: sancussight
stage: staging-validation
reason: Step 9.9 draft missing the exact parser-grade
        "# Praxen draft manifest" header
```

The wrapper correctly wrote a partial result, stopped before `sdd-exec`, and
did not create or promote a release manifest or bundle.

## 5. Release-Recovery Design Question

Investigate whether the exact parser-grade header and run metadata should be
owned by the deterministic runner rather than generated verbatim by the model.

Potential shape to assess:

```text
Model
  -> writes bounded semantic Markdown body only

Runner
  -> creates exact staging envelope/header
  -> binds run, target, remit, versions, timestamp, and body hash

Pinned converter
  -> creates canonical findings JSON

Pinned renderer
  -> creates HTML/TXT

SancusSight adapter
  -> validates runner binding and canonical sibling
```

This follows the project principle that deterministic code owns identity,
validation, state transitions, and evidence assembly while AI handles semantic
interpretation. It also resembles the separation of subject, predicate,
producer, and envelope used by in-toto attestations.

This is a proposal, not authorization. The orchestrator must:

1. Compare it against approved Spec 005 requirements, A-003 design, and T16R/T16.
2. Produce a steering impact analysis containing:
   `affected_requirements`, `affected_design_decisions`, `affected_tasks`,
   `completed_work_at_risk`, `expected_rework`, `required_gate`,
   `recommendation`, and `authorization`.
3. Use `required_gate: design` or earlier if the ownership of the staging
   contract changes.
4. Ask for explicit user approval before changing an approved artifact.
5. Prohibit another T16 attempt until the contract question is resolved and the
   operator explicitly authorizes a run.

If inspection proves the missing header was a one-off producer failure and the
approved design intentionally requires model ownership, recommend a bounded
retry instead of changing the contract. Preserve the evidence for both options.

## 6. Product Enhancements Requested by the User

The user wants all of the following enhancements, subject to normal SDD gates.
External inspiration is rationale, not proof or authority.

### A. First value and Asset Passport

Inspiration: Backstage Software Catalog, Apache-2.0.

- Make a searchable, filterable AI asset catalog.
- Filter by owner, kind, lifecycle, portability state, provider, and evidence
  freshness.
- Introduce one canonical Asset Passport.
- Consolidate summary, portability, dependencies, evidence, decisions, and
  history around the asset.
- Integrate `Build my registry` into onboarding using the existing local
  registry compiler.
- Keep sample, existing-file, and compiler-created registry paths visibly
  distinct.
- Keep the desktop catalog and selected Asset Passport side by side in a stable
  master-detail layout.
- Preserve selected-row emphasis and update the inspector in place during fast
  row switching.
- Define a deliberate accessible narrow-screen detail transition rather than
  allowing the inspector to become an easy-to-miss block below a long table.
- Replace the hosted footer with only the canonical product URL and no personal
  attribution.

Proposed primary Asset Passport sections:

```text
Summary | Portability | Dependencies | Evidence | Decisions | History
```

### B. Claim-level evidence lineage

Inspiration: OpenLineage and GUAC, Apache-2.0.

- Show a bounded typed path behind a selected claim.
- Represent claim, evidence, producer, run, target, contract, and decision as
  distinct nodes or steps.
- Expose missing, inferred, stale, conflicting, and verified edges.
- Default to the shortest relevant path, not a global graph canvas.
- Make “Why do we believe this?” and “What would invalidate it?” answerable.

### C. Check Catalog and remediation explanations

Inspiration: OpenSSF Scorecard, Apache-2.0.

- Give each deterministic check a stable definition and detail view.
- Show question, importance, exact rule, evidence inspected, current result,
  previous result, missing evidence, and remediation.
- Add a direct “What would make this pass?” explanation.
- Preserve SancusSight’s no-opaque-score position.

### D. Asset versions, aliases, and comparison

Inspiration: MLflow, Apache-2.0.

- Add asset version history and current-versus-previous comparison.
- Support flexible aliases such as `preferred`, `fallback`, `testing`, and
  `deprecated`.
- Link versions to source artifacts and verification runs.
- Explain portability regressions and recoveries over time.
- Avoid rigid environment stages unless a later approved requirement needs
  them.

### E. Portable Evidence Packets

Inspiration: in-toto Attestation Framework, Apache-2.0.

- Export a versioned Evidence Packet for an asset or exit-drill result.
- Separate subject, claim/predicate, producer, run, qualification, verification,
  and human decision.
- Preserve local-first privacy and existing sanitization boundaries.
- Treat signing and external verification as a later decision unless required
  for the first useful packet.

### F. Evidence inspector and comparison UX

Inspiration: Langfuse MIT-licensed core, excluding `ee` folders.

- Reuse list/tree plus inspector interaction patterns.
- Add bounded evidence hierarchy, fast detail switching, and compare views.
- Consider shareable or saved filters only if they remain compatible with the
  local-first architecture.
- Do not copy prompt/response capture, LLM-judge scoring, cost analytics, or the
  full observability model.

### G. Navigation and hierarchy

Proposed primary navigation:

```text
Home | Assets | Exit Drills | Attention
```

Proposed secondary/advanced navigation:

```text
Evidence Sources | Governance | Release Proofs | Activity | Definitions
```

The Home view should answer:

1. What can move?
2. What will break?
3. What evidence is stale?
4. What should I fix first?

Do not introduce an aggregate trust score.

## 7. Suggested Feature Decomposition

Compute the next feature ID from the actual filesystem. At preparation time,
`008` was expected, but do not trust this document over the current directory.

Recommended decomposition:

### Feature 008: First Value and Asset Passport

- onboarding route for sample, existing registry, and compiler;
- catalog search/filter/grouping;
- canonical Asset Passport;
- desktop catalog-plus-passport master-detail layout and responsive fallback;
- selected-row/inspector association, focus, and keyboard behavior;
- hosted footer reduced to the canonical URL with no personal name;
- primary navigation simplification;
- links from Attention and Exit Drills into the relevant asset state.

### Feature 009: Claim Lineage and Check Catalog

- bounded evidence-chain inspector;
- stable check definitions;
- result history and remediation explanations;
- clear fact, deterministic finding, human decision, and missing-evidence
  labels.

### Feature 010: Asset Versioning and Evidence Packets

- versions, aliases, comparisons, regressions, and recoveries;
- packet schema and sanitized export;
- compatibility and migration for existing schema-version-2 registries.

### Feature 011: Standards Interoperability

- optional OpenLineage import;
- OpenTelemetry/OpenInference metadata alignment;
- optional in-toto-compatible envelope or predicate;
- policy preview research only, with no enforcement.

This decomposition is a recommendation. Use `sdd-plan` or a fog map if current
constraints make the dependencies uncertain. Do not create all specs at once
unless the plan makes their boundaries clear.

## 8. Priority and Boundaries

### Now

- Preserve the paused Spec 005/T16R5 state and keep the product Not ready for
  release.
- Refresh stale authority/control-plane summaries when reconciliation permits.
- Draft the enhancement roadmap and first feature requirements.
- Put the desktop master-detail and footer privacy corrections in Feature 008's
  first requirements draft.
- Bring the public project/demo up to the current product only through an
  approved release/deployment path.

### Next

- Asset Passport and catalog.
- Claim lineage.
- Check Catalog.
- Version history and comparison.
- Evidence Packet export.

### Later

- OpenLineage adapter.
- OpenTelemetry/OpenInference alignment.
- Saved local views.
- Optional signed attestations.
- Offline policy preview.

### Avoid

- full Langfuse-style prompt or response observability;
- a DataHub-scale platform or plugin marketplace;
- default global graph visualization;
- AI-generated trust scores;
- automatic migration or upstream enforcement;
- hosted accounts, teams, or enterprise permissions without observed demand;
- another evidence producer before existing evidence is easier to understand.

## 9. Orchestration Contract

- Use the current `.status` and approved task blockers as authority.
- The orchestrator is the sole writer to `tasks.md`, `.status`,
  `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`.
- Never implement inside the orchestrator session.
- Never use subagents or hidden nested workers.
- Every implementation ticket and rollover requires a newly created visible
  top-level session.
- Require a durable acknowledgment before editing.
- Record exact owned surfaces and serialize writable overlap.
- Require structured `blocked`, `contract-conflict`, `verification-failed`, and
  `ready-for-review` returns with stable event IDs.
- Reconcile every changed file and every exact verification command, exit code,
  output summary, and verdict before recording completion.
- Obtain and reconcile an independent fresh visible challenge before any Sol
  High-or-stronger dispatch.
- Roll over early after compaction, uncertain context, missing telemetry,
  ownership change, or before cumulative usage approaches approximately 250k
  tokens.

## 10. Required First Orchestrator Output

Before mutation or dispatch, return:

1. A fresh SDD status dashboard for Spec 005 and the proposed enhancement track.
2. A reconciliation of T16’s latest failure against authority.
3. The staging-header ownership impact analysis.
4. A recommendation: bounded retry, reopen design/tasks, or another explicitly
   justified route.
5. The proposed feature plan/decomposition and its first approval question.
6. A dirty-worktree overlap assessment.
7. A capability snapshot for visible session creation, messaging, receipts,
   usage telemetry, and durable fallback.

Stop for explicit user approval at every required SDD gate and before any new
A-002 operational run.

## 11. Success Conditions

The work is successful when:

- current release blockers are resolved without weakening provenance, privacy,
  or fail-closed behavior;
- the public project demonstrates the actual current product;
- a new user can obtain first value without hand-authoring registry JSON;
- assets are searchable and understandable through one canonical passport;
- desktop users can inspect a selected asset beside the catalog without
  hunting below the table, with an intentional accessible mobile fallback;
- the hosted footer shows only `https://sancussight.vercel.app` and no
  personal attribution;
- every portability claim exposes a bounded evidence chain;
- every failure explains what evidence or action would change it;
- changes over time are visible through versions and comparisons;
- evidence can be exported in a portable, versioned, sanitized packet; and
- advanced release/governance machinery remains available without dominating
  the primary user workflow.

## 12. External License Boundary

Approved inspiration pool:

- Backstage: Apache-2.0
- OpenLineage: Apache-2.0
- GUAC: Apache-2.0
- OpenSSF Scorecard: Apache-2.0
- MLflow: Apache-2.0
- in-toto Attestation Framework: Apache-2.0
- OpenTelemetry/OpenInference: Apache-2.0
- Langfuse core: MIT, excluding `ee` folders

Before copying source rather than adapting a pattern:

- record the exact upstream repository, revision, and path;
- preserve required copyright, license, and NOTICE material;
- verify mixed-license folder boundaries;
- avoid upstream branding or endorsement implications; and
- prefer a small native implementation when importing a platform dependency
  would expand SancusSight’s runtime, privacy, or maintenance burden.
