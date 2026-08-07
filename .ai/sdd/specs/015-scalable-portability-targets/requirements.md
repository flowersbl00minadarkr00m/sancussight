# Feature: Scalable Portability Targets

> Status: Approved
> Source: Direct operator feedback on 2026-07-24; `.ai/sdd/PLAN.md`;
> Features 008–010

## Overview

Scalable Portability Targets replaces the permanently expanding provider
matrix with a bounded comparison experience and a clearer target ontology.
SancusSight will distinguish an execution surface from a provider, model, and
protocol while preserving evidence-qualified coverage for an open-ended set of
targets such as Claude Code, Codex, ChatGPT, Open WebUI, Kimi, DeepSeek, local
runtimes, and future tools.

## Business Context

The current demo presents Claude, Codex, ChatGPT, and “Local LLM” as equivalent
columns. These labels mix products, runtime surfaces, providers, and deployment
classes. Adding every new model as a permanent column would bloat the UI and
make an X appear more authoritative than the underlying evidence warrants.

Success means the default catalog remains readable with dozens of known
targets, while a user can quickly select a small comparison set and inspect
the evidence and qualification behind every result.

## User Stories

### US-001: Understand portability at a glance

**As an** AI power user
**I want to** see a compact coverage summary for each asset
**So that** the catalog remains readable as my target inventory grows.

**Acceptance Criteria:**

- Each asset row summarizes verified, stale, unverified, not-shared, and
  not-applicable target counts using text.
- The default catalog does not render every registered target as a permanent
  column.
- The summary exposes the date or qualification boundary needed to understand
  what contributes to each count.

### US-002: Compare selected targets

**As a** tool evaluator
**I want to** choose a bounded set of targets to compare
**So that** I can inspect the portability gap relevant to my next move.

**Acceptance Criteria:**

- The user can search and select up to four comparison targets.
- Selected targets persist for the current browser workspace and can be
  cleared or replaced.
- The comparison shows textual state, evidence date, and target identity for
  each asset-target pair.
- Adding Kimi, DeepSeek, or another future target does not require a new
  hard-coded matrix component.

### US-003: Distinguish runtime, provider, model, and protocol

**As a** governance-minded practitioner
**I want to** understand what was actually tested
**So that** a model name is not confused with the application, provider, or
wire protocol that delivered it.

**Acceptance Criteria:**

- Every target has a stable kind: execution surface, provider, model,
  protocol, or local runtime.
- Coverage records identify the tested execution target and may reference
  related provider, model, and protocol identities.
- Unknown or ambiguous legacy labels remain qualified and do not become a
  verified target.

### US-004: Use the same target meaning in Exit Drills

**As a** registry owner
**I want** Asset Passports and Exit Drills to use the same target identities
**So that** portability evidence does not fragment across screens.

**Acceptance Criteria:**

- Asset coverage, provider dependencies, primary/fallback relationships, and
  Exit Drill targets resolve through the same canonical target catalog.
- A target rename preserves stable identity and display history.
- Existing schema-version-2 registries remain importable with an explicit
  legacy qualification.

## Functional Requirements

### FR-001: Canonical target catalog — Must Have

WHEN a registry is normalized
THE SYSTEM SHALL represent portability targets with stable identity, display
name, target kind, lifecycle, and optional relationships to provider, model,
protocol, or execution surface
SO THAT unlike concepts are not treated as interchangeable columns.

### FR-002: Backward-compatible legacy projection — Must Have

WHEN a schema-version-2 registry contains string platform labels
THE SYSTEM SHALL preserve import compatibility, project each label into a
qualified legacy target, and require explicit evidence before assigning a more
specific target kind
SO THAT existing registries remain truthful.

### FR-003: Compact coverage summary — Must Have

WHEN the asset catalog renders
THE SYSTEM SHALL show textual target-state counts and a bounded default summary
instead of every target column
SO THAT catalog readability does not depend on target count.

### FR-004: Bounded comparison set — Must Have

WHEN the user opens target comparison
THE SYSTEM SHALL allow search and selection of no more than four simultaneous
targets and SHALL expose clear, replace, and empty states
SO THAT detailed comparison remains focused.

