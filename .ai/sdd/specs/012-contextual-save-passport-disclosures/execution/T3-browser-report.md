# Feature 012 T3 Local Installed-Chrome Report

> Browser acceptance evidence only. The disposable registry and all controlled
> permission/conflict/failure states are synthetic test fixtures, not
> production data or external verification.

## Runtime

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Automation: bundled Playwright library driving the installed Chrome binary
- Origin: `http://127.0.0.1:4182`
- Server: fresh `npm run build` output through local Vite preview
- Fixture: a disposable origin-private native `FileSystemFileHandle`, populated
  from the application's exported demo registry after changing only provenance
  to `local`
- Console: 0 warnings/errors
- Page errors: 0
- Network: 75 requests, all same-origin loopback
- T3 preview listener after teardown: none
- T3 Playwright Chrome process after teardown: none; older unrelated
  Playwright profiles were inspected and preserved

## Source Truth and Deliberate Write

Installed Chrome verified:

- compact Header identity `feature012-t3-1.json`;
- textual `Current` / `Unsaved changes` synchronization truth;
- last-read freshness and read/write permission text;
- zero Header `Save to source` actions;
- exactly one selected-Passport write strip while dirty;
- `current -> Record review today -> unsaved -> cancel -> confirm -> verified
  saved`;
- the written fixture bytes contained the selected asset's
  `lastReviewed: 2026-07-24`;
- verified-save feedback cleared on the subsequent version-recording mutation;
- the same save path persisted the new version;
- no demo or snapshot `Save to source` action or write strip.

The browser dialog was accepted or dismissed through the real UI event. The
application retained its existing `window.confirm` and sole
`sourceController.save(session)` path.

## Permission, Failure, Conflict, and Recovery

- Permission denied:
  - Header reported `Write: denied`;
  - the strip retained `Unsaved changes`;
  - feedback stated `Write permission was not granted.`;
  - no success was claimed;
  - changing the disposable handle permission to granted and invoking the same
    save action produced a verified save.
- Write failure:
  - the fixture's native writer was made to throw a bounded access error;
  - the strip retained `Unsaved changes`;
  - feedback stated that browser source access was blocked and recovery was
    required;
  - restoring the writer and invoking the same save action produced a verified
    save.
- Preflight conflict:
  - the disposable canonical bytes were externally changed after the browser
    working copy became dirty;
  - save preflight produced `Unsaved changes — Conflict`;
  - zero `Save to source` action remained while conflicted;
  - the existing ConflictPanel appeared;
  - `Reload source` with confirmation restored `Current` truth.

No product or test correction was required. The pre-PASS attempts failed only
at T3 harness selectors/assertions and are retained in
`T3-browser/browser-matrix-failure.json`; no attempt established an approved
product failure.

## Passport Disclosures and Focus

- Exactly six native `details.detail-section` nodes existed once:
  Summary, Portability, Dependencies, Evidence, Decisions, History.
- Initial open states were exactly:
  `[true, false, false, false, false, false]`.
- Keyboard Enter opened Portability.
- The focused summary matched `:focus-visible`.
- Computed native marker evidence:
  `display: list-item`, `list-style-type: disclosure-open`,
  `::marker content: normal`.
- Evidence retained `Evidence bindings`.
- History retained `Record current version`; after using it, the Evidence
  Packet control became visible.
- Evidence and History stayed open through review/save/version feedback
  rerenders.
- Selecting a different asset reset defaults to
  `[true, false, false, false, false, false]`.

## Selection, Narrow Flow, Routes, and Footer

- Selected catalog row and Passport heading matched.
- At 320 CSS px, selecting the row hid the catalog, revealed the sole Passport,
  and focused `#asset-passport-heading`.
- `Back to assets` restored focus to the selected row and preserved
  `aria-current="true"`.
- One catalog DOM and one Passport DOM existed.
- `#landing`, `#demo`, and unknown-route fallback all resolved.
- Footer had exactly one child/anchor with exact text
  `https://sancussight.vercel.app` and resolved href
  `https://sancussight.vercel.app/`.

## Responsive and Effective 200%

With viewport `320×900`, device scale factor approximately `2`, and reduced
motion:

```json
{
  "innerWidth": 320,
  "devicePixelRatio": 2.0000000298023224,
  "clientWidth": 305,
  "scrollWidth": 305,
  "pageOverflow": 0,
  "passports": 1,
  "strips": 1,
  "disclosures": 6,
  "sectionContentClientWidth": 246,
  "sectionContentScrollWidth": 246,
  "reducedMotion": true
}
```

Every disclosure content owner remained bounded (`scrollWidth >= clientWidth`
and both positive) without page-level overflow.

## Artifacts

- `T3-browser/browser-matrix.mjs`
- `T3-browser/browser-matrix-results.json`
- `T3-browser/browser-matrix-failure.json`
- `T3-browser/disposable-registry-fixture.json`
- `T3-browser/primary-narrow.png`
- `T3-browser/effective-200.png`

## Limitations

- The fixture uses a native origin-private file handle instead of automating
  Chrome's operating-system file-picker dialog. This keeps source writes
  disposable while exercising the production BrowserFileConnector methods,
  IndexedDB handle persistence, App confirmation, SourceController
  permission/preflight/write/post-write verification, and recovery paths.
- Permission, failure, and external-change inputs are controlled synthetic
  fixture states. Product reactions and recovery are observed in the installed
  browser; the states do not claim real operating-system failure evidence.
- No hosted URL, deployment, provider, Pi, or Spec 005 surface was accessed.

## Browser Verdict

PASS. All 11 integrated installed-Chrome checks passed. No T1–T2 product/test
correction was retained.
