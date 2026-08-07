# Spec 005 T16R Worker Dispatch

Open a new visible top-level Codex chat and paste this prompt. This is an orchestrated implementation worker dispatch; do not implement T16R in the Orchestrator chat.

## Prompt

Implement approved SancusSight Spec 005 task T16R, **Enforce the deterministic Praxen producer boundary**, in the canonical project:

`C:/Users/henry/sancussight`

Resolve `SancusSight` through:

`C:/Users/henry/Vaults/LLM Wiki/system/projects/project_registry.py`

Use only the returned `canonical_path`. Read the applicable steering artifacts and these authority sources completely before editing:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `.ai/sdd/specs/005-operational-evidence-producers/design.md`, especially approved Amendment A-003
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`, especially approved Task T16R
- `.ai/sdd/handoff/spec005-a002-root-cause-remediation.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`

Execution mode: `orchestrated-worker`.

Tracking owner: `orchestrator`.

Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.

Routing authority: The independent fresh visible Terra High read-only challenge `spec005-t16r-routing-challenge-20260723-terra-high-01` was reconciled by Orchestrator on 2026-07-23. It retained the approved `deep` / `gpt-5.6-sol` / `high` routing; T15 is reconciled complete and no longer blocks T16R. Read `.ai/sdd/handoff/spec005-a003-t16r-routing-reconciliation.md` for the durable evidence. T16 A-002 remains blocked.

Session policy: `new-top-level-required`. Send an `acknowledged` lifecycle event to the source before editing and append it to `execution/T16R.md` with a stable event ID. Do not use subagents, hidden workers, or another nested worker. Do not edit `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, or the master context.

## Objective

Make the runner-authoritative Praxen pipeline the only path to official evidence. Haiku may write only a temporary Step 9.9 draft. The pinned Praxen `manifest_to_findings.py` converter must create canonical findings JSON, and the pinned `render.py` renderer must create HTML/TXT. SancusSight may accept only a runner-created current-run binding.

## Owned implementation surfaces

- `scripts/run-spec005-praxen-behavior-verifier.ps1`
- `scripts/run-spec005-t16-remediation.ps1`
- `scripts/test-spec005-claude-haiku.ps1`
- `scripts/test-spec005-praxen-boundary.ps1`
- `collector/adapters/praxen.ts`
- `collector/__tests__/operational-adapters.test.ts`
- `operations/README.md`
- append-only `execution/T16R.md`
- worker handoff `execution/T16R-handoff.md`

Treat T13-T15 implementation as read-only. Do not modify `src/types.ts`, `src/lib/release-gate.ts`, `src/lib/release-evidence-selection.ts`, or the release bundle builder. If those surfaces must change, stop with `contract-conflict` and return the exact paths and reason to the source thread.

## Required behavior

- Refuse target-directory reuse and isolate staging, temporary converter output, canonical output, rendered output, operational binding, and result state.
- Start one fresh short Haiku session per producer; retries require explicit operator approval.
- Reject missing, duplicate, stale, malformed, wrong-run, wrong-target, wrong-remit, wrong-version, converter, renderer, and privacy failures closed.
- Never accept a model-authored canonical-looking JSON directly.
- Invoke the pinned Praxen converter and renderer; do not reimplement them in TypeScript.
- Validate the runner-created binding, canonical content hash, producer timestamp, run/target/remit, exact Claude/Praxen/converter/renderer versions, provenance, and privacy boundary.
- Represent producer failure as an explicit partial result naming producer, target, stage, and reason; pause for operator direction; do not write a passing release bundle.
- Keep exceptions non-clean and non-release-eligible.
- Use controlled, truth-labelled fixtures only inside regression tests; never mix fixtures with A-002 evidence.
- Do not run the A-002 operational window in this worker.

## Verification

Run and report exact commands, exit codes, summaries, and PASS/FAIL verdicts for:

- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1`
- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- `npm audit --audit-level=high`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1`
- the labelled partial-fixture check proving `node scripts/build-spec005-t10-release-bundle.ts` fails closed and writes no bundle

Return a concise `ready-for-review`, `blocked`, `contract-conflict`, or `verification-failed` handoff naming changed files, regression coverage, exact evidence, and whether a new A-002 run is safe to request. A worker recommendation never marks T16R complete; Orchestrator will reconcile it after fresh review.
