# Copy-Paste Worker Prompt — T16R Output-Contract Remediation

You are a fresh visible top-level worker for SancusSight Spec 005 Task T16R corrective remediation.

Read these authority and handoff sources before editing:

- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/.status`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/design.md` (Amendment A-003, Sections 20.2 and 20.4)
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/tasks.md` (Task T16R)
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a003-t16r-output-contract-remediation.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16R.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16R-handoff.md`

Before editing, send this structured acknowledgment to source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`, and ensure delivery is confirmed or record the acknowledgment in the execution record as durable fallback:

```yaml
event:
  event_id: <new-stable-event-id>
  task_id: T16R
  type: acknowledged
  occurred_at: <ISO-8601>
  summary: I acknowledge the bounded T16R output-contract remediation: strengthen the runner's exact Step 9.9 header instruction and add focused regressions. I will edit only the declared runner/test surfaces plus append-only T16R execution/handoff records; shared tracking, T13-T15, collector, release-builder, and A-002 surfaces remain read-only. No A-002 run will occur.
  evidence:
    files:
      - .ai/sdd/handoff/spec005-a003-t16r-output-contract-remediation.md
      - .ai/sdd/specs/005-operational-evidence-producers/.status
  return_delivery:
    source_thread_id: 019f8d31-d1ee-7731-b0fb-b5f7d5beda7c
    state: delivered | durable-fallback
```

After acknowledgment, implement only this bounded correction:

1. In `scripts/run-spec005-praxen-behavior-verifier.ps1`, strengthen the Haiku prompt so the first byte/first line of the sole staging draft must be exactly `# Praxen draft manifest` with exact casing/spacing, no BOM, whitespace, Markdown fence, or leading prose. Tighten staging validation to enforce the same byte-0/first-line contract without normalization or synthesis. Preserve staging-only model output, privacy restrictions, pinned converter/renderer ownership, and fail-closed behavior.
2. In `scripts/test-spec005-claude-haiku.ps1`, inspect the plan's generated `arguments` and assert it contains the literal header plus exact first-line/no-fence/no-leading-prose wording.
3. In `scripts/test-spec005-praxen-boundary.ps1`, add labelled fake-producer cases for both a missing-header draft and a leading-prose/fenced-before-header draft. Assert each returns `failed` at `staging-validation`, requires operator action, and produces no converter/render output. Preserve all existing cases.

Do not weaken the validator, synthesize the header after model output, edit the converter/renderer/adapter/release builder, edit `.status`/`tasks.md`/`.ai/sdd/INDEX.md`, run `sdd-exec`, retry A-002, create a release bundle, or perform Playwright acceptance.

Required checks:

```text
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1
git diff --check
```

If focused checks pass, run the proportionate existing T16R verification set and record each exact command, exit code, output summary, and PASS/FAIL verdict. Stop and return `verification-failed` on any required failure or `contract-conflict` if scope must expand. Otherwise append a `ready-for-review` event with stable event ID, changed files, and verification evidence to the source thread and the append-only execution record. The orchestrator alone reconciles completion.
