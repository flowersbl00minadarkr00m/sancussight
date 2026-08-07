# Design: Contextual Source Save and Compact Asset Passport

> Requirements: `@requirements.md`
> Status: Approved

## 1. Summary

Feature 012 changes UI ownership without changing source-write semantics:

1. `SourceStatus` remains in the global header but becomes a compact truth
   indicator.
2. A dedicated `SourceWriteStrip` renders at the top of a selected Asset
   Passport and owns dirty/save/result presentation.
3. `App` separates save-specific feedback from general connection/import
   notices while retaining the existing source controller and state machine.
4. The existing six Passport sections become native `<details>` disclosures;
   Summary starts open and the other five start closed for each newly selected
   asset.

No new persistence, state machine, dependency, route, data type, or write path
is introduced.

## 2. Requirements Mapping

| Requirement | Design coverage |
|---|---|
| FR-001 | Compact `SourceStatus` in Header; §3.1 |
| FR-002 | `SourceWriteStrip` at selected Passport top; §3.2–3.4 |
| FR-003 | Existing `SourceController.save` remains the only write path; §3.3, §7 |
| FR-004 | Native `DetailSection` disclosures with keyed defaults; §3.5 |
| FR-005 | Asset-keyed defaults, existing heading focus, stable strip/section DOM; §8, §10 |
| FR-006 | Bounded prop/CSS changes and complete regression matrix; §12, §15 |
| NFR-001 | Native summary/details, textual live status, visible focus/marker; §10 |
| NFR-002 | Wrapped compact status/strip and bounded disclosure content; §10 |
| NFR-003 | Derived source truth and verified-save feedback only; §5, §7 |
| NFR-004 | No dependency, migration, duplicate DOM, route, or network change; §4, §12 |

## 3. Technical Approach

### 3.1 Compact global source truth

Keep `SourceStatus` in `Header`. Preserve its existing data source:
`RegistrySession.connection`. For a connected source it continues to render:

- safe source name;
- one textual synchronization-state label;
- last successful read/freshness;
- read and write permission; and
- refresh or reauthorize where required for source recovery.

CSS reduces spacing and visual dominance, but does not hide these facts behind
a menu or disclosure. Demo and snapshot labels remain truthful.

`Header` stops choosing `Save to source` as its primary action. Connected
workspaces keep the existing non-write utility/export behavior. This removes
the competing save action while preserving global source truth.

### 3.2 Dedicated contextual write strip

Add `src/components/SourceWriteStrip.tsx`. It receives:

```ts
interface SourceWriteStripProps {
  session: RegistrySession
  feedback?: ConnectionNotice
  onSaveSource: () => void
}
```

The strip renders only inside a selected Asset Passport. Its primary truth is
derived from `session.connection`, `session.dirty`, and
`connection.syncState`; feedback is supplementary and cannot override source
truth.

States:

| Source state | Strip behavior |
|---|---|
| demo or snapshot | No canonical-write action; omit the strip |
| current and no write feedback | Compact clean/source-current text or no strip |
| unsaved | `Unsaved changes` plus enabled `Save to source` |
| save pending | Textual pending state; save disabled |
| saved | Verified saved result from controller response |
| cancelled | Unsaved remains; cancellation guidance |
| conflict | Unsaved/conflict text; save blocked; existing recovery remains available |
| permission-required | Unsaved/permission text; existing recovery guidance remains available |
| failed | Unsaved remains; safe failure/recovery text |

The component uses a polite live region for ordinary results and alert
semantics for errors, without programmatically moving focus.

### 3.3 State ownership and feedback routing

`App` retains:

- the existing general `notice` for connect, import, refresh, collector, and
  other workspace messages; and
- a new bounded `sourceWriteFeedback` state for deliberate-write pending,
  cancellation, success, conflict, permission, and failure feedback.

`handleSaveSource` remains the only UI entry to `sourceController.save`.
Before calling it, App preserves the existing confirmation. It sets pending
feedback, invokes the controller, applies the returned session only after the
controller result, and derives the final feedback from the same
`SourceOperationResult`.

When a local asset mutation makes the session dirty, stale prior save-success
feedback is cleared. A new mutation never synthesizes a saved or failed
result. General source refresh/conflict behavior remains in the existing
notice/`ConflictPanel` path; the contextual strip also derives the current
conflict state so the Passport cannot offer save.

### 3.4 App-to-Passport integration

Extend the existing Registry view props with:

- `session`;
- `sourceWriteFeedback`; and
- `onSaveSource`.

Pass them only to the selected Asset Passport. Render `SourceWriteStrip`
immediately after the Passport heading and before section content. The
catalog, neutral no-selection state, row semantics, and selected-outside-
results explanation remain unchanged.

