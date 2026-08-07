# Tasks: Local Registry Compiler

> Requirements: @requirements.md
> Design: @design.md
> Status: Approved — corrective T7 explicitly approved 2026-07-24 after the task microworld was declined

## Requirement Coverage

| Requirement | Tasks |
|-------------|-------|
| FR-001, FR-002, FR-003, FR-005, FR-006, FR-011 | T1, T2, T3 |
| FR-004 | T4 |
| FR-007 | T3 |
| FR-008, FR-009 | T5 |
| FR-010 | T1, T3, T5, T6, T7 |
| FR-012 | T1, T6, T7 |
| FR-013, FR-014 | T1, T6 |
| NFR-001, NFR-002 | T1, T2, T3, T5, T6, T7 |
| NFR-003, NFR-005 | T4, T6 |
| NFR-004 | T5 |

## Implementation Readiness Check

| Check | Status | Notes |
|-------|--------|-------|
| Must Have requirements have tasks | Pass | Every FR-001 through FR-012 is mapped. |
| Requirements are covered by design | Pass | Design mapping covers all Must Haves and NFRs. |
| Critical questions are answered | Pass | Q-001 through Q-003 are answered. |
| Tasks have blockers, acceptance, files, and verification | Pass | Every ticket has all four. |
| Verification commands are known | Pass | Existing build/core/collector/audit plus package and browser checks. |
| Approved frontier is identified | Pass | T7 is the sole corrective frontier. Execution is intentionally blocked by the external npm-authentication prerequisite until `npm whoami` succeeds on this machine. |

## Frontier

| Task | Blocked By | Status |
|------|------------|--------|
| T1 | None | Complete |
| T2 | T1 | Complete |
| T3 | T1, T2 | Complete |
| T4 | T3 | Complete |
| T5 | T3, T4 | Complete |
| T6 | T5 | Complete |
| T7 | T6, npm authentication | Approved / Blocked by external authentication |

## Task T1: Compiler package contracts and CLI shell

**Priority:** P0  
**Estimate:** 2h  
**Blocked By:** none  
**Covers:** FR-010, FR-011, FR-012, FR-013  
**Delivers:** A Windows-first npm package shell with typed contracts and safe compile, refresh, and validate routing.

### Work

- [x] Add packages/registry-compiler package metadata and executable entry point.
- [x] Define proposal, source observation, skipped item, diagnostic, review decision, output, and refresh contracts.
- [x] Reject unknown commands, arbitrary executable strings, and argument passthrough.
- [x] Add schema/version constants and contract fixtures.

### Acceptance Criteria

- [x] Package help and routing work; unsafe options fail closed.
- [x] Contract fixtures contain no prohibited content fields.
- [x] Package builds under the repository toolchain.

### Files

- packages/registry-compiler/package.json
- packages/registry-compiler/src/cli.ts
- packages/registry-compiler/src/contracts.ts
- packages/registry-compiler/src/index.ts
- package.json and tsconfig files only as needed for build wiring

### Verification

- [x] TypeScript/build passes.
- [x] CLI help and unknown-option tests pass.
- [x] Prohibited-field contract test passes.

## Task T2: Windows root authorization and read-only filesystem seam

**Priority:** P0  
**Estimate:** 3h  
**Blocked By:** T1  
**Covers:** FR-001, FR-002, FR-005, FR-006, FR-011, NFR-001, NFR-002  
**Delivers:** Confirmed-root Windows discovery that is read-only, size-bounded, link-safe, and diagnostic-rich.

### Work

- [x] Implement confirmed-root normalization and bounded directory/metadata reads.
- [x] Reject out-of-root paths, junction/symlink escapes, oversized entries, and unsupported formats.
- [x] Add conservative sensitivity/skipped classification without echoing sensitive values.
- [x] Add the canonical project-registry adapter.

### Acceptance Criteria

- [x] Out-of-root and link-escape fixtures cannot be read.
- [x] Permission, malformed, sensitive, and unsupported cases are isolated and bounded.
- [x] No adapter can execute a command or open an upstream process.

