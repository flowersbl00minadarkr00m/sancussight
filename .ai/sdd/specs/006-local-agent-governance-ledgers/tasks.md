# Tasks: Local Agent Governance Ledgers

> Requirements: @requirements.md
> Design: @design.md
> Status: Implementation complete

## Implementation Slices

1. **Contract foundation:** validate bounded `GovernanceEventV1` records, deterministic identities, truth states, and typed relations.
2. **Read-only evidence path:** persist native governance events and project existing `EvidenceEnvelopeV1` records without creating a second canonical assurance store.
3. **Source growth:** add FindMnemo, FlowSensa, and runtime-inventory adapters with explicit file and collector input paths.
4. **Governance read model:** build the five ledgers, evidence-backed lineage, degradation states, and change-triggered gaps from one pure projector.
5. **Good friction:** evaluate a curated personal control profile with deterministic reason codes and no opaque risk score.
6. **Accountable writes:** expose bounded decisions and binding endpoints with the existing local security boundary, plus hosted/manual parity.
7. **Visible product:** add the compact five-ledger workspace, lineage inspector, controls, decisions, outcomes, and truthful state presentation.
8. **Portable evidence:** export sanitized governance bundles and preserve existing registry, manual snapshot, collector, and legacy identifier behavior.
9. **Cross-surface proof:** verify compatibility, privacy, failure isolation, 100,000-event behavior, accessibility, and migration rollback.

## Dependency Diagram

```text
T1
|-- T2 --\
|-- T3 ---+-- T4 -- T5 --\
|         |     \         +-- T7 --\
|         +------ T6 -----/         |
|                  \               +-- T9
|                   +-- T8 --------/
```

Spec 006 uses expand-contract. Existing registry, source configuration, `EvidenceEnvelopeV1`, and ledger behavior remain usable while the governance model is added beside them. Integration with Spec 005 qualification fields consumes the stabilized contract and does not rewrite unfinished producer behavior.

## Requirement Coverage

| Requirement | Tasks | Coverage |
|---|---|---|
| FR-001 | T1 | Versioned discriminated event contract, bounded payloads, provenance, and rejection behavior. |
| FR-002 | T3, T4, T7 | Runtime inventory adapters and inventory projection with source state, freshness, and gaps. |
| FR-003 | T4, T7 | Five projections over one event model with shared canonical identities. |
| FR-004 | T3, T4 | FindMnemo current and legacy-compatible intent, case, actor, evidence, outcome, and handoff context. |
| FR-005 | T3, T4 | FlowSensa observed and inferred workflow, transition, handoff, resource, outcome, and risk context. |
| FR-006 | T2, T4, T9 | Deterministic projection of all five Spec 005 assurance sources with qualification preserved. |
| FR-007 | T4, T6, T7 | Stable-ID and confirmed-binding lineage, visible gaps, conflicts, and provenance inspection. |
| FR-008 | T1, T4, T5, T6, T7 | Separate truth, authority, qualification, verification, human decisions, and enforcement outcomes. |
| FR-009 | T1, T5, T6, T9 | Deterministic authority guard prevents inferred or declared evidence from granting authority or readiness. |
| FR-010 | T5, T7 | Curated Singapore-dimension control profile with attributed AICM references and applicability predicates. |
| FR-011 | T5, T7 | Observe, advise, confirm, and block recommendations with consequence and reason codes. |
| FR-012 | T6, T7, T8 | Append-only human decisions with action, policy, scope, rationale, expiry, revocation, and evidence. |
| FR-013 | T2, T6, T7, T8 | Read-only upstream boundary and no generic execute, scan, filesystem, or policy-write surface. |
| FR-014 | T2, T3, T6, T8 | Explicit file-path import and read-only collector ingestion with validation and isolation. |
| FR-015 | T1, T2, T3, T8, T9 | Field allowlists, sanitizers, prohibited-field rejection, and export minimization. |
| FR-016 | T2, T4, T7, T9 | Stale, inaccessible, incompatible, conflicting, and unverified states retain history and isolate impact. |
| FR-017 | T8 | Sanitized export containing inventory, lineage, controls, decisions, gaps, provenance, and qualifications. |
| FR-018 | T4, T5, T7, T8 | Material-change detection produces reassessment gaps without rewriting historical evidence. |
| FR-019 | T2, T4, T5, T7 | Action-bound upstream enforcement evidence is visible but cannot be initiated by SancusSight. |
| FR-020 | T5 | Optional feedback ordering remains non-authoritative and cannot override deterministic controls. |
| NFR-001 | T1, T2, T3, T6, T8, T9 | Loopback, CSRF, least-authority, fixed-source, and secret-exclusion protections. |
| NFR-002 | T1, T2, T3, T8, T9 | Minimized records, inspectable retained categories, and sanitized paths/identifiers. |
| NFR-003 | T2, T4, T9 | Idempotent persistence, checkpoints, replay, rotation, restart, compaction, and source isolation. |
| NFR-004 | T1, T4, T6, T7, T8, T9 | Claim-level provenance, truth distinctions, parser versions, and verification evidence. |
| NFR-005 | T5, T7 | Consequence-first defaults, prioritized gaps, and non-annoying routine activity behavior. |
| NFR-006 | T7, T9 | Textual states, keyboard flow, focus return, responsive layout, and reduced motion. |
| NFR-007 | T2, T4, T9 | Bounded paging, indexed projections, and 100,000-event verification. |
| NFR-008 | T2, T3, T8, T9 | Existing imports, snapshots, collectors, Spec 004/005 contracts, and legacy IDs remain usable. |

