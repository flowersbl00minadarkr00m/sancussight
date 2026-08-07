# Fresh-session handoff: Spec 005 T10

Continue SancusSight Spec 005 T10 in the canonical project resolved by the shared registry.

## Current state

- Spec 005 `.status` is `review:done` after approved Amendment A-001 implementation and review; T1-T10 remain historically complete and T11/T12 are now implemented.
- Current verdict is **Not ready for release**. Historical passing bundles are point-in-time evidence only.
- The latest run, `spec005-t10-20260720221208`, was an explicitly Claude-deferred partial revalidation. This did not amend the approved requirements or design.
- Fresh evidence in that run: both canonical Praxen targets, safe RAMPART/Pi, exact-scope AIMap, Codex and Pi metadata-only telemetry, and 15/15 failure/recovery cases. Claude hit its external session limit and emitted only startup/connection plus `api_error` observations. The Claude-backed Pipelock workflow produced no packet.
- The release builder failed closed with `Required release evidence is missing`; Pipelock was absent. The Praxen observation also aged beyond the five-minute same-window boundary. No release bundle was generated and no historical evidence was relabeled.
- Regression checks passed: collector 71/71, core, build, audit (0 vulnerabilities), operations, governance, RAMPART sanitizer, and desktop/mobile Playwright behavior.
- A fresh access probe later returned successfully, but three new isolated `praxen:behavior-verifier` attempts (`spec005-t10-20260721012015`, `spec005-t10-20260721012600`, and `spec005-t10-20260721012814`) stalled before the required Step 9.9 checkpoint and canonical report. They were stopped without promoting any output; the `sdd-exec` target and all other producers were not started for those tokens.
- Computer Use then inspected the Claude desktop window and found an older completed chat with no visible login, authentication, quota, or session-limit message. A New session click was not completed after the helper reported user input in that window. One further fresh isolated retry (`spec005-t10-20260721051230`) started Claude Code 2.1.214 but again stalled before Step 9.9 with an empty reports directory; its exact process tree was stopped without promotion.
- A separate longer timing diagnostic (`spec005-t10-longdiag-20260721052347`) was allowed to continue. One SancusSight Praxen target eventually completed all 12 steps and emitted schema-2 JSON plus HTML/TXT reports after roughly 4-5 minutes. This confirms the workflow can be slow rather than permanently unavailable, but it still does not qualify the release and did not run the second target or other gates.
- Amendment A-001 was explicitly approved on 2026-07-21. It adds advisory, metadata-only producer progress and a 30-minute orchestration window; the five-minute per-source/runtime freshness rule remains unchanged.
- T11/T12 implementation is complete. The fixed writer, schema validator, read-only collector endpoint, run binding, stale handling, determinate/indeterminate panel, and 30-minute gate boundary are verified in `artifacts/qa/spec005/a001-progress-orchestration-20260721071846.md`.
- A fresh concurrent run `spec005-t10-20260721144104` completed both canonical Praxen targets, all other required producers/runtimes, and the 15-case matrix, but bundle evaluation failed closed with `praxen:stale-evidence`: canonical `scan_timestamp` was `14:42:09Z` and final evaluation was `14:50:53Z`. A narrow retry `spec005-t10-20260721145201` refreshed the faster producers but the SancusSight Praxen target did not reach Step 9.9 before the shared scan-start timestamp aged past five minutes. No bundle was generated for either token.

## Next qualifying attempt

Wait until Claude access is available for the qualifying run. For the amended approved contract:

1. Use a new run token and isolated producer output directories.
2. Complete canonical schema-2 Praxen reports for SancusSight and `sdd-exec` first.
3. Allow up to 30 minutes for orchestration, while ensuring every required source/runtime is no more than five minutes old at final evaluation. Capture successful metadata-only Codex CLI, Claude Code, and Pi telemetry plus a verified approved Pipelock allow/block packet, safe RAMPART/Pi, and exact authorized AIMap.
4. Run all 15 source-isolated failure/recovery cases, retrying only a transient artifact-rotation seam if freshly observed.
5. Build the sanitized bundle and retain fail-closed behavior for every missing freshness, source, runtime, provenance, privacy, verification, target-binding, or recovery condition.
6. Run proportionate regression and browser checks, then update SDD evidence from fresh results and refresh the project registry.

The latest non-qualifying Praxen attempt is documented at `artifacts/qa/spec005/t10-praxen-attempt-spec005-t10-20260721051230.md`; the prior attempts remain documented separately. A future attempt must use a new run token and must not reuse any empty output directory or historical findings.

The timing diagnostic is documented at `artifacts/qa/spec005/t10-praxen-longdiag-spec005-t10-20260721052347.md`. Amendment A-001 now explicitly approves the 30-minute orchestration deadline. Do not treat progress status as evidence or the diagnostic report as release evidence.

The latest concurrent operational evidence is documented at `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260721144104.md`. It confirms that rendered-file completion time does not refresh Praxen's canonical scan-start observation and that the final bundle must be evaluated within five minutes of that canonical timestamp.

Boundaries remain unchanged: SancusSight is read-only; upstream execution remains operator-owned; no generic command surface, arbitrary filesystem access, machine-wide interception, policy mutation, raw prompt/response/reasoning retention, credentials, private keys, raw scan payloads, or unrestricted workspace content may enter normalized evidence or exports.

## Evidence references

- `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260720221208.md`
- `artifacts/qa/spec005/t10-praxen-attempt-spec005-t10-20260721051230.md`
- `artifacts/qa/spec005/t10-praxen-longdiag-spec005-t10-20260721052347.md`
- `artifacts/qa/spec005/a001-progress-orchestration-20260721071846.md`
- `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260721144104.md`
- `%LOCALAPPDATA%/SancusSight/operations/runs/spec005-t10-20260720221208/failure-matrix.json`
- `%LOCALAPPDATA%/SancusSight/operations/exports/praxen/spec005-t10-20260720221208/`
- `.ai/sdd/specs/005-operational-evidence-producers/tasks.md`
- `.ai/sdd/specs/005-operational-evidence-producers/review.md`
- `.ai/sdd/specs/005-operational-evidence-producers/.status`
