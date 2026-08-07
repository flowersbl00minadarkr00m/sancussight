import type {
  Asset,
  AssetVersionAliasV1,
  AssetVersionComparisonItem,
  AssetVersionComparisonState,
  AssetVersionComparisonV1,
  AssetVersionSnapshotV1,
  AssetVersionV1,
  AssetVersionVerificationV1,
  SignalStatus,
} from '../types.ts'
import type { CheckResultProjection } from './check-catalog.ts'

export const ASSET_VERSION_LIMITS = Object.freeze({
  versionsPerAsset: 50,
  aliasesPerVersion: 16,
  aliasesPerAsset: 64,
  sourceRefHashesPerVersion: 32,
  verificationRefsPerVersion: 32,
  comparisonItems: 100,
  labelLength: 160,
  aliasLength: 64,
})

export type Sha256 = (input: string) => Promise<string>

export interface RecordAssetVersionInput {
  recordedAt: string
  sourceRefHashes?: readonly string[]
  verificationRefs?: readonly AssetVersionVerificationV1[]
}

export type RecordAssetVersionResult =
  | { status: 'recorded'; asset: Asset; version: AssetVersionV1 }
  | { status: 'deduplicated'; asset: Asset; version: AssetVersionV1 }

const RECORDED_VERSION_ID_PATTERN = /^av1_[0-9a-f]{32}$/
const PORTABLE_VERSION_ID_PATTERN = /^av1p_[0-9a-f]{32}$/
const VERSION_ID_PATTERN = /^(?:av1|av1p)_[0-9a-f]{32}$/
const SHA256_PATTERN = /^[0-9a-f]{64}$/
const ALIAS_PATTERN = /^[\p{L}\p{N} ._/-]+$/u
const SIGNAL_STATUSES = new Set<SignalStatus>(['pass', 'warn', 'fail', 'accepted', 'unknown'])
const REGISTRY_STATES = new Set(['active', 'archived', 'missing'])
const OPEN_FORMATS = new Set(['markdown', 'json', 'yaml'])

export function projectAssetVersionSnapshot(asset: Asset): AssetVersionSnapshotV1 {
  const coverage = asset.coverage.map((entry) => ({
    platform: boundedString(entry.platform, 'coverage platform'),
    ...(entry.lastVerified === undefined
      ? {}
      : { lastVerified: canonicalIsoDate(entry.lastVerified, 'coverage verification date') }),
  })).sort(compareCoverageEntries)
  const providerDependencies = asset.providerDependencies.map((dependency) => ({
    provider: boundedString(dependency.provider, 'dependency provider'),
    capability: boundedString(dependency.capability, 'dependency capability'),
    ...(dependency.fallback === undefined
      ? {}
      : { fallback: boundedString(dependency.fallback, 'dependency fallback') }),
  })).sort(compareProviderDependencies)
  const dependencyIds = sortedUnique(
    (asset.dependsOn ?? []).map((dependencyId) => boundedString(dependencyId, 'dependency ID')),
  )

  assertNoDuplicateCoverage(coverage)
  assertNoDuplicateProviderDependencies(providerDependencies)

  return {
    format: boundedString(asset.format, 'asset format'),
    sharedByDesign: asset.sharedByDesign,
    registryState: asset.registryState ?? 'active',
    ...(asset.supportedVersion === undefined
      ? {}
      : { supportedVersion: boundedString(asset.supportedVersion, 'supported version') }),
    coverage,
    providerDependencies,
    dependencyIds,
  }
}

export function projectAssetVersionVerificationRefs(
  results: readonly CheckResultProjection[],
): AssetVersionVerificationV1[] {
  const refs = results.flatMap((result) => {
    if (result.kind !== 'cataloged') return []
    if (!result.evaluatedAt) {
      throw new Error(`Cataloged check result ${result.checkId} has no stable evaluatedAt timestamp.`)
    }
    const safeEvidenceHashes = sortedUnique(result.evidence.flatMap((evidence) => (
      evidence.reference && SHA256_PATTERN.test(evidence.reference)
        ? [evidence.reference]
        : []
    )))
    return [{
      checkId: result.checkId,
      resultId: result.resultDiscriminator,
      status: result.status,
      evaluatedAt: normalizeVerificationTimestamp(result.evaluatedAt),
      ...(safeEvidenceHashes[0] ? { safeEvidenceHash: safeEvidenceHashes[0] } : {}),
    }]
  })
  return normalizeVerificationRefs(refs)
}

