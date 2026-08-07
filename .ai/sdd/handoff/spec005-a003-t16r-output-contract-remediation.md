# Spec 005 A-003 T16R Output-Contract Remediation

## Authority and approval

- Feature: `005-operational-evidence-producers`
- Gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` (`implementation:in-progress`)
- Approved design: `design.md`, Amendment A-003, especially Sections 20.2 and 20.4
- Approved task boundary: `tasks.md`, Task T16R
- Tracking owner: `orchestrator`
- Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`
- Operator direction: the user explicitly approved this corrective implementation after the fresh T16/A-002 run failed closed at Praxen staging validation on 2026-07-23.

This is a bounded corrective implementation inside the already approved T16R runner/test surfaces. It does not change requirements, Amendment A-003, the A-002 contract, or the release gate. It does not authorize a new A-002 operational run.

## Independent challenge reconciliation

- Challenge session: `019f8dd0-1ab1-7db0-9a23-b61606996277`
- Challenge event: `spec005-t16r-output-contract-challenge-20260723-terra-high-01`
- Verdict: `CHALLENGE`, reconciled by the orchestrator on 2026-07-23.
- Finding: prompt-only coverage was insufficient because the existing multiline validator accepted a header later in the draft.
- Resolution: require byte-0/first-line validation and add missing-header plus leading-prose/fenced-header negative fixtures. This is an implementation tightening inside T16R/A-003; no requirements, design, or task amendment is required.

## Observed blocker

Release run `spec005-a002-t16-20260723064030` reached the first Praxen target, `sancussight`, and failed closed at `staging-validation` because the fresh Haiku Step 9.9 draft lacked the exact parser-grade header:

```text
# Praxen draft manifest
```

The validator and fail-closed wrapper behaved as designed: the result was partial, `sdd-exec` was not started, no retry occurred, and no release bundle or current-release update was written.

## In scope

1. Strengthen the model-output instruction in `scripts/run-spec005-praxen-behavior-verifier.ps1` so the required header is unambiguous and parser-grade: it must be the first line at byte 0, exact casing and spacing, with no BOM, whitespace, fenced block, or leading prose; the model still writes only one staging Markdown draft and no JSON/official report.
2. Tighten the runner's staging validation in `scripts/run-spec005-praxen-behavior-verifier.ps1` to enforce that exact first-line contract without normalization or silent header synthesis.
3. Extend `scripts/test-spec005-claude-haiku.ps1` plan-only regression coverage to assert that the runner's generated prompt contains the literal header and the first-line/no-fence/no-leading-prose requirement.
4. Extend `scripts/test-spec005-praxen-boundary.ps1` with labelled fixtures that produce content without the header and with leading prose/fenced content before the header; each must fail at `staging-validation`, while preserving the existing valid, malformed, stale, wrong-target, model-JSON, renderer, partial, and bundle fail-closed cases.
4. Append the dispatch, changed-file list, exact verification commands/results, and return event to `execution/T16R.md` and `execution/T16R-handoff.md` only.

## Out of scope

- No weakening or bypassing of the parser-grade staging validator; enforcing the first-line contract is required.
- No silent header synthesis or normalization after model output.
- No changes to `collector/adapters/praxen.ts`, the converter, renderer, release bundle builder, T13-T15 surfaces, `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, or release manifests.
- No production A-002 run, retry, exception, bundle promotion, or Playwright release acceptance.

## Worker contract

- Execution role: `worker`
- Mode: `orchestrated-worker`
- Session policy: `new-top-level-required`
- Model mapping: `deep`, `gpt-5.6-sol`, `high`; use only after the independent fresh visible Terra High challenge is reconciled by the orchestrator.
- Owned implementation surfaces:
- `scripts/run-spec005-praxen-behavior-verifier.ps1`
  - `scripts/test-spec005-claude-haiku.ps1`
  - `scripts/test-spec005-praxen-boundary.ps1`
  - append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md`
  - append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R-handoff.md`
- Shared authority and tracking files are read-only to the worker.
- Return channel: this source thread, with the execution record as durable fallback.

## Required verification

- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1`
- `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1`
- `git diff --check`
- If the focused checks pass, the worker may run the existing proportionate T16R regression set (`npm run test:collector`, `npm run verify:core`, `npm run build`, `npm audit --audit-level=high`, and the approved operations/governance/RAMPART checks) and must report exact results.

## Completion boundary

The worker may return `ready-for-review` only when the prompt contract and the observed missing-header failure are both covered by fresh passing checks. The orchestrator must inspect the scoped diff and reconcile completion. T16 remains incomplete and A-002 remains blocked until a separate future release authorization.
