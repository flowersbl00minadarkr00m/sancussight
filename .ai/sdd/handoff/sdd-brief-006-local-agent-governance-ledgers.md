# SDD Handoff Brief: Local Agent Governance Ledgers

> Status: Review complete
> Readiness: T1-T9 implementation verification complete; not ready for release
> Updated: 2026-07-20

## Metadata

- **Spec ID:** `006-local-agent-governance-ledgers`
- **Spec Path:** `.ai/sdd/specs/006-local-agent-governance-ledgers/`
- **Current .status:** `review:done`
- **Requirements:** `.ai/sdd/specs/006-local-agent-governance-ledgers/requirements.md`
- **Design:** `.ai/sdd/specs/006-local-agent-governance-ledgers/design.md`
- **Tasks:** `.ai/sdd/specs/006-local-agent-governance-ledgers/tasks.md`
- **Status Gate:** `.ai/sdd/specs/006-local-agent-governance-ledgers/.status`
- **Interactive explainer:** `artifacts/planning/spec006-design-explainer.html`

## Product / Feature Summary

- **User:** A local AI power user governing Codex CLI and Claude Code on one Windows PC.
- **Problem:** Existing evidence views do not provide one truthful chain from work intent through runtime activity, control decisions, human accountability, effects, outcomes, and verification.
- **Outcome:** SancusSight presents five coherent ledger projections, evidence-backed lineage, a curated personal control profile, and consequence-based recommendations without becoming an upstream operator or enforcement authority.
- **Scope:** GovernanceEventV1, FindMnemo, FlowSensa, runtime inventory, Spec 004/005 envelope projection, five ledgers, lineage, human decisions/bindings, controls, APIs, UI, export, hosted/manual parity, and performance/accessibility verification.
- **Out of Scope:** Machine-wide interception, upstream tool replacement, generic command execution, full AICM redistribution, automatic policy mutation, cloud administration, and continuous enforcement claims.

## Approved Requirements Summary

- Common versioned governance event contract with bounded payloads and provenance.
- Inventory, Activity, Controls, Decisions, and Outcomes projections over one event model.
- FindMnemo intent and FlowSensa workflow context remain complementary to Agent Beacon runtime observation.
- Stable or confirmed lineage only; inferred links and source gaps remain visibly non-authoritative.
- Deterministic control applicability and Observe/Advise/Confirm/Block good-friction recommendations.
- Append-only SancusSight human decisions and bindings with expiry, revocation, scope, and evidence.
- File-path or read-only collector ingestion, privacy minimization, source isolation, and truthful degradation.

## Approved Design Summary

- Keep `EvidenceEnvelopeV1` canonical for Spec 004/005 and project it into governance events at the read-model boundary.
- Keep shared domain projection code free of Node and browser globals so collector and hosted/manual modes agree.
- Keep upstream execution, scanning, enforcement, and policy mutation outside SancusSight.
- Use a curated Singapore-inspired personal profile with attributed AICM references instead of reproducing the full catalogue.
- Use deterministic authority rules; probabilistic outputs may be imported only as inferred evidence and cannot grant authority or readiness.
- Keep routine governance hydration on a bounded summary projection; retain complete sanitized history only for explicit export.

## Implementation Plan

- **Recommended order:** `T1 -> (T2, T3) -> T4 -> T5 -> T6 -> (T7, T8) -> T9`
- **T1:** Governance event contract, validation, privacy, and canonical identity.
- **T2:** Native event persistence and Spec 004/005 evidence projection.
- **T3:** FindMnemo, FlowSensa, and runtime inventory adapters.
- **T4:** Pure five-ledger read model, lineage, conflicts, degradation, and change gaps.
- **T5:** Personal control profile and deterministic good-friction engine.
- **T6:** Bounded governance API plus decisions and bindings.
- **T7:** Governance workspace and lineage inspector.
- **T8:** Sanitized export and hosted/manual compatibility.
- **T9:** Cross-surface verification, performance, privacy, accessibility, and rollback proof.

## Verification Plan

```text
Commands: npm run test:collector; npm run verify:core; npm run build; npm audit
Collector: contract, replay, rotation, checkpoint, source isolation, security, and 100,000-event tests
Domain: pure projector, lineage, truth/authority, controls, change detection, and export tests
UI: Playwright desktop/mobile ledger, lineage, decision, stale, failed, manual, accessibility, and overflow checks
Privacy: prohibited-field, path sanitization, route/process, and no-external-request scans
Rollback: disable governance workspace/adapters while preserving existing registry and Spec 004/005 evidence
Expected: no governance claim upgrades observation, inference, recommendation, or declaration into enforcement proof
```

## Handoff Readiness

- **Ready for Implementation:** yes.
- **Ready for QA:** yes; implementation and cross-surface verification are complete for the approved local governance scope.
- **Ready for Release:** no.
- **Current Frontier:** no remaining local Spec 006 task; T10 latency remediation is reviewed complete. Retain the release gate while Spec 005 real-source qualification is incomplete.
- **Dependencies:** Spec 005 envelope and qualification semantics remain canonical; Spec 006 must not rewrite unfinished Spec 005 behavior.
- **Recommended Next Action:** Preserve the verified governance implementation and complete the approved Spec 005 real Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap evidence plus failure/recovery matrix when the Worker Remit and operator-selected target/workflow are available.

## T9 verification handoff

- Fresh commands: `npm run test:collector` (49 pass), `npm run verify:core` (pass), `npm run build` (pass), `npm audit` (0 vulnerabilities).
- Boundary/rollback: `scripts/verify-governance.ps1`, `scripts/verify-operations.ps1`, and `governance-rollback.test.ts` all pass.
- Browser: fresh desktop/mobile five-tab checks, keyboard focus, reduced-motion emulation, console/network, and viewport overflow evidence in `output/playwright/spec006-governance/`; the row-list UI has no HTML table-scroll surface.
- Review: `.ai/sdd/specs/006-local-agent-governance-ledgers/review.md`.

## T10 latency remediation handoff

- Fresh task: `.ai/sdd/specs/006-local-agent-governance-ledgers/tasks.md` T10.
- Sanitized evidence: `artifacts/qa/spec006/t10-latency-remediation-2026-07-20.md`.
- Stores cache unchanged append-only reads by file revision, invalidate after durable writes, and return defensive arrays.
- Configured native governance sources collect concurrently with source isolation preserved; append-only JSONL/checkpoint writes remain serialized.
- `GET /api/v1/governance/summary` is the bounded active-view path (100 rows per ledger, 200 gaps); `GET /api/v1/governance/export` remains the complete explicit snapshot path.
- Verification: 71 collector tests, core verification, build, high-level audit (0 vulnerabilities), governance/operations scans, and desktop/mobile Playwright all passed.
- Product readiness remains separate: Spec 005 still requires a fresh qualifying five-category/three-runtime failure-recovery window and remains not ready for release.
