# Tasks: Operational Evidence Producers

> Requirements: @requirements.md
> Design: @design.md
> Status: Approved through amendment A-005 remediation tasks T16R3-T16R7 on 2026-07-23

## Implementation Slices

1. **Qualification foundation:** represent operational provenance and calculate a truthful five-category release gate.
2. **Five-source ingestion:** qualify the three existing adapters and add privacy-safe RAMPART and AIMap adapters.
3. **Operator workflow:** provide fixed user-scoped lifecycle, sanitization, verification, and release-run commands outside the collector API.
4. **Runtime telemetry expansion:** add provider-neutral Codex, Claude, and Pi telemetry beside the existing Agent Beacon path without rewriting historical evidence.
5. **Operational proof:** install and exercise all five evidence categories against real approved targets, then complete failure/recovery and release evidence.
6. **Truthful run visibility:** publish bounded producer progress and show advisory status without changing readiness authority.
7. **A-002 run-bound completeness:** expand the release contract, migrate deterministic per-target selection, expose truthful target diagnostics, and prove the amended gate with a new operational run.
8. **A-003 deterministic producer boundary:** make the runner-authoritative Praxen conversion/render pipeline the only path to official evidence, with explicit partial-state and negative regression coverage.
9. **A-005 deterministic release orchestration:** replace handoff-only executable seams with checked-in controls, one immutable run identity, compatible Praxen operational output, atomic release promotion, and fixed producer/UI acceptance.

## Dependency Diagram

```text
T1
|-- T2 --\
|-- T3 ---+-- T5 --\
|-- T4 --/         |
|-- T6 ------------+-- T6A -- T7 --\
|                  |              |-- T10
|                  +------ T8 ----|
|                  +------ T9 ----/

A-002 amendment (all prior blockers complete):
T12 -- T13 -- T14 -- T15 -- T16R -- T16

A-005 remediation:
T16R3 -----------\
                  +-- T16R7 --\
T16R4 -- T16R5 --+-- T16R6 ---+-- T16
```

## Understanding and Visualization Offer

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: medium
  observability: opaque
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: A-002 changes manifest identity, time qualification, bundle selection, UI reduction, and live release evidence across several trust boundaries.
visualization_offer:
  stage: tasks
  source_revision: 2026-07-21-a002-tasks-draft-2
  recommended: yes
  recommendation_reason: A command-center view would make the sequential contract handoffs, blockers, owned files, and verification gates easier to inspect before implementation.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  ui_image_offer: not-applicable
  decision_source: User approved tasks and requested orchestration without requesting the optional microworld on 2026-07-21.
```

This record is `planned` authority-plane context sourced from approved design Section 19 and this task draft. The optional visualization is supporting evidence only; accepting or declining it does not approve these tasks.

### A-005 task-readiness understanding

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: medium
  observability: opaque
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: T16R3-T16R7 cross Windows process launch, immutable run identity, pinned producer compatibility, atomic filesystem promotion, and deterministic browser acceptance.
dominant_difficulty: dependency and ownership boundaries across five release-control seams
suggested_evidence:
  - dependency and frontier table
  - owned-surface comparison
  - per-task negative-path verification
conflicts: []
visualization_offer:
  stage: tasks
  source_revision: a005-t16r3-t16r7-2026-07-23-r1
  recommended: no
  recommendation_reason: The task plan is inspectable in Markdown and the operator previously declined HTML for this remediation sequence.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  ui_image_offer: not-applicable
  decision_source: Operator instruction that no HTML is required for this remediation sequence.
```

The `sdd-understanding` skill was not callable in this session, so the
readiness burden and conflict check above were recorded directly from the
approved requirements, A-005 design, predictive R2 findings, and current task
ownership map. This is supporting evidence only; `.status` and explicit task
approval retain gate authority.

## SancusSight Dev Orchestrator Workflow

The pinned visible top-level Codex thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` is the SancusSight development **Orchestrator** for all remaining Spec 005 work. This follows the established workflow and the user's direction to continue through visible handoff tasks.

### Control and authority

- `tracking_owner: orchestrator` for T13-T16 and the proposed T16R. Only Orchestrator may update `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, or the master project context.
- Every implementation ticket runs in a genuinely new visible top-level Chat. Subagents, nested workers, reused or relabeled chats, and implementation inside Orchestrator are prohibited.
- Each worker receives the exact registry-resolved project path, approved requirements/design/tasks/status, blockers, owned surfaces, acceptance criteria, verification commands, model/effort assignment, and no-subagent rule.
- Each worker may edit only its declared owned surfaces, append-preserve its execution record, and write its task handoff file. Any required edit outside those surfaces is a `contract-conflict` or ownership request returned to Orchestrator before mutation.
- A worker's `ready-for-review` report is a recommendation. Orchestrator inspects the scoped diff and handoff, reruns proportionate fresh verification, reconciles discrepancies, and only then updates authoritative tracking or opens the next frontier.

### Durable handoff and compressed context

- Worker execution records: `.ai/sdd/specs/005-operational-evidence-producers/execution/<task-id>.md`.
- Worker completion handoffs: `.ai/sdd/specs/005-operational-evidence-producers/execution/<task-id>-handoff.md`.
- Master compressed project context: `.ai/sdd/handoff/spec005-a002-master-context.md`, owned only by Orchestrator.
- Every handoff records worker Chat ID, model/effort, authority sources, changed files, blockers/conflicts, every exact verification command and exit code, output summary, acceptance assessment, and completion recommendation.
- After reconciliation, Orchestrator compresses the durable result into the master context: current gate/frontier, completed task summary, changed surfaces, verified commands, unresolved blockers/risks, session/model IDs, and the exact next dispatch. Verbose logs stay in per-task execution/handoff files.

### Dispatch cycle

1. Orchestrator confirms `.status`, the approved frontier, blockers, and non-overlapping ownership.
2. Orchestrator selects the task's recorded model and reasoning effort. A `pending` high-tier second opinion must be completed and reconciled in another fresh read-only top-level Chat before worker dispatch.
3. Orchestrator creates one new visible top-level worker Chat and records its ID before edits begin.
4. The worker acknowledges the contract, implements within owned surfaces, runs verification, appends its execution record, writes its handoff file, and reports `ready-for-review` or a fail-closed event back to Orchestrator.
5. Orchestrator performs scoped review and fresh verification. Failed evidence, authority conflict, or unexplained divergence keeps the task incomplete.
6. On pass, Orchestrator records completion, refreshes the master context and registry, and dispatches only the newly unblocked task. The cycle continues through T16 and final two-axis review/readiness.

## Requirement Coverage

| Requirement | Tasks | Coverage |
|---|---|---|
| FR-001 | T1, T2, T5 | Qualification is manifest-bound and visible separately from health. |
| FR-002 | T2, T6A, T7, T16R3, T16R4 | Existing Beacon contract plus fixed provider qualification and immutable runtime identity. |
| FR-003 | T2, T7, T16R5 | Praxen remit/target binding, compatible operational projection, and real governed assessments. |
| FR-004 | T2, T8, T16R7 | Fixed receipt verification plus bounded real allow/block exercise. |
| FR-005 | T1, T2, T3, T4 | Operational provenance and deterministic adapter records. |
| FR-006 | T1, T5, T6A, T7, T8, T9, T13, T16R4, T16R6, T16 | One immutable current-run boundary drives qualification, promotion, and fresh operational proof. |
| FR-007 | T6, T6A, T10 | Scripted telemetry/source, artifact, signature, execution, scope, restart, replay, rotation, and recovery cases. |
| FR-008 | T6, T6A, T7, T8, T9 | User-scoped lifecycle procedures and bounded Pi Bash delegation outside SancusSight. |
| FR-009 | T2, T3, T4, T6, T6A, T10, T16R3, T16R5, T16R6 | Metadata-only collection, bounded private canaries, path rejection, and bundle review. |
| FR-010 | T1, T5, T10, T15, T16R5, T16R6, T16R7, T16 | `Not ready for release` remains authoritative until every current-run target passes and promotion is atomic. |
| FR-011 | T6, T10, T14, T16R6, T16 | Sanitized exportable release evidence bundle with paired target proof and owned output paths. |
| FR-012 | T6, T10, T14, T16R3, T16R4, T16R7, T16 | Repeatable checked-in controls, immutable run descriptors, and fresh A-002 revalidation. |
| FR-013 | T3, T9 | RAMPART contract, approved suite, real run, and ingestion. |
| FR-014 | T4, T9 | Authorized completed AIMap export and ingestion. |
| FR-015 | T3, T4 | Versioned schemas, privacy rules, identities, freshness, and incompatibility behavior. |
| FR-016 | T1, T5, T6A, T10, T13, T16 | Conjunctive five-category, three-runtime, and complete-target gate. |
| FR-017 | T11 | Versioned metadata-only producer progress contract, fixed writer, read-only endpoint, and truthful determinate/indeterminate UI. |
| FR-018 | T12, T13 | T12 supplies the historical orchestration seam; T13 replaces its split timing with the approved shared 30-minute run/evidence boundary. |
| FR-019 | T13, T14, T16R4, T16R6, T16 | Authentic producer timestamps, exact descriptor binding, shared 30-minute qualification, deterministic bundle construction, and fresh proof. |
| FR-020 | T13, T14, T15, T16R5, T16R6, T16 | Paired target/remit contracts, compatible operational projection, independent selection, target diagnostics, and complete proof. |
| A-003 remediation contract | T16R, T16 | Runner-only canonical conversion/rendering, exact binding/version validation, partial-state pause, and negative-path regression coverage. |
| A-004 runner-owned draft structure | T16R2, T16 | Version-pinned skeleton/profile ownership, pre-converter structural rejection, unchanged pinned conversion/rendering, and a fresh post-remediation release proof. |
| A-005 deterministic release orchestration | T16R3, T16R4, T16R5, T16R6, T16R7, T16 | Checked-in executable controls, immutable identity, compatible producer output, atomic promotion, and fixed acceptance. |
| NFR-001 | T2, T3, T4, T6, T6A, T8, T9, T16R3, T16R7 | Fixed commands, least authority, bounded delegation/enforcement, and no active collector endpoints. |
| NFR-002 | T2, T3, T4, T6, T6A, T10, T16R3, T16R5, T16R6 | Source-side minimization, bounded streams, path rejection, allowlists, and sanitized retention. |
| NFR-003 | T1, T2, T3, T4, T6A, T10, T13, T16R4, T16R6, T16 | Independent health, immutable identity, target isolation, atomic promotion, restart, and recovery. |
| NFR-004 | T1, T5, T6, T10, T13, T14, T15, T16R3, T16R4, T16R6, T16R7, T16 | Version/action/evidence audit trail with authentic start/target facts and deterministic UI evidence. |
| NFR-005 | T2, T3, T4, T6, T6A, T16R5 | Pinned versions, real runner-adapter integration, and visible mismatch failures. |
| NFR-006 | T11, T12, T15 | Progress privacy, stale-state truthfulness, accessible semantics, and separate advisory progress versus target qualification. |
| NFR-007 | T13, T14, T15, T16R4, T16R5, T16R6, T16 | One descriptor boundary, immutable producer facts, paired target completeness, and unchanged trust/privacy/failure controls. |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | FR-001 through FR-010 and FR-013 through FR-020 are covered, including the A-002 supersession. |
| Should Have requirements have tasks | Pass | FR-011 and FR-012 are covered by the harness and final release exercise. |
| Requirements are covered by design | Pass | Approved requirements remain covered; approved A-005 Sections 22.2-22.8 define each confirmed release-path correction. |
| Critical questions are answered | Pass | Q-001 through Q-008 are answered; D-009 and approved design TD-009 define A-002 timing and target qualification. |
| Tasks have dependencies, criteria, files, and verification | Pass | T16R3-T16R7 are bounded, dependency-aware, independently verifiable, and collectively block T16. |
| Orchestrator workflow and ownership | Pass | The named Orchestrator owns shared tracking; workers have serialized, bounded surfaces plus per-task execution and handoff files. |
| Model and effort routing | Pass | T16R3-T16R6 are deep/high with a fresh independent challenge pending before each dispatch; T16R7 is standard/medium and needs no high-tier challenge. |
| Session, lifecycle, and context freshness | Pass | Every ticket requires a new visible top-level Chat, append-preserving events/handoffs, early rollover, and Orchestrator reconciliation. |
| Verification commands are known | Pass | PowerShell parse/fake-shim, descriptor identity, runner-adapter, atomic builder, Pipelock, UI harness, and full project commands are named below. |
| Active-security authority is bounded | Pass | AIMap, RAMPART, telemetry bridging, Pi extension, and Pi Bash actions remain outside SancusSight; Pipelock affects one approved path after audit mode. |
| Human-only prerequisite | Task approval | T16R3-T16R7 require explicit task approval. High-tier challenges follow approval; T16 later requires a new explicit one-shot release authorization. |

## Frontier

| Task | Blocked By | Frontier Status |
|---|---|---|
| T1 | None | Complete; fresh automated evidence recorded below |
| T2 | T1 | Complete; fresh automated evidence recorded below |
| T3 | T1 | Complete; fresh automated evidence recorded below |
| T4 | T1 | Complete; fresh automated evidence recorded below |
| T5 | T1, T2, T3, T4 | Complete; fresh browser evidence recorded below |
| T6 | T1, T2, T3, T4 | Complete; fresh harness evidence recorded below |
| T6A | T1, T2, T5, T6 | Complete; fresh automated, Pi Bash, bridge, and browser evidence recorded below |
| T7 | T6A | Complete; fresh real-runtime and approved-target Praxen evidence recorded below |
| T8 | T2, T5, T6 | Complete; fresh real-workflow allow/block and receipt evidence recorded below |
| T9 | T3, T4, T5, T6 | Complete; fresh governed-agent and exact-scope target evidence recorded below |
| T10 | T7, T8, T9 | Complete; fresh failure/recovery, same-window gate, bundle, and review evidence recorded below |
| T11 | T1, T5, T6A | Complete; fresh contract, route, privacy, and browser evidence recorded below |
| T12 | T1, T10 | Complete; fresh boundary and separate freshness/deadline evidence recorded below |
| T13 | T12 (complete) | Complete; fresh contract, boundary, and paired-target evidence recorded below |
| T14 | T13 (complete) | Complete; fresh deterministic selection and operations evidence recorded below |
| T15 | T14 (complete) | **Complete; fresh scoped review reconciled 2026-07-23** |
| T16R | T15 (complete) | **Complete; fresh Orchestrator review and verification reconciled 2026-07-23** |
| T16R2 | T16R (complete), A-004 design (approved) | **Complete; fresh Orchestrator review and verification reconciled 2026-07-23** |
| T16R3 | A-005 design (approved), task approval | **Complete; fresh scoped review reconciled 2026-07-23** |
| T16R4 | T16R3 (complete), corrected task contract (approved) | **Complete; fresh scoped review reconciled 2026-07-23** |
| T16R5 | T16R4 (complete) | **Held; fresh challenge CHALLENGE requires explicit task-contract correction approval** |
| T16R6 | T16R4, T16R5 | Blocked |
| T16R7 | T16R3 (complete), T16R4 (complete) | Ready but not selected; T16R5 is dependency-critical |
| T16 | T16R3, T16R4, T16R5, T16R6, T16R7 | **Blocked; latest one-shot authorization spent; new challenge and explicit authorization required after remediation** |

## Task T1: Add operational provenance and the release-gate domain

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** none  
**Covers:** FR-001, FR-005, FR-006, FR-010, FR-016, NFR-003, NFR-004  
**Delivers:** Manifest-bound evidence qualification, deterministic release manifests, freshness/expiry calculation, and a truthful five-source gate independent of UI state.

### Work
- [x] Extend shared evidence/source types with qualification, source version, run ID, target ID, contract version, and optional configuration hash.
- [x] Add `ReleaseEvidenceManifestV1`, source gate state, runtime coverage, failure-case state, and `ReleaseGateStatus` contracts.
- [x] Implement pure validation and gate calculation for all five sources, two runtimes, five-minute freshness, verification, required failures, and expiry.
- [x] Default legacy or incomplete evidence to non-operational qualification; never infer qualification from path or timestamp.
- [x] Preserve backward-compatible import of existing Spec 004 normalized evidence as QA/manual evidence.
- [x] Start red-green with a fresh four-source manifest remaining blocked until the fifth operational source is valid.

### Acceptance Criteria
- [x] Only manifest-matching `operational` evidence can satisfy a source gate.
- [x] Missing, stale, synthetic, unsupported, untrusted, or wrong-target evidence identifies the exact blocking reason.
- [x] A previously passed historical manifest becomes displayed as expired without mutating stored evidence.
- [x] Existing snapshots load safely but cannot be silently promoted to operational.

