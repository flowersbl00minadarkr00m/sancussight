# Feature: Operational Evidence Producers

> Status: Approved, including amendment A-002 on 2026-07-21
> Source: User release-readiness correction on 2026-07-14; Windows/WSL and Pi telemetry amendment requested on 2026-07-17

## Overview

SancusSight must not be described as ready for release until independently operated runtime telemetry, Praxen, Pipelock, RAMPART, and AIMap producers create fresh evidence from the operator's real AI environment and SancusSight proves the complete path from source event to visible governance evidence. Release-critical runtime telemetry covers Codex CLI, Claude Code, and Pi. It may be supplied by Agent Beacon where supported, by a runtime's supported native telemetry path, or by a narrowly scoped metadata-only adapter such as a Pi extension. Authentic binaries, fixtures, synthetic agents, demo workspaces, and one-off compatibility runs remain useful QA evidence but cannot satisfy this production gate.

## Business Context

SancusSight promises observable trust rather than security claims based on configuration or branding. A source labeled `Current` must therefore mean more than "a compatible file was parsed": the release must demonstrate that real AI activity produces fresh events, findings, control decisions, signed receipts, and truthful degraded states. This feature supplies that missing operational proof while preserving SancusSight as a read-only evidence consumer rather than an owner of upstream security policy. Because the operator's supported environment is Windows and WSL, a macOS-only Agent Beacon endpoint cannot be the sole runtime telemetry requirement; the gate must qualify the actual producer and transport without mislabeling native or Pi telemetry as Agent Beacon.

## Definitions

- **Real session:** An operator-initiated session in an approved AI runtime performing an ordinary task against the operator's actual environment, not a toy agent, fixture, replay, or synthetic workspace.
- **Operational source:** An independently installed and configured upstream tool that persists across restarts and is connected to an approved real workflow.
- **Production evidence gate:** The complete set of observable checks that must pass before SancusSight may be described as ready for release.
- **Fresh evidence:** Evidence produced by the real source and accepted by SancusSight within the approved freshness window.
- **Trusted receipt:** A receipt whose signature and chain are validated against an operator-approved pinned public key.
- **Runtime telemetry:** Privacy-preserving lifecycle and tool metadata produced by an approved real AI runtime through a qualified provider and transport.
- **Operator-side execution:** A bounded install, configuration, test, or upstream-tool command performed directly by the operator or a delegated agent such as Pi, outside SancusSight's collector and application authority.

## User Stories

### US-001: Observe real AI activity

**As a** governance-minded AI user  
**I want to** see fresh, correctly attributed runtime telemetry from AI sessions I actually run  
**So that** source health reflects my environment rather than a compatibility demonstration

**Acceptance Criteria:**
- [ ] Real Codex CLI, Claude Code, and Pi sessions each produce fresh runtime events without manual fabrication or fixture copying.
- [ ] SancusSight accepts and displays the events with source, time, subject, provenance, and freshness.
- [ ] Each event identifies its actual provider and transport; native telemetry and Pi extensions are not labeled as Agent Beacon.
- [ ] Normalized evidence excludes prompt bodies, credentials, secrets, and unrestricted tool output by default.

### US-002: Assess an actual governed AI asset

**As a** governance-minded AI user  
**I want to** run Praxen against an actual governed agent or workflow and an approved Worker Remit  
**So that** findings describe my own policy-to-behavior gap

**Acceptance Criteria:**
- [ ] The assessed target is an operator-owned or operator-used asset, not a bundled example target.
- [ ] The Worker Remit is explicitly approved for that target before the release scan.
- [ ] SancusSight accepts the fresh canonical findings and shows their provenance without converting them into human decisions.

### US-003: Prove active control behavior

**As a** security-conscious AI user  
**I want to** prove that Pipelock allows expected activity and blocks prohibited activity in a real AI execution path  
**So that** a control claim is supported by independently verifiable evidence

