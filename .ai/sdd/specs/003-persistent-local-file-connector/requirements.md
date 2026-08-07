# Feature: Persistent Local File Connector

> Status: Approved
> Source: User approval on 2026-07-11 to proceed with the recommended persistent file-handle connector

## Overview

SancusSight should connect to one user-authorized local registry file as its canonical source rather than treating every selection as a one-time import. After the user grants access once, SancusSight should be able to refresh that file, detect external changes, preserve a recoverable browser-local working copy, and write changes back only after explicit confirmation.

The connector must retain SancusSight's local-only trust boundary. It must not upload registry content, infer access to arbitrary paths, silently overwrite external changes, or imply live folder watching where the browser cannot provide it.

## Business Context

The current `Connect now` flow validates a selected JSON file and copies it into localStorage. SancusSight then maintains that browser-local copy, while the original file remains disconnected and unchanged. This makes the product truthful as an importer but weak as an ongoing governance registry: users cannot tell whether the file and workspace have diverged, and updates made by other tools require another manual replacement import.

A persistent local file connector should establish a clearer source-of-truth model:

1. The authorized file is canonical.
2. The browser-local copy is a recovery cache and working state.
3. Source freshness and permission are always visible.
4. Refresh never discards unsaved work silently.
5. Write-back is deliberate, confirmed, and conflict-aware.

## User Stories

### US-001: Connect a canonical local registry once

**As a** registry owner  
**I want to** authorize one local registry file as SancusSight's source  
**So that** I do not need to re-import the same file for every session

**Acceptance Criteria:**
- [ ] `Connect now` distinguishes a persistent file connection from a one-time import fallback.
- [ ] A compatible selected file is validated before it becomes canonical.
- [ ] The workspace identifies the connected file by safe display name, not an exposed full local path.
- [ ] Returning to SancusSight can restore the connection when browser permission remains available.
- [ ] Permission denial or cancellation leaves the existing source and working state unchanged.

### US-002: Know whether the registry is current

**As a** governance-minded practitioner  
**I want to** see source permission and synchronization state  
**So that** I know whether visible findings reflect the canonical file

**Acceptance Criteria:**
- [ ] The workspace shows one of: `Current`, `Unsaved changes`, `Changed externally`, `Conflict`, or `Permission required`.
- [ ] Source freshness identifies when the canonical file was last read successfully.
- [ ] A manual `Refresh from source` command is always available for a connected file.
- [ ] SancusSight checks for source changes when the workspace regains focus without silently replacing visible data.
- [ ] Failed reads show inline recovery guidance and retain the last valid working copy.

### US-003: Refresh safely after external changes

**As a** registry owner using other local tools  
**I want to** load changes made outside SancusSight  
**So that** the workspace reflects the latest canonical evidence

**Acceptance Criteria:**
- [ ] If the source changed and SancusSight has no unsaved edits, refresh validates and activates the new file content.
- [ ] Invalid external content is rejected and the last valid working copy remains active.
- [ ] If both source and working copy changed, SancusSight enters `Conflict` instead of choosing a winner.
- [ ] Conflict recovery offers explicit choices to reload the source, preserve/export the working copy, or continue without writing.
- [ ] Every resolved refresh updates source freshness and deterministic findings from the accepted registry only.

### US-004: Write changes back deliberately

**As a** registry owner  
**I want to** save reviewed SancusSight changes to the canonical file  
**So that** the registry remains maintainable outside the browser

**Acceptance Criteria:**
- [ ] Edits made in SancusSight set the source state to `Unsaved changes`.
- [ ] SancusSight never writes to the canonical file automatically.
- [ ] `Save to source` summarizes the pending write and requires explicit confirmation.
- [ ] SancusSight rechecks the source for external changes before writing.
- [ ] A detected external change blocks write-back and enters `Conflict`.
- [ ] Successful write-back updates freshness and returns the source to `Current`.
- [ ] Failed or cancelled write-back preserves both the source file and recoverable working copy.

### US-005: Recover without misrepresenting source state

