# Feature: Guided Connection Center

> Status: Approved
> Source: Direct operator feedback on 2026-07-24; `.ai/sdd/PLAN.md`;
> Features 004, 005, and 011

## Overview

The Guided Connection Center makes SancusSight's operating boundary and
evidence-source setup understandable. It replaces the current viewer-oriented
source list with one progressive workflow that distinguishes sample data,
hosted/manual snapshot use, a locally connected registry, and the optional
loopback evidence collector.

The feature does not install, start, scan, configure, or control OpenTelemetry,
Praxen, Pipelock, RAMPART, AIMap, or other upstream tools. It guides the user
to the expected artifact, validates the selected contract, and reports honest
connection health.

## Business Context

The hosted demo currently lists evidence sources as not configured while the
actual path to live evidence requires a separate local collector and
operator-run producers. Users can reasonably interpret “connect” as a direct
hosted integration or expect SancusSight to start the tool. That ambiguity
weakens first value and trust even though the underlying read-only boundary is
sound.

Success means a first-time Windows user can identify the required operating
mode, understand what remains outside SancusSight, connect one supported
artifact source locally, and recover from a validation failure without reading
repository architecture documentation.

## User Stories

### US-001: Choose the correct operating mode

**As an** AI power user
**I want to** understand which SancusSight mode can use real local evidence
**So that** I do not search the hosted demo for controls it cannot provide.

**Acceptance Criteria:**

- Entry and Evidence Sources distinguish Sample, Hosted/manual, Local registry,
  and Local collector modes with outcome-oriented descriptions.
- Hosted/manual mode states that it cannot browse local paths or poll producer
  artifacts and offers snapshot import plus local setup guidance.
- Local collector mode identifies the loopback boundary and current collector
  availability before presenting source configuration.

### US-002: Connect one supported evidence source

**As a** governance-minded practitioner
**I want to** follow source-specific setup steps and validate the expected
artifact
**So that** OpenTelemetry, Praxen, Pipelock, or another supported producer can
feed SancusSight without guesswork.

**Acceptance Criteria:**

- Each supported source shows prerequisites, producer ownership, expected
  artifact contract, safe example location, and privacy exclusions.
- The user can select or enter a local artifact path only in live local mode.
- Before saving, SancusSight validates accessibility and the expected bounded
  contract and returns source-specific recovery guidance.
- A successful connection shows last attempt, last accepted artifact, health,
  rejected count, and refresh action.

### US-003: Understand OpenTelemetry interoperability

**As a** tool evaluator
**I want to** distinguish the local OTLP bridge from the metadata alignment
preview
**So that** I know whether I am connecting telemetry or inspecting a standards
mapping.

**Acceptance Criteria:**

- Runtime telemetry setup identifies the local bridge, accepted transport and
  endpoint class, output artifact, and content-capture prohibition.
- Standards Interoperability labels its OpenTelemetry/OpenInference matrix as
  an alignment preview over already accepted runtime evidence.
- Neither surface implies that SancusSight is a general OTLP backend or that
  an alignment preview configures telemetry.

### US-004: Recover without losing accepted evidence

**As a** registry owner
**I want to** diagnose and retry a failed source connection
**So that** unrelated sources and previously accepted evidence remain usable.

**Acceptance Criteria:**

- Permission, missing path, unsupported schema, malformed artifact, stale
  producer, unavailable collector, and verification failure are distinct.
- Recovery actions affect only the selected source.
- Previously accepted records retain their original qualification and
  timestamps while the source is stale or failed.

## Functional Requirements

### FR-001: Mode-first entry — Must Have

WHEN a user enters SancusSight or opens Evidence Sources
THE SYSTEM SHALL identify the active operating mode, its available connection
capabilities, and the next safe action
SO THAT hosted/manual and local behavior cannot be confused.

### FR-002: Source setup catalog — Must Have

WHEN a supported evidence source is selected
THE SYSTEM SHALL show a versioned setup profile containing producer ownership,
prerequisites, expected artifact contract, supported qualification, prohibited
content, and recovery guidance
SO THAT setup is source-specific and reviewable.

### FR-003: Local collector readiness — Must Have

WHEN a user attempts a live source connection
THE SYSTEM SHALL verify that the loopback collector session is available and
authorized before accepting a local path
SO THAT hosted pages never imply local filesystem access.

### FR-004: Validate before configure — Must Have

WHEN the user submits a source path
THE SYSTEM SHALL validate bounded accessibility and the source contract before
persisting configuration and SHALL expose a safe diagnostic on failure
SO THAT an invalid path does not become a misleading connected state.

