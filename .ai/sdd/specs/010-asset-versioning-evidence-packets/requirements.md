# Feature: Asset Versioning and Evidence Packets

> Status: Approved — R1 truthfulness correction
> Source: `@.ai/sdd/PLAN.md`; `.ai/sdd/handoff/sancussight-product-enhancement-orchestrator-handoff.md`
> Approval: Existing operator blanket approval, reconciled on 2026-07-24 after roadmap, compatibility, privacy, and exclusion review

## Overview

Feature 010 makes meaningful changes to an AI asset inspectable over time. A
user can record bounded versions, attach flexible aliases, compare the current
recorded version with its immediately previous recorded version, understand
portability regressions and recoveries, and export a sanitized, versioned
Evidence Packet for an asset version or exit-drill result.

The feature remains local-first and deterministic. It does not invent history,
turn aliases into deployment environments, create a score, capture raw
workspace or model content, sign packets, or introduce a hosted evidence
service.

## Business Context

Feature 008 established stable asset identity and one canonical Asset
Passport. Feature 009 established stable check definitions, result identity,
bounded lineage, and metadata-only result history. SancusSight can now explain
the present state, but it cannot yet answer which recorded asset facts changed
between meaningful versions or produce a portable, privacy-bounded proof
artifact.

Feature 010 closes that gap without changing the registry's schema-version-2
compatibility contract. MLflow-style versions and aliases and in-toto-style
subject/predicate separation inform the product model only; no external
runtime or copied implementation is introduced.

## User Stories

### US-001: Record meaningful asset versions

**As an** AI power user
**I want to** record a bounded version of an asset's current portability state
**So that** later changes have an explicit comparison point

**Acceptance Criteria:**

- [ ] A version has a stable copy-independent ID, recorded time, optional
  flexible aliases, safe source/run references, and a fixed snapshot.
- [ ] Recording is an explicit local action and never fabricates older
  history.
- [ ] Equivalent consecutive snapshots do not create misleading version
  noise.
- [ ] Existing schema-version-2 registries without versions load unchanged.

### US-002: Use flexible aliases without rigid stages

**As a** tool evaluator
**I want to** label recorded versions with aliases such as `preferred`,
`fallback`, `testing`, or `deprecated`
**So that** I can express current intent without imposing an environment model

**Acceptance Criteria:**

- [ ] Alias names are user-controlled, bounded, and understandable as labels.
- [ ] One alias points to at most one version of an asset at a time.
- [ ] Multiple aliases may point to one version.
- [ ] Moving or removing an alias does not alter historical snapshot facts.
- [ ] The UI does not interpret an alias as evidence, approval, or deployment
  state.

### US-003: Understand regression and recovery

**As a** governance-minded practitioner
**I want to** compare the current recorded version with the immediately
previous recorded version
**So that** I can see what regressed, recovered, changed, or stayed unchanged

**Acceptance Criteria:**

- [ ] Comparison uses only recorded snapshot fields and deterministic check
  result metadata.
- [ ] Regression, recovery, changed, and unchanged states are textual and
  rule-based.
- [ ] No previous version, unavailable comparison, and unsupported fields are
  explicit.
- [ ] The comparison never becomes an aggregate portability or trust score.

### US-004: Export a sanitized Evidence Packet

**As a** governance-minded practitioner
**I want to** export a versioned Evidence Packet for an asset version or
exit-drill result
**So that** I can share bounded proof without exporting my registry or raw
evidence

**Acceptance Criteria:**

- [ ] The packet separates subject, claim/predicate, producer, run,
  qualification, verification, human decision, and missing-evidence sections.
- [ ] The packet has a versioned schema, deterministic canonical digest, and
  explicit export time.
- [ ] Only fixed allowlisted metadata and safe hashes/references may enter.
- [ ] Raw prompts, responses, paths, evidence payloads, credentials, user
  identity, registry objects, and unrestricted attributes cannot enter.
- [ ] Export is a local browser download and creates no network request.

### US-005: Inspect versions and packets from existing product flows

**As a** keyboard or assistive-technology user
**I want to** inspect version history, comparison, and packet export from the
Asset Passport and relevant Exit Drill
**So that** the new proof workflow preserves context

**Acceptance Criteria:**

- [ ] Asset Passport History exposes recorded versions, aliases, comparison,
  and asset-version packet export.
- [ ] Exit Drills expose packet export only for the selected recorded result.
- [ ] Desktop and narrow layouts preserve one canonical interaction and a
  predictable focus return.
- [ ] Long identifiers wrap safely and 320 CSS pixels / 200% zoom produce no
  page-level horizontal scrolling.

## Functional Requirements

### FR-001: Bounded asset version model — Must Have

