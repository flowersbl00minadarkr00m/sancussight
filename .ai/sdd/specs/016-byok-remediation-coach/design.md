# Design: BYOK Remediation Coach

> Requirements: `@requirements.md`
> Status: Approved

## 1. Summary

Add a local-companion-only provider connection service and a proposal-only
remediation planning workspace. The browser manages non-secret connection
metadata through the existing loopback session/CSRF boundary. The collector
stores secrets in Windows Credential Manager through a fixed, audited local
helper and sends bounded requests with Node's built-in HTTP client.

The first wire adapter is OpenAI-compatible chat completions. Native provider
profiles are prefilled, validated instances of that adapter; custom endpoints
use the same contract. Model discovery is optional and bounded. A planning
request is created only after the user reviews the exact allowlisted finding
payload. Strict local validation turns model JSON into a versioned proposed
plan; invalid output never mutates findings or prior plans.

## 2. Requirements Mapping

| Requirements | Design coverage |
|---|---|
| FR-001–FR-005 | Local-only connections, secret store, validation, models in §§3–7 |
| FR-006–FR-009 | Payload review, plan validation, decisions, no execution in §§8–10 |
| FR-010–FR-012 | Limits, deterministic fallback, sanitized export in §§9–11 |
| NFR-001–NFR-002 | Credential and egress boundaries in §§4, 8, 12 |
| NFR-003–NFR-005 | Truth, failure isolation, accessible UX in §§9–13 |

## 3. Architecture

```text
browser Remediation Coach
  -> existing loopback session + CSRF
  -> ProviderConnectionService
       -> ConnectionConfigStore (non-secret JSON)
       -> SecretStore (Windows Credential Manager)
       -> OpenAICompatibleAdapter (Node fetch)
  -> RemediationPlanService
       -> PayloadBuilder
       -> PlanValidator
       -> append-only PlanStore
```

Hosted/manual mode does not construct a provider client and renders a local-
mode requirement plus the deterministic plan template.

## 4. Credential Storage

Define:

```ts
interface SecretStore {
  put(reference: string, secret: Uint8Array): Promise<void>
  withSecret<T>(reference: string, use: (secret: Uint8Array) => Promise<T>): Promise<T>
  delete(reference: string): Promise<void>
}
```

The API deliberately has no `get` method returning a long-lived string.
`withSecret` zeroes its local byte buffer in `finally`.

The first implementation is `WindowsCredentialStore`. It launches one fixed
repository-owned PowerShell helper that P/Invokes `CredWriteW`, `CredReadW`,
and `CredDeleteW`. Operation, credential target, and secret are passed through
standard input; secrets never appear in command arguments, environment
variables, files, logs, or process titles. The helper returns only status for
write/delete. Read returns secret bytes only to the collector process and is
never exposed by an HTTP response.

The target name is `SancusSight/BYOK/<connection-id>`. The helper path and
operation are not user-controlled. If Windows Credential Manager is
unavailable, saving fails closed; there is no plaintext fallback. Other
operating systems require later `SecretStore` implementations and cannot
enable BYOK in this release.

## 5. Connection Contracts and Storage

```ts
interface ProviderConnectionV1 {
  schemaVersion: 1
  id: string
  label: string
  providerType: 'openai' | 'deepseek' | 'moonshot' | 'custom-openai-compatible'
  baseUrl: string
  authType: 'bearer'
  wireProtocol: 'openai-chat-completions'
  credentialRef: string
  enabled: boolean
  validation: {
    state: 'untested' | 'valid' | 'invalid' | 'unavailable'
    testedAt?: string
    safeCode?: string
  }
  allowedModelIds: string[]
}
```

`ByokConfigStore` uses the existing atomic JSON pattern and file permissions
under the collector data directory. It validates HTTPS for remote hosts.
Loopback HTTP is allowed only for custom local endpoints. Private-network
non-loopback endpoints require explicit later design; redirects are disabled.

Updating a key writes the new credential first, validates it, atomically
updates metadata, then deletes the old reference. Deleting a connection removes
the credential first; failed deletion leaves the metadata disabled with a
recovery diagnostic.

## 6. Provider Adapter

Use Node 24 `fetch` and `AbortController`; add no provider SDK.

```ts
interface PlanningProvider {
  test(connection, secret): Promise<ConnectionTestResult>
  listModels(connection, secret): Promise<ModelDiscoveryResult>
  generate(connection, secret, request, signal): Promise<unknown>
}
```

Provider profiles only prefill an approved base URL and safe display copy.
They do not imply capability, price, retention, or trust.

Connection validation performs a bounded `/v1/models` request when supported.
If discovery is unsupported but authentication/endpoint reachability can be
established safely, the user may enter an explicit model ID and run a minimal
non-streaming planning-schema compatibility test before enablement. Returned
model lists are capped and filtered to bounded IDs.

## 7. Local API

All mutation routes reuse origin, cookie session, CSRF, JSON size, and safe
error handling:

```text
GET    /api/v1/byok/connections
POST   /api/v1/byok/connections/test
POST   /api/v1/byok/connections
POST   /api/v1/byok/connections/:id/models
PATCH  /api/v1/byok/connections/:id
DELETE /api/v1/byok/connections/:id

POST   /api/v1/remediation/payload-preview
POST   /api/v1/remediation/requests
DELETE /api/v1/remediation/requests/:id
GET    /api/v1/remediation/requests/:id
GET    /api/v1/remediation/plans
POST   /api/v1/remediation/plans/:id/decisions
```

No response includes a credential, authorization header, raw provider body, or
unbounded provider error. Safe codes distinguish auth, endpoint, rate-limit,
timeout, cancellation, incompatible-response, secret-store, and network.

