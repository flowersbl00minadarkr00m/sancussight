# Feature 009 T5 Fresh Visible Worker Prompt

Act as the one fresh visible top-level Feature 009 T5 deployment and hosted
verification worker for SancusSight in orchestrated-worker mode. Canonical
project is `C:\Users\henry\sancussight`. Resolve it first through the canonical
project registry and work only there. Tracking owner and return target is
visible orchestrator task `019f914a-b672-77b1-837f-0c866b6421bb`. No other T5
worker is authorized. Do not delegate or create another worker.

Before any deployment action, fully read applicable `AGENTS.md`, installed
`sdd-exec` instructions and required orchestration references, the installed
Vercel CLI skill, all steering files, Feature 009 `.status`, approved
requirements/design/tasks T5, `understanding.md`, `sdd-brief.md`, completed
T1-T4 handoffs, and this prompt. Confirm `.status` is
`implementation:in-progress`, T1-T4 are authoritatively complete, T5 is the
sole unblocked frontier, and the exact existing Vercel project identity is:

```text
project: sancussight
project id: prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ
team id: team_Y7ueoZZnBOfX63cjuG9R9SYG
scope: hflowers45-9370s-projects
canonical URL: https://sancussight.vercel.app
```

Send stable event `sancussight-009-T5-acknowledged-20260723-01` to the tracking
task before any deployment mutation.

Execute only T5: deploy the exact independently reviewed Feature 009 artifact
to the existing canonical SancusSight Vercel production project, then perform
hosted real-Chromium acceptance. Fail closed without mutation on missing or
expired authentication, project/team/scope mismatch, ambiguous or destructive
link/replacement, source changes after the review lock, build/source-manifest
mismatch, alias ambiguity, or a request for any new environment/integration.
Do not create a project, relink ambiguously, promote an unrelated preview,
change domains, environment variables, integrations, routes, cache, or other
Vercel configuration.

Before deployment:

1. Reconcile the existing local `.vercel/project.json` and read-only Vercel
   account/project identity against the exact IDs above.
2. Record the current git base and deterministic SHA-256 source manifest for
   all deploy-relevant reviewed source/config/static input files.
3. Run, in order:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
```

4. Record a deterministic SHA-256 manifest for the built static artifact.
5. Recheck both manifests immediately before mutation.

Deploy only through the existing explicit scope:

```text
vercel build --prod --yes --scope hflowers45-9370s-projects
vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects
```

Confirm deployment state `READY`, exact production target, immutable URL,
canonical alias without error, deployment/project/team IDs, and reviewed
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
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5.md`;
- `execution/T5-handoff.md`;
- `execution/T5-hosted-report.md`;
- hosted evidence under `execution/T5-hosted/`.

Do not make product corrections. A hosted failure requiring code must return a
stable blocker for a new separately authorized correction ticket. Do not edit
shared tracking, T1-T4 evidence, package/dependency files, unrelated dirty
files, commit, push, touch Spec 005/T16R5/T16/A-002, call providers/Pi, or
claim broader release readiness.

Return exactly one stable
`sancussight-009-T5-ready-20260723-01` ready-for-review recommendation or one
stable blocked/contract-conflict/verification-failed event. Completion remains
with the tracking orchestrator.