## Implementation Readiness Check

| Check | Status | Notes |
|---|---|---|
| Must Have requirements have tasks | Pass | FR-001 through FR-016 and FR-019 are covered by bounded tasks. |
| Should Have requirements have tasks | Pass | FR-017 and FR-018 are covered by export, read-model, and UI slices. |
| Could Have requirements have tasks | Pass | FR-020 is isolated in the deterministic control-profile task and may remain feature-guarded. |
| Requirements are covered by design | Pass | Approved design mapping covers FR-001 through FR-020 and NFR-001 through NFR-008. |
| Critical questions are answered | Pass | No open Questions section remains in the approved requirements; D-001 through D-006 are reflected. |
| Tasks have dependencies, criteria, files, and verification | Pass | Nine tasks have explicit blockers, delivered behavior, likely files, acceptance criteria, and verification. |
| Verification commands are known | Pass | Existing collector, core, build, and audit commands are listed; Playwright and 100,000-event checks are marked explicit operational verification. |
| Authority and privacy boundaries are bounded | Pass | Native inputs are allowlisted; only SancusSight human decisions/bindings are writable; no upstream execution or policy mutation is added. |
| Implementation frontier exists | Pass | T1 has no incomplete blocker. |

## Frontier

Work any task whose blockers are complete.

| Task | Blocked By | Frontier Status |
|---|---|---|
| T1 | None | Complete; fresh automated evidence recorded below |
| T2 | T1 | Complete; fresh automated evidence recorded below |
| T3 | T1 | Complete; fresh automated evidence recorded below |
| T4 | T2, T3 | Complete; fresh automated evidence recorded below |
| T5 | T4 | Complete; fresh automated evidence recorded below |
| T6 | T4, T5 | Complete; fresh automated evidence recorded below |
| T7 | T4, T5, T6 | Complete; fresh automated and browser evidence recorded below |
| T8 | T4, T5, T6 | Complete; fresh automated and browser evidence recorded below |
| T9 | T2, T3, T4, T5, T6, T7, T8 | Complete; cross-surface evidence recorded below |

## Task T1: Add the governance event contract and canonical identity layer

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** none  
**Covers:** FR-001, FR-007, FR-008, FR-009, FR-015, NFR-001, NFR-002, NFR-004  
**Delivers:** A versioned, privacy-bounded `GovernanceEventV1` domain contract that can validate, sanitize, canonicalize, and deterministically identify governance records without granting authority.

### Work

- [x] Define the discriminated event, logical asset, truth, authority, provenance, relation, binding, and typed payload models.
- [x] Add JSON Schemas for the common envelope and human-decision/binding payloads with bounded strings, arrays, enums, and reject-unknown behavior.
- [x] Implement canonical reference and event ID functions that exclude `importedAt` and never hash raw paths, prompts, secrets, or unrestricted labels.
- [x] Implement sanitization and validation errors that identify safe field categories without echoing prohibited content.
- [x] Add fixtures for every event type, unknown versions/types, prohibited fields, inferred confidence, action-bound enforcement, stable IDs, and replay.

### Acceptance Criteria

- [x] Valid records round-trip with stable IDs across property order and replay.
- [x] Unknown versions, unsupported event types, prohibited fields, over-bound values, and invalid truth/authority combinations reject only the complete record.
- [x] Inferred or declared records cannot satisfy enforcement, approval, effectiveness, or readiness predicates.
- [x] No schema or error path retains raw prompts, full responses, chain-of-thought, credentials, private keys, unrestricted command output, or unrestricted workspace content.

### Files

- `src/domain/governance/model.ts` - create
- `src/domain/governance/canonicalize.ts` - create
- `collector/governance-event.ts` - create
- `contracts/governance-event.v1.schema.json` - create
- `contracts/human-decision.v1.schema.json` - create
- `collector/__tests__/governance-contract.test.ts` - create

### Verification

- [x] `npm run test:collector`
- [x] Contract fixture tests cover accepted, rejected, replayed, and privacy-sensitive records.
- [x] `npm run build`

## Task T2: Persist native events and project existing assurance envelopes

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-006, FR-013, FR-014, FR-015, FR-016, NFR-001, NFR-002, NFR-003, NFR-004, NFR-007, NFR-008  
**Delivers:** A source-isolated governance event store that accepts explicit configured files or the existing collector source path and deterministically projects Spec 004/005 evidence without duplicating canonical assurance records.

### Work

- [x] Add `governance-events.jsonl`, `governance-rejected.jsonl`, and `governance-checkpoints.json` using the existing append-only/checkpoint patterns.
- [x] Implement `projectEvidenceEnvelope()` preserving source identity, qualification, verification, freshness, outcome, and provenance by reference to the original envelope.
- [x] Add source-catalogued native ingestion and explicit file-path configuration while keeping arbitrary filesystem and command access unavailable.
- [x] Build indexes by event ID, subject, case, action, type, and observed time with bounded opaque-cursor paging.
- [x] Add replay, duplicate, restart, rotation, partial-file, unsupported-contract, source-failure, and compaction behavior without cross-source failure.

### Acceptance Criteria

