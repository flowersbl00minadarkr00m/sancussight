# Feature 012 C3 Worker Prompt

You are a fresh visible top-level implementation worker for SancusSight
Feature 012 task C3 only.

Resolve the canonical project, then completely read `AGENTS.md`, the installed
`sdd-exec` skill, applicable Vercel deployment/verification instructions,
Feature 012 `.status`, `requirements.md`, `design.md`, `tasks.md#C3`,
`understanding.md`, `review-r1.md`, `execution/C1.md`,
`execution/C1-handoff.md`, `execution/C2.md`, `execution/C2-handoff.md`,
`execution/C2-browser-report.md`, `.ai/sdd/handoff/sdd-brief.md`, and
`.vercel/project.json`.

Before build output or deployment mutation, append `execution/C3.md` and
deliver stable event `sancussight-012-C3-acknowledged-20260724-01` directly to
tracking task `019f914a-b672-77b1-837f-0c866b6421bb`.

## Exact Scope

Deploy only the exact C2-reviewed corrected prebuilt artifact to the existing
canonical SancusSight Vercel production project:

- project `sancussight`
- project ID `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team ID `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- scope `hflowers45-9370s-projects`
- canonical URL `https://sancussight.vercel.app`

Fail closed before deployment on authentication/project ambiguity, source or
lock drift, failed ordered local gate, corrected build-input-manifest failure,
local/prebuilt static mismatch, or any need for product/package correction.

Require:

- the full C2-reviewed source/config manifest and accepted lockfile to remain
  unchanged through prebuild and deployment;
- `npm run verify:feature012-build-inputs` to pass, including two clean
  byte-identical builds and hostile outside-boundary `.resize` immunity;
- local and Vercel prebuilt static bytes to match exactly;
- production `READY`, exact project/team/target, canonical alias, and no alias
  error;
- canonical hosted static bytes to match the reviewed artifact;
- safe hosted installed-Chrome checks for compact header truth, contextual
  write-strip placement/state, six disclosure defaults/keyboard/focus,
  selected-row association, 320px/effective-200 layout, routes/footer, clean
  console/page errors, and canonical-origin-only traffic;
- scoped deployment runtime/build error inspection.

Do not automate or claim a public-host file write or OS file chooser. Local
connected-file write/recovery evidence remains owned by C2/T3.

## Owned Surfaces

- Vercel prebuilt output and exact existing-project production deployment
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C3.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C3-handoff.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C3-hosted-report.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C3-hosted/`

No product/test/package/lockfile/shared-tracking correction is permitted.
R2, Feature 013+, commits/pushes, environment/integration/domain/route/cache
changes, providers/Pi, and Spec 005/T16R5/T16/A-002 are excluded.

## Required Local Gate

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

Return exactly one stable terminal event:
`sancussight-012-C3-ready-20260724-01` or a stable blocker/failure/conflict
event. Ready-for-review is only a recommendation; the orchestrator owns
completion and shared tracking.
