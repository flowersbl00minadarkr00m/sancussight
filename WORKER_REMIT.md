<!--
  SancusSight Agent Policy — Praxen Worker Remit
  Scope: SancusSight local-first governance registry (hosted frontend + optional local collector)
-->

# Worker Remit
*Praxen — SancusSight Agent Policy*

This file defines the authorized identity, behavior, and boundaries of the SancusSight governance registry system.
It is the policy contract Praxen evaluates SancusSight's code and configuration against.

---

## Identity

| Field | Value |
|-------|-------|
| Worker Name | SancusSight |
| Agent Key / ID | sancussight-registry |
| Owner / Operator | Henry (hflowers45@gmail.com) |
| Deployment Environment | Local-first (hosted static frontend + optional loopback collector) |
| Primary Model | N/A — data system, not LLM-driven |
| Secondary Models | N/A |
| Remit Version | 1.0 |
| Last Updated | 2026-07-21 |
| Updated By | Praxen Pre-flight Authoring |

---

## Mission

SancusSight is a local-first AI governance registry that collects, normalizes, and displays evidence about AI assets (skills, prompts, workflows, controls, configurations) across multiple tools and platforms. The system shows portability status, ownership, and control coverage without executing upstream actions, modifying policies, or retaining raw prompts, responses, or credentials. The hosted frontend provides a static registry view; the optional local collector reads explicitly configured evidence sources (Praxen findings, telemetry, audit packets) and maintains a local append-only governance history.

---

## Job Description

The SancusSight system MUST perform these core functions:

- **Evidence collection and normalization:** Read evidence from explicitly configured local sources (Praxen findings JSON, Agent Beacon JSONL, runtime telemetry, audit packets, RAMPART reports) and project them into deterministic, normalized governance records using field allowlists.
- **Local-only collector service:** When enabled, bind only to loopback (127.0.0.1) and serve the built frontend and `/api/v1` endpoints from a single origin; read only from explicitly configured source directories; append evidence and governance state to bounded, deduplicated local storage.
- **UI-driven governance registry:** Display five dimension cards (context, skills, continuity, controls, evidence) with coverage matrices, asset details, exit test workflows, remediation queues, and governance lineage backed by versioned evidence.
- **Privacy-first normalization:** Apply allowlists to reject raw prompts, responses, reasoning, command bodies, credentials, private keys, scan payloads, and unrestricted workspace content; preserve only metadata, runtime/version facts, and structured event records.
- **Deterministic health checks:** Run pure-function validation on imported evidence; flag schema violations, stale records, and verification failures without opinions or compliance claims.
- **Session and CSRF protection:** Require explicit session validation, matching Origin and Host headers, HttpOnly SameSite cookies, and per-session CSRF tokens for all API mutations; enforce the same-origin policy; reject cross-site and unauthenticated requests.

---

## Non-Goals (Out of Scope)

SancusSight MUST NOT:

- Execute commands, scripts, or code on the host system or upstream platforms
- Modify upstream tool configuration, policy, or state
- Scan, test, or trigger upstream tools or CI/CD pipelines
- Probe localhost beyond the explicitly configured loopback collector port
- Make outbound HTTP/API requests to any non-localhost destination in local-collector mode
- Retain or export raw prompts, responses, reasoning, command input/output, credentials, private keys, or raw telemetry content
- Store personally-identifiable information (PII) beyond what is necessary to link evidence to its source
- Provide compliance opinions, security guarantees, or audit conclusions (findings are deterministic checks of facts only)
- Sync, cache, or transmit local collector data to cloud or hosted backends without explicit user action

---

## Approved Communication Channels

| Channel | Allowed | Requires Approval | Notes |
|---------|---------|------------------|-------|
| Localhost HTTP (127.0.0.1, loopback) | Yes | No | Collector service binds only to loopback; hosted frontend makes no localhost requests |
| Local filesystem read | Yes | No | Configured source directories only (explicit per-source configuration) |
| Local filesystem write | Yes | No | Collector-owned data directory only; append-only governance history; no source-artifact modification |
| Upstream tool APIs | No | N/A | Disabled entirely in local-collector mode; hosted mode does not probe or connect |
| External DNS / DNS resolution | No | N/A | Not used; loopback-only in collector mode |
| Any non-localhost HTTP destination | No | N/A | Prohibited entirely |

**Any channel not listed here is unauthorized by default.**

---

## Authorized Counterparties

### Trusted People / Accounts

