# Tasks: Local Evidence Collector

> Requirements: @requirements.md
> Design: @design.md
> Status: Approved

## Requirement Coverage

| Requirement | Tasks | Notes |
|---|---|---|
| FR-001 | T2, T3 | Explicit adapter configuration and read-only validation |
| FR-002 | T3 | Agent Beacon, Praxen, and Pipelock adapters |
| FR-003 | T1, T3 | Versioned normalized envelope |
| FR-004 | T1, T3 | Content identity, parser version, and verification state |
| FR-005 | T1, T3 | Checkpoints, deterministic IDs, rotation, and restart idempotency |
| FR-006 | T2, T5 | Source API and Concept 1 source rail |
| FR-007 | T1, T3, T5 | Isolated failures, rejects, and recovery |
| FR-008 | T1, T3 | Allowlisted normalized fields and sensitive fixture checks |
| FR-009 | T2, T3, T6 | No execution or source-write surface |
| FR-010 | T4, T5 | Explicit bindings and existing governance views |
| FR-011 | T2, T5 | Hosted/manual and collector-degraded modes |
| FR-012 | T1, T2, T5 | Confirmed collector-state deletion only |
| FR-013 | T3, T5 | Later-adapter readiness catalog |
| NFR-001 | T1, T2, T3, T6 | Loopback security, field minimization, and local-only operation |
| NFR-002 | T1, T3, T6 | Append-only state, hashes, rejects, and verification states |
| NFR-003 | T4, T5 | Evidence categories, source references, and freshness |
| NFR-004 | T5, T6 | Accessible Evidence Ledger and responsive rail/drawer |
| NFR-005 | T1, T3, T6 | Incremental polling, bounded persistence, and lag |
| NFR-006 | T1, T3, T6 | Versioned contracts and adapter isolation |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | FR-001 through FR-012 are covered. |
| Should Have requirements have tasks | Pass | FR-013 is covered by adapter catalog and UI readiness. |
| Requirements are covered by design | Pass | Design mapping covers every functional and non-functional requirement. |
| Critical Questions are answered | N/A | Requirements record no critical open questions. |
| Tasks have dependencies, criteria, files, and verification | Pass | Six bounded tickets define the implementation frontier. |
| Verification commands are known | Pass | Existing core/build gates plus Node built-in collector tests and manual browser checks. |

## Frontier

| Task | Blocked By | Frontier Status |
|---|---|---|
| T1 | None | Ready after task approval |
| T2 | T1 | Blocked |
| T3 | T1, T2 | Blocked |
| T4 | T1, T3 | Blocked |
| T5 | T2, T3, T4 | Blocked |
| T6 | T5 | Blocked |

## Task T1: Establish evidence contracts and durable collector state

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** none  
**Covers:** FR-003, FR-004, FR-005, FR-007, FR-008, FR-012, NFR-001, NFR-002, NFR-005, NFR-006  
**Delivers:** Versioned envelopes, deterministic IDs, atomic configuration/checkpoints, append-only accepted/rejected evidence, and restart-safe deduplication.

### Work
- [x] Define envelope, source, checkpoint, rejection, activity, and adapter contracts.
- [x] Implement deterministic IDs, field allowlists, bounded attributes, and verification states.
- [x] Implement atomic config/checkpoint writes and append-only accepted/rejected JSONL.
- [x] Rebuild the dedupe index on startup and compact without replacing valid state prematurely.
- [x] Start red-green with repeated source bytes after restart producing exactly one accepted envelope.

### Acceptance Criteria
- [x] Accepted evidence is versioned, traceable, deterministic, and idempotent.
- [x] Invalid evidence remains quarantined and cannot advance its checkpoint.
- [x] Collector-owned deletion never reaches a configured source path.
- [x] Sensitive fixture fields are excluded from normalized output.

### Files
- `collector/envelope.ts` - create contracts and validation
- `collector/config-store.ts` - create atomic configuration state
- `collector/evidence-store.ts` - create accepted/rejected/checkpoint persistence
- `collector/__tests__/` - create Node built-in tests and fixtures
- `src/types.ts` - add shared API/evidence types

### Verification
- [x] Collector contract/store tests
- [x] `npm run verify:core`
- [x] `npm run build`