- [x] Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap envelopes project into governance events without changing their Spec 005 qualification or verification semantics.
- [x] Accepted events and checkpoints are durable before a source checkpoint advances; replay is idempotent.
- [x] A malformed or inaccessible source retains prior evidence and does not block unrelated sources.
- [x] No new route accepts arbitrary paths, commands, scan requests, policy mutations, or upstream writes.
- [x] Paging is bounded and stable; retention preserves active decisions, revocations, bindings, and referenced lineage.

### Files

- `collector/governance-store.ts` - create
- `collector/adapters/projections/evidence-envelope.ts` - create
- `collector/governance-service.ts` - create
- `collector/evidence-store.ts`, `collector/envelope.ts`, `collector/config-store.ts` - modify
- `collector/__tests__/governance-store.test.ts` - create
- `collector/__tests__/fixtures/governance/` - create

### Verification

- [x] `npm run test:collector`
- [x] Restart, duplicate replay, rotation, partial JSONL, and one-source failure tests pass.
- [x] Import and page a generated 100,000-event minimized fixture with bounded response sizes.
- [x] `npm run build`

## Task T3: Add FindMnemo, FlowSensa, and runtime inventory adapters

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1  
**Covers:** FR-002, FR-004, FR-005, FR-014, FR-015, FR-016, NFR-001, NFR-002, NFR-003, NFR-004, NFR-008  
**Delivers:** First-class read-only adapters for intent/work context, workflow/process context, and an explicitly generated local runtime inventory snapshot.

### Work

- [x] Implement the FindMnemo adapter for observed-work bundles and WorkEvent `1.0.0`, preserving current and legacy `sourceType: "mnemosync"` and `mnemosync://` identifiers.
- [x] Implement the FlowSensa adapter for versioned workflow projections, preserving observed versus inferred process facts, method, version, and confidence.
- [x] Implement the runtime-inventory adapter for allowlisted Codex CLI/Claude Code runtime, model label, MCP, tool/plugin, policy, and permission-set fields.
- [x] Register the sources in the catalog and connect them to explicit file-path and collector ingestion with independent source state.
- [x] Add fixtures for current/legacy FindMnemo, observed/inferred FlowSensa, inventory omissions/removals, conflicts, unsupported versions, and privacy rejection.

### Acceptance Criteria

- [x] FindMnemo intent and accepted-outcome records are visible as context, never as runtime enforcement proof.
- [x] FlowSensa inferred workflow links remain inferred and cannot promote themselves into observed lineage.
- [x] Inventory records exclude environment variables, tokens, prompt files, unrestricted command lines, and secrets.
- [x] Missing, stale, conflicting, and incompatible sources are isolated and visibly qualified.
- [x] Legacy identifiers remain readable without rewriting source artifacts.

### Files

- `collector/adapters/findmnemo.ts` - create
- `collector/adapters/flowsensa.ts` - create
- `collector/adapters/runtime-inventory.ts` - create
- `collector/adapters/catalog.ts`, `collector/adapters/index.ts`, `collector/adapters/types.ts` - modify
- `collector/__tests__/governance-adapters.test.ts` - create
- `collector/__tests__/fixtures/findmnemo/`, `collector/__tests__/fixtures/flowsensa/`, `collector/__tests__/fixtures/runtime-inventory/` - create

### Verification

- [x] `npm run test:collector`
- [x] Current and legacy FindMnemo fixtures produce stable namespace-aware events.
- [x] FlowSensa observed/inferred and conflict fixtures preserve truth states.
- [x] Runtime inventory privacy scan confirms no prohibited field reaches normalized output.
- [x] `npm run build`

## Task T4: Build the pure five-ledger projector and lineage engine

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2, T3  
**Covers:** FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-016, FR-018, FR-019, NFR-003, NFR-004, NFR-007, NFR-008  
**Delivers:** One side-effect-free `buildGovernanceReadModel()` path that produces Inventory, Activity, Controls, Decisions, and Outcomes projections plus deterministic lineage and gap states in collector and hosted modes.

### Work

- [x] Implement entity/relation indexes and projection sequence over native events, projected envelopes, source states, and confirmed bindings.
- [x] Build the five ledger projections with bounded records, source history, freshness, qualification, and lineage counts.
- [x] Implement stable-ID and explicit-relation linking; keep fuzzy candidates unresolved until a confirmed binding exists.
- [x] Add conflict, stale, removed, expired, revoked, unmatched, missing-effect, and verified-without-effect states without rewriting historical evidence.
- [x] Add material-change detection for agent, model, tool, permission, policy, destination, and control-version changes.
- [x] Add the first red/green complete-lineage test using FindMnemo intent, Agent Beacon action, Pipelock decision, and FlowSensa outcome.

### Acceptance Criteria

- [x] All five views are projections from one event model and compatible envelope inputs, with no duplicated canonical assurance store.
- [x] A complete stable/confirmed chain shows intent, runtime, action, decision, approval, effect, outcome, and proof with provenance at every edge.
- [x] Removing one action binding changes only that edge to unresolved and prevents enforcement from appearing proven.
- [x] Fuzzy or inferred links remain visibly non-authoritative; source conflicts and degradation are local to affected claims.
- [x] The projector is importable in browser and collector contexts without Node or browser globals.

### Files

- `src/domain/governance/project.ts` - create
- `src/domain/governance/lineage.ts` - create
- `src/domain/governance/model.ts` - modify
- `collector/projections/evidence-envelope.ts` - modify or consume T2 projection
- `collector/governance-service.ts` - modify
- `src/domain/governance/__tests__/project.test.ts` - create
- `src/domain/governance/__tests__/lineage.test.ts` - create

### Verification

