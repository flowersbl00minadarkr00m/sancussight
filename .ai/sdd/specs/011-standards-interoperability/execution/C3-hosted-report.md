# Feature 011 C3 Corrected Production Hosted Report

## Scope and Outcome

- Scope: all four R1 findings, C1/C2 corrections, and fix-caused regressions
  only.
- Deployment: `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`.
- Immutable URL:
  `https://sancussight-47zi3pez1-hflowers45-9370s-projects.vercel.app`.
- Canonical URL: `https://sancussight.vercel.app`.
- Existing project: `sancussight`
  (`prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`).
- Existing team: `team_Y7ueoZZnBOfX63cjuG9R9SYG`.
- Existing scope: `hflowers45-9370s-projects`.
- Target/state: `production` / `READY`.
- Canonical alias: assigned; `aliasError: null`.
- `PROMOTED` substate: not exposed by the available CLI or deployment API;
  production target plus canonical alias assignment was verified directly.
- Installed Chrome harness: PASS, 14/14.
- Canonical hosted static continuity: PASS, 6/6.
- Scoped Vercel runtime errors: none.
- Product/test/package/shared-tracking correction: none.

## Exact Artifact Continuity

- Git base:
  `1a62a3c7fd33cf332e59986b9c996a14dd1f16b6`.
- Accepted `package-lock.json`:
  46,337 bytes,
  SHA-256
  `6a8310fc75e9c963769a7e6dc890df440731003ace2fe8100001d1eb7c32aaf9`.
- `reviewed-source-manifest.json` was captured before the local gates and
  matched after the gates, Vercel prebuild, deployment, hosted browser run,
  and final reconciliation.
- `local-dist-manifest.json` and `prebuilt-static-manifest.json` are
  byte-identical and have SHA-256
  `69fb29ad9af6846bd3d064e3a18b555bf6d9d9843f3e355b9fac862e876ae396`.
- `.vercel/output/static` matched the local `dist` manifest exactly before
  deployment and during final reconciliation.
- All six canonical hosted static artifacts returned HTTP 200 with exact byte
  lengths and SHA-256 digests matching the locked local/prebuilt manifest.

## Required Local Gate Sequence

The exact required order passed:

1. `npm run test:feature011` — PASS, 29/29
2. `npm run test:feature010` — PASS, 31/31
3. `npm run test:feature009` — PASS, 24/24
4. `npm run test:feature008` — PASS, 6/6
5. `npm run test:collector` — PASS, 92/92
6. `npm run test:registry-compiler` — PASS, 28/28
7. `npm run verify:core` — PASS
8. `npm run build` — PASS, 1,845 modules
9. `git diff --check` — PASS

The Vite chunk-size advisory is pre-existing and non-failing.

## Findings-Limited Hosted Acceptance

All fixtures were explicitly synthetic and are not production evidence.

- Official run/job/base/input/output facet containers were accepted as one
  valid record with `1 accepted`, `0 rejected`, and `6 omitted`.
- Exact stable omissions:
  - `input-dataset-facets-omitted`: 2
  - `job-facets-omitted`: 1
  - `output-dataset-facets-omitted`: 2
  - `run-facets-omitted`: 1
- Six hostile facet sentinels were absent from the current preview, DOM, seven
  safe hashes, 352 observed SHA-256 preimages, console/logs, downloads, and
  every inspected Feature 011 IndexedDB record.
- Two equivalent imports overlapped pending IndexedDB persistence, produced
  one IndexedDB `add`, exactly one persisted snapshot, and deterministic
  `recorded` then `deduplicated` outcomes.
- One invalid persisted Feature 011 record yielded honest unavailable history;
  healthy empty-history copy was absent, the current valid preview remained
  usable, and unrelated check-history/evidence/governance stores remained
  unchanged.
- Keyboard controls, focus entry, empty telemetry alignment, profile
  isolation, 20-per-profile retention, isolated clear, and IndexedDB
  unavailable fallback passed.
- The unsigned Statement download used the official Statement v1 shape and
  retained `unsigned: true` and `externallyVerified: false`.
- At 320 CSS pixels: viewport 320, DPR 1, page overflow 0, one workspace, one
  rail, and internally bounded table metrics 736/258.
- At effective 200% after reload and explicit Advanced -> Evidence Sources
  reopen: viewport 320, DPR 2, page overflow 0, one workspace, one rail,
  active heading `Standards Interoperability`, and table metrics 736/258.
- Existing routes and the canonical one-link footer passed.
- Console warnings/errors: 0.
- Page errors: 0.
- Requests: 20, all to `https://sancussight.vercel.app`.

A supplementary live Chrome-extension pass directly opened the canonical
production page and confirmed focus in the Standards Interoperability
workspace. Its local file chooser lacked Chrome-extension file-URL permission,
so the complete mutation-heavy acceptance used the checked-in installed-Chrome
harness, which exercised the required synthetic file, IndexedDB, hash-preimage,
download, responsive, and console/network paths.

## Vercel Operational Evidence

- `vercel inspect ... --json` returned deployment
  `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`, target `production`, and
  `readyState: READY`.
- Deployment project identity is
  `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ` / `sancussight` / Vite.
- Canonical alias `sancussight.vercel.app` is assigned.
- Deployment API returned `aliasError: null`.
- Deployment-scoped Vercel runtime log query returned no error/fatal logs.
- Deployment build-log error query returned no error/stderr/exit events.

## Verification Commands

```text
npm run test:feature011
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
vercel inspect sancussight-47zi3pez1-hflowers45-9370s-projects.vercel.app --scope hflowers45-9370s-projects --json
node .ai/sdd/specs/011-standards-interoperability/execution/C3-hosted/hosted-static-verify.mjs
node .ai/sdd/specs/011-standards-interoperability/execution/C3-hosted/hosted-browser-matrix.mjs
```

All required commands exited 0. Connector runtime/build error queries returned
no errors.
