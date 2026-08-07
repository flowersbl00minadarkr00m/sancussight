# T16/A-002 Fresh Worker Prompt After T16R2

Resolve `sancussight` through the canonical registry and work only in
`C:/Users/henry/sancussight`.

Read completely:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
- `.ai/sdd/specs/005-operational-evidence-producers/design.md`
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`, Task T16
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16-handoff.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2.md`
- `.ai/sdd/specs/005-operational-evidence-producers/execution/T16R2-handoff.md`
- `.ai/sdd/handoff/spec005-t16-a002-post-t16r2-release-authorization-20260723.md`
- the applicable steering files

Execution mode is `orchestrated-worker`; tracking owner is `orchestrator`.
This is exactly one newly authorized token/run. Send an `acknowledged` event
to source thread `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c` before token creation
or any owned write. If direct delivery fails, append the event to
`execution/T16.md` and mark the durable fallback. Stop if neither path is
durable.

Follow every mandatory control and owned/read-only boundary in the
authorization handoff. Use one
`SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes` from pre-token
canaries through all capture. Run exactly one corrected bounded canary per
provider. Never retain provider output bodies, submit credentials, bypass
authentication, reuse evidence, relabel evidence, or retry.

If pre-token qualification passes, create exactly one new release token/run.
Run the full approved T16 workflow, both corrected Praxen targets, the 15/15
matrix, remaining producers, gate, independent privacy scan, required project
checks, and bounded Playwright acceptance. Stop at the first required failure.
Never patch code or contracts in this worker.

Return one stable `blocked`, `contract-conflict`, `verification-failed`, or
`ready-for-review` event with exact commands, exit codes, bounded summaries,
files, privacy/release-state evidence, and positive source-thread receipt.
Completion and readiness remain orchestrator-only.
