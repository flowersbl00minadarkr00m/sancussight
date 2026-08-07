import { createHash } from 'node:crypto'

import {
  assertNoProhibitedKeys,
  REGISTRY_SCHEMA_VERSION,
  type AssetProposal,
  type Diagnostic,
  type ReviewDecision,
  type SkippedItem,
} from '../contracts.ts'
import type { ProposalCollision } from '../proposals/merge.ts'
import { proposalFingerprint } from '../refresh/fingerprint.ts'

export interface RegistryCoverage {
  platform: string
  lastVerified?: string
}

export interface RegistryAssetVersionCoverageV1 {
  platform: string
  lastVerified?: string
}

export interface RegistryAssetVersionProviderDependencyV1 {
  provider: string
  capability: string
  fallback?: string
}

export interface RegistryAssetVersionSnapshotV1 {
  format: string
  sharedByDesign: boolean
  registryState: 'active' | 'archived' | 'missing'
  supportedVersion?: string
  coverage: RegistryAssetVersionCoverageV1[]
  providerDependencies: RegistryAssetVersionProviderDependencyV1[]
  dependencyIds: string[]
}

export interface RegistryAssetVersionVerificationV1 {
  checkId: string
  resultId: string
  status: 'pass' | 'warn' | 'fail' | 'accepted' | 'unknown'
  evaluatedAt: string
  safeEvidenceHash?: string
}

export interface RegistryAssetVersionV1 {
  schemaVersion: 1
  id: string
  recordedAt: string
  sourceRefHashes: string[]
  verificationRefs: RegistryAssetVersionVerificationV1[]
  snapshot: RegistryAssetVersionSnapshotV1
  qualification?: 'portable-projection'
  derivedFromVersionId?: string
}

export interface RegistryAssetVersionAliasV1 {
  name: string
  versionId: string
}

export interface RegistryAsset {
  id: string
  name: string
  kind: string
  format: string
  location: string
  owner?: string
  sensitivity: 'internal' | 'sensitive' | 'public'
  sharedByDesign: boolean
  coverage: RegistryCoverage[]
  providerDependencies: Array<{ provider: string; capability: string; fallback?: string }>
  evidence: Array<{ label: string; date: string }>
  stableId?: string
  supportedVersion?: string
  registryState?: 'active' | 'archived' | 'missing'
  versions?: RegistryAssetVersionV1[]
  versionAliases?: RegistryAssetVersionAliasV1[]
  currentVersionId?: string
}

export interface LocalRegistry {
  schemaVersion: typeof REGISTRY_SCHEMA_VERSION
  platforms: string[]
  updatedAt: string
  assets: RegistryAsset[]
  provenance: {
    mode: 'local'
    sourceUpdatedAt: string
    connectedAt?: string
  }
}

export interface RefreshSidecarEntry {
  proposalId: string
  identityKey: string
  fingerprint?: string
  state: 'active' | 'archived' | 'missing'
}

export interface RefreshSidecar {
  schemaVersion: 1
  compilerContractVersion: string
  runId: string
  updatedAt: string
  entries: RefreshSidecarEntry[]
}

export interface SkippedReport {
  schemaVersion: 1
  runId: string
  skipped: SkippedItem[]
}

export interface RunSummary {
  schemaVersion: 1
  runId: string
  inspectedRoots: number
  adapterCount: number
  proposalCount: number
  selectedCount: number
  skippedCount: number
  outputHashes: Record<string, string>
  diagnostics: Diagnostic[]
}

export interface SerializerOptions {
  runId: string
  now: string
  compilerContractVersion?: string
  previousRegistry?: LocalRegistry
  previousSidecar?: RefreshSidecar
  collisions?: ProposalCollision[]
  skipped?: SkippedItem[]
  diagnostics?: Diagnostic[]
  inspectedRoots?: number
  adapterCount?: number
}

