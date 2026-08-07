# Feature 010 R1 Fresh Visible Review Prompt

You are a fresh visible top-level independent reviewer for the complete
approved SancusSight Feature 010 scope.

## Authority and Mode

- Review mode: independent, read-only product/deployment inspection
- Canonical project: `C:\Users\henry\sancussight`
- Tracking owner: `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `implementation:done`
- Review pass: `R1` comprehensive reset-free first pass
- Shared tracking, `.status`, INDEX, sdd-brief, and understanding are
  orchestrator-only.

Fully read applicable `AGENTS.md`, `sdd-review`, steering, Feature 010
requirements/design/tasks/understanding, every T1–T6 execution/handoff/browser/
hosted report, current implementation/tests, current dirty tree, and the exact
deployment identity before review.

Before review execution, durably append and directly return:

```yaml
event:
  event_id: sancussight-010-R1-acknowledged-20260724-01
  task_id: R1
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level R1 reviewer acknowledged the full approved Feature 010 review scope, both mandatory axes, exact evidence ownership, required verification, production identity, tracking-owner boundary, and all exclusions before review execution.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/handoff/feature010-r1-review-prompt.md
      - .ai/sdd/specs/010-asset-versioning-evidence-packets/tasks.md#R1
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or fallback>
```

## Exact Owned Surfaces

- read-only requirements/design/tasks/understanding/product/test/evidence/
  deployment inspection
- new
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/review-r1.md`
- worker-owned
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/R1.md`
- worker-owned
  `.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/R1-handoff.md`

No product, test, package, lockfile, deployment, prior evidence, shared
tracking, commit, push, provider, Pi, Spec 005/T16R5/T16/A-002, or release
operation may change.

## Mandatory Review Axes

### Spec

- Review every Must Have and NFR, acceptance criterion, design decision, task,
  and Planned/As Built claim.
- Adversarially inspect version identity/equivalence, check-only transitions,
  alias collision/move/removal, 50-entry retention, versionless schema2
  compatibility, compiler preservation/missing assets/portable sanitization,
  packet exact shape/digest/tamper/privacy, Exit Drill projection, UI state,
  focus/responsive behavior, and exact deployed identity.
- Identify missing, partial, divergent, overclaimed, or unapproved behavior.

### Standards

- Review correctness, privacy/security, accessibility, error/empty/pending
  states, performance, maintainability, tests, evidence discipline, and project
  conventions.
- Explicitly assess what can be removed or consolidated, whether new concepts
  extend existing mechanisms, unsupported abstraction or speculative
  generality, and unjustified user/maintainer decision burden.
- Inspect the T5 date-only normalization for strictness and cross-runtime
  determinism.

Record only high-signal findings with stable IDs `R1-SPEC-*` or
`R1-STANDARDS-*`, severity, blocking state, exact evidence, affected contract,
and suggested bounded fix. Do not implement fixes.

## Verification

```text
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
vercel inspect https://sancussight.vercel.app --scope hflowers45-9370s-projects
vercel inspect dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V --scope hflowers45-9370s-projects
```

Return exactly one stable terminal event
`sancussight-010-R1-findings-20260724-01` or one stable blocker/failure event.
The review verdict and authoritative tracking reconciliation remain with the
orchestrator.
