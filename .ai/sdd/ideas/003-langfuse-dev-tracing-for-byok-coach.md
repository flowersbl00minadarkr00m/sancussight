# Idea: Bounded Dev-Time Langfuse Tracing for the Approved BYOK Remediation Coach

> Status: captured
> Created: 2026-08-06
> Authority: future queue context only; not approved requirements, design, tasks, or implementation scope

## Raw Idea

Henry asked to enhance SancusSight using Langfuse (self-hosted and already
running at `http://localhost:3000`, see `C:\Users\henry\langfuse`) and BYOK
AI access. Two things are already true here that this idea must not
contradict without Henry explicitly re-deciding them:

1. **BYOK already has an approved path.** Spec 016,
   `byok-remediation-coach`, is `tasks:approved`. It defines a local
   companion, OS credential storage, explicit connection tests, and a
   reviewed bounded payload before every planning request. This idea does
   not propose new BYOK design; it points implementation back to Spec 016.
2. **SancusSight already decided against Langfuse-style observability as a
   product feature.** The product-enhancement orchestrator handoff
   (`.ai/sdd/handoff/sancussight-product-enhancement-orchestrator-handoff.md`)
   explicitly lists borrowing Langfuse's MIT-licensed UI patterns (list/tree
   plus inspector) as inspiration, and separately lists "full Langfuse-style
   prompt or response observability" under **Avoid**. SancusSight's identity
   is a governance/portability registry, not an LLM observability platform.

So the only thing genuinely new here is narrow: use the already-running
Langfuse instance as a **developer-side debugging aid** for the Remediation
Coach's own model calls during implementation of Spec 016 — not as a shipped
SancusSight feature, and not as a reason to build observability UI into the
product.

## Problem Space

- Spec 016 already covers BYOK connection, credential storage, and bounded
  payload review; re-specifying BYOK here would duplicate approved work.
- Implementers of Spec 016 will still want to debug the Coach's prompts,
  grounding data, and provider responses during development. Right now that
  means reading raw logs or re-running requests by hand.
- The prior "avoid Langfuse-style observability" decision was about product
  scope (what ships to users), not about whether developers can use a
  tracing tool locally while building the feature. This idea should keep
  that distinction explicit so it is not accidentally read as reversing the
  decision.

## Target Users

- Whoever implements Spec 016 (visible top-level session, per SDD rules),
  needing to debug Coach prompt/response quality during build.
- Not end users of the shipped SancusSight product — they see none of this.

## Current Alternatives

- Manual log reading during Spec 016 implementation.
- Re-running Coach requests by hand to inspect behavior.

## Desired Outcome

- During Spec 016 implementation, the Coach's own model calls (prompt,
  bounded payload contents already approved for transmission, model,
  latency, outcome) can optionally be traced to the local Langfuse instance
  as a development aid.
- Nothing about this changes what ships: no Langfuse UI, dashboard, trace
  viewer, or "observability" surface is added to the shipped SancusSight
  product. The Avoid list stands.
- If Henry wants to formally reverse the "avoid Langfuse-style observability"
  decision and ship tracing as a user-facing feature, that is a distinct,
  explicit decision this idea does not make for him.

## Possible Directions

### Direction A: Dev-only tracing behind a local flag, no product surface

- **Description:** Add optional Langfuse tracing to the Coach's model-call
  code path, gated by a local development flag/env var, with no UI exposed
  in the shipped product.
- **Pros:** Genuinely useful during Spec 016 build; zero conflict with the
  standing Avoid decision; smallest possible surface.
- **Cons:** Not directly visible to end users (by design).
- **Risks:** Low. Must ensure the payload traced is the same bounded payload
  already reviewed under Spec 016, not a superset.

### Direction B: Ship Langfuse-backed tracing as a user-facing audit feature

- **Description:** Expose Coach call history/tracing to SancusSight users as
  a feature.
- **Pros:** Could support governance/evidence goals (SancusSight's own
  domain) if framed as "evidence of what the Coach was told and why," not as
  general LLM observability.
- **Cons:** Directly conflicts with the standing Avoid decision unless Henry
  explicitly reverses it; risks scope/identity drift toward an observability
  platform.
