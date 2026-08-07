# Feature 012 C3 Corrected Production Deployment Report

> Hosted deployment and regression evidence only. This report does not
> complete C3 or open R2; authoritative reconciliation remains with the
> orchestrator.

## Deployment Identity

- CLI identity: `hflowers45-9370`
- Scope: `hflowers45-9370s-projects`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Deployment ID: `dpl_FEPZQPnJBA54eB26VNyWPTSzxDQn`
- Target/state: `production` / `READY`
- Prebuilt: `true`
- Ready substate: `PROMOTED`
- Immutable URL:
  `https://sancussight-ptwa40zrs-hflowers45-9370s-projects.vercel.app`
- Canonical alias: `https://sancussight.vercel.app`
- Alias result: `aliasAssigned: true`, `aliasError: null`

`vercel inspect` and the deployment API both returned the exact required
project, team, target, state, and alias. No project configuration,
environment, integration, domain, route, or cache mutation was performed.

## Source, Lockfile, and Static Continuity

- The C2-reviewed build-input universe contained exactly 92 source, config,
  package, lock, and public-static entries.
- The accepted `package-lock.json` SHA-256 was
  `6a8310fc75e9c963769a7e6dc890df440731003ace2fe8100001d1eb7c32aaf9`.
- The exact 92-entry path/length/SHA-256 manifest remained unchanged after
  the ordered local gate, after Vercel prebuild, and after deployment and
  hosted verification.
- `npm run verify:feature012-build-inputs` passed with 92 declared inputs,
  77 observed bundled project inputs, six output files, two byte-identical
  clean builds, and hostile outside-boundary `.resize` immunity.
- Local `dist` and `.vercel/output/static` matched exactly across all six
  paths, lengths, and SHA-256 values.
- The canonical host returned HTTP 200 and exact reviewed bytes for all six
  paths.

| Static path | Bytes | SHA-256 |
|---|---:|---|
| `assets/index-B4g-NqFS.css` | 86,088 | `0f60251975db19ed78d6849f0dfaf4484e7d403304b6745613b233b7983ee21a` |
| `assets/index-CyqhuywV.js` | 542,898 | `77bb8cfea9d21cbfb4960dce579b34ea1c2b81f72cb4b48fbec5a7ecb08d89b1` |
| `favicon.svg` | 431 | `bbd7664a0111e68094a9cf509723997371e766f3fdf309720a08ba2846bc1cae` |
| `index.html` | 679 | `b668f8f575f24e37d66a8a95f7ee943ddd8e38b961f19b02a271c0760f855f68` |
| `sancussight-workspace.webp` | 53,752 | `e8818055220bc0cbef4d56e8dd741d061525cd231287da8fb1eec786846d47c1` |
| `spec/evidence-packet-interoperability-v1.schema.json` | 1,815 | `66aa76bab844de8bac860b4dad412d1ce83c5472ff760ffca0ef052ce8ccc773` |

## Installed-Chrome Hosted Regression

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Origin: `https://sancussight.vercel.app`
- Final matrix: 5 checks passed
- Console warnings/errors: 0
- Page errors: 0
- Requests: 22
- Foreign-origin requests: 0

Verified:

- The compact Header truthfully exposed `Demo data` and
  `Synthetic workspace`, with no writable-source claim or competing Header
  save action.
- Demo and imported snapshot modes exposed no `Save to source` action and no
  `SourceWriteStrip`. The hosted run did not fabricate a canonical write.
- One selected Passport contained exactly six native disclosures. Summary
  started open and the five secondary sections started closed.
- Native keyboard opening, focus-visible state, marker visibility, Evidence
  and History content ownership, rerender continuity, and asset-change default
  reset passed.
- Selected-row/Passport association, narrow entry focus, Back focus
  restoration, one catalog DOM, and one Passport DOM passed.
- At 320 CSS pixels and effective 200%, the document had zero page-level
  horizontal overflow, one Passport, six disclosures, and bounded
  section-owned overflow.
- `#landing`, `#demo`, and unknown-route fallback passed.
- The footer contained exactly one canonical link with exact text and target.
- Scoped deployment runtime error logs returned no records.

## Exact Verification

| Command | Exit | Result |
|---|---:|---|
| `npm run test:feature012` | 0 | 9/9 passed |
| `npm run test:feature011` | 0 | 31/31 passed |
| `npm run test:feature010` | 0 | 31/31 passed |
| `npm run test:feature009` | 0 | 24/24 passed |
| `npm run test:feature008` | 0 | 6/6 passed |
| `npm run test:collector` | 0 | 92/92 passed |
| `npm run test:registry-compiler` | 0 | 28/28 passed |
| `npm run verify:core` | 0 | core assertions passed |
| `npm run build` | 0 | 1,846 modules; six production files |
| `npm run verify:feature012-build-inputs` | 0 | deterministic/adversarial continuity passed |
| `git diff --check` | 0 | no whitespace errors; existing line-ending notices only |
| `vercel build --prod --yes --scope hflowers45-9370s-projects` | 0 | exact production prebuild passed |
| local/prebuilt six-file comparison | 0 | exact path/length/SHA-256 equality |
| `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects` | 0 | production `READY`; canonical alias assigned |
| immutable deployment inspect/API | 0 | exact prebuilt project/team/target/state/alias |
| canonical six-file byte verification | 0 | 6/6 HTTP 200 and exact bytes |
| hosted installed-Chrome matrix and continuation | 0 | 5 checks; no console/page/foreign-request issues |
| scoped `vercel logs --level error --since 10m` | 0 | no runtime error records |
| final 92-input/lock comparison | 0 | no drift |

## Harness Correction and Limitations

The first two browser attempts completed the desktop demo/snapshot checks but
stopped on one C3-harness-only responsive assertion. The assertion queried a
nonexistent `.detail-section-content` class and therefore compared undefined
widths. A targeted read-only diagnostic established 320/320 document
client/scroll widths and zero page overflow. The harness was corrected to the
existing `.passport-section-content` selector and the approved contract:
section-owned internal overflow is allowed while page-level overflow is not.
The continuation completed the remaining responsive, route, console, page,
and network checks. No product, test, package, lock, or deployment bytes
changed.

The retained `hosted-browser-failure.json` is harness evidence, not a product
failure. No public-host file write or operating-system file chooser was
automated or claimed. Connected-file write, permission, preflight, verified
write, failure, and recovery evidence remains owned by C2/T3.

The final Playwright-owned headless Chrome root process did not exit
automatically. It was identified by its unique temporary profile, and only
that root process was stopped. The profile and all child processes were then
confirmed absent; unrelated user Chrome sessions were untouched.

## Verdict

PASS. The exact C2-reviewed corrected prebuilt artifact is live on the exact
existing canonical SancusSight production project. Source/lock/static
continuity, production identity, `READY`, canonical alias, hosted bytes,
installed-Chrome behavior, canonical-origin-only traffic, and scoped runtime
errors all pass.
