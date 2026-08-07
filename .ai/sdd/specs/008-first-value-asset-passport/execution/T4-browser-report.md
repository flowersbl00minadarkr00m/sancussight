# Feature 008 / T4 Actual-Browser Acceptance

> Truth class: `supporting-evidence`
> Browser: real headed Chromium driven through `@playwright/cli`
> Local URL only: `http://127.0.0.1:4178`
> Production URL accessed: no
> Session: `feature008t4`
> Date: 2026-07-23/24 America/Vancouver

## Environment and method

- Vite command:
  `npm run dev -- --host 127.0.0.1 --port 4178 --strictPort`
- Browser command form:
  `npx --yes --package @playwright/cli playwright-cli --session feature008t4 ...`
- The bundled Playwright Bash wrapper was attempted first but could not run
  because its CRLF line endings made Bash reject `set -o pipefail`. The
  skill-documented direct `npx --package @playwright/cli playwright-cli`
  equivalent was used.
- Viewports exercised: `1440x1000`, `1280x900`, `900x900`, `390x844`, and
  `320x900` CSS pixels.
- Enlarged-view equivalent: Chromium CDP
  `Emulation.setPageScaleFactor` at `2`, with a `320x900` CSS viewport.
- Reduced motion: Playwright `page.emulateMedia({ reducedMotion: 'reduce' })`.
- Console result after the complete flow: 0 errors and 0 warnings.
- Dynamic request result: none; Playwright reported only static requests.

## Scenario evidence

### 1. Source-distinct entry and recovery

At `1440x1000`, `.landing-actions > *` contained exactly three choices:

1. `Explore sample` / `Synthetic` / demonstration data only.
2. `Open existing registry` / `User-selected file or snapshot`.
3. `Build with local compiler` / `Compiler-created registry`.

Opening the compiler disclosure produced the exact command:

```text
npx sancussight-registry compile --root "C:\path\to\approved\metadata-root"
```

The same disclosure stated that the compiler runs locally, opens a local review
step, requires the user to review and confirm there, routes the result through
Open existing registry, and that the hosted page never executes the compiler
or uploads metadata.

Clicking Open existing registry and cancelling produced the explicit live
status `File selection cancelled.` It did not substitute sample data.

The exported sample registry was then selected through the actual hidden file
input. It converged on Assets with a neutral Passport and preserved its
synthetic meaning through the live status:
`This file is marked as synthetic demo data. It was not saved as actual evidence.`

Evidence:

- `T4-browser/landing-compiler.png`
- `.playwright-cli/page-2026-07-24T01-01-34-901Z.yml`
- `.playwright-cli/page-2026-07-24T01-01-47-993Z.yml`

Verdict: PASS.

### 2. Sample convergence and neutral Passport

Activating Explore sample navigated to `#demo`, selected the Assets primary
destination, and displayed:

- exactly one `.assets-catalog-region`;
- exactly one `.asset-passport-region`;
- heading `Select an asset`;
- copy beginning `No asset is selected`;
- zero selected `.asset-link[aria-current]` rows.

The header showed `Demo data` and `Synthetic workspace`.

Verdict: PASS.

### 3. Desktop master-detail, selection, filtering, and footer

At `1440x1000`, neutral geometry was:

```json
{
  "catalog": {
    "left": 20,
    "right": 772.8375,
    "top": 146.4,
    "bottom": 1495.7626
  },
  "passport": {
    "left": 788.8375,
    "right": 1404.8,
    "top": 146.4,
    "bottom": 297.0
  },
  "sideBySide": true,
  "pageOverflowDelta": 0
}
```

At the exact desktop breakpoint `900x900`, selected geometry was:

```json
{
  "catalog": {
    "left": 20,
    "right": 475.8375,
    "top": 146.4,
    "bottom": 1535.8876
  },
  "passport": {
    "left": 491.8375,
    "right": 864.7875,
    "top": 146.4,
    "bottom": 2537.3375
  },
  "sideBySide": true,
  "pageOverflowDelta": 0
}
```

At both desktop widths the catalog and Passport overlapped vertically and the
Passport left edge was beyond the catalog right edge. The existing evidence
rail remained in the DOM exactly once but had computed display `none` while
Assets was active.

Selecting `Accept governed asset action` produced:

- button `aria-current="true"`;
- visible state cell `Selected`;
- adjacent Passport heading with the same asset name;
- exactly the six section headings `Summary`, `Portability`, `Dependencies`,
  `Evidence`, `Decisions`, and `History`;
- one catalog DOM and one Passport DOM.

Switching to `FindMnemo ontology contract` updated the same Passport and
selected row without changing the empty query or result context.

Search and filter observations:

- impossible search: `No assets match the active criteria (0 of 21)`;
- explicit `No matching assets` recovery with Clear criteria;
- selected Passport remained `FindMnemo ontology contract`;
- explicit selected-outside-results status stated that selection was not
  reassigned;
- Owner `henry` produced `17 of 21 assets`;
- adding Kind `workflow` produced `1 of 21 assets` and kept the selected
  `Voice & context pack` Passport outside results;
- Clear criteria restored `21 assets`, the selected row, and the same Passport.

Exact footer DOM:

