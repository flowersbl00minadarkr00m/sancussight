# Spec 005 T16R4 Corrected Implementation-Readiness Challenge

You are a fresh visible top-level read-only reviewer. Do not implement, edit,
invoke a provider, create a token/run, execute the matrix, mutate release
state, or perform Playwright.

Resolve `sancussight` through the canonical registry and work only in
`C:\Users\henry\sancussight`.

Read:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `requirements.md` FR-019 and NFR-007
- `design.md` A-005 Sections 22.3, 22.8, and TD-014
- corrected `tasks.md` Task T16R4 and T16R5-T16R7 ownership
- `.ai/sdd/handoff/spec005-a005-t16r4-task-correction.md`
- prior challenge `spec005-t16r4-readiness-challenge-20260723-001`
- failure matrix, release-gate timing tests, OTLP bridge, Pi extension/context,
  run examples, and relevant runtime producer tests

Determine whether the corrected T16R4 is implementation-ready as one bounded
Sol High ticket. Confirm:

1. the fixed provider-free creator and canonical
   `%LOCALAPPDATA%\SancusSight\operations\runs\<releaseRunId>\release-run.json`
   path are sufficient and exclusively create once before capture;
2. exact schema/key/purpose/run/root/UTC/target/BOM/unknown-field and rewrite
   invariants are fully testable;
3. matrix, OTLP, and Pi are the only migrated consumers in this ticket;
4. OTLP validates and exposes identity before listen, Pi before registration
   or emission, and each process refuses rebind;
5. conflicting environment, matrix time, filesystem/import time, malformed,
   pre-run/future/exact-boundary/over-boundary, wrong-target, rewrite, and
   reused-process fixtures cover the approved fail-closed behavior; and
6. T16R5 Praxen/selection, T16R6 builder, and T16R7 acceptance ownership
   remain non-overlapping and dependency-blocked.

Return one structured event with stable `event_id`, `task_id: T16R4`,
`type: implementation-readiness-challenge`, `verdict: AFFIRM | CHALLENGE`,
affected contracts, rationale, required checks, routing verdict for
`gpt-5.6-sol` / high / one fresh visible top-level worker, inspected evidence,
explicit no-change/no-provider/no-release confirmation, and positive delivery
receipt to source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.

Orchestrator alone reconciles the verdict.