export interface SerializedRegistryOutputs {
  local: LocalRegistry
  portable: LocalRegistry
  sidecar: RefreshSidecar
  skippedReport: SkippedReport
  summary: RunSummary
  selectedProposalIds: string[]
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function sanitizeAlias(value: string): string {
  return value.replace(/[^a-zA-Z0-9:_./-]/g, '-').slice(0, 160)
}

const RECORDED_VERSION_ID_PATTERN = /^av1_[0-9a-f]{32}$/
const PORTABLE_VERSION_ID_PATTERN = /^av1p_[0-9a-f]{32}$/
const VERSION_ID_PATTERN = /^(?:av1|av1p)_[0-9a-f]{32}$/
const SHA256_PATTERN = /^[0-9a-f]{64}$/
const ALIAS_PATTERN = /^[\p{L}\p{N} ._/-]+$/u
const VERSION_LIMITS = Object.freeze({
  versionsPerAsset: 50,
  aliasesPerVersion: 16,
  aliasesPerAsset: 64,
  sourceRefHashesPerVersion: 32,
  verificationRefsPerVersion: 32,
  labelLength: 160,
  aliasLength: 64,
})
const VERSION_STATUSES = new Set(['pass', 'warn', 'fail', 'accepted', 'unknown'])
const VERSION_REGISTRY_STATES = new Set(['active', 'archived', 'missing'])
const PORTABLE_PRIVATE_VALUE = /private\s*key|credential|secret|token|prompt|response|reasoning|command[_ -]?arguments?/gi
const PORTABLE_ABSOLUTE_PATH = /(?:[A-Za-z]:[\\/]|(?:^|[\\/])(?:Users|home)[\\/])/i
const PORTABLE_USER_IDENTITY = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/

function sanitizePortableVersionLabel(value: string): string {
  if (PORTABLE_ABSOLUTE_PATH.test(value)) return 'local-reference'
  if (PORTABLE_USER_IDENTITY.test(value)) return 'local-identity'
  const sanitized = sanitizeAlias(value).replace(PORTABLE_PRIVATE_VALUE, 'redacted')
  return sanitized || 'local-label'
}

function portableLocation(proposal: AssetProposal): string {
  const location = proposal.locations[0]
  if (!location) return 'root:unknown'
  return sanitizeAlias(`${location.portableAlias}/${location.relativePath}`)
}

function localLocation(proposal: AssetProposal): string {
  const location = proposal.locations[0]
  if (!location) return 'root:unknown'
  return location.localPath ?? `${location.rootId}/${location.relativePath}`
}

function dateOnly(value: string, fallback: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : fallback.slice(0, 10)
}

function decisionFor(proposal: AssetProposal, decisions: Map<string, ReviewDecision>): ReviewDecision | undefined {
  return decisions.get(proposal.proposalId)
}

function projectAsset(
  proposal: AssetProposal,
  decision: ReviewDecision,
  now: string,
  portable: boolean,
  previous?: RegistryAsset,
): RegistryAsset {
  const overrides = decision.overrides
  const sensitivity = overrides?.sensitivity ?? proposal.sensitivity
  const name = overrides?.displayName ?? proposal.displayName
  const owner = overrides?.owner ?? proposal.owner
  const location = portable ? portableLocation(proposal) : localLocation(proposal)
  const projected: RegistryAsset = {
    id: proposal.stableId ?? proposal.proposalId,
    name,
    kind: proposal.kind,
    format: proposal.format ?? 'json',
    location,
    ...(owner ? { owner: portable ? 'owner:local' : owner } : {}),
    sensitivity,
    sharedByDesign: true,
    coverage: proposal.platforms.map(platform => ({ platform })),
    providerDependencies: proposal.provider ? [{ provider: proposal.provider, capability: 'declared metadata provider' }] : [],
    evidence: [{ label: `${proposal.provenance[0]?.sourceType ?? 'local'} metadata observation`, date: dateOnly(proposal.provenance[0]?.observedAt ?? now, now) }],
    stableId: proposal.stableId,
    supportedVersion: proposal.version,
    registryState: overrides?.lifecycle === 'archived' ? 'archived' : 'active',
  }
  return preserveVersionMetadata(projected, previous, portable)
}

function archiveAsset(asset: RegistryAsset, portable: boolean): RegistryAsset {
  const archivedDependencies = portable
    ? asset.providerDependencies.map(dependency => ({ provider: sanitizeAlias(dependency.provider), capability: sanitizeAlias(dependency.capability), ...(dependency.fallback ? { fallback: sanitizeAlias(dependency.fallback) } : {}) }))
    : asset.providerDependencies
  const archived: RegistryAsset = {
    id: asset.id,
    name: portable ? sanitizeAlias(asset.name) : asset.name,
    kind: asset.kind,
    format: asset.format,
    location: portable ? `archived:${sanitizeAlias(asset.stableId ?? asset.id)}` : asset.location,
    ...(asset.owner ? { owner: portable ? 'owner:local' : asset.owner } : {}),
    sensitivity: asset.sensitivity,
    sharedByDesign: false,
    coverage: asset.coverage,
    providerDependencies: archivedDependencies,
    evidence: portable ? asset.evidence.map(point => ({ label: 'Archived metadata observation', date: point.date })) : asset.evidence,
    stableId: asset.stableId,
    supportedVersion: asset.supportedVersion,
    registryState: 'missing',
  }
  return preserveVersionMetadata(archived, asset, portable)
}

function preserveVersionMetadata(
  target: RegistryAsset,
  previous: RegistryAsset | undefined,
  portable: boolean,
): RegistryAsset {
  if (!previous || !Object.hasOwn(previous, 'versions')) return target
  if (!portable) {
    return {
      ...target,
      versions: previous.versions,
      ...(Object.hasOwn(previous, 'versionAliases')
        ? { versionAliases: previous.versionAliases }
        : {}),
      ...(Object.hasOwn(previous, 'currentVersionId')
        ? { currentVersionId: previous.currentVersionId }
        : {}),
    }
  }

  const projected = projectPortableVersionHistory(previous)
  if (!projected) return target
  return {
    ...target,
    versions: projected.versions,
    ...(projected.versionAliases ? { versionAliases: projected.versionAliases } : {}),
    ...(projected.currentVersionId ? { currentVersionId: projected.currentVersionId } : {}),
  }
}

function projectPortableVersionHistory(previous: RegistryAsset): {
  versions: RegistryAssetVersionV1[]
  versionAliases?: RegistryAssetVersionAliasV1[]
  currentVersionId?: string
} | undefined {
  try {
    const idMap = new Map<string, string>()
    const versions = previous.versions!.map((version) => {
      const snapshot: RegistryAssetVersionSnapshotV1 = {
        ...version.snapshot,
        coverage: version.snapshot.coverage.map(entry => ({ ...entry })),
        providerDependencies: version.snapshot.providerDependencies.map(dependency => ({
          provider: sanitizePortableVersionLabel(dependency.provider),
          capability: sanitizePortableVersionLabel(dependency.capability),
          ...(dependency.fallback === undefined
            ? {}
            : { fallback: sanitizePortableVersionLabel(dependency.fallback) }),
        })).sort(compareVersionProviderDependencies),
        dependencyIds: [...version.snapshot.dependencyIds],
      }
      if (canonicalJson(snapshot) === canonicalJson(version.snapshot)) {
        idMap.set(version.id, version.id)
        return structuredClone(version)
      }
      const derivativeWithoutId: Omit<RegistryAssetVersionV1, 'id'> = {
        schemaVersion: 1,
        recordedAt: version.recordedAt,
        sourceRefHashes: [...version.sourceRefHashes],
        verificationRefs: version.verificationRefs.map(reference => ({ ...reference })),
        snapshot,
        qualification: 'portable-projection',
        derivedFromVersionId: version.id,
      }
      const derivative: RegistryAssetVersionV1 = {
        ...derivativeWithoutId,
        id: computeRegistryAssetVersionId(derivativeWithoutId),
      }
      idMap.set(version.id, derivative.id)
      return derivative
    })
    const versionAliases = previous.versionAliases?.map(alias => {
      const versionId = idMap.get(alias.versionId)
      if (!versionId) throw new Error('Portable alias target could not be remapped')
      return { ...alias, versionId }
    })
    const currentVersionId = previous.currentVersionId
      ? idMap.get(previous.currentVersionId)
      : undefined
    if (previous.currentVersionId && !currentVersionId) {
      throw new Error('Portable current version could not be remapped')
    }
    const candidate = {
      versions,
      ...(versionAliases ? { versionAliases } : {}),
      ...(currentVersionId ? { currentVersionId } : {}),
    }
    assertAssetVersionMetadata(candidate)
    return candidate
  } catch {
    return undefined
  }
}

function registryFromAssets(assets: RegistryAsset[], now: string, portable: boolean): LocalRegistry {
  const platforms = [...new Set(assets.flatMap(asset => asset.coverage.map(entry => entry.platform)))].sort()
  const registry: LocalRegistry = {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    platforms,
    updatedAt: now,
    assets,
    provenance: { mode: 'local', sourceUpdatedAt: now, ...(portable ? {} : { connectedAt: now }) },
  }
  assertRegistryImportable(registry)
  return registry
}

export function assertRegistryImportable(value: unknown): asserts value is LocalRegistry {
  assertNoProhibitedKeys(value)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Registry output must be an object')
  const registry = value as Record<string, unknown>
  if (registry.schemaVersion !== REGISTRY_SCHEMA_VERSION || !Array.isArray(registry.platforms) || !Array.isArray(registry.assets)) {
    throw new Error('Registry output schema is invalid')
  }
  for (const asset of registry.assets) {
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) throw new Error('Registry asset is invalid')
    const item = asset as Record<string, unknown>
    if (!['id', 'name', 'kind', 'format', 'location', 'sensitivity'].every(key => typeof item[key] === 'string')) throw new Error('Registry asset identity is incomplete')
    if (typeof item.sharedByDesign !== 'boolean' || !Array.isArray(item.coverage) || !Array.isArray(item.providerDependencies) || !Array.isArray(item.evidence)) {
      throw new Error('Registry asset shape is invalid')
    }
    assertAssetVersionMetadata(item)
  }
}

