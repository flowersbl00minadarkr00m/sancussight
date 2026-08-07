// ─── Asset kinds ──────────────────────────────────────
export type AssetKind =
  | 'context'
  | 'skill'
  | 'prompt-template'
  | 'intent-context'
  | 'workflow'
  | 'control'
  | 'evaluation'
  | 'ontology-object'
  | 'ontology-link'
  | 'ontology-action'
  | 'schema'
  | 'evidence-contract'
  | 'consumer-adapter'
  | 'candidate-tool'
  | 'accepted-asset'

// ─── Platform ──────────────────────────────────────────
export type Platform = string

// ─── Portability dimensions ────────────────────────────
export type Dimension = 'context' | 'skills' | 'continuity' | 'controls' | 'evidence'

// ─── Signal status ─────────────────────────────────────
export type SignalStatus = 'pass' | 'warn' | 'fail' | 'accepted' | 'unknown'

// ─── Gate type ─────────────────────────────────────────
export type GateType = 'one-way' | 'two-way'
export type Reversibility = 'high' | 'medium' | 'low'

// ─── Coverage ──────────────────────────────────────────
export interface CoverageEntry {
  platform: Platform
  lastVerified?: string  // ISO date
}

// ─── Provider dependency ───────────────────────────────
export interface ProviderDependency {
  provider: string
  capability: string
  fallback?: string
}

// ─── Evidence ──────────────────────────────────────────
export interface EvidencePoint {
  label: string
  date: string  // ISO date
}

// ─── Accepted risk ─────────────────────────────────────
export interface AcceptedRisk {
  note: string
  owner: string
  expires: string  // ISO date
}

export type OntologyCategory = 'object' | 'link' | 'action' | 'schema' | 'evidence-contract' | 'adapter'
export type ActionAuthority = 'read-only' | 'propose-only' | 'user-confirmed-write' | 'automated-write'
export type IntegrationLevel = 'reference-only' | 'manual-import' | 'local-adapter' | 'bundled-dependency' | 'replacement-candidate'
export type ToolDisposition = 'accepted' | 'rejected' | 'deferred' | 'external-prerequisite'

export interface ActionControl {
  authority: ActionAuthority
  requiredControls: string[]
  confirmation: string
  reversible: boolean
  evidenceNeeds: string[]
}

export interface AcceptedAssetMetadata {
  version?: string
  license?: string
  ownershipEvidence?: string
  decisionRationale: string
  sourceProvenance: string
  scope: string
}

export interface BundleReadiness {
  licenseReviewed: boolean
  attributionRecorded: boolean
  trademarkReviewed: boolean
  updatePlanRecorded: boolean
  securityModelReviewed: boolean
  dataFlowReviewed: boolean
  rollbackPlanRecorded: boolean
}

export interface CandidateTool {
  sourceUrl: string
  license: string
  attributionNotes: string
  evidenceType: string
  runtimeRequirements: string[]
  dataEgress: 'none-known' | 'local-only' | 'network-required' | 'unknown'
  trustBoundary: string
  maintenanceStatus: string
  knownUseConstraints: string[]
  dimensions: Dimension[]
  supportedChecks: string[]
  integrationLevel: IntegrationLevel
  disposition: ToolDisposition
  dispositionRationale: string
  assessmentStatus: 'detailed' | 'later-slice'
  bundleReadiness?: BundleReadiness
  directBundleTradeoff?: string
}

// ─── Asset ─────────────────────────────────────────────
export interface AssetVersionCoverageV1 {
  platform: string
  lastVerified?: string
}

export interface AssetVersionProviderDependencyV1 {
  provider: string
  capability: string
  fallback?: string
}

export interface AssetVersionSnapshotV1 {
  format: string
  sharedByDesign: boolean
  registryState: 'active' | 'archived' | 'missing'
  supportedVersion?: string
  coverage: AssetVersionCoverageV1[]
  providerDependencies: AssetVersionProviderDependencyV1[]
  dependencyIds: string[]
}

export interface AssetVersionVerificationV1 {
  checkId: string
  resultId: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceHash?: string
}

