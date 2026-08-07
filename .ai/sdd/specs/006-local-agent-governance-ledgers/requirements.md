# Feature: Local Agent Governance Ledgers

> Status: Approved
> Source: `.ai/sdd/ideas/001-local-agent-governance-ledgers.md`

## Overview

SancusSight shall provide a local, read-only governance view over interoperable ledgers produced by AI agents, runtime hooks, workflow systems, control gateways, and assurance tools. The feature connects logical asset inventory, work intent, runtime activity, control decisions, human approvals, execution effects, outcomes, and verification evidence without making SancusSight the operator or enforcement authority for upstream tools.

The first release serves one user governing Codex CLI and Claude Code activity on one Windows PC. It extends the existing evidence-ledger foundation with FindMnemo and FlowSensa context, a common governance event contract, truthful lineage, a personal control profile, and proportionate good-friction recommendations.

## Business Context

SancusSight currently demonstrates governance evidence after compatible artifacts exist. A local equivalent of an enterprise agent-governance layer requires a broader chain: what work was authorized, which agent and tools acted, which policy applied, whether a human decision was required, what effect occurred, and whether the outcome was accepted and verified.

The product should preserve the Singapore Model AI Governance Framework's balanced approach: bound risk, maintain meaningful human accountability, implement lifecycle controls, and retain room for productive use. The Cloud Security Alliance AICM is an attributed source catalogue, not a user-facing checklist to reproduce wholesale. Control recommendations must be selected for the user's observed local environment and avoid enterprise-scale administration.

## Definitions

- **Governance event:** A versioned, provenance-bearing record representing an inventory observation, activity, proposed action, policy decision, human decision, execution effect, outcome, or verification result.
- **Logical asset:** An agent, runtime, model, MCP server, tool, plugin, loop, workflow, policy, permission set, data object, or control relevant to local AI activity.
- **Canonical lineage:** An evidence-backed relationship from work intent through agent action and policy decision to observed effect, outcome, and proof.
- **Producer:** An independently operated source that emits governance events or source artifacts.
- **Enforcement point:** An upstream runtime, harness, MCP gateway, network mediator, or tool boundary capable of constraining an action before it executes.
- **Good friction:** User interruption proportional to consequence, sensitivity, privilege, reversibility, destination, and policy rather than novelty alone.
- **Control profile:** A small, versioned set of locally applicable controls with source-framework references and observable evidence expectations.

## User Stories

### US-001: See a complete local AI inventory

**As a** local AI power user  
**I want to** see the agents, runtimes, models, MCP servers, tools, loops, policies, and permission sets observed on my PC  
**So that** I know what can act and what governance coverage it has

**Acceptance Criteria:**
- [ ] The inventory distinguishes observed, declared, inferred, stale, removed, and unverified assets.
- [ ] Every visible asset identifies its source, observed time, stable identity or unresolved identity state, and available version information.
- [ ] Missing ownership, purpose, permission, policy, or lifecycle information is shown as a gap rather than silently defaulted.

### US-002: Trace work from intent to outcome

**As a** governance-minded builder  
**I want to** follow a work item from FindMnemo intent through agent activity, control decisions, effects, and FlowSensa outcomes  
**So that** I can understand what happened and why without opening every source tool

**Acceptance Criteria:**
- [ ] A lineage view separates intent, agent, action, decision, approval, effect, outcome, and proof.
- [ ] Links are created only from stable shared identity or an explicitly confirmed binding.
- [ ] Missing links, conflicting evidence, and inferred relationships remain visibly distinct from observed facts.
- [ ] The user can inspect source provenance for every lineage node and relationship.

### US-003: Understand controls without enterprise burden

**As a** person using AI for local coding  
**I want to** receive a small set of relevant control recommendations  
**So that** higher-risk behavior gains useful friction without routine work becoming annoying

**Acceptance Criteria:**
- [ ] Recommendations are tied to observed assets, actions, gaps, or assurance evidence.
- [ ] Each recommendation explains consequence, proposed friction tier, evidence needed, source-framework reference, and recommendation confidence.
- [ ] Routine approved reads remain non-interruptive by default.
- [ ] Recommendations do not imply that a control is enforced or effective without independent evidence.

