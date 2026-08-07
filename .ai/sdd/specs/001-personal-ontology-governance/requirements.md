# Feature: Personal Ontology Governance

> Status: Approved
> Source: User request on 2026-07-08 to draft a personal-PC ontology layer across FindMnemo, FlowSensa, and SancusSight

## Overview

SancusSight becomes the governance and control surface for Henry's personal operating ontology. It should register ontology assets, validate portability and ownership claims, expose control gaps, and preserve evidence about which context, skills, workflows, agents, tools, prompts, and specifications are shared by design.

This draft also evaluates whether open-source AI security and trust tools can become governed evidence sources or control adapters for SancusSight. Candidate tools include AIMap, Agent Beacon, Praxen, Pipelock, Kiji Privacy Proxy, and RAMPART. The goal is to assess fit, evidence value, licensing, operational burden, and substitution risk before deciding whether to bundle, integrate, reference, or bypass SancusSight.

## Business Context

The personal ontology will only stay useful if its key objects and actions are governed. SancusSight already tracks portable assets, controls, continuity, evidence, exit tests, and remediation queues. This feature extends that role to ontology assets and action permissions without turning SancusSight into the source of observed work or process analysis.

Current source check on 2026-07-09 found these candidate mappings:
- AIMap: attack-surface discovery and security testing for exposed AI endpoints; MIT license; authorized testing only. Source: https://github.com/BishopFox/aimap
- Agent Beacon: local/CI/cloud telemetry layer for AI agent activity using an OpenTelemetry-aligned model; MIT license. Source: https://github.com/Asymptote-Labs/agent-beacon
- Praxen: agent behavior verifier comparing declared policy against code, deployment state, or behavioral evidence; Apache-2.0 license with CC BY-SA knowledge-base notices. Source: https://github.com/open-agent-ai-security/praxen
- Pipelock: AI agent firewall / verifiable egress control with signed action receipts; core Apache-2.0 with enterprise licensing boundaries. Source: https://github.com/luckyPipewrench/pipelock
- Kiji Privacy Proxy: local privacy proxy that detects and masks PII before AI API/chat traffic leaves user control; Apache-2.0 license. Source: https://github.com/dataiku/kiji-proxy
- RAMPART: pytest-native safety and security testing framework for agentic AI applications; MIT license. Source: https://github.com/microsoft/RAMPART

## User Stories

### US-001: Register ontology assets

**As a** governance-minded builder  
**I want to** register ontology object types, link types, action types, schemas, and consumers as governed assets  
**So that** I can see what is portable, owned, shared, stale, or locked in

**Acceptance Criteria:**
- [ ] Ontology assets can be represented in the registry without replacing existing asset kinds.
- [ ] Each registered asset identifies owner, purpose, source product, supported consumers, verification date, and portability status.
- [ ] FindMnemo, FlowSensa, OSSensa, LocalCFO, and SancusSight relationships can be represented as consumers or producers.
- [ ] Stale, unverified, not-shared, and verified statuses remain visible in the coverage matrix.

### US-002: Govern action boundaries

**As a** user who wants safe cross-product workflows  
**I want to** review which ontology actions can read, propose, or write state  
**So that** agents and applications do not gain surprising authority

**Acceptance Criteria:**
- [ ] Action types identify whether they are read-only, propose-only, user-confirmed write, or automated write.
- [ ] Each action records required controls, confirmation expectations, reversibility, and evidence needs.
- [ ] High-risk or irreversible actions are flagged for remediation.
- [ ] Action controls do not silently grant permissions in other products.

### US-003: Run ontology exit tests

**As a** tool evaluator  
**I want to** test whether ontology contracts can survive platform or storage changes  
**So that** my personal operating system does not become dependent on one app, cloud service, or naming convention

**Acceptance Criteria:**
- [ ] Exit tests cover schema export, evidence portability, stable IDs, action handoffs, and consumer compatibility.
- [ ] FindMnemo rename compatibility is visible as a named exit-test scenario.
- [ ] Failed exit-test checks create remediation queue items.
- [ ] Results distinguish product risk from technical implementation risk.

### US-004: Preserve evidence for accepted assets

**As a** user accepting tools or ontology contracts  
**I want to** connect accepted assets to supporting evidence, decisions, and review dates  
**So that** OSSensa and FlowSensa handoffs become governed records rather than loose notes

