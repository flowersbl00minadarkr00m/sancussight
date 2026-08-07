# Feature 012 R2 Review Prompt

You are a fresh visible top-level independent reviewer for SancusSight
Feature 012 task R2 only. You have no implementation authority.

Resolve the canonical project, then completely read `AGENTS.md`, the installed
`sdd-review` skill, Feature 012 `.status`, `requirements.md`, `design.md`,
`tasks.md#R2`, `understanding.md`, `review-r1.md`, all C1/C2/C3 execution and
handoff evidence, C2 browser report/results, C3 hosted report/results,
`.ai/sdd/handoff/sdd-brief.md`, and the corrected product/test/config surfaces.

Before review execution, append `execution/R2.md` and deliver stable event
`sancussight-012-R2-acknowledged-20260724-01` directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`.

## Strict Review Boundary

Review only:

- `R1-STANDARDS-001` — explicit complete build-input boundary and continuity;
- `R1-STANDARDS-002` — App-owned typed pending phase without copy inference;
- the C1 fixes, C2/C3 evidence, and direct fix-caused regressions.

Preserve R1's green comprehensive Spec verdict. Review the bounded scope on
separate Spec and Standards/code-quality axes. Check removal/consolidation,
support by approved need, and unjustified user or maintainer decision burden.
Do not reopen unrelated requirements, implementation, predecessor features,
or resolved behavior absent a documented comprehensive-reset trigger.

Independently probe missing/extra build-input rejection, observed-module
closure, two clean byte-identical builds, hostile outside-boundary `.resize`
immunity, typed pending semantics, absence of user-visible-copy parsing, exact
corrected deployment identity, source/lock/static continuity, canonical hosted
bytes, relevant browser regressions, and direct fix-caused regressions.

## Owned Surfaces

- `.ai/sdd/specs/012-contextual-save-passport-disclosures/review-r2.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/R2.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/R2-handoff.md`

Do not fix or change product, tests, packages, lockfiles, deployment, prior
evidence, requirements/design/tasks/status/understanding, shared tracking,
commits/pushes, providers/Pi, Feature 013+, or Spec 005/T16R5/T16/A-002.

## Required Verification

Run in order:

1. `npm run test:feature012`
2. `npm run test:feature011`
3. `npm run test:feature010`
4. `npm run test:feature009`
5. `npm run test:feature008`
6. `npm run test:collector`
7. `npm run test:registry-compiler`
8. `npm run verify:core`
9. `npm run build`
10. `npm run verify:feature012-build-inputs`
11. `git diff --check`

Also perform fresh read-only production identity and practical corrected
hosted-static/browser continuity checks.

Return exactly one stable terminal event:
`sancussight-012-R2-ready-20260724-01` if approved within scope, or
`sancussight-012-R2-findings-20260724-01` / a stable blocker or verification
failure. The reviewer recommendation does not change authoritative status;
the orchestrator owns final reconciliation.
