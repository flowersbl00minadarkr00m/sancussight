# Feature 011 T5 Hosted Acceptance Report

## Verdict

`PASS` - the exact reviewed prebuilt artifact is deployed to the existing
canonical SancusSight Vercel project, all hosted static bytes match, and the
complete installed-Google-Chrome acceptance matrix passed 18/18.

This is worker evidence and a `ready-for-review` recommendation only. The
orchestrator remains the sole authority for shared tracking and completion.

## Deployment Identity

- deployment ID: `dpl_HqUEHadmFPqQ1aaKYPQPm4GEhzbH`
- project: `sancussight`
- project ID: `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`
- team ID: `team_Y7ueoZZnBOfX63cjuG9R9SYG`
- scope: `hflowers45-9370s-projects`
- target/state: `production` / `READY`
- canonical URL: `https://sancussight.vercel.app`
- immutable URL:
  `https://sancussight-f8zoeu66a-hflowers45-9370s-projects.vercel.app`
- canonical alias assigned: yes
- alias error: none
- project/domain/config replacement: none

## Locked Artifact

- reviewed source/config manifest: 323 files
- reviewed source/config manifest SHA-256:
  `e534872601f0e79e158473e5bc0033dff89cc389b7a50af0dc9d5ec9f6d0fb55`
- accepted lock: 46,337 bytes; SHA-256
  `6a8310fc75e9c963769a7e6dc890df440731003ace2fe8100001d1eb7c32aaf9`
- local/prebuilt static manifest: 6 files; SHA-256
  `db506509b15011602c1d61092b65c052b535a8eeed2bb49d61b1362c898ca7cc`
- canonical hosted static manifest: 6/6 HTTP 200 and exact byte equality
- final source/config, lock, and prebuilt comparisons: pass

## Local and Prebuilt Gates

The exact required sequence passed in order:

- Feature 011: 27/27
- Feature 010: 31/31
- Feature 009: 24/24
- Feature 008: 6/6
- collector: 92/92
- registry compiler: 28/28
- core verification: pass
- production build: pass, 1,845 modules
- whitespace: `git diff --check` exit 0
- Vercel production prebuild: pass

The accepted gate log is
`execution/T5-hosted/local-gates.log` (SHA-256
`9ca731e1c40fc45646d7e797bedcddc4e1265a0ddf04fed0abf5703d23a6a19c`).

## Hosted Installed-Chrome Matrix

Installed Google Chrome was launched directly through the bundled Playwright
library. The extension file-URL limitation was not used as a product blocker.
All new scripts, screenshots, downloads, and JSON results are under
`execution/T5-hosted/`.

Result: 18 passed, 0 failed.

The matrix verifies the public schema, workspace/rail placement, safe and mixed
imports, privacy non-retention, telemetry alignment, valid/tampered packet
behavior, exact unsigned Statement download and digest, download-denial
honesty, retention/dedupe/clear/unavailable states, responsive behavior,
routes/footer, console/page errors, and network origins.

Specific runtime signals:

- public schema: HTTP 200, 1,815 exact bytes
- console warnings/errors: 0
- uncaught page errors: 0
- observed request origins:
  `https://sancussight.vercel.app` only
- scoped Vercel runtime errors: none

The browser result is
`execution/T5-hosted/browser-matrix-results.json` (SHA-256
`376fd8c0bda85e20239d2fe8a8e2e908dbe3a1afdc86bcc327a7bf54e3e57d9e`).
The hosted static result is
`execution/T5-hosted/hosted-static-results.json` (SHA-256
`531926b0c2aba2cda3db3617855a94f10549a7388d9e8f621436285658743055`).

## Privacy and Scope

Only explicitly synthetic, previously reviewed fixtures were uploaded. No
private or production evidence was sent. T5 made no authorized product,
package, lock, dependency, configuration, domain, route, cache, shared
tracking, commit, push, provider/Pi, Spec 005, T16R5, T16, or A-002 change.

The registry refresh command had completed immediately before the tracking
owner clarified that registry refresh belonged to the orchestrator. No further
registry write or attempted reversal occurred after that clarification.
