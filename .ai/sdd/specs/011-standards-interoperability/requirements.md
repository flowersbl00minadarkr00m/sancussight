# Feature: Standards Interoperability

> Status: Approved
> Approval: Operator blanket approval for Feature 011 normal SDD progression,
> reconciled 2026-07-24 after intent replay and scope/privacy review
> Source: `.ai/sdd/PLAN.md`;
> `.ai/sdd/handoff/sancussight-product-enhancement-orchestrator-handoff.md`;
> `research.md`

## Overview

Feature 011 lets a governance-minded user inspect how SancusSight's bounded
evidence can interoperate with selected open standards without weakening its
local-first privacy and truthfulness rules. It adds an optional metadata-only
OpenLineage import, explicit OpenTelemetry/OpenInference alignment previews,
and an unsigned in-toto Statement v1 projection for an already validated
Feature 010 Evidence Packet.

The feature does not become a telemetry platform, data catalog, attestation
service, or policy engine. Compatibility is reported per profile and artifact;
it is never inferred from a brand name or represented as blanket conformance.

## Business Context

Features 009 and 010 established stable claim, check, version, comparison, and
Evidence Packet contracts. External tools use different names and envelopes
for related run, lineage, telemetry, and attestation metadata. Users need to
understand what can be exchanged, what SancusSight deliberately omits, and
where qualification is lost—without exporting prompts, responses, raw
evidence, paths, credentials, or user identity.

The standards are evolving. Feature 011 therefore pins named profiles,
preserves stability metadata, and fails closed on unknown versions or
unbounded extensions.

## User Stories

### US-001: Preview a bounded OpenLineage import

**As a** governance-minded practitioner
**I want to** import a local OpenLineage event file into a bounded preview
**So that** I can see which run and lineage facts are compatible with
SancusSight without importing arbitrary facets or raw identifiers

**Acceptance Criteria:**

- [ ] The user explicitly selects a local JSON or JSONL file.
- [ ] Supported events are validated against a pinned profile before
  projection.
- [ ] Raw producer, schema, job, run, and dataset identifiers are not retained;
  only safe hashes, event type/time, entity counts, and qualification remain.
- [ ] Unsupported events, versions, facets, and malformed records are counted
  and explained without partially trusting them.
- [ ] No file bytes or unprojected values are persisted after processing.

### US-002: Inspect telemetry metadata alignment

**As a** tool evaluator
**I want to** compare accepted SancusSight runtime metadata with pinned
OpenTelemetry and OpenInference profiles
**So that** I can distinguish compatible metadata from deliberately excluded
content

**Acceptance Criteria:**

- [ ] The preview names the exact profile and stability used.
- [ ] Every field is labeled `aligned`, `omitted-private`,
  `unsupported`, `missing`, or `not-applicable`.
- [ ] Content-bearing prompt, response, reasoning, tool-argument, document,
  image, URL, credential, and identity attributes are never projected.
- [ ] Alignment does not claim that SancusSight emitted an OTLP trace or is a
  conforming OpenTelemetry/OpenInference implementation.

### US-003: Export an unsigned in-toto Statement

**As a** governance-minded practitioner
**I want to** wrap a validated Evidence Packet in an in-toto Statement v1
**So that** another tool can recognize the subject/predicate structure without
mistaking it for a signed attestation

**Acceptance Criteria:**

- [ ] The Statement uses the official Statement v1 `_type`.
- [ ] The subject digest binds the exact validated Evidence Packet.
- [ ] The predicate uses a versioned SancusSight custom predicate type and a
  fixed allowlisted shape.
- [ ] Export is a local browser download with an independently validated
  canonical digest.
- [ ] The UI and file metadata state that the Statement is unsigned and not
  externally verified.

### US-004: Understand interoperability limits

**As an** AI power user
**I want to** see what mapped, what was omitted, and why
**So that** I do not confuse structural compatibility with evidence quality or
trust

**Acceptance Criteria:**

- [ ] Each preview reports profile, input kind, accepted count, rejected count,
  omitted fields, and qualification.
- [ ] Missing or unsupported data never becomes `verified`.
- [ ] The feature exposes no aggregate interoperability, trust, risk, or
  quality score.
- [ ] Clear/reset removes only Feature 011 local preview state.

## Functional Requirements

### FR-001: Pinned interoperability profiles — Must Have

WHEN an interoperability operation is requested
THE SYSTEM SHALL identify the exact supported standard, profile version,
stability, accepted shapes, and SancusSight projection version
SO THAT compatibility claims remain bounded and reproducible.