```html
<footer class="workspace-footer"><a href="https://sancussight.vercel.app">https://sancussight.vercel.app</a></footer>
```

Measured footer facts:

- one footer child element;
- one footer anchor;
- exact visible text `https://sancussight.vercel.app`;
- resolved href `https://sancussight.vercel.app/`;
- no personal name, disclaimer, or additional footer item.

Evidence:

- `T4-browser/desktop-selected.png`
- `T4-browser/desktop-900.png`

Verdict: PASS.

### 4. Narrow transition and focus

At `390x844`, with query `FindMnemo` and the matching asset already selected:

- clicking its row changed the workspace class to
  `assets-workspace assets-view-passport`;
- the catalog computed display became `none`;
- the Passport computed display became `block`;
- one catalog DOM and one Passport DOM remained;
- focus landed on `H2#asset-passport-heading`;
- focused text was `FindMnemo ontology contract`;
- Back to assets was visible;
- query `FindMnemo` and selected ID
  `accepted-findmnemo-ontology` survived.

The visible tabbable sequence contained Passport actions but no search/filter
or catalog row controls while the catalog was hidden, so no duplicate catalog
focus order existed.

Activating Back to assets:

- restored `assets-view-catalog`;
- hid Passport and revealed catalog;
- returned focus to the selected `FindMnemo ontology contract` button;
- preserved `aria-current="true"`, query `FindMnemo`, and `1 of 21 assets`.

Evidence: `T4-browser/narrow-passport.png`.

Verdict: PASS.

### 5. 320 CSS pixels, 2x scale, and reduced motion

At `320x900` with page scale `2` and reduced-motion emulation:

```json
{
  "innerWidth": 320,
  "clientWidth": 305,
  "scrollWidth": 305,
  "pageOverflowDelta": 0,
  "pageScale": 2,
  "reducedMotion": true,
  "visibleControls": 23,
  "clippedPageControls": []
}
```

The coverage matrix retained its intentional internal overflow
(`scrollWidth: 704`, `clientWidth: 246`) without causing page-level overflow.
The selected row remained keyboard reachable; pressing Enter moved into the
Passport, focused `#asset-passport-heading`, preserved query `FindMnemo`, and
exposed Back to assets. Correctness did not depend on animation.

Evidence: `T4-browser/narrow-320-zoom-passport.png`.

Verdict: PASS.

### 6. Primary/Advanced navigation and Evidence Sources

At `1280x900`, primary membership was exactly:

```text
Home, Assets, Exit Drills, Attention
```

Opening Advanced produced exactly:

```text
Evidence Sources, Governance, Release Proofs, Activity, Definitions
```

The trigger reported `aria-expanded="true"`. Pressing Escape removed the menu,
changed the trigger to `aria-expanded="false"`, and restored focus to
`Advanced`.

Initial Evidence Sources browser acceptance failed: the action left Assets,
revealed and scrolled the rail, but focus remained on `BODY`. Inspection found
that the union selector in `App.tsx` returned the hidden desktop
`.source-rail-toggle` before a visible source row. The bounded correction
prioritized `.source-row:not(:disabled)` and excluded the hidden toggle from
the fallback selector.

After correction:

- Assets was absent;
- the rail computed display was `block`;
- rail top was `0`;
- focus landed on the button with class
  `source-row source-row-active`;
- focused text began `Agent Beacon`;
- the focused element was inside `.evidence-source-rail`.

Evidence: `T4-browser/evidence-sources-focus-fixed.png`.

Verdict after bounded correction: PASS.

### 7. Context links into the canonical Passport

Actual browser links produced:

- Home finding `Client style guide (custom GPT)` ->
  Assets / selected row / Passport heading all matched that asset.
- Attention row `Finance analysis brief` ->
  Assets / selected row / Passport heading all matched that asset.
- Exit Drills default sample scenario had canonical dependency buttons.
  Activating `Voice & context pack` ->
  Assets / selected row / Passport heading all matched that asset.

The sample dataset supplied a supported Exit Drill scenario, so no alternate
fixture was required.

Verdict: PASS.

### 8. Truth labels

Observed text included:

- source meaning: `Synthetic`, `User-selected file or snapshot`,
  `Compiler-created registry`, `Demo data`, `Synthetic workspace`;
- synthetic file import warning:
  `This file is marked as synthetic demo data. It was not saved as actual evidence.`;
- recorded facts: `Recorded facts`;
- deterministic findings: `Recorded facts + deterministic findings`,
  `Deterministic finding`;
- evidence: `Evidence states + deterministic findings`, explicit
  `Evidence:` source lines, and recorded evidence dates;
- decisions: `Human decisions`;
- missing data: `Not recorded`, `None recorded`, `Never recorded`, and
  `Missing / unavailable`.

Verdict: PASS.

## Correction scope

The only product correction was in `src/App.tsx`:

```ts
const focusTarget = mobileToggleVisible
  ? mobileToggle
  : rail.querySelector<HTMLButtonElement>('.source-row:not(:disabled)')
    ?? rail.querySelector<HTMLButtonElement>('button:not(:disabled):not(.source-rail-toggle)')
```

No dependency, backend, storage, network, provider, deployment, production
URL, release, Spec 005, T16R5/T16, or A-002 surface was used or changed.
