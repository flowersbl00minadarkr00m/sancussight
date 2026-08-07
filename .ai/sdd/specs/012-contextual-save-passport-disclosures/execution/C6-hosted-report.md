# Feature 012 C6 Config-Closure Corrected Production Deployment Report

> Hosted deployment and regression evidence only. This report does not
> complete C6 or open R3; authoritative reconciliation remains with the
> orchestrator.

## Deployment Identity

- CLI identity: `hflowers45-9370`
- Scope: `hflowers45-9370s-projects`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Deployment ID: `dpl_6csbgTQqFq4M7os7phnULkFe7tiQ`
- Target/state: `production` / `READY`
- Prebuilt: `true`
- Ready substate: `PROMOTED`
- Immutable URL:
  `https://sancussight-gxefk95d1-hflowers45-9370s-projects.vercel.app`
- Canonical alias: `https://sancussight.vercel.app`
- Alias result: `aliasAssigned: true`, `aliasError: null`

`vercel inspect` and the deployment API returned the exact required project,
team, target, state, prebuilt flag, ready substate, and alias. No project
configuration, environment, integration, domain, route, or cache mutation was
performed.

## Config Closure, Source, Lockfile, and Static Continuity

- The exact isolated C5 config probe passed for missing/extra inputs, the R2
  direct helper, a transitive helper, declared hashing, digest sensitivity,
  and scratch cleanup.
- The complete C5-reviewed build-input universe contained exactly 92
  source/config/package/lock/static entries discovered through the corrected
  verifier, including Vite-config dependency closure.
- The declared-input digest remained
  `982c9724122b05dff2094007ea6933ac6d57eee566c2783ae0621852d5903d9b`
  before the local gate, after the production prebuild, after deployment, and
  after hosted verification.
- The accepted `package-lock.json` SHA-256 remained
  `6a8310fc75e9c963769a7e6dc890df440731003ace2fe8100001d1eb7c32aaf9`.
- The C5-reviewed verifier and focused-test SHA-256 values remained
  `9a5962cd71bf49814774995c5e46edf98af315ade293044df900e3e50631019f`
  and
  `1dc2775e56ef777897c7f01124fa2073545501f3eb5dda1ca362b71d4839aa15`.
- `npm run verify:feature012-build-inputs` passed with 92 declared inputs, 77
  observed bundled project inputs, six output files, two byte-identical clean
  builds, and hostile outside-boundary `.resize` immunity.
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

## Installed-Chrome Hosted Continuity

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Origin: `https://sancussight.vercel.app`
- Matrix: 5 checks passed
- Console warnings/errors: 0
- Page errors: 0
- Requests: 18
- Foreign-origin requests: 0

Verified:

- The compact Header exposed truthful demo identity with no writable-source
  claim or competing Header save action.
- Demo and imported snapshot modes exposed no `Save to source` action and no
  `SourceWriteStrip`; the hosted run did not fabricate canonical-file
  authority.
- One selected Passport contained exactly six native disclosures. Summary
  started open and the five secondary sections started closed.
- Native keyboard opening, focus-visible state, marker visibility, Evidence
  and History content ownership, rerender continuity, and asset-change
  default reset passed.
- Selected-row/Passport association, narrow entry focus, Back focus
  restoration, one catalog DOM, and one Passport DOM passed.
- At 320 CSS pixels and effective 200%, the document had zero page-level
  horizontal overflow, one Passport, six disclosures, and bounded
  section-owned overflow.
- `#landing`, `#demo`, and unknown-route fallback passed.
- The footer contained exactly one canonical link with exact text and target.
- All browser traffic remained on the canonical origin.
- No C6-created Chrome process or temporary Feature 012 scratch directory
  remained after teardown.

## Exact Verification

| Order | Command | Exit | Result |
|---:|---|---:|---|
| 1 | `node .ai\sdd\specs\012-contextual-save-passport-disclosures\execution\C5-browser\config-closure-probe.mjs` | 0 | direct/transitive closure, hashing, digest sensitivity, cleanup passed |
| 2 | `npm run test:feature012` | 0 | 10/10 passed |
| 3 | `npm run test:feature011` | 0 | 31/31 passed |
| 4 | `npm run test:feature010` | 0 | 31/31 passed |
| 5 | `npm run test:feature009` | 0 | 24/24 passed |
| 6 | `npm run test:feature008` | 0 | 6/6 passed |
| 7 | `npm run test:collector` | 0 | 92/92 passed |
| 8 | `npm run test:registry-compiler` | 0 | 28/28 passed |
| 9 | `npm run verify:core` | 0 | core assertions passed |
| 10 | `npm run build` | 0 | 1,846 modules; six production files |
| 11 | `npm run verify:feature012-build-inputs` | 0 | 92 declared; digest `982c…d9b`; 77 observed; deterministic/adversarial continuity passed |
| 12 | `git diff --check` | 0 | no whitespace errors; existing line-ending notices only |
| prebuild | `vercel build --prod --yes --scope hflowers45-9370s-projects` | 0 | exact production prebuild completed |
| continuity | local/prebuilt six-file manifest comparison | 0 | exact path/length/SHA-256 equality |
| deployment | `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects` | 0 | production `READY`; canonical alias assigned |
| identity | immutable deployment inspect/API | 0 | exact prebuilt project/team/target/state/alias |
| bytes | canonical six-file byte verification | 0 | 6/6 HTTP 200 and exact bytes |
| browser | C6 installed-Chrome hosted matrix | 0 | 5 checks; no console/page/foreign-request issues |
| runtime | scoped `vercel logs --level error --since 10m` | 0 | no runtime error records |
| build | scoped `vercel inspect --logs` | 0 | prebuilt output used; deployment completed `Ready` |
| final continuity | final 92-input/digest/lock comparison | 0 | no drift |

The existing Vite large-chunk advisory is non-failing and unchanged. The
initial supplemental trailing-whitespace scan incorrectly treated binary
PNG/WebP evidence as text and exited 1; the corrected text-only scan passed
over all 12 text evidence files. No implementation, package, build, or
deployment byte was involved in that evidence-harness correction.

## Scope and Limitations

- No public-host file write or operating-system file chooser was automated or
  claimed. Local connected-file write, permission, preflight, verified write,
  failure, and recovery continuity remains established by C5.
- No product, test, verifier, package, lockfile, shared tracking,
  configuration, environment, integration, domain, route, cache, R3,
  Feature 013+, provider/Pi, commit/push, or
  Spec 005/T16R5/T16/A-002 surface changed.
- The canonical project registry was refreshed through its deterministic
  manager after deployment, as required by project instructions.

## Verdict

PASS. The exact C5-reviewed config-closure corrected prebuilt artifact is live
on the exact existing canonical SancusSight production project. Complete
declared-input/digest/lock/static continuity, production identity, `READY`,
canonical alias, hosted bytes, installed-Chrome behavior,
canonical-origin-only traffic, scoped runtime/build errors, and teardown all
pass.
