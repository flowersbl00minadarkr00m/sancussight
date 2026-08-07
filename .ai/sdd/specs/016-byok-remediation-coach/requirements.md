# Feature: BYOK Remediation Coach

> Status: Approved
> Source: Direct operator request on 2026-07-24; `.ai/sdd/PLAN.md`;
> `.ai/sdd/specs/016-byok-remediation-coach/research.md`; Features 006, 009,
> and 014

## Overview

The BYOK Remediation Coach lets a local SancusSight user connect an approved
model provider with their own credential and generate a draft plan of action
for selected vulnerabilities or governance findings. The coach explains
ordered steps, evidence needs, verification, rollback, dependencies, and
remaining uncertainty.

The feature is advisory. It does not execute commands, edit files, change
controls, close findings, or mark remediation complete. Deterministic
SancusSight findings and explicit human decisions remain authoritative.

## Business Context

SancusSight already identifies evidence-qualified gaps but requires the user
to translate those findings into a practical remediation sequence. A bounded
model can help with synthesis when the user controls the provider, model,
budget, and exact transmitted fields.

BYOK introduces a new secret and data-egress boundary. The hosted static app
cannot safely claim local key custody or unrestricted access to local evidence.
The first release therefore requires the local companion, operating-system
credential storage, explicit connection tests, and a review of the bounded
payload before every planning request.

## User Stories

### US-001: Configure a local provider connection

**As a** SancusSight owner
**I want to** add and test my own provider credential
**So that** I control which model and account fund remediation planning.

**Acceptance Criteria:**

- The user chooses a supported native provider or an OpenAI-compatible custom
  connection.
- Configuration identifies provider, base URL when applicable, authentication
  type, connection label, enabled state, and allowed model IDs.
- The secret is written by the local companion to the operating-system
  credential store and is never returned to the UI, logs, exports, telemetry,
  evidence, or model payload.
- Saving requires a bounded connection test and returns a safe success or
  failure state.

### US-002: Select a model without provider bloat

**As an** AI power user
**I want to** discover or enter an allowed model ID
**So that** new providers and models do not require a redesigned settings
screen.

**Acceptance Criteria:**

- A compatible provider may expose a bounded model list after connection
  validation.
- When discovery is unavailable, the user may enter an explicit model ID.
- The selected model is separate from the provider connection and records
  protocol/wire mode, context limit when known, enabled state, and last test.
- Unknown pricing or capability remains unknown.

### US-003: Generate a bounded plan of action

**As a** governance-minded practitioner
**I want to** select findings and generate a reviewable remediation plan
**So that** I can move from evidence to ordered action without losing
provenance.

**Acceptance Criteria:**

- The user selects the exact finding IDs and may exclude individual fields.
- Before transmission, SancusSight shows the exact bounded field names and
  values, provider, model, and expected retention boundary.
- The request excludes credentials, raw prompts/responses/reasoning, local
  paths, unrestricted source excerpts, raw evidence payloads, and unrelated
  registry content.
- The resulting draft identifies source findings, proposed steps, owner or
  owner-needed state, dependencies, verification, rollback, uncertainty, and
  missing evidence.

### US-004: Govern the plan without confusing it with remediation

**As a** registry owner
**I want to** accept, edit, reject, or archive individual plan steps
**So that** model suggestions never silently become decisions or completed
work.

**Acceptance Criteria:**

- Model-authored content is labelled proposed and records provider, model,
  request time, bounded input digest, and plan version.
- The user can edit, accept, reject, and archive steps independently.
- Accepted steps remain planned until separate human-recorded verification
  establishes completion.
- A later model run creates a reviewable new plan version and does not
  overwrite human decisions.

### US-005: Limit cost and failure impact

**As a** BYOK user
**I want to** set request limits and recover from provider failure
**So that** the coach cannot consume an unbounded budget or corrupt my local
governance state.

**Acceptance Criteria:**

- Each connection or request has bounded timeout, maximum output tokens, and
  maximum retry count.
- The UI shows running, waiting, failed, cancelled, rate-limited, and completed
  states.
- The user can cancel an in-flight request.
- Provider failure leaves findings, accepted evidence, and prior plans intact.

## Functional Requirements

### FR-001: Local-companion-only BYOK — Must Have

WHEN a user configures or uses BYOK
THE SYSTEM SHALL require an authenticated local companion session and SHALL
disable BYOK in hosted/manual mode
SO THAT the static hosted app never claims secret custody.

### FR-002: Protected credential lifecycle — Must Have

WHEN a credential is saved, used, replaced, or deleted
THE SYSTEM SHALL delegate secret storage to the operating-system credential
store, retain only a non-secret connection reference, and never return or log
the secret
SO THAT credential handling remains bounded and revocable.

### FR-003: Provider connection contract — Must Have

WHEN a provider connection is created
THE SYSTEM SHALL record a stable connection ID, label, provider type, optional
base URL, authentication type, wire protocol, enabled state, validation state,
and safe failure code
SO THAT provider management is consistent across native and compatible
endpoints.

### FR-004: Test before enable — Must Have

WHEN connection settings change
THE SYSTEM SHALL run a bounded authentication and compatibility test before
the connection can be enabled
SO THAT invalid credentials or endpoints do not appear ready.

### FR-005: Bounded model selection — Must Have

WHEN a validated provider exposes models
THE SYSTEM SHALL offer bounded discovery and SHALL allow explicit manual model
IDs when discovery is unavailable without inferring capability, pricing, or
trust
SO THAT new models do not require provider-specific UI growth.

### FR-006: Explicit planning payload — Must Have

WHEN the user requests a remediation plan
THE SYSTEM SHALL construct a fixed allowlisted payload from explicitly
selected findings, show it before transmission, and require confirmation
SO THAT the user controls data egress.

