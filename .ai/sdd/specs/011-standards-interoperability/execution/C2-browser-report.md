# Feature 011 C2 Installed-Chrome Browser Regression Report

## Scope and Outcome

- Scope: all four R1 findings, C1 corrections, and fix-caused regressions only.
- Browser: installed Google Chrome `150.0.7871.129`.
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Fresh local artifact: `npm run build`, then Vite preview on
  `http://127.0.0.1:4175`.
- Synthetic-fixture qualification: every C2 input was explicitly synthetic
  and is not production evidence.
- Result: **PASS — 13/13 browser criteria**.
- Bounded product/test correction required: **No**.

## R1 Finding Regression Evidence

### R1-SPEC-001 — official facet containers

- `truth_label: verified`; source:
  `C2-browser/browser-matrix-results.json` — one otherwise valid pinned
  OpenLineage RunEvent carrying run/job base `facets`, input base `facets`,
  `inputFacets`, output base `facets`, and `outputFacets` was accepted.
- Observed result: `1 accepted, 0 rejected, 6 omitted`.
- Exact stable omission counts:
  - `input-dataset-facets-omitted`: 2
  - `job-facets-omitted`: 1
  - `output-dataset-facets-omitted`: 2
  - `run-facets-omitted`: 1

### Facet privacy boundary

- `truth_label: verified`; source:
  `C2-browser/browser-matrix-results.json` — six unique hostile sentinels,
  one in every facet container, were absent from:
  - the current returned/surfaced preview;
  - the complete DOM;
  - all retained safe hashes;
  - 352 browser-observed SHA-256 preimages;
  - browser console/log messages; and
  - every inspected Feature 011 IndexedDB record.
- Seven retained hashes matched the exact raw 64-lowercase-hex store contract.

### R1-SPEC-002 — concurrent equivalent imports

- `truth_label: verified`; source:
  `C2-browser/browser-matrix-results.json` — an actual IndexedDB read/write
  transaction held Feature 011 persistence pending while two equivalent file
  input changes were dispatched.
- While persistence was blocked, no Feature 011 `add` occurred.
- After release, browser instrumentation observed exactly one Feature 011
  IndexedDB `add`, exactly one persisted snapshot, and deterministic
  invocation-order outcomes: `recorded`, then `deduplicated`.

### R1-STANDARDS-002 — invalid persisted-record honesty

- `truth_label: verified`; source:
  `C2-browser/browser-matrix-results.json` — one invalid record was injected
  directly into the dedicated Feature 011 `previews` store.
- After reload and explicit workspace reopen:
  - history reported unavailable;
  - healthy empty-history copy was absent;
  - Clear was disabled because safe validation was unavailable;
  - a new valid import remained usable as the current in-memory result; and
  - unrelated `sancussight-check-history`, `sancussight-evidence`, and
    `sancussight-governance` databases remained byte-for-byte structurally
    unchanged through the browser snapshot comparison.

### R1-STANDARDS-001 — effective-200 evidence scope

- `truth_label: verified`; source:
  `C2-browser/effective-200-percent.png` and
  `C2-browser/browser-matrix-results.json` — after applying effective-200
  device metrics and reloading, the harness explicitly reopened
  Advanced -> Evidence Sources before measuring.
- Observed metrics:
  - active heading: `Standards Interoperability`
  - viewport: 320 CSS px
  - device pixel ratio: 2
  - document scroll/client width: 320/320
  - page overflow: 0
  - workspace count: 1
  - rail count: 1
  - table scroll/client width: 736/258
  - bounded internal table overflow: 478 px
- Visual inspection confirms the capture shows the Feature 011 workspace,
  not Asset Catalog.

## Preserved Regression Behavior

- Workspace entry focus lands on `Standards Interoperability`.
- Advanced and Evidence Sources navigation plus telemetry refresh operate by
  keyboard.
- Empty telemetry alignment remains explicit with `missing` and
  `omitted-private` states.
- A valid synthetic Evidence Packet produces a canonical local unsigned
  Statement whose predicate remains `unsigned: true` and
  `externallyVerified: false`.
- Profile isolation and retention remain exactly 20 snapshots for each of the
  four pinned profiles, 80 total.
- Feature 011 clear removes only its own history and returns focus to the
  workspace heading.
- At 320 CSS px, the document has zero page overflow, one workspace, one rail,
  and internally bounded table overflow.
- IndexedDB-unavailable mode preserves the current sanitized preview.
- Console warnings/errors: 0.
- Page errors: 0.
- Network: 16 observed requests, all to the local preview origin; no
  third-party or non-loopback request.

## Browser Artifacts

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `browser-matrix.mjs` | 30,466 | `f7f5df03b9417adc7748d8ed26452cc127674c933686d568e79a11a7c865808c` |
| `browser-matrix-results.json` | 4,745 | `927a09e35f2110281ccbcb617720bc74999882a18dd200197037bba5a9b35197` |
| `effective-200-percent.png` | 204,557 | `184158d9296266eaed1dad3680c008eebab8c04a69eef6efe8eb7358ae2a226f` |
| `indexeddb-unavailable-current-preview.png` | 331,915 | `decc51284d95e14dcc42771365f0a19d87e6c7ac2395f7830008060aa0996522` |
| `narrow-320-standards-workspace.png` | 205,645 | `2122fd3dbd5ec935e24a22e96edb4ea1adf8e664bebb65c0ffffa87b645b20a4` |
| `sancussight-unsigned-statement-0419d4b5b061.json` | 575 | `0419d4b5b0610a02cf3217aa54293ddd1aea112ec6f111185c5d16f2ec1171e7` |

## Browser Command

```text
Command: node .ai/sdd/specs/011-standards-interoperability/execution/C2-browser/browser-matrix.mjs
Exit code: 0
Output summary: 13 browser criteria passed; 0 failed.
Errors: none
Verdict: PASS
```
