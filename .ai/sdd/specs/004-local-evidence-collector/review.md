# Review: Local Evidence Collector

> Status: Complete
> Date: 2026-07-12
> Verdict: Approved within scope; product release blocked

## Summary

Spec 004 delivers a bounded, read-only local evidence collector for Agent Beacon, Praxen, and Pipelock. The companion serves the same frontend and `/api/v1` from one loopback origin, normalizes allowlisted evidence into versioned deterministic envelopes, persists checkpoints and bounded accepted/rejected records, correlates only by stable ID or confirmed binding, and exposes independent source health in the selected Evidence Ledger interface.

The Spec axis passes. The Standards axis passes. No blocking, high, medium, or low Spec 004 implementation finding remains. Release QA ingested fresh artifacts from independently installed Agent Beacon, Praxen, and Pipelock tools with zero ingestion rejections, but this proves compatibility rather than continuous operation against the user's real AI environment.

## Requirement Coverage

| Requirement | Result | Evidence |
|---|---|---|
| FR-001 | Pass | Known-adapter path configuration validates expected read-only artifacts before persistence. |
| FR-002 | Pass | Agent Beacon JSONL, Praxen findings 2.0, and Pipelock Audit Packet v0 adapters are implemented independently. |
| FR-003 | Pass | `EvidenceEnvelopeV1` includes version, source, kind, times, subject, outcome, provenance, and bounded attributes. |
| FR-004 | Pass | Content hash, safe artifact name, parser ID/version, source record ID, and explicit verification state are retained. |
| FR-005 | Pass | Atomic checkpoints, deterministic IDs, restart indexes, rotation handling, partial-line lag, and duplicate rejection suppression are verified. |
| FR-006 | Pass | The source rail shows evidence type, freshness, last accepted time, rejected count, lag, and exactly one textual health state. |
| FR-007 | Pass | Adapter failures are isolated; accepted evidence remains; failed, stale, permission, retry, and replacement guidance are present. |
| FR-008 | Pass | Adapter field allowlists exclude prompts, command bodies, workspace excerpts, raw results, secrets, and unrestricted content. |
| FR-009 | Pass | No tool execution, subprocess, source write, generic filesystem, scan, test, proxy-policy, or command surface exists. |
| FR-010 | Pass | Bound evidence reaches Ledger, Registry signals, Queue, Activity, provenance detail, and Exit Test without overwriting human facts. |
| FR-011 | Pass | Hosted registry/manual snapshots and retained local evidence continue when the collector is unavailable, with current rows downgraded to stale. |
| FR-012 | Pass | Confirmed disconnect removes collector-owned configuration/checkpoints/normalized records and leaves source artifacts untouched. |
| FR-013 | Pass | RAMPART, Kiji Privacy Proxy, and AIMap remain disabled catalog entries with explicit contract/privacy/authorization boundaries. |
| NFR-001 | Pass | Loopback-only bind, Host/Origin/session/CSRF controls, restrictive CSP, safe errors, local storage, and no external runtime request. |
| NFR-002 | Pass | Append-only evidence, quarantine, hashes, atomic checkpoints, dedupe, visible verification failure, and isolated recovery. |
| NFR-003 | Pass | Recorded facts, deterministic findings, missing evidence, and human decisions are separate; evidence references and freshness remain visible. |
| NFR-004 | Pass | Native keyboard controls, textual health, inline recovery, desktop rail, mobile source command, and zero horizontal overflow. |
| NFR-005 | Pass | Metadata short-circuits, one poll per source, lag, 25 MB artifact limit, 10,000/1,000 per-source retention, and validated compaction. |
| NFR-006 | Pass | Version-pinned adapters fail independently; envelopes export; hosted manual import/export remains available. |

## Task Coverage

| Task | Result | Evidence |
|---|---|---|
| T1 | Pass | Contracts, atomic persistence, append-only stores, restart dedupe, quarantine, path separation, and tests. |
| T2 | Pass | Same-origin loopback server, constrained API, security controls, static UI, and explicit hosted degradation. |
| T3 | Pass | Three upstream adapters, fixtures, redaction, rotation, version rejection, verification states, and later catalog. |
| T4 | Pass | Exact correlation, confirmed binding, unmapped queue, authority preservation, activity, findings, and Exit Test integration. |
| T5 | Pass | Compact Evidence Ledger, desktop/mobile source experience, all source states, recovery actions, and snapshot mode. |
| T6 | Pass | Retention, retry, shutdown, CSP alignment, documentation, source scans, production inspection, and screenshots. |

