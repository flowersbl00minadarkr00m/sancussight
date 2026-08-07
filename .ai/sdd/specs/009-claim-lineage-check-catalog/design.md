# Feature 009 Design: Claim Lineage and Check Catalog

> Status: Approved
> Requirements: `@.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
> Approval: User instruction in visible orchestrator task on 2026-07-23 to continue Feature 009 autonomously under the existing blanket approval
> Grounded in: `src/types.ts`, `src/lib/registry.ts`,
> `src/lib/evidence.ts`, `src/components/Registry.tsx`,
> `src/components/Queue.tsx`, `src/components/EvidenceLedger.tsx`,
> `src/components/governance/LineageInspector.tsx`, and existing IndexedDB
> connection/snapshot stores

## 1. Summary

Feature 009 introduces two related but separate deterministic concepts:

1. a stable, versioned Check Catalog definition; and
2. an asset-specific check result that can construct one bounded claim-lineage
   explanation.

The existing `Signal` remains the live result carrier. Supported deterministic
signals gain an explicit `checkId` instead of inferring their contract from
finding copy. A pure catalog module owns definitions, result mapping,
plain-language remediation, and invalidation rules. A pure lineage module
constructs the shortest applicable typed path from already accepted registry,
signal, evidence-reference, source-state, and human-decision metadata.

Attention becomes the canonical Check Catalog workspace. Findings in Attention
and the Asset Passport open the same selected result detail. Existing
governance lineage remains unchanged because it explains governance-event
chains rather than portability claims.

## 2. Requirements Mapping

| Requirement | Design coverage |
|---|---|
| FR-001 | Versioned `CHECK_CATALOG`, explicit `Signal.checkId`, definition search/index |
| FR-002 | `CheckResultDetail` projection and canonical Attention inspector |
| FR-003 | Pure bounded `buildClaimLineage` projection with typed nodes, edges, and gaps |
| FR-004 | Definition-authored belief, pass, missing, and invalidation explanations |
| FR-005 | Bounded metadata-only IndexedDB result history with consecutive deduplication |
| FR-006 | One App-owned open-check intent used by Asset Passport and Attention |
| FR-007 | Text truth classes and edge-state labels throughout the inspector |
| FR-008 | Explicit uncataloged observation fallback; no invented definition |
| NFR-001 | Native controls, focus protocol, mutually exclusive narrow list/detail state |
| NFR-002 | Browser-local modules; metadata-only history; no new network path |
| NFR-003 | Pure mappings, no scoring, explicit missing/stale/inferred/conflicting states |
| NFR-004 | Optional fields only; no registry schema, adapter, or governance-lineage migration |
| NFR-005 | Linear bounded projection and retention caps |

## 3. Technical Approach

### 3.1 Stable check definitions

Add `src/lib/check-catalog.ts` with a checked-in immutable catalog:

```ts
interface CheckDefinition {
  id: string
  version: 1
  dimension: Dimension
  title: string
  question: string
  importance: string
  rule: string
  inspectedInputs: readonly string[]
  outcomes: readonly SignalStatus[]
  passCondition: string
  remediation: string
  invalidation: string
}
```

IDs describe rule families, not assets or dynamic provider names. Examples:

```text
asset.open-format.v1
asset.named-owner.v1
asset.review-freshness.v1
portability.platform-coverage.v1
portability.provider-fallback.v1
continuity.workflow-fallback.v1
continuity.substitution-drill.v1
evidence.workflow-durability.v1
governance.action-authority.v1
governance.action-reversibility.v1
governance.accepted-asset-metadata.v1
candidate.metadata-completeness.v1
candidate.check-mapping.v1
candidate.data-egress.v1
candidate.bundle-readiness.v1
ontology.stable-identity.v1
ontology.producer-consumers.v1
ontology.evidence-survival.v1
ontology.findmnemo-rename-compatibility.v1
evidence.binding-presence.v1
```

`evaluateAsset` and the missing-evidence branch of `evidenceSignals` set
`checkId`. Accepted external evidence observations remain source-qualified
facts without a catalog definition unless a future approved feature defines
one. `resolveCheckDefinition` never parses human-facing condition or finding
strings.

### 3.2 Result projection

Add optional, backward-compatible fields to `Signal`:

```ts
checkId?: string
evaluatedAt?: string
```

`projectCheckResult(signal, context)` returns:

- stable result key: registry scope + asset ID + check ID;
- definition or explicit `uncataloged`;
- current status, finding, owner, evaluation time, and safe evidence summary;
- exact inspected input labels from the definition;
- applicable evidence-envelope reference, source health, operational run,
  target, and contract metadata;
- plain-language belief, missing, pass, and invalidation explanations.

The projection does not preserve raw attributes or reconstruct a rule from
unstructured text.

### 3.3 Bounded claim lineage

Add `src/lib/claim-lineage.ts` with pure types and a pure builder:

```ts
type ClaimNodeKind =
  | 'target' | 'evidence' | 'producer' | 'run'
  | 'contract' | 'claim' | 'decision'