**Acceptance Criteria:**
- [ ] A selected real workflow traverses Pipelock for the tested network or MCP action.
- [ ] One approved action is allowed and one safe, controlled prohibited action is blocked.
- [ ] Both decisions produce signed receipts bound to the tested run.
- [ ] An independent verifier validates the receipt chain against an operator-approved pinned key.
- [ ] SancusSight displays the resulting packet with `verified` provenance rather than `unavailable`.

### US-004: Trust failure and recovery states

**As a** SancusSight user  
**I want to** see truthful behavior when an evidence producer, artifact, permission, or signature fails  
**So that** absence of evidence is never presented as healthy protection

**Acceptance Criteria:**
- [ ] Stopped source, inaccessible artifact, incompatible artifact, invalid signature, collector restart, and recovery are each exercised end to end.
- [ ] One source failure does not erase retained evidence or interrupt healthy sources.
- [ ] Recovery returns the source to current only after fresh valid evidence is accepted.

### US-005: Make release readiness evidence-based

**As a** product owner  
**I want to** block release-ready claims until the production evidence gate passes  
**So that** product messaging cannot overstate monitoring or protection

**Acceptance Criteria:**
- [ ] Demo, fixture, replay, and isolated QA evidence is visibly distinguished from operational evidence.
- [ ] Release evidence identifies the runtime, source versions, tested workflow, timestamps, verification state, failures exercised, and remaining coverage limits.
- [ ] Readiness remains blocked if any Must Have release check is missing, stale, synthetic, or untrusted.

### US-006: Prove safety tests and authorized attack-surface findings

**As a** security-conscious AI user  
**I want to** see fresh RAMPART test results and authorized AIMap findings from my actual AI environment  
**So that** safety regression and exposed-endpoint claims are grounded in repeatable evidence

**Acceptance Criteria:**
- [ ] RAMPART runs an approved safety and security test suite against an operator-owned or operator-used agentic application.
- [ ] AIMap scans only an explicitly authorized target and scope owned or controlled by the operator.
- [ ] SancusSight ingests completed results without acquiring authority to initiate tests or scans.
- [ ] Findings retain tool version, target identity, observed time, test or scan identity, outcome, and source provenance.

## Functional Requirements

### FR-001: Operational-source qualification - Must Have

When a source is used for release evidence, the system shall identify whether it is operational, isolated QA, demo, fixture, replay, or manual evidence, and only operational evidence shall satisfy the production gate.

### FR-002: Real runtime telemetry evidence - Must Have

When the operator runs a real session in each approved release-critical AI runtime, a qualified provider shall produce fresh supported events and SancusSight shall accept them without manual artifact fabrication. The first release-critical runtimes are Codex CLI, Claude Code, and Pi. Agent Beacon is eligible where supported; Windows/WSL may use supported native OTLP or a metadata-only runtime adapter.

### FR-003: Real Praxen assessment evidence - Must Have

When the operator initiates the release assessment, Praxen shall evaluate an actual governed target against its approved Worker Remit and SancusSight shall accept the resulting canonical report.

### FR-004: Real Pipelock enforcement evidence - Must Have

When the operator runs the controlled release exercise through the selected real AI path, Pipelock shall produce at least one allow and one block decision with signed receipts, and an independent verifier shall establish chain validity and trusted signer identity.

### FR-005: End-to-end traceability - Must Have

For every release-gate event, finding, or control decision, SancusSight shall preserve a trace from the visible normalized record to source, observed time, artifact identity, parser contract, subject, and verification state.

### FR-006: Freshness gate - Must Have

When a real source writes supported evidence, SancusSight shall accept and display it within five minutes unless the approved requirements select a stricter window. Evidence outside the window shall not satisfy release readiness.

### FR-007: Failure and recovery matrix - Must Have

The release exercise shall cover source stopped, telemetry receiver or Pi extension unavailable, artifact inaccessible, unsupported format or producer version, malformed runtime event, invalid Pipelock signature, failed RAMPART test execution, rejected or out-of-scope AIMap output, collector restart, duplicate replay, artifact rotation or replacement, and successful recovery with new valid evidence.

