# Feature 010 T6 Hosted Verification Report

> Truth class: `supporting-evidence`
> Authority effect: none
> Outcome: hosted acceptance passed; ready-for-review recommendation prepared

## Deployment Identity

- project: `sancussight`
- project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- scope: `hflowers45-9370s-projects`
- deployment ID: `dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V`
- target/state/substate: `production` / `READY` / `PROMOTED`
- prebuilt: `true`
- immutable URL:
  `https://sancussight-7vnb0dj0e-hflowers45-9370s-projects.vercel.app`
- canonical alias: `https://sancussight.vercel.app`
- alias assigned/error: `true` / `null`

Scoped immutable and canonical `vercel inspect` calls resolve the same
deployment. The immutable deployment domain is protected for unauthenticated
HTTP content access, so byte-continuity was established through the public
canonical production alias. No project, domain, environment, integration,
route, cache, or analytics configuration was created or changed.

## Manifest Continuity

- git base: `1a62a3c7fd33cf332e59986b9c996a14dd1f16b6`
- accepted package-lock SHA-256:
  `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`
- reviewed 190-file source/config manifest:
  `5167B6E4FE8D2AEDE05CD2967F919755843ED01A9E7582546AE04430241B0E57`
- local `dist` manifest:
  `EFF3941141DAA58E8035F01FED38A19FBB272BC303DD7A070458AE515EC845A0`
- Vercel prebuilt static manifest:
  `EFF3941141DAA58E8035F01FED38A19FBB272BC303DD7A070458AE515EC845A0`
- canonical hosted static manifest:
  `EFF3941141DAA58E8035F01FED38A19FBB272BC303DD7A070458AE515EC845A0`
- static shape: `5` files / `632,905` bytes

All five canonical hosted files returned HTTP 200 and matched their
corresponding `dist` bytes exactly. Source, lockfile, local static, and
prebuilt static manifests remained unchanged after deployment and browser
acceptance.

## Hosted Real-Chromium Acceptance

Fresh headed Chromium contexts used built-in synthetic demo data. Comparison
coverage used the existing T5 fixture and is explicitly labeled:
`Fixture-assisted hosted state — simulated comparison, not production data`.

| Scenario | Observation | Verdict |
|---|---|---|
| No recorded history | `Voice & context pack` displayed `No recorded versions` and zero version rows | PASS |
| First explicit record | One current recorded version appeared with `No previous version recorded` | PASS |
| Equivalent dedupe | A repeated record retained one row and reported the exact dedupe notice | PASS |
| Alias truth boundary | `Preferred` was added and removed; UI stated aliases are labels only and facts were unchanged | PASS |
| Fixture-assisted comparison | Textual regression, recovery, changed, and unchanged items rendered with previous/current values and bases | PASS |
| Asset packet download | Suggested filename `sancussight-evidence-packet-asset-version-d8058f7ec430.json`; local Blob download succeeded | PASS |
| Exit Drill packet download | Suggested filename `sancussight-evidence-packet-exit-drill-300d36afa705.json`; UI stated no persistence, execution, or provider request | PASS |
| Packet integrity/privacy | Both files were canonical JSON; packet digests, exact keys, subject/predicate hashes, and filenames matched; zero privacy issues | PASS |
| Narrow one-DOM behavior | At 320px only Passport or catalog was visible; focus entered the Passport heading and Back restored the originating asset button | PASS |
| 320px / effective 200% | Client and scroll widths were both 305; page overflow false; visual viewport scale 2; narrow layout retained | PASS |
| Routes | Home, Assets, Exit Drills, Attention, and Evidence Sources rendered usable content and correct active state | PASS |
| Footer | Exactly one link/text: `https://sancussight.vercel.app`; no personal name | PASS |
| Console/runtime | Zero browser errors, warnings, or page errors; scoped Vercel error query returned no entries | PASS |
| Network/history/analytics | Two independent request captures contained 11 and 12 successful canonical-origin static GETs only; zero non-GET, external, analytics, or Feature 010 requests | PASS |

The deployment API reports a prebuilt static artifact with no runtime
functions. Combined with same-origin GET-only browser traffic, the hosted use
created no server-side version history, packet storage, analytics event, or
third-party request.

## Captured Evidence

- `01-hosted-no-history.png`
- `02-hosted-fixture-comparison.png`
- `03-hosted-narrow-zoom200.png`
- `asset-version-evidence-packet.json`
- `exit-drill-evidence-packet.json`
- `verify-hosted-static.mjs`
- `validate-hosted-packets.mjs`
- Playwright CLI bounded acceptance/inspection scripts in `T6-hosted/`

The screenshots were visually inspected: no-history, fixture comparison, and
narrow/zoom states are legible; identifiers wrap; the canonical footer is
present; and no page-level clipping or horizontal overflow is visible.

## Harness Notes

- One beta `vercel api GET ...` syntax attempt exited 1; the documented
  path-first read-only form then returned the required deployment metadata.
- `playwright-cli network` was unsupported in the installed CLI; the correct
  `requests --static` command then captured every request.
- Two exploratory all-in-one browser runs stopped at the snapshot-import
  confirmation boundary. The confirmation was handled without product
  mutation, and fresh bounded phase runs produced the passing evidence above.

These were harness corrections, not product, deployment, or acceptance
failures. No product/package/lockfile correction was made.

## Outcome

Hosted verification: PASS. T6 is suitable for tracking-owner review; this
report is not authoritative task completion.
