# Feature 011 C5 Installed-Chrome Browser Regression Report

## Scope and Outcome

- Scope: residual `R1-SPEC-002`, the C4 repository-wide atomic correction,
  and regressions caused by that correction.
- Browser: installed Google Chrome `150.0.7871.129`.
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Loopback origin: `http://127.0.0.1:4176`.
- Synthetic-fixture qualification: every C5 input was explicitly synthetic
  and is not production evidence.
- Result: **PASS — 13/13 browser criteria**.
- Bounded product/test correction required: **No**.

## Primary Two-Page IndexedDB Criterion

- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — two independently loaded pages
  on one loopback origin each imported the real
  `InteroperabilityPreviewStore` module, creating independent store/module
  contexts over the shared dedicated
  `sancussight-standards-interoperability-v1/previews` IndexedDB store.
- One held IndexedDB read-write transaction kept both equivalent record
  operations pending. The first page's operation was queued before the second
  page's operation, then the blocker was released.
- Returned outcomes were deterministically `recorded`, then `deduplicated`.
- Browser instrumentation observed exactly one Feature 011 IndexedDB `add`.
- Exactly one equivalent snapshot persisted.
- Both page/store contexts independently listed one snapshot and returned the
  same retained snapshot.
- Both results remained `availability: available`; serialized returned and
  retained atomic evidence contained no raw/private value or unavailable
  state.

## Preserved Bounded Matrix

- Official run/job/input/output facet containers remain accepted only as six
  wholesale omissions with the exact stable reason counts.
- Six hostile facet sentinels were absent from the DOM, current preview,
  seven retained hashes, 353 browser-observed SHA-256 preimages, console, and
  IndexedDB.
- A corrupt persisted record produced honest unavailable history, disabled
  unsafe clear, hid the hostile value, and preserved the current sanitized
  in-memory preview.
- Profile isolation retained exactly 20 snapshots for each of four profiles,
  80 total.
- Feature 011 clear removed only its dedicated history, preserved a synthetic
  unrelated IndexedDB control record, and restored focus to the workspace
  heading.
- Keyboard navigation entered the workspace and operated telemetry refresh.
  Empty alignment remained explicit with `missing` and `omitted-private`.
- The local Statement download retained the official Statement v1 `_type`,
  `unsigned: true`, and `externallyVerified: false`.
- At 320 CSS pixels, document overflow was zero with one workspace, one rail,
  and bounded internal table overflow.
- Effective-200 metrics were captured only after explicitly reopening
  Standards Interoperability: viewport 320, DPR 2, page overflow 0, one
  workspace, one rail, and table overflow 478 pixels.
- IndexedDB-unavailable mode preserved the current sanitized preview.
- Console warnings/errors: 0; page errors: 0.
- Network: 602 observed development-origin requests, all same-origin
  `http://127.0.0.1:4176`; no localhost alternative, third-party, or external
  request.

## Browser Artifacts

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `browser-matrix.mjs` | 29,372 | `899fd76af19565b6ee8227ed8633c7af4919c9b3ea479d9c9bfd44a2975cea88` |
| `browser-matrix-results.json` | 4,679 | `e1e5393fdcf09aa48b7272f68db2b99a3377a87a05ccc293fc319bdc4f495ab7` |
| `effective-200-percent.png` | 204,557 | `184158d9296266eaed1dad3680c008eebab8c04a69eef6efe8eb7358ae2a226f` |
| `indexeddb-unavailable-current-preview.png` | 331,915 | `129b52a9f50ad6ed6f45771ec460e4f71bf2adb6de43b4063d4c912144d8920d` |
| `narrow-320-standards-workspace.png` | 205,653 | `91e5ed96665b14ec16c80b7464a384dbbb31aaf2d1310d5ec1eb646cd1ae7a3c` |
| `sancussight-unsigned-statement-0419d4b5b061.json` | 575 | `0419d4b5b0610a02cf3217aa54293ddd1aea112ec6f111185c5d16f2ec1171e7` |

## Browser Verification

```text
Claim: C5 two-page atomic dedupe and preserved bounded browser matrix
Command: node .ai/sdd/specs/011-standards-interoperability/execution/C5-browser/browser-matrix.mjs
Exit code: 0
Output summary: 13 browser criteria passed; 0 failed.
Errors: none
Verdict: PASS
```