function assertAssetVersionMetadata(asset: Record<string, unknown>): void {
  const hasVersions = Object.hasOwn(asset, 'versions')
  const hasAliases = Object.hasOwn(asset, 'versionAliases')
  const hasCurrent = Object.hasOwn(asset, 'currentVersionId')
  if (!hasVersions && !hasAliases && !hasCurrent) return
  if (hasVersions && !Array.isArray(asset.versions)) throw new Error('Registry asset versions are invalid')
  if (hasAliases && !Array.isArray(asset.versionAliases)) throw new Error('Registry asset version aliases are invalid')
  if (hasCurrent && typeof asset.currentVersionId !== 'string') throw new Error('Registry asset current version is invalid')

  const versions = hasVersions ? asset.versions as unknown[] : []
  const aliases = hasAliases ? asset.versionAliases as unknown[] : []
  if (versions.length > VERSION_LIMITS.versionsPerAsset || !versions.every(isRegistryAssetVersion)) {
    throw new Error('Registry asset version history is invalid')
  }
  for (const version of versions as RegistryAssetVersionV1[]) {
    if (version.id !== computeRegistryAssetVersionId(version)) {
      throw new Error('Registry asset version identity does not match its canonical preimage')
    }
  }
  if (aliases.length > VERSION_LIMITS.aliasesPerAsset || !aliases.every(isRegistryAssetVersionAlias)) {
    throw new Error('Registry asset version aliases are invalid')
  }

  const versionIds = versions.map(version => (version as RegistryAssetVersionV1).id)
  if (new Set(versionIds).size !== versionIds.length) throw new Error('Registry asset version IDs must be unique')
  for (let index = 1; index < versions.length; index += 1) {
    const previous = versions[index - 1] as RegistryAssetVersionV1
    const current = versions[index] as RegistryAssetVersionV1
    if (Date.parse(current.recordedAt) < Date.parse(previous.recordedAt)) {
      throw new Error('Registry asset versions must be chronological')
    }
    if (versionEquivalenceKey(current) === versionEquivalenceKey(previous)) {
      throw new Error('Registry asset versions must contain distinct consecutive states')
    }
  }

  if (versions.length === 0) {
    if (hasCurrent || aliases.length > 0) throw new Error('Empty version history cannot have pointers')
  } else if (!hasCurrent || asset.currentVersionId !== versionIds.at(-1)) {
    throw new Error('Registry asset current version must point to the latest version')
  }

  const aliasNames = aliases.map(alias => (alias as RegistryAssetVersionAliasV1).name.toLowerCase())
  if (new Set(aliasNames).size !== aliasNames.length) throw new Error('Registry asset aliases must be case-insensitively unique')
  if (aliases.some(alias => !versionIds.includes((alias as RegistryAssetVersionAliasV1).versionId))) {
    throw new Error('Registry asset alias target is invalid')
  }
  const aliasCounts = new Map<string, number>()
  for (const alias of aliases as RegistryAssetVersionAliasV1[]) {
    aliasCounts.set(alias.versionId, (aliasCounts.get(alias.versionId) ?? 0) + 1)
  }
  if ([...aliasCounts.values()].some(count => count > VERSION_LIMITS.aliasesPerVersion)) {
    throw new Error('Registry asset aliases exceed the per-version limit')
  }
}

