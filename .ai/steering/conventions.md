# Conventions Steering — SancusSight

## Code Style

- **Language:** TypeScript (~6.0.2)
- **Lint:** None configured
- **Naming:** camelCase for variables/functions, PascalCase for components, kebab-case for files

## Architecture Patterns

- **Tab-based navigation:** Overview, Registry, Definitions, Exit Test, Queue, Activity, and Governance
- **Local state:** React hooks in the browser; IndexedDB stores imported evidence and hosted/manual governance snapshots
- **Local collector:** An explicit loopback-only Node service owns source polling, bounded evidence envelopes, governance projection, and append-only local governance history
- **Deterministic checks:** Pure functions validate metadata and project typed governance events; the UI never executes upstream actions

## Testing Rules

- Collector and domain tests use Node’s built-in test runner through `npm run test:collector`
- Frontend type-check and production bundle verification use `npm run build`
- Test source adapters, privacy rejection, event projection, failure isolation/recovery, hosted/manual persistence, and bounded UI states

## Accessibility / Security Rules

- Color must not be the sole indicator of status; pair status with text labels
- No raw prompts, responses, credentials, private keys, raw scan payloads, or unrestricted workspace content enter normalized evidence or exports
- Hosted mode makes no localhost request; local mode talks only to the explicit loopback collector
- Preserve keyboard focus, visible states, reduced-motion behavior, and bounded overflow at desktop and mobile widths

## Workflow Rules

- `npm run build` verifies collector and frontend TypeScript plus the production bundle
- `npm run test:collector` runs the collector/domain regression suite
- `npm run verify:core` and the focused `scripts/verify-*.ps1` checks verify privacy, operations, and rollback boundaries
- `npm run dev` is for development; use the loopback collector only when local evidence mode is explicitly requested

## Anti-Patterns

- **Silent-failure validation on unparseable input — highest priority for
  this project.** Example found 2026-08-06: `daysBetween`
  (`src/lib/registry.ts`) returns `NaN` for an unparseable `lastVerified`
  date, and every staleness/expiry comparison (`d > threshold`,
  `Date.parse(x) < Date.parse(today)`) is `false` for `NaN` — so invalid
  data passes as "verified" and expired risk-acceptances never expire.
  Detection: this project's entire value proposition is trustworthy
  evidence; any comparison feeding a pass/fail, verified/stale, or
  accepted/rejected determination must explicitly validate the input
  parses before comparing. A `NaN`-tolerant comparison in a governance path
  is always at least a High-severity Standards finding here, never a style
  nit.
- **Race conditions silently discarding unsaved local state.** Example
  found 2026-08-06: a focus-triggered refresh in `App.tsx` could overwrite
  a just-recorded review because `SourceController.refresh`
  (`src/lib/source-controller.ts`) de-duped concurrent calls while ignoring
  which session each caller actually wanted. Detection: any de-duplicated
  or debounced async operation must key its cache/result on the exact
  request identity, not just "a request of this kind is already in
  flight."
- **Dead-end UI states on narrow viewports.** Example found 2026-08-06:
  the Assets view's "Back" control lives inside the detail panel, so if the
  selected item disappears (e.g. after a refresh), the narrow-viewport user
  has no way back to the list. Detection: every empty/missing-selection
  state must carry its own navigation out, not rely on a control nested
  inside the content it's the fallback for.

## Open Questions

- Should the project adopt a dedicated lint step in a later, separately approved change?
- Is the thermal-financial palette documented anywhere beyond the project-local CSS?
