# Design: Scalable Portability Targets

> Requirements: `@requirements.md`
> Status: Approved

## 1. Summary

Replace implicit platform strings with a versioned portability-target catalog.
A target is a typed execution destination composed from an execution surface,
provider, model, protocol, and optional local runtime. Asset coverage points to
stable target IDs and retains its existing evidence-qualified state.

The Registry shows a compact coverage summary by default. Users open a target
picker to filter and select at most four targets for a comparison matrix.
Adding Kimi, DeepSeek, or a local model becomes a data operation, not a new
application column or component branch.

## 2. Requirements Mapping

| Requirements | Design coverage |
|---|---|
| FR-001–FR-003 | Target ontology, stable IDs, legacy projection in §§3–5 |
| FR-004–FR-007 | Compact UI, comparison, evidence cells, filtering in §§6–8 |
| FR-008–FR-010 | Dynamic targets, identity, deterministic exports in §§4, 9 |
| NFR-001–NFR-005 | Scale, truth, migration, accessibility, performance in §§8–12 |

## 3. Target Ontology

Add:

```ts
type PortabilityTargetKind =
  | 'agent-surface'
  | 'provider-model'
  | 'protocol-endpoint'
  | 'local-runtime'
  | 'legacy-platform'

interface PortabilityTargetV1 {
  schemaVersion: 1
  id: string
  label: string
  kind: PortabilityTargetKind
  executionSurface?: string
  provider?: string
  model?: string
  protocol?: string
  runtime?: string
  lifecycle: 'active' | 'deprecated' | 'unknown'
  aliases: string[]
}

interface CoverageEntryV2 {
  targetId: string
  status?: 'verified' | 'stale' | 'unverified' | 'not-shared'
  lastVerified?: string
  evidenceRefs?: string[]
}
```

The dimensions are independent. `Kimi K3 through an OpenAI-compatible local
gateway` can record provider `moonshot`, model `kimi-k3`, protocol
`openai-compatible`, and the named runtime/surface without conflating them.

Target IDs are normalized, opaque product identifiers such as
`target:sha256:<digest>` computed from a canonical tuple. Labels and aliases
may change without changing identity. Unknown components stay absent.

## 4. Registry Schema 3 and Migration

Introduce registry schema version 3:

```ts
interface RegistryV3 {
  schemaVersion: 3
  portabilityTargets: PortabilityTargetV1[]
  assets: AssetV3[]
  // existing remaining fields
}
```

`AssetV3.coverage` uses `CoverageEntryV2`. Provider dependencies remain
separate because dependency is not proof of execution coverage.

Use expand-contract:

1. Add pure `migrateRegistryV2ToV3` and dual-read tests.
2. Internal runtime canonicalizes all v2 data to v3.
3. Compiler emits v3 local and portable registries.
4. Keep sanitized v2 export as an explicitly qualified compatibility option
   for one release; it projects target labels to legacy platform strings and
   reports lost dimensions.
5. Remove v2 write support only in a later approved change.

Legacy labels `claude`, `codex`, `chatgpt`, and `local-llm` map to
`legacy-platform` targets. No provider/model/protocol is inferred.

## 5. Target Catalog Operations

Add pure functions in `src/lib/portability-targets.ts`:

- normalize and validate target records;
- resolve aliases to one ID;
- merge exact canonical tuples;
- retain ambiguous near-duplicates separately;
- derive labels and compact grouping;
- migrate v2 coverage;
- project a qualified v2 compatibility view.

Compiler proposals may include target candidates when manifests explicitly
declare components. CMDB normalization may improve labels, but only reviewed
records enter the catalog.

## 6. Registry UX

Replace the fixed broad matrix with:

- per-asset summary: `2 verified · 1 stale · 3 unverified`;
- compact chips for selected or recently relevant targets;
- “Compare targets” opens a searchable picker;
- picker groups by execution surface, provider, protocol, and local runtime;
- maximum four selected targets appear as columns;
- saved comparison selection is browser preference, not registry authority.

