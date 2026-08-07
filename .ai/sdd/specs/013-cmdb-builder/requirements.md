# Feature: CMDB Builder and Registry Enrichment

> Status: Approved
> Source: Direct operator request on 2026-07-24; Feature 007 Local Registry
> Compiler; Feature 008 Asset Passport and searchable catalog

## Overview

CMDB Builder extends SancusSight's local registry-compiler flow into a
reviewable asset-standardization workflow. The existing compiler discovers
metadata from explicitly authorized local inventories. CMDB Builder then
normalizes those proposals into a consistent asset record, identifies missing
search fields, and may retrieve bounded metadata from reputable external
sources to propose cited enrichment.

External information remains a proposal, not a canonical fact. The user
reviews every proposed addition or change before it enters the registry.
Accepted records feed the existing searchable catalog and Asset Passport
without weakening local-first privacy, provenance, or deterministic checks.

## Business Context

Feature 007 removes the need to hand-author a registry, but discovered assets
can still vary in naming, type, ownership, lifecycle, provider, version, and
source metadata. That inconsistency makes search, filtering, comparison, and
cross-tool portability analysis less reliable.

A CMDB-style builder can make AI assets more searchable by applying one
reviewable record shape and using authoritative public sources to fill
well-bounded gaps such as official product name, publisher, supported
platforms, license, current version, documentation URL, and standards
identifiers. It must not upload private content, infer sensitive facts, or
replace user-owned decisions with web-derived claims.

## User Stories

### US-001: Compile a local AI asset registry

**As an** AI power user  
**I want to** start CMDB Builder from explicitly authorized local inventories  
**So that** I can create a useful asset registry without describing every
project, skill, workflow, control, connector, and tool by hand.

**Acceptance Criteria:**

- The flow reuses or imports the Feature 007 compiler's bounded discovery
  proposals rather than running an unrelated second scanner.
- The user can see which local roots and inventory types were inspected,
  skipped, unreadable, or out of scope.
- Raw prompts, responses, reasoning, command bodies, credentials, secrets, and
  unrestricted file contents never enter the proposal set.

### US-002: Standardize assets for searchability

**As a** registry owner  
**I want to** normalize discovered assets into consistent CMDB-style fields  
**So that** search, filters, grouping, comparison, and Asset Passports behave
consistently across tools and platforms.

**Acceptance Criteria:**

- Each proposal distinguishes recorded local facts, deterministic
  classifications, externally sourced suggestions, human decisions, and
  missing information.
- The review identifies missing or inconsistent values for stable identity,
  name, kind, owner, lifecycle, format, provider, version, source product,
  producer, consumers, license, platform support, source URL, and observed
  time where those fields are applicable.
- Normalization never converts an unknown value into a positive or verified
  claim.
- Accepted values become available to the existing searchable catalog and
  Asset Passport without creating a competing asset-detail model.

### US-003: Enrich records from reputable sources

**As a** tool evaluator  
**I want** bounded missing metadata to be proposed from reputable public
sources  
**So that** common tools and standards are easier to identify without manual
research.

**Acceptance Criteria:**

- Every externally sourced proposal names the source, retrieval time, exact
  field, source URL or stable source identifier, and confidence/qualification.
- First-party documentation, publisher repositories, standards bodies, and
  official package registries are distinguishable from secondary sources.
- Conflicting, stale, unavailable, or unsupported source results remain
  visible and cannot be silently merged into one confident value.
- The user can accept, reject, or edit each proposed field before it becomes a
  registry fact.

### US-004: Review and publish a searchable registry

**As a** governance-minded practitioner  
**I want to** review a diff before publishing normalized records  
**So that** external enrichment and automated classification remain
accountable.

**Acceptance Criteria:**

- Review groups new assets, merged duplicates, proposed field changes,
  conflicts, rejected suggestions, and missing fields.
- Existing human decisions and accepted facts are not overwritten merely
  because a new source disagrees.
- Publishing requires explicit confirmation and produces the same local and
  sanitized portable output classes defined by Feature 007.
- The resulting registry passes schema, privacy, identity, provenance, and
  duplicate checks before it can be opened in SancusSight.

### US-005: Browse canonical asset metadata without breaking source tools