### US-004: Distinguish advice from enforcement

**As a** security-conscious user  
**I want to** know whether an action was merely logged, advised, approved, constrained, or blocked  
**So that** observability is never presented as protection

**Acceptance Criteria:**
- [ ] Every control decision identifies the decision authority, policy version, outcome, time, and evidence qualification.
- [ ] Agent self-reports, runtime observations, human decisions, and gateway enforcement receipts use distinct truth states.
- [ ] SancusSight never presents a recommendation or post-execution finding as an in-path control.

### US-005: Preserve accountable human decisions

**As a** local AI user  
**I want to** retain approvals, rejections, overrides, exceptions, rationale, scope, and expiry  
**So that** consequential agent behavior remains attributable to a human decision

**Acceptance Criteria:**
- [ ] Human decisions bind to a stable action, policy, scope, and decision-maker identity.
- [ ] Expired, revoked, mismatched, or broader-than-requested decisions cannot appear valid for a later action.
- [ ] Model-generated advice is visible as supporting context and never recorded as the human's rationale without confirmation.

### US-006: Add producers without redesigning SancusSight

**As a** maintainer  
**I want to** connect another supported runtime or governance tool through the common ledger contract  
**So that** source growth does not create a separate product model for every adapter

**Acceptance Criteria:**
- [ ] Compatible events can be imported from an explicitly selected file path or an approved local collector source.
- [ ] Unknown event versions or unsupported event types fail visibly without invalidating unrelated sources.
- [ ] Source-specific fields remain behind provenance references unless promoted through an approved contract revision.

## Functional Requirements

### FR-001: Versioned governance event contract - Must Have

WHEN an approved producer supplies a governance record  
THE SYSTEM SHALL validate it against a versioned common contract covering event identity, event type, observed time, source, subject identities, truth state, bounded payload, and provenance  
SO THAT records from different producers can be evaluated consistently.

### FR-002: Logical asset inventory - Must Have

WHEN inventory observations are accepted  
THE SYSTEM SHALL maintain a local view of agents, runtimes, models, MCP servers, tools, plugins, loops, workflows, policies, permission sets, data objects, and controls with source-qualified state and freshness.

### FR-003: Five ledger views - Must Have

THE SYSTEM SHALL provide coherent views for inventory, activity, control decisions, human decisions, and outcomes while preserving their relationships through canonical identities.

### FR-004: FindMnemo context source - Must Have

WHEN compatible FindMnemo observed-work or work-event evidence is supplied  
THE SYSTEM SHALL accept intent, case, actor, object, decision, evidence, accepted-outcome, and handoff context without treating FindMnemo as runtime enforcement proof.

### FR-005: FlowSensa workflow source - Must Have

WHEN compatible FlowSensa evidence is supplied  
THE SYSTEM SHALL accept observed or derived workflow, transition, handoff, resource, outcome, and process-risk context while preserving its truth state and upstream provenance.

### FR-006: Existing assurance-source compatibility - Must Have

THE SYSTEM SHALL correlate compatible Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap evidence without weakening their approved source qualification, privacy, verification, or operational-readiness rules.

### FR-007: Evidence-backed lineage - Must Have

WHEN records share stable canonical identity or a confirmed binding  
THE SYSTEM SHALL show their lineage; otherwise THE SYSTEM SHALL show an unresolved or inferred relationship and SHALL NOT present it as observed fact.

### FR-008: Truth and authority separation - Must Have

THE SYSTEM SHALL distinguish declared agent context, independent runtime observation, probabilistic inference, deterministic policy decisions, human decisions, enforced outcomes, and verified evidence in every relevant view and export.

### FR-009: Deterministic authority boundary - Must Have

WHEN a record grants authority, reports an enforcement outcome, changes control effectiveness, or changes readiness  
THE SYSTEM SHALL require deterministic policy identity and qualifying evidence and SHALL NOT rely solely on model-generated classification or rationale.

### FR-010: Personal control profile - Must Have

WHEN the system identifies an observed risk or governance gap  
THE SYSTEM SHALL evaluate it against a small, versioned local control profile derived from the Singapore agentic governance dimensions and attributed AICM references rather than presenting the complete enterprise control catalogue.

