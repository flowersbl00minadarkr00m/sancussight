# Feature 011 Understanding Record

> Supporting evidence only. This record cannot approve a gate or replace the
> authority sources.
> Current `.status`: `implementation:in-progress`
> Refreshed: 2026-07-24

## Exact Authority Sources

- `.ai/sdd/specs/011-standards-interoperability/.status`
- `.ai/sdd/specs/011-standards-interoperability/requirements.md`
- `.ai/sdd/PLAN.md`
- `.ai/steering/product.md`
- `.ai/steering/tech-stack.md`
- `.ai/steering/conventions.md`

## Understanding Burden

```yaml
understanding_burden:
  user_familiarity: mixed
  conceptual_novelty: high
  observability: mixed
  blast_radius: cross-boundary
  consequence: consequential
  hidden_decisions: several
  rule_selected_depth: high
  selected_depth: high
  escalation_reason: Compatibility labels can overclaim privacy, provenance, or authentication across evolving standards.
```

## Requirements Intent Replay

- **Outcome:** safe, local, profile-qualified interoperability previews and one
  unsigned Statement export.
- **Representative scenario:** import a bounded OpenLineage file, inspect
  sanitized counts/hashes and telemetry alignment, then wrap a validated
  Evidence Packet in Statement v1.
- **Edge:** mixed safe, unknown, oversized, and malformed records are isolated;
  only safe projections survive.
- **Must not happen:** raw names, URLs, facets, prompts, responses, credentials,
  or an authenticated-attestation claim enter retained state.
- **Unchanged:** Feature 008/009/010 contracts, registry schema 2, primary
  navigation, and Spec 005 authority.
- **Rejected interpretation:** no live backend, generic OTLP, tracing SDK,
  DSSE/signing, external verification, or policy engine.

## Approval and Visualization

- Requirements approval source: source orchestration direction to continue
  Feature 011 autonomously under the existing blanket approval.
- Dedicated `sdd-understanding` skill: unavailable in the installed skill
  catalog; the required replay is preserved above as supporting evidence.
- Design HTML preference: declined by the operator's existing no-HTML
  direction; record the design revision after it exists.
- Task microworld preference: declined by the same direction; record the task
  revision after it exists.

## Planned

The design must preserve four separate boundaries: external input validation,
sanitized SancusSight projection, profile-qualified compatibility reporting,
and optional local export. No adapter may bypass Feature 009/010 truth or
privacy contracts.

The approved design implements those boundaries as pure native modules, a
dedicated preview store, and one advanced Evidence Sources workspace. The
dominant privacy rule is that external raw identifiers and content never leave
the transient validator; only domain-separated hashes and bounded counts do.

```yaml
visualization_offer:
  stage: design
  source_revision: feature011-design-20260724-01
  recommended: no
  recommendation_reason: The design already makes the transformations and non-claims explicit.
  state: declined
  adapter: visualize-sdd
  mode: design-explainer
  ui_image_offer: not-applicable
  decision_source: Operator standing no-HTML preference.
```

## As Built

### T1 — Pinned profiles and OpenLineage projection

- `truth_label: implemented`; source:
  `src/lib/standards-profiles.ts` — four immutable descriptors pin exact
  profile identity, projection version, upstream version/profile, stability,
  source, accepted input kind, and limitation.
- `truth_label: implemented`; source:
  `src/lib/openlineage-import.ts` — bounded processing is byte/time gate,
  JSON-or-JSONL framing, record cap, exact-shape validation, whole-facet
  omission, domain-separated hashing, stable sorting, then sanitized summary.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 7/7, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, core verification, production build, and scoped whitespace
  all pass.
- `truth_label: verified`; source:
  `src/lib/__tests__/feature011-openlineage.test.mjs` — raw
  producer/schema/run/job/dataset identifiers, facet values, credentialed
  producer URLs, rejected content, and hash preimages do not enter returned
  shapes.
