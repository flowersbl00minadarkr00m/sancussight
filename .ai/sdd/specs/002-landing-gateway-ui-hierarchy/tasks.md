# Tasks: Landing Gateway and UI Hierarchy

> Requirements: @requirements.md
> Design: @design.md
> Status: Approved

## Requirement Coverage

| Requirement | Tasks | Notes |
|---|---|---|
| FR-001 | T2, T6 | Default gateway, first-viewport commands, and final viewport verification. |
| FR-002 | T1, T2, T6 | Demo provenance in state, workspace, exports, and share artifacts. |
| FR-003 | T1, T2 | Compatible local import, validation, and local activation. |
| FR-004 | T1, T2, T3 | Explicit mode/freshness model and persistent workspace presentation. |
| FR-005 | T1, T2, T3 | Isolated demo storage plus confirmed replacement/reset actions. |
| FR-006 | T4 | Pure asset grouping with worst status, count, and signal drill-down. |
| FR-007 | T4 | Six-item Overview boundary and complete Queue access. |
| FR-008 | T4 | Non-zero dimension summaries with no composite score. |
| FR-009 | T5 | Decision-first candidate assessment with native progressive disclosure. |
| FR-010 | T3 | Four primary destinations and secondary Definitions/Activity access. |
| FR-011 | T2, T3 | Inline connection notices and recovery actions without alerts. |
| FR-012 | T5 | Complete verification and workflow-role legend. |
| NFR-001 | T1, T2, T6 | Browser-only storage/import/export and no runtime network requests. |
| NFR-002 | T2, T3, T4, T5, T6 | Keyboard controls, text status, visible focus, and readable sizing. |
| NFR-003 | T2, T3, T4, T5, T6 | 390px entry, stable navigation, bounded matrix, and reflowing content. |
| NFR-004 | T2, T3, T5, T6 | Actual product image, retained ledger identity, and revised neutral surfaces. |
| NFR-005 | T1, T2, T4, T5, T6 | Static runtime, isolated data sources, and regression protection for deterministic behavior. |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | FR-001 through FR-007, FR-009, FR-011, and FR-012 map to concrete P0/P1 tasks. |
| Requirements are covered by design | Pass | Approved design maps FR-001 through FR-012 and NFR-001 through NFR-005. |
| Critical Questions are answered | Pass | Requirements state that no critical questions remain; live connectors require a separate feature. |
| Tasks have dependencies, acceptance criteria, files, and verification | Pass | Every task below declares its delivered behavior and verification evidence. |
| Verification commands are known or marked manual/N/A | Pass | `npm run build`, source scans, local browser checks, and screenshot viewports are specified. |
| Approved boundaries remain intact | Pass | No backend, account, live connector, candidate execution, score, chart, or ontology semantic change is planned. |

## Implementation Slices

### Truthful Entry Slice

- **Goal:** Let a visitor choose sample or actual local data without confusing or overwriting provenance.
- **User Stories:** US-001, US-002, US-003
- **Tasks:** T1, T2
- **Independent validation:** The default route shows both commands; sample mode never writes saved local state; a validated local registry opens with local provenance and invalid/cancelled input preserves prior data.

### Calmer Workspace Slice

- **Goal:** Reduce decision noise while keeping all deterministic evidence available.
- **User Stories:** US-004, US-005, US-006
- **Tasks:** T3, T4, T5
- **Independent validation:** Core navigation is obvious, Overview groups by asset, Queue retains every signal, and candidate details expose critical facts before supporting metadata.

### Professional Verification Slice

- **Goal:** Finish the audit-ledger visual system and prove the complete flow at desktop and mobile sizes.
- **User Stories:** US-001 through US-006
- **Tasks:** T6
- **Independent validation:** Production build passes, no external runtime requests occur, and approved desktop/mobile screenshots show the complete landing and workspace experience without overflow or overlap.

## Frontier

Work only tasks whose blockers are complete.

| Task | Blocked By | Frontier Status |
|---|---|---|
| T1 | None | Ready after tasks approval |
| T2 | T1 | Blocked |
| T3 | T2 | Blocked |
| T4 | None | Ready after tasks approval |
| T5 | None | Ready after tasks approval |
| T6 | T1, T2, T3, T4, T5 | Blocked |

