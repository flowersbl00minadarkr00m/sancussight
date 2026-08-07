# Feature 011 T1 Worker Handoff

> Recommendation only. Authoritative completion belongs to tracking owner `019f914a-b672-77b1-837f-0c866b6421bb` after fresh reconciliation.

## Outcome

`truth_label: verified` — T1's pinned profile registry and bounded metadata-only OpenLineage RunEvent projection are implemented within the declared owned surfaces. All required focused, regression, core, build, and scoped diff gates pass.

## Core Intuition

The parser treats an OpenLineage file as untrusted transient input, not as SancusSight evidence. Each record must match one deliberately narrow RunEvent core profile. The implementation then retains only canonical time/type/count metadata and domain-separated hashes. Facets are acknowledged by fixed omission codes, but their values are never dereferenced, copied, returned, logged, persisted, or used as hash preimages.

## Prior and New Behavior

- `truth_label: observed`; source: pre-dispatch file inventory — no Feature 011 runtime profile or OpenLineage module existed.
- `truth_label: implemented`; source: `src/lib/standards-profiles.ts` — four exact immutable descriptors now pin OpenLineage, OpenTelemetry, OpenInference, and the SancusSight in-toto projection boundary.
- `truth_label: implemented`; source: `src/lib/openlineage-import.ts` — local JSON/JSONL text now produces either a fixed file-level failure or a sanitized, record-isolated preview.
- `truth_label: verified`; source: `npm run test:feature011` — mixed malformed/unknown/supported input keeps safe records and reports stable reason counts without echoing rejected content.

## Invariants and Observable Consequences

- Inputs above 1 MiB, byte-length mismatches, more than 500 records, empty input, and invalid import time fail before a preview is returned.
- JSONL framing rejects more than 500 non-empty lines before parsing or hashing individual lines.
- Unknown top-level/run/job/dataset keys, schema URLs, event types, and invalid core containers fail closed per record.
- Supported event times normalize to canonical UTC millisecond timestamps.
- Output arrays and reason counts are stable-sorted.
- A repeated raw value in different identity roles produces different hashes.
- No raw producer/schema/run/job/dataset value or facet content appears in returned shapes.
- No rejected record creates SancusSight evidence, governance state, lineage, version, check result, or verification claim.

## Edge Cases

- Facets on run, job, input datasets, and output datasets produce one omission count per whole facet container.
- Hash implementation failure isolates the affected record with `hash-failed`.
- Credential-bearing producer URLs are rejected before hashing.
- A JSON array above 500 is necessarily materialized by native `JSON.parse`, then rejected before validation/hashing; the independent 1 MiB file cap remains in force.

## Changed Files

- `src/types.ts`
- `src/lib/standards-profiles.ts`
- `src/lib/openlineage-import.ts`
- `src/lib/__tests__/feature011-openlineage.test.mjs`
- `package.json`
- `.ai/sdd/specs/011-standards-interoperability/execution/T1.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T1-handoff.md`

`package-lock.json` was not changed by T1.

## Verification Summary

| Command | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature011` | 0 | 7/7 passed | PASS |
| `npm run test:feature010` | 0 | 31/31 passed | PASS |
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run verify:core` | 0 | Core assertions passed | PASS |
| `npm run build` | 0 | Collector/frontend TypeScript and Vite production build passed | PASS |
| scoped `git -c core.autocrlf=false diff --check` | 0 | No whitespace errors | PASS |

## Privacy Negatives

Fresh focused tests prove absence of raw producer URL, pinned input schema URL, run UUID, job namespace/name, input/output dataset namespace/name, hostile nested facet values, unknown-key values, credential-bearing producer URLs, and invalid hash output from every returned shape.

## Scope and Limitations

No T2-T5/R1 behavior, IndexedDB, UI, telemetry alignment, Statement export, policy runtime, dependency, network ingestion, deployment, shared tracking, commit, push, provider/Pi operation, or Spec 005/T16R5/T16/A-002 action was added.

## Return Contract

```yaml
return_channel:
  source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
  worker_thread_id: 019f944b-ca85-7f80-bd23-f42218249ff5
  handoff_transport: direct-message
  acknowledgment:
    state: delivered
    event_id: sancussight-011-T1-acknowledged-20260724-01
    receipt_evidence: codex_app send_message_to_thread returned the source thread ID
  lifecycle_returns:
    receipt_state: delivered
    last_event_id: sancussight-011-T1-ready-20260724-01
    receipt_evidence: codex_app send_message_to_thread returned the source thread ID
```
