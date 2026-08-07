# Continuation Prompt — Spec 005 A-002 Root-Cause Remediation

Continue the SancusSight Spec 005 T16 root-cause remediation from this handoff:

`C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-root-cause-remediation.md`

Canonical project root:

`C:/Users/henry/sancussight`

Use the canonical project registry result and read the relevant steering plus these authority artifacts before changing anything:

- `C:/Users/henry/sancussight/.ai/steering/conventions.md`
- `C:/Users/henry/sancussight/.ai/steering/tech-stack.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/.status`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/design.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/tasks.md`

Use the appropriate SDD execution/planning skill. If the approved design/tasks do not authorize this remediation surface, stop and report the contract gap rather than silently changing the authority plane.

## Objective

Fix the root cause of A-002's Praxen failure. The model may draft evidence, but only deterministic software may create and validate official evidence.

## Non-negotiable constraints

- Do not use subagents, hidden workers, or synthetic operational evidence.
- Do not run the A-002 operational window in this remediation chat.
- Do not reuse or relabel historical artifacts.
- Do not treat a report-shaped model output as canonical.
- Do not rewrite Praxen's Python converter/render pipeline in TypeScript.
- Do not advance `.status`, mark T16 complete, or claim release readiness without fresh authorized verification.

## Required behavior

- Start one fresh, short Haiku session per producer with no retained conversation.
- Restrict Claude to a staging directory.
- Have the runner explicitly invoke the pinned Praxen `manifest_to_findings.py`, then `render.py`.
- Allow only runner-created canonical/rendered artifacts into the official evidence path.
- Deterministically validate current run ID, schema, required fields, target, Worker Remit, provenance, freshness, and exact tool/model versions.
- Fail closed on missing/invalid/stale/wrong-run/wrong-target/wrong-version/converter/renderer output.
- Represent partial failure explicitly, pause for operator direction, keep exceptions non-clean and non-release-eligible, and require approval before retries.

## Test requirement

Add regression coverage that exercises the real runner or its authoritative boundary:

- valid manifest conversion and rendering succeeds;
- missing Step 9.9 draft fails;
- converter failure fails;
- missing required field/schema fails;
- wrong current run ID fails;
- missing or unexpected version fails;
- model-authored canonical-looking output in staging is not accepted directly;
- one producer failing yields an explicit partial result and no passing bundle.

Use controlled fixtures only for these tests; label them as test data and never mix them with A-002 evidence.

## Definition of done

Report changed files, exact commands, exit codes, output summaries, and PASS/FAIL verdicts. Map each result to the remediation contract in the handoff. State any remaining blocker plainly. End by saying whether the operator may approve a new A-002 run; do not start that run yourself.