export async function recordAssetVersion(
  asset: Asset,
  input: RecordAssetVersionInput,
  sha256: Sha256,
): Promise<RecordAssetVersionResult> {
  if (!validateAssetVersionMetadata(asset)) {
    throw new Error('Existing asset version metadata is invalid.')
  }
  if (!isIsoTimestamp(input.recordedAt)) {
    throw new Error('Version recordedAt must be a valid ISO timestamp.')
  }

  const sourceRefHashes = normalizeHashes(
    input.sourceRefHashes ?? [],
    ASSET_VERSION_LIMITS.sourceRefHashesPerVersion,
    'source reference hash',
  )
  const verificationRefs = normalizeVerificationRefs(input.verificationRefs ?? [])
  const snapshot = projectAssetVersionSnapshot(asset)
  const previous = asset.versions?.at(-1)
  const qualifiedState = { snapshot, sourceRefHashes, verificationRefs }
  if (previous
    && previous.qualification !== 'portable-projection'
    && assetVersionEquivalenceKey(previous) === assetVersionEquivalenceKey(qualifiedState)) {
    return { status: 'deduplicated', asset, version: previous }
  }

  const identityInput: Omit<AssetVersionV1, 'id'> = {
    schemaVersion: 1,
    recordedAt: input.recordedAt,
    sourceRefHashes,
    verificationRefs,
    snapshot,
  }
  const version: AssetVersionV1 = {
    ...identityInput,
    id: await computeAssetVersionId(identityInput, sha256),
  }
  const existing = asset.versions ?? []
  if (existing.some((candidate) => candidate.id === version.id)) {
    throw new Error('Version identity collides with an existing distinct version.')
  }

  const versions = [...existing, version].slice(-ASSET_VERSION_LIMITS.versionsPerAsset)
  const retainedIds = new Set(versions.map((candidate) => candidate.id))
  const versionAliases = (asset.versionAliases ?? [])
    .filter((alias) => retainedIds.has(alias.versionId))
    .map((alias) => ({ ...alias }))

  return {
    status: 'recorded',
    version,
    asset: {
      ...asset,
      versions,
      versionAliases,
      currentVersionId: version.id,
    },
  }
}

export function assignAssetVersionAlias(asset: Asset, name: string, versionId: string): Asset {
  assertValidMetadataForMutation(asset)
  if (!asset.versions?.some((version) => version.id === versionId)) {
    throw new Error('Alias target must be a valid recorded version.')
  }

  const normalizedName = normalizeAliasName(name)
  const comparisonName = aliasComparisonKey(normalizedName)
  const aliases = (asset.versionAliases ?? []).filter(
    (alias) => aliasComparisonKey(alias.name) !== comparisonName,
  )
  aliases.push({ name: normalizedName, versionId })
  aliases.sort(compareAliases)
  assertAliasBounds(aliases)

  return {
    ...asset,
    versionAliases: aliases,
  }
}

export function removeAssetVersionAlias(asset: Asset, name: string): Asset {
  assertValidMetadataForMutation(asset)
  const comparisonName = aliasComparisonKey(normalizeAliasName(name))
  return {
    ...asset,
    versionAliases: (asset.versionAliases ?? []).filter(
      (alias) => aliasComparisonKey(alias.name) !== comparisonName,
    ).map((alias) => ({ ...alias })),
  }
}

export function compareCurrentAssetVersions(asset: Asset): AssetVersionComparisonV1 {
  if (!validateAssetVersionMetadata(asset)) {
    throw new Error('Asset version metadata is invalid and cannot be compared.')
  }
  const versions = asset.versions ?? []
  if (versions.length < 2 || !asset.currentVersionId) {
    return {
      state: 'no-previous-version',
      ...(asset.currentVersionId ? { currentVersionId: asset.currentVersionId } : {}),
      items: [],
    }
  }

  const currentIndex = versions.findIndex((version) => version.id === asset.currentVersionId)
  if (currentIndex < 1) {
    return {
      state: 'no-previous-version',
      currentVersionId: asset.currentVersionId,
      items: [],
    }
  }
  return compareAssetVersions(versions[currentIndex], versions[currentIndex - 1])
}

