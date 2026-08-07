/**
 * Public, metadata-only contracts for the local registry compiler.
 *
 * These types intentionally describe observations and bounded references, not
 * the contents of the files from which an observation was made.  Keep new
 * fields allowlisted here; adapters must not widen this model with arbitrary
 * records.
 */

export const REGISTRY_SCHEMA_VERSION = 2 as const
export const REGISTRY_COMPILER_CONTRACT_VERSION = '1.0' as const

export const PROHIBITED_FIELD_TOKENS = [
  'prompt',
  'response',
  'reasoning',
  'body',
  'content',
  'args',
  'arguments',
  'toolpayload',
  'payload',
  'token',
  'secret',
  'credential',
  'privatekey',
  'environment',
  'executable',
] as const

export const ASSET_KINDS = [
  'project',
  'skill',
  'plugin',
  'command',
  'loop',
  'workflow',
  'mcp',
  'post',
  'agent-config',
  'control',
  'evaluation',
  'evidence-contract',
  'adapter',
] as const
export type AssetKind = typeof ASSET_KINDS[number]

export const SOURCE_TYPES = [
  'project-registry',
  'project',
  'skills',
  'plugins',
  'commands',
  'loops',
  'workflows',
  'mcps',
  'posts',
  'agent-configs',
  'controls',
  'evaluations',
  'evidence-contracts',
  'adapters',
] as const
export type SourceType = typeof SOURCE_TYPES[number]

export type Platform = 'windows' | 'macos' | 'linux' | 'unknown' | (string & {})
export type Sensitivity = 'internal' | 'sensitive' | 'public'
export type Lifecycle = 'active' | 'draft' | 'deprecated' | 'archived' | 'missing' | 'unknown'
export type IdentityConfidence = 'high' | 'medium' | 'low'
export type DiagnosticSeverity = 'info' | 'warning' | 'error'
export type SkipCategory = 'ambiguous' | 'sensitive' | 'unsupported' | 'unreadable' | 'out-of-scope'
export type ProposalDecision = 'select' | 'exclude' | 'archive' | 'keep'

export interface SourceFingerprint {
  digest: string
  sizeBytes?: number
  modifiedAt?: string
}

export interface BoundedSourceReference {
  sourceType: SourceType
  sourceId: string
  rootId: string
  relativePath?: string
  portableAlias?: string
}

export interface AuthorizedRootSummary {
  rootId: string
  sourceType: SourceType
  platform: Platform
  portableAlias: string
  status: 'inspected' | 'skipped' | 'unreadable' | 'unsupported'
  itemCount: number
}

export interface ReadOnlyDirectoryEntry {
  name: string
  relativePath: string
  kind: 'file' | 'directory' | 'symlink'
  sizeBytes: number
  modifiedAt: string
}

export interface ReadOnlyMetadata {
  relativePath: string
  kind: 'file' | 'directory' | 'symlink'
  sizeBytes: number
  modifiedAt: string
  extension?: string
}

export interface ReadOnlyFileSystemPort {
  listDirectory(relativePath?: string): ReadOnlyDirectoryEntry[]
  readMetadata(relativePath: string): ReadOnlyMetadata
  readAllowlistedManifest(relativePath: string): unknown
}

export interface DiscoveryContext {
  runId: string
  now: string
  platform: Platform
  root: AuthorizedRootSummary
  fileSystem: ReadOnlyFileSystemPort
}

export interface SourceObservation {
  observationId: string
  sourceType: SourceType
  adapterId: string
  adapterVersion: string
  observedAt: string
  platform: Platform
  kind: AssetKind
  provider?: string
  capabilities?: string[]
  stableId?: string
  displayName: string
  format?: string
  version?: string
  owner?: string
  lifecycle?: Lifecycle
  source: BoundedSourceReference
  fingerprint?: SourceFingerprint
}

export interface ProposalLocation {
  rootId: string
  relativePath: string
  localPath?: string
  portableAlias: string
}