type ClaimEdgeState =
  | 'verified' | 'missing' | 'inferred' | 'stale' | 'conflicting'
```

The builder receives one projected result plus only already accepted evidence
and source state relevant to its asset/evidence reference. It emits at most one
node of each applicable kind, except for a small bounded evidence set when
conflicting latest observations must remain visible.

Conceptual order:

```text
target -> evidence -> producer -> run -> contract -> claim -> decision
```

Inapplicable nodes are omitted. Missing required evidence creates an explicit
gap and `missing` edge. Narrative-only evidence without an exact accepted
reference is `inferred`. A degraded source or expired freshness rule is
`stale`. Latest accepted observations that make incompatible outcome claims
for the same subject/check are `conflicting`. Exact deterministic evaluation
of recorded inputs uses `verified` for the binding between the inspected input,
rule, and generated result; the UI explains that this does not independently
verify the real-world truth of the input.

The builder performs no graph search, network request, upstream read, or
governance mutation.

### 3.4 Previous-result history

Add `src/lib/check-history-store.ts` as a dedicated IndexedDB database rather
than changing the existing connection-store database version. The database
stores only:

```ts
interface CheckResultSnapshot {
  registryScopeHash: string
  assetId: string
  checkId: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceHash: string
}
```

The registry scope is a SHA-256 hash of schema version plus sorted stable asset
identifiers/IDs; the preimage is not stored. The safe evidence hash covers only
the bounded result status and already reader-facing safe evidence reference,
not raw envelope attributes or source content.

On a successfully active registry, App records cataloged results after the
current evaluation stabilizes. The store:

- treats `(scope, asset, check)` as one history stream;
- ignores a new snapshot when status and safe-evidence hash match the latest
  snapshot;
- retains at most 20 distinct snapshots per stream and 1,000 globally;
- returns the latest and immediately previous distinct snapshot;
- fails closed to `history unavailable` without blocking current evaluation.

Demo and hosted/manual modes remain local browser data and are namespaced by
their registry scope. Clearing or disconnecting the registry does not claim to
erase all browser history; a Check Catalog action can clear Feature 009
history explicitly.

### 3.5 Canonical Check Catalog workspace

`src/components/CheckCatalog.tsx` becomes the content for the existing
Attention destination. It contains:

- a searchable list of stable definitions with current applicable-result
  count and worst current status as text;
- an `Attention now` result list ordered by the existing deterministic
  severity order;
- one adjacent detail region on desktop;
- one mutually exclusive list/detail state below the existing 900 CSS-pixel
  content breakpoint.

The detail sections are:

1. **Definition** — question, importance, exact rule, inputs, outcomes.
2. **Current result** — asset, status, finding, evaluated time, owner.
3. **Previous result** — prior distinct status/time or explicit absence.
4. **Evidence inspected** — safe references and explicit missing/uncataloged
   state.
5. **Claim lineage** — ordered typed nodes, labeled edges, and gaps.
6. **Remediation and invalidation** — what passes and what changes the claim.

A definition can be inspected without a current asset result. In that state,
current result, previous result, and asset lineage explicitly read `No result
selected`; the rule itself remains useful.

### 3.6 Cross-view navigation and focus

`App.tsx` owns an optional check-selection intent:

```ts
{ checkId: string; signalId?: string; assetId?: string; origin: 'attention' | 'asset-passport' }
```

`Registry` receives `onOpenCheck(signal)` and replaces no content; each
cataloged `SignalList` row gains `Open check explanation`. The callback sets
the intent and opens the existing `queue`/Attention view. The Attention list
uses the same path.

On desktop, selecting another check/result updates adjacent detail without
moving focus. On narrow screens, selection remembers the activating element,
shows only detail, and focuses the detail heading. `Back to checks` restores
focus to the selected result/definition or a safe catalog heading fallback.
`Open Asset Passport` uses Feature 008's canonical `handleSelectAsset`.

No new primary or advanced navigation label is added.

## 4. Component / Module Structure

```text
App
  Registry / AssetPassport
    SignalList -> onOpenCheck
  CheckCatalog (existing Attention route)
    CheckDefinitionList
    CurrentFindingList
    CheckDetail
      ClaimLineageInspector
      ResultComparison

