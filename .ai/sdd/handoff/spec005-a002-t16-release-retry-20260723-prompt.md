# Copy-Paste Worker Prompt — T16/A-002 Release Retry

You are a fresh visible top-level worker for SancusSight Spec 005 Task T16/A-002.

Execution mode: `orchestrated-worker`. Tracking owner: `orchestrator`.
Source/orchestrator thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.
Canonical project: `C:/Users/henry/sancussight`.
Gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` is `implementation:in-progress`.

The operator has explicitly authorized one new A-002 operational attempt after T16R corrective remediation and the reconciled Pi access-canary fix. This is exactly one new token/run; it does not authorize reuse, exception promotion, or a second attempt after a new failure. Read before editing or running:

- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/.status`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/design.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/tasks.md` (Task T16)
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-handoff.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-t16-a002-release-reconciliation.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-worker-prompt.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a003-t16r-output-contract-remediation.md`

Before creating any token, send a structured acknowledgment to source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` and require confirmed delivery or durable fallback:

```yaml
event:
  event_id: <new-stable-event-id>
  task_id: T16
  type: acknowledged
  occurred_at: <ISO-8601>
  summary: I acknowledge one newly authorized T16/A-002 operational release attempt after T16R output-contract remediation. I will use one shared SANCUSSIGHT_RUNTIME_TARGET_ID from capture start, stop on auth prompts or any fail-closed blocker, and edit only new run evidence, permitted passing release artifacts, bounded Playwright evidence, and append-only T16 records. Implementation and shared tracking remain read-only.
  evidence:
    files:
      - .ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-handoff.md
      - .ai/sdd/specs/005-operational-evidence-producers/.status
  return_delivery:
    source_thread_id: 019f8d31-d1ee-7731-b0fb-b5f7d5beda7c
    state: delivered | durable-fallback
```

Then execute exactly one new run token:

1. Run noninteractive preflight and access canaries. From `C:/Users/henry/sancussight`, resolve `claude`, `codex`, and `pi` with PowerShell `Get-Command`; use their resolved `.Source`/`.Path`, not inherited PATH shims. Invoke Claude and Codex through a noninteractive PowerShell host with the resolved path and `-Command`: `<powershell.exe> -NoProfile -NonInteractive -Command "& '<resolved-claude>' --print --no-session-persistence --model haiku --effort low --tools '' --permission-mode plan --disable-slash-commands --output-format text 'Reply exactly CLAUDE_ACCESS_OK.'"`; `<powershell.exe> -NoProfile -NonInteractive -Command "& '<resolved-codex>' exec --ephemeral --sandbox read-only --skip-git-repo-check --color never 'Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools.'"`. Invoke Pi through the host with `-File`: `<powershell.exe> -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi.ps1> --print --no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files --no-approve --thinking off "Respond with only the exact token PI_ACCESS_OK and nothing else"`. Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` and the canonical child working directory for each canary. If using a child-process API, use `UseShellExecute=false`, redirect stdout/stderr, close redirected stdin immediately after process start, and enforce a bounded timeout. Capture stdout/stderr privately, retaining only exit code, bounded lengths, auth-prompt boolean, and exact-marker boolean. Before any trim, reject a leading byte-order mark (BOM). Normalize `CRLF` and `CR` to `LF`, trim only outer ASCII transport whitespace (`SP`, `HT`, and `LF`), then require case-sensitive exact equality. Do not use PowerShell or runtime-default generic Unicode `Trim()` behavior. Stop on any launcher error, nonzero exit, missing/unexpected marker, or provider authentication/authorization prompt; never submit credentials or bypass auth. Punctuation, prose, fences, BOM, and alternate markers remain failures.
2. Configure one shared `SANCUSSIGHT_RUNTIME_TARGET_ID` for Codex CLI, Claude Code, and Pi before capture. Never relabel or combine captured evidence.
3. Run the 15-case matrix and require `15/15`.
4. Produce fresh metadata-only Codex, Claude, and Pi telemetry; both Praxen targets through the corrected runner; trusted Pipelock allow/block; passing RAMPART; and exact-scope AIMap evidence.
5. Build the fresh sanitized manifest/bundle only if all required sources and target/remit pairs pass within the shared 30-minute boundary. Current-release promotion is passing-only.
6. Run project, privacy, operations, governance, sanitizer, and bounded Playwright acceptance checks. Retain only sanitized bounded evidence.

Fail closed and return `verification-failed` or `blocked` immediately if any producer, target, remit, version, timestamp, runtime-target, privacy, trust, timing, matrix, gate, or UI condition fails. Do not retry after failure or use an exception without new operator direction. Do not modify implementation, collector, release gate/selection/builder, `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, or shared handoff authority. Do not run a second attempt in this worker.

Append exact lifecycle and verification evidence to `execution/T16.md` and `execution/T16-handoff.md`. Return `ready-for-review` only after a completely passing gate, with stable event ID, exact commands, exit codes, artifact paths, privacy result, and receipt evidence. The orchestrator alone reconciles authoritative completion and release readiness.

Exact-marker normalization is mandatory: reject a leading BOM before trimming; replace CRLF and CR with LF; trim only outer ASCII transport whitespace (`SP`, `HT`, and `LF`); then compare case-sensitively against the punctuation-free expected token. A trailing transport newline is permitted; raw stream length must not be compared before trimming. Do not use generic Unicode `Trim()`, substring matching, or marker synthesis.
