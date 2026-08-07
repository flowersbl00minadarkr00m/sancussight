# Feature 009 C3 Corrected Hosted Deployment Worker Prompt

Act as the one fresh visible top-level Feature 009 C3 deployment and hosted
verification worker in orchestrated-worker mode.

Canonical project: `C:\Users\henry\sancussight`.

Tracking owner and return task:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve the project through the canonical registry and fully read applicable
`AGENTS.md`, installed `sdd-exec`, Vercel CLI, and browser-verification
instructions, steering, Feature 009 authority artifacts, `review-r1.md`, C1
and C2 handoffs/reports, `understanding.md`, `sdd-brief.md`, and this prompt.

Confirm C2 is authoritatively complete and C3 is the sole unblocked frontier.
Before any build or deployment mutation, append `execution/C3.md` and directly
return:

`sancussight-009-C3-acknowledged-20260723-01`

Scope is only the existing canonical Vercel production project:

- project `sancussight`
- project ID `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team ID `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- scope `hflowers45-9370s-projects`
- canonical URL `https://sancussight.vercel.app`

First reconcile authentication, `.vercel/project.json`, current production,
the accepted root lockfile SHA-256
`6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`,
and a deterministic source/config manifest. Fail closed on credential failure,
project/team/scope/alias ambiguity, lockfile drift, or source mutation.

Run the required local gates in order:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
```

Then use explicit non-interactive scoped commands to build the reviewed
artifact for production, prove local `dist` and `.vercel/output/static`
manifests match, prove source/config and lockfile manifests did not change,
and deploy only that prebuilt artifact to the existing project:

```text
vercel build --prod --yes --scope hflowers45-9370s-projects
vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects
```

After READY production and error-free canonical alias reconciliation, run
hosted real-Chromium acceptance limited to R1-SPEC-001 through R1-SPEC-003,
their C1 fixes, and fix-caused regressions:

- unrelated same-asset evidence does not qualify a selected result;
- exact accepted references retain bounded truthful lineage;
- same-family sibling results expose distinct stable identities and remain
  usable without cross-stream history claims;
- both outgoing conflict relationship labels render;
- current result detail, Asset Passport round trip, desktop adjacency, narrow
  mutually exclusive DOM, focus entry/Back behavior, 320px/effective 200%
  overflow, footer, console, network, and runtime remain healthy.

Hosted inputs must be synthetic/demo-safe and must not persist or upload raw
evidence. Do not change project settings, environment variables, integrations,
domains, routes, cache policy, or providers.

Owned surfaces:

- read-only reviewed product/config source;
- Vercel prebuilt output and the existing canonical production deployment;
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/C3.md`;
- `execution/C3-handoff.md`;
- `execution/C3-hosted-report.md`;
- evidence under `execution/C3-hosted/`.

Do not retain product, test, package, dependency, shared-tracking, approved
requirements/design/review, prior-evidence, commit, or push changes. Do not
touch Spec 005/T16R5/T16/A-002, providers, Pi, or make a broader release claim.
If any product correction is required, fail closed and return it to the
tracking owner instead of editing.

Return exactly one terminal stable event:

- ready: `sancussight-009-C3-ready-20260723-01`
- blocked: `sancussight-009-C3-blocked-20260723-01`
- contract conflict:
  `sancussight-009-C3-contract-conflict-20260723-01`
- verification failed:
  `sancussight-009-C3-verification-failed-20260723-01`

Ready-for-review is only a recommendation. Include exact source/lock/static
hashes, deployment identity/state/alias, commands, hosted observations,
console/network/runtime evidence, files, limitations, and direct delivery
receipt. Do not mark C3 complete or open R2.
