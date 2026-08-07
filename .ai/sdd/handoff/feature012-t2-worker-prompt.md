# Feature 012 T2 Worker Handoff

You are a fresh visible top-level Codex worker for SancusSight Feature 012
task T2 only. Work in orchestrated-worker mode.

## Resolve and Read Before Editing

1. Resolve `SancusSight` through:
   `python "C:\Users\henry\Vaults\LLM Wiki\system\projects\project_registry.py" resolve "SancusSight" --json`
2. Work only in the returned canonical project.
3. Fully read repository `AGENTS.md`, applicable `.ai/steering/`, the installed
   `sdd-exec` skill, Feature 012 `.status`, `requirements.md`, `design.md`,
   `tasks.md` T2, `understanding.md`, this handoff, `sdd-brief.md`, and
   `execution/T1-handoff.md`.
4. Inspect the dirty tree and preserve every unrelated change.

## Authority

- Tracking owner: orchestrator task
  `019f914a-b672-77b1-837f-0c866b6421bb`.
- Gate: `implementation:in-progress`.
- T1 is authoritatively complete.
- T2 is the sole unblocked frontier.
- Before product edits, append `execution/T2.md` and directly return stable
  event `sancussight-012-T2-acknowledged-20260724-01` to the tracking owner.
- Ready-for-review is a recommendation only. Do not edit shared tracking.

## Exact Scope

Implement only native Asset Passport disclosures:

- Convert the six existing Passport section wrappers to native
  `<details>/<summary>`.
- Summary is open by default for each newly selected asset.
- Portability, Dependencies, Evidence, Decisions, and History are closed by
  default for each newly selected asset.
- Use stable asset-qualified React keys for all six disclosure instances so a
  changed selected asset resets defaults while unrelated rerenders, save
  feedback, and version recording preserve the user's native open state.
- Preserve every existing section's content and callbacks exactly, including
  bindings under Evidence and version/alias/packet/history controls under
  History.
- Add a visible chevron/marker, visible focus treatment, wrapping, and bounded
  internal overflow. Preserve native keyboard and assistive semantics.
- Preserve the one-DOM responsive implementation, selected-row association,
  narrow focus entry and Back restoration, routes, footer, and T1 strip.
- Add focused, non-overlapping Feature 012 disclosure tests.

## Owned Surfaces

- `src/components/Registry.tsx`
- `src/components/AssetVersionHistory.tsx` only if strictly required to
  preserve History content ownership; no behavior rewrite
- Feature 012 disclosure selectors in `src/index.css`
- focused non-overlapping Feature 012 disclosure tests under
  `src/lib/__tests__/`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T2.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/T2-handoff.md`

Do not edit App, Header, SourceWriteStrip, package metadata, requirements,
design, tasks, status, INDEX, sdd-brief, understanding, prior execution
evidence, deployment, Vercel, commits, pushes, providers, Pi, or any Spec 005,
T16R5, T16, or A-002 surface.

## Acceptance

- Exactly six section identities exist once in the selected Passport DOM.
- Native details/summary keyboard and assistive semantics are retained.
- Summary starts open and the other five sections start closed.
- User-open state survives unrelated rerenders and T1 save feedback.
- A newly selected asset resets all six approved defaults.
- All pre-existing content and callbacks remain under their correct section.
- No duplicated responsive DOM, new persistence, state machine, dependency,
  route, network behavior, or schema change is introduced.

## Verification

Run in order:

```text
npm run test:feature012
npm run test:feature011
npm run test:feature010
npm run test:feature009
npm run test:feature008
npm run verify:core
npm run build
scoped git diff --check over every owned file
```

Return exactly one stable terminal lifecycle event:
`sancussight-012-T2-ready-20260724-01`, or one stable blocked/conflict/failure
event. Include exact commands, exit codes, changed files, acceptance evidence,
limitations, affected contracts, and direct-delivery receipt. Do not begin T3.