- `truth_label: observed`; source: T1 changed-file inventory — no store, UI,
  telemetry alignment, Statement export, policy runtime, network path,
  dependency, or governance mutation was added.

The deliberate trade-off is narrowness: unknown schemas, event types, and
extension keys are rejected even when a broader standards implementation
might accept them. Compatibility remains profile-qualified metadata preview,
not evidence truth, certification, or authenticated provenance.

### T2 — Telemetry alignment and unsigned Statement v1

- `truth_label: implemented`; source:
  `src/lib/telemetry-alignment.ts` — already accepted runtime evidence is
  revalidated against a fixed metadata allowlist and projected into
  deterministic OpenTelemetry/OpenInference rows with explicit aligned,
  omitted-private, unsupported, missing, and not-applicable states.
- `truth_label: implemented`; source:
  `src/lib/in-toto-statement.ts` — a validated Feature 010 Evidence Packet can
  produce one exact unsigned Statement v1, canonical JSON, independent
  confirmation digest, and bounded local download; invalid packets, profiles,
  predicates, digests, crypto, and download capability fail closed.
- `truth_label: implemented`; source:
  `public/spec/evidence-packet-interoperability-v1.schema.json` — the custom
  SancusSight predicate is published as an exact allowlisted JSON Schema with
  no signature, DSSE, certificate, key, identity, transparency-log, or
  external-verifier field.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 17/17, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, core verification, production build (1,839 modules), and
  scoped whitespace all pass.
- `truth_label: observed`; source: T2 changed-file inventory — no raw OTLP,
  store, UI, runtime dependency, network action, policy runtime, score,
  governance mutation, or authenticated-attestation claim was added.

The deliberate trade-off is structural interoperability without emission or
authentication. Alignment describes compatible metadata under exact pinned
profiles; the Statement is explicitly unsigned and externally unverified.

### T3 — Preview storage and Evidence Sources workspace

- `truth_label: implemented`; source:
  `src/lib/interoperability-store.ts` — a dedicated Feature 011 IndexedDB
  repository accepts only the fixed sanitized snapshot shape, revalidates on
  read, deduplicates equivalent previews within each profile, retains at most
  20 per profile and 100 globally, clears only its own store, and reports
  unavailable persistence without invalidating the current result.
- `truth_label: implemented`; source:
  `src/components/StandardsInteroperability.tsx` — one local workspace under
  Advanced -> Evidence Sources integrates bounded OpenLineage import,
  accepted-runtime metadata alignment, validated Evidence Packet input,
  unsigned Statement download, sanitized history, clear, and permanent
  non-claims.
- `truth_label: implemented`; source: `src/App.tsx` and `src/index.css` — the
  workspace uses the existing Evidence Sources destination and rail, one
  responsive DOM, native controls, visible focus, wrapped hashes, internal
  table overflow, and narrow stacking without a new route or navigation item.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 27/27, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core
  verification, production build (1,845 modules), and scoped whitespace all
  pass.
- `truth_label: observed`; source: T3 changed-file inventory — no runtime
  dependency, network call, score, signer, policy runtime, Evidence Sources
  behavior rewrite, compiler/collector change, or Spec 005 action was added.

Actual file/download behavior, IndexedDB inspection, focus movement, 320 CSS
pixel behavior, effective 200% zoom, console, and network behavior remain the
approved T4 browser frontier.

### T4 — Local real-Chromium integrated acceptance

- `truth_label: observed`; source:
  `execution/T4-browser-report.md` — the first installed-Chrome import exposed
  a genuine projector/store seam mismatch: OpenLineage safe hashes retained
  the `sha256:` display prefix while the store accepts raw 64-hex digests.
- `truth_label: implemented`; source:
  `src/components/StandardsInteroperability.tsx` — the component now removes
  only the fixed prefix when crossing into the store snapshot; projector
  display and store contracts remain unchanged.
