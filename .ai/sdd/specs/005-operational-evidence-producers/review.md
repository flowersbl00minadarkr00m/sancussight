# Review: Operational Evidence Producers

> Status: Complete  
> Date: 2026-07-18  
> Verdict: Approved; qualifying release run passed

## Summary

Spec 005 delivers five independently operated, read-only operational evidence categories and provider-truthful telemetry for Codex CLI, Claude Code, and Pi. Release run `spec005-t10-20260718b` bound fresh manifest-referenced evidence from all five categories, passed all 15 mandatory failure/recovery cases, produced a privacy-safe bundle, and evaluated `ready: true` with no blockers or untested boundaries at `2026-07-18T14:39:01.908Z`.

Both review axes pass. The Spec axis covers every approved requirement and task. The Standards axis passes after correcting one review finding so the release UI, runtime labels, and gate all resolve only the evidence IDs referenced by the manifest. The immutable run remains the release proof; the live UI correctly reports expiry after the five-minute window and requires a new run before making a new current-readiness claim.

## Requirement coverage

| Requirements | Result | Evidence |
|---|---|---|
| FR-001, FR-005, FR-006, FR-016 | Pass | Manifest-bound qualification, exact evidence IDs, versions, targets, run/config identities, observed times, verification, five current categories, and Codex/Claude/Pi freshness produced a conjunctive passing gate. |
| FR-002 | Pass | Real Codex CLI `0.144.3`, Claude Code `2.1.214`, and Pi `0.80.10` events retained provider and transport truth with metadata-only capture. |
| FR-003 | Pass | Praxen `1.1.0` schema 2.0 evidence bound SancusSight and `sdd-exec` to their separately approved Worker Remit hashes. |
| FR-004 | Pass | Pipelock `3.1.0` recorded a real allow and controlled block in the approved Claude/FindMnemo path; packet hash, chain, and pinned signer verified independently. |
| FR-007 | Pass | All 15 stopped, disabled, malformed, privacy, inaccessible, incompatible, signature, execution, scope, restart, replay, rotation, upgrade, isolation, retention, and recovery cases passed. |
| FR-008 | Pass | Fixed user-scoped operator scripts manage producers outside SancusSight; no collector route launches, scans, proxies, or mutates them. |
| FR-009, FR-011 | Pass | Source-side allowlists and sanitizers excluded raw conversations, tool content, payloads, secrets, private keys, and unrestricted paths; the release bundle passed its precise privacy scan. |
| FR-010 | Pass | The UI showed `Ready for release` only during the complete window, then degraded to `Release evidence expired` with exact blockers without changing stored evidence. |
| FR-012 | Pass | Run IDs, fixed scripts, release manifest generation, failure matrix, restart checks, and fresh recovery make revalidation repeatable without reusing old success. |
| FR-013 | Pass | RAMPART `0.1.0` ran the approved real Pi no-tools workflow and produced a sanitized safe result with zero unsafe, undetermined, or error outcomes. |
| FR-014 | Pass | Pinned AIMap commit `65c820cbdad3da449f49aedb70055ca5ed4fa0ce` completed only the authorized fingerprint scan of operator-owned loopback Ollama. |
| FR-015 | Pass | Versioned RAMPART and AIMap contracts reject raw, incompatible, incomplete, expired, failed, or out-of-scope artifacts wholly and independently. |
| NFR-001 through NFR-005 | Pass | Least authority, metadata minimization, independent failure/recovery, audit lineage, pinned compatibility, visible mismatch, restart durability, and hosted/manual degradation were verified. |

## Task and design coverage

| Area | Result | Evidence |
|---|---|---|
| T1-T5 | Pass | Qualification domain, five adapters/contracts, release gate, expiry, API/client transport, and truthful responsive UI are implemented and tested. |
| T6-T6A | Pass | Fixed lifecycle harness, OTLP bridge, Pi extension, incremental telemetry adapter, privacy rejection, and three-runtime gate are implemented without a generic command surface. |
| T7-T9 | Pass | Real runtime/Praxen, Pipelock, RAMPART, and AIMap exercises use approved targets, remits, workflow, and exact authorization. |
| T10 | Pass | Same-window refresh, 15-case failure matrix, sanitized release bundle, browser verification, Standards review, and Spec review are complete. |
| TD-001 through TD-008 | Pass | User-scoped producers, operator-side execution, sanitized projection contracts, manifest binding, expiring conjunctive readiness, point-in-time test semantics, provider-neutral telemetry, and operator-side Pi boundaries match the approved design. |

