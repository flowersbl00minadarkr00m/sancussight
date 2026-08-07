# Idea: Local Agent Governance Ledgers

> Status: idea:captured
> Created: 2026-07-16

## Raw Idea

Define common rules across local AI agents and supporting tools so they record logical assets, runtime activity, controls, approvals, decisions, effects, and outcomes in interoperable ledgers. Keep SancusSight as the polished, read-only governance interface over those ledgers rather than making it a universal installer, supervisor, or enforcement runtime.

## Problem Space

- Agent Beacon can show runtime activity but cannot by itself establish work intent, delegated authority, purpose, complete data lineage, human approval, or accepted outcome.
- FindMnemo and FlowSensa already hold complementary work and workflow context, but SancusSight does not consume them as operational evidence sources.
- MCP servers, tools, loops, agents, models, policies, permissions, approvals, and action effects do not share one local identity and evidence contract.
- Post-execution observability alone cannot prove that consequential actions were evaluated or constrained before execution.
- Enterprise control catalogues create too much configuration and interruption for an individual using local coding agents.

## Target Users

- An individual AI power user or vibe coder operating Codex CLI, Claude Code, MCP servers, and local development tools on one PC.
- A governance-minded builder who wants evidence, lineage, proportionate controls, and exit readiness without enterprise administration.

## Current Alternatives

- Separate source-tool logs with incompatible identities and schemas.
- Agent-authored instructions that request logging but cannot independently prove enforcement.
- Enterprise governance products whose inventory, workflow, and control burden is disproportionate for one user and one device.
- SancusSight's current registry and evidence collector, which are strongest after evidence has already been produced.

## Desired Outcome

The user can inspect one truthful local view connecting intent, agent, runtime, action, policy decision, approval, effect, outcome, and proof. Missing links remain visible as gaps. Consequential actions receive good friction from upstream enforcement points, while routine local coding remains quiet.

## Selected Direction

### Shared governance ledgers with a read-only SancusSight console

- **Description:** Use a versioned governance event contract across inventory, activity, control decisions, human decisions, and outcomes. Producers remain independently operated. SancusSight builds a correlated read model and control recommendations without executing agent actions.
- **Pros:** Preserves least authority, supports multiple runtimes, separates evidence from enforcement, and allows gradual source adoption.
- **Cons:** Requires adapters and stable correlation identities; coverage remains incomplete when a runtime lacks hooks or a gateway.
- **Risks:** Self-reported agent evidence may be mistaken for independent proof; schemas may collect too much sensitive data; weak correlation could imply lineage that was not observed.

## Constraints

- Local-first and single-user.
- No external requests at SancusSight runtime.
- Metadata-minimized collection by default; no raw prompts, responses, secrets, unrestricted command output, or workspace content.
- SancusSight cannot expose generic command execution, policy mutation, scanning, or upstream installation surfaces.
- Agent-generated rationale is contextual evidence, not authoritative proof of execution or enforcement.
- Spec 005 remains responsible for operational proof from Agent Beacon, Praxen, Pipelock, RAMPART, and AIMap.

## Signals of Value

- The user can trace a visible action from work intent to verified outcome without opening multiple source tools.
- The system names missing lineage links instead of inferring them as facts.
- Routine approved work proceeds without interruption while consequential external, privileged, sensitive, or destructive actions receive proportionate friction.
- A new runtime or tool can join through the shared contract without changing the SancusSight product model.

## Recommendation

- [x] Create REQUIREMENTS directly

**Reason:** The architecture direction and first release boundary are sufficiently clear after local contract review, framework research, and user confirmation. Detailed storage, adapter, and policy mechanics belong in design.

## Research Inputs

- `artifacts/research/local-agent-governance-layer-assessment.md`
- `artifacts/research/local-agent-governance-layer-explainer.html`
- Katharina Koerner, Runtime Governance for Agentic AI
- IMDA, Model AI Governance Framework for Agentic AI
- Credo AI, Agent Governance Configuration
- Cloud Security Alliance, AI Controls Matrix v1.1

