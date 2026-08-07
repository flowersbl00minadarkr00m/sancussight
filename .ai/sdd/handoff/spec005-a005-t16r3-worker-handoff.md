# Spec 005 T16R3 Worker Handoff

```yaml
handoff:
  feature_id: 005-operational-evidence-producers
  task_id: T16R3
  execution_role: worker
  execution_mode: orchestrated-worker
  tracking_owner: orchestrator
  current_status: implementation:in-progress
  authoritative_sources:
    status: .ai/sdd/specs/005-operational-evidence-producers/.status
    requirements: .ai/sdd/specs/005-operational-evidence-producers/requirements.md
    design: .ai/sdd/specs/005-operational-evidence-producers/design.md
    tasks: .ai/sdd/specs/005-operational-evidence-producers/tasks.md
    task_section: tasks.md#task-t16r3-check-in-the-pre-token-and-local-readiness-controls
    review: .ai/sdd/specs/005-operational-evidence-producers/review.md
  covers:
    - A-005 Section 22.2
    - A-005 Section 22.8
    - TD-013
  blocked_by:
    - A-005 design approved
    - T16R3 tasks approved
    - challenge spec005-t16r3-implementation-readiness-challenge-20260723-root-01 AFFIRM and reconciled
  owned_surfaces:
    - scripts/invoke-spec005-t16-pretoken.ps1
    - scripts/verify-spec005-t16-local-readiness.ps1
    - scripts/test-spec005-t16-pretoken.ps1
    - scripts/test-spec005-t16-local-readiness.ps1
    - operations/README.md
    - .ai/sdd/specs/005-operational-evidence-producers/execution/T16R3.md
    - .ai/sdd/specs/005-operational-evidence-producers/execution/T16R3-handoff.md
  out_of_scope:
    - real Claude, Codex, or Pi invocation
    - provider canary or authentication
    - release token/run, matrix, producer capture, bundle, current-release, or Playwright
    - T16R4-T16R7 surfaces
    - requirements, design, tasks, .status, INDEX, shared handoffs, or historical evidence
  model_class: deep
  host_model: gpt-5.6-sol
  effort: high
  session_policy: new-top-level-required
```

## Required implementation boundary

Implement the exact approved T16R3 work and every challenge-required check.
Use fake provider shims only. The launcher must be Windows PowerShell
5.1-compatible, provider-specific, fixed-argument, fail-closed, and
privacy-safe. Local readiness may inspect only non-secret prerequisites and
must not execute or probe through providers.

Before editing, deliver a stable `acknowledged` event to source thread
`019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` with positive receipt evidence. Then
deliver `started`. Stop and return `blocked`, `contract-conflict`, or
`verification-failed` on the first applicable terminal condition.

Return `ready-for-review` with every changed file, each exact command, exit
code, bounded result summary, privacy/no-provider/no-release confirmation, and
positive source-thread receipt. Append-preserve `execution/T16R3.md` and write
`execution/T16R3-handoff.md`. Orchestrator alone reconciles completion.
