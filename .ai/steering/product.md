# Product Steering — SancusSight

## Product Vision

**Trust made observable** — a local-first governance tool that maintains a
registry of all your AI-related assets, helps you *build* that registry by
scanning your local environment rather than requiring manual entry, and
scans the registered assets for issues — surfacing them for you to fix
rather than silently tracking them. It shows which of your AI context,
skills, workflows and controls are shared, portable and owned — and flags
what is rented.

Inspiration for the scanning/diagnosis layer is drawn from the SRE-agent
category (see `.ai/sdd/ideas/004-sre-inspired-detection-rca-remediation.md`
for the sourced comparison, including Cleric and the broader
`last9/awesome-sre-agents` list): detect an issue, investigate it, explain
root cause, and — only with the user's own BYOK model and explicit review —
suggest remediation. SancusSight is not becoming an infrastructure SRE tool;
the borrowed shape is alert → investigation → explanation →
approval-gated suggestion, applied to AI-asset governance findings instead
of production infrastructure incidents.

## Target Users / Personas

- **AI-power-user / builder:** Has accumulated skills, prompts, context files, and workflows across multiple AI tools. Needs to know what is portable vs. locked in.
- **Tool evaluator:** Comparing AI platforms on lock-in risk, not just features
- **Governance-minded practitioner:** Wants evidence of portability, not claims

## Value Proposition

Five dimension cards (context, skills, continuity, controls, evidence) plus open flags; a coverage matrix with verified/stale/unverified/not-shared status; an exit test; a remediation queue; and a five-ledger governance view with evidence-backed lineage.

## Product Boundaries

### In Scope

- Overview: five dimension cards and open flags
- Registry: coverage matrix with asset detail and signals
- Definitions: shared vs. non-shared taxonomy with portability criteria
- Exit Test: workflow substitution drill
- Queue: remediation queue with owners and required actions
- Activity: agent activity log with JSONL import
- Governance: inventory, activity, controls, decisions, outcomes, and lineage over bounded evidence
- Local collector: read-only source polling and append-only SancusSight governance history for explicitly configured producer artifacts
- Asset kinds: skills, memory-architecture, prompt-template, intent-context, specification-files
- `sharedByDesign` field: distinguishes design intent from verified coverage

- Root-cause analysis and remediation suggestions for governance findings,
  via the user's own BYOK model connection (extends the advisory posture
  already approved for Spec 016's Remediation Coach) — see idea 004
- Optionally creating a FindMnemo ticket from a surfaced finding, so a
  finding that needs tracked follow-up lives in FindMnemo's ticketing
  system rather than SancusSight building a second, competing ticket/queue
  concept — see idea 004

### Out of Scope

- Automated migration (identifies risk, does not move assets)
- Upstream execution, installation, scanning, blocking, or policy mutation
- Cloud sync or hosted ingestion of local collector data
- Raw prompt/response/reasoning retention, credentials, private keys, raw scan payloads, or unrestricted workspace content
- Auto-applying remediation without explicit user review (matches the
  approval-gated pattern common across the SRE-agent category, not the
  auto-fix pattern used by a minority of them)
- Building a second ticketing/queue system that competes with FindMnemo's
  existing Queue/ticket concepts

## Success Metrics

- Assets registered vs. discovered
- `sharedByDesign` coverage (how many assets intended to be shared actually are verified)
- Exit test pass rate (what fraction of assets survive a platform switch)
- Governance evidence remains source-qualified, fresh when local, and truthful when hosted/manual

## Domain Glossary

- **Portable:** Works on 2+ platforms with verified coverage
- **Shared by design:** Built with portability intent (even if not yet verified)
- **Exit test:** Substitution drill — “what breaks if this moves tomorrow?”
- **Coverage matrix:** Verified · Stale · Unverified · Not Shared
- **Hosted/manual:** Browser-only snapshot mode that never claims local freshness or upstream enforcement