### Files

- packages/registry-compiler/src/fs/read-only.ts
- packages/registry-compiler/src/fs/roots.ts
- packages/registry-compiler/src/privacy/classify.ts
- packages/registry-compiler/src/adapters/project-registry.ts
- packages/registry-compiler/src/__tests__/fs.test.ts

### Verification

- [x] Root escape, permission, size, malformed, and prohibited-field tests pass.
- [x] npm run verify:core remains green.

## Task T3: Fixed known-inventory discovery and proposal merge

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T1, T2  
**Covers:** FR-001, FR-002, FR-003, FR-005, FR-006, FR-007, FR-011, FR-013, NFR-001, NFR-002  
**Delivers:** Metadata-only adapters for skills/plugins, commands, loops, workflows, MCPs, posts, agent configs, controls, evaluations, contracts, and adapters, with stable identity and provenance.

### Work

- [x] Implement fixed adapters behind the common adapter contract.
- [x] Parse only allowlisted manifest/front-matter metadata and provider/platform labels.
- [x] Implement stable identity, duplicate merge, collision proposals, confidence, and source observations.
- [x] Add absent-provider, duplicate, malformed, and sensitive-field fixtures.

### Acceptance Criteria

- [x] Every supported family produces safe metadata proposals without content bodies, command arguments, tool payloads, or credentials.
- [x] Same logical assets merge with platform coverage and per-source provenance.
- [x] Uncertain collisions remain visible rather than silently merging.
- [x] Adapter output is deterministic for unchanged fixtures.

### Files

- packages/registry-compiler/src/adapters/skills.ts
- packages/registry-compiler/src/adapters/agent-config.ts
- packages/registry-compiler/src/adapters/mcp.ts
- packages/registry-compiler/src/adapters/workflows.ts
- packages/registry-compiler/src/adapters/governance.ts
- packages/registry-compiler/src/proposals/identity.ts
- packages/registry-compiler/src/proposals/merge.ts
- packages/registry-compiler/src/__tests__/adapters-merge.test.ts

### Verification

- [x] Adapter and merge tests pass with safe sibling retention.
- [x] Serialized proposal privacy scan finds no prohibited keys.

## Task T4: Loopback browser review experience

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T3  
**Covers:** FR-004, FR-005, NFR-002, NFR-003, NFR-005  
**Delivers:** Grouped browser review with recommended selections, filters, skipped details, collision decisions, root scope, and explicit confirm/cancel.

### Work

- [x] Add an ephemeral loopback review server with one-time token, origin checks, bounded timeout, and no external route.
- [x] Package static review assets with the npm package.
- [x] Render proposals by source/type with confidence, sensitivity, provenance, coverage, and merge explanations.
- [x] Add keyboard focus, reduced motion, responsive grouping, cancellation, and confirmation.

### Acceptance Criteria

- [x] CLI opens the review with only the bounded proposal bundle.
- [x] Confirm submits IDs/overrides only; cancel leaves prior outputs unchanged.
- [x] Invalid token/origin mutations are rejected.
- [x] Desktop/mobile checks show no console errors, external requests, focus regressions, reduced-motion violations, or overflow.

### Files

- packages/registry-compiler/src/review/server.ts
- packages/registry-compiler/src/review/session.ts
- packages/registry-compiler/ui/
- packages/registry-compiler/src/__tests__/review-server.test.ts
- output/playwright/registry-compiler/

### Verification

- [x] Review server route/security tests pass.
- [x] Playwright desktop and 390x844 mobile checks pass.

## Task T5: Local/portable serializers and refresh archive

**Priority:** P0  
**Estimate:** 4h  
**Blocked By:** T3, T4  
**Covers:** FR-008, FR-009, FR-010, NFR-001, NFR-004  
**Delivers:** Atomic exact local output, sanitized portable export, sidecar, skipped report, refresh diff, archive/missing state, backups, and recovery.

### Work

