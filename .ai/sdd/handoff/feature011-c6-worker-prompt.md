# Feature 011 C6 Fresh Visible Deployment Worker Prompt

Act as the sole fresh visible top-level C6 corrected-deployment worker for
SancusSight Feature 011. Canonical project:
`C:\Users\henry\sancussight`. Tracking owner:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Fully read `AGENTS.md`, the installed `sdd-exec`, Vercel deployment, and
browser-verification skills, Feature 011 `.status`, approved
requirements/design/tasks, `understanding.md`, `review-r2.md`, and C4/C5
evidence. Resolve the canonical project registry. Before build output or
deployment mutation, return stable event
`sancussight-011-C6-acknowledged-20260724-01` directly to the tracking task.

## Exact Deployment Contract

Deploy only the exact C5-reviewed corrected artifact to the existing
canonical Vercel project:

- project `sancussight`;
- project ID `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`;
- team ID `team_Y7ueoZZnBOfX63cjuG9R9SYG`;
- scope `hflowers45-9370s-projects`; and
- canonical URL `https://sancussight.vercel.app`.

Resolve authentication/project identity read-only first. Capture the reviewed
source/config manifest, accepted lockfile hash, and local static manifest.
Run all nine local gates in exact order, use `vercel build --prod` and deploy
only the exact prebuilt output, then require unchanged source/lock/static
manifests, production `READY`, canonical alias assignment with no alias error,
and exact canonical hosted bytes.

Run a hosted installed-Chrome matrix limited to `R1-SPEC-002`, C4/C5, and
fix-caused regressions. The primary criterion must use two independently
loaded page/store contexts on the canonical origin sharing the dedicated
Feature 011 IndexedDB. Prove deterministic `recorded`/`deduplicated`, one
IndexedDB add, one retained snapshot, and one identical available view from
both contexts without raw/private values. Preserve the bounded facet/privacy,
corrupt-history, retention/clear, focus, 320px, effective-200 workspace,
unsigned Statement, footer/routes, console, network, and runtime checks.
All fixtures must be explicitly synthetic and not production evidence.

Fail closed on credentials, project ambiguity, source/lock/static drift,
deployment identity mismatch, alias error, non-Ready state, hosted byte
mismatch, or browser failure. Do not correct product/tests/packages/lockfiles
in C6.

## Owned Surfaces

- Vercel local prebuilt output and exact existing-project production
  deployment
- `.ai/sdd/specs/011-standards-interoperability/execution/C6.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C6-handoff.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C6-hosted-report.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C6-hosted/`

Do not change product, tests, packages, lockfiles, dependencies, environment/
integration/domain/route/cache configuration, requirements, design, tasks,
`.status`, `understanding.md`, shared tracking, prior evidence, Feature 012,
commits, pushes, providers, Pi, or Spec 005/T16R5/T16/A-002.

## Local Gate Order

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git -c core.autocrlf=false diff --check
```

Return exactly one stable terminal event:
`sancussight-011-C6-ready-20260724-01` or one stable blocker/failure/conflict
event directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. Ready-for-review remains a
recommendation until fresh tracking-owner reconciliation. Do not begin R3.
