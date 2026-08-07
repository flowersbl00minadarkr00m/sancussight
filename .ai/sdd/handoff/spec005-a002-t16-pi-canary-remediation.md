# Spec 005 T16 Pi Access-Canary Remediation

## Authority and approval

- Feature: `005-operational-evidence-producers`
- Gate: `.ai/sdd/specs/005-operational-evidence-producers/.status` (`implementation:in-progress`)
- Affected task: `tasks.md`, Task T16 pre-token provider-access boundary
- Tracking owner: `orchestrator`
- Source thread: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`
- Operator direction: the user explicitly requested, `address Pi issue with fix`, after the Pi pre-token block.

This is a bounded operational contract correction. It does not change requirements, design, the A-002 30-minute boundary, or T16 acceptance. It does not authorize a new A-002 token/run; a separate release authorization remains required after this fix is reconciled.

## Root cause

The previous Pi canary invoked:

```text
Reply exactly PI_ACCESS_OK.
```

Pi returned `PI_ACCESS_OK.` with the terminal period. The process exited `0`, but the strict wrapper correctly rejected the response because it was not the exact marker `PI_ACCESS_OK`.

Read-only reproduction with the punctuation-free instruction returned exactly `PI_ACCESS_OK` with process exit `0`.

## Correction

1. Change the Pi canary instruction in the release retry handoff and worker prompt to:

   ```text
   Respond with only the exact token PI_ACCESS_OK and nothing else
   ```

2. Keep the acceptance rule strict: after removing only normal process line endings and surrounding transport whitespace, the bounded result must equal `PI_ACCESS_OK` exactly. Do not accept `PI_ACCESS_OK.`, extra prose, code fences, multiple lines, or alternate markers.
3. Add a transient verification record showing the corrected command returns exit `0` and the exact marker. Do not retain the prompt/response body as release evidence.
4. Append the correction and verification to `execution/T16.md` and `execution/T16-handoff.md` without rewriting the prior blocked event.

## Scope

Owned surfaces for the fresh worker:

- `.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-handoff.md`
- `.ai/sdd/handoff/spec005-a002-t16-release-retry-20260723-prompt.md`
- append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- append-only `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- new sanitized QA summary under `artifacts/qa/spec005/a002-t16-pi-canary-*`

Out of scope:

- no A-002 token, run, provider capture, Praxen, Pipelock, RAMPART, AIMap, bundle, current-release, or Playwright activity;
- no change to implementation, collector, release gate/selection/builder, `.status`, `tasks.md`, `.ai/sdd/INDEX.md`, or requirements/design;
- no relaxed marker acceptance, auth bypass, credential submission, or retry of the blocked release attempt.

## Verification

Run one bounded Pi access-only check with the existing no-session/no-tools/no-extension/no-skill/no-context/no-approve flags, shared target `sancussight-local-runtimes`, and the corrected punctuation-free instruction. Verify exit `0` and exact marker match transiently; retain only the result, exit code, auth-prompt boolean, and privacy-safe summary.

Also run `git diff --check`. Return `verification-failed` on any nonzero process, unexpected output, auth prompt, or privacy issue. The orchestrator will independently inspect the scoped diff and reconcile the fix. A future A-002 attempt remains separately authorized only after this remediation is reconciled.