- `truth_label: verified`; source:
  `execution/T4-browser/browser-matrix-results.json` and tracking-owner rerun
  — all 17 installed-Chrome criteria pass, including exact IndexedDB
  allowlisting/privacy negatives, per-profile dedupe/retention, isolated
  clear, honest persistence failure, canonical unsigned Statement download,
  focus, 320 CSS pixels, effective DPR-2 zoom metrics, zero page overflow,
  routes/footer, clean console, and loopback-only traffic.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 27/27, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core
  verification, production build (1,845 modules), and scoped whitespace all
  pass after the correction.

No product, dependency, package, deployment, provider, Spec 005, or unrelated
contract change was introduced.

### T5 — Exact reviewed-artifact production deployment and hosted acceptance

- `truth_label: verified`; source:
  `execution/T5-hosted-report.md` and tracking-owner reconciliation — the
  T4-reviewed source/config manifest, accepted lockfile, local static output,
  and Vercel prebuilt static output remain continuous through deployment.
- `truth_label: verified`; source:
  `execution/T5-hosted/hosted-static-results.json` and tracking-owner rerun —
  all six canonical hosted files match the reviewed prebuilt artifact
  byte-for-byte.
- `truth_label: verified`; source:
  `execution/T5-hosted/browser-matrix-results.json` and tracking-owner rerun —
  all 18 installed-Chrome hosted criteria pass, including public predicate
  schema delivery, safe imports, privacy negatives, telemetry alignment,
  valid/tampered packet behavior, exact unsigned Statement download,
  persistence/clear/unavailable states, 320 CSS pixels, effective 200%,
  routes, footer, clean console, and same-origin-only traffic.
- `truth_label: verified`; source: authenticated Vercel inspection —
  production deployment `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH` is READY at
  `https://sancussight.vercel.app`, its immutable URL is
  `https://sancussight-f8zoeu66a-hflowers45-9370s-projects.vercel.app`, and
  the canonical alias has no error.

No product correction, dependency, package, lockfile, domain, route,
environment, provider, Spec 005, or unrelated contract mutation was required
by T5. Independent comprehensive review is the remaining Feature 011 gate.

## Task Route

The approved design is decomposed into one serial route:

```text
T1 profiles/OpenLineage -> T2 alignment/Statement -> T3 store/UI
  -> T4 local browser -> T5 hosted deployment -> R1 independent review
```

Standard/high routing is sufficient. Every ticket requires a fresh visible
top-level task and returns to the orchestrator for authoritative
reconciliation.

```yaml
visualization_offer:
  stage: tasks
  source_revision: feature011-tasks-20260724-01
  recommended: no
  recommendation_reason: The dependency, privacy, ownership, and gate model is explicit.
  state: declined
  adapter: visualize-sdd
  mode: task-command-center
  decision_source: Operator standing no-HTML preference.
```

## Divergence and Conflicts

R1 found four bounded implementation/evidence divergences while preserving
the rest of the green implementation and deployment evidence:

- `R1-SPEC-001`: official `inputFacets`/`outputFacets` containers are rejected
  instead of omitted wholesale.
- `R1-SPEC-002`: concurrent equivalent preview writes can persist duplicates.
- `R1-STANDARDS-001`: prior effective-200 scripts reload into Asset Catalog
  before measuring, so their evidence does not prove the Feature 011
  workspace claim; fresh R1 browser verification recovered the product result.
- `R1-STANDARDS-002`: invalid persisted records can be silently filtered while
  history still reports healthy availability.

The affected behavior is already owned by approved FR-002, FR-003, FR-007,
NFR-003, NFR-004, TD-002, and TD-005. Requirements and design remain valid;
the implementation/review frontier is reopened only for C1–C3 and
findings-limited R2.

### C1 — Findings-limited implementation correction

- `truth_label: implemented`; source: `src/lib/openlineage-import.ts` —
  direction-specific dataset allowlists admit official `facets` plus only
  `inputFacets` or `outputFacets`; presence is counted without reading facet
  values.
