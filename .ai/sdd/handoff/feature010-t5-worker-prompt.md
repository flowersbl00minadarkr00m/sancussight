# Feature 010 T5 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation/acceptance task for
SancusSight Feature 010 T5 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:in-progress`
- Approved ticket:
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T5`
- T1–T4 are complete; T5 is the sole frontier.
- Shared tracking and understanding are orchestrator-only.

Fully read applicable `AGENTS.md`, `sdd-exec`, the Playwright skill, steering,
the full Feature 010 authority, `sdd-brief.md`, T1–T4 handoffs/evidence, and
the current implementation before acting. Resolve the registry and inspect the
dirty tree.

Before any browser or product correction, durably append and directly return:

```yaml
event:
  event_id: sancussight-010-T5-acknowledged-20260724-01
  task_id: T5
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 010 T5 local real-Chromium acceptance, bounded correction ownership, exact matrix, verification, tracking owner, and return path before browser or product work.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#T5
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Owned Surfaces

- bounded corrections within completed T1–T4 product/test surfaces only when
  an approved browser criterion fails
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T5.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T5-handoff.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T5-browser-report.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T5-browser/`

Shared tracking, deployment, package/dependency mutation, commits, pushes,
providers, Spec 005/T16R5/T16/A-002, and later tickets are excluded. Use only
local Vite/loopback browser targets.

## Required Actual-Browser Matrix

- Open an existing schema2 registry with no history; prove the no-history state
  causes no mutation.
- Record the first version, repeat an equivalent record with no mutation, then
  create a changed second version and prove the 50-entry retention boundary.
- Add an alias, move it case-insensitively, remove it, use controls by keyboard,
  and confirm the aliases-only truth label.
- Prove no-prior, regression, recovery, changed, and unchanged comparison
  states against exact recorded data.
- Download asset-version and current Exit Drill packets; inspect the exact JSON,
  canonical digest, fixed allowlist, filenames, and subject hashes.
- Prove downloads contain no prohibited key/value, raw registry/evidence/
  finding copy, owner/user identity, path, URL, email, prompt/response,
  credential, or unsafe object.
- Prove Exit Drill export appears only for a current deterministic result and
  does not imply persistence or provider execution.
- Prove desktop catalog/Passport adjacency, mutually exclusive narrow DOM,
  useful focus entry/Back return, 320px, effective 200% zoom, and zero page
  overflow.
- Regress Assets, Attention, source navigation, footer, and Exit Drill routes.
- Capture console errors/warnings and all network requests; traffic must remain
  loopback/same-origin.

Synthetic fixture injection is allowed only to exercise otherwise unreachable
bounded states and must be labeled simulated. Do not claim hosted behavior.

## Final Verification Order

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

Return exactly one stable terminal event:
`sancussight-010-T5-ready-20260724-01` or one stable failure/blocker event.
Completion remains with the tracking owner.
