# Feature 011 C4 Fresh Visible Worker Prompt

Act as the sole fresh visible top-level C4 correction worker for SancusSight
Feature 011. Canonical project: `C:\Users\henry\sancussight`. Tracking owner:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Fully read `AGENTS.md`, the installed `sdd-exec` skill, Feature 011 `.status`,
approved requirements/design/tasks, `understanding.md`, `review-r1.md`,
`review-r2.md`, C1–C3 execution evidence, and current store/tests. Resolve the
canonical project registry. Before product edits, return stable event
`sancussight-011-C4-acknowledged-20260724-01` directly to the tracking task.

## Exact Scope

Correct only the residual `R1-SPEC-002` repository-concurrency defect:
equivalent concurrent writes through separate
`InteroperabilityPreviewStore` instances sharing one repository can both
persist. Make equivalence check and insertion atomic at a repository-wide
boundary, including the dedicated IndexedDB repository used across separate
store/page contexts.

Preserve:

- deterministic recorded/deduplicated outcomes;
- profile isolation and consecutive-equivalence semantics;
- 20-per-profile and 100-global retention;
- invalid-record fail-closed honesty;
- clear isolation and unavailable-current-preview fallback;
- exact sanitized storage shape and all privacy exclusions; and
- existing public behavior and all three already resolved R1 findings.

Add a deterministic two-store/one-shared-memory-repository regression and an
IndexedDB/browser-relevant atomic seam test. Do not add a dependency, network
path, broad lock service, score, signer, policy runtime, or unrelated API.

## Owned Surfaces

- `src/lib/interoperability-store.ts`
- `src/lib/__tests__/feature011-interoperability-store.test.mjs`
- one additional focused Feature 011 store test only if required and
  non-overlapping
- `.ai/sdd/specs/011-standards-interoperability/execution/C4.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C4-handoff.md`

Do not change components/UI, parser, telemetry alignment, Statement export,
packages, lockfiles, requirements, design, tasks, `.status`,
`understanding.md`, shared tracking, prior evidence, deployment, Vercel
configuration, Feature 012, commits, pushes, providers, Pi, or Spec
005/T16R5/T16/A-002.

## Verification

Run in exact order:

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git -c core.autocrlf=false diff --check
```

Return exactly one stable terminal event:
`sancussight-011-C4-ready-20260724-01` or one stable blocker/failure/conflict
event directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. Ready-for-review remains a
recommendation until fresh tracking-owner reconciliation. Do not begin C5.
