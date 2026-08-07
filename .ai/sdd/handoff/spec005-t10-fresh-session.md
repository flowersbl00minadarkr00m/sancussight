# Completion Handoff: Spec 005 T10

> Completed: 2026-07-18  
> Canonical project: `C:\Users\henry\sancussight`  
> Spec status: `review:done`  
> Release run: `spec005-t10-20260718b`

T10 is complete. The same-window manifest passed five operational evidence categories, Codex CLI/Claude Code/Pi runtime coverage, and all 15 mandatory failure/recovery cases. The privacy-safe bundle is at `artifacts/qa/spec005/t10-release-spec005-t10-20260718b/`, and the final two-axis review is `.ai/sdd/specs/005-operational-evidence-producers/review.md`.

Final corrected-state verification passed 63 collector tests, core verification, production build, and dependency audit with zero vulnerabilities. Playwright verified desktop/mobile readiness and expiry truth, loopback-only behavior, keyboard access, reduced motion, no console errors, and no horizontal overflow.

One Standards-review finding was fixed before approval: release presentation now resolves only manifest-referenced evidence, using the same helper as gate calculation. The regression test is `release presentation resolves only records referenced by the manifest`.

The captured run is qualifying release evidence. Its live five-minute window has elapsed, so the current UI correctly reports expiry; any later current-readiness decision requires a new fresh run rather than reuse of this historical pass.

All original authority and privacy boundaries remain in force. SancusSight is read-only and exposes no producer execution, scan, proxy-policy, generic command, arbitrary filesystem, or upstream mutation surface.

## Fresh revalidation note — 2026-07-18 run `spec005-t10-20260718c`

The expired `spec005-t10-20260718b` pass was not reused. Fresh Praxen, RAMPART/Pi, AIMap, Codex, and Pi producer paths were exercised with the new bounded run token. The 15-case failure/recovery matrix passed, but Claude Code returned an error before telemetry/tool execution because the operator account had exceeded its Claude usage limit, and the controlled Pipelock workflow produced no allow/block pair. The release bundler therefore refused to create a bundle; SancusSight remains Not ready for release. See the fresh evidence section in `tasks.md` for exact verification and blockers. No `.status` transition was made.

## Qualifying revalidation note — 2026-07-18/19 run `spec005-t10-20260718e`

Claude access was restored after the operator usage reset. The same approved no-tool Claude telemetry session, Pipelock allow/block workflow, Praxen targets, RAMPART/Pi suite, AIMap authorization, and Codex/Pi sessions were rerun in one bounded window. All 15 failure/recovery cases passed, all five categories and three runtimes were accepted, and the sanitized release bundle was generated at `artifacts/qa/spec005/t10-release-spec005-t10-20260718e/` with `status: passed`, `ready: true`, and zero blockers. The bundle contains only normalized evidence, the release manifest, failure matrix, gate result, and boundary README.

Fresh regression/privacy checks passed: collector 69/69, core, build, npm audit with zero vulnerabilities, operations verification, RAMPART sanitizer verification, and exact bundle privacy scanning. Playwright verified the loopback collector at desktop/mobile sizes, zero console errors, `200` loopback API responses, visible keyboard focus, no overflow, and the mobile Evidence Sources contract arrow. After the five-minute point-in-time window elapsed, the UI truthfully reports `Release evidence expired`; this does not invalidate the stored qualifying bundle. `.status` remains `review:done`, and all read-only/upstream authority and privacy boundaries remain unchanged.

## Bounded retry note - 2026-07-18/19 run `spec005-t10-202607182216`

Pi/RAMPART, Pipelock, AIMap, Codex, and a fresh SancusSight Praxen projection were exercised under a new run token. The 15-case failure/recovery matrix passed and 69 collector tests, core verification, build, and npm audit (zero vulnerabilities) passed. The release bundler correctly refused to create a bundle because Claude runtime evidence and the second approved `sdd-exec` Praxen target were not present in the run. Claude Code reported an external session-limit blocker (`resets 1:30am America/Vancouver`); no historical evidence was relabeled and `.status` remains `review:done`.

## Bounded retry note - 2026-07-19 run `spec005-t10-202607190215`

Both approved Praxen scans completed fresh canonical reports at `09:30:29Z` and `09:30:53Z`; exact Worker Remit hashes were bound in sanitized operational projections and 26 records were accepted by the collector. Pipelock, RAMPART/Pi, AIMap, and Codex/Claude/Pi metadata telemetry were refreshed afterward, and `npm run verify:t10-matrix` passed all 15 cases. The OTLP projection now admits only the additional bounded metadata key `http.response.status_code`; collector tests remain 69/69.