export function compareAssetVersions(
  current: AssetVersionV1,
  previous: AssetVersionV1,
): AssetVersionComparisonV1 {
  if (!isAssetVersion(current) || !isAssetVersion(previous)) {
    throw new Error('Unsupported or invalid asset version comparison input.')
  }

  const items: AssetVersionComparisonItem[] = [
    factItem(
      'fact:format',
      'Format',
      previous.snapshot.format,
      current.snapshot.format,
      classifyFormatTransition,
    ),
    factItem(
      'fact:shared-by-design',
      'Shared by design',
      String(previous.snapshot.sharedByDesign),
      String(current.snapshot.sharedByDesign),
      classifyBooleanTransition,
    ),
    factItem(
      'fact:registry-state',
      'Registry state',
      previous.snapshot.registryState,
      current.snapshot.registryState,
      classifyRegistryStateTransition,
    ),
    factItem(
      'fact:supported-version',
      'Supported version',
      displayValue(previous.snapshot.supportedVersion),
      displayValue(current.snapshot.supportedVersion),
      classifyChanged,
    ),
    ...buildCoverageComparison(previous.snapshot, current.snapshot),
    ...buildFallbackComparison(previous.snapshot, current.snapshot),
    ...buildDependencyComparison(previous.snapshot, current.snapshot),
    ...buildVerificationComparison(previous.verificationRefs, current.verificationRefs),
  ]

  const meaningfulItems = items.filter((item) => item.state !== 'unchanged')
  const unchangedItems = items.filter((item) => item.state === 'unchanged')
  if (meaningfulItems.length > ASSET_VERSION_LIMITS.comparisonItems) {
    return {
      state: 'unavailable-too-many-changes',
      currentVersionId: current.id,
      previousVersionId: previous.id,
      items: [],
      totalItems: items.length,
      totalMeaningfulItems: meaningfulItems.length,
      truncated: true,
      omittedUnchangedCount: unchangedItems.length,
    }
  }
  const includedUnchanged = unchangedItems.slice(
    0,
    ASSET_VERSION_LIMITS.comparisonItems - meaningfulItems.length,
  )
  return {
    state: 'ready',
    currentVersionId: current.id,
    previousVersionId: previous.id,
    items: [...meaningfulItems, ...includedUnchanged],
    totalItems: items.length,
    totalMeaningfulItems: meaningfulItems.length,
    truncated: meaningfulItems.length + includedUnchanged.length < items.length,
    omittedUnchangedCount: unchangedItems.length - includedUnchanged.length,
  }
}

export async function computeAssetVersionId(
  version: Omit<AssetVersionV1, 'id'>,
  sha256: Sha256,
): Promise<string> {
  const projection = version.qualification === 'portable-projection'
    ? {
        derivedFromVersionId: version.derivedFromVersionId,
        qualification: version.qualification,
        recordedAt: version.recordedAt,
        ...assetVersionIdentityProjection(version),
      }
    : {
        recordedAt: version.recordedAt,
        ...assetVersionIdentityProjection(version),
      }
  const digest = await sha256(canonicalJson(projection))
  if (!SHA256_PATTERN.test(digest)) {
    throw new Error('Injected SHA-256 adapter must return 64 lowercase hexadecimal characters.')
  }
  return `${version.qualification === 'portable-projection' ? 'av1p' : 'av1'}_${digest.slice(0, 32)}`
}

export async function verifyAssetVersionIdentity(
  version: AssetVersionV1,
  sha256: Sha256,
): Promise<boolean> {
  if (!isAssetVersion(version)) return false
  const { id: _id, ...identityInput } = version
  return version.id === await computeAssetVersionId(identityInput, sha256)
}

export async function verifyAssetVersionHistoryIdentity(
  value: unknown,
  sha256: Sha256,
): Promise<boolean> {
  if (!validateAssetVersionMetadata(value)) return false
  const versions = value.versions ?? []
  const checks = await Promise.all(versions.map((version) => (
    verifyAssetVersionIdentity(version, sha256)
  )))
  return checks.every(Boolean)
}

