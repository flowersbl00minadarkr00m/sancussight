# Spec 005 T16R4 Worker Handoff

```yaml
handoff:
  feature_id: 005-operational-evidence-producers
  task_id: T16R4
  execution_role: worker
  execution_mode: orchestrated-worker
  tracking_owner: orchestrator
  current_status: implementation:in-progress
  authoritative_sources:
    status: .ai/sdd/specs/005-operational-evidence-producers/.status
    requirements: .ai/sdd/specs/005-operational-evidence-producers/requirements.md
    design: .ai/sdd/specs/005-operational-evidence-producers/design.md
    tasks: .ai/sdd/specs/005-operational-evidence-producers/tasks.md
    task_section: tasks.md#task-t16r4-establish-one-immutable-release-run-identity
    correction: .ai/sdd/handoff/spec005-a005-t16r4-task-correction.md
  blocked_by:
    - T16R3 complete
    - corrected T16R4 contract explicitly approved
    - challenge spec005-t16r4-corrected-readiness-challenge-20260723-001 AFFIRM and reconciled
  owned_surfaces:
    - contracts/release-run-descriptor-v1.schema.json
    - src/lib/release-run-descriptor.ts
    - collector/__tests__/release-run-descriptor.test.ts
    - scripts/new-spec005-t16-release-descriptor.ps1
    - scripts/test-spec005-t16-release-descriptor.ps1
    - scripts/run-spec005-t10-failure-matrix.ts
    - operations/telemetry/otlp-bridge.ts
    - operations/telemetry/pi-extension.ts
    - operations/manifests/release-run.example.json
    - .ai/sdd/specs/005-operational-evidence-producers/execution/T16R4.md
    - .ai/sdd/specs/005-operational-evidence-producers/execution/T16R4-handoff.md
  out_of_scope:
    - provider or canary invocation
    - operational token/run or failure matrix
    - Praxen, selection, builder, Pipelock, UI, current-release, or Playwright
    - requirements, design, tasks, status, INDEX, shared handoffs, historical evidence
  model_class: deep
  host_model: gpt-5.6-sol
  effort: high
  session_policy: new-top-level-required
```

## Required boundary

Implement only the corrected T16R4 ticket. The provider-free creator writes
exactly one canonical
`%LOCALAPPDATA%\SancusSight\operations\runs\<releaseRunId>\release-run.json`
using atomic non-overwriting creation. Strictly validate the five allowed
fields, version/purpose/token/root/UTC/target/BOM rules, and refuse rewrite or
legacy-manifest substitution.

Migrate only the failure matrix, OTLP bridge, and Pi extension. OTLP exposes
descriptor identity before listen; Pi exposes it before handler registration
or emission; each binds its first descriptor and refuses rebind. Use fake Pi
and isolated loopback/temp-LOCALAPPDATA fixtures only. Conflicting environment,
matrix/filesystem/import time, malformed, boundary, wrong-target, rewrite, and
reused-process cases must fail closed without qualifying output.

Before editing, deliver `acknowledged` to source thread
`019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` with positive receipt evidence. Return
stable `blocked`, `contract-conflict`, or `verification-failed` immediately
when applicable. Return `ready-for-review` with every changed file and exact
command/exit/result, plus no-provider/no-release confirmation. Append-preserve
`execution/T16R4.md` and write `execution/T16R4-handoff.md`. Orchestrator alone
reconciles completion.
