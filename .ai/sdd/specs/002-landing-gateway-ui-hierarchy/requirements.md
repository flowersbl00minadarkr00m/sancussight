# Feature: Landing Gateway and UI Hierarchy

> Status: Approved
> Source: User request on 2026-07-11 following Sol Extra High and Claude Fable 5 product-design reviews

## Overview

SancusSight should open through a professional entry page that establishes the product promise and asks the user to choose between an explicitly labeled sample experience and their actual local registry. The actual-data path must use the visible command `Connect now` and preserve the current local-only privacy boundary.

The workspace should also reduce avoidable alarm and visual noise: demo data must never look observed, repeated findings should be grouped by asset, empty counts should disappear, candidate-tool details should reveal information progressively, and utility actions should no longer compete with the primary workflow.

## Business Context

SancusSight's strongest differentiators are deterministic evidence, local ownership, and exit-test framing. The current workspace demonstrates those capabilities, but it opens directly into synthetic findings without labeling them as demo data. This weakens the trust promise and presents a dense operational surface before a new user understands the product.

The landing gateway should shorten the path to a truthful first value:

1. Understand what SancusSight does.
2. Choose sample or actual local data.
3. Enter a workspace whose data mode and provenance remain visible.
4. See prioritized assets and evidence without losing access to underlying findings.

## User Stories

### US-001: Choose an honest first experience

**As a** first-time visitor  
**I want to** choose between a sample and my actual data before entering the workspace  
**So that** I understand whether the findings are illustrative or mine

**Acceptance Criteria:**
- [ ] The default entry page presents `SancusSight` as the primary first-viewport signal.
- [ ] The page states the literal outcome in plain language: see what the AI environment depends on, what is portable, and what needs attention.
- [ ] Two distinct commands are visible without scrolling: `Explore sample` and `Connect now`.
- [ ] The sample path is explicitly described as synthetic demonstration data.
- [ ] The actual-data path states that data remains in the browser and does not require an account.

### US-002: Explore sample data without mistaking it for evidence

**As a** prospective user  
**I want to** explore a realistic sample registry  
**So that** I can understand SancusSight before connecting my information

**Acceptance Criteria:**
- [ ] Selecting `Explore sample` opens the working product, not a marketing walkthrough.
- [ ] A persistent `Demo data` status is visible throughout the workspace.
- [ ] Demo findings, exports, and share cards retain an explicit demo-data marker.
- [ ] The user can return to the entry page or choose `Connect now` without resetting the browser manually.

### US-003: Connect actual local data

**As an** AI-power-user or governance-minded practitioner  
**I want to** connect my actual registry locally  
**So that** SancusSight evaluates evidence I control without sending it elsewhere

**Acceptance Criteria:**
- [ ] Selecting `Connect now` starts a local registry connection flow.
- [ ] The flow accepts the existing supported versioned or compatible unversioned registry format.
- [ ] Input is validated before current local state is replaced.
- [ ] Cancellation or invalid input leaves existing data unchanged.
- [ ] Errors appear inline with a recovery action rather than only through a browser alert.
- [ ] A successful connection opens the workspace with a persistent `Local registry` status and freshness information.

### US-004: Understand priorities without repeated alarm

**As a** registry owner  
**I want to** see the most important affected assets before every individual signal  
**So that** I can decide what to inspect or remediate first

**Acceptance Criteria:**
- [ ] Overview findings are grouped by asset.
- [ ] Each grouped item shows the asset's worst status and number of underlying findings.
- [ ] The Overview shows a bounded set of highest-priority assets and links to the complete Queue.
- [ ] Expanding or selecting an asset preserves access to every underlying signal and its evidence.
- [ ] Dimension summaries omit zero-value status counts.
- [ ] No composite trust, portability, or security score is introduced.

### US-005: Scan candidate assessments progressively

**As a** tool evaluator  
**I want to** see the decision-critical candidate facts first and expand supporting detail when needed  
**So that** I can compare tools without reading an undifferentiated metadata wall

