# Feature 010 T3 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 010 T3 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T3`
- T1/T1R1/T2 are complete; T3 is the sole frontier.
- Shared tracking and understanding are orchestrator-only.

Fully read applicable `AGENTS.md`, `sdd-exec`, steering, full Feature 010
authority, sdd-brief, prior handoffs, compiler contracts/output/tests, and the
current version validator/model before acting. Resolve the project and inspect
the dirty tree.

Before edits, durably append and directly return:

```yaml
event:
  event_id: sancussight-010-T3-acknowledged-20260724-01
  task_id: T3
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T3 compiler preservation and portable sanitization scope, exact ownership, exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T3
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Owned Surfaces

- `packages/registry-compiler/src/output/local.ts`
- compiler contracts only if required for the approved optional fields
- focused non-overlapping registry-compiler tests/fixtures for Feature 010
- worker-owned `execution/T3.md` and `execution/T3-handoff.md`

No frontend types/model/session/packet/UI/CSS/package/lockfile/shared tracking,
deployment, or later-ticket surface is owned.

## Required Implementation

- Extend compiler-local schema2 asset/output validation for optional Feature
  010 versions, aliases, and current pointer with the same exact bounds and
  supported subversions as the product validator.
- On confirmed refresh, preserve valid history by `stableId ?? id`.
- Preserve history for an asset becoming missing.
- Create no history for a new asset and append no version for any refresh.
- Preserve local history exactly.
- For portable output, retain structure/identity while sanitizing
  provider/capability/fallback bounded labels; introduce no local path, owner,
  raw evidence, prohibited key, or user identifier.
- Fail closed on invalid prior history.
- Add focused version-free compatibility, stable refresh, missing asset,
  portable privacy, and invalid-history tests.

No migration, version creation, packet/UI work, dependency, network,
deployment, Spec 005/T16R5/T16/A-002, commit, push, or Pi.

## Verification

```text
npm run test:feature010
npm run test:registry-compiler
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

Return exactly one stable terminal event:
`sancussight-010-T3-ready-20260724-01` or one stable failure/blocker event.
Completion remains with the tracking owner.