- **Risks:** Requires an explicit decision from Henry before any design
  work; do not start here without that.

## Recommendation

- [x] Keep exploring
- [ ] Create PLAN now
- [ ] Create REQUIREMENTS directly

**Recommended direction:** Direction A only, and only as a dev aid inside
Spec 016's existing implementation, not a new gated feature. Flag Direction B
to Henry as a standing-decision reversal question rather than deciding it
here.

## Constraints

- Does not duplicate or reopen Spec 016's BYOK design; implementation still
  follows Spec 016 as approved.
- Traced payload must be identical to the bounded payload Spec 016 already
  requires review of before transmission — never a superset, and never the
  raw local evidence store.
- No Langfuse UI, trace viewer, or "observability" feature ships in the
  product; this stays a local development aid.
- Provider keys never appear in trace payloads, logs, exports, or durable
  docs; OS credential storage per Spec 016 is unaffected.
- Every future feature still requires its own SDD requirements, design, and
  tasks approvals before implementation; this idea does not grant any of
  those approvals.

## Signals of Value

- Spec 016 implementers can debug a bad Coach recommendation from one trace
  instead of manual log reading, without any change to what ships.
- The standing Avoid-observability decision remains intact and undisturbed
  unless Henry explicitly revisits it.

## Fog Map

### Destination

Spec 016 implementers have an optional, dev-only Langfuse tracing aid for
the Coach's model calls; the shipped product's scope and the Avoid list are
unchanged; any move toward user-facing tracing is a distinct decision Henry
makes explicitly, not an accretion from this idea.

### Decisions So Far

- BYOK design is not re-opened here; Spec 016 remains authoritative.
- Dev-only tracing does not reverse the standing "avoid Langfuse-style
  observability" product decision.

### Frontier

| Item | Type | Blocked By | Done When |
|---|---|---|---|
| Confirm Spec 016 implementation start | task | Spec 016 remains `tasks:approved`, unblocked when picked up | Implementation begins |
| Add dev-flag-gated Langfuse tracing to Coach call path | task | Spec 016 implementation underway | A trace reproduces the exact bounded payload sent, nothing more |
| Explicit decision on Direction B (user-facing tracing) | decision | Henry's call | Henry affirms or declines reversing the Avoid decision |

### Not Yet Specified

- Whether the dev tracing flag lives in an env var, local config file, or
  build flag.
- Exact trace schema, though it must not exceed Spec 016's approved bounded
  payload.

### Out of Scope

- Any user-facing Langfuse UI, dashboard, or trace viewer in shipped
  SancusSight.
- Re-designing BYOK credential handling (Spec 016 already covers this).
- Tracing anything beyond the Coach's own model calls (e.g., no general
  SancusSight event/evidence pipeline tracing).

## Execution note: the gauntlet loop (for when this is approved)

Execution guidance only, and only for Direction A's narrow dev-tracing slice,
to run after it has explicit approval and alongside Spec 016 implementation
— not as a substitute for Spec 016's own approved tasks/verification.

Fan out one sub-agent for the dev-tracing hook itself. It `/loop`s until a
separate, harsher critic sub-agent confirms, by actually running a Coach
request end to end:

- The Langfuse trace produced exactly matches the bounded payload Spec 016
  already requires review of — no more, no less.
- Disabling the dev flag produces zero Langfuse calls and zero behavior
  change to the shipped Coach flow.
- No Langfuse-derived UI, link, or reference is reachable from the shipped
  SancusSight product surface.

The critic should explicitly check for scope creep toward Direction B (any
stray UI surface, any customer-visible trace reference) and fail the loop if
found, since that would silently reverse a standing product decision without
Henry's explicit approval.

Report the critic's verdict, not just "complete," back to the owning
control-plane record.

## Execution & orchestration preference (recorded 2026-08-06)

Once this slice reaches `tasks:approved` (and Spec 016 is unblocked for the
Coach itself), Henry's intended execution mechanism is a new Herdr session
orchestrating Codex and Pi workers, preferring Sol, Luna, or DeepSeek V4
Fast 0731 as primary models per task. Recorded as forward intent only; no
implementation dispatch is authorized by this idea document itself.
