# Feature 008 Design: First Value and Asset Passport

> Status: Approved
> Requirements: `@.ai/sdd/specs/008-first-value-asset-passport/requirements.md`
> Grounded in: current `src/App.tsx`, `src/components/Registry.tsx`,
> `src/components/LandingGateway.tsx`, `src/components/WorkspaceNavigation.tsx`,
> `src/types.ts`, `src/index.css`, and `packages/registry-compiler/README.md`

## Design intent

Feature 008 reorganizes existing registry facts and deterministic findings
around one understandable Assets workflow. It does not introduce a service,
upload, opaque score, or new evidence claim. The browser keeps the active
registry and filter/selection UI state; the existing local compiler remains a
separate loopback process whose confirmed registry output is opened through
the existing local file path.

The primary desktop structure is a two-column master-detail workspace:

```text
+--------------------------------+---------------------------------------+
| Asset catalog                  | Asset Passport                        |
| search + supported filters     | selected asset identity               |
| result count                   | Summary                               |
| [selected] Asset A             | Portability                           |
|            Asset B             | Dependencies                          |
|            Asset C             | Evidence / Decisions / History        |
+--------------------------------+---------------------------------------+
```

The Passport column is always present at supported desktop widths. With no
selection it contains an explicit neutral prompt, not implicit first-row
detail. On a narrow screen, catalog and Passport become mutually exclusive
states inside the Assets view; detail never appears after the long catalog.

## Current-state findings

- `Registry.tsx` sorts a coverage table and renders `AssetDetail` after the
  catalog card. This is the direct source of the desktop association problem.
- Selection is visually outlined but the activating button has no
  `aria-current`/selected text or return-focus contract.
- There is no search/filter model and no neutral detail region.
- The existing detail content has useful facts and decisions but no canonical
  Passport information architecture.
- `LandingGateway.tsx` exposes sample and existing-file entry only. The local
  compiler already documents a bounded, read-only-to-review quick start and
  produces an importable registry.
- Primary navigation currently exposes Overview, Governance, Release, Assets,
  Portability, and Attention; Definitions and Activity sit under Help.
- `EvidenceSources` is a persistent rail, not a named advanced destination.
- `ExitTest` does not link its dependency rows into the Asset Passport.
- The current source footer is a disclaimer; the supplied hosted screenshot
  also showed stale personal attribution. Neither matches the approved
  canonical-URL-only contract.

## Component and state design

### Application shell

`App.tsx` remains the owner of active route, active workspace view, and
`selectedAssetId`. It adds a small navigation intent for opening Assets from
Attention or Exit Drills. `handleSelectAsset` remains the single cross-view
entry point so originating views do not invent parallel asset detail.

The workspace shell renders the persistent footer as one anchor:

```html
<footer>
  <a href="https://sancussight.vercel.app">
    https://sancussight.vercel.app
  </a>
</footer>
```

There is no adjacent footer text, personal attribution, or second link.
Contextual truthfulness notices stay inside their relevant product views and
are not moved into the footer.

### First-value gateway

`LandingGateway` presents three visually distinct source choices:

1. **Explore sample** — synthetic demonstration data; enters `#demo`.
2. **Open existing registry** — user-selected file/snapshot through the
   existing connector/import behavior.
3. **Build with local compiler** — a non-executing disclosure that explains
   the compiler remains local, provides the checked-in Windows command, and
   tells the user to review/confirm locally and then open the resulting
   registry through the existing path.

The compiler choice does not call a provider, start a server from the hosted
page, upload metadata, or claim a registry was created. Cancellation and
failure continue to preserve the current workspace and expose a recovery
choice.

### Navigation

The view identifiers remain stable where possible; only reader-facing grouping
and labels change.

| Reader-facing item | Existing view/surface | Placement |
|---|---|---|
| Home | `overview` | Primary |
| Assets | `registry` | Primary |
| Exit Drills | `exit` | Primary |
| Attention | `queue` | Primary |
| Evidence Sources | existing `.evidence-source-rail` | Advanced action that focuses/scrolls to the rail |
| Governance | `governance` | Advanced |
| Release Proofs | `release` | Advanced |
| Activity | `activity` | Advanced |
| Definitions | `definitions` | Advanced |

The advanced menu uses an explicit `Advanced` label, keyboard-operable menu
semantics already established by the current navigation component, Escape
close behavior, and visible active state. It does not hide destinations based
on viewport. The current narrow-screen `More` split is removed because the
four approved primary destinations fit the intended loop and can wrap or
scroll without reclassifying them.

### Catalog query model

`Registry.tsx` owns ephemeral catalog state:

- free-text query across name, kind, owner, provider, stable ID, format, and
  location;