export interface ProposalProvenance {
  sourceType: SourceType
  sourceId: string
  adapterId: string
  adapterVersion: string
  rootId: string
  platform?: Platform
  relativePath?: string
  observedAt: string
  fingerprint?: SourceFingerprint
}

export interface BoundedReference {
  kind: 'repository' | 'deployment' | 'artifact'
  reference: string
  rootId?: string
  relativePath?: string
}

export interface AssetProposal {
  proposalId: string
  identityKey: string
  identityConfidence: IdentityConfidence
  kind: AssetKind
  displayName: string
  stableId?: string
  aliases?: string[]
  format?: string
  version?: string
  owner?: string
  provider?: string
  capabilities?: string[]
  lifecycle: Lifecycle
  sensitivity: Sensitivity
  platforms: Platform[]
  locations: ProposalLocation[]
  references?: BoundedReference[]
  provenance: ProposalProvenance[]
  selectedByDefault: boolean
  warnings: string[]
}

export interface SkippedItem {
  sourceType: SourceType
  boundedIdentifier: string
  category: SkipCategory
  guidance: string
  source?: BoundedSourceReference
}

export interface Diagnostic {
  code: string
  severity: DiagnosticSeverity
  message: string
  sourceType?: SourceType
  boundedReference?: string
}

export interface DiscoveryResult {
  sourceType: SourceType
  adapterId: string
  adapterVersion: string
  observedAt: string
  inspectedRoots: AuthorizedRootSummary[]
  observations: SourceObservation[]
  proposals: AssetProposal[]
  skipped: SkippedItem[]
  diagnostics: Diagnostic[]
}

export interface ReviewOverrides {
  displayName?: string
  owner?: string
  sensitivity?: Sensitivity
  lifecycle?: Lifecycle
}

export interface ReviewDecision {
  proposalId: string
  decision: ProposalDecision
  overrides?: ReviewOverrides
}

export interface OutputDescriptor {
  kind: 'local-registry' | 'portable-registry' | 'sidecar' | 'skipped-report' | 'summary'
  path: string
  schemaVersion: number
  digest: string
}

export interface CompilerOutput {
  registrySchemaVersion: typeof REGISTRY_SCHEMA_VERSION
  compilerContractVersion: typeof REGISTRY_COMPILER_CONTRACT_VERSION
  runId: string
  writtenAt: string
  outputs: OutputDescriptor[]
  selectedProposalIds: string[]
  skippedCount: number
  diagnostics: Diagnostic[]
}

export interface RefreshDiff {
  additions: string[]
  modifications: string[]
  duplicates: string[]
  disappeared: string[]
  archived: string[]
}

export interface CliRoute {
  command: 'compile' | 'refresh' | 'validate' | 'help' | 'version'
  roots: string[]
  localOut?: string
  portableOut?: string
  noOpen: boolean
}

export function assertNoProhibitedKeys(value: unknown): void {
  const visit = (candidate: unknown): void => {
    if (Array.isArray(candidate)) {
      candidate.forEach(visit)
      return
    }
    if (!candidate || typeof candidate !== 'object') return

    for (const [key, nested] of Object.entries(candidate)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (PROHIBITED_FIELD_TOKENS.some(token => normalized.includes(token))) {
        throw new Error('Contract contains a prohibited field')
      }
      visit(nested)
    }
  }

  visit(value)
}

export function isContractSafe(value: unknown): boolean {
  try {
    assertNoProhibitedKeys(value)
    return true
  } catch {
    return false
  }
}

export function validateAssetProposal(proposal: AssetProposal): void {
  assertNoProhibitedKeys(proposal)
  if (!proposal.proposalId || !proposal.identityKey || !proposal.displayName) {
    throw new Error('Proposal identity is incomplete')
  }
  if (proposal.provenance.length === 0) {
    throw new Error('Proposal provenance is required')
  }
  if (proposal.locations.length === 0) {
    throw new Error('Proposal location is required')
  }
}