export interface AssetVersionV1 {
  schemaVersion: 1
  id: string
  recordedAt: string
  sourceRefHashes: string[]
  verificationRefs: AssetVersionVerificationV1[]
  snapshot: AssetVersionSnapshotV1
  qualification?: 'portable-projection'
  derivedFromVersionId?: string
}

export interface AssetVersionAliasV1 {
  name: string
  versionId: string
}

export type AssetVersionComparisonState = 'regression' | 'recovery' | 'changed' | 'unchanged'
export type AssetVersionComparisonBasis = 'recorded-fact' | 'deterministic-check'

export interface AssetVersionComparisonItem {
  key: string
  label: string
  state: AssetVersionComparisonState
  previous: string
  current: string
  basis: AssetVersionComparisonBasis
}

export interface AssetVersionComparisonReadyV1 {
  state: 'ready'
  currentVersionId: string
  previousVersionId: string
  items: AssetVersionComparisonItem[]
  totalItems: number
  totalMeaningfulItems: number
  truncated: boolean
  omittedUnchangedCount: number
}

export interface AssetVersionComparisonNoPreviousV1 {
  state: 'no-previous-version'
  currentVersionId?: string
  items: []
}

export interface AssetVersionComparisonTooManyChangesV1 {
  state: 'unavailable-too-many-changes'
  currentVersionId: string
  previousVersionId: string
  items: []
  totalItems: number
  totalMeaningfulItems: number
  truncated: true
  omittedUnchangedCount: number
}

export type AssetVersionComparisonV1 =
  | AssetVersionComparisonReadyV1
  | AssetVersionComparisonNoPreviousV1
  | AssetVersionComparisonTooManyChangesV1

export type EvidencePacketQualificationV1 =
  | 'recorded'
  | 'portable-projection'
  | 'deterministic'
  | 'manual'
  | 'missing'

export interface EvidencePacketSubjectV1 {
  kind: AssetKind
  subjectHash: string
}

export interface AssetVersionPredicateV1 {
  kind: 'asset-version'
  versionId: string
  recordedAt: string
  snapshotHash: string
  derivedFromVersionId?: string
}

export interface ExitDrillPredicateItemV1 {
  subjectHash: string
  status: ExitTestItem['status']
}

export interface ExitDrillPredicateV1 {
  kind: 'exit-drill'
  targetPlatform: string
  verdict: ExitTestResult['verdict']
  items: ExitDrillPredicateItemV1[]
}

export interface EvidencePacketProducerV1 {
  name: 'SancusSight'
  contractVersion: 1
}

export interface EvidencePacketRunV1 {
  observedAt: string
  sourceRefHashes: string[]
}

export interface EvidencePacketVerificationV1 {
  checkId: string
  resultId: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceHash?: string
}

export interface EvidencePacketDecisionV1 {
  kind: string
  status: string
  recordedAt: string
  decisionRefHash: string
}

export interface EvidencePacketMissingV1 {
  kind: string
  status: 'missing'
  referenceHash?: string
}

export interface EvidencePacketV1 {
  schemaVersion: 1
  packetType: 'sancussight-evidence-packet'
  packetId: string
  exportedAt: string
  subject: EvidencePacketSubjectV1
  predicate: AssetVersionPredicateV1 | ExitDrillPredicateV1
  producer: EvidencePacketProducerV1
  run: EvidencePacketRunV1
  qualification: EvidencePacketQualificationV1
  verification: EvidencePacketVerificationV1[]
  humanDecisions: EvidencePacketDecisionV1[]
  missingEvidence: EvidencePacketMissingV1[]
  comparison?: AssetVersionComparisonV1
}

export interface Asset {
  id: string
  name: string
  kind: AssetKind
  registryState?: 'active' | 'archived' | 'missing'
  format: 'markdown' | 'json' | 'yaml' | 'proprietary' | string
  location: string
  owner?: string
  sensitivity: 'internal' | 'sensitive' | 'public'
  lastReviewed?: string  // ISO date
  sharedByDesign: boolean
  coverage: CoverageEntry[]
  providerDependencies: ProviderDependency[]
  evidence: EvidencePoint[]
  acceptedRisk?: AcceptedRisk
  // workflow-specific
  dependsOn?: string[]
  primaryProvider?: Platform
  fallbackProvider?: Platform
  lastSubstitutionDrill?: string
  // ontology-governance metadata
  purpose?: string
  sourceProduct?: string
  producingProduct?: string
  consumingProducts?: string[]
  supportedVersion?: string
  stableId?: string
  ontologyCategory?: OntologyCategory
  actionControl?: ActionControl
  acceptedAsset?: AcceptedAssetMetadata
  candidateTool?: CandidateTool
  evidenceBindings?: EvidenceBinding[]
  versions?: AssetVersionV1[]
  versionAliases?: AssetVersionAliasV1[]
  currentVersionId?: string
}