## Spec axis

**Result: Pass.** All Must Have and Should Have requirements are implemented. The evidence bundle traces every readiness claim to source, contract/parser, real target, release run, verification state, and observed time. Source failures remain isolated, prior evidence is retained, and recovery requires fresh valid evidence. Hosted/manual imports remain historical rather than operational.

## Standards axis

**Result: Pass.** Producer authority remains outside the product. Inputs, attributes, actions, paths, targets, and exports are fixed or allowlisted; raw content and secret-bearing fields fail closed. Incremental checkpoints do not advance over rejected records, replacement detection is hash-based, and deterministic IDs make replay idempotent.

The review removed a provenance inconsistency rather than adding another decision surface: `releaseEvidenceRecords` is now the single resolver used by both gate calculation and presentation. This prevents unrelated newer ledger evidence from supplying source cards or runtime labels. The remaining scripts and artifacts correspond directly to approved producer lifecycle, failure exercise, bundle construction, or verification needs.

## Verification

| Check | Result |
|---|---|
| `npm run verify:t10-matrix` | Pass; 15 passed, 0 failed. |
| `npm run test:collector` | Pass; 63 passed, 0 failed after the review fix. |
| `npm run verify:core` | Pass. |
| `npm run build` | Pass; collector TypeScript, browser TypeScript, and Vite production build. |
| `npm audit` | Pass; 0 vulnerabilities. |
| Operational scripts | Pass; lifecycle, operations, and RAMPART exporter checks. |
| Release bundle | Pass; five categories, three runtimes, all failures passed, no blockers, no untested boundaries. |
| Privacy scan | Pass; no prohibited content keys, credentials/private keys, raw payload fields, or identifying absolute user paths. |
| Playwright | Pass; desktop/mobile passed and expired states, console/network, keyboard, reduced motion, and overflow. |

## Findings

No blocking, high, medium, or low finding remains. The manifest-reference presentation finding was fixed and regression-tested before approval.

## Evidence

- Release bundle: `artifacts/qa/spec005/t10-release-spec005-t10-20260718b/`
- Failure matrix: `%LOCALAPPDATA%/SancusSight/operations/runs/spec005-t10-20260718b/failure-matrix.json`
- Desktop screenshot: `output/playwright/spec005-t10-desktop.png`
- Mobile/expired screenshot: `output/playwright/spec005-t10-mobile.png`

## Verdict

**Approved.** Spec 005 implementation and review are complete, and release run `spec005-t10-20260718b` is a qualifying five-category, three-runtime, failure/recovery proof. Any later current-readiness claim must be backed by a newly fresh manifest; the elapsed live window is correctly expired.

## Fresh revalidation addendum — 2026-07-18 run `spec005-t10-20260718c`

This addendum preserves the historical approval above and records a new bounded QA window rather than relabeling it. The Spec axis remains implemented, but the current release claim is blocked: Praxen (17 records), RAMPART/Pi (one safe result), AIMap (one authorized fingerprint), Codex telemetry, Pi telemetry, and all 15 failure/recovery cases refreshed successfully; Claude Code returned exit code 1 with an `is_error` result before producing a runtime envelope, and the controlled Pipelock workflow produced no allow/block pair. The bundle builder refused to create a release bundle because the required Claude runtime and fresh verified Pipelock evidence were absent.

The Standards axis remains pass for this window: collector tests 69/69, core verification, build, full `npm audit` (0 vulnerabilities), operations verification, and RAMPART sanitizer checks passed. Privacy projections remained metadata-only, and no new producer authority or UI execution surface was introduced. Current verdict: **Not ready for release** until a fresh Claude Code telemetry event and a fresh verified Pipelock allow/block chain are captured in the same run window.

## Qualifying fresh revalidation addendum — 2026-07-18/19 run `spec005-t10-20260718e`

