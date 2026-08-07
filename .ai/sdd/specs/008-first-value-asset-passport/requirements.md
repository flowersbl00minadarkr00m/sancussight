# Feature: First Value, Asset Passport, and Navigation

> Status: Approved
> Source: `@.ai/sdd/PLAN.md`; explicit operator decisions in `.ai/sdd/handoff/sancussight-product-enhancement-orchestrator-handoff.md`
> Approval: Blanket operator approval relayed from visible source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` on 2026-07-23

## Overview

Feature 008 makes SancusSight's existing registry useful sooner and easier to
understand. A user can enter through a clearly identified sample, existing
registry, or compiler-created registry path; browse a searchable and
filterable asset catalog; and inspect one canonical Asset Passport without
losing the relationship between the selected asset and its detail.

On desktop, the catalog and selected Asset Passport remain side by side in a
persistent master-detail experience. On narrow screens, SancusSight uses an
intentional accessible transition into and out of asset detail instead of
placing an easy-to-miss inspector below a long table. The workspace navigation
is simplified around the user's operating loop, and the hosted page footer is
reduced to the canonical product URL only.

## Business Context

The current product already contains registry evaluation, evidence,
governance, exit-drill, and local compiler capabilities, but first value is
split across entry paths and a dense tab hierarchy. Direct screenshots of the
hosted product show the selected asset inspector below the catalog on desktop,
where the relationship to the selected row becomes unclear after scrolling.
They also show stale personal attribution in the hosted footer that differs
from current local source.

This feature consolidates those behaviors without changing SancusSight's
local-first ownership model, deterministic checks, evidence qualification, or
no-opaque-score position. Deployed behavior at
`https://sancussight.vercel.app` must be verified because local source alone
does not establish the hosted result.

## User Stories

### US-001: Obtain first value without hand-authoring registry JSON

**As an** AI power user  
**I want to** choose a sample, open an existing registry, or build one with the
local registry compiler  
**So that** I can begin assessing my AI assets through a path whose source and
authority are clear

**Acceptance Criteria:**

- [ ] Sample, existing-registry, and compiler-created paths are visibly
  distinct before the user enters the workspace.
- [ ] Each path explains whether the resulting data is demonstrative,
  user-selected, or compiler-created.
- [ ] Completing any successful path opens the same canonical Assets
  experience without misrepresenting sample or hosted/manual data as locally
  current evidence.
- [ ] A failed or cancelled path returns a clear recovery choice without
  silently substituting sample data.

### US-002: Browse assets and inspect one canonical passport

**As an** AI power user  
**I want to** search and filter my catalog and inspect the selected asset in
one canonical Asset Passport  
**So that** I can understand its portability, dependencies, evidence,
decisions, and history without assembling the picture across unrelated views

**Acceptance Criteria:**

- [ ] The catalog supports search and filters for owner, kind, lifecycle,
  portability state, provider, and evidence freshness when those values exist.
- [ ] Search and filter results state when no assets match and allow the user
  to recover by changing or clearing the active criteria.
- [ ] Selecting an asset exposes one Asset Passport with the sections
  `Summary`, `Portability`, `Dependencies`, `Evidence`, `Decisions`, and
  `History`.
- [ ] Missing information is identified as missing or unavailable rather than
  omitted in a way that implies a positive result.

### US-003: Keep desktop catalog selection and detail visibly associated

**As a** desktop user  
**I want to** keep the catalog and selected Asset Passport side by side  
**So that** I can switch assets quickly without scrolling below the table or
losing which row the detail describes

**Acceptance Criteria:**

- [ ] At desktop widths that support the full experience, the catalog occupies
  one side and the selected Asset Passport occupies the other.
- [ ] The selected Asset Passport is not rendered below the catalog in the
  desktop experience.
- [ ] The selected row remains visibly identified without relying on color
  alone.
- [ ] Switching rows updates the adjacent passport in place while preserving
  the user's catalog context.
- [ ] If no asset is selected, the passport region clearly asks the user to
  select an asset and does not imply that the first row is selected.

### US-004: Inspect and return accessibly on narrow screens