**As a** registry owner
**I want to** browse assets through a predictable labelled index while
preserving their real source locations
**So that** I can find and edit an asset without moving a fixed-location file
or creating an untracked duplicate.

**Acceptance Criteria:**

- The published local output includes a generated, browsable asset index
  grouped by approved labels such as kind, lifecycle, owner, or source.
- Every index entry resolves to one canonical registry identity and records
  its current location plus retained prior-location aliases where available.
- Generating or refreshing the index does not move, copy, overwrite, delete,
  or replace an upstream asset.
- When a prior location disappears, the index explains the recorded new
  location or unresolved missing state without fabricating a redirect.

## Functional Requirements

### FR-001: Compiler-backed discovery — Must Have

WHEN a user starts CMDB Builder  
THE SYSTEM SHALL consume Feature 007-compatible discovery proposals from only
the local inventories the user explicitly authorized  
SO THAT CMDB Builder standardizes a bounded inventory rather than expanding
SancusSight into an unrestricted scanner.

### FR-002: Canonical field profile — Must Have

WHEN an asset proposal enters CMDB Builder  
THE SYSTEM SHALL map applicable metadata into one versioned SancusSight asset
profile and identify missing, incompatible, or ambiguous values  
SO THAT assets can be searched and compared consistently.

The profile shall preserve stable identity, provenance, source qualification,
and the distinction between recorded facts, deterministic findings, external
suggestions, and human decisions.

### FR-003: Bounded enrichment request — Must Have

WHEN the user enables external enrichment for selected proposals  
THE SYSTEM SHALL send only approved, non-sensitive lookup identifiers and
field requests to an approved source adapter  
SO THAT public metadata can be retrieved without uploading local paths,
content, evidence payloads, or unrelated registry data.

### FR-004: Reputable-source policy — Must Have

WHEN an adapter retrieves external metadata  
THE SYSTEM SHALL classify the source under a visible source policy and SHALL
retain exact field-level citation and retrieval metadata  
SO THAT the user can judge whether a proposal is authoritative enough to
accept.

The first preferred source classes are official publisher documentation,
official source repositories, standards bodies, and official package
registries. Secondary sources shall not silently override first-party facts.

### FR-005: Proposal-only enrichment — Must Have

WHEN external or normalized metadata differs from the current registry  
THE SYSTEM SHALL present a field-level proposal and SHALL NOT overwrite,
publish, or mark the value verified without explicit user acceptance  
SO THAT external lookup never becomes hidden authority.

### FR-006: Conflict and uncertainty handling — Must Have

WHEN sources disagree, a source is stale, a field is unsupported, or identity
is ambiguous  
THE SYSTEM SHALL preserve the conflict or gap with stable reason text and
exclude it from automatic acceptance  
SO THAT missing or conflicting information is not converted into false
precision.

### FR-007: Reviewable CMDB diff — Must Have

WHEN normalization and optional enrichment finish  
THE SYSTEM SHALL provide a reviewable diff grouped by asset and field,
including source, qualification, old value, proposed value, and user decision  
SO THAT the registry owner can accept, reject, or edit changes deliberately.

### FR-008: Searchable registry output — Must Have

WHEN the user confirms accepted proposals  
THE SYSTEM SHALL produce schema-valid local and sanitized portable registry
outputs whose accepted normalized fields are available to existing SancusSight
search, filters, Asset Passports, checks, and Exit Drills  
SO THAT standardization improves the current operating loop.

### FR-009: Refresh without decision loss — Must Have

WHEN CMDB Builder is run against an existing registry  
THE SYSTEM SHALL preserve prior human decisions, accepted-source provenance,
aliases, versions, evidence bindings, and archived/missing history unless the
user explicitly changes them  
SO THAT enrichment refreshes do not erase governance context.

### FR-010: Source and privacy diagnostics — Must Have

WHEN a local or external source is skipped, rejected, unavailable, rate
limited, malformed, stale, or privacy-blocked  
THE SYSTEM SHALL report a bounded diagnostic without exposing sensitive values
and SHALL allow unrelated proposals to continue  
SO THAT partial failure remains truthful and recoverable.

### FR-011: Offline standardization — Should Have