// ─── Registry ──────────────────────────────────────────
export interface Registry {
  schemaVersion: 2
  platforms: Platform[]
  updatedAt: string
  assets: Asset[]
  provenance?: RegistryProvenance
}

export type DataMode = 'demo' | 'local'

export interface RegistryProvenance {
  mode: DataMode
  sourceUpdatedAt: string
  connectedAt?: string
}

export interface RegistrySession {
  registry: Registry
  mode: DataMode
  sourceKind: RegistrySourceKind
  dirty: boolean
  connection?: FileConnectionState
  cacheState?: 'authoritative-read' | 'recovery-only'
}

export type RegistrySourceKind = 'demo' | 'snapshot' | 'file'

export type SyncState =
  | 'current'
  | 'unsaved'
  | 'external-change'
  | 'conflict'
  | 'permission-required'

export type SourcePermission = 'granted' | 'prompt' | 'denied' | 'unsupported'

export interface SourceFingerprint {
  size: number
  lastModified: number
  contentHash: string
}

export interface FileConnectionState {
  kind: 'file'
  sourceName: string
  readPermission: SourcePermission
  writePermission: SourcePermission
  syncState: SyncState
  lastReadAt?: string
  acceptedFingerprint?: SourceFingerprint
  error?: string
}

export interface PersistedFileConnection {
  id: 'canonical'
  handle: FileSystemFileHandle
  state: FileConnectionState
}

export interface WorkingRegistryCache {
  id: 'working'
  registry: Registry
  sourceKind: RegistrySourceKind
  dirty: boolean
  savedAt: string
  acceptedFingerprint?: SourceFingerprint
  connection?: FileConnectionState
}

export type ConnectionOperation =
  | 'connect'
  | 'restore'
  | 'refresh'
  | 'permission'
  | 'conflict'
  | 'write'
  | 'replace'
  | 'disconnect'

export interface ConnectionActivity {
  id: string
  occurredAt: string
  operation: ConnectionOperation
  outcome: 'succeeded' | 'cancelled' | 'failed' | 'blocked'
  sourceName?: string
  detail?: string
}

// ─── Signal ────────────────────────────────────────────
export interface Signal {
  id: string
  checkId?: string
  evaluatedAt?: string
  dimension: Dimension
  assetId: string
  assetName: string
  status: SignalStatus
  condition: string
  finding: string
  evidence: string
  owner: string
  action?: string
  category?: 'recorded-fact' | 'deterministic-finding' | 'missing-evidence' | 'human-decision'
  evidenceRef?: string
  observedAt?: string
}

export interface CheckResultSnapshot {
  registryScopeHash: string
  assetId: string
  checkId: string
  resultDiscriminator: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceHash: string
}

export interface CheckSelectionIntent {
  checkId?: string
  signalId?: string
  assetId?: string
  origin: 'attention' | 'asset-passport'
}

export interface AssetFindingGroup {
  assetId: string
  assetName: string
  worstStatus: SignalStatus
  findingCount: number
  signals: Signal[]
}

export interface ConnectionNotice {
  tone: 'success' | 'neutral' | 'error'
  message: string
  operationPhase?: 'pending' | 'settled'
}

export type EvidenceSourceId = 'agent-beacon' | 'runtime-telemetry' | 'praxen' | 'pipelock' | 'rampart' | 'aimap'
export type ReleaseEvidenceSourceId = 'runtime-telemetry' | 'praxen' | 'pipelock' | 'rampart' | 'aimap'
export type EvidenceOutcome = 'pass' | 'warn' | 'fail' | 'observed'
export type EvidenceVerification = 'verified' | 'failed' | 'unavailable' | 'not-applicable'
export type EvidenceSubjectType = 'agent' | 'workflow' | 'control' | 'action' | 'runtime'
export type EvidenceSourceHealth = 'current' | 'stale' | 'failed' | 'permission-required' | 'not-configured'