- [x] `npm run test:collector`
- [x] Pure projector tests pass in Node and the TypeScript browser build.
- [x] Complete, missing, inferred, conflicting, stale, expired, and revoked lineage fixtures produce distinct states.
- [x] Generated 100,000-event projection remains bounded and preserves evidence truth.
- [x] `npm run build`

## Task T5: Implement the personal control profile and deterministic good-friction engine

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T4  
**Covers:** FR-008, FR-009, FR-010, FR-011, FR-018, FR-019, FR-020, NFR-001, NFR-004, NFR-005  
**Delivers:** A curated, versioned local control profile and pure recommendation engine that emits explicit applicability, evidence gaps, confidence, reason codes, and Observe/Advise/Confirm/Block tiers.

### Work

- [x] Add `personal-agentic.v1.json` with the four Singapore-inspired dimensions, local control families, expected evidence, and attributed AICM IDs only.
- [x] Implement deterministic predicates for external destination, sensitivity, write/delete/publish effect, privilege, reversibility, permission breadth, policy presence, freshness, novelty, and approval match.
- [x] Implement `evaluatePersonalControls(readModel, profile, now)` with reason codes and no composite opaque score.
- [x] Enforce the authority guard: inferred evidence and model-generated advice can prioritize review but cannot authorize, prove enforcement, or change readiness.
- [x] Keep optional user feedback limited to recommendation ordering and never allow it to conceal or override applicable controls.

### Acceptance Criteria

- [x] Routine known local reads are Observe by default and do not create repeated interruptions solely because they are new telemetry.
- [x] Higher-consequence actions produce a clear tier, consequence, evidence needed, applicability basis, and recommendation confidence.
- [x] Unknown facts produce an evidence gap, not a permissive assumption.
- [x] Profile references are attributed and curated; the complete AICM catalogue is not copied or redistributed.
- [x] Only qualifying upstream receipts can state that an action was actually allowed or blocked.

### Files

- `controls/personal-agentic.v1.json` - create
- `src/domain/governance/controls.ts` - create
- `src/domain/governance/__tests__/controls.test.ts` - create
- `src/domain/governance/model.ts`, `src/domain/governance/project.ts` - modify

### Verification

- [x] Boundary tests cover all initial control families and all four friction tiers.
- [x] Tests prove inferred/declarative records cannot satisfy deterministic authority predicates.
- [x] `npm run test:collector`
- [x] `npm run build`

## Task T6: Add bounded governance APIs and SancusSight-owned decisions/bindings

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T4, T5  
**Covers:** FR-007, FR-008, FR-009, FR-012, FR-013, FR-014, FR-019, NFR-001, NFR-004, NFR-008  
**Delivers:** Bounded read APIs plus append-only local decision and binding writes protected by existing same-origin, session, and CSRF controls, with no upstream execution authority.

### Work

- [x] Add bounded GET routes for events, inventory, lineage, and controls with allowlisted filters and opaque cursors.
- [x] Add POST routes for human decisions and confirmed bindings using typed bodies, body limits, event-reference validation, and append-only persistence.
- [x] Require action, policy version, scope hash, decision-maker, rationale, time, expiry, supersession, and evidence references for decisions.
- [x] Validate bindings against source/entity references and preserve observed, confirmed, inferred, conflicting, and unresolved relation states.
- [x] Apply existing Host, Origin, session, CSRF, loopback, content-type, and security tests; explicitly reject execute/install/run/scan/policy-write queries.

### Acceptance Criteria

- [x] Valid reads return bounded projections and stable cursors without exposing unrestricted source payloads.
- [x] Invalid, expired, mismatched, revoked, or broader-than-requested decisions remain visible but inactive.
- [x] Human decisions and bindings change only SancusSight governance state and never producer artifacts, runtime policy, or referenced actions.
- [x] Same-origin/session/CSRF failures are rejected and cannot be bypassed through alternate routes.

### Files

- `collector/server.ts` - modify
- `collector/governance-service.ts` - modify
- `collector/security.ts`, `collector/config-store.ts` - modify
- `src/lib/governance-client.ts` - create
- `collector/__tests__/governance-server.test.ts` - create

### Verification

- [x] `npm run test:collector`
- [x] Route and process scan confirms no command, subprocess, scan, policy mutation, arbitrary filesystem, or source-write capability.
- [x] Same-origin, session, CSRF, body-size, and invalid-decision tests pass.
- [x] `npm run build`

## Task T7: Build the five-ledger governance workspace and lineage inspector

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T4, T5, T6  
**Covers:** FR-002, FR-003, FR-007, FR-008, FR-010, FR-011, FR-012, FR-016, FR-018, FR-019, NFR-004, NFR-005, NFR-006  
**Delivers:** A compact extension of the existing LEDGER workspace with Inventory, Activity, Controls, Decisions, Outcomes, and a reachable unframed Lineage inspector that presents truthful consequence-first states.

### Work

- [x] Compose `GovernanceWorkspace` with native-button tabs and preserve the existing Registry, Queue, Exit Test, evidence source rail, and release-evidence navigation.
- [x] Implement dense Inventory, Activity, Control, Decision, and Outcome ledger views using shared row/detail patterns rather than competing navigation or nested cards.
- [x] Add Lineage inspector and GovernanceDetail/RecommendationDetail surfaces with separate Assertion, Authority, Qualification, and Verification rows.
- [x] Show source health, freshness, gaps, conflicts, expired/revoked decisions, inferred links, and enforcement evidence with text labels as well as color.
- [x] Add bounded loading, empty, stale, failed, hosted/manual, keyboard, visible-focus, reduced-motion, mobile, and no-overflow states.
- [x] Keep actions limited to inspect, confirm binding, record decision, or remediation intent; never show Apply, Run, Block now, install, or scan controls.