- [x] Serialize confirmed proposals into schema-version-2 local registry output.
- [x] Serialize portable aliases without exact user/home paths or prohibited values.
- [x] Implement source fingerprints, refresh diff, archived/missing records, backups, and atomic replacement.
- [x] Validate output before replacement and preserve prior files on failure.

### Acceptance Criteria

- [x] Local output is accepted by existing importJSON-compatible schema validation.
- [x] Portable output passes schema/privacy checks and contains no identifying absolute paths.
- [x] Refresh shows additions/changes/missing items before confirmation and archives disappeared assets.
- [x] Failed validation or locked output leaves prior files unchanged.

### Files

- packages/registry-compiler/src/output/local.ts
- packages/registry-compiler/src/output/portable.ts
- packages/registry-compiler/src/output/diagnostics.ts
- packages/registry-compiler/src/refresh/diff.ts
- packages/registry-compiler/src/output/atomic.ts
- packages/registry-compiler/src/__tests__/output-refresh.test.ts

### Verification

- [x] Existing importJSON-compatible validation accepts generated local output.
- [x] Portable privacy scan finds no raw content, credentials, private keys, or exact user/home paths.
- [x] Refresh, backup, locked-file, and partial-failure tests pass.

## Task T6: Package hardening, documentation, and end-to-end verification

**Priority:** P1  
**Estimate:** 4h  
**Blocked By:** T5  
**Covers:** FR-010, FR-012, FR-013, FR-014, NFR-002, NFR-005  
**Delivers:** Public npm metadata, Windows documentation, validation/diagnostic commands, package smoke path, and acceptance evidence.

### Work

- [x] Add package exports, version checks, npm pack --dry-run, and temporary npx smoke verification.
- [x] Implement bounded exit codes for success, cancellation, validation failure, and partial discovery.
- [x] Document roots, privacy, skipped items, output paths, refresh, recovery, and deferred platform/automation scope.
- [x] Run repository regressions and browser acceptance checks.

### Acceptance Criteria

- [x] A Windows user can install, compile, review, confirm, validate, refresh, and connect without hand-authoring JSON.
- [x] Package contents exclude secrets, raw fixtures, and unrestricted source content.
- [x] Existing SancusSight tests/build remain green.
- [x] Verification evidence contains safe counts, roots, skipped categories, hashes, and commands only.

### Files

- packages/registry-compiler/README.md
- packages/registry-compiler/package.json
- packages/registry-compiler/scripts/
- README.md
- artifacts/qa/spec007/

### Verification

- [x] npm run build, npm run test:collector, npm run verify:core, and npm audit pass.
- [x] npm pack --dry-run and temporary npx invocation pass.
- [x] Playwright desktop/mobile review and connect flow pass.
- [x] Standards/spec review finds no authority or privacy regression.

## Task T7: Publish the compiler and verify the public npm path

