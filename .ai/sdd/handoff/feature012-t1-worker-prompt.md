# Feature 012 T1 Fresh Visible Worker Prompt

Act as the fresh visible top-level Feature 012 T1 worker only. Canonical
project: `C:\Users\henry\sancussight`. Tracking owner and return target:
Codex task `019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve the canonical project registry, then fully read `AGENTS.md`, the
installed `sdd-exec` skill and its orchestrated-worker contracts, Feature 012
`.status`, approved requirements/design/tasks, `understanding.md`,
`.ai/sdd/handoff/sdd-brief.md`, and the current owned implementation/test
surfaces. Work only T1.

Before any product edit, append `execution/T1.md` and directly return stable
event `sancussight-012-T1-acknowledged-20260724-01` to the tracking task.
Continue only after delivered receipt or a valid durable fallback.

## Exact Ticket

Implement T1 — contextual source-write strip and compact global truth:

- add one `SourceWriteStrip` at the top of the selected Asset Passport;
- retain App/source-controller confirmation, permission, preflight conflict,
  verified write, recovery cache, and last-valid behavior as the only write
  path;
- give App one bounded ephemeral deliberate-write feedback channel separate
  from general notices;
- clear stale save-success feedback when a new mutation makes the session
  dirty;
- remove the competing Header save action while preserving compact always-
  visible safe source identity, sync/freshness, and read/write permission
  truth; and
- add focused Feature 012 tests and an additive `test:feature012` script only
  if required, without adding a dependency.

Do not implement T2 disclosures. Existing Passport section wrappers/defaults
remain unchanged in T1.

## Owned Surfaces

- `src/App.tsx`
- `src/components/Header.tsx`
- `src/components/SourceStatus.tsx`
- new `src/components/SourceWriteStrip.tsx`
- `src/components/Registry.tsx` only for T1 props/render integration
- Feature 012 save/status selectors in `src/index.css`
- focused non-overlapping Feature 012 save-strip tests
- `package.json` only for additive `test:feature012`
- `package-lock.json` only if npm changes it solely for that script and no
  dependency; otherwise preserve its existing dirty state
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T1.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T1-handoff.md`

All shared tracking, requirements/design/tasks/status/understanding, T2+,
deployment, commits/pushes, providers/Pi, Spec 005/T16R5/T16/A-002, and
unrelated dirty files are excluded.

## Acceptance

- Dirty file-backed selected Passport exposes exactly one contextual
  `Unsaved changes` / `Save to source` strip.
- Header contains no competing source-save action and still exposes safe
  identity, sync/freshness, and permissions.
- Pending/success/cancel/conflict/permission/failure copy is textual and
  cannot contradict the session.
- Demo/snapshot has no canonical-write action.
- Existing confirmation and controller behavior remain the only save path.
- No new state machine, persistence, route, network, dependency, or duplicate
  responsive DOM.

## Required Verification

Run in order:

```text
npm run test:feature012
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git -c core.autocrlf=false diff --check over every owned file
```

Record exact commands, exit codes, summaries, and PASS/FAIL results. Return
exactly one stable terminal event:
`sancussight-012-T1-ready-20260724-01`, or one stable blocker/conflict/failure
event, directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. `ready-for-review` is only a
recommendation; do not mark T1 complete or advance shared tracking.