Unknown schema URLs, profile versions, event types, predicate types, and
extension shapes shall fail closed or be explicitly reported as unsupported.

### FR-002: Metadata-only OpenLineage import — Must Have

WHEN the user selects an OpenLineage JSON or JSONL file
THE SYSTEM SHALL validate at most 500 records and 1 MiB against the pinned
OpenLineage import profile and project only fixed metadata
SO THAT optional lineage interoperability cannot become arbitrary facet or
content ingestion.

The projection may retain event type, canonical event time, entity counts,
profile identity, deterministic safe hashes, and explicit omission/rejection
codes. It shall not retain raw producer URLs, schema URLs, job names,
namespaces, run IDs, dataset names, facets, file content, or hash preimages.

### FR-003: Honest partial-import result — Must Have

WHEN a bounded file contains supported and unsupported records
THE SYSTEM SHALL isolate records, preserve the supported projection, and
report rejected and omitted counts with stable reason codes
SO THAT one malformed record does not erase safe observations or become
silently accepted.

No rejected record may contribute to a verified claim, lineage edge,
governance event, asset version, or check result.

### FR-004: OpenTelemetry/OpenInference alignment preview — Must Have

WHEN accepted SancusSight runtime metadata is inspected
THE SYSTEM SHALL project a fixed, versioned alignment matrix against pinned
OpenTelemetry and OpenInference metadata profiles
SO THAT users can see compatible names, missing fields, excluded private
fields, and stability without emitting or replaying telemetry.

The matrix shall use only existing accepted metadata. It shall not synthesize
spans, trace relationships, prompts, outputs, documents, tool payloads,
token/cost data, model parameters, or provider content.

### FR-005: Unsigned in-toto Statement v1 projection — Must Have

WHEN the user selects a validated Feature 010 Evidence Packet
THE SYSTEM SHALL construct an unsigned in-toto Statement v1 whose subject
binds the packet digest and whose predicate is a strict versioned SancusSight
projection
SO THAT structural interoperability is available without an authentication
overclaim.

Statement creation shall reject an invalid packet, unknown packet schema,
digest mismatch, unsafe value, unsupported predicate profile, or unavailable
Web Crypto. The Statement shall not contain a signature, DSSE envelope,
certificate, identity, key reference, transparency-log claim, or external
verification result.

### FR-006: Local interoperability workspace — Must Have

WHEN the user opens the advanced Evidence Sources destination
THE SYSTEM SHALL expose one Standards Interoperability workspace for import,
alignment, Statement export, and explicit limitations
SO THAT the feature extends the existing advanced evidence workflow rather
than adding a competing primary navigation destination.

Desktop and narrow layouts shall preserve one interaction model, visible
focus, useful focus restoration, long-identifier wrapping, and no page-level
horizontal scrolling at 320 CSS pixels or effective 200% zoom.

### FR-007: Bounded local preview state — Must Have

WHEN a supported interoperability operation succeeds
THE SYSTEM SHALL retain only its sanitized bounded preview in browser-local
Feature 011 storage and provide an explicit clear action
SO THAT raw inputs and unrelated Feature 009/010 history remain untouched.

Storage failure shall leave the current in-memory preview usable and expose an
honest unavailable-persistence state. Hosted mode shall make no localhost or
third-party request.

### FR-008: Policy preview research boundary — Must Have

WHEN Feature 011 documents future policy-preview interoperability
THE SYSTEM SHALL keep the result as non-executable research with explicit
unknown/missing inputs and enforcement hazards
SO THAT research cannot be mistaken for a policy decision or control action.

No runtime policy engine, policy language, evaluation endpoint, enforcement
status, automated remediation, or upstream mutation is included.

## Non-Functional Requirements

### NFR-001: Privacy and data minimization

- Only fixed metadata allowlists and safe SHA-256 hashes may cross an adapter
  boundary.
- Raw prompts, responses, reasoning, tool arguments/results, documents,
  images, embeddings, URLs, paths, credentials, secrets, user identity,
  unrestricted facets, and registry objects are prohibited.
- Hash preimages are never retained.

### NFR-002: Truthfulness

- Compatibility is qualified by exact profile and projection version.
- Structural mapping never implies semantic truth, evidence freshness,
  authenticated provenance, external verification, or standards certification.
- Unsupported, omitted, rejected, missing, and unavailable states are textual.
- No aggregate score or AI-authored interpretation is allowed.

### NFR-003: Determinism and boundedness

- Canonical serialization, hashes, reason codes, profile identity, ordering,
  dedupe, and retention are deterministic.
