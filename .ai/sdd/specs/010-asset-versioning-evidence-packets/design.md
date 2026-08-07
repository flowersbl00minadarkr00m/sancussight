# Feature 010 Design: Asset Versioning and Evidence Packets

> Status: Approved — R1 truthfulness correction
> Original approval: Existing operator blanket approval, reconciled on 2026-07-24 after requirements mapping, privacy, compatibility, compiler, and UI-boundary review
> Reopened: 2026-07-24 after tracking-owner verification proved that snapshot-only dedupe discards check-only regression/recovery metadata required by FR-001, FR-003, and FR-004
> Correction approval: Existing operator blanket approval, reconciled on 2026-07-24 after the reproduced failure, requirements impact analysis, privacy review, and deterministic equivalence review
> Requirements: `@.ai/sdd/specs/010-asset-versioning-evidence-packets/requirements.md`
> Grounded in: `src/types.ts`, `src/lib/session.ts`, `src/lib/storage.ts`,
> `src/lib/check-catalog.ts`, `src/components/Registry.tsx`,
> `src/components/ExitTest.tsx`, `src/domain/governance/export.ts`, and
> `packages/registry-compiler/src/output/local.ts`

## 1. Summary

Feature 010 adds an optional, bounded version ledger to each existing
schema-version-2 asset. A version is an immutable snapshot created by an
explicit user action. It records only portability-relevant facts, stable
Feature 009 check-result metadata, and safe hashes for source/run references.
Aliases are mutable pointers held outside the snapshot. The current recorded
version compares only with the immediately previous distinct version.

A separate pure Evidence Packet module projects either an asset version or a
currently computed Exit Drill result into a strict
`sancussight-evidence-packet` schema. Canonical JSON and SHA-256 create a
deterministic packet digest. The export projection contains fixed metadata and
safe hashes only; it never serializes the registry, evidence envelopes, raw
findings, paths, prompts, responses, credentials, or user identity.

## 2. Requirements Mapping

| Requirement | Design coverage |
|---|---|
| FR-001 | Optional bounded `AssetVersionV1[]`, explicit record/dedupe functions |
| FR-002 | Separate `AssetVersionAliasV1[]` pointers with case-insensitive uniqueness |
| FR-003 | Pure current-versus-previous comparison over a fixed projection |
| FR-004 | Explicit field/check transition table; no aggregate score |
| FR-005 | Strict schema-version-1 Evidence Packet types and canonical digest |
| FR-006 | Fixed allowlist builder, recursive safety validation, local JSON download |
| FR-007 | Asset Passport History and Exit Drill integration through App callbacks |
| FR-008 | Optional schema-version-2 fields, strict normalization, compiler preservation |
| NFR-001 | Native controls, textual states, focus protocol, bounded responsive UI |
| NFR-002 | Local modules and safe hashes only; no new network route |
| NFR-003 | Canonical projection/hash, explicit truth classes, no scoring |
| NFR-004 | Fixed limits and linear algorithms |
| NFR-005 | Fail-closed validation/download and sanitized filename |

## 3. Technical Approach

### 3.1 Asset version contracts

Add optional fields to `Asset` while retaining `Registry.schemaVersion: 2`:

```ts
interface Asset {
  // existing fields
  versions?: AssetVersionV1[]
  versionAliases?: AssetVersionAliasV1[]
  currentVersionId?: string
}

interface AssetVersionV1 {
  schemaVersion: 1
  id: string
  recordedAt: string
  sourceRefHashes: string[]
  verificationRefs: AssetVersionVerificationV1[]
  snapshot: AssetVersionSnapshotV1
}

interface AssetVersionAliasV1 {
  name: string
  versionId: string
}

interface AssetVersionVerificationV1 {
  checkId: string
  resultId: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceHash?: string
}
```

`AssetVersionSnapshotV1` is a fixed allowlist:

