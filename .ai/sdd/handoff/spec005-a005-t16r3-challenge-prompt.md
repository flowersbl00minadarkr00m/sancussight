# Spec 005 T16R3 Independent Implementation-Readiness Challenge

You are a fresh visible top-level read-only reviewer. Do not implement, edit,
invoke a provider, create a release token/run, execute the failure matrix,
mutate current-release, or perform release Playwright acceptance.

Resolve `sancussight` through
`C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py` and work
only in the returned canonical project.

Read:

- `.ai/sdd/specs/005-operational-evidence-producers/.status`
- `requirements.md`
- `design.md`, especially A-005 Sections 22.2, 22.8, and TD-013
- `tasks.md`, especially Task T16R3
- `review.md`, especially SS-RP-004 and SS-RR-003
- the existing preflight, provider-canary handoffs, PowerShell scripts, and
  operations verification seams relevant to T16R3

Challenge whether T16R3 is implementation-ready as one bounded Sol High
ticket. Verify that its owned surfaces are sufficient and non-overlapping;
that the checked-in PowerShell 5.1 launcher can deterministically cover
canonical `Get-Command` resolution, `.exe`/`.ps1` hosting, fixed arguments,
closed stdin, bounded private streams, timeout, auth detection, BOM and exact
marker rules, target/cwd reporting, and zero invocation in plan-only fixtures;
and that the separate local-readiness check remains non-provider and
least-authority.

Return exactly one structured event with:

- stable `event_id`
- `task_id: T16R3`
- `type: implementation-readiness-challenge`
- `verdict: AFFIRM | CHALLENGE`
- affected contracts
- concise rationale
- required corrections or checks
- routing verdict for `gpt-5.6-sol` / high / one fresh visible top-level worker
- explicit no-change/no-provider/no-release confirmation
- inspected evidence
- `return_delivery.source_thread_id:
  019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`

Deliver it to the source thread with positive receipt evidence. The
Orchestrator alone reconciles the verdict.