### FR-011: Good-friction recommendation - Must Have

WHEN a control recommendation is produced  
THE SYSTEM SHALL classify its proposed user experience as observe, advise, confirm, or block and explain the consequence, evidence, applicability, and confidence supporting that recommendation.

### FR-012: Human decision records - Must Have

WHEN the user records an approval, rejection, override, or exception  
THE SYSTEM SHALL preserve decision-maker identity, action identity, policy version, scope, rationale, time, expiry, revocation state, and supporting evidence.

### FR-013: Read-only product authority - Must Have

THE SYSTEM SHALL consume and visualize upstream decisions and evidence but SHALL NOT expose generic command execution, runtime supervision, scan initiation, unrestricted filesystem access, or upstream policy mutation.

### FR-014: File and collector ingestion - Must Have

WHEN the user configures an approved source  
THE SYSTEM SHALL support explicit file-path import or read-only local collector ingestion with per-source validation, freshness, failure isolation, and recovery state.

### FR-015: Privacy-preserving records - Must Have

UNLESS a separately approved requirement permits a narrower exception  
THE SYSTEM SHALL exclude raw prompts, full model responses, credentials, secrets, unrestricted command output, raw chain-of-thought, and unrestricted workspace content from normalized governance records.

### FR-016: Source and relationship health - Must Have

WHEN a source becomes stale, inaccessible, incompatible, conflicting, or unverified  
THE SYSTEM SHALL retain previously accepted evidence, identify affected lineage and control claims, and avoid degrading unrelated sources.

### FR-017: Governance export - Should Have

THE SYSTEM SHOULD export a sanitized bundle containing applicable inventory, lineage, decisions, controls, gaps, provenance, source qualifications, and explicit missing evidence.

### FR-018: Change-triggered reassessment - Should Have

WHEN a material agent, model, tool, permission, policy, destination, or control version changes  
THE SYSTEM SHOULD identify affected prior conclusions and recommend reassessment without silently invalidating historical evidence.

### FR-019: Narrow enforcement evidence - Should Have

WHEN an approved upstream enforcement point evaluates a consequential action  
THE SYSTEM SHOULD display its allow, block, escalate, advise, redact, or constrain result with action binding and verification state, while remaining unable to initiate that action.

### FR-020: Control feedback - Could Have

THE SYSTEM COULD use confirmed outcomes and user feedback to improve recommendation ordering, provided learned preferences cannot override deterministic policy or conceal applicable controls.

## Non-Functional Requirements

### NFR-001: Security and least authority

- SancusSight must remain loopback-only when using the local collector.
- A compromised or malformed producer artifact must not provide command capability or broaden filesystem access.
- Private signing keys, runtime credentials, and reusable authorization tokens must never enter the registry or governance exports.

### NFR-002: Privacy

- Normalized records must use field allowlists and data minimization.
- The user must be able to inspect retained categories and source paths.
- Absolute paths and identifiers in exports must be sanitized when they could identify the user or device.

### NFR-003: Reliability

- Ingestion must be idempotent and tolerate producer restart, collector restart, file rotation, duplicate replay, and partial source failure.
- Historical records must remain attributable to the contract and policy versions under which they were accepted.

### NFR-004: Auditability

- Every visible governance claim must link to source, observed time, qualification, truth state, parser or contract version, and available verification.
- Deterministic findings, probabilistic recommendations, source facts, and human decisions must remain distinguishable in the UI and export.

### NFR-005: Usability and good friction

- The default experience must prioritize gaps and consequential changes without requiring the user to browse a complete control framework.
- Repeated low-risk activity must not generate repeated interruptions solely because it is new telemetry.
- The UI must explain the exact condition that caused advice, confirmation, or a block recommendation.

### NFR-006: Accessibility

- Every state must use text in addition to color.
- Inventory, lineage, decision, and control views must support keyboard use, visible focus, responsive layouts, and reduced motion.

### NFR-007: Performance

- New accepted local events should become visible within the existing collector freshness window.
- The active governance views must remain usable with at least 100,000 normalized events through bounded loading or aggregation without changing evidence truth.

