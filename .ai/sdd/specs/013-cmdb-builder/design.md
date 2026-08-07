# Design: CMDB Builder and Registry Enrichment

> Requirements: `@requirements.md`
> Status: Approved

## 1. Summary

CMDB Builder is a second, reviewable stage in the existing local registry
compiler. Discovery adapters continue to emit bounded `AssetProposal` records.
The new stage normalizes those proposals into a versioned CMDB profile, builds
optional field-level enrichment requests, and presents one combined diff before
the existing atomic publish transaction.

Publishing adds a deterministic `asset-index.json` and static browsable
`asset-index.html` beside the compiler outputs. Index entries reference stable
registry identities and recorded locations; they never move, copy, link, or
replace upstream assets. Refresh history records accepted location changes and
missing states in a sidecar extension.

## 2. Requirements Mapping

| Requirements | Design coverage |
|---|---|
| FR-001–FR-002 | Compiler pipeline and CMDB profile in §§3–5 |
| FR-003–FR-006 | Explicit enrichment boundary and source policy in §§6–7 |
| FR-007–FR-010 | Review, publish, refresh, and diagnostics in §§8–10 |
| FR-011–FR-012 | Offline path and deferred presets in §§6, 13 |
| FR-013–FR-015 | Canonical index, location history, manifest discovery in §§4–5, 9 |
| NFR-001–NFR-002 | Allowlisted requests and field-level provenance in §§6–7 |
| NFR-003–NFR-005 | Review UX, atomic output, and no relocation in §§8–12 |

## 3. Technical Approach

Extend `packages/registry-compiler` with a pipeline:

```text
authorized manifests
  -> existing adapters / AssetProposal[]
  -> CmdbNormalizer / CmdbCandidate[]
  -> optional EnrichmentCoordinator / FieldProposal[]
  -> CmdbReviewBundle
  -> existing explicit confirmation
  -> local registry + portable registry + sidecar
     + asset-index.json + asset-index.html
```

`compile` and `refresh` use this pipeline. External enrichment is disabled by
default and requires an explicit per-run flag plus review confirmation of the
exact identifiers and requested fields. `--offline` guarantees no network
adapter can be constructed.

## 4. Contracts and Identity

Add `src/cmdb/contracts.ts`:

```ts
type CmdbFactClass =
  | 'recorded'
  | 'deterministic'
  | 'external-proposal'
  | 'human-decision'
  | 'missing'

interface CmdbFieldValue<T = string> {
  field: CmdbFieldName
  value?: T
  classification: CmdbFactClass
  sourceRef: string
  observedAt: string
  confidence?: 'high' | 'medium' | 'low'
}

interface CmdbCandidate {
  proposalId: string
  identityKey: string
  fields: CmdbFieldValue[]
  locations: LocationObservation[]
  warnings: string[]
}
```

The allowlisted profile covers stable identity, name, kind, owner, lifecycle,
format, provider, version, source product, producer, consumers, license,
platform support, source URL, and observation time. Inapplicable fields remain
absent; unknown applicable fields use `missing`.

Existing `identityKey` and `stableId` remain authoritative. Normalization may
suggest aliases but cannot merge identities. Ambiguous collisions remain
separate review items.

## 5. Canonical Asset Index

Add `src/output/asset-index.ts`. It generates:

- `asset-index.json`, a machine-readable projection grouped by deterministic
  label keys;
- `asset-index.html`, a self-contained, non-executable browser view; and
- a digest entry in the existing compiler run summary.

Each entry contains only asset ID, display name, kind, lifecycle, owner alias,
source type, current recorded location, location state, and previous-location
aliases. Exact local paths appear only in the local index. The portable index
uses existing aliases.

Grouping order is kind, lifecycle, owner, then source. Users can switch the
view without generating duplicate assets or directories. The HTML uses links
only when the recorded location can be opened safely by the operating system;
missing entries show text and history instead of a fabricated redirect.

Extend `RefreshSidecar` to schema version 2 with append-preserved
`locationHistory`. Migration from sidecar v1 derives the current observation
without inventing prior history. A changed location is a pending diff until
accepted.

## 6. Enrichment Boundary

Add a narrow `EnrichmentAdapter`:

```ts
interface EnrichmentRequest {
  requestId: string
  publicIdentifiers: Record<string, string>
  fields: CmdbFieldName[]
}

interface EnrichmentAdapter {
  sourceClass: 'publisher-docs' | 'publisher-repo'
    | 'standards-body' | 'official-package-registry'
  propose(request: EnrichmentRequest): Promise<FieldProposal[]>
}
```

The coordinator constructs requests from an explicit allowlist; adapters never
receive paths, registry objects, evidence, prompts, or arbitrary metadata. The
review page displays the outbound request before network use. Per-adapter
timeouts, response-size limits, and bounded concurrency isolate failures.

