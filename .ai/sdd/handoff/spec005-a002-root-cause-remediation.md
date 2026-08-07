# Spec 005 A-002 Root-Cause Remediation Handoff

> Control-plane handoff only. It does not approve a gate, change `.status`, complete T16, or qualify release evidence.
> Updated: 2026-07-22

## Destination

Continue the Spec 005 T16 root-cause remediation in a fresh visible project chat, then obtain fresh user approval before any A-002 operational rerun.

## Authority snapshot

- **Canonical project:** `C:/Users/henry/sancussight`
- **Feature:** `.ai/sdd/specs/005-operational-evidence-producers/`
- **Current `.status`:** `implementation:in-progress`
- **Requirements:** `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- **Design:** `.ai/sdd/specs/005-operational-evidence-producers/design.md`
- **Tasks:** `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`
- **T16 task:** `tasks.md` -> `Task T16: Revalidate A-002 with a new operational release run`
- **Existing T16 execution record:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- **Existing T16 handoff:** `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`

Treat this file as supporting context. Reconcile every implementation decision against the authority paths above. Do not silently rewrite approved requirements, design, tasks, or status.

## Why the prior A-002 run failed

### Observed evidence

- Latest fresh diagnostic run: `spec005-a002-t16-20260722195544`.
- Report: `artifacts/qa/spec005/a002-t16-20260722195544.md`.
- The isolated collector accepted SancusSight's Praxen schema-2.0 report at the adapter level, but it did not qualify as operationally bound evidence.
- The `sdd-exec` target wrote a report-shaped `FINDINGS.json` without the canonical Praxen fields (`schema_version`, `scan`, and `praxen_version`), so the adapter accepted zero records from that target.
- The Praxen skill requires a Step 9.9 draft checkpoint, then the deterministic `manifest_to_findings.py` conversion, then deterministic `render.py` output. The failing target produced a plausible report-shaped artifact without completing that canonical pipeline.
- No historical or synthetic evidence was promoted. The run failed closed and no release bundle was written.

### Root-cause inference

The harness treated a model-authored report-shaped file as an output contract instead of making the pinned Praxen conversion/render pipeline authoritative. The prompt requested canonical output, but the runner did not enforce the exact converter and renderer as the only path to official findings.

The issue is therefore a trust-boundary and orchestration defect, not merely a Claude context-window problem.

## Approved remediation contract

The user approved the following behavior during the root-cause grill:

1. Claude/Haiku may gather observations and write a draft/manifest only.
2. Each producer gets one fresh, short Haiku session with no retained conversation. Retries require explicit operator approval.
3. Claude writes only to a temporary staging directory. The runner alone creates official findings and rendered reports.
4. The runner explicitly invokes the pinned Praxen `manifest_to_findings.py` converter and `render.py` renderer. Do not reimplement Praxen's canonical conversion in TypeScript.
5. The same invariant applies to every Praxen producer, including SancusSight and `sdd-exec`; no producer receives a model-authored-report exception.
6. Deterministic validation must check the exact current run ID, required fields/schema, provenance, freshness, producer target, Worker Remit binding, and exact Claude/CLI/Praxen/Pi versions.
7. Missing, malformed, stale, wrong-run, wrong-target, wrong-version, or converter/renderer failure fails closed.
8. A partial result is allowed only as an explicit partial result naming the failed producer and reason. The system pauses and asks the operator what to do.
9. An operator-approved exception remains labeled as an exception and never becomes a clean pass. A partial or exception result is not release-eligible.
10. Staging artifacts, model-authored canonical-looking JSON, logs, and copied/old files never count unless the runner creates a valid canonical artifact from the current run.
11. A regression test must cover both the valid path and negative paths through the real runner: missing draft, converter failure, missing field, wrong run ID, wrong version, model-authored official output, and partial producer failure.
12. No synthetic or historical evidence may be used for the eventual A-002 operational window. Test fixtures are permitted only inside regression tests and must be truth-labelled as test data.

## Implementation boundary

First inspect the current implementation and existing tests. Likely surfaces include:

- `scripts/run-spec005-praxen-behavior-verifier.ps1`
- `scripts/test-spec005-claude-haiku.ps1`
- `collector/adapters/praxen.ts`
- `scripts/build-spec005-t10-release-bundle.ts`
- relevant collector and runner tests

Keep the language responsibilities clear:

- **PowerShell:** Windows process orchestration, isolated directories, timeouts, cleanup, and exit-code capture.
- **Praxen Python:** canonical manifest conversion, schema validation, and HTML/TXT rendering.
- **SancusSight TypeScript:** adapter normalization, run/provenance/freshness checks, partial-state modeling, release-gate evaluation, and regression tests.

Do not solve this by adding more instructions to the prompt alone. Prompt guidance may remain, but the official-artifact boundary and validation must be enforced by code.

## Verification expected before handoff back

- Existing baseline checks remain green: collector tests, core verification, build, audit, and operations checks as applicable.
- A positive regression proves valid manifest -> Python converter -> canonical JSON -> Python renderer -> accepted SancusSight evidence.
- Negative regressions prove invalid/missing converter output cannot qualify, including wrong run ID, missing version, malformed schema, stale evidence, and model-authored official-looking JSON.
- A partial producer result is visible, names the blocker, pauses for operator direction, and does not create a passing bundle.
- No production A-002 run is started by the remediation chat.

## Completion / return protocol

Return a concise implementation handoff containing:

- changed files;
- exact commands, exit codes, and PASS/FAIL results;
- regression coverage mapped to the contract above;
- remaining blockers or contract conflicts;
- whether a new A-002 operational rerun is safe to request.

Do not claim T16 completion or release readiness from this remediation handoff. The operator must separately approve the fresh A-002 run.