**Acceptance Criteria:**
- [ ] Accepted assets can reference source evidence from OSSensa, FindMnemo, FlowSensa, or manual entries.
- [ ] Review dates, rationale, owner, and scope remain visible.
- [ ] Evidence gaps are flagged instead of treated as acceptance.
- [ ] SancusSight remains the canonical accepted-asset registry.

### US-005: Assess open-source AI trust tools

**As a** governance-minded builder  
**I want to** map open-source AI security and trust tools to SancusSight evidence dimensions, control coverage, and exit tests  
**So that** I can decide which tools strengthen SancusSight and which should remain separate

**Acceptance Criteria:**
- [ ] Each candidate tool is captured with purpose, evidence type, license, runtime/data-flow assumptions, trust boundary, maintenance status, and operational burden.
- [ ] Each tool is mapped to at least one SancusSight dimension: context, skills, continuity, controls, evidence, registry checks, or exit tests.
- [ ] The registry distinguishes "reference only", "manual import", "local adapter", "bundled dependency", and "replacement candidate" integration levels.
- [ ] SancusSight can explain why a tool is accepted, rejected, deferred, or treated as an external prerequisite.
- [ ] Licensing, trademark, data egress, and authorized-use constraints are visible before any bundling decision.

### US-006: Compare SancusSight coordination against direct tool bundles

**As a** tool evaluator  
**I want to** compare a SancusSight-led governance layer against a direct bundle of open-source tools  
**So that** I can decide whether SancusSight adds durable value or is unnecessary packaging

**Acceptance Criteria:**
- [ ] The comparison shows what SancusSight uniquely adds: unified registry, evidence normalization, portability status, ownership, stale checks, remediation queue, and exit-test framing.
- [ ] The comparison shows what direct tool usage may do better: native controls, lower integration overhead, fewer abstractions, and faster tool updates.
- [ ] The decision records whether SancusSight should coordinate, embed, wrap, or defer to each tool.
- [ ] A tool can remain valuable even when it is not bundled into SancusSight.

## Functional Requirements

### FR-001: Ontology asset kinds - Must Have

WHEN a user registers or imports ontology-related material  
THE SYSTEM SHALL support governed asset records for object types, link types, action types, schemas, evidence contracts, and consumer adapters  
SO THAT personal ontology components can be tracked as first-class assets.

### FR-002: Producer and consumer mapping - Must Have

WHEN an ontology asset is shown  
THE SYSTEM SHALL identify its producing product, consuming products, supported version, verification status, and stale-risk indicators  
SO THAT dependency and portability risk is visible.

### FR-003: Action control classification - Must Have

WHEN an ontology action is registered  
THE SYSTEM SHALL classify it as read-only, propose-only, user-confirmed write, or automated write and show required controls  
SO THAT action authority is visible before use.

### FR-004: Exit-test coverage - Must Have

WHEN a user runs an exit test for ontology assets  
THE SYSTEM SHALL evaluate schema portability, stable IDs, evidence references, action handoff reversibility, and consumer compatibility  
SO THAT lock-in and breakage risks are detected.

### FR-005: Accepted asset governance - Must Have

WHEN OSSensa or another source promotes an accepted asset  
THE SYSTEM SHALL retain identity, version, license or ownership evidence, decision rationale, owner, purpose, review date, and source provenance  
SO THAT accepted assets remain auditable.

### FR-006: FindMnemo rename scenario - Should Have

WHEN ontology compatibility is reviewed  
THE SYSTEM SHOULD include a scenario for the FindMnemo rename and legacy Mnemosync identifiers  
SO THAT compatibility risk from naming changes remains explicit.

### FR-007: Local-only governance - Must Have

THE SYSTEM SHALL perform governance checks locally without external calls  
SO THAT SancusSight preserves its no-data-leaves-browser boundary.

### FR-008: Candidate tool inventory - Must Have

WHEN a user evaluates an open-source AI security or trust tool  
THE SYSTEM SHALL capture its purpose, source URL, license, evidence output, runtime requirements, data egress behavior, maintenance status, and known use constraints  
SO THAT acceptance decisions are grounded in auditable facts rather than name recognition.

### FR-009: Evidence-source mapping - Must Have

WHEN a candidate tool is recorded  
THE SYSTEM SHALL map it to the SancusSight dimensions and checks it can support, including registry checks, control coverage, telemetry evidence, privacy controls, agent behavior verification, egress controls, attack-surface discovery, and safety regression testing  
SO THAT tool fit is visible as coverage rather than a flat list.