export function validateAssetVersionMetadata(value: unknown): value is Asset {
  if (!isRecord(value)) return false
  const hasVersions = Object.hasOwn(value, 'versions')
  const hasAliases = Object.hasOwn(value, 'versionAliases')
  const hasCurrent = Object.hasOwn(value, 'currentVersionId')
  if (!hasVersions && !hasAliases && !hasCurrent) return true

  if (hasVersions && !Array.isArray(value.versions)) return false
  if (hasAliases && !Array.isArray(value.versionAliases)) return false
  if (hasCurrent && typeof value.currentVersionId !== 'string') return false

  const versions = hasVersions ? value.versions as unknown[] : []
  const aliases = hasAliases ? value.versionAliases as unknown[] : []
  if (versions.length > ASSET_VERSION_LIMITS.versionsPerAsset) return false
  if (!versions.every(isAssetVersion)) return false
  if (!aliases.every(isAssetVersionAlias)) return false
  if (aliases.length > ASSET_VERSION_LIMITS.aliasesPerAsset) return false

  const versionIds = versions.map((version) => (version as AssetVersionV1).id)
  if (new Set(versionIds).size !== versionIds.length) return false
  for (let index = 1; index < versions.length; index += 1) {
    if (Date.parse((versions[index] as AssetVersionV1).recordedAt)
      < Date.parse((versions[index - 1] as AssetVersionV1).recordedAt)) return false
    if (assetVersionEquivalenceKey(versions[index] as AssetVersionV1)
      === assetVersionEquivalenceKey(versions[index - 1] as AssetVersionV1)) return false
  }

  if (versions.length === 0) {
    if (hasCurrent || aliases.length > 0) return false
  } else if (!hasCurrent || value.currentVersionId !== versionIds.at(-1)) {
    return false
  }

  const aliasNames = aliases.map((alias) => aliasComparisonKey((alias as AssetVersionAliasV1).name))
  if (new Set(aliasNames).size !== aliasNames.length) return false
  if (aliases.some((alias) => !versionIds.includes((alias as AssetVersionAliasV1).versionId))) {
    return false
  }
  const aliasCounts = new Map<string, number>()
  for (const alias of aliases as AssetVersionAliasV1[]) {
    aliasCounts.set(alias.versionId, (aliasCounts.get(alias.versionId) ?? 0) + 1)
  }
  return ![...aliasCounts.values()].some(
    (count) => count > ASSET_VERSION_LIMITS.aliasesPerVersion,
  )
}

function isAssetVersion(value: unknown): value is AssetVersionV1 {
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
  if (value.schemaVersion !== 1) return false
  if (typeof value.id !== 'string'
    || !(portable ? PORTABLE_VERSION_ID_PATTERN : RECORDED_VERSION_ID_PATTERN).test(value.id)) {
    return false
  }
  if (portable && (typeof value.derivedFromVersionId !== 'string'
    || !VERSION_ID_PATTERN.test(value.derivedFromVersionId))) return false
  if (typeof value.recordedAt !== 'string' || !isIsoTimestamp(value.recordedAt)) return false
  if (!Array.isArray(value.sourceRefHashes)
    || value.sourceRefHashes.length > ASSET_VERSION_LIMITS.sourceRefHashesPerVersion
    || !value.sourceRefHashes.every((hash) => typeof hash === 'string' && SHA256_PATTERN.test(hash))
    || !isStrictlySortedUnique(value.sourceRefHashes)) return false
  if (!Array.isArray(value.verificationRefs)
    || value.verificationRefs.length > ASSET_VERSION_LIMITS.verificationRefsPerVersion
    || !value.verificationRefs.every(isVerificationRef)
    || !isSortedUniqueBy(value.verificationRefs, verificationKey, compareVerificationRefsForSort)) {
    return false
  }
  return isSnapshot(value.snapshot)
}