function isRegistryAssetVersion(value: unknown): value is RegistryAssetVersionV1 {
  if (!isRecord(value)) return false
  const portable = value.qualification === 'portable-projection'
  const expectedKeys = portable
    ? [
        'schemaVersion',
        'id',
        'recordedAt',
        'sourceRefHashes',
        'verificationRefs',
        'snapshot',
        'qualification',
        'derivedFromVersionId',
      ]
    : ['schemaVersion', 'id', 'recordedAt', 'sourceRefHashes', 'verificationRefs', 'snapshot']
  if (!hasExactKeys(value, expectedKeys)) return false
  if (value.schemaVersion !== 1
    || typeof value.id !== 'string'
    || !(portable ? PORTABLE_VERSION_ID_PATTERN : RECORDED_VERSION_ID_PATTERN).test(value.id)
    || (portable && (typeof value.derivedFromVersionId !== 'string'
      || !VERSION_ID_PATTERN.test(value.derivedFromVersionId)))) return false
  if (typeof value.recordedAt !== 'string' || !isIsoTimestamp(value.recordedAt)) return false
  if (!Array.isArray(value.sourceRefHashes)
    || value.sourceRefHashes.length > VERSION_LIMITS.sourceRefHashesPerVersion
    || !value.sourceRefHashes.every(hash => typeof hash === 'string' && SHA256_PATTERN.test(hash))
    || !isStrictlySortedUnique(value.sourceRefHashes)) return false
  if (!Array.isArray(value.verificationRefs)
    || value.verificationRefs.length > VERSION_LIMITS.verificationRefsPerVersion
    || !value.verificationRefs.every(isRegistryAssetVersionVerification)
    || !isSortedUniqueBy(value.verificationRefs, versionVerificationKey, compareVersionVerificationRefs)) return false
  return isRegistryAssetVersionSnapshot(value.snapshot)
}

