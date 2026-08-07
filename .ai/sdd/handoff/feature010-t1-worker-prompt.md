# Feature 010 T1 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 010 T1 only.

## Mode and Authority

- Work in orchestrated-worker mode.
- Canonical project:
  `C:\Users\henry\sancussight`
- Tracking owner:
  `019f914a-b672-77b1-837f-0c866b6421bb`
- Return every stable lifecycle event directly to that exact task.
- Gate at dispatch: `tasks:approved`.
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T1`
- T1 has no incomplete blocker and is the sole implementation frontier.
- You are not the tracking owner. Do not edit `.status`, `tasks.md`,
  `.ai/sdd/INDEX.md`, or `.ai/sdd/handoff/sdd-brief.md`.

## Read Before Acting

Fully read and follow:

- applicable repository `AGENTS.md`
- installed `sdd-exec` skill
- `.ai/steering/product.md`
- `.ai/steering/tech-stack.md`
- `.ai/steering/conventions.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/.status`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/requirements.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/design.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/understanding.md`
- `.ai/sdd/handoff/sdd-brief.md`
- relevant current product/types/session/test files

Resolve the project first:

```powershell
python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json
```

Fail closed if the canonical path, gate, frontier, or ownership does not match.
Inspect and preserve the dirty tree.

## Acknowledge Before Product Edits

Before any product edit, append the acknowledgment to your owned
`execution/T1.md` and send this stable event to the tracking owner:

```yaml
event:
  event_id: sancussight-010-T1-acknowledged-20260724-01
  task_id: T1
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T1, exact ownership, exclusions, verification, tracking owner, and return path before product edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T1
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct tool result or durable fallback>
```

If direct delivery is unavailable, record the complete event durably before
editing and continue only if the task retains a usable return path.

## Exact Owned Surfaces

- `src/types.ts` only for approved Feature 010 version/comparison contracts
- new `src/lib/asset-versions.ts`
- `src/lib/session.ts` only for strict optional Feature 010 normalization
- focused non-overlapping `feature010-*` model tests under
  `src/lib/__tests__/`
- `package.json` and `package-lock.json` only if needed for additive
  `test:feature010`; no runtime dependency
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T1.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T1-handoff.md`

No other surface is owned.

## Required Implementation

Implement only the approved T1:

1. Optional schema-version-1 version/snapshot/verification/alias contracts on
   schema-version-2 assets.
2. A pure canonical fixed snapshot projection that excludes name, location,
   owner, sensitivity, evidence labels/payloads, accepted-risk text, decision
   rationale, source URLs, candidate notes, prompts/responses, credentials,
   and unrestricted attributes.
3. Stable SHA-256 version identity through an injected async hash seam,
   equivalent-consecutive dedupe, explicit append, 50-version retention, and
   current pointer.
4. Alias add/move/remove with case-insensitive uniqueness, approved
   characters/limits, valid targets, and no truth/environment semantics.
5. Current-versus-immediately-previous comparison using exactly the approved
   transition rules; no arbitrary pair selection, dynamic age rewrite,
   aggregate verdict, or score.
6. Strict optional normalization in `src/lib/session.ts`: absent fields stay
   absent; present invalid shapes fail closed; no fabricated version or silent
   repair.
7. Focused positive, compatibility, boundary, and adversarial tests.

Keep algorithms bounded and deterministic. Do not add a network route,
IndexedDB database, runtime dependency, UI, compiler edit, packet builder,
migration, or automatic version creation.

## Exclusions

- T2–T6 or R1
- App, React components, CSS, compiler output, packet export
- shared tracking or authority files
- Spec 005/T16R5/T16/A-002
- deployment, Vercel, providers, producer operations, release operations
- commits, pushes, Pi
- deleting/reverting unrelated dirty work

## Required Verification

Run in order:

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check over every owned file
```

If `test:feature010` does not exist, add only the additive package script
needed for the owned focused tests.

## Terminal Return

Return exactly one stable terminal event:

- `sancussight-010-T1-ready-20260724-01`, or
- one stable `blocked`, `contract-conflict`, or `verification-failed` event.

The ready event must list exact files, commands/results, compatibility/privacy
acceptance, limitations, and return receipt. `ready-for-review` is a worker
recommendation only; do not mark T1 or the feature complete.
