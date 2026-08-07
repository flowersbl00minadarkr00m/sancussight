# Feature 009 T4 Fresh Visible Worker Prompt

Act as the one fresh visible top-level Feature 009 T4 browser-acceptance worker
for SancusSight in orchestrated-worker mode. Canonical project is
`C:\Users\henry\sancussight`. Resolve it first through:

```powershell
python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve SancusSight --json
```

Work only in the returned canonical path. Tracking owner and return target is
visible orchestrator task `019f914a-b672-77b1-837f-0c866b6421bb`. No other T4
worker is authorized. Do not delegate or create another worker.

Before any product edit, fully read applicable `AGENTS.md`, installed
`sdd-exec` instructions and required orchestration references, all steering
files, Feature 009 `.status`, approved requirements/design/tasks T4,
`understanding.md`, `sdd-brief.md`, and completed T1-T3 handoffs. Confirm
`.status` is `implementation:in-progress`, T1-T3 are authoritatively complete,
and T4 is the sole unblocked frontier. Send stable event
`sancussight-009-T4-acknowledged-20260723-01` to the tracking task before any
product edit.

Execute only T4: integrated local actual-browser acceptance and bounded
contract-preserving corrections. Use a local Vite build/server and real
Chromium. Do not use the production URL. Read all completed T1-T3 product
surfaces. Correction writes are allowed only within completed T1-T3 owned
product/test surfaces, and only when an approved browser acceptance criterion
fails. Own only:

- any required bounded correction within completed T1-T3 surfaces;
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T4.md`;
- `execution/T4-handoff.md`;
- `execution/T4-browser-report.md`;
- browser evidence under `execution/T4-browser/`.

Do not edit shared tracking (`tasks.md`, `.status`, `INDEX.md`, `sdd-brief.md`),
T1-T3 evidence, T5 files, package/dependency files unless a concrete approved
acceptance failure makes that unavoidable and you first return a contract
conflict, unrelated dirty files, deployment, commits, pushes, providers, Pi,
or Spec 005/T16R5/T16/A-002.

Required real-browser scenarios:

1. definition search and definition-only detail;
2. non-passing asset result with exact rule, remediation, and invalidation;
3. Asset Passport -> exact check detail -> canonical Asset Passport;
4. no previous result, then a bounded changed result showing previous
   metadata;
5. identical repeated result dedupe;
6. uncataloged observation;
7. verified, missing, inferred, stale, and conflicting relationship states;
8. adjacent desktop list/detail geometry;
9. narrow mutually exclusive list/detail, focus entry, useful Back restoration,
   320 CSS pixels, 200% zoom, and no page-level horizontal overflow;
10. history-store unavailable fallback;
11. IndexedDB inspection proving only the approved six snapshot fields and no
    raw registry/evidence content or scope/evidence preimage;
12. zero unexpected Feature 009 request, console error, or warning.

Record steps, viewport/zoom, selected and focused elements, bounding geometry,
overflow measurements, storage database/store/key and field names (never
private seeded content), network observations, console observations, and
screenshots. Use only synthetic demo/local test data.

After any bounded correction, rerun the affected scenario and all regressions.
Run the full gate in this order:

```text
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
scoped git diff --check
```

Return exactly one stable
`sancussight-009-T4-ready-20260723-01` ready-for-review recommendation or one
stable blocked/contract-conflict/verification-failed event. Actual completion
belongs to the tracking orchestrator. Do not deploy or claim T5/hosted
acceptance.
