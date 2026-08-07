# Feature 011 T4 Local Real-Chromium Report

> Browser acceptance evidence only. Every fixture is explicitly synthetic and
> is not production data, evidence, or an external verification result.

## Runtime

- Browser: Google Chrome `150.0.7871.129`
- Executable:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Automation: bundled Playwright library driving the installed Chrome binary
- Origin: `http://127.0.0.1:4173`
- Server: fresh `npm run build` output through local Vite preview
- Console: 0 warnings, 0 errors, 0 page errors
- Network: 12 requests in the completed matrix; every request was same-origin
  loopback `http://127.0.0.1:4173`

## Initial Genuine Failure and Bounded Correction

The first real Chrome import parsed one safe OpenLineage JSON record but the UI
reported:

```text
Import failed locally. No file bytes or unprojected values were retained.
```

The T1 projector correctly returns `sha256:`-prefixed safe hashes. The T3
IndexedDB contract correctly accepts raw 64-hex digests. The T3 component
passed the prefixed value directly to storage, so validation failed after the
safe projection was already available.

Retained correction:

- `src/components/StandardsInteroperability.tsx` strips the fixed `sha256:`
  prefix when crossing into the dedicated preview-store snapshot.
- `src/lib/__tests__/feature011-standards-workspace.test.mjs` pins that boundary
  conversion.

Fresh focused verification passed 27/27, the rebuilt Vite artifact imported
the same fixture as 1 accepted / 0 rejected / 0 omitted, and the full matrix
then passed.

## OpenLineage and Privacy

- Safe JSON: 1 accepted, 0 rejected, 0 omitted.
- Equivalent repeat: IndexedDB record count remained 3 before and after the
  repeat at that stage.
- Safe JSONL: 2 accepted, 0 rejected, 0 omitted.
- Mixed JSONL: 2 accepted, 3 rejected, 4 omitted.
- Stored stable codes included malformed JSON, unsupported schema, unsupported
  event type, and all four facet-omission codes.
- Exact database/store:
  `sancussight-standards-interoperability-v1 / previews`.
- Every stored repository record had only `id` and `snapshot`; every snapshot
  contained only the approved 10 required fields plus the optional
  confirmation digest.
- Safe hashes were raw 64-character lowercase hex in storage.
- Raw run/job/dataset identifiers, producer/schema URLs, facet values,
  credential text, accepted runtime raw references, file bytes, and hash
  preimages were absent from stored serialized records.

## Telemetry Alignment

- Empty/no-runtime state retained explicit `missing` and `omitted-private`
  rows and reported 0 accepted runtime records.
- An explicitly synthetic accepted runtime snapshot reported 1 accepted record
  under both pinned profiles.
- The live table exposed the fixed compatible metadata rows and did not expose
  the raw session reference, source-record reference, artifact name, or
  summary.

## Evidence Packet and Statement

- A valid synthetic Feature 010 Evidence Packet produced and downloaded:
  `sancussight-unsigned-statement-0419d4b5b061.json`.
- Download bytes exactly equaled independent recursive key-sorted canonical
  JSON.
- Independent SHA-256:
  `sha256:0419d4b5b0610a02cf3217aa54293ddd1aea112ec6f111185c5d16f2ec1171e7`.
- The subject digest exactly bound the validated packet ID.
- `_type` was the official Statement v1 URI.
- Predicate truth was exactly `unsigned: true` and
  `externallyVerified: false`.
- No signature, DSSE, certificate, key, identity, transparency log, or
  external-verifier field appeared.
- A tampered packet produced no Statement and left download disabled.
- A synthetic browser download denial reported
  `No successful download is claimed`.

## Storage, Retention, Clear, and Failure

- Seeded 104 exact-shape synthetic records across the four pinned profiles,
  then exercised a real UI record to invoke production pruning.
- Retained exactly 20 records for each profile, 80 total.
- The 20/profile cap therefore binds below the 100/global cap for the current
  four-profile registry; total remained within the global contract.
- Feature 011 clear removed every preview record and returned focus to the
  Standards Interoperability heading.
- Exact dumps of `sancussight-check-history`, `sancussight-evidence`, and
  `sancussight-governance` were byte-equivalent as JSON before and after clear.
- With IndexedDB unavailable, the live import remained visible in memory and
  the UI stated that persistence was unavailable.

## Layout, Focus, Routes, and Footer

- Desktop 1280×900: workspace and existing Evidence Sources rail were adjacent
  without overlap; page overflow was zero.
- Workspace entry focused the main Standards Interoperability heading.
- Import and packet operations focused their result headings.
- Clear returned useful focus to the workspace heading.
- Narrow 320 CSS pixels:
  - one workspace DOM and one existing rail DOM;
  - document `scrollWidth` equaled `clientWidth` at 320;
  - the alignment table scrolled internally (736px content in a 258px box);
  - long hashes stayed within their container.
- Effective 200% Chromium metrics used a 320 CSS-pixel viewport at DPR 2 and
  retained zero page overflow.
- `#landing`, `#demo`, and unknown-route fallback remained functional.
- The footer contained exactly one link, with text and href
  `https://sancussight.vercel.app`.

## Captured Artifacts

- `initial-openlineage-store-failure.png`
- `desktop-standards-workspace.png`
- `narrow-320-standards-workspace.png`
- `effective-200-percent.png`
- `indexeddb-unavailable.png`
- `browser-matrix-results.json`
- `sancussight-unsigned-statement-0419d4b5b061.json`
- six explicitly synthetic input fixtures
- `generate-fixtures.mjs`, `reproduce-openlineage-store.mjs`, and
  `browser-matrix.mjs`

## Browser Verdict

PASS after the single bounded T3 hash-prefix boundary correction. All 17
integrated Chrome checks passed. No correction outside completed Feature 011
T1–T3 product/test surfaces was retained.