### FR-005: Source health and recovery — Must Have

WHEN a configured source changes state
THE SYSTEM SHALL present textual current, stale, failed,
permission-required, not-configured, and collector-unavailable states with
source-scoped refresh, change-path, retry, and disconnect actions
SO THAT failure and recovery remain visible.

### FR-006: Telemetry versus alignment distinction — Must Have

WHEN runtime telemetry or standards alignment is presented
THE SYSTEM SHALL distinguish producer configuration, accepted runtime evidence,
and metadata-only alignment preview as separate stages
SO THAT structural mapping is not mistaken for telemetry connection.

### FR-007: Hosted/manual continuation — Must Have

WHEN the hosted app cannot connect a local source
THE SYSTEM SHALL provide snapshot import and a copyable local setup path
without requesting local filesystem or credential access
SO THAT hosted users have an honest continuation rather than a dead end.

### FR-008: No upstream execution — Must Have

THE SYSTEM SHALL NOT install, launch, configure, scan, test, or mutate an
upstream producer and SHALL NOT expose a generic command route.

### FR-009: Setup progress summary — Should Have

WHEN multiple sources are available
THE SYSTEM SHOULD summarize setup as not started, needs action, connected, or
degraded and lead with the next source-scoped action rather than a raw count.

## Non-Functional Requirements

### NFR-001: Privacy and security

- Hosted mode makes no localhost, filesystem, or producer request.
- Local validation retains only the existing bounded source configuration and
  safe diagnostics.
- Prompts, responses, reasoning, credentials, command bodies, source excerpts,
  and unrestricted telemetry remain prohibited.

### NFR-002: Usability

- A first-time Windows user can reach a valid source test or an actionable
  prerequisite state without consulting repository architecture docs.
- Setup terminology uses user outcomes before contract names.
- The same source has one setup state model across desktop and narrow layouts.

### NFR-003: Accessibility

- The workflow is keyboard operable, uses visible focus, restores focus after
  dialogs or detail transitions, and never relies on color alone.
- Status, prerequisites, validation errors, and recovery actions remain usable
  at 320 CSS pixels and effective 200% zoom.

### NFR-004: Reliability

- Source setup actions are idempotent within the collector contract.
- One source failure cannot discard another source's accepted evidence or
  configuration.
- Cancelled setup leaves prior configuration unchanged.

## Out of Scope

- Installing or starting producer tools.
- Running Praxen, Pipelock, RAMPART, AIMap, or an OTLP exporter.
- A generic plugin installer, command shell, MCP caller, or scanning service.
- Hosted ingestion, cloud accounts, or uploading local evidence to
  SancusSight infrastructure.
- Changing Feature 011's pinned standards profiles.
- Claiming that a successful path check proves evidence quality or source
  trust.

## Decisions

### D-001: One Connection Center, mode first

**Decision:** Use one progressive setup workflow that begins with operating
mode and then narrows to a source-specific contract.
**Reason:** The current separation between hosted viewer, collector, producers,
and standards previews is correct but not discoverable.
**Source:** Direct operator feedback on 2026-07-24.
**Impacts:** US-001 through US-004, FR-001 through FR-007.

### D-002: Validate artifacts; do not operate producers

**Decision:** SancusSight guides and validates the handoff but retains no
upstream execution authority.
**Reason:** This improves usability without weakening the local-first,
read-only trust boundary.
**Source:** Product steering and direct operator request.
**Impacts:** FR-002 through FR-008, NFR-001, Out of Scope.

## Questions

No critical requirement question remains. Source-specific commands, UI
components, persistence details, and setup-profile data structures belong to
design.

## Intent Replay

- **Intended outcome:** A first-time user can identify the correct mode and
  connect or diagnose one supported local evidence source without mistaking a
  hosted preview for a live integration.
- **Representative scenario:** The user selects Praxen, sees that Praxen runs
  separately, selects its canonical findings directory in local collector
  mode, validates schema 2.0, and sees current health.
- **Important edge:** The selected path is readable but contains an
  unsupported packet. Configuration remains unchanged and the user receives a
  bounded source-specific diagnostic.
- **Must not happen:** The hosted app probes localhost, requests a credential,
  launches a tool, or labels an unvalidated path connected.
- **Unchanged:** Producers remain operator-owned; accepted evidence,
  qualification, source isolation, and collector security stay authoritative.
- **Rejected interpretations:** This is not an installer, telemetry backend,
  scan orchestrator, or hosted evidence ingestion service.