### FR-008: Operational lifecycle - Must Have

The operator shall have documented, verifiable procedures to install, configure, start, inspect, update, roll back, stop, and remove each operational evidence producer without deleting source evidence unintentionally. The operator may delegate bounded producer setup and execution to Pi using Pi's Bash tool, provided the action remains outside SancusSight and the retained evidence records only sanitized action metadata and results.

### FR-009: Privacy-preserving collection - Must Have

Unless the operator explicitly approves a narrower exception, operational evidence shall exclude raw prompt bodies, full model responses, credentials, secrets, unrestricted command output, and unrestricted workspace content from SancusSight storage.

### FR-010: Truthful product state - Must Have

While the production evidence gate is incomplete or failed, SancusSight documentation and handoff artifacts shall state `Not ready for release`, and the UI shall not imply continuous monitoring, active protection, or verified control coverage.

### FR-011: Release evidence bundle - Should Have

After the gate passes, the system should produce a sanitized, exportable evidence bundle containing source versions, configuration identities, timestamps, normalized records, verifier results, failure-matrix results, and explicit untested boundaries.

### FR-012: Repeatable revalidation - Should Have

The operator should be able to repeat the production evidence gate after source upgrades, policy changes, runtime changes, or SancusSight releases without relying on prior successful evidence.

### FR-013: Real RAMPART safety-test evidence - Must Have

When the operator runs the approved RAMPART suite against an actual governed agentic application, RAMPART shall produce fresh machine-readable results and SancusSight shall accept the supported test outcomes with stable test identity and provenance.

### FR-014: Authorized AIMap findings - Must Have

When the operator explicitly authorizes an AIMap scan against an approved target and scope, AIMap shall produce completed machine-readable findings and SancusSight shall accept those findings without gaining authority to initiate or expand the scan.

### FR-015: RAMPART and AIMap evidence contracts - Must Have

Before either source may satisfy release readiness, its adapter contract shall define supported upstream version, artifact schema, accepted and rejected fields, privacy exclusions, deterministic identity, freshness, partial-failure behavior, and incompatible-version behavior.

### FR-016: Five-source release gate - Must Have

Release readiness shall remain blocked until runtime telemetry, Praxen, Pipelock, RAMPART, and AIMap each have fresh operational evidence and their required failure cases have passed. Runtime telemetry is incomplete until Codex CLI, Claude Code, and Pi each pass qualification, freshness, privacy, and failure/recovery checks through their actual provider and transport.

## Non-Functional Requirements

### NFR-001: Security and least authority
- Operational installation must not grant SancusSight authority to run arbitrary commands, change upstream policy, or read unrestricted files.
- Pi Bash delegation must be limited to explicit operator-side setup, installation, verification, and approved upstream runs; it must not create a SancusSight command API, generic executor, machine-wide interceptor, or upstream policy controller.
- Active Pipelock exercises must use a controlled, non-secret test signal and an explicit rollback path.
- Signing private keys must not enter SancusSight evidence or the repository.

### NFR-002: Privacy
- Collection scope and retained fields must be inspectable before release validation.
- Prompt-content collection must be disabled by default.
- Pi telemetry must exclude prompts, responses, reasoning or chain-of-thought, Bash command bodies, tool arguments and results, file contents, credentials, secrets, and unrestricted paths; normalized records may retain only approved metadata needed for identity, freshness, outcome class, and provenance.
- Sanitized release evidence must be safe to retain in the project repository.

### NFR-003: Reliability
- Evidence producers intended to persist must survive the approved restart scenario.
- Source and collector restarts must not duplicate accepted evidence.
- A failed source must remain independently recoverable.

### NFR-004: Auditability
- Every release-gate result must record command or operator action, source version, time, result, and evidence location.
- A reviewer must be able to distinguish observed facts from inferred claims and human decisions.

