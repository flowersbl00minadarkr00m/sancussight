# Feature 012 C5 Local Installed-Chrome Report

> Browser continuity evidence only. The disposable registry and controlled
> permission/conflict/failure states are synthetic fixtures, not production
> data or external verification. The operating-system file chooser was not
> automated or claimed.

## Runtime

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Origin: `http://127.0.0.1:4185`
- Artifact: fresh `npm run build` output served by local Vite preview
- Matrix:
  `node .ai\sdd\specs\012-contextual-save-passport-disclosures\execution\C5-browser\browser-matrix.mjs`
- Exit: `0`
- Result: 12/12 checks passed; console issues `0`; page errors `0`; requests
  `75`; foreign requests `0`

## Continuity Evidence

- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — compact Header source identity,
  freshness/sync, and read/write permission truth remained visible, with zero
  Header save actions and one contextual selected-Passport write strip when
  dirty.
- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — cancellation, verified save,
  synthetic permission denial/recovery, synthetic bounded write
  failure/recovery, and synthetic preflight conflict/reload passed without
  duplicate save ownership.
- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — exactly six native disclosures
  appeared once with Summary open and the five approved secondary sections
  closed, keyboard/focus semantics and content ownership intact, open state
  stable across write feedback, and defaults reset for a newly selected asset.
- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — selected-row/Passport
  association, narrow focus entry, Back focus restoration, landing/demo/
  fallback routes, and the exact one-link canonical footer passed.
- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — at 320 CSS px with device scale
  factor approximately 2 and reduced motion, client and scroll width were
  `305`, page overflow was `0`, and one Passport, one strip, and six
  disclosures remained bounded.
- `truth_label: verified`; source:
  `C5-browser/browser-matrix-results.json` — console/page errors were `0/0`
  and all 75 requests remained on the loopback origin.

## Evidence Files

- `C5-browser/browser-matrix.mjs`
- `C5-browser/browser-matrix-results.json`
- `C5-browser/disposable-registry-fixture.json`
- `C5-browser/primary-narrow.png`
- `C5-browser/effective-200.png`

## Limitations

- The fixture uses a native origin-private file handle. It does not automate
  Chrome's operating-system file-picker dialog.
- Permission, failure, and external-change inputs are controlled synthetic
  states. Product reactions and recovery are observed in installed Chrome;
  the inputs do not claim real operating-system failures.
- Product behavior is continuity evidence only. No Feature 012 product scope,
  predecessor Spec, or Spec 005/T16R5/T16/A-002 authority was reopened.

## Verdict

PASS. Practical installed-Chrome continuity remained intact after C4. No
conditional implementation or focused-test correction was warranted.