This addendum preserves the historical review and records the fresh run after Claude access was restored. The same approved producer targets and workflow were rerun: Praxen regenerated both approved targets; Pipelock produced and independently verified three allows plus one controlled block; RAMPART produced one safe result with zero unsafe, undetermined, or error outcomes; AIMap completed only the authorized loopback fingerprint; and Codex CLI, Claude Code, and Pi supplied fresh provider-truthful metadata-only telemetry. The explicit Claude OTLP settings disabled prompt, assistant-response, tool-detail, tool-content, raw-body, trace, and metric capture.

The Spec axis passes against every approved requirement and T10 task. `npm run verify:t10-matrix` passed 15/15, and the release bundler produced `artifacts/qa/spec005/t10-release-spec005-t10-20260718e/` with a structurally valid `status: passed` manifest, `ready: true`, all five categories, all three runtimes, all failure rows passed, and zero blockers. The bundle privacy scan found no prohibited JSON keys or identifying absolute paths. No requirements, design, or authority boundaries changed.

The Standards axis remains pass. Fresh collector tests (69/69), core verification, build, dependency audit (0 vulnerabilities), operations checks, and RAMPART sanitizer checks passed. Playwright at 1440x1000 and 390x844 observed the point-in-time expired state after the window elapsed, loopback-only `200` API traffic, zero console errors/warnings, visible keyboard focus, no horizontal overflow, and the mobile Evidence Sources contract arrow collapsing and expanding the details. The expiry is truthful degradation of a passed point-in-time manifest, not a failed revalidation.

**Verdict:** Approved qualifying run `spec005-t10-20260718e`; the stored release bundle is the auditable proof. The live UI is intentionally `Release evidence expired` after five minutes, so the product must not be described as perpetually release-ready without a new qualifying window.

## Bounded revalidation addendum — 2026-07-20 run `spec005-t10-20260720143255`

The Spec axis remains implemented and unchanged. This bounded attempt refreshed RAMPART/Pi, exact-scope AIMap, Pipelock, Codex/Claude/Pi metadata-only telemetry, and all 15 source-isolated failure/recovery cases. Both approved Praxen executions timed out before canonical schema-2 findings files were available; incomplete drafts were excluded and no historical evidence was reused. The release bundler failed closed with `Required release evidence is missing`, so no new bundle or readiness claim was created. `.status` remains `review:done` and the product remains **Not ready for release**.

The Standards axis remains pass for the observed implementation: collector 71/71, core, build, audit (0 vulnerabilities), governance, operations, RAMPART sanitizer, privacy, and Playwright desktop/mobile checks all passed. The browser showed truthful blocked state, loopback-only responses, zero console errors/warnings, visible focus, no overflow, zero reduced-motion animations, and the mobile Evidence Sources contract arrow. No code, requirements, design, or authority boundary changed during this revalidation.

**Verdict:** Historical qualifying bundles remain valid point-in-time evidence only. The current revalidation is non-qualifying; exact blockers are the missing run-scoped SancusSight and `sdd-exec` Praxen canonical reports.

## Claude-deferred partial revalidation addendum - 2026-07-20 run `spec005-t10-20260720221208`

The operator explicitly chose to defer Claude Code to a future release for this attempt. That choice does not amend the approved Spec: Claude runtime telemetry remains required by FR-002 and FR-016, and the approved Claude-backed Pipelock workflow remains required by FR-004. The run is therefore intentionally non-qualifying.

The Spec axis behaved correctly. Fresh canonical Praxen reports covered both approved targets, RAMPART/Pi passed safely, exact-scope AIMap completed, Codex and Pi produced metadata-only telemetry, and all 15 failure/recovery cases passed. Claude Code reached its external session limit and emitted only startup/connection plus `api_error` observations; Pipelock produced no packet. The release builder failed closed at required-source selection, no sanitized bundle was created, and no stale timestamp or historical evidence was relabeled. The five-minute same-window boundary also elapsed before completion.

The Standards axis remains pass for the implementation: collector tests passed 71/71, core verification, production build, dependency audit (0 vulnerabilities), operations, governance, and RAMPART sanitizer checks passed. Desktop/mobile Playwright checks observed zero console errors/warnings, loopback-only successful API traffic, visible keyboard focus, reduced-motion with zero running animations, and no horizontal overflow. No new product authority, generic command surface, raw content capture, or maintainer decision surface was introduced.

