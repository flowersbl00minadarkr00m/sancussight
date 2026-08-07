# Feature 010 T2 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 010 T2 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T2`
- T1 and T1R1 are authoritatively complete. T2 is the sole frontier.
- Do not edit `.status`, `tasks.md`, `INDEX.md`, `sdd-brief.md`, or
  `understanding.md`.

Fully read applicable `AGENTS.md`, installed `sdd-exec`, steering, the full
Feature 010 requirements/corrected design/tasks/understanding, sdd-brief,
T1/T1R1 handoffs, and relevant governance export / Exit Drill / version model
surfaces before acting. Resolve the registry and inspect the dirty tree first.

## Pre-edit Acknowledgment

Durably append and directly return:

```yaml
event:
  event_id: sancussight-010-T2-acknowledged-20260724-01
  task_id: T2
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T2 strict Evidence Packet scope, exact ownership, privacy exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T2
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Owned Surfaces

- new `src/lib/evidence-packet.ts`
- `src/types.ts` only for approved Evidence Packet contracts
- focused non-overlapping Feature 010 packet/adversarial tests under
  `src/lib/__tests__/`
- `package.json` only if the existing `test:feature010` glob does not already
  include the tests; no dependency
- worker-owned `execution/T2.md` and `execution/T2-handoff.md`

No version-model/session/compiler/UI/CSS/lockfile/shared-tracking/deployment
surface is owned.

## Required Implementation

Implement only approved T2:

1. Strict schema-version-1 `sancussight-evidence-packet` types.
2. Narrow asset-version and current Exit Drill result builders.
3. Exact subject, predicate, producer, run, qualification, verification,
   human-decision, missing-evidence, and optional comparison projections.
4. Subject hashes instead of raw asset IDs/names; Exit Drill statuses and
   hashed subjects without workflow names or notes.
5. Canonical recursive JSON and SHA-256 packet ID over every field except
   `packetId` and `exportedAt`.
6. Exact-shape runtime validation, bounds, prohibited-key/value checks, and
   digest recomputation.
7. Sanitized local Blob download with explicit capability failure and URL
   revocation.
8. Adversarial tests for tampering, paths, URLs, emails/user identity,
   prompts/responses, credentials/secrets, raw finding/evidence, registry
   objects, unsafe nested keys, unsupported versions, oversized collections,
   and deterministic re-export.

Construct from an allowlist; never copy then sanitize. No signing, import,
external verification, network, runtime dependency, UI, compiler, score,
standards claim, or Spec 005/T16R5/T16/A-002 action.

## Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

## Terminal Return

Return exactly one stable terminal event:

- `sancussight-010-T2-ready-20260724-01`, or
- one stable `blocked`, `contract-conflict`, or `verification-failed`.

Completion remains with the tracking owner.
