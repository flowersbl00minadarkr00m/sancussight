# Feature 009 T5R2 Hosted Browser Matrix

> Supporting evidence only. This file does not approve T5R2 or change shared
> tracking.

Fresh real-Chromium hosted acceptance is in progress against
`https://sancussight.vercel.app` using demo/synthetic browser state only.

## Environment

- Browser: fresh headed Chromium contexts created by Playwright CLI
  `sancussight-t5r2` and `sancussight-t5r2-history`
- Hosted origin: `https://sancussight.vercel.app`
- Deployment:
  `dpl_96UapZ28MvQMrBmk63NyM8mZUN86`
- Immutable URL:
  `https://sancussight-r55wc94sa-hflowers45-9370s-projects.vercel.app`
- Data: built-in demo workspace plus the existing Feature 009 synthetic
  registry/evidence fixtures; no private registry, history, or provider data

## Acceptance Results

| Scenario | Observation | Verdict |
|---|---|---|
| Searchable definition-only detail | Search for `candidate.bundle-readiness.v1` returned one definition and no current result; the stable rule remained inspectable and asset-specific lineage was explicitly not constructed | PASS |
| Non-passing result contract | Provider fallback detail contained the exact rule, exact remediation, exact invalidation condition, current FAIL result, and `No previous result recorded` | PASS |
| Asset Passport round trip | Built-in demo `Client style guide (custom GPT)` opened `portability.provider-fallback.v1`; returning to Asset Passport restored the same asset and focused its canonical heading. The synthetic round trip also preserved `Synthetic provider workflow` and the exact check ID | PASS |
| No previous result | Fresh synthetic registry scope displayed `No previous result recorded` without seeding history | PASS |
| Uncataloged observation | Explicit `Uncataloged observation` detail stated that no stable rule, passing condition, lineage contract, remediation, rule, or relationship was invented | PASS |
| Relationship states | Actual synthetic result paths exposed textual verified, missing, inferred, stale, and conflicting relationships; the conflicting path exposed the bounded conflict gap | PASS |
| Desktop geometry | At 1280×900, list x=20 / width=377.7375 and detail x=413.7375 / width=511.0625; regions were adjacent | PASS |
| Narrow DOM and focus | At 320×800, list/detail counts changed from 1/0 to 0/1; focus entered `H2#check-detail-heading` and Back restored the selected Candidate bundle readiness button | PASS |
| 320px overflow | document client and scroll widths both measured 305; page overflow was false and layout was `narrow` | PASS |
| Effective 200% zoom | `visualViewport.scale` measured 2; document client and scroll widths remained 305; page overflow was false and layout remained `narrow` | PASS |
| History unavailable | A separate fresh context removed `indexedDB` before application load; exact notice `Local history unavailable. The current result remains usable.` appeared while provider detail and `Open Asset Passport` remained usable | PASS |
| Canonical footer | Footer text was exactly `https://sancussight.vercel.app`; it contained exactly one link with the same text and href and no personal name | PASS |
| Console | Both fresh contexts reported 0 errors and 0 warnings | PASS |
| Network | Primary and history contexts made only 200-status static requests to `https://sancussight.vercel.app`; no unexpected Feature 009 or external request occurred | PASS |

## Structured Browser Observations

```json
{
  "definitionOnly": {
    "searchable": true,
    "noResult": true,
    "noAssetLineage": true
  },
  "nonPassing": {
    "exactRule": true,
    "remediation": true,
    "invalidation": true,
    "noPrevious": true
  },
  "relationships": {
    "verified": true,
    "missing": true,
    "inferred": true,
    "stale": true,
    "conflicting": true
  },
  "uncataloged": {
    "visible": true,
    "noInventedRule": true,
    "noInventedLineage": true
  },
  "desktopAdjacent": true,
  "narrow": {
    "listBefore": 1,
    "detailBefore": 0,
    "listAfter": 0,
    "detailAfter": 1,
    "focusEntry": "H2#check-detail-heading",
    "focusReturn": "Candidate bundle readiness button",
    "overflow320": false,
    "zoomScale": 2,
    "overflowAtZoom200": false
  },
  "footer": {
    "text": "https://sancussight.vercel.app",
    "links": [
      {
        "text": "https://sancussight.vercel.app",
        "href": "https://sancussight.vercel.app"
      }
    ]
  },
  "network": {
    "origins": [
      "https://sancussight.vercel.app"
    ],
    "unexpectedExternal": []
  },
  "historyUnavailable": {
    "indexedDbRemovedBeforeLoad": true,
    "exactNotice": true,
    "currentResultUsable": true
  },
  "console": {
    "primaryErrors": 0,
    "primaryWarnings": 0,
    "historyErrors": 0,
    "historyWarnings": 0
  }
}
```

## Evidence Files

- `01-provider-result-desktop.png`
- `02-uncataloged-conflict.png`
- `03-narrow-zoom200.png`
- `04-history-unavailable.png`
- `hosted-acceptance.js`
- `history-unavailable.js`

## Outcome

Hosted real-Chromium acceptance: PASS. No product correction was required.