- owner and kind facets from recorded values;
- lifecycle from the compiler's optional `registryState` (`active`,
  `archived`, `missing`);
- provider from primary provider, dependency providers/fallbacks, and coverage
  platform labels;
- portability state derived only from existing deterministic asset signals
  and coverage states, with explicit labels rather than a score;
- evidence freshness derived from recorded evidence dates and applicable
  deterministic evidence signals, using the same date/freshness rules already
  used by registry evaluation.

Facet choices are generated from values actually present in the active
registry. A dimension with no supported values is shown as unavailable or
omitted with the active result explanation; it is never synthesized. All
facets combine with AND semantics while multiple values within one facet use
OR semantics. Search/filter changes preserve the selected asset if it remains
in results. If it is filtered out, the Passport stays associated with that
asset and clearly states that the selected asset is outside current results,
with an action to clear criteria; selection is not silently reassigned.

The result summary names the count and active criteria. The no-results state
keeps controls available and includes `Clear filters`.

### Desktop master-detail

At widths of 900 CSS pixels and above, the Assets view uses
`grid-template-columns: minmax(24rem, 1.1fr) minmax(22rem, 0.9fr)`. The catalog
and Passport are sibling regions. Each may scroll internally where necessary;
the page does not require horizontal scrolling. The Passport may use sticky
positioning within the workspace only where it does not trap focus or obscure
content at enlarged text.

Rows remain actual table rows. The asset-name button receives
`aria-current="true"` for the selection, and the row includes visible
`Selected` text in a dedicated state cell or name annotation. The Passport
heading repeats the same asset name and uses a stable focus target.

### Narrow-screen transition and focus

Below 900 CSS pixels, the Assets view has two explicit states:

- `catalog`: query controls and result list/table are shown;
- `passport`: only the selected Asset Passport and a `Back to assets` action
  are shown.

The transition uses a layout media query plus a live `matchMedia` subscription
or an equivalent browser-width hook. It is not user-agent detection.

On narrow selection:

1. remember the activating row-button element by asset ID;
2. set the selected asset and detail state;
3. after render, focus the Passport heading (`tabIndex="-1"`);
4. expose the heading and Back action in normal reading order.

On Back:

1. return to catalog state while retaining query, filters, selection, and
   scroll context;
2. focus the selected asset's button if still rendered;
3. otherwise focus the catalog heading or Clear filters control and announce
   why the row is unavailable.

At desktop width, selecting replaces adjacent Passport content without moving
focus automatically. Crossing the breakpoint never clears selection. Reduced
motion disables any optional transition, and correctness does not depend on
animation.

## Asset Passport information architecture

One `AssetPassport` component replaces `AssetDetail`; it does not coexist with
a second detail concept.

| Section | Contents and truth class |
|---|---|
| Summary | recorded name, kind, format, location, owner, sensitivity, source/product mapping, stable ID, supported version; absent values read `Not recorded` |
| Portability | recorded coverage/provider facts plus deterministic portability findings; no aggregate score |
| Dependencies | provider dependencies, fallbacks, workflow `dependsOn`, producers/consumers; absent relationships read `None recorded` |
| Evidence | recorded evidence points, bindings, qualification/freshness, and deterministic evidence findings; stale/missing states remain explicit |
| Decisions | accepted risk, accepted-asset rationale, action boundaries, candidate-tool disposition; labels distinguish human decisions |
| History | registry source updated date, last review, last substitution drill, coverage verification dates; absent dates read `Never recorded` |

Existing mutation commands—record review, record drill, and record
verification—remain available near the section they affect. Their current
confirmation and local-source semantics are unchanged.

## Data contract

The browser `Asset` type adds the optional compiler-emitted field:

```ts
registryState?: 'active' | 'archived' | 'missing'
```

No existing field becomes required and schema version remains `2`. Import
validation must preserve this bounded optional value when present and reject
unsupported values through the existing compatibility boundary. This closes
the current mismatch between compiler `RegistryAsset` output and browser
typing without inventing a new migration.

No new network API, persistent database, analytics event, or storage key is
introduced. Query, facets, narrow-detail state, and focus refs are session-only
UI state.

## Context links

- Attention continues to call `handleSelectAsset(assetId)`, which opens Assets
  with that asset selected.
- Exit Drills adds asset-name buttons for dependency result rows and calls the
  same handler. The selected workflow and target remain in `ExitTest` state so
  returning to Exit Drills preserves the originating drill context during the
  current mounted session.
- Home finding links continue to use the same handler.

No finding or exit result is copied into the Passport as a new claim; the
Passport reevaluates against the same active registry and signal set.

## Accessibility and responsive acceptance

