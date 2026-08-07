# Understanding: Scalable Portability Targets

> Phase: Planned
> Truth label: planned
> Refreshed: 2026-07-24

## Burden

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: mixed
  blast_radius: system-wide
  consequence: consequential
  hidden_decisions: many
  rule_selected_depth: high
  selected_depth: high
```

High is triggered by the new ontology, system-wide schema migration, and many
identity decisions. The dominant difficulty is a novel domain model with a
product-UX consequence.

## Planned Model

- Goal: represent many precise execution targets without adding permanent
  columns.
- Non-goal: rank models or infer their capabilities.
- Before: coverage keys are broad labels such as Claude or Local LLM.
- After: assets reference stable typed targets; users select up to four for a
  comparison.
- Invariant: only accepted evidence establishes coverage state.
- Recovery: schema v2 remains readable and legacy labels remain visibly
  qualified; a temporary compatibility export reports dimensional loss.
- Trade-off: precise target identity adds schema concepts but removes repeated
  UI redesign and false provider/model equivalence.

## Example

`DeepSeek V3 via OpenAI-compatible endpoint` and `DeepSeek V3 in a local
runtime` are different targets even if they share a model label. A coverage
result for one does not transfer to the other.

## Teach-back

1. Why is provider not enough to identify a target?
2. What does migration do with `local-llm`?
3. Why can only four targets appear in the comparison?

## Sources

- `requirements.md`
- `src/types.ts`
- `src/components/Registry.tsx`
- `packages/registry-compiler/src/contracts.ts`

## Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: 2026-07-24-design-draft-1
  recommendation: recommended
  reason: A toy target catalog and migration view will clarify identity and UI behavior.
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
- **Dominant difficulty:** system-wide expand-contract migration
- **Suggested evidence:** schema before/after, legacy projection examples,
  task blockers, and selected-target UI state

```yaml
visualization_offer:
  stage: tasks
  source_revision: 2026-07-24-tasks-draft-1
  recommendation: strongly-recommended
  reason: The task chain changes schema, identity, UI, compiler, and history while preserving evidence meaning.
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
