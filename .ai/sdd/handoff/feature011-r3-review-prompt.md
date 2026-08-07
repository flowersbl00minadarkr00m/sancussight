# Feature 011 R3 Fresh Visible Review Prompt

Act as the fresh visible top-level independent reviewer for Feature 011 R3
only. Canonical project: `C:\Users\henry\sancussight`. Tracking owner:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve the canonical project registry, then fully read `AGENTS.md`, the
installed `sdd-review` skill, Feature 011 `.status`, approved
requirements/design/tasks, `understanding.md`, `review-r1.md`, `review-r2.md`,
C4/C5/C6 execution evidence, the current corrected implementation/tests, and
deployment `dpl_C1RpuwEBX3Tc8g2n7uMkuFjSk5CE`. Before review execution, return
stable event `sancussight-011-R3-acknowledged-20260724-01` directly to the
tracking task.

## Strict Review Boundary

Review only `R1-SPEC-002`: deterministic atomic equivalent-preview dedupe
across separate `InteroperabilityPreviewStore` instances and independently
loaded page/store contexts sharing the same repository. Include only C4's
repository-boundary correction, C5/C6 local and hosted verification, and
regressions caused by that fix. Preserve the R2-resolved dispositions of
`R1-SPEC-001`, `R1-STANDARDS-001`, and `R1-STANDARDS-002`; do not reopen them
except for a direct fix-caused regression. Do not broaden R3 into a
comprehensive reset. Review both Spec alignment and Standards/code-quality
axes. Do not implement fixes.

## Required Fresh Verification

Run in order:

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
git -c core.autocrlf=false diff --check
```

Independently reproduce:

- two separate store instances sharing one memory repository with overlapping
  equivalent writes;
- the repository/IndexedDB atomic transaction seam;
- two independently loaded canonical-origin pages sharing the dedicated
  Feature 011 IndexedDB, requiring deterministic `recorded` then
  `deduplicated`, exactly one add, one retained snapshot, and identical
  available views; and
- privacy/failure honesty plus direct fix-caused regressions only.

Inspect the exact corrected production identity:

- project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`;
- team `team_Y7ueoZZnBOfX63cjuG9R9SYG`;
- deployment `dpl_C1RpuwEBX3Tc8g2n7uMkuFjSk5CE`;
- immutable URL
  `https://sancussight-1qvn8hxfw-hflowers45-9370s-projects.vercel.app`; and
- canonical URL `https://sancussight.vercel.app`.

Practically rerun the C6 hosted static-byte comparison and bounded
installed-Chrome matrix. Fail closed on identity, manifest, concurrency,
privacy, evidence-scope, or hosted-behavior mismatch.

## Ownership and Exclusions

Owned writes only:

- `.ai/sdd/specs/011-standards-interoperability/review-r3.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/R3.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/R3-handoff.md`

Do not change product, tests, fixtures, packages, lockfiles, deployment,
Vercel configuration, requirements, design, tasks, `.status`,
`understanding.md`, shared tracking, prior execution evidence, commits,
pushes, providers, Pi, Feature 012, or Spec 005/T16R5/T16/A-002.

Return exactly one stable terminal event:
`sancussight-011-R3-ready-20260724-01` with the bounded verdict and evidence,
or one stable findings/failure/blocker event, directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. Reviewer output remains a
recommendation until tracking-owner reconciliation.