src/lib/check-catalog.ts
  stable definitions
  signal/result mapping
  search and grouping

src/lib/claim-lineage.ts
  bounded pure lineage builder

src/lib/check-history-store.ts
  metadata-only IndexedDB repository
```

The existing governance `LineageInspector` remains unchanged. Shared visual
primitives may be reused, but the two domain models are not merged.

## 5. Data Model / State

- Registry schema remains version `2`.
- `Signal.checkId` and `Signal.evaluatedAt` are optional to preserve imported
  or older in-memory signal compatibility.
- Check definitions are checked-in code, not user-editable persisted data.
- Catalog query, selected definition/result, narrow state, and focus refs are
  ephemeral React state.
- Only bounded `CheckResultSnapshot` records persist in the dedicated browser
  history store.
- No raw evidence envelope, registry object, signal finding text, operator
  name, path, prompt, response, or credential is copied into history.

## 6. API / Integration Contract

No server route or external API is introduced. Integration is through existing
in-memory props:

- active `Registry`;
- current `Signal[]`;
- accepted `EvidenceEnvelopeV1[]`;
- current `EvidenceSourceState[]`;
- App navigation callbacks.

Hosted mode performs no localhost or third-party request for Feature 009.

## 7. Security / Permissions / Privacy

- Lineage reads only normalized, already accepted metadata and safe references.
- Imported raw source content remains behind existing adapters.
- IndexedDB history stores bounded metadata and hashes only.
- Check Catalog has no execute, scan, install, approve, enforce, or provider
  control.
- Uncataloged signals remain source-qualified rather than receiving invented
  authority.
- Spec 005 release manifests, producer files, tokens, and operational scripts
  are not read or written by Feature 009 implementation.

## 8. User Flows

```text
Asset Passport finding
  -> Open check explanation
  -> Attention / selected result
  -> definition + current/previous + bounded lineage
  -> Open Asset Passport or return

Attention
  -> select current finding or definition
  -> inspect one canonical detail

Narrow screen
  -> select item
  -> detail heading receives focus
  -> Back to checks
  -> activating item or catalog heading receives focus
