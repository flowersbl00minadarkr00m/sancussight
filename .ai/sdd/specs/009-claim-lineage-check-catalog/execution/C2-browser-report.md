# Feature 009 C2 Local Real-Chromium Report

> Findings-limited C2 evidence only. This report does not approve C2, open C3,
> or change authoritative tracking.

## Result

All mandated C2 findings and fix-caused regression checks passed in headed
Google Chrome against local Vite at `http://127.0.0.1:4176`. Production was
not used. Inputs were synthetic fixtures. No product or test correction was
retained.

## R1 Findings Matrix

| Scenario | Fresh browser observation | Result |
|---|---|---|
| Unrelated same-asset evidence | A selected deterministic result did not display the unrelated envelope sentinel, exact ID, or matching asset evidence binding. The unrelated stale/failing envelope induced neither stale nor conflict UI. | PASS |
| Exact accepted reference | The exact accepted envelope ID and source-qualified evidence node appeared in the bounded path; the stale source remained explicitly qualified as stale. The unrelated same-asset envelope remained absent. | PASS |
| Sibling result identity | One asset rendered independent chat and embeddings provider-fallback results with stable discriminators `asset-c2-siblings:dep-primary-cloud-chat` and `asset-c2-siblings:dep-primary-cloud-embeddings`. | PASS |
| Independent dedupe/history | Initial and identical-repeat counts stayed `1/1`. Changing only embeddings produced `1/2`; its current result was PASS with prior FAIL, while chat still said `No previous result recorded`. | PASS |
| Legacy isolation | A synthetic discriminator-less six-field row remained physically present, but the current chat result still had no previous result and did not display the legacy WARN row. | PASS |
| Seven-field privacy allowlist | Every current valid provider snapshot contained exactly `assetId`, `checkId`, `evaluatedAt`, `registryScopeHash`, `resultDiscriminator`, `safeEvidenceHash`, and `status`. No raw evidence/display copy/path/prompt/response/credential/preimage field appeared. | PASS |
| Two-observation conflict | The selected conflict lineage rendered two target-outgoing `CONFLICTING RELATIONSHIP` labels in stable exact-reference order. | PASS |

## Regression Matrix

- Current result, no-previous, and controlled history-unavailable states
  remained usable.
- Clear history produced the explicit success notice, removed all physical
  rows, and left current result UI usable.
- Asset Passport -> check detail -> Asset Passport preserved the selected
  sibling and focused `H2#asset-passport-heading`,
  `H2#check-detail-heading`, then `H2#asset-passport-heading`.
- Desktop list/detail bounding boxes were adjacent.
- At 320 CSS pixels, list and detail were mutually exclusive in the DOM.
- A current Attention result focused `H2#check-detail-heading`; Back restored
  the activating result button.
- A provider definition whose current passing result is outside Attention
  used the existing safe search fallback. This is recorded as non-blocking
  evidence and did not trigger a retained C2 product change.
- At 320 pixels and effective 200% page scale, document client and scroll
  widths both remained 305 pixels; no page overflow occurred.
- All inspected resource requests stayed on the local Vite origin.
- Three Chrome sessions reported zero console errors and zero warnings.

## Storage

- Database: `sancussight-check-history`
- Store: `snapshots`
- Current schema: fixed seven-field allowlist above
- Current provider rows inspected: 3 after one sibling changed
- Synthetic legacy rows inspected: 1, physically retained but filtered from
  current/previous reads
- Forbidden raw or sensitive fields: none
- Clear-history final row count: 0

## Screenshots

1. `C2-browser/01-lineage-matrix.png`
2. `C2-browser/02-sibling-results-initial.png`
3. `C2-browser/03-sibling-changed-history.png`
4. `C2-browser/04-narrow-zoom200.png`

Structured results are in `C2-browser/browser-observations.json`.

## Corrections

No C2 product or test correction is retained. Focus experiments were reverted
before final gates because no attempted variant had a fresh passing
reproduction and the approved current-result focus path already passed.

## Final Gates

| Command | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run test:collector` | 0 | 92/92 passed | PASS |
| `npm run test:registry-compiler` | 0 | 22/22 passed | PASS |
| `npm run verify:core` | 0 | Core deterministic assertions passed | PASS |
| `npm run build` | 0 | TypeScript passed; Vite transformed 1,835 modules | PASS |
| scoped `git diff --check` | 0 | C1-owned surfaces and C2 text evidence had no whitespace diagnostics | PASS |

## Limitations

- Fixtures and the component harness are synthetic and establish deterministic
  local UI/storage behavior, not external evidence truth.
- No production, deployment, Vercel, Spec 005, T16R5, T16, or A-002 action was
  performed.