WHEN a user explicitly records the current portability state of an asset
THE SYSTEM SHALL create a bounded immutable version snapshot with a stable
version ID, recorded time, fixed portability facts, deterministic check-result
metadata, and safe source/run reference hashes
SO THAT later comparison does not depend on mutable display copy.

The system shall deduplicate an equivalent consecutive snapshot, retain at
most 50 versions per asset, and never fabricate historical versions during
load or compatibility handling.

### FR-002: Flexible version aliases — Must Have

WHEN a user assigns, moves, or removes a version alias
THE SYSTEM SHALL treat the alias as a bounded case-insensitive label that
points to at most one version of the selected asset
SO THAT intent can be expressed without a rigid environment or lifecycle
stage model.

Multiple aliases may point to one version. Alias changes shall not mutate the
version snapshot, imply approval, or alter deterministic check results.

### FR-003: Deterministic current-versus-previous comparison — Must Have

WHEN at least two recorded versions exist for an asset
THE SYSTEM SHALL compare the current recorded version with the immediately
previous distinct recorded version using a fixed field and check-result
projection
SO THAT the user can identify regressions, recoveries, other changes, and
unchanged conditions.

The first release shall not require arbitrary pair selection. An absent
previous version, missing field, or unsupported comparison shall remain
explicit.

### FR-004: Portability regression and recovery explanations — Must Have

WHEN a comparison contains meaningful changes
THE SYSTEM SHALL label each changed item as `regression`, `recovery`, or
`changed`, and SHALL identify unchanged context separately
SO THAT the explanation remains actionable without an aggregate score.

Regression and recovery shall be derived only from recorded facts and stable
Feature 009 check statuses. Dynamic age alone shall not rewrite historical
classification.

### FR-005: Versioned Evidence Packet contract — Must Have

WHEN a packet is built for an asset version or recorded exit-drill result
THE SYSTEM SHALL produce a schema-version-1 `sancussight-evidence-packet`
containing a stable subject, typed predicate, fixed producer metadata, bounded
run metadata, qualification, verification, human-decision metadata,
missing-evidence metadata, and optional current-versus-previous comparison
SO THAT the artifact is portable and its claims remain qualified.

The packet shall include a deterministic SHA-256 digest over a defined
canonical payload that excludes the digest field and non-deterministic export
time.

### FR-006: Sanitized local export — Must Have

WHEN SancusSight exports an Evidence Packet
THE SYSTEM SHALL construct it from a fixed allowlist and download canonical
JSON locally
SO THAT export cannot leak unrestricted registry or evidence content.

Packet construction shall reject unsafe keys, absolute identifiers, invalid
hashes, unsupported versions, over-limit collections, and unrecognized object
shapes. It shall not include raw evidence text or payloads, findings,
prompts/responses, credentials, paths, user identity, full registry objects,
or provider secrets.

### FR-007: Asset Passport and Exit Drill integration — Must Have

WHEN the user opens Asset Passport History or a recorded Exit Drill result
THE SYSTEM SHALL expose the applicable version, comparison, alias, and packet
actions within the existing canonical context
SO THAT Feature 010 does not create a competing asset or drill workspace.

Asset version recording and alias changes shall be explicit local registry
edits. Exit-drill packet export shall not imply that a drill ran when no
recorded result exists.

### FR-008: Schema-version-2 compatibility — Must Have

WHEN SancusSight loads, imports, compiles, refreshes, or exports an existing
schema-version-2 registry
THE SYSTEM SHALL accept absent Feature 010 fields and preserve valid optional
version metadata without requiring an automatic migration
SO THAT existing registries remain usable.

Invalid optional version metadata shall fail closed with an actionable local
validation error rather than being silently repaired. Registry compiler
refresh shall preserve valid version history by stable asset identity and
shall not invent a version.

## Non-Functional Requirements

### NFR-001: Accessibility

- Version rows, aliases, comparison states, packet qualifications, and missing
  evidence must be understandable without color.
- Native controls, visible focus, predictable detail entry, and useful focus
  restoration are required.
- The experience must remain usable at 320 CSS pixels and 200% zoom without
  page-level horizontal scrolling or duplicate focus order.

### NFR-002: Privacy and local-first operation

- Versioning, comparison, packet construction, validation, hashing, and
  download run locally from already accepted metadata.
- No new third-party request, analytics, hosted ingestion, unrestricted
  workspace read, prompt/response capture, credential capture, or user
  identity capture is allowed.
- Source artifacts, verification runs, evidence, and decisions are represented
  only by fixed status metadata and safe SHA-256 references where needed.

### NFR-003: Determinism and truthfulness

- Stable IDs, canonical serialization, comparison classification, dedupe, and
  digest construction must be deterministic.
