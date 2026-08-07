# Spec 005 Understanding Record

## As Built — T16R output-contract remediation

```yaml
stage: exec
requested_output: as-built
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: mixed
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: The correction crosses model-authored staging, raw-byte validation, pinned Praxen conversion, and fail-closed release behavior.
  downgrade_decision: null
evidence_mode: local-markdown
confirmation_state: pending
source_paths:
  - .ai/sdd/specs/005-operational-evidence-producers/.status
  - .ai/sdd/specs/005-operational-evidence-producers/requirements.md
  - .ai/sdd/specs/005-operational-evidence-producers/design.md
  - .ai/sdd/specs/005-operational-evidence-producers/tasks.md
  - .ai/sdd/handoff/spec005-a003-t16r-output-contract-remediation.md
  - .ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md
  - scripts/run-spec005-praxen-behavior-verifier.ps1
  - scripts/test-spec005-claude-haiku.ps1
  - scripts/test-spec005-praxen-boundary.ps1
```

### Mental model

`[planned; deterministic-rule; design.md §20.2]` Haiku is a staging-only author. The runner owns the boundary; the pinned Praxen converter alone creates canonical findings; the pinned renderer alone creates official HTML/TXT; the adapter consumes only a runner-created current-run binding.

`[observed; supporting-evidence; artifacts/qa/spec005/a002-t16-spec005-a002-t16-20260723064030-verification-failed.md]` The authorized A-002 run failed closed because the fresh Step 9.9 draft did not contain the required parser-grade header. The previous validator accepted the header on any later line because it used a multiline match.

`[implemented; supporting-evidence; scripts/run-spec005-praxen-behavior-verifier.ps1]` The runner now requires the literal `# Praxen draft manifest` at byte zero and checks raw bytes without trimming, decoding normalization, or header synthesis. Only EOF, LF, or CRLF may follow the exact header.

`[implemented; supporting-evidence; scripts/run-spec005-praxen-behavior-verifier.ps1]` The Haiku prompt states the same first-byte/first-line contract and forbids BOM, leading whitespace, leading prose, Markdown fences, JSON, and other official-looking reports.

### Execution order and invariants

1. `[verified; supporting-evidence; scripts/test-spec005-claude-haiku.ps1, exit 0]` The plan-only invocation carries the literal header and first-line/no-fence/no-leading-prose wording.
2. `[verified; supporting-evidence; scripts/test-spec005-praxen-boundary.ps1, exit 0]` A valid draft still reaches the real pinned converter and renderer.
3. `[verified; supporting-evidence; scripts/test-spec005-praxen-boundary.ps1, exit 0]` Missing-header and leading-prose/fenced-header drafts fail at `staging-validation`, require operator action, and produce no converter, canonical, rendered, or operational output.
4. `[verified; supporting-evidence; scripts/test-spec005-praxen-boundary.ps1, exit 0]` Existing malformed, stale, wrong-target, model-JSON, renderer, partial, deterministic-replay, and no-bundle cases remain covered.

The key invariant is that no malformed model draft can reach the pinned converter. A staging failure remains non-release-eligible and cannot promote a bundle.

### Edge cases and trade-offs

`[verified; supporting-evidence; scripts/test-spec005-praxen-boundary.ps1, exit 0]` A header later in the document, preceded by prose or a Markdown fence, is rejected rather than normalized.

`[inferred; supporting-evidence; design.md §20.4]` Strict byte-zero validation may reject a semantically usable draft, but that is the required safety trade-off: silently repairing or synthesizing the header would make the model output contract less observable and weaken provenance.

`[verified; supporting-evidence; T16 execution records and current-release manifest inspection]` No A-002 run, provider invocation, release bundle, current-release update, or Playwright release acceptance occurred. The current release remains historical `spec005-t10-20260718e`.

### Fresh verification

All checks below were independently rerun by the orchestrator on 2026-07-23 and exited `0` unless noted:

- `[verified]` `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1` — prompt and Haiku plan safeguards passed.
- `[verified]` `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1` — positive pipeline, negative staging cases, partial pause, and no-bundle promotion passed.
- `[verified]` `node --test collector/__tests__/operational-adapters.test.ts` — 6/6 passed.
- `[verified]` `npm run test:collector` — 85/85 passed.
- `[verified]` `npm run verify:core` — passed.
- `[verified]` `npm run build` — collector/frontend TypeScript and Vite build passed.
- `[verified]` `npm audit --audit-level=high` — 0 vulnerabilities.
- `[verified]` `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-operations.ps1` — passed.
- `[verified]` `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/verify-governance.ps1` — passed.
- `[verified]` `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-rampart-export.ps1` — passed.
- `[verified]` `git diff --check` — exit 0; only unrelated pre-existing line-ending warnings were emitted.

