# Feature 009 T1 Fresh Visible Worker Prompt

Create a **new visible top-level Codex task**, then paste the prompt below.
Do not reuse the orchestrator task and do not create a subagent.

```text
Act as the fresh visible top-level Feature 009 T1 implementation worker for
SancusSight in `orchestrated-worker` mode.

Canonical project: C:\Users\henry\sancussight
Tracking owner and return target:
019f914a-b672-77b1-837f-0c866b6421bb

Before any product edit:

1. Resolve SancusSight through:
   python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve SancusSight --json
2. Work only in the returned canonical path.
3. Fully read the applicable AGENTS.md instructions, the installed `sdd-exec`
   skill and its required orchestration references,
   `.ai/steering/product.md`, `.ai/steering/tech-stack.md`,
   `.ai/steering/conventions.md`, and:
   - `.ai/sdd/specs/009-claim-lineage-check-catalog/.status`
   - `.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
   - `.ai/sdd/specs/009-claim-lineage-check-catalog/design.md`
   - `.ai/sdd/specs/009-claim-lineage-check-catalog/tasks.md` T1
   - `.ai/sdd/specs/009-claim-lineage-check-catalog/understanding.md`
   - `.ai/sdd/handoff/sdd-brief.md`
4. Confirm `.status` is `tasks:approved` or
   `implementation:in-progress` and T1 has no incomplete blocker.
5. Before editing, send stable acknowledgment event
   `sancussight-009-T1-acknowledged-20260723-01` to tracking task
   `019f914a-b672-77b1-837f-0c866b6421bb`. If direct return fails, durably
   append it to the T1 execution record before editing.

Implement only T1 — Stable Check Catalog and bounded claim-lineage model.

Owned product surfaces only:

- `src/types.ts`
- `src/lib/registry.ts`
- `src/lib/evidence.ts`
- new `src/lib/check-catalog.ts`
- new `src/lib/claim-lineage.ts`
- new focused non-overlapping Feature 009 model tests under
  `src/lib/__tests__/`
- `package.json` and `package-lock.json` only if needed for an additive
  `test:feature009` command, with no runtime dependency
- worker-owned
  `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T1.md`
  and `execution/T1-handoff.md`

Excluded:

- `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `.ai/sdd/PLAN.md`, and
  `.ai/sdd/handoff/sdd-brief.md`
- T2–T5 evidence
- unrelated product files
- deployment, commits, pushes, providers, Pi
- all Spec 005/T16R5/T16/A-002 files, commands, and actions

Required outcome and acceptance are exactly T1 in approved `tasks.md`:

- optional `Signal.checkId` and `Signal.evaluatedAt`
- unique versioned stable definitions for every currently supported
  deterministic evaluator rule family
- explicit IDs attached in `evaluateAsset` and the missing evidence-binding
  evaluator, but not accepted external facts
- pure search/result projection, remediation/invalidation, and uncataloged
  fallback
- bounded typed claim lineage with verified, missing, inferred, stale, and
  conflicting relationships and explicit gaps
- no parsing of condition/finding copy, external-truth overclaim,
  network/storage/global graph
- start from the approved provider-fallback red/green test

Preserve all existing dirty user work and stop on overlap or contract conflict.

Required verification with exact commands, exit codes, and summaries:

- `npm run test:feature009`
- `npm run test:feature008`
- `npm run verify:core`
- `npm run build`
- scoped `git -c core.autocrlf=false diff --check`
- no-index whitespace checks for new files

Return exactly one stable `sancussight-009-T1-ready-20260723-01` event when all
checks pass, or one stable blocked/contract-conflict/verification-failed
event. `ready-for-review` is a recommendation only; do not mark T1 complete.
Send the event to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb` and record delivery evidence.
```