**Verdict:** `.status` remains `review:done`, but the current product state is **Not ready for release**. Exact blockers for a new qualifying release are a successful fresh Claude Code telemetry session and a fresh independently verified Pipelock allow/block packet, together with all other required evidence inside one new five-minute window.

## Amendment A-001 review addendum - 2026-07-21 run `spec005-a001-20260721071846`

This addendum reviews the explicitly approved progress/orchestration amendment without relabeling any historical release evidence. The Spec axis passes for FR-017, FR-018, and NFR-006: `release-progress-v1` is bounded and versioned, the fixed writer is user-scoped and allowlisted, the collector endpoint is read-only, stale/malformed/wrong-run snapshots fail closed, and the UI distinguishes determinate counts, indeterminate status, source freshness, and the 30-minute orchestration deadline. The existing five-minute per-source/runtime freshness rule remains unchanged.

The Standards axis passes. Progress is advisory metadata only and never enters normalized evidence or release bundles. No upstream command, scan, proxy, policy mutation, raw prompt/response/reasoning, tool payload, credential, private key, raw scan payload, unrestricted path, or file content is accepted. The UI adds no execution control. The only extra maintainer burden is the fixed heartbeat contract and its documented allowlists, directly required by the approved amendment.

Fresh verification recorded 78/78 collector tests, core verification, production build, operations safety verification, progress writer smoke/privacy checks, desktop/mobile Playwright status checks, zero console errors/warnings, loopback-only requests, visible keyboard focus, reduced-motion with zero running animations, and no horizontal overflow. The exact evidence is `artifacts/qa/spec005/a001-progress-orchestration-20260721071846.md`.

**Verdict:** T11 and T12 pass their amended requirements and standards review. Spec 005 remains **Not ready for release** until a new qualifying five-category, three-runtime, 15-case release window produces a fresh sanitized bundle; progress status does not change that gate.

## R2 comprehensive reset — 2026-07-23 predictive T16 review

> Trigger: the operator explicitly requested another application review after
> the post-T16R2 pre-token wrapper failure. This is a comprehensive reset
> because the request covers likely failures across the remaining T16 release
> pipeline, not only a prior finding.
>
> Status: partial review while `.status` is `implementation:in-progress`
>
> Verdict: **Needs fixes. Do not authorize another operational T16/A-002 run
> yet.**

### Summary

The immediate `Get-Command` failure is confirmed: Windows PowerShell 5.1 does
not allow a pipeline directly after a `foreach` statement. Assigning the loop
output to a collection and piping that collection parses correctly. The
larger standards defect is that the critical pre-token boundary exists only as
handoff prose and was improvised in the worker instead of being a checked-in,
fixture-tested script.

The specialist review and source reconciliation found seven additional
confirmed release blockers. Existing focused tests remain green because they
do not connect the real runner output to the production adapter or exercise an
operationally eligible wrapper/builder path.

### Spec axis findings

#### SS-RP-001 — Critical — runner/adapter version mismatch

- Runner: `scripts/run-spec005-praxen-behavior-verifier.ps1` emits
  `runnerVersion = t16r2-v1`.
- Adapter: `collector/adapters/praxen.ts` accepts only `t16r-v1`.
- Test gap: `collector/__tests__/operational-adapters.test.ts` constructs the
  old value.
- Impact: a fresh T16R2 operational projection will be rejected by the
  production adapter despite focused runner and adapter tests passing.
- Required correction: support the approved current runner version while
  preserving explicitly tested historical compatibility, and feed real
  fake-producer runner output through `PraxenAdapter`.

#### SS-RP-002 — High — Praxen workspace privacy drift

- The skeleton requires a `workspace` field, while the model prompt exposes
  absolute workspace and Worker Remit paths.
- The runner does not reject identifying path values before converter
  promotion; the bundle privacy scan rejects them later.
- The latest real run produced an identifying absolute path in the generated
  staging draft and required cleanup.
- Required correction: make the authored workspace value a runner-owned
  sanitized target role and reject identifying paths before canonical or
  operational promotion. Add Windows and POSIX path regressions.