export type EvidenceQualification = 'operational' | 'isolated-qa' | 'demo' | 'fixture' | 'replay' | 'manual'
export type EvidenceRuntimeId = 'codex-cli' | 'claude-code' | 'pi'
export type RuntimeTelemetryProvider = 'agent-beacon' | 'codex-otel' | 'claude-otel' | 'pi-extension'
export type RuntimeTelemetryTransport = 'jsonl' | 'otlp-http' | 'otlp-grpc'

export interface OperationalProvenance {
  qualification: EvidenceQualification
  sourceVersion: string
  runId: string
  targetId: string
  contractVersion: string
  configurationHash?: string
  workerRemitHash?: string
  runtime?: EvidenceRuntimeId
  telemetryProvider?: RuntimeTelemetryProvider
  telemetryTransport?: RuntimeTelemetryTransport
  telemetryProviderVersion?: string
}

export interface RuntimeTelemetryEventV1 {
  schemaVersion: 1
  eventId: string
  sessionId: string
  runtime: EvidenceRuntimeId
  provider: RuntimeTelemetryProvider
  transport: RuntimeTelemetryTransport
  providerVersion: string
  eventType: string
  observedAt: string
  outcome: 'succeeded' | 'failed' | 'blocked' | 'observed'
  durationMs?: number
  toolName?: string
  approvalState?: 'approved' | 'denied' | 'not-required' | 'unknown'
  releaseRunId: string
  contentCapture: false
  operational?: OperationalProvenance
}

export interface PipelockVerificationV1 {
  schemaVersion: 1
  packetContentHash: string
  verdict: 'valid' | 'invalid'
  chainValid: boolean
  signatureValid: boolean
  trustedSignerFingerprint: string
  verifierId: string
  verifierVersion: string
  observedAt: string
  runId?: string
  operational?: OperationalProvenance
}

export type RampartResultStatus = 'safe' | 'unsafe' | 'undetermined' | 'error'

export interface RampartOperationalResultV1 {
  resultId: string
  scenarioId: string
  status: RampartResultStatus
  safe?: boolean
  summary: string
  harmCategory?: string
  strategy?: string
  durationMs?: number
  observedAt: string
}

export interface RampartOperationalReportV1 {
  schemaVersion: 1
  sourceVersion: string
  runId: string
  targetId: string
  suiteVersion: string
  evaluatorVersion: string
  results: RampartOperationalResultV1[]
  operational?: OperationalProvenance
}

export interface AIMapTargetV1 {
  host: string
  port: number
  protocol: 'http' | 'https'
  templates: string[]
}

export interface AIMapAuthorizationManifestV1 {
  schemaVersion: 1
  authorizationId: string
  owner: string
  purpose: string
  target: AIMapTargetV1
  validFrom: string
  validUntil: string
  releaseRunId: string
}

export interface AIMapFindingV1 {
  findingId: string
  endpointId: string
  hostname: string
  port: number
  protocol: 'http' | 'https'
  authStatus: 'authenticated' | 'unauthenticated' | 'unknown'
  riskScore?: number
  riskFactors?: string[]
  template: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  title: string
}

export interface AIMapOperationalExportV1 {
  schemaVersion: 1
  sourceVersion: string
  scanId: string
  authorizationId: string
  runId: string
  status: 'completed' | 'running' | 'failed' | 'cancelled'
  target: AIMapTargetV1
  completedAt: string
  findings: AIMapFindingV1[]
  operational?: OperationalProvenance
}

export interface EvidenceEnvelopeV1 {
  schemaVersion: 1
  id: string
  source: EvidenceSourceId
  evidenceKind: string
  observedAt: string
  importedAt: string
  subject: {
    stableId?: string
    externalId: string
    type: EvidenceSubjectType
  }
  outcome: EvidenceOutcome
  summary: string
  provenance: {
    artifactName: string
    artifactContentHash: string
    sourceRecordId?: string
    parserId: string
    parserVersion: string
    verification: EvidenceVerification
  }
  /** Optional manifest-bound qualification. Legacy Spec 004 records omit this and remain non-operational. */
  operational?: OperationalProvenance
  attributes: Record<string, string | number | boolean>
}

