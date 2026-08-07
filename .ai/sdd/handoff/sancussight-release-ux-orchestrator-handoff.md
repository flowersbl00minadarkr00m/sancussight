# SancusSight Release UX Orchestrator Handoff

> Artifact role: Durable control-plane update for the visible top-level
> SancusSight orchestrator
> Authority: Supporting evidence only; exact `.status` and approved artifacts
> remain authoritative
> Prepared: 2026-07-24
> Canonical project: `C:/Users/henry/sancussight`

## Operator authorization

The operator explicitly requested:

> Begin creating specs and let orchestrator know to push through from
> requirements to review with blanket approval.

Treat this as blanket human approval for ordinary SDD progression of Features
013–016, including requirements, design, tasks, implementation, and review,
provided each stage:

- preserves its exact `.status` transition;
- completes the required intent replay or understanding evidence;
- records and resolves source conflicts before advancement;
- offers optional design and task HTML at the required draft moments;
- uses newly created visible top-level implementation sessions;
- never uses subagents, hidden workers, or the orchestrator session as an
  implementation worker;
- obtains any separately required high-tier challenge;
- reconciles fresh verification before task completion or review; and
- does not broaden authority into Spec 005 release recovery, package
  publication, deployment, upstream producer execution, or secret exposure.

Optional HTML acceptance and UI-image acceptance remain separate human
decisions. Blanket stage approval does not accept those optional artifacts.

## Feature set

1. `013-cmdb-builder`
   - Extend Feature 007 compiler proposals with normalization, field-level
     enrichment, a labelled canonical metadata index, and location history.
   - Do not move or duplicate upstream assets.
2. `014-guided-connection-center`
   - Make hosted/manual versus local collector behavior explicit.
   - Guide each producer from prerequisites through bounded artifact
     validation and connected health.
3. `015-scalable-portability-targets`
   - Separate execution surface, provider, model, protocol, and local runtime.
   - Replace permanent target columns with summary plus a bounded comparison.
4. `016-byok-remediation-coach`
   - Use local OS-protected BYOK credentials and explicit payload disclosure
     to create proposed remediation plans.
   - Do not execute remediation or treat model output as evidence.

## Tracking ownership

Use `tracking_owner: orchestrator` for every implementation task. Only the
orchestrator may write:

- `tasks.md`;
- `.status`;
- `.ai/sdd/INDEX.md`; and
- `.ai/sdd/handoff/sdd-brief.md`.

Workers may edit only their approved non-overlapping owned surfaces and append
their own `execution/<task-id>.md`.

## Current gate

Requirements were replayed and approved under the recorded blanket
authorization. Features 013–016 are now at `design:draft` with binding design
and planned-understanding records:

- `.ai/sdd/specs/013-cmdb-builder/design.md`
- `.ai/sdd/specs/014-guided-connection-center/design.md`
- `.ai/sdd/specs/015-scalable-portability-targets/design.md`
- `.ai/sdd/specs/016-byok-remediation-coach/design.md`

The operator declined design HTML. All four designs were approved under the
blanket authorization and Features 013–016 are now at `tasks:draft`.

Task sources:

- `.ai/sdd/specs/013-cmdb-builder/tasks.md`
- `.ai/sdd/specs/014-guided-connection-center/tasks.md`
- `.ai/sdd/specs/015-scalable-portability-targets/tasks.md`
- `.ai/sdd/specs/016-byok-remediation-coach/tasks.md`

The operator inspected and approved the task microworld. Features 013–016 are
at `tasks:approved`; implementation orchestration is authorized under the
blanket approval. Cross-feature serialization is authoritative in the task
blockers: Feature 013 T4 precedes Feature 015 T1, and Feature 014 T2 precedes
Feature 016 T2.

The implementation contract is:
`.ai/sdd/handoff/sancussight-release-ux-sdd-brief.md`.

## Session creation state

The current host exposes no top-level creation API. Computer Use cannot be
used because its mandatory safety contract prohibits automating ChatGPT/Codex
UI. Durable user-created-session prompts are ready at
`.ai/sdd/handoff/sancussight-release-ux-session-prompts.md`.

Until three distinct visible session IDs and durable acknowledgments exist,
keep every feature at `tasks:approved`; no implementation dispatch or
`implementation:in-progress` claim is authorized.

## Return-channel note

No supported direct top-level-session messaging API was available from the
originating session. This file is the durable fallback. The orchestrator must
acknowledge this handoff in its own control-plane record before relying on it.