#### SS-RP-003 — High — two-target wrapper cannot express operational success

- `scripts/run-spec005-t16-remediation.ps1` writes
  `releaseEligible = false` even after both targets pass and labels itself
  remediation-only.
- Task T16 nevertheless requires this wrapper for operational Praxen evidence.
- Required correction: add an explicit operator-authorized operational mode.
  Only a two-target pass may set `releaseEligible = true`; partial and
  exception results remain ineligible and never promote by themselves.

#### SS-RP-005 — High — release bundle violates T16 ownership

- The builder writes `artifacts/qa/spec005/t10-release-*`.
- Task T16 permits the worker to write only `artifacts/qa/spec005/a002-t16-*`.
- Required correction: use a validated T16-owned destination and update the
  task ownership contract before dispatch.

#### SS-RP-006 — High — release start drifts from the approved token boundary

- The builder uses `failure-matrix.json.observedAt` as `manifest.startedAt`.
- A-002 requires the immutable release-run start established at token
  creation. The latest real run showed about 48 seconds of drift.
- Required correction: create one immutable run descriptor at token creation
  and require matrix, producers, gate, builder, and UI evidence to bind to its
  exact start and runtime target.

### Standards axis findings

#### SS-RP-004 — High — ephemeral untested pre-token launcher

- The failed wrapper was assembled in the worker and is absent from the
  repository.
- Checked-in PowerShell scripts all pass a Windows PowerShell 5.1 parse sweep;
  therefore current static checks cannot prevent this failure.
- Required correction: check in one fixed PowerShell 5.1 pre-token launcher
  with plan-only mode, fake-shim tests, strict command-type/path resolution,
  bounded streams/timeouts, immediate stdin closure, marker normalization,
  environment reporting, and no retained provider bodies.

#### SS-RP-007 — Medium — collector data-directory variable mismatch

- Collector documentation and startup use `SANCUSSIGHT_DATA_DIR`.
- The release builder reads `SANCUSSIGHT_COLLECTOR_DATA_DIR`.
- Required correction: use `SANCUSSIGHT_DATA_DIR` as canonical; retain a tested
  compatibility alias only if both values are equal.

#### SS-RP-008 — High — release promotion is not atomic

- The builder writes `current-release.json` before writing the bundle files.
- A later filesystem failure can expose a promoted manifest with an incomplete
  bundle.
- Required correction: write and validate a temporary bundle, atomically move
  it into place, then atomically replace `current-release.json` last. Injected
  write failure must leave the historical release untouched.

### Additional high-confidence risks

| ID | Risk | Required disposition |
|---|---|---|
| SS-RR-001 | Pipelock launches unresolved `claude` through different transport than the corrected canary boundary. | Reuse a fixed resolved-path, bounded launch seam or prove equivalent semantics with fixtures. |
| SS-RR-002 | OTLP and Pi capture run/target identity at process/extension startup; reused processes can emit wrong-run evidence. | Require fresh processes and startup identity assertions bound to the immutable run descriptor. |
| SS-RR-003 | `operations/preflight.ps1` validates inventory declarations only, not actual local release prerequisites. | Preserve the manifest-only preflight claim and add a separate checked-in local readiness check for files, remits, stores, fixed producer entrypoints, and loopback prerequisites. |
| SS-RR-004 | T16 Playwright acceptance has no checked-in command or deterministic fixture/startup contract. | Add a fixed T16 desktop/mobile acceptance harness or an exact repository-owned invocation contract before release dispatch. |

### Fresh verification

| Check | Result | Interpretation |
|---|---|---|
| Windows PowerShell parser: bad `foreach { } |` form | One `EmptyPipeElement` | Reproduces the immediate wrapper defect without invoking providers. |
| Windows PowerShell parser: assign loop output, then pipe | Zero parse errors | Confirms the bounded syntax correction. |
| Checked-in `scripts/**/*.ps1` and `operations/**/*.ps1` parse sweep | Exit 0 | The failed code was ephemeral and outside existing checks. |
| `node --test collector/__tests__/operational-adapters.test.ts` | Exit 0; 6/6 | False-green for SS-RP-001 because the fixture still uses `t16r-v1`. |
| `scripts/test-spec005-praxen-boundary.ps1` | Exit 0 | Runner boundary is green in isolation but is not integrated with the adapter or an operationally eligible wrapper. |