### FR-010: Integration-level classification - Must Have

WHEN a candidate tool is assessed  
THE SYSTEM SHALL classify the intended relationship as reference only, manual import, local adapter, bundled dependency, or replacement candidate  
SO THAT SancusSight can distinguish governance coordination from tool bundling.

### FR-011: Bundle readiness gate - Should Have

WHEN a user considers bundling or distributing a candidate tool with SancusSight  
THE SYSTEM SHOULD require license compatibility, attribution, trademark review, install/update burden, security model, data-flow review, and rollback plan to be recorded  
SO THAT bundling does not create hidden legal, operational, or trust risk.

### FR-012: Direct-bundle comparison - Should Have

WHEN SancusSight and direct open-source tool usage are compared  
THE SYSTEM SHOULD show what is gained or lost across governance coverage, evidence normalization, local privacy, portability, maintenance burden, user complexity, and exit-test value  
SO THAT bypassing SancusSight remains an explicit product decision.

## Non-Functional Requirements

### NFR-001: Privacy and security
- No ontology governance data leaves the browser by default.
- SancusSight must not request or store API secrets for ontology governance.
- Action controls are advisory/governance records, not hidden permissions.

### NFR-002: Explainability
- Registry statuses and exit-test failures must identify the evidence or missing evidence behind them.
- Model-generated or imported claims cannot become verified without evidence.

### NFR-003: Portability
- Ontology governance records must be exportable in a versioned format.
- Records must preserve product names and stable identifiers separately.

### NFR-004: Usability
- Ontology governance should fit into existing Registry, Exit Test, Queue, and Activity mental models.
- Users should not need enterprise architecture vocabulary to understand risk.

### NFR-005: Legal and license hygiene
- Candidate tools must preserve source URLs, license names, and attribution notes.
- Bundling must not proceed from requirements alone; it requires a later design decision and explicit approval.
- Authorized-use constraints, especially security testing tools, must be visible in the assessment.

### NFR-006: Maintenance realism
- SancusSight must distinguish stable evidence contracts from fast-changing tool internals.
- The product should prefer importing reports or receipts over embedding complex runtimes unless bundling is explicitly justified.

## Out of Scope

- Owning FindMnemo's observed-work event store.
- Reconstructing process maps or computing process KPIs.
- Automatically granting cross-product permissions.
- Automatically installing or executing accepted software.
- Bundling, vendoring, or redistributing third-party tools without a later approved design and license review.
- Running active security tests against systems not owned by the user or not explicitly authorized.
- Cloud sync, multi-user administration, or enterprise SSO.

## Decisions

### D-001: SancusSight governs ontology assets

**Decision:** SancusSight owns governance records for ontology contracts, action controls, accepted assets, portability, and exit-test evidence.  
**Reason:** This matches its existing registry, control, evidence, and exit-test product boundary.  
**Source:** Direct user request and existing SancusSight steering  
**Impacts:** US-001, US-002, US-003, FR-001 through FR-005

### D-002: Governance does not grant authority

**Decision:** SancusSight records action controls and risks but does not silently authorize writes in other products.  
**Reason:** Governance should make trust observable without becoming a hidden permission layer.  
**Source:** Product boundary interpretation  
**Impacts:** US-002, FR-003, NFR-001, Out of Scope

### D-003: Candidate tools are assessed before they are bundled

**Decision:** AIMap, Agent Beacon, Praxen, Pipelock, Kiji Privacy Proxy, and RAMPART will first be treated as candidate evidence/control sources, not as bundled SancusSight dependencies.  
**Reason:** SancusSight's current product boundary is local-first governance and evidence normalization. Bundling security tools creates legal, update, runtime, and authorized-use obligations that need later design review.  
**Source:** User request on 2026-07-09 and source check on 2026-07-09  
**Impacts:** US-005, US-006, FR-008 through FR-012, NFR-005, NFR-006, Out of Scope

### D-004: Manual import/export first

**Decision:** Ontology governance starts with manual import/export rather than watched files or cross-product sync.  
**Reason:** This preserves SancusSight's local-first simplicity and keeps the first approved scope focused on governance records rather than integration automation.  
**Source:** User approval on 2026-07-09; resolves Q-001 with recommended Option A  
**Impacts:** US-001, US-004, FR-001, FR-005, FR-007, NFR-001, NFR-004

### D-005: Govern outputs before bundling tools