```ts
interface AssetVersionSnapshotV1 {
  format: string
  sharedByDesign: boolean
  registryState: 'active' | 'archived' | 'missing'
  supportedVersion?: string
  coverage: Array<{ platform: string; lastVerified?: string }>
  providerDependencies: Array<{
    provider: string
    capability: string
    fallback?: string
  }>
  dependencyIds: string[]
}
```

The snapshot intentionally excludes name, location, owner, sensitivity,
evidence labels, accepted-risk notes, decision rationale, source URLs,
candidate-tool notes, and unrestricted attributes. Those mutable or
privacy-sensitive fields are neither required for portability comparison nor
safe to copy into historical records.

Limits are enforced at construction and normalization:

```text
50 versions per asset
16 aliases per version / 64 alias pointers per asset
32 source reference hashes per version
32 verification references per version
100 comparison items
160 characters for a bounded label or identifier
```

### 3.2 Stable version identity and explicit recording

Add `src/lib/asset-versions.ts` with pure normalization, projection,
comparison, and alias operations. SHA-256 is injected as a small async adapter
so browser Web Crypto and Node tests/compiler can use the same canonical
preimage.

Recording first constructs two related canonical projections:

```text
identity projection:
  snapshot + sourceRefHashes + full verificationRefs

equivalence projection:
  snapshot + sourceRefHashes
  + verificationRefs(checkId, resultId, status, safeEvidenceHash)
```

The equivalence projection intentionally excludes `recordedAt` and each
verification `evaluatedAt`. A repeat observation of the same qualified state
therefore deduplicates, while a changed status, safe evidence hash, source
reference, or asset fact records a new version. This is necessary for the
approved check-result regression/recovery comparison to be reachable.

Recording performs:

```text
current asset + current cataloged Signal metadata
  -> fixed sorted identity and equivalence projections
  -> compare with last recorded equivalence projection
  -> equivalent: return explicit deduplicated result
  -> distinct: id = av1_<first 32 hex of
     SHA-256(recordedAt + identity projection)>
  -> append, cap at 50, set currentVersionId
```

The timestamp participates in the version ID only after equivalence dedupe.
Identity therefore does not depend on asset name, finding copy, array order,
or storage location. A missing `versions` field is valid and remains empty.
Normalization never creates a version.

Alias rules:

- trim and normalize comparison with Unicode lowercase;
- permit letters, numbers, spaces, `.`, `_`, `/`, and `-`;
- length 1–64 after trimming;
- one case-insensitive alias name maps to one version per asset;
- assigning an existing alias moves its pointer;
- removing or moving a pointer does not change any version;
- suggested labels are presentation hints only.

### 3.3 Deterministic comparison

`compareAssetVersions(current, previous)` compares canonical snapshots and
verification references. It emits at most 100 ordered items:

```ts
interface AssetVersionComparisonItem {
  key: string
  label: string
  state: 'regression' | 'recovery' | 'changed' | 'unchanged'
  previous: string
  current: string
  basis: 'recorded-fact' | 'deterministic-check'
}
```

Fixed fact transition rules:

- open (`markdown`, `json`, `yaml`) to `proprietary`: regression; reverse:
  recovery;
- `sharedByDesign` true to false: regression; reverse: recovery;
- coverage platform removed: regression; added: recovery;
- fallback removed: regression; added: recovery;
- asset state `active` to `missing`/`archived`: regression; reverse to active:
  recovery;
- other unequal values: changed.

Stable check transitions use the Feature 009 status order:

```text
pass -> warn/fail/unknown: regression
warn/fail/unknown -> pass: recovery
other unequal transition: changed
```

`accepted` is shown as changed unless both values are `accepted`; a human
acceptance is not promoted to passing truth. Dates and dynamic freshness do
not independently produce historical regression/recovery. No numeric rollup
or overall verdict is computed.

If fewer than two valid versions exist, the result is
`no-previous-version`. Unknown snapshot versions fail closed as invalid.

