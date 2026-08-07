# Feature 010 C3 Hosted Findings-Limited Regression Report

> Corrected production verification for `R1-SPEC-001` through
> `R1-SPEC-003` and `R1-STANDARDS-001` through `R1-STANDARDS-002` only.

## Runtime

- canonical origin: `https://sancussight.vercel.app`
- immutable deployment:
  `https://sancussight-dmv0otjw8-hflowers45-9370s-projects.vercel.app`
- deployment ID: `dpl_A8C9H34nNHkqaJLxizkmvxWN9Xm1`
- browser: headed Playwright CLI Chromium, bounded named sessions
  `sancussight-c3`, `sancussight-c3-network`, and a read-only connected Chrome
  observation
- fixtures: previously accepted C2 synthetic fixtures only
- product corrections retained: none

## Exact Artifact Continuity

| Boundary | SHA-256 | Shape |
|---|---|---|
| corrected reviewed source | `DF53880923FD5C426C0497DE532FB72CC8460705EA6A4896547F5C83D040A007` | 190 files / 1,375,754 bytes |
| accepted package-lock | `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9` | exact file |
| local `dist` | `1921D522CC5874749BCFE77679BA00B6B778E354E702083BEFDFB664C0CBC670` | 5 files / 638,736 bytes |
| Vercel prebuilt static | `1921D522CC5874749BCFE77679BA00B6B778E354E702083BEFDFB664C0CBC670` | 5 files / 638,736 bytes |
| canonical hosted static | `1921D522CC5874749BCFE77679BA00B6B778E354E702083BEFDFB664C0CBC670` | 5 files / 638,736 bytes |

Every canonical hosted file returned HTTP 200 and matched the guarded local
artifact byte-for-byte.

## Findings Matrix

### R1-SPEC-001 — meaningful-first comparison and explicit cap

The changed-first fixture contains 100 unchanged coverage facts plus one late
`pass -> fail` check transition.

- The check regression rendered first.
- The UI stated:
  `All 1 meaningful changes are shown; 5 unchanged context items were omitted.`
- The packet independently preserved the regression, one meaningful item,
  truncation `true`, and five omitted unchanged items.

The unavailable fixture contains 101 meaningful dependency changes.

- The UI rendered `Comparison unavailable.`
- It stated that 101 meaningful changes exceed the 100-item truthfulness
  limit.
- It stated `No partial comparison is shown.`

Verdict: PASS.

### R1-SPEC-002 — portable derivative truth

The real compiler-produced portable fixture rendered:

- `Current portable projection`;
- derivative ID `av1p_2a49a126724119a92228a96cf118b189`;
- source pointer `av1_209efdd69605f030400391b57b369f55`;
- `Privacy-sanitized derivative of ...`;
- `not the original recorded facts`; and
- alias/current-pointer usability for the derivative.

The downloaded packet used `portable-projection`, retained the distinct
recorded-source pointer, and reported `no-previous-version`.

Verdict: PASS.

### R1-SPEC-003 — forged identity rejection

Importing `forged-identity.json` produced:
`That file is not a compatible SancusSight registry.`

The previously accepted unavailable fixture remained active.

Verdict: PASS.

### R1-STANDARDS-001 — strict calendar rejection

Importing `impossible-date.json` produced the same compatibility failure, and
the accepted unavailable fixture remained active.

Verdict: PASS.

### R1-STANDARDS-002 — packet-internal comparison

`changed-first-evidence-packet.json` independently validated:

- qualification `recorded`;
- comparison state `ready`;
- one meaningful item;
- first key `check:check.late:result`;
- state `regression`;
- previous/current `pass` / `fail`;
- truncation `true`; and
- five omitted unchanged items.

Verdict: PASS.

## Packet Validation

`node execution/C3-hosted/validate-packets.mjs` exited `0`.

Both packets passed:

- canonical recursive key-sorted JSON;
- matching SHA-256 `packetId`;
- digest-derived suggested filename;
- zero prohibited key/value or identity/privacy issue; and
- finding-specific changed-first or portable-derivative assertions.

Suggested filenames:

- `sancussight-evidence-packet-asset-version-214635d2fbeb.json`
- `sancussight-evidence-packet-asset-version-b406c4a9554e.json`

## Focus and Responsive Behavior

At 320 by 900 CSS pixels:

- selecting `portable skill` hid the catalog and showed the Passport;
- focus entered the Passport `H2` for `portable skill`;
- document client/scroll widths were both `305`;
- page-level horizontal overflow was false;
- Back hid the Passport and restored the catalog; and
- focus returned to the `portable skill` button.

Verdict: PASS.

## Console, Network, and Runtime

- fresh console messages: `0` errors, `0` warnings
- fresh static requests: five successful GETs, all at
  `https://sancussight.vercel.app`
- no non-GET, external, analytics, packet-upload, or Feature 010 request
- deployment metadata: prebuilt `true`, `READY`, `PROMOTED`, functions `null`
- scoped Vercel error-log query: no entries

Hosted fixture imports and packet downloads remained local browser actions.
No server-side version history, packet store, analytics event, or third-party
request was observed.

## Captured Evidence

- `C3-hosted/01-hosted-changed-first.png`
- `C3-hosted/02-hosted-unavailable.png`
- `C3-hosted/03-hosted-portable-narrow.png`
- `C3-hosted/changed-first-evidence-packet.json`
- `C3-hosted/portable-derivative-evidence-packet.json`
- `C3-hosted/validate-packets.mjs`
- bounded Playwright CLI helper scripts in `C3-hosted/`

The screenshots were visually inspected. The first two preserve the
changed-first and explicit-unavailable truth states. The third captures the
narrow after-Back catalog state with legible navigation, asset row, and
canonical footer. The selected narrow Passport state was separately verified
through visible-state, focus, and exact width measurements.

## Harness Note

The connected Chrome extension lacked file-URL access for local fixture
attachment. Fixture-dependent hosted checks therefore used the existing
repository Playwright CLI Chromium workflow. The task did not require or
request a browser-setting change. This did not alter product, package,
lockfile, deployment configuration, or acceptance behavior.

## Outcome

PASS. The exact corrected C2-reviewed artifact is live on the existing
canonical production project, and every findings-limited hosted correction
plus tested fix-caused regression passes.
