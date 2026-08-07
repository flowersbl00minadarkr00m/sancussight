# Feature 009 T5R2 Fresh Visible Worker Prompt

Act as the one fresh visible top-level Feature 009 T5R2 production deployment
retry and hosted-verification worker for SancusSight in orchestrated-worker
mode. Canonical project is `C:\Users\henry\sancussight`. Resolve it first
through the canonical project registry and work only there. Tracking owner and
return target is visible orchestrator task
`019f914a-b672-77b1-837f-0c866b6421bb`. Do not delegate or create another
worker.

Before any deployment action, fully read applicable `AGENTS.md`, installed
`sdd-exec` instructions and required orchestration references, the installed
Vercel CLI skill, all steering files, Feature 009 `.status`, approved
requirements/design/tasks T5R2, `understanding.md`, `sdd-brief.md`, completed
T1-T4 and T5R1 handoffs, the failed T5 handoff/report, and this prompt.

Confirm `.status` is `implementation:in-progress`, T1-T5R1 are
authoritatively complete, T5R2 is the sole unblocked frontier, and the exact
existing Vercel identity is:

```text
project: sancussight
project id: prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ
team id: team_Y7ueoZZnBOfX63cjuG9R9SYG
scope: hflowers45-9370s-projects
canonical URL: https://sancussight.vercel.app
accepted package-lock SHA-256:
6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9
```

Before any deployment mutation, append `execution/T5R2.md` and directly
return stable event
`sancussight-009-T5R2-acknowledged-20260723-01`.

Execute only T5R2: deploy the exact independently reviewed Feature 009
artifact to the existing canonical SancusSight Vercel production project,
then perform hosted real-Chromium acceptance. Fail closed without mutation on
missing or expired authentication, project/team/scope mismatch, ambiguous or
destructive link/replacement, source changes after the review lock,
build/source-manifest mismatch, alias ambiguity, or a request for any new
environment/integration. Do not create a project, relink ambiguously, promote
an unrelated preview, change domains, environment variables, integrations,
routes, cache, or other Vercel configuration.

Before deployment:

1. Reconcile `.vercel/project.json` and read-only Vercel account/project
   identity against the exact IDs above.
2. Confirm the current `package-lock.json` hash exactly equals the accepted
   T5R1 hash above.
3. Record the current git base and a deterministic SHA-256 source manifest for
   all deploy-relevant reviewed source/config/static input files.
4. Run, in order:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
```

5. Record a deterministic SHA-256 manifest for the built static artifact.
6. Recheck source, lockfile, and static manifests immediately before mutation.

Deploy only through the existing explicit scope:

```text
vercel build --prod --yes --scope hflowers45-9370s-projects
vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects
```

After `vercel build`, recheck the source/config manifest and the lockfile hash.
They must remain byte-identical to their prebuild values. The Vercel prebuilt
static manifest must exactly equal the locked local `dist` manifest. Do not
run `vercel deploy` if any guard differs.

After deployment, confirm state `READY`, exact production target, immutable
URL, canonical alias without error, deployment/project/team IDs, and reviewed
source/static manifest continuity.

At `https://sancussight.vercel.app`, use a fresh real Chromium context with
synthetic/demo data only and verify:

- searchable definitions and a definition-only detail;
- non-passing selected result with exact rule/remediation/invalidation;
- Asset Passport -> exact check explanation -> Asset Passport;
- explicit no-previous, uncataloged, history-unavailable, and all five textual
  relationship states without private seeded history;
- adjacent desktop catalog/detail;
- narrow mutually exclusive list/detail, focus entry/Back restoration, 320px,
  effective 200% zoom, and no page-level overflow;
- exact canonical hosted footer remains only the clickable
  `https://sancussight.vercel.app` with no personal name;
- zero console errors/warnings and no unexpected Feature 009 network request;
- no Vercel runtime error cluster attributable to the deployment.

Own only:

- read-only reviewed product/config source;
- the Vercel prebuilt output and existing production deployment;
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5R2.md`;
- `execution/T5R2-handoff.md`;
- `execution/T5R2-hosted-report.md`;
- hosted evidence under `execution/T5R2-hosted/`.

Do not make product or package corrections. A hosted failure requiring code
must return a stable blocker for a separately authorized correction ticket.
Do not edit shared tracking, other execution evidence, package/dependency
files, unrelated dirty files, commit, push, touch Spec 005/T16R5/T16/A-002,
call providers/Pi, or claim broader release readiness.

Return exactly one terminal stable event:

- ready: `sancussight-009-T5R2-ready-20260723-01`
- blocked: `sancussight-009-T5R2-blocked-20260723-01`
- contract conflict:
  `sancussight-009-T5R2-contract-conflict-20260723-01`
- verification failed:
  `sancussight-009-T5R2-verification-failed-20260723-01`

Ready-for-review is only a recommendation. Include exact commands, exit codes,
manifests, deployment identity, hosted acceptance evidence, affected contract,
and requested tracking-owner action. Deliver directly to the tracking task and
durably record the delivery receipt.
