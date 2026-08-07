# Feature 012 T4 Worker Handoff

You are a fresh visible top-level Codex worker for SancusSight Feature 012
task T4 only. Work in orchestrated-worker mode.

## Resolve and Read Before Build Output or Deployment Mutation

1. Resolve `SancusSight` through:
   `python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json`
2. Work only in the returned canonical project.
3. Fully read repository `AGENTS.md`, applicable `.ai/steering/`, installed
   `sdd-exec`, `playwright`, and relevant Vercel deployment/verification
   skills, Feature 012 `.status`, `requirements.md`, `design.md`, `tasks.md`
   T4, `understanding.md`, this handoff, `sdd-brief.md`, and T1–T3 handoffs
   and browser evidence.
4. Inspect the dirty tree and preserve every unrelated change.

## Authority and Existing Project Identity

- Tracking owner: orchestrator task
  `019f914a-b672-77b1-837f-0c866b6421bb`.
- Gate: `implementation:in-progress`.
- T1–T3 are authoritatively complete.
- T4 is the sole unblocked frontier.
- Before build output or deployment mutation, append `execution/T4.md` and
  directly return stable event
  `sancussight-012-T4-acknowledged-20260724-01`.
- Deploy only to the existing canonical project:
  - project: `sancussight`
  - project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
  - team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
  - scope: `hflowers45-9370s-projects`
  - canonical URL: `https://sancussight.vercel.app`
- Fail closed before mutation on missing authentication, project/team
  ambiguity, manifest drift, lockfile mismatch, destructive replacement, or
  any request to change environment, domains, routes, cache, or configuration.
- Ready-for-review is a recommendation only. Do not edit shared tracking.

## Exact Scope

1. Reconcile authenticated Vercel identity read-only.
2. Capture a deterministic reviewed source/config manifest and the accepted
   `package-lock.json` SHA-256 before build.
3. Run the complete ordered local gate sequence below.
4. Build a fresh local production artifact and prove deterministic static
   output as appropriate.
5. Run `vercel build --prod --yes --scope hflowers45-9370s-projects`.
6. Recheck source/config and lockfile continuity after prebuild. Require exact
   equality between local and Vercel prebuilt static manifests.
7. Deploy only that prebuilt artifact with
   `vercel deploy --prebuilt --prod --yes --scope
   hflowers45-9370s-projects`.
8. Require exact project/team identity, target production, state `READY`,
   canonical alias assigned with no alias error, and immutable URL.
9. Prove canonical hosted static files match the reviewed prebuilt artifact
   byte-for-byte.
10. In installed Google Chrome against the canonical URL, verify the safe
    hosted subset:
    - Header compact source truth and no competing save action;
    - demo/snapshot no canonical-write action;
    - one selected Passport strip only when the loaded source legitimately
      supports it, without fabricating native-file authority;
    - six native disclosures, approved defaults, keyboard/focus/marker,
      content ownership, rerender stability, changed-asset reset;
    - selected-row association, narrow entry/Back focus, 320 CSS px,
      effective 200%, zero page overflow, one responsive DOM;
    - exact one-link canonical footer and route behavior;
    - clean console/page errors, only expected canonical-origin static
      requests, and no scoped Vercel runtime errors.

Do not automate a real user file write on the public host. Do not claim hosted
native-file permission or canonical write evidence; T3 owns that local proof.

## Owned Surfaces

- Vercel prebuilt output and exact existing-project production deployment
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T4.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T4-handoff.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T4-hosted-report.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T4-hosted/`

No product, test, package, lockfile, requirements/design, shared tracking,
Vercel configuration/environment/domain/route/cache, commits/pushes,
providers/Pi, R1, or Spec 005/T16R5/T16/A-002 edits/actions.

## Local Verification Order

Run exactly:

```text
npm run test:feature012
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
```

Return exactly one stable terminal lifecycle event:
`sancussight-012-T4-ready-20260724-01`, or one stable blocked/conflict/failure
event. Include exact deployment identity, source/lock/static hashes, commands,
exit codes, hosted browser/static/runtime evidence, changed files, limitations,
affected contracts, and direct-delivery receipt. Do not begin R1.
