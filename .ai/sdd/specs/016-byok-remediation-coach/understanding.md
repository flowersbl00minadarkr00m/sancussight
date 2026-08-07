# Understanding: BYOK Remediation Coach

> Phase: Planned
> Truth label: planned
> Refreshed: 2026-07-24

## Burden

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: opaque
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: many
  rule_selected_depth: high
  selected_depth: high
```

High is triggered by secret custody, opaque provider behavior, and many
data-egress and authority decisions. The dominant difficulty is a cross-system
trust boundary.

## Planned Model

- Goal: use a user-funded model to draft bounded remediation plans.
- Non-goal: autonomously fix, execute, verify, or close findings.
- Before: findings must be manually translated into steps.
- After: a local provider connection receives only a reviewed payload and
  returns a strictly validated proposed plan.
- Invariant: keys stay in Windows Credential Manager; findings/evidence and
  human decisions remain authoritative.
- Recovery: provider or parser failure leaves findings and prior plans intact;
  a deterministic human template remains available.
- Trade-off: strict payload/output contracts reduce model flexibility but make
  custody and authority inspectable.

## Walkthrough

The user stores a DeepSeek-compatible key through the local companion, tests
the endpoint, and selects an explicit model ID. They choose two findings,
inspect the exact outgoing JSON and limits, confirm its digest, and receive a
proposed plan. Accepting a step marks it planned—not implemented or verified.

## Teach-back

1. Where can the saved key exist?
2. What prevents a changed payload from being sent after preview?
3. What does accepting a model step mean—and what does it not mean?
4. What happens when model JSON is invalid?

## Sources

- `requirements.md`
- `research.md`
- `collector/server.ts`
- `collector/security.ts`
- `collector/config-store.ts`
- Microsoft Win32 Credential Manager API documentation

## Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: 2026-07-24-design-draft-1
  recommendation: strongly-recommended
  reason: Secret custody, data egress, provider failure, and proposal authority need one inspectable boundary view.
  state: declined
  decision_source: Operator response "No Html" on 2026-07-24
```

## Confirmation

```yaml
confirmation:
  state: confirmed
  decision_source: Blanket design approval plus design-HTML decline on 2026-07-24
```

## Task-stage Readiness

- **Depth:** high
- **Dominant difficulty:** security-critical cross-system lifecycle
- **Suggested evidence:** credential/data-flow boundary, request state machine,
  authority separation, blockers, and adversarial verification

```yaml
visualization_offer:
  stage: tasks
  source_revision: 2026-07-24-tasks-draft-1
  recommendation: strongly-recommended
  reason: Five serialized tickets cross OS credentials, HTTP providers, strict plan validation, UI, and adversarial review.
  state: inspected
  adapter: visualize-sdd
  mode: task-command-center
  output_path: C:/Users/henry/sancussight/artifacts/planning/sancussight-release-ux-task-microworld.html
  screenshot_paths:
    - C:/Users/henry/sancussight/artifacts/planning/sancussight-release-ux-task-microworld-desktop.png
    - C:/Users/henry/sancussight/artifacts/planning/sancussight-release-ux-task-microworld-mobile.png
  decision_source: Operator request "I'd like microworld" on 2026-07-24
```

Task source approved after operator inspection on 2026-07-24 under the
recorded blanket authorization.
