# Copy-paste prompt — T16/A-002 provider-canary launch remediation

You are a fresh visible top-level Terra High remediation worker for SancusSight Spec 005 Task T16/A-002.

Source/orchestrator thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.
Canonical project: `C:/Users/henry/sancussight`.
Read the remediation handoff, approved status, requirements, design A-003 §§20.2/20.4, Task T16, current T16 execution records, retry handoff/prompt, and the prior provider-canary QA artifact before acting.

The operator directed: apply the bounded provider-canary launch fix, then try T16/A-002 again. This worker performs remediation only. Do not create a release token, do not start an A-002 run, do not run the matrix, do not capture release evidence, do not invoke Praxen, do not build a bundle, do not change current-release, and do not edit code or SDD authority files.

Before any canary, send a structured `acknowledged` event to the source thread and require delivery or durable fallback.

Implement and verify only this launch correction:

1. Resolve `claude`, `codex`, and `pi` from the canonical project working directory with PowerShell `Get-Command`; use resolved paths, not inherited PATH shims.
2. Invoke resolved Claude/Codex native executables through `powershell.exe -NoProfile -NonInteractive -Command "& '<resolved-path>' ..."` so Windows shell semantics are preserved. Invoke the resolved Pi `.ps1` through `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi-path> ...`; never pass a provider shim directly to a Node/Windows process API.
3. Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` and child working directory `C:/Users/henry/sancussight` for all three canaries.
4. Capture stdout/stderr privately and retain only exit code, bounded character counts, auth-prompt boolean, and exact-marker boolean. If using a child-process API, use `UseShellExecute=false`, redirect both streams, close redirected stdin immediately after process start, and enforce a bounded timeout. Normalize only transport line endings and outer whitespace; require exact marker equality.
5. Use the complete approved invocations, not prompts alone:
   - Claude: `<resolved-claude> --print --no-session-persistence --model haiku --effort low --tools "" --permission-mode plan --disable-slash-commands --output-format text "Reply exactly CLAUDE_ACCESS_OK."`
   - Codex: `<resolved-codex> exec --ephemeral --sandbox read-only --skip-git-repo-check --color never "Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools."`
   - Pi: `<powershell.exe> -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi.ps1> --print --no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files --no-approve --thinking off "Respond with only the exact token PI_ACCESS_OK and nothing else"`

Run each bounded diagnostic canary once. Stop fail-closed on any launcher error, nonzero exit, missing marker, unexpected output, or auth/authorization prompt. Never submit credentials or use an auth bypass. Run `git diff --check` afterward.

Owned write surfaces:
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-handoff.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-prompt.md`
- append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- sanitized `C:/Users/henry/sancussight/artifacts/qa/spec005/a002-t16-provider-canary-remediation-*.md`

Return a stable `ready-for-review` event only if all three canaries qualify and the diff check passes. Otherwise return `blocked` with bounded evidence. Confirm no token/run/release state changed. The orchestrator will independently verify, obtain a fresh challenge, and decide whether to dispatch the single new Sol High A-002 worker.

Exact-marker normalization is mandatory: replace CRLF and CR with LF, trim only outer whitespace, then compare case-sensitively against the punctuation-free expected token. Do not compare raw stream length first, use substring matching, or synthesize a marker.
