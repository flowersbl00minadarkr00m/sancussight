# Feature 011 T3 Worker Handoff

> Recommendation only. Authoritative completion belongs to tracking owner
> `019f914a-b672-77b1-837f-0c866b6421bb` after fresh reconciliation.

## Outcome

`truth_label: verified` — T3's isolated bounded preview store and one
Standards Interoperability workspace are implemented only within declared
owned surfaces. All required focused, regression, collector, compiler, core,
and production-build gates pass.

## Core Intuition

Feature 011 history is a convenience cache, not evidence truth. Transient local
files first pass the approved T1/T2 validators. Only fixed counts, stable reason
codes, safe SHA-256 hashes, and an optional Statement confirmation digest may
enter the dedicated Feature 011 database. A persistence failure leaves the
sanitized current result usable and is displayed as unavailable.

The UI extends the existing Advanced -> Evidence Sources interaction. One
conditional Standards workspace occupies the main content area while the
existing Evidence Sources rail remains adjacent and unchanged. It adds no
navigation destination and no alternate mobile DOM.

## Prior and New Behavior

- `truth_label: observed`; source: pre-edit inventory — no T3 store, workspace,
  or tests existed.
- `truth_label: implemented`; source:
  `src/lib/interoperability-store.ts` — exact validation, memory seam,
  IndexedDB repository, per-profile dedupe, 20/profile and 100/global
  retention, isolated clear, and unavailable results now exist.
- `truth_label: implemented`; source:
  `src/components/StandardsInteroperability.tsx` — local OpenLineage import,
  runtime-metadata alignment, validated Evidence Packet input, unsigned
  Statement download, bounded history, explicit state copy, and permanent
  limitations now share one local workspace.
- `truth_label: implemented`; source: `src/App.tsx` and `src/index.css` — the
  workspace is conditionally rendered from existing state, receives already
  accepted evidence, focuses its heading on entry, wraps long hashes, bounds
  table overflow, and stacks native controls on narrow screens.
- `truth_label: verified`; source: final T3 verification — Feature 011 27/27,
  Feature 010 31/31, Feature 009 24/24, Feature 008 6/6, collector 92/92,
  compiler 28/28, core verification, and the 1,845-module build pass.

## Invariants and Observable Consequences

- The snapshot validator accepts only the fixed profile/operation-compatible
  shape; extensions and unsafe hashes fail closed.
- Raw bytes, raw identifiers/facets, content, registry objects, paths, URLs,
  credentials, identity, prompts, responses, reasoning, tool payloads,
  documents, images, and hash preimages cannot enter stored snapshots.
- Equivalent previews deduplicate against the latest snapshot for the same
  profile even when another profile was recorded between them.
- Repository reads revalidate every shape; failure is `unavailable`, not empty
  success.
- Clear affects only the dedicated Feature 011 database.
- Missing telemetry, unsupported input, invalid packet, no history, unavailable
  persistence, and pending/success/failure actions are textual.
- Compatibility remains profile-qualified; no conformance, certification,
  evidence-truth, authenticated-provenance, aggregate score, or enforcement
  claim is introduced.

## Changed Files

- `src/lib/interoperability-store.ts`
- `src/components/StandardsInteroperability.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/lib/__tests__/feature011-interoperability-store.test.mjs`
- `src/lib/__tests__/feature011-standards-workspace.test.mjs`
- `.ai/sdd/specs/011-standards-interoperability/execution/T3.md`
- `.ai/sdd/specs/011-standards-interoperability/execution/T3-handoff.md`

## Verification Summary

| Command | Exit | Summary | Verdict |
|---|---:|---|---|
| `npm run test:feature011` | 0 | 27/27 passed | PASS |
| `npm run test:feature010` | 0 | 31/31 passed | PASS |
| `npm run test:feature009` | 0 | 24/24 passed | PASS |
| `npm run test:feature008` | 0 | 6/6 passed | PASS |
| `npm run test:collector` | 0 | 92/92 passed | PASS |
| `npm run test:registry-compiler` | 0 | 28/28 passed | PASS |
| `npm run verify:core` | 0 | Core assertions passed | PASS |
| `npm run build` | 0 | TypeScript and Vite build passed; 1,845 modules | PASS |
| scoped `git -c core.autocrlf=false diff --check` | 0 | Tracked and new T3 owned files clean | PASS |

## Privacy Negatives

Focused tests prove that hostile extensions, raw producer URLs, file bytes,
facets, registry objects, paths, credentials, identity, prompts, responses,
reasoning, tool payloads, unsafe hashes, network actions, aggregate scoring,
authentication features, runtime policy, and duplicate responsive DOM paths
cannot enter the store contract or T3 workspace behavior.

## Scope and Limitations

No T4–T5/R1 work, browser acceptance, deployment, package/dependency change,
shared tracking, T1/T2 implementation change, Evidence Sources behavior
rewrite, registry mutation, collector/compiler change, commit, push,
provider/Pi operation, or Spec 005/T16R5/T16/A-002 action was performed.

Actual file/download behavior, IndexedDB inspection, focus movement, 320 CSS
pixel behavior, effective 200% zoom, console, and network acceptance remain T4.
Standalone `sdd-understanding` was unavailable; high-burden As Built evidence
is included here and in `execution/T3.md` without editing orchestrator-owned
`understanding.md`.

## Return Contract

```yaml
return_channel:
  source_thread_id: 019f914a-b672-77b1-837f-0c866b6421bb
  worker_thread_id: 019f946b-9d1d-7e00-aeca-5a1226b2c0f4
  handoff_transport: durable-execution-record
  acknowledgment:
    state: delivered
    event_id: sancussight-011-T3-acknowledged-20260724-01
    receipt_evidence: send_message_to_thread returned the source task ID
  lifecycle_returns:
    receipt_state: durable-fallback
    last_event_id: sancussight-011-T3-ready-20260724-01
    receipt_evidence: Terminal event is preserved in execution/T3.md and this handoff before direct delivery.
```
