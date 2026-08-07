# SDD Handoff Brief: Spec 007 Corrective npm Publication

> Status: approved task, externally blocked
> Readiness: Ready for a fresh visible execution session after npm authentication succeeds
> Updated: 2026-07-24

## Metadata

- **Spec ID:** `007-local-registry-compiler`
- **Spec Path:** `.ai/sdd/specs/007-local-registry-compiler/`
- **Current .status:** `tasks:approved`
- **Requirements:** `.ai/sdd/specs/007-local-registry-compiler/requirements.md`
- **Design:** `.ai/sdd/specs/007-local-registry-compiler/design.md`
- **Tasks:** `.ai/sdd/specs/007-local-registry-compiler/tasks.md`
- **Review:** `.ai/sdd/specs/007-local-registry-compiler/review.md`
- **Tracking owner:** orchestrator
- **Shared handoff note:** `.ai/sdd/handoff/sdd-brief.md` remains owned by active Feature 011 orchestration and must not be overwritten by this ticket.

## Corrective Outcome

Publish the already reviewed Windows-first compiler as exactly
`sancussight-registry@0.1.0` to the public npm registry, then prove that the
hosted `npx sancussight-registry` path resolves the public artifact rather
than a temporary local tarball.

## Authority and Boundaries

- Task authority is `tasks.md` -> `Task T7`.
- T1-T6 remain complete and are not reopened.
- The task covers `FR-010`, `FR-012`, `NFR-001`, and `NFR-002`.
- The worker must not force, overwrite, deprecate, or unpublish a version.
- The worker must not print or retain npm credentials or token values.
- The worker may write only T7 owned surfaces and its append-only execution
  record. The orchestrator alone writes shared tracking.
- Spec 005 release readiness and active Feature 011 work remain separate and
  untouched.

## Routing and Session

- **Model class:** standard
- **Effort:** high
- **Reason:** the implementation is already reviewed, but public package
  publication is consequential and requires privacy, provenance, and
  clean-install verification.
- **High-tier second opinion:** not required
- **Session policy:** `new-top-level-required`
- **Return requirement:** stable lifecycle events and exact verification must
  return to the owning orchestrator through a usable receipt path or durable
  fallback.

## External Blocker

`npm whoami` currently exits with `ENEEDAUTH`. Do not dispatch publication
until the operator authenticates this machine and a fresh check succeeds.
Authentication itself must not be recorded beyond the bounded username result
needed to establish readiness.

## Execution Order

1. Confirm `npm whoami` succeeds and reconcile the exact public registry.
2. Run the complete prepublish build, test, audit, allowlist, and privacy gate.
3. Inspect the exact package tarball and version.
4. Publish `sancussight-registry@0.1.0` once with public access.
5. Verify `npm view` and clean temporary `npx` version/help behavior.
6. Append sanitized evidence and return `ready-for-review`, `blocked`, or
   `verification-failed` with a stable event ID.

## Verification Plan

```text
npm whoami
npm run build:registry-compiler
npm run test:registry-compiler
npm run test:collector
npm run verify:core
npm run build
npm audit --audit-level=high
npm pack --dry-run --json
npm publish --access public
npm view sancussight-registry@0.1.0 version dist.integrity --registry=https://registry.npmjs.org/
clean temporary npx --yes sancussight-registry@0.1.0 --version
clean temporary npx --yes sancussight-registry@0.1.0 --help
git diff --check
```

## Handoff Readiness

- **Tasks approved:** yes
- **Ready for implementation:** no — external npm authentication is pending
- **Ready for publication:** no
- **Ready for review:** no
- **Recommended next action:** authenticate npm, verify `npm whoami`, then
  create one fresh visible top-level T7 worker session with a usable return
  path.
