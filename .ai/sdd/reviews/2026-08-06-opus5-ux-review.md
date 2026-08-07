# UX/Visual Review: SancusSight Production (Claude Opus 5)

> Supporting control-plane evidence only. Not a spec-scoped two-axis review,
> not an approval artifact, does not change any `.status`. Feeds idea
> `003-langfuse-dev-tracing-for-byok-coach.md` and the "AAA
> quality"/gauntlet-loop effort.
>
> Reviewer: Claude Opus 5 (`general-purpose`, live production, real
> screenshots via Playwright — Chrome extension unavailable at review time)
> Date: 2026-08-06
> Scope: `https://sancussight.vercel.app`, 1440x900 / 390x844, all nav
> including the "Advanced" submenu (Evidence Sources, Governance, Release
> Proofs, Activity, Definitions — the live tab set differs from
> Overview/Registry/Queue/Definitions)

## Overall verdict: Close, but would not survive a live demo today

The underlying product is stronger than it first looks — the expanded Asset
Passport is genuinely excellent (every finding carries `Evidence:` +
`Action:` + a link to the check definition, exactly the "credible evidence
source" posture Vanta/Drata sell), and there are **zero console/page errors
anywhere**. But three visible rendering defects sit on the three
highest-traffic screens (landing, Exit Test, Activity Log), and 3 of 5
Advanced views are empty shells in the sample workspace. For a product whose
entire pitch is "trust made observable," a garbled audit-log character and a
null leaking into evidence sentences do direct damage to the claim — a
prospect would notice within 90 seconds.

## P0 — blocks a demo

1. **Landing gate: hero text collides with the live dashboard behind it.**
   Scrim is far too transparent — wordmark overlaps "CONTEXT PORTABILI…",
   sample-card text ("Client style guide (custom GPT)") reads through the
   card body, and there's a hard light/dark seam partway down. First thing
   every visitor sees. Mobile already handles this correctly — port that
   treatment up to desktop.
2. **Exit Test: overlapping text in the BREAKS result row** — asset name
   and description paint on top of each other
   (`Finance analysis brief (workflowDepesnds)on claude's private...`).
   This is the flagship screen's failure state — exactly what gets
   demoed.
3. **Activity Log: double-encoded UTF-8 (mojibake)** — em dashes render as
   `Ã¢â‚¬â€` on 2 of 3 entries. A visibly corrupted character on the audit
   log is the single most damaging cosmetic bug this product can have.
   Re-encode the fixture as UTF-8.

## P1 — undermines the credibility claim

4. **`observed Never recorded` appears in every deterministic finding's
   evidence sentence** — a null leaking into the exact line meant to prove
   the finding.
5. **A render-time timestamp masquerades as a data timestamp**: History
   shows `2026-08-06T20:40:28.740Z` (page-load moment) while the header
   says `Updated 2026-07-11` — two contradictory "updated" times, one
   fabricated at render, on an evidence registry.
6. **The STATE column is blank for all 21 assets** until you select one,
   then shows `SELECTED` — a governance column reading as "we don't know
   anything's state" for every row.
7. **"Not shared" renders as a red ✕** — 24 red marks across the coverage
   matrix that mean "never meant to be shared," not failure; the matrix's
   dominant visual message is wrong.
8. **The Asset Passport hides its own verdict.** Opening the app's worst
   asset (FAIL, 4 findings) shows no badge or finding count above the
   fold; all substantive sections are collapsed `<details>`.
9. **Attention tab's default state is six stacked negation messages**
   ("No result selected" ×3, etc.) — reads as a broken page.
10. **3 of 5 Advanced views are empty shells** in the sample workspace
    (Governance: 0/0/0 under "Five ledgers, one accountable chain";
    Release Proofs: 0/5, 33 missing; Evidence Sources: all "Not
    configured"). "Explore sample" should demonstrate the product, not
    show a prospect an empty table.
11. **Release Proofs contradicts itself**: header says "all five evidence
    categories are required," then labels all five `NOT-APPLICABLE`.

## P2 — polish gaps

Nomenclature drift across nav/panel/preview labels for the same concepts;
legend prints words while the table renders glyphs; an unexplained `L`
glyph with no legend; unlabeled numeric column on Home; the Ontology Exit
Test result never changes regardless of selection, stacked next to a
contradicting result in identical styling; mobile filters push the first
asset row ~1400px down; mobile drops the "24" from the Attention badge
(the app's main "you have work to do" signal); native `<select>` elements
and three type families on one screen; a write action ("Record review
today") inside a workspace labeled "READ-ONLY"; the sample registry is
recognizably the author's own project list (Praxen, RAMPART, FindMnemo,
owner `henry`) rather than a neutral fixture a prospect could map onto
their own org; stale/thin Activity Log (3 entries, newest 36 days old);
"Recorded facts 0" beside "Deterministic findings 113" reads as
contradictory; duplicate "Activity" label at two nesting levels.

## Part 2 — functional verification: everything works

No console errors, no page errors, nothing silently inert (apart from
intentionally-disabled Export/Clear in hosted mode). Filters, Exit Test
logic (both passing and failing cases — the failing case correctly
identifies all three real causes), target-platform exclusion, Activity Log
filters all confirmed working live.

### On the "false verified" concern from the code audit — could not reproduce

Specifically checked for this and found none: no `undefined`/`NaN`/`Invalid
Date`/`Expires: undefined` anywhere rendered. Stale evidence is correctly
amber with both relative and absolute dates shown. Unverified renders as
`?`, never `✓`. "Never reviewed" is correctly classified UNKNOWN, not pass —
the exact case most likely to default green, and it doesn't. The one
accepted-risk item shows a named approver, real future expiry, and stated
rationale — trustworthy. One item worth a second look: a PASS ownership
finding renders directly beneath a "MISSING/UNAVAILABLE: no evidence
points" banner in the same section — not false, but a confusing
juxtaposition (misfiled section, not a bad badge).

**Read this alongside the code audit, not instead of it**: the code audit
found the *mechanism* (NaN-tolerant comparisons can produce false-verified
under specific malformed input); this live check found the *current
production data* doesn't happen to trigger it. Both are true — the risk is
real and latent, not currently visible with today's fixture data.

### On the reported mobile dead-end — fixed, does not reproduce

Tested at 390x844 with touch emulation. Selecting an asset correctly swaps
to passport-only view with a working "Back to assets" button; reloading
with an asset selected drops the selection cleanly back to the catalog list.
No dead-end. No horizontal page overflow on any mobile view.

## Recommended fix order

1. Landing-gate layering (P0-1) — one CSS change, biggest first-impression return.
2. Exit Test row overlap (P0-2) — one CSS change on the demo centerpiece.
3. Activity Log encoding (P0-3) — re-save one fixture file.
4. `observed Never recorded` + render-time timestamp (P1-4, P1-5) — small,
   and most directly contradict "trust made observable."
5. STATE column + red-✕ semantics (P1-6, P1-7) — the two most misleading
   visual signals in the registry.
6. Passport verdict header + Attention empty state (P1-8, P1-9).
7. Populate or hide the three empty Advanced views (P1-10).

Items 1-4 are roughly a day's work and move this from "impressive
prototype" to "credible product."

## Next step

Not authorized for implementation by this document. Findings here plus the
2026-08-06 bug audit together give idea 003 and Spec 016 implementers a
concrete pre-flight list; the false-verified *mechanism* (bug audit) should
still be fixed even though it wasn't visible in this live check.