The asset Passport lists all targets in a vertical, filterable section so
large catalogs remain usable without horizontal expansion.

## 7. Comparison Cell Truth

Cells show one textual state:

- Verified — accepted evidence and date;
- Stale — evidence outside freshness policy;
- Unverified — declared/recorded but not verified;
- Not shared — explicit negative decision;
- Unknown — no coverage record.

Provider/model metadata never supplies a positive state. Selecting a provider
does not aggregate all its models. A cell can open the existing evidence or
decision detail when a reference exists.

## 8. Filtering and Empty States

Filters use target dimensions plus evidence state. Counts are derived from the
full catalog, not only visible rows. When filters remove the selected asset,
retain the existing selected-outside-results explanation.

No target selected: show the compact summary and prompt to choose up to four.
Unknown legacy target: show its label and `Legacy target — details unknown`.
Deprecated targets remain filterable and do not disappear from history.

## 9. Compiler and Export

Extend compiler contracts and serializers with reviewed target candidates.
Portable exports retain stable target IDs, safe dimension strings, aliases,
and evidence qualification; they exclude local endpoint URLs and machine
paths. Sorting is deterministic by target ID.

Asset-version snapshots advance their internal coverage contract so history
retains target identity. Migration creates qualified legacy snapshots rather
than rewriting old evidence as newly verified.

## 10. Files

```text
src/types.ts
src/lib/registry.ts
src/lib/portability-targets.ts           new
src/components/Registry.tsx
src/components/PortabilityTargetPicker.tsx  new
src/components/AssetVersionHistory.tsx
src/lib/storage.ts
packages/registry-compiler/src/contracts.ts
packages/registry-compiler/src/output/local.ts
src/lib/__tests__/feature015-*.test.mjs
packages/registry-compiler/src/__tests__/target-*.test.ts
```

## 11. Accessibility and Performance

- Picker is a labelled dialog/listbox pattern with search, group headings,
  selected count, and deterministic focus return.
- Table headers include full target labels; abbreviated visual labels retain
  accessible names.
- State is always textual and never only a check/X or color.
- At 320 CSS pixels/200%, comparison uses horizontal overflow inside its own
  labelled region; the default view stays vertical.
- Index catalog and coverage by target ID for linear rendering and filtering.
  Render at most four matrix columns.

## 12. Technical Decisions

- **TD-001:** Separate target dimensions instead of encoding them into one
  platform string.
- **TD-002:** Use registry schema 3 with a dual-read migration; side metadata
  cannot safely preserve shared target identity.
- **TD-003:** Limit comparison to four user-selected targets. The full catalog
  remains searchable without becoming a wide table.
- **TD-004:** Legacy labels remain qualified legacy targets. Migration never
  guesses model or provider.
- **TD-005:** Compatibility export makes dimensional loss explicit rather than
  pretending v2 can represent v3.

## 13. Verification

- Pure tests for canonical IDs, alias resolution, ambiguity, v2→v3 migration,
  deterministic sort, evidence preservation, and qualified v2 projection.
- UI tests with 0, 4, 40, and 400 targets; new Kimi/DeepSeek/local targets
  require no component change.
- Browser tests for keyboard picker, four-target cap, filter counts, evidence
  detail, narrow layout, and state labels.
- Compiler round trips for v3 local/portable outputs and legacy input.
- Run feature tests, compiler tests, `npm run verify:core`, and `npm run build`.

## 14. Risks

| Risk | Mitigation |
|---|---|
| Schema migration rewrites evidence meaning | Qualified legacy targets and immutable dates |
| Similar target records duplicate | Canonical tuple plus visible ambiguity handling |
| Flexible catalog becomes taxonomy burden | Five bounded dimensions and derived labels |
| Comparison still bloats | Hard four-target selection cap |
| Compatibility export loses meaning silently | Loss report and explicit qualification |
