# SDD Handoff Brief: SancusSight Release UX

> Status: Approved
> Readiness: Ready for implementation
> Updated: 2026-07-24

## Metadata

- **Specs:** `013-cmdb-builder`, `014-guided-connection-center`,
  `015-scalable-portability-targets`, `016-byok-remediation-coach`
- **Current statuses:** all `tasks:approved`
- **Tracking owner:** visible top-level release UX orchestrator
- **Authorization:** operator blanket approval from requirements through review
- **Task explanation:** `artifacts/planning/sancussight-release-ux-task-microworld.html`
- **Shared handoff note:** `.ai/sdd/handoff/sdd-brief.md` remains owned by the
  concurrently active Feature 012 route and was not overwritten.

## Approved Outcomes

1. CMDB Builder extends the bounded registry compiler with normalization,
   optional field-level cited enrichment, location history, and a deterministic
   metadata index without moving upstream assets.
2. Connection Center replaces raw-path guesswork with mode-first setup
   profiles, non-persisting validation, explicit configuration, and truthful
   hosted/manual continuation.
3. Portability targets become typed, data-driven records with a compact
   summary and a maximum four-target comparison; legacy labels migrate without
   inferred provider/model facts.
4. BYOK Remediation Coach keeps secrets in Windows Credential Manager,
   previews exact bounded egress, and creates strictly validated proposed plans
   without executing or verifying remediation.

## Authority Sources

| Feature | Requirements | Design | Tasks | Status |
|---|---|---|---|---|
| 013 | `.ai/sdd/specs/013-cmdb-builder/requirements.md` | `.ai/sdd/specs/013-cmdb-builder/design.md` | `.ai/sdd/specs/013-cmdb-builder/tasks.md` | `.ai/sdd/specs/013-cmdb-builder/.status` |
| 014 | `.ai/sdd/specs/014-guided-connection-center/requirements.md` | `.ai/sdd/specs/014-guided-connection-center/design.md` | `.ai/sdd/specs/014-guided-connection-center/tasks.md` | `.ai/sdd/specs/014-guided-connection-center/.status` |
| 015 | `.ai/sdd/specs/015-scalable-portability-targets/requirements.md` | `.ai/sdd/specs/015-scalable-portability-targets/design.md` | `.ai/sdd/specs/015-scalable-portability-targets/tasks.md` | `.ai/sdd/specs/015-scalable-portability-targets/.status` |
| 016 | `.ai/sdd/specs/016-byok-remediation-coach/requirements.md` | `.ai/sdd/specs/016-byok-remediation-coach/design.md` | `.ai/sdd/specs/016-byok-remediation-coach/tasks.md` | `.ai/sdd/specs/016-byok-remediation-coach/.status` |

## Implementation Frontier and Order

Initial independent frontier:

- `013-T1` CMDB contracts, normalization, and refresh history.
- `014-T1` declarative adapter setup profiles.
- `016-T1` Windows credential store and non-secret config.

Authoritative dependency routes:

```text
013-T1 -> {013-T2, 013-T3} -> 013-T4 -> 015-T1 -> 015-T2 -> 015-T3 -> 015-T4
014-T1 -> 014-T2 -> 014-T3 -> 014-T4
016-T1 -> [014-T2 + 016-T1] -> 016-T2 -> 016-T3 -> 016-T4 -> 016-T5
```

## Orchestration Contract

- `tracking_owner: orchestrator` for every ticket.
- Every implementation ticket and rollover requires a newly created visible
  top-level session; no subagents, nested workers, reused sessions, or
  orchestrator implementation.
- Workers edit only owned surfaces plus append-preserving
  `execution/<task-id>.md`.
- The orchestrator alone updates `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, and
  shared handoffs after fresh reconciliation.
- A worker must durably acknowledge before editing and return
  `ready-for-review` with changed files and exact command/exit/output evidence.
- Sol High or equivalent host mapping requires an independent challenge from a
  separate fresh visible top-level session before dispatch.

## Verification Baseline

```text
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check -- <owned surfaces>
```

Ticket-specific browser, Windows Credential Manager, migration, atomic-output,
network, security, and accessibility evidence is defined in each `tasks.md`.

## Boundaries

- No work on Spec 005 release recovery or Feature 007 npm publication.
- No upstream producer execution, source-file relocation, autonomous
  remediation, hosted credential custody, or unbounded data egress.
- No deployment is authorized by these implementation tickets unless a later
  approved task explicitly adds it.

