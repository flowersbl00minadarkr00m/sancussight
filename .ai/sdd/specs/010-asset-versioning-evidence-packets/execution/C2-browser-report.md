# Feature 010 C2 Local Real-Chromium Regression Report

> Findings-limited evidence for `R1-SPEC-001` through `R1-SPEC-003` and
> `R1-STANDARDS-001` through `R1-STANDARDS-002` only.

## Runtime

- Browser: Playwright CLI Chromium, headed, named session `sancussight-c2`.
- Origin: `http://127.0.0.1:4173`.
- Product mode: local imported snapshots plus synthetic demo for Exit Drill.
- Fixture generator:
  `execution/C2-browser/generate-fixtures.mjs`.
- Download validator:
  `execution/C2-browser/validate-downloads.mjs`.
- Product corrections retained: none.

## Findings-Limited Matrix

### Changed-first and unchanged truncation

Imported `changed-first.json`, which contains 100 unchanged coverage facts and
one later `pass -> fail` deterministic check transition.

- Import passed async identity verification.
- Comparison rendered the check regression first.
- UI stated: `All 1 meaningful changes are shown; 5 unchanged context items
  were omitted.`
- The rendered list contained 100 items with the regression before unchanged
  context.
- Downloaded asset packet independently preserved the internally derived
  regression, `totalMeaningfulItems: 1`, `truncated: true`, and
  `omittedUnchangedCount: 5`.

Evidence:

- `C2-browser/changed-first-comparison.png`
- `C2-browser/changed-first.json`
- downloaded asset packet under `C2-browser/.playwright-cli/`

### Explicit unavailable comparison

Imported `unavailable.json`, which contains 101 meaningful dependency changes.

- Import passed async identity verification.
- UI rendered `Comparison unavailable.`
- UI stated that 101 meaningful changes exceed the 100-item truthfulness
  limit.
- UI stated `No partial comparison is shown.`

Evidence:

- `C2-browser/unavailable-comparison.png`
- `C2-browser/unavailable.json`

### Forged identity and strict calendar rejection

Attempted to import:

- `forged-identity.json`, whose current version ID and pointers were changed to
  `av1_ffffffffffffffffffffffffffffffff`; and
- `impossible-date.json`, whose retained snapshot contains `2026-02-30`.

Both imports failed with `That file is not a compatible SancusSight registry.`
The previously accepted unavailable-comparison workspace remained active and
selected after each rejection.

### Compiler-produced portable derivative

`generate-fixtures.mjs` invoked the real registry compiler refresh boundary.
Its portable output produced:

- recorded source ID:
  `av1_209efdd69605f030400391b57b369f55`;
- derivative ID:
  `av1p_2a49a126724119a92228a96cf118b189`;
- qualification: `portable-projection`;
- `derivedFromVersionId` equal to the source recorded ID;
- alias `preferred` remapped to the derivative ID; and
- `currentVersionId` remapped to the derivative ID.

The real UI imported the derivative, rendered `Current portable projection`,
showed the source pointer, stated `not the original recorded facts`, and kept
the remapped alias/current pointer usable.

Evidence:

- `C2-browser/portable-derivative.json`
- `C2-browser/portable-derivative.png`

## Packet Downloads

Three real browser downloads were validated:

1. changed-first asset-version packet;
2. portable-derivative asset-version packet; and
3. current deterministic Exit Drill packet.

`node validate-downloads.mjs` exited `0` and confirmed for all three:

- canonical recursive key-sorted JSON;
- matching SHA-256 `packetId`;
- digest-derived bounded filename;
- no prohibited key/value, path, URL, email, credential, prompt/response,
  finding, raw evidence, registry object, owner, or user identity.

Finding-specific assertions also passed:

- the changed-first packet comparison was derived as a regression from the
  verified versions;
- the portable packet used `portable-projection`, a distinct `av1p_*` ID, and
  its safe recorded source pointer; and
- the Exit Drill packet used `deterministic`, contained no comparison field,
  and represented only the current computed result.

## Focus and Responsive Behavior

- At 320 by 900 CSS pixels, selecting the asset moved focus to the Asset
  Passport heading.
- `Back to assets` returned focus to the originating `portable skill` row and
  restored the catalog-only narrow state.
- The 320-pixel run measured document `clientWidth: 305` and
  `scrollWidth: 305`; no page-level horizontal overflow occurred.
- The narrow Passport screenshot is
  `C2-browser/narrow-portable-passport.png`.
- At 1280 by 900, catalog and Passport occupied their desktop adjacent
  positions and document width remained equal to its scroll width.

## Console and Network

- `playwright-cli console warning`: 3 total messages, 0 errors, 0 warnings.
- `playwright-cli requests --static`: 80 successful static GET requests, all
  to `http://127.0.0.1:4173`.
- No third-party request or packet-upload request was observed.

## Verdict

PASS. Every findings-limited real-Chromium criterion passed. No C1 product or
test correction was required or retained.
