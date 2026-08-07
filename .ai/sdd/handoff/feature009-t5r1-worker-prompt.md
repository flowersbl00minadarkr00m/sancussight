# Feature 009 T5R1 Worker Prompt

Act as the single fresh visible top-level SDD implementation worker for
SancusSight Feature 009 task T5R1 only.

Canonical project: `C:\Users\henry\sancussight`.

Tracking owner and return task:
`019f914a-b672-77b1-837f-0c866b6421bb`.

Before editing, resolve SancusSight through the canonical project registry and
fully read:

- `.ai/steering/`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/.status`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/design.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/tasks.md`, especially T5R1
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5-handoff.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5-hosted-report.md`
- `.ai/sdd/handoff/sdd-brief.md`
- `package.json`
- the current `package-lock.json`

Run in `orchestrated-worker` mode. The orchestrator remains the only writer to
`tasks.md`, `.status`, `.ai/sdd/INDEX.md`, and `sdd-brief.md`.

Before any product or package edit, append
`execution/T5R1.md` and directly return this stable acknowledgment:

`sancussight-009-T5R1-acknowledged-20260723-01`

Your bounded owned surfaces are only:

- `package-lock.json`, and only the root
  `packages[""].engines.node = ">=24.0.0"` metadata already added by the
  failed T5 Vercel prebuild
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5R1.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5R1-handoff.md`

Do not rewrite, normalize, remove, or claim ownership of any other
`package-lock.json` content. The lockfile had extensive pre-existing dirty
content that belongs to the operator. Do not edit `package.json`, product
source, tests, shared tracking, Vercel state, deployment state, providers,
Spec 005/T16R5/T16/A-002, commits, or pushes.

The failed T5 evidence records:

- prebuild lockfile SHA-256:
  `23D8F8162A850664FB3006D4CABF05717CECEC25248961A1B9CA55F8E1FC1513`
- current lockfile SHA-256 after Vercel synchronization:
  `6A8310FC75E9C963769A7E6DC890DF440731003ACE2FE8100001D1EB7C32AAF9`
- removing only the current root engines block in memory reproduces the
  prebuild lockfile hash exactly
- `package.json` already declares `"node": ">=24.0.0"`
- no production deploy occurred

Required work:

1. Independently reproduce the attribution proof without modifying the file:
   removing only the current root engines block in memory must reproduce the
   recorded prebuild lockfile hash.
2. Prove the current root lockfile engine value exactly matches
   `package.json`.
3. Record the current lockfile byte hash.
4. Run `npm install --package-lock-only --ignore-scripts`.
5. Recompute the lockfile hash. It must be byte-identical to the pre-command
   current hash. If it changes at all, stop immediately without attempting a
   revert or broad repair and return one stable verification-failed event.
6. Run, in order:
   - `npm run test:feature009`
   - `npm run test:feature008`
   - `npm run verify:core`
   - `npm run build`
   - scoped whitespace checks covering the owned lockfile delta and both
     worker evidence files
7. Record the accepted post-reconciliation lockfile SHA-256 for T5R2.

Return exactly one terminal stable event:

- ready: `sancussight-009-T5R1-ready-20260723-01`
- blocked: `sancussight-009-T5R1-blocked-20260723-01`
- contract conflict:
  `sancussight-009-T5R1-contract-conflict-20260723-01`
- verification failed:
  `sancussight-009-T5R1-verification-failed-20260723-01`

Include commands, exit codes, hashes, files, affected contract, and requested
tracking-owner action. Ready-for-review is only a recommendation; do not mark
T5R1 complete. Deliver directly to the tracking task and durably record the
delivery receipt in both worker evidence files.