### 3.4 Evidence Packet contract

Add `src/lib/evidence-packet.ts`:

```ts
interface EvidencePacketV1 {
  schemaVersion: 1
  packetType: 'sancussight-evidence-packet'
  packetId: string
  exportedAt: string
  subject: EvidencePacketSubjectV1
  predicate: AssetVersionPredicateV1 | ExitDrillPredicateV1
  producer: { name: 'SancusSight'; contractVersion: 1 }
  run: EvidencePacketRunV1
  qualification: EvidencePacketQualificationV1
  verification: EvidencePacketVerificationV1[]
  humanDecisions: EvidencePacketDecisionV1[]
  missingEvidence: EvidencePacketMissingV1[]
  comparison?: AssetVersionComparisonV1
}
```

The subject is a hash of the asset's stable ID or canonical ID plus a bounded
kind, never the raw asset ID or name. Asset predicates identify the recorded
version ID and fixed snapshot fingerprint. Exit-drill predicates include the
target platform as a safe bounded token, the deterministic verdict, and
bounded item statuses keyed by hashed asset subject. They do not include
workflow names or item notes.

Qualification is one of:

- `recorded` for immutable version snapshot facts;
- `deterministic` for locally computed check or drill results;
- `manual` for explicitly recorded human decision metadata;
- `missing` for an absent required reference.

Human decisions contain only a decision kind, status, recorded time, and safe
decision-reference hash. Decision rationale, owner, and notes are excluded.

### 3.5 Canonical JSON and digest

`canonicalizeEvidencePacketPayload` recursively:

- sorts object keys lexicographically;
- preserves already canonical array order;
- rejects `undefined`, non-finite numbers, unsupported prototypes, and keys
  outside the exact contract;
- uses UTF-8 JSON with no insignificant whitespace.

Digest preimage:

```text
canonical JSON of every packet field except packetId and exportedAt
```

`packetId` is `sha256:<64 lowercase hexadecimal characters>`. Re-exporting the
same qualified payload at a different time therefore produces the same packet
identity while retaining an honest `exportedAt`. Packet validation recomputes
and compares the digest before download.

`downloadEvidencePacket` creates a Blob URL only after validation, uses a
bounded filename `sancussight-evidence-packet-<kind>-<digest-prefix>.json`,
clicks one temporary anchor, then revokes the URL. Lack of Web Crypto, Blob,
or download support returns an explicit failure and does not mutate registry
state.

### 3.6 Safety validation

Packet construction is projection, not sanitization-after-copy. Builders
accept narrow typed inputs and construct new objects. Runtime validation then
enforces:

- exact keys at every level;
- supported enum and schema values;
- ISO timestamps;
- lower-case SHA-256 references;
- all collection and string limits;
- no absolute Windows/POSIX path, URL, email, control character, private-key
  marker, or prohibited key such as `prompt`, `response`, `credential`,
  `token`, `secret`, `path`, `location`, `owner`, or `attributes`.

Invalid input produces no partial packet and no download.

### 3.7 Schema-version-2 compatibility and compiler refresh

`normalizeRegistry` keeps absent Feature 010 fields absent. When fields exist,
it validates exact supported version shapes, chronological order, unique
version IDs, valid current pointer, alias uniqueness/targets, and all bounds.
It returns actionable failure for invalid metadata rather than deleting or
repairing it.

The registry compiler extends its local `RegistryAsset` projection with the
same optional fields. On a confirmed refresh it looks up the previous asset by
`stableId ?? id`:

- valid version metadata is preserved unchanged;
- current observed fields are still produced from confirmed proposals;
- no snapshot is appended;
- removed assets retain history while becoming `missing`;
- portable output uses the same structural history but sanitizes bounded
  provider/capability/fallback labels and never introduces local paths;
- invalid previous metadata fails the existing importability guard.

This is preservation, not migration or automatic version creation.

### 3.8 Product integration