### Files
- `src/types.ts`
- `src/lib/release-gate.ts` - create pure release calculation and validation
- `collector/envelope.ts`
- `collector/evidence-store.ts`
- `scripts/verify-core.ts`
- `collector/__tests__/` - add qualification/persistence cases

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`

## Task T2: Qualify Agent Beacon, Praxen, and Pipelock evidence

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-001 through FR-006, FR-009, NFR-001 through NFR-005  
**Delivers:** Operational contract checks for the existing three adapters and a fixed Pipelock verification artifact bound to packet hash and pinned public key.

### Work
- [x] Extend Beacon ingestion with approved runtime identity, Beacon version, run/target metadata, and metadata-retention qualification checks.
- [x] Require Praxen target and approved Worker Remit hash to match the release manifest before operational qualification.
- [x] Define and validate `PipelockVerificationV1` with packet hash, verdict, chain result, trusted signer fingerprint, verifier identity/version, and observed time.
- [x] Bind Pipelock packet acceptance to its exact external verification artifact without executing a verifier in the collector.
- [x] Require operational Pipelock packets to contain at least one allow and one block for the release run.
- [x] Add fixtures for wrong runtime, wrong remit, packet mismatch, invalid chain, key mismatch, unavailable verification, and successful qualification.

### Acceptance Criteria
- [x] Beacon metadata from both approved runtimes can be traced without prompt or response bodies.
- [x] Praxen reports with an unapproved target/remit remain visible but non-operational or rejected as designed.
- [x] Pipelock reaches `verified` only when packet hash, chain, and pinned signer all match.
- [x] No adapter invokes upstream commands or reads private signing material.

### Files
- `contracts/pipelock-verification-v1.schema.json` - create
- `collector/adapters/agent-beacon.ts`
- `collector/adapters/praxen.ts`
- `collector/adapters/pipelock.ts`
- `collector/__tests__/fixtures/`
- `collector/__tests__/adapters.test.ts`

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`

## Task T3: Add the privacy-safe RAMPART evidence path

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-005, FR-009, FR-013, FR-015, NFR-001 through NFR-005  
**Delivers:** A versioned RAMPART sanitizer contract and read-only adapter that preserves safety outcomes while rejecting raw conversation-bearing reports.

### Work
- [x] Define `RampartOperationalReportV1` JSON Schema with stable result identity, run/target/suite/evaluator versions, status, safe flag, bounded summary, harm category, strategy, duration, and timestamps.
- [x] Implement a fixed sanitizer that reads the official JSON sink and constructs only approved fields.
- [x] Explicitly reject raw reports or sanitized artifacts containing turns, prompts, responses, tool arguments/results, evaluator rationale, secrets, or unknown contract versions.
- [x] Implement `RampartAdapter` with whole-artifact validation, deterministic IDs, freshness, qualification, and explicit `safe`/`unsafe`/`undetermined`/`error` outcomes.
- [x] Register RAMPART as an available first-class source and add contract fixtures.
- [x] Verify execution errors and undetermined outcomes block the source gate without invalidating other sources.

### Acceptance Criteria
- [x] Supported sanitized reports normalize stable test evidence and provenance.
- [x] Raw RAMPART reports never enter SancusSight storage.
- [x] Infrastructure errors are never represented as safety passes.
- [x] Unsupported or partially invalid reports are wholly rejected with bounded guidance.

### Files
- `contracts/rampart-operational-report-v1.schema.json` - create
- `operations/lib/Export-RampartReport.ps1` - create fixed sanitizer
- `collector/adapters/rampart.ts` - create
- `collector/adapters/index.ts`, `src/lib/evidence-catalog.ts`, `src/types.ts`
- `collector/__tests__/fixtures/`, `collector/__tests__/adapters.test.ts`