function isRegistryAssetVersionSnapshot(value: unknown): value is RegistryAssetVersionSnapshotV1 {
  if (!isRecord(value)) return false
  const required = ['format', 'sharedByDesign', 'registryState', 'coverage', 'providerDependencies', 'dependencyIds']
  if (!hasOnlyKeys(value, [...required, 'supportedVersion']) || !required.every(key => Object.hasOwn(value, key))) return false
  if (!isBoundedVersionLabel(value.format) || typeof value.sharedByDesign !== 'boolean') return false
  if (typeof value.registryState !== 'string' || !VERSION_REGISTRY_STATES.has(value.registryState)) return false
  if (Object.hasOwn(value, 'supportedVersion') && !isBoundedVersionLabel(value.supportedVersion)) return false
  if (!Array.isArray(value.coverage)
    || !value.coverage.every(isRegistryAssetVersionCoverage)
    || !isSortedUniqueBy(value.coverage, entry => entry.platform, compareVersionCoverage)) return false
  if (!Array.isArray(value.providerDependencies)
    || !value.providerDependencies.every(isRegistryAssetVersionProviderDependency)
    || !isSortedUniqueBy(value.providerDependencies, versionProviderDependencyKey, compareVersionProviderDependencies)) return false
  return Array.isArray(value.dependencyIds)
    && value.dependencyIds.every(isBoundedVersionLabel)
    && isStrictlySortedUnique(value.dependencyIds)
}