**Priority:** P0  
**Estimate:** 1–2h  
**Blocked By:** T6, explicit approval of this corrective task, and successful operator authentication reported by `npm whoami`  
**Covers:** FR-010, FR-012, NFR-001, NFR-002  
**Delivers:** The reviewed `sancussight-registry` package is publicly installable from the npm registry at an exact version, and the hosted `npx sancussight-registry` path is verified against that public artifact rather than a temporary local tarball.  
**Owned Surfaces:** `packages/registry-compiler/package.json`, `packages/registry-compiler/README.md`, `README.md`, `artifacts/qa/spec007/`, and append-only `.ai/sdd/specs/007-local-registry-compiler/execution/T7.md`  
**Coordination:** `tracking_owner: orchestrator`; the worker may publish the exact approved package and write only the owned implementation/evidence surfaces. The orchestrator alone updates `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, and `.ai/sdd/handoff/sdd-brief.md`. No other release worker may overlap this ticket.  
**Routing:** `model_class: standard`; `effort: high`; rationale: the code path is already reviewed, but npm publication is a consequential external mutation requiring privacy, provenance, and clean-install verification. `high_tier_second_opinion: not-required`.  
**Session:** `session_policy: new-top-level-required`; a fresh visible top-level worker must acknowledge the exact package, version, registry, owned surfaces, and return path before any publish command. Missing usage telemetry triggers conservative rollover before further mutation.  
**Lifecycle Evidence:** append-preserving stable `event_id` records for `acknowledged`, `started`, and exactly one of `blocked`, `verification-failed`, or `ready-for-review`; every verification record includes command, exit code, bounded output summary, and PASS/FAIL.

### Work

- [ ] Reconcile npm identity and registry without printing tokens or credential material; require `npm whoami` to succeed and confirm the public package name/version is not already occupied by an incompatible artifact.
- [ ] Build and test the compiler, inspect the exact `npm pack --dry-run --json` allowlist, and create a temporary tarball solely for final content/hash inspection.
- [ ] Publish exactly `sancussight-registry@0.1.0` from `packages/registry-compiler` with public access. Do not force, overwrite, deprecate, or unpublish any version.
- [ ] Verify public registry metadata and run the published CLI from a fresh temporary directory with no repository-local package resolution.
- [ ] Record sanitized publication evidence and reconcile the hosted/README command against the public artifact.

### Acceptance Criteria

- [ ] `npm whoami` succeeds before publication; no credential or token value enters logs or evidence.
- [ ] The exact publish tarball contains only the approved package allowlist and passes the existing privacy boundary.
- [ ] `npm publish --access public` succeeds once for `sancussight-registry@0.1.0`, or the task stops blocked without attempting a destructive workaround.
- [ ] `npm view sancussight-registry@0.1.0 version` returns `0.1.0` from `https://registry.npmjs.org/`.
- [ ] A clean temporary invocation of `npx --yes sancussight-registry@0.1.0 --version` returns `0.1.0`, and `--help` exposes only the approved compile/refresh/validate surface.
- [ ] Fresh package tests, repository regressions, audit, and public-install smoke checks pass; bounded evidence records package version, integrity/hash, commands, exit codes, and no sensitive values.

### Files

- `packages/registry-compiler/package.json` — verify exact public metadata/version; change only if the public registry requires an approved metadata correction
- `packages/registry-compiler/README.md` — correct publication/install guidance only if fresh public verification exposes a mismatch
- `README.md` — keep the hosted command aligned with the verified public artifact
- `artifacts/qa/spec007/registry-compiler-t7-publication.md` — sanitized release evidence
- `.ai/sdd/specs/007-local-registry-compiler/execution/T7.md` — append-preserving worker execution record

### Verification

- [ ] `npm whoami`
- [ ] `npm run build:registry-compiler`
- [ ] `npm run test:registry-compiler`
- [ ] `npm run test:collector`
- [ ] `npm run verify:core`
- [ ] `npm run build`
- [ ] `npm audit --audit-level=high`
- [ ] `npm pack --dry-run --json` from `packages/registry-compiler`
- [ ] `npm publish --access public` from `packages/registry-compiler`
- [ ] `npm view sancussight-registry@0.1.0 version dist.integrity --registry=https://registry.npmjs.org/`
- [ ] Clean temporary `npx --yes sancussight-registry@0.1.0 --version` and `--help`
- [ ] `git diff --check`

## Corrective Task Readiness and Visualization Offer

The corrective task does not change approved product behavior or architecture. It repairs the missing release operation needed to establish FR-012 in the public registry. The dominant understanding difficulty is the consequential, difficult-to-reverse external publication rather than implementation complexity.

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: low
  observability: mixed
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: few
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: npm publication creates a durable public package version and must be verified outside the repository
visualization_offer:
  stage: tasks
  source_revision: 2026-07-24T04:50:00Z
  recommended: yes
  recommendation_reason: a read-only task microworld can make the authentication, prepublish, one-way publication, and clean-install verification boundaries inspectable before approval
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  output_path:
  screenshot_paths: []
  ui_image_offer: not-applicable
  ui_mockup_paths: []
  decision_source: user reply "No html" on 2026-07-24, selecting the offered decline-and-approve-directly route
```

## Wide Refactor Plan

Not required. Existing registry normalization remains the compatibility seam; compiler proposals and sidecar state stay isolated from the collector and browser connector.
