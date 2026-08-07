# Idea: Context Gardener

> Status: idea:captured
> Created: 2026-07-26

## Raw Idea

Add a SancusSight capability that audits the layered instructions an AI agent
actually receives and conducts a safe maintenance review. The audit should find
stale context, broken references, duplicated or conflicting rules,
model-specific workarounds that have leaked into broader scope, and possible
misalignment between effective context and a human-confirmed statement of
intent.

The product metaphor is that an agent setup is not a stack configured once; it
is a garden that requires pruning as models, tools, projects, and user intent
change.

## Problem Space

- Root instructions, repository instructions, model-specific files, skills,
  memories, and temporary workarounds accumulate across an agent setup.
- Layering reduces repeated prompting but makes the effective context difficult
  to inspect.
- Individually reasonable rules can conflict, duplicate one another, shadow
  lower-authority instructions, or survive after their original need expires.
- File age alone cannot establish staleness, and a model cannot independently
  determine the owner's true intent.
- Automatic rewriting would turn a maintenance tool into an untrusted policy
  mutator.

## Target Users

- AI power users and builders working across multiple repositories, agents,
  models, skills, and context files.
- Governance-minded practitioners who want agent instructions to remain
  inspectable, evidence-qualified, portable, and recoverable.

## Current Alternatives

- Manual reviews of `AGENTS.md`, `CLAUDE.md`, skills, and related configuration.
- Repository linters that can validate syntax but do not reconstruct the
  effective instruction hierarchy.
- Model-authored context rewrites that can shorten instructions but do not
  reliably preserve authority, intent, provenance, or recovery.
- SancusSight's existing asset registry, lineage, versioning, and remediation
  surfaces, which do not currently scan selected context sources or propose
  context maintenance.

## Desired Outcome

For a selected project, directory, and agent, the user can see the effective
instruction hierarchy, understand where every applicable rule came from,
review deterministic configuration findings separately from semantic
hypotheses, and safely accept, reject, or defer proposed maintenance changes.

## Selected Direction

### Evidence-qualified context audit with reviewed maintenance proposals

- **Deterministic audit:** Inventory explicitly selected context sources;
  resolve scope and inheritance; detect broken references, exact duplication,
  direct contradictions, shadowed rules, missing dependencies, and unsupported
  model-specific scope.
- **Intent comparison:** Compare the effective context with a
  human-confirmed Intent Card. Treat semantic disagreement and possible drift
  as hypotheses requiring review, never as deterministic facts.
- **Maintenance review:** Propose a bounded patch with rationale, affected
  agents and sources, before/after effective-context preview, explicit
  confirmation, recovery copy, verified write, and post-write re-audit.
- **Recurring pruning:** Allow a rule or workaround to carry owner, rationale,
  supporting evidence, review-after date, and invalidation condition so later
  reviews have more than file age to assess.

## Product Boundaries

- **SancusSight owns:** deterministic context findings, provenance, source
  health, maintenance evidence, reviewed decisions, recovery, and verification.
- **Tristram or another intent source owns:** purpose, constraints,
  assumptions, and the human-confirmed Intent Card.
- **FindMnemo owns:** live work state, coordination, blockers, and loose ends.
- **Upstream agents and repositories own:** source files and execution.

## Constraints

- Local-first, explicitly scoped source access, and data minimization.
- No unrestricted repository upload and no raw prompt, response, reasoning,
  credential, or private-key collection.
- Deterministic findings, model hypotheses, human decisions, and verified
  changes remain distinct record classes.
- No automatic deletion, merging, rewriting, or policy mutation.
- Modification age alone does not establish staleness.
- Every proposed write requires an inspectable diff, fresh conflict check,
  explicit approval, recovery path, and post-write verification.
- Existing SancusSight approved features and statuses remain unchanged. This
  idea does not authorize requirements, design, tasks, implementation, or
  modification of current approved contracts.

## Signals of Value

- The user can explain exactly which context one agent receives in one
  directory and why.
- The audit finds at least one real, reviewable maintenance issue without
  manufacturing a generic readiness score.
- A user can remove or narrow a stale rule while preserving a recoverable
  version and verifying the resulting effective context.
- Cross-agent comparison reveals material context differences without treating
  vendor-specific behavior as universally applicable.
- Recurring audits reduce unsupported exceptions and broken references without
  silently increasing instruction volume.

## Risks

- Semantic analysis could overstate intent drift or encourage needless
  rewriting.
- A context scanner could collect sensitive or unrestricted workspace content.
- Broad automatic remediation would conflict with SancusSight's current
  read-only governance boundary.
- Optimizing for fewer tokens could remove necessary safety or domain context.
- Adding a second intent store would duplicate Tristram rather than integrate
  with it.

## Recommendation

- [ ] Continue exploration
- [x] Create REQUIREMENTS directly when explicitly authorized
- [ ] Add to the approved product plan
- [ ] Archive

**Reason:** The core outcome and safety boundary are clear enough for a focused
future feature, but implementation would materially expand SancusSight beyond
its current upstream-scanning and policy-mutation exclusions. Requirements must
define the selected-source boundary, effective-context resolution rules,
Intent Card authority, deterministic check catalog, proposal/write safeguards,
and relationship to existing Features 003, 009, 010, 012, 013, and 016.

## Sources

- User product direction and screenshot supplied on 2026-07-26.
- `.ai/steering/product.md`
- `.ai/steering/tech-stack.md`
- `.ai/steering/conventions.md`
- `.ai/sdd/specs/003-persistent-local-file-connector/requirements.md`
- `.ai/sdd/specs/009-claim-lineage-check-catalog/requirements.md`
- `.ai/sdd/specs/010-asset-versioning-evidence-packets/requirements.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/requirements.md`
- `.ai/sdd/specs/016-byok-remediation-coach/requirements.md`

