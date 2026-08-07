# Feature 008 / T5 Canonical Hosted Verification

> Truth class: `supporting-evidence`
> Date: 2026-07-23/24 America/Vancouver
> Canonical URL: `https://sancussight.vercel.app`
> Browser: real Chromium driven through `@playwright/cli`
> Authority effect: none

## Deployment identity

- Vercel project: `sancussight`
- Project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- Team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- Framework: Vite
- Node runtime: 24.x
- Deployment ID: `dpl_AwJrVdc7SrwSyHubAmmZBCtc5xWR`
- Immutable deployment URL:
  `https://sancussight-q2fx0gjrd-hflowers45-9370s-projects.vercel.app`
- Target/status: production / `READY`
- Canonical alias: `https://sancussight.vercel.app`
- Alias error: none
- Deployment source: authenticated Vercel CLI 54.20.1, prebuilt output
- Region: `iad1`
- Build log result: prebuilt output accepted; deployment completed

Both the Vercel connector and CLI resolved the local linkage to the same
existing project, owner scope, production deployment, and canonical alias
before mutation. The post-deploy connector lookup of the canonical domain
returned the new deployment ID above.

## Reviewed-state lock

- Git base revision:
  `1a62a3c7fd33cf332e59986b9c996a14dd1f16b6`
- The approved Feature 008 source remained an intentionally dirty reviewed
  worktree; no commit or push was made.
- T1-T4 owned-source manifest SHA-256:
  `635F1FE27A3AA97989646E1089EA95F1E78826F3782AA6E692AA960DBF129B7E`
- Prebuilt static-output manifest SHA-256:
  `FA521CD6A846B0F9A1E8524ABFAF8FAE93EF2177A2AFDC6FE366BC06352704A0`
- The prebuilt static files were byte-for-byte identical to the reviewed local
  `dist` output:

| Relative output | Bytes | SHA-256 |
|---|---:|---|
| `assets/index-DSav9728.js` | 412453 | `C1BAD294C8E527E48B775A413D8BD8ED219336FD28A2B493E567885D8A2E2DF8` |
| `assets/index-VcUzh-Qx.css` | 72515 | `1EFB57FF56152515BF8A99F4B69FC697024B6244DD60EBE451016DC0685CE32C` |
| `favicon.svg` | 431 | `BBD7664A0111E68094A9CF509723997371E766F3FDF309720A08BA2846BC1CAE` |
| `index.html` | 679 | `B2C4851AB6C97E67BE4EFAA1D329722CC2DBAE914D9F6B59DCCF5A782E3882A8` |
| `sancussight-workspace.webp` | 53752 | `E8818055220BC0CBEF4D56E8DD741D061525CD231287DA8FB1EEC786846D47C1` |

`vercel build --prod --yes` added the root `engines` metadata to
`package-lock.json`. The source guard stopped before deployment. Removing only
that generated block reproduced the recorded pre-build lockfile SHA-256
`23D8F8162A850664FB3006D4CABF05717CECEC25248961A1B9CA55F8E1FC1513`
exactly. Every owned-source hash was then rechecked before deployment. No
product-source drift remained.

## Local verification

| Command | Exit | Result | Verdict |
|---|---:|---|---|
| `npm run test:feature008` | 0 | 6 passed, 0 failed | PASS |
| `npm run test:collector` | 0 | 92 passed, 0 failed | PASS |
| `npm run test:registry-compiler` | 0 | 22 passed, 0 failed | PASS |
| `npm run verify:core` | 0 | Core provenance, grouping, route, source-state, and evidence-correlation assertions passed | PASS |
| `npm run build` | 0 | 1,830 modules transformed; production bundle completed | PASS |
| `git diff --check` | 0 | No whitespace errors | PASS |
| `vercel build --prod --yes --scope hflowers45-9370s-projects` | 0 | Production prebuilt output completed | PASS |

The initial `vercel build --prod` invocation returned
`project_settings_required` before any deployment. The required read-only
project settings were then pulled by the documented non-interactive `--yes`
path, and the production build passed.

## Deployment verification

