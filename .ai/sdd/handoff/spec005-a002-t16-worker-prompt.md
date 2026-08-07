# Spec 005 T16/A-002 Worker Dispatch

Open a new visible top-level Codex Chat and use this prompt. This is an
orchestrated implementation/release worker dispatch; do not run T16 in the
Orchestrator Chat.

## Prompt

Execute approved SancusSight Spec 005 Task T16, **Revalidate A-002 with a new
operational release run**, in the canonical project:

`C:/Users/henry/sancussight`

Resolve `SancusSight` through:

`C:/Users/henry/Vaults/LLM Wiki/system/projects/project_registry.py`

Use only the returned `canonical_path`. Read the applicable steering artifacts
and these authority/supporting sources completely before editing or running
the release:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `.ai/sdd/specs/005-operational-evidence-producers/design.md`, especially A-002 timing/qualification and Amendment A-003
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`, especially Task T16
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R-handoff.md`
- `.ai/sdd/handoff/spec005-a002-root-cause-remediation.md`
- `.ai/sdd/handoff/spec005-a003-t16r-routing-reconciliation.md`
- `.ai/sdd/handoff/spec005-t16-a002-release-reconciliation.md`

Execution mode: `orchestrated-worker`.

Tracking owner: `orchestrator`.

Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.

Operator authorization: The operator explicitly approved proceeding with this
fresh T16/A-002 release run in the source thread. This is the new run only; it
does not authorize relabeling historical evidence, bypassing provider prompts,
or treating a partial/failed run as ready.

Routing authority: Independent fresh visible Terra High challenge
`spec005-t16-a002-release-challenge-20260723-terra-high-01` was reconciled by
Orchestrator on 2026-07-23. It affirmed `deep` / `gpt-5.6-sol` / `high` and
found no material authority blocker. Read the release reconciliation above.

Session policy: `new-top-level-required`. Send a structured `acknowledged`
lifecycle event to the source before editing or starting the release token and
append it to `execution/T16.md` with a stable event ID. Do not use subagents,
hidden workers, reused or relabeled Chats, or another nested worker. Do not edit
`tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, or
the master context.

## Objective

Create one fresh, sanitized, independently reviewable A-002 evidence set and
determine whether the complete five-category release gate passes. Produce no
passing manifest or bundle unless every source, runtime, target, failure case,
privacy boundary, and shared timing condition passes.

## Owned surfaces

- New run-scoped data under `%LOCALAPPDATA%/SancusSight/operations/runs/<new-run-id>/`
- New sanitized evidence under `artifacts/qa/spec005/a002-t16-*`
- Permitted `%LOCALAPPDATA%/SancusSight/operations/manifests/current-release.json` only after a completely passing gate
- Bounded Playwright evidence matching `output/playwright/spec005-a002-t16-*`
- Append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`

Treat T13-T16R implementation and all shared tracking as read-only. Do not
modify product code, collector adapters, release gate/selection, bundle
builder, T16R surfaces, `tasks.md`, `.status`, `INDEX.md`, or shared handoff
authority. If any implementation or contract defect is discovered, stop with a
structured `contract-conflict` and return the exact path and reason.

## Required release controls

- Run non-interactive preflight before creating the release token.
- Ensure Codex CLI OTLP, Claude Code OTLP, and Pi extension telemetry all use
  one shared `SANCUSSIGHT_RUNTIME_TARGET_ID` from the start. This is configuration
  for newly produced records, not relabeling. Reject mixed target identities
  before the token if the shared setting cannot be established.
- Stop immediately if any producer asks for authentication or authorization
  requiring operator action. Do not submit credentials, bypass, or continue;
  return `blocked` with a bounded reason and no passing artifacts.
- Use only fresh outputs from the new token. Never copy, relabel, rewrite
  timestamps, combine, or promote historical A-002/T10 evidence.
- Invoke the approved T16R runner-authoritative Praxen remediation for both
  targets. Haiku staging drafts are not canonical; pinned converter/renderer
  outputs and runner bindings are authoritative.
- Run all five producer categories, all three runtime types, both Praxen
  targets with paired Worker Remit hashes, trusted Pipelock allow/block, passing
  RAMPART, exact-scope completed AIMap, and all 15 failure/recovery cases.
- If any producer or target is partial/exception/stale/wrong-run/wrong-target/
  wrong-remit/wrong-version/untrusted/privacy-invalid, fail closed and write no
  passing manifest or bundle.
- Privacy-scan every retained artifact. Do not retain prompts, responses,
  reasoning, credentials, private keys, raw scan payloads, unrestricted output,
  or identifying absolute paths.
- Exercise bounded complete and degraded UI states at desktop/mobile sizes.

## Verification

Run and report exact commands, exit codes, summaries, and PASS/FAIL verdicts
for:

- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- `npm audit --audit-level=high`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1`
- `npm run verify:t10-matrix`
- `node scripts/build-spec005-t10-release-bundle.ts`
- Playwright operational desktop/mobile acceptance and independent privacy review

For any required failure, return `verification-failed` or `blocked`, preserve
the exact blocker, and do not claim readiness. For a fully passing gate, append
all exact run IDs, paths, commands, exit codes, artifacts, privacy results,
and recommendation to `execution/T16.md`, write `T16-handoff.md`, and return a
structured `ready-for-review` event to the source thread. A worker
recommendation never marks T16 complete; Orchestrator reconciles completion and
release readiness after fresh review.