### Reconciliation

`[verified; supporting-evidence; approved design A-003 and Task T16R]` The implementation is inside the approved T16R surfaces and tightens, rather than changes, the existing staging contract. No requirements, design, or task divergence was observed.

`[blocked; supporting-evidence; execution/T16.md and release reconciliation]` T16/A-002 remains incomplete and requires separate explicit release authorization for any future operational attempt.

## Planned — Draft A-004 runner-owned Praxen structure

```yaml
stage: spec
requested_output: planned
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: opaque
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: The change moves parser structure ownership across the model, PowerShell runner, pinned Praxen converter, and release fail-closed boundary.
evidence_mode: local-markdown
confirmation_state: pending
source_paths:
  - .ai/sdd/specs/005-operational-evidence-producers/.status
  - .ai/sdd/specs/005-operational-evidence-producers/requirements.md
  - .ai/sdd/specs/005-operational-evidence-producers/design.md
  - .ai/sdd/specs/005-operational-evidence-producers/tasks.md
  - .ai/sdd/specs/005-operational-evidence-producers/execution/T16.md
  - artifacts/qa/spec005/a002-t16-spec005-a002-t16-20260723191340-verification-failed.md
  - scripts/run-spec005-praxen-behavior-verifier.ps1
```

### Planned mental model

`[observed; supporting-evidence; T16 verification-failed artifact]` The
runner's byte-zero gate worked, but a fresh model draft added unsupported
`## Target`; the pinned converter rejected it and the wrapper paused safely.

`[planned; human-decision; operator direction relayed 2026-07-23]` Reopen the
owning design gate and replace prompt-owned parser structure with a
runner-owned, version-pinned draft profile and skeleton.

`[planned; deterministic-rule; design.md §21]` The model remains the author of
analysis values and variable rule/finding blocks. The runner owns and validates
the exact heading/slot structure. The unchanged pinned converter owns fields,
types, schema, derived values, and canonical JSON; the unchanged renderer owns
official HTML/TXT.

### Planned fail-closed flow

1. Runner pins Praxen/profile/skeleton and writes immutable guidance into the
   fresh staging directory.
2. Haiku writes one final markdown draft using only the declared slots and
   dynamic block anchors.
3. Runner rejects extra, missing, duplicate, reordered, placeholder-bearing,
   fenced, tabbed, or structurally invalid output before Python.
4. The pinned converter validates fields/schema and creates canonical JSON.
5. The pinned renderer and existing binding/gate path run only after both
   earlier boundaries pass.

### Visualization offer

```yaml
visualization_offer:
  stage: design
  source_revision: 2026-07-23-a004-draft-1
  recommended: yes
  recommendation_reason: The model/runner/converter ownership transfer is cross-boundary and easier to inspect as a flow and trust-boundary explainer.
  state: declined
  adapter: visualize-sdd
  mode: design-explainer
  output_path: null
  screenshot_paths: []
  ui_image_offer: not-applicable
  ui_mockup_paths: []
  decision_source: User previously directed that no HTML is required for this remediation sequence.
```

### Gate state

`[blocked; deterministic-rule; .status]` The feature is `design:draft`.
Implementation, task dispatch, and another A-002 token remain blocked until
the design and subsequent task update receive explicit approval.

## Task readiness — Draft T16R2

```yaml
stage: tasks
requested_output: readiness
current_status: tasks:draft
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: opaque
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
readiness:
  requirements_covered: pass
  design_approved: pass
  task_dependencies: pass
  owned_surfaces: pass
  verification_known: pass
  high_tier_second_opinion: pending
  implementation_authorized: false
```

`[human-decision; operator message 2026-07-23]` Amendment A-004 is explicitly
approved. The design header and gate were promoted before this task draft was
created.

`[planned; tasks.md Task T16R2]` One bounded remediation ticket owns only the
profile/skeleton, runner, focused regressions, operations documentation, and
its execution records. The installed Praxen tools, wrapper, collector, gate,
builder, shared tracking, historical evidence, and release state remain
read-only.

`[blocked; deterministic-rule; tasks.md routing]` Sol High implementation
requires a fresh independent visible read-only challenge after task approval.
Another operational T16/A-002 token remains separately blocked even after
T16R2 completes.

### Task visualization offer