**Acceptance Criteria:**
- [ ] Candidate detail initially emphasizes license, data egress, integration relationship, and disposition.
- [ ] Assessment depth, integration relationship, and disposition are labeled rather than shown as ambiguous chips.
- [ ] Recorded facts, human decisions, missing evidence, and readiness checks are visually distinguishable.
- [ ] Unknown or network-required egress remains visibly cautionary even when a tool is accepted as an evidence source.
- [ ] Runtime, trust-boundary, attribution, trade-off, and bundle-readiness details remain available through progressive disclosure.

### US-006: Use a calmer, safer workspace

**As a** returning user  
**I want to** distinguish primary work from utility and destructive actions  
**So that** routine use is faster and accidental data loss is less likely

**Acceptance Criteria:**
- [ ] The primary workspace destinations have greater visual priority than reference or history destinations.
- [ ] The primary data action reflects the current mode: connect data before setup, export after actual data is loaded.
- [ ] Reset and import-overwrite actions require confirmation.
- [ ] Definitions and Activity remain available without competing equally with the core Overview, Registry, Exit Test, and Queue workflow.
- [ ] Workflow coverage terms `PRI`, `FBK`, and not-applicable are explained wherever they appear.

## Functional Requirements

### FR-001: Entry gateway - Must Have

WHEN a visitor opens the product entry page  
THE SYSTEM SHALL present the SancusSight promise and the commands `Explore sample` and `Connect now` within the first viewport  
SO THAT the visitor can choose an honest path to value.

### FR-002: Sample-mode provenance - Must Have

WHEN a user enters through `Explore sample`  
THE SYSTEM SHALL identify the workspace, exports, and share artifacts as demo data  
SO THAT synthetic findings are not mistaken for observed evidence.

### FR-003: Actual-data connection - Must Have

WHEN a user selects `Connect now`  
THE SYSTEM SHALL allow the user to provide a compatible local registry and validate it before activation  
SO THAT actual governance data can be evaluated without an account or external transfer.

### FR-004: Data-mode visibility - Must Have

WHEN the workspace is open  
THE SYSTEM SHALL show whether the active source is demo data or a local registry and show its freshness  
SO THAT the provenance of every visible finding remains clear.

### FR-005: Safe replacement and reset - Must Have

WHEN an action would replace or reset active registry data  
THE SYSTEM SHALL require confirmation and preserve current data if the action is cancelled or validation fails  
SO THAT users do not lose local state accidentally.

### FR-006: Grouped overview findings - Must Have

WHEN multiple non-passing signals belong to one asset  
THE SYSTEM SHALL present one overview item with the worst status and finding count while retaining drill-down access  
SO THAT prioritization is asset-focused rather than repetitious.

### FR-007: Bounded overview - Must Have

WHEN the Overview contains more than six affected assets  
THE SYSTEM SHALL show only the six highest-priority assets and provide access to the complete Queue  
SO THAT the first screen remains scannable.

### FR-008: Concise dimension summaries - Should Have

WHEN a dimension has no findings in a status category  
THE SYSTEM SHOULD omit that zero count and preserve status meaning through text and restrained visual proportion  
SO THAT meaningful conditions receive visual emphasis.

### FR-009: Candidate progressive disclosure - Must Have

WHEN a candidate-tool asset is selected  
THE SYSTEM SHALL present decision-critical facts first and make supporting metadata available in clearly labeled expandable groups  
SO THAT comparison remains efficient without removing evidence.

### FR-010: Core navigation hierarchy - Should Have

WHEN the workspace navigation is shown  
THE SYSTEM SHOULD visually prioritize Overview, Registry, Exit Test, and Queue while retaining access to Definitions and Activity  
SO THAT reference surfaces do not compete with the operating loop.

### FR-011: Inline connection feedback - Must Have

WHEN local data connection succeeds, fails, or is cancelled  
THE SYSTEM SHALL show contextual status and recovery information without relying solely on browser alerts  
SO THAT users understand the current state and safe next action.

### FR-012: Coverage legend completeness - Must Have

WHEN workflow coverage roles appear in the Registry  
THE SYSTEM SHALL explain primary, fallback, and not-applicable markers alongside the existing verification legend  
SO THAT every visible status encoding is understandable.

## Non-Functional Requirements

### NFR-001: Privacy and trust
- `Connect now` must remain credential-free and local-only for this feature.
- No registry content may be uploaded, synchronized, or fetched by an external runtime.
- Mode labels and share artifacts must not overstate evidence provenance.

