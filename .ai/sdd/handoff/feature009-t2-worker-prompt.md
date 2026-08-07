# Feature 009 T2 Visible Worker Prompt

Act as the one fresh visible top-level Feature 009 T2 implementation worker
for SancusSight in `orchestrated-worker` mode. Canonical project:
`C:\Users\henry\sancussight`. Resolve it first through
`C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py resolve
SancusSight --json` and work only in the returned canonical path. Tracking
owner and return target:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Before any product edit, fully read the applicable `AGENTS.md`, the installed
`sdd-exec` skill and required orchestration references,
`.ai/steering/product.md`, `.ai/steering/tech-stack.md`,
`.ai/steering/conventions.md`, Feature 009 `.status`, approved
`requirements.md`, `design.md`, `tasks.md` T2, `understanding.md`,
`.ai/sdd/handoff/sdd-brief.md`, and the completed T1 handoff. Confirm
`.status` is `implementation:in-progress`, T1 is authoritatively complete,
and T2 is the only unblocked frontier. Before editing, send stable event
`sancussight-009-T2-acknowledged-20260723-01` to the tracking task. If direct
return fails, durably record it in the worker execution record first.

Implement only T2 — Metadata-only local check-result history. Owned product
surfaces only:

- new `src/lib/check-history-store.ts`;
- new focused non-overlapping T2 history tests under `src/lib/__tests__/`;
- `src/types.ts` only for the approved history type;
- `package.json` only if the existing `test:feature009` command needs an
  additive glob, with no dependency;
- worker-owned
  `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T2.md` and
  `T2-handoff.md`.

Do not edit shared authority/tracking files, completed T1 implementation or
evidence, T3–T5 surfaces, package-lock unless unexpectedly required (stop and
report first), unrelated dirty files, deployment, commits, pushes, providers,
Pi, or anything under Spec 005/T16R5/T16/A-002.

Implement the approved fixed snapshot allowlist, registry-scope hashing
without retained preimage, safe evidence hash, current/immediately previous
distinct metadata, consecutive dedupe, isolation by registry scope + asset +
check ID, retention of 20 per stream and 1,000 globally, explicit unavailable
and clear-history behavior, and graceful IndexedDB failure. Tests must prove
that raw finding/evidence text, envelope attributes, paths, prompts,
responses, credentials, and registry objects cannot enter storage. Add no
runtime dependency, network route, analytics, raw-content history, or
provider/upstream action. Preserve all dirty user work.

Required verification, with exact command, exit code, and summary:
`npm run test:feature009`; `npm run test:feature008`;
`npm run verify:core`; `npm run build`; scoped
`git -c core.autocrlf=false diff --check` plus no-index whitespace checks for
new files. Return exactly one stable
`sancussight-009-T2-ready-20260723-01` event when all pass, or one stable
blocked/contract-conflict/verification-failed event. Ready-for-review is a
recommendation only; do not mark T2 complete.
