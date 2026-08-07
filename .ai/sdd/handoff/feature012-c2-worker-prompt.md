# Feature 012 C2 Worker Prompt

You are a fresh visible top-level implementation worker for SancusSight
Feature 012 task C2 only.

Resolve the canonical project with the project registry, then read
`AGENTS.md`, the installed `sdd-exec` skill, Feature 012 `.status`,
`requirements.md`, `design.md`, `tasks.md#C2`, `understanding.md`,
`review-r1.md`, `execution/C1.md`, `execution/C1-handoff.md`, and
`.ai/sdd/handoff/sdd-brief.md`.

Before browser or product work, append `execution/C2.md` and deliver stable
event `sancussight-012-C2-acknowledged-20260724-01` directly to tracking task
`019f914a-b672-77b1-837f-0c866b6421bb`.

## Exact Scope

Run the findings-limited installed-Google-Chrome regression for
`R1-STANDARDS-001`, `R1-STANDARDS-002`, the C1 fixes, and direct fix-caused
regressions only.

Prove:

- App-owned typed pending presentation across confirmation, cancellation,
  success, permission/failure recovery, and conflict prevention, without
  user-visible-copy inference;
- the explicit Tailwind/application boundary, two clean byte-identical builds,
  and hostile outside-boundary `.resize` candidate immunity through
  `npm run verify:feature012-build-inputs`;
- the preserved contextual write strip, compact header truth, six native
  disclosures, selected-row association, focus restoration, 320px and
  effective-200 layout, route/footer behavior, clean console/page errors, and
  same-origin-only traffic.

Use a fresh production build and installed Google Chrome. Synthetic
permission/failure/conflict inputs must be labeled honestly; do not automate
or claim the operating-system file chooser.

## Owned Surfaces

- Product/test corrections only after a genuine approved browser or continuity
  failure, and only within the C1-owned product/test surfaces.
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C2.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C2-handoff.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C2-browser-report.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C2-browser/`

Shared tracking, requirements/design, packages/dependencies, package-lock,
deployment/Vercel, C3+, Feature 013+, commits/pushes, providers/Pi, and
Spec 005/T16R5/T16/A-002 are excluded.

## Required Final Verification

Run in this order:

1. `npm run test:feature012`
2. `npm run test:feature011`
3. `npm run test:feature010`
4. `npm run test:feature009`
5. `npm run test:feature008`
6. `npm run test:collector`
7. `npm run test:registry-compiler`
8. `npm run verify:core`
9. `npm run build`
10. `npm run verify:feature012-build-inputs`
11. scoped whitespace verification

Return exactly one stable terminal event:
`sancussight-012-C2-ready-20260724-01` or a stable blocker/failure/conflict
event. Ready-for-review is only a recommendation; the orchestrator owns
completion and shared tracking.
