# Feature 011 T2 Worker Handoff

> Recommendation only. Authoritative completion belongs to tracking owner
> `019f914a-b672-77b1-837f-0c866b6421bb` after fresh reconciliation.

## Outcome

`truth_label: verified` — T2's profile-qualified telemetry alignment and
unsigned in-toto Statement v1 seams are implemented only within declared owned
surfaces. The public predicate schema and adversarial tests are present. All
required focused, regression, core, build, and scoped whitespace gates pass.

## Core Intuition

Alignment begins from accepted SancusSight runtime evidence, not raw telemetry.
It rechecks the collector's fixed attribute contract, maps only bounded
metadata, and makes prohibited content visible as valueless
`omitted-private` rows. The Statement path begins from a Feature 010 packet
whose exact shape and packet digest have already been revalidated. It then
copies only the packet digest, subject kind, qualification, and bounded counts
into an exact unsigned predicate.

## Prior and New Behavior

- `truth_label: observed`; source: pre-edit owned-path inventory — no T2
  telemetry-alignment, Statement, public schema, or focused tests existed.
- `truth_label: implemented`; source: `src/lib/telemetry-alignment.ts` — two
  pinned profile previews now report `aligned`, `omitted-private`,
  `unsupported`, `missing`, and `not-applicable` rows in deterministic order.
- `truth_label: implemented`; source: `src/lib/in-toto-statement.ts` — validated
  packets now produce the official Statement v1 `_type`, one hashed subject,
  the approved custom predicate type, exact predicate shape, canonical JSON,
  and a separate confirmation digest.
- `truth_label: implemented`; source:
  `public/spec/evidence-packet-interoperability-v1.schema.json` — the canonical
  public path now publishes the exact custom predicate contract.
- `truth_label: verified`; source: `npm run test:feature011` — `17/17` focused
  tests pass, including T1 regressions.

## Invariants and Observable Consequences

- No raw OTLP input, spans, trace relationships, or standard payload is
  created.
- No raw subject/source-record identifier, artifact name, summary, prompt,
  response, reasoning, tool payload, document, image, URL, credential, or user
  identity enters an alignment value.
- Every row identifies profile, state, source field, target field, and
  limitation.
- Unknown safe event families remain unsupported; unknown profiles fail closed.
- Statement creation fails before output on invalid/tampered/unsafe packets,
  unknown profile or predicate type, invalid digest, or unavailable crypto.
- Exact Statement validation rejects extensions, subject/predicate digest
  mismatch, and any truth value other than `unsigned: true` and
  `externallyVerified: false`.
- Download accepts the successful validated build projection, revalidates
  canonical bytes and digest, revokes its object URL, and returns no success
  claim when capability or click fails.

## Changed Files

- `src/lib/telemetry-alignment.ts`
- `src/lib/in-toto-statement.ts`
- `public/spec/evidence-packet-interoperability-v1.schema.json`
- `src/lib/__tests__/feature011-telemetry-alignment.test.mjs`
- `src/lib/__tests__/feature011-in-toto-statement.test.mjs`
- `.ai/sdd/specs/011-standards-interoperability/execution/T2.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T2-handoff.md`

## Verification Summary

| Command | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature011` | 0 | 17/17 passed | PASS |
| `npm run test:feature010` | 0 | 31/31 passed | PASS |
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run verify:core` | 0 | Core assertions passed | PASS |
| `npm run build` | 0 | Collector/frontend TypeScript and Vite build passed | PASS |
| scoped `git -c core.autocrlf=false diff --check` | 0 | No whitespace errors | PASS |

## Privacy Negatives

Focused tests prove that hostile prompt/tool-argument values, raw envelope
identity fields, artifact names, summaries, packet workflow/asset names,
unknown extensions, and digest preimages do not enter returned alignment or
Statement shapes. Schema tests prove that signature, DSSE, certificate, key,
identity, transparency-log, and external-verifier properties are absent.

## Scope and Limitations

This is structural, pinned-profile metadata compatibility only. It is not
OpenTelemetry/OpenInference conformance, certification, telemetry emission, a
signed attestation, authenticated provenance, or external verification. No
T3–T5/R1 behavior, IndexedDB, UI/CSS/store, runtime dependency, network action,
governance mutation, policy runtime, score, package change, shared tracking,
commit, push, deployment, provider/Pi action, or Spec 005 action was added.

The high-burden As Built explanation is included here and in `execution/T2.md`.
Standalone `sdd-understanding` was unavailable in this session, and the worker
correctly left orchestrator-owned `understanding.md` untouched.

## Return Contract

```yaml
return_channel:
  source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
  worker_thread_id: 019f945b-11d6-7d61-a046-c597cc1aea2e
  handoff_transport: direct-message
  acknowledgment:
    state: delivered
    event_id: sancussight-011-T2-acknowledged-20260724-01
    receipt_evidence: send_message_to_thread returned the source task ID
  lifecycle_returns:
    receipt_state: delivered
    last_event_id: sancussight-011-T2-ready-20260724-01
    receipt_evidence: send_message_to_thread returned source task 019f914a-b672-77b1-837f-0c866b6421bb.
```
