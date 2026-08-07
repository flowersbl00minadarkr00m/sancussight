# Feature: Contextual Source Save and Compact Asset Passport

> Status: Approved
> Approval: Explicit operator direction on 2026-07-24 authorized the
> completed-Spec correction workflow while preserving separate design and
> tasks approval gates
> Source: Operator-directed UI correction relayed 2026-07-24; completed
> Specs 002, 003, and 008

## Overview

SancusSight shall make source-write state and action feedback easy to find
where a user is editing an asset, while reducing the vertical burden of the
selected Asset Passport. A compact global source indicator remains visible
for provenance and permission truth. The actionable save strip moves to the
top of the selected Asset Passport. Secondary Passport sections become native
keyboard-accessible disclosures that start collapsed, while Summary remains
open.

This feature changes presentation and focus behavior only. It does not change
the canonical-source state machine, write confirmation, conflict detection,
recovery, registry data, Asset Passport content, or source truth.

## Business Context

Specs 002 and 003 made source identity, freshness, permission, synchronization,
and recovery visible in the global workspace header. Feature 008 then made
the selected Asset Passport the primary asset-editing surface. In the current
combined product, the actionable write state and save result can be hard to
find in the header, while six fully expanded Passport sections create
excessive vertical scanning.

The correction must preserve Spec 003 FR-003 source truth and the deliberate
write safety of FR-005 through FR-008. It must also preserve Feature 008's
desktop catalog/Passport association, narrow detail transition, focus return,
six-section information architecture, and canonical footer.

## Impact Analysis

| Existing contract | Preserved | Presentation change |
|---|---|---|
| Spec 002 workspace hierarchy | Primary/advanced navigation, notices, routes, header identity | Detailed source action feedback no longer competes in the global header |
| Spec 003 FR-003 | Safe source identity, freshness, read/write permission, and textual synchronization state remain always visible | Indicator becomes compact |
| Spec 003 FR-005–FR-008 | Dirty state, explicit confirmation, permission request, preflight conflict prevention, verified write, failure recovery | Action and save-result strip moves to the selected Passport |
| Feature 008 Asset Passport | Exactly six named sections, selected-row association, desktop adjacency, narrow focus/Back behavior | Five secondary sections collapse by default; Summary remains open |
| Features 009–011 | Check links, lineage, history, evidence, version, packet, and standards truth | Existing content is placed inside disclosures without semantic rewriting |

No approved requirement is removed. The owning presentation contracts need
this new feature's requirements, design, and tasks approval before product
work.

## User Stories

### US-001: Find source state and saving where editing happens

**As an** AI power user editing a selected asset
**I want to** see unsaved state, save action, and save result at the top of its
Asset Passport
**So that** I can make the canonical file durable without searching the
global header

**Acceptance Criteria:**

- A compact global indicator still exposes source identity, freshness,
  read/write permission, and one textual synchronization state.
- When the connected registry is dirty, the selected Asset Passport begins
  with an actionable strip that says `Unsaved changes` and offers
  `Save to source`.
- Save success, cancellation, conflict, permission, and failure feedback that
  belongs to the deliberate write flow appears in the same contextual strip.
- The save action retains explicit confirmation and all existing safety and
  recovery behavior.

### US-002: Scan a compact Asset Passport

**As a** tool evaluator
**I want to** expand only the Passport evidence I need
**So that** Summary and the selected asset's key actions remain near the top

**Acceptance Criteria:**

- Summary is open when a selected Passport is entered.
- Portability, Dependencies, Evidence (including evidence bindings),
  Decisions, and History are collapsed by default.
- Every collapsed section uses a native keyboard-operable disclosure with a
  visible chevron and a textual heading.
- Expanding a section reveals the same content and actions previously present;
  no field, truth label, check link, history control, or evidence binding is
  removed.

## Functional Requirements

### FR-001: Compact always-visible source indicator — Must Have

WHEN a workspace is active
THE SYSTEM SHALL keep a compact, always-visible source indicator that
truthfully exposes safe source identity, freshness/last-read state, read and
write permission, and exactly one textual synchronization state
SO THAT Spec 003 FR-003 remains satisfied without a dominant global action
region.

Demo and snapshot modes shall retain truthful compact identity and freshness
labels without implying a writable canonical source.

### FR-002: Contextual selected-Passport write strip — Must Have

WHEN a canonical connected registry has a selected Asset Passport
THE SYSTEM SHALL place source-write status, the deliberate save action when
available, and write-result feedback at the top of that Passport
SO THAT the action and its outcome remain adjacent to asset editing.

The strip shall distinguish clean, unsaved, pending, saved, cancelled,
conflict, permission-required, and failed outcomes in text. It shall not claim
success before post-write verification.

### FR-003: Preserve deliberate write safety — Must Have

WHEN `Save to source` is invoked
THE SYSTEM SHALL preserve explicit confirmation, just-in-time permission,
fresh preflight comparison, conflict prevention, verified write, last-valid
working-copy recovery, and failure guidance
SO THAT moving the action cannot weaken Spec 003's source contract.

