# Design: Guided Connection Center

> Requirements: `@requirements.md`
> Status: Approved

## 1. Summary

Replace the raw evidence-path interaction with a mode-aware Connection Center
inside the existing Evidence Sources rail. Each adapter supplies a declarative
setup profile: what to obtain from the source tool, which artifact path to
select, what SancusSight reads, and what it never does. The local companion
validates a candidate path before saving it; hosted/manual mode instead offers
snapshot import and precise instructions for running the collector locally.

The design preserves the existing collector, adapter catalog, session/CSRF
boundary, source configuration store, and read-only refresh behavior.

## 2. Requirements Mapping

| Requirements | Design coverage |
|---|---|
| FR-001–FR-003 | Mode-first entry and setup profiles in §§3–5 |
| FR-004–FR-006 | Validation, save/refresh, health and recovery in §§6–8 |
| FR-007–FR-009 | Telemetry distinction, hosted continuation, boundary copy in §§4, 9 |
| NFR-001–NFR-004 | Accessibility, truth, security, maintainability in §§10–13 |

## 3. Component Model

```text
EvidenceSources
  ConnectionModeBanner
  SourceCatalog
    SourceConnectionCard
  ConnectionWizard
    RequirementsStep
    ArtifactStep
    ValidationStep
    ConfirmationStep
  SnapshotActions
```

`EvidenceSources` continues to own selected source and delegates mutations
through existing callback props. `ConnectionWizard` is ephemeral UI state; the
collector remains the configuration authority.

## 4. Declarative Setup Profiles

Extend `AdapterCatalogEntry` with:

```ts
interface SourceSetupProfile {
  artifactKind: 'file' | 'directory'
  expectedFormat: string
  producerSteps: string[]
  readBoundary: string
  excludedData: string[]
  exampleNames: string[]
  validationHelp: Record<string, string>
  telemetryRole?: 'producer' | 'alignment-profile' | 'not-telemetry'
}
```

Profiles live in `src/lib/evidence-catalog.ts` and are shared by the frontend
and collector catalog. Initial profiles cover Agent Beacon, Runtime telemetry,
Praxen, Pipelock, RAMPART, and AIMap. Product-specific steps describe how to
produce/export the supported artifact but never claim SancusSight installs,
configures, or runs the upstream tool.

OpenTelemetry appears in the Runtime telemetry explanation as the semantic
format/alignment family, not as a source that can be connected by itself.

## 5. Mode-first Flow

At the top of the rail:

- `hosted`: “Viewer only” with Import snapshot as primary action and a short
  “Use live sources locally” walkthrough;
- `connecting`: collector handshake in progress, no configuration mutation;
- `degraded`: retained evidence plus Retry collector and recovery guidance;
- `live`: source catalog with Add connection and health summaries.

The source catalog shows available, configured, attention-needed, and later
adapters. It does not hide unsupported tools behind a misleading Connect
action.

## 6. Validate-before-save Contract

Add a collector endpoint:

```text
POST /api/v1/sources/:id/validate
body: { artifactPath }
response: {
  valid: boolean
  artifactKind
  recognizedFormat?
  boundedItemCount?
  warnings[]
  code?
}
```

The route uses the existing session, origin, CSRF, body-size, source-ID, and
path validation. It invokes the selected adapter's non-persisting inspection
path and returns only safe metadata. It does not ingest evidence or save
configuration.

`configure` remains the only persistence route. After a successful validation,
the user reviews path, format, read boundary, and warnings, then explicitly
connects. Configure performs validation again to prevent time-of-check/time-of-
use drift, persists the path, and runs the existing refresh.

## 7. Collector Changes

Extend the collector service with:

```ts
validate(source: EvidenceSourceId, input: ConfigureSourceInput):
  Promise<SourceValidationResult>
```

Adapters expose a shared `inspectArtifact` helper used by validation and
refresh. Validation reads only bounded metadata and the minimal contract
header. It never appends evidence, advances offsets, or creates governance
events.

The source config schema stays version 1 because persisted fields do not
change. Failure codes are stable and safe: not-found, wrong-kind,
unsupported-format, unreadable, outside-boundary, empty, and changed.

## 8. Health and Recovery

Connection cards show:

- connection state and last accepted record;
- what SancusSight is reading;
- rejected count and latest safe guidance;
- Validate/Change path, Refresh, and Disconnect actions as applicable; and
- upstream artifact preservation on disconnect.

Failed validation keeps the entered path and focus, points to the relevant
setup-profile guidance, and never changes the current working connection.
Degraded collector state preserves retained freshness exactly as today.

## 9. Hosted Continuation

Hosted mode offers:

1. Import a sanitized SancusSight snapshot now.
2. Download/copy the exact local collector start command from repository
   documentation.
3. Open the same Connection Center once running in local mode.

No hosted UI probes localhost, accepts a provider key, or implies that an
upstream source is live. The static site remains a viewer.

## 10. Files

```text
src/components/EvidenceSources.tsx
src/components/ConnectionWizard.tsx        new
src/lib/evidence-catalog.ts
src/lib/collector-client.ts
src/lib/use-collector.ts
src/types.ts
collector/server.ts
collector/adapters/types.ts
collector/collector-service seam
collector/__tests__/source-validation.test.ts  new
src/lib/__tests__/feature014-*.test.mjs        new
```

## 11. Accessibility and Responsive Behavior

- Wizard steps use headings and an ordered list; progress is textual.
- Validation messages use live regions without stealing focus.
- Every status combines icon and text.
- On failure, focus moves to the error summary, which links back to the path
  field.
- At 320 CSS pixels/200% zoom, cards and actions form one column; no duplicate
  mobile DOM.
- Setup instructions are copyable text, not image-only guidance.

## 12. Technical Decisions

- **TD-001:** Extend `EvidenceSources` rather than add a top-level route. Setup,
  health, import, and recovery belong to one source workspace.
- **TD-002:** Catalog-driven profiles prevent source-specific component
  branches and make new adapters data additions plus adapter code.
- **TD-003:** Validate is non-persisting; configure revalidates and then
  refreshes. This keeps failures recoverable and closes path drift.
- **TD-004:** OpenTelemetry is presented as a telemetry contract/alignment
  concept, while concrete producer artifacts are connectable sources.
- **TD-005:** Hosted/manual remains a truthful continuation path, not a broken
  version of the local workflow.

## 13. Verification

- Collector tests for auth/CSRF, every validation code, no state mutation,
  configure revalidation, adapter failure isolation, and path privacy.
- UI tests for all four modes, catalog/profile rendering, wizard transitions,
  retained input on failure, configured health, and hosted no-localhost
  behavior.
- Browser tests for Praxen, Pipelock, and Runtime telemetry happy/failure
  paths, keyboard order, focus recovery, 320px/200%, and disconnect truth.
- Run `npm run test:collector`, `npm run verify:core`, and `npm run build`.

## 14. Risks

| Risk | Mitigation |
|---|---|
| Instructions drift from upstream tools | Versioned catalog copy and contract-based examples |
| Validation mutates source state | Pure inspection seam and regression tests |
| Hosted mode still looks live | Mode banner and no connection controls |
| Raw paths leak into errors | Stable safe codes and bounded display |
| Wizard adds unnecessary steps | Four short steps; configured sources return to compact cards |
