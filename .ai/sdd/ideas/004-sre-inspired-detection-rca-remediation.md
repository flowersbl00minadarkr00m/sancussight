# Idea: SRE-Agent-Inspired Detection, RCA, and Cross-Product Remediation Tickets

> Status: captured
> Created: 2026-08-06
> Authority: future queue context only; not approved requirements, design, tasks, or implementation scope

## Raw Idea

Henry restated SancusSight's mission as: a governance tool that maintains a
registry of AI assets, helps build that registry by scanning the local
environment, scans registered assets for issues, and surfaces them for the
user to fix. He asked to borrow from the SRE-agent category — specifically
naming Cleric and pointing at `github.com/last9/awesome-sre-agents` — and
floated SancusSight automatically creating FindMnemo tickets when it finds
issues, plus AI-assisted root-cause analysis and remediation suggestions
through the user's own BYOK model connection.

## Source research

`last9/awesome-sre-agents` lists ~15 tools. The recurring shape across most
of them is **alert → investigation → explanation**, with a minority
(Aient AI, NudgeBee) extending to **auto-generated fixes**, typically gated
behind human/approval-gated runbooks (KnoxOps, NudgeBee explicitly gate
execution on approval). Very few of the listed tools auto-create tickets —
most stop at analysis/explanation and leave tracking to whatever the team
already uses. Cleric specifically is described as monitoring infrastructure
and answering questions about system state — closer to an investigative
assistant than an auto-remediator.