### NFR-005: Compatibility
- Upstream version changes must be checked against supported artifact contracts before operational evidence is accepted.
- A version mismatch must fail visibly without invalidating unrelated sources.

## Out of Scope

- Treating demo, synthetic, fixture, replay, or isolated QA activity as production proof.
- Claiming protection for AI runtimes or workflows that were not exercised by the release gate.
- Bundling upstream source tools into the hosted SancusSight application.
- Remote administration, cloud telemetry, multi-user operations, or organization-wide rollout.
- Machine-wide interception of all network traffic unless separately approved.
- Capturing raw Pi session transcripts, prompts, model responses, reasoning, Bash command bodies or output, tool arguments or results, secrets, credentials, private keys, or unrestricted workspace paths.
- Giving SancusSight authority to invoke Pi, Bash, Codex, Claude, or any other upstream runtime or command runner.
- Kiji Privacy Proxy operational deployment or adapter work in this feature.
- Automatic remediation or silent changes to human-owned registry facts.

## Decisions

### D-001: Real end-to-end evidence is a release blocker

**Decision:** SancusSight is not ready for release until real sessions confirm fresh runtime telemetry for Codex CLI, Claude Code, and Pi, actual Praxen findings, real Pipelock allow/block behavior with trusted signed receipts, RAMPART safety-test results, authorized AIMap findings, and failure recovery end to end.  
**Reason:** Compatibility evidence alone cannot support continuous-monitoring or active-protection claims.  
**Source:** User direction on 2026-07-14  
**Impacts:** US-001 through US-006, FR-001 through FR-016

### D-002: Spec 004 remains a compatibility foundation

**Decision:** Spec 004 remains reviewed within its read-only collector boundary, but its QA evidence does not satisfy product release readiness.  
**Reason:** Its approved scope explicitly excluded installation and operation of evidence producers.  
**Source:** Spec 004 requirements and user correction on 2026-07-14  
**Impacts:** Business Context, FR-001, FR-010, Out of Scope

### D-003: Upstream tools remain independently operated

**Decision:** Operational deployment shall not turn SancusSight into a generic installer, supervisor, policy controller, or command runner for upstream tools.  
**Reason:** The evidence consumer and control producer require separate trust and authority boundaries.  
**Source:** Spec 004 D-001 and D-004  
**Impacts:** FR-008, NFR-001, Out of Scope

### D-004: RAMPART and AIMap are release-critical sources