## Design Coverage

| Decision | Result | Evidence |
|---|---|---|
| TD-001 | Pass | Local companion serves UI and API from one loopback origin; hosted mode does not probe it. |
| TD-002 | Pass | Framework-free Node/TypeScript service uses constrained platform APIs and Node 24 native TypeScript execution. |
| TD-003 | Pass | Coalesced metadata polling is authoritative; no filesystem watcher is required. |
| TD-004 | Pass | Accepted/rejected JSONL plus atomic configuration/checkpoint files and validated compaction. |
| TD-005 | Pass | Stable ID or confirmed exact binding only; name-only similarity remains unmapped. |
| TD-006 | Pass | Verified, failed, unavailable, and not-applicable remain distinct; failed Pipelock evidence is quarantined. |
| TD-007 | Pass | API exposes no source-tool control, execution, scan, test, policy, or generic path operation. |

## Spec Axis

**Result: Pass.** All Must Have and Should Have requirements are implemented within the approved boundary. The collector governs artifacts rather than bundling tools, the canonical registry remains separate, hosted mode remains useful, and no later adapter or operational authority was silently enabled.

## Standards Axis

**Result: Pass.** Pure adapters and correlation logic are separated from persistence, scheduling, HTTP, and React. State-changing requests are constrained; errors and artifact identities are path-safe; source writes are absent; storage is deterministic and bounded; browser controls are stable and accessible; and the CSP no longer conflicts with inline component styles.

The coherence review removed duplicate rejection records, duplicate per-record binding decisions, stale localStorage wrappers, permanent replacement-path controls, inline style mechanisms, and an ineffective hosted-mode claim. Remaining concepts correspond directly to approved source, checkpoint, evidence, health, correlation, recovery, or authority semantics.

## Verification

| Check | Result |
|---|---|
| `npm run test:collector` | Pass, exit 0; 10 tests. |
| `npm run verify:core` | Pass, exit 0. |
| `npm run build` | Pass, exit 0; collector TypeScript, frontend TypeScript, and Vite. |
| `npm audit` | Pass, 0 vulnerabilities. |
| `git diff --check` | Pass, exit 0; line-ending notices only. |
| Capability scans | Pass; no child process, wildcard bind/CORS, collector outbound client, adapter writes, or inline runtime styles. |
| Hosted preview | Pass; Hosted/manual, no `/api`, localhost, or external request, snapshot import/persistence/export/clear verified. |
| Local preview | Pass; three current sources, four normalized records, no external request or console error. |
| Recovery matrix | Pass; not-configured, current, stale, failed, permission-required, retry, and degraded states verified. |
| Responsive/keyboard | Pass at 1280x720 and 390x844; no overflow, clipped nav, focus loss, or remount during path editing. |

## Findings

No blocking, high, medium, or low implementation findings remain.

## Release QA

- Agent Beacon `v1.0.1` emitted two genuine Codex events; SancusSight accepted both.
- Praxen `1.1.0` generated a fresh schema `2.0` report; SancusSight accepted 11 findings and two positives.
- Pipelock `v3.1.0` generated a three-receipt Audit Packet; the standalone verifier returned valid and trusted, and SancusSight accepted the packet.
- All 16 normalized records matched the approved adapter contract shapes with zero ingestion rejections.
- Detailed evidence: `artifacts/qa/spec004-real-tool-smoke.md` and `artifacts/qa/spec004-real-tool-normalized-evidence.json`.

## Known Boundary

Pipelock provenance remains `unavailable` inside SancusSight until an approved verifier integration can use a trusted pinned public key without adding a generic subprocess surface. Agent Beacon ran once around a real Codex invocation, Praxen assessed an OWASP example target, and Pipelock controlled an official synthetic demo agent. These checks validate contracts but do not prove persistent monitoring, findings against the user's actual governed assets, or enforcement in the user's real AI execution path.

Product release is blocked by `.ai/sdd/specs/005-operational-evidence-producers/requirements.md` until real sessions prove fresh events, actual findings, real allow/block decisions, trusted signed receipts, RAMPART safety-test results, authorized AIMap findings, and failure recovery end to end.

## Verdict

**Approved within scope.** Spec 004 is a completed compatibility foundation. SancusSight is not ready for product release until Spec 005 is approved, implemented, and reviewed.