function isRegistryAssetVersionCoverage(value: unknown): value is RegistryAssetVersionCoverageV1 {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ['platform', 'lastVerified'])
    || !Object.hasOwn(value, 'platform')
    || !isBoundedVersionLabel(value.platform)) return false
  return !Object.hasOwn(value, 'lastVerified')
    || (typeof value.lastVerified === 'string' && isCanonicalIsoDate(value.lastVerified))
}

function isRegistryAssetVersionProviderDependency(value: unknown): value is RegistryAssetVersionProviderDependencyV1 {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ['provider', 'capability', 'fallback'])
    || !Object.hasOwn(value, 'provider')
    || !Object.hasOwn(value, 'capability')
    || !isBoundedVersionLabel(value.provider)
    || !isBoundedVersionLabel(value.capability)) return false
  return !Object.hasOwn(value, 'fallback') || isBoundedVersionLabel(value.fallback)
}

function isRegistryAssetVersionVerification(value: unknown): value is RegistryAssetVersionVerificationV1 {
  if (!isRecord(value)
    || !hasOnlyKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt', 'safeEvidenceHash'])
    || !['checkId', 'resultId', 'status', 'evaluatedAt'].every(key => Object.hasOwn(value, key))) return false
  if (!isBoundedVersionLabel(value.checkId)
    || !isBoundedVersionLabel(value.resultId)
    || typeof value.status !== 'string'
    || !VERSION_STATUSES.has(value.status)
    || typeof value.evaluatedAt !== 'string'
    || !isIsoTimestamp(value.evaluatedAt)) return false
  return !Object.hasOwn(value, 'safeEvidenceHash')
    || (typeof value.safeEvidenceHash === 'string' && SHA256_PATTERN.test(value.safeEvidenceHash))
}

function isRegistryAssetVersionAlias(value: unknown): value is RegistryAssetVersionAliasV1 {
  return hasExactKeys(value, ['name', 'versionId'])
    && typeof value.name === 'string'
    && value.name === value.name.trim()
    && value.name.length >= 1
    && value.name.length <= VERSION_LIMITS.aliasLength
    && ALIAS_PATTERN.test(value.name)
    && typeof value.versionId === 'string'
    && VERSION_ID_PATTERN.test(value.versionId)
}

