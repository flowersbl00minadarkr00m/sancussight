# Understanding: CMDB Builder and Registry Enrichment

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

High is triggered by novelty, opaque compiler behavior, and many hidden
identity/provenance decisions. The dominant difficulty is a stateful,
cross-system workflow.

## Planned Model

- Goal: turn bounded manifests into reviewed, searchable CMDB metadata.
- Non-goal: reorganize or redirect upstream files.
- Before: compiler proposals publish registry outputs with limited normalized
  search metadata.
- After: proposals pass through normalization and optional cited enrichment;
  one atomic publish writes the registry and a labelled metadata index.
- Invariant: discovery identity, human decisions, and upstream locations do
  not change without explicit review.
- Recovery: network failure falls back to offline normalization; publish
  failure preserves the prior complete generation.
- Trade-off: metadata organization is safer than physical folders but does not
  satisfy tools that require a manually rearranged filesystem.

## Representative Walkthrough

An approved skills manifest adds a new tool. Refresh emits a new proposal,
normalizes its identity and kind, offers official package metadata for empty
fields, and shows a field/location diff. After acceptance, the asset appears
under kind and lifecycle labels in the generated index while its real file
stays in place.

## Teach-back

1. Which artifact is canonical for identity, and which artifact is only a
   browsing projection?
2. What happens when an old path disappears?
3. Which data may an enrichment adapter receive?

## Sources

- `requirements.md`
- `.ai/sdd/specs/007-local-registry-compiler/design.md`
- `packages/registry-compiler/src/contracts.ts`
- `packages/registry-compiler/src/output/local.ts`

## Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: 2026-07-24-design-draft-1
  recommendation: recommended
  reason: The proposal crosses compiler, network, review, and publication boundaries.
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
- **Dominant difficulty:** dependency-aware compiler and publication workflow
- **Suggested evidence:** task-by-task architecture, blockers, owned surfaces,
  and atomic-output state transition

```yaml
visualization_offer:
  stage: tasks
  source_revision: 2026-07-24-tasks-draft-1
  recommendation: recommended
  reason: Four dependent compiler tickets cross identity, network, UI, and atomic output.
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