### Acceptance Criteria

- [x] The default view prioritizes consequential unresolved gaps, expired/conflicting approvals, unverified enforcement, changed inventory, then routine observations.
- [x] Every visible governance claim exposes source, observed time, qualification, truth state, parser/contract version, and verification when available.
- [x] Users can move across tabs, open a row, inspect lineage/provenance, record a decision, and return focus to the originating row by keyboard.
- [x] Desktop and narrow layouts remain scannable without text overlap or horizontal page overflow outside intentionally scrollable tables.
- [x] Demo/simulated/manual states cannot be mistaken for operational evidence.

### Files

- `src/components/governance/GovernanceWorkspace.tsx` - create
- `src/components/governance/GovernanceTabs.tsx` - create
- `src/components/governance/InventoryLedger.tsx` - create
- `src/components/governance/ActivityLedger.tsx` - create
- `src/components/governance/ControlLedger.tsx` - create
- `src/components/governance/DecisionLedger.tsx` - create
- `src/components/governance/OutcomeLedger.tsx` - create
- `src/components/governance/LineageInspector.tsx` - create
- `src/components/governance/GovernanceDetail.tsx` - create
- `src/components/governance/RecommendationDetail.tsx` - create
- `src/lib/use-governance.ts` - create
- `src/App.tsx`, `src/components/WorkspaceNavigation.tsx`, `src/index.css` - modify

### Verification

- [x] `npm run verify:core`
- [x] `npm run build`
- [x] Playwright checks at 1280x720 and 390x844 cover the governance navigation, each empty/manual ledger, recommendation tiers, local/manual caveat, keyboard focus, console/network, and no-overflow states.
- [x] Keyboard focus, reduced-motion CSS, semantic labels, and overflow checks pass.

## Task T8: Add sanitized export and hosted/manual compatibility

**Priority:** P1  
**Estimate:** 3h  
**Blocked By:** T4, T5, T6  
**Covers:** FR-012, FR-013, FR-014, FR-017, FR-018, NFR-001, NFR-002, NFR-004, NFR-008  
**Delivers:** A local and hosted/manual governance snapshot path that exports and imports the same truthful projections while minimizing identifying and sensitive data.

### Work

- [x] Implement a sanitized governance bundle projection with inventory, lineage, decisions, controls, gaps, provenance, source qualification, verification, and missing evidence.
- [x] Replace identifying absolute paths and device/user identifiers with stable aliases while retaining internal referential integrity.
- [x] Add hosted/manual import through explicit user-selected file or existing snapshot flow; do not probe localhost or external services.
- [x] Persist manual snapshots and SancusSight-owned decisions in the existing browser-local storage pattern selected by the app.
- [x] Add export/import schema versioning, legacy compatibility, invalid bundle rejection, and clear manual qualification labels.

### Acceptance Criteria

- [x] Export contains no credentials, private keys, raw prompts/responses, chain-of-thought, unrestricted output, or identifying absolute paths.
- [x] Hosted/manual mode builds the same projections and cannot claim local collector freshness or upstream enforcement that was not present in the bundle.
- [x] Existing registry imports, persistent file connection, manual snapshots, and Spec 004/005 evidence remain usable.
- [x] Invalid, stale, or incompatible bundles fail visibly without invalidating unrelated existing local state.

### Files

- `src/domain/governance/export.ts` - create
- `src/lib/governance-snapshot-store.ts` - create
- `src/lib/governance-client.ts` - modify
- `src/lib/file-connector.ts`, `src/lib/evidence-snapshot-store.ts`, `src/types.ts` - modify
- `collector/governance-service.ts` - modify
- `collector/__tests__/governance-export.test.ts` - create

### Verification

- [x] `npm run test:collector`
- [x] Export schema and privacy scans pass on safe and prohibited fixtures.
- [x] Hosted/manual import and local collector modes produce equivalent projection states for the same bundle.
- [x] `npm run build`

## Task T9: Complete cross-surface verification and expand-contract rollout proof

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T2, T3, T4, T5, T6, T7, T8  
**Covers:** FR-001 through FR-019, NFR-001 through NFR-008  
**Delivers:** Fresh evidence that Spec 006 preserves existing behavior, satisfies the approved governance contract, and can be disabled or rolled back without deleting canonical evidence.

### Work

- [x] Run the full collector, core, build, and audit commands and record output tied to the implementation run.
- [x] Execute end-to-end lineage, decision, control, source degradation, recovery, export/import, and legacy-identifier scenarios.
- [x] Verify all existing Spec 004/005 evidence routes and UI states remain compatible, with no qualification or readiness regression.
- [x] Generate and page 100,000 minimized events; record response bounds and active-view behavior.
- [x] Run desktop/mobile Playwright checks for each ledger, keyboard and reduced-motion checks, network/console checks, and intentional table-scroll checks.
- [x] Run privacy and route/process scans for prohibited fields, arbitrary filesystem access, subprocess capability, upstream mutation, and accidental external requests.
- [x] Confirm rollback can disable governance adapters/workspace while preserving registry, evidence envelopes, configurations, native events, decisions, and exports.
- [x] Capture review evidence and leave release language factual: Spec 006 governance availability is not a claim that upstream tools are continuously enforced.

