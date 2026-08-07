# Feature 011 R2 Fresh Visible Review Prompt

Act as the fresh visible top-level independent reviewer for Feature 011 R2
only. Canonical project: `C:\Users\henry\sancussight`. Tracking owner:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Fully read `AGENTS.md`, the installed `sdd-review` skill, Feature 011
`.status`, approved requirements/design/tasks, `understanding.md`,
`review-r1.md`, C1/C2/C3 execution evidence, current corrected
implementation/tests, and deployment
`dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`. Resolve the canonical project registry
before review. Before any review execution, return stable event
`sancussight-011-R2-acknowledged-20260724-01` directly to the tracking task.

## Strict Review Boundary

Review only:

- `R1-SPEC-001` — official base/input/output facet-container wholesale
  omission without value traversal;
- `R1-SPEC-002` — concurrency-safe deterministic equivalent-preview dedupe;
- `R1-STANDARDS-001` — effective-200 evidence explicitly reopens and measures
  Standards Interoperability; and
- `R1-STANDARDS-002` — invalid persisted records produce an honest
  unavailable/degraded result.

Include only their C1 corrections, C2/C3 verification, and regressions caused
by those fixes. Do not broaden R2 into a comprehensive reset. Review both Spec
alignment and Standards/code-quality axes. Do not implement fixes.

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

Reproduce bounded adversarial facet/privacy, overlapping-write dedupe,
corrupt-store honesty, and effective-200 workspace-identity probes. Inspect
the exact corrected production identity:

- project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`;
- team `team_Y7ueoZZnBOfX63cjuG9R9SYG`;
- deployment `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u`;
- immutable URL
  `https://sancussight-47zi3pez1-hflowers45-9370s-projects.vercel.app`; and
- canonical URL `https://sancussight.vercel.app`.

Practically rerun the C3 hosted static-byte comparison and findings-limited
installed-Chrome matrix when available. Fail closed on identity, manifest,
privacy, concurrency, evidence-scope, or hosted-behavior mismatch.

## Ownership and Exclusions

Owned writes only:

- `.ai/sdd/specs/011-standards-interoperability/review-r2.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/R2.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/R2-handoff.md`

Do not change product, tests, fixtures, packages, lockfiles, deployment,
Vercel configuration, requirements, design, tasks, `.status`,
`understanding.md`, shared tracking, prior execution evidence, commits,
pushes, providers, Pi, Spec 005/T16R5/T16/A-002, or Feature 012.

Return exactly one stable terminal event:
`sancussight-011-R2-ready-20260724-01` with the bounded verdict and evidence,
or one stable findings/failure/blocker event, directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`. Reviewer output remains a
recommendation until tracking-owner reconciliation.