- Every control has a programmatic label and visible focus.
- Selection uses `aria-current`, a visible `Selected` cue, row treatment, and
  repeated asset identity.
- Section headings provide one stable Passport outline.
- Empty/missing/unavailable states are text, not blank space.
- Controls remain operable at 200% zoom and 320 CSS-pixel viewport width
  without page-level horizontal scrolling.
- Native table semantics remain on desktop. Narrow presentation may use the
  same semantic rows with responsive styling or an equivalent list, but must
  not duplicate interactive controls into two simultaneous focus orders.
- Tests cover focus entry/return and breakpoint transitions without depending
  on animation timing.

## Verification strategy

### Deterministic component and contract checks

- catalog query/facet extraction, combined filtering, counts, no-results, and
  selected-outside-results behavior;
- Passport sections and explicit missing values;
- compiler `registryState` compatibility;
- primary/advanced navigation membership;
- footer has exactly one reader-facing anchor with exact text/href and no
  personal or disclaimer copy;
- Attention and Exit Drill asset links use the canonical selection route.

### Browser acceptance

At representative desktop and narrow viewports:

- desktop catalog and Passport bounding boxes are side by side and Passport
  is never below the catalog;
- neutral no-selection state is visible;
- row selection is identifiable without color;
- narrow selection focuses Passport heading;
- Back restores focus to the originating/still-selected row;
- query/filter and scroll context survive switching and returning;
- keyboard navigation and 200% zoom do not create page-level horizontal
  overflow.

### Existing regression gates

```text
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
```

Feature-local component/browser checks run before the full gates. Spec 005
operational scripts and A-002 are not part of Feature 008 verification and
must not be invoked.

### Hosted verification

After separate deployment authorization, verify the saved reviewed build at
`https://sancussight.vercel.app` for:

- exact canonical footer link and absence of personal attribution;
- desktop side-by-side geometry;
- narrow-screen focus and return behavior;
- all three first-value choices and canonical Assets convergence.

Local passing evidence cannot satisfy this hosted gate.

## Requirement traceability

| Requirement | Design surfaces | Verification |
|---|---|---|
| FR-001, FR-011 | `LandingGateway`, existing connector, compiler disclosure | source-choice component + browser scenarios |
| FR-002 | catalog query/facet model | deterministic filter checks + browser no-results |
| FR-003 | `AssetPassport` sections | section/missing-state checks |
| FR-004, FR-005 | desktop sibling grid, row semantics, neutral region | desktop geometry + selection checks |
| FR-006 | narrow catalog/passport state and focus protocol | narrow browser focus scenarios |
| FR-007 | primary/advanced navigation mapping | navigation component checks |
| FR-008 | canonical `handleSelectAsset` routes | Attention/Home/Exit browser checks |
| FR-009 | exact one-link footer | DOM contract check |
| FR-010 | hosted acceptance gate | post-deployment canonical URL verification |
| NFR-001–005 | focus, truth labels, no new network/storage, compatibility | accessibility, import, regression, and privacy checks |

## Risks and mitigations

- **Large registries:** derive facet indices with memoized pure functions;
  avoid rendering duplicate desktop/mobile catalogs.
- **False lifecycle/freshness claims:** expose only recorded or existing
  deterministic values and label unavailable dimensions.
- **Breakpoint focus race:** centralize focus transitions in one component and
  test with actual browser layout.
- **Evidence rail crowding:** the Assets master-detail owns the full content
  width; the persistent evidence rail becomes an advanced destination rather
  than a third simultaneous desktop column while Assets is active.
- **Dirty-tree overlap:** implementation tickets are serialized around shared
  React/CSS surfaces and workers receive exact ownership.
- **Hosted drift:** deployment remains a separate blocked task and review
  cannot claim FR-010 complete from local evidence.

## Decisions

1. Use a sibling catalog/Passport grid on desktop; no below-table inspector.
2. Use explicit mutually exclusive catalog/passport states on narrow screens.
3. Keep selection in `App` and query/focus state in the Assets component.
4. Preserve source-distinct first-value choices; compiler remains local and
   user-confirmed.
5. Reuse existing view IDs while changing the navigation hierarchy.
6. Add only optional `registryState` to the browser contract.
7. Render the persistent footer as exactly the canonical URL anchor.

## Approval record

The operator's 2026-07-23 no-stop blanket authorization prospectively approves
an aligned Feature 008 design after internal verification. The optional HTML
design explainer was treated as declined under that direction. Because it was
declined, no UI-image offer or conceptual mockup was generated.

Internal gate verification confirmed explicit coverage of every Must Have
requirement, current component and compiler surfaces, responsive focus
behavior, regression gates, and the separate hosted-verification boundary.
