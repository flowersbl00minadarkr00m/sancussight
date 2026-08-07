# Feature 010 C1 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex correction worker for Feature 010 C1
only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#C1`
- Findings: `R1-SPEC-001`–`003`, `R1-STANDARDS-001`–`002`
- Shared tracking/understanding remain orchestrator-only.

Fully read `AGENTS.md`, `sdd-exec`, steering, corrected requirements/design/
tasks, `review-r1.md`, all relevant implementation/tests, and dirty tree.
Resolve the registry. Before edits, durably append and directly return stable
event `sancussight-010-C1-acknowledged-20260724-01`.

## Exact Ownership

- `src/types.ts`
- `src/lib/asset-versions.ts`
- `src/lib/evidence-packet.ts`
- `src/lib/session.ts` and `src/lib/storage.ts` only for verified import
- `src/App.tsx`
- `src/components/AssetVersionHistory.tsx`
- `packages/registry-compiler/src/output/local.ts`
- focused Feature 010/compiler tests
- `execution/C1.md` and `execution/C1-handoff.md`

No shared tracking, deployment, package/dependency change, commit/push,
provider/Pi, Spec 005/T16R5/T16/A-002, C2+, or broader scope.

## Required Correction

- Build full comparison before bounding; preserve every meaningful item when
  at most 100, prioritize it over unchanged context, expose truncation counts,
  and return explicit unavailable when meaningful changes exceed 100.
- Add async identity verification at import/session and packet boundaries;
  compiler verifies identical canonical preimages with Node SHA-256.
- Portable sanitized history becomes a new verified
  `portable-projection` derivative with safe source pointer and remapped
  aliases/current pointer; never call modified facts recorded.
- Packet builder derives comparison internally from verified versions.
- Reject impossible/non-canonical ISO dates/timestamps across product, packet,
  and compiler using shared vectors.
- Add adversarial regression coverage for every R1 reproduction.

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

Return exactly one stable terminal event
`sancussight-010-C1-ready-20260724-01` or one stable failure/conflict event to
tracking task `019f914a-b672-77b1-837f-0c866b6421bb`.