function versionEquivalenceKey(version: RegistryAssetVersionV1): string {
  return canonicalJson({
    snapshot: version.snapshot,
    sourceRefHashes: version.sourceRefHashes,
    verificationRefs: version.verificationRefs.map(reference => ({
      checkId: reference.checkId,
      resultId: reference.resultId,
      status: reference.status,
      ...(reference.safeEvidenceHash === undefined ? {} : { safeEvidenceHash: reference.safeEvidenceHash }),
    })),
  })
}

export function computeRegistryAssetVersionId(
  version: Omit<RegistryAssetVersionV1, 'id'> | RegistryAssetVersionV1,
): string {
  const projection = version.qualification === 'portable-projection'
    ? {
        derivedFromVersionId: version.derivedFromVersionId,
        qualification: version.qualification,
        recordedAt: version.recordedAt,
        snapshot: version.snapshot,
        sourceRefHashes: version.sourceRefHashes,
        verificationRefs: version.verificationRefs,
      }
    : {
        recordedAt: version.recordedAt,
        snapshot: version.snapshot,
        sourceRefHashes: version.sourceRefHashes,
        verificationRefs: version.verificationRefs,
      }
  const identityDigest = createHash('sha256').update(canonicalJson(projection)).digest('hex')
  return `${version.qualification === 'portable-projection' ? 'av1p' : 'av1'}_${identityDigest.slice(0, 32)}`
}

function isBoundedVersionLabel(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= 1
    && value.length <= VERSION_LIMITS.labelLength
    && !/[\u0000-\u001f\u007f]/u.test(value)
}

function isIsoTimestamp(value: string): boolean {
  return isCanonicalIsoTimestamp(value)
}

function isCanonicalIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1) return false
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]
  return day <= daysInMonth[month - 1]
}