**Decision:** The production evidence gate includes [Microsoft RAMPART](https://github.com/microsoft/RAMPART) and [Bishop Fox AIMap](https://github.com/BishopFox/aimap), not only the three Spec 004 adapters.  
**Reason:** Release readiness requires real safety regression evidence and authorized attack-surface findings in addition to telemetry, behavior verification, and mediated-control receipts.  
**Source:** User direction on 2026-07-14  
**Impacts:** US-006, FR-013 through FR-016, NFR-001 through NFR-005, Out of Scope

### D-005: Approved operational defaults

**Decision:** The first release covers Codex CLI, Claude Code, and Pi; uses persistent user-scoped installations; stages one selected Pipelock workflow through observation before balanced enforcement; retains runtime event metadata without prompt, response, reasoning, Bash command, tool payload, or file-content bodies; runs RAMPART against SancusSight plus one real AI workflow; and restricts AIMap initially to loopback or another operator-owned endpoint.  
**Reason:** These defaults provide real evidence while bounding privacy, enforcement, authorization, and rollback risk.  
**Source:** User approval on 2026-07-14  
**Impacts:** Q-001 through Q-006, FR-002, FR-004, FR-008, FR-009, FR-013 through FR-016, NFR-001 through NFR-005

### D-006: Platform-neutral telemetry qualification

**Decision:** Agent Beacon remains an eligible runtime telemetry provider on supported platforms, but Windows/WSL release evidence may use each runtime's supported native telemetry path or a narrowly scoped metadata-only adapter. SancusSight shall display the actual provider and transport and shall not represent native OTLP or Pi-extension evidence as Agent Beacon evidence.  
**Reason:** Agent Beacon's production endpoint is currently documented as macOS-only, while this operator's environment is Windows and WSL. Release proof must exercise the actual environment without weakening source qualification or provenance truth.  
**Source:** User direction on 2026-07-17; [Agent Beacon endpoint documentation](https://docs.asymptotelabs.ai/cli/endpoint); [Claude Code monitoring documentation](https://code.claude.com/docs/en/monitoring-usage); [Codex configuration schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json); [WSL networking documentation](https://learn.microsoft.com/en-us/windows/wsl/networking)  
**Impacts:** Overview, Business Context, US-001, FR-002, FR-006 through FR-010, FR-016, NFR-001 through NFR-005

### D-007: Pi is release-critical and may perform bounded operator-side setup

**Decision:** Pi is the third release-critical runtime. A user- or project-scoped Pi extension may emit sanitized lifecycle and tool-outcome metadata, and Pi may use its Bash access to install, configure, run, inspect, update, roll back, stop, or remove approved local evidence producers and test workflows. This delegated execution remains operator-side and must never become a SancusSight execution capability.  
**Reason:** Pi is part of the operator's ordinary AI workflow, and the operator explicitly authorized Pi telemetry and delegated local setup work.  
**Source:** User direction on 2026-07-17  
**Impacts:** US-001, FR-002, FR-007 through FR-009, FR-012, FR-016, NFR-001 through NFR-005, Out of Scope

## Approved Amendment A-001: Truthful progress and longer release orchestration

**Approval:** Explicitly approved by the operator on 2026-07-21.

### US-007: Observe release-run progress

**As a** governance-minded AI user  
**I want to** see how an active release evidence run is progressing  
**So that** I can distinguish work in progress from a stalled, stale, or completed run

**Acceptance Criteria:**
- [ ] When an approved operator-side producer reports bounded progress, SancusSight shows the current run, producer, stage, state, last heartbeat, and determinate percentage only when completed and total units are both reported.
- [ ] When a producer does not report a percentage, SancusSight shows an indeterminate progress state or stage label rather than inventing a percentage.
- [ ] The UI distinguishes `running`, `waiting`, `completed`, `failed`, `cancelled`, and `stale` and provides the latest safe next-step or blocker message.
- [ ] Progress is explicitly advisory and never satisfies operational evidence, freshness, verification, failure/recovery, or release readiness by itself.
- [ ] Hosted/manual snapshots do not claim live producer progress.

### FR-017: Bounded producer progress status - Must Have

When an approved operator-side release workflow publishes progress for a release run, SancusSight shall accept only a versioned, allowlisted, metadata-only status record containing the release run ID, producer/target identity, bounded stage/state, timestamps, and optional completed/total unit counts. It shall reject unknown fields, invalid states, negative or impossible counts, raw messages, prompts, responses, tool payloads, credentials, secrets, private keys, file contents, and unrestricted paths.

When a status record is absent, malformed, too old, or from another run, SancusSight shall show progress as unavailable or stale and shall not infer completion from the absence of errors.

### FR-018: Release orchestration window - Must Have

The complete release orchestration may take up to 30 minutes from the approved run start to final evaluation so that slow but progressing producer workflows can finish. Each operational evidence record and runtime must still satisfy the existing five-minute freshness rule at final evaluation; extending orchestration time must not make stale evidence current.

The UI shall show orchestration elapsed time and the 30-minute deadline separately from each source's five-minute freshness state.

### NFR-006: Progress privacy, truthfulness, and accessibility

- Progress status is advisory metadata, not normalized evidence and not a readiness signal.
- Progress ingestion remains read-only toward upstream producers; only fixed operator-side workflows may publish bounded status records.
- Determinate progress uses native accessible progress semantics. Indeterminate, stale, failed, and unavailable states remain understandable without animation, color, or hover-only information.
- A stale status never silently remains `running`.

### D-008: Separate source freshness from orchestration duration

**Decision:** Keep the five-minute per-source freshness rule and add a 30-minute maximum orchestration window. Add a metadata-only progress contract and truthful UI states; exact percentages are displayed only when a producer supplies valid completed and total units.  
**Reason:** The longer Praxen diagnostic showed that one approved scan can consume nearly five minutes. A longer orchestration period accommodates real work without weakening the final freshness check or inventing scan progress.  
**Source:** Operator approval on 2026-07-21 and timing evidence at `artifacts/qa/spec005/t10-praxen-longdiag-spec005-t10-20260721052347.md`  
**Impacts:** US-005, US-007, FR-006, FR-010, FR-016 through FR-018, NFR-001, NFR-002, NFR-003, NFR-004, NFR-006

## Approved Amendment A-002: Run-bound freshness and complete multi-target evidence

**Approval:** Explicitly approved by the operator on 2026-07-21. A-002 supersedes the five-minute source-freshness portions of FR-006, FR-018, D-008, and Q-007 while leaving the 30-minute orchestration maximum unchanged.

### US-008: Qualify slow, complete operational evidence truthfully

**As a** product owner  
**I want to** evaluate every required source and target over one bounded release run  
**So that** legitimately slow producers can pass without accepting historical, relabeled, or incomplete evidence

**Acceptance Criteria:**
- [ ] A release run may qualify evidence produced during its 30-minute orchestration window even when that evidence is more than five minutes old at final evaluation.
- [ ] Every qualifying record retains its actual producer-observed timestamp and is bound to the current release run; changing a file timestamp, copying an old artifact, or relabeling historical evidence does not make it current.
- [ ] For a source with multiple required targets, the release gate selects and evaluates the newest qualifying canonical evidence for each target independently.
- [ ] Differing valid timestamps across required Praxen targets do not cause one target's evidence to discard or replace the other target's evidence.
- [ ] Release readiness remains blocked when any required source, runtime, target, verification result, or failure/recovery case is absent, outside the current run, older than the 30-minute release window, synthetic, or untrusted.

### FR-019: Run-bound operational freshness - Must Have

At final evaluation, operational evidence shall satisfy freshness when its authentic producer-observed time is at or after the approved release run start, at or before final evaluation, and no more than 30 minutes old. The five-minute per-source freshness limit shall no longer apply.

The complete run shall still finish within FR-018's 30-minute orchestration maximum. The system shall reject historical, copied, replayed, future-dated, timestamp-rewritten, or differently run-bound evidence even when its filesystem modification time falls inside the window.

### FR-020: Independent required-target qualification - Must Have

When a release-critical source has more than one approved required target, the system shall select the newest qualifying canonical evidence independently for every required target within the current release run. A newer report for one target shall not discard, replace, or mask qualifying evidence for another target merely because their producer-observed timestamps differ.

Release readiness shall remain blocked unless every required target is present and independently passes target identity, canonical schema, operational qualification, run binding, freshness, provenance, privacy, and source-specific verification checks.

### NFR-007: Bounded and truthful temporal qualification

- The 30-minute evidence window and 30-minute orchestration deadline use the same approved release-run start and a single monotonic evaluation boundary where available.
- Source timestamps remain producer facts and shall not be rewritten to improve freshness.
- Filesystem creation or modification time alone shall not establish operational freshness when the supported artifact contains an authoritative producer-observed time.
- Extending freshness shall not weaken target completeness, trusted-receipt verification, source isolation, privacy exclusions, or failure/recovery requirements.

### D-009: Replace the five-minute freshness seam with one run-bound window

**Decision:** Use the existing 30-minute orchestration window as the maximum age of authentic, current-run operational evidence at final evaluation, and qualify multi-target Praxen evidence independently per required target.  
**Reason:** Approved Praxen scans can complete canonically but require several minutes per target. A separate five-minute final-age constraint makes a complete concurrent run fail because legitimate early evidence ages while later required producers finish. Independent per-target selection also prevents unequal canonical scan timestamps from erasing an otherwise qualifying target.  
**Source:** Operator direction on 2026-07-21; `artifacts/qa/spec005/t10-praxen-longdiag-spec005-t10-20260721052347.md`; `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260721144104.md`  
**Impacts:** US-005, US-008, FR-006, FR-010, FR-016, FR-018 through FR-020, NFR-003, NFR-004, NFR-006, NFR-007, D-008, Q-007, Q-008

## Questions

### Q-001: Which AI runtimes are release-critical?

**Status:** Answered  
**Recommended:** Codex CLI, Claude Code, and Pi on this device.  
**Answer:** Approved on 2026-07-17.  
**Impact:** Determines how many real runtime sessions must pass and which workflows may claim coverage.

### Q-002: What installation scope is required for the first release?

**Status:** Answered  
**Recommended:** Persistent user-scoped installation on this device, with machine-wide services deferred.  
**Answer:** Approved.  
**Impact:** Changes permissions, startup behavior, rollback risk, and the meaning of "system-wide."

### Q-003: Where should Pipelock enforce first?

**Status:** Answered  
**Recommended:** One selected real Codex or Claude workflow, staged through observation before balanced enforcement; do not intercept unrelated machine traffic.  
**Answer:** Approved.  
**Impact:** Determines the real control boundary and the risk of disrupting normal work.

### Q-004: What telemetry content may Agent Beacon retain?

**Status:** Answered  
**Recommended:** Event metadata only; prompt bodies, model responses, reasoning, Bash command bodies and output, tool payloads, unrestricted paths, and file content disabled.  
**Answer:** Approved on 2026-07-17.  
**Impact:** Determines privacy exposure and whether retained operational evidence is safe to inspect and export.

### Q-005: Which real agentic application must RAMPART test?

**Status:** Answered  
**Recommended:** SancusSight's local collector and one operator-used AI workflow with an approved, non-destructive regression suite.  
**Answer:** Approved.  
**Impact:** Determines what safety claims the RAMPART evidence can support and which failures must block release.

### Q-006: Which target and scan boundary is authorized for AIMap?

**Status:** Answered  
**Recommended:** A loopback-only or operator-owned test endpoint first; no third-party or public target without separate written authorization.  
**Answer:** Approved.  
**Impact:** Determines legal authorization, network risk, evidence meaning, and whether the scan can run without affecting unrelated systems.

### Q-007: How long may a release orchestration run take?

**Status:** Answered  
**Recommended:** 30-minute orchestration window with the same current-run-bound freshness limit.  
**Answer:** A 30-minute orchestration window was approved in A-001 on 2026-07-21; A-002, approved later that day, superseded the separate five-minute per-source freshness rule with the same 30-minute current-run-bound freshness limit.  
**Impact:** Separates slow producer completion from final evidence freshness and determines the progress deadline shown in the UI.

### Q-008: Should the freshness limit match the approved orchestration window?

**Status:** Answered  
**Recommended:** Yes. Replace the separate five-minute source limit with a 30-minute, current-run-bound freshness limit while keeping the orchestration deadline at 30 minutes.  
**Answer:** Approved as amendment A-002 on 2026-07-21.  
**Impact:** Lets slow canonical producers complete within one release run without accepting historical evidence, and requires independent qualification of every approved Praxen target.

## Approval Gate

The original requirements were approved on 2026-07-14. The Windows/WSL and Pi amendment was explicitly approved on 2026-07-17. Amendment A-001 (truthful progress and a 30-minute orchestration window) and amendment A-002 (run-bound freshness and complete multi-target evidence) were explicitly approved on 2026-07-21. The approved requirements now use one 30-minute, current-run-bound freshness window and require independent qualification of every required target. Design and tasks must be updated and approved before implementation changes. Completed implementation evidence remains historical evidence and cannot satisfy A-002 until revalidated under its approved design and tasks.
