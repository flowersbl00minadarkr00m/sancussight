# Proposed T16R5 Task Correction After Independent Challenge

> Status: awaiting explicit operator approval. Supporting control-plane
> proposal only; it does not amend approved `tasks.md` by itself.

## Challenge

- Event: `spec005-a005-t16r5-readiness-challenge-20260723-root-02`
- Thread: `019f9141-56cd-7ad3-9ee5-f2d62dbe5e2d`
- Verdict: `CHALLENGE`
- Reviewer actions: read-only; no edits, providers, token/run, operational
  matrix, bundle/current-release, or Playwright.

## Impact analysis

The four corrections narrow and make testable the already approved A-005
Sections 22.4-22.5 contract. They do not change requirements, the immutable
descriptor, the installed Praxen converter/renderer, builder ownership, UI,
or release authority. The owning gate is `tasks.md` Task T16R5.

## Proposed bounded task correction

1. Define the current operational binding as `t16r2-v1` with adapter-verifiable
   `profileVersion`, `profileSha256`, `skeletonSha256`, `attemptId`, canonical
   sibling identity, run, target, remit, timestamp, and version facts.
   Historical `t16r-v1` remains readable but cannot qualify a current A-002
   run. Every mismatch fails closed.
2. Require the runner to replace authored `workspace` with one bounded
   runner-owned target role and reject identifying Windows drive/extended/UNC,
   POSIX, `file:` URI, tilde, and home-path values in the final draft and
   converter JSON before canonical copy or rendering. Failed result and reason
   evidence must not retain the rejected value.
3. Define an explicit wrapper result contract. `remediation` stays the
   ineligible default. `operational` requires explicit authorization and the
   immutable descriptor; only exactly two unique required targets whose
   run/profile/remit/attempt/canonical facts match may set
   `releaseEligible: true`. Stale, reused, mixed, failed, blocked, partial,
   exception, privacy, and mismatch states pause, require operator action, and
   invoke no builder.
4. Add a labelled provider-free integration fixture that runs the real
   PowerShell runner with a fake producer, collects the emitted operational
   artifact through `PraxenAdapter`, and passes accepted envelopes through
   `selectCanonicalTargetEvidence` with all current criteria. Prove independent
   selection for both targets and fail-closed mismatch cases.
5. Focused verification must scan every retained fixture artifact for
   identifying path values and confirm zero provider invocation, operational
   A-002 run/matrix, bundle/current-release write, or release Playwright.

## Ownership

No additional implementation surface is proposed beyond approved T16R5:

- draft skeleton and narrowly necessary profile metadata
- Praxen runner and two-target wrapper
- focused Haiku/Praxen tests
- Praxen adapter and adapter tests
- new runner-adapter-selection integration fixture/test
- T16R5 execution records

Descriptor, installed Praxen plugin, builder/current-release, T16R6/T16R7,
shared tracking, historical evidence, and operational release state remain
read-only.

## Required next gate

After explicit approval, Orchestrator amends Task T16R5 with these details and
dispatches a new fresh visible independent corrected challenge. Implementation
may start only after that challenge returns `AFFIRM`.
