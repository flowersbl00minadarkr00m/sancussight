# Feature 012 C1 Worker Prompt

Act as the fresh visible top-level SancusSight Feature 012 C1 worker.

Canonical project: `C:\Users\henry\sancussight`

Tracking owner and direct return task:
`019f914a-b672-77b1-837f-0c866b6421bb`

Before any product/config/test edit:

1. Resolve SancusSight through the canonical project registry.
2. Read repository `AGENTS.md`, the installed `sdd-exec` skill, Feature 012
   `.status`, approved requirements/design/tasks, `understanding.md`,
   `review-r1.md`, `execution/R1.md`, and `.ai/sdd/handoff/sdd-brief.md`.
3. Confirm `implementation:in-progress`, R1 complete with needs-fixes, and C1
   as the sole unblocked frontier.
4. Append `execution/C1.md` and directly return stable acknowledgment event
   `sancussight-012-C1-acknowledged-20260724-01`.

## Exact Scope

Correct only:

- `R1-STANDARDS-001`: declare an explicit Tailwind/application source
  boundary, exclude generated evidence/output trees from candidate discovery,
  and add a durable deterministic check that enumerates every build-affecting
  source/config input and proves two clean builds remain byte-identical even
  when an adversarial Tailwind candidate is added outside the boundary.
- `R1-STANDARDS-002`: replace `SourceWriteStrip` message-prefix inference with
  an explicit typed supplementary operation phase owned by `App`.

Preserve all approved behavior and current copy. `RegistrySession` and
`ConnectionState` remain durable truth; `App` remains the sole save-feedback
owner; `sourceController.save(session)` remains the sole write path. Do not
introduce a new persistence model, dependency, route, schema, network action,
or product feature.

## Exact Owned Surfaces

- `src/index.css`
- `vite.config.ts` only if strictly required for the source boundary
- `src/App.tsx`
- `src/components/SourceWriteStrip.tsx`
- `src/types.ts` only for the bounded supplementary feedback phase
- one new deterministic Feature 012 build-input verification script under
  `scripts/`
- focused Feature 012 tests for these two findings
- `package.json` only for an additive verification command; no dependency
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C1.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C1-handoff.md`

All other surfaces are read-only. In particular, do not edit shared tracking,
requirements, design, `.status`, T1-T4/R1 evidence, package-lock, deployment,
Vercel configuration, Feature 013+, Spec 005/T16R5/T16/A-002, commits, pushes,
providers, or Pi.

## Acceptance

- Tailwind candidate discovery is limited to intended application inputs.
- Generated `output/`, `outputs/`, `.ai/`, browser evidence, and other
  unrelated dirty-tree files cannot influence the production bundle.
- The durable continuity verifier fails closed on missing/extra declared
  build inputs and proves two fresh builds are byte-identical.
- A hostile outside-boundary `.resize` candidate does not change bundle bytes.
- Pending presentation uses an explicit typed phase, never user-visible copy.
- Existing confirmation, permission, preflight, verified save, failure,
  recovery, disclosure, focus, responsive, route, footer, and privacy behavior
  remains unchanged.

Run in order:

```text
npm run test:feature012
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run test:collector
npm run test:registry-compiler
npm run verify:core
npm run build
the new deterministic two-build/adversarial continuity command
scoped git diff --check
```

Return exactly one stable terminal event:

- `sancussight-012-C1-ready-20260724-01`, or
- a stable blocked/conflict/verification-failed event.

Ready-for-review is a recommendation only. The orchestrator alone reconciles
completion and may open C2.
