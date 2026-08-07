# T15 Fresh-Task Continuation Dispatch

> Orchestrated-worker handoff. Authority remains in the approved Spec 005 artifacts.

## Routing

- Source thread ID: `019f86c3-a80c-7380-a59d-b9411a70a739`
- Canonical project: `C:/Users/henry/sancussight`
- Mode: `orchestrated-worker`
- Session policy: newly created visible top-level Chat; never use a subagent, nested worker, or reused task
- Model: `gpt-5.6-terra`
- Reasoning effort: `high`
- Tracking owner: source Orchestrator only
- Worker return: append-preserve `execution/T15.md`, replace/update `execution/T15-handoff.md`, then report `ready-for-review` to the source thread

## Mission

Continue approved Spec 005 A-002 Task T15 from its recorded `verification-failed` state. The UI implementation already exists and builds. Add the smallest verification-only fixture or harness needed to exercise complete, missing-target, and stale-target A-002 states in a real browser, then perform the full T15 verification matrix.

The operator explicitly authorized this bounded fixture/harness on 2026-07-21. It must not create a production fixture route, weaken release qualification, add a runtime bypass, or modify T13/T14 contracts.

## Required reading before acknowledgment

1. `AGENTS.md`
2. the installed `sdd-exec` skill, using `orchestrated-worker` mode
3. `skills/sdd-orchestrate/references/handoff-contract.md`, `event-protocol.md`, and `task-lifecycle.md`
4. `.ai/steering/product.md`, `tech-stack.md`, and `conventions.md`
5. `.ai/sdd/specs/005-operational-evidence-producers/.status`
6. approved `requirements.md`, design Section 19, and Task T15 in `tasks.md`
7. `execution/T15.md`, `execution/T15-handoff.md`, and the master context
8. current T15-owned implementation surfaces
9. the installed Playwright skill

## Exact owned surfaces

- `src/components/ReleaseEvidence.tsx`
- narrowly necessary `src/components/ReleaseProgressPanel.tsx`
- `src/index.css`
- one bounded verification-only T15 fixture/harness under `scripts/` or `collector/__tests__/fixtures/`
- `output/playwright/spec005-a002-t15-*`
- `execution/T15.md`
- `execution/T15-handoff.md`

Do not edit `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, either shared handoff, T13/T14 code contracts, or T16 surfaces.

## Required verification

- `npm run test:collector`
- `npm run verify:core`
- `npm run build`
- Playwright desktop and 390x844 checks for complete, missing-target, stale-target, hosted/manual, keyboard focus, reduced motion, console, network, and horizontal overflow
- screenshots matching `output/playwright/spec005-a002-t15-*`
- demonstrate that progress never implies target qualification and recovery copy never suggests timestamp touching, copying artifacts, or historical reuse

## Return contract

First deliver a stable `acknowledged` lifecycle event to source thread `019f86c3-a80c-7380-a59d-b9411a70a739` or durably record fallback delivery in `execution/T15.md`. On success, return `ready-for-review` with every changed file, exact command, exit code, output summary, acceptance mapping, and an As Built comparison. On conflict or failure, return the exact fail-closed event. A worker recommendation is not authoritative completion.