**Decision:** SancusSight should govern outputs first and can add selected local adapters later through design approval.  
**Reason:** This keeps SancusSight positioned as the trust registry and evidence layer while avoiding premature license, update, installer, and runtime obligations.  
**Source:** User approval on 2026-07-09; resolves Q-002 with recommended Option A  
**Impacts:** US-005, US-006, FR-008 through FR-012, NFR-005, NFR-006, Out of Scope

### D-006: First assessment slice

**Decision:** The first candidate-tool assessment slice focuses on Agent Beacon, Praxen, Pipelock, and Kiji Privacy Proxy. AIMap and RAMPART remain in the broader candidate set for subsequent assessment.  
**Reason:** The first four tools map most directly to telemetry, declared-policy verification, egress control, and privacy protection, which are the strongest near-term evidence/control sources for AI workflow trust.  
**Source:** User approval on 2026-07-09; resolves Q-003 with recommended Option A  
**Impacts:** US-005, FR-008, FR-009, FR-010, NFR-006

## Questions

### Q-001: Should ontology governance import automatically or manually first?

**Status:** answered  
**Why it matters:** Automatic import improves freshness but introduces more integration behavior than SancusSight currently owns.  
**Recommended:** Option A - manual import/export first.
**Answer:** Option A - manual import/export first. See D-004.

| Option | Answer | Choose this if... | Impact |
|--------|--------|-------------------|--------|
| A | Manual import/export | You want local-first simplicity | Lower risk; user controls updates |
| B | Watched local files | You want fresher registry data | Requires local file access flow or companion process |
| C | Cross-product sync | You want integrated live governance | Larger design and privacy surface |
| Custom | User-defined behavior | None fit | Update requirements accordingly |

### Q-002: Should SancusSight bundle tools or govern their outputs?

**Status:** answered  
**Why it matters:** Bundling can create a more complete product experience, but it increases license, update, security, and runtime burden. Governing outputs preserves SancusSight's local-first registry role while allowing tools to evolve independently.  
**Recommended:** Option A - govern outputs first, then selectively add local adapters.
**Answer:** Option A - govern outputs first. See D-005.

| Option | Answer | Choose this if... | Impact |
|--------|--------|-------------------|--------|
| A | Govern outputs first | You want SancusSight to stay a trust registry and evidence layer | Lowest integration risk; strongest fit with current product boundary |
| B | Add local adapters | You want smoother imports from selected tools | More useful UX; requires per-tool schemas and version handling |
| C | Bundle selected tools | You want SancusSight to ship a full trust/control kit | Highest product completeness; requires license, updates, security review, and installer/runtime design |
| D | Bypass SancusSight | You think the open-source bundle is the actual product | Simplifies SancusSight but loses unified registry, remediation queue, and exit-test framing |
| Custom | User-defined behavior | None fit | Update requirements accordingly |

### Q-003: Which candidate tools are in the first assessment slice?

**Status:** answered  
**Why it matters:** Assessing all tools at once may slow requirements approval. A first slice can prove the mapping pattern before broader coverage.  
**Recommended:** Option A - start with Agent Beacon, Praxen, Pipelock, and Kiji Privacy Proxy because they map directly to telemetry, declared-policy verification, egress control, and privacy protection.
**Answer:** Option A - Agent Beacon, Praxen, Pipelock, and Kiji Privacy Proxy first. See D-006.

| Option | Answer | Choose this if... | Impact |
|--------|--------|-------------------|--------|
| A | Agent Beacon, Praxen, Pipelock, Kiji first | You want strongest direct fit for AI workflow trust | Clear MVP assessment with direct governance evidence |
| B | All six tools first | You want a complete post-ready comparison | Broader artifact; more research and design burden |
| C | Only tools that emit importable artifacts | You want SancusSight integration readiness first | Narrows scope to evidence contracts and report formats |
| Custom | User-defined behavior | None fit | Update requirements accordingly |

## Glossary

- **Ontology asset:** A schema, object type, link type, action type, adapter, evidence contract, or accepted tool that participates in the personal ontology.
- **Action control:** A governance record describing what an action may do, what evidence it needs, and whether user confirmation is required.
- **Exit test:** A substitution drill that checks whether an asset survives platform, storage, naming, or provider changes.
- **Evidence source:** A tool, report, receipt, log, test result, or manual record that supports a governance claim.
- **Bundled dependency:** A third-party tool distributed or installed as part of SancusSight rather than referenced or imported externally.