```

## 9. Edge Cases

| Case | Expected behavior |
|---|---|
| Signal has no `checkId` | Label `Uncataloged observation`; show source-qualified result only; no invented rule or lineage |
| `checkId` is unknown | Label unsupported catalog ID and fail closed to uncataloged detail |
| No prior result | Show `No previous result recorded` |
| History store unavailable | Current result remains usable; comparison says local history unavailable |
| Missing evidence binding | Show evidence gap and `missing` edge |
| Narrative evidence without exact reference | Show `inferred` edge and explanation |
| Source stale or unavailable | Preserve accepted record but label the relationship `stale` |
| Latest evidence conflicts | Show bounded conflicting evidence steps and `conflicting` relationship |
| Definition has no applicable results | Definition detail remains inspectable with explicit no-result state |
| Selected result disappears after registry change | Preserve definition, state that the prior result is no longer current, and return focus safely |
| Breakpoint changes with detail open | Preserve selection; switch representation without duplicating controls |

## 10. Accessibility / UX Notes

- Result and edge states always include visible text.
- Definition and result rows are native buttons or links with
  `aria-current`/selected semantics.
- The desktop detail region has one stable heading target.
- Narrow list/detail states are mutually exclusive in the DOM focus order.
- Ordered lineage uses semantic lists; edges remain readable without a visual
  connector.
- Long IDs and hashes wrap or truncate with an accessible full label.
- 320 CSS-pixel and 200% zoom acceptance includes zero page-level horizontal
  overflow.

## 11. Observability / Operations

No analytics or remote logs are added. Local history-store errors are exposed
as bounded user-facing availability text and do not contain raw source
content. Existing browser console and network acceptance remains the
operational verification seam.

## 12. Migration / Rollout

- No registry migration.
- New optional `Signal` fields are populated by current deterministic
  evaluators.
- The dedicated history database begins empty and truthfully shows no previous
  result until a distinct later result is recorded.
- Rollback removes the Check Catalog/history modules and restores the existing
  Attention component; existing registry/evidence stores remain untouched.
- Production deployment is a final separately bounded ticket to the existing
  canonical Vercel project under the user's blanket authorization.

## 13. Technical Decisions

### TD-001: Explicit check IDs, never text parsing

- **Decision:** Supported evaluators attach stable `checkId` values.
- **Why:** Result copy can change without changing the underlying contract.
- **Trade-off:** Each new deterministic check must register a definition.
- **Alternative:** Infer checks from signal IDs or condition strings; rejected
  as fragile and misleading.

### TD-002: Attention owns the canonical check workspace

- **Decision:** The existing Attention route hosts Check Catalog list/detail.
- **Why:** It is already the destination for non-passing findings and avoids a
  fifth primary navigation item.
- **Trade-off:** Attention becomes richer and needs careful progressive
  disclosure.
- **Alternative:** Add a new navigation destination or duplicate inspectors
  inside Assets; rejected as unnecessary.

### TD-003: Dedicated bounded history database

- **Decision:** Store safe result snapshots in an independent IndexedDB
  database.
- **Why:** It avoids a risky version change to existing connection stores and
  supports honest previous-result comparison.
- **Trade-off:** A small additional local persistence module and clear-history
  action are required.
- **Alternative:** Session-only history; rejected because it would not provide
  meaningful recorded history across use.

### TD-004: Claim lineage and governance lineage stay separate

- **Decision:** Reuse interaction conventions, not the governance event model.
- **Why:** The models answer different questions and carry different
  authority.
- **Trade-off:** Two bounded inspector components exist.
- **Alternative:** Generalize one graph abstraction; rejected as speculative
  generality and a source of false equivalence.

### TD-005: No external definition or graph dependency

- **Decision:** Use checked-in TypeScript definitions and pure projections.
- **Why:** The current scale is small, deterministic, local, and testable.
- **Trade-off:** Standards import waits for Feature 011.
- **Alternative:** Introduce OpenLineage/GUAC/Scorecard runtime dependencies;
  rejected as disproportionate and out of scope.

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `verified` edge is mistaken for real-world proof | High | Explain it as verified deterministic binding; keep source qualification and missing/stale states visible |
| History silently retains sensitive content | High | Fixed snapshot schema, hashes only, allowlist tests, bounded retention |
| Attention becomes too dense | Medium | Definition/result list with one inspector, shortest path default, progressive sections |
| Dynamic result IDs break stable mapping | Medium | Explicit rule-family `checkId`, never parse result IDs or copy |
| Conflicting evidence creates a graph explosion | Medium | Retain only bounded latest relevant observations |
| Feature work overlaps dirty React/CSS surfaces | High | Serial fresh workers with exact owned surfaces and orchestrator reconciliation |
| Hosted build diverges from reviewed source | High | Prebuilt deployment lock and canonical hosted browser acceptance |

## 15. Verification Strategy

### Unit / contract seam

- every evaluator-emitted `checkId` resolves to one stable definition;
- no duplicate IDs and no catalog definition depends on an asset ID;
- check search, result grouping, uncataloged fallback, and explanations;
- bounded lineage node order, omissions, gaps, all five edge states, and
  maximum cardinality;
- history deduplication, previous distinct result, retention caps, scope
  isolation, and storage allowlist;
- no raw envelope attributes or finding text enter a snapshot.

Preferred first red/green test: a failed provider-fallback signal resolves to
`portability.provider-fallback.v1` and produces a target -> recorded input ->
deterministic contract -> claim path plus exact passing remediation.

### Component / browser seam

- Attention lists definitions and current findings and opens one canonical
  detail.
- Asset Passport `Open check explanation` selects the same result.
- Definition-only, current/previous, missing history, uncataloged, stale,
  inferred, conflicting, and remediation states render truthfully.
- Narrow selection focuses detail; Back restores focus.
- Open Asset Passport preserves the selected asset.
- 320px/200% zoom has no page-level horizontal overflow.

### Regression gates

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
```