No autosave, merge, background permission request, or implicit upstream write
is introduced.

### FR-004: Native Passport disclosures — Must Have

WHEN a selected Asset Passport is shown
THE SYSTEM SHALL present exactly the existing six section identities with
Summary open and Portability, Dependencies, Evidence, Decisions, and History
as collapsed-by-default native disclosures
SO THAT the Passport is compact without losing information.

Evidence bindings remain inside Evidence. Asset version history, aliases, and
Evidence Packet controls remain inside History.

### FR-005: Disclosure and selection continuity — Must Have

WHEN the user expands a Passport disclosure, performs an action, switches the
selected asset, or uses the narrow-screen Back flow
THE SYSTEM SHALL preserve useful focus and unambiguous selected-row/Passport
association
SO THAT progressive disclosure does not create keyboard or context loss.

A newly selected asset begins from the approved default open/collapsed state.
Save confirmation or result updates shall not unexpectedly move focus or
collapse the active section.

### FR-006: Existing cross-feature behavior remains intact — Must Have

THE SYSTEM SHALL preserve Feature 008 desktop adjacency and narrow transition,
Feature 009 check/lineage links, Feature 010 history/version/packet controls,
Feature 011 evidence-source behavior, routes, footer, and source recovery
SO THAT this correction changes density and action placement only.

## Non-Functional Requirements

### NFR-001: Accessibility

- Disclosures use native keyboard semantics and expose open/closed state to
  assistive technology.
- Chevrons are visible but never the sole indication of section identity or
  state.
- Status and save results are textual and announced without stealing focus.
- Focus remains visible and useful across desktop and narrow flows.

### NFR-002: Responsive density

- At 320 CSS pixels and effective 200%, the compact source indicator, Passport
  write strip, disclosure summaries, and expanded content produce no
  page-level horizontal overflow.
- Wide content remains bounded within its owning section.

### NFR-003: Truth and reliability

- Presentation state cannot alter source synchronization truth or write
  authorization.
- A successful result appears only after the existing verified-write
  transition succeeds.
- Conflict, permission, and failure states remain recoverable.

### NFR-004: Scope discipline

- No runtime dependency, registry migration, navigation destination, network
  request, autosave, score, or new source state is added.
- Existing Passport content shall be reused rather than duplicated in a second
  responsive DOM.

## Out of Scope

- Changing the source controller, file format, conflict algorithm, permission
  model, or canonical-write semantics.
- Removing the global source indicator entirely.
- Changing Asset Passport section names or contents.
- Persisting disclosure-open state across browser sessions.
- Adding accordion exclusivity, custom disclosure widgets, animations,
  autosave, merge, or background writes.
- Spec 005/T16R5/T16/A-002 work or release authorization.

## Decisions

### D-001: Preserve a compact global truth indicator

**Decision:** Source identity, freshness, permission, and synchronization truth
remain globally visible in compact form; only actionable write feedback moves.

**Reason:** Spec 003 FR-003 remains valuable outside Assets, while the write
action belongs beside asset editing.

**Source:** Explicit operator direction, 2026-07-24.

**Impacts:** FR-001, FR-002, NFR-003.

### D-002: Move the complete deliberate-write feedback loop

**Decision:** Unsaved state, `Save to source`, and saved/cancelled/conflict/
permission/failed result feedback appear together at the top of the selected
Passport.

**Reason:** Separating the action from its state/result makes the workflow hard
to find and verify.

**Source:** Explicit operator direction, 2026-07-24.

**Impacts:** US-001, FR-002, FR-003.

### D-003: Use progressive disclosure without content loss

**Decision:** Summary remains open; Portability, Dependencies, Evidence,
Decisions, and History are native disclosures collapsed by default.

**Reason:** These sections are important but need not consume the first
viewport simultaneously.

**Source:** Explicit operator direction, 2026-07-24.

**Impacts:** US-002, FR-004, FR-005, NFR-001, NFR-002.

## Questions

No unresolved product question blocks review of this draft. The operator
specified placement, retained global truth, disclosure identities, default
states, accessibility, and preserved save safety.

## Intent Replay

- **Intended outcome:** Source truth stays globally visible, while saving and
  its result become obvious at the top of the selected Asset Passport and the
  Passport becomes substantially shorter by default.
- **Representative scenario:** A user selects an asset, records a review,
  sees `Unsaved changes` beside `Save to source`, confirms the save, receives
  verified success in place, and expands History only when needed.
- **Important edge:** A preflight conflict or denied permission keeps the
  registry unsaved, shows honest recovery feedback in the Passport strip, and
  never claims the source was updated.
- **Must not happen:** Collapsing sections must not remove content, duplicate
  responsive controls, hide global source truth, weaken confirmation/conflict
  checks, or create autosave.
- **Unchanged:** Source state machine, registry format, Asset Passport's six
  information domains, selected-row association, routes, footer, Feature
  009–011 behavior, and Spec 005 authority.
- **Rejected interpretations:** This is not a header removal, a custom
  accordion redesign, a persistent user-preference system, or a new write
  workflow.
