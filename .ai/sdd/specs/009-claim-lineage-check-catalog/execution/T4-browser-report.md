# Feature 009 T4 Actual-Browser Report

> Local acceptance evidence only. This report does not approve T4 or change
> authoritative tracking.

## Result

All approved T4 scenarios passed in a headed, locally installed Google Chrome
against the local Vite preview at `http://127.0.0.1:4174`. Production was not
used. No product correction was required.

The first automation pass exposed three harness assumptions rather than
product failures: rendered relationship labels were uppercased by CSS, a
definition with a current result was chosen for the definition-only check,
and keyboard zoom did not expose a measurable page scale to automation. The
focused pass compared text case-insensitively, selected
`candidate.bundle-readiness.v1`, and used Chrome DevTools Protocol page-scale
emulation. It also repeated narrow Back focus with the exact selected row.

## Setup

- Browser: installed Google Chrome, headed, controlled through Playwright CLI.
- App: fresh local `npm run build`, then local Vite preview only.
- Primary viewport: 1280 by 900 CSS pixels.
- Narrow viewport: 320 by 800 CSS pixels.
- Zoom acceptance: effective 320 CSS-pixel layout at
  `visualViewport.scale === 2`.
- Inputs: worker-owned synthetic registry and evidence fixtures containing no
  production or private data.
- Network boundary: loopback origin only.

## Scenario Matrix

| Scenario | Steps and selected element | Observation | Result |
|---|---|---|---|
| Definition search and definition-only detail | Open Attention, search `candidate.bundle-readiness.v1`, select the Candidate bundle readiness definition | Stable definition remains independently inspectable, reports `No result selected`, and says asset-specific lineage is not constructed | PASS |
| Non-passing result contract | Select Synthetic provider workflow and `portability.provider-fallback.v1` | Fail status, exact passing rule, remediation, invalidation, inspected references, and verified relationship are visible | PASS |
| Passport round trip | From the provider result select `Open Asset Passport`, then `Open check explanation`, then return with `Open Asset Passport` | Asset remains Synthetic provider workflow; exact check ID is preserved; `H2#asset-passport-heading` receives focus on both Passport entries | PASS |
| No previous, then changed result | Select Synthetic review target and review freshness, record review today, reopen detail | Initially `No previous result recorded`; changed current result is PASS and prior WARN metadata is visible with evaluation time and safe evidence hash | PASS |
| Identical repeat dedupe | Record the same review again, inspect the asset/check stream in IndexedDB | Stream count remains 2 before and after the identical repeat | PASS |
| Uncataloged observation | Select the uncataloged Synthetic lineage target observation | Explicit uncataloged state appears; no rule, relationship, remediation, or lineage is invented | PASS |
| Relationship states | Exercise provider, missing evidence, accepted risk, stale evidence, and conflicting accepted evidence fixtures | Verified, missing, inferred, stale, and conflicting relationship labels and qualifications are all textually visible | PASS |
| Desktop geometry | Inspect list/detail bounding boxes at 1280 by 900 | List x=20, width=377.7375; detail x=413.7375, width=511.0625; regions are adjacent | PASS |
| Narrow DOM and focus | At 320 by 800 select Candidate bundle readiness, then Back | Only list exists before selection; only detail exists after selection; focus enters `H2#check-detail-heading` and returns to the selected Candidate bundle readiness button | PASS |
| 320px overflow | Measure document and body widths | document client/scroll widths are both 305; no page overflow | PASS |
| 200% zoom | Apply CDP page scale 2 to the effective 320 CSS-pixel layout | `visualViewport.scale` is 2, layout is `narrow`, client/scroll widths remain 305, and no page overflow appears | PASS |
| History unavailable | Remove `indexedDB` before application load, select a cataloged current result | Exact notice says `Local history unavailable. The current result remains usable.`; Passport action remains enabled | PASS |
| Console and network | Read browser console and request log after the matrix | Both sessions have 0 errors and 0 warnings; all requests are local preview HTML, JS, CSS, or favicon; no unexpected external request | PASS |

## Focus Evidence

- Check detail entry: `H2#check-detail-heading`, text
  `Candidate bundle readiness`.
- Narrow Back target: selected definition `BUTTON`, text
  `Candidate bundle readiness / candidate.bundle-readiness.v1 / No current
  result`.
- Asset Passport entry and return: `H2#asset-passport-heading`, text
  `Synthetic provider workflow`.

## Storage Inspection

- Database: `sancussight-check-history`
- Version: `1`
- Object store: `snapshots`
- Key path: `null`
- Auto increment: `true`
- Observed key type: `number`
- Fixed record fields:
  - `assetId`
  - `checkId`
  - `evaluatedAt`
  - `registryScopeHash`
  - `safeEvidenceHash`
  - `status`
- No inspected record contained registry/evidence preimages or field names for
  finding, prompt, response, credential, path, scope preimage, or evidence
  preimage.

The changed Synthetic review target stream contained two distinct snapshots.
The identical repeated current result did not create a third record.

## Console and Network

Playwright console inspection returned `Total messages: 0 (Errors: 0,
Warnings: 0)` for both the primary and history-unavailable Chrome sessions.

The complete primary request log contained only:

- `GET http://127.0.0.1:4174/`
- local built JavaScript
- local built CSS
- local favicon requests

No Feature 009 request left the loopback preview origin.

## Screenshots

1. `T4-browser/01-definition-only.png`
2. `T4-browser/02-provider-result-desktop.png`
3. `T4-browser/03-no-previous-result.png`
4. `T4-browser/04-changed-result-previous.png`
5. `T4-browser/05-stale-lineage.png`
6. `T4-browser/06-conflicting-lineage.png`
7. `T4-browser/07-uncataloged-observation.png`
8. `T4-browser/08-narrow-320-zoom200.png`
9. `T4-browser/09-chromium-zoom-200.png`
10. `T4-browser/10-history-unavailable.png`

`09-chromium-zoom-200.png` is the authoritative scale-2 visual. The earlier
`08-narrow-320-zoom200.png` remains as append-only evidence of the initial
keyboard-zoom harness attempt.

## Corrections

No approved criterion failed after the focused harness checks. T4 therefore
made no product, test, package, dependency, provider, Pi, Spec 005, release,
deployment, commit, or push change.