### Acceptance Criteria

- [x] `npm run test:collector`, `npm run verify:core`, and `npm run build` pass; `npm audit` result is recorded.
- [x] Every requirement has fresh automated or documented manual evidence, including edge cases and compatibility behavior.
- [x] No source failure, inferred relationship, recommendation, or observation is presented as enforcement or readiness proof.
- [x] 100,000-event behavior remains usable with bounded loading and unchanged evidence truth.
- [x] Rollback and expand-contract parity checks pass without deleting canonical Spec 004/005 evidence.

### Files

- `artifacts/qa/spec006/` - create sanitized run evidence and screenshots
- `.ai/sdd/specs/006-local-agent-governance-ledgers/tasks.md` - update execution evidence
- `.ai/sdd/specs/006-local-agent-governance-ledgers/review.md` - create after implementation
- `.ai/sdd/handoff/sdd-brief.md` - refresh after implementation or review status changes

### Verification

- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit`
- [x] Playwright desktop/mobile, accessibility, network, console, and overflow checks
- [x] 100,000-event performance and bounded-response check
- [x] Sanitized privacy, route, process, and rollback checks

## Task T10: Post-review latency remediation

**Status:** Complete; approved by the operator on 2026-07-20.

**Blocked by:** T1-T9 (complete)

**Delivers:** Lower local collector and governance-view latency without changing evidence truth, the five-minute release gate, or the read-only upstream boundary.

**Requirements:** NFR-003, NFR-007, FR-017

### Work items

- [x] Cache append-only evidence and governance reads by file revision, invalidate after durable writes, and return defensive copies so repeated polling does not reparse unchanged JSONL.
- [x] Refresh configured native governance sources concurrently while preserving per-source failure isolation.
- [x] Add a bounded governance summary endpoint for active UI hydration; retain the complete sanitized export endpoint for explicit snapshot export.
- [x] Add regression coverage for cache invalidation, summary responses, and unchanged export/privacy behavior.

### Acceptance criteria

- [x] Repeated unchanged evidence/governance reads avoid disk reparsing and remain equivalent to uncached reads.
- [x] External append/replace and in-process append/replace are observed on the next read.
- [x] Native source refresh no longer waits for unrelated configured sources, and one failure does not cancel another.
- [x] Active governance hydration does not transfer retained event history; explicit export remains complete and sanitized.
- [x] Existing release freshness, provenance, privacy, hosted/manual, and read-only boundaries remain unchanged.

### Files

- `collector/evidence-store.ts`
- `collector/governance-store.ts`
- `collector/governance-service.ts`
- `collector/server.ts`
- `src/lib/governance-client.ts`
- `src/lib/use-governance.ts`
- `collector/__tests__/evidence-store.test.ts`
- `collector/__tests__/governance-store.test.ts`
- `collector/__tests__/governance-server.test.ts`
- `artifacts/qa/spec006/`

### Verification

- [x] `npm run test:collector`
- [x] `npm run verify:core`
- [x] `npm run build`
- [x] `npm audit`
- [x] Read-only endpoint timing and response-size comparison
- [x] Privacy, route/process, and browser regression checks

### T10 remediation evidence - 2026-07-20

- `npm run test:collector` passed 71/71; new cache invalidation/defensive-copy and governance summary route tests passed alongside all existing producer, privacy, recovery, release-gate, and 100,000-event checks.
- `npm run verify:core`, `scripts/verify-governance.ps1`, `scripts/verify-operations.ps1`, `npm run build`, and `npm audit --audit-level=high` passed; audit reported 0 vulnerabilities.
- The collector now caches accepted/rejected JSONL reads by file revision, invalidates caches after durable append/replace, and returns defensive arrays. Evidence and governance store tests verified both in-process writes and external appends.
- Configured native governance sources now collect concurrently with per-source isolation while a store-write queue serializes append-only JSONL/checkpoint persistence. No upstream execution or mutation surface was added.
- `GET /api/v1/governance/summary` returns only bounded active-view projections (100 rows per ledger, 200 gaps) and retains the full event count. The complete sanitized `GET /api/v1/governance/export` remains available for explicit snapshot export.
- Read-only in-process timing against the current collector data: evidence page 4.7-26.4 ms / 125,889 bytes; bounded summary 121.9-134.1 ms / 299,662 bytes; explicit full export 205.8-252.5 ms / 6,016,186 bytes. The prior uncached full-export path measured approximately 793-1,163 ms / 6,025,129 bytes.
- Playwright local collector verification at 1280x720 and 390x844 showed summary hydration `200`, loopback-only API requests, zero console errors/warnings, visible keyboard focus, no horizontal overflow (390 document width equals viewport), collapsed mobile Evidence Sources with native `Expand evidence connections`, and zero running animations. Screenshots: `output/playwright/spec006-latency-desktop.png` and `output/playwright/spec006-latency-mobile.png`.
- Spec 005 freshness, release-gate semantics, retained evidence, privacy minimization, hosted/manual mode, and read-only upstream boundaries were not changed; SancusSight remains not release-ready without a fresh qualifying Spec 005 window.

## Verification Evidence

Populate this section during implementation. A task checkbox is complete only when fresh command output, artifact evidence, or a documented manual observation is tied to the implementation run and the verified code/configuration state.

### Review remediation frontier - 2026-07-18

The approved T1-T9 slices remain the scope. This bounded remediation pass addresses the final review findings without changing requirements or design:

- [x] R1: Project accepted Spec 004/005 envelopes at the production governance read boundary and add fixed configured ingestion for FindMnemo, FlowSensa, and runtime-inventory adapters.
- [x] R2: Clear recovered source error codes and add a failure-then-recovery regression.
- [x] R3: Persist hosted/manual SancusSight decisions and bindings in the browser-local snapshot path and preserve export/import truth.
- [x] R4: Restore consequence-first priority ordering and update stale steering to the approved loopback/hosted architecture.
- [x] R5: Re-run cross-surface verification and review with non-empty live governance ledgers.

### Remediation evidence — 2026-07-18 implementation run

- R1 — `npm run test:collector` passed 69 tests, including production `GovernanceService` projection of accepted `EvidenceEnvelopeV1` records, bounded producer identifiers, and configured runtime-inventory ingestion. The restarted collector at `http://127.0.0.1:43117` returned a sanitized governance export with 464 projected events (aimap 5, pipelock 5, praxen 17, rampart 2, runtime-telemetry 435) and retained 1,326 visible gaps without duplicating canonical evidence.
- R2 — `collector-service.test.ts` now exercises failure then recovery; the recovered source is `current` with `errorCode: undefined`. Live `/api/v1/sources` states also showed current sources without stale error codes.
- R3 — `createHostedHumanDecision` and `createHostedBinding` validate retained references, append SancusSight-owned records to the IndexedDB snapshot, rebuild through the shared projector, and export retained history. Playwright imported the sanitized bundle in hosted/manual mode, appended a bounded decision (464 → 465 events), showed the truthful upstream-unavailable message, and the IndexedDB snapshot retained 465 events after reload. Binding/export parity is covered by the hosted binding regression and bundle parser tests.
- R4 — `priorityRow()` now checks unresolved control/material-change gaps before inactive decisions and routine observations. `.ai/steering/{product,tech-stack,conventions}.md` now describes the loopback collector, hosted/manual IndexedDB boundary, bounded evidence model, and current verification commands.
- R5 — Fresh `npm run verify:core`, `npm run build`, `npm audit --audit-level=high`, `scripts/verify-governance.ps1`, `scripts/verify-operations.ps1`, and `governance-rollback.test.ts` all passed. Playwright local and hosted/manual desktop/mobile checks passed with zero console errors, no horizontal overflow, visible keyboard focus, local-only requests in local mode, and no dynamic requests in hosted/manual mode. The local governance UI showed 464 bounded events and the hosted/manual UI showed 465 after its browser-local decision append while retaining explicit manual qualification.