### FR-007: Proposal-only plan output — Must Have

WHEN a model response is accepted
THE SYSTEM SHALL validate it into a versioned draft plan containing finding
references, steps, dependencies, verification, rollback, uncertainty, and
missing evidence and SHALL label every model-authored field proposed
SO THAT generation does not become hidden authority.

### FR-008: Human plan decisions — Must Have

WHEN the user edits, accepts, rejects, or archives a plan step
THE SYSTEM SHALL record a separate human decision without rewriting the source
finding or prior plan version
SO THAT governance history remains inspectable.

### FR-009: No remediation execution — Must Have

THE SYSTEM SHALL NOT execute commands, edit files, install tools, change
policies, call MCP tools, initiate scans, close findings, or mark a step
verified from model output.

### FR-010: Budget and lifecycle controls — Must Have

WHEN a planning request runs
THE SYSTEM SHALL enforce configured timeout, output-token, retry, and
concurrency limits and SHALL provide cancel plus explicit terminal states
SO THAT cost and failure impact remain bounded.

### FR-011: Deterministic fallback template — Should Have

WHEN no provider is configured or a model request is declined
THE SYSTEM SHOULD allow the user to create a non-AI plan skeleton from the same
selected finding references
SO THAT BYOK is optional to the remediation workflow.

### FR-012: Exportable sanitized plan — Should Have

THE SYSTEM SHOULD export a versioned plan without credentials, local paths, raw
evidence, unrestricted source content, or hidden model state.

## Non-Functional Requirements

### NFR-001: Secret security

- Provider secrets exist only in the operating-system credential store and
  transient local-companion request memory.
- Secret values never enter browser persistence, repository files, exports,
  logs, telemetry, evidence envelopes, crash reports, or model prompts.
- Replacing or deleting a connection makes the prior credential reference
  unusable.

### NFR-002: Privacy and data minimization

- Every model request is preceded by an inspectable payload disclosure.
- Only explicitly selected, allowlisted finding fields may leave the machine.
- Provider retention and data-use claims are presented as external policy
  links or user-recorded qualification, not SancusSight guarantees.

### NFR-003: Truthfulness and explainability

- Deterministic findings, model proposals, human decisions, and verified
  completion remain distinct record classes.
- A model cannot create positive evidence, lower severity, accept risk, or
  verify remediation.
- Missing or contradictory evidence remains visible in the plan.

### NFR-004: Reliability

- Requests are idempotent by local request ID where provider behavior permits;
  duplicate responses do not create duplicate plan versions.
- Provider, network, validation, storage, or cancellation failure cannot
  mutate source findings or prior accepted plans.
- Degraded provider state is visible and recoverable.

### NFR-005: Accessibility and usability

- Provider setup, payload review, generation state, plan editing, and failure
  recovery are keyboard operable and do not rely on color alone.
- Secret inputs support paste and reveal-while-entering but never redisplay a
  saved secret.
- The workflow remains usable at 320 CSS pixels and effective 200% zoom.

## Out of Scope

- BYOK in the hosted/manual app.
- Server-side SancusSight credential custody or billing.
- Autonomous remediation, code generation applied to a workspace, command
  execution, tool calls, scans, policy changes, or finding closure.
- Raw repository, prompt, response, reasoning, evidence, or registry upload.
- Provider pricing guarantees, benchmark rankings, or capability inference.
- Multi-user credential sharing, team vaults, approval chains, or enterprise
  secret management.
- Treating a generated plan as professional security advice, compliance
  certification, or proof of remediation.

## Decisions

### D-001: Local OS-protected credentials

**Decision:** The local companion stores BYOK secrets in the operating-system
credential store; the browser retains only non-secret references.
**Reason:** This matches SancusSight's local-first trust boundary and avoids
browser local-storage custody.
**Source:** Direct operator request plus BYOK research.
**Impacts:** US-001, FR-001 through FR-004, NFR-001.

### D-002: Native profiles plus OpenAI-compatible custom

**Decision:** Use a small provider connection contract with supported native
profiles and one compatible custom endpoint path.
**Reason:** It accommodates Kimi, DeepSeek, local servers, and future models
without provider-specific UI bloat.
**Source:** Direct operator request and open-source pattern research.
**Impacts:** US-002, FR-003 through FR-005.

### D-003: Coach plans; humans govern and verify

**Decision:** Model output is a versioned proposal over selected findings and
cannot execute or verify remediation.
**Reason:** AI is useful for synthesis but cannot replace deterministic
evidence or human authority.
**Source:** Product steering and direct operator request.
**Impacts:** US-003 through US-005, FR-006 through FR-012, NFR-003.

## Questions

No critical requirement question remains. Exact native providers, credential
store library, endpoint schema, response grammar, plan persistence, and UI
components belong to design.

## Intent Replay

- **Intended outcome:** A local user can use their own model account to turn
  selected findings into a bounded, reviewable remediation plan.
- **Representative scenario:** The user connects an OpenAI-compatible
  endpoint, tests it, selects two high findings, inspects the exact outgoing
  fields, and receives proposed steps with verification and rollback.
- **Important edge:** Model discovery is unavailable. The user enters a model
  ID manually; its capabilities and pricing remain unknown, and a failed test
  prevents enablement.
- **Must not happen:** A key reaches browser storage or logs, unrestricted
  evidence is uploaded, or a model response executes work or marks a finding
  fixed.
- **Unchanged:** Deterministic findings, evidence qualification, human
  decisions, upstream ownership, and local collector security remain
  authoritative.
- **Rejected interpretations:** This is not an autonomous fixing agent,
  hosted secret vault, scanner, compliance adviser, or source of verification.
