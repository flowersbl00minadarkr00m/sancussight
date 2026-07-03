# HANDOFF — SancusSight

## Implemented

- Registry data model (assets: context/skill/workflow/control/evaluation; coverage entries with per-platform verification dates; provider dependencies with optional fallbacks; accepted risks with owner + expiry) — `domain/types.ts`.
- Deterministic check engine producing full-contract signals (condition, finding, evidence, owner, action) across five dimensions; accepted-risk conversion of failures into owned expiring exceptions; dimension rollups; remediation queue ordering — `domain/checks.ts`.
- Exit test: dependency walk with survives/degrades/breaks verdict; detects locked provider dependencies (including on the workflow itself), proprietary formats, missing/unverified/stale coverage — `domain/exitTest.ts`.
- Privacy-safe share card (aggregates + redacted workflow letters only; tested to leak no names/locations/owners) — `domain/report.ts`.
- `localStorage` persistence (`sancussight:v1`) with defensive load, JSON import/export round-trip — `domain/storage.ts`.
- Synthetic demo registry with relative dates (never goes stale on Vercel), modeled on a personal multi-agent stack + the finance-analysis worked example from the design notes; exercises all five signal statuses — `domain/fixtures.ts`.
- UI: overview tiles + open-flags list, coverage matrix with click-through asset detail, quick actions (record review / verification / substitution drill today), exit test panel, remediation queue, share card modal, JSON import/export/reset — `components/`, `App.tsx`.
- 26 vitest tests across checks, exit test, report privacy, storage round-trip, fixture coverage — `domain/__tests__/`.

## Assumptions

- Thresholds (45d review, 30d verification, 90d drill) are constants in `domain/checks.ts` (`THRESHOLDS`), not yet user-configurable.
- "Verified" is self-attested via the quick-action buttons — the tool records claims about tests run elsewhere; it does not run imports against real platforms (deliberate: no external calls).
- Workflows don't use coverage entries; their platform relationship is primary/fallback provider. The matrix renders PRI/FBK chips for them instead of coverage glyphs.

## Known limitations

- **No add/edit-asset form** — new assets are added via JSON import or by editing the exported file. Quick actions only update dates. A form is the top UX gap for real adoption.
- **Exit test treats all dependencies as hard** — no optional/degraded-mode dependencies.
- **Signals recompute against "today" on each load** — there is no history, so no trends ("degrading since May") yet.
- **Share card redacts by exclusion** — workflow letters are positional; re-ordering assets changes letters between exports.
- Preview screenshot tooling on this machine times out (known machine-wide issue); verification was done via DOM/a11y snapshot, computed state, and localStorage inspection.

## Verification evidence

```
npm run lint    → oxlint, clean (no warnings)
npm test        → 3 files, 26 tests, all passing
npm run build   → tsc -b && vite build, dist/ produced (~223KB JS, ~13KB CSS)
```

Browser (dev server, port 5175, via DOM verification):
- Overview renders 5 dimension tiles with correct rollups; queue tab shows (18); no console errors/warnings.
- Exit test: "Weekly post production" → codex = SURVIVES (4/4 deps verified); "Finance analysis brief" → local-llm = BREAKS (locked private connector on workflow itself + 2 deps not shared) — matches the design note's worked example.
- Registry: clicked "Post Pipeline runbook", used "VERIFIED ON CODEX TODAY" quick action → localStorage coverage date updated to today; persisted across page reload.
- Share card: aggregate table + redacted exit verdicts; leak probe for asset names/paths/owners found nothing.
- Reset to demo restores the fixture registry.

## Next five highest-value improvements

1. **Add/edit asset form** (domain already supports it; pure UI) — without it, real users must hand-edit JSON.
2. **Headless CI mode**: a small script that runs `runChecks`/`runExitTest` over a committed `registry.json` and exits non-zero on new failures — turns SancusSight into a lintable control and pairs with the planned `charter-lint` prototype.
3. **Signal history + trends**: append rollups to a dated log in localStorage, chart drift ("evidence dimension degrading 3 weeks running").
4. **Configurable thresholds and platforms** in a settings panel (both are already data, not code).
5. **Import scanners**: parse a folder listing / repo tree (drag-dropped, still local) to prefill asset entries from skills/manifests instead of manual entry.
