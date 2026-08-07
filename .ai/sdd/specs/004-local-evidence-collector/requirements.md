# Feature: Local Evidence Collector

> Status: Approved
> Source: User agreement on 2026-07-12 with the recommended artifact-first local evidence collection model

## Overview

SancusSight should ingest trustworthy evidence produced locally by independent AI security and trust tools without installing, configuring, or controlling those tools. A read-only local collector should observe user-approved evidence artifacts, normalize their relevant facts, preserve source provenance, and make source health and freshness visible in SancusSight.

The first supported evidence sources should be Agent Beacon, Praxen, and Pipelock. Their outputs should strengthen SancusSight's deterministic findings, coverage records, activity history, and exit tests while the canonical SancusSight registry remains a separate user-controlled source. RAMPART, Kiji Privacy Proxy, and AIMap should remain later adapters until their evidence boundaries and safety constraints are specified.

This feature introduces a bounded local companion capability and therefore changes the current static-browser-only operating boundary. It must remain local, credential-minimized, read-only toward source tools, and useful when individual sources are unavailable.

## Business Context

SancusSight currently records candidate-tool assessments and can import registry or activity artifacts manually. This is truthful but places evidence freshness on the user and does not show whether supporting evidence has changed since the last import.

The selected product direction is to govern tool outputs rather than bundle tool runtimes:

- [Agent Beacon](https://github.com/Asymptote-Labs/agent-beacon) writes normalized local runtime and inventory JSONL.
- [Praxen](https://open-agent-ai-security.github.io/praxen/) produces machine-readable JSON reports alongside human-readable reports.
- [Pipelock](https://github.com/luckyPipewrench/pipelock) emits signed action receipts and Audit Packets intended for independent verification.
- [RAMPART](https://github.com/microsoft/RAMPART) is pytest-native and can become a later safety-test evidence source.
- [Kiji Privacy Proxy](https://github.com/dataiku/kiji-proxy) runs locally but needs a deliberately sanitized evidence contract before its proxy activity is imported.
- [AIMap](https://github.com/BishopFox/aimap) exposes completed security findings but performs active testing, so ingestion must remain separate from scan authorization and execution.

The product value is not another dashboard for each tool. SancusSight should connect evidence across tools to ownership, portability, control coverage, remediation, and the question: "What breaks if this AI workflow must move tomorrow?"

## User Stories

### US-001: Connect an approved local evidence source

**As a** governance-minded builder  
**I want to** authorize a supported local evidence source  
**So that** SancusSight can maintain evidence freshness without repeatedly selecting individual reports

**Acceptance Criteria:**
- [ ] The user can configure Agent Beacon, Praxen, or Pipelock as an evidence source independently.
- [ ] Setup identifies the expected evidence type and the minimum local access being requested.
- [ ] Cancellation, invalid content, or denied access leaves existing registry and evidence state unchanged.
- [ ] SancusSight does not install, launch, reconfigure, or grant permissions to the source tool.
- [ ] Each source can be disconnected independently without deleting its original evidence.

### US-002: Understand source health and freshness

**As a** registry owner  
**I want to** see whether each evidence source is current, stale, failed, or not configured  
**So that** I know which governance conclusions are supported by recent observations

**Acceptance Criteria:**
- [ ] The workspace exposes a compact `Evidence sources` rail based on the selected Concept 1 direction.
- [ ] Every source shows its name, evidence type, last accepted evidence time, and a textual health state.
- [ ] Health distinguishes `Current`, `Stale`, `Failed`, `Permission required`, and `Not configured`.
- [ ] A source failure does not hide or invalidate unrelated sources.
- [ ] Source health never implies that SancusSight controls or operates the external tool.

### US-003: Trust imported evidence

**As a** governance-minded practitioner  
**I want to** trace every imported fact to its original artifact and collection outcome  
**So that** findings remain inspectable rather than becoming unsupported claims

**Acceptance Criteria:**
- [ ] Every accepted evidence record identifies source tool, evidence kind, observation time, import time, subject, and source artifact identity.
- [ ] Signed Pipelock evidence records whether signature verification succeeded, failed, or was unavailable.
- [ ] Duplicate or previously accepted records do not create duplicate findings or activity.
- [ ] Invalid or incompatible evidence is quarantined from governance calculations and receives actionable recovery guidance.
- [ ] Raw source evidence remains available at its original local location and is not silently rewritten.

### US-004: See what the evidence changes

**As a** tool evaluator  
**I want to** connect imported evidence to SancusSight assets, controls, and exit tests  
**So that** source activity produces useful governance outcomes rather than an isolated log viewer

**Acceptance Criteria:**
- [ ] Accepted evidence can support or challenge an existing registry claim without silently changing confirmed registry facts.
- [ ] Deterministic findings distinguish recorded facts, derived findings, missing evidence, and human decisions.
- [ ] Evidence age and source failure can mark affected conclusions stale without changing unrelated conclusions.
- [ ] Relevant findings appear in the existing Overview, Registry, Queue, Activity, and Exit Test mental models.
- [ ] The user can inspect the source evidence reference behind a finding.

### US-005: Recover safely from collector and source failures

**As a** returning user  
**I want to** keep using SancusSight when the collector or one source is unavailable  
**So that** local evidence automation does not become a new single point of failure

**Acceptance Criteria:**
- [ ] The canonical registry and last accepted evidence remain readable when the collector is stopped.
- [ ] SancusSight labels retained evidence with its actual freshness rather than presenting it as live.
- [ ] The user can retry, reauthorize, update configuration, inspect rejected evidence, or disconnect a failed source.
- [ ] Restarting collection resumes from a stable checkpoint without duplicating accepted records.
- [ ] Removing collected state requires confirmation and does not remove source-tool artifacts.

## Functional Requirements

### FR-001: Independent local source authorization - Must Have

WHEN a user configures a supported evidence source  
THE SYSTEM SHALL request only the local access needed to read that source's approved evidence artifacts  
SO THAT evidence collection remains explicit and least-privileged.

### FR-002: Initial evidence adapters - Must Have

WHEN the first collector release is used  
THE SYSTEM SHALL support Agent Beacon local JSONL, Praxen machine-readable reports, and Pipelock signed receipts or Audit Packets as independent evidence sources  
SO THAT the highest-value telemetry, behavior-verification, and egress-control evidence can be governed first.

### FR-003: Versioned normalized evidence - Must Have

WHEN supported source evidence is accepted  
THE SYSTEM SHALL normalize it into a versioned SancusSight evidence record containing source, evidence kind, observation time, import time, subject identity, outcome, provenance, and source artifact identity  
SO THAT downstream governance does not depend directly on changing tool internals.

### FR-004: Provenance and integrity status - Must Have

WHEN evidence contributes to a finding or decision  
THE SYSTEM SHALL preserve its source reference, content identity, parser version, and available verification result  
SO THAT the user can distinguish observed evidence from inferred or unverified claims.

### FR-005: Incremental and idempotent collection - Must Have

WHEN an evidence source contains new, repeated, rotated, or replaced artifacts  
THE SYSTEM SHALL resume from a stable checkpoint, accept each logical record once, and detect incompatible replacement  
SO THAT near-live collection does not create silent loss or duplicate findings.

### FR-006: Evidence-source health - Must Have

WHEN the SancusSight workspace is open  
THE SYSTEM SHALL display each configured or supported source with evidence type, freshness, last successful collection, and exactly one health state  
SO THAT users can judge the currency of governance evidence.

### FR-007: Isolated failure and recovery - Must Have

WHEN a source cannot be read, parsed, or verified  
THE SYSTEM SHALL retain the last accepted evidence, mark only the affected source and conclusions stale or failed, and offer a safe recovery action  
SO THAT one source cannot corrupt or disable the broader registry.

### FR-008: Data minimization - Must Have

WHEN source evidence is collected  
THE SYSTEM SHALL accept only fields needed for approved governance outcomes and exclude secrets, raw prompts, full request or response bodies, sensitive Kiji mappings, and unrelated file content by default  
SO THAT evidence collection does not create a more sensitive duplicate telemetry store.

### FR-009: No source-tool control - Must Have

WHEN a source is connected or refreshed  
THE SYSTEM SHALL remain read-only toward the source tool and SHALL NOT install it, execute it, trigger scans or tests, change proxy or firewall policy, or alter its evidence artifacts  
SO THAT SancusSight remains a governance layer rather than a hidden security runtime.

### FR-010: Governance correlation - Must Have

WHEN normalized evidence matches a registered asset, workflow, control, or provider dependency  
THE SYSTEM SHALL make the evidence available to existing deterministic checks, provenance views, remediation queue, activity history, and exit tests without silently overwriting confirmed facts  
SO THAT collection improves SancusSight's core trust and portability outcomes.

### FR-011: Collector-degraded operation - Must Have

WHEN the local collector is unavailable  
THE SYSTEM SHALL keep the canonical registry and last accepted evidence usable, display actual freshness, and preserve manual import/export recovery  
SO THAT the collector is not a single point of failure.

### FR-012: Safe source disconnection and deletion - Must Have

WHEN a user disconnects a source or removes its collected state  
THE SYSTEM SHALL require confirmation, stop future collection, remove only SancusSight-owned connection or collected records, and leave source-tool artifacts untouched  
SO THAT cleanup cannot damage external evidence.

### FR-013: Later adapter readiness - Should Have

WHEN RAMPART, Kiji Privacy Proxy, or AIMap evidence contracts are assessed  
THE SYSTEM SHOULD show their adapter readiness, missing evidence contract, privacy constraints, and authorization boundary before they can be enabled  
SO THAT later integrations do not bypass trust review.

## Non-Functional Requirements

### NFR-001: Local privacy and security
- Registry and collected evidence must remain on the user's device by default.
- The collector must not expose evidence to the local network or accept unauthenticated control from arbitrary browser origins.
- Source credentials and signing keys must not be stored in registry exports, browser logs, activity summaries, or UI.
- Local access must be source-specific, user-approved, and revocable.

### NFR-002: Reliability and evidence integrity
- Collection must be idempotent across restart, retry, file rotation, and repeated source records.
- Invalid evidence must not replace or contaminate the last accepted evidence set.
- Source checkpoints, parser versions, content identities, and health state must remain consistent.
- Signature failure must remain visible and must not be downgraded to a warning without an explicit policy decision.

### NFR-003: Explainability
- SancusSight must distinguish source facts, deterministic findings, missing evidence, and human decisions.
- Every source-derived finding must identify the supporting evidence reference and freshness.
- `Current` describes collection freshness, not proof that the source tool or governed workflow is safe.

### NFR-004: Usability and accessibility
- Source setup, retry, reauthorization, inspection, and disconnect controls must be keyboard-operable.
- Health state must use text in addition to color.
- Routine failures must provide one clear next action without exposing raw paths, secrets, or internal stack traces.
- The evidence-source rail must remain compact and usable at desktop and narrow viewports without obscuring the core ledger.

### NFR-005: Performance and bounded storage
- Incremental collection must avoid reparsing unchanged artifacts.
- Collection must not block normal registry browsing and deterministic checks.
- Retention must be bounded and explainable, with raw high-volume telemetry remaining in the source system unless explicitly needed.
- Large or rapidly growing sources must expose lag and checkpoint status rather than silently falling behind.

### NFR-006: Compatibility and contract resilience
- Each adapter must declare supported source format versions and reject incompatible changes visibly.
- Normalized evidence records must be versioned and exportable.
- One adapter failure or update must not require coordinated upgrades of every other adapter.
- Manual evidence import must remain available as a degraded path.

## Out of Scope

- Bundling, vendoring, installing, updating, launching, or supervising source tools.
- Triggering AIMap scans, Pipelock policy changes, Praxen analyses, RAMPART tests, or Kiji proxy configuration.
- Ingesting raw prompts, full model responses, secrets, credentials, sensitive Kiji value mappings, or unrestricted filesystem content by default.
- Replacing the canonical registry file or its explicit write/conflict workflow.
- Automatic AI scoring, autonomous remediation, or silent modification of confirmed registry facts.
- Cloud collection, hosted telemetry, accounts, multi-user collaboration, or remote administration.
- Production adapters for RAMPART, Kiji Privacy Proxy, and AIMap in the first release.
- Guaranteeing collection while the device is off, the collector is stopped, or source access is revoked.

## Decisions

### D-001: Govern local artifacts instead of bundling tools

**Decision:** SancusSight will collect and govern approved local evidence outputs while source tools remain independently installed and operated.  
**Reason:** This preserves clear trust boundaries, reduces runtime and licensing burden, and lets each tool evolve independently.  
**Source:** User agreement with the recommendation on 2026-07-12  
**Impacts:** US-001 through US-005, FR-001 through FR-013, Out of Scope

### D-002: Use a bounded local collector

**Decision:** Near-live artifact ingestion may use a separate local collector rather than claiming that a static browser can continuously inspect arbitrary paths.  
**Reason:** A local collector can maintain checkpoints and degraded operation while preserving an honest device-local boundary.  
**Source:** User agreement with the recommended architecture on 2026-07-12  
**Impacts:** US-001, US-002, US-005, FR-005 through FR-007, FR-011, NFR-001, NFR-005

### D-003: Start with Agent Beacon, Praxen, and Pipelock

**Decision:** The first adapter slice covers Agent Beacon JSONL, Praxen JSON reports, and Pipelock signed receipts or Audit Packets.  
**Reason:** They provide strong local artifact contracts across runtime telemetry, declared-policy verification, and egress-control evidence.  
**Source:** Recommended sequence accepted by user on 2026-07-12  
**Impacts:** FR-002, FR-003, FR-013, Out of Scope

### D-004: Evidence collection is read-only

**Decision:** SancusSight will not execute source tools or change their configuration, policies, tests, scans, or original artifacts.  
**Reason:** Governance ingestion should not silently acquire operational authority.  
**Source:** Recommended trust boundary accepted by user on 2026-07-12  
**Impacts:** US-001, FR-009, NFR-001, Out of Scope

### D-005: Concept 1 becomes the evidence-source surface

**Decision:** The selected Evidence Ledger concept supplies the visible source rail and dense needs-attention hierarchy, with health labels grounded in actual collection state.  
**Reason:** It keeps SancusSight's core outcome primary while making evidence provenance and freshness immediately scannable.  
**Source:** User selected the first generated UI concept on 2026-07-12  
**Impacts:** US-002, FR-006, NFR-003, NFR-004

### D-006: The canonical registry remains separate

**Decision:** Collected evidence may support or challenge registry claims but cannot silently replace canonical registry data.  
**Reason:** Evidence observation and governance decisions have different authority and lifecycle.  
**Source:** Existing SancusSight governance and persistent file-connector boundaries  
**Impacts:** US-003, US-004, FR-004, FR-010, FR-011, Out of Scope

## Questions

No critical open questions. The draft treats the collector as a device-local, read-only evidence observer and the first release as three adapters. Later adapter enablement requires evidence-contract and safety review but does not block this requirements gate.

## Glossary

- **Local evidence collector:** A device-local capability that reads user-approved source artifacts, maintains checkpoints, and supplies normalized evidence to SancusSight without operating the source tools.
- **Evidence adapter:** A source-specific contract that validates and normalizes one tool's supported evidence format.
- **Normalized evidence record:** A versioned SancusSight representation of a source fact with provenance, time, subject, content identity, and verification status.
- **Source artifact identity:** A stable reference and content identity for the original local evidence without embedding unrestricted raw content.
- **Checkpoint:** The last safely accepted source position or artifact identity used to resume collection idempotently.
- **Near-live:** Evidence collected shortly after it is written while the device, source, and collector are available; not continuous monitoring or remote control.
- **Collector-degraded:** A state where the registry and last accepted evidence remain usable but automatic local collection is unavailable.
