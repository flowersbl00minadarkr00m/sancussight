# Feature 012 T4 Hosted Production Report

> Hosted deployment and acceptance evidence only. This report does not approve
> T4 or begin R1; authoritative completion remains with the orchestrator.

## Deployment Identity

- CLI identity: `hflowers45-9370`
- Scope: `hflowers45-9370s-projects`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Deployment ID: `dpl_8ULGGMT146hkWa1FZM48Vtwr6D2H`
- Target/state: `production` / `READY`
- Prebuilt: `true`
- Immutable URL:
  `https://sancussight-ketb3xapg-hflowers45-9370s-projects.vercel.app`
- Canonical alias: `https://sancussight.vercel.app`
- Alias result: `aliasAssigned: true`, `aliasError: null`
- Deployment API and `vercel inspect` both returned the exact project and team
  identity. No configuration, environment, domain, route, or cache mutation
  was performed.

## Source, Lockfile, and Static Continuity

- Source/config manifest scope: 267 build, test, verification, public-static,
  package/lock, and linked non-secret Vercel identity files. Generated outputs
  and SDD evidence are excluded.
- Source/config manifest SHA-256 before local gates:
  `321061a4db05c48a3dd1ef295d3238bffc06557975d956ac95061e39908a29ba`.
- The same manifest hash remained exact after both local builds and after
  `vercel build`.
- Accepted `package-lock.json` SHA-256:
  `6a8310fc75e9c963769a7e6dc890df440731003ace2fe8100001d1eb7c32aaf9`.
- Lockfile continuity remained exact before local build, after local build,
  after Vercel prebuild, and after deployment.
- Two fresh local production builds produced the same six paths, lengths, and
  SHA-256 values. Both deterministic manifest files hash to
  `f8f827411e98c1fb60a46731ade6e6a9feaff11e9faa69e0348800c63e71c3a5`.
- `.vercel/output/static` contained exactly the same six path/length/hash
  entries as local `dist`.
- Canonical hosted responses returned HTTP 200 and exact reviewed bytes for
  all six paths.

| Static path | Bytes | SHA-256 |
|---|---:|---|
| `assets/index-_Qn1zbwW.css` | 91,547 | `b3890bbadb199ea54b749dd3469039258e0c0feabac534e94e5c69b898805501` |
| `assets/index-BsHztiR0.js` | 542,835 | `42796402a1f7188e0ce31a67defd557b3ecf4c2c28733cf7055d8e7cc97280a0` |
| `favicon.svg` | 431 | `bbd7664a0111e68094a9cf509723997371e766f3fdf309720a08ba2846bc1cae` |
| `index.html` | 679 | `47d13af34853228bbab4778d00868290ce44e0a27fe40f6227c9fac315ac45be` |
| `sancussight-workspace.webp` | 53,752 | `e8818055220bc0cbef4d56e8dd741d061525cd231287da8fb1eec786846d47c1` |
| `spec/evidence-packet-interoperability-v1.schema.json` | 1,815 | `66aa76bab844de8bac860b4dad412d1ce83c5472ff760ffca0ef052ce8ccc773` |

## Installed-Chrome Hosted Acceptance

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Origin: `https://sancussight.vercel.app`
- Final matrix: 5 hosted checks passed
- Console warnings/errors: 0
- Page errors: 0
- Requests: 18
- Foreign-origin requests: 0

Verified:

- Header presented compact truthful demo identity (`Demo data`,
  `Synthetic workspace`) with no competing save action and no writable-source
  claim.
- Demo and imported snapshot presented no `Save to source` action and no
  `SourceWriteStrip`.
- No native file handle was fabricated. The hosted run did not automate or
  claim a public-host canonical write.
- One selected Passport contained exactly six native disclosures. Summary
  started open and the five secondary sections started closed.
- Keyboard opening, focus-visible state, native marker, Evidence ownership,
  History ownership, current-asset rerender continuity, and changed-asset
  default reset passed.
- Selected-row/Passport association, narrow entry focus, Back focus
  restoration, one catalog DOM, and one Passport DOM passed.
- At 320 CSS px and effective 200%, document client/scroll widths were
  320/320, page overflow was zero, one Passport and six disclosures existed,
  and reduced motion was active.
- `#landing`, `#demo`, and unknown hash-route fallback passed.
- Footer contained exactly one canonical link with exact text and target.
- `vercel logs <immutable-url> --since 10m --level error --json` returned exit
  0 with no scoped runtime error records.

## Exact Verification Commands

| Command | Exit | Result |
|---|---:|---|
| `npm run test:feature012` | 0 | 7 passed |
| `npm run test:feature011` | 0 | 31 passed |
| `npm run test:feature010` | 0 | 31 passed |
| `npm run test:feature009` | 0 | 24 passed |
| `npm run test:feature008` | 0 | 6 passed |
| `npm run test:collector` | 0 | 92 passed |
| `npm run test:registry-compiler` | 0 | 28 passed |
| `npm run verify:core` | 0 | core assertions passed |
| `npm run build` | 0 | 1,846 modules; production bundle passed |
| `git diff --check` | 0 | no whitespace errors; existing LF/CRLF notices only |
| second `npm run build` | 0 | byte-identical production bundle |
| `vercel build --prod --yes --scope hflowers45-9370s-projects` | 0 | production prebuild succeeded |
| `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects` | 0 | exact prebuilt production deployment `READY`; canonical alias assigned |
| `vercel inspect sancussight-ketb3xapg-hflowers45-9370s-projects.vercel.app --scope hflowers45-9370s-projects` | 0 | exact deployment/project/target/alias |
| `vercel api /v13/deployments/dpl_8ULGGMT146hkWa1FZM48Vtwr6D2H --scope hflowers45-9370s-projects --raw` | 0 | exact project/team, prebuilt, production, READY, promoted, no alias error |
| canonical six-file `curl.exe --fail` byte verification | 0 | 6/6 HTTP 200 and exact path/length/SHA-256 |
| `node .ai\sdd\specs\012-contextual-save-passport-disclosures\execution\T4-hosted\hosted-browser-matrix.mjs` | 0 | 5 checks passed; 0 console/page/foreign-request issues |
| `vercel logs sancussight-ketb3xapg-hflowers45-9370s-projects.vercel.app --since 10m --level error --json --scope hflowers45-9370s-projects` | 0 | no runtime error records |

## Harness Corrections and Limitations

- The first hosted browser attempt used a connected-source permission-text
  expectation for demo mode. The harness was corrected to assert the approved
  demo truth (`Demo data`, `Synthetic workspace`, no writable claim); product
  bytes were unchanged.
- The first hosted byte helper failed before downloading because Windows
  PowerShell had not loaded `System.Net.Http`. Its empty provisional output was
  overwritten. The strict `curl.exe --fail` rerun required all six downloads
  and exact matches.
- The retained `hosted-browser-failure.json` records the pre-PASS harness
  assertion. It is not a product failure.
- Connected native-file permission, preflight, write, post-write
  verification, failure, and recovery remain T3 local evidence. T4 deliberately
  did not automate a real public-host file write.

## Verdict

PASS. The exact reviewed prebuilt artifact is live on the existing canonical
SancusSight production project, identity/alias/state are exact, all static
bytes match, and the safe hosted installed-Chrome/runtime subset passes.

