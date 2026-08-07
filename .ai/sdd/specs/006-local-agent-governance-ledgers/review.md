# Review: Local Agent Governance Ledgers

> Requirements: @requirements.md  
> Design: @design.md  
> Tasks: @tasks.md  
> Date: 2026-07-18  
> Verdict: Approved

## Summary

The remediation reconnects the production composition root to the canonical `EvidenceEnvelopeV1` store, schedules the fixed native governance adapters, clears recovered source errors, restores consequence-first review priority, and implements the approved hosted/manual SancusSight-owned decision and binding path. The local collector now exposes non-empty governance projections from retained evidence while hosted/manual mode remains browser-local, explicitly qualified, and unable to claim local freshness or upstream enforcement.

No requirement or design contract was changed. The implementation remains read-only toward upstream producers and keeps normalized evidence/export boundaries intact.

## Coverage check

| Requirement | Status | Fresh evidence |
|---|---|---|
| FR-001 | Pass | Governance event contract, canonical IDs, typed validation, and privacy rejection pass collector tests. |
| FR-002–FR-006 | Pass | Production bootstrap projects accepted evidence and configured FindMnemo/FlowSensa/runtime-inventory adapters; live export contains 464 events across five assurance sources. |
| FR-007–FR-011 | Pass | Shared projector, lineage gaps, truth/authority separation, curated profile, and deterministic Observe/Advise/Confirm/Block controls pass tests and UI inspection. |
| FR-012 | Pass | Local API writes and hosted/manual browser-local decisions/bindings are bounded, append-only, retained, projected, and exportable. |
| FR-013–FR-016 | Pass | Loopback/session/CSRF boundary, explicit paths, allowlists, source isolation, recovery truth, and retained-history behavior pass tests and route scans. |
| FR-017–FR-020 | Pass | Sanitized bundle export/import, material-change gaps, upstream enforcement visibility without initiation, and non-authoritative feedback ordering pass tests. |
| NFR-001–NFR-004 | Pass | Privacy, least authority, idempotent persistence/replay, source-qualified provenance, and rollback checks pass. |
| NFR-005–NFR-008 | Pass | Consequence-first priority, accessible truthful UI states, bounded 100,000-event paging, and existing Spec 004/005 compatibility pass. |

## Task completion check

| Task | Status | Evidence |
|---|---|---|
| T1–T5 | Pass | Contract, adapters, projector/lineage, and deterministic controls remain covered by the collector suite and build. |
| T6 | Pass | Local decision/binding API security and append-only behavior pass route and governance tests. |
| T7 | Pass | Five-ledger UI, detail/lineage surfaces, priority order, keyboard/focus, mobile layout, and truthful states pass Playwright checks. |
| T8 | Pass | Sanitized import/export retains validated history; hosted/manual decision append survives IndexedDB reload and remains manual-qualified. |
| T9 | Pass | Full automated, route/privacy, rollback, production API, and browser verification completed in this review window. |
| R1–R5 | Pass | Remediation evidence is recorded in `tasks.md` with fresh production, recovery, hosted/manual, steering, and cross-surface proof. |

## Design check

| Design decision | Status | Evidence |
|---|---|---|
| TD-001: one model, five projections | Pass | Production and browser both rebuild the five ledgers from one shared event projector. |
| TD-002: project beside `EvidenceEnvelopeV1` | Pass | `GovernanceService` reads accepted evidence and deduplicates projected events without replacing the canonical evidence store. |
| TD-003: stable or confirmed links | Pass | Stable IDs, explicit relations, and hosted binding validation preserve unresolved links until confirmation. |
| TD-004: shared pure projector | Pass | Collector and browser use `buildGovernanceReadModel()` with no runtime-specific globals. |
| TD-005–TD-006: curated controls and deterministic recommendations | Pass | Profile references remain curated; no opaque score or model authority path was added. |
| TD-007: explicit SancusSight-owned writes | Pass | Local API and hosted/manual IndexedDB writes are separate from producer checkpoints and upstream execution. |
| TD-008: consequence-based friction | Pass | Priority now checks unresolved control/material-change gaps before inactive decisions and routine observations. |
| Migration/rollout | Pass with release caveat | Rollback preserves canonical inputs and local governance artifacts; Spec 005 release readiness still requires its separately defined fresh five-category window. |

## Standards axis

**Result: Pass.** The remediation removes the production dead path identified in the prior review, adds focused recovery and hosted-binding regressions, and keeps the implementation bounded. Source adapters remain fixed and explicit; browser writes are validated and persisted through the existing snapshot mechanism rather than introducing a second general-purpose store. Privacy, route safety, least authority, accessibility, keyboard focus, reduced-motion CSS, and responsive overflow were checked. Steering now matches the approved hosted/manual and loopback architecture.

