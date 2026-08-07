# Feature 009 C3 Hosted Targeted Regression Report

> Supporting evidence only. This report does not complete C3, open R2, or
> claim broader release readiness.

## Outcome

The exact C1/C2-reviewed corrected artifact is `READY` in the existing
canonical Vercel production project. The canonical alias serves five static
files that are byte-identical to both the guarded local `dist` and the scoped
Vercel prebuild. Available hosted demo flows passed. Per tracking-owner
direction, the locked C2 real-Chromium semantic and narrow/200% matrix is used
as targeted R1-fix continuity evidence through exact artifact identity; it
was not recreated in production.

## Deployment Identity

- Project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Scope: `hflowers45-9370s-projects`
- Deployment ID: `dpl_ANzB5nVfioTixm5YYY8pqYQUpziK`
- Target/state/substate: `production` / `READY` / `PROMOTED`
- Prebuilt: `true`
- Immutable URL:
  `https://sancussight-p8sgi7wyn-hflowers45-9370s-projects.vercel.app`
- Canonical alias: `https://sancussight.vercel.app`
- Alias assigned/error: `true` / `null`

## Manifest Continuity

- Git base: `1a62a3c7fd33cf332e59986b9c996a14dd1f16b6`
- Corrected reviewed source:
  `7DFFB03B1F15B7FFFC2B57039EBD9CA83D7521A2079C83A9365918AC82992742`
  — 182 files / 1,198,311 bytes
- Accepted lockfile:
  `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`
- Local/prebuilt/canonical hosted static:
  `05506A631F3019D5B72F5BE88E5F66221D98A193FE889D7A4CBB5011AA5E02BC`
  — 5 files / 592,631 bytes

Every canonical hosted file returned HTTP 200 and matched its local `dist`
counterpart byte-for-byte. Source, lockfile, local output, and prebuilt output
retained these hashes after deployment.

## Hosted Demo Observations

- Canonical Finance analysis result detail showed the exact stable check ID,
  exact rule, remediation, invalidation, explicit no-previous state, stable
  result identity, and bounded lineage.
- Desktop list and detail regions were adjacent.
- Attention result -> Asset Passport -> the same check detail -> Asset
  Passport preserved the selected asset/check and focused, in order:
  `H2#asset-passport-heading`, `H2#check-detail-heading`,
  `H2#asset-passport-heading`.
- The footer contained one clickable canonical URL and no personal name.
- Browser console inspection returned zero errors and zero warnings.
- Canonical HTTP and byte checks covered all five deployed static resources.
- The scoped Vercel error-log query returned no runtime error entries. The
  deployment is static/prebuilt with no functions.

Structured observations:
`execution/C3-hosted/browser-observations.json`.

## Targeted R1-Fix Continuity

Tracking-owner direction explicitly timeboxed browser-control mechanics and
prohibited recreating the full C2 harness in production. The continuity claim
is therefore bounded to:

1. C2's locked passing real-Chromium matrix for exact/unrelated evidence,
   sibling identity/history/dedupe, seven-field storage, two conflict edges,
   focus, narrow mutually exclusive DOM, 320px/effective 200% overflow, and
   console/network behavior;
2. fresh C3 automated gates against the unchanged corrected source;
3. a fresh deterministic local production build;
4. exact equality between local `dist`, Vercel prebuilt static output, and
   every canonical hosted static file; and
5. the directly exercised hosted demo flows above.

This is supporting continuity evidence, not a claim that C2 was rerun on the
host.

## Verification

| Command or check | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run test:collector` | 0 | 92/92 passed | PASS |
| `npm run test:registry-compiler` | 0 | 22/22 passed | PASS |
| `npm run verify:core` | 0 | Core assertions passed | PASS |
| `npm run build` | 0 | TypeScript plus 1,835-module Vite build passed | PASS |
| deterministic second `npm run build` | 0 | Static manifest reproduced exactly | PASS |
| `git diff --check` | 0 | No whitespace diagnostics; line-ending warnings only | PASS |
| `vercel build --prod --yes --scope hflowers45-9370s-projects` | 0 | Exact scoped corrected prebuild produced | PASS |
| post-prebuild manifest guard | 0 | Source/lock unchanged; local/prebuilt static exact | PASS |
| `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects` | 0 | Deployment reached `READY` and canonical alias | PASS |
| immutable/canonical/project/API inspection | 0 | Exact IDs, target, prebuilt, `PROMOTED`, `aliasError: null` | PASS |
| canonical hosted byte comparison | 0 | 5/5 files, 592,631 bytes, exact match | PASS |
| hosted desktop detail and Passport round trip | N/A | All directly exercised observations passed | PASS |
| managed-browser console inspection | N/A | 0 errors / 0 warnings | PASS |
| `vercel logs <immutable> --since 1h --level error --json --scope ...` | 0 | No runtime error entries | PASS |

## Limitations

- Managed browser file chooser and viewport overrides did not support the
  intended fixture/narrow rerun. This is a tooling limitation, not observed
  product failure.
- The fresh managed-browser resource API did not expose an enumerable request
  list. Network evidence is the complete canonical static HTTP/byte check plus
  C2 continuity, not a new exhaustive browser trace.
- Inputs were built-in synthetic demo data only. No raw evidence was uploaded
  or persisted.
- No product/test/package/dependency/shared-tracking/project-setting/domain/
  environment/integration/route/cache/provider/Spec 005/T16R5/T16/A-002
  correction or action occurred.
