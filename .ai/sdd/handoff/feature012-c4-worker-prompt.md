# Feature 012 C4 Worker Prompt

You are a fresh visible top-level implementation worker for SancusSight
Feature 012 task C4 only.

Resolve the canonical project, then completely read `AGENTS.md`, the installed
`sdd-exec` skill, Feature 012 `.status`, `requirements.md`, `design.md`,
`tasks.md#C4`, `understanding.md`, `review-r1.md`, `review-r2.md`, C1 and R2
execution/handoff evidence, `.ai/sdd/handoff/sdd-brief.md`, the existing build
verifier, its focused tests, `vite.config.ts`, and `package.json`.

Before implementation, append `execution/C4.md` and deliver stable event
`sancussight-012-C4-acknowledged-20260724-01` directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`.

## Exact Scope

Correct only unresolved `R1-STANDARDS-001`: extend the existing deterministic
Feature 012 verifier to close over project-local dependencies loaded while
Vite evaluates build configuration, before build plugins can observe modules.

Acceptance:

- a project-local module imported directly or transitively by
  `vite.config.ts` is part of the declared/hashable build-input contract;
- an undeclared build-affecting config helper fails closed;
- declared config helpers are hashed and included without creating a parallel
  manifest;
- existing missing/extra root/`src`/`public` rejection, observed application
  module closure, two clean byte-identical builds, hostile outside-boundary
  `.resize` immunity, deterministic cleanup, and product behavior remain
  unchanged;
- focused tests include the exact R2 helper probe and at least one transitive
  config-dependency case.

Prefer extending the existing coherent verifier mechanism. Do not alter
product/UI/runtime behavior.

## Owned Surfaces

- `scripts/verify-feature012-build-inputs.ts`
- `src/lib/__tests__/feature012-build-input-boundary.test.mjs`
- one additional focused Feature 012 verifier test only if required
- `package.json` only if an additive verifier test command is required
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C4.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C4-handoff.md`

Package-lock, product/UI files, Vercel/deployment, shared tracking, C5+,
Feature 013+, commits/pushes, providers/Pi, and Spec 005/T16R5/T16/A-002 are
excluded.

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
11. scoped whitespace verification

Return exactly one stable terminal event:
`sancussight-012-C4-ready-20260724-01` or a stable blocker/failure/conflict
event. Ready-for-review is only a recommendation; the orchestrator owns
completion and shared tracking.
