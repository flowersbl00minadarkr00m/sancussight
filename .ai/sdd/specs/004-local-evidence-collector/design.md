# Design: Local Evidence Collector

> Requirements: @requirements.md
> Status: Approved

## 1. Summary

Add a read-only, device-local collector that ingests approved artifacts from Agent Beacon, Praxen, and Pipelock, normalizes them into a versioned evidence envelope, and supplies source health plus evidence records to SancusSight. Source tools remain independently installed and operated. The collector cannot execute tools, trigger scans or tests, alter source policy, or rewrite source artifacts.

Use two explicit delivery modes:

1. **Hosted mode:** the existing static deployment remains available and supports registry connection plus manual evidence snapshots. It makes no automatic request to localhost.
2. **Local collector mode:** the companion binds to loopback and serves both the built SancusSight frontend and `/api/v1` from the same local origin. This mode enables near-live collection without a public-site-to-loopback dependency.

The selected Evidence Ledger concept becomes the desktop information hierarchy: compact navigation, canonical registry status, five evidence dimensions, a dense needs-attention ledger, and a right evidence-source rail. Health labels are grounded in collector state and never imply that SancusSight operates the external tools.

## 2. Research Inputs

- The [Local Network Access draft](https://wicg.github.io/local-network-access/) increasingly permission-gates requests from public sites to local and loopback services. Serving UI and API from one loopback origin avoids making that cross-network request the core product path.
- The [Secure Contexts specification](https://w3c.github.io/webappsec-secure-contexts/) treats `127.0.0.0/8`, `::1`, and conforming `localhost` origins as potentially trustworthy, preserving access to secure-context browser capabilities in local mode.
- Node documents that [`fs.watch`](https://nodejs.org/api/fs.html) is inconsistent across platforms and unreliable for some replacement and network-filesystem cases. Polling and content checkpoints are therefore authoritative; file-watch events may only accelerate a poll.
- Agent Beacon documents local `runtime.jsonl` and `inventory_state.jsonl`; Praxen documents machine-readable JSON reports; Pipelock documents signed receipts, Audit Packets, and independent verifier surfaces. These are the initial adapter contracts.

## 3. Requirements Mapping

| Requirement | Design coverage |
|---|---|
| FR-001 | Adapter-specific source configuration requires explicit local path and read-only validation. |
| FR-002 | `AgentBeaconAdapter`, `PraxenAdapter`, and `PipelockAdapter` are the initial adapter set. |
| FR-003 | `EvidenceEnvelopeV1` isolates normalized governance data from source schemas. |
| FR-004 | Content identity, parser version, artifact reference, and verification status are retained. |
| FR-005 | Polling, source cursors, deterministic IDs, and atomic checkpoints provide incremental idempotency. |
| FR-006 | `/api/v1/sources` powers the selected evidence-source rail and textual health states. |
| FR-007 | Each adapter has independent state, rejected records, retry, and last-accepted evidence. |
| FR-008 | Adapter field allowlists and bounded summaries exclude raw sensitive payloads by default. |
| FR-009 | The API has no generic command, subprocess, scan, test, or source-write endpoint. |
| FR-010 | Evidence bindings and a pure correlator feed existing deterministic product views. |
| FR-011 | Hosted/manual mode and persisted accepted evidence preserve degraded operation. |
| FR-012 | Confirmed source removal deletes collector-owned configuration/state only. |
| FR-013 | Adapter catalog exposes later-source readiness without enabling unsupported adapters. |
| NFR-001 | Loopback-only same-origin service, origin/host checks, CSRF protection, and field allowlists protect local data. |
| NFR-002 | Append-only accepted evidence, quarantined rejects, hashes, checkpoints, and visible signature results protect integrity. |
| NFR-003 | Evidence categories and references separate source facts, deterministic findings, gaps, and decisions. |
| NFR-004 | Concept 1 layout, native controls, textual states, and responsive source drawer cover usability. |
| NFR-005 | Incremental polling, metadata short-circuiting, bounded summaries, lag, and retention protect performance. |
| NFR-006 | Versioned adapters/envelopes and manual snapshot fallback isolate contract changes. |

## 4. Architecture

```text
Agent Beacon JSONL     Praxen reports     Pipelock receipts
        |                    |                    |
        +---------- read-only adapter boundary --+
                             |
                     Collector scheduler
                  stat -> parse -> validate
                  normalize -> dedupe -> persist
                             |
              +--------------+---------------+
              |                              |
      Local evidence store            Loopback HTTP API
      config/checkpoints               + static UI assets
      accepted/rejected                same local origin
              |                              |
              +---------- SancusSight -------+
                         correlator
                             |
       Evidence Ledger / Registry / Queue / Activity / Exit Test
```

### Operating modes

| Mode | Origin | Evidence behavior | Registry behavior |
|---|---|---|---|
| Hosted | Existing production HTTPS | Manual snapshot import only; no localhost probe | Spec 003 persistent file connector where supported |
| Local collector | `http://127.0.0.1:<port>` or `http://localhost:<port>` | Near-live approved-source collection | Same frontend and registry connector behavior |

The collector serves the existing `dist/` assets in local mode. The frontend discovers mode through same-origin `GET /api/v1/status`; failure means hosted/manual behavior, not repeated background probing.

## 5. Module Structure

```text
collector/
  main.ts                 CLI and loopback server startup
  server.ts               static assets and constrained /api/v1 routes
  security.ts             Host, Origin, session, CSRF, and response headers
  scheduler.ts            authoritative polling and coalesced refresh
  config-store.ts         atomic source configuration
  evidence-store.ts       accepted/rejected JSONL and checkpoints
  envelope.ts             EvidenceEnvelopeV1 validation and IDs
  adapters/
    adapter.ts            common read-only adapter contract
    agent-beacon.ts
    praxen.ts
    pipelock.ts
    catalog.ts            later-adapter readiness metadata

src/
  lib/
    collector-client.ts   same-origin API client and hosted degradation
    evidence.ts           pure correlation and evidence categories
  components/
    EvidenceSources.tsx   Concept 1 source rail/drawer
    EvidenceLedger.tsx    dense needs-attention table
    EvidenceDetail.tsx    source fact/finding/gap/decision inspector
  App.tsx                 mode hydration and existing view integration
  types.ts                envelopes, health, bindings, API contracts
```

No adapter can receive a process runner or writable filesystem capability. Collector filesystem access is centralized in a read-only artifact reader plus collector-owned storage writer.

## 6. Data Contracts

### Normalized evidence

```ts
interface EvidenceEnvelopeV1 {
  schemaVersion: 1
  id: string
  source: 'agent-beacon' | 'praxen' | 'pipelock'
  evidenceKind: string
  observedAt: string
  importedAt: string
  subject: {
    stableId?: string
    externalId: string
    type: 'agent' | 'workflow' | 'control' | 'action' | 'runtime'
  }
  outcome: 'pass' | 'warn' | 'fail' | 'observed'
  summary: string
  provenance: {
    artifactName: string
    artifactContentHash: string
    sourceRecordId?: string
    parserId: string
    parserVersion: string
    verification: 'verified' | 'failed' | 'unavailable' | 'not-applicable'
  }
  attributes: Record<string, string | number | boolean>
}
```

`id` is deterministic from source, artifact content identity, source record identity or canonical record content, and parser major version. The envelope contains allowlisted summaries and governance attributes only; raw source records remain in the source artifact.

### Source state

```ts
type EvidenceSourceHealth =
  | 'current'
  | 'stale'
  | 'failed'
  | 'permission-required'
  | 'not-configured'

interface EvidenceSourceState {
  id: string
  displayName: string
  evidenceType: string
  health: EvidenceSourceHealth
  lastAttemptAt?: string
  lastAcceptedAt?: string
  checkpoint?: string
  lag?: number
  errorCode?: string
  rejectedCount: number
}
```

### Registry evidence bindings

Add an optional compatible field to registry assets:

```ts
interface EvidenceBinding {
  source: EvidenceEnvelopeV1['source']
  externalId: string
}

interface Asset {
  // existing fields
  evidenceBindings?: EvidenceBinding[]
}
```

Correlation is explicit by `stableId` or binding. Name-only fuzzy matching may suggest a candidate but never attaches evidence automatically.

## 7. Collector Persistence

Use collector-owned files under the user's SancusSight data directory:

```text
collector-data/
  config.json
  checkpoints.json
  evidence.jsonl
  rejected.jsonl
  activity.jsonl
```

- Configuration and checkpoints use write-temp, flush, and rename replacement.
- Accepted and rejected records are append-only JSONL.
- Startup rebuilds a bounded deterministic-ID index from accepted evidence.
- Compaction writes a new accepted file and swaps it only after validation.
- Retention keeps normalized summaries and provenance; it does not copy high-volume raw telemetry.
- Collector-owned paths never overlap source directories.

A future database is unnecessary until observed volume or query latency justifies it.

## 8. Collection and Checkpointing

Polling is the source of truth. Default cadence is 15 seconds while the collector runs, configurable within conservative bounds; manual refresh runs immediately. `fs.watch` may trigger an earlier poll but never advances a checkpoint itself.

Collection transaction:

1. Stat approved artifacts and compare metadata with the checkpoint.
2. Read only new bytes or newly discovered report files when the source contract permits.
3. Detect truncation, replacement, or rotation before parsing.
4. Parse complete records and leave partial trailing JSONL lines uncommitted.
5. Validate source contract and normalize through field allowlists.
6. Compute deterministic IDs and discard already accepted records.
7. Append accepted or rejected records and flush.
8. Advance the checkpoint only after persistence succeeds.
9. Publish new health/freshness state to the API.

One source runs at a time per adapter. Sources may run concurrently with each other because their state and checkpoints are isolated.

## 9. Initial Adapters

### Agent Beacon

- Configures an approved Beacon output directory.
- Reads `runtime.jsonl` and `inventory_state.jsonl` incrementally.
- Imports allowlisted runtime, approval, tool category, lifecycle, and inventory metadata.
- Excludes prompt text, command bodies, file content, and raw tool results by default.
- Handles rotation/truncation through file identity, offset, and prefix/content checks.

### Praxen

- Configures an approved reports directory.
- Discovers machine-readable JSON report files and imports each report by content hash.
- Preserves finding identifiers, remit/rule references, severity, category, subject, and evidence reference.
- Excludes copied workspace source, conversation content, and embedded secrets.
- Rejects unsupported report versions without partially importing a report.

### Pipelock

- Configures approved receipt or Audit Packet locations and optional trusted public keys.
- Imports mediation outcome, action type, policy/manifest hash, receipt correlation, redaction counts, and bounded reason metadata.
- Verification is pluggable and version-pinned. A supported verifier plus trusted key yields `verified` or `failed`; missing support/key yields `unavailable`, never implicit success.
- Failed signature evidence is quarantined from verified governance claims but remains inspectable as a rejected record.
- No proxy health or policy mutation is required for artifact ingestion.

## 10. Loopback API

All routes are same-origin in local collector mode:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/v1/status` | Collector version, mode, aggregate health |
| `GET` | `/api/v1/sources` | Source catalog and current source state |
| `POST` | `/api/v1/sources/:id/configure` | Validate and confirm one adapter configuration |
| `POST` | `/api/v1/sources/:id/refresh` | Coalesced user-requested poll |
| `DELETE` | `/api/v1/sources/:id` | Confirmed removal of collector-owned source state |
| `GET` | `/api/v1/evidence` | Cursor-paginated normalized envelopes |
| `GET` | `/api/v1/rejected` | Cursor-paginated bounded rejection summaries |
| `POST` | `/api/v1/rejected/:id/retry` | Retry after configuration/parser recovery |

There is no generic filesystem read, arbitrary command, subprocess, source write, scan, test, or policy endpoint. Configure accepts only known adapter IDs and validates expected artifact shapes before persistence.

## 11. Loopback Security

- Bind only to `127.0.0.1` and optionally `::1`; never `0.0.0.0`.
- Accept only expected `Host` values for the configured loopback port to reduce DNS-rebinding exposure.
- Serve UI and API from the same origin; do not enable wildcard CORS.
- Require exact same-origin `Origin` for state-changing requests.
- Set an HttpOnly, SameSite=Strict local session cookie and require a per-session CSRF token on mutations.
- Use restrictive CSP, `frame-ancestors 'none'`, `nosniff`, and no external scripts/fonts/assets.
- Return controlled error codes and safe artifact names; raw paths and stack traces remain out of API/UI/activity payloads.
- Store source paths only in collector configuration with user-only filesystem permissions.
- Never store source credentials, private signing keys, or secrets in the registry or frontend storage.

## 12. Evidence Correlation

`correlateEvidence()` is pure and deterministic:

1. Prefer exact envelope `subject.stableId` to registry asset `stableId`.
2. Otherwise require an exact configured `evidenceBinding`.
3. Unmatched evidence remains visible in Activity and an `Unmapped evidence` queue.
4. Suggested name matches require human confirmation and create a binding only through canonical registry write-back.
5. Accepted evidence can update evidence freshness and produce deterministic signals but cannot overwrite owner, accepted risk, disposition, or other human decisions.

The UI labels four categories separately: `Recorded fact`, `Deterministic finding`, `Missing evidence`, and `Human decision`.

## 13. Evidence Ledger UI

Apply the selected Concept 1 direction without copying generated placeholder claims.

### Desktop

- Compact left navigation for Overview, Registry, Exit Test, Queue, and Activity.
- Top source bar for canonical registry name, registry sync state, last read, refresh, and utilities.
- Main Overview title `Evidence Ledger` with the five existing dimensions and no composite score.
- Dense `Needs attention` ledger ordered by existing deterministic severity and evidence age, with asset, owner, last evidence, and next action.
- Right `Evidence sources` rail listing adapter name, evidence type, health, and last accepted evidence.
- Source selection opens an unframed detail region with configuration, checkpoint, rejects, and recovery actions.

### Narrow viewports

- Keep core navigation compact and single-line or menu-based rather than a permanently narrow sidebar.
- Move evidence sources into a labeled drawer or inline section after the summary.
- Reflow the ledger into stable rows with severity, asset, age, and next action; avoid page-level horizontal scrolling.

Health always uses text plus color. `Current` means the source was collected within its freshness policy, not that the source tool or governed workflow is safe.

## 14. Hosted and Degraded Behavior

- The hosted app does not probe localhost automatically.
- The source rail in hosted mode identifies evidence as `Manual snapshot` or `Not configured` and offers manual import.
- If a user opens a collector-backed registry in hosted mode, accepted evidence remains visible with its persisted observation/import times but no live collector claim.
- If the collector stops while local mode is open, the UI retains accepted evidence, marks collector/source state stale or failed, and offers retry instructions.
- Registry connection, export, share, deterministic checks, and manual evidence import remain usable.

## 15. Edge Cases

| Case | Expected behavior |
|---|---|
| Source path denied or missing | Keep prior evidence, mark only that source `Permission required` or `Failed`, offer reconfiguration. |
| JSONL ends with partial line | Leave partial bytes uncheckpointed and retry after completion. |
| Source file truncates or rotates | Detect identity/size change, establish safe new cursor, and dedupe by record ID. |
| Praxen report version unsupported | Reject whole report with parser compatibility guidance. |
| Pipelock key missing | Import eligible bounded facts as verification `unavailable`; never present them as verified. |
| Pipelock signature fails | Quarantine record and expose failure; do not support verified claims. |
| Duplicate records after restart | Deterministic IDs prevent duplicate evidence/findings/activity. |
| Evidence does not match asset | Place in `Unmapped evidence`; do not name-match automatically. |
| Collector persistence fails | Do not advance checkpoint; source may safely retry. |
| One adapter crashes | Other sources continue; affected source becomes `Failed`. |
| Hosted app opened | No automatic loopback request; manual mode remains functional. |
| Malicious website posts to collector | Host/origin/session/CSRF checks reject the request. |
| Disconnect confirmed | Remove collector config/checkpoint/normalized records according to selected scope; source artifacts remain untouched. |

## 16. Technical Decisions

### TD-001: Same-origin loopback application

- **Decision:** The companion serves both built UI and local API from loopback.
- **Why:** Avoids making public-origin local-network permission, mixed-content, and CORS behavior a core dependency.
- **Trade-off:** Near-live users open a local SancusSight URL rather than the hosted URL.
- **Alternative:** Hosted UI calls localhost; rejected as a fragile and expanding browser permission boundary.

### TD-002: Node/TypeScript companion with platform APIs

- **Decision:** Build the collector in TypeScript on a supported Node LTS baseline using constrained platform APIs before adding a server framework.
- **Why:** Matches the repository and keeps the first local service auditable.
- **Trade-off:** Packaging as a standalone desktop binary remains later work.

### TD-003: Polling is authoritative

- **Decision:** Poll metadata/checkpoints; use watch events only as acceleration.
- **Why:** Cross-platform file-watch semantics are not reliable enough for evidence integrity.
- **Trade-off:** Evidence is near-live rather than instantaneous.

### TD-004: Append-only normalized store

- **Decision:** Use atomic JSON configuration/checkpoints and append-only JSONL accepted/rejected records at personal scale.
- **Why:** It is inspectable, portable, dependency-free, and sufficient before measured volume requires a database.
- **Trade-off:** Query/index rebuilding and compaction require explicit bounds.

### TD-005: Explicit evidence bindings

- **Decision:** Correlate by stable ID or confirmed binding; never auto-attach by fuzzy name.
- **Why:** Incorrect evidence attachment is worse than an unmapped record.
- **Trade-off:** Some first-run evidence needs human mapping.

### TD-006: Verification states remain explicit

- **Decision:** Preserve `verified`, `failed`, `unavailable`, and `not-applicable` rather than coercing every source into pass/fail.
- **Why:** Cryptographic and source contracts differ, and missing verification is not success.
- **Trade-off:** UI and checks must handle uncertainty deliberately.

### TD-007: No tool-control API

- **Decision:** The collector reads artifacts only and exposes no generic execution surface.
- **Why:** Prevents SancusSight from becoming an implicit security runtime or authorization layer.
- **Trade-off:** Users continue to operate each source tool separately.

## 17. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Companion expands security surface | Local evidence could be exposed or modified | Loopback-only same-origin server, restrictive host/origin/session/CSRF controls, no generic file/command API. |
| Source schemas change | Silent evidence loss or misinterpretation | Versioned adapters, fixtures, reject-on-unknown, parser version in every envelope. |
| High-volume telemetry grows storage | Slow startup and duplicate sensitive data | Field allowlists, normalized summaries, retention/compaction, lag reporting, raw data stays at source. |
| File replacement defeats watcher | Missed events or stale checkpoint | Polling source of truth plus identity/hash checks. |
| Incorrect subject correlation | Findings assigned to wrong asset | Stable IDs and explicit bindings only. |
| Signature verifier drifts | False trust in Pipelock evidence | Pinned verifier contract, conformance fixtures, explicit unavailable/failed states. |
| Concept 1 implies live control | Misleading product promise | Label rail `Evidence sources`, show `Evidence import only`, omit run/configure-tool commands. |
| Local mode fragments product | Hosted and local experiences diverge | One frontend build, capability-driven data layer, shared fixtures and visual checks. |

## 18. Verification Strategy

Preferred test seams:

- Adapter contract fixtures for source parsing and redaction.
- Pure envelope ID, checkpoint, health, and evidence-correlation functions.
- In-memory collector store and HTTP handler tests.
- Browser verification against a fake same-origin collector API.

First red-green case: import an Agent Beacon record, persist its checkpoint, restart the collector, and present the same source bytes again. Exactly one accepted envelope and one correlated activity event must exist.

Automated verification should include:

1. partial JSONL lines do not advance checkpoints;
2. rotation/replacement does not duplicate accepted records;
3. unsupported Praxen report versions are wholly rejected;
4. Pipelock verified/failed/unavailable states stay distinct;
5. allowlists exclude prompt/body/secret fixtures;
6. one adapter failure leaves others current;
7. unmatched evidence never auto-attaches by name;
8. hosted mode makes no loopback request;
9. state-changing API calls fail wrong Host, Origin, session, or CSRF checks;
10. disconnect never mutates source fixtures.

Project gates:

- Existing `npm run verify:core`
- Add collector tests with Node's built-in test runner and one documented command.
- `npm run build` for frontend and collector compilation.
- Browser screenshots at 1280x720 and 390x844 for current, stale, failed, not-configured, and collector-degraded states.
- Production network inspection proving no external requests and no hosted-mode localhost probe.

## 19. Implementation FAQ

**Does SancusSight install or run Agent Beacon, Praxen, or Pipelock?**  
No. It reads explicitly configured artifacts after those tools produce them independently.

**Why does local mode serve its own frontend?**  
It keeps the UI/API same-origin and avoids depending on evolving public-site access to loopback services.

**Is this real-time monitoring?**  
No. It is near-live local artifact collection while the collector and source are available.

**Can the hosted site use the collector?**  
Not in the approved design. Hosted mode uses manual snapshots and does not probe localhost.

**Where are raw logs stored?**  
In the source tool's location. SancusSight stores only allowlisted normalized evidence and provenance.

**How does evidence change the registry?**  
It can support freshness and deterministic findings. Human-owned registry facts change only through the canonical registry workflow.

**Why not use fuzzy matching for assets?**  
A wrong evidence attachment can misstate risk. Unmapped evidence is safer until the user confirms a binding.

**Can AIMap, Kiji, or RAMPART be added later?**  
Yes, after each has an approved evidence contract, privacy boundary, and authorization model. AIMap ingestion must remain separate from active scan execution.