### Review safety statement

The requested specialist operated read-only. No files were changed by the
specialist and no provider, canary, release token/run, matrix, producer,
bundle, current-release mutation, or Playwright action occurred.

### R2 verdict

**Needs fixes.** T16 remains incomplete and **Not ready for release**. The
authority plane must reopen at design before implementation because the
corrections change owned surfaces and the runner/adapter/wrapper/builder
integration contract.

## R3 bounded follow-up — T16R3

### Review scope

- **Pass:** R3 findings follow-up
- **Prior findings:** SS-RP-004 and SS-RR-003
- **Implementation:** Task T16R3 seven owned surfaces
- **Reset trigger:** none; this pass is limited to the approved fixes and
  regressions caused by those fixes
- **Gate:** `implementation:in-progress`; this review approves T16R3 only and
  does not set the feature to `review:done`

### Spec axis

| Contract | Result | Evidence |
|---|---|---|
| A-005 Section 22.2 / TD-013 | Pass | Checked-in PowerShell 5.1 launcher, fixed vectors, plan-only and fake-shim modes, closed stdin, bounded private streams, strict auth/BOM/marker behavior, and sanitized facts. |
| Task T16R3 | Pass after correction | Orchestrator reproduced an omitted-`ProjectRoot` production failure that fixtures had missed. Both entrypoints now derive the root from `PSCommandPath` after binding and have non-project-cwd regressions. |
| SS-RP-004 | Resolved | The pre-token launcher is repository-owned and regression-tested; workers no longer synthesize the executable wrapper from prose. |
| SS-RR-003 | Resolved for approved scope | A separate read-only local-readiness inspector validates fixed files, inventory, remits, collector-root selection, loopback configuration, and expected port state without invoking providers. |
| Planned / As Built | Pass after correction | Worker corrected the inaccurate “native direct launch” wording; Claude/Codex are PowerShell-hosted with `-Command` and Pi with `-File`. |

### Standards axis

- **Pass — privacy and least authority:** tests use generated fake providers;
  output bodies do not cross the launcher boundary; readiness performs no
  provider connection, authentication, installation, start, stop, or release
  mutation.
- **Pass — coherence:** one launcher owns provider transport and one inspector
  owns non-provider readiness. No second generic process API or collector
  command surface was introduced.
- **Pass — failure behavior:** missing/ambiguous/unsupported commands, nonzero
  exit, timeout, overflow, invalid UTF-8, BOM, auth text, and marker drift fail
  before token creation.
- **Pass — regression quality:** the production-default root seam is now
  exercised from a non-project working directory rather than only through
  fixture calls that supply `-ProjectRoot`.

### Review finding disposition

#### SS-R3-001 — High — default entrypoint failed before plan generation

- **Observed:** Fresh Orchestrator command
  `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File
  scripts/invoke-spec005-t16-pretoken.ps1 -PlanOnly` initially failed because
  `$PSScriptRoot` was empty during Windows PowerShell 5.1 parameter-default
  binding.
- **Cause:** Both focused suites supplied `-ProjectRoot`, hiding the
  production-default path.
- **Disposition:** Resolved in the same bounded worker. Root derivation moved
  after parameter binding and both entrypoints gained omitted-root,
  non-project-cwd regressions.
- **Regression evidence:** Both focused suites exit `0`; a fresh Claude-only
  plan from the temporary directory reports `willInvoke: false` and canonical
  child root `C:\Users\henry\sancussight`.

### Fresh verification