export interface EvidenceSourceState {
  id: EvidenceSourceId
  displayName: string
  evidenceType: string
  health: EvidenceSourceHealth
  lastAttemptAt?: string
  lastAcceptedAt?: string
  checkpoint?: string
  lag?: number
  errorCode?: string
  rejectedCount: number
}

export type ReleaseGateStatus = 'not-run' | 'in-progress' | 'blocked' | 'passed' | 'expired'
export type ReleaseFailureState = 'passed' | 'failed' | 'not-run'

export const RELEASE_EVIDENCE_SOURCE_IDS: readonly ReleaseEvidenceSourceId[] = [
  'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap',
]

export const REQUIRED_RELEASE_FAILURE_CASES = [
  'source-stopped',
  'telemetry-bridge-stopped',
  'pi-extension-disabled',
  'malformed-runtime-event',
  'privacy-setting-mismatch',
  'artifact-inaccessible',
  'unsupported-format',
  'invalid-pipelock-signature',
  'rampart-execution-error',
  'aimap-out-of-scope',
  'collector-restart',
  'duplicate-replay',
  'artifact-rotation',
  'source-upgrade-mismatch',
  'successful-recovery',
] as const

export type RequiredReleaseFailureCase = typeof REQUIRED_RELEASE_FAILURE_CASES[number]

export interface ReleaseRequiredTargetV1 {
  targetId: string
  evidenceIds: string[]
  latestObservedAt: string
  workerRemitHash?: string
}

export interface ReleaseSourceManifestV1 {
  version: string
  targetId: string
  targetIds?: string[]
  contractVersion: string
  evidenceIds: string[]
  latestObservedAt?: string
  verification: EvidenceVerification
  operational: boolean
  workerRemitHash?: string
  workerRemitHashes?: string[]
  requiredTargets?: ReleaseRequiredTargetV1[]
}

export interface ReleaseEvidenceManifestV1 {
  schemaVersion: 1
  releaseRunId: string
  startedAt: string
  completedAt?: string
  runtimes: EvidenceRuntimeId[]
  sources: Record<ReleaseEvidenceSourceId, ReleaseSourceManifestV1>
  failureCases: Record<string, ReleaseFailureState>
  status: ReleaseGateStatus
  untestedBoundaries: string[]
}

export type ReleaseSourceGateState =
  | 'missing'
  | 'non-operational'
  | 'wrong-run'
  | 'wrong-target'
  | 'wrong-version'
  | 'incompatible'
  | 'stale'
  | 'untrusted'
  | 'failed'
  | 'current'

export interface ReleaseSourceGateResult {
  source: ReleaseEvidenceSourceId
  state: ReleaseSourceGateState
  operational: boolean
  fresh: boolean
  verification: EvidenceVerification
  evidenceIds: string[]
  latestObservedAt?: string
  runtimeCoverage: EvidenceRuntimeId[]
  blockers: string[]
  targets?: ReleaseTargetGateResult[]
}

export interface ReleaseTargetGateResult {
  targetId: string
  state: ReleaseSourceGateState
  fresh: boolean
  evidenceIds: string[]
  latestObservedAt?: string
  blockers: string[]
}

export interface ReleaseGateResult {
  status: ReleaseGateStatus
  ready: boolean
  evaluatedAt: string
  sources: Record<ReleaseEvidenceSourceId, ReleaseSourceGateResult>
  failureCases: Record<string, ReleaseFailureState>
  runtimeCoverage: EvidenceRuntimeId[]
  blockers: string[]
}

export type ReleaseProgressState = 'queued' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled'
export type ReleaseProgressStage = 'preflight' | 'runtime-telemetry' | 'praxen' | 'pipelock' | 'rampart' | 'aimap' | 'failure-recovery' | 'bundling' | 'finalizing'
export type ReleaseProgressMessageCode = 'starting' | 'processing' | 'waiting-for-producer' | 'checkpointing' | 'rendering' | 'complete' | 'failed' | 'cancelled'

/**
 * A deliberately small operator-side heartbeat. This is status metadata, not
 * evidence and must never contain upstream content, commands, or free text.
 */
