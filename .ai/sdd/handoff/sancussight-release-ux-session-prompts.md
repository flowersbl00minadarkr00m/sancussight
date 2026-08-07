# User-Created Session Prompts: SancusSight Release UX

> Supporting control-plane artifact
> Prepared: 2026-07-24
> Source orchestrator thread: `019f94ff-4297-7ee3-a311-0a22b51ced44`

## Why manual creation is required

No callable top-level-session creation API is available in the originating
thread. The permitted Computer Use fallback explicitly prohibits automating
the ChatGPT or Codex UI. Subagents, hidden workers, reused sessions, and
implementation in the orchestrator are forbidden.

Create three separate visible top-level sessions and paste one prompt into each
session. Return the three visible session IDs to the source orchestrator.

## Session 1 — Feature 013 T1

Recommended host mapping: `gpt-5.6-sol`, medium reasoning effort.
Boundary: below `Sol High`; independent challenge not required.

```text
You are the fresh visible top-level orchestrated worker for SancusSight
Feature 013, Task T1: CMDB contracts, normalization, and refresh history.

Canonical project: C:\Users\henry\sancussight
Source orchestrator thread: 019f94ff-4297-7ee3-a311-0a22b51ced44
Tracking owner: orchestrator
Return transport: durable execution record

Before editing, read completely:
- .ai/sdd/specs/013-cmdb-builder/.status
- .ai/sdd/specs/013-cmdb-builder/requirements.md
- .ai/sdd/specs/013-cmdb-builder/design.md
- .ai/sdd/specs/013-cmdb-builder/tasks.md, exact Task T1
- .ai/sdd/handoff/sancussight-release-ux-sdd-brief.md
- .ai/steering/product.md
- .ai/steering/tech-stack.md
- .ai/steering/conventions.md

Confirm the task is on the frontier and restate its owned surfaces, tracking
owner, and durable return path. Before any implementation edit, append an
acknowledged event with a stable event_id to:
.ai/sdd/specs/013-cmdb-builder/execution/T1.md

Work only:
- packages/registry-compiler/src/cmdb/**
- packages/registry-compiler/src/contracts.ts
- packages/registry-compiler/src/refresh/**
- packages/registry-compiler/src/__tests__/cmdb-normalize*.test.ts
- append-preserving .ai/sdd/specs/013-cmdb-builder/execution/T1.md

Never edit tasks.md, .status, .ai/sdd/INDEX.md, or either shared handoff.
Preserve unrelated changes. Stop on blocker, contract conflict, verification
failure, or unavailable return path. Return ready-for-review only with every
changed file and exact commands, exit codes, and output summaries for:
npm run test:registry-compiler
npm run build:registry-compiler
git diff --check -- <owned surfaces>
```

## Session 2 — Feature 014 T1

Recommended host mapping: `gpt-5.6-terra`, medium reasoning effort.
Boundary: below `Sol High`; independent challenge not required.

```text
You are the fresh visible top-level orchestrated worker for SancusSight
Feature 014, Task T1: Declarative adapter setup profiles.

Canonical project: C:\Users\henry\sancussight
Source orchestrator thread: 019f94ff-4297-7ee3-a311-0a22b51ced44
Tracking owner: orchestrator
Return transport: durable execution record

Before editing, read completely:
- .ai/sdd/specs/014-guided-connection-center/.status
- .ai/sdd/specs/014-guided-connection-center/requirements.md
- .ai/sdd/specs/014-guided-connection-center/design.md
- .ai/sdd/specs/014-guided-connection-center/tasks.md, exact Task T1
- .ai/sdd/handoff/sancussight-release-ux-sdd-brief.md
- .ai/steering/product.md
- .ai/steering/tech-stack.md
- .ai/steering/conventions.md

Confirm the task is on the frontier and restate its owned surfaces, tracking
owner, and durable return path. Before any implementation edit, append an
acknowledged event with a stable event_id to:
.ai/sdd/specs/014-guided-connection-center/execution/T1.md

Work only:
- src/lib/evidence-catalog.ts
- src/types.ts
- collector/adapters/catalog.ts
- src/lib/__tests__/feature014-catalog.test.mjs
- append-preserving .ai/sdd/specs/014-guided-connection-center/execution/T1.md

Never edit tasks.md, .status, .ai/sdd/INDEX.md, or either shared handoff.
Preserve unrelated changes. Stop on blocker, contract conflict, verification
failure, or unavailable return path. Return ready-for-review only with every
changed file and exact commands, exit codes, and output summaries for:
node --test src/lib/__tests__/feature014-catalog.test.mjs
npm run build
git diff --check -- <owned surfaces>
```

## Session 3 — Feature 016 T1

Recommended host mapping: `gpt-5.6-sol`, medium reasoning effort.
Boundary: below `Sol High`; independent challenge not required.

```text
You are the fresh visible top-level orchestrated worker for SancusSight
Feature 016, Task T1: Windows credential store and non-secret config.

Canonical project: C:\Users\henry\sancussight
Source orchestrator thread: 019f94ff-4297-7ee3-a311-0a22b51ced44
Tracking owner: orchestrator
Return transport: durable execution record

Before editing, read completely:
- .ai/sdd/specs/016-byok-remediation-coach/.status
- .ai/sdd/specs/016-byok-remediation-coach/requirements.md
- .ai/sdd/specs/016-byok-remediation-coach/design.md
- .ai/sdd/specs/016-byok-remediation-coach/tasks.md, exact Task T1
- .ai/sdd/handoff/sancussight-release-ux-sdd-brief.md
- .ai/steering/product.md
- .ai/steering/tech-stack.md
- .ai/steering/conventions.md

Confirm the task is on the frontier and restate its owned surfaces, tracking
owner, and durable return path. Before any implementation edit, append an
acknowledged event with a stable event_id to:
.ai/sdd/specs/016-byok-remediation-coach/execution/T1.md

Work only:
- collector/byok/secret-store.ts
- collector/byok/windows-credential-store.ts
- collector/byok/windows-credential.ps1
- collector/byok/config-store.ts
- collector/byok/contracts.ts
- collector/__tests__/byok-secret*.test.ts
- append-preserving .ai/sdd/specs/016-byok-remediation-coach/execution/T1.md

Never edit tasks.md, .status, .ai/sdd/INDEX.md, or either shared handoff.
Preserve unrelated changes. Stop on blocker, contract conflict, verification
failure, or unavailable return path. Return ready-for-review only with every
changed file and exact commands, exit codes, and output summaries for:
BYOK secret-store unit tests
disposable Windows Credential Manager integration check
npm run test:collector
npm run build
git diff --check -- <owned surfaces>
```