The bundle builder evaluated the actual collector evidence and refused release qualification because Praxen, Pipelock, and AIMap had crossed the five-minute freshness boundary (`praxen:stale-evidence`, `pipelock:stale-evidence`, `aimap:stale-evidence`). A subsequent Claude rerun was blocked by the external session cap (`resets 7:10am America/Vancouver`); a Pi-assisted attempt did not write canonical findings and is excluded. `npm run verify:core`, `npm run build`, `npm audit` (0 vulnerabilities), `scripts/verify-operations.ps1`, and `scripts/test-rampart-export.ps1` passed. No stale evidence was relabeled, no bundle was generated for this run, `.status` remains `review:done`, and SancusSight remains **Not ready for release**.

## Follow-up retry note - 2026-07-19 runs `spec005-t10-202607191002`, `spec005-t10-202607191012`, `spec005-t10-202607191016`, and `spec005-t10-202607191022`

Claude availability briefly allowed complete Praxen scans, then the account hit its session cap again. Run `spec005-t10-202607191002` completed both targets, but the observations were already outside the five-minute release window by the time the remaining evidence could be closed. A lower-effort retry produced a clean SancusSight report (`17:15:49Z`, 0 findings, 55/55 rules verified) and a separate `sdd-exec` report (`17:10:20Z`, 3 findings); they are intentionally not combined because they have different run IDs. The parallel `spec005-t10-202607191022` attempt produced only Praxen drafts before Claude reported `resets 2:50pm`; its Pipelock/RAMPART/AIMap outputs are not sufficient without both canonical Praxen reports. The failure matrix passed 15/15 on immediate rerun after a transient artifact-rotation timing miss. Local regression checks remain green (collector 69/69, core, build, audit 0 vulnerabilities). No bundle was generated, no stale evidence was relabeled, `.status` remains `review:done`, and SancusSight remains **Not ready for release**.

## Bounded fresh-window retry note — 2026-07-20 run `spec005-t10-202607192244`

The Pipelock exercise script was fixed to select the newest producer evidence segment deterministically. A clean run produced 3 allows, 1 controlled block, 1 tool allow, and 1 tool block with a trusted verified chain; a later same-token rerun correctly failed closed because multiple sessions shared one evidence directory, and that invalid packet was not promoted. Fresh Praxen schema-2 reports, RAMPART/Pi, AIMap, and Codex/Claude/Pi metadata-only telemetry were ingested under the run token. The 15-case failure/recovery matrix passed after an immediate artifact-rotation retry; collector 69/69, core, build, and npm audit (0 vulnerabilities) passed.

The release bundler refused the actual evidence with `praxen:stale-evidence` and `pipelock:stale-evidence`. No bundle was generated, no timestamps were relabeled, and `.status` remains `review:done`; SancusSight remains **Not ready for release**. The next qualifying attempt must use a new run token and a clean Pipelock evidence directory, then refresh both approved Praxen targets and all five categories inside one five-minute window.

## Bounded revalidation note - 2026-07-20 run `spec005-t10-20260720143255`

Both approved Praxen execution jobs timed out before their canonical schema-2 findings files were produced. Incomplete drafts were excluded, and no historical evidence was relabeled. The independent portions of the window succeeded: RAMPART/Pi safe result, exact-scope AIMap fingerprint, trusted Pipelock allow/block chain, and Codex/Claude/Pi metadata-only telemetry (181 accepted records, all `contentCapture: false`). The 15-case failure/recovery matrix passed after immediate retry; collector 71/71, core, build, audit (0 vulnerabilities), governance, operations, sanitizer, and desktop/mobile Playwright checks passed.

The release bundler failed closed with `Required release evidence is missing`; no bundle was generated. Exact blockers are the missing run-scoped SancusSight and `sdd-exec` Praxen reports. `.status` remains `review:done`, and SancusSight remains **Not ready for release**. See `artifacts/qa/spec005/t10-revalidation-spec005-t10-20260720143255.md`.

## Bounded Praxen retry note - 2026-07-20 run `spec005-t10-20260720150700`

The installed Praxen plugin was invoked directly in isolated target directories. SancusSight emitted a fresh canonical schema-2 report at `2026-07-20T15:05:19Z`; the approved `sdd-exec` target emitted only drafts and did not complete canonical JSON before the same-window deadline. The drafts were excluded and the process was stopped after the deadline. No other producers or bundle were attempted for this non-qualifying token. `.status` remains `review:done`; SancusSight remains **Not ready for release**. A future attempt must complete both canonical Praxen reports first, then close all five categories, three runtimes, and 15 cases inside one five-minute window.
