# Feature 012 R1 Independent Review

## Review Metadata

- **Pass:** R1, comprehensive across the full approved Feature 012 scope
- **Reviewer:** fresh visible top-level independent session
- **Review gate inspected:** `implementation:in-progress`
- **Authority:** approved `requirements.md`, `design.md`, and `tasks.md`
- **Review axes:** Spec alignment and Standards/code quality
- **Production target:** `https://sancussight.vercel.app`
- **Spec verdict:** **Pass**
- **Standards verdict:** **Needs bounded correction**
- **Overall verdict:** **Needs fixes**
- **Blocking findings:** 1
- **Non-blocking findings:** 1

This is review evidence, not an approval or status transition. The tracking
owner remains the sole writer of authoritative task and feature state.

## Executive Assessment

Feature 012's implemented behavior aligns with the approved contract. The
source identity remains compact and globally visible; exactly one selected
Passport owns contextual dirty/save/result feedback; the existing controller,
confirmation, permission, preflight, verified-write, conflict, and recovery
path remains authoritative; demo and snapshot modes expose no canonical write;
and every selected Passport uses exactly six native disclosures with the
required defaults, state reset, rerender behavior, content ownership, focus,
marker, and responsive behavior.

All ten required local commands passed in order. T3's disposable native-file
exercise and T4's safe hosted exercise remain honestly separated. Fresh
read-only production inspection confirms the exact required deployment is
still the latest production deployment, `READY`, on the required project and
team. The canonical alias still resolves to it, and all six canonical hosted
files still match T4's reviewed byte counts and SHA-256 digests.

The Standards axis cannot pass yet because the declared production build-input
continuity proof is not reproducible. All 267 files in T4's source/config
manifest still match exactly, while two fresh R1 builds are mutually
byte-identical but differ from the deployed reviewed artifact by one generated
Tailwind utility and the resulting hashed filenames. The extra utility is
`resize`, a candidate present in untracked `outputs/**/*.py` files that the
267-file manifest does not cover. Production is not drifting; the build-input
boundary and its exact-artifact claim are incomplete.

The selected-Passport strip also infers its pending state from the prefix of a
user-visible English message. That copy coupling is not presently breaking
behavior because the operation guard remains authoritative, but it is an
unnecessary maintenance hazard.

## Spec Alignment

### Requirements Coverage

| Requirement | Result | Evidence |
| --- | --- | --- |
| FR-001 | Pass | `Header` retains one compact global source-truth surface derived from `RegistrySession` and `ConnectionState`; dirty/sync/read/write freshness remained visible in T3's connected-file matrix. |
| FR-002 | Pass | `SourceWriteStrip` renders only for a selected Passport backed by `sourceKind === 'file'`; it exposes dirty, pending, conflict, permission, success, and failure outcomes without creating another write path. |
| FR-003 | Pass | `App.handleSaveSource` still owns confirmation and calls only `sourceController.save(session)`; controller permission, preflight, write verification, conflict, recovery, and post-write truth are unchanged and covered by T3. |
| FR-004 | Pass | Demo and imported snapshot modes render no selected-Passport save strip or canonical-write action; fresh hosted inspection reconfirmed demo non-write truth. |
| FR-005 | Pass | A selected Passport renders exactly six native `details`/`summary` disclosures: Summary, Portability, Dependencies, Evidence, Decisions, and History. |
| FR-006 | Pass | Summary defaults open, the other five default closed, user state survives unrelated rerenders, asset changes reset defaults, content remains under its owning disclosure, and narrow Back/focus plus selected-row association pass browser evidence. |
| NFR-001 | Pass | Source identity and write feedback are derived from existing session/controller truth; no second persistence model or hidden authority was added. |
| NFR-002 | Pass | Native disclosure semantics, keyboard activation, focus-visible treatment, marker visibility, live-result roles, and responsive single-DOM behavior pass T3/T4 and fresh hosted inspection. |
| NFR-003 | Pass | Existing local-only privacy and explicit authority boundaries remain intact; hosted inspection made only canonical-origin static requests and performed no public-host file write. |
| NFR-004 | Pass | No dependency or package addition was introduced for Feature 012, predecessor verification is green, and runtime behavior remains local-first. Build-evidence reproducibility is addressed separately as `R1-STANDARDS-001`. |

### Approved Design and Decision Coverage

