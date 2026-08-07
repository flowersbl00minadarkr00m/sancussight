# Spec 005 T16/A-002 Post-T16R2 Release Authorization

## Authority

- Feature: `005-operational-evidence-producers`
- Gate: `implementation:in-progress`
- Approved task: `tasks.md`, Task T16
- Tracking owner: `orchestrator`
- Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`
- Operator decision: `approve T16/A-002`
- Decision time: `2026-07-23T13:21:28.5781908-07:00`
- Scope: exactly one new release token and one fresh operational A-002 run after T16R2 completion.

The authorization is spent when the fresh worker either creates its one release
token or terminates at the pre-token access boundary. It never authorizes an
automatic retry, historical evidence reuse, relabeling, timestamp rewriting,
evidence combining, exception promotion, credential submission, or an
authentication bypass.

## Reconciled prerequisites

- T15, T16R, and T16R2 are authoritatively complete.
- T16R2 fresh verification established the runner-owned, hash-pinned Praxen
  `1.1.0` / manifest-format `1` profile and skeleton.
- Structural drift, including unsupported `## Target`, now fails at
  `staging-structure-validation` before converter invocation.
- Field, type, indentation, schema, canonical JSON, and rendering authority
  remains with the unchanged pinned converter and renderer.
- The historical current release remains `spec005-t10-20260718e`.
- A fresh independent read-only challenge is required before Sol/High worker
  dispatch. The challenge does not consume this operational authorization.

## Independent challenge reconciliation

- Thread: `019f90a5-f25a-7c12-87e3-a7405650e885`
- Event: `spec005-t16-a002-post-t16r2-release-retry-challenge-20260723-root-02`
- Verdict: `AFFIRM`
- Receipt: delivered to source thread
  `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` as a structured delegation event.
- No contract correction was required. The challenge changed no files and
  invoked no provider, token/run, matrix, bundle, release, or Playwright action.

## Mandatory controls

1. Create one new visible top-level Sol/High worker only after a fresh
   independent challenge returns `AFFIRM` and the orchestrator reconciles it.
2. Before token creation, run noninteractive preflight and exactly one bounded
   access canary per provider from `C:/Users/henry/sancussight`.
3. Resolve Claude, Codex, and Pi with PowerShell `Get-Command`. Launch
   Claude/Codex through noninteractive PowerShell `-Command`; launch Pi through
   PowerShell `-File`. Close redirected stdin immediately, bound time and
   streams, and retain no provider output bodies.
4. Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` before all
   canaries and preserve it through all capture. Never relabel captured
   evidence.
5. Reject a leading BOM, normalize only `CRLF`/`CR` to `LF`, trim only outer
   ASCII `SP`/`HT`/`LF`, and require case-sensitive exact equality to the
   punctuation-free provider marker. Punctuation, prose, fences, alternate
   markers, launcher errors, nonzero exits, and auth prompts fail closed.
6. After pre-token qualification, create exactly one fresh release token/run,
   run the 15/15 matrix, capture fresh metadata-only Codex/Claude/Pi telemetry,
   and run both Praxen targets only through
   `scripts/run-spec005-t16-remediation.ps1` and the corrected runner.
7. Use only fresh same-run Pipelock, RAMPART, AIMap, target/remit/version,
   privacy, timing, trust, gate, bundle, and UI evidence.
8. Any missing, stale, wrong-run, wrong-target, wrong-remit, wrong-version,
   privacy, timing, trust, partial, exception, gate, bundle, or UI failure
   stops the run. Do not retry.
9. Write a passing bundle and `current-release.json` only after every required
   condition independently passes.

## Worker contract

- Execution mode: `orchestrated-worker`
- Session policy: `new-top-level-required`
- Model/effort: `gpt-5.6-sol`, high
- Owned writes:
  - new `%LOCALAPPDATA%/SancusSight/operations/runs/<new-run-id>/`
  - new sanitized `artifacts/qa/spec005/a002-t16-*`
  - `current-release.json` only after a complete passing gate
  - bounded `output/playwright/spec005-a002-t16-*`
  - append-preserving `execution/T16.md`
  - append-preserving `execution/T16-handoff.md`
- Read-only: implementation, collector, runner, converter, renderer, wrapper,
  release gate/selection/builder, requirements, design, tasks, `.status`,
  `.ai/sdd/INDEX.md`, shared handoffs, and historical evidence.
- Return: stable lifecycle events to source thread
  `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`; execution records are durable fallback.

## Terminal behavior

Return `blocked`, `contract-conflict`, or `verification-failed` immediately on
the first required failure. Return `ready-for-review` only with all changed
files, exact commands, exit codes, bounded summaries, privacy evidence, and
release-state evidence. Only the orchestrator may reconcile T16 completion or
release readiness.

## Attempt result — blocked before token creation

- Worker: `019f90aa-3249-73a2-ac89-58578c6912a1`
- Acknowledgment:
  `spec005-t16-a002-post-t16r2-ack-20260723-sol-high-01`
- Terminal event:
  `spec005-t16-a002-post-t16r2-blocked-pretoken-get-command-wrapper-20260723-sol-high-01`
- Preflight: exit `0`, pass.
- Provider-resolution reporting wrapper: exit `1`, PowerShell `ParserError` /
  `EmptyPipeElement`; no `Get-Command` invocation executed.
- Provider canaries: Claude `0`, Codex `0`, Pi `0`.
- Release token/run: none.
- Matrix, producers, promotion, bundle, current-release, project-wide
  post-token checks, and Playwright: not started.
- Privacy: no provider bodies retained, no credentials submitted, and no auth
  bypass used.
- Historical release: unchanged `spec005-t10-20260718e`.
- Receipt/integrity: terminal event delivered and present in the sanitized QA
  record plus both T16 execution records; privacy and `git diff --check` passed.

This one-shot authorization is spent. T16 remains incomplete and not ready for
release. Any future attempt requires new explicit operator authorization and a
new visible top-level worker.