- Operator: System user (Windows LOCALAPPDATA owner) who configured and launched the collector

### Trusted Domains

- `127.0.0.1` / `localhost` — loopback only

### Trusted Services / Integrations

- Praxen findings sources (canonical findings JSON, schema 2.0)
- Agent Beacon telemetry (runtime.jsonl, inventory_state.jsonl, schema 1.0)
- Runtime telemetry collectors (OTLP bridge, Pi package telemetry)
- RAMPART operational reports (sanitized, authorization-bound)
- Pipelock audit packets (schema pipelock.audit_packet.v0)

### Explicitly Forbidden

- Any upstream cloud service or SaaS platform
- Any external authentication provider (OAuth, SAML, etc.) not explicitly whitelisted
- Cross-origin HTTP requests from browser to non-localhost origins
- Any service not in the Trusted Services list above

*Counterparties present in code or configuration but absent from this list will be flagged as a trust expansion finding.*

---

## Tools and Capabilities

### Allowed Tools (Known Good Baseline)

*The collector and frontend do not expose tool interfaces in the LLM sense; they provide data-layer functions:*

- JSONL source reader (Agent Beacon, telemetry)
- Praxen findings JSON parser (schema 2.0)
- Evidence normalizer (field allowlist projection)
- Session manager (loopback-only auth)
- CSRF token generator and validator
- Registry query API (`/api/v1/assets`, `/api/v1/governance`, read-only)
- Evidence configuration API (`/api/v1/sources`, `POST` to add/remove sources with explicit confirmation)
- IndexedDB persistence (hosted frontend only)
- Deterministic check engine (pure functions, no side effects)

### Restricted Tools (Require Approval Before Use)

*None — no tools in SancusSight require per-invocation approval.*

### Forbidden Tools

- Subprocess execution (`child_process.exec`, `os.system`, shell invocation)
- Network request to non-localhost destinations (`http.request`, `fetch`, `curl`)
- Dynamic code evaluation (`eval`, `Function()`, template compilation with user input)
- File system write outside the collector's configured data directory
- Upstream tool modification or execution
- Generic shell command endpoint

---

## Data Boundaries

### Allowed Data Sources

- Local filesystem: explicitly configured source directories only (no filesystem traversal outside configured roots)
- Praxen findings JSON files
- Agent Beacon JSONL files
- Runtime telemetry JSONL files
- Manually uploaded evidence packets (hosted/manual mode)
- Configuration files (source definitions, settings) stored in `.sancussight/collector-data/`

### Sensitive Data Classes

*Data that requires special handling. SancusSight MUST reject or redact these:*

- Prompts and system prompts (complete messages to LLMs)
- Responses and model outputs (raw model-generated text)
- Reasoning traces (CoT, chain-of-thought reasoning)
- Bash command input and output
- Credentials and API keys (even test/mock values)
- Private keys and certificate material
- Session tokens, bearer tokens, OAuth tokens
- Personally-identifiable information (names, email addresses beyond source attribution, phone numbers)
- Raw scan payloads and attack traces

### Forbidden Data Movement

- Sending raw prompts, responses, or reasoning to external services
- Storing unredacted credentials in local storage or session cookies
- Transmitting evidence to cloud backends without explicit per-source user confirmation
- Logging raw telemetry content (metadata and structured events only)
- Exporting PII-enriched data in portable registry outputs

---

## Action Boundaries

### Allowed Without Approval

- Reading from configured source directories
- Parsing and validating evidence in standard formats (JSON, JSONL)
- Normalizing evidence using field allowlists
- Displaying evidence in the UI
- Generating CSRF tokens and validating session state
- Creating loopback HTTP endpoints on the configured port
- Appending to local governance history in the collector-owned directory
- Deduplicating records and enforcing bounded retention (10k accepted, 1k rejected summaries per source)

### Requires Human Approval Before Execution

- Adding a new evidence source (UI confirmation required)
- Removing an evidence source from the registry (UI confirmation required)
- Disconnecting a source and deleting associated local state (UI confirmation required)
- Exporting local governance data to a portable format (explicit download; no automatic sync)

### Never Allowed

*Praxen will emit a Critical finding for any of these:*

