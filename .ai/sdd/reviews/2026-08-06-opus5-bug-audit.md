# Bug Audit: SancusSight Canonical Code (Claude Opus 5)

> Supporting control-plane evidence only. Not a spec-scoped two-axis review,
> not an approval artifact, does not change any `.status`. Feeds idea
> `003-langfuse-dev-tracing-for-byok-coach.md` and the "AAA quality"
> gauntlet-loop effort.
>
> Reviewer: Claude Opus 5 (`feature-dev:code-reviewer`, read-only)
> Date: 2026-08-06
> Scope: `src/`, `collector/` — `.ai/sdd/`, `dist`, `node_modules` excluded

## Critical — evidence/registry integrity

1. **`src/lib/registry.ts:6,88,421-423`** (`daysBetween`), import gate at
   **`src/lib/session.ts:103-105`** — `isImportableAsset` checks
   `lastVerified` is a string but never that it parses as a date.
   `daysAgo` returns `NaN`, and every staleness comparison
   (`d > staleVerifyDays`) is `false` for `NaN`. An asset with
   `"lastVerified": "soon"` renders as green "Verified NaNd ago" in the
   coverage matrix and passes `portability.platform-coverage.v1` — an
   invalid date is presented as the *strongest* possible portability
   evidence. Note `evidenceFreshness` in `asset-catalog.ts:105-109` does
   guard with `Number.isFinite`, so the same asset can show "Missing"
   freshness and a green verified matrix simultaneously.
2. **`src/lib/registry.ts:35-45`**, no validation in `session.ts:99-137` —
   `acceptRisk` does `Date.parse(asset.acceptedRisk.expires) < Date.parse(today)`;
   with `expires` absent or unparseable, `NaN < n` is `false`, so the expiry
   guard falls through and every `fail` signal on that asset is silently
   rewritten to `status: 'accepted'` — permanently, with the Passport
   printing `Expires: undefined`. A hand-edited or third-party-produced
   `"acceptedRisk": {}` suppresses proprietary-format, missing-owner,
   no-fallback, and governance failures across every rollup.
3. **`src/App.tsx:152-169`** + **`src/lib/source-controller.ts:129-136`** —
   two compounding defects: (a) `handleVisibilityChange` reads
   `operationPending.current` but never sets it, so a focus-triggered
   refresh is invisible to save/reload handlers; (b) `SourceController.refresh`
   de-dupes on `this.refreshPromise` while ignoring the `session` argument,
   so a second caller gets back the *first* caller's captured session.
   Failure: tab regains focus → background refresh starts on the old
   session; user records a review (`dirty: true`) before it resolves; the
   refresh resolves with the pre-edit session and `dirty: false`,
   overwriting the just-recorded review with no indication anything was
   lost. Silent data loss in the local-first write path.

## Important

4. **`src/lib/evidence.ts:160-172,88-113`**, reached via
   **`use-collector.ts:93-99`** (hosted "Import snapshot") — the envelope
   validator never checks `outcome` or `summary`; an imported envelope
   missing/misvalued `outcome` produces a signal with an invalid
   `status` (not a `SignalStatus`), which breaks `STATUS_STYLES[status]`
   rendering, miscounts dimension rollups, and produces arbitrary sort
   order and mis-derived portability facets. Same gap exists collector-side
   in `collector/envelope.ts:91-108`, so a corrupted `evidence.jsonl` line
   survives validation there too.
5. **`collector/evidence-store.ts:198-210`**, called from `:66-76,117-131`
   — `readJsonLines` throws on the first line that fails to parse/validate,
   killing the entire store's `initialize()`. A crash/power-loss mid-append
   leaving one truncated line makes `/api/v1/evidence` entirely unavailable
   and all previously accepted evidence inaccessible until hand-edited —
   contradicts the "failures are isolated per source" / append-only
   durability intent in `tech-stack.md`.
6. **`src/components/Registry.tsx:283-314`** + **`src/index.css:937`** — on
   narrow viewports, "Back to assets" lives inside `AssetPassport`, which
   only renders when `selected` is truthy; the empty-state branch has no
   navigation control. If a refresh/reload replaces the registry while an
   asset is selected on mobile (`selectedAssetId` is never reconciled),
   `selected` becomes `undefined`, the catalog stays `display:none`, and
   the user is stuck with no way back to the list short of switching tabs.
   `CheckCatalog.tsx:426` shows the correct pattern (unconditional back
   button) for comparison.
7. **`src/lib/asset-catalog.ts:146-148`** vs. **`Registry.tsx:424,449`** —
   the Passport labels a value "Deterministic portability state" computed
   from `worstSignalStatus` over *all* signals including `dimension:
   'evidence'`, then lists only non-evidence findings below it. An asset
   failing only on an evidence-dimension check shows "Portability: fail"
   with "No deterministic portability findings recorded" directly below —
   contradictory display, and the Portability facet filter mis-classifies
   such assets.
8. **`src/lib/session.ts:101`** (only `id/name/kind/format/location/
   sensitivity` type-checked) → **`asset-catalog.ts:84`** / 
   **`Registry.tsx:670-672`** — a non-string `owner` (e.g. `42`) passes
   import validation, then crashes the entire Assets view at render
   (`raw.trim is not a function`) with no error boundary anywhere in
   `App.tsx`.

## Latent / low

9. **`src/lib/claim-lineage.ts:304-309`** — nodes are truncated to
   `MAX_NODES` but edges are filtered against the untruncated node list;
   currently unreachable (max path is exactly 8 nodes) but a live bug the
   moment lineage depth grows.

## Privacy boundary — no defect found

Hosted-mode gating is clean on all traced paths: `use-collector.ts` gates
every `CollectorClient` behind the loopback-injected meta tag,
`use-governance.ts` short-circuits to IndexedDB for non-`live` modes, export
paths (`domain/governance/export.ts`, `lib/evidence-packet.ts`) enforce
prohibited-key/path/email/credential rejection. One residual gap: `export.ts`
`sanitizeValue` strips a fixed key list rather than being name-agnostic, so
arbitrary payload keys on imported governance events survive into a
re-export (bounded to 320 chars each, but not filtered by shape).

## Spec 016 (BYOK Remediation Coach)

`.status` is `tasks:approved`; no coach/BYOK/credential code exists in
`src/` or `collector/` yet. The bounded-payload review idea 003 depends on
cannot be checked in code because there is nothing to check — re-run this
audit's Spec-016-specific pass once T1 lands, rather than treating this as
a clean bill of health for that feature.

## Next step

Not authorized for implementation by this document. Findings 1-3 are the
highest-priority items — they directly undermine the registry's evidence
credibility, which is the product's core value proposition.
