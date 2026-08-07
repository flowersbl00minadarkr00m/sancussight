# Feature 012 C2 Local Installed-Chrome Report

> Browser regression evidence only. The disposable registry and all controlled
> permission/conflict/failure states are synthetic fixtures, not production
> data or external verification. The operating-system file chooser was not
> automated and is not claimed.

## Runtime

- Browser: installed Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Automation: bundled Playwright library driving the installed Chrome binary
- Origin: `http://127.0.0.1:4183`
- Server: fresh `npm run build` output through local Vite preview
- Fixture: disposable origin-private native `FileSystemFileHandle`, populated
  from the application's exported demo registry after changing only provenance
  to `local`
- Passing matrix: 12 checks
- Console warnings/errors: 0
- Page errors: 0
- Network: 75 requests, all same-origin loopback

## Typed Pending and Deliberate Write

Installed Chrome verified:

- compact Header identity, `Current` / `Unsaved changes`, last-read freshness,
  and read/write permission truth;
- zero Header `Save to source` actions;
- exactly one selected-Passport write strip while dirty;
- cancellation retained `Unsaved changes`, restored one Save action, and did
  not leave pending presentation active;
- confirmed save visibly entered the exact typed-phase presentation
  `Saving to source`, exposed zero duplicate Save actions while pending, and
  ended only at controller-verified `Saved to source`;
- permission denial, bounded synthetic write failure, and preflight conflict
  each passed through the same pending presentation before their honest
  terminal recovery state;
- permission and failure recovery produced verified saves after the synthetic
  condition was removed;
- conflict prevented writing and `Reload source` restored `Current`; and
- saved disposable bytes contained the selected asset's
  `lastReviewed: 2026-07-24`.

The focused Feature 012 source test separately proves the strip derives this
presentation from `feedback.operationPhase` and contains no
`startsWith`/user-visible-copy inference.

## Build-Input Boundary

Before the browser run:

- `npm run build` passed against the current C1-corrected source; and
- `npm run verify:feature012-build-inputs` passed with 92 declared inputs,
  77 observed bundled project inputs, six output files, two byte-identical
  clean builds, and an ignored hostile
  `output/feature012-adversarial-tailwind-candidate.html` containing the
  outside-boundary `.resize` candidate.

The verifier removed its temporary builds and hostile candidate.

## Passport, Focus, Routes, and Footer

- Exactly six native `details.detail-section` nodes existed once:
  Summary, Portability, Dependencies, Evidence, Decisions, History.
- Initial open states were exactly
  `[true, false, false, false, false, false]`.
- Keyboard Enter opened Portability; its focused summary matched
  `:focus-visible`.
- Native marker evidence was `display: list-item`,
  `list-style-type: disclosure-open`, and `::marker content: normal`.
- Evidence retained `Evidence bindings`; History retained version and Evidence
  Packet controls.
- Evidence and History stayed open through write-feedback rerenders.
- Selecting a different asset reset the approved disclosure defaults.
- The selected row and Passport heading remained associated.
- At 320 CSS px, narrow selection focused `#asset-passport-heading`; Back
  restored focus to the selected `aria-current="true"` row.
- `#landing`, `#demo`, and unknown-route fallback passed.
- Footer remained one exact canonical link:
  `https://sancussight.vercel.app`.
- Demo and imported snapshot modes exposed no canonical-write action.

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

Every disclosure content owner remained bounded without page-level overflow.

## Harness Evidence and Limitations

- `C2-browser/browser-matrix.mjs`
- `C2-browser/browser-matrix-results.json`
- `C2-browser/browser-matrix-failure.json`
- `C2-browser/disposable-registry-fixture.json`
- `C2-browser/primary-narrow.png`
- `C2-browser/effective-200.png`

The retained failed attempt is a harness-timing failure only: after the newly
added pending assertion passed, the harness sampled the failure strip before
the deliberately delayed operation had reached its terminal recovery text.
The C2 harness was corrected to wait for the terminal state; no product or
focused product-test file changed.

The fixture uses a native origin-private file handle rather than automating
Chrome's operating-system file-picker dialog. Permission, failure, and
external-change inputs are explicitly controlled synthetic states. Product
reactions and recoveries are observed in installed Chrome; these inputs do not
claim real operating-system failure evidence.

## Browser Verdict

PASS. All 12 findings-limited installed-Chrome checks passed. No C1-owned
product/test correction was required.
