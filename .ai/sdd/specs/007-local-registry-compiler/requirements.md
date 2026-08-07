# Feature: Local Registry Compiler

> Status: Approved
> Source: User decisions in the Codex session beginning 2026-07-20

## Overview

The Local Registry Compiler creates a trustworthy SancusSight registry from the user's explicitly authorized local AI inventories. It is intended both for Henry's personal registry and for GitHub users who need a clean starting point without manually authoring detailed JSON.

The compiler discovers metadata and references for registered projects, skills, commands, loops, workflows, MCPs, posts, plugins, agent configurations, controls, evaluations, evidence contracts, and adapters. It does not ingest content, execute discovered commands, or claim completeness beyond the authorized sources it inspected.

## Business Context

Manual registry authoring is too error-prone for a public GitHub release. A local, reviewable compiler gives users a fast starting point while preserving SancusSight's local-first, read-only, privacy-safe boundaries. The compiler must make uncertainty visible instead of guessing, preserve history across refreshes, and produce both a same-machine registry and a sanitized portable export.

## User Stories

### US-001: Compile a personal registry

**As a** SancusSight user  
**I want to** discover my authorized AI projects and operating inventories  
**So that** I can connect a useful registry without manually describing every asset.

**Acceptance Criteria:**
- [ ] The compiler inspects the canonical project registry and all active projects it references.
- [ ] The compiler discovers metadata for skills/plugins, commands, loops, workflows, MCPs, posts, agent configurations, controls, evaluations, evidence contracts, and adapters from supported known inventories.
- [ ] The compiler reports exactly which roots and source types it inspected, skipped, or could not read.

### US-002: Review before commit

**As a** registry owner  
**I want to** review proposed assets and classifications before files are written  
**So that** the registry reflects my intent rather than opaque automation.

**Acceptance Criteria:**
- [ ] A browser review screen opens from the local CLI.
- [ ] Proposals are grouped by source and asset type, with high-confidence items recommended for selection.
- [ ] Each proposal shows provenance, confidence, sensitivity, proposed identity, and detected platform coverage.
- [ ] No registry output is finalized until the user confirms the selected proposals.

### US-003: Connect locally and share safely

**As a** registry owner  
**I want to** connect the exact local file while retaining a sanitized portable export  
**So that** I can use SancusSight locally without accidentally publishing private paths.

**Acceptance Criteria:**
- [ ] The compiler writes a schema-valid local registry that reconnects on the same machine.
- [ ] The compiler writes a separate portable export with user/home paths replaced by bounded aliases.
- [ ] The compiler provides guidance for keeping the local registry out of Git and for sharing the portable export.

### US-004: Refresh without losing history

**As a** registry owner  
**I want to** refresh the registry and review a diff  
**So that** new, changed, and removed assets are visible without silently erasing prior decisions.

**Acceptance Criteria:**
- [ ] Refresh produces an explicit diff before applying changes.
- [ ] Duplicate discoveries merge into one logical asset with platform coverage and source-level provenance.
- [ ] Disappeared assets remain archived and are flagged as missing rather than deleted automatically.
- [ ] A refresh never overwrites the prior registry or portable export without confirmation.

### US-005: Use the public package safely

**As a** GitHub user  
**I want to** run the compiler through `npx` on Windows  
**So that** I can generate a registry without installing a hosted service or granting SancusSight upstream execution authority.

**Acceptance Criteria:**
- [ ] The first supported distribution is an npm package usable through `npx` on Windows.
- [ ] The package works without network access after installation, except for package installation itself.
- [ ] The package documents discovery scope, privacy behavior, skipped sources, output files, and limitations.

## Functional Requirements

### FR-001: Explicit discovery scope — Must Have

WHEN the compiler starts  
THE SYSTEM SHALL inspect only the canonical project registry, active projects it references, and the supported known AI inventories selected by the user  
SO THAT discovery remains bounded and explainable.