function isSnapshot(value: unknown): value is AssetVersionSnapshotV1 {
  if (!isRecord(value)) return false
  const requiredKeys = [
    'format',
    'sharedByDesign',
    'registryState',
    'coverage',
    'providerDependencies',
    'dependencyIds',
  ]
  if (!hasOnlyKeys(value, [...requiredKeys, 'supportedVersion'])
    || !requiredKeys.every((key) => Object.hasOwn(value, key))) return false
  if (!isBoundedString(value.format)) return false
  if (typeof value.sharedByDesign !== 'boolean') return false
  if (typeof value.registryState !== 'string' || !REGISTRY_STATES.has(value.registryState)) {
    return false
  }
  if (Object.hasOwn(value, 'supportedVersion') && !isBoundedString(value.supportedVersion)) {
    return false
  }
  if (!Array.isArray(value.coverage)
    || !value.coverage.every(isCoverage)
    || !isSortedUniqueBy(value.coverage, (entry) => entry.platform, compareCoverageEntries)) {
    return false
  }
  if (!Array.isArray(value.providerDependencies)
    || !value.providerDependencies.every(isProviderDependency)
    || !isSortedUniqueBy(
      value.providerDependencies,
      providerDependencyKey,
      compareProviderDependencies,
    )) return false
  return Array.isArray(value.dependencyIds)
    && value.dependencyIds.every(isBoundedString)
    && isStrictlySortedUnique(value.dependencyIds)
}

function isCoverage(value: unknown): value is AssetVersionSnapshotV1['coverage'][number] {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ['platform', 'lastVerified']) || !Object.hasOwn(value, 'platform')) {
    return false
  }
  if (!isBoundedString(value.platform)) return false
  return !Object.hasOwn(value, 'lastVerified')
    || (typeof value.lastVerified === 'string' && isCanonicalIsoDate(value.lastVerified))
}

function isProviderDependency(
  value: unknown,
): value is AssetVersionSnapshotV1['providerDependencies'][number] {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ['provider', 'capability', 'fallback'])
    || !Object.hasOwn(value, 'provider')
    || !Object.hasOwn(value, 'capability')) return false
  if (!isBoundedString(value.provider) || !isBoundedString(value.capability)) return false
  return !Object.hasOwn(value, 'fallback') || isBoundedString(value.fallback)
}

function isVerificationRef(value: unknown): value is AssetVersionVerificationV1 {
  if (!isRecord(value)) return false
  if (!hasOnlyKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt', 'safeEvidenceHash'])) {
    return false
  }
  if (!['checkId', 'resultId', 'status', 'evaluatedAt'].every((key) => Object.hasOwn(value, key))) {
    return false
  }
  if (!isBoundedString(value.checkId)
    || !isBoundedString(value.resultId)
    || typeof value.status !== 'string'
    || !SIGNAL_STATUSES.has(value.status as SignalStatus)
    || typeof value.evaluatedAt !== 'string'
    || !isIsoTimestamp(value.evaluatedAt)) return false
  return !Object.hasOwn(value, 'safeEvidenceHash')
    || (typeof value.safeEvidenceHash === 'string' && SHA256_PATTERN.test(value.safeEvidenceHash))
}

function isAssetVersionAlias(value: unknown): value is AssetVersionAliasV1 {
  if (!hasExactKeys(value, ['name', 'versionId'])) return false
  if (typeof value.name !== 'string' || value.name !== value.name.trim()) return false
  if (value.name.length < 1
    || value.name.length > ASSET_VERSION_LIMITS.aliasLength
    || !ALIAS_PATTERN.test(value.name)) return false
  return typeof value.versionId === 'string' && VERSION_ID_PATTERN.test(value.versionId)
}

function normalizeVerificationRefs(
  values: readonly AssetVersionVerificationV1[],
): AssetVersionVerificationV1[] {
  if (values.length > ASSET_VERSION_LIMITS.verificationRefsPerVersion) {
    throw new Error('Verification references exceed the per-version limit.')
  }
  const normalized = values.map((value) => {
    const candidate = {
      checkId: value.checkId,
      resultId: value.resultId,
      status: value.status,
      evaluatedAt: value.evaluatedAt,
      ...(value.safeEvidenceHash === undefined ? {} : { safeEvidenceHash: value.safeEvidenceHash }),
    }
    if (!isVerificationRef(candidate)) {
      throw new Error('Verification reference is invalid or exceeds fixed bounds.')
    }
    return candidate
  }).sort(compareVerificationRefsForSort)
  if (!isSortedUniqueBy(normalized, verificationKey, compareVerificationRefsForSort)) {
    throw new Error('Verification references must have unique check and result identities.')
  }
  return normalized
}