- `truth_label: implemented`; source: `src/lib/interoperability-store.ts` —
  record operations serialize in invocation order, and any invalid persisted
  record makes list/record honestly unavailable.
- `truth_label: implemented`; source:
  `src/components/StandardsInteroperability.tsx` — unavailable persistence no
  longer renders healthy empty-history copy.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 29/29, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core,
  production build (1,845 modules), and scoped whitespace all pass.

### C2 — Findings-limited local browser regression

- `truth_label: verified`; source:
  `execution/C2-browser/browser-matrix-results.json` and tracking-owner fresh
  rerun on 2026-07-24 — installed Chrome passes 13/13.
- Official base/input/output facet containers produce six exact omissions
  while six hostile sentinels remain absent from preview, DOM, 352 observed
  SHA-256 preimages, console/logs, and IndexedDB.
- Two equivalent imports overlap pending persistence but produce one
  IndexedDB add, one snapshot, and deterministic recorded/deduplicated
  outcomes.
- Invalid persisted history produces an unavailable state without hiding the
  current valid preview or changing unrelated stores.
- The corrected effective-200 path explicitly reopens Standards
  Interoperability and records 320 CSS pixels, DPR 2, zero page overflow, one
  workspace, one rail, and bounded table overflow.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 29/29, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core,
  production build (1,845 modules), and scoped whitespace all pass.

No product or test correction was required in C2. Exact corrected production
deployment and hosted findings regression remain C3.

### C3 — Findings-limited corrected production deployment

- `truth_label: verified`; source:
  `execution/C3-hosted-report.md` and tracking-owner fresh reconciliation on
  2026-07-24 — all nine local gates, reviewed source/config continuity, the
  accepted lockfile, and local/prebuilt static equality pass.
- `truth_label: verified`; source:
  `execution/C3-hosted/hosted-static-results.json` and tracking-owner rerun —
  all six canonical hosted files match the corrected reviewed artifact
  byte-for-byte.
- `truth_label: verified`; source:
  `execution/C3-hosted/browser-matrix-results.json` and tracking-owner rerun —
  installed Chrome passes 14/14 findings-limited checks, including official
  facet omission, hostile-sentinel absence across 352 inspected hash
  preimages, concurrent dedupe, corrupt-history honesty, effective-200
  workspace identity, focus, responsive overflow, unsigned Statement
  download, same-origin-only traffic, and clean console/page errors.
- `truth_label: verified`; source: authenticated Vercel inspection —
  deployment `dpl_24yoPsQtz37jbnY6K1QyaAFsQB6u` is production `READY` at
  `https://sancussight.vercel.app`; immutable URL
  `https://sancussight-47zi3pez1-hflowers45-9370s-projects.vercel.app`; the
  canonical alias is assigned with no alias error.

No product, test, dependency, package, lockfile, shared-tracking, provider,
Spec 005, or unrelated contract correction was introduced by C3.

### R2 — Findings-limited review

- `truth_label: verified`; source: `review-r2.md` — `R1-SPEC-001`,
  `R1-STANDARDS-001`, and `R1-STANDARDS-002` are resolved.
- `truth_label: observed`; source: R2 and tracking-owner independent probes —
  two `InteroperabilityPreviewStore` instances sharing one repository each
  passed their instance-local queue, both returned `recorded: true`, and
  persisted two equivalent snapshots.
- `truth_label: divergent`; affected contract: `R1-SPEC-002`, NFR-003,
  FR-007, TD-005 — deterministic dedupe is not yet atomic at the repository
  boundary. Requirements and design remain valid; only the single-finding
  C4–C6/R3 route is reopened.

### C4 — Repository-wide atomic dedupe correction

- `truth_label: implemented`; source: `src/lib/interoperability-store.ts` —
  the store delegates equivalent-record mutation to one repository-level
  `recordAtomically` boundary; memory repositories serialize across store
  instances, and IndexedDB performs validation, equivalence decision,
  insertion, and retention within one read-write transaction.