```yaml
visualization_offer:
  stage: tasks
  source_revision: 2026-07-23-a004-t16r2-draft-1
  recommended: yes
  recommendation_reason: The ticket has a cross-boundary model/runner/converter flow and many negative structural cases.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  output_path: null
  screenshot_paths: []
  ui_image_offer: not-applicable
  ui_mockup_paths: []
  decision_source: User previously directed that no HTML is required for this remediation sequence.
```

`[blocked; deterministic-rule; .status]` The feature is `tasks:draft`.
T16R2 cannot dispatch until explicit task approval; T16 cannot retry until
T16R2 is complete and a separate fresh release-run authorization is recorded.

## Task approval — T16R2

`[human-decision; operator message 2026-07-23]` The T16R2 task draft is
explicitly approved. The tasks header, `.status`, SDD index, and downstream
handoff were promoted to the approved task gate.

`[blocked; deterministic-rule; tasks.md routing]` T16R2 is the approved
frontier but cannot dispatch until its fresh independent high-tier challenge is
reconciled. T16/A-002 remains separately unauthorized.

## T16R2 challenge reconciliation

`[verified; supporting-evidence; challenge event
spec005-t16r2-implementation-readiness-challenge-20260723-root-01]` Fresh
visible thread `019f9083-5d88-77f1-a12b-c76571d8e203` returned `AFFIRM` with
no file, provider, token/run, test, or release mutation.

`[planned; deterministic-rule; tasks.md Task T16R2]` PowerShell validates only
the pinned structure, hierarchy/order, dynamic-heading placement, forbidden
sentinels, and dual profile/skeleton hash/version linkage. Field names,
presence, indentation, coercion, schema shape, and derived values remain
converter-owned.

`[implemented; deterministic-rule; .status]` The feature is
`implementation:in-progress`; T16R2 may dispatch in one new visible Sol High
worker. T16/A-002 remains separately unauthorized.

## T16R2 completion reconciliation

`[verified; supporting-evidence; execution/T16R2.md and fresh Orchestrator
verification 2026-07-23]` Fresh visible worker
`019f9089-fe9c-7711-8191-4fa1cc33c063` changed only the eight approved
surfaces. The runner now pins profile SHA-256
`01eb87c32517c664bc607a076279094a4ab9ac2665f62afbe75ab86c69ddc7a0` and
skeleton SHA-256
`2e9e5be48dc559dda798992494f03e2ea0db029ba708e9ca042f03a33b6073df`
to Praxen `1.1.0` and manifest format `1`.

`[verified; supporting-evidence; scripts/test-spec005-praxen-boundary.ps1,
exit 0]` Seventeen labelled structural failures stop at
`staging-structure-validation` before any pinned Python invocation. Four
field/type/indentation failures pass PowerShell structure validation and fail
in the unchanged pinned converter. The positive path uses the real pinned
converter and renderer, and the wrapper remains partial, paused,
operator-action-required, non-release-eligible, and unable to promote a
bundle after a target failure.

`[verified; supporting-evidence; fresh Orchestrator commands 2026-07-23]`
Focused Haiku and boundary suites, adapter tests `6/6`, collector tests
`85/85`, core verification, build, high-severity audit, operations,
governance, RAMPART, labelled partial-builder refusal, and `git diff --check`
all passed. Review found no duplicated field/schema parser and no unjustified
decision burden.

`[blocked; deterministic-rule; tasks.md Task T16]` T16R2 is complete.
SancusSight remains not ready for release; a new T16/A-002 operational token
requires separate explicit operator authorization and a fresh reconciled
high-tier challenge.

## Post-T16R2 T16 authorization result

`[human-decision; operator message 2026-07-23]` The operator authorized exactly
one fresh T16/A-002 attempt after T16R2. Fresh independent challenge
`spec005-t16-a002-post-t16r2-release-retry-challenge-20260723-root-02`
returned `AFFIRM`.

`[observed; supporting-evidence; execution/T16.md event
spec005-t16-a002-post-t16r2-blocked-pretoken-get-command-wrapper-20260723-sol-high-01]`
The fresh worker passed preflight but its PowerShell provider-resolution
reporting wrapper failed to parse before any `Get-Command` invocation.
Therefore no provider canary, token, run, matrix, producer, bundle,
current-release mutation, or Playwright acceptance occurred.

`[blocked; deterministic-rule; one-run authorization]` The one-shot authority
is spent by the pre-token terminal failure. T16 remains incomplete and
SancusSight remains not ready for release. Any future attempt requires new
explicit operator authorization and a new visible top-level worker.

## Predictive R2 review and draft A-005

`[human-decision; operator message 2026-07-23]` The operator requested that the
pre-token wrapper failure be fixed and that a specialized reviewer inspect the
application for defects likely to fail later release tests.