function normalizeHashes(values: readonly string[], limit: number, label: string): string[] {
  if (values.length > limit) throw new Error(`${label} collection exceeds its fixed limit.`)
  for (const value of values) {
    if (!SHA256_PATTERN.test(value)) throw new Error(`${label} must be a lowercase SHA-256 hash.`)
  }
  return sortedUnique(values)
}

function assetVersionIdentityProjection(
  version: Pick<AssetVersionV1, 'snapshot' | 'sourceRefHashes' | 'verificationRefs'>,
): Pick<AssetVersionV1, 'snapshot' | 'sourceRefHashes' | 'verificationRefs'> {
  return {
    snapshot: version.snapshot,
    sourceRefHashes: version.sourceRefHashes,
    verificationRefs: version.verificationRefs,
  }
}

function assetVersionEquivalenceKey(
  version: Pick<AssetVersionV1, 'snapshot' | 'sourceRefHashes' | 'verificationRefs'>,
): string {
  return canonicalJson({
    snapshot: version.snapshot,
    sourceRefHashes: version.sourceRefHashes,
    verificationRefs: version.verificationRefs.map((reference) => ({
      checkId: reference.checkId,
      resultId: reference.resultId,
      status: reference.status,
      ...(reference.safeEvidenceHash === undefined
        ? {}
        : { safeEvidenceHash: reference.safeEvidenceHash }),
    })),
  })
}

function buildCoverageComparison(
  previous: AssetVersionSnapshotV1,
  current: AssetVersionSnapshotV1,
): AssetVersionComparisonItem[] {
  const previousPlatforms = new Set(previous.coverage.map((entry) => entry.platform))
  const currentPlatforms = new Set(current.coverage.map((entry) => entry.platform))
  return sortedUnique([...previousPlatforms, ...currentPlatforms]).map((platform) => {
    const wasPresent = previousPlatforms.has(platform)
    const isPresent = currentPlatforms.has(platform)
    return {
      key: `coverage:${platform}`,
      label: `Coverage: ${platform}`,
      state: wasPresent === isPresent ? 'unchanged' : isPresent ? 'recovery' : 'regression',
      previous: wasPresent ? 'recorded' : 'not recorded',
      current: isPresent ? 'recorded' : 'not recorded',
      basis: 'recorded-fact',
    }
  })
}

function buildFallbackComparison(
  previous: AssetVersionSnapshotV1,
  current: AssetVersionSnapshotV1,
): AssetVersionComparisonItem[] {
  const previousByKey = new Map(previous.providerDependencies.map((dependency) => [
    providerDependencyKey(dependency),
    dependency,
  ]))
  const currentByKey = new Map(current.providerDependencies.map((dependency) => [
    providerDependencyKey(dependency),
    dependency,
  ]))
  return sortedUnique([...previousByKey.keys(), ...currentByKey.keys()]).map((key) => {
    const previousDependency = previousByKey.get(key)
    const currentDependency = currentByKey.get(key)
    const previousFallback = previousDependency?.fallback
    const currentFallback = currentDependency?.fallback
    let state: AssetVersionComparisonState = 'unchanged'
    if (previousFallback !== currentFallback) {
      if (previousFallback === undefined && currentFallback !== undefined) state = 'recovery'
      else if (previousFallback !== undefined && currentFallback === undefined) state = 'regression'
      else state = 'changed'
    } else if (Boolean(previousDependency) !== Boolean(currentDependency)) {
      state = 'changed'
    }
    return {
      key: `fallback:${key}`,
      label: `Fallback: ${key}`,
      state,
      previous: displayValue(previousFallback),
      current: displayValue(currentFallback),
      basis: 'recorded-fact',
    }
  })
}