### T2-T3 evidence - 2026-07-16 implementation run

- `npm run test:collector` - exit 0; 36 tests passed, including append-only governance persistence, duplicate replay/checkpoint behavior, source-isolated projection, bounded paging over 100,000 minimized events, current and legacy FindMnemo, observed/inferred FlowSensa, and privacy-safe runtime inventory.
- `npm run verify:core` - exit 0; existing provenance, grouping, route, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` - exit 0; 0 vulnerabilities reported.
- Boundary observation - governance adapters accept only allowlisted records and explicit file inputs; projected Spec 005 envelopes retain their canonical identity, qualification, verification, and provenance rather than being rewritten.

### T4 evidence - 2026-07-16 implementation run

- `npm run test:collector` - exit 0; 40 tests passed, including complete intent/runtime/action/decision/approval/effect/outcome/proof lineage, missing-effect and verified-without-effect gaps, conflicting inventory, stale source, inferred activity, and expired/revoked decision states.
- `npm run build` - exit 0; the pure projector and lineage modules compile in both collector and browser TypeScript builds.
- Projector boundary observation - `buildGovernanceReadModel()` derives Inventory, Activity, Controls, Decisions, and Outcomes from one deduplicated event list; projected Spec 005 envelopes remain canonical inputs and inferred or non-verified claims never set `enforcementProven`.

### T5 evidence - 2026-07-16 implementation run

- `npm run test:collector` - exit 0; 43 tests passed, including all four friction tiers, unknown-fact evidence gaps, inferred authority rejection, and the T4 projector/lineage states.
- `npm run build` - exit 0; the browser-safe control profile and recommendation engine compile with the shared domain projection.
- Profile boundary observation - `controls/personal-agentic.v1.json` contains four curated Singapore-inspired dimensions and attributed AICM IDs only; no complete enterprise catalogue or opaque composite risk score is present.
- Authority observation - recommendations expose `enforcementProven` only for qualifying verified upstream control rows, and inferred/declarative action facts are forced to false.

### T6 evidence - 2026-07-16 implementation run

- `npm run test:collector` - exit 0; 45 tests passed, including bounded governance API reads, opaque cursor and allowlisted-filter validation, lineage lookup, same-origin/session/CSRF failures, JSON content-type and body-size limits, invalid action/evidence rejection, append-only human decisions, confirmed bindings, and inactive future/superseded decisions.
- `npm run verify:core` - exit 0; existing provenance, grouping, route, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` - exit 0; 0 vulnerabilities reported.
- Route/process boundary scan - no child-process, subprocess, generic execute, scan initiation, policy-write, arbitrary filesystem, or upstream-source-write capability is exposed by the governance API/client; unknown governance query keys return `400` and unknown governance routes return `404`.
- Persistence boundary observation - human decisions append `GovernanceEventV1` records to SancusSight-owned governance storage; bindings append to `governance-bindings.jsonl`; neither path advances producer checkpoints or mutates producer artifacts, runtime policy, or referenced actions.

