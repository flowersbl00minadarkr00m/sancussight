# Feature 011 C1 Findings-Limited Correction Handoff

You are the sole fresh visible top-level C1 implementation worker for
SancusSight Feature 011. Work in `C:\Users\henry\sancussight`.

## Authority

- Resolve `SancusSight` through the canonical project registry before work.
- Fully read `AGENTS.md`, applicable `.ai/steering/`, Feature 011 `.status`,
  `requirements.md`, `design.md`, `tasks.md#C1`, `understanding.md`,
  `review-r1.md`, `execution/R1-handoff.md`, and
  `.ai/sdd/handoff/sdd-brief.md`.
- Gate: `implementation:in-progress`.
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`.
- Requirements and design remain approved. Correct only
  `R1-SPEC-001`, `R1-SPEC-002`, and `R1-STANDARDS-002`, plus direct
  fix-caused regressions. `R1-STANDARDS-001` is C2/C3 evidence scope.

## Required Acknowledgment

Before product edits, append `execution/C1.md` and return:

```yaml
event:
  event_id: sancussight-011-C1-acknowledged-20260724-01
  task_id: C1
  type: acknowledged
```

Confirm the exact findings, owned surfaces, exclusions, verification,
tracking owner, and return route.

## Exact Owned Surfaces

- `src/lib/openlineage-import.ts`
- `src/lib/interoperability-store.ts`
- `src/components/StandardsInteroperability.tsx` only if needed for honest
  persistence-state rendering
- `src/types.ts` only if the existing Feature 011 result union cannot express
  the approved state
- focused Feature 011 parser/store/workspace tests under `src/lib/__tests__/`
- `.ai/sdd/specs/011-standards-interoperability/execution/C1.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C1-handoff.md`

All other product/tests, prior evidence, requirements, design, tasks,
`.status`, `understanding.md`, index/brief, packages, lockfiles, deployment,
Vercel, commits, pushes, providers, Pi, and Spec 005/T16R5/T16/A-002 are
excluded.

## Acceptance

- Otherwise valid official input/output datasets accept `facets`,
  `inputFacets`, and `outputFacets` only as wholesale omissions with stable
  counts.
- Facet values are never traversed, copied, stringified, logged, hashed,
  returned, or persisted; adversarial sentinels prove the boundary.
- Concurrent equivalent record calls produce exactly one stored snapshot and
  deterministic `recorded` outcomes without weakening profile isolation,
  equivalence semantics, retention, clear, or unavailable fallback.
- Invalid persisted records cannot yield a healthy available/empty result
  while remaining stored. Use an honest unavailable/degraded response or
  bounded transactional cleanup consistent with the approved design.
- No network, dependency, migration, score, new product choice, or Feature
  008–010 behavior is introduced.

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
scoped git diff --check
```

Return one stable terminal event:

- `sancussight-011-C1-ready-20260724-01`; or
- one stable blocked/contract-conflict/verification-failed event.

Ready-for-review is a recommendation only. Do not advance C2 or shared
tracking.
