# Feature 009 Understanding Record

> Supporting evidence only. This record cannot approve a gate or replace the
> authority sources.
> Current `.status`: `review:done`
> Refreshed: 2026-07-24

## Exact Authority Sources

- `.ai/sdd/specs/009-claim-lineage-check-catalog/.status`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/design.md`

## Understanding Burden

```yaml
understanding_burden:
  user_familiarity: familiar
  conceptual_novelty: medium
  observability: mixed
  blast_radius: cross-boundary
  consequence: reversible
  hidden_decisions: several
  rule_selected_depth: medium
  selected_depth: medium
```

- **Deterministic rule result:** medium because the change crosses evaluator,
  persistence, navigation, and responsive UI boundaries and separates several
  similar evidence concepts.
- **Dominant difficulty:** stable definition versus current result versus
  qualified claim path.
- **Evidence mode:** local Markdown in the approved design.
- **Confirmation state:** confirmed by the user's blanket no-stop approval
  provided no material conflict emerges.

## Planned

```text
checked-in stable rule
  -> current result for one asset
  -> safe prior result metadata, when recorded
  -> shortest typed explanation path
```

The path names missing, inferred, stale, conflicting, and verified
relationships. It never becomes a global graph or an aggregate score. Imported
observations without an approved definition remain uncataloged. Metadata-only
history supports regression/recovery context without copying raw evidence.

## As Built

Feature 009 now has a checked-in 20-definition catalog, deterministic current
result projection, bounded typed lineage, metadata-only local history, one
canonical Attention detail shared with Asset Passport, responsive
desktop/narrow interaction, and a production deployment at
`https://sancussight.vercel.app`.

T1–T5R2 are complete. Independent R1 review passed all executable and
deployment-health gates but found two blocking semantic identity defects and
one related renderer defect:

- asset co-reference is insufficient to qualify evidence for a selected
  deterministic result;
- check-family identity is insufficient to isolate sibling result history;
  and
- one-to-many conflict edges cannot be reduced to one edge per source.

These were divergences from the approved truthfulness intent, not approved
design changes. C1 corrected them with exact envelope-ID qualification,
`signal.id` result discrimination, legacy-history isolation, and ordered
one-to-many edge rendering. Fresh adversarial and regression tests pass. C2
verified the fixes, storage boundary, focus/responsive behavior, and
console/network boundary in local real Chromium without retaining another
product correction. C3 deployed the exact corrected artifact as production
deployment `dpl_ANzB5nVfioTixm5YYY8pqYQUpziK`; source, lockfile, prebuilt,
hosted-byte, alias, console, and runtime checks passed. Findings-limited R2
then independently confirmed all four R1 findings resolved with no blocking or
non-blocking fix-caused regression. Feature 009 is reviewed and complete.

## Task Readiness

- **Depth:** medium
- **Dominant difficulty:** preserving the stable-definition/current-result/
  history/lineage separation across pure models, persistence, and UI.
- **Suggested evidence:** focused model/history tests, real browser storage and
  focus inspection, then hosted acceptance.
- **Conflicts:** none.
- **HTML task microworld:** declined as optional under the user's no-stop
  direction.

## Divergence and Conflicts

R1 findings `R1-SPEC-001` through `R1-SPEC-004` are recorded in
`review-r1.md` and `review-r2.md`. C1 through C3 and R2 are complete.
Spec 005 remains a separate paused authority plane.