| Contract | Result | Notes |
| --- | --- | --- |
| Global vs contextual ownership | Pass | Global source truth remains in the header; write workflow/result truth appears once inside the selected Passport. |
| Existing write authority | Pass | The strip delegates to `App`, which retains the existing confirmation and controller path. No direct file-handle write was added. |
| Truth derivation | Pass | Dirty, sync, conflict, permission, read, and write states derive from `RegistrySession`/`ConnectionState`; feedback is supplementary. |
| Native disclosure model | Pass | Exactly six native disclosures are rendered with stable asset-scoped keys and no duplicate responsive DOM. |
| Disclosure defaults and reset | Pass | Native state survives ordinary rerenders and remounts on asset identity change, restoring the approved defaults. |
| Content ownership | Pass | Recorded facts, deterministic findings, human decisions, and history remain separated under the approved headings. |
| Responsive/focus behavior | Pass | T3/T4 cover 320 CSS px at DPR 2, native focus/markers, selected-row association, and narrow Back behavior with no page overflow. |
| Footer/routes/predecessors | Pass | The exact one-link footer and route fallbacks remain intact; Features 008-011 and core verification are green. |
| Local vs hosted evidence honesty | Pass | T3 alone exercises the disposable native connected-file write; T4 and fresh R1 hosted checks explicitly remain non-write. |

### Task Reconciliation

| Task | Result | Review note |
| --- | --- | --- |
| T1 | Pass | Global source truth and contextual write-strip structure align with the approved scope. |
| T2 | Pass | Six-disclosure Passport decomposition, defaults, ownership, and responsive semantics align. |
| T3 | Pass | Installed-Chrome local connected-file matrix provides honest native-file, permission, conflict, recovery, focus, marker, rerender, and responsive evidence. |
| T4 | **Needs evidence correction** | Exact deployed identity and hosted bytes remain green, but the declared source/config continuity manifest does not cover all inputs influencing Tailwind output. |

## Findings

### R1-STANDARDS-001 - Declared build inputs do not reproduce the reviewed production artifact

- **Axis:** Standards/code quality
- **Severity:** Medium
- **Blocking:** Yes, for Standards approval and exact-artifact continuity
- **Affected contract:** T4 exact reviewed production deployment and artifact
  continuity evidence
- **Product runtime impact:** None observed; current production remains exact,
  `READY`, and byte-stable
- **Source/evidence:** `src/index.css:1`, T4
  `source-config-manifest-before.json`, T4 `dist-manifest-pass2.json`, and
  untracked `outputs/**/build_sancussight_demo*.py`

T4 records 267 reviewed source/config inputs and a production CSS artifact:

```text
assets/index-_Qn1zbwW.css
bytes: 91547
sha256: b3890bbadb199ea54b749dd3469039258e0c0feabac534e94e5c69b898805501
```

Fresh R1 continuity comparison reports:

```text
reviewed source/config entries: 267
mismatches: 0
```

Nevertheless, two consecutive fresh R1 builds are mutually byte-identical at:

```text
assets/index-B6Pfel2l.css
bytes: 91567
sha256: b4a3f6eed7a3dae030455f89b4acf4d163f3e729c6dc229547d867b3...
fresh_rebuild_same: true
```

The CSS difference is exactly one 20-character generated utility:

```css
.resize{resize:both}
```

Removing that utility makes the fresh CSS byte-for-byte equal to T4's
canonical CSS. The JavaScript payload remains byte-identical to T4, while the
CSS/JS references and `index.html` hashes change because the generated
filenames change.

The automatic Tailwind source discovery starts at `@import "tailwindcss"`.
Repository-wide search finds the candidate `.resize(` in three untracked
`outputs/**/build_sancussight_demo*.py` files, none of which is represented in
T4's 267-file source/config manifest. The exact moment that candidate entered
Tailwind's generated set is not recorded, but the observed result is
sufficient: the declared continuity set is not the full build-input set, and
therefore cannot support an exact-artifact reproducibility claim.

Fresh production checks independently confirm that this is not production
drift:

- deployment `dpl_8ULGGMT146hkWa1FZM48Vtwr6D2H` remains latest,
  production, and `READY`;
- the canonical alias remains attached with `aliasError: null`; and
- all six canonical files return HTTP 200 with the exact T4 lengths and hashes.

**Bounded correction:** define an explicit Tailwind source boundary that
contains only intended application inputs (or explicitly excludes generated
evidence/output trees), include every build-affecting configuration/input in
the continuity manifest, then rerun the ordered gates, two-build byte
comparison, prebuilt comparison, exact production deployment, canonical byte
check, and safe hosted acceptance. Do not broaden product behavior.

### R1-STANDARDS-002 - Pending UI state is inferred from user-visible copy

- **Axis:** Standards/code quality
- **Severity:** Low
- **Blocking:** No
- **Affected quality:** maintainability, brittle copy coupling, duplicate-click
  presentation
- **Source:** `src/components/SourceWriteStrip.tsx:13`

The strip computes pending state with:

```ts
feedback?.tone === 'neutral'
  && feedback.message.startsWith('Saving changes to ')
```