### Verification
- [x] PowerShell sanitizer tests with safe and sensitive raw fixtures
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`

## Task T4: Add the authorized AIMap evidence path

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-005, FR-009, FR-014, FR-015, NFR-001 through NFR-005  
**Delivers:** An authorization-bound AIMap exporter and adapter that ingest only sanitized findings from completed approved scans.

### Work
- [x] Define the AIMap authorization manifest and `AIMapOperationalExportV1` JSON Schemas.
- [x] Implement a fixed exporter for a completed scan and linked endpoints that constructs only approved scan/finding/provenance fields.
- [x] Exclude system prompts, tool schemas/parameters, response bodies, curl commands, raw Nuclei records, geolocation details, payloads, and exploitation output.
- [x] Validate exact target/port/protocol/template scope, owner, purpose, validity window, release run ID, completed status, and upstream version.
- [x] Implement `AIMapAdapter` with deterministic endpoint/finding IDs, qualification, freshness, and whole-artifact rejection.
- [x] Register AIMap as an available first-class source and add completed, incomplete, expired, out-of-scope, raw-content, and supported fixtures.

### Acceptance Criteria
- [x] Only a completed scan matching an unexpired authorization manifest can qualify as operational.
- [x] SancusSight exposes no route or control that initiates, resumes, expands, or attacks through AIMap.
- [x] Findings preserve stable source/version/scan/target provenance without unrestricted raw data.
- [x] Out-of-scope or incompatible exports fail visibly and independently.

### Files
- `contracts/aimap-authorization-v1.schema.json` - create
- `contracts/aimap-operational-export-v1.schema.json` - create
- `operations/lib/Export-AIMapReport.ps1` - create fixed exporter
- `collector/adapters/aimap.ts` - create
- `collector/adapters/index.ts`, `src/lib/evidence-catalog.ts`, `src/types.ts`
- `collector/__tests__/fixtures/`, `collector/__tests__/adapters.test.ts`

### Verification
- [x] PowerShell exporter authorization/privacy tests
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Route scan confirms no AIMap execution endpoint exists.

## Task T5: Build the truthful five-source release-evidence UI

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2, T3, T4  
**Covers:** FR-001, FR-005, FR-006, FR-010, FR-016, NFR-003, NFR-004  
**Delivers:** A first-class five-source status and release-evidence view that separates health, qualification, verification, and readiness.

### Work
- [x] Show Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap as normal source rows; keep Kiji deferred.
- [x] Rename broad live wording to `Local evidence collector` and keep point-in-time tools distinct from continuous controls.
- [x] Add textual qualification labels and source detail for version, target, run, freshness, verification, and recovery guidance.
- [x] Add a `Release evidence` view with source gates, Codex/Claude coverage, mandatory failures, untested boundaries, and one factual readiness state.
- [x] Display `Not ready for release` until the complete valid manifest passes; avoid protected/secure/continuous-monitoring aggregate claims.
- [x] Preserve responsive, keyboard, hosted/manual, degraded, stale, failed, and unconfigured behavior without overlap.

### Acceptance Criteria
- [x] Health, qualification, verification, and readiness cannot be confused visually or semantically.
- [x] The UI identifies the exact unmet release conditions without offering upstream run/install/scan controls.
- [x] Imported QA/demo/manual evidence remains visibly non-operational.
- [x] Desktop and mobile layouts remain scannable and accessible with text labels for every state.

### Files
- `src/components/EvidenceSources.tsx`
- `src/components/ReleaseEvidence.tsx` - create
- `src/components/WorkspaceNavigation.tsx`, `src/App.tsx`
- `src/lib/use-collector.ts`, `src/lib/collector-client.ts`
- `src/index.css`, `src/types.ts`

### Verification
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Playwright checks at 1280x720 and 390x844 for blocked and hosted/manual states; passed/expired/QA-only/source-failed remain operational T10 scenarios.
- [x] Keyboard and overflow checks

## Task T6: Implement the fixed operational lifecycle harness

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2, T3, T4  
**Covers:** FR-007 through FR-009, FR-011, FR-012, NFR-001, NFR-002, NFR-004, NFR-005  
**Delivers:** Auditable user-scoped install, preflight, inspect, export, verification, release-run, rollback, and removal commands with no generic command surface.

### Work
- [x] Add structured producer inventory, target/scope manifests, run-directory layout, and schema validation under `%LOCALAPPDATA%/SancusSight/operations`.
- [x] Implement fixed `preflight`, `install-user`, `inspect`, `export-source`, `run-release-gate`, `exercise-failures`, `rollback`, and `uninstall-user` entry points.
- [x] Pin supported versions and official source URLs/digests or upstream attestation checks; fail closed on unknown versions.
- [x] Allow only enumerated source IDs/actions and structured parameters; reject free-form executables and argument tails.
- [x] Preserve producer evidence by default during rollback/removal and keep private keys/credentials outside manifests and bundles.
- [x] Generate sanitized run records containing operator action, version, time, result, evidence location, and explicit limits.

### Acceptance Criteria
- [x] Each producer has documented install/configure/start/inspect/update/rollback/stop/remove behavior.
- [x] Harness scripts cannot be reached through SancusSight HTTP routes and cannot execute arbitrary commands.
- [x] Re-running preflight or a release run is deterministic and does not reuse a prior success silently.
- [x] Removal requires explicit source selection and preserves evidence unless separately confirmed.

### Files
- `operations/*.ps1` - create fixed entry points
- `operations/lib/*.ps1` - create typed source helpers and validators
- `operations/manifests/*.example.json` - create sanitized examples
- `contracts/*.schema.json`
- `scripts/` or PowerShell test files
- `README.md`

### Verification
- [x] PowerShell static allowlist and parameter tests
- [x] Preflight dry run for all five sources
- [x] Install/rollback/removal tests in the fixed user-scope operations root without mutating producer artifacts
- [x] `npm run test:collector`
- [x] `npm run build`
- [x] Route/process scan proves no collector command endpoint or subprocess capability.

## Task T6A: Expand runtime telemetry for Windows/WSL and Pi

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2, T5, T6  
**Covers:** FR-001, FR-002, FR-005 through FR-010, FR-012, FR-016, NFR-001 through NFR-005, TD-007, TD-008  
**Delivers:** An expand-contract runtime telemetry path that preserves existing Agent Beacon evidence while accepting privacy-safe Codex OTLP, Claude OTLP, and Pi-extension events with truthful provider identity and three-runtime gate/UI coverage.

### Work
- [x] Start red with gate/adapter tests proving Pi is required, native OTLP is not Agent Beacon, and legacy Agent Beacon envelopes remain valid without being rewritten.
- [x] Add `pi` to `EvidenceRuntimeId`; add provider/transport metadata and `RuntimeTelemetryEventV1` JSON Schema with an explicit metadata-only field allowlist.
- [x] Add a fixed incremental `runtime-telemetry` JSONL adapter beside `agent-beacon`, with deterministic IDs, version checks, qualification, checkpointing, duplicate/replay handling, and whole-event rejection.
- [x] Implement the fixed loopback OTLP-to-JSONL bridge for Codex and Claude with prompt/content capture disabled and no generic command, arbitrary path, or unrestricted attribute surface.
- [x] Implement a user-scoped Pi extension that emits only approved lifecycle/tool-outcome metadata and never serializes prompts, responses, reasoning, Bash command text/output, tool arguments/results, secrets, credentials, file content, or unrestricted paths.
- [x] Expand release-manifest/gate and UI grouping to require Codex CLI, Claude Code, and Pi under the runtime-telemetry category while showing each actual provider/transport.
- [x] Extend the fixed operations inventory, preflight, install/inspect/rollback/remove, and failure allowlists for telemetry bridge and Pi extension; document that Pi Bash may invoke only these fixed procedures or enumerated approved upstream commands outside SancusSight.
- [x] Exercise bridge-stopped, Pi-extension-disabled, malformed event, unsupported version, privacy-setting mismatch, replay, rotation, and recovery cases with fixtures/local isolated artifacts.

### Acceptance Criteria
- [x] Existing Agent Beacon evidence and `EvidenceEnvelopeV1` remain canonical and load unchanged; no historical records are duplicated or relabeled.
- [x] Codex, Claude, and Pi telemetry retain runtime, actual provider, transport, version, session/event IDs, timestamps, bounded outcome metadata, and operational provenance without forbidden content.
- [x] The release gate and UI require all three runtimes but keep runtime telemetry as one of five evidence categories.
- [x] A telemetry failure degrades only the affected runtime; recovery requires a fresh valid event and does not duplicate prior evidence.
- [x] Collector/browser routes still expose no command execution, upstream run/install control, arbitrary filesystem access, scanning, policy mutation, or machine-wide interception.

### Files
- `contracts/runtime-telemetry-event-v1.schema.json` - create
- `collector/adapters/runtime-telemetry.ts` - create
- `collector/adapters/operational.ts`, `collector/adapters/index.ts`, `collector/main.ts`, `collector/server.ts`
- `src/types.ts`, `src/lib/release-gate.ts`, `src/lib/evidence-catalog.ts`
- `src/components/EvidenceSources.tsx`, `src/components/ReleaseEvidence.tsx`
- `operations/telemetry/` - fixed bridge/configuration assets and Pi extension
- `operations/*.ps1`, `operations/lib/*.ps1`, `operations/manifests/*.json`
- `collector/__tests__/`, `scripts/verify-core.ts`, `scripts/verify-operations.ps1`
- `README.md`

### Verification
- [x] Narrow red/green runtime telemetry adapter and release-gate tests
- [x] Pi extension privacy fixture/static scan
- [x] OTLP bridge loopback, content-disabled, malformed-event, restart, replay, and recovery checks
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit`
- [x] Browser verification at desktop/mobile sizes including console, network, keyboard, reduced-motion, and overflow checks
- [x] Route/process scan proves SancusSight has no generic execution or producer-control capability

## Task T7: Operationalize runtime telemetry and Praxen on real runtimes and targets

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T6A  
**Covers:** FR-002, FR-003, FR-006, FR-008, FR-009, NFR-002 through NFR-005  
**Delivers:** Persistent metadata-only telemetry from real Codex CLI, Claude Code, and Pi sessions plus Praxen findings from approved real SancusSight/workflow targets.

### Work
- [x] Use Pi Bash where practical to invoke the approved fixed operator-side setup/preflight procedures, recording only sanitized action class/version/time/outcome evidence.
- [x] Install/configure the fixed telemetry bridge and Pi extension in persistent user scope; verify Codex/Claude prompt-content telemetry is disabled and Pi uses the explicit allowlist before any release session.
- [x] Configure Codex CLI, Claude Code, and Pi integrations and record actual runtime/provider/transport versions without labeling native/Pi evidence as Agent Beacon.
- [x] Run an ordinary real task in each of the three runtimes and confirm fresh native events and SancusSight acceptance within five minutes.
- [x] Define and record the approved Praxen Worker Remit and target identities for SancusSight and one operator-used workflow.
- [x] Run Praxen against those real targets, export canonical findings, and confirm manifest-bound operational qualification.
- [x] Verify no prompt body, full response, reasoning, Bash command/output, tool payload, credential, secret, unrestricted path, or workspace content enters normalized evidence.

### Acceptance Criteria
- [x] All three release-critical runtimes produce fresh correctly attributed real telemetry without fixture copying.
- [x] Preflight proves content-disabled Codex/Claude telemetry and allowlist-only Pi telemetry.
- [x] Praxen findings identify the approved target and Worker Remit hash.
- [x] SancusSight shows traceable operational evidence and exact timing for both sources.

### Files
- `%USERPROFILE%/.pi/agent/extensions/` - user-scoped Pi extension state, not repository evidence
- user-scoped Codex/Claude telemetry configuration and bridge state outside repository content
- `%LOCALAPPDATA%/SancusSight/operations/scopes/praxen-remit.json`
- `%LOCALAPPDATA%/SancusSight/operations/exports/runtime-telemetry/`
- `%LOCALAPPDATA%/SancusSight/operations/exports/praxen/`
- `artifacts/qa/spec005/` - sanitized evidence only
- task evidence section below

### Verification
- [x] Telemetry bridge/Pi extension status, privacy configuration, and fresh-event timestamps
- [x] Real Codex CLI, Claude Code, and Pi session evidence
- [x] Praxen real-target canonical report validation
- [x] Collector/UI acceptance within five minutes
- [x] Sanitized privacy scan

## Task T8: Operationalize Pipelock on one real AI workflow

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2, T5, T6  
**Covers:** FR-004, FR-006, FR-008, FR-009, NFR-001 through NFR-005  
**Delivers:** A persistent user-scoped Pipelock deployment proving an allow and safe block in one selected real Codex/Claude execution path with independently verified signed receipts.

### Work
- [x] Install the pinned official Pipelock release in user scope and record integrity/version evidence.
- [x] Select and document one real network or MCP path without intercepting unrelated machine traffic.
- [x] Run that workflow in audit mode, confirm normal behavior and receipt emission, and record rollback state.
- [x] Promote only the selected path to balanced mode and exercise one expected allow plus one controlled block using a non-secret marker and harmless/operator-owned destination.
- [x] Run the independent standalone/reference verifier outside the collector against the exact packet and pinned public-key fingerprint.
- [x] Export `PipelockVerificationV1`, ingest the packet, and confirm SancusSight displays `verified` operational provenance.
- [x] Roll back immediately if expected normal traffic is disrupted or the control boundary expands.

### Acceptance Criteria
- [x] The tested real workflow demonstrably traverses Pipelock.
- [x] One allow and one controlled block are bound to the same approved release run.
- [x] Receipt signature, chain, packet hash, and pinned signer all verify independently.
- [x] Private signing material and the test marker do not enter SancusSight storage.

### Files
- `%LOCALAPPDATA%/SancusSight/operations/scopes/pipelock-workflow.json`
- `%LOCALAPPDATA%/SancusSight/operations/exports/pipelock/`
- producer-owned Pipelock config/key/evidence paths outside the repository
- `artifacts/qa/spec005/` - sanitized verification evidence only
- task evidence section below

### Verification
- [x] Pipelock audit-mode real workflow run
- [x] Balanced-mode allow/block run
- [x] Independent verifier output and pinned fingerprint match
- [x] Collector/UI acceptance within five minutes
- [x] Rollback test

## Task T9: Operationalize RAMPART and authorized AIMap evidence

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T3, T4, T5, T6  
**Covers:** FR-006, FR-008, FR-009, FR-013 through FR-015, NFR-001 through NFR-005  
**Delivers:** Fresh RAMPART safety-test results and authorized AIMap findings from real operator-owned targets through the approved sanitized contracts.

### Work
- [x] Install RAMPART in a pinned user-scoped Python environment and record framework/Python/pytest/adapter/evaluator versions.
- [x] Author and run the approved non-destructive suite against SancusSight's collector and one operator-used workflow with stable scenario metadata.
- [x] Sanitize the official JSON sink output and confirm SancusSight preserves all four outcome classes without raw turns.
- [x] Install AIMap in an isolated user-owned environment and create an exact expiring authorization manifest for a loopback or operator-owned endpoint.
- [x] Initiate and complete the scan in AIMap, export only the completed scan and linked sanitized findings, and ingest them through the adapter.
- [x] Confirm no SancusSight route, UI control, or harness shortcut can expand or initiate AIMap scope.

### Acceptance Criteria
- [x] RAMPART produces fresh machine-readable real-target outcomes with no execution errors for gate satisfaction.
- [x] AIMap evidence comes from a completed scan matching the exact approved target and validity window.
- [x] Both sources retain tool/target/run/test-or-scan identity and provenance.
- [x] Raw prompts, responses, payloads, tool data, and unrestricted network records remain outside SancusSight.

### Files
- `%LOCALAPPDATA%/SancusSight/operations/scopes/rampart-suite.json`
- `%LOCALAPPDATA%/SancusSight/operations/scopes/aimap-authorization.json`
- `%LOCALAPPDATA%/SancusSight/operations/exports/rampart/`
- `%LOCALAPPDATA%/SancusSight/operations/exports/aimap/`
- `operations/rampart-tests/` - approved non-destructive suite
- `artifacts/qa/spec005/` - sanitized evidence only
- task evidence section below

### Verification
- [x] RAMPART real-target pytest run and sanitizer validation
- [x] AIMap exact-scope completed scan and exporter validation
- [x] Collector/UI acceptance within five minutes
- [x] Privacy and no-control-route scans

## Task T10: Execute failure/recovery and produce the release evidence bundle

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T7, T8, T9  
**Covers:** FR-001, FR-005 through FR-012, FR-016, NFR-001 through NFR-005  
**Delivers:** Fresh end-to-end evidence for every mandatory failure/recovery case and a reviewed sanitized five-category, three-runtime release bundle that alone may change release readiness.

### Work
- [x] Execute telemetry bridge stopped, Pi extension disabled, malformed/privacy-unsafe runtime event, producer stopped, artifact inaccessible, unsupported format, invalid Pipelock signature, RAMPART execution error, and rejected/out-of-scope AIMap cases.
- [x] Exercise collector restart, duplicate replay, artifact rotation/replacement, source upgrade/mismatch, and successful recovery with new valid evidence.
- [x] Confirm each failure affects only its source, retains prior evidence, blocks readiness truthfully, and requires fresh evidence for recovery.
- [x] Repeat fresh-event checks after approved producer/collector restart scenarios.
- [x] Generate a sanitized release bundle with versions, target/config identities, timestamps, normalized evidence, verifier results, failure results, and untested boundaries.
- [x] Run standards review for removable complexity, unsupported additions, security/privacy boundaries, and avoidable operator decisions.
- [x] Run spec-alignment review against every requirement/task and capture desktop/mobile screenshots of blocked, failed, recovered, passed, and expired states.
- [x] Change readiness language only if the complete independently reviewed gate passes; otherwise retain `Not ready for release` and list exact blockers.

### Acceptance Criteria
- [x] Every mandatory failure and recovery row has fresh end-to-end evidence.
- [x] All five operational evidence categories and all three runtimes satisfy the same release manifest within the approved freshness semantics.
- [x] The export contains no credentials, private keys, raw prompts/responses, unrestricted output, or identifying absolute paths.
- [x] A reviewer can trace each visible claim to source artifact, parser/contract, target, run, verification, and observed time.
- [x] Release readiness is factual: passed only on complete evidence, otherwise explicitly blocked.

### Files
- `%LOCALAPPDATA%/SancusSight/operations/runs/<release-run-id>/`
- `artifacts/qa/spec005/` - sanitized bundle, review, command evidence, and screenshots
- `README.md`
- `.ai/sdd/handoff/sdd-brief.md` - refresh only after task approval/implementation evidence as appropriate
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md` - execution evidence

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit`
- [x] Complete operational failure/recovery matrix
- [x] Playwright desktop/mobile screenshots and network/console/overflow checks
- [x] Sanitized bundle schema and privacy validation

## Task T11: Add truthful producer progress visibility

**Priority:** P1  
**Estimate:** 4h  
**Blocked By:** T1, T5, T6A  
**Covers:** FR-017, NFR-006  
**Delivers:** A metadata-only, versioned producer-progress contract, fixed operator-side writer, read-only collector endpoint, and accessible status panel.

### Work
- [x] Add the schema-validated `release-progress-v1` snapshot with fixed producer, target, state, stage, message-code, timestamp, and optional bounded unit counts.
- [x] Add a fixed user-scoped writer that accepts only allowlisted values and never reads upstream artifacts or accepts free-form messages, commands, or paths.
- [x] Add collector read-only ingestion with unknown-field, malformed-count, stale, and manifest-run-mismatch rejection.
- [x] Add a local UI panel that uses determinate progress only when counts are valid, otherwise shows indeterminate stage/state; expose no upstream execution controls.
- [x] Add privacy, stale-state, accessibility, and route tests.

### Acceptance Criteria
- [x] No prompt, response, reasoning, tool payload, credential, private key, raw scan payload, file content, or unrestricted path can enter the normalized progress response.
- [x] An exact percentage is rendered only from valid `completedUnits` and `totalUnits`; otherwise the UI is explicitly indeterminate.
- [x] Missing, malformed, stale, or wrong-run snapshots are visibly unavailable/stale and cannot imply completion.
- [x] Hosted/manual mode says live progress is unavailable; local mode remains read-only.

### Files
- `src/types.ts`, `src/lib/release-progress.ts`
- `operations/report-release-progress.ps1`
- `collector/release-progress-store.ts`, `collector/main.ts`, `collector/server.ts`
- `src/lib/collector-client.ts`, `src/lib/use-collector.ts`
- `src/components/ReleaseProgressPanel.tsx`, `src/components/ReleaseEvidence.tsx`, `src/index.css`
- `collector/__tests__/release-progress.test.ts`, `collector/__tests__/server.test.ts`

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] PowerShell writer allowlist/privacy checks
- [x] Playwright desktop/mobile status, keyboard, reduced-motion, console, network, and overflow checks

## Task T12: Separate orchestration deadline from source freshness

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** T1, T10  
**Covers:** FR-018, NFR-006  
**Delivers:** A reviewed thirty-minute release orchestration window while retaining the existing five-minute per-source freshness gate.

### Work
- [x] Add the thirty-minute orchestration constant and validate elapsed run duration from manifest start to final evaluation/completion.
- [x] Keep five-minute evidence and runtime freshness checks unchanged and report orchestration expiry as a distinct blocker.
- [x] Add boundary tests for exactly-on-window, over-window, and stale-source-within-orchestration cases.
- [x] Document the operator workflow, deadline, and separate UI indicators in the release handoff.

### Acceptance Criteria
- [x] A run may take up to thirty minutes to orchestrate, but every required source/runtime remains no more than five minutes old at final evaluation.
- [x] A run exceeding thirty minutes fails closed even if its individual source records otherwise qualify.
- [x] The UI never presents the thirty-minute deadline as evidence freshness or readiness.

### Files
- `src/lib/release-gate.ts`, `collector/__tests__/release-gate.test.ts`
- `src/components/ReleaseProgressPanel.tsx`, `src/components/ReleaseEvidence.tsx`
- `.ai/sdd/specs/005-operational-evidence-producers/design.md`
- `.ai/sdd/handoff/spec005-t10-next-fresh-session.md`, `.ai/sdd/handoff/sdd-brief.md`

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Standards and Spec review addendum

## Approved Amendment A-002 Implementation Plan

**Approval:** Explicitly approved by the operator on 2026-07-21.

The amendment uses expand-contract. Historical task completion and evidence remain intact; T13-T16 implement and verify only the newly approved A-002 contract. Each ticket uses `session_policy: new-top-level-required`. A visible new top-level implementation session must acknowledge the authority artifacts before editing; this planning session and hidden subagents are not valid implementation sessions.

## Task T13: Expand the run-bound, paired-target release gate

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T12 (complete)  
**Covers:** FR-006, FR-016, FR-018, FR-019, FR-020, NFR-003, NFR-004, NFR-007, TD-009  
**Delivers:** A pure release-gate contract that uses one 30-minute run/evidence boundary and evaluates every paired required target independently without weakening existing trust checks.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** Core temporal and manifest semantics are cross-boundary, fail-closed, and release-consequential; the task benefits from the strongest reasoning tier.  
**High-tier Second Opinion:** `affirmed` — reconciled on 2026-07-21; the operator explicitly authorized current-task execution after the read-only challenge.  
**Freshness / Rollover:** Start in a new visible worker Chat; checkpoint and return a rollover handoff before compaction, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; use `blocked`, `contract-conflict`, or `verification-failed` immediately when applicable; only Orchestrator records authoritative `completed`.  
**Owned Surfaces:** `src/types.ts`, `src/lib/release-gate.ts`, `collector/__tests__/release-gate.test.ts`, narrowly necessary typed fixtures in `scripts/run-spec005-t10-failure-matrix.ts`, `execution/T13.md`, and `execution/T13-handoff.md`.  
**Coordination:** T13 begins from Orchestrator's reconciled T12 baseline. No other worker may modify these surfaces concurrently. Changes outside them require Orchestrator approval and a revised ownership record.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T13.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T13-handoff.md`

### Work
- [x] Start red/green with two required Praxen targets whose valid canonical timestamps differ: both pass inside one 30-minute run; removing either emits its target-specific blocker.
- [x] Add `ReleaseRequiredTargetV1`, target-level gate results, and expand-contract `requiredTargets` fields while retaining read-only legacy single-target support.
- [x] Validate exact target/remit pairing, uniqueness, parent-summary equality, referenced accepted evidence, and rejection of ambiguous legacy multi-target manifests.
- [x] Replace the split freshness constants with one `RELEASE_RUN_WINDOW_MS` predicate covering exact start/end boundaries, pre-run evidence, future dates, wrong runs, and orchestration overrun.
- [x] Evaluate source targets and Codex/Claude/Pi runtime coverage independently, then reduce to the source and aggregate gate.
- [x] Preserve Pipelock verification, RAMPART outcomes, AIMap authorization, privacy rejection, source isolation, and all required failure cases.

### Acceptance Criteria
- [x] Exact run start and exact 30-minute evidence/orchestration boundaries pass; one millisecond outside any approved boundary fails closed with a distinct blocker.
- [x] `observedAt` is authoritative; changing `importedAt` or filesystem metadata cannot qualify historical, stale, future-dated, or wrong-run evidence.
- [x] Every required target has an independently inspectable state, timestamp, evidence set, and bounded blocker list.
- [x] Missing or invalid evidence for one target cannot be hidden by newer evidence for another target.
- [x] Historical single-target manifests remain readable, while ambiguous legacy multi-target manifests cannot satisfy A-002.

### Files
- `src/types.ts`
- `src/lib/release-gate.ts`
- `collector/__tests__/release-gate.test.ts`
- `scripts/run-spec005-t10-failure-matrix.ts` — update typed fixtures only as needed for the expanded gate contract

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Append exact lifecycle/verification evidence to `execution/T13.md`, write `execution/T13-handoff.md`, and send the same `ready-for-review` summary back to Orchestrator

## Task T14: Migrate deterministic per-target bundle construction

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T13  
**Covers:** FR-011, FR-012, FR-019, FR-020, NFR-002, NFR-004, NFR-007, TD-009  
**Delivers:** A sanitized release builder that selects one complete canonical report group independently per required target and emits a self-consistent paired-target manifest.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `medium`  
**Model Reason:** Deterministic grouping, provenance consistency, and fail-before-write behavior require strong code reasoning, but the approved T13 contract bounds the problem.  
**High-tier Second Opinion:** `not-required` — the selected host effort is below Sol High.  
**Freshness / Rollover:** Start only after T13 reconciliation in a new visible worker Chat; checkpoint before compaction, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; fail closed through `blocked`, `contract-conflict`, or `verification-failed`; only Orchestrator records authoritative `completed`.  
**Owned Surfaces:** `src/lib/release-evidence-selection.ts`, `scripts/build-spec005-t10-release-bundle.ts`, `operations/manifests/release-run.example.json`, `scripts/verify-operations.ps1`, `collector/__tests__/release-evidence-selection.test.ts`, `execution/T14.md`, and `execution/T14-handoff.md`.  
**Coordination:** T14 consumes the reconciled T13 types and gate contract without reopening them. If those surfaces must change, return a contract-conflict to Orchestrator; do not edit T13-owned files.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T14.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T14-handoff.md`

### Work
- [x] Extract or add a pure candidate-selection helper that groups by source, target, authoritative `observedAt`, and artifact content hash.
- [x] Select the newest qualifying canonical group independently per required target, retaining every normalized finding from the chosen report.
- [x] Resolve equal timestamps deterministically by artifact hash and evidence ID; never consult filesystem ordering or modification time.
- [x] Pair Praxen `sancussight` and `sdd-exec` targets with their exact approved Worker Remit hashes and exclude extra unapproved targets.
- [x] Emit authoritative `requiredTargets` plus derived parent compatibility summaries; fail before writing when any target, summary, version, contract, or verification fact is inconsistent.
- [x] Migrate the release-manifest example, bundle fixtures, and operations validation while retaining historical read-only parsing.

### Acceptance Criteria
- [ ] Unequal valid timestamps across the two Praxen targets produce two qualifying target entries and one complete source result.
- [ ] A newer report for one target never masks a missing, stale, wrong-remit, or incompatible report for another.
- [ ] Equal-timestamp selection is deterministic and retains the complete chosen report rather than one arbitrary finding.
- [ ] Parent evidence IDs, target IDs, latest time, and remit hashes exactly summarize the paired target entries.
- [ ] Privacy scanning and manifest validation occur before any current-release manifest or bundle is written.

### Files
- `src/lib/release-evidence-selection.ts` — create the pure selection seam if separation from the script keeps it reusable
- `scripts/build-spec005-t10-release-bundle.ts`
- `operations/manifests/release-run.example.json`
- `scripts/verify-operations.ps1`
- `collector/__tests__/release-evidence-selection.test.ts` — create focused selection coverage without reopening T13's test surface

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `scripts/verify-operations.ps1`
- [x] Focused dry-run fixtures prove target independence, deterministic ties, mismatch rejection, and no output on failure
- [x] Append exact lifecycle/verification evidence to `execution/T14.md`, write `execution/T14-handoff.md`, and report `ready-for-review` to Orchestrator

## Task T15: Show truthful per-target release diagnostics

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T14  
**Covers:** FR-010, FR-020, NFR-004, NFR-006, NFR-007  
**Delivers:** A release-evidence view where multi-target source health is visibly reduced from independent target results and recovery guidance never recommends timestamp manipulation or artifact copying.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `standard`  
**Host Model:** `gpt-5.6-terra`  
**Effort:** `high`  
**Model Reason:** This is a bounded React/accessibility/Playwright slice with established domain contracts; high effort is warranted for truthful state reduction and responsive verification rather than frontier architecture work.  
**High-tier Second Opinion:** `not-required` — the selected model is not Sol High or stronger.  
**Freshness / Rollover:** Start only after T14 reconciliation in a new visible worker Chat; checkpoint before compaction, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; fail closed through `blocked`, `contract-conflict`, or `verification-failed`; only Orchestrator records authoritative `completed`.  
**Owned Surfaces:** `src/components/ReleaseEvidence.tsx`, narrowly necessary `src/components/ReleaseProgressPanel.tsx`, `src/index.css`, one bounded verification-only T15 fixture/harness under `scripts/` or `collector/__tests__/fixtures/` that cannot ship a production bypass, bounded Playwright evidence matching `output/playwright/spec005-a002-t15-*`, `execution/T15.md`, and `execution/T15-handoff.md`. The verification-only ownership amendment was explicitly authorized by the operator on 2026-07-21.  
**Coordination:** T15 consumes the reconciled T14 manifest/result shape. It must not change shared release types or gate semantics; any mismatch returns to Orchestrator as a contract-conflict.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T15.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T15-handoff.md`

### Work
- [x] Render required targets beneath each multi-target source with target label, producer-observed time, current-run qualification, evidence count, and bounded blocker text.
- [x] Compute the source label from all target results; do not display `Current` when any required target is missing, stale, incompatible, wrong-run, or untrusted.
- [x] Keep advisory progress and its heartbeat staleness visually and semantically separate from target evidence qualification and the 30-minute deadline.
- [x] Add recovery copy for rerunning the affected target within the active run or starting a new run; never suggest touching timestamps, copying artifacts, or reusing historical evidence.
- [x] Preserve hosted/manual behavior, keyboard focus, text-plus-color status, reduced motion, and bounded mobile/desktop overflow.

### Acceptance Criteria
- [x] Two valid Praxen targets with different timestamps are both visible and the source is current only when both pass.
- [x] One missing or failed target shows its exact blocker and keeps aggregate readiness `Not ready for release`.
- [x] Progress percentage or state cannot imply that target evidence qualifies.
- [x] Target status and recovery guidance remain understandable without color, hover, or animation at desktop and mobile widths.

### Files
- `src/components/ReleaseEvidence.tsx`
- `src/components/ReleaseProgressPanel.tsx` — only if separation copy/semantics require adjustment
- `src/index.css`
- one bounded verification-only T15 fixture/harness under `scripts/` or `collector/__tests__/fixtures/` — no production fixture route or release-qualification bypass
- `output/playwright/spec005-a002-t15-*` — bounded screenshots and inspection evidence only

### Verification
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Playwright desktop and 390x844 checks for complete, missing-target, stale-target, hosted/manual, keyboard, reduced-motion, console, network, and horizontal-overflow states
- [x] Append exact lifecycle/verification evidence to `execution/T15.md`, write `execution/T15-handoff.md`, and report `ready-for-review` to Orchestrator; completion reconciled by Orchestrator on 2026-07-23

## Task T16R: Enforce the deterministic Praxen producer boundary

**Priority:** P0  
**Estimate:** 4h plus bounded fixture/test time  
**Blocked By:** T15 (complete; reconciled 2026-07-23)  
**Covers:** FR-003, FR-005, FR-006, FR-009, FR-012, FR-015, FR-016, FR-019, FR-020, NFR-003, NFR-004, NFR-005, NFR-007, TD-009, TD-010, TD-011  
**Delivers:** A runner-authoritative Praxen pipeline in which Haiku can write only a staging Step 9.9 draft, the pinned converter alone creates canonical findings, the pinned renderer alone creates HTML/TXT, and SancusSight accepts only runner-created current-run bindings with explicit partial/exception states.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** The remediation crosses PowerShell process isolation, a pinned Python boundary, a TypeScript adapter, privacy/provenance validation, and release-fail-closed behavior.  
**High-tier Second Opinion:** `reconciled` — independent fresh visible Terra High read-only challenge `spec005-t16r-routing-challenge-20260723-terra-high-01` completed 2026-07-23; it retained deep/high Sol routing, required T15 frontier reconciliation, and found no requirements/design change. T15 is now reconciled complete by the scoped evidence recorded in the orchestrator routing reconciliation.
**Freshness / Rollover:** Start only after A-003 design/task approval and T15 reconciliation in a new visible worker Chat; checkpoint before compaction, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; fail closed through `blocked`, `contract-conflict`, or `verification-failed`; only Orchestrator records authoritative completion.  
**Owned Surfaces:** `scripts/run-spec005-praxen-behavior-verifier.ps1`, new `scripts/run-spec005-t16-remediation.ps1`, `scripts/test-spec005-claude-haiku.ps1`, new `scripts/test-spec005-praxen-boundary.ps1`, `collector/adapters/praxen.ts`, `collector/__tests__/operational-adapters.test.ts`, `operations/README.md`, `execution/T16R.md`, and `execution/T16R-handoff.md`.  
**Coordination:** T16R treats T13-T15 types, gate, selection, and UI as read-only. It does not modify `src/types.ts`, `src/lib/release-gate.ts`, `src/lib/release-evidence-selection.ts`, or the release bundle builder; if those surfaces must change, return a contract-conflict to Orchestrator. The new boundary regression may invoke the existing builder as a read-only fail-closed check.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R-handoff.md`

### Work
- [x] Split model staging from runner-owned converter, canonical, rendered, and operational directories; refuse target-directory reuse.
- [x] Invoke the pinned `manifest_to_findings.py` and `render.py` explicitly after a fresh Step 9.9 draft; never promote model-authored JSON directly.
- [x] Create and validate a runner-owned binding containing current run/target/remit, canonical content hash, producer timestamp, exact Claude/Praxen/converter/renderer versions, and bounded provenance.
- [x] Add an orchestration wrapper that records `passed`, `failed`, `partial`, and `exception` results, pauses on producer failure, requires explicit retry approval, and never writes a passing bundle for partial/exception outcomes.
- [x] Extend Praxen adapter validation and regression coverage for missing draft, converter/render failure, malformed schema, missing field, wrong run/target/remit, stale evidence, wrong or missing versions, model-authored canonical-looking output, and privacy violations.

### Acceptance Criteria
- [x] A controlled valid Step 9.9 draft runs through the real pinned converter and renderer and produces a runner-created operational binding accepted by the adapter.
- [x] The adapter and boundary reject direct model-authored canonical-looking JSON, even when it contains plausible `schema_version`, `scan`, and `findings` fields.
- [x] Missing, malformed, stale, wrong-run, wrong-target, wrong-remit, wrong-version, converter, renderer, or privacy failures fail closed with an exact bounded blocker.
- [x] One producer failure creates a visible partial result naming the producer/target/stage/reason, pauses for operator direction, and creates no passing release manifest or bundle.
- [x] Existing historical/legacy evidence remains readable but cannot be promoted to operational A-002 evidence.
- [x] The remediation regression and existing project verification remain green; no production A-002 run is started by this task.

### Files
- `scripts/run-spec005-praxen-behavior-verifier.ps1` — enforce staging-only model output and the pinned converter/render pipeline
- `scripts/run-spec005-t16-remediation.ps1` — orchestrate both targets and partial/exception state without release-bundle promotion
- `scripts/test-spec005-claude-haiku.ps1` — retain plan-only runner safeguards
- `scripts/test-spec005-praxen-boundary.ps1` — real-runner regression harness with labelled test fixtures
- `collector/adapters/praxen.ts` — validate runner binding, exact provenance, versions, and current-run relationship
- `collector/__tests__/operational-adapters.test.ts` — positive and negative binding/acceptance cases
- `operations/README.md` — document the deterministic pipeline and non-release remediation harness
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md` and `T16R-handoff.md` — append-only evidence

### Verification
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1`
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit --audit-level=high`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1`
- [x] `node scripts/build-spec005-t10-release-bundle.ts` against a labelled partial fixture fails closed and writes no bundle
- [x] Append exact commands, exit codes, blockers, artifacts, and recommendation to `execution/T16R.md`; write `T16R-handoff.md`; report `ready-for-review` to Orchestrator; completion reconciled by Orchestrator on 2026-07-23
- [x] Corrective output-contract remediation reconciled 2026-07-23 after the independent Terra High challenge: byte-zero/first-line enforcement, prompt assertions, missing-header and leading-prose/fenced-header staging regressions, and fresh proportionate verification all passed; no A-002 rerun or contract change occurred.

## Task T16R2: Enforce the runner-owned Praxen draft profile

**Priority:** P0  
**Estimate:** 4h plus bounded fixture/test time  
**Blocked By:** T16R (complete), approved design amendment A-004  
**Covers:** FR-003, FR-005, FR-006, FR-009, FR-012, FR-015, FR-016, FR-019, FR-020, NFR-003, NFR-004, NFR-005, NFR-007, TD-010, TD-011, TD-012  
**Delivers:** A version-pinned runner-owned Step 9.9 draft profile and skeleton that constrain Haiku to declared values and variable blocks, reject structural drift before conversion, and preserve the pinned Praxen converter/renderer and partial-state release boundary.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** The ticket crosses PowerShell raw-file validation, model write constraints, version/hash pinning, the installed Praxen grammar, real converter/renderer integration, and fail-closed release behavior.  
**High-tier Second Opinion:** `reconciled` — fresh visible read-only challenge `spec005-t16r2-implementation-readiness-challenge-20260723-root-01` in thread `019f9083-5d88-77f1-a12b-c76571d8e203` returned `AFFIRM` on 2026-07-23. It retained deep/high Sol routing and required structure-only PowerShell validation, dual profile/skeleton hash pinning, converter-owned field/schema negatives, all A-004 pre-converter structural negatives, and no provider/A-002/release mutation.  
**Freshness / Rollover:** Start only after task approval and challenge reconciliation in a newly created visible top-level Chat; checkpoint before compaction, missing usage telemetry, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; emit `blocked`, `contract-conflict`, or `verification-failed` immediately when applicable; only Orchestrator records authoritative completion.  
**Owned Surfaces:** new `operations/praxen/draft-profile-v1.json`, new `operations/praxen/draft-skeleton-v1.md`, `scripts/run-spec005-praxen-behavior-verifier.ps1`, `scripts/test-spec005-claude-haiku.ps1`, `scripts/test-spec005-praxen-boundary.ps1`, `operations/README.md`, new `execution/T16R2.md`, and new `execution/T16R2-handoff.md`.  
**Coordination:** T16R2 treats the installed Praxen plugin, converter, renderer, A-002 gate/selection/builder, collector/adapter, T13-T16 implementation, `.status`, shared tracking, and historical operational evidence as read-only. The worker may invoke the pinned converter/renderer and existing wrapper only as verification dependencies. Any need to modify the plugin, converter, renderer, wrapper, collector, gate, or builder is a `contract-conflict` returned before mutation.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2-handoff.md`

### Work
- [x] Add the Praxen `1.1.0` / manifest-format `1` profile and guidance skeleton with the exact authored heading order, fixed subsections/field markers, six-category order, and explicit variable-block slots.
- [x] Bind the runner plan/result to the profile version, skeleton hash, supported Praxen version, and manifest-format version; refuse missing, changed, or unsupported pairings.
- [x] Write the guidance skeleton into each fresh staging attempt before Haiku starts and make the prompt name the exact profile, skeleton, final draft path, allowed dynamic rule/finding headings, and no-extra/no-reorder/no-placeholder contract.
- [x] Add pre-converter structural validation for exact heading hierarchy/order, dynamic heading patterns/parents, unreplaced slots, `TBD` sentinels, tabs, fences, and structural comments without repairing or synthesizing model output.
- [x] Preserve the unchanged draft as the pinned converter input; leave unknown/missing fields, indentation, typed values, schema completeness, derived values, canonical JSON, and rendered output to the pinned Praxen tools.
- [x] Add labelled regressions for `## Target`, unknown subsection, duplicate/missing/reordered headings, placeholders, tabs/fences/comments, malformed dynamic blocks, converter-owned field/schema failures, positive real converter/renderer flow, partial pause, and no bundle promotion.
- [x] Document the profile boundary, version-update procedure, rollback, and explicit prohibition on production A-002 execution in this remediation task.

### Acceptance Criteria
- [x] The runner records and validates one supported profile/skeleton hash for Praxen `1.1.0` and manifest format `1`; a mismatch fails before model or converter promotion.
- [x] A valid skeleton-shaped draft reaches the real pinned converter and renderer and produces the existing runner-created operational binding without changing canonical or rendered content in PowerShell.
- [x] Added `## Target`, any unknown/duplicate/missing/reordered heading, malformed dynamic heading, unreplaced slot, `TBD`, tab, fence, or structural comment fails at `staging-structure-validation` before converter invocation.
- [x] Unknown/missing fields and typed/schema failures remain converter-owned; the runner does not duplicate the full Praxen parser, repair drafts, synthesize values, or accept model-authored JSON.
- [x] Any target failure remains explicit, operator-action-required, partial, paused before the second target, non-release-eligible, and unable to write a passing bundle or `current-release.json`.
- [x] Existing T16R and project verification remain green, and no provider canary, release token, operational A-002 run, current-release mutation, or Playwright release acceptance occurs.

### Files
- `operations/praxen/draft-profile-v1.json` — create the supported structural profile and exact heading/slot rules
- `operations/praxen/draft-skeleton-v1.md` — create the version-pinned guidance skeleton; never operational evidence
- `scripts/run-spec005-praxen-behavior-verifier.ps1` — bind, stage, prompt, and validate the profile before the pinned converter
- `scripts/test-spec005-claude-haiku.ps1` — assert plan/prompt/profile/hash and no-A-002 safeguards
- `scripts/test-spec005-praxen-boundary.ps1` — extend labelled real-runner positive and structural fail-closed cases
- `operations/README.md` — document profile ownership, upgrade/rollback, and release exclusions
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2-handoff.md`

### Verification
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1`
- [x] Focused labelled fixtures prove `## Target` and every A-004 structural negative fail before converter/render output and bundle promotion.
- [x] `node --test collector/__tests__/operational-adapters.test.ts`
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit --audit-level=high`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1`
- [x] `node scripts/build-spec005-t10-release-bundle.ts` against a labelled A-004 partial fixture fails closed and writes no bundle
- [x] `git diff --check`
- [x] Confirm no new `spec005-a002-t16-*` operational run, provider invocation, passing bundle, current-release write, or Playwright release acceptance.
- [x] Append exact lifecycle and verification evidence to `execution/T16R2.md`, write `execution/T16R2-handoff.md`, and return a stable `ready-for-review` recommendation to Orchestrator; authoritative completion reconciled 2026-07-23.

## Task T16R3: Check in the pre-token and local-readiness controls

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** Approved A-005 design; explicit task approval  
**Covers:** FR-002, FR-009, FR-012, NFR-001, NFR-002, NFR-004, A-005 Section 22.2, TD-013  
**Delivers:** One fixed PowerShell 5.1-compatible provider-resolution/canary launcher and one non-provider local-readiness check, eliminating improvised pre-token commands.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** Native `.exe`/`.ps1` resolution, bounded child-process I/O, authentication detection, strict marker parsing, and privacy-safe evidence make this a consequential Windows process-boundary task.  
**High-tier Second Opinion:** `reconciled` — fresh visible read-only challenge `spec005-t16r3-implementation-readiness-challenge-20260723-root-01` in thread `019f90e2-afad-7c33-86c5-88e54634cf49` returned `AFFIRM` on 2026-07-23. It retained the bounded Sol High worker shape and required provider-specific fake-shim coverage, explicit timeout/stream limits, auth-before-marker failure, exact provider vectors, strict marker cases, plan-only zero invocation, and non-provider local-readiness checks.  
**Freshness / Rollover:** New visible top-level worker; checkpoint before compaction, missing telemetry, ownership change, context uncertainty, or approximately 250k cumulative tokens.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; fail closed with a stable `blocked`, `contract-conflict`, or `verification-failed` event.  
**Owned Surfaces:** New `scripts/invoke-spec005-t16-pretoken.ps1`, `scripts/verify-spec005-t16-local-readiness.ps1`, `scripts/test-spec005-t16-pretoken.ps1`, `scripts/test-spec005-t16-local-readiness.ps1`, narrowly necessary `operations/README.md`, new `execution/T16R3.md`, and new `execution/T16R3-handoff.md`.  
**Coordination:** No real provider, canary, token, release run, matrix, producer, bundle, current-release, or Playwright invocation. Existing producer and release implementation is read-only.

### Work
- [x] Add a `-PlanOnly` pre-token launcher with canonical-directory `Get-Command` resolution, fixed provider arguments, `.exe`/`.ps1` hosting, closed stdin, timeout and stream bounds, private auth/marker inspection, and sanitized result facts.
- [x] Add a local-readiness script for required files, remits, collector directory selection, fixed producer entrypoints, runtime ports, and non-secret prerequisites.
- [x] Add fake command shims and labelled positive/negative cases for ambiguous/unsupported resolution, quoting, target environment, timeout, auth prompt, output bounds, BOM, line endings, exact markers, and plan-only zero invocation.
- [x] Add a Windows PowerShell 5.1 parse sweep covering all checked-in release scripts.

### Acceptance Criteria
- [x] The previously failing provider-resolution shape is represented by a regression and the checked-in launcher parses and executes deterministically.
- [x] Plan-only and fixture tests retain no provider response bodies, credentials, secrets, or unrestricted paths.
- [x] Any launcher, exit, timeout, auth, marker, environment, or readiness mismatch fails before token creation.

### Verification
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-pretoken.ps1`
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-local-readiness.ps1`
- [x] Windows PowerShell 5.1 parse sweep for checked-in release scripts
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- [x] `git diff --check`
- [x] Confirm zero provider invocation and zero A-002/release mutation.

**Completion Reconciliation:** Fresh Orchestrator review on 2026-07-23 found
and returned one false-green omitted-`ProjectRoot` defect. The same bounded
worker corrected both entrypoints and added non-project-cwd regressions.
Independent reruns passed both focused suites, the 25-file PowerShell 5.1
parse sweep, operations verification, and diff hygiene. The production
`-PlanOnly` path now reaches the approved ambiguity guard and correctly blocks
because this host exposes two distinct Codex executables; no provider was
invoked and this environmental ambiguity remains a pre-token operational
follow-up rather than a T16R3 implementation failure.

## Task T16R4: Establish one immutable release-run identity

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** Approved A-005 design; explicit task approval  
**Covers:** FR-002, FR-006, FR-012, FR-019, NFR-003, NFR-004, NFR-007, A-005 Section 22.3, TD-014  
**Delivers:** A fixed create-once release descriptor contract and creator/parser that bind the failure matrix, OTLP bridge, and Pi extension to one start time and runtime target. End-to-end authority is achieved only after T16R5, T16R6, and T16R7 migrate their separately owned consumers.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** This changes identity and time authority across TypeScript and external runtime processes; wrong binding would silently qualify stale or cross-run evidence.  
**High-tier Second Opinion:** `reconciled` — fresh visible read-only challenge `spec005-t16r4-corrected-readiness-challenge-20260723-001` in thread `019f9124-0b95-76d0-9178-e13074e937a9` returned `AFFIRM` on 2026-07-23. It affirmed the fixed create-once path, strict descriptor invariants, pre-listen/pre-registration identity, rebind refusal, provider-free fixtures, narrowed ownership, and T16R5-T16R7 dependency edges.  
**Freshness / Rollover:** New visible top-level worker with an early checkpoint under the standard rollover conditions.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; stable fail-closed events on any authority or verification conflict.  
**Owned Surfaces:** New `contracts/release-run-descriptor-v1.schema.json`, new `src/lib/release-run-descriptor.ts`, new `collector/__tests__/release-run-descriptor.test.ts`, new `scripts/new-spec005-t16-release-descriptor.ps1`, new `scripts/test-spec005-t16-release-descriptor.ps1`, `scripts/run-spec005-t10-failure-matrix.ts`, `operations/telemetry/otlp-bridge.ts`, `operations/telemetry/pi-extension.ts`, narrowly necessary `operations/manifests/release-run.example.json`, new `execution/T16R4.md`, and new `execution/T16R4-handoff.md`.  
**Coordination:** T16R3 is complete and read-only. Praxen/selection T16R5, builder T16R6, Pipelock/UI T16R7, shared tracking, historical evidence, and operational release state remain read-only.

### Work
- [x] Implement the fixed provider-free creator at `%LOCALAPPDATA%\SancusSight\operations\runs\<releaseRunId>\release-run.json`; create exactly once with exclusive semantics before producer capture and refuse existing/rewrite/run-root mismatch.
- [x] Implement strict BOM-free parsing with exactly `schemaVersion`, `releaseRunId`, `startedAt`, `runtimeTargetId`, and `purpose`; require version `1`, purpose `a002-t16`, bounded run ID, canonical UTC start, approved target, no unknown fields, and no legacy-manifest substitution.
- [x] Make the failure matrix consume descriptor start/target rather than `observedAt`, filesystem/import time, or stale/conflicting environment values.
- [x] Require OTLP to validate/expose descriptor identity before listen and Pi before handler registration/emission; bind each process to its first descriptor and refuse rebind.
- [x] Add provider-free pre-run, future, exact-deadline, one-millisecond-over, target mismatch, malformed/BOM, matrix/filesystem substitution, conflicting environment, exclusive-rewrite, and reused-process fixtures.

### Acceptance Criteria
- [x] The fixed creator emits one canonical descriptor without invoking a provider and deterministically refuses an existing file, rewrite, wrong run root, or legacy manifest.
- [x] Matrix `observedAt`, filesystem/import time, and stale/conflicting `SANCUSSIGHT_RELEASE_RUN_ID` or `SANCUSSIGHT_RUNTIME_TARGET_ID` cannot replace descriptor identity.
- [x] OTLP exposes matching identity before listen; Pi exposes matching identity before handler registration/emission; wrong-run/wrong-target/malformed/rewrite/rebind cases emit no qualifying telemetry.
- [x] T16R4 migrates only creator/parser, matrix, OTLP, and Pi. T16R5-T16R7 retain exclusive ownership of end-to-end Praxen, builder/selection, and acceptance migration.

### Verification
- [x] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-release-descriptor.ps1`
- [x] `node --test collector/__tests__/release-run-descriptor.test.ts`
- [x] `node --test collector/__tests__/runtime-telemetry-producers.test.ts`
- [x] `node --test collector/__tests__/release-gate.test.ts`
- [x] `npm run verify:t10-matrix`
- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `git diff --check`
- [x] Confirm no provider, token, A-002 run, or current-release mutation.

**Completion Reconciliation:** Fresh Orchestrator review on 2026-07-23
inspected the strict descriptor/parser, exclusive creator, descriptor-derived
matrix, and pre-listen/pre-registration OTLP/Pi bindings. Independent reruns
passed the labelled isolated 15/15 matrix, descriptor tests 7/7, runtime
producer tests 7/7, release-gate tests 16/16, collector tests 92/92, core,
build, operations verification, and diff hygiene. No provider, token,
operational A-002 run/matrix, bundle, current-release mutation, or Playwright
activity occurred. T16R4 is complete; T16R5 and T16R7 are now unblocked, with
T16R5 selected as the dependency-critical frontier.

## Task T16R5: Align Praxen operational compatibility and privacy

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T16R4  
**Covers:** FR-003, FR-009, FR-010, FR-020, NFR-002, NFR-005, NFR-007, A-005 Sections 22.4-22.5  
**Delivers:** Compatible `t16r2-v1` adapter ingestion, sanitized runner-owned workspace identity, and an explicit two-target operational wrapper mode that is eligible only on a complete pass.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** The task crosses raw draft privacy, pinned conversion, runner bindings, adapter schemas, per-target selection, and fail-closed wrapper state.  
**High-tier Second Opinion:** `challenged` — fresh visible read-only challenge `spec005-a005-t16r5-readiness-challenge-20260723-root-02` in thread `019f9141-56cd-7ad3-9ee5-f2d62dbe5e2d` found four unresolved binding, privacy, wrapper-result, and integration-test details. Correct the approved task contract with explicit operator approval, then obtain a fresh corrected `AFFIRM` before dispatch.  
**Freshness / Rollover:** New visible top-level worker with standard early-rollover controls.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; stable fail-closed event on contract conflict or failed integration evidence.  
**Owned Surfaces:** `operations/praxen/draft-skeleton-v1.md`, narrowly necessary profile metadata, `scripts/run-spec005-praxen-behavior-verifier.ps1`, `scripts/run-spec005-t16-remediation.ps1`, `scripts/test-spec005-claude-haiku.ps1`, `scripts/test-spec005-praxen-boundary.ps1`, `collector/adapters/praxen.ts`, `collector/__tests__/operational-adapters.test.ts`, new runner-adapter integration fixture/test, new `execution/T16R5.md`, and new `execution/T16R5-handoff.md`.  
**Coordination:** Installed Praxen converter/renderer, descriptor implementation, builder, release state, and shared tracking remain read-only.

### Work
- [ ] Accept current `t16r2-v1` bindings while retaining historical `t16r-v1` read compatibility and exact run/target/remit/version/hash checks.
- [ ] Make skeleton workspace identity a runner-owned sanitized target role and reject Windows, POSIX, and home-directory path values before canonical or operational output.
- [ ] Add explicit `remediation` and descriptor-bound `operational` wrapper modes; only two matched passed targets may set `releaseEligible: true`.
- [ ] Feed real fake-producer runner output into the production adapter and target-selection seam.

### Acceptance Criteria
- [ ] The former runner/adapter false-green is impossible: a real current runner result is accepted only when fully bound and its mismatches fail visibly.
- [ ] Identifying paths cannot enter draft retention, canonical findings, operational projection, or promoted output.
- [ ] Partial, failed, blocked, and exception results pause, require operator action, skip the second target when required, and remain non-release-eligible.

### Verification
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1`
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1`
- [ ] `node --test collector/__tests__/operational-adapters.test.ts`
- [ ] Focused real runner-output-to-adapter integration test
- [ ] `npm run test:collector`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] Confirm no provider, operational A-002, bundle promotion, or current-release write.

## Task T16R6: Make bundle construction owned and atomic

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T16R4, T16R5  
**Covers:** FR-006, FR-009, FR-010, FR-011, FR-019, FR-020, NFR-002, NFR-003, NFR-004, NFR-007, A-005 Section 22.6, TD-015  
**Delivers:** Descriptor-bound, T16-owned bundle construction with one canonical data root and bundle-first, manifest-last atomic promotion.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** Filesystem failure ordering, privacy readback, environment compatibility, and current-release atomicity are high-impact release-state concerns.  
**High-tier Second Opinion:** `pending` — obtain and reconcile one fresh visible read-only challenge before dispatch.  
**Freshness / Rollover:** New visible top-level worker with standard early-rollover controls.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; stable fail-closed event for any partial output or state divergence.  
**Owned Surfaces:** `scripts/build-spec005-t10-release-bundle.ts`, new `scripts/test-spec005-release-builder.ts`, its labelled isolated fixtures, new `execution/T16R6.md`, and new `execution/T16R6-handoff.md`.  
**Coordination:** Descriptor, Praxen, collector ingestion, UI, producer scripts, historical bundles, and current-release remain read-only except within labelled isolated temporary fixtures.

### Work
- [ ] Read start/target only from the descriptor and require a passing operational Praxen wrapper result.
- [ ] Use `SANCUSSIGHT_DATA_DIR` canonically; accept the legacy alias only when canonical is absent and reject conflicting values.
- [ ] Validate T16 bundle destinations under `a002-t16-*`.
- [ ] Build and independently readback/privacy-check a same-parent temporary bundle, atomically install it, then atomically replace the current manifest last.
- [ ] Add failure injection before completion, during final move, and before manifest replacement with cleanup limited to owned temporary paths.

### Acceptance Criteria
- [ ] No failure can leave `current-release.json` pointing to a missing or incomplete bundle.
- [ ] Start-time drift, data-root conflict, wrong prefix, partial Praxen state, privacy failure, and readback mismatch all write no passing output.
- [ ] Historical current-release and bundles remain byte-for-byte unchanged in every negative fixture.

### Verification
- [ ] Focused builder ownership, descriptor, data-root, and atomic-failure tests
- [ ] Labelled complete and partial end-to-end fixture through gate and builder
- [ ] `npm run test:collector`
- [ ] `npm run verify:core`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=high`
- [ ] `git diff --check`
- [ ] Confirm no actual current-release mutation or A-002 run.

## Task T16R7: Fix producer launch and T16 UI acceptance

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T16R3, T16R4  
**Covers:** FR-004, FR-010, FR-012, NFR-001, NFR-004, NFR-006, A-005 Section 22.7  
**Delivers:** Fixture-proven bounded Pipelock provider launch and one deterministic desktop/mobile complete/degraded acceptance harness with isolated state and teardown.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `standard`  
**Host Model:** `gpt-5.6-terra`  
**Effort:** `medium`  
**Model Reason:** The task integrates two established seams with explicit fixtures; it is consequential but bounded by the approved launcher and descriptor contracts.  
**High-tier Second Opinion:** `not-required` — selected routing is below Sol High.  
**Freshness / Rollover:** New visible top-level worker with standard early-rollover controls.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; stable failure event on launch, fixture, browser, teardown, privacy, or ownership error.  
**Owned Surfaces:** `scripts/run-spec005-pipelock-exercise.ps1`, new `scripts/test-spec005-pipelock-launch.ps1`, new `scripts/run-spec005-t16-ui-acceptance.mjs`, new isolated T16 UI fixtures under `scripts/fixtures/`, narrowly necessary `package.json`/`package-lock.json` changes, bounded non-release test output, new `execution/T16R7.md`, and new `execution/T16R7-handoff.md`.  
**Coordination:** No real provider, Pipelock enforcement, token, release run, current-release, or operational Playwright acceptance. Product UI code is read-only unless a fixture incompatibility is returned as a contract conflict.

### Work
- [ ] Resolve and invoke Claude through the approved bounded transport instead of direct unresolved `& claude`; prove environment, timeout, stdin, and private-stream behavior with a fake provider.
- [ ] Add a fixed acceptance harness defining isolated server/collector roots, ports, complete/degraded descriptors and manifests, desktop/mobile sizes, console/network/focus/reduced-motion/overflow checks, screenshots, and teardown.
- [ ] Ensure fixtures cannot mutate or depend on the operator's current release and cannot improvise timing near the 30-minute boundary.

### Acceptance Criteria
- [ ] Pipelock launch semantics match the pre-token transport contract and fail closed without retained bodies.
- [ ] The harness deterministically proves complete and degraded states at desktop/mobile widths with no external network requests, console errors, horizontal overflow, inaccessible keyboard flow, or running reduced-motion animations.
- [ ] Teardown removes only isolated harness processes and paths.

### Verification
- [ ] Focused fake-provider Pipelock launch tests
- [ ] Fixed T16 UI acceptance harness in isolated fixture mode
- [ ] `npm run verify:core`
- [ ] `npm run build`
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- [ ] `git diff --check`
- [ ] Confirm no provider, enforcement, A-002 run, or current-release mutation.

## Task T16: Revalidate A-002 with a new operational release run

**Priority:** P0  
**Estimate:** 4h plus bounded external producer time  
**Blocked By:** T16R3, T16R4, T16R5, T16R6, T16R7, fresh post-remediation high-tier challenge, new explicit one-shot release-run authorization  
**Covers:** FR-002 through FR-020, NFR-001 through NFR-007, TD-009, TD-013 through TD-015  
**Delivers:** Fresh, sanitized, independently reviewable evidence showing whether all five categories, all three runtimes, both Praxen targets, trusted verification, and all failure/recovery cases pass under A-002.  
**Session Policy:** `new-top-level-required`  
**Tracking Owner:** `orchestrator`  
**Model Class:** `deep`  
**Host Model:** `gpt-5.6-sol`  
**Effort:** `high`  
**Model Reason:** The task coordinates multiple external producers, security/privacy boundaries, timing, fail-closed evidence, and final readiness claims; it requires the strongest reasoning and verification discipline.  
**High-tier Second Opinion:** `pending` — the pre-A-005 challenge is historical and cannot authorize the changed release path; obtain and reconcile a fresh visible read-only challenge after T16R3-T16R7 complete.  
**Freshness / Rollover:** Start only after T16R3-T16R7 reconciliation and new one-shot authorization in a new visible worker Chat; checkpoint early before compaction, missing usage telemetry, provider delays, ownership change, context uncertainty, or approximately 250k cumulative tokens. A rollover must use another new visible top-level Chat.  
**Expected Lifecycle:** `acknowledged -> started -> ready-for-review`; emit `blocked`, `contract-conflict`, or `verification-failed` with exact evidence immediately; only Orchestrator records authoritative `completed` or final readiness.  
**Owned Surfaces:** New run-scoped data under `%LOCALAPPDATA%/SancusSight/operations/runs/<new-run-id>/`, new sanitized bundles and QA evidence matching `artifacts/qa/spec005/a002-t16-*`, permitted current-release manifest output only after a complete passing atomic promotion, Playwright evidence matching `output/playwright/spec005-a002-t16-*`, `execution/T16.md`, and `execution/T16-handoff.md`.  
**Coordination:** T16 treats all implementation and checked-in orchestration controls as read-only. It may generate one new operational run only after authorization; implementation or contract defects return to Orchestrator for a newly planned remediation ticket.  
**Execution Record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`  
**Worker Handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`

### Work
- [ ] Run the checked-in local-readiness and pre-token controls, then create exactly one immutable descriptor/token; stop and report any failure or provider authentication/authorization prompt.
- [ ] Produce new run-bound Codex CLI, Claude Code, and Pi telemetry; both approved Praxen canonical reports; trusted Pipelock allow/block evidence; passing RAMPART evidence; and exact-scope completed AIMap evidence.
- [ ] Run all 15 required failure/recovery cases without relabeling, copying, timestamp-rewriting, or combining historical evidence.
- [ ] Build and atomically promote the A-002 manifest and sanitized bundle, then independently recalculate the gate and privacy-scan retained artifacts.
- [ ] Use the fixed T16 acceptance harness for complete and degraded UI states at desktop/mobile sizes and retain only bounded screenshots and evidence summaries.
- [ ] Perform Spec and Standards review against approved requirements, design, and these tasks; update tracking only after fresh verification.

### Acceptance Criteria
- [ ] The manifest references only authentic operational evidence from the new token and completes within the shared 30-minute boundary.
- [ ] Both Praxen targets qualify independently with their real producer timestamps and paired Worker Remit hashes.
- [ ] All five source categories, three runtimes, trusted receipt checks, source-specific checks, and 15 failure/recovery rows pass; otherwise the run fails closed with exact blockers and writes no passing bundle.
- [ ] Retained evidence contains no prompts, responses, reasoning, credentials, private keys, raw scan payloads, unrestricted output, or identifying absolute paths.
- [ ] Product readiness changes only if the complete newly verified A-002 gate passes; prior T10 evidence remains historical.

### Files
- `artifacts/qa/spec005/a002-t16-*` — new sanitized run evidence only
- `%LOCALAPPDATA%/SancusSight/operations/runs/<new-run-id>/` — operator-side bounded run state
- `%LOCALAPPDATA%/SancusSight/operations/manifests/current-release.json` — written only after a passing gate
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, and `.ai/sdd/handoff/spec005-a002-master-context.md` — Orchestrator-only reconciliation surfaces after fresh completion evidence

### Verification
- [ ] `npm run test:collector`
- [ ] `npm run verify:core`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=high`
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- [ ] `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1`
- [ ] `npm run verify:t10-matrix`
- [ ] `node scripts/build-spec005-t10-release-bundle.ts`
- [ ] Playwright operational desktop/mobile acceptance and independent privacy review
- [ ] Append every exact command, exit code, result, blocker, artifact, and recommendation to `execution/T16.md`, write `execution/T16-handoff.md`, and report `ready-for-review` to Orchestrator

## Verification Evidence

Populate this section during implementation. No task checkbox is complete without fresh command output, artifact evidence, or a documented manual observation tied to the task and release run.

### T13 completion evidence — 2026-07-21

- The independent challenge affirmed the approved T13 contract and identified no requirements/design conflict. The operator explicitly authorized execution in the current task instead of a new visible Chat; no hidden worker or subagent was used.
- `ReleaseRequiredTargetV1`, target-level gate results, paired manifest validation, parent-summary consistency, and ambiguous legacy multi-target rejection are implemented.
- The gate now uses `RELEASE_RUN_WINDOW_MS` for authentic producer-observed evidence and orchestration, validates completion/evaluation boundaries, and applies the same predicate independently to paired targets and Codex/Claude/Pi runtime evidence.
- Focused `node --test collector/__tests__/release-gate.test.ts` passed 16/16. Full `npm run test:collector` passed 79/79; `npm run verify:core` and `npm run build` passed.
- Detailed lifecycle and verification evidence is retained in `execution/T13.md` and `execution/T13-handoff.md`. Product readiness remains **Not ready for release**; T14 is the next frontier.

### T14 completion evidence — 2026-07-21

- Pure per-target selection retains complete canonical groups, resolves ties deterministically, excludes unapproved targets, and fails before bundle output on missing/mismatched targets.
- The builder emits paired `requiredTargets` and derived parent summaries; the example and operations verifier require both approved Praxen target/remit pairs.
- Focused selection tests passed 2/2; full collector tests passed 81/81; core verification, build, and operations verification passed. T15 is the next frontier.

### T10 completion evidence - 2026-07-18 release run `spec005-t10-20260718b`

- `npm run verify:t10-matrix` passed all 15 mandatory source-isolated failure/recovery cases: producer and bridge stopped, Pi extension disabled, malformed and privacy-unsafe runtime events, inaccessible artifact, unsupported format, invalid Pipelock signature, RAMPART execution error, out-of-scope AIMap, collector restart, duplicate replay, rotation/replacement, source-version mismatch, and fresh successful recovery. Retained evidence survived each failure and restart; a failed source did not invalidate unrelated sources.
- One tightly sequenced manifest bound five operational categories and all three real runtimes inside the five-minute window. Codex CLI `0.144.3`, Claude Code `2.1.214`, and Pi `0.80.10` supplied metadata-only runtime telemetry; Praxen `1.1.0` bound both approved targets/remits; Pipelock `3.1.0` supplied a verified allow/block chain; RAMPART `0.1.0` supplied a safe completed governed-agent run; and pinned AIMap commit `65c820cbdad3da449f49aedb70055ca5ed4fa0ce` supplied the authorized loopback Ollama fingerprint finding.
- `artifacts/qa/spec005/t10-release-spec005-t10-20260718b/release-manifest.json` and `gate-result.json` record `status: passed`, `ready: true`, five current source gates, Codex/Claude/Pi coverage, all failure rows passed, zero blockers, and zero untested boundaries at `2026-07-18T14:39:01.908Z`. The live UI later changed to `Release evidence expired` without mutating the stored pass, proving truthful point-in-time degradation.
- The sanitized bundle contains only the manifest, its referenced normalized evidence, failure matrix, gate result, and boundary README. A precise privacy scan found no credential/private-key/prompt/response/reasoning/tool-content/raw-payload JSON keys and no identifying absolute user paths.
- Playwright verified the passed and later expired states at desktop and 390x844 mobile widths, source/runtime/failure provenance, zero console errors or warnings, loopback/same-origin network behavior only, keyboard navigation, reduced motion with zero running animations, and no horizontal overflow. Screenshots are `output/playwright/spec005-t10-desktop.png` and `output/playwright/spec005-t10-mobile.png`.
- Standards review found one manifest-provenance mismatch before approval: source cards could select an unrelated newer operational ledger record. The implementation now resolves cards, runtime provider labels, and the gate from the same manifest-referenced evidence set; a regression test protects this boundary. No remaining Spec or Standards finding blocks approval.
- Final corrected-state verification passed `npm run test:collector` (63/63), `npm run verify:core`, `npm run build`, and `npm audit` (zero vulnerabilities). `scripts/verify-operations.ps1`, `scripts/test-operations.ps1`, and `scripts/test-rampart-export.ps1` also passed during the run.

### T10 fresh-window revalidation - 2026-07-18 release run `spec005-t10-20260718c`

- The fresh Praxen conversion/render/bind path produced 17 normalized records for the two already-approved targets and Worker Remits, with zero schema errors and zero collector rejections. The pinned RAMPART/Pi no-tools workflow passed one safe result and the authorized AIMap loopback Ollama fingerprint run passed one informational finding; both were sanitized before collector ingestion.
- Fresh runtime telemetry retained seven Codex CLI events and seven Pi lifecycle events with `contentCapture: false`. The fixed Claude Code invocation returned exit code 1 with a JSON result marked `is_error: true` after one turn; no Claude runtime envelope was accepted. The controlled Pipelock invocation likewise exited 1 before producing a tool allow/block pair; its producer-owned chain contains only the session-open receipt, so no qualifying Pipelock envelope was accepted.
- `npm run verify:t10-matrix` passed all 15 mandatory source-isolated failure/recovery cases. The collector reached current for Praxen, runtime telemetry, RAMPART, and AIMap after the AIMap authorization manifest was placed beside its sanitized export; the release bundler correctly refused to build because Claude runtime evidence (and the fresh Pipelock allow/block proof) was missing.
- Fresh regression evidence passed `npm run test:collector` (69/69), `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-rampart-export.ps1`. The existing mobile source-rail contract-arrow fix also passed build/core and browser checks; it does not alter release qualification.
- Verdict: Not ready for release. `.status` remains `review:done`; no historical pass was relabeled. The exact blockers are fresh Claude Code runtime telemetry and a fresh verified Pipelock allow/block chain in the same run window. No sanitized release bundle was generated for this run.
- Operator clarification: the Claude Code failure was caused by the account exceeding its Claude usage limit. This is an external operator-domain blocker; no SancusSight change can resolve it. Re-run the same approved window after the limit resets or Claude access is restored.

### T10 qualifying fresh-window revalidation - 2026-07-18/19 release run `spec005-t10-20260718e`

- The Claude usage limit had reset. The bounded retry used the already-approved fixed no-tool Claude session with explicit logs-only OTLP and all prompt, assistant-response, tool-detail, tool-content, raw-body, trace, and metric capture disabled. The bridge accepted sanitized Claude metadata; no prompt, response, reasoning, tool payload, credential, or raw body entered runtime evidence.
- The same approved Pipelock `claude-code/findmnemo-routing` workflow produced a verified signed chain with three allows, one controlled block, one tool allow, and one tool block. Pipelock `verify-receipt` and standalone `pipelock-verifier audit-packet` passed; the final packet hash was `b6714706deda121e9f540f548d723046a0f8715e5c2d2ccbf2b3f9068144b465`, root hash `7fe484072a626ff1d7fdd40e7d65dfbf93d9997c7774d784238b88f52c9e7f21`, and trusted signer fingerprint `78ef57aa4e71392f6d3fb0e1ac80900a5d95dda8d44465d34775ce5eb08fc91c`.
- Praxen `1.1.0` regenerated both already-approved target reports (4 SancusSight findings/95 rules and 7 sdd-exec findings/91 rules), rendered with zero schema errors, and bound them to run `spec005-t10-20260718e` with configuration hash `800c2ba8b0985f2d88ff2f788d2678bcde3faa1cc7b3a32eaf5ba4f416408aaf` and the approved Worker Remit hashes. RAMPART `0.1.0` ran the pinned Pi `0.80.10` no-tools workflow: one safe result, zero unsafe/undetermined/errors. AIMap's pinned commit `65c820cbdad3da449f49aedb70055ca5ed4fa0ce` ran only the authorized fingerprint template against operator-owned loopback `127.0.0.1:11434`; the export contained one informational finding.
- Codex CLI, Claude Code, and Pi each produced fresh provider-truthful metadata-only evidence in the same run. The collector accepted 33 Codex, 62 Claude, and 21 Pi operational runtime records across the refresh sequence; the bundle selected one current record per required runtime and retained `contentCapture: false`.
- With `SANCUSSIGHT_RELEASE_RUN_ID=spec005-t10-20260718e`, `npm run verify:t10-matrix` passed all 15 mandatory failure/recovery cases. `node scripts/build-spec005-t10-release-bundle.ts` generated `artifacts/qa/spec005/t10-release-spec005-t10-20260718e/` with `status: passed`, `ready: true`, five source categories, three runtimes, zero blockers, and all failure rows passed. The live manifest is point-in-time evidence; after its five-minute window elapsed, the UI correctly changed to `Release evidence expired` without mutating the bundle.
- Fresh verification passed `npm run test:collector` (69/69), `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-rampart-export.ps1`. Bundle privacy validation found zero prohibited JSON keys and zero identifying absolute paths. The bounded referenced-evidence text contains only ordinary metadata words such as “prompt-enforced” and the evaluator name `response-contains-0.1.0`, not retained content.
- Playwright verification used the live loopback collector at desktop 1440x1000 and mobile 390x844. Both states showed the truthful expired gate, all three runtime labels, all five source rows, and all 15 passed failure rows; console errors/warnings were zero, API requests were loopback `200` responses only, document width matched viewport width, Tab focus was a visible 2px outline, and the mobile source rail collapsed to the blue contract bar and expanded via the native `Expand evidence connections` button. Screenshots: `output/playwright/spec005-t10-desktop-fresh.png` and `output/playwright/spec005-t10-mobile-fresh.png`.
- Standards and Spec reviews remain passing; no approved requirements or design were changed, no new producer authority was added, and `.status` remains `review:done`. The current product claim is **qualifying point-in-time release evidence, not a perpetual release-ready state**; any later readiness claim requires another fresh run.

### T10 bounded retry - 2026-07-18/19 release run `spec005-t10-202607182216`

- Pi support remained provider-truthful: the fixed Pi no-tools/RAMPART path passed, and the collector retained Pi lifecycle metadata without content capture. Codex and Pi operational runtime evidence was accepted for this run; no Claude runtime envelope was accepted.
- The 15-case source-isolated failure/recovery matrix passed (`observedAt` `2026-07-19T05:39:32Z`). Collector refresh accepted the run's Pipelock, RAMPART, AIMap, and SancusSight Praxen projections; the approved `sdd-exec` Praxen target was not regenerated.
- `npm run test:collector` passed 69/69, `npm run verify:core`, `npm run build`, and `npm audit` passed with zero vulnerabilities. The release bundler refused to create a bundle because required run-scoped evidence was missing.
- The approved `sdd-exec` Praxen retry and fresh Claude telemetry were blocked by the external Claude Code session limit (`resets 1:30am America/Vancouver`). No stale evidence was relabeled and `.status` remains `review:done`; SancusSight remains **Not ready for release**.

### T10 bounded retry - 2026-07-19 release run `spec005-t10-202607190215`

- Both approved Praxen targets completed fresh canonical scans: SancusSight at `2026-07-19T09:30:29Z` (7 findings) and `sdd-exec` at `2026-07-19T09:30:53Z` (11 findings). The sanitized operational projections were corrected to the exact current Worker Remit hashes, and collector refresh accepted 26 operational Praxen records at `2026-07-19T09:49:43Z` with the two target IDs retained.
- Fresh Pipelock produced a signed allow/block chain at `2026-07-19T09:44:52Z` (three allows, one block, one tool allow, one tool block). RAMPART/Pi `0.80.10` passed one safe no-tools result at `2026-07-19T09:45:17Z` with zero unsafe, undetermined, or error outcomes. AIMap completed its authorized loopback fingerprint at `2026-07-19T09:44:28Z`. Runtime telemetry retained provider-truthful metadata-only records for Codex CLI, Claude Code, and Pi through `2026-07-19T09:47:42Z`, with `contentCapture: false`.
- The mandatory source-isolated failure/recovery matrix passed all 15 cases. The release bundler correctly refused to create a bundle because the Praxen scans, Pipelock, and AIMap evidence had aged beyond the five-minute freshness boundary by evaluation time (`praxen:stale-evidence`, `pipelock:stale-evidence`, `aimap:stale-evidence`). No timestamps or historical evidence were relabeled.
- A fresh Claude rerun was attempted after the stale-window diagnosis but the external Claude account again reported `You've hit your session limit · resets 7:10am (America/Vancouver)`. A Pi-assisted verifier attempt did not produce a canonical Praxen findings artifact and is not counted as evidence. This is an operator-domain availability blocker, not a SancusSight qualification pass.
- The bounded OTLP projection fix allowlists only the safe metadata key `http.response.status_code` (alongside existing bounded reasoning/length metadata); the collector test now explicitly covers it. `npm run test:collector` passed 69/69, `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-rampart-export.ps1` passed. `.status` remains `review:done`; SancusSight remains **Not ready for release**.

### T10 bounded retries - 2026-07-19 follow-up attempts

- Run `spec005-t10-202607191002` completed both canonical Praxen reports (SancusSight `2026-07-19T17:02:02Z`, 5 findings; `sdd-exec` `2026-07-19T17:00:59Z`, 7 findings), but no same-window five-source bundle was generated before those observations aged out.
- A lower-effort Haiku retry produced a clean SancusSight Praxen report at `2026-07-19T17:15:49Z` (0 findings, 55/55 remit rules verified) and a separate `sdd-exec` report at `2026-07-19T17:10:20Z` (3 findings). They belong to different run tokens and cannot be combined into release evidence.
- The parallel `spec005-t10-202607191022` retry generated only Praxen draft checkpoints before Claude reported `You've hit your session limit · resets 2:50pm (America/Vancouver)`. Its fast Pipelock, RAMPART/Pi, and AIMap producers completed, but without both canonical Praxen reports the run is non-qualifying. The matrix initially observed a filesystem-timing artifact-rotation miss, then passed all 15 cases on immediate rerun; the transient first result was retained, not overwritten.
- Fresh local verification remains green: `npm run test:collector` passed 69/69, `npm run verify:core`, `npm run build`, and `npm audit` (0 vulnerabilities) passed. No evidence was relabeled or combined across run IDs; `.status` remains `review:done` and SancusSight remains **Not ready for release**.

### T8/T9 completion evidence - 2026-07-18 real Pipelock, Pi/RAMPART, and AIMap runs

- The operator explicitly approved Claude Code's user-scoped `findmnemo-routing` stdio MCP path. Only that server command was temporarily wrapped; unrelated Claude MCP/network traffic was not routed. Claude loaded and called `mcp__findmnemo-routing__recommend_route` through Pipelock in audit and balanced modes. The original `%USERPROFILE%/.claude.json` was restored byte-for-byte after each phase.
- One balanced Claude session produced a single signed chain with four receipts: session open allow, `recommend_route` allow, the same tool blocked on a harmless synthetic DLP marker, and session close allow. Pipelock `verify-receipt` validated the chain against the pinned public key; standalone `pipelock-verifier audit-packet` passed schema, chain, and cross-check validation with signer fingerprint `78ef57aa4e71392f6d3fb0e1ac80900a5d95dda8d44465d34775ce5eb08fc91c`, packet hash `86712f808a2ace81f2e45ac10c8a89a26aecb3ecd6f362c1787cc4db8bbdcdd4`, and root `33fd364b96774346286e1467ee3fe538035d0386f7c7c51b5c358239f6cb60cd`.
- Pipelock failure/recovery was explicit: environment stripping initially prevented FindMnemo's Windows credential-store adapter from starting, then recovered by passing only `LOCALAPPDATA`, `APPDATA`, and `USERPROFILE`. Pipelock 3.1.0 also failed closed when its auto-enabled initialization scan required a receipt before assigning an action ID; the bounded workaround kept signing/flight recording enabled while setting `require_receipts: false` for initialization. Actual allow/block decisions emitted signed receipts and verified independently. The packet honestly records Windows stdio-only posture and unmediated paths.
- Live collector evidence ID `f276097d1b58d8c6d2761c0b8602f74bcaff7f3441ba62eeb9c2404e78372928` is `verified` and `operational` for `claude-code/findmnemo-routing`, release run `spec005-t7-20260717-runtime`, with three allows and one controlled block. Operational qualification is carried by the packet-hash-bound verification sidecar so the official Audit Packet remains schema-valid.
- The fixed Pi/RAMPART suite ran real Pi CLI `0.80.10` with tools, extensions, skills, prompt templates, context files, approvals, and session persistence disabled. Explicit free model `openrouter/openai/gpt-oss-20b:free` recovered from the default model's quota failure. RAMPART recorded one safe result, zero unsafe, zero undetermined, and zero errors. Sanitized export hash `bb9abb07958ba04df913f0fe1a17244d1af21bb3d490b490f2166b121eb66d79` produced live operational/pass evidence ID `95b109f54cf420881bac98d20677677fe41b84dc232fc7f9703bc3abe9c163fd` for `pi-cli-fixed-no-tools`.
- AIMap's pinned `NucleiRunner` at commit `65c820cbdad3da449f49aedb70055ca5ed4fa0ce` used native Nuclei `3.11.0` SHA-256 `97bb4ab693b60dd5939c284f62fe2a7b89f010ead168d127333b34d9f186e198`. A two-hour authorization limited execution to fingerprint-only `GET /` on operator-owned `http://127.0.0.1:11434`; no model enumeration, prompt leak, attack, extraction, or scope expansion ran. Sanitized export hash `260e25192480257f87ca04a460d8715ca6f184d5de74d55c7e9da297ecb5501d` produced live operational evidence ID `80c3d4bbb6e8aa0460305d1f25ff37581fa99696ced8f72ce4e2d3e9e3239340` for `loopback-ollama-11434`.
- Fresh verification passed: `npm run test:collector` (60/60, including the 100,000-event case), `npm run verify:core`, `npm run build`, `npm audit` (zero vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-rampart-export.ps1`. Standalone Pipelock packet verification returned valid/trusted with schema, chain, and cross-check pass.
- Playwright at 1440x1000 and 390x844 displayed Pipelock, RAMPART, and AIMap as `Current` with exact accepted evidence summaries; console errors/warnings were zero, observed API requests returned 200, mobile horizontal overflow was false, keyboard focus was visible, and reduced-motion emulation was active. T8 and T9 are complete. `.status` remains `implementation:in-progress`; T10 and the same-window five-category failure/recovery release gate remain incomplete, so SancusSight is not release-ready.

### T8/T9 partial evidence - 2026-07-18 pinned setup and collector slice

- Pipelock `3.1.0` was built in user scope from exact official release commit `e8a396d244af27b1367e116fa22fc61246884ab3`; the release tag cannot be installed with `go install` because upstream retains an unversioned module path for its v3 tag. The pinned binaries report `3.1.0`; SHA-256 is `6f398eda36e4f408d6766989d907429c53f700a9b0b7d2469f69749fdc53e7e0` for `pipelock.exe` and `f6da87ef1b3c1bc4dca3d6bed302db3dd88310fd5d5392f15f6cb4edf088228d` for the standalone verifier.
- Producer-owned audit and balanced configs validate successfully with signed receipts required. The Ed25519 private key remains outside SancusSight; only trusted signer fingerprint `05bf99b75786a688d1043c3f4a1d7ace6b3dcc3e1a3fe3bafc362242365c2d26` enters the scope record. Read-only Pipelock discovery found four unprotected stdio MCP paths with zero parse errors. No workflow has been selected or routed; `pipelock-workflow.json` truthfully remains `explicit-operator-selection-required`, so T8 is incomplete.
- RAMPART `0.1.0` was installed from official release commit `334f8ab04a576289bd655fce1a2ac604bd7af89e` in a frozen `uv` environment with Python `3.12.13`, pytest `9.0.3`, and PyRIT `0.13.0`; lock SHA-256 is `e108ca2b8bd2df9daba13e60a71cf556ea1ee63211c426d7fd0d7abf97d1bdf1`.
- The approved fixed RAMPART collector test made one read-only request to `http://127.0.0.1:43117/api/v1/status`. Official RAMPART report `run_report_2026-07-18T06-58-32.json` recorded 1 safe result, 0 failures, 0 undetermined, and 0 errors with zero retained turns. The corrected official-sink sanitizer emitted BOM-free allowlisted JSON, and live collector ingestion accepted evidence ID `73f4f0262c37999e9a667a589d8dab3958d2fed9deaae0f2292f5984f10bea1c` as operational/pass for target `sancussight-collector-loopback-43117` and release run `spec005-t7-20260717-runtime`.
- `scripts/test-rampart-export.ps1` passed against an official-sink fixture containing safe, unsafe, undetermined, and error results plus deliberately private turns; all four statuses survived while turns, prompts, responses, tool calls, arguments, and private markers did not. `npm run test:collector` passed 60 tests, including RAMPART all-outcome acceptance and conversation-bearing report rejection.
- AIMap is pinned to exact Bishop Fox commit `65c820cbdad3da449f49aedb70055ca5ed4fa0ce`. Its backend image built as digest `sha256:aaf0fb2f8436d1ffde0ea84062952fefc9ae00bbc15eb7a184c6f4abd2e51ff0` with Python `3.12.13`, Nuclei `3.11.0`, and httpx `1.10.0`. Upstream verification returned 62 passed, 1 failed, and 6 skipped; the failure is the upstream Shodan query-key expectation. The upstream frontend also fails TypeScript compilation because `ClerkProvider` omits its required `publishableKey`. No auth was configured, no service was started, and no scan ran.
- T9 remains incomplete: the operator-used RAMPART workflow is not selected, and AIMap still requires explicit exact expiring authorization. A safe detected candidate is the operator-owned Ollama listener at `127.0.0.1:11434`; it has not been scanned.
- Fresh slice verification passed: `npm run test:collector` (60/60), `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, `scripts/test-operations.ps1`, and `scripts/test-rampart-export.ps1`. The project registry was refreshed against canonical root `C:\Users\henry\sancussight`. `.status` remains `implementation:in-progress`; no readiness claim changed.

### Amendment note - 2026-07-17

- T1-T6 completion evidence below remains historical evidence for the original approved implementation and is not rewritten.
- The approved Windows/WSL and Pi expand-contract design adds T6A as the current frontier and redefines T7/T10 acceptance for three-runtime coverage.
- No prior Agent Beacon evidence may be relabeled as native OTLP or Pi evidence, and no amended release requirement is complete until fresh verification is recorded under the approved amended tasks.

### T7 partial evidence - 2026-07-17 real runtime run

- Release run `spec005-t7-20260717-runtime` produced fresh real evidence from Codex CLI `0.144.3` via `codex-otel`/OTLP HTTP, Claude Code `2.1.212` via `claude-otel`/OTLP HTTP, and Pi `0.80.10` via `pi-extension`/JSONL. Native and Pi evidence retained actual provider identity and was not labeled Agent Beacon.
- The actual runtime adapter accepted 225 records with 0 rejected and 0 lag; 67 records belonged to the release run: Codex 36, Claude 5, Pi 26. Latest run timestamps were Codex `2026-07-17T23:04:20.796Z`, Claude `2026-07-17T23:02:51.466Z`, and Pi `2026-07-17T23:05:36.274Z`.
- Codex's user config and dedicated profile use logs-only JSON OTLP with `log_user_prompt=false`, metrics/traces disabled, and the fixed loopback endpoint. Claude's persistent user environment enables logs-only JSON OTLP while explicitly disabling prompt, assistant-response, tool-detail, tool-content, raw-body, trace, metric, and account-identifier export. Pi remained the installed allowlist-only extension.
- A privacy scan found zero non-allowlisted top-level keys and zero `contentCapture` violations. The local collector reached `current` with zero rejections and retained all three runtimes across bounded pages.
- Real-source recovery evidence: mixed Codex OTLP batches initially failed closed; the projector was repaired test-first to retain safe records while rejecting content-bearing records and to handle numeric/zero native timestamps without recording epoch zero. Pi's default model request failed on an unaffordable maximum-output setting and recovered with a bounded authenticated free-model run.
- UI verification at 1280px and 390px showed no overflow or console errors, keyboard focus movement, reduced-motion support with zero running animations, loopback-only dynamic requests, truthful `Not ready for release`, and a current runtime source. The release view did not claim runtime coverage without a manifest, and heavy ongoing Pi activity can push Claude/Codex off the first 100-record ledger page; UI/manifest binding remains incomplete.
- Fresh verification: `npm run test:collector` passed 59 tests; `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-operations.ps1` all passed. Sanitized detail: `artifacts/qa/spec005/t7-runtime-telemetry-2026-07-17.md`.
- T7 remains incomplete. The exact operator-used workflow and its Worker Remit require human selection/approval before Praxen can run; historical FinBot CTF evidence is not promoted.

### T7 completion evidence - 2026-07-18 approved Praxen targets

- The operator explicitly approved SancusSight and the shared `sdd-exec` workflow as real Praxen targets, then explicitly approved separate documentation-derived Worker Remits. Approved SHA-256 identities are `1f28de633bf3249a07370128c9afeeab25bcba50dc2635a0f55e61f2d5944033` for SancusSight and `abf7f7f9d31db0c92ea4ada61f1d70d89a49c05a7c2af5145e8e58d4211e5da1` for `sdd-exec`.
- Praxen `1.1.0` canonical schema `2.0` conversion and rendering passed with zero schema errors: SancusSight produced 4 findings across 95 audited rules; `sdd-exec` produced 7 findings across 91 audited rules. Findings remain tool evidence and were not promoted into human decisions or compliance claims.
- The local operational projection bound both canonical reports to release run `spec005-t7-20260717-runtime`, source version `1.1.0`, contract `praxen-v2`, exact target IDs, configuration hash `800c2ba8b0985f2d88ff2f788d2678bcde3faa1cc7b3a32eaf5ba4f416408aaf`, and both approved remit hashes.
- Live collector refresh at `2026-07-18T00:20:46.440Z` accepted 17 normalized Praxen records with zero rejections and retained both target IDs and both approved hashes. A generated release manifest validated structurally and evaluated Praxen as `current`, `operational: true`, `fresh: true`, with no Praxen blockers; the complete release gate correctly remained blocked because runtime evidence had expired and Pipelock, RAMPART, AIMap, and required failures were incomplete.
- Pi Bash ran the fixed Praxen preflight command and produced sanitized operation record `442e948633da467d95dd4a27661cd572`; preflight correctly remained blocked on still-unpinned RAMPART and AIMap inventory versions and did not contact or launch a producer. An earlier Pi analysis attempt was rejected as invalid because it invented a different workspace; none of its claims or content entered canonical findings or SancusSight.
- Multi-target release-manifest support was added expand-contract: legacy `targetId`/`workerRemitHash` remain canonical while optional `targetIds`/`workerRemitHashes` bind multiple independently approved Praxen targets. Fresh test-first verification passed 60 collector tests, `npm run verify:core`, `npm run build`, `npm audit` with zero vulnerabilities, and `scripts/verify-operations.ps1`.
- Sanitized detail: `artifacts/qa/spec005/t7-praxen-real-targets-2026-07-18.md`. T7 is complete as an implementation/acceptance slice; no release-ready claim changed, and T10 must repeat runtime freshness with all five categories and the full failure/recovery matrix.

### T6A evidence - 2026-07-17 implementation run

- Red seam - `node --test collector/__tests__/release-gate.test.ts collector/__tests__/operational-adapters.test.ts` initially failed because `RuntimeTelemetryAdapter` did not exist and the release runtime list omitted Pi; this established the amended behavior before implementation.
- Narrow green - runtime adapter/gate/producer tests passed with provider truth, Agent Beacon preservation, required Pi coverage, content-setting rejection, unsupported schema rejection, incremental replay/rotation behavior, recovery, bounded OTLP projection, and Pi extension payload-access guards.
- `npm run test:collector` - exit 0; 55 tests passed, including 100,000-event governance behavior and all new runtime telemetry cases.
- `npm run verify:core` - exit 0; core provenance, grouping, route, source-state, and evidence-correlation assertions passed.
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1` - exit 0; six source/provider allowlists supporting five categories, fixed lifecycle actions, loopback bridge binding, Pi payload-access guards, and absence of collector process-execution imports passed.
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-operations.ps1` - exit 0; runtime telemetry install/failure handoffs and existing preflight/rollback/removal/inspection checks passed without operating upstream tools.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` - exit 0; zero vulnerabilities.
- Pi persistent setup - `pi install ./operations/telemetry --approve` succeeded and `pi list` showed the user-scoped SancusSight telemetry package. Two Pi Bash smokes ran `node --version`; the first exposed an invalid timestamp assumption, the extension was repaired, and the recovery run completed without extension errors and returned `v24.17.0`.
- Fresh local telemetry - `%LOCALAPPDATA%/SancusSight/operations/exports/runtime-telemetry/runtime-telemetry.jsonl` contained 21 accepted, zero-rejected QA records from `pi-extension` and `codex-otel`; records were `manual`, not release proof, and a key scan found no prompt, response, reasoning, command, tool-payload, credential, secret, content, or path fields.
- OTLP bridge - the first attempted port was already owned by an unrelated local research server and was left untouched. The fixed bridge moved to free port `43120`, bound only to `127.0.0.1`, accepted a bounded Codex OTLP event, returned success, and stopped cleanly.
- Playwright desktop - 1280px full-page check showed five evidence categories, Codex/Claude/Pi coverage, truthful `Not ready for release`, no horizontal overflow, keyboard focus movement, no console errors, and no dynamic network requests beyond static assets. Screenshot: `output/playwright/spec005-t6a-desktop.png`.
- Playwright mobile - 390x844 full-page check showed all categories and three runtimes without horizontal overflow or console errors. Reduced-motion emulation reported `prefers-reduced-motion: reduce = true` and zero running animations. Screenshot: `output/playwright/spec005-t6a-mobile.png`.
- Boundary verdict - SancusSight remains a read-only evidence consumer. The OTLP bridge, Pi extension, Pi Bash, and upstream operation remain outside collector/browser routes; no release-ready claim changed.

### T5 evidence - 2026-07-16 implementation run

- `npm run verify:core` - exit 0; core provenance, grouping, route, source-state, and evidence-correlation assertions passed.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- Playwright desktop check - at 1280x720 the Release evidence view rendered all five source gates, runtime coverage, mandatory failure rows, exact blockers, and `Not ready for release`; document width matched the viewport and no console errors were reported.
- Playwright mobile check - at 390x844 the same blocked hosted/manual state remained text-labelled and scannable; document width matched the viewport with no horizontal overflow. Keyboard Tab moved focus through the native navigation controls. Existing reduced-motion CSS remains active for `prefers-reduced-motion: reduce`.
- Truthfulness observation - source rows show Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap while Kiji remains deferred; the UI offers no upstream install, run, scan, or policy controls, and hosted/manual evidence remains non-operational.

### T6 evidence - 2026-07-16 implementation run

- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1` - exit 0; fixed action/source allowlists, HTTPS inventory URLs, version-list declarations, and forbidden process/file-mutation capability scan passed.
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-operations.ps1` - exit 0; preflight failed closed for unpinned RAMPART/AIMap versions, install/failure/rollback/uninstall handoffs remained planned, retained records were inspectable, and no producer artifact was changed.
- `operations/run-release-gate.ps1 -InputPath operations/manifests/release-run.example.json` - exit 0; the fixed entry point accepted only the structural handoff and recorded it as planned, without running an upstream tool or promoting example data to release evidence.
- `npm run test:collector` - exit 0; 36 tests passed, including route rejection and source isolation.
- `npm run verify:core` - exit 0; core provenance, grouping, route, source-state, and evidence-correlation assertions passed.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` - exit 0; 0 vulnerabilities reported.
- Boundary observation - operations scripts are outside collector HTTP routes, use fixed ValidateSet actions/source IDs/failure cases, write only sanitized run records under the user-scoped operations directory, and preserve evidence by default.

### T1 evidence — 2026-07-16 implementation run

- `npm run test:collector` — exit 0; 15 tests passed, including complete five-source qualification, both-runtime coverage, wrong-target/untrusted verification blockers, legacy manual qualification, and historical expiry.
- `npm run verify:core` — exit 0; core provenance, route, source-state, and evidence-correlation assertions passed.
- `npm run build` — exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- Privacy boundary observation — operational metadata is an explicit allowlisted field; legacy envelopes without it resolve to `manual`; no prompts, responses, credentials, private keys, or unrestricted output are copied into qualification records.
- Product state — release gate remains blocked until T2-T10 supply fresh operational source and failure/recovery evidence; no release-ready claim was changed.

### T2–T4 evidence — 2026-07-16 implementation run

- `npm run test:collector` — exit 0; 36 tests passed, including explicit Beacon/Praxen metadata, Worker Remit hash mismatch, packet-bound Pipelock verification, RAMPART safe/unsafe/undetermined/error outcomes, and AIMap authorization/scope/privacy rejection.
- `npm run verify:core` — exit 0; existing core assertions passed with the five-source union and adapters enabled.
- `npm run build` — exit 0; collector and browser builds passed.
- PowerShell sanitizer/exporter review — fixed parameterized scripts construct allowlisted reports only; prohibited fields and target/authorization mismatches throw before output. No script is exposed as an HTTP route.
- Route/process review — collector routes expose only known source configuration/refresh/disconnect and evidence reads; no AIMap scan, RAMPART execution, generic command, subprocess, or upstream policy route exists.
- Qualification boundary — operational metadata is accepted only when explicitly supplied; missing metadata remains legacy/manual. Pipelock operational qualification additionally requires a verified fixed artifact and both allow/block totals.

### T10 bounded fresh-window retry - 2026-07-20 release run `spec005-t10-202607192244`

- The Pipelock harness now selects the newest producer evidence segment deterministically. In a clean run folder, the approved `claude-code/findmnemo-routing` workflow produced 3 allows, 1 controlled block, 1 tool allow, and 1 tool block; the packet and receipt chain verifier passed with trusted signer fingerprint `78ef57aa4e71392f6d3fb0e1ac80900a5d95dda8d44465d34775ce5eb08fc91c`. A later same-token rerun correctly failed closed because multiple sessions shared one evidence folder, so that packet was not promoted.
- Fresh producer observations were recorded for SancusSight Praxen schema 2.0 (`2026-07-20T05:45:01Z`), `sdd-exec` Praxen schema 2.0 (`2026-07-20T05:49:44Z`), RAMPART/Pi (`2026-07-20T05:55:29.992Z`), AIMap (`2026-07-20T05:54:52.447Z`), and provider-truthful Codex CLI, Claude Code, and Pi metadata-only telemetry. No prompts, responses, reasoning, tool payloads, credentials, keys, raw receipts, or raw scan payloads entered normalized evidence.
- `npm run verify:t10-matrix` passed all `15/15` mandatory failure/recovery cases after an immediate retry of the artifact-rotation timing seam (`14/15` on the first attempt). `npm run test:collector` passed `69/69`, `npm run verify:core`, `npm run build`, and `npm audit` (0 vulnerabilities) passed.
- The release bundler refused the actual collector evidence with exact blockers `praxen:stale-evidence` and `pipelock:stale-evidence`; no bundle was generated and no historical evidence was relabeled. `.status` remains `review:done`; SancusSight remains **Not ready for release**.

### T10 bounded revalidation - 2026-07-20 release run `spec005-t10-20260720143255`

- The two approved Praxen scans were attempted in isolated run directories, but both execution jobs timed out before the required canonical schema-2 findings files were available. An incomplete draft from the first attempt and the timed-out Codex attempt were not promoted; no historical report was reused or relabeled.
- Fresh RAMPART/Pi passed one safe response-only scenario with zero unsafe, undetermined, or execution-error results. AIMap's pinned exact-scope loopback fingerprint export passed. Pipelock's approved `claude-code/findmnemo-routing` workflow produced a trusted 3-allow/1-block chain with one tool allow and one tool block.
- The collector accepted 181 run-scoped metadata-only runtime records: Codex 138, Claude 37, and Pi 7; all retained `contentCapture: false`. The OTLP bridge rejected content-bearing or missing-session records while retaining safe records. `npm run verify:t10-matrix` passed all `15/15` cases after the known artifact-rotation seam initially reported `14/15`.
- `node scripts/build-spec005-t10-release-bundle.ts` failed closed with `Required release evidence is missing`; no sanitized release bundle was generated for this run. The exact blocker is the missing SancusSight and `sdd-exec` Praxen canonical evidence. `.status` remains `review:done`; SancusSight remains **Not ready for release**.

### T10 bounded Praxen retry - 2026-07-20 run `spec005-t10-20260720150700`

- The two already-approved targets were launched in isolated run directories with the installed Praxen plugin and pinned Claude Haiku execution. SancusSight completed a fresh canonical schema-2 report at `2026-07-20T15:05:19Z`.
- The `sdd-exec` target produced bounded drafts at `15:01:33Z` and `15:05:06Z` but did not emit canonical findings JSON before the five-minute same-window deadline. The process was stopped after the deadline; drafts were not promoted, and no historical report was reused or relabeled.
- No other producers were started for this token because the required two-target Praxen gate was already non-qualifying. No release bundle was attempted. `.status` remains `review:done`; SancusSight remains **Not ready for release**. The exact remaining blocker is a fresh canonical `sdd-exec` Praxen report that completes inside a new qualifying window with the other four categories and three runtimes.
- Fresh regression checks passed `npm run test:collector` (`71/71`), `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), governance verification, operations verification, and RAMPART sanitizer verification. Playwright blocked-state checks passed at 390×844 and 1440×1000 with zero console errors/warnings, loopback-only `200` responses, visible focus, no horizontal overflow, zero reduced-motion animations, and the mobile Evidence Sources contract arrow. Detail: `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260720143255.md`.

### T10 Claude-deferred partial revalidation - 2026-07-20 run `spec005-t10-20260720221208`

- The operator explicitly deferred Claude Code to a future release for this attempt. This is a non-qualifying scope choice for the run only; approved FR-002, FR-004, FR-016, design, and the five-category/three-runtime release contract remain unchanged.
- Both approved Praxen targets produced fresh canonical schema-2 findings and rendered reports at `2026-07-20T22:14:19Z`: SancusSight (4 findings, 95 rules, zero schema errors) and `sdd-exec` (7 findings, 91 rules, zero schema errors). RAMPART/Pi produced one safe result with zero unsafe, undetermined, or error outcomes at `22:18:29Z`; pinned AIMap completed the exact authorized loopback fingerprint at `22:18:58Z` with one informational finding.
- Metadata-only telemetry normalized 98 Codex CLI records and 21 Pi records with `contentCapture: false`. Claude Code hit the external session limit and emitted only 4 `plugin_loaded`, 8 `mcp_server_connection`, and 2 `api_error` records; these are retained as truthful error-path observations and are not treated as qualifying Claude runtime success. The approved Pipelock workflow could not run without Claude and produced no run-scoped packet.
- `npm run verify:t10-matrix` passed all 15 mandatory source-isolated failure/recovery cases on the first run. `node scripts/build-spec005-t10-release-bundle.ts` failed closed with `Required release evidence is missing`; the absent required source is Pipelock. No release bundle was generated, and the Praxen observation also aged beyond the five-minute same-window boundary before all remaining work completed.
- Fresh verification passed `npm run test:collector` (71/71), `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), operations verification, governance verification, and RAMPART sanitizer verification. Playwright passed at 1440x1000 and 390x844 with zero console errors/warnings, loopback-only `200` API requests, visible keyboard focus, reduced-motion active with zero running animations, and no horizontal overflow.
- Spec review: non-qualifying by explicit scope and fail-closed as required; no approved contract was weakened or historical evidence reused. Standards review: pass for the implementation and observed boundaries; no product execution authority or content capture was added. `.status` remains `review:done`; current verdict remains **Not ready for release**. Detail: `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260720221208.md`.

### T10 fresh Praxen attempts - 2026-07-21 runs `spec005-t10-20260721012015`, `spec005-t10-20260721012600`, and `spec005-t10-20260721012814`

- Claude Code `2.1.214` was available for a non-session access probe, which returned successfully but was not counted as runtime or Praxen evidence. The fixed operations preflight also passed.
- Three new isolated `praxen:behavior-verifier` attempts were started against the actual SancusSight workspace using the already-approved Worker Remit. Each remained active without writing the mandatory Step 9.9 draft checkpoint, canonical schema-2 findings JSON, or rendered reports during the bounded wait and was stopped before any output could be promoted.
- The approved `sdd-exec` Praxen target was not started because the first required canonical target report was unavailable. No other producers or release bundle were started for these tokens, and no historical evidence was reused or relabeled.
- Fresh evidence: `artifacts/qa/spec005/t10-praxen-attempt-spec005-t10-20260721012814.md`. The exact blocker is the external Praxen behavior-verifier session/report pipeline; Spec 005 remains `review:done` and **Not ready for release**.

### T10 fresh Computer Use-assisted Praxen retry - 2026-07-21 run `spec005-t10-20260721051230`

- Computer Use uniquely inspected the Claude desktop window. The visible account/session was an older completed chat with no login, authentication, quota, or session-limit message; a New session click was not completed after the helper reported user input in that window.
- A new isolated `praxen:behavior-verifier` invocation using Claude Code `2.1.214` and the installed behavior-verifier workflow started against the actual SancusSight workspace, but emitted no stdout, Step 9.9 draft checkpoint, canonical schema-2 findings JSON, or rendered report. The isolated `reports` directory remained empty.
- The exact Claude process tree and helper descendants were stopped after the bounded grace period. The approved `sdd-exec` target, other producers, failure/recovery matrix, and release bundle were not started for this token; no evidence was promoted or combined.
- Fresh regression checks passed: `npm run test:collector` (71/71), `npm run verify:core`, `npm run build`, and `npm audit --audit-level=high` (0 vulnerabilities).
- Fresh evidence: `artifacts/qa/spec005/t10-praxen-attempt-spec005-t10-20260721051230.md`. The exact blocker remains the external Praxen/Claude behavior-verifier session/report pipeline; Spec 005 remains `review:done` and **Not ready for release**.

### T10 longer Praxen timing diagnostic - 2026-07-21 run `spec005-t10-longdiag-20260721052347`

- This operator-requested experiment allowed one isolated SancusSight Praxen scan to run beyond the earlier short observation period; it was not a release qualification window.
- The full 12-step workflow eventually completed and wrote the mandatory Step 9.9 draft, canonical schema 2.0 JSON, and rendered HTML/TXT reports. Praxen recorded 47 analyzed artifacts, 12 remit rules, zero findings, and weighted RAISE posture 3.25.
- The reports were written around `2026-07-21T05:28:16Z`-`05:28:33Z` after a scan timestamp of `2026-07-21T05:24:16Z`, showing that one target can consume roughly 4-5 minutes before rendered output exists.
- The second approved target, other producers, failure/recovery matrix, and bundle were not run. No evidence was promoted or combined. Detail: `artifacts/qa/spec005/t10-praxen-longdiag-spec005-t10-20260721052347.md`.
- The result supports separating a strict per-source freshness bound from a longer reviewed orchestration window, but no approved requirement or implementation constant was changed. Spec 005 remains `review:done` and **Not ready for release**.

### Amendment A-001 T11/T12 implementation evidence - 2026-07-21 run `spec005-a001-20260721071846`

- `npm run test:collector` passed 78/78, including progress schema/privacy/stale/read-only-route cases and release-gate exact-boundary, overrun, and stale-source-within-window cases. `npm run verify:core`, `npm run build`, and `scripts/verify-operations.ps1` passed.
- The fixed `operations/report-release-progress.ps1` smoke write accepted only bounded `3/4` Praxen units at the fixed user-scoped progress path; no upstream artifact was read, and the generated local snapshot was removed after verification.
- The updated local collector exposed `GET /api/v1/release-progress` on loopback. With no heartbeat it returned only bounded unavailable status. With a run-matching heartbeat, the UI showed an accessible determinate 75% bar, producer/target/stage/state, heartbeat, elapsed orchestration time, and a separate 30-minute orchestration deadline while readiness remained `Not ready for release`. After the bounded heartbeat window elapsed, the UI showed stale status and removed the determinate value.
- Playwright desktop and 390x844 mobile checks passed with zero console errors/warnings, loopback-only network requests, exact mobile width (390/390), visible keyboard focus, reduced-motion emulation (`reduced: true`, `animations: 0`), and no horizontal overflow. Screenshots: `output/playwright/spec005-a001-progress-desktop-final.png` and `output/playwright/spec005-a001-progress-mobile-final.png`.
- Fresh evidence detail: `artifacts/qa/spec005/a001-progress-orchestration-20260721071846.md`. T11 and T12 are complete; the amendment is advisory and does not qualify a release bundle.

### T10 concurrent Praxen operational revalidation - 2026-07-21 runs `spec005-t10-20260721144104` and `spec005-t10-20260721145201`

- The primary token completed both concurrent canonical Praxen targets, trusted Pipelock allow/block evidence, passing RAMPART/Pi, exact-scope AIMap, and metadata-only Codex/Claude/Pi telemetry. The 15-case failure/recovery matrix passed 15/15 on the first run.
- Final bundle evaluation failed closed with `praxen:stale-evidence`: both canonical reports recorded scan start at `14:42:09Z`, while final evaluation occurred at `14:50:53Z`. Rendered-file completion did not and must not refresh the canonical observation timestamp. No bundle was written.
- A new isolated retry refreshed the faster producers and all three runtimes in parallel, but only the `sdd-exec` Praxen target completed. The SancusSight target missed the five-minute source-freshness boundary before Step 9.9 and was stopped by exact process-tree identity once the run could no longer qualify. No matrix or bundle was attempted for that token.
- Fresh regressions passed: collector 78/78, core, build, audit with zero vulnerabilities, operations, governance, and RAMPART sanitizer checks. Detail: `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260721144104.md`.
- `.status` remains `review:done`; current verdict remains **Not ready for release**. The blocker is operational Praxen completion time relative to its canonical scan-start timestamp, not missing SancusSight code behavior.
