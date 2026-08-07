# Feature: Claim Lineage and Check Catalog

> Status: Approved
> Source: `@.ai/sdd/PLAN.md`; `.ai/sdd/handoff/sancussight-product-enhancement-orchestrator-handoff.md`
> Approval: User instruction in visible orchestrator task on 2026-07-23 to continue Feature 009 autonomously under the existing blanket approval

## Overview

Feature 009 makes SancusSight's deterministic findings explainable. A user can
open a finding, see the stable check that produced it, inspect the shortest
relevant path from claim to supporting or missing evidence, and understand
what would change or invalidate the result.

The feature distinguishes recorded facts, deterministic findings, human
decisions, and missing evidence. It does not introduce a trust score, an
unbounded graph, AI judgment, upstream execution, or a new cloud service.

## Business Context

Feature 008 established one canonical Asset Passport and a stable route from
Home, Attention, and Exit Drills into an asset. The current UI names findings,
evidence text, and suggested actions, but the check definition and provenance
behind a result are not a first-class inspectable product object. Existing
governance lineage is useful for governance events, but it does not explain
every portability claim or deterministic registry check.

Feature 009 closes that gap while preserving SancusSight's local-first,
read-only evidence boundary. Inspiration from OpenLineage, GUAC, and OpenSSF
Scorecard informs interaction patterns only; it does not authorize copied code
or an external runtime dependency.

## User Stories

### US-001: Understand why a claim is believed

**As an** AI power user
**I want to** open the evidence path behind a selected claim
**So that** I can see why SancusSight currently believes it

**Acceptance Criteria:**

- [ ] A selected deterministic finding exposes a bounded, ordered path rather
  than a global graph.
- [ ] The path distinguishes claim, evidence, producer, run, target, contract,
  and human-decision steps when those steps exist.
- [ ] Each relationship is labeled `verified`, `missing`, `inferred`, `stale`,
  or `conflicting`.
- [ ] Missing steps remain visible and do not imply support.
- [ ] The inspector answers "Why do we believe this?" in plain language.

### US-002: Understand what would invalidate or change a result

**As a** governance-minded practitioner
**I want to** see the rule boundary and invalidation conditions for a claim
**So that** I know which evidence or state change would alter the result

**Acceptance Criteria:**

- [ ] The detail identifies the exact deterministic rule and inputs used.
- [ ] The detail states what would make a non-passing check pass.
- [ ] The detail states what would make a passing result stale, fail,
  conflict, or become unknown.
- [ ] The explanation does not promise that an upstream action has run or will
  succeed.

### US-003: Browse stable check definitions

**As a** tool evaluator
**I want to** browse a catalog of deterministic checks independently of any
single asset result
**So that** I can understand what SancusSight evaluates without reverse
engineering generated findings

**Acceptance Criteria:**

- [ ] Every supported deterministic asset check has a stable definition ID.
- [ ] Each definition shows its question, importance, exact rule, required
  evidence or fields, possible outcomes, and remediation guidance.
- [ ] Definitions are searchable or otherwise quickly navigable.
- [ ] A check definition remains distinguishable from an asset-specific result.
- [ ] Unsupported or legacy findings cannot masquerade as cataloged checks.

### US-004: Compare the current result with recorded history

**As an** AI power user
**I want to** see the current and previous recorded result for a selected
asset/check pair
**So that** I can recognize a regression, recovery, or unchanged condition

**Acceptance Criteria:**

- [ ] Current result status and evaluation time are visible.
- [ ] The immediately previous distinct recorded result is shown when one
  exists.
- [ ] If no prior result exists, the UI says so explicitly and does not
  fabricate a comparison.
- [ ] Result history stores bounded check metadata and references, not raw
  evidence content, prompts, responses, credentials, or workspace files.
- [ ] Repeated identical evaluations do not create misleading history noise.

### US-005: Move between a finding, its check, and its asset

**As a** keyboard or assistive-technology user
**I want to** move predictably between Attention, Check Catalog detail, claim
lineage, and the relevant Asset Passport
**So that** explanation does not cost me my place or selected context

**Acceptance Criteria:**

- [ ] Findings in Attention can open their check/result detail.
- [ ] Asset Passport findings can open the same canonical detail.
- [ ] Detail identifies and links back to the relevant asset when applicable.
- [ ] Selection and focus transitions are predictable and recoverable.
- [ ] Narrow widths and enlarged text do not create page-level horizontal
  scrolling or a duplicate focus order.

