# Feature 010 Understanding Record

> Supporting evidence only. This record cannot approve a gate or replace the
> authority sources.
> Current `.status`: `review:done`
> Refreshed: 2026-07-24

## Exact Authority Sources

- `.ai/sdd/specs/010-asset-versioning-evidence-packets/.status`
- `.ai/sdd/PLAN.md`
- `.ai/steering/product.md`
- `.ai/steering/tech-stack.md`
- `.ai/steering/conventions.md`

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

- **Dominant difficulty:** separating mutable current asset state, immutable
  recorded versions, flexible aliases, deterministic comparison, and a
  privacy-safe portable packet.
- **Evidence mode:** local Markdown plus focused tests, local browser
  inspection, and exact hosted-artifact verification.
- **Confirmation state:** the operator's blanket no-stop approval authorizes
  routine SDD advancement provided no material conflict emerges.

## Planned

```text
current Asset Passport
  -> explicit bounded version snapshot
  -> current versus immediately previous comparison
  -> regression / recovery / changed / unchanged explanation
  -> sanitized local Evidence Packet
```

Existing schema-version-2 registries remain valid with no fabricated history.
Aliases remain labels rather than truth claims. Packets expose only a fixed
metadata projection and safe hashes, never the registry or raw evidence.

## Task Readiness

- **Depth:** medium.
- **Known seams:** `src/types.ts`, registry normalization, compiler
  preservation, Asset Passport History, Exit Drills, Feature 009 result
  metadata, canonical JSON download.
- **Conflicts:** none; Feature 008 and Feature 009 are complete.
- **Optional requirements visualization:** not required.
- **Optional design HTML and task microworld:** declined under the operator's
  explicit no-stop direction unless a human decision later requires one.

## Divergence and Conflicts

Tracking-owner T1 review found one design/implementation conflict. The approved
comparison includes stable check-result transitions, but the original
snapshot-only dedupe ignored `verificationRefs`. An independently reproduced
`pass -> fail` check-only change returned `deduplicated`, retained one version,
and kept the old `pass` status. That makes FR-003/FR-004 unreachable for a
check-only regression.

The design is reopened to define a qualified equivalence projection containing
asset facts, source hashes, and stable verification identity/status/evidence
hash while excluding observation timestamps. This is an aligned correction,
not new scope. T2 remains blocked. Spec 005 remains a separate paused authority
plane; T16R5, T16, and A-002 remain unauthorized.

The corrected design is approved under the existing blanket authorization
after confirming that it preserves privacy bounds, repeated-equivalent dedupe,
stable identity, and the original current-versus-previous scope.

## Design Replay

The design keeps four authorities separate:

1. current mutable asset facts;
2. immutable explicitly recorded version snapshots;
3. mutable alias pointers that make no truth claim; and
4. a read-only Evidence Packet projection with deterministic identity.

The registry stays at schema version 2. Existing assets gain no fabricated
history. The compiler preserves valid history by stable identity but never
appends it. Packet export constructs a new allowlisted object and then
validates it; it never sanitizes a copied registry object.

## Decomposition Replay

```text
T1 version model + schema2 normalization
  -> T1R1 qualified equivalence correction
  -> T2 packet contract + adversarial privacy
  -> T3 compiler preservation
  -> T4 Passport/Exit Drill UI
  -> T5 local real-browser acceptance
  -> T6 exact existing-project production deployment
  -> R1 independent full-scope review
```

The sequence is intentionally serial because shared types feed every later
surface. Browser correction authority is bounded to the approved product
surfaces. Deployment owns no product correction. Review owns evidence only.

T1R1 is a narrow correction ticket. It changes no product scope or UI. The
original T1 worker and duplicate worker are terminal; neither may resume.

## As Built — T1 / T1R1

The pure version seam now has fixed schema-version-1 snapshot, verification,
alias, and comparison contracts on optional schema-version-2 asset fields.
Recording is explicit, bounded to 50 versions, and deterministic. Qualified
equivalence includes snapshot facts, sorted source hashes, and stable
verification identity/status/evidence hash while excluding observation
timestamps. This preserves repeated-equivalent dedupe and records check-only
regressions/recoveries. Imported histories use the same rule. Existing
versionless registries remain unchanged, and private mutable copy is excluded
from snapshots.

Fresh tracking-owner evidence: Feature 010 12/12, Feature 009 24/24, Feature
008 6/6, core verification, production build, scoped whitespace, and direct
`pass -> fail` reproduction all pass. T2 is the sole frontier.

## As Built — T2

The strict schema-version-1 Evidence Packet seam now constructs narrow
asset-version and current Exit Drill projections, hashes subjects and safe
references, separates subject/predicate/producer/run/qualification/
verification/decision/missing-evidence sections, canonicalizes plain JSON,
and verifies a SHA-256 identity that excludes only packet ID and export time.
Runtime validation enforces exact shapes, bounds, safe values, and prohibited
content before a local Blob download; failure creates no claimed export and
object URLs are revoked.

Fresh tracking-owner evidence: Feature 010 19/19, Feature 009 24/24, Feature
008 6/6, core, build, and scoped whitespace pass. T3 is the sole frontier.

## As Built — T3

