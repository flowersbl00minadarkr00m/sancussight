# Spec 005 T16/A-002 Release Retry Handoff — 2026-07-23

## Authority and authorization

- Feature: `005-operational-evidence-producers`
- Gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` (`implementation:in-progress`)
- Approved task: `tasks.md`, Task T16
- Prerequisites: T15 complete; T16R complete, including the corrective output-contract remediation reconciled on 2026-07-23
- Tracking owner: `orchestrator`
- Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`
- Operator authorization: the user explicitly replied `approved` on 2026-07-23 after T16R remediation and its fresh verification. This authorizes one new T16/A-002 operational release attempt.
- No HTML is required.

This handoff authorizes one fresh run token only. It does not authorize historical evidence reuse, relabeling, provider-auth bypass, exception promotion, or treating a partial/failed run as release-ready.

## Independent retry challenge reconciliation

- Fresh visible read-only challenge: `019f8de3-b21c-7d93-a2b8-8e1d53faff77`
- Stable event: `spec005-t16-a002-retry-challenge-20260723-terra-high-02`
- Verdict: `AFFIRM`, reconciled by the orchestrator on 2026-07-23.
- Scope: implementation-readiness for exactly one newly authorized A-002 attempt; not a task-completion or release-readiness verdict.
- Finding: the corrected byte-zero runner, current T16R boundary, new-top-level worker contract, shared runtime-target preflight, and fail-closed release controls are within approved T16/A-003 authority; no requirements/design/task amendment is required.

## Current baseline

- Previous run `spec005-a002-t16-20260723064030` failed closed at Praxen staging validation because the Step 9.9 draft lacked the exact parser-grade header.
- T16R now requires the exact ASCII `# Praxen draft manifest` at byte 0 / first line and rejects BOM, whitespace, leading prose, and fenced headers before conversion.
- Fresh T16R prompt, boundary, adapter, collector, core, build, audit, operations, governance, RAMPART, and diff checks passed.
- `%LOCALAPPDATA%/SancusSight/operations/manifests/current-release.json` remains historical `spec005-t10-20260718e` until a complete new A-002 gate passes.

## Mandatory run controls

1. Run noninteractive preflight before creating the token.
2. Establish exactly one shared `SANCUSSIGHT_RUNTIME_TARGET_ID` for Codex CLI, Claude Code, and Pi before capture begins. The shared target must be used for newly produced evidence; captured evidence may never be relabeled.
3. Run bounded provider access canaries from `C:/Users/henry/sancussight`. Resolve `claude`, `codex`, and `pi` with PowerShell `Get-Command` in that directory and use the resolved `.Source`/`.Path` values, not inherited PATH shims. Invoke Claude and Codex through a noninteractive PowerShell host using the resolved path and `-Command` so Windows shell semantics are preserved: `<powershell.exe> -NoProfile -NonInteractive -Command "& '<resolved-claude>' --print --no-session-persistence --model haiku --effort low --tools '' --permission-mode plan --disable-slash-commands --output-format text 'Reply exactly CLAUDE_ACCESS_OK.'"`; `<powershell.exe> -NoProfile -NonInteractive -Command "& '<resolved-codex>' exec --ephemeral --sandbox read-only --skip-git-repo-check --color never 'Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools.'"`. Invoke Pi through the same host with `-File`: `<powershell.exe> -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi.ps1> --print --no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files --no-approve --thinking off "Respond with only the exact token PI_ACCESS_OK and nothing else"`. Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` for every canary and use the canonical child working directory. If using a child-process API, use `UseShellExecute=false`, redirect stdout/stderr, close redirected stdin immediately after process start, and enforce a bounded timeout; do not leave stdin open for Codex to read. Capture stdout and stderr privately; retain only exit code, bounded lengths, auth-prompt boolean, and exact-marker boolean. Normalize only transport line endings and outer whitespace before exact equality. Stop and return `blocked` on any launcher error, nonzero exit, missing or unexpected marker, or authentication/authorization prompt; do not submit credentials or use `--bare`/other auth bypasses. Punctuation, prose, fences, and alternate markers remain failures.
4. Use only this new run token and fresh producer outputs. Do not copy, timestamp-rewrite, combine, or promote prior evidence.
5. Use the corrected T16R Praxen runner for both approved targets. Haiku remains staging-only; pinned converter/renderer own official outputs; runner binding and adapter validation remain authoritative.
6. Fail closed on any missing, stale, wrong-run, wrong-target, wrong-remit, wrong-version, privacy, timing, trust, partial, exception, or incomplete `15/15` result. Do not retry within the run without a separately recorded operator direction.
7. Only after every producer, matrix, manifest, gate, privacy, and UI acceptance requirement passes may `current-release.json` and a passing bundle be written.

## Worker contract

- Execution mode: `orchestrated-worker`
- Session policy: `new-top-level-required`
- Model: `deep` / `gpt-5.6-sol` / `high`, retained by the reconciled T16 release-plan challenge
- Fresh visible worker required; no subagents, hidden workers, reused worker, or orchestrator implementation
- Owned surfaces:
  - new run-scoped data under `%LOCALAPPDATA%/SancusSight/operations/runs/<new-run-id>/`
  - new sanitized `artifacts/qa/spec005/a002-t16-*`
  - `%LOCALAPPDATA%/SancusSight/operations/manifests/current-release.json` only after a complete pass
  - bounded `output/playwright/spec005-a002-t16-*`
  - append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
  - append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- Read-only: implementation, collector, release gate/selection/builder, `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, and shared handoff authority.