function isCanonicalIsoTimestamp(value: string): boolean {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/.exec(value)
  if (!match || !isCanonicalIsoDate(match[1])) return false
  if (Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) {
    return false
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) return false
  return match[5] === undefined
    ? parsed.toISOString().replace('.000Z', 'Z') === value
    : parsed.toISOString() === value
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function versionVerificationKey(reference: RegistryAssetVersionVerificationV1): string {
  return `${reference.checkId}:${reference.resultId}`
}

function versionProviderDependencyKey(dependency: RegistryAssetVersionProviderDependencyV1): string {
  return `${dependency.provider}:${dependency.capability}`
}

function compareVersionCoverage(left: RegistryAssetVersionCoverageV1, right: RegistryAssetVersionCoverageV1): number {
  return compareText(left.platform, right.platform)
}

function compareVersionProviderDependencies(
  left: RegistryAssetVersionProviderDependencyV1,
  right: RegistryAssetVersionProviderDependencyV1,
): number {
  return compareText(versionProviderDependencyKey(left), versionProviderDependencyKey(right))
}

function compareVersionVerificationRefs(
  left: RegistryAssetVersionVerificationV1,
  right: RegistryAssetVersionVerificationV1,
): number {
  return compareText(versionVerificationKey(left), versionVerificationKey(right))
}

function isStrictlySortedUnique(values: readonly string[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (compareText(values[index - 1], values[index]) >= 0) return false
  }
  return true
}

function isSortedUniqueBy<T>(
  values: readonly T[],
  key: (value: T) => string,
  compare: (left: T, right: T) => number,
): boolean {
  const keys = values.map(key)
  if (new Set(keys).size !== keys.length) return false
  for (let index = 1; index < values.length; index += 1) {
    if (compare(values[index - 1], values[index]) >= 0) return false
  }
  return true
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (isRecord(value)) {
    return `{${Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
      .join(',')}}`
  }
  const encoded = JSON.stringify(value)
  if (encoded === undefined) throw new Error('Unsupported canonical value')
  return encoded
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function hasExactKeys(value: unknown, expected: readonly string[]): value is Record<string, unknown> {
  return isRecord(value)
    && Object.keys(value).length === expected.length
    && expected.every(key => Object.hasOwn(value, key))
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every(key => allowed.includes(key))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function serializeConfirmedProposals(proposals: AssetProposal[], decisions: ReviewDecision[], options: SerializerOptions): SerializedRegistryOutputs {
  if (options.previousRegistry) assertRegistryImportable(options.previousRegistry)
  const decisionMap = new Map(decisions.map(decision => [decision.proposalId, decision]))
  const selected = proposals.filter(proposal => {
    const decision = decisionFor(proposal, decisionMap)
    return decision?.decision === 'select' || decision?.decision === 'keep'
  })
  const privacySkipped: SkippedItem[] = [...(options.skipped ?? [])]
  const diagnostics: Diagnostic[] = [...(options.diagnostics ?? [])]
  const safeSelected = selected.filter(proposal => {
    if (proposal.sensitivity === 'sensitive') {
      privacySkipped.push({ sourceType: proposal.provenance[0]?.sourceType ?? 'project', boundedIdentifier: proposal.proposalId, category: 'sensitive', guidance: 'Sensitive proposal was excluded before output serialization.' })
      diagnostics.push({ code: 'SENSITIVE_PROPOSAL_EXCLUDED', severity: 'warning', message: 'A sensitive proposal was excluded before output serialization.' })
      return false
    }
    return true
  })
  const previousAssets = options.previousRegistry?.assets ?? []
  const previousByIdentity = new Map(previousAssets.map(asset => [asset.stableId ?? asset.id, asset]))
  const localAssets = safeSelected.map(proposal => projectAsset(
    proposal,
    decisionMap.get(proposal.proposalId)!,
    options.now,
    false,
    previousByIdentity.get(proposal.stableId ?? proposal.proposalId),
  ))
  const portableAssets = safeSelected.map(proposal => projectAsset(
    proposal,
    decisionMap.get(proposal.proposalId)!,
    options.now,
    true,
    previousByIdentity.get(proposal.stableId ?? proposal.proposalId),
  ))
  const currentIds = new Set(safeSelected.map(proposal => proposal.stableId ?? proposal.proposalId))
  const missing = previousAssets.filter(asset => !currentIds.has(asset.stableId ?? asset.id)).map(asset => archiveAsset(asset, false))
  const missingPortable = previousAssets.filter(asset => !currentIds.has(asset.stableId ?? asset.id)).map(asset => archiveAsset(asset, true))
  const local = registryFromAssets([...localAssets, ...missing], options.now, false)
  const portable = registryFromAssets([...portableAssets, ...missingPortable], options.now, true)
  const sidecar: RefreshSidecar = {
    schemaVersion: 1,
    compilerContractVersion: options.compilerContractVersion ?? '1.0',
    runId: options.runId,
    updatedAt: options.now,
    entries: [
      ...safeSelected.map(proposal => ({ proposalId: proposal.proposalId, identityKey: proposal.identityKey, fingerprint: proposalFingerprint(proposal), state: 'active' as const })),
      ...missing.map(asset => ({ proposalId: asset.id, identityKey: asset.stableId ?? asset.id, state: 'missing' as const })),
    ].sort((a, b) => a.proposalId.localeCompare(b.proposalId)),
  }
  const skippedReport: SkippedReport = { schemaVersion: 1, runId: options.runId, skipped: privacySkipped }
  assertNoProhibitedKeys(skippedReport)
  const summary: RunSummary = {
    schemaVersion: 1,
    runId: options.runId,
    inspectedRoots: options.inspectedRoots ?? 0,
    adapterCount: options.adapterCount ?? 0,
    proposalCount: proposals.length,
    selectedCount: safeSelected.length,
    skippedCount: privacySkipped.length,
    outputHashes: { local: digest(local), portable: digest(portable), sidecar: digest(sidecar), skipped: digest(skippedReport) },
    diagnostics,
  }
  assertNoProhibitedKeys(summary)
  return { local, portable, sidecar, skippedReport, summary, selectedProposalIds: safeSelected.map(proposal => proposal.proposalId) }
}