When there is no selected asset, the global compact indicator still exposes
`Unsaved changes`; selecting an asset exposes the save action. This follows
the approved product decision that the actionable strip belongs to the
selected Passport.

### 3.5 Native section disclosures

Replace `DetailSection`'s outer `<section>` with native `<details>` and its
heading wrapper with `<summary>`.

```tsx
<DetailSection
  key={`${asset.id}:summary`}
  title="Summary"
  truthClass="Recorded facts"
  defaultOpen
>
  ...
</DetailSection>
```

Portability, Dependencies, Evidence, Decisions, and History receive
asset-qualified keys and no `defaultOpen`. This yields the approved default
state for each newly selected asset while allowing browser-native user
toggle state to survive unrelated rerenders and save feedback changes.

The summary contains the existing section title and truth-class text. Native
marker semantics remain present; CSS styles a visible chevron/marker without
removing keyboard or assistive-technology behavior. All existing content
stays inside its owning disclosure:

- evidence bindings remain in Evidence;
- versions, aliases, Evidence Packet export, registry update/review/drill/
  coverage history remain in History; and
- check links and mutation controls remain where they currently live.

## 4. Component and File Structure

```text
Feature 012
  src/App.tsx
  src/components/Header.tsx
  src/components/SourceStatus.tsx
  src/components/SourceWriteStrip.tsx       new
  src/components/Registry.tsx
  src/index.css
  src/lib/__tests__/feature012-*.test.mjs   new focused tests
```

No new shared state module or runtime dependency is warranted.

## 5. Data and State

No registry or persistence schema changes.

`sourceWriteFeedback?: ConnectionNotice` is ephemeral App UI state. It is not
stored in the registry, working cache, IndexedDB, activity history, or source
file. Canonical truth remains `RegistrySession` plus its connection state.

Disclosure open/closed state is browser-native DOM state. It is not persisted.
Asset-qualified React keys reset defaults when selection changes.

## 6. API and Integration Contract

No network or external API change.

The source-controller contract remains unchanged:

```text
confirm -> sourceController.save(session)
  -> permission/preflight/write/postwrite verification
  -> SourceOperationResult
  -> session + safe feedback
```

No component may call a file handle or adapter directly.

## 7. Security, Permissions, and Truth

- `Save to source` still requires the existing explicit confirmation.
- Browser permission remains just-in-time and user-activated.
- The existing preflight blocks external-change conflicts.
- Success copy is derived only from a successful verified controller result.
- Cancellation, conflict, permission, and failure retain dirty/last-valid
  recovery truth.
- Compacting or relocating controls cannot hide the safe source name,
  freshness, permission, or synchronization state.
- No full path, credential, raw evidence, or unrestricted attribute is added.

## 8. User Flows

### Dirty and save

```text
Select asset
  -> Record review or other approved mutation
  -> RegistrySession becomes dirty / Unsaved changes
  -> SourceWriteStrip offers Save to source
  -> Existing confirmation
  -> Existing permission + preflight + verified write
  -> Same strip reports saved or recoverable failure
```

### Compact Passport

```text
Select asset
  -> focus selected Passport heading
  -> Summary open
  -> five secondary disclosures closed
  -> keyboard/user opens only needed sections
  -> Back/selection change uses existing focus route
```

## 9. Edge Cases

| Case | Expected behavior |
|---|---|
| Dirty source with no selected asset | Compact global state says Unsaved; no misplaced Passport action |
| User selects an asset later | Contextual strip immediately exposes save |
| Save cancelled | Strip remains Unsaved and reports cancellation |
| Permission denied | Strip stays unsaved with safe recovery text; no success |
| External source changed | Conflict blocks save; existing ConflictPanel recovery remains |
| Save succeeds while a disclosure is open | Feedback updates without collapsing the disclosure or stealing focus |
| Selected asset changes | New Passport resets Summary open and five secondary sections closed |
| Asset selected outside filtered results | Existing association explanation remains visible |
| Demo/snapshot | No canonical save claim; compact truthful source identity remains |

## 10. Accessibility and Responsive UX

- Use native `<details>/<summary>`; do not recreate disclosure behavior with
  divs, custom roles, or separate mobile DOM.
- Keep the native marker or an accessible CSS-enhanced chevron visible.
- Summary text includes the section name and truth class.
- Keyboard activation and open/closed semantics are browser-native.
- Focus continues to enter the Passport heading on narrow detail transition
  and return to the selected row or safe fallback on Back.
- Save feedback is live but non-modal and does not steal focus.
- At 320 CSS pixels/effective 200%, indicator and strip wrap; disclosure
  content owns any necessary internal overflow.