```text
T1 -> T2 -> T3 --+
                  +-> T6
T4 ---------------+
T5 ---------------+
```

## Task T1: Establish explicit provenance and isolated registry storage

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** none  
**Status:** Complete  
**Covers:** FR-002, FR-003, FR-004, FR-005, NFR-001, NFR-005, TD-002, TD-003  
**Delivers:** Demo and local registries have truthful provenance, compatible imports normalize safely, and demo activity cannot overwrite saved local evidence.

### Work
- [x] Add `DataMode`, `RegistryProvenance`, and `RegistrySession` types while preserving compatible v2 and unversioned imports.
- [x] Expand storage with `loadLocalRegistry`, `saveLocalRegistry`, `clearLocalRegistry`, and `createDemoRegistry`; keep the build green while call sites migrate.
- [x] Normalize legacy imports as local only after shape validation, preserve source freshness, and retain explicit demo provenance.
- [x] Make export JSON include normalized provenance and update share-card generation to identify demo artifacts prominently.
- [x] Add dependency-free assertions or an equivalent reproducible browser harness for empty storage, demo cloning, legacy normalization, demo-marked import, and failed replacement preservation.
- [x] Remove the old fallback behavior after all storage call sites in this task are either migrated or protected by a temporary compatibility wrapper documented for T2 removal.

### Acceptance Criteria
- [x] Empty or invalid saved state returns no local registry rather than synthetic demo data.
- [x] Each demo session receives a deep clone with `mode: 'demo'` and cannot mutate the seeded constant or saved local registry.
- [x] A valid compatible registry receives local provenance; an explicitly demo-marked artifact remains demo.
- [x] Invalid JSON or invalid shape cannot replace localStorage state.
- [x] Demo JSON and share markdown visibly identify synthetic provenance.
- [x] Existing deterministic checks produce the same results for the same registry assets.

### Files
- `src/types.ts` - modify
- `src/lib/storage.ts` - modify
- `src/lib/registry.ts` - modify
- `src/lib/session.ts` - create if isolating pure provenance helpers improves testability
- `scripts/verify-core.ts` - create only if needed for dependency-free assertions
- `package.json` - modify only if a local verification script is added

### Verification
- [x] `npm run build`
- [x] Run the dependency-free provenance/storage assertions or documented browser harness.
- [x] Compare deterministic signal counts for the unchanged demo assets before and after normalization.
- [x] Inspect exported JSON and share markdown for both demo and local modes.

## Task T2: Deliver the landing gateway and local connection route

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Status:** Complete  
**Covers:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-011, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, TD-001, TD-004  
**Delivers:** The default product screen offers an honest sample or local-data path and opens the working workspace with persistent source context.

### Work
- [x] Add a single hash-route parser for empty/`#landing`, `#demo`, and `#workspace`, including startup and `hashchange` behavior.
- [x] Restructure `App` around a `RegistrySession` so route changes reconstruct the correct source without merging registries.
- [x] Build `LandingGateway` with SancusSight as the H1, literal outcome copy, `Explore sample`, `Connect now`, and local-only/no-account context in the first viewport.
- [x] Capture and bundle a synthetic SancusSight workspace image for the gateway with a solid contrast scrim and non-image fallback.
- [x] Implement local file selection, read, validation, replacement confirmation, save, and route activation using the browser File API only.
- [x] Add contextual success, cancellation, invalid-file, and missing-local-registry notices with retry/recovery actions and `aria-live` behavior.
- [x] Open `#demo` with a fresh in-memory clone, open `#workspace` only with valid saved local data, and return invalid direct routes safely to the gateway.
- [x] Show a persistent mode and freshness label in the initial workspace shell so provenance is visible before T3 refines header hierarchy.

