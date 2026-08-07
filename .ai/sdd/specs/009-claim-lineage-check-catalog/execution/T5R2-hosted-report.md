# Feature 009 T5R2 Hosted Verification Report

> Truth class: `supporting-evidence`
> Authority effect: none
> Outcome: hosted acceptance passed; ready-for-review recommendation delivered

## Deployment Identity

- Project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Scope: `hflowers45-9370s-projects`
- Deployment ID: `dpl_96UapZ28MvQMrBmk63NyM8mZUN86`
- Target/state: `production` / `READY`
- Prebuilt/promoted: `true` / `PROMOTED`
- Immutable URL:
  `https://sancussight-r55wc94sa-hflowers45-9370s-projects.vercel.app`
- Canonical alias: `https://sancussight.vercel.app`
- Alias assignment: `true`
- Alias error: `null`

The canonical alias and immutable URL both resolve to the deployment above.
No project, domain, environment variable, integration, route, or cache
configuration was created or changed.

## Manifest Continuity

- Git base: `1a62a3c7fd33cf332e59986b9c996a14dd1f16b6`
- Accepted lockfile SHA-256:
  `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`
- Reviewed 182-file source manifest:
  `7E0D9ADAF8D2CC2D962A9D6B4F56A070675D5C576249D8AC4F7DCCE7E51585B5`
- Local `dist` manifest:
  `62ED7296141CE1BB8F365C9E84465405E1F6F22F7454320F80A1D71FE994CCC3`
- Vercel prebuilt static manifest:
  `62ED7296141CE1BB8F365C9E84465405E1F6F22F7454320F80A1D71FE994CCC3`
- Canonical hosted static manifest:
  `62ED7296141CE1BB8F365C9E84465405E1F6F22F7454320F80A1D71FE994CCC3`
- Static shape: 5 files / 591,598 bytes

Every canonical hosted static file returned HTTP 200 and matched its local
`dist` file byte-for-byte. Source, lockfile, local static, and prebuilt static
manifests remained unchanged after deployment.

## Real-Chromium Acceptance

Fresh headed Chromium contexts used only built-in demo data and existing
Feature 009 synthetic fixtures.

- Searchable definition-only detail: PASS
- Non-passing exact rule/remediation/invalidation: PASS
- Asset Passport -> exact check -> Asset Passport: PASS
- Explicit no-previous result: PASS
- Explicit uncataloged observation with no invented contract: PASS
- Textual verified/missing/inferred/stale/conflicting paths: PASS
- Adjacent desktop catalog/detail: PASS
- Narrow mutually exclusive DOM and heading/Back focus restoration: PASS
- 320 CSS-pixel no-overflow behavior: PASS
- Effective 200% zoom no-overflow behavior: PASS
- Exact history-unavailable notice with usable current result: PASS
- Exact canonical one-link footer with no personal name: PASS
- Console errors/warnings: 0 / 0 in both contexts
- Unexpected external or Feature 009 network requests: 0

Detailed measurements and structured observations are in
`execution/T5R2-hosted/browser-matrix.md`. Four screenshots and the bounded
Playwright CLI evidence scripts are stored beside it.

## Runtime Inspection

Command:
`vercel logs https://sancussight-r55wc94sa-hflowers45-9370s-projects.vercel.app --since 1h --level error --json --scope hflowers45-9370s-projects`

Exit code: 0

Output summary: the scoped query returned no runtime error entries. The
deployment API reports a prebuilt static deployment with no functions, state
`READY`, substate `PROMOTED`, and no alias error. No runtime error cluster is
attributable to this deployment.

## Boundary Confirmation

- No product or package file was corrected.
- No shared tracking file was edited.
- No project/domain/environment/integration/route/cache setting changed.
- No commit or push occurred.
- No provider, Pi, Spec 005, T16R5, T16, or A-002 action occurred.
- No broader release-readiness claim is made.

## Outcome

Hosted verification: PASS. T5R2 is suitable for tracking-owner review; this
report is not authoritative task completion.