function buildDependencyComparison(
  previous: AssetVersionSnapshotV1,
  current: AssetVersionSnapshotV1,
): AssetVersionComparisonItem[] {
  const previousIds = new Set(previous.dependencyIds)
  const currentIds = new Set(current.dependencyIds)
  return sortedUnique([...previousIds, ...currentIds]).map((dependencyId) => ({
    key: `dependency:${dependencyId}`,
    label: `Dependency: ${dependencyId}`,
    state: previousIds.has(dependencyId) === currentIds.has(dependencyId) ? 'unchanged' : 'changed',
    previous: previousIds.has(dependencyId) ? 'recorded' : 'not recorded',
    current: currentIds.has(dependencyId) ? 'recorded' : 'not recorded',
    basis: 'recorded-fact',
  }))
}

function buildVerificationComparison(
  previous: readonly AssetVersionVerificationV1[],
  current: readonly AssetVersionVerificationV1[],
): AssetVersionComparisonItem[] {
  const previousByKey = new Map(previous.map((reference) => [verificationKey(reference), reference]))
  const currentByKey = new Map(current.map((reference) => [verificationKey(reference), reference]))
  return sortedUnique([...previousByKey.keys(), ...currentByKey.keys()]).map((key) => {
    const previousStatus = previousByKey.get(key)?.status
    const currentStatus = currentByKey.get(key)?.status
    return {
      key: `check:${key}`,
      label: `Check: ${key}`,
      state: classifyCheckTransition(previousStatus, currentStatus),
      previous: displayValue(previousStatus),
      current: displayValue(currentStatus),
      basis: 'deterministic-check',
    }
  })
}

function classifyFormatTransition(previous: string, current: string): AssetVersionComparisonState {
  if (previous === current) return 'unchanged'
  if (OPEN_FORMATS.has(previous) && current === 'proprietary') return 'regression'
  if (previous === 'proprietary' && OPEN_FORMATS.has(current)) return 'recovery'
  return 'changed'
}

function classifyBooleanTransition(previous: string, current: string): AssetVersionComparisonState {
  if (previous === current) return 'unchanged'
  if (previous === 'true' && current === 'false') return 'regression'
  if (previous === 'false' && current === 'true') return 'recovery'
  return 'changed'
}

function classifyRegistryStateTransition(previous: string, current: string): AssetVersionComparisonState {
  if (previous === current) return 'unchanged'
  if (previous === 'active' && (current === 'archived' || current === 'missing')) return 'regression'
  if ((previous === 'archived' || previous === 'missing') && current === 'active') return 'recovery'
  return 'changed'
}

function classifyCheckTransition(
  previous?: SignalStatus,
  current?: SignalStatus,
): AssetVersionComparisonState {
  if (previous === current) return 'unchanged'
  if (previous === 'pass' && (current === 'warn' || current === 'fail' || current === 'unknown')) {
    return 'regression'
  }
  if ((previous === 'warn' || previous === 'fail' || previous === 'unknown') && current === 'pass') {
    return 'recovery'
  }
  return 'changed'
}

function classifyChanged(previous: string, current: string): AssetVersionComparisonState {
  return previous === current ? 'unchanged' : 'changed'
}

function factItem(
  key: string,
  label: string,
  previous: string,
  current: string,
  classify: (previous: string, current: string) => AssetVersionComparisonState,
): AssetVersionComparisonItem {
  return {
    key,
    label,
    state: classify(previous, current),
    previous,
    current,
    basis: 'recorded-fact',
  }
}

function assertValidMetadataForMutation(asset: Asset): void {
  if (!validateAssetVersionMetadata(asset)) {
    throw new Error('Asset version metadata is invalid and cannot be mutated.')
  }
}

function assertAliasBounds(aliases: readonly AssetVersionAliasV1[]): void {
  if (aliases.length > ASSET_VERSION_LIMITS.aliasesPerAsset) {
    throw new Error('Alias collection exceeds the per-asset limit.')
  }
  const counts = new Map<string, number>()
  for (const alias of aliases) {
    counts.set(alias.versionId, (counts.get(alias.versionId) ?? 0) + 1)
  }
  if ([...counts.values()].some((count) => count > ASSET_VERSION_LIMITS.aliasesPerVersion)) {
    throw new Error('Alias collection exceeds the per-version limit.')
  }
}