## Spec axis

**Result: Pass.** Fresh production evidence reaches the governance read model; all previously failing FR-002, FR-004, FR-005, FR-006, and FR-014 paths are live through the composition root. Hosted/manual FR-012/TD-007 parity is implemented and verified. Recovery, priority, provenance, source isolation, export privacy, and compatibility acceptance criteria pass without changing approved requirements or design.

## Verification

| Command or check | Exit / result | Verdict |
|---|---|---|
| `npm run test:collector` | Exit 0; 69 passed | PASS |
| `npm run verify:core` | Exit 0 | PASS |
| `npm run build` | Exit 0 | PASS |
| `npm audit --audit-level=high` | Exit 0; 0 vulnerabilities | PASS |
| `scripts/verify-governance.ps1` | Exit 0 | PASS |
| `scripts/verify-operations.ps1` | Exit 0 | PASS |
| `node --test collector/__tests__/governance-rollback.test.ts` | Exit 0; 1 passed | PASS |
| Live collector API | `/api/v1/status` 200; governance export 464 projected events, 464 retained events, five current assurance-source projections, and 1,326 visible gaps | PASS |
| Playwright local | 1280×720 and 390×844; 464 bounded events, zero console errors/warnings, loopback-only dynamic requests, keyboard focus, and no horizontal overflow | PASS |
| Playwright hosted/manual | No dynamic requests, explicit manual qualification, 465 events after browser-local decision append, IndexedDB retention after reload, zero console errors/warnings, and no horizontal overflow at desktop/mobile sizes | PASS |
| Bundle privacy scan | No prohibited object keys or absolute paths in `output/playwright/spec006-governance-bundle.json`; 464 events retained | PASS |

## Issues found

No blocking issues remain for Spec 006. The product must not be described as release-ready solely from this review: Spec 005 operational readiness is a separate, freshness-bounded gate and remains `Not ready for release` when its current window is absent or expired.

## Verdict

**Approved.** Spec 006 may advance to `review:done`. Keep the release language factual: governance availability proves bounded observation and SancusSight-owned audit state, not continuous upstream enforcement or production readiness.

## T10 post-review latency remediation addendum — 2026-07-20

This addendum reviews the explicitly approved post-review performance task. It preserves the prior review and does not change the governance requirements, the Spec 005 freshness gate, or the upstream read-only boundary.

### Spec axis

**Result: Pass.** NFR-003 and NFR-007 are satisfied by file-revision caches with durable-write invalidation, defensive read arrays, concurrent independent native refresh, and a bounded active-view summary. FR-017 remains satisfied because the complete sanitized export route is unchanged and remains the explicit snapshot path. The summary retains the complete event count while capping active ledger rows and gaps; it does not transfer retained event history.

### Standards axis

**Result: Pass.** The change reuses the existing append-only stores and governance client, adds no new authority or mutation surface, rejects query parameters on the summary route, preserves export sanitization, and keeps hosted/manual mode explicit. Adapter reads run concurrently, while a store-write queue serializes append-only JSONL/checkpoint persistence. The async local export action fetches the complete bundle only when the user requests an export, removing the previous full-history transfer from routine hydration. Caches are invalidated on in-process durable writes and detect external append/replace revisions.

### Verification

| Check | Result |
|---|---|
| `npm run test:collector` | Pass; 71 tests, 0 failures. |
| `npm run verify:core` | Pass. |
| `npm run build` | Pass; collector/browser TypeScript and Vite production build. |
| `npm audit --audit-level=high` | Pass; 0 vulnerabilities. |
| `scripts/verify-governance.ps1` | Pass; route/process/external-request/privacy scan. |
| `scripts/verify-operations.ps1` | Pass; fixed operational boundary scan. |
| Read-only timing | Pass; summary 299,662 bytes / 121.9–134.1 ms; full export 6,016,186 bytes / 205.8–252.5 ms after caching. |
| Playwright | Pass; 1280×720 and 390×844, summary 200, loopback-only requests, zero console errors/warnings, visible keyboard focus, no overflow, collapsed mobile evidence sources, and zero running animations. |

### Findings and verdict

No blocking or high/medium finding remains. The bounded summary intentionally does not replace the complete export and therefore preserves explicit export portability while reducing routine UI transfer.

**Verdict: Approved.** T10 remediation is implementation-complete and review-complete. Spec 005 remains **not ready for release** unless a fresh qualifying five-category, three-runtime, failure/recovery window is present.