`[verified; supporting-evidence; review.md R2 comprehensive reset]` A
read-only specialist review and local corroboration found eight confirmed
release-path blockers. Most critically, the Praxen runner emits `t16r2-v1`
while the adapter and its fixture accept only `t16r-v1`, so isolated tests pass
while real T16R2 output would be rejected. Other blockers cover workspace-path
privacy, remediation-only wrapper semantics, release-artifact ownership,
authoritative start time, split data roots, and non-atomic promotion.

`[verified; supporting-evidence; PowerShell parser and focused tests]` The
immediate wrapper defect reproduces as `EmptyPipeElement` for a pipeline
attached directly to a `foreach` statement. Assigning the loop output first and
piping the assigned collection parses correctly. The existing adapter tests
still pass `6/6`, the focused Praxen boundary suite exits `0`, and all checked-in
PowerShell files parse under Windows PowerShell 5.1, confirming that the
ephemeral launcher was outside the tested product path.

`[planned; deterministic-rule; design.md amendment A-005]` The proposed fix is
a checked-in and regression-tested pre-token launcher plus an immutable run
descriptor, current Praxen adapter/privacy compatibility, explicit operational
wrapper mode, canonical data-root and T16 artifact ownership, bundle-first
atomic promotion, bounded Pipelock launch, fresh-process runtime identity
checks, local readiness checks, and deterministic T16 desktop/mobile
acceptance.

`[blocked; authority-plane; .status]` The feature is now `design:draft`.
Implementation, task dispatch, and another A-002 authorization remain blocked
until A-005 receives explicit design approval and its remediation tasks are
separately drafted and approved.

### Visualization offer

```yaml
stage: design
source_revision: a005-2026-07-23-r1
recommended: false
state: declined
output: none
decision_source: The operator previously stated that no HTML was required for this remediation sequence.
```

## A-005 approval and remediation task draft

`[human-decision; operator message 2026-07-23]` The operator explicitly
approved design amendment A-005.

`[planned; authority-plane; design.md Section 22]` A-005 is approved and the
feature advanced through `design:approved`. The approved correction retains
all A-002 privacy, trust, timing, target-completeness, and fail-closed
requirements.

`[planned; authority-plane; tasks.md T16R3-T16R7]` Five bounded remediation
tickets now cover fixed pre-token/local-readiness controls, immutable release
identity, Praxen operational compatibility/privacy, owned atomic bundle
promotion, and Pipelock/UI acceptance. T16R3 and T16R4 form the parallel
frontier after approval; all five must complete before T16 can be challenged
or authorized again.

`[blocked; authority-plane; .status]` The feature is `tasks:draft`.
Implementation and operational A-002 execution remain unauthorized pending
explicit approval of T16R3-T16R7.

`[human-decision; operator message 2026-07-23]` The operator explicitly
approved remediation tasks T16R3-T16R7.

`[planned; authority-plane; .status and tasks.md]` The feature advanced to
`tasks:approved`. T16R3 and T16R4 are the implementation frontier, each
challenge-gated before a fresh visible worker. T16/A-002 remains unauthorized.

## T16R3 completion reconciliation

`[verified; supporting-evidence; review.md R3 and fresh Orchestrator checks]`
T16R3 is complete after one review-discovered false-green was corrected.
Omitted `ProjectRoot` is derived from `PSCommandPath` after binding in both
entrypoints, and non-project-cwd regressions now protect the documented
production default.

`[verified; supporting-evidence; fresh Orchestrator commands 2026-07-23]`
Both focused suites, the 25-file Windows PowerShell 5.1 parse sweep, operations
verification, and diff hygiene pass. No real provider, canary, token/run,
matrix, bundle/current-release, or Playwright action occurred.

`[observed; supporting-evidence; production PlanOnly]` The host exposes two
distinct Codex executables. The launcher correctly fails closed with
`PRETOKEN_COMMAND_AMBIGUOUS` before invocation. This remains an operational
pre-token follow-up and does not weaken T16R3 completion.

## T16R4 corrected task approval

`[human-decision; operator message 2026-07-23]` The operator explicitly
approved the bounded T16R4 task correction after challenge
`spec005-t16r4-readiness-challenge-20260723-001`.

`[planned; authority-plane; tasks.md Task T16R4]` T16R4 now owns a fixed
provider-free create-once descriptor command and narrows migration to the
failure matrix, OTLP bridge, and Pi extension. Praxen/selection, builder, and
acceptance remain exclusively owned by T16R5-T16R7. A fresh independent
challenge remains required before dispatch.