## Task T2: Deliver the secured same-origin loopback service

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-001, FR-006, FR-009, FR-011, FR-012, NFR-001  
**Delivers:** Loopback-only static UI/API hosting with constrained source routes, session/CSRF protection, and hosted-mode degradation.

### Work
- [x] Add collector startup and static `dist/` serving on loopback only.
- [x] Implement `/api/v1` status, sources, configure, refresh, disconnect, evidence, rejects, and retry routes.
- [x] Enforce Host, Origin, local session, CSRF, CSP, frame, content-type, and safe-error controls.
- [x] Reject unknown adapters and expose no generic path read, write, command, subprocess, scan, or policy route.
- [x] Add a same-origin frontend client whose failed status request degrades once to hosted/manual mode.

### Acceptance Criteria
- [x] Service cannot bind to non-loopback interfaces.
- [x] Mutations fail without valid Host, Origin, session, and CSRF state.
- [x] Hosted mode makes no repeated or automatic localhost probe.
- [x] Disconnect removes collector state but leaves source fixtures unchanged.

### Files
- `collector/main.ts`, `collector/server.ts`, `collector/security.ts` - create service
- `collector/scheduler.ts` - create coalesced polling coordinator
- `src/lib/collector-client.ts` - create frontend API client
- `package.json`, collector TypeScript config - add build/test/run commands

### Verification
- [x] Loopback HTTP/security tests
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Manual hostile Host/Origin/CSRF requests are rejected.

## Task T3: Implement the first three read-only evidence adapters

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2  
**Covers:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, FR-008, FR-009, FR-013, NFR-001, NFR-002, NFR-005, NFR-006  
**Delivers:** Incremental Agent Beacon, Praxen, and Pipelock ingestion with explicit compatibility, verification, rejection, and health behavior.

### Work
- [x] Implement Agent Beacon incremental runtime/inventory JSONL parsing and rotation handling.
- [x] Implement whole-report Praxen JSON import by supported version and content identity.
- [x] Implement Pipelock receipt/Audit Packet parsing and pinned verification-state boundary.
- [x] Exclude prompts, bodies, secrets, mappings, and unrestricted raw content with fixture assertions.
- [x] Add later-adapter readiness entries for RAMPART, Kiji Privacy Proxy, and AIMap.
- [x] Isolate adapter failures and expose lag/checkpoint/rejected counts.

### Acceptance Criteria
- [x] Initial adapters ingest supported fixtures exactly once across restart and rotation.
- [x] Unsupported versions and signature failures remain visible and do not support verified claims.
- [x] No adapter executes or modifies a source tool or artifact.
- [x] One failed adapter does not interrupt another adapter.

### Files
- `collector/adapters/*.ts` - create adapter implementations and catalog
- `collector/__tests__/fixtures/` - add source fixtures
- `collector/scheduler.ts`, `collector/evidence-store.ts` - integrate transactions

### Verification
- [x] Adapter contract and redaction tests
- [x] `npm run verify:core`
- [x] `npm run build`

## Task T4: Correlate evidence without changing human authority

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T1, T3  
**Covers:** FR-010, NFR-003  
**Delivers:** Stable-ID and confirmed-binding correlation into existing findings, activity, remediation, and exit tests with unmapped-evidence recovery.

### Work
- [x] Add optional version-compatible evidence bindings to registry assets and normalization.
- [x] Implement pure correlation by stable ID or exact binding only.
- [x] Surface unmatched records in an unmapped queue and require confirmation before canonical binding write-back.
- [x] Separate recorded facts, deterministic findings, missing evidence, and human decisions.
- [x] Ensure evidence cannot overwrite owner, accepted risk, disposition, or other human facts.

### Acceptance Criteria
- [x] Name similarity alone never attaches evidence.
- [x] Bound evidence affects only approved deterministic freshness/findings.
- [x] Unmatched evidence remains inspectable and recoverable.
- [x] Existing unchanged fixtures retain deterministic outputs.

### Files
- `src/types.ts`, `src/lib/session.ts` - extend compatible registry boundary
- `src/lib/evidence.ts` - create pure correlation
- `src/lib/registry.ts`, `src/lib/activity.ts` - integrate evidence outputs
- `scripts/verify-core.ts` - add correlation/authority assertions

### Verification
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Compare unchanged demo findings before and after integration.