function normalizeAliasName(value: string): string {
  const normalized = value.trim()
  if (normalized.length < 1
    || normalized.length > ASSET_VERSION_LIMITS.aliasLength
    || !ALIAS_PATTERN.test(normalized)) {
    throw new Error('Alias must use approved characters and be 1-64 characters after trimming.')
  }
  return normalized
}

function aliasComparisonKey(value: string): string {
  return value.toLowerCase()
}

function verificationKey(reference: AssetVersionVerificationV1): string {
  return `${reference.checkId}:${reference.resultId}`
}

function providerDependencyKey(
  dependency: AssetVersionSnapshotV1['providerDependencies'][number],
): string {
  return `${dependency.provider}:${dependency.capability}`
}

function compareCoverageEntries(
  left: AssetVersionSnapshotV1['coverage'][number],
  right: AssetVersionSnapshotV1['coverage'][number],
): number {
  return compareText(left.platform, right.platform)
}

function compareProviderDependencies(
  left: AssetVersionSnapshotV1['providerDependencies'][number],
  right: AssetVersionSnapshotV1['providerDependencies'][number],
): number {
  return compareText(providerDependencyKey(left), providerDependencyKey(right))
}

function compareVerificationRefsForSort(
  left: AssetVersionVerificationV1,
  right: AssetVersionVerificationV1,
): number {
  return compareText(verificationKey(left), verificationKey(right))
}

function compareAliases(left: AssetVersionAliasV1, right: AssetVersionAliasV1): number {
  return compareText(aliasComparisonKey(left.name), aliasComparisonKey(right.name))
}

function assertNoDuplicateCoverage(
  coverage: readonly AssetVersionSnapshotV1['coverage'][number][],
): void {
  if (new Set(coverage.map((entry) => entry.platform)).size !== coverage.length) {
    throw new Error('Coverage projection contains duplicate platforms.')
  }
}

function assertNoDuplicateProviderDependencies(
  dependencies: readonly AssetVersionSnapshotV1['providerDependencies'][number][],
): void {
  if (new Set(dependencies.map(providerDependencyKey)).size !== dependencies.length) {
    throw new Error('Provider dependency projection contains duplicate provider/capability identities.')
  }
}

function boundedString(value: string, label: string): string {
  if (!isBoundedString(value)) {
    throw new Error(`${label} must be a non-empty string of at most ${ASSET_VERSION_LIMITS.labelLength} characters.`)
  }
  return value
}

function isBoundedString(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= 1
    && value.length <= ASSET_VERSION_LIMITS.labelLength
    && !/[\u0000-\u001f\u007f]/u.test(value)
}

export function isCanonicalIsoDate(value: string): boolean {
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

export function isCanonicalIsoTimestamp(value: string): boolean {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/.exec(value)
  if (!match || !isCanonicalIsoDate(match[1])) return false
  const hour = Number(match[2])
  const minute = Number(match[3])
  const second = Number(match[4])
  if (hour > 23 || minute > 59 || second > 59) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) return false
  return match[5] === undefined
    ? parsed.toISOString().replace('.000Z', 'Z') === value
    : parsed.toISOString() === value
}

function isIsoTimestamp(value: string): boolean {
  return isCanonicalIsoTimestamp(value)
}

function normalizeVerificationTimestamp(value: string): string {
  if (isCanonicalIsoTimestamp(value)) return value
  if (isCanonicalIsoDate(value)) {
    return `${value}T00:00:00.000Z`
  }
  throw new Error('Cataloged check result evaluatedAt must be an ISO timestamp or ISO date.')
}

function canonicalIsoDate(value: string, label: string): string {
  if (!isCanonicalIsoDate(value)) {
    throw new Error(`${label} must be a real canonical ISO date.`)
  }
  return value
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareText)
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
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => compareText(left, right))
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(',')}}`
  }
  const encoded = JSON.stringify(value)
  if (encoded === undefined) throw new Error('Unsupported canonical value.')
  return encoded
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function displayValue(value: string | undefined): string {
  return value ?? 'not recorded'
}

function hasExactKeys(value: unknown, expected: readonly string[]): value is Record<string, unknown> {
  return isRecord(value)
    && Object.keys(value).length === expected.length
    && expected.every((key) => Object.hasOwn(value, key))
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
