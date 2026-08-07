# Review: Local Registry Compiler

> Status: Complete
> Reviewed: 2026-07-20/21 UTC
> Verdict: Approved

## Scope and source of truth

Reviewed the implementation against the approved artifacts:

- `.ai/sdd/specs/007-local-registry-compiler/requirements.md`
- `.ai/sdd/specs/007-local-registry-compiler/design.md`
- `.ai/sdd/specs/007-local-registry-compiler/tasks.md`
- `.ai/sdd/specs/007-local-registry-compiler/.status`
- `.ai/steering/conventions.md`, `.ai/steering/product.md`, and `.ai/steering/tech-stack.md`

The implementation scope is the standalone `packages/registry-compiler` package, its tests and review UI, the user-facing documentation, and the T6 evidence artifact at `artifacts/qa/spec007/registry-compiler-t6-verification.md`.

## Spec axis

| Area | Result | Evidence |
|------|--------|----------|
| FR-001/FR-002/FR-003 bounded metadata discovery | Pass | Fixed adapters cover the approved inventory families; read-only filesystem and privacy tests pass; the browser bundle exposes inspected roots and skipped items. |
| FR-004/FR-005/FR-006 review and conservative privacy | Pass | One-time loopback review requires explicit decisions; sensitive fixture metadata is skipped without echoing its value; browser confirmation completed. |
| FR-007 identity/provenance | Pass | Stable proposal identities merge platform/source provenance; merge and adapter tests pass. |
| FR-008 local/portable outputs | Pass | Confirmed compile produced schema-valid exact local and sanitized portable registries; `validate` exited 0. |
| FR-009 refresh/archive | Pass | Refresh diff is shown before confirmation, unchanged proposals produce `+0 ~0`, and archive/missing behavior is covered by serializer tests. |
| FR-010 diagnostics/validation | Pass | Schema/privacy/atomic validation and bounded diagnostics are exercised; partial discovery has a distinct exit code path. |
| FR-011 authority boundary | Pass | No generic command, subprocess, MCP, scan, policy, or upstream-execution route exists; package and privacy tests pass. |
| FR-012/FR-013/FR-014 distribution and roadmap | Pass | Windows-first npm metadata, compiled JS bin, npx-style install smoke, documentation, and deferred platform/automation scope are present. |
| NFR-001/NFR-002 privacy and trust | Pass | Portable scan is clean; output summaries contain bounded counts/hashes; rejected sensitive values are not emitted. |
| NFR-003/NFR-005 usability/accessibility | Pass | Grouped/filterable responsive review was verified at desktop and 390x844 mobile widths with focus, reduced-motion, same-origin network, and console checks. |
| NFR-004 reliability | Pass | Atomic replacement, backup, locked-file rollback, and refresh archive tests pass. |

## Task axis

| Task | Result | Evidence |
|------|--------|----------|
| T1 | Complete | Package shell, contracts, bounded CLI routing, and CLI tests. |
| T2 | Complete | Root authorization, read-only manifests, privacy classification, and filesystem tests. |
| T3 | Complete | Fixed adapters, stable identity/provenance merge, and adapter tests. |
| T4 | Complete | Loopback review server, token/origin protection, accessible UI, and browser checks. |
| T5 | Complete | Local/portable serializers, diagnostics, atomic writes, refresh diff, and recovery tests. |
| T6 | Complete | Compiled package metadata, documentation, npm pack/npx smoke, regressions, browser connect flow, and sanitized evidence. |

## Design decisions

| Decision | Result | Notes |
|----------|--------|-------|
| TD-001 separate compiler process | Pass | Compiler remains outside the collector and owns no upstream authority. |
| TD-002 proposal model | Pass | Review consumes bounded proposals before serializer projection. |
| TD-003 loopback review | Pass | Ephemeral tokenized server binds to `127.0.0.1`; mutation routes enforce same origin. |
| TD-004 explicit serializer projections | Pass | Local, portable, skipped, and summary outputs are built from explicit fields. |
| TD-005 stable identity/collision handling | Pass | Duplicate groups and merge provenance are retained for review. |

## Standards axis

- **Security/privacy:** Pass. The package is read-only, rejects unsafe CLI options, bounds filesystem reads and HTTP bodies, rejects root escapes, and applies explicit allowlists before output.
- **Accessibility/UI:** Pass. The review has semantic labels, visible focus, status text, reduced-motion CSS, responsive layout, and no overflow in desktop/mobile checks.
- **Reliability:** Pass. Atomic multi-file output and backup/rollback behavior preserve existing files on failure.
- **Maintainability:** Pass. Adapter, proposal, serializer, review, refresh, and filesystem seams are isolated and tested. The refresh fingerprint was consolidated into one helper so observation timestamps do not create false modifications.
- **Scope discipline:** Pass. The package does not add execution, publishing, cloud sync, arbitrary scanning, or automation mode beyond approved scope.

No blocking Standards or Spec findings remain. No unapproved authority or privacy expansion was found.

## Refactoring smell and simplification check

The review used the `sdd-review` smell baseline and inspected the package source for repeated switches, TODO/FIXME markers, duplicated parsing seams, command authority, and overly broad filesystem access.

- Repeated switch statements: none found.
- TODO/FIXME/HACK markers: none found.
- `child_process.spawn` appears only in the explicitly bounded Windows browser-launch helper; it does not execute discovered commands or upstream tools.
- Filesystem writes are isolated to the atomic output seam; source reads are isolated to the read-only filesystem seam. Test fixtures are the only other direct filesystem writers.
- The project-registry adapter and common inventory adapter each retain small parsing helpers because their manifest contracts differ. This is a contained duplication with no observed behavioral divergence and is a low-priority future consolidation, not a release blocker.
- The packaged review UI has compact render functions to keep the standalone asset dependency-free. Browser checks and semantic focus/status behavior pass; a readability refactor can be considered separately if the UI grows.

Result: no high or medium refactoring smell requires a corrective change before this review gate. The two low-priority observations are recorded rather than expanding the approved scope.

## Verification

The complete fresh verification record is `artifacts/qa/spec007/registry-compiler-t6-verification.md`.

| Command/check | Result |
|---------------|--------|
| `npm run build:registry-compiler` | PASS |
| `npm run test:registry-compiler` | PASS, 22/22 |
| `npm run test:collector` | PASS, 71/71 |
| `npm run verify:core` | PASS |
| `npm run build` | PASS |
| `npm audit --audit-level=high` | PASS, 0 vulnerabilities |
| `npm pack --dry-run --json` | PASS, 49 safe entries; no source/test/fixture or key files |
| Temporary packed npx-style invocation | PASS, version `0.1.0`, exit 0 |
| Playwright desktop/mobile review and browser confirm | PASS; no console errors/warnings or overflow |

## Verdict

Approved. Spec 007 implementation and review gates are complete. This package is a local, Windows-first metadata compiler and does not change the separate Spec 005 release gate or claim production readiness for Spec 005.
