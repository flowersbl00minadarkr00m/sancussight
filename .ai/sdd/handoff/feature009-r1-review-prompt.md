# Feature 009 R1 Independent Review Prompt

Act as the one fresh visible top-level independent R1 reviewer for SancusSight
Feature 009. This is read-only product/deployment review, not implementation.

Canonical project: `C:\Users\henry\sancussight`.

Tracking owner and return task:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve SancusSight through the canonical project registry first. Fully read
applicable `AGENTS.md`, installed `sdd-review` instructions and required
references, all `.ai/steering/` files, Feature 009 `.status`, approved
requirements/design/tasks, understanding, every T1–T5R2 handoff/report,
`sdd-brief.md`, and the implementation/test surfaces named by the tasks.

Confirm T1–T5R2 are authoritatively complete and R1 is the sole unblocked
frontier. Before review execution, append `execution/R1.md` and directly
return:

`sancussight-009-R1-acknowledged-20260723-01`

Tracking ownership remains with the orchestrator. Do not edit product,
package/dependency, tests, deployment, Vercel configuration, shared tracking,
prior execution evidence, Spec 005/T16R5/T16/A-002, commits, or pushes.

Owned evidence surfaces only:

- `.ai/sdd/specs/009-claim-lineage-check-catalog/review-r1.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/R1.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/R1-handoff.md`

Review the full approved scope on both mandatory axes:

1. **Spec alignment**
   - Map every FR-001–FR-008 and NFR-001–NFR-005 to implementation and fresh
     evidence.
   - Verify stable Check Catalog identity, exact result projection,
     claim-lineage truth classes and all five relationship states,
     plain-language remediation/invalidation, bounded local history,
     canonical cross-view navigation, unsupported/uncataloged handling,
     accessibility, local-first privacy, determinism, compatibility, and
     boundedness.
   - Reconcile local browser evidence and production deployment
     `dpl_96UapZ28MvQMrBmk63NyM8mZUN86` at
     `https://sancussight.vercel.app`.

2. **Standards/code quality**
   - Inspect correctness, maintainability, type boundaries, failure handling,
     accessibility, privacy, and test quality.
   - Explicitly check what can be removed or consolidated.
   - Identify additions unsupported by approved requirements or observed need.
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

Inspect representative local and hosted browser evidence, current source
diffs, and the exact production identity. Do not re-deploy or change browser
state beyond synthetic/read-only verification.

Report findings ordered by severity with exact file/line or evidence
references. Separate:

- blocking findings (must be corrected before review completion),
- non-blocking findings,
- residual risks or human-only checks,
- confirmed passes.

If no blocking finding exists, return
`sancussight-009-R1-ready-20260723-01`.

If any blocking finding exists, return
`sancussight-009-R1-findings-20260723-01`.

Use `sancussight-009-R1-blocked-20260723-01` only for a genuine execution
blocker and `sancussight-009-R1-contract-conflict-20260723-01` only for an
authority conflict. This review never marks Feature 009 complete. Deliver the
single terminal event directly to the tracking task and durably record the
receipt.