### NFR-002: Accessibility
- All commands, disclosures, confirmations, and navigation must be keyboard-operable.
- Color must remain paired with text or glyph meaning.
- Readable operational text should not be smaller than approximately 0.72rem at default browser settings.
- Focus states must remain visible.

### NFR-003: Responsive behavior
- Entry-page commands must remain visible without overlap at 390px and common desktop widths.
- Workspace navigation must not create incoherent multi-row button clutter on narrow screens.
- Wide registry matrices may scroll within their own boundary; ordinary detail and queue content should reflow without page-level horizontal scrolling.

### NFR-004: Visual credibility
- Preserve the restrained ledger/audit-document character, low-radius surfaces, and thermal status palette.
- Reduce cream dominance through clearer neutral working surfaces and stronger text contrast.
- Professional polish must come from hierarchy, typography, spacing, and real product imagery or state, not ornamental charts, gradients, abstract illustrations, or security theater.
- Any entry-page visual must show the actual SancusSight product or a live product state and must be available without an external runtime request.

### NFR-005: Performance and reliability
- The entry gateway and workspace must remain usable on a static host with no backend.
- Switching between sample and connected local data must not duplicate or silently merge registries.
- Existing deterministic checks and ontology-governance behavior must remain unchanged unless separately approved.

## Out of Scope

- Cloud accounts, authentication, synchronization, or multi-user workspaces.
- Live connectors, watched files, local companion processes, or automatic product discovery.
- Automatic GitHub metadata retrieval or execution of candidate tools.
- A composite trust, portability, risk, or security score.
- Donut charts, decorative dashboards, gradients, abstract security illustrations, or a new ontology/candidate-tools top-level tab.
- Changes to the approved ontology governance model, signal semantics, or tool-bundling boundary.
- A long-form marketing site separate from the actual entry and workspace experience.

## Decisions

### D-001: Provide a real entry gateway

**Decision:** SancusSight will use an entry page before the workspace with explicit sample and actual-data paths.  
**Reason:** A trust product must establish provenance before showing findings.  
**Source:** Direct user instruction on 2026-07-11  
**Impacts:** US-001 through US-003, FR-001 through FR-004

### D-002: `Connect now` means local registry connection

**Decision:** In this feature, `Connect now` connects a compatible local registry without an account, backend, or external transfer.  
**Reason:** This satisfies the request for actual data while preserving SancusSight's approved local-first boundary.  
**Source:** User wording plus existing product steering and D-004 from spec 001  
**Impacts:** US-003, FR-003 through FR-005, NFR-001, Out of Scope

### D-003: Demo provenance persists

**Decision:** Demo status remains visible in the workspace and in artifacts created from sample data.  
**Reason:** Synthetic findings must not be presented as user evidence.  
**Source:** Sol and Claude Fable 5 product-design review consensus  
**Impacts:** US-002, FR-002, FR-004, NFR-001

### D-004: Simplify without scoring

**Decision:** Overview simplification will group findings and suppress zero-value noise without introducing a composite score.  
**Reason:** Scores would conceal the evidence that differentiates SancusSight.  
**Source:** Product-design review and existing TD-003 deterministic-check boundary  
**Impacts:** US-004, FR-006 through FR-008, Out of Scope

### D-005: Preserve the ledger identity

**Decision:** Visual refinement will retain the audit-document character and avoid decorative chartification.  
**Reason:** The existing restrained identity is differentiated and appropriate for governance work.  
**Source:** Sol and Claude Fable 5 product-design review consensus  
**Impacts:** NFR-002 through NFR-004, Out of Scope

## Questions

No critical open questions. The draft assumes `Connect now` uses the current local registry format; adding live connectors requires a separate approved feature.

## Glossary

- **Entry gateway:** The first product screen where the user chooses sample or actual local data.
- **Demo data:** Seeded synthetic registry content used only to demonstrate product behavior.
- **Local registry:** User-provided governance data stored and evaluated in the browser.
- **Data mode:** The visible provenance state: demo data or local registry.
- **Grouped finding:** One asset-level overview item summarizing multiple underlying deterministic signals.