Asset Passport keeps its six canonical sections. The existing **History**
section gains:

- explicit `No recorded versions` state;
- `Record current version`;
- ordered version rows with current state and aliases;
- alias add/move/remove controls;
- current-versus-previous comparison;
- `Export Evidence Packet` for the selected current version.

The selected Asset Passport remains the only asset inspector. Desktop retains
Feature 008 catalog-plus-Passport adjacency. At narrow widths, version detail
is inside the existing mutually exclusive Passport state rather than a new
parallel workspace.

Exit Drills gains `Export Evidence Packet` only when a current deterministic
result exists. The packet is built from that result at export time. No claim
of a persisted drill run or provider execution is made.

`App` remains the owner of registry edits. Recording a version or changing an
alias calls the existing registry update path and marks the session dirty.
Packet export is read-only.

## 4. Component / Module Structure

```text
App
  Registry / Asset Passport
    History
      VersionHistory
      VersionComparison
      EvidencePacketExport
  ExitTest
    EvidencePacketExport

src/lib/asset-versions.ts
  project / validate / record / dedupe / alias / compare

src/lib/evidence-packet.ts
  project / canonicalize / hash / validate / download

packages/registry-compiler/src/output/local.ts
  preserve valid optional version metadata
```

No new navigation destination, backend route, runtime dependency, or
IndexedDB database is introduced.

## 5. Data and State

- Registry schema remains `2`.
- Version history and aliases persist only in optional asset fields.
- Asset fields remain the mutable current state.
- A recorded version is immutable; aliases and current pointer are mutable.
- Selected version row, alias input, export feedback, and responsive focus
  state are ephemeral React state.
- Feature 009 check history remains a separate metadata-only IndexedDB
  concern and is not reused as asset version history.

## 6. User Flows

```text
Asset Passport / History
  -> Record current version
  -> selected current version
  -> current versus previous comparison
  -> optional alias change
  -> local Evidence Packet download

Exit Drills
  -> choose workflow and target
  -> inspect deterministic result
  -> local Evidence Packet download
```

Narrow focus flow:

```text
asset row -> Passport heading -> History control -> version row/detail
  -> Back to Assets -> original selected asset row or useful catalog fallback
```

## 7. Edge Cases

| Case | Expected behavior |
|---|---|
| Existing asset has no version fields | Load unchanged; show `No recorded versions` |
| Only one version exists | Show `No previous version recorded` |
| Current equivalence projection equals last version | Do not append; report already recorded |
| Check status or safe evidence hash changes while asset facts do not | Append a distinct version so regression/recovery remains comparable |
| Alias differs only by case | Treat as the same alias and move/update one pointer |
| Alias target is missing | Reject registry metadata or UI action |
| Oldest version falls beyond 50 | Drop oldest only during explicit new recording |
| Unsupported snapshot schema | Fail closed with local validation error |
| Feature 009 result is uncataloged | Exclude from verification refs; do not invent definition |
| Web Crypto unavailable | Show export/recording unavailable; do not mutate or download |
| Unsafe packet input | Reject entire packet and state export failed |
| Exit Drill has no result | Do not show an enabled export action |
| Compiler refresh matches stable asset | Preserve valid history and pointers, append nothing |
| Compiler refresh archives asset | Preserve history; comparison does not rewrite past state |

## 8. Accessibility and Responsive Notes

- Version rows and alias controls use native buttons, inputs, and labels.
- The current version uses visible text plus `aria-current`.
- Comparison states always include the words regression, recovery, changed, or
  unchanged.
- Export success/failure uses a polite status region and never relies on toast
  color alone.
- Long IDs and hashes wrap with `overflow-wrap: anywhere`.
- At 320 CSS pixels and effective 200% zoom, controls stack and no page-level
  horizontal overflow is permitted.
- Reduced-motion preferences apply to any existing panel transition.

## 9. Testing Strategy