## 8. Payload Builder and Confirmation

`PayloadBuilder` accepts selected finding IDs and optional field exclusions. It
resolves current deterministic findings locally and emits only:

- finding ID, title, severity, safe category, recorded status;
- bounded affected asset IDs and safe labels;
- safe finding rationale and missing-evidence labels;
- requested plan constraints and user-selected owner label.

It rejects extra object keys and prohibited tokens. Preview returns canonical
JSON plus SHA-256 digest. Request creation requires the same digest, provider
connection, model ID, and explicit confirmation; the service rebuilds the
payload and rejects drift.

The UI displays every transmitted field/value, provider, model, endpoint host,
configured limits, and a link/recorded note for provider retention policy.

## 9. Request Lifecycle and Plan Validation

Persist bounded request state:

`queued -> running -> completed | failed | cancelled | rate-limited`.

Enforce one active request, timeout, zero or one retry for retry-safe failures,
and configured output-token maximum. Cancellation aborts the fetch and records
only safe lifecycle metadata.

The model is instructed to return JSON matching `RemediationPlanProposalV1`.
Local validation requires plan ID, source finding IDs, ordered steps,
dependencies, owner/owner-needed, verification, rollback, uncertainty, and
missing evidence. Unknown keys, oversized strings/arrays, invalid references,
cycles, or execution/tool fields reject the whole response. No automatic
repair call occurs in v1.

Valid output becomes an append-only plan version labelled `proposed` with
provider, model, time, request ID, payload digest, and validator version.

## 10. Human Decisions and No-execution Boundary

Human decisions are separate append-only records:

```ts
interface PlanStepDecisionV1 {
  planId: string
  planVersion: number
  stepId: string
  decision: 'accepted' | 'edited' | 'rejected' | 'archived'
  recordedAt: string
  replacementText?: string
}
```

Accepted means approved for planning, never complete. The plan UI contains no
run, apply, install, fix, scan, tool-call, evidence-acceptance, risk-acceptance,
or finding-close action. Verification must enter through existing evidence and
human governance flows.

## 11. Deterministic Fallback and Export

The non-AI fallback creates a local plan skeleton from the same selected
finding references with empty owner, ordered step, verification, and rollback
fields. It is labelled `human-template`, not model-generated.

Sanitized export includes plan versions, source finding IDs, proposed content,
and human decisions. It excludes connection metadata beyond provider/model
labels, endpoints, credentials, raw responses, local paths, raw evidence, and
request diagnostics.

## 12. UI

Add a Remediation Coach workspace reachable from Queue/findings:

1. Select findings.
2. Choose or add a provider connection.
3. Choose/discover/enter model.
4. Review exact payload and limits.
5. Generate or use deterministic template.
6. Review plan by step; edit/accept/reject/archive.

Connection secrets are enter-once fields with reveal-while-entering. Saved
connections show `Stored in Windows Credential Manager`, last test, model
allowlist, and Replace/Delete—not the secret.

## 13. Files

```text
collector/byok/contracts.ts                 new
collector/byok/config-store.ts              new
collector/byok/secret-store.ts              new
collector/byok/windows-credential-store.ts  new
collector/byok/windows-credential.ps1       new fixed helper
collector/byok/provider.ts                  new
collector/remediation/payload.ts            new
collector/remediation/plan-store.ts         new
collector/remediation/service.ts            new
collector/server.ts
src/lib/byok-client.ts                      new
src/components/RemediationCoach.tsx         new
src/types.ts
collector/__tests__/byok-*.test.ts
src/lib/__tests__/feature016-*.test.mjs
```

## 14. Technical Decisions

- **TD-001:** BYOK is local-companion-only; hosted mode cannot meet secret
  custody requirements.
- **TD-002:** Use a fixed Windows Credential Manager helper through stdin.
  This meets OS-store custody without an npm native dependency or plaintext
  fallback.
- **TD-003:** Native profiles share one OpenAI-compatible adapter. Provider
  additions remain data-first while incompatible wire protocols require a
  separate reviewed adapter.
- **TD-004:** Payload digest confirmation prevents stale preview/transmission
  mismatch.
- **TD-005:** Strict reject-only plan parsing avoids silently “repairing” model
  output into apparent authority.
- **TD-006:** Plan decisions are append-only and completion remains outside
  the coach.

## 15. Verification

- Secret-store tests with an injected fake plus Windows integration checks:
  no secret in config, args, env, logs, HTTP, or exports; replace/delete
  lifecycle; fail-closed behavior.
- Server tests for session/CSRF/origin, HTTPS/loopback URL policy, redirects,
  body limits, safe errors, model caps, timeout/retry/cancel, and concurrency.
- Payload tests for exact allowlist, digest drift, prohibited fields, and
  selected-finding isolation.
- Plan tests for schema bounds, cycles, references, versioning, decisions,
  invalid-response immutability, and sanitized export.
- Browser tests for hosted disabled state, enter-once key UX, payload review,
  generation lifecycle, keyboard/focus, 320px/200%, and no execution controls.
- Run `npm run test:collector`, `npm run verify:core`, and `npm run build`.

## 16. Risks

| Risk | Mitigation |
|---|---|
| Helper leaks or mishandles secrets | Fixed path/operation, stdin only, safe output, integration tests |
| Compatible APIs differ | Explicit wire protocol, test-before-enable, manual IDs, safe failures |
| Model output appears authoritative | Proposed labels, strict schema, separate human decisions |
| Sensitive finding data leaves machine | Exact allowlist preview and digest confirmation |
| Cost runs away | One active request, token/timeout/retry limits, cancellation |
| Provider policy is misunderstood | External-policy qualification, no SancusSight guarantee |
