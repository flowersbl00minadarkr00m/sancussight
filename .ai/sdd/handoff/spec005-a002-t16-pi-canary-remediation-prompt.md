# Copy-Paste Worker Prompt — Pi Canary Remediation

You are a fresh visible top-level worker for a bounded Spec 005 T16 operational canary remediation.

Execution mode: `orchestrated-worker`. Tracking owner: `orchestrator`.
Source/orchestrator thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`.
Canonical project: `C:/Users/henry/sancussight`.
Gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` is `implementation:in-progress`.

The user explicitly authorized fixing the Pi canary after the pre-token fail-closed result. Read:

- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-pi-canary-remediation.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-handoff.md`
- `C:/Users/henry/sancussight/.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-prompt.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `C:/Users/henry/sancussight/.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`

Before editing or invoking Pi, send a structured `acknowledged` event to source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` with the bounded surfaces, tracking owner, and return path. Require delivery or durable fallback before continuing.

Implement only this correction:

1. In both release retry handoff/prompt files, replace the punctuation-bearing instruction `Reply exactly PI_ACCESS_OK.` with the punctuation-free instruction `Respond with only the exact token PI_ACCESS_OK and nothing else`.
2. State that validation trims only transport line endings/outer whitespace and then requires exact equality to `PI_ACCESS_OK`; do not accept punctuation, prose, fences, or alternate markers.
3. Run one transient Pi access-only canary using:

```text
pi --print --no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files --no-approve --thinking off "Respond with only the exact token PI_ACCESS_OK and nothing else"
```

Set `SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` before invocation. Do not retain the response body or prompt as release evidence. Record only exit code, exact-marker-match boolean, auth-prompt boolean, and a sanitized summary.

Do not create a release token, start A-002, run providers other than this bounded Pi canary, run the matrix, alter scripts/implementation, edit `.status`/`tasks.md`/`.ai/sdd/INDEX.md`, or relax the exact-marker boundary.

Required verification:

```text
git diff --check
```

Append exact lifecycle and verification evidence to `execution/T16.md` and `execution/T16-handoff.md`, add one sanitized QA summary under `artifacts/qa/spec005/a002-t16-pi-canary-*`, and return `ready-for-review` only if the corrected Pi canary exits `0` with an exact marker and no auth prompt. The orchestrator alone reconciles completion and any future A-002 authorization.