## Task T5: Build the Evidence Ledger and source-health experience

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2, T3, T4  
**Covers:** FR-006, FR-007, FR-010, FR-011, FR-012, FR-013, NFR-003, NFR-004  
**Delivers:** The selected Concept 1 desktop/mobile interface grounded in actual collector and evidence state.

### Work
- [x] Refactor desktop navigation and workspace into the compact Evidence Ledger hierarchy.
- [x] Add the five-dimension summary and dense needs-attention ledger without a composite score.
- [x] Add desktop evidence-source rail and narrow-screen drawer/section with health, evidence type, freshness, and recovery.
- [x] Add source detail, rejects, refresh, configure, disconnect, and later-adapter readiness flows.
- [x] Preserve canonical registry sync state and distinguish source `Current` from safety claims.
- [x] Deliver hosted/manual, collector-degraded, stale, failed, permission, and not-configured states.

### Acceptance Criteria
- [x] Concept 1 hierarchy is recognizable while every displayed source claim is real.
- [x] Core ledger remains primary and source controls do not imply tool execution.
- [x] Health is textual, keyboard-operable, and responsive without overlap or page overflow.
- [x] Hosted/manual mode remains useful and makes no live-collector claim.

### Files
- `src/App.tsx`, `src/components/Header.tsx`, `src/components/WorkspaceNavigation.tsx` - refactor shell
- `src/components/EvidenceSources.tsx` - create rail/drawer
- `src/components/EvidenceLedger.tsx`, `src/components/EvidenceDetail.tsx` - create ledger/detail
- `src/components/Overview.tsx`, `src/index.css` - integrate and style

### Verification
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Browser/keyboard checks at 1280x720 and 390x844 across all source states.

## Task T6: Harden, package, and verify the complete local collector

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T5  
**Covers:** FR-009, NFR-001, NFR-002, NFR-004, NFR-005, NFR-006  
**Delivers:** A coherent local collector release candidate with bounded storage, security evidence, documentation, and final screenshots.

### Work
- [x] Audit and remove duplicate state, generic filesystem access, source-write capability, speculative endpoints, and unsupported UI controls.
- [x] Add retention, compaction, lag, and storage failure behavior with verification.
- [x] Verify one frontend build serves hosted and local modes without claim drift.
- [x] Document collector startup, source configuration, security boundary, degraded operation, and uninstall/data removal.
- [x] Run complete adapter, API, UI, registry, recovery, and disconnect stories.
- [x] Capture final Concept 1 screenshots for current, stale, failed, and degraded states.

### Acceptance Criteria
- [x] All requirements and task criteria have fresh evidence.
- [x] No external runtime request, wildcard bind/CORS, secret exposure, tool execution, or source mutation exists.
- [x] Collector restart, rotation, duplication, failure, and deletion behavior is deterministic.
- [x] Final UI is professional, accessible, responsive, and truthful.

### Files
- `collector/`, `src/`, `scripts/`, `package.json` - scoped hardening
- `README.md` - collector usage and boundaries
- `artifacts/screenshots/` - final visual evidence
- `.ai/sdd/specs/004-local-evidence-collector/tasks.md` - execution evidence

### Verification
- [x] Collector test command
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Network, storage, process, path, and screenshot inspection

## Verification Evidence

### T1 - 2026-07-12

- Red: `node --test collector/__tests__/evidence-store.test.ts` exited 1 before the collector test/module path existed; the first implementation run also exposed and removed non-erasable constructor parameter properties.
- Green: `npm run test:collector` exited 0 with 3 passing tests for deterministic restart deduplication, rejected-record checkpoint isolation, sensitive-field allowlisting, collector/source path separation, and source-preserving deletion.
- Core: `npm run verify:core` exited 0.
- Build: `npm run build` exited 0.

### T2 - 2026-07-12

- Green: `npm run test:collector` exited 0 with 5 passing tests, including loopback binding, strict session cookie, CSP, wrong Host, missing Origin, invalid CSRF, accepted same-origin mutation, and unknown control-route rejection.
- Core: `npm run verify:core` exited 0.
- Build: `npm run build` exited 0 and now includes `tsc -p tsconfig.collector.json` before the existing frontend build.
- Dependency audit: `npm install -D @types/node` completed with 0 vulnerabilities.

### T3 - 2026-07-12

