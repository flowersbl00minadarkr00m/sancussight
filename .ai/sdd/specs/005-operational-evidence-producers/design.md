# Design: Operational Evidence Producers

> Requirements: @requirements.md
> Status: Approved through amendment A-005 on 2026-07-23

## 1. Summary

Qualify runtime telemetry, Praxen, Pipelock, Microsoft RAMPART, and Bishop Fox AIMap as persistent, independently operated evidence producers for SancusSight. The first release covers real Codex CLI, Claude Code, and Pi sessions on this Windows/WSL device, uses user-scoped installations, and blocks release readiness until all five evidence categories produce fresh operational evidence and their required failure and recovery cases pass. Runtime telemetry is provider-neutral: Agent Beacon remains supported where available, while native OTLP and the Pi metadata extension are represented by their actual provider and transport.

SancusSight remains a read-only evidence consumer. Installation, test execution, scanning, enforcement, and upstream policy changes occur through explicit operator-run scripts and runbooks outside the collector API. The collector receives only known local artifacts through fixed adapters; it never receives a generic process runner, unrestricted filesystem access, or authority to initiate AIMap or RAMPART activity.

## 2. Research Inputs

- [Agent Beacon CLI](https://docs.asymptotelabs.ai/cli) supports persistent per-user endpoint installation and a `metadata` retention mode that excludes prompt text, raw attributes, command output, and raw diffs. Its shared local event seam is `~/.beacon/endpoint/logs/runtime.jsonl`.
- [Agent Beacon endpoint documentation](https://docs.asymptotelabs.ai/cli/endpoint) currently describes its production endpoint as macOS-only, so it cannot be required as the sole telemetry path on this Windows/WSL device.
- [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage) supports OTLP telemetry with content capture disabled by default. The [Codex configuration schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json) supports OTLP exporters and disabling user-prompt logging. Windows applications can reach WSL loopback services through the supported [WSL networking](https://learn.microsoft.com/en-us/windows/wsl/networking) path.
- Pi `0.80.10` exposes extension lifecycle and tool events. A user-scoped extension can project metadata-only records without retaining prompts, responses, reasoning, Bash commands/output, tool payloads, secrets, or file content.
- [Praxen](https://open-agent-ai-security.github.io/praxen/) produces canonical behavior findings from an approved Worker Remit. It is already available as an installed Codex and Claude plugin, but release qualification requires an operator-owned target rather than an example agent.
- [Pipelock](https://github.com/luckyPipewrench/pipelock) supports audit, balanced, and strict modes, mediator-signed receipts, a hash-chained flight recorder, and independent receipt verification. The deployment starts in audit mode before a bounded balanced-mode block exercise.
- [Microsoft RAMPART](https://github.com/microsoft/RAMPART) is pytest-native and provides a built-in timestamped JSON report sink. Results distinguish `safe`, `unsafe`, `undetermined`, and infrastructure `error` states.
- [Bishop Fox AIMap](https://github.com/BishopFox/aimap) models scans separately from discovered endpoints. A completed active scan records its authorized target, status, endpoint IDs, result summary, and Nuclei JSONL-backed endpoint provenance.

## 3. Requirements Mapping

| Requirement | Design coverage |
|---|---|
| FR-001, FR-010, FR-016 | Evidence classification and a five-source release manifest prevent QA, demo, stale, incomplete-target, or untrusted records from satisfying readiness. |
| FR-002 | A provider-neutral runtime telemetry path covers real Codex CLI, Claude Code, and Pi sessions through native OTLP, Agent Beacon where supported, or a Pi metadata-only extension. |
| FR-003 | Praxen operational runbook binds an approved Worker Remit to SancusSight and one operator-used workflow. |
| FR-004 | A selected real workflow is staged through Pipelock audit and balanced enforcement; an independent fixed verifier produces trusted verification evidence. |
| FR-005, FR-006, FR-019, NFR-007 | Envelope provenance, authentic producer-observed timestamps, exact run binding, and the single 30-minute run/evidence boundary in Section 19 preserve traceability and truthful freshness. |
| FR-007 | A scripted failure matrix covers telemetry receiver and Pi-extension loss, malformed events, stop, permission, schema, signature, execution, scope, restart, replay, rotation, and recovery behavior. |
| FR-008, FR-012 | Per-tool user-scoped lifecycle runbooks and version manifests support repeatable install, inspect, update, rollback, and removal, including bounded Pi Bash delegation outside SancusSight. |
| FR-009 | Source-side minimization plus adapter allowlists exclude prompts, responses, secrets, and unrestricted output. |
| FR-011 | A sanitized release bundle records versions, bounded configuration identities, evidence, verification, failures, and limits. |
| FR-013, FR-015 | A RAMPART projection adapter consumes a privacy-safe report derived from the official JSON sink. |
| FR-014, FR-015 | An AIMap export adapter accepts only completed, authorized scan and endpoint projections. |
| FR-017, NFR-006 | A fixed operator-side progress contract, read-only collector endpoint, and accessible release-run status panel expose bounded progress without promoting it to evidence. |
| FR-018 | The release gate uses the same approved run start and 30-minute boundary for orchestration and current-run evidence, while presenting elapsed/deadline state separately from per-target qualification. |
| FR-020 | Manifest target requirements and bundle selection are paired and evaluated independently per required target; Section 19 prevents one target's newer report from masking another target. |
| NFR-001 through NFR-005 | Fixed adapters, least authority, explicit provenance, independent source health, and strict contract/version rejection cover security, privacy, reliability, auditability, and compatibility. |

## 4. Trust Boundaries and Architecture

```text
Operator-owned real AI workflows
  | Codex CLI / Claude Code / Pi
  |                    Operator-run test and scan commands
  v                              |
Runtime telemetry providers      Praxen   Pipelock   RAMPART   AIMap
  | Agent Beacon / OTLP / Pi JSONL | JSON    | receipts  | report   | export
  +--------------------------------+---------+-----------+----------+
                        sanitized artifacts
                                |
                  fixed read-only adapter boundary
                                |
               SancusSight collector and evidence store
                                |
         source health + evidence ledger + release gate view
```

There are three authority domains:

1. **Operator domain:** installs tools, approves targets/remits/scopes, initiates sessions/tests/scans, and changes enforcement. Pi may perform these bounded actions through Bash when explicitly delegated, but remains in this domain rather than the SancusSight domain.
2. **Producer domain:** observes or mediates real workflows and owns raw evidence, policy, signing keys, and tool-specific state.
3. **SancusSight domain:** reads approved artifacts, validates known contracts, stores allowlisted projections, and reports evidence quality.

No browser or collector route crosses from the SancusSight domain into producer execution. This preserves Spec 004's no-tool-control boundary.

## 5. Operational Layout

Persistent producer state stays in native per-user locations where supported. SancusSight-owned operational manifests and sanitized exports use:

```text
%LOCALAPPDATA%/SancusSight/
  collector/                         existing collector-owned data
  operations/
    inventory.json                   installed version and integrity facts
    scopes/
      praxen-remit.json              approved target/remit identity only
      rampart-suite.json             approved suite and target identity
      aimap-authorization.json       exact owner, target, ports, expiry
    exports/
      runtime-telemetry/
      praxen/
      pipelock/
      rampart/
      aimap/
    runs/<release-run-id>/
      manifest.json
      failures.json
      verification.json
      sanitized-evidence.jsonl
```

Private keys, credentials, raw prompts/responses, and unrestricted source logs never enter this tree. Run IDs are UUIDs generated by the operator-side harness and passed into producer metadata where supported.

## 6. Evidence Classification and Release State

Extend every accepted envelope with qualification metadata:

```ts
type EvidenceQualification = 'operational' | 'isolated-qa' | 'demo' | 'fixture' | 'replay' | 'manual'

interface OperationalProvenance {
  qualification: EvidenceQualification
  sourceVersion: string
  runId: string
  targetId: string
  contractVersion: string
  configurationHash?: string
  telemetryProvider?: 'agent-beacon' | 'codex-otel' | 'claude-otel' | 'pi-extension'
  telemetryTransport?: 'jsonl' | 'otlp-http' | 'otlp-grpc'
}
```

Qualification is not inferred from an artifact path. An artifact may be `operational` only when its source/version/target/run match the active operator-approved release manifest. Missing or mismatched metadata defaults to `manual` or `isolated-qa` and cannot be promoted in the UI.

```ts
type ReleaseGateStatus = 'not-run' | 'in-progress' | 'blocked' | 'passed' | 'expired'

interface ReleaseEvidenceManifestV1 {
  schemaVersion: 1
  releaseRunId: string
  startedAt: string
  completedAt?: string
  runtimes: Array<'codex-cli' | 'claude-code' | 'pi'>
  sources: Record<EvidenceSourceId, {
    version: string
    targetId: string
    evidenceIds: string[]
    latestObservedAt?: string
    verification: EvidenceVerification
    operational: boolean
  }>
  failureCases: Record<string, 'passed' | 'failed' | 'not-run'>
  status: ReleaseGateStatus
  untestedBoundaries: string[]
}
```

The gate passes only when all five evidence categories are operational, bound to the active release run, within the approved 30-minute run/evidence boundary at evaluation, contract-compatible, complete for every required target, and supported by their required failure cases. Runtime telemetry additionally requires independent coverage for `codex-cli`, `claude-code`, and `pi`, with the actual provider and transport retained for every record. A later stale state changes the displayed gate to `expired`; it does not rewrite the historical manifest. Section 19 defines the authoritative A-002 timing and multi-target rules.

## 7. Producer Contracts

### 7.1 Runtime telemetry

- Keep the existing Agent Beacon adapter and evidence intact. Add a `runtime-telemetry` adapter beside it; do not rewrite or duplicate prior `EvidenceEnvelopeV1` records.
- Add `pi` to `EvidenceRuntimeId`. Introduce `RuntimeTelemetryEventV1`, a sanitized append-only JSONL interchange contract whose allowlist contains schema version, event ID, session ID, runtime, provider, transport, provider version, event type, observed time, duration when available, tool name or class when approved, outcome class, approval/block state, and release run ID.
- A fixed operator-side loopback telemetry bridge receives Codex and Claude OTLP, discards all fields outside the allowlist, and writes `RuntimeTelemetryEventV1`. Runtime configuration must disable prompt/content logging before qualification. The bridge is not part of the SancusSight collector API and accepts no generic command or file-read request.
- A user-scoped Pi extension writes the same contract from lifecycle and tool events. It must never serialize prompts, responses, reasoning, Bash command bodies/output, tool arguments/results, secrets, credentials, private keys, file content, or unrestricted paths.
- Pi Bash may invoke only the enumerated operator harness and approved upstream commands for setup and evidence runs. SancusSight stores sanitized action class, producer version, time, and outcome when needed—not command text or unrestricted output.
- Where Agent Beacon is supported, require `content-retention metadata`, use its existing incremental adapter, and label the provider `agent-beacon`. Native OTLP and Pi records must never be labeled Agent Beacon.
- Qualify only events produced after release-run start by the three approved real runtime sessions. A stopped bridge, disabled Pi extension, malformed event, privacy-setting mismatch, or unsupported provider version fails only the affected runtime coverage.

### 7.2 Praxen

- Use the installed plugin against SancusSight plus one operator-used AI workflow, never the bundled example target.
- Store a hash of the explicitly approved Worker Remit and target identity in the run manifest.
- Export canonical schema `2.0` findings into the approved export directory.
- Retain finding ID, severity, policy/remit references, category, target slug, scan time, Praxen version, and summary.
- Reject reports whose target/remit hash does not match the active release manifest.

### 7.3 Pipelock

- Install the pinned release as a persistent user-scoped binary and record its release digest/attestation result.
- Select one real Codex or Claude workflow whose network or MCP action can be routed through Pipelock without intercepting unrelated traffic.
- Run an observation phase in `audit`; promote only that workflow to `balanced` after its expected allow path is confirmed.
- Exercise one normal allow and one controlled block using a synthetic non-secret marker and an operator-owned/harmless destination.
- Keep the Ed25519 private key in Pipelock-owned storage. Pin only the public key fingerprint in SancusSight operations state.
- Replace the default `unavailable` verifier seam with a fixed-function verification boundary. The operator harness invokes Pipelock's standalone/reference verifier against the packet and pinned public key, then writes a minimal `PipelockVerificationV1` artifact. The collector validates that fixed schema and binds it to the packet hash; it never executes the verifier itself.
- Any invalid signature, broken chain, key mismatch, missing allow, or missing block rejects gate satisfaction.

### 7.4 RAMPART

- Install a pinned Python environment in user scope and record RAMPART, Python, pytest, adapter, and evaluator versions.
- Author an approved non-destructive pytest suite for SancusSight's local collector and one real operator-used workflow. The suite must not write outside its isolated test workspace or invoke destructive tools.
- Configure `JsonFileReportSink` as the raw machine-readable source.
- Add stable `scenario_id`, `target_id`, `threat_class`, `expected_safe_behavior`, `evaluator_version`, `suite_version`, and `release_run_id` metadata to every result.
- Because the official raw report includes prompts, responses, tool arguments/results, and evaluator rationale, an operator-side fixed sanitizer emits `RampartOperationalReportV1`. It retains only status, safe flag, bounded summary, harm category, strategy, duration, and approved metadata.
- Reject raw RAMPART reports at the collector boundary. `error` means execution failure, `undetermined` means an evidence gap, `unsafe` means a safety finding, and none may be coerced into a passing result.

### 7.5 AIMap

- Install the pinned upstream application in a user-owned local environment with its dependencies isolated from SancusSight.
- Require a signed-off authorization manifest containing exact loopback/operator-owned target, ports, protocols/templates, owner, purpose, start/end time, and release run ID.
- The operator starts the scan in AIMap. SancusSight never calls `POST /scans`, `/run`, attack, or testing endpoints.
- After AIMap reports `completed`, an operator-side fixed exporter reads that scan and its linked endpoint records and writes `AIMapOperationalExportV1`.
- Retain scan ID/status/config hash, bounded target identity, completion time, AIMap commit/version, endpoint stable ID, IP/hostname/port, protocol, auth status, risk score/factors, finding template/severity/title, and source provenance.
- Exclude system prompts, tool parameter schemas, response bodies, curl commands, raw Nuclei data, geolocation details, exploitation payloads, and unrestricted test output.
- Reject non-completed scans, targets outside the authorization manifest, expired authorization, missing linked provenance, or unsupported versions.

## 8. New Sanitized Contracts

`RuntimeTelemetryEventV1`, `RampartOperationalReportV1`, `AIMapOperationalExportV1`, and `PipelockVerificationV1` are SancusSight-owned interchange contracts. Their schemas live under `contracts/`, with JSON Schema validation, version-pinned fixtures, and explicit allowlists. Operator-side bridges/exporters are fixed tools with typed inputs and outputs; they accept no arbitrary command string.

Add `runtime-telemetry` beside the existing `agent-beacon` source and preserve `EvidenceEnvelopeV1` as canonical. Release-gate calculation groups both source IDs into the runtime-telemetry category while retaining provider truth on each envelope. The adapter follows the existing `EvidenceAdapter` interface and artifact checkpoint behavior and rejects a whole incompatible event rather than partially accepting records under an unknown contract.

## 9. Operational Harness and Lifecycle

Provide PowerShell entry points under `operations/` for Windows and WSL-aware tools:

| Command | Responsibility |
|---|---|
| `preflight.ps1` | Inspect supported runtimes, installed versions, hashes, paths, privacy/enforcement settings, and target manifests. |
| `install-user.ps1 -Source <id>` | Install one pinned source or telemetry provider in user scope from its official release/package source and verify integrity where upstream supports it. May be invoked by Pi Bash as an operator-side action. |
| `run-release-gate.ps1` | Create a run manifest and guide/execute only fixed approved stages; active scan/enforcement stages require the corresponding committed scope manifest. |
| `export-source.ps1 -Source <id>` | Produce a sanitized fixed-contract artifact from completed upstream output. |
| `exercise-failures.ps1` | Execute bounded failure cases and record expected/observed state transitions. |
| `inspect.ps1` | Report versions, process/service state, evidence paths, freshness, and current gate gaps. |
| `rollback.ps1 -Source <id>` | Restore prior pinned version/config and disable the selected enforcement path. |
| `uninstall-user.ps1 -Source <id>` | Remove program/config only after separate confirmation; preserve evidence by default. |

Scripts pin source versions and fail closed on unknown versions. They may invoke only enumerated source commands with structured parameters. They are not exposed through HTTP and never accept a free-form executable or argument tail.

## 10. Rollout Sequence

1. **Preflight:** inventory source versions, runtime availability, privacy mode, target ownership, and artifact contracts.
2. **Observe:** run real Codex CLI, Claude Code, and Pi sessions through their qualified telemetry providers; run approved Praxen and RAMPART suites; complete authorized AIMap loopback scan.
3. **Pipelock audit:** route one selected real workflow through audit mode and confirm normal behavior plus receipt creation.
4. **Pipelock balanced:** enable balanced mode only for that path, confirm one allow and one safe block, independently verify receipts, then retain or roll back based on results.
5. **Failure matrix:** exercise each mandatory failure and recovery without deleting prior normalized evidence.
6. **Release bundle:** assemble the sanitized manifest, accepted evidence references, verification results, failure results, and untested boundaries.

Any failed stage leaves product state `Not ready for release`. A retry creates a new run or records an explicit superseding attempt; results are not edited in place.

## 11. Failure and Recovery Matrix

| Case | Expected SancusSight behavior | Recovery proof |
|---|---|---|
| Producer stopped | Prior evidence retained; source becomes stale, then failed according to health policy. | New valid source event restores current state. |
| Telemetry bridge stopped or Pi extension disabled | Only the affected runtime coverage becomes missing/stale; prior evidence remains historical. | Restart/re-enable and accept a fresh privacy-safe event from that runtime. |
| Malformed or privacy-unsafe runtime event | Reject the event without advancing its checkpoint or accepting forbidden fields. | A valid allowlisted event is accepted once with the same healthy sources unaffected. |
| Artifact missing/inaccessible | Only affected source reports permission/failed; checkpoint is not advanced. | Same or replacement approved path yields fresh evidence. |
| Unsupported contract/version | Whole artifact quarantined with expected/supported version guidance. | Supported export is accepted without duplicating old evidence. |
| Invalid Pipelock signature/chain/key | Packet cannot satisfy verified control evidence. | New packet verifies against pinned fingerprint. |
| RAMPART execution error | `error` is visible as infrastructure failure, never a safety pass. | A new complete run has no infrastructure errors. |
| AIMap target outside scope or scan incomplete | Export rejected; no partial endpoint findings satisfy the gate. | New completed scan exactly matches a valid authorization manifest. |
| Collector restart | Accepted evidence and source checkpoints survive. | Poll resumes without duplicate envelopes. |
| Duplicate replay | Deterministic IDs produce no new accepted records. | A genuinely new event receives a new ID. |
| Rotation/replacement | Identity/hash checks prevent skipped or duplicated evidence. | Fresh post-rotation event is accepted. |
| Source upgrade | Existing evidence retained; new evidence blocked until contract preflight passes. | Pinned contract fixtures and one operational event pass. |

## 12. UI Changes

- Rename the source rail mode from broad `Collector live` language to `Local evidence collector`.
- Show all five evidence categories as first-class rows. Runtime telemetry expands to show Codex CLI, Claude Code, and Pi with the actual provider and transport; Agent Beacon is a provider label, not the category name.
- Add a compact qualification label: `Operational`, `QA`, `Demo`, `Manual`, or `Unqualified`.
- Keep health (`Current`, `Stale`, `Failed`) separate from qualification and verification. `Current` means recently collected, not protected or release-ready.
- Add a `Release evidence` view with one row per mandatory source, runtime coverage, freshness, verification, failure exercise, and a single factual gate state.
- Display `Not ready for release` until the manifest passes. Do not use `Protected`, `Secure`, or `Continuous monitoring` as aggregate claims.
- Source detail shows evidence path, version, target ID, last accepted time, qualification, verification, and recovery guidance. It does not show install/run/scan buttons.
- Hosted mode remains manual snapshot only and cannot display an operational gate pass from imported evidence unless the signed/sanitized release manifest and referenced evidence are present and validated.

## 13. Security and Privacy

- SancusSight reads only explicitly configured paths through fixed adapters and preserves loopback-only same-origin protections.
- Active AIMap scanning requires exact authorization and is initiated outside SancusSight.
- Pipelock begins in audit mode and applies balanced enforcement only to the selected workflow; rollback disables that route without changing unrelated traffic.
- Agent Beacon effective retention must be `metadata` where used; Codex and Claude content/prompt telemetry must be disabled; the Pi extension is allowlist-only before operational qualification.
- RAMPART and AIMap raw outputs stay outside collector storage because they can contain prompts, responses, tool schemas, payloads, and raw network data.
- Sanitizers use explicit field construction, not recursive deny lists.
- Source credentials, signing private keys, and unrestricted output never enter the repository or release bundle.
- Repository evidence is sanitized again before retention; local absolute paths and user identity are replaced with bounded aliases.

## 14. Verification Strategy

### Automated contract and collector tests

1. Accept valid sanitized runtime, RAMPART, and AIMap artifacts and normalize stable records without rewriting existing Agent Beacon envelopes.
2. Reject raw RAMPART reports containing `turns` and AIMap exports containing raw data/system prompts.
3. Reject wrong schema/source versions, incomplete AIMap scans, mismatched target authorization, and missing release metadata.
4. Bind a Pipelock verification artifact to the exact packet hash and pinned public-key fingerprint.
5. Distinguish operational, QA, demo, replay, fixture, and manual evidence throughout persistence and UI.
6. Calculate the five-category gate with boundary tests for all three runtimes, provider truth, freshness, verification, failures, and expiry.
7. Preserve source isolation, restart idempotency, rotation behavior, and redaction from Spec 004.

### Operational acceptance

- Run ordinary Codex CLI, Claude Code, and Pi tasks and confirm correctly attributed runtime events bound to the active run and accepted within its 30-minute boundary.
- Run Praxen against the approved real targets and ingest canonical findings.
- Route the selected real workflow through Pipelock, produce allow/block receipts, and verify them independently against the pinned key.
- Run the approved RAMPART suite and ingest the sanitized report with no execution errors.
- Complete the authorized AIMap scan and ingest its sanitized completed findings.
- Exercise every failure/recovery row and confirm healthy sources remain available.
- Restart producers and collector as specified, then repeat fresh-event checks.
- Produce and independently review the release bundle before changing readiness language.

Project verification remains `npm run verify:core`, collector tests, `npm run build`, and Playwright checks at desktop/mobile widths. Operational acceptance evidence is additional and cannot be replaced by fixtures.

## 15. Technical Decisions

### TD-001: Persistent user scope first

Use user-scoped producer installations for the first release. This provides restart persistence and real runtime integration without the permissions and blast radius of machine-wide services.

### TD-002: Fixed operator harness, no control API

Use explicit local scripts for lifecycle and release exercises. They are auditable and repeatable while keeping active authority outside SancusSight's browser and collector.

### TD-003: Sanitized projection contracts

Ingest SancusSight-owned projections for RAMPART, AIMap, and external Pipelock verification. Their raw native outputs are too broad or execution-coupled for direct collector storage.

### TD-004: Operational qualification is manifest-bound

Do not infer production quality from authentic binaries or recent timestamps. Qualification requires a matching approved target, version, run, and source configuration in the active manifest.

### TD-005: Release readiness is conjunctive and expiring

All five sources and mandatory failures must pass. Missing, stale, synthetic, untrusted, or unsupported evidence blocks the gate, and freshness expiry is visible without rewriting historical evidence.

### TD-006: RAMPART and AIMap remain test tools, not continuous controls

Their completed runs provide point-in-time safety and attack-surface evidence. The UI must not describe them as continuously monitoring or protecting a workflow.

### TD-007: Expand-contract runtime telemetry category

Preserve the existing Agent Beacon source and canonical `EvidenceEnvelopeV1`; add a provider-neutral runtime telemetry adapter and category mapping beside it. This avoids rewriting historical evidence while allowing Windows/WSL-native and Pi telemetry to satisfy runtime coverage truthfully.

### TD-008: Pi extension and Bash stay operator-side

Use a user-scoped, metadata-only Pi extension for telemetry and allow Pi Bash to invoke only fixed approved setup/run procedures. This provides real Pi evidence and delegated setup without adding execution authority, arbitrary filesystem access, or upstream mutation to SancusSight.

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Active tools disrupt normal AI work | User scope, one selected path, audit-first rollout, non-secret block signal, explicit rollback. |
| Raw reports leak sensitive content | Fixed allowlist sanitizers, raw-artifact rejection, metadata-only Beacon, sanitized repository bundle. |
| Authentic QA evidence is mislabeled operational | Manifest-bound qualification and distinct UI labels. |
| Tool upgrades silently change contracts | Pinned versions/digests, JSON Schemas, fixture preflight, fail-closed adapters. |
| AIMap scans an unauthorized target | Exact expiring authorization manifest, loopback/operator-owned default, no scan API in SancusSight. |
| Pipelock packet claims self-verification | Separate verification artifact bound to packet hash and pinned public key. |
| RAMPART infrastructure error appears safe | Preserve all four statuses; errors and undetermined results block the gate. |
| Five-source gate becomes burdensome | One orchestrated run manifest and inspect command expose the next unmet condition without weakening requirements. |
| Pi or native telemetry leaks content | Source settings plus explicit-field projection; reject unknown fields and privacy-setting mismatches; never persist command bodies, output, prompts, responses, reasoning, tool payloads, secrets, or paths. |

## 17. Implementation FAQ

**Are the tools bundled into SancusSight?**  
No. They remain separately licensed, installed, updated, and operated. The user-scoped harness pins and verifies supported versions.

**Does this make the tools system-wide?**  
No. The approved first release is persistent for this user and these three runtimes. Machine-wide services and all-traffic interception require a separate specification.

**Can Pi install and run the upstream tools?**  
Yes, as a delegated operator-side action through Pi Bash using the fixed approved harness or enumerated upstream commands. Pi does not call a SancusSight execution endpoint, and command text/output is excluded from normalized evidence.

**Can SancusSight launch RAMPART or AIMap?**  
No. It ingests completed sanitized artifacts after the operator runs an approved test or scan.

**Why not ingest raw RAMPART and AIMap output?**  
Their native records can contain prompts, responses, tool data, payloads, and raw network evidence beyond SancusSight's privacy boundary.

**What proves Pipelock worked?**  
A real selected workflow produces an allow and a controlled block, Pipelock signs the receipts outside the agent, and an independent verifier validates the exact packet against a pinned public key.

**What makes the product release-ready?**  
Only a fresh, reviewed release manifest in which all five operational evidence categories, all three approved runtimes, verification checks, and required failure/recovery exercises pass.

## 18. Amendment A-001: Progress status and orchestration timing

### 18.1 Progress contract

Add `ReleaseProgressSnapshotV1` beside the existing evidence contracts. It is advisory run metadata, not an `EvidenceEnvelopeV1`, and contains only:

- `schemaVersion: 1` and `contractVersion: release-progress-v1`;
- `releaseRunId` and one fixed producer ID from `runtime-telemetry`, `praxen`, `pipelock`, `rampart`, or `aimap`;
- bounded `targetId`, `state`, and `stage` values;
- `startedAt` and `updatedAt` ISO timestamps;
- optional non-negative `completedUnits` and `totalUnits`, where `totalUnits > 0` and `completedUnits <= totalUnits`;
- an allowlisted `messageCode`, never free-form text.

The fixed operator-side writer stores the latest snapshot at `%LOCALAPPDATA%\\SancusSight\\operations\\progress\\current.json`. The writer accepts only typed parameters and fixed enums; it never runs a producer, reads a source artifact, or accepts a command string. SancusSight reads this one user-scoped path and does not expose a write route.

### 18.2 Collector API and state

`LocalCollectorService` reads and validates the progress snapshot through a small `ReleaseProgressStore`. `GET /api/v1/release-progress` returns either the bounded snapshot or an explicit unavailable response. Unknown fields, invalid timestamps/counts, unsupported contracts, run mismatches, and snapshots older than the progress-stale threshold are rejected or marked stale without affecting accepted evidence. The endpoint is loopback-only and follows existing read-only response security headers.

The collector must never synthesize a percentage from elapsed time, source count, or evidence count. If both unit counts are valid it may derive `percent`; otherwise it returns `percent: null` and the UI uses an indeterminate state.

### 18.3 UI behavior

`ReleaseEvidence` receives the optional progress snapshot from `useCollector` and renders a `ReleaseProgressPanel` before the source gates:

- determinate native progress when a valid percentage exists;
- indeterminate progress plus stage when no percentage exists;
- `Waiting`, `Stale`, `Failed`, `Cancelled`, or `Complete` labels from the contract state;
- producer, target, run ID, last heartbeat, elapsed orchestration time, and a separate 30-minute deadline indicator;
- a source-count summary such as `2/5 evidence categories complete`, clearly separate from producer percentage.

The panel states that progress is advisory and does not qualify release readiness. Hosted/manual mode renders a static `Live progress unavailable` message and never imports or invents progress.

### 18.4 Gate timing

A-001 originally kept `RELEASE_FRESHNESS_WINDOW_MS = 5 * 60 * 1000` beside `RELEASE_ORCHESTRATION_WINDOW_MS = 30 * 60 * 1000`. Approved requirements amendment A-002 supersedes that split-window design. Section 19 replaces it with one current-run-bound 30-minute evidence and orchestration boundary while retaining distinct UI explanations for progress, missing evidence, target incompleteness, stale evidence, and an overrun.

### 18.5 Verification and rollout

Add contract tests for valid/invalid progress, count boundaries, stale heartbeats, run binding, privacy rejection, and read-only route behavior. Add release-gate tests for the shared 30-minute boundary and the per-target selection rules in Section 19. Add component tests or Playwright assertions for determinate, indeterminate, stale, failed, incomplete-target, hosted/manual, reduced-motion, keyboard-focus, and overflow states. Roll out the progress panel as advisory; no readiness decision may depend on it until the final manifest and evidence gate pass.

## 19. Approved Amendment A-002: Run-bound freshness and complete multi-target evidence

**Approval:** Explicitly approved by the operator on 2026-07-21.

This amendment is the authoritative design for FR-019, FR-020, and NFR-007. It supersedes the five-minute freshness statements in Sections 3, 6, 14, and 18 while preserving the approved 30-minute orchestration maximum, source isolation, trusted-verification checks, privacy exclusions, and failure/recovery gate.

### 19.1 Shared temporal boundary

Use one constant for both final evidence age and orchestration duration:

```ts
const RELEASE_RUN_WINDOW_MS = 30 * 60 * 1000
```

`calculateReleaseGate` derives `runStartedAt` from `manifest.startedAt` and uses the call's validated `now` as the single `evaluatedAt` boundary. `manifest.completedAt`, when present, must fall between those values and no later than `runStartedAt + RELEASE_RUN_WINDOW_MS`; it records orchestration completion but does not create a second freshness clock.

An evidence record is temporally eligible only when all of the following are true:

1. `operational.runId` exactly equals `manifest.releaseRunId`.
2. Its authoritative `EvidenceEnvelopeV1.observedAt` parses successfully and is at or after `runStartedAt`.
3. `observedAt` is at or before `evaluatedAt`; future-dated evidence fails closed.
4. `evaluatedAt - observedAt <= RELEASE_RUN_WINDOW_MS`, with the exact 30-minute boundary accepted.
5. The run itself has not exceeded `RELEASE_RUN_WINDOW_MS`.

Adapters continue to derive `observedAt` from the supported producer field: for Praxen this is `scan.scan_timestamp`. `importedAt`, filesystem creation/modification time, copy time, and rendered-report completion time never substitute for or rewrite the producer-observed time. The gate emits distinct bounded blockers for pre-run, future-dated, wrong-run, stale, and orchestration-overrun evidence.

Progress heartbeat staleness remains a separate advisory UI concern. It may mark progress `stale`, but it cannot qualify or disqualify otherwise valid evidence except through the final evidence rules above.

### 19.2 Paired required-target manifest contract

Extend `ReleaseSourceManifestV1` through expand-contract with an optional paired target structure:

```ts
interface ReleaseRequiredTargetV1 {
  targetId: string
  evidenceIds: string[]
  latestObservedAt: string
  workerRemitHash?: string
}

interface ReleaseSourceManifestV1 {
  // Existing summary fields remain during migration.
  requiredTargets?: ReleaseRequiredTargetV1[]
}
```

For a source with more than one approved required target, `requiredTargets` is mandatory and authoritative. Each `targetId` appears exactly once; `workerRemitHash`, when required by the source, is paired with that target rather than accepted from an independent cross-product array. The parent `evidenceIds`, `targetId`/`targetIds`, `latestObservedAt`, and `workerRemitHash`/`workerRemitHashes` remain derived compatibility summaries during migration and must equal the union or summary of `requiredTargets`. A contradiction fails manifest validation.

Legacy single-target manifests remain readable and viewable. They may use the existing scalar fields. A legacy multi-target manifest without paired `requiredTargets` cannot satisfy a newly evaluated A-002 release gate because target/remit completeness cannot be established unambiguously.

### 19.3 Deterministic per-target selection

The release-bundle builder stops selecting one newest timestamp for an entire non-runtime source. It performs these steps instead:

1. Filter normalized evidence to `qualification === 'operational'` and the active `releaseRunId`.
2. Group each release-critical source by exact `operational.targetId` (runtime telemetry remains grouped by required runtime first).
3. Within each required target, reject records that fail temporal, version, contract, target, privacy, provenance, verification, or Worker Remit qualification.
4. Group the remaining records into canonical report candidates by `targetId`, authoritative `observedAt`, and `provenance.artifactContentHash` so every finding from the selected report stays together.
5. Select the newest candidate independently for each required target. Break an equal-timestamp tie deterministically by artifact content hash, then evidence ID; never use filesystem ordering or modification time.
6. Write one `requiredTargets` entry per approved target and derive the parent compatibility summaries from those entries.

For Praxen, the first approved required targets are `sancussight` and `sdd-exec`, each paired with its approved Worker Remit hash. A canonical report for one target never replaces, hides, or supplies evidence for the other target. Extra unapproved targets are excluded from the release bundle and cannot compensate for a missing required target.

### 19.4 Gate evaluation and result shape

`calculateReleaseGate` evaluates each `requiredTargets` entry independently before reducing to the source result. Add a bounded target result for truthful diagnostics:

```ts
interface ReleaseTargetGateResult {
  targetId: string
  state: ReleaseSourceGateState
  fresh: boolean
  evidenceIds: string[]
  latestObservedAt?: string
  blockers: string[]
}

interface ReleaseSourceGateResult {
  // Existing source summary fields remain.
  targets?: ReleaseTargetGateResult[]
}
```

A source is `current` only when every required target is current. Missing, wrong-run, pre-run, future-dated, stale, wrong-version, incompatible-contract, Worker Remit mismatch, privacy rejection, or failed/untrusted verification on any target blocks the source and the aggregate release gate. Blocker codes include the bounded target identity, for example `praxen:target-missing:sdd-exec` or `praxen:target-stale:sancussight`, so the UI and operator harness can state the precise next action.

Runtime telemetry applies the same temporal predicate independently to Codex CLI, Claude Code, and Pi. Pipelock receipt verification, RAMPART passing outcomes, AIMap authorization/completion, and the 15-case failure matrix remain conjunctive checks and are not weakened by the longer evidence window.

### 19.5 UI and operational behavior

The `Release evidence` view shows required targets nested under a multi-target source with target label, authentic observed time, current-run status, and a text blocker. Source-level `Current` is a reduction over all required targets, not the newest target. The progress panel continues to show the orchestration deadline separately and remains advisory.

When the run exceeds 30 minutes, when any target is missing, or when evidence falls outside the active run boundary, the UI remains `Not ready for release`. It never suggests touching a timestamp or copying an artifact as recovery; the recovery guidance is to start a new run or rerun the specific missing/failed target within the active run when time remains.

### 19.6 Migration and rollback

Use expand-contract so historical manifests and evidence remain inspectable:

1. Expand types, validation, gate results, and the builder with `requiredTargets` while retaining existing summary fields.
2. Migrate the current release-manifest example, T10 bundle builder, UI, and focused tests to paired targets and `RELEASE_RUN_WINDOW_MS`.
3. Contract only after all current producers and fixtures use paired targets; retain a read-only legacy parser for historical bundles.

No historical artifact is relabeled or rewritten. Existing implementation and QA evidence predating A-002 remains historical and non-qualifying. Rollback restores the previous application code but cannot claim A-002 readiness; the product remains `Not ready for release` until a newly run A-002 gate passes.

### 19.7 Verification strategy

The preferred seam is the pure release-gate calculation plus a pure per-target candidate-selection helper used by the bundle builder. The first red/green test uses two required Praxen targets whose canonical reports have different valid observed times: both must appear independently and the source must pass when both fall inside the same 30-minute run. Removing either target must produce a target-specific blocker.

Focused automated coverage includes:

- exact run start, exact 30-minute age, and exact 30-minute orchestration boundaries pass; one millisecond before the run, in the future, older than 30 minutes, or beyond the orchestration deadline fails;
- changing `importedAt` or filesystem metadata cannot rescue stale, historical, or wrong-run evidence;
- two Praxen targets with unequal timestamps and different Worker Remit hashes both qualify independently;
- a newer report for one target cannot mask the absence, stale state, wrong remit, or incompatible contract of another;
- equal-timestamp candidates select deterministically without dropping findings from the chosen canonical report;
- Codex CLI, Claude Code, and Pi each apply the same current-run predicate independently;
- source isolation, Pipelock trust, RAMPART outcome, AIMap authorization, privacy rejection, and all required failure cases remain enforced;
- the UI exposes target-specific states accessibly without relying on color, motion, hover, or unbounded content.

Run `npm run test:collector`, `npm run verify:core`, `npm run build`, the focused operations checks, and the operational release exercise. The operational verdict requires a newly generated A-002 manifest and evidence bundle; prior T10 results cannot be reused as passing proof.

### 19.8 Technical decision TD-009

**Decision:** Use one 30-minute run/evidence boundary and paired per-target manifest entries, selecting canonical evidence independently for every required target.  
**Why:** This matches the approved product contract and the observed Praxen behavior without trusting filesystem timestamps or weakening completeness.  
**Trade-off:** The manifest, gate result, builder, tests, and UI gain target-level structure, and historical multi-target manifests cannot qualify under A-002 without a new run.  
**Alternatives considered:** Keeping five-minute final age rejects legitimate current-run evidence; using only flat `targetIds` and `workerRemitHashes` permits ambiguous cross-pairing; using filesystem time would make copied or touched artifacts appear current.

## 20. Amendment A-003: Deterministic Praxen producer boundary

**Status:** Approved remediation design; the A-002 baseline remains approved, and implementation is now authorized only through approved task T16R.

### 20.1 Scope and authority

This amendment closes the observed trust-boundary defect in the Praxen producer harness. It applies identically to both release targets, `sancussight` and `sdd-exec`, and does not add a model-authored-report exception.

The producer model may inspect the approved workspace and Worker Remit and may write only a temporary Step 9.9 draft manifest into the current target's staging directory. The model is not an evidence producer and never owns an official findings or rendered-report path. The PowerShell runner is the orchestration owner; the pinned Praxen Python converter and renderer remain the canonical transformation and rendering authority; SancusSight TypeScript validates binding, freshness, provenance, and gate consequences.

This is an implementation correction for FR-003, FR-005, FR-006, FR-009, FR-012, FR-015, FR-016, FR-019, and FR-020 plus NFR-003, NFR-004, NFR-005, and NFR-007. Requirements and the A-002 30-minute boundary are unchanged.

### 20.2 Run-scoped pipeline

Each target receives a newly created, non-reused directory with these logical areas:

```text
<run>/<target>/
  staging/                 model-written Step 9.9 draft only
  converter/               temporary converter output
  canonical/               runner-promoted converter output, immutable
  rendered/                renderer-created HTML/TXT, immutable
  operational/             runner-created binding projection for ingestion
  result.json              pass, failed, partial, or exception state
```

The runner performs these steps in order:

1. Create and validate the exact run, target, Worker Remit hash, pinned plugin, Claude CLI, Python, converter, and renderer inputs. Refuse to reuse a prior target directory.
2. Start one fresh, short Haiku session with no retained conversation and grant the model staging output only. A retry is never automatic and requires an explicit operator approval parameter.
3. Require exactly one fresh Step 9.9 draft manifest in staging. Missing, duplicated, stale, malformed, wrong-run, or wrong-target drafts fail closed. Any model-authored JSON, including canonical-looking findings JSON, is ignored as input and never promoted directly.
4. Invoke the pinned `manifest_to_findings.py` with the draft as input and a temporary converter output path. A non-zero exit, missing output, malformed JSON, missing `schema_version`, missing `scan`, missing `findings`, or missing `praxen_version` fails closed.
5. Invoke the pinned `render.py` against the converter output and the pinned template, writing only to the runner-owned rendered directory. Renderer failure or schema failure fails closed; HTML and TXT are never hand-edited.
6. Verify the converter output's canonical content hash and producer-observed `scan.scan_timestamp`, then create the runner-owned operational binding projection with the exact run/target/remit and tool-version facts. The canonical converter output remains retained separately and is not rewritten.
7. Write a bounded `result.json` and expose the target result to the run orchestrator. Only a runner-created, binding-valid operational projection may be passed to the collector or release bundle builder.

The runner must not reimplement Praxen conversion or rendering in TypeScript. TypeScript may normalize the runner-created binding and apply the existing release-gate predicates, but it may not synthesize findings, timestamps, or rendered report content.

### 20.3 Binding and validation contract

The runner-created operational projection carries a bounded `sancussight.runnerBinding` object alongside the unchanged Praxen fields. It includes:

- `bindingVersion: 1` and producer marker `sancussight-praxen-runner`;
- exact `releaseRunId`, `targetId`, `workerRemitHash`, `sourceVersion`, and `contractVersion`;
- canonical artifact content hash and the producer-observed `scan.scan_timestamp`;
- exact Claude CLI version, selected model, Praxen plugin version, converter script hash, renderer script hash, and runner version;
- the source paths only as sanitized relative role names, never absolute workspace paths.

The Praxen adapter accepts operational evidence only when the binding marker, required fields, exact current run and target, paired Worker Remit hash, supported versions, canonical content hash, and privacy allowlist all validate. It rejects staging files, model-authored canonical-looking JSON, missing or unexpected versions, wrong-run/wrong-target/wrong-remit bindings, malformed schema, stale evidence, and bindings that cannot be linked to the converter output. Existing historical and legacy fixture imports remain readable as non-operational evidence and cannot satisfy A-002.

### 20.4 Partial, exception, and retry behavior

If one producer target fails after the run begins, the orchestrator writes an explicit partial result naming the producer, target, stage, failure code, and operator action required. It pauses the remaining release stages and does not invoke a passing bundle write. A caller may continue only after explicit operator direction; a retry receives a new isolated staging directory and a new result record.

An operator-approved exception is retained with `state: exception`, a reason, and the approving action, but it remains non-clean and non-release-eligible. Missing, invalid, stale, wrong-run, wrong-target, wrong-version, converter, renderer, or privacy failures always fail closed.

### 20.5 Regression strategy

The preferred seam is the real runner's artifact-boundary pipeline with controlled test doubles for the model process and pinned Python commands. Test fixtures are explicitly labelled test data and never enter an A-002 run. Coverage must prove:

- valid Step 9.9 draft -> real converter -> canonical JSON -> real renderer -> accepted runner binding;
- missing draft, converter failure, malformed schema, missing required field, wrong run, wrong target, missing/unexpected version, stale timestamp, and renderer failure all fail closed;
- a model-authored canonical-looking JSON without a runner-created converter/binding result is not accepted directly;
- a producer failure produces a visible partial result, names the blocker, pauses for operator direction, and writes no passing bundle;
- converter output is deterministic across repeated runs and rendered artifacts are produced only by the pinned renderer;
- existing collector, core, build, operations, governance, privacy, and failure-matrix checks remain green.

### 20.6 Migration and rollback

The remediation uses expand-contract. The runner first writes new staged/canonical/rendered/operational paths beside existing historical paths. The adapter recognizes the new runner binding for operational qualification while retaining read-only parsing of historical evidence. After fresh regressions pass, the A-002 runner uses only the new path. Rollback restores the prior runner code but cannot promote old or historical evidence and cannot claim release readiness.

### 20.7 Technical decisions

#### TD-010: Model drafts are never canonical

- **Decision:** Only the pinned converter may create canonical findings JSON, and only the pinned renderer may create official HTML/TXT reports.
- **Why:** The failed run demonstrated that a plausible report-shaped model file can bypass the intended provenance boundary.
- **Trade-off:** The runner owns more orchestration and must preserve temporary stage evidence, but deterministic qualification becomes auditable.
- **Alternatives considered:** Prompt-only instructions, direct model JSON acceptance, and reimplementing the converter in TypeScript; all are rejected.

#### TD-011: Bind operational metadata outside the canonical transform

- **Decision:** Keep converter output unchanged for rendering and create a separate runner-owned operational projection that binds it to run, target, remit, provenance, and versions.
- **Why:** Praxen's canonical schema and renderer stay authoritative while SancusSight retains the metadata needed for release qualification.
- **Trade-off:** The adapter validates a paired canonical/binding relationship rather than consuming one model-shaped file.
- **Alternatives considered:** Mutating canonical Praxen JSON in TypeScript or accepting a model-authored `operational` block; both weaken the trust boundary.

## 21. Draft Amendment A-004: Runner-owned Praxen draft structure

**Status:** Approved remediation design on 2026-07-23. Requirements, A-002
timing and target completeness, and the approved A-003 converter/renderer
authority remain unchanged. Implementation requires an approved task; this
design approval does not authorize an A-002 retry.

### 21.1 Observed contract gap

Fresh run `spec005-a002-t16-20260723191340` passed the corrected provider
canaries, the `15/15` failure matrix, and current-run metadata-only telemetry.
The first Praxen target then failed closed because the model-authored Step 9.9
draft added unsupported top-level heading `## Target`. The pinned
`manifest_to_findings.py` converter correctly rejected it.

A-003 established byte-zero header validation and runner-owned canonical
conversion/rendering, but the runner still asked the model to reproduce the
long-form parser structure from prose. That left the staging format
nondeterministic even though downstream promotion remained safe.

### 21.2 Scope and preserved authority

This amendment changes only the staging authoring contract:

- Haiku remains a staging-only analyst and prose/value author.
- The runner owns a version-pinned draft structure profile and its skeleton.
- The model still writes one markdown Step 9.9 draft; model-authored JSON,
  canonical findings, rendered output, and operational bindings remain
  prohibited.
- The installed pinned Praxen converter remains the only canonical findings
  authority. The pinned renderer remains the only official HTML/TXT authority.
- SancusSight adapters, the A-002 gate/builder, the 30-minute boundary, privacy
  rules, paired targets/remits, partial-state pause, and no-automatic-retry
  behavior are unchanged.

### 21.3 Version-pinned draft profile and skeleton

Add a repository-owned draft profile and markdown skeleton paired to Praxen
`1.1.0` and manifest format `1`. The runner records the profile version and
SHA-256 in its plan and result evidence and refuses an unsupported
Praxen/profile pairing.

The skeleton contains the exact authored top-level sequence:

```text
# Praxen draft manifest
## scan
## intro_band
## behavior_summary
## raise_posture
## remit_coverage
## findings
## positives
## log_files
```

`## footer` and `### stat_counts` are not authored; the pinned converter
derives them. The skeleton also fixes the required static subsection headings,
field markers, six-category order, and explicit insertion slots for the
variable rule, finding, positive, and log-row blocks.

The runner writes the immutable guidance skeleton into the fresh staging
directory before the model starts. Haiku must use that exact file as the
structural source and write the one final draft path by replacing every
required value/insertion slot. It may add variable `#### R-NN` rule blocks and
`### PRAX-YYYY-MM-DD-NNN (Severity)` finding blocks only at their declared
anchors. It may not add, delete, rename, or reorder structural headings or
field markers.

The skeleton is guidance and validation input, not evidence. It is never sent
to the converter and cannot satisfy freshness or release qualification.

### 21.4 Pre-converter structural gate

After the model exits, the runner validates the raw draft before invoking
Python:

1. Preserve A-003 byte-zero/first-line, exactly-one-fresh-file, run, target,
   path, and timestamp checks.
2. Verify the pinned profile identity/hash and exact supported
   Praxen/manifest-format pairing.
3. Require the exact authored top-level heading sequence above. Reject
   `Target`, `footer`, any unknown heading, duplicate heading, missing heading,
   or reordered heading.
4. Require each fixed subsection under its declared parent. Allow dynamic rule
   and finding headings only when they match their exact patterns and occur
   under the correct parent.
5. Reject unreplaced skeleton slots, template instructions, `TBD`/placeholder
   sentinels, tabs, Markdown fences, or structural comments in the final draft.
6. Pass the unchanged draft to the pinned converter. The converter remains the
   authority for required/unknown fields, indentation, typed values, schema
   completeness, derived fields, and canonical JSON.

The runner does not repair, normalize, synthesize, reorder, or fill a rejected
draft. Structural failure writes a bounded failed target result at
`staging-structure-validation`; converter failure remains a separate
`converter` stage. Either outcome causes the two-target wrapper to write
non-release-eligible `partial`, pause, and skip promotion.

### 21.5 Prompt and process boundary

The plan-only prompt must name the pinned skeleton/profile paths and hashes,
the exact top-level sequence, the permitted dynamic heading patterns, the
no-extra/no-reorder/no-placeholder rules, and the one final draft path.

The model may read the approved workspace, Worker Remit, installed Praxen
skill, and runner-owned skeleton. Its write authority remains limited to the
fresh staging directory. It may not invoke the converter or renderer, write
official-looking artifacts, use subagents, or continue after a structural
validation failure.

### 21.6 Regression strategy

The preferred seam remains the real runner boundary with controlled model
output and the real pinned converter/renderer.

The first red/green regression supplies a parser-grade draft containing
`## Target`. Before the correction it reaches the converter and fails there;
after the correction it must fail at `staging-structure-validation`, record
operator action required, invoke neither converter nor renderer, and produce no
canonical, operational, bundle, or current-release output.

Required focused cases:

- exact skeleton-shaped draft -> real converter -> canonical JSON -> real
  renderer -> accepted runner binding;
- added `## Target`, unknown `###` subsection, duplicate heading, missing
  heading, and reordered top-level heading each fail before converter;
- unreplaced slot, `TBD`, structural comment, tab, fence, malformed dynamic
  rule heading, and malformed finding heading each fail before converter;
- missing/unknown field and typed/schema errors still fail in the pinned
  converter rather than being reimplemented or repaired by PowerShell;
- runner plan evidence contains the exact profile/hash/skeleton and prompt
  contract;
- target failure still writes explicit partial state, pauses the second target,
  and cannot invoke passing bundle promotion;
- existing T16R boundary, adapter, collector, core, build, operations,
  governance, privacy, RAMPART, and failure-matrix checks remain green.

No test fixture or skeleton may enter an operational A-002 run as evidence.

### 21.7 Migration and rollback

Use expand-contract inside the fresh attempt directory: retain the existing
staging/canonical/rendered/operational layout, add the pinned profile and
guidance skeleton beside the final draft, and record their bounded hashes in
runner evidence. Historical attempts remain read-only and non-qualifying.

After focused and project regressions pass, a separately authorized new T16
run uses only the profile-bound staging path. Rollback removes the profile
gate and restores A-003 behavior, but cannot promote historical output or
claim release readiness.

### 21.8 Technical decision TD-012

- **Decision:** The runner owns a version-pinned markdown draft profile and
  skeleton; the model supplies only values and declared variable blocks, and
  the runner verifies the exact structural signature before the pinned
  converter.
- **Why:** This removes repeated model judgment from parser structure without
  replacing Praxen's canonical converter or allowing direct model-authored
  JSON.
- **Trade-off:** The runner gains one versioned template/profile and structural
  validator that must be updated when Praxen's manifest format changes.
- **Alternatives considered:** Prompt-only heading instructions remain
  nondeterministic; accepting `## Target` weakens the pinned contract;
  model-authored JSON conflicts with A-003; PowerShell generation of canonical
  findings would duplicate and undermine the Praxen converter.

## 22. Amendment A-005 — Deterministic release-orchestration hardening

### 22.1 Problem and scope

The post-T16R2 operational attempt stopped before provider resolution because
its worker improvised a Windows PowerShell command containing an invalid
`foreach { ... } | ...` pipeline. A comprehensive predictive review then found
seven additional defects that would make a later T16 run fail or violate its
authority even after that syntax correction:

- current runner output and adapter version acceptance disagree;
- Praxen model output can carry identifying absolute workspace paths;
- the required two-target wrapper cannot report an operationally eligible
  success;
- the builder writes outside T16's owned artifact prefix;
- the builder derives run start from matrix observation rather than token
  creation;
- collector and builder use different data-directory environment variables;
- release promotion writes the current manifest before the complete bundle.

A-005 fixes these deterministic release-control seams without weakening
requirements, relaxing privacy/trust/timing gates, or authorizing an
operational rerun. Installed upstream producers, Praxen's converter/renderer,
and historical evidence remain unchanged.

### 22.2 Checked-in pre-token boundary

Add one repository-owned Windows PowerShell 5.1-compatible pre-token launcher
under `scripts/`. It is an operator-side fixed script, not a collector or
`operations/` command surface.

The launcher:

1. exposes `-PlanOnly` and fixture modes that invoke no provider;
2. resolves only `claude`, `codex`, and `pi` through `Get-Command` from the
   canonical project directory;
3. rejects aliases, functions, unresolved shims, unsupported command types,
   missing paths, duplicate ambiguous resolutions, and paths outside the
   resolved command record;
4. uses fixed provider-specific argument lists and PowerShell hosting;
5. closes redirected stdin immediately, bounds time and stream length, scans
   output privately, and retains only exit/length/timeout/auth/marker facts;
6. rejects a leading BOM, normalizes only `CRLF`/`CR` to `LF`, trims only
   outer ASCII `SP`/`HT`/`LF`, and performs case-sensitive exact marker
   equality;
7. records the canonical child directory and
   `SANCUSSIGHT_RUNTIME_TARGET_ID` without retaining output bodies.

No T16 worker may synthesize a replacement resolution/canary wrapper. A
PowerShell parse sweep and fake provider shims must prove quoting, `.exe` and
`.ps1` hosting, stdin closure, timeout, output bounds, auth detection, exact
marker behavior, and zero provider invocation in plan-only tests.

The existing `operations/preflight.ps1` remains explicitly manifest-only. A
separate checked-in local-readiness check validates required files, Worker
Remits, collector store selection, fixed Pipelock/RAMPART/AIMap entrypoints,
runtime ports, and other non-secret prerequisites without launching providers.

### 22.3 Immutable release descriptor

Token creation writes one BOM-free immutable run descriptor inside the new
run root before producer capture:

```json
{
  "schemaVersion": 1,
  "releaseRunId": "bounded token",
  "startedAt": "ISO-8601 UTC",
  "runtimeTargetId": "sancussight-local-runtimes",
  "purpose": "a002-t16"
}
```

The descriptor is the only release-start and runtime-target authority consumed
by the failure matrix, runtime processes, Praxen wrapper, collector selection,
builder, and UI acceptance. Matrix `observedAt`, filesystem timestamps, and
import times cannot replace it. Each fresh OTLP bridge and Pi extension
process must expose a startup identity matching the descriptor before its
records can qualify.

### 22.4 Praxen operational compatibility and privacy

The current `t16r2-v1` runner binding becomes an explicitly supported adapter
version. Historical `t16r-v1` remains readable and test-covered; current-run
qualification still requires exact run, target, remit, timestamp, hash,
version, and canonical-sibling binding.

The real fake-producer runner output must be fed into `PraxenAdapter` in an
integration regression so runner and adapter tests cannot remain independently
green while disagreeing.

The skeleton's `workspace` value becomes a runner-owned sanitized target role,
not a model-authored absolute path. The model may receive an absolute path as
read authority, but the final draft and converter output must contain only the
sanitized role. Before canonical copy or operational projection, the runner
rejects identifying Windows, POSIX, and home-directory path values without
repairing them.

### 22.5 Two-target operational wrapper

Extend the existing two-target wrapper with an explicit mode:

- `remediation` remains the default and never becomes release-eligible;
- `operational` requires the immutable run descriptor and explicit
  operator-authorized invocation;
- only two passed target results with matching run/profile/target/remit facts
  produce `state: passed` and `releaseEligible: true`;
- partial, failed, blocked, or exception results remain
  `releaseEligible: false`, require operator action, pause remaining release
  stages, and never invoke bundle promotion.

The wrapper does not promote a release itself. Its operational result is a
required builder input. End-to-end fixtures cover runner -> adapter -> target
selection -> wrapper -> builder refusal/pass behavior.

### 22.6 Deterministic builder ownership and promotion

The release builder:

- reads `startedAt` and `runtimeTargetId` from the immutable run descriptor;
- uses `SANCUSSIGHT_DATA_DIR` as the canonical collector directory variable;
- accepts the legacy `SANCUSSIGHT_COLLECTOR_DATA_DIR` only when the canonical
  variable is absent, and rejects conflicting simultaneous values;
- writes T16 bundles only under the approved `a002-t16-*` prefix;
- requires a passing, release-eligible two-target operational wrapper result;
- creates and validates all bundle files in a fresh same-parent temporary
  directory;
- atomically moves the complete bundle into its final path;
- writes a temporary current-release manifest and atomically replaces
  `current-release.json` only after the final bundle exists and passes an
  independent readback/privacy check;
- removes or quarantines only its own temporary paths on failure and leaves the
  historical current release untouched.

Injected failures before bundle completion, during final bundle move, and
before manifest replacement must prove no partial promotion.

### 22.7 Remaining producer and UI readiness

Pipelock must resolve and launch Claude through the same fixed bounded
provider-transport contract or a fixture-proven equivalent; direct unresolved
`& claude` invocation is unsupported for T16.

Each operational runtime process is fresh for the new descriptor. Startup
checks reject inherited wrong-run or wrong-target identity.

Add a repository-owned T16 desktop/mobile acceptance harness or exact fixed
invocation contract that defines server/collector startup, isolated data
roots, ports, complete and degraded release fixtures, capture paths, console
and network checks, keyboard/reduced-motion/overflow checks, and teardown. It
must not improvise current-release state near the 30-minute boundary.

### 22.8 Verification strategy

Required pre-operational verification:

- Windows PowerShell 5.1 parse sweep for all checked-in release scripts;
- fake-shim pre-token launcher tests covering resolution, quoting, environment,
  marker normalization, timeout, closed stdin, auth detection, bounded streams,
  and no retained bodies;
- local-readiness positive and missing-prerequisite fixtures;
- real fake-producer runner -> production adapter integration;
- identifying Windows/POSIX workspace-path rejection before canonical output;
- remediation versus operational two-target wrapper fixtures;
- immutable descriptor start/target mismatch, pre-run, and exact-deadline tests;
- collector-directory default, alias, and conflict tests;
- builder destination ownership and atomic write-failure tests;
- fixed Pipelock launch and fresh runtime startup-identity fixtures;
- deterministic desktop/mobile complete/degraded UI acceptance setup;
- existing collector, core, build, audit, operations, governance, RAMPART,
  Praxen boundary, 15/15 matrix, privacy, partial-builder refusal, and
  `git diff --check` checks.

No provider, release token/run, current-release mutation, or release Playwright
acceptance occurs in the remediation implementation task.

### 22.9 Migration, rollback, and technical decisions

Use expand-contract:

1. add the immutable descriptor, fixed pre-token/local-readiness scripts,
   adapter support, operational wrapper mode, and atomic builder path beside
   historical behavior;
2. migrate T16 handoffs and fixed producer/UI entrypoints to the new controls;
3. retain historical read compatibility while rejecting the old controls for
   a newly authorized T16 run.

Rollback restores the last approved implementation but cannot reuse prior
authorization, promote historical evidence, or write a passing release.

#### TD-013 — Executable controls replace handoff-only orchestration

- **Decision:** Every consequential T16 pre-token, run-identity, producer
  launch, bundle, and UI acceptance boundary is a checked-in fixed script or
  tested module; workers do not synthesize executable wrappers from prose.
- **Why:** Repeated ad hoc launch and marker corrections consumed one-shot
  authorizations without testing application behavior.
- **Trade-off:** The repository owns additional fixture-tested operator-side
  scripts, but removes repeated agent judgment and transport drift.

#### TD-014 — One immutable run descriptor

- **Decision:** Token creation establishes the sole start time and runtime
  target consumed by every later stage.
- **Why:** Matrix observation is later than run start, and process-captured
  environment can silently drift.
- **Trade-off:** Every stage must accept and validate one shared descriptor.

#### TD-015 — Bundle first, manifest last

- **Decision:** A complete validated bundle is atomically installed before the
  current-release manifest is atomically replaced.
- **Why:** A current manifest must never point at an incomplete release bundle.
- **Trade-off:** Builder implementation and failure-injection coverage become
  more involved, but release state becomes recoverable and auditable.
