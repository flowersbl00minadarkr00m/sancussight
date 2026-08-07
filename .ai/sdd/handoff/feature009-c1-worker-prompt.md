# Feature 009 C1 Correction Worker Prompt

Act as the one fresh visible top-level SDD correction worker for SancusSight
Feature 009 C1 only.

Canonical project: `C:\Users\henry\sancussight`.

Tracking owner and return task:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Resolve the project through the canonical registry first. Fully read
applicable `AGENTS.md`, installed `sdd-exec` instructions and required
references, `.ai/steering/`, Feature 009 `.status`, approved
requirements/design/tasks, `understanding.md`, `review-r1.md`, all relevant
T1–T4 handoffs, and `sdd-brief.md`.

Confirm R1 is authoritatively complete with Needs fixes and C1 is the sole
unblocked frontier. Before product edits, append `execution/C1.md` and
directly return:

`sancussight-009-C1-acknowledged-20260723-01`

Run in `orchestrated-worker` mode. The tracking orchestrator is the only
writer to `tasks.md`, `.status`, `.ai/sdd/INDEX.md`, `sdd-brief.md`, and the
shared understanding record.

Implement only the three R1 product corrections:

1. `R1-SPEC-001`: require an exact approved result-to-envelope relationship
   before an envelope can enter lineage. Asset co-reference or an asset
   evidence binding alone must never qualify an envelope as verified, stale,
   or conflicting evidence for a deterministic result. Preserve explicit
   missing or inferred behavior when exact qualification is absent.
2. `R1-SPEC-002`: introduce a deterministic, copy-independent per-result
   discriminator across projection, history snapshot, stream identity,
   record, read, dedupe, and retention. Same-family sibling results must have
   independent streams. Safely isolate legacy records whose stored shape lacks
   the discriminator; never silently attribute them to a current result.
3. `R1-SPEC-003`: render every bounded outgoing conflict relationship in
   stable order; do not collapse edges by source node.

Owned product/test surfaces:

- `src/types.ts`, only if required for the approved discriminator/history type
- `src/lib/check-catalog.ts`
- `src/lib/claim-lineage.ts`
- `src/lib/check-history-store.ts`
- `src/App.tsx`
- `src/components/CheckCatalog.tsx`
- `src/components/ClaimLineageInspector.tsx`
- focused non-overlapping Feature 009 tests under `src/lib/__tests__/`
- existing Feature 009 UI/static-contract test only if required
- `package.json` only if the existing `test:feature009` glob does not include
  new tests; no dependency change
- `execution/C1.md` and `execution/C1-handoff.md`

Do not edit package-lock.json, approved requirements/design, shared tracking,
review-r1.md, prior execution evidence, deployment/Vercel state, unrelated
product surfaces, Spec 005/T16R5/T16/A-002, commits, or pushes.

Required adversarial acceptance:

- unrelated same-asset envelopes cannot enter the selected result lineage or
  produce verified/stale/conflicting edges;
- an exact approved reference still produces the correct bounded lineage;
- two same-family sibling results have distinct stable result identities and
  history streams;
- repeated identical sibling evaluations dedupe independently;
- changed sibling results expose only their own prior distinct snapshot;
- per-stream/global retention remains bounded;
- legacy discriminator-less records are safely ignored or isolated and never
  shown as current/previous for a discriminator-bearing result;
- two conflicting observations render both relationship labels in stable
  order;
- no raw evidence, display copy, path, prompt, credential, or registry object
  enters history.

Run in order:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

Return exactly one terminal stable event:

- ready: `sancussight-009-C1-ready-20260723-01`
- blocked: `sancussight-009-C1-blocked-20260723-01`
- contract conflict:
  `sancussight-009-C1-contract-conflict-20260723-01`
- verification failed:
  `sancussight-009-C1-verification-failed-20260723-01`

Ready-for-review is only a recommendation. Include exact files, tests, command
results, affected contracts, limitations, and direct delivery receipt. Do not
mark C1 complete or dispatch C2.
