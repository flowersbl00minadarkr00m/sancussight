# Spec 005 T16R5 Implementation-Readiness Challenge

You are a fresh visible top-level read-only specialist reviewer. Do not
implement, edit, invoke a provider, create a release token/run, execute an
operational matrix, mutate release state, build/promote a bundle, or perform
Playwright.

Resolve `sancussight` through the canonical registry and work only in
`C:\Users\henry\sancussight`.

Read:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `.ai/steering/product.md`
- `.ai/steering/tech-stack.md`
- `.ai/steering/conventions.md`
- `requirements.md` FR-003, FR-009, FR-010, FR-020, NFR-002, NFR-005,
  and NFR-007
- `design.md` A-005 Sections 22.4, 22.5, 22.8, and the A-003/A-004 Praxen
  contracts they extend
- `tasks.md` Task T16R5 plus T16R4 completion and T16R6 ownership/dependency
- `review.md` findings SS-RP-001, SS-RP-002, and SS-RP-003
- current runner, wrapper, draft profile/skeleton, adapter, target-selection,
  and focused tests
- installed Praxen 1.1.0 converter/renderer contract read-only

Determine whether T16R5 is implementation-ready as one bounded
`gpt-5.6-sol` / high ticket. Challenge at least:

1. whether accepting `t16r2-v1` while preserving historical `t16r-v1`
   readability can remain exact and fail closed for run, target, remit,
   profile/skeleton hash, canonical sibling, timestamp, and version mismatch;
2. whether the runner can own a sanitized target-role `workspace` value and
   reject Windows, POSIX, UNC, `file:` URI, tilde/home, and identifying path
   variants before retained draft, canonical findings, rendered output, or
   operational projection, without modifying the pinned converter/renderer;
3. whether a real labelled fake-producer runner result can feed the production
   adapter and deterministic per-target selection seam so runner/adapter tests
   cannot remain independently false-green;
4. whether `remediation` remains the non-eligible default and descriptor-bound
   `operational` mode requires explicit authorization plus exactly two matched
   passed targets before `releaseEligible: true`;
5. whether partial, failed, blocked, exception, target mismatch, stale/reused
   attempt, privacy failure, and second-target pause behavior stay explicit,
   operator-action-required, non-promoting, and builder-free;
6. whether T16R5 owned surfaces are sufficient without touching the immutable
   descriptor, installed Praxen plugin, builder/current-release, T16R6/T16R7,
   shared tracking, or historical evidence; and
7. whether focused tests prove no provider invocation, no operational A-002
   run, no bundle promotion/current-release write, and no identifying retained
   artifact.

Return one structured lifecycle event with:

- stable `event_id`
- `task_id: T16R5`
- `type: implementation-readiness-challenge`
- `verdict: AFFIRM | CHALLENGE`
- affected contracts
- concise rationale
- required corrections/checks
- routing verdict for `gpt-5.6-sol` / high / one fresh visible top-level worker
- inspected commands/files
- explicit no-change/no-provider/no-release confirmation
- positive return delivery receipt to source thread
  `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`

Orchestrator alone reconciles the challenge and may dispatch implementation.