**As a** returning user  
**I want to** recover recent work when file permission is unavailable  
**So that** browser or permission changes do not erase governance work

**Acceptance Criteria:**
- [ ] The latest valid working copy is retained locally as a recovery cache.
- [ ] Cached data is clearly labeled when the canonical file cannot be read.
- [ ] A cached copy is never presented as `Current` while source permission is missing.
- [ ] The user can reauthorize the same source, connect a replacement source, export the cache, or disconnect.
- [ ] Disconnecting removes the saved connection and cache only after confirmation and never deletes the source file.

## Functional Requirements

### FR-001: Persistent source authorization - Must Have

WHEN a user selects `Connect now` in a browser that supports persistent local file access  
THE SYSTEM SHALL request access to one compatible local registry file and remember the authorized source when permission allows  
SO THAT the same canonical registry can be reopened without repeated imports.

### FR-002: Honest fallback - Must Have

WHEN persistent local file access is unavailable  
THE SYSTEM SHALL retain the one-time import/export flow and label it as a snapshot rather than a connected source  
SO THAT unsupported environments do not receive a false connector promise.

### FR-003: Source status - Must Have

WHEN a connected workspace is open  
THE SYSTEM SHALL show the safe source name, last successful read, permission state, and exactly one synchronization state  
SO THAT evidence freshness and authority remain observable.

### FR-004: Manual and focus refresh - Must Have

WHEN a user requests refresh or returns focus to a connected workspace  
THE SYSTEM SHALL check the canonical source for change and validate new content before activation  
SO THAT external updates can be incorporated without unsafe replacement.

### FR-005: Unsaved working state - Must Have

WHEN a user changes registry data inside SancusSight  
THE SYSTEM SHALL retain the valid working copy locally and mark it `Unsaved changes` without writing the source  
SO THAT edits remain recoverable and deliberate.

### FR-006: Conflict prevention - Must Have

WHEN the canonical source and working copy both changed since the last accepted read  
THE SYSTEM SHALL block automatic refresh and write-back, enter `Conflict`, and require an explicit resolution choice  
SO THAT neither version is silently lost.

### FR-007: Confirmed write-back - Must Have

WHEN a user selects `Save to source`  
THE SYSTEM SHALL summarize the pending write, recheck source freshness, require confirmation, and write only if no conflict exists  
SO THAT maintenance of the canonical registry remains intentional.

### FR-008: Recovery cache - Must Have

WHEN source access is interrupted or a read/write fails  
THE SYSTEM SHALL preserve the latest valid working copy, label it as cached, and offer reauthorization, replacement, export, or disconnect recovery  
SO THAT local work is not lost or overstated.

### FR-009: Safe disconnect - Must Have

WHEN a user disconnects a source  
THE SYSTEM SHALL require confirmation, remove the remembered connection and cache, and leave the source file untouched  
SO THAT connection cleanup cannot delete canonical evidence.

### FR-010: Existing evidence behavior - Must Have

WHEN a refreshed or restored registry becomes active  
THE SYSTEM SHALL continue using the existing deterministic checks, provenance labels, Overview grouping, Queue, Registry, Exit Test, and share/export boundaries  
SO THAT the connector changes source maintenance rather than governance semantics.

### FR-011: Connection activity evidence - Should Have

WHEN connect, refresh, conflict resolution, write-back, permission change, or disconnect occurs  
THE SYSTEM SHOULD record a local activity entry with timestamp, outcome, and source display name but no full path  
SO THAT source maintenance is auditable without exposing local filesystem details.

## Non-Functional Requirements

### NFR-001: Privacy and permissions
- Registry content and file metadata must remain in the browser and authorized local file boundary.
- SancusSight must not request access to arbitrary paths, folders, or unrelated files.
- Full local paths must not appear in UI, exports, share cards, logs, or error messages.
- Permission requests must occur in direct response to an understandable user action.

### NFR-002: Reliability and data integrity
- Source writes must be atomic where the browser capability permits and must never knowingly overwrite a detected external change.
- Invalid reads must not replace the last valid registry.
- Cache, source fingerprint, and synchronization state must remain consistent across refresh and restart.
- Registry files must remain compatible with the approved versioned/unversioned normalization boundary.

