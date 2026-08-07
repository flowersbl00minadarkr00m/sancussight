# Feature 010 T1R1 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex correction task for SancusSight Feature
010 T1R1 only.

## Mode and Authority

- Work in orchestrated-worker mode.
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Return stable lifecycle events directly to that exact task.
- Gate at dispatch: `tasks:approved`.
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T1R1`
- T1R1 is the sole unblocked frontier.
- Original T1 worker `019f937a-ddae-7853-9649-e2c396cedef6` and duplicate
  `019f937b-9a37-7170-9f12-a9d812a18e0a` are terminal and must not resume.
- Do not edit `.status`, `tasks.md`, `.ai/sdd/INDEX.md`,
  `.ai/sdd/handoff/sdd-brief.md`, or `understanding.md`.

## Read Before Acting

Fully read applicable `AGENTS.md`, the installed `sdd-exec` skill, project
steering, and:

- `.ai/sdd/specs/010-asset-versioning-evidence-packets/.status`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/requirements.md`
- corrected `.ai/sdd/specs/010-asset-versioning-evidence-packets/design.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T1R1`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/understanding.md`
- `.ai/sdd/handoff/sdd-brief.md`
- original worker evidence `execution/T1.md` and `T1-handoff.md`
- current owned source/test files

Resolve the project first and inspect the dirty tree:

```powershell
python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json
```

Fail closed on path, gate, frontier, or ownership mismatch.

## Acknowledge Before Product Edits

Append and directly return:

```yaml
event:
  event_id: sancussight-010-T1R1-acknowledged-20260724-01
  task_id: T1R1
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged the bounded Feature 010 T1R1 equivalence correction, exact ownership, exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T1R1
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct tool result or durable fallback>
```

## Exact Owned Surfaces

- `src/lib/asset-versions.ts`
- `src/lib/__tests__/feature010-asset-versions.test.mjs`
- `src/types.ts` only if the approved corrected projection requires a type
  adjustment; avoid if possible
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T1R1.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T1R1-handoff.md`

No package, lockfile, session, component, CSS, compiler, packet, understanding,
shared tracking, deployment, or other surface is owned.

## Required Correction

The tracking owner reproduced:

```json
{"secondStatus":"deduplicated","versionCount":1,"storedStatus":"pass"}
```

after recording `pass` then `fail` verification metadata with unchanged asset
facts. Correct only that approved equivalence boundary:

1. Canonical equivalence includes snapshot, source hashes, and verification
   `checkId`, `resultId`, `status`, and optional `safeEvidenceHash`.
2. Equivalence excludes version `recordedAt` and verification `evaluatedAt`.
3. Identity after equivalence passes includes `recordedAt`, snapshot, source
   hashes, and full verification references.
4. Imported consecutive-history validation uses the same equivalence rule.
5. Tests prove pass/fail regression, fail/pass recovery, safe-evidence change,
   source-hash change, and evaluation-time-only dedupe.
6. Preserve all original compatibility, privacy, alias, retention, and
   comparison behavior.

Do not implement T2, add fields, change scope, or introduce migration,
network, storage, score, dependency, UI, compiler, packet, or Spec 005 work.

## Required Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check over every owned file
```

## Terminal Return

Return exactly one stable terminal event:

- `sancussight-010-T1R1-ready-20260724-01`, or
- one stable `blocked`, `contract-conflict`, or `verification-failed` event.

`ready-for-review` is a recommendation only.