- Executing any command on the host system
- Making HTTP requests to destinations other than localhost
- Modifying source-tool configuration or state
- Triggering scans, tests, or upstream tool execution
- Storing unredacted credentials in workspace files or configuration
- Logging raw prompt/response/reasoning content
- Sending evidence to cloud backends without explicit per-source confirmation
- Creating file-system, command, or subprocess endpoints accessible to the UI
- Implementing a generic policy engine or approval/blocking system that modifies upstream behavior
- Downgrading CSRF or session validation based on origin or user-agent heuristics

---

## Behavioral Expectations

### Normal Cadence

- **Active hours:** Always available when running; no time-based gating
- **Expected idle periods:** Between source polls (configurable per source; default: 5-minute interval)
- **Scheduled jobs / cron tasks:** Source polling on configured intervals; evidence retention compaction on restart

### Expected Patterns

What normal work looks like. Praxen uses this to distinguish ordinary operation from drift:

- Collector polls configured sources at regular intervals, reads new evidence, and appends normalized records to local storage
- UI serves static bundle on every request; no long-running computations or background jobs initiated by the frontend
- Evidence normalization applies field allowlists consistently to every record; fields not in the allowlist are dropped
- Rejected records (schema violations, credential-bearing content, oversized payloads) are logged by type and count, never by content
- Session validation succeeds only when Origin, Host, and CSRF token all match; mismatches result in 403 Forbidden with no fallback

### Acceptable Retry Behavior

- Maximum retries for source poll failures: 3 (exponential backoff, 30s/60s/120s)
- Retry interval: Exponential backoff; no retries for validation or schema failures (permanent)
- Actions that should never be retried: Credential redaction failures, CSRF validation failures, Origin/Host mismatches

---

## Known Good Baseline

*Snapshot of what SancusSight looks like when operating correctly. Used for comparison.*

### Typical Tool Inventory

- JSONL reader, JSON parser, field allowlist projector, session manager, CSRF validator, query API, configuration API, evidence normalizer, deterministic check engine

### Typical Channels Used

- Loopback HTTP (127.0.0.1:43117 default), local filesystem read/write (configured data directory only)

### Typical Session Count / Duration

- Hosted mode: one session per browser tab (ephemeral, IndexedDB persistence only)
- Collector mode: one persistent server session per collector process lifetime; multiple concurrent browser sessions (each with unique CSRF token)

### Typical Outbound Destinations

- None (loopback-only)

### Typical File Paths Accessed

- `$LOCALAPPDATA/.sancussight/collector-data/` (Windows) — sources.json, governance-history.jsonl, normalized records
- Configured source directories (operator-specified per source)

### Normal Restart Cadence

- Collector: restarts on operator command; stateless except for local data directory
- Frontend: reloads on page refresh; browser-only state via IndexedDB (no server-side persistence in hosted mode)

---

## Swimlane Definition

### Authorized Domains of Work

*Topics, systems, and tasks this agent is permitted to engage with.*

- AI asset portability assessment and evidence collection
- Control coverage analysis and governance history
- Local evidence normalization and schema validation
- Deterministic health checks on imported evidence (no opinions)
- Exit-test workflow simulation (what-if portability checking)
- Local registry display and asset detail views

### Disallowed Domains of Work

*Topics, systems, and tasks this agent must decline or escalate.*

- Upstream tool execution or command triggering
- Policy modification or approval enforcement
- Cloud sync or hosted data retention (local-only governance history)
- Compliance opinions or audit conclusions
- PII enrichment or bulk export
- Automatic credential detection and exposure (credential-bearing evidence is rejected outright)

---

## Risk Sensitivities

*Areas where extra scrutiny applies. Praxen will apply lower thresholds for findings in these areas.*

- **Session and CSRF security:** Any degradation, bypass, or conditional leniency in session validation or CSRF token checking is **Critical**
- **Credential storage and logging:** Any literal credential value retained in configuration, logs, or exported state is **Critical**
- **Evidence schema violation handling:** Evidence that does not conform to declared input schema (Praxen 2.0, Agent Beacon 1.0, etc.) is **Critical** if accepted without rejection
- **Outbound network access:** Any HTTP request to non-localhost destinations in local-collector mode is **Critical**
- **Upstream tool integration:** Any execution of commands or scripts on the host or upstream systems is **Critical**
- **Unauthorized source directories:** Any filesystem read outside the explicitly configured source roots is **High**

---

## Escalation Rules

These rules drive Praxen's reporting layer. They determine whether a finding is logged only, triggers an alert, or requires an immediate halt.

### Halt Agent and Alert Operator

*Conditions serious enough to warrant stopping the agent (or not deploying it).*

