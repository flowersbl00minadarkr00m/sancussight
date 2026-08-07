# SancusSight

SancusSight is a local-first AI governance registry for portability, continuity, control coverage, ownership, and evidence freshness. Its findings are deterministic checks of recorded facts, not a compliance opinion or security guarantee.

## Operating modes

### Hosted mode

The static Vite build provides the registry, persistent local-file connector where supported, manual evidence snapshots, deterministic checks, exit tests, and export. It does not probe localhost or connect to a collector automatically.

```bash
npm install
npm run dev
```

### Local collector mode

The optional companion serves the same built frontend and `/api/v1` from one loopback origin. It reads explicitly configured local evidence artifacts from:

- Agent Beacon `runtime.jsonl` and `inventory_state.jsonl`, schema `1.0`.
- Provider-neutral `runtime-telemetry.jsonl`, contract `RuntimeTelemetryEventV1`, for metadata-only Codex CLI, Claude Code, and Pi events. Agent Beacon remains a separate compatible provider where supported.
- Praxen canonical findings JSON, schema `2.0`.
- Pipelock Audit Packet, schema `pipelock.audit_packet.v0`.
- Sanitized RAMPART operational reports and authorization-bound completed AIMap exports.

Source tools remain independently installed and operated. SancusSight does not install them, start them, trigger scans, modify policies, execute commands, or write their artifacts.

### Windows/WSL runtime telemetry

The fixed operator-side OTLP bridge in `operations/telemetry/otlp-bridge.ts` accepts OTLP JSON logs only on `127.0.0.1:43120/v1/logs`, rejects content-bearing attributes, and appends the allowlisted `RuntimeTelemetryEventV1` projection under `%LOCALAPPDATA%/SancusSight/operations/exports/runtime-telemetry/`. Configure Codex and Claude prompt/content telemetry off before using their OTLP exporters. The bridge is separate from the SancusSight collector API and fails closed if its fixed port is unavailable.

The Pi package in `operations/telemetry/` subscribes only to lifecycle and tool metadata. It never reads prompt, response, reasoning, Bash command/output, tool input/result content, session-file paths, credentials, or workspace content. Install it persistently for the current Pi user with:

```powershell
pi install ./operations/telemetry
```

Remove the user-scoped package with `pi remove ./operations/telemetry`; retained telemetry evidence is not deleted automatically.

Pi may use Bash to invoke fixed approved setup and upstream verification commands. That delegated execution stays in the operator domain; SancusSight receives only sanitized action/event metadata and exposes no Pi, Bash, installer, or generic command route.

```bash
npm install
npm run build
npm run collector:start
```

Open `http://127.0.0.1:43117`. Configure each source from the Evidence sources rail using its local artifact directory or packet path.

Configuration:

- `SANCUSSIGHT_PORT`: loopback port, default `43117`.
- `SANCUSSIGHT_DATA_DIR`: collector-owned data directory, default `%USERPROFILE%/.sancussight/collector-data` on Windows.

### Local registry compiler (Windows)

The standalone `sancussight-registry` package creates a metadata-only starter
registry for people who have accumulated projects, skills, commands, loops,
workflows, MCPs, posts, agent configurations, controls, evaluations, evidence
contracts, and adapters across tools. It reads only explicitly confirmed roots,
opens a one-time loopback browser review, and writes exact local plus sanitized
portable outputs after confirmation:

```powershell
npx sancussight-registry compile --root "C:\path\to\approved\metadata-root"
npx sancussight-registry validate --local-out "$env:LOCALAPPDATA\SancusSight\registry.json"
npx sancussight-registry refresh --root "C:\path\to\approved\metadata-root"
```

The compiler never executes discovered commands, launches upstream tools, calls
MCP servers, or retains prompts, responses, reasoning, command bodies/arguments,
credentials, private keys, raw post content, or unrestricted workspace data.
Sensitive and ambiguous records are skipped with bounded reasons; refresh keeps
disappeared records as `missing` rather than deleting them. See
`packages/registry-compiler/README.md` for output locations, exit codes, and
portable-export privacy details.

## Security boundary

- The service binds only to `127.0.0.1`.
- API mutations require an allowed Host, exact same Origin, an HttpOnly SameSite session, and a per-session CSRF token.
- There is no generic filesystem, command, subprocess, scan, test, proxy-policy, or source-write endpoint.
- Adapters receive read-only artifact access. Collector-owned writes are limited to its configured data directory.
- Normalization uses field allowlists and excludes prompts, command bodies, source excerpts, secrets, credentials, and unrestricted raw telemetry.
- Runtime telemetry preserves actual runtime, provider, transport, and version. Native OTLP and Pi-extension records are never labeled Agent Beacon.
- Pipelock evidence is `unavailable` for trusted verification unless a pinned verifier is supplied. An explicit failed verifier result is quarantined and never presented as verified.

## Persistence and retention

Collector-owned state contains versioned configuration, checkpoints, normalized evidence, rejected-record summaries, and local activity. Accepted and rejected records are deterministic and deduplicated across retry, restart, and rotation.

Retention is bounded per source:

- 10,000 normalized accepted records.
- 1,000 rejected-record summaries.

Raw high-volume telemetry stays in the source tool. Compaction validates and swaps collector-owned JSONL only; it never modifies source artifacts.

## Degraded operation

If one source fails, other sources continue independently. The last accepted evidence remains visible with its original timestamps. If the collector becomes unavailable while the local page is open, the ledger remains usable and previously current sources become `Stale`. Hosted mode remains available for registry work and manual evidence snapshots.

## Disconnect and removal

Disconnecting a source from the UI removes only SancusSight configuration, checkpoints, and normalized records for that source after confirmation. It does not delete or rewrite source-tool files.

To remove the companion and all collector-owned state:

1. Stop `npm run collector:start`.
2. Delete the configured `SANCUSSIGHT_DATA_DIR`, or the default `.sancussight/collector-data` directory.
3. Leave source-tool directories unchanged.

## Verification

```bash
npm run test:collector
npm run verify:core
npm run build
```

The collector tests cover envelope identity, restart deduplication, rotation, partial JSONL, schema rejection, redaction, verification states, source isolation, loopback security, permission handling, and source-preserving disconnect.

## Deployment

The hosted site deploys the generated `dist/` directory. The collector is a separate opt-in local process and is not part of the static deployment.