**As a** keyboard, assistive-technology, or narrow-screen user  
**I want an intentional transition between the catalog and selected asset
detail  
**So that** detail is discoverable, focus is predictable, and I can return to
the selected catalog row

**Acceptance Criteria:**

- [ ] Selecting a row on a narrow screen moves the user into an unmistakable
  asset-detail state instead of appending the inspector below the long catalog.
- [ ] The detail state identifies the selected asset and provides a clear
  return to the catalog.
- [ ] Keyboard and assistive-technology users receive a predictable focus
  transition into detail and back to the originating or still-selected row.
- [ ] Selection, close/back, loading, empty, and error states are understandable
  without color, hover, animation, or pointer input.
- [ ] The experience remains usable at narrow widths and enlarged text without
  requiring page-level horizontal scrolling.

### US-005: Navigate around the portability operating loop

**As a** SancusSight user  
**I want a small primary navigation with advanced evidence and governance
destinations still available  
**So that** common questions are prominent without removing deeper proof

**Acceptance Criteria:**

- [ ] Primary navigation contains `Home`, `Assets`, `Exit Drills`, and
  `Attention`.
- [ ] Advanced navigation contains `Evidence Sources`, `Governance`, `Release
  Proofs`, `Activity`, and `Definitions`.
- [ ] Home helps the user answer: what can move, what will break, what evidence
  is stale, and what should be fixed first.
- [ ] Attention and Exit Drills can open the relevant asset and passport state
  without losing the meaning of the originating finding or drill.
- [ ] Advanced destinations remain keyboard reachable and do not disappear
  merely because they are secondary.

### US-006: Present a canonical, non-personal hosted footer

**As a** visitor to the hosted product  
**I want the page footer to identify only the canonical product URL  
**So that** the product is not framed as personal attribution and the canonical
location is directly accessible

**Acceptance Criteria:**

- [ ] The persistent hosted page footer contains exactly one reader-facing
  item: a clickable `https://sancussight.vercel.app` link whose visible text is
  the same canonical URL.
- [ ] The hosted page footer contains no operator name, personal-brand
  attribution, verbose product disclaimer, or additional footer copy.
- [ ] The link resolves to the canonical HTTPS product URL.
- [ ] Verification is performed against the deployed hosted artifact, not only
  local development output.

## Functional Requirements

### FR-001: Distinct first-value entry paths — Must Have

WHEN a user starts SancusSight without an active registry  
THE SYSTEM SHALL present distinct sample, existing-registry, and
compiler-created registry paths  
SO THAT the user can choose how authoritative data enters the workspace.

The system shall preserve and communicate the selected source kind. It shall
not silently replace a cancelled, unreadable, incompatible, or failed local
source with sample data.

### FR-002: Searchable and filterable asset catalog — Must Have

WHEN a registry is active  
THE SYSTEM SHALL allow the user to search the asset catalog and filter
available assets by owner, kind, lifecycle, portability state, provider, and
evidence freshness where the registry supplies those dimensions  
SO THAT the user can narrow the catalog to relevant assets.

The system shall expose active criteria, result count or equivalent result
state, an understandable no-results state, and a way to clear or change the
criteria.

### FR-003: One canonical Asset Passport — Must Have

WHEN an asset is selected  
THE SYSTEM SHALL present one canonical Asset Passport containing `Summary`,
`Portability`, `Dependencies`, `Evidence`, `Decisions`, and `History`  
SO THAT the asset's state and supporting context are not fragmented across
competing detail concepts.

The passport shall distinguish recorded facts, deterministic findings,
evidence qualification, human decisions, and missing information where those
classes are present.

### FR-004: Persistent desktop master-detail behavior — Must Have

WHEN the Assets experience has sufficient desktop space  
THE SYSTEM SHALL present the catalog and the selected Asset Passport side by
side as one persistent master-detail experience  
SO THAT the selected row and its detail remain visibly associated without
scrolling below the catalog.

Selecting another visible catalog row shall update the adjacent passport while
preserving the catalog's search, filters, position, and selected-row context.

### FR-005: Visible selected-row association — Must Have