No general web search or secondary-source adapter ships in this feature.
Official source adapters are added only for contracts that can be verified
with deterministic fixtures. Offline normalization is the default fallback.

## 7. Provenance and Conflict Policy

Every `FieldProposal` includes field, proposed value, source class, URL or
stable source ID, retrieval time, qualification, and optional conflict group.
Precedence affects display order only. It never auto-accepts a value.

Accepted existing facts and human decisions are immutable inputs to refresh.
A new proposal may be accepted into an empty field or explicitly replace a
value through a recorded decision. Bulk acceptance is limited to selected
empty fields from one source class.

## 8. Review UX

Extend `ui/review.html` rather than creating a second app. Add stages:

1. Source scope and coverage.
2. Normalized assets and missing fields.
3. Optional outbound enrichment disclosure.
4. Field-level diff grouped by new, changed, conflict, duplicate, missing.
5. Output preview and explicit publish confirmation.

Large sets support search, label filters, asset-by-asset navigation, and
bounded bulk decisions. Fact class, source, and uncertainty use text and icon
labels, not color alone. Network failure leaves normalization decisions intact.

## 9. Publication and Recovery

Extend the existing atomic output transaction so all registry, sidecar, index,
diagnostic, and summary files are staged and validated before replacement.
Keep the prior complete output set as the rollback generation. A failed index
generation aborts publication; it cannot leave a new registry with a stale
index.

New assets enter only through supported adapter manifests. Unsupported files
are reported as unobserved coverage, never inferred. Missing assets are
retained with `missing` state pending review.

## 10. Files and Modules

```text
packages/registry-compiler/src/
  cmdb/contracts.ts                 new
  cmdb/normalize.ts                 new
  cmdb/enrichment.ts                new
  cmdb/source-policy.ts             new
  output/asset-index.ts             new
  output/local.ts                   extend sidecar/output transaction
  refresh/diff.ts                   location proposals
  review/session.ts                 CMDB review state
packages/registry-compiler/ui/review.html
packages/registry-compiler/src/__tests__/cmdb-*.test.ts
```

## 11. Security and Accessibility

- Reuse root authorization, prohibited-key checks, file-size limits, and
  one-time loopback review token.
- Validate URLs against adapter-owned HTTPS origins; never follow arbitrary
  candidate URLs.
- Redact local paths from portable output and safe diagnostics.
- Keep all review operations keyboard accessible at 320 CSS pixels and 200%
  zoom; preserve focus when filters or proposals change.
- Index HTML contains no remote assets, scripts, or mutation controls.

## 12. Edge Cases

| Case | Result |
|---|---|
| No enrichment enabled | Full normalization and index publication remain available |
| Official sources disagree | Separate conflict proposals; no default selection |
| Asset location changes | Pending location diff with old location retained |
| Prior path disappears | Missing state plus last recorded location; no redirect |
| Unsupported new file | Coverage diagnostic, not a discovered asset |
| Publish interrupted | Previous output generation remains recoverable |

## 13. Technical Decisions

- **TD-001:** CMDB is a compiler stage, not a parallel application. This keeps
  discovery identity and privacy in one authority.
- **TD-002:** Canonical organization is a generated metadata index. Physical
  relocation is excluded because source tools may require fixed paths.
- **TD-003:** Enrichment is adapter-specific and proposal-only. A generic
  crawler would violate bounded egress and provenance.
- **TD-004:** Sidecar v2 owns observation history; the public registry retains
  only accepted current facts.
- **TD-005:** One atomic generation covers registry and index outputs so they
  cannot drift.

## 14. Verification

- Unit tests for profile normalization, unknown preservation, source ranking,
  conflict retention, location-history migration, deterministic grouping, and
  prohibited fields.
- Compiler tests for offline operation, partial adapter failure, bounded bulk
  acceptance, unchanged refresh determinism, and atomic rollback.
- Browser review tests for keyboard flow, field-level provenance, network
  disclosure, index navigation, 320px/200% layout, and no remote requests in
  offline mode.
- Run `npm run test:registry-compiler`, `npm run build:registry-compiler`,
  `npm run verify:core`, and `npm run build`.

## 15. Risks

| Risk | Mitigation |
|---|---|
| External metadata becomes implied truth | Fact classes, citations, explicit decisions |
| Index is mistaken for moved files | Persistent “metadata index” language and no file operations |
| Schema growth breaks older sidecars | Versioned migration and fixture coverage |
| Large reviews become unmanageable | Filters, grouping, bounded bulk review |
| Network lookup leaks identifiers | Per-run disclosure and adapter-owned allowlists |