- Return channel: source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`; execution records are the durable fallback.

## Required lifecycle

The worker must acknowledge before creating a token, then return `started`, `blocked`, `verification-failed`, or `ready-for-review` with stable event IDs and exact receipt evidence. The orchestrator alone reconciles T16 completion or release readiness.

## Required verification

- `operations/preflight.ps1 -DryRun`
- `npm run verify:t10-matrix` (`15/15`)
- fresh Codex CLI, Claude Code, and Pi metadata-only runtime capture with shared target
- both Praxen targets through the corrected T16R runner
- trusted Pipelock allow/block, RAMPART, and exact-scope AIMap evidence
- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- `npm audit --audit-level=high`
- `scripts/verify-operations.ps1`
- `scripts/verify-governance.ps1`
- `scripts/test-rampart-export.ps1`
- sanitized manifest/bundle and independent gate/privacy scan
- bounded desktop/mobile Playwright acceptance and privacy review
- `git diff --check`

If any required condition fails, retain the exact bounded blocker, do not write a passing bundle or current-release update, and stop for new operator direction.

## Attempt result — blocked before token creation

- Worker: `019f8de5-f6ec-70b1-b381-133e3ed78b2b`
- Stable event: `spec005-t16-a002-retry-blocked-pretoken-pi-canary-20260723-sol-high-03`
- Result: `blocked`; no release token or run directory was created.
- Preflight: PASS; Claude and Codex access canaries: PASS with exact markers and no auth prompts.
- Pi access canary: FAIL. Pi process exit was `0`, but the bounded wrapper did not observe the exact `PI_ACCESS_OK` marker and exited `2` with `PI_CANARY_UNEXPECTED_OUTPUT`.
- Consequence: the worker stopped before matrix, producer capture, Praxen, bundle, current-release, or Playwright stages. Current release remains historical `spec005-t10-20260718e`.
- Required next decision: a future attempt needs new operator direction and an explicitly reconciled Pi canary contract. No code patch, marker reinterpretation, retry, or auth bypass is authorized by this result.

## Fresh operator authorization after Pi remediation

- Authorization recorded at `2026-07-23T07:39:03-07:00` from the operator message `approve t16a 002` in the source thread.
- Scope: exactly one newly created T16/A-002 operational release token/run after the reconciled Pi access-canary remediation.
- This authorization does not complete T16, authorize an exception, permit reuse of the prior failed or pre-token-blocked attempts, or permit a second attempt after any new failure.
- The prior retry stopped before token creation because the Pi canary instruction produced punctuation-bearing output. The handoff was corrected to use `Respond with only the exact token PI_ACCESS_OK and nothing else`; a fresh transient canary then matched the exact token and `git diff --check` passed.
- A fresh independent read-only routing challenge remains required before dispatching the Sol High worker because the Pi control wording changed after the earlier retry challenge.
- Current release remains historical `spec005-t10-20260718e` until one complete fresh gate passes.

## Fresh independent retry challenge reconciliation

- Fresh visible read-only challenge: `019f8f6b-9d31-7fc2-9f21-41d6eb8d15e7`
- Stable event: `spec005-t16-a002-retry-challenge-after-pi-remediation-20260723-sol-high-02`
- Verdict: `AFFIRM`, reconciled by the orchestrator on 2026-07-23.
- Scope: implementation-readiness for exactly one newly authorized T16/A-002 attempt; not T16 completion or release-readiness.
- Finding: the corrected punctuation-free Pi instruction with transport-line-ending/outer-whitespace-only normalization and exact `PI_ACCESS_OK` equality is bounded; the fresh Sol High worker, shared runtime-target, preflight/canary, 15/15, privacy, fail-closed, no-retry, and owned-surface controls align with approved T16 and A-003 authority.
- Challenge confirmation: no files changed, providers invoked, release token created, A-002 started, or release state changed.

## Authorized fresh worker dispatch

- Fresh visible Sol High worker: `019f8f72-232b-7ed0-b1cd-25b76ea19fb5`
- Dispatch date: 2026-07-23, after the AFFIRM challenge above.
- Scope: exactly one new T16/A-002 token/run, with preflight and corrected provider canaries required before token creation.
- The worker must use one shared `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes`, stop on auth or any fail-closed condition, and remain within the declared owned surfaces.
- No token, run, provider capture, bundle, current-release mutation, or T16 completion has been reconciled at dispatch time.

## Post-Pi-remediation attempt result — blocked before token creation

- Worker: `019f8f72-232b-7ed0-b1cd-25b76ea19fb5`
- Stable event: `spec005-t16-a002-post-pi-retry-blocked-pretoken-provider-canaries-20260723-sol-high-04`
- Result: `blocked`; the one authorized attempt stopped before release-token creation.
- Preflight: PASS (`operations/preflight.ps1 -DryRun`, exit 0).
- Shared runtime target: `sancussight-local-runtimes` was set for every canary.
- Claude Code canary: FAIL (exit 1; exact marker false; auth prompt false).
- Codex CLI canary: FAIL (exit 1; exact marker false; auth prompt false).
- Pi canary: FAIL (exit 0; exact marker false; auth prompt false; stdout length 0), using the corrected exact-marker instruction.
- Consequence: no release token, run, matrix, producer capture, bundle, manifest promotion, or Playwright stage was created or started. Current release remains historical `spec005-t10-20260718e`.
- Privacy: no response bodies, prompts, credentials, secrets, tokens, or unrestricted output were retained.
- Required next decision: keep T16 incomplete; any future attempt requires new operator direction after addressing the provider-canary qualification failure. This worker performs no retry.

## Provider-canary launch remediation result — blocked

- Worker: fresh visible Terra High remediation worker in a new top-level task.
- Stable event: `spec005-t16-a002-provider-canary-remediation-blocked-20260723-terra-high-01`.
- Acknowledgment event: `spec005-t16-a002-provider-canary-remediation-ack-20260723-terra-high-01`; source-thread delivery was accepted before the first provider invocation.
- Applied launch contract: all provider commands were resolved from `C:/Users/henry/sancussight`; Claude was invoked through its resolved native executable with `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` and that same child working directory. Provider stdout/stderr bodies were discarded.
- Claude canary: FAIL (`launcherError=false`; process exit `0`; exact marker `false`; auth prompt `false`; bounded stdout chars `350`; bounded stderr chars `0`; output length capped `false`). The exact marker boundary did not qualify.
- Fail-closed result: Codex and Pi diagnostic canaries were not invoked after the first failed canary. No credentials were submitted and no auth bypass was used.
- `git diff --check`: PASS (exit `0`; no diff-check errors).
- No release token, A-002 run, matrix, producer capture, Praxen invocation, bundle, manifest promotion, or current-release mutation occurred. T16 remains incomplete and **Not ready for release**.
- A future A-002 attempt remains subject to fresh operator direction and orchestrator reconciliation; this bounded remediation does not authorize a retry.

## Provider-canary launch contract — final remediation reconciliation

- The first remediation block exposed two operational gaps: incomplete preservation of the approved noninteractive argument sets and direct Node child-process launch not reproducing the Claude marker boundary.
- The corrected contract now resolves provider paths from the canonical project, launches Claude/Codex through a noninteractive PowerShell `-Command` host, launches Pi through PowerShell `-File`, closes redirected stdin immediately, preserves the full approved arguments, and retains only bounded status fields.
- Fresh bounded diagnostic results: Claude exit `0`/exact marker `true`/auth prompt `false`; Codex exit `0`/exact marker `true`/auth prompt `false`; Pi exit `0`/exact marker `true`/auth prompt `false`.
- Sanitized evidence: `artifacts/qa/spec005/a002-t16-provider-canary-remediation-20260723-final.md`.
- This is a remediation verification only. No new release token or A-002 run has been created; a fresh independent challenge is required before the next Sol High dispatch.

## Fresh launch-boundary challenge reconciliation

- Fresh visible read-only challenge: `019f8fca-f06a-7093-97ce-8f655f2ee5ed`.
- Stable event: `spec005-t16-a002-provider-canary-launch-retry-challenge-20260723-terra-high-01`.
- Verdict: `AFFIRM`, reconciled by the orchestrator on 2026-07-23.
- Scope: implementation-readiness for exactly one newly authorized T16/A-002 attempt after provider-canary launch remediation; not T16 completion or release-readiness.
- Finding: canonical path resolution, PowerShell-hosted fully flagged Claude/Codex, PowerShell-hosted Pi, shared runtime target, canonical child directory, immediate stdin closure, bounded private streams, and exact-marker comparison align with approved T16/A-003 authority.
- Challenge evidence: final QA recorded Claude/Codex/Pi exit `0`, exact marker `true`, auth prompt `false`; no files/providers/token/A-002/release state were changed by the challenge.

## Final retry worker dispatch after launch remediation

- Fresh visible Sol High worker: `019f8fcd-77cd-7c82-8015-f65fa10d0722`.
- Dispatch followed the AFFIRM challenge above and the operator direction to apply the fix, then try again.
- Scope: exactly one new token/run; preflight and all three corrected canaries are required before token creation.
- The worker must use PowerShell-hosted provider invocation, complete noninteractive arguments, immediate stdin closure, one shared runtime target, bounded private streams, and the existing fail-closed/no-retry/release-promotion controls.
- No token, run, provider capture, bundle, current-release mutation, or T16 completion has been reconciled at dispatch time.

## Exact-marker normalization correction after final pre-token block

- The final worker's Claude canary exited `0`, had no auth prompt, and reported bounded stdout length `17`, but exact-marker comparison was `false`. The marker token is 16 characters; the extra character is the permitted trailing transport newline.
- The validator must normalize in this order: replace `CRLF` and `CR` with `LF`, trim only outer whitespace, then compare case-sensitively for exact equality against the punctuation-free token (`CLAUDE_ACCESS_OK`, `CODEX_ACCESS_OK`, or `PI_ACCESS_OK`). Raw stream length must not be compared to token length before trimming.
- Do not use substring, case-insensitive, punctuation-tolerant, or marker-synthesis logic. Do not retain the raw response body.
- This is a bounded pre-token contract correction. The failed worker created no token or run; T16 remains incomplete. A new release attempt requires fresh operator authorization.

## Final retry result — blocked before token creation

- Worker: `019f8fcd-77cd-7c82-8015-f65fa10d0722`.
- Stable event: `spec005-t16-a002-final-retry-blocked-pretoken-claude-marker-20260723-sol-high-05`.
- Preflight: PASS (exit `0`).
- Claude canary: launcher error `false`, process exit `0`, auth prompt `false`, bounded stdout `17`, exact marker `false`; the permitted trailing newline was not trimmed by the worker comparison.
- Codex and Pi: not invoked after the required first-canary failure.
- Consequence: no release token, run, matrix, producer capture, bundle, manifest promotion, or Playwright stage occurred. Current release remains historical `spec005-t10-20260718e`; T16 remains incomplete and **Not ready for release**.
- Privacy: provider stdout/stderr bodies, credentials, and secrets were not retained.
- Required next decision: the exact-marker trim correction is now recorded, but any new A-002 attempt requires fresh operator authorization. No automatic retry is authorized.

## Fresh operator authorization after exact-marker normalization correction

- Authorization recorded on 2026-07-23 from the operator message `apply fix and try again` in the source thread.
- Scope: exactly one newly created T16/A-002 operational release token/run after the exact-marker normalization correction is independently challenged and reconciled.
- This authorization does not complete T16, authorize an exception, permit reuse or relabeling of any prior failed/pre-token attempt, or permit a second attempt after any new failure.
- The corrected validator contract rejects a leading BOM before trimming, normalizes `CRLF`/`CR` to `LF`, trims only outer ASCII transport whitespace (`SP`, `HT`, `LF`), and then performs case-sensitive exact equality against the punctuation-free token. Generic Unicode `Trim()`, substring matching, punctuation tolerance, and marker synthesis are prohibited.
- The four required pure cases are: token plus trailing `CRLF` accepted; punctuation rejected; leading prose rejected; BOM-prefixed token rejected.
- A fresh independent visible read-only challenge is required before dispatching the Sol High worker because this normalization wording is newer than the prior launch-boundary challenge.
- No provider canary, release token, run, matrix, producer capture, bundle, current-release mutation, or Playwright stage is authorized in the challenge. Current release remains historical `spec005-t10-20260718e`.

## Fresh marker-normalization challenge reconciliation

- Fresh visible read-only challenge: `019f905b-69b9-79b2-a6f3-baeedc4c3eb6`.
- Stable event: `spec005-t16-a002-release-retry-challenge-marker-normalization-20260723-root-01`.
- Verdict: `AFFIRM`, reconciled by the orchestrator on 2026-07-23.
- Scope: implementation-readiness for exactly one newly authorized T16/A-002 attempt after the exact-marker correction; not T16 completion or release-readiness.
- Finding: leading-BOM rejection, `CRLF`/`CR` normalization, outer ASCII `SP`/`HT`/`LF` trimming, and case-sensitive exact token equality are precise and fail closed. The required pure cases accept trailing `CRLF` and reject punctuation, leading prose, and BOM.
- The challenge also affirmed canonical-path PowerShell hosting, immediate stdin closure, bounded private streams, the shared runtime target, auth fail-closed behavior, one-token/no-retry scope, declared ownership, historical current-release state, and A-003 runner authority.
- Challenge confirmation: no file, provider, release token/run, or release state was changed.

## Marker-normalized retry result — verification failed

- Fresh visible Sol High worker: `019f905e-32a0-7ff1-a234-5415229596ab`.
- Acknowledgment event: `spec005-t16-a002-marker-retry-ack-20260723-sol-high-06`.
- Started event: `spec005-t16-a002-marker-retry-started-20260723-sol-high-06`.
- Terminal event: `spec005-t16-a002-marker-retry-verification-failed-20260723-sol-high-06`.
- Release run: `spec005-a002-t16-20260723191340`, started `2026-07-23T19:13:40.2838413Z`, with shared runtime target `sancussight-local-runtimes`.
- The corrected pre-token boundary passed on the single allowed canary set: preflight passed; Claude, Codex, and Pi each exited `0`, matched the exact punctuation-free marker after leading-BOM rejection and ASCII transport-whitespace normalization, and showed no auth prompt.
- The mandatory failure/recovery matrix passed `15/15`. Fresh metadata-only runtime telemetry retained `149` current-run records across Codex CLI, Claude Code, and Pi with zero content-capture, runtime-target, prohibited-key, or identifying-path violations.
- The first Praxen target passed staging validation, but the pinned `manifest_to_findings.py` converter rejected line 3 because the model-created draft added unsupported top-level section `## Target`. The target failed at `converter`; the wrapper wrote `state: partial`, `releaseEligible: false`, and `bundlePromotionAttempted: false`, then paused before `sdd-exec`.
- Pipelock, RAMPART, AIMap, bundle construction, current-release promotion, project-wide post-token checks, and Playwright were correctly skipped after the fail-closed producer error. No retry or exception was attempted.
- The unsafe run-owned draft was removed after its SHA-256 was recorded. Fresh retained-artifact privacy review and `git diff --check` passed.
- Current release remains historical `spec005-t10-20260718e`. T16 remains incomplete and SancusSight remains **Not ready for release**.
- Orchestrator diagnosis: the next bounded producer-contract correction must make the Haiku staging prompt enumerate the converter's exact supported top-level sections (`scan`, `intro_band`, `behavior_summary`, `raise_posture`, `remit_coverage`, `findings`, `positives`, `log_files`, plus optional `footer`) and explicitly prohibit any extra heading such as `Target`; regression coverage must prove an unknown top-level section fails before any release promotion. A new operational run requires separate explicit operator authorization after that correction is independently challenged and reconciled.
