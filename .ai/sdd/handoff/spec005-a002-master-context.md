# Spec 005 A-002 Master Project Context

> Control-plane summary; authority remains in the approved Spec 005 artifacts  
> Orchestrator: `019f8d31-d1ee-7731-b0fb-b5f7d5beda7c`  
> Updated: 2026-07-23

## Authority snapshot

- Canonical project: `C:/Users/henry/sancussight`
- Requirements: `.ai/sdd/specs/005-operational-evidence-producers/requirements.md` — approved
- Design: `.ai/sdd/specs/005-operational-evidence-producers/design.md` — approved through A-005
- Tasks: `.ai/sdd/specs/005-operational-evidence-producers/tasks.md` — approved through T16R3-T16R7
- Status: `.ai/sdd/specs/005-operational-evidence-producers/.status` — `implementation:in-progress`
- Product claim: `Not ready for release`

## Approved contract

- One 30-minute current-run evidence/orchestration boundary.
- Producer `observedAt` is authoritative; filesystem/import/copy times cannot qualify evidence.
- Required targets and Worker Remits are paired and independently evaluated.
- Five categories, three runtimes, trusted/source-specific checks, privacy, and 15 failure/recovery cases remain conjunctive.
- Historical implementation and QA evidence cannot satisfy A-002.

## Orchestration state

| Task | State | Model / effort | Worker Chat | Handoff |
|---|---|---|---|---|
| T13 | complete; challenge affirmed and verification passed | `gpt-5.6-sol`, high | current operator-authorized task | `execution/T13-handoff.md` |
| T14 | complete; deterministic selection verified | `gpt-5.6-sol`, medium | current operator-authorized task | `execution/T14-handoff.md` |
| T15 | complete; fresh scoped review reconciled | `gpt-5.6-terra`, high | recorded in execution evidence | `execution/T15-handoff.md` |
| T16R | complete; deterministic producer boundary reconciled | `gpt-5.6-sol`, high | recorded in execution evidence | `execution/T16R-handoff.md` |
| T16R2 | complete; runner-owned profile/skeleton reconciled | `gpt-5.6-sol`, high | `019f9089-fe9c-7711-8191-4fa1cc33c063` | `execution/T16R2-handoff.md` |
| T16R3 | complete; fresh scoped review reconciled | `gpt-5.6-sol`, high | `019f90e8-3740-7262-a167-bf414de33f7c` | `execution/T16R3-handoff.md` |
| T16R4 | complete; fresh scoped review reconciled | `gpt-5.6-sol`, high | `019f9128-9550-79c1-90f8-be8c6e83c8f5` | `execution/T16R4-handoff.md` |
| T16R5-T16R7 | approved; T16R5 challenge returned CHALLENGE, T16R7 unblocked | per-task routing | T16R5 task correction awaits approval | `tasks.md` |
| T16 | incomplete; blocked by T16R3-T16R7; latest authorization spent | `gpt-5.6-sol`, high | `019f90aa-3249-73a2-ac89-58578c6912a1` blocked | `execution/T16-handoff.md` |

## Current frontier

The latest T16 worker stopped before provider invocation or token creation
because its improvised PowerShell `Get-Command` reporting wrapper failed to
parse. A comprehensive predictive R2 review confirmed eight release-path
blockers: the missing checked-in pre-token launcher, Praxen
`t16r2-v1`/`t16r-v1` incompatibility, identifying workspace paths in the draft
skeleton, remediation-only wrapper success semantics, T16 artifact-prefix
conflict, non-authoritative builder start time, split collector data-directory
variables, and non-atomic current-release promotion. A-005 is approved.
Approved T16R3-T16R7 tasks address these plus Pipelock launch, runtime-process
identity, local readiness, and T16 UI-harness risks with serialized,
non-overlapping ownership. T16R4 is complete after fresh Orchestrator
inspection and reruns of the isolated 15/15 matrix, descriptor/runtime/gate
tests, collector/core/build, operations verification, and diff hygiene.
T16R5 is the dependency-critical route, but its fresh visible independent
challenge returned `CHALLENGE` over exact binding migration, pre-retention
path rejection, descriptor-bound operational wrapper evidence, and a real
runner-to-adapter-to-selection regression. A bounded task correction awaits
explicit operator approval and a fresh corrected challenge. T16R7 is also
unblocked but remains undispatched.

T16R3 is complete. Fresh review reproduced an omitted-`ProjectRoot`
production failure hidden by fixture arguments; the same worker corrected
both entrypoints and added non-project-cwd regressions. All focused checks,
the 25-file PowerShell 5.1 parse sweep, and operations verification pass. The
host's two distinct Codex executables now trigger the intended pre-token
ambiguity guard and remain an operational follow-up.
The historical current release remains `spec005-t10-20260718e`; no T16 run is
authorized.

## Reconciliation protocol

After every challenge or worker handoff, Orchestrator records only the compressed durable result here:

- Chat/model/effort and lifecycle outcome
- changed or inspected surfaces
- exact fresh verification and verdict
- resolved divergence or blocker
- authoritative task/status update
- next frontier and exact dispatch

Detailed logs remain in per-task execution and handoff files. This file never substitutes for `.status`, approved tasks, or fresh verification.
