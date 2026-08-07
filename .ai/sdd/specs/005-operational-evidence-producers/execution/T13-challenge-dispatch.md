# T13 Independent Challenge Dispatch

> Supporting orchestration evidence; authority remains in `.status`, `requirements.md`, `design.md`, and `tasks.md`.

## Dispatch contract

- Source Orchestrator: `019f8832-814b-7d72-b83d-3066a93733fe`
- Canonical project: `C:/Users/henry/sancussight`
- Task: Spec 005 A-002, T13 independent high-tier second opinion
- Session policy: fresh visible top-level Chat; no subagents and no reused or nested Chat
- Model: `gpt-5.6-sol`
- Reasoning effort: `high`
- Mode: read-only challenge; do not implement T13 and do not edit product or authority files
- Permitted output: `.ai/sdd/specs/005-operational-evidence-producers/execution/T13-challenge-handoff.md`
- Completion channel: report the same verdict to Orchestrator as `ready-for-review`

## Required reading

1. `AGENTS.md`
2. `.ai/steering/` applicable files
3. `.ai/sdd/specs/005-operational-evidence-producers/.status`
4. `.ai/sdd/specs/005-operational-evidence-producers/requirements.md`
5. `.ai/sdd/specs/005-operational-evidence-producers/design.md`
6. `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`, especially A-002 and T13
7. `.ai/sdd/handoff/sdd-brief.md`
8. `.ai/sdd/handoff/spec005-a002-master-context.md`
9. Current read-only implementation surfaces named by T13
10. Installed `sdd-exec` instructions

## Challenge questions

- Is the single 30-minute predicate fully specified at the exact start/end boundaries, one millisecond outside, pre-run, future-dated, wrong-run, and orchestration-overrun cases?
- Is producer `observedAt` unambiguously authoritative, with import, copy, and filesystem timestamps unable to qualify evidence?
- Does expand-contract preserve readable legacy single-target manifests while rejecting ambiguous legacy multi-target qualification?
- Are required target and Worker Remit identities paired, unique, independently evaluated, and consistent with parent summaries and referenced accepted evidence?
- Can newer evidence for one target conceal missing, invalid, or older evidence for another target?
- Are source-target reduction, Codex/Claude/Pi runtime coverage, and aggregate reduction deterministic and independently inspectable?
- Do proposed T13 surfaces suffice without silently weakening Pipelock, RAMPART, AIMap, privacy, source isolation, or required failure controls?
- Are any ownership gaps, contradictions, unsafe compatibility assumptions, or missing acceptance/verification cases present?

## Required handoff

Write `T13-challenge-handoff.md` with:

- Chat ID, model, effort, and lifecycle outcome
- authority sources and code surfaces inspected
- exactly one verdict: `affirm`, `changes-required`, or `blocked`
- findings ordered by severity with precise artifact/code references
- boundary/compatibility fixture matrix reviewed
- recommended contract changes, if any, without applying them
- explicit statement that no product or authority file was changed

Orchestrator must reconcile this handoff before creating the T13 implementation Chat. `.status` remains `tasks:approved` until that worker is actually dispatched.