- Unredacted credentials (API keys, tokens, passwords, private keys) found in code, configuration files, or logs
- Evidence schema validation disabled or bypassed (raw input accepted without allowlist projection)
- CSRF token validation disabled or missing from any mutation endpoint
- Origin or Host header validation disabled or conditionally bypassed
- Session validation degraded or using weak cryptography
- Outbound HTTP requests to non-localhost destinations detected in code
- Subprocess execution or shell invocation detected in the collector or frontend code
- File writes outside the configured collector-data directory detected in code
- Evidence retention bounds (10k records, 1k rejected summaries) not enforced or exploitable to OOM

### Alert Operator (Do Not Halt)

- Telemetry or logging configuration that captures prompts, responses, or reasoning (even if redaction is intended)
- Evidence sources configured to a non-standard directory without operator confirmation
- Unverified claims in remit vs. code (e.g., promised privacy redaction not present)
- Deterministic checks implemented with opinions or heuristics instead of pure functions
- Missing per-source remove confirmation (UX bypasses the explicit confirmation gate)
- Dependency vulnerabilities in transitive supply chain (lock file review)

### Log Only

- Evidence source polling failures (transient, recoverable)
- Records rejected due to schema violations (expected, logged by type)
- Oversized payloads rejected per retention policy (expected)
- Session rejects due to missing CSRF token (expected, user cleared cookies)
- Stale evidence discovered during compaction (expected, logged)

---

## Example Good Behavior

*Concrete examples of what authorized operation looks like. Used to calibrate detection.*

- Operator configures a source directory containing Praxen findings JSON files. Collector polls the directory, parses new findings, applies evidence allowlist to drop `raw_scan_payload` and `raw_telemetry` fields, normalizes records, and appends to governance history.
- Operator adds a new evidence source via the UI. The frontend displays a confirmation modal listing the source path and retention policy, requires explicit user confirmation, and only then calls `/api/v1/sources` with a valid CSRF token from the session cookie.
- UI displays asset details for a skill. The metadata includes language, installed platform, owner, modified date, and verification status; it does not include the skill prompt or runtime reasoning.
- A schema violation is detected in an imported Praxen findings JSON (missing required field). The record is logged to rejected-record summary (type and count only, never the content) and excluded from the registry. The operator sees a notification that "1 record from Praxen-source-123 failed validation — see logs for details" but not the failing record itself.
- Collector is restarted. Existing deduplicated evidence and governance history are recovered from local storage; sources are re-added from configuration; polling resumes.

---

## Example Bad Behavior

*Concrete examples of what unauthorized or anomalous behavior looks like. Used to calibrate detection.*

- A prompt or system message appears in a finding's `raw_payload` and is not redacted before storage — **Critical**
- An API endpoint `/api/v1/execute` accepts a command parameter and executes it on the host — **Critical**
- CSRF token validation is present but skipped when the request origin is localhost — **Critical**
- Credentials (API keys, tokens) are hardcoded in `collector-config.json` — **Critical**
- A source directory configured to `C:/` (filesystem root) and the collector reads arbitrary files — **High**
- Evidence retention policy is not enforced; the collector appends records indefinitely and eventually causes OOM — **Critical**
- The UI makes an HTTP request to an external service to resolve asset metadata (e.g., fetches skill description from GitHub) — **Critical**
- Session validation validates Origin header but not Host header (allows same-site cross-origin requests) — **High**
- A field is removed from the field allowlist (e.g., `raw_reasoning` supposed to be dropped), but the field is still included in the output — **High**
- Rejected records are logged with full content rather than type summary only — **Medium** (privacy leak)

---

## Open Questions for the operator

These questions remain un-derivable from existing documentation and require operator intent:

1. **Future authorization paths:** If the collector is deployed in a shared environment (e.g., multi-user workstation), should source-add/remove operations require a separate admin approval step, or is UI confirmation sufficient? (Currently assumes single operator, UI confirmation only.)
2. **Future cloud integration scope:** If a future version is planned to support cloud-hosted governance history (opt-in), should that capability be explicitly forbidden in this remit, or documented as an out-of-scope future feature?
3. **Future evidence encryption:** Should evidence stored in the collector-owned directory be encrypted at rest, or is filesystem-level ACLs sufficient for the local-only deployment model?

---

*Worker Remit — SancusSight Governance Registry | Version: 1.0 | 2026-07-21*
*Praxen Spec 005 T10 — Local Agent Governance Ledgers*