- Version aliases must never masquerade as evidence, approval, environment, or
  lifecycle truth.
- Packets must distinguish recorded fact, deterministic finding, human
  decision, missing evidence, and inferred qualification.
- No aggregate trust, risk, quality, or portability score is allowed.

### NFR-004: Compatibility and boundedness

- Registry schema remains version `2`; Feature 010 fields are optional and
  bounded.
- Maximums are 50 versions per asset, 16 aliases per version, 32 verification
  references per version or packet, and 100 comparison items.
- Existing Feature 008 and Feature 009 behavior remains available.

### NFR-005: Security and failure isolation

- Unavailable Web Crypto or download capability must produce an explicit
  failure without corrupting the active registry or claiming an export.
- Packet filenames and labels must be sanitized and bounded.
- No signing key, external verification, executable attachment, or active
  content is supported.

## Out of Scope

- Arbitrary version-to-version pair selection or branching version graphs.
- Automatic migration, automatic version creation on load, or silent repair.
- Rigid stage/environment semantics for aliases.
- Aggregate or AI-generated scores and AI-written comparison narratives.
- Raw evidence, prompt/response, credential, path, user, or registry export.
- Signing, signatures, transparency logs, external verification, import, or
  standards adapters; those belong to a later interoperability feature.
- OpenLineage, OpenTelemetry, OpenInference, or in-toto compatibility work;
  those belong to Feature 011.
- Hosted accounts, shared cloud history, analytics, or server-side packet
  storage.
- Upstream execution, scans, provider changes, policy mutation, or automated
  remediation.
- Any Spec 005/T16R5/T16/A-002 implementation, run, deployment, or release
  readiness action.

## Decisions

### D-001: Versions are explicit recorded snapshots

**Decision:** A version is created only by an explicit local action or an
approved future producer contract. Loading or refreshing a registry never
fabricates history.

**Reason:** Historical claims must have a real recording event.

### D-002: Aliases are flexible labels

**Decision:** Aliases are bounded user-controlled pointers, not environments,
approval states, or evidence.

**Reason:** Users need vocabulary such as `preferred` and `fallback` without a
forced staging model.

### D-003: First comparison is current versus immediately previous

**Decision:** Feature 010 compares the current recorded version with the
immediately previous distinct version; arbitrary pair selection is deferred.

**Reason:** This answers the primary regression/recovery question while
keeping state, focus, and user choice bounded.

### D-004: Evidence Packets use a native internal contract

**Decision:** The packet uses a strict SancusSight schema-version-1 contract
with subject/predicate separation and deterministic canonical hashing.

**Reason:** A stable internal boundary is required before Feature 011 maps it
to optional external standards.

### D-005: Schema version remains 2

**Decision:** Asset version fields are optional additions to schema-version-2
registries; absent fields remain valid.

**Reason:** The roadmap explicitly requires compatibility without automatic
migration.

## Open Questions

No product-blocking question remains. Exact TypeScript shapes, canonical JSON
algorithm, snapshot field allowlist, focus selectors, and compiler preservation
mechanics belong to design.

## Approval Checklist

- [x] Scope matches approved Feature 010 roadmap
- [x] Must Have requirements are testable
- [x] Privacy and truth boundaries are explicit
- [x] Schema-version-2 compatibility is explicit
- [x] Out-of-scope boundary protects Feature 011 and Spec 005
- [x] Operator blanket approval reconciled

## R1 Truthfulness Correction

Approved under the existing blanket authorization after independent R1
reproduced five bounded truthfulness defects.

- Imported or compiler-preserved history is authoritative only after each
  version ID is recomputed from the approved identity preimage. A syntactically
  valid but mismatched ID fails closed.
- Portable sanitization never retains `recorded` qualification for facts
  changed after recording. Retained sanitized history is an explicit
  `portable-projection` with a new deterministic ID and safe source-version
  pointer; aliases and the current pointer remap to that derivative. Unsafe or
  unverifiable history is omitted.
- Comparison includes every meaningful changed item before unchanged context.
  If meaningful changes alone exceed 100, comparison is explicitly unavailable
  with the total count; a partial `ready` result is forbidden. Omitted
  unchanged context is reported through truncation metadata.
- Asset packet comparison is derived from the named verified versions inside
  the packet boundary, never accepted as caller-authored truth.
- Product, packet, and compiler boundaries reject calendar-impossible ISO
  dates/timestamps through canonical round-trip validation.

This correction covers `R1-SPEC-001` through `R1-SPEC-003` and
`R1-STANDARDS-001` through `R1-STANDARDS-002`. It adds no signing, external
verification, migration, scoring, network storage, or Spec 005 work.