WHEN external lookup is unavailable or declined  
THE SYSTEM SHOULD still normalize local proposals, show missing fields, and
produce a reviewable registry without fabricating enrichment  
SO THAT the core builder remains useful offline.

### FR-012: Source-policy presets — Could Have

THE SYSTEM MAY offer conservative source-policy presets after the approved
source hierarchy and privacy model are proven, while preserving field-level
review and citations.

### FR-013: Canonical metadata index — Must Have

WHEN accepted normalized assets are published
THE SYSTEM SHALL generate a deterministic, labelled local metadata index whose
entries point to canonical registry identities and recorded source locations
SO THAT users can browse a consistent asset structure without relocating or
duplicating upstream assets.

### FR-014: Location history and aliases — Must Have

WHEN a refresh observes a changed, missing, or newly declared asset location
THE SYSTEM SHALL preserve the prior location as qualified history, present the
new or missing state for review, and require acceptance before changing the
canonical location
SO THAT users can understand where an asset went without silent path rewrites.

### FR-015: Manifest-backed new asset discovery — Must Have

WHEN a supported authorized inventory adds a new asset manifest or record
THE SYSTEM SHALL present it as a new compiler-backed proposal during refresh
and SHALL report sources outside the supported manifest contract as unobserved
SO THAT new-asset coverage is explicit rather than inferred from unrestricted
filesystem scanning.

## Non-Functional Requirements

### NFR-001: Privacy and data minimization

- External requests may contain only explicitly approved public identifiers
  and requested field names.
- Local paths, prompts, responses, reasoning, documents, credentials, secrets,
  evidence payloads, and unrestricted registry objects must not leave the
  machine.
- Portable output continues to use bounded path aliases and excludes
  credential-adjacent material.

### NFR-002: Truthfulness and provenance

- Every accepted external value retains its source class, citation, retrieval
  time, and acceptance decision.
- Source authority is field-specific; one reputable field does not make the
  entire asset verified.
- Missing, conflicting, stale, simulated, or inferred values remain textual
  and cannot contribute a positive claim as if recorded fact.

### NFR-003: Usability and accessibility

- Large proposal sets support search, grouping, filtering, and clear bulk
  review without obscuring per-field provenance.
- Review, accept, reject, edit, conflict, offline, and failure states are
  keyboard operable, visible without color, and usable at narrow widths and
  enlarged text.

### NFR-004: Reliability and reversibility

- Existing registry outputs remain recoverable before and after publishing.
- Partial local or network failures do not discard unrelated accepted work.
- Re-running the builder produces a deterministic diff for unchanged inputs
  and retained source snapshots.

### NFR-005: Source-tool compatibility

- Publishing the canonical metadata index must not change paths that upstream
  tools require.
- Index entries and location history must not be executable redirects.
- Any future physical relocation capability requires a separate approved
  feature with preview, dependency checks, rollback, and tool-specific
  compatibility evidence.

## Out of Scope

- Unrestricted web crawling or autonomous research.
- Uploading local content or a complete registry to an external service.
- Treating external metadata as canonical without human review.
- Guessing owners, sensitivity, business criticality, accepted risk, evidence
  freshness, control effectiveness, or portability from public sources.
- Executing discovered assets, installing tools, connecting to MCP servers,
  initiating scans, enforcing policy, or mutating upstream systems.
- Replacing Feature 007 discovery, the Feature 008 Asset Passport, or the
  existing searchable catalog with a parallel CMDB application.
- Compliance certification, security guarantees, or an aggregate trust score.
- Technical choices for source adapters, caching, ranking, UI components,
  network transport, or enrichment providers; those belong to design after
  requirements approval.
- Moving, renaming, copying, deleting, symlinking, junctioning, or replacing
  upstream asset files and directories.
- Claiming that unsupported or arbitrary local files were discovered.

## Decisions

### D-001: CMDB Builder extends the local compiler

**Decision:** Use Feature 007 discovery proposals as CMDB Builder's local
inventory input rather than introducing another scanner.  
**Reason:** One bounded discovery authority avoids duplicate identity and
privacy behavior.  
**Source:** Operator request to compile the local registry and standardize it
for searchability.  
**Impacts:** US-001, FR-001, FR-008, Out of Scope.

### D-002: External enrichment remains cited and reviewable