WHEN an asset is selected in the catalog  
THE SYSTEM SHALL identify that row as selected using text, semantics, shape,
position, or another non-color-only cue and SHALL identify the same asset in
the passport heading  
SO THAT a user can confirm which row the detail describes.

WHEN no asset is selected  
THE SYSTEM SHALL show an explicit selection prompt and SHALL NOT imply an
automatic first-row selection.

### FR-006: Deliberate narrow-screen detail transition — Must Have

WHEN available width cannot preserve an understandable side-by-side
experience and a user selects an asset  
THE SYSTEM SHALL transition to an explicit asset-detail state with the
selected asset identified, focus placed predictably, and a clear return path
to the selected catalog row  
SO THAT the inspector is not hidden below a long table.

The exact presentation pattern is a design decision, but it must satisfy the
observable selection, focus, return, keyboard, assistive-technology, and
overflow behavior in US-004.

### FR-007: Simplified primary and advanced navigation — Must Have

WHEN the user is inside the workspace  
THE SYSTEM SHALL provide primary destinations `Home`, `Assets`, `Exit Drills`,
and `Attention`, and advanced destinations `Evidence Sources`, `Governance`,
`Release Proofs`, `Activity`, and `Definitions`  
SO THAT the primary operating loop is prominent without removing advanced
evidence and governance access.

### FR-008: Context-preserving links into assets — Should Have

WHEN a user follows an item from Attention or an Exit Drill to an asset  
THE SYSTEM SHALL open Assets with the relevant asset selected and preserve
enough origin context to explain why the user arrived there  
SO THAT navigation does not disconnect the action from its finding or drill.

### FR-009: Canonical hosted footer — Must Have

WHEN the hosted application renders its persistent page footer  
THE SYSTEM SHALL render only one clickable link with visible text and target
`https://sancussight.vercel.app`  
SO THAT the canonical product location is clear and no personal attribution is
present.

The persistent page footer shall contain no personal name, personal-brand
copy, verbose disclaimer, or additional reader-facing item. Contextual
truthfulness notices required inside product views may remain in their
relevant content regions rather than the persistent page footer.

### FR-010: Hosted-artifact verification — Must Have

WHEN Feature 008 is considered for completion or deployment  
THE SYSTEM SHALL be verified at the canonical hosted URL for desktop
master-detail behavior, narrow-screen behavior, navigation, selected-state
association, and exact footer content  
SO THAT local and deployed behavior cannot silently diverge.

### FR-011: Source and evidence truthfulness — Must Have

WHEN the user enters through sample, existing-registry, compiler-created, or
hosted/manual data  
THE SYSTEM SHALL preserve truthful source and evidence qualification and SHALL
NOT imply local freshness, verified control coverage, or release readiness
that the selected source does not establish.

## Non-Functional Requirements

### NFR-001: Accessibility

- All catalog, filter, navigation, passport, selection, and return actions must
  be keyboard operable with visible focus.
- Selection and status must not rely on color alone.
- The narrow-screen transition must expose an understandable state change and
  restore focus predictably.
- Content must remain understandable with reduced motion, enlarged text, and
  without hover-only information.
- The page must avoid horizontal overflow at supported desktop and narrow
  widths.

### NFR-002: Usability and continuity

- Search, filter, row switching, and return from detail must preserve relevant
  catalog context unless the user explicitly resets it.
- Loading, empty, missing-data, incompatible-data, and error states must name
  the affected context and a safe recovery action.
- One canonical Asset Passport must replace or consolidate competing asset
  detail presentations rather than add another parallel detail concept.

### NFR-003: Privacy and local-first boundaries

- Feature 008 must preserve current local-first and hosted/manual boundaries.
- No registry content, evidence, or compiler input may be uploaded merely to
  support catalog, passport, search, filtering, or navigation behavior.
- The hosted page footer must not expose the operator's personal name.

### NFR-004: Truthfulness

- The UI must distinguish recorded facts, deterministic findings, evidence
  states, and human decisions where displayed.
- No aggregate trust score may be introduced.
- Missing, stale, unverified, conflicting, or unavailable information must not
  be represented as verified or healthy.

### NFR-005: Compatibility

- Existing supported registry files, sample data, and compiler-created
  registries must enter the same canonical Assets experience without silently
  changing their source meaning.