This maps cleanly onto SancusSight's existing posture: Spec 016's BYOK
Remediation Coach is already explicitly advisory ("does not execute
commands, edit files, change controls, close findings, or mark remediation
complete... deterministic SancusSight findings and explicit human decisions
remain authoritative"). The SRE-agent comparison mostly *validates* the
approach already chosen for Spec 016 rather than requiring a new one — the
new pieces are (a) extending BYOK-assisted analysis to include root-cause
explanation, not just remediation steps, and (b) the cross-product
auto-ticketing idea, which is genuinely new.

## Problem Space

- SancusSight already surfaces findings (checks, coverage matrix,
  Attention/Queue), but a surfaced finding that needs tracked follow-up has
  nowhere durable to live — it's re-discovered on every visit rather than
  tracked to resolution.
- FindMnemo already is the product whose job is durable, trackable units of
  work with decision history (per today's restated FindMnemo vision). Building
  a second ticket/queue concept inside SancusSight would directly compete
  with that and fragment where "what needs doing" lives.
- Spec 016's Coach explains *what to do* about a finding a user already
  selected; it doesn't yet explain *why* the finding is true (root cause)
  before recommending action — RCA and remediation are related but
  distinct outputs.
- FindMnemo's idea 006 already has a `WorkItemSource` abstraction (GitHub
  Issues was the first named external source) that a SancusSight-originated
  finding fits into structurally, but idea 006 is explicitly gated behind
  FindMnemo's Spec 016 completion and hasn't been designed yet.

## Target Users

- SancusSight users who want a finding to become tracked follow-up work
  instead of a page they have to remember to revisit.
- FindMnemo users who want governance findings to show up as tickets
  alongside their other agent-routed work, with the same decision-log
  shape as any other ticket.

## Current Alternatives

- Manually re-reading SancusSight's Attention/Queue view on every visit.
- Manually creating a FindMnemo ticket by hand after noticing a finding.
- Spec 016's Coach for remediation steps once a user has already decided to
  act on a specific finding.

## Desired Outcome

- A SancusSight finding can optionally produce a FindMnemo ticket, carrying
  enough context (what was found, evidence reference, suggested next step)
  for FindMnemo's ticket view to explain why work is needed — without
  SancusSight becoming a second ticket authority.
- A user can ask for root-cause analysis on a finding, backed by their own
  BYOK provider connection, following the same bounded-payload review
  pattern already required for Spec 016's remediation requests.
- Remediation suggestions remain advisory; nothing auto-applies without
  explicit user review, consistent with the majority pattern in the
  SRE-agent category and with SancusSight's existing Spec 016 posture.

## Possible Directions

### Direction A: RCA extension to the existing Coach, ticket creation as a separate later feature

- **Description:** First extend Spec 016's Coach (once implemented) to also
  produce a root-cause explanation alongside its remediation plan. Treat
  FindMnemo auto-ticketing as a distinct, later feature that depends on
  FindMnemo's own `WorkItemSource` design work (idea 006) landing first.
- **Pros:** Smallest next step; doesn't require designing a cross-product
  contract before either side is ready; RCA is useful on its own even
  without ticketing.
- **Cons:** Delays the "auto-creates tickets" capability Henry specifically
  asked about.
- **Risks:** Low.

### Direction B: Design the cross-product ticket contract now, implement later

- **Description:** Spec out a `WorkItemSource`-shaped contract for a
  SancusSight-originated finding now, even though FindMnemo's receiving
  side (idea 006) isn't built yet, so both products can build toward a
  compatible shape.
- **Pros:** Avoids two independent designs that have to be reconciled
  later.
- **Cons:** Speculative — FindMnemo's `WorkItemSource` abstraction doesn't
  exist yet and is explicitly gated behind its own Spec 016 completion;
  designing against an unbuilt abstraction risks guessing wrong.
- **Risks:** Medium — rework likely once FindMnemo's actual `WorkItemSource`
  shape is decided.

### Direction C: Everything now as one cross-product feature

- **Description:** Design and build RCA, remediation, and auto-ticketing
  together as one SancusSight+FindMnemo feature.
- **Pros:** Coherent single story.
- **Cons:** Couples two products' independent SDD gates into one
  dependency chain; violates the existing project-registry rule that "each
  project keeps its own registry route, steering, SDD gates, and approval."
- **Risks:** High — blocks on both products' unrelated frontier work
  simultaneously.

## Recommendation

- [x] Keep exploring
- [ ] Create PLAN now
- [ ] Create REQUIREMENTS directly

**Recommended direction:** Direction A. RCA-on-the-Coach is a small,
self-contained extension worth speccing once Spec 016 itself is
implemented. Auto-ticketing should wait for FindMnemo's idea 006
`WorkItemSource` design so SancusSight isn't the one guessing at the
contract shape — revisit as Direction B only once idea 006 has an actual
design to build against.

## Constraints

- SancusSight remains advisory only; no finding, RCA, or remediation
  suggestion may auto-apply, auto-close, or auto-execute anything.
- Any BYOK model call for RCA follows the same bounded-payload review
  pattern already required by Spec 016 — no raw evidence store access, no
  unrestricted workspace content.
- SancusSight does not build a second ticket/queue authority; if
  auto-ticketing ships, FindMnemo remains the durable tracking system and
  SancusSight remains the source that files into it, mirroring how GitHub
  Issues is treated as an adapter, not an authority, in FindMnemo's own
  idea 006.
- Every future feature still requires its own SDD requirements, design, and
  tasks approvals; this idea grants none of those.

## Signals of Value

- A user can ask "why is this failing" on a finding and get an explanation
  grounded in the actual evidence, not a generic guess.
- A finding that needs follow-up shows up in the one place Henry already
  checks for outstanding work (FindMnemo), instead of requiring a second
  habit of checking SancusSight's Queue.
- Neither product ends up owning two competing definitions of "a thing that
  needs doing."

## Fog Map

### Destination

SancusSight can explain root cause on a finding using the user's own BYOK
connection, and — once FindMnemo's own work-item-source design exists — can
optionally file a finding as a FindMnemo ticket rather than requiring the
user to remember and re-transcribe it.

### Decisions So Far

- RCA and remediation stay advisory-only, matching the SRE-agent category's
  dominant pattern and Spec 016's existing posture.
- SancusSight will not build its own competing ticket/queue system;
  FindMnemo remains the tracking authority.
- Auto-ticketing depends on FindMnemo's `WorkItemSource` design (idea 006),
  not the other way around.

### Frontier

| Item | Type | Blocked By | Done When |
|---|---|---|---|
| Implement Spec 016 (BYOK Remediation Coach) | task | none — already `tasks:approved` | `.status` reaches `implementation:done` |
| Spec RCA extension to the Coach | task | Spec 016 implementation | Requirements drafted and reviewed |
| FindMnemo designs its `WorkItemSource` abstraction | task | FindMnemo's own Spec 016 completion (per idea 006) | FindMnemo idea 006 reaches design stage |
| Spec cross-product auto-ticketing contract | task | both items above | Requirements drafted referencing a real `WorkItemSource` shape, not a guess |

### Not Yet Specified

- Exact RCA output shape (structured claims with evidence pointers, or
  prose explanation, or both).
- What subset of a finding's evidence is safe to include in an RCA/BYOK
  payload versus what stays SancusSight-local.
- Whether a filed ticket is one-way (SancusSight → FindMnemo, no
  resolution sync back) or needs a status echo.

### Out of Scope

- Any auto-execution of remediation.
- SancusSight building its own ticket/queue system.
- Designing FindMnemo's `WorkItemSource` contract from the SancusSight side
  before FindMnemo has designed it.
