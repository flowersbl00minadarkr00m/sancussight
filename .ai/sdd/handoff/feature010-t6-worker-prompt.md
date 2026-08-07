# Feature 010 T6 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex deployment/hosted-verification task for
SancusSight Feature 010 T6 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T6`
- T1–T5 are complete; T6 is the sole frontier.
- Shared tracking and understanding are orchestrator-only.

Fully read applicable `AGENTS.md`, `sdd-exec`, relevant Vercel CLI/browser
skills, steering, full Feature 010 authority, `sdd-brief.md`, T5 browser
evidence, current source/config, and `.vercel/project.json`. Resolve the
project and inspect the dirty tree.

Before build or deployment mutation, durably append and directly return:

```yaml
event:
  event_id: sancussight-010-T6-acknowledged-20260724-01
  task_id: T6
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T6 exact reviewed-artifact deployment, existing canonical Vercel identity, manifest guards, hosted acceptance, exclusions, tracking owner, and return path before build or deployment mutation.
  evidence:
    commands:
      - project registry resolve
      - authenticated read-only Vercel identity reconciliation
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T6
      - .vercel/project.json
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Deployment Boundary

```text
project: sancussight
project id: prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ
team id: team_Y7ueoZZnBOfX63cjuG9R9SYG
scope: hflowers45-9370s-projects
canonical URL: https://sancussight.vercel.app
accepted package-lock SHA-256:
6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9
```

Fail closed before deployment on missing authentication, project/team/scope
mismatch, destructive replacement, package-lock mismatch, source/config
manifest drift, local/prebuilt static mismatch, or ambiguous alias. Deploy only
the exact reviewed artifact through the existing canonical project.

## Exact Owned Surfaces

- read-only reviewed product/config source
- Vercel prebuilt output and exact existing canonical production deployment
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-handoff.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-hosted-report.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-hosted/`

No product/test/package/lockfile correction, shared tracking, environment,
integration, domain, route, cache, provider, commit, push, Pi, Spec
005/T16R5/T16/A-002, or broader release operation is owned.

## Required Flow

1. Reconcile authenticated identity and the existing canonical production
   project read-only.
2. Run all local gates in the approved order and capture deterministic
   source/config, lockfile, and local static manifests.
3. Run `vercel build --prod --yes --scope hflowers45-9370s-projects`.
4. Recompute guards; stop without deployment on any drift or mismatch.
5. Run `vercel deploy --prebuilt --prod --yes --scope
   hflowers45-9370s-projects`.
6. Reconcile READY/production/PROMOTED state, deployment ID, immutable URL,
   canonical alias, alias error, and byte-identical hosted static files.
7. Run hosted real-Chromium acceptance for version/no-history/comparison,
   local-only packet downloads, Exit Drill export, desktop/narrow/focus,
   footer/routes, console, network, and runtime errors. Clearly label any
   fixture-assisted hosted state; hosted use must create no server-side history,
   analytics, or third-party request.

## Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
vercel build --prod --yes --scope hflowers45-9370s-projects
vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects
real Chromium acceptance at https://sancussight.vercel.app
```

Return exactly one stable terminal event:
`sancussight-010-T6-ready-20260724-01` or one stable blocker/conflict/failure
event. Completion remains with the tracking owner.