**Decision:** Reputable-source lookups produce field-level proposals with
citations; they never silently become canonical facts.  
**Reason:** Searchability improves only if enrichment is useful without
weakening ownership and provenance.  
**Source:** Operator request plus SancusSight product steering.  
**Impacts:** US-003, US-004, FR-004 through FR-007, NFR-002.

### D-003: Standardization feeds existing product surfaces

**Decision:** Accepted normalized fields feed the current catalog, Asset
Passport, checks, and Exit Drills rather than creating a parallel CMDB UI.  
**Reason:** The canonical asset operating loop is already established by
Features 008–010.  
**Source:** Existing approved product plan and direct operator request.  
**Impacts:** US-002, FR-002, FR-008, Out of Scope.

### D-004: Canonical means metadata authority first

**Decision:** Generate a labelled canonical metadata index over recorded asset
locations; do not move or duplicate upstream assets in this feature.
**Reason:** Many agent and provider assets require fixed locations, while a
stable registry identity and location history still make them findable.
**Source:** Direct operator request on 2026-07-24, reconciled with the
local-first read-only product boundary.
**Impacts:** US-005, FR-013 through FR-015, NFR-005, Out of Scope.

### D-005: New assets enter through supported manifests

**Decision:** Refresh discovers new assets from approved inventory records and
explicit manifests, not unrestricted recursive scanning.
**Reason:** This preserves bounded discovery and makes coverage gaps truthful.
**Source:** Direct operator request plus Feature 007 authority boundary.
**Impacts:** FR-001, FR-015, NFR-001, NFR-002.

## Questions

### Q-001: Approved source hierarchy

**Status:** answered  
**Answer:** Start with official publisher documentation, official source
repositories, standards bodies, and official package registries. Secondary
sources require a later explicit contract decision.  
**Why it matters:** This defines what “reputable” means and how conflicts are
ranked.  
**Impacts:** FR-004, FR-006, NFR-002.

### Q-002: External lookup privacy boundary

**Status:** answered  
**Answer:** Require per-run opt-in and show the exact safe identifiers and
requested fields before any network request.  
**Why it matters:** Asset names and internal identifiers can themselves reveal
private project information.  
**Impacts:** FR-003, NFR-001.

### Q-003: Acceptance and overwrite behavior

**Status:** answered  
**Answer:** Never overwrite accepted facts or human decisions. Permit bounded
bulk acceptance only for empty fields from one approved source class when the
user explicitly selects the affected proposals.  
**Why it matters:** Bulk enrichment can otherwise erase deliberate governance
choices.  
**Impacts:** FR-005, FR-007, FR-009, NFR-004.

## Intent Replay

- **Intended outcome:** Turn bounded local discovery into a consistent,
  searchable asset registry with optional cited metadata proposals.
- **Representative scenario:** The compiler discovers an AI tool and workflow;
  CMDB Builder normalizes their fields, retrieves official publisher and
  package metadata for empty public fields, lets the user review a cited diff,
  and publishes a labelled metadata index that points back to each asset's
  recorded source location.
- **Important edge:** Two authoritative sources disagree on version or license;
  the conflict remains visible and neither value is accepted automatically.
- **Must not happen:** Private paths or content leave the machine, or a web
  result silently overwrites an owner, risk decision, evidence state, or
  accepted registry fact; publishing also must not move, copy, symlink,
  overwrite, or replace an upstream asset.
- **Unchanged:** Existing compiler discovery, local/portable outputs, Asset
  Passport, deterministic checks, evidence qualification, and upstream
  read-only authority.
- **Rejected interpretations:** CMDB Builder is not an unrestricted crawler,
  autonomous asset-management platform, physical file organizer, compliance
  engine, or source of security truth.

## Glossary

- **CMDB Builder:** The reviewable normalization and enrichment workflow over
  Feature 007-compatible discovery proposals.
- **Reputable source:** A source class explicitly approved for a named field,
  with first-party publishers, repositories, standards bodies, and package
  registries preferred.
- **External suggestion:** A cited field-level proposal that is not a registry
  fact until accepted by the user.
- **Canonical field profile:** The versioned SancusSight asset metadata shape
  used by the existing catalog and Asset Passport.