A harmless wording or localization change can therefore stop the strip from
showing its pending title/tone and can make the Save button appear available
while the operation is in flight. `App`'s `operationPending` ref still prevents
a second write, so this does not create hidden write authority or a current
Spec failure. It does, however, couple control presentation to copy and creates
an avoidable maintainer decision.

**Bounded correction:** pass an explicit operation phase/pending boolean from
the existing save owner, or represent the phase in typed supplementary
feedback. Keep `RegistrySession`/`ConnectionState` authoritative for durable
truth and do not introduce another persistence model.

## Standards Review Notes

### Removal and Consolidation

- The separate global header truth and selected-Passport strip are both
  required by approved scope and should not be consolidated.
- The contextual strip correctly replaces a second global Save button and
  creates no duplicate write owner.
- The six disclosure wrappers are required. Their content remains sourced from
  existing Passport sections, so no parallel content model was introduced.
- The pending-message string inference is the only unnecessary state
  derivation identified and should be removed in favor of an explicit
  operation phase.

### Truthfulness, Privacy, and Failure Handling

- Demo and snapshot modes remain explicitly non-write.
- Local connected-file authority is evidenced only by T3's disposable
  origin-private file handle; hosted checks make no native-file claim.
- Permission denial, preflight conflict, write failure, recovery retention,
  verified success, and stale/conflict outcomes remain visible and controller
  owned.
- No raw path, handle, registry payload, or private source data was added to
  hosted evidence or network traffic.

## Fresh Verification Evidence

### Required Local Gate Sequence

Run in the exact required order against `C:\Users\henry\sancussight`:

| Order | Command | Result |
| --- | --- | --- |
| 1 | `npm run test:feature012` | Pass - 7/7 |
| 2 | `npm run test:feature011` | Pass - 31/31 |
| 3 | `npm run test:feature010` | Pass - 31/31 |
| 4 | `npm run test:feature009` | Pass - 24/24 |
| 5 | `npm run test:feature008` | Pass - 6/6 |
| 6 | `npm run test:collector` | Pass - 92/92 |
| 7 | `npm run test:registry-compiler` | Pass - 28/28 |
| 8 | `npm run verify:core` | Pass |
| 9 | `npm run build` | Pass - 1,846 modules |
| 10 | `git diff --check` | Pass - no whitespace errors |

A second bounded build also passed and matched the first fresh R1 build
byte-for-byte. The two R1 builds do not match T4's reviewed artifact for the
reason recorded in `R1-STANDARDS-001`.

### Exact Production Identity

Independent read-only Vercel inspection confirmed:

- deployment `dpl_8ULGGMT146hkWa1FZM48Vtwr6D2H`
- immutable URL
  `sancussight-ketb3xapg-hflowers45-9370s-projects.vercel.app`
- project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ` (`sancussight`, Vite)
- account/team `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- target `production`
- `readyState: READY`
- canonical alias `sancussight.vercel.app`
- `aliasError: null`
- the same deployment is the project's latest deployment

### Hosted Static Continuity

Fresh read-only retrieval of all six canonical production artifacts returned
HTTP 200 and matched T4's expected byte counts and SHA-256 digests:

- `assets/index-_Qn1zbwW.css`
- `assets/index-BsHztiR0.js`
- `favicon.svg`
- `index.html`
- `sancussight-workspace.webp`
- `spec/evidence-packet-interoperability-v1.schema.json`

### Hosted Browser Inspection

Fresh canonical-production Playwright CLI inspection confirmed:

- the landing route and demo entry render with explicit synthetic/demo truth;
- demo exposes `Connect file`, not a canonical save action;
- selecting an asset produces exactly six native disclosure groups;
- Summary starts open and the other five start closed;
- closing Summary and selecting another asset restores Summary's approved open
  default for the new asset;
- the selected row remains explicitly associated with its Passport;
- the one-link footer remains exact;
- the page remains operable under an additional extreme narrow probe;
- zero browser console errors or warnings were reported; and
- only six static canonical requests were observed in the fresh session.

T3/T4's fuller installed-Chrome evidence remains the authority for disposable
local-file writes, native permission/failure/conflict paths, marker/focus
measurements, and the required 320 CSS px at DPR 2 layout.

## Verdict

**Needs fixes.**

The Spec axis passes with no behavioral finding. Preserve the passing source
truth, save ownership, disclosures, local-file evidence, production identity,
hosted bytes, and browser behavior. Reopen only the bounded Standards frontier
for `R1-STANDARDS-001` and `R1-STANDARDS-002`, then return those corrections
and their regressions for a bounded follow-up review. The tracking owner alone
decides and records authoritative task/status transitions.
