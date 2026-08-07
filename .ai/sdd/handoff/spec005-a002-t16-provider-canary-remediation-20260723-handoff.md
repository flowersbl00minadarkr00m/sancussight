# Spec 005 T16/A-002 provider-canary launch remediation

## Authority and scope

- Source/orchestrator thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`
- Canonical project: `C:/Users/henry/sancussight`
- Feature gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` remains `implementation:in-progress`.
- User direction: apply the provider-canary fix, then try T16/A-002 again.
- Prior blocker: `spec005-t16-a002-post-pi-retry-blocked-pretoken-provider-canaries-20260723-sol-high-04`.
- This remediation is limited to the bounded Windows provider-launch and exact-marker contract. It does not complete T16 or authorize an exception.

## Observed root cause

The fresh release worker initially could not resolve Windows command shims from its process API. After it resolved an application boundary, the canaries still recorded Claude and Codex exit `1` with zero stdout and Pi exit `0` with zero stdout. A canonical-project diagnostic using PowerShell command resolution and response-body suppression qualified all three providers: Claude exit `0`/exact marker, Codex exit `0`/exact marker, and Pi exit `0`/exact marker. The remaining mismatch is therefore the worker launch/working-directory/PowerShell-script transport contract, not the release gate or Pi marker semantics.

## Corrective launch contract

1. Resolve `claude`, `codex`, and `pi` from the canonical project working directory with `Get-Command` before invocation. Use the resolved `.Source`/`.Path`; do not rely on an inherited PATH or unresolved command shim.
2. Launch resolved Claude/Codex native executables through `powershell.exe -NoProfile -NonInteractive -Command "& '<resolved-path>' ..."` so Windows shell semantics are preserved. Launch the resolved Pi `.ps1` shim through `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi-path> ...`; never pass a provider shim directly to a Node/Windows process API.
3. Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` and use `C:/Users/henry/sancussight` as the child working directory for every canary.
4. Capture stdout and stderr separately, discard their bodies, and retain only process exit code, bounded lengths, auth-prompt boolean, and exact-marker boolean. If using a child-process API, use `UseShellExecute=false`, redirect both streams, close redirected stdin immediately after process start, and enforce a bounded timeout. Normalize only transport line endings and outer whitespace before exact equality.
5. Use the complete approved invocations, not prompts alone: Claude `<resolved-claude> --print --no-session-persistence --model haiku --effort low --tools "" --permission-mode plan --disable-slash-commands --output-format text "Reply exactly CLAUDE_ACCESS_OK."`; Codex `<resolved-codex> exec --ephemeral --sandbox read-only --skip-git-repo-check --color never "Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools."`; Pi `<powershell.exe> -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <resolved-pi.ps1> --print --no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files --no-approve --thinking off "Respond with only the exact token PI_ACCESS_OK and nothing else"`.
6. Any nonzero exit, missing marker, unexpected marker, auth/authorization prompt, or launcher error fails closed before token creation. No credentials, auth bypass, relabeling, or marker reinterpretation is allowed.

## Boundaries

- No release token, A-002 run, matrix, producer capture, bundle, current-release mutation, or Playwright acceptance occurs in this remediation.
- No changes to implementation, collector, release gate/selection/builder, `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, requirements, or design.
- The remediation worker may edit only the retry handoff/prompt, append T16 execution records, and create sanitized QA evidence. The orchestrator retains completion and release authority.

## Required remediation evidence

- Fresh visible Terra High remediation worker acknowledgment before any provider canary.
- One bounded diagnostic canary per provider using the corrected launch contract; no response or stderr bodies retained.
- Exact exit/marker/auth/length results and `git diff --check`.
- If all three qualify, the orchestrator obtains a fresh independent read-only challenge before dispatching the new Sol High A-002 worker.

## Exact-marker normalization correction after final pre-token block

- The final worker observed Claude stdout length `17` with exit `0` and no auth prompt, but compared before trimming the permitted trailing transport newline.
- The validator must replace CRLF/CR with LF, trim only outer whitespace, and perform case-sensitive exact equality against the punctuation-free expected token. Raw length, substring matching, punctuation tolerance, and marker synthesis are invalid.
- The failed worker created no token or run. Any next release attempt requires fresh operator authorization and orchestrator reconciliation.

## Follow-up correction after first remediation block

- The first remediation correctly fixed resolved-path and `.ps1` hosting, but its bounded Claude invocation omitted the full previously qualifying noninteractive argument set. Claude therefore exited `0` without the exact marker and the remediation stopped before Codex/Pi.
- The retry contract now preserves the complete Claude, Codex, and Pi argument sets above. This correction changes no approved requirements/design/tasks and does not authorize a release token by itself.

## Second correction: close child stdin

- The canonical diagnostic showed direct Node child-process launch did not reproduce the exact Claude marker, while PowerShell-hosted `-Command` launch qualified Claude and Codex; Codex also emitted a stdin-read warning when a child-process wrapper left standard input open. The launch contract now requires PowerShell hosting for all providers, immediate stdin closure after process start, resolved paths, complete noninteractive flags, and private bounded streams.
- This is a transport-only remediation. No provider response bodies, credentials, release token, A-002 run, or release state are authorized here.