- Pure tests for canonical snapshot/equivalence projection, identity, dedupe, retention,
  aliases, comparisons, and invalid metadata.
- Adversarial packet tests for exact keys, digest stability, unsafe keys,
  paths, URLs, email/user identity, prompts/responses, credentials, oversized
  data, and tampered digests.
- Compiler tests for unchanged schema2 input, preservation on refresh,
  portable sanitization, missing assets, and invalid history.
- UI/static tests for one canonical History integration and Exit Drill export.
- Local real-Chromium tests for recording, persistence, comparison, alias
  focus, downloaded JSON inspection, 320px, 200% zoom, console, and network.
- Hosted verification of the exact reviewed bundle and local-only download.

## 10. Design Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: feature010-design-20260724-01
  recommended: no
  recommendation_reason: The bounded data flow, packet contract, and existing Passport integration are explicit; no unresolved human layout or architecture choice requires HTML.
  state: declined
  adapter: visualize-sdd
  decision_source: Operator instruction that optional HTML is declined under autonomous no-stop execution.
```

## 11. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Version history silently becomes a mutable copy of the asset | Fixed immutable projection and explicit alias pointers |
| Export leaks registry/evidence content | Construct-from-allowlist builder plus recursive exact-shape validation |
| Comparison overclaims truth | Fixed transition table, textual basis, no overall score |
| Compiler refresh destroys history | Stable-identity preservation tests and no automatic append |
| UI adds another inspector | Integrate only in canonical Asset Passport History and Exit Drill |
| Dirty tree causes ownership collision | Fully serialized fresh visible tasks with exact surfaces |

## 12. Approval Checklist

- [x] Every approved requirement maps to a design seam
- [x] Optional schema-version-2 compatibility is explicit
- [x] Version, alias, comparison, and packet semantics are deterministic
- [x] Privacy projection and fail-closed validation are testable
- [x] Existing Asset Passport and Exit Drill remain canonical
- [x] Optional HTML offer recorded as declined
- [x] Operator blanket approval reconciled

## 13. R1 Truthfulness Correction

### 13.1 Comparison cap semantics

Build the full deterministic transition set before bounding. Partition it into
meaningful items (`regression`, `recovery`, `changed`) and `unchanged`
context. If meaningful items exceed 100, return
`unavailable-too-many-changes` with `totalMeaningfulItems` and no partial
classification. Otherwise include every meaningful item first, then only
enough unchanged context to reach 100, with `totalItems`, `truncated`, and
`omittedUnchangedCount`. UI and packet projections preserve these fields.

### 13.2 Verified imported identity

Add one async `verifyAssetVersionHistoryIdentity` seam that recomputes every
accepted version ID from its canonical preimage before snapshot import,
working-session acceptance, or packet export. Browser hashing uses Web Crypto;
the compiler uses Node SHA-256 against identical canonical preimages and test
vectors. Synchronous shape normalization remains necessary but does not
establish verified identity.

### 13.3 Portable derivative contract

A local version remains immutable and `recorded`. When portable output
sanitizes any retained snapshot label, the compiler creates a
`portable-projection` derivative, stores a safe `derivedFromVersionId`,
computes a new deterministic derivative ID from the source ID plus sanitized
qualified projection, and remaps aliases/current pointer. Product and packet
validation verify the derivative preimage. If safe derivation fails, portable
output omits that history rather than preserving an overclaim.

### 13.4 Strict calendar parsing

Use canonical UTC round-trip validation for timestamps and explicit
year/month/day validation for dates. Reject impossible days, invalid leap
days, non-canonical offsets/fractions, and runtime-normalized rollover values.
Product and packet code share one helper; compiler code follows identical
vectors at its package boundary.

### 13.5 Packet-derived comparison

The asset packet builder accepts verified current/previous version context,
calls the canonical comparison mechanism internally, and accepts no prebuilt
comparison claim. Digest validation continues to prove payload integrity only.