## Functional Requirements

### FR-001: Stable Check Catalog — Must Have

WHEN SancusSight exposes deterministic asset checks
THE SYSTEM SHALL provide a stable Check Catalog definition for each supported
check family
SO THAT the rule is understandable independently of generated result text.

Each definition shall include a stable ID and version, question, importance,
exact rule, inspected fields or accepted evidence, possible outcomes,
remediation, passing conditions, and invalidation conditions.

### FR-002: Asset-specific check result detail — Must Have

WHEN a user opens a cataloged check result
THE SYSTEM SHALL show the definition alongside the selected asset, current
status, finding, inspected evidence references, evaluation time, owner, and
remediation
SO THAT a definition and a concrete result are not conflated.

### FR-003: Bounded typed claim lineage — Must Have

WHEN a selected claim has supporting, missing, stale, inferred, or conflicting
evidence context
THE SYSTEM SHALL present the shortest relevant ordered path using applicable
claim, evidence, producer, run, target, contract, and human-decision steps
SO THAT the user can inspect provenance without navigating a global graph.

The inspector shall omit inapplicable node types, expose missing nodes or edges
as gaps, and never imply that an inferred or stale edge is verified.

### FR-004: Plain-language belief and invalidation explanations — Must Have

WHEN a claim detail is shown
THE SYSTEM SHALL answer "Why do we believe this?", "What is missing?", "What
would make this pass?", and "What would invalidate or change it?" using the
stable check rule and inspected evidence state
SO THAT remediation and uncertainty are actionable.

### FR-005: Bounded previous-result history — Must Have

WHEN the same stable asset/check pair is evaluated over time
THE SYSTEM SHALL retain bounded local result metadata sufficient to show the
current result and immediately previous distinct recorded result
SO THAT regressions and recoveries are visible.

The system shall deduplicate equivalent consecutive results, bound retention,
and label absent history explicitly. History shall not retain raw normalized
evidence payloads or unrestricted source content.

### FR-006: Canonical navigation into check detail — Must Have

WHEN a user opens a finding from Attention or the Asset Passport
THE SYSTEM SHALL route to one canonical check/result detail with the originating
asset and result selected
SO THAT multiple competing explanation surfaces are not introduced.

The user shall be able to return to the originating context or open the
relevant Asset Passport without losing the selected check meaning.

### FR-007: Truth-class separation — Must Have

WHEN lineage or check detail displays information
THE SYSTEM SHALL distinguish recorded facts, deterministic findings, human
decisions, and missing evidence with text and semantics, not color alone
SO THAT evidence qualification remains truthful.

### FR-008: Unsupported-result handling — Must Have

WHEN a signal or imported result does not map to a stable Check Catalog
definition
THE SYSTEM SHALL label it as an uncataloged or source-qualified observation and
SHALL NOT invent a rule, lineage edge, or remediation contract
SO THAT legacy and external findings cannot masquerade as deterministic checks.

## Non-Functional Requirements

### NFR-001: Accessibility

- Check definitions, results, lineage steps, gaps, and relationship states must
  be understandable without color.
- Catalog and inspector controls must be keyboard operable with visible focus.
- Focus must move predictably into and out of detail and return to a useful
  origin.
- The experience must remain usable at 320 CSS pixels and 200% zoom without
  page-level horizontal scrolling.

### NFR-002: Privacy and local-first operation

- Check definitions and lineage construction must run locally from already
  accepted registry, signal, evidence-reference, and decision metadata.
- No new third-party request, analytics event, hosted ingestion, prompt or
  response capture, credential capture, or unrestricted workspace read is
  allowed.
- Result history may retain only bounded statuses, timestamps, stable IDs,
  hashes, and safe references needed for comparison.

### NFR-003: Determinism and truthfulness

- Stable definitions, result mapping, edge states, remediation, and history
  comparison must be deterministic.
- The UI must not introduce an aggregate trust, risk, quality, or portability
  score.
- Missing, stale, inferred, conflicting, unavailable, and uncataloged states
  must remain explicit.
- Local or hosted UI verification must not imply Spec 005 release readiness.

### NFR-004: Compatibility

- Existing schema-version-2 registries and Feature 008 Assets behavior must
  continue to work without migration.
- Existing governance lineage remains available and is not silently replaced
  by claim lineage.
