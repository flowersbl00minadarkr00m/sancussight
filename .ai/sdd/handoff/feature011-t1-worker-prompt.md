# Feature 011 T1 Worker Prompt

You are a fresh visible top-level Codex worker for SancusSight Feature 011 T1
only.

## Identity and Authority

- Canonical project: `C:\Users\henry\sancussight`
- Resolve first:
  `python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json`
- Feature:
  `.ai/sdd/specs/011-standards-interoperability/`
- Gate: `.status` must be `implementation:in-progress`.
- Exact ticket: `tasks.md#T1 — Pinned profiles and bounded OpenLineage projection`.
- Tracking owner / return task:
  `019f914a-b672-77b1-837f-0c866b6421bb`.

Read completely before editing:

- applicable root `AGENTS.md`;
- `.ai/steering/product.md`, `tech-stack.md`, `conventions.md`;
- Feature 011 `.status`, `requirements.md`, `design.md`, `tasks.md`,
  `research.md`, and `understanding.md`;
- `.ai/sdd/handoff/sdd-brief.md`; and
- the installed `sdd-exec` skill and required references.

## Mode

Operate as `orchestrated-worker`.

- The orchestrator is the sole writer of `tasks.md`, `.status`,
  `.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, and
  `understanding.md`.
- Before product edits, append `execution/T1.md` with your dispatch snapshot
  and send stable acknowledgment event
  `sancussight-011-T1-acknowledged-20260724-01` directly to the tracking task.
- Stay inside exact owned surfaces.
- Return exactly one stable terminal event:
  `sancussight-011-T1-ready-20260724-01` or a stable
  blocked/contract-conflict/verification-failed event.
- `ready-for-review` is a recommendation only.

## Owned Surfaces

- `src/types.ts` only for Feature 011 types
- new `src/lib/standards-profiles.ts`
- new `src/lib/openlineage-import.ts`
- focused T1 tests under `src/lib/__tests__/feature011-*.test.mjs`
- `package.json` and `package-lock.json` only if required for additive
  `test:feature011`; no dependency
- `.ai/sdd/specs/011-standards-interoperability/execution/T1.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T1-handoff.md`

Do not edit any other surface.

## Required Behavior

Implement T1 exactly as approved:

- immutable pinned profile registry with upstream name/version/stability/source;
- bounded 1 MiB and 500-record JSON/JSONL parser;
- pinned OpenLineage RunEvent core projection;
- per-record isolation and stable rejection/omission codes;
- whole-facet omission without traversing/copying facet values;
- canonical timestamps, deterministic ordering, and domain-separated hashes;
- no raw producer/schema/run/job/dataset identifier or hash preimage in any
  returned/stored shape;
- unknown schemas/types/keys explicit and fail closed;
- policy preview remains research-only with no runtime module.

Do not implement T2–T5, R1, UI, IndexedDB, telemetry alignment, Statement
export, deployment, policy execution, or generic standards SDK behavior.

## Exclusions

No Spec 005/T16R5/T16/A-002 action; no provider/Pi/upstream operation; no
network ingestion; no commit/push; no deployment; no runtime dependency; no
shared tracking write; preserve all unrelated dirty work.

## Verification

Run in order:

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git -c core.autocrlf=false diff --check
```

Record exact commands, exit codes, output summaries, changed files, privacy
negatives, limitations, and return receipt in `execution/T1.md` and
`T1-handoff.md`.