### FR-002: Metadata-only discovery — Must Have

WHEN the compiler reads a supported source  
THE SYSTEM SHALL retain only allowlisted metadata, references, classifications, provenance, and bounded identifiers  
SO THAT prompts, post bodies, responses, reasoning, command bodies/arguments, tool payloads, credentials, private keys, and unrestricted file contents never enter the generated registry or exports.

### FR-003: Complete supported entity coverage — Must Have

WHEN supported inventories contain skills, commands, loops, workflows, MCPs, posts, projects, plugins, agent configurations, controls, evaluations, evidence contracts, or adapters  
THE SYSTEM SHALL propose each discoverable metadata entity with its source and platform associations  
SO THAT completeness is measured against the inspected scope.

### FR-004: Review gate — Must Have

WHEN discovery finishes  
THE SYSTEM SHALL open a grouped browser review with recommended selections and require explicit user confirmation before writing a finalized registry.

### FR-005: Conservative uncertainty — Must Have

WHEN an item is ambiguous, sensitive, unsupported, unreadable, or credential-adjacent  
THE SYSTEM SHALL exclude it from finalized outputs and include a bounded skipped-items explanation  
SO THAT uncertainty is visible without weakening privacy.

### FR-006: Sensitivity classification — Must Have

WHEN a proposal is generated  
THE SYSTEM SHALL default local paths and configuration metadata to `internal`, treat credential-adjacent material as `sensitive` and exclude it, and require explicit confirmation before assigning `public`.

### FR-007: Identity and provenance — Must Have

WHEN the same logical asset appears across sources or platforms  
THE SYSTEM SHALL merge it under a stable identity while preserving per-source provenance, platform coverage, and observed timestamps.

### FR-008: Local and portable outputs — Must Have

WHEN the user confirms a review  
THE SYSTEM SHALL write a schema-valid exact-path local registry and a separate sanitized portable export with bounded path aliases.

### FR-009: Refresh and archival — Must Have

WHEN the user runs refresh  
THE SYSTEM SHALL present additions, changes, duplicates, and disappeared assets as a reviewable diff, retain disappeared assets as archived/missing, and apply changes only after confirmation.

### FR-010: Validation and diagnostics — Must Have

WHEN the compiler writes or refreshes an output  
THE SYSTEM SHALL validate schema, required fields, duplicate identity, provenance completeness, privacy rules, and output consistency, and SHALL report actionable errors without exposing sensitive values.

### FR-011: Local-only authority boundary — Must Have

THE SYSTEM SHALL never execute discovered commands, launch upstream tools, mutate policies, install dependencies, connect to MCP servers, or perform scans; it SHALL operate as a read-only metadata compiler.

### FR-012: Windows npm distribution — Must Have

THE SYSTEM SHALL provide a Windows-first npm package invocable through `npx`, with documented prerequisites, supported locations, safe defaults, and failure recovery.

### FR-013: Cross-platform roadmap — Should Have

THE SYSTEM SHOULD preserve an adapter boundary that allows macOS and Linux discovery defaults to be added later without changing the registry contract.

### FR-014: Automation mode — Could Have

THE SYSTEM MAY provide a non-interactive output mode for advanced users after the interactive review flow is proven.

## Non-Functional Requirements

### NFR-001: Privacy

- No raw prompt, response, reasoning, post body, command body/arguments, tool payload, credential, private key, or unrestricted workspace content may enter normalized registry data or portable exports.
- Local exact paths remain in local output only; portable output uses bounded aliases.
- Credential-adjacent and ambiguous items fail closed and appear only in bounded diagnostics.

### NFR-002: Trustworthiness

- Every finalized asset has source provenance, observed time, and an explicit confidence/classification state.
- The compiler reports inspected, skipped, unreadable, unsupported, and out-of-scope sources separately.
- The product never claims more completeness than the authorized inventory scope supports.

