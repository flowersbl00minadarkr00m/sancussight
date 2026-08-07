# Tech Stack Steering — SancusSight

## Runtime / Platform

- **Runtime:** Node.js 24+ for the loopback collector and Vite preview/dev server
- **Deployment target:** Static host for hosted/manual UI; optional explicit loopback collector for local mode
- **Package manager:** npm

## Frontend

- **Framework:** React 19
- **Build:** Vite 8
- **Styling:** Tailwind CSS 4 with project-local CSS tokens
- **TypeScript:** ~6.0.2
- **Browser persistence:** IndexedDB for evidence and hosted/manual governance snapshots

## Backend / Collector

- **Transport:** Node `http` server bound to loopback with a strict local session/CSRF boundary
- **Storage:** File-backed evidence, governance event, checkpoint, and source configuration stores under the collector data directory
- **Adapters:** Fixed allowlisted native sources plus explicit producer artifact adapters; failures are isolated per source

## Testing / Verification

- Lint: _none configured_
- Test: `npm run test:collector`
- Build: `npm run build` (collector tsc, frontend tsc, and `vite build`)
- Core verification: `npm run verify:core`
- Preview: `npm run preview`

## Dependencies

- `react`, `react-dom` — UI framework
- `lucide-react` — bounded icon set
- `@tailwindcss/vite`, `tailwindcss` — styling
- `@vitejs/plugin-react` — Vite React integration
- `typescript`, `vite` — compilation and bundling

## Constraints

- Local-first: browser IndexedDB for snapshots plus an explicit loopback-only collector; hosted/manual mode remains browser-only
- Collector state is append-only and bounded: normalized `EvidenceEnvelopeV1` and `GovernanceEventV1` records only
- No external dependencies at runtime (no CDN, no fonts, no third-party API calls)
- Upstream execution remains in the operator domain; SancusSight is read-only except for its own local governance decisions/bindings

## Architectural Decisions

- **Local-first by design:** Hosted/manual UI uses IndexedDB; local mode connects only to a user-started loopback collector
- **Bounded projection:** Source adapters normalize allowlisted artifacts into typed evidence envelopes and governance events, preserving retained evidence while isolating failures
- **Governance ownership:** Producer facts remain source-qualified; SancusSight-owned decisions and bindings are explicit, bounded, auditable, and never upstream commands
- **Thermal-financial color system:** Navy/moss/amber/rust/slate/accept on paper background
- **Deterministic checks:** No AI scoring — metadata format validation, date freshness, coverage verification, and typed governance projection
- **JSONL and artifact import:** Activity/evidence ingestion stays allowlisted by source adapter and artifact contract

## Open Questions

- Should the project adopt a dedicated lint step in a later, separately approved change?
- Which future native adapters, if any, should be added beyond the fixed current source catalog?