No Spec 005 operational or A-002 command is part of Feature 009 verification.

### Hosted verification

After the reviewed source is deployed to the exact existing canonical Vercel
project, verify:

- Check Catalog and result detail at `https://sancussight.vercel.app`;
- Asset Passport -> check detail -> Asset Passport route;
- current/previous absence truthfulness without seeding private data;
- desktop and narrow focus/overflow behavior;
- zero unexpected console errors/warnings and no new Feature 009 network
  requests.

## 16. Implementation FAQ

**Q: Does every `Signal` need a Check Catalog definition?**
A: No. Deterministic SancusSight checks do. Imported/source observations remain
explicitly uncataloged unless a future approved contract defines them.

**Q: Is `verified` an assertion that an external fact is true?**
A: No. It means the displayed result is deterministically bound to the named
accepted input and check rule. Evidence verification and source health remain
separately visible.

**Q: May history save finding or remediation text?**
A: No. Definitions supply stable explanatory text; snapshots store only the
allowlisted IDs, status, timestamp, scope hash, and safe evidence hash.

**Q: Can the claim inspector reuse governance lineage data?**
A: It may display a human decision reference when already related to the
asset, but it must not reinterpret governance event lineage as claim proof.

**Q: What happens when IndexedDB fails?**
A: Current check detail remains fully usable and previous result reads `Local
history unavailable`.

## Planned Understanding

The dominant difficulty is distinguishing three layers that look similar in
the current UI:

```text
stable rule definition
  -> current asset-specific deterministic result
  -> shortest qualified evidence path behind that result
```

History compares result metadata, not asset versions and not raw evidence.
Governance lineage remains a separate event-accountability model. These
boundaries prevent the Check Catalog from becoming a score, graph platform, or
hidden evidence store.

## Visualization Offer

```yaml
visualization_offer:
  stage: design
  source_revision: feature009-design-20260723-01
  recommended: no
  recommendation_reason: The approved interaction extends the already verified Feature 008 master-detail pattern and the Markdown design fully states the new domain boundaries.
  state: declined
  adapter: visualize-sdd
  mode: design-explainer
  output_path:
  screenshot_paths: []
  ui_image_offer: not-applicable
  ui_mockup_paths: []
  decision_source: User instruction to continue autonomously and stop only for genuine human intervention; optional artifacts are non-blocking.
```

## Approval Record

The approved design was checked against every Must Have requirement and the
current implementation seams. It adds no registry migration, server route,
external dependency, raw-content history, global graph, aggregate score, or
Spec 005 contract change. The optional HTML explainer was declined under the
user's no-stop direction.
