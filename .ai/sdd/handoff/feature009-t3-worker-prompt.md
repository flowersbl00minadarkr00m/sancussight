# Feature 009 T3 Visible Worker Prompt

Act as the one fresh visible top-level Feature 009 T3 implementation worker
for SancusSight in `orchestrated-worker` mode. Canonical project:
`C:\Users\henry\sancussight`. Resolve it through the shared project registry
and work only in the returned canonical path. Tracking owner and return target:
`019f914a-b672-77b1-837f-0c866b6421bb`. No other T3 worker is authorized.

Before product edits, fully read applicable `AGENTS.md`, installed `sdd-exec`
instructions and required orchestration references, all steering files,
Feature 009 `.status`, approved requirements/design/tasks T3,
`understanding.md`, `sdd-brief.md`, and completed T1/T2 handoffs. Confirm
`.status` is `implementation:in-progress`, T1 and T2 are authoritatively
complete, and T3 is the sole frontier. Send stable acknowledgment
`sancussight-009-T3-acknowledged-20260723-01` to the tracking task before
product edits.

Implement only T3 — Canonical Attention Check Catalog and cross-view
integration. Owned product surfaces only:

- `src/App.tsx`;
- `src/components/Queue.tsx`;
- `src/components/Registry.tsx`;
- new `src/components/CheckCatalog.tsx`;
- new `src/components/ClaimLineageInspector.tsx`;
- Feature 009 selectors in `src/index.css`;
- `src/types.ts` only for approved navigation/check-intent types;
- focused non-overlapping T3 component/static-contract tests;
- worker-owned `execution/T3.md` and `execution/T3-handoff.md`.

Read completed T1/T2 modules but do not change them. Do not edit package files
without stopping and reporting first. Do not edit shared tracking, T1/T2 or
T4/T5 evidence, unrelated dirty files, deployment, commits, pushes,
providers, Pi, or Spec 005/T16R5/T16/A-002.

Implement the approved canonical Attention list/detail workspace:
definition and current-result lists; one shared detail for definition, current
and previous metadata, inspected evidence, bounded claim lineage,
remediation, and invalidation; search; explicit no-result,
definition-only, uncataloged, no-previous, and history-unavailable states;
clear-history; App-owned check intent; Asset Passport `Open check explanation`
to the exact same detail; canonical return to Passport. Desktop is adjacent
list/detail. Narrow is one DOM with mutually exclusive list/detail states,
focus entry, and useful Back focus restoration. Keep all relationship/truth
states textual, no scoring. Preserve existing selection/navigation authority.
No new network/provider/analytics/upstream action and no duplicate
interactive implementation.

Required verification: `npm run test:feature009`; `npm run test:feature008`;
`npm run verify:core`; `npm run build`; scoped whitespace checks. Actual
browser geometry, focus, 320px, zoom, storage, console, and network acceptance
remain T4 and must not be claimed by T3. Return exactly one stable
`sancussight-009-T3-ready-20260723-01` ready-for-review recommendation or one
stable blocked/contract-conflict/verification-failed event. Do not mark T3
complete.