- Advanced evidence, governance, release-proof, activity, and definition
  capabilities must remain reachable after navigation simplification.

## Out of Scope

- Claim-level lineage and the Check Catalog, planned for Feature 009.
- Asset versions, aliases, comparisons, and Evidence Packets, planned for
  Feature 010.
- Standards interoperability, planned for Feature 011.
- Aggregate trust scores, AI scoring, or global graph visualization.
- Saved or shareable hosted filters.
- Prompt/response observability, LLM-judge scoring, or cost analytics.
- Automatic migration, upstream execution, scanning, enforcement, or policy
  mutation.
- Hosted accounts, teams, or enterprise permissions.
- Technical selection of responsive components, breakpoints, state
  architecture, APIs, or libraries; those belong to design after requirements
  approval.
- Any Spec 005/T16R5 correction, A-002 run, release-readiness change, or
  deployment authorization.

## Decisions

### D-001: Desktop uses catalog-plus-passport master detail

**Decision:** At supported desktop widths, the catalog and selected Asset
Passport remain side by side; the passport is not placed below the catalog.  
**Reason:** The supplied hosted screenshot shows that below-table detail loses
its visible relationship to the selected row.  
**Source:** Explicit operator decision relayed in the enhancement handoff and
plan approval  
**Impacts:** US-003, FR-004, FR-005

### D-002: Narrow screens require an accessible detail transition

**Decision:** Narrow screens use an intentional detail state with clear
selection, focus transfer, and return behavior. The exact presentation is
deferred to design.  
**Reason:** A stacked inspector below a long catalog is easy to miss and
creates an unclear keyboard and assistive-technology flow.  
**Source:** Explicit operator decision relayed in the enhancement handoff and
plan approval  
**Impacts:** US-004, FR-006, NFR-001

### D-003: Hosted footer is the canonical URL only

**Decision:** The persistent hosted page footer contains only the clickable
canonical URL `https://sancussight.vercel.app`, with no personal name or
additional footer copy.  
**Reason:** The supplied hosted screenshot shows stale personal attribution,
and the operator explicitly requested a product-only footer.  
**Source:** Explicit operator decision relayed in the enhancement handoff and
plan approval  
**Impacts:** US-006, FR-009, FR-010, NFR-003

### D-004: One canonical Asset Passport

**Decision:** Asset detail is consolidated into one Asset Passport with
`Summary`, `Portability`, `Dependencies`, `Evidence`, `Decisions`, and
`History`.  
**Reason:** One stable object reduces fragmentation and gives later lineage,
versioning, and packet features a shared asset context.  
**Source:** Approved project plan  
**Impacts:** US-002, FR-003, NFR-002

### D-005: Navigation follows the portability operating loop

**Decision:** Primary navigation is `Home | Assets | Exit Drills | Attention`;
advanced navigation is `Evidence Sources | Governance | Release Proofs |
Activity | Definitions`.  
**Reason:** Common portability questions should be prominent while deeper
evidence and governance capabilities remain available.  
**Source:** Approved project plan  
**Impacts:** US-005, FR-007, FR-008, NFR-005

### D-006: First-value paths remain source-distinct

**Decision:** Sample, existing-registry, and compiler-created entry paths
remain visibly distinct and converge only after their source meaning is
established.  
**Reason:** First value must improve without letting convenient sample data
masquerade as user-owned or current local evidence.  
**Source:** Approved project plan  
**Impacts:** US-001, FR-001, FR-011, NFR-003, NFR-004

## Questions

No critical product questions are open in this revision. Requirements approval
will confirm the proposed neutral no-selection state, the exact Asset Passport
sections, and the distinction between the persistent page footer and
contextual truthfulness notices inside product views.

## Glossary

- **Asset Passport:** The single canonical detail experience for one registered
  AI asset.
- **Master-detail:** A product behavior in which a collection remains visible
  while detail for the selected item is shown alongside it.
- **Hosted/manual:** Browser-only snapshot behavior that does not establish
  live local evidence.
- **Evidence freshness:** Whether evidence remains current under its approved
  source and timing contract.
