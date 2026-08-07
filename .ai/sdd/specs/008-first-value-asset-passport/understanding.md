# Feature 008 Understanding Record

> Artifact profile: `local-markdown`
> Status: Ready for approved-task execution
> Updated: 2026-07-23

## Audience and outcome

This record supports the visible SDD orchestrator and fresh top-level Codex
workers implementing Feature 008. A reviewer should be able to verify one
outcome: users reach a truthful registry through a source-distinct path, then
browse a persistent desktop catalog beside one canonical Asset Passport, with
an intentional accessible narrow-screen transition.

## Burden assessment

- Consequential UI and navigation change: yes
- Multi-surface flow: yes
- Privacy/evidence claim sensitivity: medium
- Reversibility: high; browser-only UI and optional type compatibility field
- Human choice remaining: none inside the approved design
- External dependency: production deployment and hosted verification, not
  authorized by Feature 008 implementation approval

The design itself is the primary understanding artifact. A separate HTML
design explainer was offered by the SDD workflow and treated as declined under
the operator's explicit no-stop direction. No conceptual UI images were
generated because the prerequisite HTML path was declined.

## Stable mental model

```text
source choice
  -> sample | existing registry | local compiler guidance
  -> active registry with preserved source meaning
  -> Assets catalog
  -> selected Asset Passport
       desktop: adjacent
       narrow: explicit detail state, then focus-restoring return
```

Attention, Home, and Exit Drills all enter the same selected Asset Passport.
Advanced evidence/governance surfaces remain reachable but do not become
parallel asset-detail experiences.

## Truth boundaries

- Sample data remains synthetic.
- File/snapshot data remains user-selected and does not imply live freshness.
- Compiler guidance never runs discovery from the hosted page.
- Derived portability/freshness labels come only from existing deterministic
  rules and recorded dates.
- Missing data is named.
- No trust score, upload, telemetry, provider call, or release-readiness claim
  is introduced.
- Local verification cannot satisfy the deployed canonical-URL requirement.

## Readiness checks for task generation

- Requirements are approved and contain no open critical questions.
- Desktop, narrow-screen, selection, footer, navigation, and source-path
  decisions are explicit.
- Current component/data surfaces and the compiler output mismatch are
  identified.
- Verification includes deterministic, browser, regression, and hosted gates.
- Shared React/CSS ownership must be serialized.
- Spec 005/T16R5/A-002 remain outside every ticket.

## Task readiness outcome

T1–T4 form one serialized, ownership-safe local implementation path. T5
captures the deployed Must Have without pretending it is locally satisfiable
or currently authorized. Each requirement maps to at least one implementation
task and one verification task; no routine human product decision remains.