The registry compiler now validates optional Feature 010 metadata with
product-parity bounds, preserves valid local history/aliases/current pointers
by stable identity, retains history for assets becoming missing, and creates
no history for new assets. Portable output retains version structure and
identity while sanitizing only bounded provider/capability/fallback labels.
Invalid prior history and sanitizer collisions fail closed.

Fresh tracking-owner evidence: Feature 010 19/19, compiler 26/26, Feature 009
24/24, Feature 008 6/6, core, build, and scoped whitespace pass. T4 is the
sole frontier.

## As Built — T4

The canonical Asset Passport still has exactly six sections, with History now
owning one explicit version workflow. App remains the sole registry mutation
owner for recording and alias changes. Equivalent recording reports
deduplication without mutation; aliases remain bounded labels; comparison
states and bases are textual; and asset-version and current-result Exit Drill
packets use one local export control with honest pending, success, and failure
states. Existing Feature 008 desktop/narrow structure and callbacks remain
canonical.

Fresh tracking-owner evidence: Feature 010 23/23, Feature 009 24/24, Feature
008 6/6, core, build, and scoped whitespace pass. Real-browser mutation,
download, focus, storage, responsive, console, and network acceptance remain
T5; no browser result is inferred from T4.

## As Built — T5

Local real-Chromium acceptance exposed one genuine integration defect:
cataloged deterministic checks use ISO dates, while the immutable version seam
required full ISO timestamps. The bounded correction normalizes a valid
cataloged ISO date to deterministic UTC midnight before strict validation. No
other product correction was retained.

The complete browser matrix passed across real demo workflows and explicitly
labeled simulated fixtures: no-history/no-mutation, first record, equivalent
dedupe, distinct second record, comparison states, keyboard alias lifecycle,
50-entry retention, IndexedDB restoration, asset and Exit Drill packet
downloads/digests/privacy, desktop adjacency, narrow focus/Back, 320px,
effective 2× rendering, route regressions, zero console warnings/errors, and
loopback-only network traffic.

Fresh tracking-owner evidence: Feature 010 24/24, Feature 009 24/24, Feature
008 6/6, collector 92/92, compiler 26/26, core, build, and scoped whitespace
pass. T6 is the sole frontier; no hosted behavior is inferred from local
acceptance.

## As Built — T6

The exact T5-reviewed artifact was prebuilt and deployed through the existing
canonical Vercel project. Source/config, accepted lockfile, local static,
prebuilt static, and canonical hosted static manifests remained continuous.
Deployment `dpl_EDibRrTBp2FQDxa51ksTArL5Vm6V` is READY, production,
PROMOTED, and serves `https://sancussight.vercel.app` without alias error.

Hosted real-Chromium acceptance passed for no-history, first record,
equivalent dedupe, alias truth boundaries, both local packet downloads and
privacy validation, explicitly labeled comparison fixture states, narrow
one-DOM focus/Back behavior, 320px/effective 200%, routes, Evidence Sources,
and the exact one-link footer. Console/runtime observations were clean and
traffic remained canonical-origin static GETs only.

Fresh tracking-owner evidence: the canonical and immutable Vercel identities
resolve to the same deployment, and Feature 010 24/24, Feature 009 24/24,
Feature 008 6/6, collector 92/92, compiler 26/26, core, build, and full
whitespace verification pass. Implementation is done; independent R1 remains
required before review completion.

## R1 Divergence and Correction

Independent R1 returned `Needs fixes` despite green verification. It
reproduced five truthfulness gaps: unchanged context can crowd a real
regression out of the comparison cap; portable sanitization can modify a
snapshot while retaining recorded identity/qualification; imported IDs are
not recomputed; impossible ISO dates normalize; and packets accept
caller-authored comparisons. The owning requirements/design/tasks are
reopened and re-approved under the blanket authorization with a bounded C1–C3
correction and findings-limited R2. No Feature 011 or Spec 005 scope is added.

## As Built — C1–C3 and R2

C1 corrected the five accepted R1 findings. Meaningful comparison items now
precede bounded unchanged context, and more than 100 meaningful changes return
an explicit unavailable state. Imported recorded and portable version
identities are recomputed from canonical preimages. Portable sanitization
creates a separately qualified `portable-projection` derivative with a new
verified identity and remapped pointers. Calendar validation rejects
impossible and non-canonical dates across product, packet, and compiler
boundaries. Asset-version packet comparison is derived internally from
verified current and previous versions.

C2 reproduced the corrected behavior in local real Chromium without retaining
another product change. C3 deployed the exact C2-reviewed artifact as
production deployment `dpl_A8C9H34nNHkqaJLxizkmvxWN9Xm1`; the canonical URL
and immutable URL resolve the same Ready deployment and the hosted static
bytes match the reviewed artifact.

Independent R2 resolved `R1-SPEC-001` through `R1-SPEC-003` and
`R1-STANDARDS-001` through `R1-STANDARDS-002` with no fix-caused regression.
Fresh tracking-owner verification passed Feature 010 31/31, Feature 009
24/24, Feature 008 6/6, collector 92/92, compiler 28/28, core verification,
production build, whitespace, and corrected deployment inspection. The
preserved R1 comprehensive review and bounded R2 follow-up support
`review:done`.