### NFR-008: Compatibility

- Existing registry imports, persistent file connection, manual snapshot mode, and Spec 004/005 evidence contracts must remain usable.
- Legacy FindMnemo wire identifiers such as `mnemosync` must remain readable until a separately approved migration changes them.

## Out of Scope

- Machine-wide interception of all agent, filesystem, process, or network activity.
- Replacing Agent Beacon, Praxen, Pipelock, RAMPART, AIMap, FindMnemo, or FlowSensa.
- Treating instructions inside `AGENTS.md`, `CLAUDE.md`, prompts, or model-generated logs as independent enforcement proof.
- Capturing raw chain-of-thought or unrestricted prompt, response, command, network, or file content.
- Reproducing or redistributing the complete AICM workbook.
- Automatically applying recommended controls or silently changing upstream policy.
- Cloud administration, multi-user workflows, organization-wide identity governance, or legal compliance certification.
- Universal enforcement across unsupported runtimes and tools.
- Changing Spec 005 operational release-readiness requirements.

## Decisions

### D-001: SancusSight remains a read-only governance console

**Decision:** Upstream producers and enforcement points create observations and decisions; SancusSight validates, correlates, evaluates, recommends, and visualizes them without becoming a generic supervisor or command runner.  
**Reason:** This preserves least authority and keeps evidence consumption separate from control production.  
**Source:** User agreement on 2026-07-16  
**Impacts:** FR-006, FR-013, FR-019, NFR-001, Out of Scope

### D-002: FindMnemo and FlowSensa are first-class complementary sources

**Decision:** FindMnemo supplies work intent and object lineage; FlowSensa supplies workflow and derived process context; neither is replaced by Agent Beacon.  
**Reason:** Runtime activity alone cannot establish purpose, workflow, handoff, and accepted outcome.  
**Source:** User agreement on 2026-07-16  
**Impacts:** US-002, FR-004, FR-005, FR-007

### D-003: Use five coherent ledger views over one interoperable contract

**Decision:** The product shall organize inventory, activity, control decisions, human decisions, and outcomes as related views of versioned governance events.  
**Reason:** One common contract avoids source-specific product models while preserving distinct authorities and truth states.  
**Source:** User agreement on 2026-07-16  
**Impacts:** FR-001 through FR-003, FR-008

### D-004: Good friction is consequence-based

**Decision:** Recommendations use observe, advise, confirm, and block tiers; routine approved local work remains quiet while consequential, sensitive, external, privileged, or destructive activity receives greater friction.  
**Reason:** The product must improve safety without making ordinary local coding intolerable.  
**Source:** User agreement on 2026-07-16  
**Impacts:** US-003, FR-010, FR-011, NFR-005

### D-005: Deterministic authority, probabilistic assistance

**Decision:** Deterministic logic owns identity, policy resolution, authorization evidence, signatures, expiry, enforcement claims, and readiness; models may classify, recommend, summarize, and identify anomalies with confidence and provenance.  
**Reason:** Probabilistic assistance reduces configuration burden but cannot safely grant authority or prove control effectiveness.  
**Source:** User agreement on 2026-07-16  
**Impacts:** FR-008 through FR-012, NFR-004

### D-006: Curate a personal control profile

**Decision:** Use Singapore's agentic governance dimensions as the product structure and attributed AICM references as a control source, exposing only locally applicable recommendations.  
**Reason:** A personal PC needs focused controls rather than an enterprise catalogue.  
**Source:** User agreement on 2026-07-16  
**Impacts:** FR-010, FR-011, Out of Scope

## Questions

No critical requirements questions remain open. Storage representation, canonical schema fields, correlation algorithms, adapter boundaries, and the initial control-profile contents are design-stage decisions constrained by these requirements.

## Glossary

- **Observed:** Independently recorded by a qualifying source.
- **Declared:** Reported by an agent, configuration, or user without independent runtime confirmation.
- **Inferred:** Produced by probabilistic or deterministic analysis from other evidence.
- **Human-confirmed:** Explicitly accepted or bound by the user.
- **Enforced:** Produced by a qualifying in-path control with action-bound evidence.