### Acceptance Criteria
- [x] `/` displays the brand, approved outcome, `Explore sample`, and `Connect now` without scrolling at 1280x720 and 390x844.
- [x] `Explore sample` opens the real Overview with a visible `Demo data` marker and leaves prior local data unchanged.
- [x] `Connect now` reads locally, validates before commit, and opens a valid registry with `Local registry` plus freshness.
- [x] Invalid input, cancellation, or cancelled overwrite preserves active and saved state and shows contextual feedback without `window.alert`.
- [x] Back/forward navigation reconstructs landing, demo, and saved-local routes predictably.
- [x] The gateway image is an actual synthetic product state and makes no runtime request.

### Files
- `src/App.tsx` - modify
- `src/lib/route.ts` - create
- `src/components/LandingGateway.tsx` - create
- `src/components/ConnectionNotice.tsx` - create or colocate when simpler
- `src/components/WorkspaceShell.tsx` - create or keep as an `App` boundary when extraction adds no value
- `src/components/Header.tsx` - modify
- `src/index.css` - modify
- `public/sancussight-workspace.webp` - create

### Verification
- [x] `npm run build`
- [x] Browser-check `/`, `#demo`, `#workspace`, and an unknown hash.
- [x] Exercise valid, invalid, cancelled, and overwrite-cancelled connection paths.
- [x] Confirm a saved local registry remains byte-for-byte unchanged after demo editing.
- [x] Inspect the network panel for zero external runtime requests.

## Task T3: Reorder workspace navigation and make data actions safer

**Priority:** P1  
**Estimate:** 2h  
**Blocked By:** T2  
**Status:** Complete  
**Covers:** FR-004, FR-005, FR-010, FR-011, NFR-002, NFR-003, NFR-004  
**Delivers:** Returning users see a clear operating loop, a mode-appropriate primary action, and secondary utilities that cannot erase data casually.

### Work
- [x] Split navigation definitions into primary Overview/Registry/Exit Test/Queue and secondary Definitions/Activity destinations.
- [x] Build a non-wrapping primary navigation region and a keyboard-operable secondary menu that handles selection, Escape, and focus exit.
- [x] Refine the header around wordmark/home, persistent source mode, source freshness, counts, and one mode-appropriate primary data action.
- [x] Make demo mode's primary action `Connect now` and local mode's primary action `Export registry`.
- [x] Move Share, replace data, return to entry, and reset/clear into restrained utilities without hiding them.
- [x] Require confirmation before local replacement, local clear, or demo reset; keep inline outcome notices.
- [x] Remove the old equal-weight action cluster and any browser-alert error path.

### Acceptance Criteria
- [x] Overview, Registry, Exit Test, and Queue have greater visual priority than Definitions and Activity.
- [x] Primary navigation remains one line at 390px and supports keyboard navigation without overlap.
- [x] Definitions and Activity remain reachable and the secondary menu closes predictably.
- [x] Header always shows active data mode and freshness.
- [x] Destructive cancellation leaves the active and saved registry unchanged.
- [x] The primary data command reflects demo versus local mode exactly as approved.

### Files
- `src/types.ts` - modify
- `src/App.tsx` - modify
- `src/components/Header.tsx` - modify
- `src/components/WorkspaceNavigation.tsx` - create
- `src/components/ConnectionNotice.tsx` - modify if separate
- `src/index.css` - modify

### Verification
- [x] `npm run build`
- [x] Keyboard-check all header actions, primary tabs, secondary menu, and confirmation paths.
- [x] Browser-check header/navigation at 1280x720 and 390x844.
- [x] Confirm no page-level horizontal overflow is introduced by navigation.

## Task T4: Group Overview findings while preserving the full Queue

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** none  
**Status:** Complete  
**Covers:** FR-006, FR-007, FR-008, NFR-002, NFR-003, NFR-005, TD-005  
**Delivers:** Overview prioritizes affected assets instead of repeating alarms, while Registry and Queue retain every deterministic signal and its evidence.

### Work
- [x] Add `AssetFindingGroup` and a pure `groupFlaggedByAsset` helper using the existing status priority and stable asset-name ordering.
- [x] Group all non-passing signals by asset with worst status, finding count, concise lead finding, and retained signal list.
- [x] Render only the first six affected assets on Overview and provide a clear command to open the complete Queue.
- [x] Make grouped asset selection open Registry detail where every underlying signal remains available.
- [x] Render only non-zero dimension status counts and keep every status paired with text.
- [x] Replace the suspicious zero-findings message with calm factual copy.
- [x] Reflow Queue into a narrow-screen list while retaining the complete desktop evidence table and all fields.

