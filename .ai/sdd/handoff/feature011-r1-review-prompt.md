# Feature 011 R1 Independent Review Handoff

You are a fresh visible top-level Codex reviewer for SancusSight Feature 011.
Work in `C:\Users\henry\sancussight`.

## Authority and Gate

- Resolve `SancusSight` through the canonical project registry before work.
- Read `AGENTS.md`, all applicable `.ai/steering/` files, Feature 011
  `.status`, `requirements.md`, `design.md`, `tasks.md`, `understanding.md`,
  `.ai/sdd/handoff/sdd-brief.md`, and all T1–T5 execution/handoff/browser/
  hosted evidence.
- The authoritative gate is `implementation:done`.
- This is R1: an independent comprehensive review of the full approved
  Feature 011 scope.
- Tracking owner is orchestrator task
  `019f914a-b672-77b1-837f-0c866b6421bb`.
- Return lifecycle events directly to that task.

## Acknowledgment

Before review execution, append `execution/R1.md` and return stable event:

```yaml
event:
  event_id: sancussight-011-R1-acknowledged-20260724-01
  task_id: R1
  type: acknowledged
```

Confirm the exact review boundary, owned files, required verification,
production identity, exclusions, tracking owner, and return route.

## Exact Owned Surfaces

- new `.ai/sdd/specs/011-standards-interoperability/review-r1.md`
- new `.ai/sdd/specs/011-standards-interoperability/execution/R1.md`
- new `.ai/sdd/specs/011-standards-interoperability/execution/R1-handoff.md`

Do not modify product, tests, fixtures, packages, lockfiles, deployment,
Vercel configuration, prior evidence, requirements, design, tasks, `.status`,
`understanding.md`, SDD index/brief, commits, pushes, providers, Pi, or Spec
005/T16R5/T16/A-002. Review and diagnostics are read-only outside the three
owned evidence files. Do not fix findings.

## Mandatory Review Axes

### 1. Spec alignment

Review every Feature 011 FR, NFR, design decision, task acceptance criterion,
Planned/As Built claim, T4 correction, and T5 deployment claim. At minimum:

- exact pinned profile identity, upstream source/version, stability, and
  limitation claims;
- bounded JSON/JSONL parsing, record isolation, canonical time, ordering,
  unknown schema/type/key behavior, and whole-facet non-traversal;
- exclusion of raw producer/schema/run/job/dataset identifiers, facet values,
  URLs, paths, credentials, content, and hash preimages from returned or
  retained shapes;
- fixed telemetry-alignment rows over accepted runtime evidence only;
- exact unsigned Statement v1 shape, digest, predicate schema, explicit
  unsigned/external-unverified truth, download failure, and tamper rejection;
- preview-store allowlist, validation, isolation, dedupe, retention, clear,
  unavailable state, and failure honesty;
- Evidence Sources placement, state coverage, native controls, focus,
  single-DOM responsive behavior, 320px/effective-200%, routes, and footer;
- the T4 `sha256:` projector/store boundary correction and whether its
  assumption is contractually strict and regression-pinned;
- exact production identity, canonical alias, public schema, source/lock/
  static continuity, six hosted byte matches, and hosted browser evidence.

### 2. Standards and code quality

Review correctness, privacy, security, accessibility, performance,
maintainability, test quality, and evidence discipline. Explicitly assess:

- what can be removed or consolidated;
- whether every addition is justified by approved requirements or observed
  need;
- unnecessary abstraction, special cases, dependencies, or user/maintainer
  decision burden;
- brittle static-contract tests versus behavioral coverage;
- projector/store hash conversion robustness;
- IndexedDB transaction, invalid-record, dedupe, retention, and failure paths;
- Statement canonicalization/digest and browser download lifecycle;
- whether hosted evidence is sufficient and independently reproducible.

## Fresh Verification

Run in order and record exact outcomes:

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

Add targeted adversarial read-only probes where needed. Independently inspect:

- canonical `https://sancussight.vercel.app`;
- deployment `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH`;
- immutable URL
  `https://sancussight-f8zoeu66a-hflowers45-9370s-projects.vercel.app`;
- project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`;
- team `team_Y7ueoZZnBOfX63cjuG9R9SYG`;
- T5 hosted-static and browser-matrix evidence, rerunning their read-only
  verification scripts where practical.

## Review Output

Use the SDD review structure. Classify each finding by axis, severity,
blocking state, affected contract, exact evidence, and bounded remediation.
Preserve green evidence and state whether the verdict is `Approved`,
`Approved with follow-ups`, or `Needs fixes`.

Return exactly one stable terminal event:

- `sancussight-011-R1-findings-20260724-01` when review completes; or
- a stable blocked/contract-conflict/verification-failed event if it cannot.

`ready-for-review` is only a reviewer recommendation. The tracking owner alone
reconciles findings, marks R1/Feature 011 complete, or opens correction work.
