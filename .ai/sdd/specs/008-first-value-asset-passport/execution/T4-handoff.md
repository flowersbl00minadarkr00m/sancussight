# Feature 008 T4 handoff

## State

- Recommendation: `ready-for-review`
- Stable event: `sancussight-008-T4-ready-20260723-01`
- Tracking owner: orchestrator/source thread
- Authority plane: unchanged; this worker did not edit `tasks.md`, `.status`,
  `.ai/sdd/INDEX.md`, or `.ai/sdd/handoff/sdd-brief.md`
- Canonical root: `C:\Users\henry\sancussight`
- Worker session: `019f9196-8c84-7003-a0ea-06490398d733`

All local T4 browser criteria and mandated verification pass. The orchestrator
must independently inspect and reconcile this recommendation before changing
task authority.

## Product change

The only T4 product change is in `src/App.tsx`.

Actual browser acceptance found that Advanced > Evidence Sources left Assets
and revealed the evidence rail but left focus on `BODY`. The union selector
chose the hidden desktop `.source-rail-toggle` first. The bounded correction
prefers an enabled `.source-row` when the mobile toggle is not visible and
excludes `.source-rail-toggle` from the generic fallback.

The actual-browser regression passed: Assets was absent, the evidence rail was
displayed and scrolled to top, and focus was on the active source-row button
inside the rail.

## Browser evidence

The durable report is `execution/T4-browser-report.md`. Forty-five actual
Playwright artifacts are under `execution/T4-browser/`, including:

- `landing-compiler.png`
- `desktop-selected.png`
- `desktop-900.png`
- `narrow-passport.png`
- `narrow-320-zoom-passport.png`
- `evidence-sources-focus-fixed.png`

Local headed Chromium covered `1440x1000`, `1280x900`, `900x900`, `390x844`,
and `320x900`. The 320-pixel check used CDP scale factor 2 as the 200% zoom
equivalent plus reduced-motion emulation. Page-level overflow was zero.

The report records:

- exactly three truthful source-distinct landing choices and exact local
  compiler disclosure;
- sample convergence and neutral Passport;
- one catalog/one Passport desktop side-by-side geometry at the exact 900 CSS
  pixel threshold;
- selection, switching, filtering, no-results/clear, and
  selected-outside-results context;
- narrow mutually exclusive Passport state, heading focus, Back focus
  restoration, and preserved query/filter/selection;
- exact Primary and Advanced navigation, Escape restoration, and Evidence
  Sources rail focus;
- Home, Attention, and supported Exit Drill links opening the same canonical
  selected Passport;
- exact one-anchor footer DOM;
- sample/local, missing-data, deterministic-finding, evidence, and
  human-decision truth labels;
- zero browser console errors/warnings and no dynamic network requests.

## Verification

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run test:feature008` | 0 | 6 passed, 0 failed |
| `npm run test:collector` | 0 | 92 passed, 0 failed |
| `npm run test:registry-compiler` | 0 | 22 passed, 0 failed |
| `npm run verify:core` | 0 | Core verification passed |
| `npm run build` | 0 | TypeScript/Vite build passed |

Scoped diff and whitespace checks passed. No Spec 005 operations command ran.

## Changed paths

- `src/App.tsx`
- `.ai/sdd/specs/008-first-value-asset-passport/execution/T4.md`
- `.ai/sdd/specs/008-first-value-asset-passport/execution/T4-browser-report.md`
- `.ai/sdd/specs/008-first-value-asset-passport/execution/T4-browser/`
- `.ai/sdd/specs/008-first-value-asset-passport/execution/T4-handoff.md`

No package file was changed by T4. Unrelated dirty work was preserved.

## Boundaries and limitations

- Production, deployment, providers, release actions, Spec 005, T16R5/T16,
  A-002, commits, pushes, and Pi were not used.
- FR-010 hosted post-deploy verification remains T5 and was not claimed.
- The skill's Bash Playwright wrapper failed on its CRLF `pipefail` line; the
  documented direct `npx @playwright/cli` equivalent was used.
- At 320 pixels with CDP scale factor 2, a pointer-coordinate interception was
  observed. Keyboard activation passed, heading focus passed, overflow was
  zero, and no required control was clipped.
- Existing-registry selection used the app-exported demo registry; its
  synthetic warning remained explicit. No stronger fixture claim was invented.

## Review focus

1. Inspect the small focus selector correction in `src/App.tsx`.
2. Reconcile the detailed browser report and stable screenshots against the
   approved requirements/design.
3. Re-run the five mandated commands if desired.
4. Keep T5 blocked until the external hosted gate is explicitly authorized and
   performed.

## Worker metadata

- Model class: Codex, GPT-5 family
- Effort setting: not surfaced
- Rationale: fresh visible top-level independent browser acceptance worker.

## Return receipt

The stable ready event was delivered directly to source thread
`019f914a-b672-77b1-837f-0c866b6421bb`; the Codex app returned that thread
identifier. Durable and direct return paths therefore both succeeded.
