# Feature 012 R1 Review Handoff

## Outcome

- **Overall verdict:** Needs fixes
- **Spec verdict:** Pass
- **Standards verdict:** Needs bounded correction
- **Blocking finding:** `R1-STANDARDS-001`
- **Non-blocking finding:** `R1-STANDARDS-002`
- **Authoritative review evidence:** `../review-r1.md`
- **Tracking owner:** `019f914a-b672-77b1-837f-0c866b6421bb`

## Bounded Correction Frontier

1. Define an explicit Tailwind build-source boundary that excludes generated
   evidence/output trees, and make the continuity manifest cover every
   build-affecting input. Then prove two-build determinism, local/prebuilt
   equality, exact deployment identity, canonical hosted bytes, and safe
   hosted acceptance.
2. Replace `SourceWriteStrip`'s pending-message prefix inference with an
   explicit typed pending/operation phase owned by the existing App save
   workflow. Do not create another persistence or write-authority model.

R2+ must remain bounded to these findings, their fixes, and regressions caused
by those fixes unless the tracking owner documents a comprehensive-reset
trigger.

## Preserved Green Evidence

- FR-001 through FR-006 and NFR-001 through NFR-004 pass.
- All ten required local commands passed in exact order.
- Features 008-012, collector, registry compiler, core verification, and the
  current production build remain behaviorally green.
- Global source identity and the single contextual selected-Passport strip
  retain the approved ownership split.
- Confirmation, controller, permission, preflight conflict, verified write,
  and recovery authority remain unchanged.
- Demo and snapshot modes expose no canonical-write action.
- Exactly six native disclosures, their defaults/reset/rerender behavior,
  content ownership, focus, marker, responsive layout, selected-row
  association, and narrow Back behavior remain verified.
- Exact production deployment/project/team/canonical alias identity remains
  latest, production, and `READY`.
- All six canonical hosted files still match T4's reviewed bytes and SHA-256.
- Fresh canonical-production browser inspection reported zero console errors
  or warnings and made only canonical static requests.
- T3's disposable native local-file evidence and T4's safe hosted non-write
  evidence remain honestly distinguished.

## Artifact-Continuity Finding

The deployed artifact is not drifting. The gap is that the declared 267-file
build-input manifest is incomplete:

- all 267 entries still match exactly;
- two fresh R1 builds match each other exactly;
- those builds differ from T4 by only `.resize{resize:both}` plus the resulting
  hashed filenames; and
- the candidate `.resize(` exists in untracked `outputs/**/*.py` files outside
  the manifest.

This blocks Standards approval of the exact-artifact continuity claim, not the
Feature 012 Spec behavior.

## Return Contract

The single terminal event is
`sancussight-012-R1-findings-20260724-01`. The tracking owner alone reconciles
this recommendation into `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, and
`.ai/sdd/handoff/sdd-brief.md`. R1 changed only its three owned evidence files
and did not implement fixes or mutate deployment/shared/excluded scope.
