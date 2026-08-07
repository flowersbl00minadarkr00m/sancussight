# Feature 012 R3 Review Prompt

You are a fresh visible top-level independent reviewer for SancusSight
Feature 012 task R3 only. You have no implementation authority.

Resolve the canonical project, then completely read `AGENTS.md`, the installed
`sdd-review` skill, Feature 012 authority artifacts, `tasks.md#R3`,
`review-r1.md`, `review-r2.md`, C4/C5/C6 execution and handoff evidence,
C5 config/browser results, C6 hosted report/results, the corrected verifier
and focused test, and `.ai/sdd/handoff/sdd-brief.md`.

Before review execution, append `execution/R3.md` and deliver stable event
`sancussight-012-R3-acknowledged-20260724-01` directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`.

## Strict Boundary

Review only unresolved `R1-STANDARDS-001`: project-local Vite-config
dependency closure, the C4 correction, C5/C6 evidence, and direct fix-caused
regressions.

Preserve:

- R1's comprehensive green Spec verdict;
- R2's resolved `R1-STANDARDS-002`;
- all unrelated product and predecessor conclusions.

Independently reprove direct/transitive config-helper discovery, undeclared
rejection, declared hashing and whole-manifest digest sensitivity,
missing/extra rejection, observed application-module closure, deterministic
clean builds, hostile outside-boundary immunity, cleanup, exact corrected
production identity/bytes, and practical browser continuity. Review on
separate Spec and Standards axes and consider consolidation/removal and
maintainer decision burden.

## Owned Surfaces

- `.ai/sdd/specs/012-contextual-save-passport-disclosures/review-r3.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/R3.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/R3-handoff.md`

No fixes or changes to product, tests, verifier, packages, lockfiles,
deployment, prior evidence, requirements/design/tasks/status/understanding,
shared tracking, Feature 013+, commits/pushes, providers/Pi, or
Spec 005/T16R5/T16/A-002.

## Required Verification

Run in order:

1. isolated C5 config-closure probe
2. `npm run test:feature012`
3. `npm run test:feature011`
4. `npm run test:feature010`
5. `npm run test:feature009`
6. `npm run test:feature008`
7. `npm run test:collector`
8. `npm run test:registry-compiler`
9. `npm run verify:core`
10. `npm run build`
11. `npm run verify:feature012-build-inputs`
12. `git diff --check`

Also perform fresh read-only exact deployment identity, canonical hosted byte,
and practical hosted-browser continuity checks.

Return exactly one stable terminal event:
`sancussight-012-R3-ready-20260724-01` if approved within scope, or
`sancussight-012-R3-findings-20260724-01` / stable blocker/failure. The
reviewer recommendation does not change authoritative status; the orchestrator
owns final reconciliation.
