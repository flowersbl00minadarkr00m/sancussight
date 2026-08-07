# Review: Persistent Local File Connector

> Status: Complete
> Date: 2026-07-12
> Verdict: Approved

## Summary

Spec 003 implements one browser-authorized canonical registry file with an IndexedDB recovery cache, explicit source state, safe refresh, deliberate conflict-aware write-back, permission recovery, snapshot fallback, local connection activity, and confirmed disconnect. The implementation preserves the static, browser-only trust boundary and existing deterministic governance behavior.

The Spec axis passes. The Standards axis passes. No blocking or high-severity
findings remain. The previously outstanding native operating-system
file-picker and browser permission-prompt smoke test passed on 2026-07-24.

## Requirement Coverage

| Requirement | Result | Evidence |
|---|---|---|
| FR-001 | Pass | `BrowserFileConnector`, persisted handles, validated `SourceController.connect`, and restore flow. |
| FR-002 | Pass | Capability-gated `LandingGateway` retains explicitly labeled snapshot import/export. |
| FR-003 | Pass | `SourceStatus` shows safe name, last read, read/write permission, and one textual sync state. |
| FR-004 | Pass | Manual refresh and coalesced visibility/focus checks validate before activation. |
| FR-005 | Pass | Registry mutations set dirty state and persist the working cache without file writes. |
| FR-006 | Pass | Pure transitions and controller preflight block refresh/write and enter `Conflict`. |
| FR-007 | Pass | Confirmed save performs permission request, fresh preflight, write, and postwrite verification. |
| FR-008 | Pass | Cache-first hydration and permission/error UI retain export, reauthorize, replace, and disconnect recovery. |
| FR-009 | Pass | Confirmed disconnect removes connection/cache records without a source delete or write. |
| FR-010 | Pass | Existing normalization, deterministic findings, Overview, Registry, Queue, Exit Test, export, and share paths remain active. |
| FR-011 | Pass | IndexedDB activity records cover source operations with safe display names and no full paths. |
| NFR-001 | Pass | Browser-local APIs only; no directory access, runtime network client, or exposed path data. |
| NFR-002 | Pass | Validation-before-activation, SHA-256 fingerprints, atomic cache transactions, preflight checks, and retained valid state. |
| NFR-003 | Pass | Native buttons, textual statuses, keyboard-operable actions, and inline recovery guidance. |
| NFR-004 | Pass | Cache-first restore, unchanged-file metadata checks, operation guard, and non-destructive focus handling. |
| NFR-005 | Pass | Static Vite build remains intact; unsupported capability uses truthful snapshot semantics. |

## Task Coverage

| Task | Result | Evidence |
|---|---|---|
| T1 | Pass | Source types and pure transition assertions in `verify:core`. |
| T2 | Pass | IndexedDB connection/cache/activity stores, migration, atomic writes, and disconnect assertions. |
| T3 | Pass | Browser adapter and controller flows verified with fake and persistent OPFS-backed handles. |
| T4 | Pass | Connect, restore, refresh, capability fallback, status UI, and responsive browser checks. |
| T5 | Pass | Dirty state, confirmed save, preflight conflict, failed-write recovery, and conflict UI. |
| T6 | Pass | Permission loss, reauthorization, replacement, cache export, activity, and safe disconnect. |
| T7 | Pass | Full verification, production inspection, responsive screenshots, and scope audit completed. |

## Design Coverage

| Decision | Result | Evidence |
|---|---|---|
| TD-001 | Pass | File System Access is progressive enhancement behind capability detection. |
| TD-002 | Pass | Handles, cache, and activity use native IndexedDB with versioned stores. |
| TD-003 | Pass | Pure state machine, file adapter, store, and orchestration controller are separated from React. |
| TD-004 | Pass | Metadata checks avoid unchanged parsing; SHA-256 identifies accepted content. |
| TD-005 | Pass | Read/write permission is requested only from explicit save or reauthorization actions. |
| TD-006 | Pass | No autosave or merge engine; concurrent changes enter an explicit conflict. |
| TD-007 | Pass | Dependency-free core assertions extend the existing verification script. |

## Spec Axis

**Result: Pass.** Approved behavior is present, task claims match the implementation, and no unapproved directory watcher, direct tool connector, backend, account, autosave, or merge behavior was introduced. Demo and snapshot sessions do not claim canonical currency.

## Standards Axis

**Result: Pass.** File and persistence side effects are isolated, source transitions are testable, browser errors are converted to safe guidance, IndexedDB connections are reused and closed on version change, and activity data is path-safe. React ownership remains stable, controls are accessible, layouts were checked at desktop and mobile sizes, and the production runtime made no external requests.

The implementation adds several concepts because the approved design requires distinct canonical source, working cache, permission, freshness, and conflict semantics. Duplicate state switches and obsolete localStorage/cache wrappers were removed. No remaining consolidation would reduce complexity without obscuring those required boundaries.

## Verification

| Check | Result |
|---|---|
| `npm run verify:core` | Pass, exit 0; provenance, grouping, route, persistence, controller, source-state, recovery, and disconnect assertions passed. |
| `npm run build` | Pass, exit 0; TypeScript and Vite production build completed. |
| `git diff --check` | Pass, exit 0; only Git line-ending notices. |
| Forbidden-capability source scan | Pass; no network client, directory picker, interval watcher, autosave, or merge path. |
| Production preview | Pass; only local JS, CSS, and WebP loaded, with no console errors or external requests. |
| Browser flow | Pass; supported/fallback landing, current, unsaved, conflict, permission-required, activity, replacement, export, and disconnect paths checked. |
| Responsive UI | Pass at 1280x720 and 390x844; no page-level horizontal overflow or incoherent overlap. |

Screenshots are in `artifacts/screenshots/` for landing, current, unsaved, permission-required, conflict, and mobile states.

## Findings

No blocking, high, medium, or low implementation findings remain.

## Follow-ups

- **Complete — 2026-07-24.** In target Chromium, the native JSON picker opened
  a populated disposable registry. `Record review today` produced `Unsaved
  changes`; `Save to source` invoked the deliberate write path; and Chromium
  provisioned write permission as expected (`Write: granted`). Verdict: PASS.

## Verdict

**Approved.** The native picker and read/write permission follow-up is
complete.
