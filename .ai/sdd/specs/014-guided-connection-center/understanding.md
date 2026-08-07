# Understanding: Guided Connection Center

> Phase: Planned
> Truth label: planned
> Refreshed: 2026-07-24

## Burden

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: medium
  observability: mixed
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: medium
  selected_depth: high
  escalation_reason: Connection validation crosses browser, loopback security, filesystem, and adapter boundaries.
```

The dominant difficulty is cross-system integration.

## Planned Model

- Goal: make it obvious what can be connected, in which mode, and what artifact
  the user must provide.
- Non-goal: install, launch, or configure Praxen, Pipelock, or telemetry
  producers.
- Before: select source, paste a path, and discover errors after Connect.
- After: choose a source, follow source-specific preparation, validate without
  mutation, then confirm configuration and refresh.
- Invariant: hosted mode never claims local connectivity; validation never
  persists or ingests.
- Recovery: failure preserves the old working connection and entered candidate.

## Walkthrough

In local mode, the user selects Praxen. The profile identifies Canonical
Findings JSON 2.0 and how to produce it. The user chooses the report directory,
validation confirms the contract without saving it, and Connect then
revalidates, stores, and refreshes. In hosted mode, the same card explains that
only a sanitized snapshot can be imported.

## Teach-back

1. Why is OpenTelemetry not shown as a path-based source by itself?
2. What changes during Validate, and what changes during Connect?
3. What can the hosted app do when the collector is not running?

## Sources

- `requirements.md`
- `src/components/EvidenceSources.tsx`
- `src/lib/evidence-catalog.ts`
- `collector/server.ts`
- `collector/config-store.ts`

## Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: 2026-07-24-design-draft-1
  recommendation: recommended
  reason: A mode and state walkthrough will make the validation boundary easier to inspect.
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
- **Dominant difficulty:** browser-to-collector state and security boundary
- **Suggested evidence:** mode/state walkthrough plus task blockers and owned
  routing/UI surfaces

```yaml
visualization_offer:
  stage: tasks
  source_revision: 2026-07-24-tasks-draft-1
  recommendation: recommended
  reason: The four tickets serialize catalog, collector validation, UI, and end-to-end proof.
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