- Existing evidence adapters and producer contracts remain unchanged.

### NFR-005: Performance and boundedness

- Check indexing, result mapping, and lineage construction must be bounded by
  the active registry/result set and avoid an unbounded graph traversal.
- Default detail should show the shortest relevant path and a bounded history
  window.

## Out of Scope

- Aggregate or AI-generated trust scores.
- A global graph canvas or open-ended graph query system.
- New evidence adapters, OpenLineage import, GUAC integration, or external
  standards mapping; those belong to Feature 011.
- Asset versions, aliases, full version comparisons, or Evidence Packets;
  those belong to Feature 010.
- Prompt/response capture, LLM-judge scoring, cost analytics, or raw telemetry.
- Automated remediation, upstream execution, scanning, enforcement, or policy
  mutation.
- Signing, external verification, hosted accounts, teams, or cloud history.
- Changing existing evidence producer, release, or Spec 005 contracts.
- Any Spec 005/T16R5/T16/A-002 implementation, run, deployment, or release
  readiness action.

## Decisions

### D-001: Lineage is a shortest relevant path, not a global graph

**Decision:** Claim lineage defaults to one bounded ordered path and explicit
gaps for the selected claim.
**Reason:** The product question is why one claim is believed, not exploration
of an entire dependency graph.
**Source:** Approved roadmap and enhancement handoff
**Impacts:** FR-003, NFR-005, Out of Scope

### D-002: Check definitions and results are separate objects

**Decision:** A stable Check Catalog definition is reusable; an asset-specific
result references it and carries current evidence and status.
**Reason:** Stable rules should not be reconstructed from changing finding
copy.
**Source:** Approved roadmap
**Impacts:** FR-001, FR-002, FR-008

### D-003: History is local, bounded, metadata-only, and honest about absence

**Decision:** Result history retains only bounded safe metadata, deduplicates
equivalent consecutive results, and states when no previous result exists.
**Reason:** Comparison is useful, but raw evidence duplication would weaken
privacy and create false authority.
**Source:** Blanket approval of the Feature 009 roadmap boundary
**Impacts:** FR-005, NFR-002, NFR-003

### D-004: One canonical check-detail destination

**Decision:** Attention and Asset Passport findings open the same check/result
detail rather than embedding separate lineage implementations.
**Reason:** A single explanation surface preserves context and limits
maintenance burden.
**Source:** Feature 008's canonical-detail principle and the approved roadmap
**Impacts:** FR-006, NFR-001, NFR-004

### D-005: Unsupported observations remain uncataloged

**Decision:** Source-qualified or legacy observations without a stable
definition remain visible but do not receive an invented check contract.
**Reason:** SancusSight must not turn unfamiliar evidence into a false
deterministic claim.
**Source:** Existing evidence truthfulness boundary
**Impacts:** FR-008, NFR-003

## Questions

No critical product questions are open. The operator's no-stop blanket
approval delegates internally verifiable choices that remain within the
approved roadmap, local-first privacy boundary, deterministic model, and
canonical navigation established by Feature 008.

## Intent Replay

- **Intended outcome:** a user can open a finding, identify its stable rule,
  inspect the shortest truthful evidence path, and understand remediation and
  invalidation.
- **Representative scenario:** a failed fallback-provider check opens its
  definition, current asset result, recorded registry fields, deterministic
  evaluator/contract steps, and the exact change that would make it pass.
- **Important edge scenario:** a source observation has no stable check
  definition or prior result; it remains visible as uncataloged, and history
  reads `No previous result recorded`.
- **Must not happen:** missing or stale evidence is shown as verified, a global
  score is synthesized, raw evidence content is copied into history, or a UI
  explanation claims an upstream action occurred.
- **Unchanged behavior:** Asset Passport remains canonical, governance lineage
  remains separate, evidence adapters stay read-only, and Spec 005 stays
  paused.
- **Rejected interpretations:** Feature 009 is not an external graph platform,
  automatic fixer, full asset-version system, new producer integration, or
  authorization to run release operations.

## Glossary

- **Check definition:** A stable, versioned description of one deterministic
  evaluation rule.
- **Check result:** The application of a check definition to one asset at a
  recorded time.
- **Claim lineage:** The shortest relevant ordered explanation path behind one
  selected result.
- **Edge state:** The qualification of a relationship as verified, missing,
  inferred, stale, or conflicting.