export interface ReleaseProgressSnapshotV1 {
  schemaVersion: 1
  contractVersion: 'release-progress-v1'
  releaseRunId: string
  producerId: ReleaseEvidenceSourceId
  targetId: string
  state: ReleaseProgressState
  stage: ReleaseProgressStage
  startedAt: string
  updatedAt: string
  messageCode: ReleaseProgressMessageCode
  completedUnits?: number
  totalUnits?: number
}

export interface RejectedEvidenceSummary {
  id: string
  source: EvidenceSourceId
  artifactName: string
  rejectedAt: string
  errorCode: string
  guidance: string
  verification?: EvidenceVerification
}

export interface AdapterCatalogEntry {
  id: EvidenceSourceId | 'kiji-privacy-proxy'
  displayName: string
  evidenceType: string
  readiness: 'available' | 'contract-review-required'
  boundary: string
}

export interface EvidenceBinding {
  source: EvidenceSourceId
  externalId: string
}

// ─── Rollup ────────────────────────────────────────────
export interface DimensionRollup {
  dimension: Dimension
  pass: number
  warn: number
  fail: number
  accepted: number
  unknown: number
}

// ─── Activity log ──────────────────────────────────────
export interface ActivityEntry {
  ts: string
  agent: string
  action: string
  asset: string
  summary: string
  session: string
  evidence?: string
}

// ─── Exit test ─────────────────────────────────────────
export interface ExitTestItem {
  assetId: string
  assetName: string
  status: 'ok' | 'unverified' | 'missing' | 'locked'
  note: string
}

export interface ExitTestResult {
  workflowId: string
  workflowName: string
  targetPlatform: Platform
  verdict: 'survives' | 'degrades' | 'breaks'
  items: ExitTestItem[]
}

export interface OntologyExitTestItem {
  id: string
  label: string
  status: 'ok' | 'unverified' | 'missing' | 'locked'
  riskType: 'product' | 'technical'
  note: string
}

export interface OntologyExitTestResult {
  scenarioName: string
  verdict: 'survives' | 'degrades' | 'breaks'
  items: OntologyExitTestItem[]
}

// ─── Checks config ─────────────────────────────────────
export const CHECKS_CONFIG = {
  staleReviewDays: 45,
  staleVerifyDays: 30,
  drillDays: 90,
}

// ─── Dimension labels ──────────────────────────────────
export const DIMENSION_LABELS: Record<Dimension, string> = {
  context: 'Context portability',
  skills: 'Skill portability',
  continuity: 'Workflow continuity',
  controls: 'Runtime controls',
  evidence: 'Evidence & ownership',
}

// ─── Status colors ─────────────────────────────────────
export const STATUS_STYLES: Record<SignalStatus, { label: string; fg: string; bg: string }> = {
  pass:   { label: 'PASS',     fg: 'var(--color-moss)',   bg: 'var(--color-moss-soft)' },
  warn:   { label: 'WARN',     fg: 'var(--color-amber)',  bg: 'var(--color-amber-soft)' },
  fail:   { label: 'FAIL',     fg: 'var(--color-rust)',   bg: 'var(--color-rust-soft)' },
  accepted: { label: 'ACCEPTED', fg: 'var(--color-accept)', bg: 'var(--color-accept-soft)' },
  unknown: { label: 'UNKNOWN',  fg: 'var(--color-slate)',  bg: 'var(--color-slate-soft)' },
}

// ─── Nav items ─────────────────────────────────────────
export const PRIMARY_NAV_ITEMS = [
  { id: 'overview', label: 'Home' },
  { id: 'registry', label: 'Assets' },
  { id: 'exit', label: 'Exit Drills' },
  { id: 'queue', label: 'Attention' },
] as const

export const ADVANCED_VIEW_NAV_ITEMS = [
  { id: 'governance', label: 'Governance' },
  { id: 'release', label: 'Release Proofs' },
  { id: 'activity', label: 'Activity' },
  { id: 'definitions', label: 'Definitions' },
] as const

export const ADVANCED_NAV_ITEMS = [
  { id: 'evidence-sources', label: 'Evidence Sources' },
  ...ADVANCED_VIEW_NAV_ITEMS,
] as const