### Acceptance Criteria
- [x] An asset with multiple non-passing signals appears once on Overview with correct worst status and count.
- [x] Overview never shows more than six affected assets and provides complete Queue access.
- [x] Queue remains signal-level and includes every non-passing signal in deterministic order.
- [x] Selecting a group exposes every underlying signal through Registry detail.
- [x] Dimension cards omit zero categories and display no score, grade, donut, or decorative chart.
- [x] Queue content reflows at 390px without page-level horizontal scrolling.

### Files
- `src/types.ts` - modify
- `src/lib/registry.ts` - modify
- `src/components/Overview.tsx` - modify
- `src/components/Queue.tsx` - modify
- `src/App.tsx` - modify for grouped data and Queue navigation
- `src/index.css` - modify only when utilities are insufficient

### Verification
- [x] `npm run build`
- [x] Run dependency-free grouping assertions for status priority, counts, ordering, six-item slicing, and retained signals.
- [x] Browser-check grouped selection, Queue completeness, zero-state copy, and mobile Queue reflow.
- [x] Compare `evaluateAll` output before and after to confirm signal semantics are unchanged.

## Task T5: Clarify candidate assessments and registry evidence

**Priority:** P1  
**Estimate:** 2h  
**Blocked By:** none  
**Status:** Complete  
**Covers:** FR-009, FR-012, NFR-002, NFR-003, NFR-004, NFR-005, TD-006  
**Delivers:** Candidate-tool assessments present decisions and risk-critical facts first, with complete supporting evidence available without an ambiguous metadata wall.

### Work
- [x] Replace unlabeled candidate chips with explicit Assessment, Integration relationship, and Disposition fields.
- [x] Create an always-visible decision summary for license, egress, evidence output, integration relationship, and disposition rationale.
- [x] Separate recorded facts, human decisions, missing evidence, and readiness checks through labeled low-radius sections.
- [x] Keep unknown or network-required egress cautionary even when disposition is accepted.
- [x] Move runtime/trust boundary, attribution/constraints/trade-off, and bundle readiness into labeled native `<details>` groups.
- [x] Omit empty supporting groups without hiding required critical fields.
- [x] Extend the coverage legend to explain verified, stale, unverified, not shared, `PRI`, `FBK`, and not applicable.
- [x] Reflow Registry and Exit Test details on narrow screens while keeping wide matrix scrolling bounded to its container.

### Acceptance Criteria
- [x] A selected candidate immediately exposes the four approved decision-critical facts with unambiguous labels.
- [x] Egress caution remains visible independently of disposition.
- [x] Supporting metadata is keyboard-operable and available through named disclosures.
- [x] Facts, decisions, gaps, and readiness cannot be mistaken for one another.
- [x] Every coverage glyph and workflow role is explained in visible text.
- [x] Matrix, details, links, and Exit Test content do not cause page-level horizontal overflow at 390px.

### Files
- `src/components/Registry.tsx` - modify
- `src/components/ExitTest.tsx` - modify
- `src/components/Shared.tsx` - modify only for reused labeled evidence styles
- `src/index.css` - modify

### Verification
- [x] `npm run build`
- [x] Keyboard-check every candidate disclosure and close/select path.
- [x] Inspect accepted tools with unknown/network-required egress for persistent caution treatment.
- [x] Browser-check Registry, candidate details, coverage legend, and Exit Test at desktop and mobile widths.

## Task T6: Finish the visual system and verify the complete product flow

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T1, T2, T3, T4, T5  
**Status:** Complete  
**Covers:** FR-001, FR-002, FR-004, FR-007, FR-010, FR-011, NFR-001, NFR-002, NFR-003, NFR-004, NFR-005  
**Delivers:** A coherent production build whose gateway and workspace look professional, remain truthful, and are verified with shareable desktop/mobile screenshots.