- Reduced-motion behavior remains unchanged; no disclosure animation is
  introduced.

## 11. Observability and Operations

No analytics, logging, runtime service, or deployment configuration change.
Browser acceptance records save outcomes, focus, disclosure state, viewport
metrics, console, and same-origin network behavior.

## 12. Migration and Rollout

No data migration. This is a presentation/state-routing correction over the
existing source session and Asset Passport.

Rollback removes `SourceWriteStrip`, restores Header action routing, and
restores always-open section wrappers without touching registry/source data.

## 13. Technical Decisions

### TD-001: Separate save feedback from general workspace notices

- **Decision:** Add one ephemeral App-owned save-feedback channel.
- **Why:** The action and result must move together without relocating all
  connection/import/collector notices.
- **Trade-off:** App owns one additional optional UI state.
- **Alternative:** Reuse the single global notice and mirror it in Passport;
  rejected because unrelated notices would appear as save feedback and
  duplicate live regions.

### TD-002: Source truth remains derived from RegistrySession

- **Decision:** `SourceWriteStrip` derives dirty/conflict/permission truth from
  the existing session and treats feedback as supplementary.
- **Why:** A presentation message must not become canonical state.
- **Trade-off:** The component receives both session and feedback.
- **Alternative:** Introduce a new write-state machine; rejected as duplicate
  authority.

### TD-003: Native details with asset-qualified reset

- **Decision:** Use native disclosures and asset-qualified keys; do not persist
  open state.
- **Why:** This satisfies keyboard/AT behavior with the smallest mechanism and
  gives deterministic defaults on selection.
- **Trade-off:** User-open sections reset when selecting a different asset.
- **Alternative:** Controlled accordion state or persisted preferences;
  rejected as unnecessary state and decision burden.

### TD-004: Unified corrective feature instead of three reopened specs

- **Decision:** Feature 012 owns the cross-spec presentation delta while
  predecessor requirements remain cited and preserved.
- **Why:** The requested change spans Specs 002, 003, and 008; reopening only
  one would leave conflicting authority, while reopening all three would split
  one UI behavior across multiple implementation frontiers.
- **Trade-off:** Review must explicitly reconcile all predecessor contracts.
- **Alternative:** Independent amendments in each predecessor; rejected due to
  ownership overlap and inconsistent rollout risk.

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Save action becomes unreachable without a selection | Medium | Global Unsaved state remains visible; selected Passport is the explicit action owner; browser test no-selection then selection |
| Stale success survives a new edit | High | Clear save-success feedback on dirty mutation; derive truth from session |
| Details collapse after unrelated rerender | Medium | Native DOM state plus stable asset/section keys; regression test save feedback while open |
| Conflict or permission recovery is weakened | High | No controller/state-machine change; full Spec 003 browser matrix |
| Passport content is accidentally omitted | High | Static inventory and expanded-content browser assertions for all six sections |
| Narrow layout creates overflow | Medium | 320px/effective-200 matrix with internal overflow metrics |

## 15. Verification Strategy

- Focused static/component tests:
  - Header has no source-save action but retains source truth.
  - selected Passport receives one write strip;
  - all six section identities exist exactly once;
  - Summary defaults open and five named sections default closed;
  - Evidence bindings remain in Evidence and version/packet controls in
    History;
  - no duplicate responsive Passport DOM.
- Existing regression suites: Features 008–011, collector, compiler,
  `verify:core`, and production build.
- Real Chromium:
  - current -> mutate -> unsaved -> confirm/cancel/success/failure;
  - conflict and permission recovery;
  - disclosure keyboard operation and rerender stability;
  - selected-row association and narrow Back focus;
  - 320 CSS pixels/effective 200%, console, and same-origin traffic.
- Hosted: exact reviewed artifact, canonical URL, same interaction subset,
  static byte continuity, console/runtime errors.
- Preferred first red seam: a selected Passport exposes one contextual
  `Unsaved changes`/`Save to source` strip while Header retains compact source
  truth and no competing save action.

## 16. Implementation FAQ

**Q: Does moving Save change the write controller?**  
A: No. The same confirmation and `sourceController.save` path remains the only
write operation.

**Q: Where does conflict recovery live?**  
A: The existing `ConflictPanel` remains authoritative; the Passport strip
truthfully blocks save and summarizes the state.

**Q: Is Summary always forced open?**  
A: It starts open for each newly selected asset. The native disclosure remains
user-operable unless tasks explicitly preserve it as open-only; no such
restriction is required.

**Q: Are open sections remembered?**  
A: Only in current DOM state for the current selected asset. Nothing is
persisted.

**Q: Does this change Passport contents?**  
A: No. It changes the section containers and default visibility only.