### FR-005: Evidence-qualified cells — Must Have

WHEN an asset-target state is displayed
THE SYSTEM SHALL present verified, stale, unverified, not-shared, or
not-applicable in text and SHALL retain the underlying evidence date and
qualification
SO THAT glyphs and color are never the sole claim.

### FR-006: Cross-surface target identity — Must Have

WHEN Asset Passport, provider dependency, primary/fallback, or Exit Drill data
references a target
THE SYSTEM SHALL resolve the same canonical target identity and display label
SO THAT one tested relationship has one meaning across the product.

### FR-007: Open-ended target capture — Must Have

WHEN a compiler or user-reviewed registry introduces a new target
THE SYSTEM SHALL accept it through the canonical target contract without
adding hard-coded UI columns or provider-specific branches
SO THAT future models and surfaces do not bloat the interface.

### FR-008: Target filters and saved sets — Should Have

THE SYSTEM SHOULD allow filtering by target kind, lifecycle, and coverage
state and SHOULD allow a user to name a small local comparison set.

### FR-009: Detailed all-target view — Should Have

THE SYSTEM SHOULD provide a searchable per-asset target detail view for
coverage records outside the active comparison set.

## Non-Functional Requirements

### NFR-001: Scalability

- Default asset catalog layout remains bounded with at least 100 registered
  targets and 1,000 assets using deterministic test fixtures.
- Search and comparison selection do not require rendering the full
  asset-by-target Cartesian matrix.

### NFR-002: Accessibility

- State is never communicated by glyph or color alone.
- Target picker, comparison, empty state, and all-target detail are keyboard
  operable with visible focus and usable at 320 CSS pixels and effective 200%
  zoom.

### NFR-003: Truthfulness

- Target kind, relationship, coverage state, and verification date remain
  separate recorded facts.
- Missing evidence cannot become not-shared or verified merely because a
  target is known.
- Aggregate counts are navigation aids, not trust or portability scores.

### NFR-004: Compatibility and determinism

- Existing schema-version-2 registries remain importable.
- Target normalization, ordering, summaries, and comparison results are
  deterministic for unchanged input.

## Out of Scope

- Automatically testing an asset against a provider or model.
- Live model catalogs, pricing, benchmarks, or capability claims.
- An aggregate trust, quality, or portability score.
- Treating all models from one provider as equivalent.
- Rendering an unbounded matrix or graph by default.
- Changing the evidence required to call coverage verified.

## Decisions

### D-001: Summary first, selected comparison second

**Decision:** Replace permanent all-target columns with a compact summary and
an explicit comparison set of at most four targets.
**Reason:** Portability needs to scale without hiding evidence or overwhelming
the catalog.
**Source:** Direct operator request on 2026-07-24.
**Impacts:** US-001, US-002, FR-003 through FR-005, NFR-001.

### D-002: Separate target kinds

**Decision:** Model execution surface, provider, model, protocol, and local
runtime as distinct target kinds with relationships.
**Reason:** Claude Code, ChatGPT, Kimi, DeepSeek, and Local LLM are not the
same conceptual layer.
**Source:** Direct operator request and observed demo matrix.
**Impacts:** US-003, US-004, FR-001, FR-002, FR-006, FR-007.

## Questions

No critical requirement question remains. Target schema versioning, migration
shape, picker components, and persistence details belong to design.

## Intent Replay

- **Intended outcome:** SancusSight can record many portability targets while
  keeping the catalog compact and the selected comparison precise.
- **Representative scenario:** The user compares Claude Code, Codex, Kimi K3
  through an OpenAI-compatible surface, and a local runtime; every target
  retains its own kind and evidence-qualified state.
- **Important edge:** A legacy `local-llm` label has no model or protocol
  metadata. It remains a qualified legacy target rather than being guessed
  into a specific provider.
- **Must not happen:** A new model creates a permanent application column or
  inherits verified coverage from its provider.
- **Unchanged:** Existing deterministic coverage rules, Asset Passports,
  evidence dates, and Exit Drill outcomes remain authoritative.
- **Rejected interpretations:** This is not a model leaderboard, live
  capability catalog, benchmark, or automated portability test.