| Command/check | Exit | Result | Verdict |
|---|---:|---|---|
| `vercel deploy --prebuilt --prod --yes --scope hflowers45-9370s-projects` | 0 | Deployment `dpl_AwJrVdc7SrwSyHubAmmZBCtc5xWR` reached `READY`; canonical alias applied | PASS |
| Vercel deployment lookup by ID | not applicable | Existing project `sancussight`, production, `READY`, no alias error | PASS |
| Vercel deployment lookup by `sancussight.vercel.app` | not applicable | Canonical domain resolves to the same new deployment ID | PASS |
| Vercel build logs | not applicable | Prebuilt artifacts used; deployment completed | PASS |

## Real-browser hosted acceptance

### Source paths

- The entry page showed exactly the three source-distinct choices:
  `Explore sample`, `Open existing registry`, and `Build with local compiler`.
- `Explore sample` entered the canonical Assets experience with `Demo data`
  and `Synthetic workspace` truth labels.
- The compiler disclosure showed the checked-in local command, local review
  and confirmation instructions, and the explicit statement that the hosted
  page never executes the compiler or uploads metadata.
- The existing-registry file input accepted the bounded synthetic T4 fixture,
  entered the same Assets experience, retained the synthetic warning, and
  showed the neutral no-selection Passport. No stronger local-evidence claim
  was introduced.

### Desktop Assets

At `1440x1000`:

```json
{
  "catalog": {"left": 20, "right": 781.2, "top": 146.4, "bottom": 1497.0},
  "passport": {"left": 797.2, "right": 1420, "top": 146.4, "bottom": 2724.7},
  "sideBySide": true,
  "pageOverflow": 0
}
```

- The catalog and Passport were visibly adjacent siblings.
- Selecting `Accept governed asset action` produced visible `SELECTED` text,
  `aria-current`, and a matching Passport heading.
- Switching to `FindMnemo ontology contract` updated the adjacent Passport and
  selected row in place.
- The Passport contained exactly `Summary`, `Portability`, `Dependencies`,
  `Evidence`, `Decisions`, and `History`.

### Narrow Assets

At `320x900`:

```json
{
  "workspaceClass": "assets-workspace assets-view-passport",
  "catalogDisplay": "none",
  "passportDisplay": "block",
  "focusedTag": "H2",
  "focusedId": "asset-passport-heading",
  "focusedText": "FindMnemo ontology contract",
  "pageOverflow": 0,
  "backVisible": true
}
```

Activating `Back to assets` restored the catalog, hid the Passport, returned
focus to the selected row with `aria-current="true"`, and retained zero
page-level overflow.

### Navigation and context routes

- Primary membership was exactly `Home`, `Assets`, `Exit Drills`,
  `Attention`.
- Advanced membership was exactly `Evidence Sources`, `Governance`,
  `Release Proofs`, `Activity`, `Definitions`.
- Advanced > Evidence Sources left Assets, revealed the existing evidence
  rail, and focused the active `Agent Beacon` source row.
- Home opened `Trust conditions requiring attention`.
- Exit Drills opened the workflow exit test.
- The Exit Drill `Voice & context pack` asset link opened Assets in the same
  selected Passport state and focused `asset-passport-heading`.

### Footer

The persistent workspace footer contained:

- exactly one child element;
- exactly one anchor;
- visible text `https://sancussight.vercel.app`;
- href `https://sancussight.vercel.app`;
- no personal attribution, previous disclaimer, or additional footer item.

### Console, network, and runtime

- Chromium console: 0 errors, 0 warnings.
- Framework error overlay: absent.
- Canonical HTML, JavaScript, CSS, favicon, and workspace image: all HTTP 200.
- Dynamic requests: none during the initial hosted load.
- Vercel runtime error clusters for the project in the last hour: none.

## Durable screenshots

- `T5-hosted/hosted-landing.png`
- `T5-hosted/hosted-compiler-disclosure.png`
- `T5-hosted/hosted-desktop-selected.png`
- `T5-hosted/hosted-desktop-switched.png`
- `T5-hosted/hosted-evidence-sources.png`
- `T5-hosted/hosted-narrow-passport.png`
- `T5-hosted/hosted-narrow-return.png`

Playwright snapshots are retained under `T5-hosted/.playwright-cli/`.

## Boundaries

- No Feature 008 product behavior was changed.
- No Spec 005/T16R5/T16/A-002, provider, Pi, release-operation, commit, or
  push action occurred.
- No credential, token, local environment value, or identifying local path is
  recorded in this report or the screenshots.
- T5 and Feature 008 remain authority-plane incomplete pending orchestrator
  reconciliation.