- Upstream contract inspection: shallow clones of the official Agent Beacon, Praxen, and Pipelock repositories confirmed Beacon endpoint `1.0`, Praxen canonical findings `2.0`, and Pipelock Audit Packet `v0` boundaries.
- Green: `npm run test:collector` exited 0 with 9 passing tests covering JSONL partial/rotation behavior, redaction, report version rejection, explicit Pipelock verified/failed/unavailable states, restart deduplication, and source failure isolation.
- Core: `npm run verify:core` exited 0.
- Build: `npm run build` exited 0 with collector and frontend TypeScript checks.

### T4 - 2026-07-12

- Core: `npm run verify:core` exited 0 with exact-binding, stable-ID, name-only-unmapped, confirmed-binding immutability, source activity, and unchanged deterministic-output assertions.
- Build: `npm run build` exited 0.
- Authority check: confirmed evidence binding changes only `evidenceBindings`; owner and accepted-risk fields remain byte-for-byte equivalent.

### T5 - 2026-07-12

- Browser: real loopback mode configured Agent Beacon, Praxen, and Pipelock independently from local paths; all three reached `Current` and rendered four normalized records with Pipelock verification explicitly `unavailable`.
- States: browser checks covered not-configured, current, failed with retained evidence/rejection guidance, restart-stale with retained timestamps, and collector-degraded with four records retained and current rows downgraded to stale. A service test maps `EACCES` to `Permission required`.
- Authority: one confirmed Praxen subject binding reduced the unmapped queue and changed only the demo registry binding; name-only records remained unmapped.
- Responsive: 1280x720 and 390x844 checks reported no page-level horizontal overflow; the narrow nav no longer clips the Queue count and the mobile Sources command reaches the in-flow rail.
- Keyboard: the replacement-path field retained focus and the complete value through spaces, punctuation, and backspace.
- Screenshots: `spec004-ledger-current-desktop.png`, `spec004-ledger-current-mobile.png`, `spec004-source-failed-desktop.png`, `spec004-sources-stale-desktop.png`, and `spec004-collector-degraded-desktop.png`.
- Commands: `npm run test:collector`, `npm run verify:core`, and `npm run build` all exited 0.

### T6 - 2026-07-12

- Collector: `npm run test:collector` exited 0 with 10 passing tests for contracts, persistence, adapters, source isolation, permission mapping, restart freshness, and loopback security.
- Core: `npm run verify:core` exited 0, including hosted zero-request and local session-coalescing assertions.
- Build: `npm run build` exited 0 with collector TypeScript, frontend TypeScript, and Vite production output.
- Dependencies: `npm audit` exited 0 with 0 vulnerabilities.
- Scans: no child-process API, wildcard bind/CORS, collector outbound client, adapter write API, or inline runtime style was found. `git diff --check` exited 0 with line-ending notices only.
- Hosted preview: `Hosted / manual`, no `/api`, localhost, or external resource request, no inline styles, no console errors, and no horizontal overflow.
- Hosted snapshot: validated normalized-evidence import, IndexedDB persistence across reload, JSON export, and clear all completed successfully; the exported QA artifact is `artifacts/qa/spec004-evidence-exported.json`.
- Local preview: `Collector live`, three current sources, four retained normalized records, no external resources, no inline styles, no console errors, and no horizontal overflow.
- Exit Test: bound evidence produces a separate evidence item without changing canonical registry facts or human decisions.
- Recovery: rejected-record retry returned Praxen to current after compatible content was restored; duplicate rejection IDs remained one record.
- Retention: accepted/rejected JSONL is bounded to 10,000/1,000 normalized records per source and compacted only within collector-owned storage.
- Screenshots: final Playwright-verified current desktop/mobile, stale, failed with retry, and degraded-with-retained-evidence images are in `artifacts/screenshots/`.
- Real-tool release QA: Agent Beacon `v1.0.1`, Praxen `1.1.0`, and Pipelock `v3.1.0` produced fresh local artifacts; SancusSight accepted 16 normalized records with zero ingestion rejections. The standalone Pipelock verifier passed schema, chain, cross-check, validity, and trust checks.
- Release evidence: `artifacts/qa/spec004-real-tool-smoke.md` and `artifacts/qa/spec004-real-tool-normalized-evidence.json`.

Populate later task evidence during implementation. No task checkbox is complete without fresh command or manual evidence.
