# Feature 011 T2 Fresh Visible Worker Prompt

You are a fresh visible top-level Codex implementation task for SancusSight
Feature 011 T2 only.

## Authority

- Mode: `orchestrated-worker`
- Canonical project: `C:\Users\henry\sancussight`
- Resolve first:
  `python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json`
- Tracking owner / return task:
  `019f914a-b672-77b1-837f-0c866b6421bb`
- Gate: `.ai/sdd/specs/011-standards-interoperability/.status` must be
  `implementation:in-progress`.
- Approved ticket:
  `.ai/sdd/specs/011-standards-interoperability/tasks.md#T2 — Telemetry alignment and unsigned Statement v1`.
- T1 is authoritatively complete. T2 is the sole unblocked frontier.

Fully read applicable `AGENTS.md`, the installed `sdd-exec` skill and required
references, steering, Feature 011 `.status`, requirements, design, tasks,
research, understanding, `sdd-brief.md`, and `execution/T1-handoff.md` before
editing. Resolve the registry and inspect the dirty tree first.

The orchestrator is the sole writer of `tasks.md`, `.status`,
`.ai/sdd/INDEX.md`, `.ai/sdd/handoff/sdd-brief.md`, and `understanding.md`.

## Pre-edit Acknowledgment

Before product edits, durably append `execution/T2.md` and directly return:

```yaml
event:
  event_id: sancussight-011-T2-acknowledged-20260724-01
  task_id: T2
  type: acknowledged
  occurred_at: <ISO timestamp with offset>
  summary: Fresh visible top-level worker acknowledged Feature 011 T2 telemetry-alignment and unsigned Statement scope, exact ownership, privacy/truth exclusions, verification, tracking owner, and return path before edits.
  evidence:
    commands:
      - project registry resolve
    files:
      - .ai/sdd/specs/011-standards-interoperability/tasks.md#T2
  affected_contract: []
  return_delivery:
    source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
    state: delivered|durable-fallback
    receipt_evidence: <direct result or durable fallback>
```

## Exact Owned Surfaces

- new `src/lib/telemetry-alignment.ts`
- new `src/lib/in-toto-statement.ts`
- new
  `public/spec/evidence-packet-interoperability-v1.schema.json`
- focused non-overlapping T2 tests under
  `src/lib/__tests__/feature011-*.test.mjs`
- `.ai/sdd/specs/011-standards-interoperability/execution/T2.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T2-handoff.md`

Do not edit `src/types.ts`, T1 implementation/evidence, package metadata,
shared tracking, UI/CSS/store surfaces, or any other file.

## Required Implementation

Implement only approved T2:

1. Project already accepted `runtime-telemetry` evidence into fixed,
   profile-qualified OpenTelemetry and OpenInference alignment rows.
2. Consume no raw OTLP and retain no prompt, response, reasoning, tool
   payload, document, image, URL, credential, user identity, or unrestricted
   attribute.
3. Every alignment row must name profile, state, source field, target field,
   and limitation. Prohibited content families remain explicitly
   `omitted-private` with no value.
4. Build, validate, canonicalize, and locally download an unsigned in-toto
   Statement v1 only from a validated Feature 010 Evidence Packet.
5. Use the official Statement v1 `_type`, the approved custom SancusSight
   predicate type, hashed subjects, fixed exact shapes, and explicit
   `unsigned: true` / `externallyVerified: false` truth.
6. Publish the exact custom predicate JSON Schema at the owned public path.
7. Invalid/tampered packets, unsafe values, unknown profiles/predicate types,
   digest mismatch, unsupported Web Crypto, or download failure create no
   Statement or verification claim.
8. Add adversarial privacy, tamper, shape, profile, digest, capability, and
   deterministic/copy-independent tests.

No conformance/certification claim, DSSE, signing, keys, certificates,
transparency log, external verifier, raw telemetry, runtime dependency,
network action, store, UI, policy runtime, score, or governance mutation.

## Exclusions

No Spec 005/T16R5/T16/A-002 action; no T3–T5/R1; no provider/Pi/upstream
operation; no commit/push; no deployment; no package/dependency change; no
shared tracking write; preserve all unrelated dirty work.

## Verification

Run in order:

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git -c core.autocrlf=false diff --check
```

Record exact commands, exit codes, output summaries, changed files, privacy
negatives, limitations, and return receipt in `execution/T2.md` and
`T2-handoff.md`.

## Terminal Return

Return exactly one stable terminal event:

- `sancussight-011-T2-ready-20260724-01`, or
- one stable `blocked`, `contract-conflict`, or `verification-failed`.

Completion remains with the tracking owner.