### T7 evidence - 2026-07-17 implementation run

- `npm run test:collector` - exit 0; 45 tests passed, including governance API, decision/binding, future/superseded inactivity, source qualification, and 100,000-event bounded paging coverage.
- `npm run verify:core` - exit 0; existing provenance, grouping, route, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` - exit 0; GovernanceWorkspace, five ledger views, lineage/detail surfaces, local governance client, collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` - exit 0; 0 vulnerabilities reported.
- Browser QA artifacts - `output/playwright/spec006-governance/` contains desktop and mobile screenshots plus snapshots and console evidence. At 1280x720 and 390x844, governance navigation and all five empty/manual ledger states rendered; `document.documentElement.scrollWidth` matched the viewport width (1280 and 390), Tab moved focus between native controls with visible outlines, and console errors were 0.
- Hosted/manual boundary - the workspace explicitly states that no localhost request is made in hosted/manual mode; the bounded recommendation tier strip is explanatory only and states that SancusSight cannot execute, install, scan, block, or mutate upstream tools.
- Local-write boundary - the decision and binding forms are exposed only when the local governance API is live and call the T6 same-origin/session/CSRF routes; hosted/manual mode remains read-only.

### T8 evidence - 2026-07-17 implementation run

- `npm run test:collector` - exit 0; 48 tests passed, including sanitized governance bundle export/import, prohibited-field and absolute-path rejection, legacy bounded upgrade, manual freshness downgrade, governance export route, and all prior contract/API/projector coverage.
- `npm run verify:core` - exit 0; existing provenance, grouping, route, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` - exit 0; sanitized export domain, IndexedDB governance snapshot store, client import/export paths, collector export route, and browser workspace compiled and bundled.
- `npm audit` - exit 0; 0 vulnerabilities reported.
- Privacy boundary - `createGovernanceBundle()` aliases absolute paths, user identifiers, and email-like values while preserving opaque canonical/event IDs; prohibited keys are dropped and unsafe bundles are rejected. `output/playwright/spec006-governance/manual-empty-bundle.json` is a bounded manual fixture.
- Hosted/manual browser QA - explicit file chooser import succeeded, the manual qualification and “local freshness and upstream enforcement are not claimed” state rendered, IndexedDB persistence survived reload, clear removed the manual snapshot, and no console errors were observed in the clean browser run. Hosted mode made no localhost request.
- Local boundary - `GET /api/v1/governance/export` returns a sanitized `local` bundle from the same read model; local decision/binding writes remain the only governance mutation paths.

### T9 evidence - 2026-07-17 implementation run

- `npm run test:collector` - exit 0; 49 tests passed, including all governance contracts, source adapters, projection/lineage degradation states, deterministic controls, bounded API writes, sanitized export/import, legacy compatibility, rollback preservation, and the 100,000-event page-bounded test.
- `npm run verify:core` - exit 0; existing Spec 004 provenance, grouping, route, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` - exit 0; collector TypeScript, browser TypeScript, and Vite production build passed. `npm audit` - exit 0; 0 vulnerabilities reported.
- `powershell -NoLogo -NoProfile -File scripts/verify-governance.ps1` - exit 0; governance route, process, external-request, and export privacy scans passed. `scripts/verify-operations.ps1` - exit 0; fixed operational lifecycle allowlist, inventory, and process-safety checks passed.
- `node --test collector/__tests__/governance-rollback.test.ts` - exit 0; disabling the governance path preserved canonical evidence, native governance events, configuration, and restart readability without deleting or rewriting Spec 004/005 inputs.
- `output/playwright/spec006-governance/` - fresh desktop (`1280x720`) and mobile (`390x844`) screenshots/snapshots cover INVENTORY, ACTIVITY, CONTROLS, DECISIONS, and OUTCOMES. Each tab rendered without horizontal overflow; keyboard focus remained visible; reduced-motion emulation matched `prefers-reduced-motion: reduce`; console errors were 0; hosted/manual mode made no localhost request. The component uses a bounded row list rather than an HTML table, so the intentional table-scroll check is recorded as not applicable to this UI.
- Compatibility observation - the Spec 005 RELEASE EVIDENCE route still displays `Not ready for release`, 0/5 current source gates, missing runtime/producer evidence, and its read-only boundary statement after governance navigation.
- Evidence boundary - automated projector/API scenarios cover lineage, decision, control, stale/failed source, recovery/replay, export/import, and legacy identifiers. No inferred relationship, recommendation, observation, or manual snapshot is promoted to enforcement proof; Spec 005 real-source evidence remains an explicit separate qualification gate.

### T1 evidence — 2026-07-16 implementation run

- `npm run test:collector` — exit 0; 20 tests passed, including GovernanceEventV1 canonical IDs, replay stability, all prohibited-field/version/type rejection cases, inferred confidence, and enforcement authority guards.
- `npm run verify:core` — exit 0; existing provenance, routing, source-state, and evidence-correlation assertions passed unchanged.
- `npm run build` — exit 0; collector TypeScript, browser TypeScript, and Vite production build passed.
- `npm audit` — exit 0; 0 vulnerabilities reported.
- Contract/privacy observation — error guidance is bounded and does not echo prohibited payload content; raw paths cannot participate in canonical cross-source identity; Spec 004/005 `EvidenceEnvelopeV1` remains untouched as the canonical assurance record.
