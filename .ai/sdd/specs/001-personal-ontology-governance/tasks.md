# Tasks: Personal Ontology Governance

> Requirements: @requirements.md
> Design: @design.md
> Status: Approved

## Requirement Coverage

| Requirement | Tasks | Notes |
|-------------|-------|-------|
| FR-001, FR-002 | T1, T3 | Typed ontology assets, producer/consumer metadata, and registry presentation. |
| FR-003 | T1, T2, T3 | Typed authority records, deterministic risk checks, and visible controls. |
| FR-004, FR-006 | T2, T3 | Ontology exit scenario including FindMnemo legacy-name compatibility. |
| FR-005 | T1, T2, T3 | Accepted-asset metadata, evidence checks, and presentation. |
| FR-007 | T1, T4 | Local versioned persistence and removal of runtime cloud telemetry. |
| FR-008, FR-009, FR-010 | T1, T2, T3 | All six candidates represented; first-slice tools receive detailed assessments. |
| FR-011, FR-012 | T2, T3 | Bundle-readiness warnings and direct-bundle trade-off presentation. |
| NFR-001 | T2, T4 | Advisory controls, no secrets, no runtime external calls. |
| NFR-002 | T2, T3 | Signals identify evidence or missing evidence. |
| NFR-003 | T1 | Versioned v2 export with v1 import compatibility and stable IDs. |
| NFR-004 | T3 | Existing Registry, Exit Test, Queue, and Definitions mental models. |
| NFR-005, NFR-006 | T1, T2, T3 | Source/license/constraints retained; evidence contracts preferred over tool coupling. |

## Implementation Readiness Check

| Check | Status | Notes |
|-------|--------|-------|
| Must Have requirements have tasks | Pass | FR-001 through FR-005 and FR-007 through FR-010 are covered. |
| Requirements are covered by design | Pass | Design mapping covers FR-001 through FR-012 and NFR-001 through NFR-006. |
| Critical Questions are answered | Pass | Q-001 through Q-003 are answered by D-004 through D-006. |
| Tasks have dependencies, acceptance criteria, files, and verification | Pass | Each task below names all required fields. |
| Verification commands are known or marked manual/N/A | Pass | Baseline `npm run build` passed on 2026-07-10; manual browser checks are specified. |

## Implementation Slices

### MVP Governance Slice

- **Goal:** Represent, assess, and inspect ontology assets and candidate trust tools locally.
- **User Stories:** US-001, US-002, US-004, US-005
- **Tasks:** T1, T2, T3
- **Independent validation:** Demo registry loads all six candidate tools, shows detailed first-slice assessments, and creates explainable remediation signals without a network request.

### Portability and Local-Only Slice

- **Goal:** Prove ontology portability and restore the runtime privacy boundary.
- **User Stories:** US-003, US-006
- **Tasks:** T2, T3, T4
- **Independent validation:** Ontology exit scenario exposes FindMnemo compatibility risk, direct-bundle trade-offs are visible, and the production bundle contains no Supabase client.

## Frontier

Work any task whose blockers are complete.

| Task | Blocked By | Frontier Status |
|------|------------|-----------------|
| T1 | None | Complete |
| T2 | T1 | Complete |
| T3 | T1, T2 | Complete |
| T4 | None | Complete |

## Task T1: Extend the registry schema and local persistence

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** none  
**Status:** Complete  
**Covers:** FR-001, FR-002, FR-003, FR-005, FR-007, FR-008, FR-009, FR-010, NFR-003, NFR-005, NFR-006  
**Delivers:** Existing and ontology governance records load from one typed registry, export as schema v2, and import old v1 data without external calls.

### Work
- [x] Extend `AssetKind`, `Asset`, and supporting types for ontology categories, action controls, accepted assets, candidate tools, integration levels, and bundle readiness.
- [x] Add `schemaVersion: 2` to the registry model, demo registry, saved state, and exported JSON.
- [x] Validate the minimum import shape while accepting unversioned/v1 registries and normalizing them to v2.
- [x] Seed governed ontology records and all six candidate tools; give Agent Beacon, Praxen, Pipelock, and Kiji Privacy Proxy complete first-slice assessment metadata.
- [x] Preserve source URLs, licenses, attribution/use constraints, stable IDs, producer/consumer relationships, and direct-bundle trade-offs.

### Acceptance Criteria
- [x] Existing asset records remain valid without populating new optional metadata.
- [x] Exported data contains `schemaVersion: 2`; valid unversioned data imports successfully as v2.
- [x] Invalid registry shapes are rejected without replacing local state.
- [x] All six candidates are representable and the four first-slice candidates contain complete assessment metadata.

### Files
- `src/types.ts` - modify
- `src/lib/storage.ts` - modify

### Verification
- [x] `npm run build`
- [x] Manually inspect exported demo JSON and normalization logic for an unversioned import.

