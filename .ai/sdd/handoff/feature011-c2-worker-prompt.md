# Feature 011 C2 Findings-Limited Browser Regression Handoff

You are the sole fresh visible top-level C2 browser worker for SancusSight
Feature 011. Work in `C:\Users\henry\sancussight`.

## Authority

- Resolve `SancusSight` through the canonical project registry.
- Fully read `AGENTS.md`, applicable steering, Feature 011 `.status`,
  requirements, design, `tasks.md#C2`, understanding, `review-r1.md`,
  `execution/C1.md`, `execution/C1-handoff.md`, and the SDD brief.
- Gate: `implementation:in-progress`.
- Tracking owner and return route:
  `019f914a-b672-77b1-837f-0c866b6421bb`.
- Scope is limited to all four R1 findings, C1 fixes, and fix-caused
  regressions.

## Acknowledgment

Before browser or product work, append `execution/C2.md` and return:

```yaml
event:
  event_id: sancussight-011-C2-acknowledged-20260724-01
  task_id: C2
  type: acknowledged
```

## Owned Surfaces

- bounded corrections within completed C1 product/test surfaces only after a
  genuine approved browser criterion fails
- `.ai/sdd/specs/011-standards-interoperability/execution/C2.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C2-handoff.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C2-browser-report.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/C2-browser/`

No shared tracking, requirements/design, prior evidence, packages/lockfiles,
deployment/Vercel, commits/pushes, providers/Pi, Spec 005/T16R5/T16/A-002, or
C3+ work.

## Required Installed-Chromium Matrix

Use a fresh local build/preview and actual installed Chrome. Use only clearly
labeled synthetic fixtures.

1. Import an otherwise valid official OpenLineage event containing base
   `facets`, `inputFacets`, and `outputFacets`; assert accepted projection and
   exact stable omission counts.
2. Put hostile unique sentinels inside every facet container; prove they do
   not appear in DOM, returned projection, safe hashes/preimages observable at
   the test seam, console, logs, or IndexedDB.
3. Trigger two or more equivalent imports concurrently while persistence is
   pending; assert exactly one snapshot in IndexedDB and deterministic
   recorded/deduplicated outcomes.
4. Inject one invalid record into the dedicated Feature 011 IndexedDB store;
   assert the UI reports unavailable/degraded history and never healthy empty
   history. Prove unrelated stores remain unchanged.
5. Preserve profile isolation, retention, clear, valid import, telemetry,
   Statement, and unavailable-current-result behavior.
6. Correct the R1 evidence issue: after applying effective-200 device metrics
   and any reload, explicitly reopen Advanced -> Evidence Sources, assert the
   `Standards Interoperability` heading and exactly one workspace/rail, then
   record viewport, DPR, document overflow, and bounded table metrics before
   screenshot/pass.
7. Verify focus entry, useful return, 320 CSS pixels, keyboard controls, clean
   console/page errors, and loopback/same-origin-only traffic.

## Final Gates in Exact Order

```text
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

Return one stable terminal event:

- `sancussight-011-C2-ready-20260724-01`; or
- one stable blocked/contract-conflict/verification-failed event.

Ready-for-review remains a recommendation. Do not advance C3 or shared
tracking.