### NFR-003: Usability

- A first-time Windows user can install, compile, review, confirm, and connect a registry without hand-authoring JSON.
- Review remains understandable for large inventories through grouping, filtering, and recommended selections.

### NFR-004: Reliability

- Existing registry files remain recoverable before and after refresh.
- Partial discovery failures do not erase accepted assets or prevent unrelated sources from being reviewed.

### NFR-005: Accessibility and safety

- The browser review preserves keyboard focus, clear status text, reduced-motion behavior, and bounded desktop/mobile layout.
- The CLI and review screen make read-only scope and skipped sensitive items explicit.

## Out of Scope

- macOS or Linux discovery defaults in the first package release.
- Automatic background scanning or scheduled refresh.
- Automatic publishing, Git commits, or cloud synchronization.
- Reading or storing content bodies to infer asset meaning.
- Upstream command execution, tool installation, MCP calls, scans, policy changes, or machine-wide interception.
- Automatic migration, repair, or mutation of discovered projects, skills, workflows, or configurations.
- Treating a generated registry as a compliance, security, or continuity guarantee.

## Decisions

### D-001: Windows-first npm package

**Decision:** Deliver the first public compiler as a Windows-first npm package invoked through `npx`.  
**Reason:** It matches the current project environment and limits initial platform-specific discovery work while preserving a future adapter boundary.  
**Source:** Direct user choice.  
**Impacts:** FR-012, FR-013, Out of Scope.

### D-002: Review before writing

**Decision:** Always require grouped browser review and explicit confirmation before final output.  
**Reason:** Accuracy and user intent matter more than fully automatic inventory.  
**Source:** Direct user choice.  
**Impacts:** US-002, FR-004, NFR-003.

### D-003: Conservative privacy and uncertainty

**Decision:** Exclude ambiguous or sensitive items by default, classify local metadata conservatively, and show skipped explanations.  
**Reason:** The registry must remain trustworthy and safe to share.  
**Source:** Direct user choice.  
**Impacts:** FR-002, FR-005, FR-006, NFR-001, NFR-002.

### D-004: Dual outputs

**Decision:** Produce an exact local registry and a separate sanitized portable export.  
**Reason:** Local reconnectability and safe sharing have different path requirements.  
**Source:** Direct user choice.  
**Impacts:** US-003, FR-008, NFR-001.

### D-005: Merge logical duplicates and preserve history

**Decision:** Merge cross-platform duplicates under stable identity and archive disappeared assets during refresh.  
**Reason:** This presents portability clearly without destroying prior decisions.  
**Source:** Direct user choice.  
**Impacts:** FR-007, FR-009, NFR-004.

## Questions

### Q-001: Initial discovery scope

**Status:** answered  
**Answer:** Canonical projects plus skills/plugins, commands, loops, workflows, MCPs, posts, agent configurations, controls, evaluations, evidence contracts, and adapters from supported known inventories.  
**Impacts:** US-001, FR-001, FR-003.

### Q-002: Refresh behavior

**Status:** answered  
**Answer:** Provide a one-time compiler and a reviewable refresh diff; preserve disappeared assets as archived/missing.  
**Impacts:** US-004, FR-009.

### Q-003: Output behavior

**Status:** answered  
**Answer:** Write a local exact-path registry plus a sanitized portable export outside Git by default, with ignore guidance.  
**Impacts:** US-003, FR-008, NFR-001.

## Glossary

- **Authorized inventory:** A source root or registered metadata source the user explicitly permits the compiler to inspect.
- **Local registry:** Exact-path registry intended for same-machine browser connection.
- **Portable export:** Sanitized registry whose user/home paths are represented by bounded aliases.
- **Skipped item:** A discovered item excluded from output because it is ambiguous, sensitive, unsupported, unreadable, or outside scope.
- **Logical asset:** A stable user-meaningful entity that may have multiple platform/source observations.