## Task T2: Add deterministic governance and ontology exit checks

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** T1  
**Status:** Complete  
**Covers:** FR-003, FR-004, FR-005, FR-006, FR-009, FR-011, FR-012, NFR-001, NFR-002, NFR-005, NFR-006  
**Delivers:** Governance records produce evidence-backed signals, and an ontology exit scenario reports schema, stable-ID, evidence, action, consumer, and FindMnemo compatibility risk.

### Work
- [x] Map every new asset kind to an existing SancusSight dimension.
- [x] Add deterministic action-control checks for authority, confirmation, reversibility, required controls, and evidence needs.
- [x] Add accepted-asset checks for identity, rationale, provenance, ownership/license evidence, scope, and review evidence.
- [x] Add candidate-tool checks for source/license metadata, egress, supported checks, integration level, authorized-use constraints, and bundle readiness.
- [x] Add a pure ontology exit scenario that distinguishes `survives`, `degrades`, and `breaks`, including FindMnemo legacy identifier compatibility.
- [x] Keep metadata findings explicit that they are not security assurance.

### Acceptance Criteria
- [x] Missing or risky metadata produces actionable signals naming the checked evidence.
- [x] Automated or irreversible writes fail when controls or evidence are insufficient.
- [x] Unknown/network egress and incomplete bundle readiness produce warnings without enabling execution.
- [x] The ontology exit scenario reports each required portability condition and separates product naming risk from technical compatibility risk.

### Files
- `src/lib/registry.ts` - modify
- `src/types.ts` - modify only if result types require it

### Verification
- [x] `npm run build`
- [x] Browser-inspect `evaluateAll` output for governed assets and intentionally incomplete egress/readiness metadata.
- [x] Browser-inspect the ontology exit result for the FindMnemo scenario.

## Task T3: Present governance records in existing product views

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T1, T2  
**Status:** Complete  
**Covers:** FR-001 through FR-006, FR-008 through FR-012, NFR-002, NFR-004, NFR-005, NFR-006  
**Delivers:** Users can inspect ontology ownership, action authority, accepted evidence, candidate-tool fit, bundle readiness, direct-bundle trade-offs, and ontology exit results without learning a new top-level navigation model.

### Work
- [x] Extend registry ordering and asset detail with compact, labeled ontology, producer/consumer, action-control, accepted-asset, and candidate-tool sections.
- [x] Render source/license/use constraints, dimensions/checks, integration level, bundle readiness, and direct-bundle trade-offs with wrapping links and text status.
- [x] Add the ontology exit scenario to the existing Exit Test view alongside workflow substitution tests.
- [x] Extend Definitions with plain-language ontology governance and integration-level concepts.
- [x] Confirm Queue reuses the new deterministic signals and asset selection behavior.
- [x] Keep status understandable without color alone and ensure compact layouts wrap on narrow viewports.

### Acceptance Criteria
- [x] Selecting each first-slice candidate shows complete governance metadata and why it is accepted, deferred, or constrained.
- [x] AIMap and RAMPART remain visible and clearly marked as later-slice assessments.
- [x] The Exit Test view displays the ontology/FindMnemo scenario with text and status glyphs.
- [x] Bundle/readiness metadata cannot be mistaken for an install or execute action.
- [x] Existing registry, workflow exit test, queue, and definitions behavior remains available.

### Files
- `src/components/Registry.tsx` - modify
- `src/components/ExitTest.tsx` - modify
- `src/components/Definitions.tsx` - modify
- `src/components/Queue.tsx` - modify only if needed for responsive presentation
- `src/App.tsx` - modify only for data/prop wiring
- `src/index.css` - modify only if existing utilities cannot support the layout

### Verification
- [x] `npm run build`
- [x] Browser check at desktop and narrow/mobile widths.
- [x] Verify first-slice tool detail, queue warning navigation, workflow exit test, and ontology exit scenario.

## Task T4: Enforce the local-only runtime boundary

**Priority:** P0  
**Estimate:** 1h  
**Blocked By:** none  
**Status:** Complete  
**Covers:** FR-007, NFR-001, TD-004  
**Delivers:** Normal SancusSight operation makes no Supabase request and exposes no cloud telemetry action or bundled client.

### Work
- [x] Remove the Supabase telemetry loader, loading state, and header action from the runtime path.
- [x] Remove the Supabase client module and package dependency.
- [x] Preserve local JSON registry import/export and JSONL activity import as the supported ingestion paths.
- [x] Correct nearby product labels that still identify the app as OSSensa when they refer to SancusSight.

### Acceptance Criteria
- [x] No source import or runtime code references Supabase.
- [x] `@supabase/supabase-js` is absent from runtime dependencies and the production bundle.
- [x] Registry import/export and Activity JSONL import remain available.
- [x] User-visible app identity is SancusSight where the current product is named.

### Files
- `src/App.tsx` - modify
- `src/components/Header.tsx` - modify
- `src/lib/supabase.ts` - delete
- `package.json` - modify
- `package-lock.json` - modify through `npm uninstall`

### Verification
- [x] `rg -n -i "supabase|ossensa|opensesamesensa" src package.json`
- [x] `npm run build`
- [x] Source-level check confirms local import/export and Activity JSONL paths remain wired; full browser check is included in T3.
