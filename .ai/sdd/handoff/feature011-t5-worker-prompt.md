# Feature 011 T5 Visible Deployment Worker Prompt

You are the fresh visible top-level orchestrated deployment worker for
SancusSight Feature 011 T5 only.

## Authority and Identity

- Canonical root: `C:\Users\henry\sancussight`
- Mode: `orchestrated-worker`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `.ai/sdd/specs/011-standards-interoperability/.status` must be
  `implementation:in-progress`.
- T1–T4 are authoritatively complete; T5 is the sole unblocked frontier.
- Existing canonical Vercel identity to reconcile read-only before mutation:
  - project: `sancussight`
  - project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
  - team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
  - scope: `hflowers45-9370s-projects`
  - canonical URL: `https://sancussight.vercel.app`

Fully read the applicable SDD execution, Vercel deployment, and browser
verification skills; project steering; Feature 011 requirements/design/tasks;
T4 execution/browser evidence; current source/config; `.vercel/project.json`;
and `.ai/sdd/handoff/sdd-brief.md`.

Before any build output or deployment mutation, resolve the registry, inspect
the dirty tree, verify this is a fresh visible top-level task, reconcile
authenticated existing-project identity, and deliver stable acknowledgment
event `sancussight-011-T5-acknowledged-20260724-01` directly to the tracking
task with durable execution-record fallback.

## Exact Reviewed-Artifact Contract

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

## Hosted Acceptance

Run real Chromium against the canonical URL and verify:

- the public custom predicate schema is HTTP 200 at the approved public path
  and matches the reviewed schema bytes;
- the Standards Interoperability workspace remains under Advanced -> Evidence
  Sources with the existing rail;
- safe JSON/JSONL import, mixed record isolation, raw-value non-retention,
  empty and populated telemetry alignment, valid/tampered Evidence Packet,
  exact unsigned/not-externally-verified Statement download, history/dedupe/
  retention/clear/unavailable states, and the T4 hash-prefix correction;
- desktop adjacency, focus, 320 CSS pixels, effective 200%, internal table
  overflow, long hashes, and zero page overflow;
- existing routes and the canonical one-link footer;
- zero Feature 011 console errors/warnings, same-origin production requests,
  and no scoped Vercel runtime error entries.

Use explicitly labeled synthetic fixtures only. Do not send private or
production input to the host.

## Owned Surfaces and Fail-Closed Boundaries

Owned writes:

- Vercel local prebuilt output and the exact existing-project production
  deployment;
- `.ai/sdd/specs/011-standards-interoperability/execution/T5.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/T5-handoff.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/T5-hosted-report.md`;
- `.ai/sdd/specs/011-standards-interoperability/execution/T5-hosted/`.

No product, test, package, lockfile, dependency, shared tracking,
requirements/design, environment/integration/domain/route/cache, commit, push,
provider/Pi, Spec 005/T16R5/T16/A-002, or broader release correction is
authorized.

Stop with one stable blocker/failure/conflict event on credentials, project
ambiguity, manifest drift, build mismatch, package/lock mutation, alias error,
non-READY deployment, hosted byte mismatch, or failed required acceptance.
Otherwise return exactly one stable
`sancussight-011-T5-ready-20260724-01` recommendation to the tracking task.
Do not mark T5 or Feature 011 complete and do not edit shared tracking.
