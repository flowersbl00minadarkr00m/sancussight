# Feature 011 T3 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 011 T3 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Resolve first:
  `python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json`
- Tracking owner / return task:
  `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `.ai/sdd/specs/011-standards-interoperability/.status` must be
  `implementation:in-progress`.
- Approved ticket:
  `.ai/sdd/specs/011-standards-interoperability/tasks.md#T3 — Preview storage and Evidence Sources workspace`.
- T1 and T2 are authoritatively complete. T3 is the sole unblocked frontier.

Fully read applicable `AGENTS.md`, the installed `sdd-exec` skill and required
references, steering, Feature 011 `.status`, requirements, design, tasks,
research, understanding, `sdd-brief.md`, `execution/T1-handoff.md`, and
`execution/T2-handoff.md` before editing. Resolve the registry and inspect the
dirty tree first.

The orchestrator is the sole writer of `tasks.md`, `.status`,
`.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, and `understanding.md`.

## Pre-edit Acknowledgment

Before product edits, durably append `execution/T3.md` and directly return:

```yaml
event:
  event_id: sancussight-011-T3-acknowledged-20260724-01
  task_id: T3
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 011 T3 isolated preview storage and Evidence Sources workspace scope, exact ownership, privacy/UI exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/011-standards-interoperability/tasks.md#T3
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or durable fallback>
```

## Exact Owned Surfaces

- new `src/lib/interoperability-store.ts`
- new `src/components/StandardsInteroperability.tsx`
- `src/App.tsx` only for workspace state, render, focus, and accepted-data wiring
- `src/components/EvidenceSources.tsx` only if one bounded contextual link is
  needed; do not rewrite source behavior
- Feature 011 selectors only in `src/index.css`
- focused non-overlapping T3 tests under `src/lib/__tests__/feature011-*.test.mjs`
- `.ai/sdd/specs/011-standards-interoperability/execution/T3.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T3-handoff.md`

Do not edit T1/T2 implementation or evidence, `src/types.ts`, package metadata,
shared tracking, collector/compiler contracts, or any other file. If a genuine
approved T3 acceptance failure requires a T1/T2 contract change, stop with a
contract-conflict event rather than widening ownership.

## Required Implementation

Implement only approved T3:

1. Add a dedicated Feature 011 browser-local preview repository with a memory
   test seam, exact sanitized-shape validation, deterministic equivalence
   dedupe, 20-per-profile and 100-global retention, explicit clear, and honest
   unavailable persistence.
2. Persist only sanitized bounded previews and safe hashes. Never persist file
   bytes, raw OpenLineage identifiers/facets, runtime content, Evidence Packet
   content, registry objects, paths, URLs, credentials, identity, prompts,
   responses, reasoning, tool payloads, documents, images, or hash preimages.
3. Add one Standards Interoperability main workspace only under Advanced ->
   Evidence Sources. Do not add a primary or advanced navigation destination.
4. Integrate explicit local OpenLineage JSON/JSONL file selection, sanitized
   import summaries, telemetry alignment over already accepted runtime
   evidence, validated local Evidence Packet input, unsigned Statement
   download, bounded preview history, clear, and permanent non-claim text.
5. Keep local import/download actions honest with pending, success, and failure
   status. Explicitly render empty telemetry, unsupported profile/input,
   invalid packet, no-history, and unavailable-persistence states.
6. Preserve one interaction model and one mutually exclusive responsive DOM,
   native controls, visible focus, useful focus entry/return, long-hash
   wrapping, 320 CSS pixel and effective 200% overflow safety.
7. Preserve the existing Evidence Sources rail, source behavior, routes,
   navigation, footer, Feature 008–010 behavior, and all callbacks.
8. Add focused store and static/component contract tests. Actual browser
   geometry, download, IndexedDB, focus, 320px, and 200% acceptance remain T4.

No score, AI interpretation, conformance/certification claim, signer, DSSE,
policy runtime, live ingestion, telemetry emission, network request, new
dependency, duplicate DOM, or governance mutation.

## Exclusions

No Spec 005/T16R5/T16/A-002 action; no T4–T5/R1; no provider/Pi/upstream
operation; no commit/push; no deployment; no package/dependency change; no
shared tracking write; preserve all unrelated dirty work.

## Verification

Run in order:

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git -c core.autocrlf=false diff --check
```

Record exact commands, exit codes, output summaries, changed files, privacy
negatives, limitations, and return receipt in `execution/T3.md` and
`T3-handoff.md`.

## Terminal Return

Return exactly one stable terminal event:

- `sancussight-011-T3-ready-20260724-01`, or
- one stable `blocked`, `contract-conflict`, or `verification-failed`.

Completion remains with the tracking owner.
