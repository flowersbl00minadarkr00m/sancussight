# Feature 011 C3 Visible Corrected Deployment Worker Prompt

You are the fresh visible top-level orchestrated deployment worker for
SancusSight Feature 011 C3 only.

## Authority and Identity

- Canonical root: `C:\Users\henry\sancussight`
- Mode: `orchestrated-worker`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `.ai/sdd/specs/011-standards-interoperability/.status` must be
  `implementation:in-progress`.
- T1–T5, R1, C1, and C2 are authoritatively complete; C3 is the sole
  unblocked frontier.
- Existing canonical Vercel identity to reconcile read-only before mutation:
  - project: `sancussight`
  - project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
  - team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
  - scope: `hflowers45-9370s-projects`
  - canonical URL: `https://sancussight.vercel.app`
  - prior reviewed deployment: `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH`

Fully read the applicable SDD execution, Vercel deployment, and browser
verification skills; project steering; Feature 011 requirements/design/tasks;
R1 findings; C1 implementation evidence; C2 browser evidence and handoff;
current source/config; `.vercel/project.json`; and
`.ai/sdd/handoff/sdd-brief.md`.

Before any build output or deployment mutation, resolve the registry, inspect
the dirty tree, verify this is a fresh visible top-level task, reconcile
authenticated existing-project identity, and deliver stable acknowledgment
event `sancussight-011-C3-acknowledged-20260724-01` directly to the tracking
task with durable execution-record fallback.

## Exact C2-Reviewed Artifact Contract

1. Capture the git base plus deterministic reviewed source/config manifest and
   accepted `package-lock.json` SHA-256 before the local gate sequence.
2. Run the full gates in this exact order:
   - `npm run test:feature011`
   - `npm run test:feature010`
   - `npm run test:feature009`
   - `npm run test:feature008`
   - `npm run test:collector`
   - `npm run test:registry-compiler`
   - `npm run verify:core`
   - `npm run build`
   - `git diff --check`
3. Capture the deterministic local `dist` static manifest.
4. Run `vercel build --prod --yes --scope hflowers45-9370s-projects`.
5. Require source/config and lockfile manifests to remain identical and
   `.vercel/output/static` to match the reviewed local `dist` manifest exactly.
   Fail closed before deployment on any drift or package/lock mutation.
6. Deploy only that exact prebuilt output with
   `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects`.
7. Require the exact existing project/team/scope, target production, state
   READY, substate PROMOTED when exposed, canonical alias assigned with no
   alias error, and no project/domain/config replacement.
8. Prove canonical hosted static bytes match the locked local/prebuilt static
   manifest.

## Findings-Limited Hosted Acceptance

Run installed Google Chrome against the canonical URL with explicitly labeled
synthetic fixtures only. Verify:

- official OpenLineage base `facets`, `inputFacets`, and `outputFacets` are
  accepted and omitted wholesale with exact stable counts;
- hostile facet sentinels are absent from the current projection, DOM,
  observed hash preimages, console/logs, downloads, and IndexedDB;
- overlapping equivalent imports yield deterministic recorded/deduplicated
  outcomes and exactly one persisted snapshot;
- an invalid persisted Feature 011 record yields honest unavailable history
  while the current valid preview and unrelated stores remain usable;
- the effective-200 path explicitly reopens Advanced -> Evidence Sources,
  asserts the `Standards Interoperability` heading, one workspace and one
  existing rail, then records CSS viewport, DPR, page overflow, and internal
  table metrics before claiming pass;
- focus, keyboard controls, 320 CSS pixels, unsigned Statement download,
  profile isolation/retention/clear, canonical one-link footer, routes, clean
  console/page errors, same-origin production requests, and no scoped Vercel
  runtime errors.

Do not send private or production input to the host. Limit hosted verification
to the four R1 findings, C1/C2 corrections, and fix-caused regressions.

## Owned Surfaces and Fail-Closed Boundaries

Owned writes:

- Vercel local prebuilt output and the exact existing-project production
  deployment;
- `.ai/sdd/specs/011-standards-interoperability/execution/C3.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/C3-handoff.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/C3-hosted-report.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/C3-hosted/`.

No product, test, package, lockfile, dependency, shared tracking,
requirements/design, environment/integration/domain/route/cache, commit, push,
provider/Pi, Spec 005/T16R5/T16/A-002, R2, or broader release correction is
authorized.

Stop with one stable blocker/failure/conflict event on credentials, project
ambiguity, manifest drift, build mismatch, package/lock mutation, alias error,
non-READY deployment, hosted byte mismatch, or failed required acceptance.
Otherwise return exactly one stable
`sancussight-011-C3-ready-20260724-01` recommendation to the tracking task.
Do not mark C3 or Feature 011 complete and do not edit shared tracking.
