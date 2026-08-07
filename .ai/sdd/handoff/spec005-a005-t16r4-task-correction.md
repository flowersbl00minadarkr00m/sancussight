# Proposed T16R4 Task Correction After Independent Challenge

> Approved by the operator on 2026-07-23 and reconciled into Task T16R4.

## Challenge

- Event: `spec005-t16r4-readiness-challenge-20260723-001`
- Thread: `019f90e2-ccad-7923-b8a5-d09934e1c1ab`
- Verdict: `CHALLENGE`
- No files, providers, token/run, matrix, current-release, or Playwright state
  were changed by the reviewer.

## Proposed bounded correction

1. Narrow T16R4 delivery to the descriptor contract, fixed creator/parser,
   failure matrix, OTLP bridge, and Pi extension. End-to-end sole authority is
   achieved only after descriptor-bound T16R5, T16R6, and T16R7 complete.
2. Add fixed creator
   `scripts/new-spec005-t16-release-descriptor.ps1` and focused test
   `scripts/test-spec005-t16-release-descriptor.ps1` to T16R4 ownership.
3. Fix the canonical descriptor path as:
   `%LOCALAPPDATA%\SancusSight\operations\runs\<releaseRunId>\release-run.json`.
4. Create once with exclusive semantics before producer capture. Refuse an
   existing descriptor, rewrite, run-root/run-ID disagreement, or legacy
   release manifest.
5. Validate exactly:
   `schemaVersion`, `releaseRunId`, `startedAt`, `runtimeTargetId`, and
   `purpose`; require schema `1`, purpose `a002-t16`, bounded run ID,
   canonical UTC time, approved runtime target, no BOM, and no unknown fields.
6. Bind OTLP before listen and Pi before handler registration/emission. Each
   process exposes its descriptor identity, remains bound to the first
   descriptor, refuses rebind, and emits no qualifying telemetry on
   wrong-run/wrong-target/malformed/rewrite/reused-process cases.
7. Prove stale or conflicting `SANCUSSIGHT_RELEASE_RUN_ID` and
   `SANCUSSIGHT_RUNTIME_TARGET_ID` environment values cannot override the
   descriptor.
8. Retain descriptor-derived pre-run, future, exact-deadline,
   one-millisecond-over, matrix-observation substitution, filesystem-time
   substitution, target mismatch, BOM, rewrite, and reused-process negatives.

## Proposed ownership addition

- `scripts/new-spec005-t16-release-descriptor.ps1`
- `scripts/test-spec005-t16-release-descriptor.ps1`

All existing T16R4 surfaces remain. T16R5 Praxen, T16R6 builder/selection, and
T16R7 acceptance surfaces remain read-only and dependency-blocked.

## Required next gate

The task authority has been updated. A new fresh independent challenge must
return `AFFIRM` before Orchestrator dispatches a T16R4 worker.