| Command | Exit | Result |
|---|---:|---|
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-pretoken.ps1` | 0 | Omitted-root/non-project-cwd, fake-provider, privacy, timeout, bounds, marker, resolution, vector, stdin, and parse cases passed. |
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-local-readiness.ps1` | 0 | Omitted-root/non-project-cwd, entrypoint, inventory, remit, collector-root, ports, negative readiness, and no-provider cases passed. |
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-pretoken.ps1 -ParseOnly` | 0 | Windows PowerShell 5.1 parse sweep passed 25 files with zero errors. |
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1` | 0 | Existing operational allowlist, inventory, and process-safety checks passed. |
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/invoke-spec005-t16-pretoken.ps1 -PlanOnly` | 1 expected | Root derivation succeeded; the approved ambiguity guard blocked two distinct Codex executables before provider invocation. |
| `git diff --check` | 0 | No whitespace errors; unrelated baseline line-ending warnings only. |

### Operational follow-up

The host currently exposes two distinct accepted Codex executable records.
The launcher correctly refuses to choose silently. This is a pre-token
environment blocker for a future T16 run, not a T16R3 implementation defect.
It must be resolved or explicitly re-specified before spending another
one-shot release authorization.

### R3 verdict

**Approved for Task T16R3.** No unresolved Spec or Standards finding blocks
task completion. The feature remains `implementation:in-progress`; T16R4 is
separately held by its independent challenge, and T16/A-002 remains
unauthorized.

## R4 bounded follow-up — T16R4

### Review scope

- **Pass:** R4 findings follow-up
- **Prior findings:** SS-RP-006 and SS-RR-002
- **Implementation:** Corrected Task T16R4 owned surfaces
- **Reset trigger:** none; limited to the approved immutable descriptor,
  matrix, OTLP, and Pi corrections and their regressions
- **Gate:** `implementation:in-progress`; this approves T16R4 only

### Spec axis

| Contract | Result | Evidence |
|---|---|---|
| A-005 Section 22.3 / TD-014 | Pass | A strict five-field descriptor at the canonical run-root path owns run ID, canonical UTC start, runtime target, purpose, and schema version. |
| Corrected Task T16R4 | Pass | Creator/parser, isolated matrix, OTLP startup, and Pi registration/emission are descriptor-bound; T16R5-T16R7 surfaces remain outside this task. |
| SS-RP-006 | Resolved for approved scope | Matrix output preserves descriptor `startedAt` and `runtimeTargetId`; observation, import, filesystem, and conflicting environment values cannot replace descriptor authority. |
| SS-RR-002 | Resolved for approved scope | OTLP validates/exposes identity before listen; Pi does so before registration. Both refuse rewrite or process rebind. |
| Planned / As Built | Pass | The execution record accurately documents the bounded local-file-I/O trade-off and deferred consumers. |

### Standards axis

- **Pass — fail closed:** strict key, type, canonical-time, target, purpose,
  BOM, path, environment-conflict, rewrite, and rebind checks reject before
  qualifying output.
- **Pass — least authority/privacy:** labelled temporary roots and fake
  Pi/loopback seams were used; no provider, token, operational run, release
  mutation, or Playwright activity occurred.
- **Pass — coherence:** one shared parser/binder owns validation for the
  matrix and both startup consumers.
- **Pass — create once:** the creator validates before an exclusive
  `FileMode.CreateNew` write and refuses an existing destination unchanged.
- **Pass — regressions:** boundary timing, legacy, filesystem-time,
  conflicting environment, malformed, rewrite, and reused-process cases run.

### Fresh verification

| Command | Exit | Result |
|---|---:|---|
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-release-descriptor.ps1 -RunIsolatedMatrix` | 0 | Temporary matrix 15/15; creator/parser fixtures passed. |
| `node --test collector/__tests__/release-run-descriptor.test.ts` | 0 | 7/7 passed. |
| `node --test collector/__tests__/runtime-telemetry-producers.test.ts` | 0 | 7/7 passed. |
| `node --test collector/__tests__/release-gate.test.ts` | 0 | 16/16 passed. |
| `npm run test:collector` | 0 | 92/92 passed. |
| `npm run verify:core` | 0 | Core assertions passed. |
| `npm run build` | 0 | TypeScript and Vite build passed. |
| `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1` | 0 | Operational checks passed. |
| `git diff --check` | 0 | No whitespace errors; baseline line-ending warnings only. |

### R4 verdict

**Approved for Task T16R4.** No unresolved Spec or Standards finding blocks
task completion. The feature remains `implementation:in-progress`; T16R5 is
the dependency-critical frontier and requires a fresh visible independent
high-tier challenge before dispatch. T16/A-002 remains unauthorized.
