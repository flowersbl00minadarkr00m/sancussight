# Feature 009 R2 Findings-Limited Independent Review Prompt

Act as the one fresh visible top-level independent R2 reviewer for SancusSight
Feature 009. This is read-only product/deployment review, not implementation.

Canonical project: `C:\Users\henry\sancussight`.

Tracking owner and return task:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve SancusSight through the canonical project registry first. Fully read
applicable `AGENTS.md`, installed `sdd-review` instructions and required
references, all `.ai/steering/` files, Feature 009 `.status`, approved
requirements/design/tasks, understanding, `review-r1.md`, C1/C2/C3 execution
records and reports, `sdd-brief.md`, and the corrected implementation/test
surfaces named by C1.

Confirm C1-C3 are authoritatively complete and R2 is the sole unblocked
frontier. Before review execution, append `execution/R2.md` and directly
return:

`sancussight-009-R2-acknowledged-20260723-01`

Tracking ownership remains with the orchestrator. Do not edit product,
package/dependency, tests, deployment, Vercel configuration, shared tracking,
prior execution evidence, Spec 005/T16R5/T16/A-002, commits, or pushes.

Owned evidence surfaces only:

- `.ai/sdd/specs/009-claim-lineage-check-catalog/review-r2.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/R2.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/R2-handoff.md`

## Strict Review Boundary

R2 is limited to `R1-SPEC-001` through `R1-SPEC-004`, their C1-C3
corrections, and regressions caused by those corrections. No comprehensive
reset is authorized.

Review both mandatory axes:

1. **Spec alignment**
   - Prove unrelated same-asset envelopes cannot become evidence for a
     selected check without exact approved qualification.
   - Prove same-family sibling results have stable independent history
     streams, correct current/previous behavior, dedupe, retention, and safe
     legacy isolation.
   - Prove every bounded outgoing conflict relationship renders in stable
     order.
   - Confirm the supporting Planned/As Built and current-frontier records are
     current.
   - Check only fix-caused regressions in truth classes, history privacy,
     canonical navigation, responsive/focus behavior, and hosted continuity.

2. **Standards/code quality**
   - Inspect the correction for correctness, maintainability, type boundaries,
     failure handling, privacy, accessibility, and test quality.
   - Explicitly check what can be removed or consolidated.
   - Identify additions unsupported by the approved requirements or the R1
     findings.
   - Identify unjustified user or maintainer decision burden.

Run fresh read-only verification at minimum:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git diff --check
vercel inspect https://sancussight.vercel.app --scope hflowers45-9370s-projects
```

Inspect C2 real-Chromium evidence, C3 hosted continuity evidence, current
corrected source diffs, and production deployment
`dpl_ANzB5nVfioTixm5YYY8pqYQUpziK`. Do not redeploy or change browser state
beyond synthetic/read-only verification.

Report findings ordered by severity with exact file/line or evidence
references. Separate blocking findings, non-blocking findings, residual risks
or human-only checks, and confirmed passes.

If the findings-limited review is green, return:

`sancussight-009-R2-ready-20260723-01`

If a correction is still required, return:

`sancussight-009-R2-findings-20260723-01`

Use `sancussight-009-R2-blocked-20260723-01` only for a genuine execution
blocker and `sancussight-009-R2-contract-conflict-20260723-01` only for an
authority conflict. This review never marks Feature 009 complete. Deliver the
single terminal event directly to the tracking task and durably record the
receipt.
