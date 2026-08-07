# Feature 009 T3 Worker Handoff

> Recommendation only. Authoritative completion belongs to tracking owner
> `019f914a-b672-77b1-837f-0c866b6421bb`.

## Outcome

`ready-for-review` is recommended for T3. Attention now contains one canonical
searchable Check Catalog/result detail, and Asset Passport findings open that
same selected explanation. All required executable checks pass.

## Acceptance Mapping

- Stable definitions and current non-passing results are separately
  searchable and selectable.
- One canonical detail contains definition, current result, previous bounded
  metadata, inspected safe evidence, claim lineage, remediation, and
  invalidation.
- Definition-only, no current result, disappeared result, uncataloged
  observation, no previous result, and history-unavailable states are
  explicit.
- Queue is an alias to `CheckCatalog`; no duplicate interactive
  list/detail implementation remains.
- App owns check intent for both Attention and Asset Passport.
- Passport `Open check explanation` selects the exact result, and
  `Open Asset Passport` returns through the canonical asset selection route.
- Desktop list/detail is adjacent. Narrow rendering contains only one of list
  or detail in the DOM, focuses detail on entry, and restores useful list
  focus on Back.
- Recorded fact, deterministic finding, human decision, missing evidence, and
  all five relationship states are textual.
- No score, network request, analytics, provider action, upstream mutation,
  package change, or T1/T2 module change was introduced.

## Verification

| Command | Exit | Summary |
|---|---:|---|
| `npm run test:feature009` | 0 | 20/20 Feature 009 tests passed |
| `npm run test:feature008` | 0 | 6/6 Feature 008 regressions passed |
| `npm run verify:core` | 0 | Core deterministic assertions passed |
| `npm run build` | 0 | TypeScript and 1,835-module Vite build passed |
| tracked `git diff --check` | 0 | No whitespace diagnostics in App/CSS |
| per-file untracked `git diff --no-index --check` | 1 expected | Every untracked T3 file differed from `NUL` with zero whitespace diagnostics |

## T4 Boundary

T3 does not claim real-browser geometry, focus behavior, 320 CSS-pixel or
200%-zoom overflow, IndexedDB field inspection, console cleanliness, or
network observations. Those scenarios remain the approved T4 ticket.

## Tracking Owner Next Action

Inspect the scoped T3 implementation and worker evidence, rerun the named
checks fresh, and reconcile T3 completion authoritatively only if the source
still matches the approved requirements, design, and task. A worker
ready-for-review event is not completion.

Stable event `sancussight-009-T3-ready-20260723-01` was delivered directly to
tracking task `019f914a-b672-77b1-837f-0c866b6421bb`; the delivery tool returned
that exact task ID.