- Import is bounded to 500 records and 1 MiB.
- Retain at most 20 sanitized preview snapshots per profile and 100 total.
- Statement subjects and predicates are fixed, versioned, and exact-shape
  validated.

### NFR-004: Local-first failure isolation

- File processing, alignment, hashing, validation, storage, and download run
  locally.
- Each imported record fails independently; unsafe records do not poison safe
  records.
- Unavailable file, storage, Web Crypto, or download capability produces an
  explicit failure without mutating Feature 009/010 state.

### NFR-005: Accessibility and compatibility

- Status is never color-only.
- Native controls, visible focus, keyboard operation, useful return focus,
  reduced motion, and bounded responsive overflow are required.
- Existing Feature 008, 009, and 010 behavior and schema-version-2 registry
  compatibility remain unchanged.

## Out of Scope

- Live OpenLineage API ingestion, backend, dataset catalog, graph canvas, or
  arbitrary custom facets.
- Generic OTLP receiver/exporter, tracing SDK, span reconstruction, prompt or
  response observability, token/cost analytics, or model evaluation.
- Official certification or blanket conformance claims.
- DSSE, signing, certificates, key management, transparency logs, bundles, or
  external verification.
- Runtime policy engines, policy languages, enforcement, blocking, automated
  remediation, or upstream mutation.
- Cloud accounts, hosted ingestion, analytics, third-party requests, or
  server-side interoperability storage.
- New runtime dependencies unless a later approved design proves a native
  implementation insufficient.
- Any Spec 005/T16R5/T16/A-002 implementation, run, deployment, provider, or
  release-readiness action.

## Decisions

### D-001: OpenLineage import is local and metadata-only

**Decision:** Support explicit local file import against one pinned bounded
profile; hash identifiers and reject or omit facets.

**Reason:** This provides useful interchange evidence without importing a data
catalog or weakening privacy.

**Impacts:** FR-001 through FR-003, FR-007, NFR-001 through NFR-004.

### D-002: Alignment is a preview, not telemetry emission

**Decision:** Map accepted SancusSight runtime metadata to pinned
OpenTelemetry/OpenInference fields without generating OTLP or claiming
conformance.

**Reason:** The roadmap asks for metadata alignment, while product steering
forbids generic content capture and third-party telemetry.

**Impacts:** FR-004, NFR-001, NFR-002.

### D-003: in-toto support stops at an unsigned Statement

**Decision:** Wrap a validated Evidence Packet in Statement v1 with a custom
SancusSight predicate; signing and DSSE remain out of scope.

**Reason:** Statement/predicate separation is useful now, while authentication
requires unresolved key and verification choices.

**Impacts:** FR-005, NFR-001 through NFR-004.

### D-004: Interoperability lives under Evidence Sources

**Decision:** Extend the existing advanced Evidence Sources destination rather
than adding primary navigation.

**Reason:** Standards adapters are advanced evidence plumbing and should not
compete with the first-value product loop.

**Impacts:** FR-006, NFR-005.

### D-005: Policy preview remains research only

**Decision:** Produce a bounded research record; ship no policy runtime.

**Reason:** The roadmap explicitly defers enforcement and does not authorize a
policy engine or policy-language choice.

**Impacts:** FR-008, Out of Scope.

## Questions

No open requirement question remains. A later feature must explicitly choose
signing trust roots, live ingestion, broader OpenLineage facets, or a policy
runtime before any of those boundaries can change.

## Intent Replay

- **Intended outcome:** A user can safely inspect bounded interoperability and
  export one unsigned Statement without turning SancusSight into an
  observability or attestation platform.
- **Representative scenario:** A user selects a small OpenLineage JSONL file,
  sees supported/rejected/omitted counts and hashed entity references, inspects
  metadata alignment, then exports an unsigned Statement for a validated
  Evidence Packet.
- **Edge scenario:** A file mixes a supported core event, an unknown schema,
  an oversized facet, and malformed JSON. The safe record remains available;
  the others have stable rejection/omission reasons and contribute no claims.
- **Must not happen:** Prompt text, dataset names, producer URLs, raw facets,
  credentials, or an unsigned Statement presented as authenticated evidence
  must never enter retained state or export.
- **Unchanged:** Feature 008 asset navigation, Feature 009 claim/check history,
  Feature 010 version/packet contracts, registry schema 2, and all Spec 005
  authority remain unchanged.
- **Rejected interpretations:** This is not a live OpenLineage backend, OTLP
  collector, OpenInference tracing SDK, signed in-toto attestation service, or
  policy engine.
