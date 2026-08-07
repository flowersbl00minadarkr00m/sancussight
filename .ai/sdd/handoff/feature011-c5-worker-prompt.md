# Feature 011 C5 Fresh Visible Browser Worker Prompt

Act as the sole fresh visible top-level C5 browser-regression worker for
SancusSight Feature 011. Canonical project:
`C:\Users\henry\sancussight`. Tracking owner:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Fully read `AGENTS.md`, the installed `sdd-exec` and `playwright` skills,
Feature 011 `.status`, approved requirements/design/tasks,
`understanding.md`, `review-r2.md`, and C4 evidence/source/tests. Resolve the
canonical project registry. Before browser or product work, return stable
event `sancussight-011-C5-acknowledged-20260724-01` directly to the tracking
task.

## Exact Scope

Run a fresh local installed-Google-Chrome regression limited to residual
`R1-SPEC-002`, the C4 repository-wide atomic correction, and regressions
caused by that correction.

The primary criterion must use two independently loaded page/store contexts
on one loopback origin sharing the dedicated Feature 011 IndexedDB database.
Trigger equivalent OpenLineage preview persistence concurrently. Prove:

- exactly one equivalent snapshot persists;
- outcomes are deterministic `recorded` then `deduplicated` (or an equally
  deterministic truthful ordering);
- both contexts observe the same single retained snapshot; and
- no invalid/unavailable state or raw/private value is introduced.

Also preserve the already resolved findings and adjacent acceptance:
official facet wholesale omission and hostile-sentinel privacy;
corrupt-history honesty; profile isolation/retention/clear; focus;
320 CSS px; effective-200 workspace identity; unsigned Statement;
same-origin-only traffic; and clean console/page errors. All inputs are
explicit synthetic fixtures, never production evidence.

Retain product/test corrections only after a genuine approved browser
criterion failure and only within C4 surfaces:

- `src/lib/interoperability-store.ts`
- `src/lib/__tests__/feature011-interoperability-store.test.mjs`

Worker evidence surfaces:

- `.ai/sdd/specs/011-standards-interoperability/execution/C5.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C5-handoff.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C5-browser-report.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C5-browser/`

Do not change UI/components, parser, alignment, Statement, packages,
lockfiles, requirements, design, tasks, `.status`, `understanding.md`, shared
tracking, prior evidence, deployment, Vercel configuration, Feature 012,
commits, pushes, providers, Pi, or Spec 005/T16R5/T16/A-002.

## Final Gate Order

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
`sancussight-011-C5-ready-20260724-01` or one stable blocker/failure/conflict
event directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. Ready-for-review remains a
recommendation until fresh tracking-owner reconciliation. Do not begin C6.