export const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...ADVANCED_VIEW_NAV_ITEMS] as const

/**
 * Advanced destinations whose content comes from the local evidence collector.
 * They have nothing to show in the synthetic sample workspace.
 */
export const COLLECTOR_BACKED_VIEWS: ReadonlySet<string> = new Set([
  'evidence-sources',
  'governance',
  'release',
])

export type ViewId = typeof NAV_ITEMS[number]['id']

// ─── Standards interoperability (Feature 011) ───────────────────────────────
export type InteroperabilityProfileId =
  | 'openlineage-run-event-core-1.0.5'
  | 'otel-genai-metadata-preview-1'
  | 'openinference-metadata-preview-1'
  | 'sancussight-in-toto-statement-1'

export type InteroperabilityProfileStability =
  | 'stable'
  | 'development'
  | 'experimental'

export type InteroperabilityInputKind =
  | 'local-json-or-jsonl'
  | 'accepted-runtime-metadata'
  | 'validated-evidence-packet'

export interface InteroperabilityProfileV1 {
  schemaVersion: 1
  id: InteroperabilityProfileId
  projectionVersion: 1
  upstreamName: string
  upstreamVersion: string
  upstreamProfile: string
  stability: InteroperabilityProfileStability
  sourceUrl: string
  acceptedInputKind: InteroperabilityInputKind
  limitation: string
}

export type OpenLineageEventType =
  | 'START'
  | 'RUNNING'
  | 'COMPLETE'
  | 'ABORT'
  | 'FAIL'
  | 'OTHER'

export type OpenLineageSafeHashKind =
  | 'producer'
  | 'schema'
  | 'run'
  | 'job-namespace'
  | 'job-name'
  | 'input-dataset'
  | 'output-dataset'

export interface OpenLineageSafeHashV1 {
  kind: OpenLineageSafeHashKind
  hash: string
}

export type OpenLineageRejectionCode =
  | 'malformed-json'
  | 'record-not-object'
  | 'unknown-top-level-key'
  | 'unsupported-schema-url'
  | 'unsupported-event-type'
  | 'invalid-event-time'
  | 'invalid-producer'
  | 'invalid-run'
  | 'unknown-run-key'
  | 'invalid-job'
  | 'unknown-job-key'
  | 'invalid-inputs'
  | 'invalid-outputs'
  | 'invalid-dataset'
  | 'unknown-dataset-key'
  | 'hash-failed'

export type OpenLineageOmissionCode =
  | 'run-facets-omitted'
  | 'job-facets-omitted'
  | 'input-dataset-facets-omitted'
  | 'output-dataset-facets-omitted'

export type OpenLineageImportErrorCode =
  | 'file-too-large'
  | 'byte-length-mismatch'
  | 'too-many-records'
  | 'invalid-import-time'
  | 'empty-input'

export interface OpenLineageCodeCountV1<TCode extends string> {
  code: TCode
  count: number
}

export interface OpenLineageProjectedRecordV1 {
  eventType: OpenLineageEventType
  eventTime: string
  inputCount: number
  outputCount: number
  safeHashes: OpenLineageSafeHashV1[]
}

export interface OpenLineagePreviewV1 {
  schemaVersion: 1
  profileId: 'openlineage-run-event-core-1.0.5'
  projectionVersion: 1
  qualification: 'profile-qualified-metadata-only'
  inputKind: 'json' | 'jsonl'
  importedAt: string
  recordCount: number
  acceptedCount: number
  rejectedCount: number
  omittedCount: number
  eventTypeCounts: OpenLineageCodeCountV1<OpenLineageEventType>[]
  rejectionCodeCounts: OpenLineageCodeCountV1<OpenLineageRejectionCode>[]
  omissionCodeCounts: OpenLineageCodeCountV1<OpenLineageOmissionCode>[]
  records: OpenLineageProjectedRecordV1[]
  safeHashes: OpenLineageSafeHashV1[]
}

export type OpenLineageImportResultV1 =
  | {
      ok: true
      preview: OpenLineagePreviewV1
    }
  | {
      ok: false
      profileId: 'openlineage-run-event-core-1.0.5'
      errorCode: OpenLineageImportErrorCode
    }