### Work
- [x] Consolidate visual tokens around cool neutral page/working surfaces while preserving navy, moss, amber, rust, slate, serif, and monospace evidence cues.
- [x] Remove gradient backgrounds, negative/tracked label spacing, undersized operational text, and excessive equal-weight controls.
- [x] Add consistent visible focus, restrained hover/transition behavior, reduced-motion handling, low-radius surfaces, and stable responsive dimensions.
- [x] Audit component structure for unnecessary wrappers, nested cards, duplicated state/source logic, and unsupported UI additions; consolidate where removal improves clarity.
- [x] Refresh `public/sancussight-workspace.webp` from the completed synthetic workspace so the gateway image matches the delivered product.
- [x] Run the complete landing, demo, connection, export/share, navigation, grouped findings, Registry, Exit Test, and Queue story at desktop and mobile viewports.
- [x] Capture final landing and workspace screenshots at 1280x720 and 390x844 and inspect them for blank media, overlap, clipping, contrast, and unintended horizontal scroll.
- [x] Confirm production output contains no external runtime request, account flow, connector, score, chart, candidate execution, or changed signal semantics.

### Acceptance Criteria
- [x] The first viewport is clearly SancusSight, shows both commands, and leaves a visible hint of the trust strip at desktop and mobile sizes.
- [x] The entry visual shows the actual synthetic product state and loads from the static bundle.
- [x] Workspace hierarchy is calmer without reducing evidence access or introducing a composite score.
- [x] Text, controls, navigation, details, and Queue do not overlap or clip at either required viewport.
- [x] Keyboard focus is visible and color is never the only status meaning.
- [x] No operational text is smaller than approximately 0.72rem.
- [x] Production build passes and browser console/network checks show no blocking error or external runtime request.
- [x] Four final screenshots are available to share with the user.

### Files
- `src/index.css` - modify
- `src/App.tsx` - simplify only if integration reveals duplicate orchestration
- `src/components/*.tsx` - focused polish and consolidation only where required
- `public/sancussight-workspace.webp` - refresh
- `artifacts/screenshots/sancussight-landing-desktop.png` - create verification artifact
- `artifacts/screenshots/sancussight-landing-mobile.png` - create verification artifact
- `artifacts/screenshots/sancussight-workspace-desktop.png` - create verification artifact
- `artifacts/screenshots/sancussight-workspace-mobile.png` - create verification artifact

### Verification
- [x] `npm run build`
- [x] `rg -n "linear-gradient|radial-gradient|letter-spacing|tracking-" src`
- [x] `rg -n -i "fetch\(|axios|supabase|websocket|eventsource" src package.json`
- [x] Browser console and network inspection on the production preview.
- [x] Screenshot inspection at 1280x720 and 390x844 for landing and workspace.
- [x] Final source scan confirms deterministic evaluation and ontology-governance semantics were not modified outside approved presentation/data-mode work.


## Verification Evidence

- `npm run verify:core` - PASS; provenance, legacy normalization, demo cloning, grouped findings, and hash routing assertions passed.
- `npm run build` - PASS; TypeScript and Vite production build completed with the bundled product image.
- Style/source scans - PASS; no gradients, tracked labels, undersized operational text, external runtime data path, legacy fallback storage API, or browser alert remains.
- Browser desktop 1280x720 - PASS; gateway, demo workspace, grouped Overview, navigation, share provenance, Registry, candidate detail, Exit Test, and Queue inspected.
- Browser mobile 390x844 - PASS; first-viewport commands, trust-strip hint, one-line navigation, Queue reflow, bounded matrix scroll, candidate disclosures, and zero page-level horizontal overflow verified.
- Interaction checks - PASS; demo edits left localStorage unchanged, direct missing-workspace recovery showed inline guidance, history back/forward reconstructed routes, secondary navigation closed on selection, share dialog closed with Escape, and browser console had no warnings or errors.
- File chooser follow-up — complete on 2026-07-24. Manual operating-system
  chooser verification rejected the invalid QA registry inline without
  replacing the active workspace, then connected the valid QA registry with
  current source/read/write state visible.
