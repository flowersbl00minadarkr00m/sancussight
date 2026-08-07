# Feature 010 T4 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 010 T4 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T4`
- T1–T3 are complete; T4 is the sole frontier.
- Shared tracking and understanding are orchestrator-only.

Fully read applicable `AGENTS.md`, `sdd-exec`, steering, full Feature 010
authority, sdd-brief, prior handoffs, current App/Registry/ExitTest/CSS/tests,
and the approved pure version/packet modules before acting. Resolve the
project and inspect the dirty tree.

Before edits, durably append and directly return:

```yaml
event:
  event_id: sancussight-010-T4-acknowledged-20260724-01
  task_id: T4
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T4 Asset Passport and Exit Drill integration scope, exact ownership, responsive/focus/privacy exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T4
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Owned Surfaces

- `src/App.tsx`
- `src/components/Registry.tsx`
- `src/components/ExitTest.tsx`
- new `src/components/AssetVersionHistory.tsx`
- new `src/components/AssetVersionComparison.tsx` if useful
- new `src/components/EvidencePacketExport.tsx` if useful
- Feature 010 selectors only in `src/index.css`
- focused non-overlapping Feature 010 UI/static tests
- worker-owned `execution/T4.md` and `execution/T4-handoff.md`

No domain/type/session/compiler/package/lockfile/shared tracking/deployment or
later-ticket surface is owned.

## Required Implementation

- App owns explicit async version recording and alias mutations through the
  existing registry-update path and current cataloged result projection.
- Asset Passport keeps its existing six sections; History gains explicit
  no-history, record, ordered version/current/alias, current-versus-previous,
  and asset-version packet export behavior.
- Equivalent recording reports already recorded and does not mutate.
- Alias controls are bounded/labeled/keyboard-usable, suggestions are hints,
  and aliases are never presented as evidence/environment/approval truth.
- Comparison states and bases are textual; no score or generated narrative.
- Packet download has honest pending/success/failure status.
- Exit Drills offer packet export only for a current deterministic result and
  do not imply persistence or provider execution.
- Preserve the canonical Feature 008 catalog-plus-Passport desktop layout,
  existing mutually exclusive narrow behavior/focus return, Attention/source
  routes, footer, and all existing callbacks.
- Keep one canonical DOM/interaction implementation and stack/wrap safely.

T4 static/component tests may prove structural contracts; actual browser,
download, focus, 320px, and 200% acceptance remain T5.

No packet/domain/compiler changes, migration, network, dependency, score,
analytics, deployment, Spec 005/T16R5/T16/A-002, commit, push, or Pi.

## Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check
```

Return exactly one stable terminal event:
`sancussight-010-T4-ready-20260724-01` or one stable failure/blocker event.
Completion remains with the tracking owner.
