# Feature: Registry Data-Hygiene & Advanced-View Fixture Pass

> Status: Draft
> Source: `.ai/sdd/reviews/2026-08-06-opus5-ux-review.md` (P1 findings 4-11),
> following the P0 fixes already applied directly to production source on
> 2026-08-06 (Activity Log mojibake, landing-gate scrim opacity, Exit Test
> row overlap).

## Overview

A batched fix for the data-hygiene and empty-state defects found in the
2026-08-06 live production UX review — the class of issue most damaging to
this specific product, since SancusSight's entire value proposition is
being a credible evidence source. Batched into one spec because all items
share the same review source and the same underlying theme: a rendered
value or empty view that undermines the "trust made observable" claim.

## Business Context

Two of these findings (FR-001, FR-002) sit directly on top of the mechanism
already flagged in `.ai/sdd/reviews/2026-08-06-opus5-bug-audit.md` findings
1-2 (NaN-tolerant date comparisons). The live UX review did not find those
specific false-positives in current production data, but the data-hygiene
fixes here (never render a null/NaN-derived value as prose) are the
user-facing half of fixing that same class of defect — the bug audit fixes
the comparison logic, this spec fixes what gets displayed either way.

## Functional Requirements

### FR-001: Never render a missing observation as prose inside an evidence sentence — Must Have

WHEN an asset finding's evidence line has no recorded observation
THE SYSTEM SHALL render a labeled field (e.g. "Observed: —") instead of inline prose
SO THAT the finding never reads as `Evidence: Registry format field = proprietary / observed Never recorded / owner: henry`, which reads as a data leak on the exact line meant to prove the finding (bug-audit finding 1's data-hygiene counterpart).

### FR-002: "Updated" timestamps must come from the registry's actual source, never render time — Must Have

WHEN a History entry or header shows an "updated" timestamp
THE SYSTEM SHALL bind it to the registry's recorded source timestamp, never `Date.now()`/page-load time
SO THAT History and the entry-gate header don't show two contradictory dates for the same fact.
Format consistently everywhere (e.g. `2026-07-11 · 09:14 UTC`), not as a raw ISO string.

### FR-003: The STATE column reflects actual lifecycle data or doesn't exist — Must Have

WHEN the Assets coverage matrix renders a STATE column
THE SYSTEM SHALL either populate it from real lifecycle data or remove the column and rely on the existing row-highlight for selection
SO THAT a column headed STATE is never blank for every row in the sample registry (currently reads as "we have no idea what state anything is in").

### FR-004: "Not shared" is visually neutral, not a failure color — Must Have

WHEN the coverage matrix renders a "not shared" cell (per the existing legend)
THE SYSTEM SHALL render it in a neutral grey, reserving red exclusively for actual fail conditions
SO THAT a tool that was never meant to be shared (6 candidate-tools × 4 platforms in the current sample) doesn't paint the matrix's dominant visual message as "mostly failing."

### FR-005: Asset Passport shows its verdict above the fold — Must Have

WHEN a user opens an asset's Passport
THE SYSTEM SHALL show a status badge and finding count in the header, with the Portability section expanded by default
SO THAT opening the app's worst asset (FAIL, 4 findings) doesn't require a click to discover that. "Not recorded" fields move into a collapsed "Unrecorded (N)" group so the recorded facts read cleanly.

### FR-006: Attention tab has one empty state, not six stacked negations — Should Have

WHEN the Attention view has no check/result selected
THE SYSTEM SHALL show one centered empty state, or auto-select the first FAIL result
SO THAT the default view isn't six stacked "No result selected" boxes reading as a broken page.

### FR-007: Advanced views show populated sample data or are hidden in sample mode — Must Have

WHEN "Explore sample" is active
THE SYSTEM SHALL show populated fixture data for Governance, Release Proofs, and Evidence Sources, or hide those items from the Advanced menu while in sample mode
SO THAT a prospect exploring the sample workspace never lands on an empty table under a headline like "Five ledgers, one accountable chain."

### FR-008: Release Proofs card doesn't assert and contradict itself — Should Have

WHEN a Release Proofs card is required but absent
THE SYSTEM SHALL label it `MISSING` (matching the Runtime Coverage block's existing vocabulary)
SO THAT the header "All five evidence categories are required" is never followed immediately by all five labeled `NOT-APPLICABLE`.

## Non-Functional Requirements

### NFR-001: Usability
- No functional behavior changes for FR-001 through FR-006 and FR-008 — presentation/data-binding only. FR-007 adds fixture content and is the one item in this spec with real content-authoring work.

### NFR-002: Trust / credibility
- Every rendered status, date, or evidence claim must be traceable to a real recorded value or explicitly labeled as absent — never silently defaulted or fabricated at render time. This is the standing product principle these findings violated; treat it as the acceptance bar for review, not just for this spec.

## Out of Scope

- P0 items — already fixed directly in source on 2026-08-06.
- The underlying NaN-tolerant comparison bugs in `src/lib/registry.ts` (`daysBetween`, `acceptRisk`) — tracked in the bug audit, not duplicated here; fixing the comparison logic is a separate, higher-risk change to core evaluation functions and should get its own review even though it's related.
- P2/P3 findings from the same review (nomenclature drift, legend/glyph mismatch, mobile filter layout, sample data being recognizably the author's own project list) — smaller and independent; may become a follow-up spec.

## Decisions

### D-001: Batching rationale

**Decision:** Bundle all P1 findings from the single 2026-08-06 UX review into one spec.
**Reason:** Same review source, same "trust made observable" theme, mostly small presentation fixes.
**Source:** Direct user instruction, 2026-08-06.
**Impacts:** FR-001 through FR-008.

### D-002: Comparison-logic bug is out of scope here

**Decision:** The NaN-tolerant date comparisons found in the bug audit are not fixed by this spec.
**Reason:** That's a change to core deterministic evaluation logic (higher risk, needs its own focused review), whereas this spec is presentation/data-binding fixes. Conflating them risks under-reviewing the riskier change.
**Source:** Reviewer judgment, flagged for explicit user confirmation.
**Impacts:** Out of Scope section.

## Questions

### Q-001: Should the comparison-logic fix (registry.ts NaN handling) get its own spec now, or wait?

**Status:** open
**Why it matters:** It's the actual mechanism behind the product's most credibility-damaging risk class; this spec only fixes what's displayed, not the logic that could still misclassify given different input data.
**Recommended:** Open a follow-up spec (018) immediately after this one, rather than letting it sit as an audit finding indefinitely.

| Option | Answer | Choose this if... | Impact |
|--------|--------|-------------------|--------|
| A | Spec this now, in parallel | You want the fix tracked and scheduled immediately | Adds a second concurrent spec |
| B | Wait until this spec ships | You want to sequence fixes one at a time | Delays the higher-risk fix |
| Custom | — | — | — |