- `truth_label: verified`; source:
  `src/lib/__tests__/feature011-interoperability-store.test.mjs` and
  tracking-owner independent probe — two store instances sharing one memory
  repository return `recorded: [true, false]` and retain one snapshot.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 31/31, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core,
  production build (1,845 modules), and scoped whitespace all pass.

No UI, parser, alignment, Statement, package, lockfile, deployment,
shared-tracking, Feature 012, or Spec 005 change was introduced by C4.

### C5 — Two-page shared-IndexedDB browser regression

- `truth_label: verified`; source:
  `execution/C5-browser/browser-matrix-results.json` and tracking-owner rerun
  — installed Chrome passes 13/13.
- Two independently loaded page/module-store contexts on one loopback origin
  shared `sancussight-standards-interoperability-v1/previews`; overlapping
  equivalent operations returned `recorded` then `deduplicated`, issued one
  IndexedDB `add`, retained one snapshot, and both contexts independently
  observed the same one available snapshot without raw/private values.
- Preserved facet omission/privacy, corrupt-history honesty, profile
  retention/clear, focus, 320 CSS pixels, effective-200 workspace identity,
  unsigned Statement, same-origin-only traffic, and clean console/page errors
  all pass.
- `truth_label: verified`; source: tracking-owner fresh verification on
  2026-07-24 — Feature 011 31/31, Feature 010 31/31, Feature 009 24/24,
  Feature 008 6/6, collector 92/92, registry compiler 28/28, core,
  production build (1,845 modules), and whitespace all pass.

No product or test correction was required in C5.

### C6 — Exact corrected production deployment and hosted regression

- `truth_label: verified`; source:
  `sancussight-011-C6-acknowledged-20260724-01` — sole fresh visible worker
  `019f9505-48e3-78e0-839b-e09b38baa0ae` acknowledged the exact C5-reviewed
  artifact, existing canonical Vercel identity, hosted two-page
  shared-IndexedDB replay, owned evidence/deployment surfaces, and exclusions
  before build output or deployment mutation.
- `truth_label: verified`; source: `execution/C6-hosted-report.md` and
  tracking-owner reruns — exact deployment
  `dpl_C1RpuwEBX3Tc8g2n7uMkuFjSk5CE` is production `READY`, canonical alias
  assigned without error, six hosted files match the reviewed artifact, and
  installed Chrome passes 14/14.
- Two independently loaded canonical-origin pages produced deterministic
  `recorded`/`deduplicated` outcomes with one IndexedDB add, one snapshot,
  identical available views, and no raw/private values.
- No product, test, package, lockfile, shared-tracking, Feature 012, or
  Spec 005 correction was required in C6.

### R3 — Single-finding independent follow-up review

- `truth_label: verified`; source:
  `sancussight-011-R3-acknowledged-20260724-01` — sole fresh visible reviewer
  `019f9513-c7aa-7902-839c-075799edbc91` acknowledged the strict
  `R1-SPEC-002`, C4–C6, and direct fix-caused-regression boundary before
  review execution.
- `truth_label: verified`; source: `review-r3.md`,
  `execution/R3.md`, and tracking-owner reconciliation — R3 approves within
  its bounded scope. Two store instances return `[true, false]` with one
  snapshot; the exact corrected production artifact passes 6/6 hosted bytes
  and 14/14 installed-Chrome checks across two independent page/store
  contexts.
- `R1-SPEC-002` is resolved. `R1-SPEC-001`, `R1-STANDARDS-001`, and
  `R1-STANDARDS-002` remain resolved. No direct fix-caused or new in-scope
  finding remains.
- Final authoritative state: Feature 011 is `review:done`; corrected
  production deployment is `dpl_C1RpuwEBX3Tc8g2n7uMkuFjSk5CE` at
  `https://sancussight.vercel.app`.