### NFR-003: Accessibility and usability
- Connect, refresh, save, conflict resolution, reauthorize, export, and disconnect controls must be keyboard-operable.
- Synchronization state must use text in addition to color.
- Permission and conflict messages must explain the safe next action inline.
- Routine sessions should not prompt for permission when existing access remains valid.

### NFR-004: Performance
- Restoring a cached workspace must remain immediate for the current expected personal-registry scale.
- Source checks must avoid repeatedly parsing unchanged content.
- Focus checks must not interrupt typing, open dialogs, or reset the active workspace view.

### NFR-005: Compatibility and graceful degradation
- The static-host deployment and no-backend boundary must remain intact.
- Browsers without persistent file access must retain the current snapshot import/export experience.
- Capability differences must be visible and must not silently change the source-of-truth model.

## Out of Scope

- Folder or directory connections.
- Background filesystem watching while SancusSight is closed.
- A local companion process, CLI daemon, Electron/Tauri wrapper, or browser extension.
- Multiple simultaneous canonical registry files.
- Automatic merge of conflicting registry versions.
- Automatic write-back or autosave to the source file.
- Cloud storage, accounts, synchronization, or multi-user collaboration.
- Direct connectors to Agent Beacon, Praxen, Pipelock, Kiji Privacy Proxy, AIMap, RAMPART, GitHub, or other tool outputs.
- Changes to deterministic signal semantics, ontology governance, scoring, or candidate-tool execution.

## Decisions

### D-001: One authorized file is canonical

**Decision:** The first connector slice supports one canonical local registry file at a time.  
**Reason:** This creates a clear source of truth without premature multi-source merge behavior.  
**Source:** User approval of the recommended persistent file connector  
**Impacts:** US-001 through US-005, FR-001, FR-003 through FR-010

### D-002: Cache is recovery, not authority

**Decision:** Browser-local state remains a recoverable working copy and never claims `Current` without a successful source check.  
**Reason:** Provenance must remain truthful when permission or source access changes.  
**Source:** Existing local-first/provenance requirements plus user question about registry maintenance  
**Impacts:** US-002, US-005, FR-003, FR-005, FR-008, NFR-002

### D-003: Write-back is explicit

**Decision:** SancusSight marks edits unsaved and writes only through confirmed `Save to source`.  
**Reason:** Governance evidence should not be modified silently.  
**Source:** Recommended direction accepted by user  
**Impacts:** US-004, FR-005 through FR-007, NFR-001, NFR-002

### D-004: Conflicts block rather than merge

**Decision:** External and local concurrent changes enter an explicit conflict state; automatic merge is excluded.  
**Reason:** Silent or heuristic merging could corrupt evidence and ownership decisions.  
**Source:** Conservative data-integrity default delegated by user approval to proceed  
**Impacts:** US-003, US-004, FR-006, FR-007, Out of Scope

### D-005: Unsupported browsers keep snapshot mode

**Decision:** Current import/export remains available and is labeled as a snapshot when persistent connection is unavailable.  
**Reason:** The product must degrade honestly while remaining usable on a static host.  
**Source:** Existing SancusSight compatibility boundary  
**Impacts:** FR-002, NFR-005

## Questions

No critical open questions. The draft assumes the approved first slice remains browser-only and supports one canonical file with manual write-back. Folder watching or tool-specific connectors require separate requirements.

## Glossary

- **Canonical source:** The user-authorized local registry file that owns durable registry state.
- **Working copy:** The active validated registry being inspected or edited in SancusSight.
- **Recovery cache:** Browser-local storage of the latest valid working copy and connection metadata.
- **Source freshness:** The last time SancusSight successfully read and accepted the canonical file.
- **External change:** A canonical file revision that differs from the last accepted source revision.
- **Conflict:** Both the source and working copy changed since the last accepted read.
- **Snapshot mode:** One-time import/export behavior without a persistent source connection.
