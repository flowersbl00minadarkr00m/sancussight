import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import {
  ASSET_VERSION_LIMITS,
  assignAssetVersionAlias,
  compareAssetVersions,
  compareCurrentAssetVersions,
  computeAssetVersionId,
  isCanonicalIsoDate,
  isCanonicalIsoTimestamp,
  projectAssetVersionSnapshot,
  projectAssetVersionVerificationRefs,
  recordAssetVersion,
  removeAssetVersionAlias,
  validateAssetVersionMetadata,
  verifyAssetVersionHistoryIdentity,
} from '../asset-versions.ts'
import { normalizeRegistry, normalizeRegistryVerified } from '../session.ts'

const FIRST_TIME = '2026-07-24T08:00:00.000Z'
const SECOND_TIME = '2026-07-24T09:00:00.000Z'
const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)

function asset(overrides = {}) {
  return {
    id: 'asset-private-id',
    name: 'Private Asset Name',
    kind: 'workflow',
    registryState: 'active',
    format: 'markdown',
    location: 'C:\\Users\\private\\secret.md',
    owner: 'private@example.com',
    sensitivity: 'sensitive',
    sharedByDesign: true,
    coverage: [
      { platform: 'Zulu', lastVerified: '2026-07-22' },
      { platform: 'Alpha', lastVerified: '2026-07-23' },
    ],
    providerDependencies: [
      { provider: 'Zulu Provider', capability: 'chat', fallback: 'Local' },
      { provider: 'Alpha Provider', capability: 'embeddings' },
    ],
    evidence: [{ label: 'raw evidence payload', date: '2026-07-23' }],
    acceptedRisk: {
      note: 'accepted risk text',
      owner: 'Risk Owner',
      expires: '2026-12-31',
    },
    dependsOn: ['dependency-z', 'dependency-a'],
    supportedVersion: '2',
    candidateTool: {
      sourceUrl: 'https://example.invalid/private',
      license: 'MIT',
      attributionNotes: 'private notes',
      evidenceType: 'raw',
      runtimeRequirements: [],
      dataEgress: 'unknown',
      trustBoundary: 'private',
      maintenanceStatus: 'unknown',
      knownUseConstraints: [],
      dimensions: [],
      supportedChecks: [],
      integrationLevel: 'reference-only',
      disposition: 'deferred',
      dispositionRationale: 'private rationale',
      assessmentStatus: 'detailed',
    },
    ...overrides,
  }
}

function version(id, recordedAt, snapshot, overrides = {}) {
  return {
    schemaVersion: 1,
    id,
    recordedAt,
    sourceRefHashes: [],
    verificationRefs: [],
    snapshot,
    ...overrides,
  }
}

const deterministicHash = async (input) => {
  let total = 0n
  for (const character of input) {
    total = (total * 131n + BigInt(character.codePointAt(0))) % (1n << 256n)
  }
  return total.toString(16).padStart(64, '0')
}
const sha256 = async input => createHash('sha256').update(input).digest('hex')

async function verifiedVersion(recordedAt, snapshot, overrides = {}) {
  const withoutId = {
    schemaVersion: 1,
    recordedAt,
    sourceRefHashes: [],
    verificationRefs: [],
    snapshot,
    ...overrides,
  }
  return {
    ...withoutId,
    id: await computeAssetVersionId(withoutId, sha256),
  }
}

test('canonical projection is fixed, sorted, copy-independent, and excludes private mutable copy', () => {
  const subject = asset()
  const projected = projectAssetVersionSnapshot(subject)
  const reordered = projectAssetVersionSnapshot(asset({
    coverage: [...subject.coverage].reverse(),
    providerDependencies: [...subject.providerDependencies].reverse(),
    dependsOn: [...subject.dependsOn].reverse(),
  }))

  assert.deepEqual(projected, reordered)
  assert.deepEqual(projected.coverage.map((entry) => entry.platform), ['Alpha', 'Zulu'])
  assert.deepEqual(projected.dependencyIds, ['dependency-a', 'dependency-z'])
  assert.deepEqual(Object.keys(projected).sort(), [
    'coverage',
    'dependencyIds',
    'format',
    'providerDependencies',
    'registryState',
    'sharedByDesign',
    'supportedVersion',
  ])

  const serialized = JSON.stringify(projected)
  for (const prohibited of [
    subject.name,
    subject.location,
    subject.owner,
    subject.sensitivity,
    subject.evidence[0].label,
    subject.acceptedRisk.note,
    subject.candidateTool.sourceUrl,
    subject.candidateTool.dispositionRationale,
  ]) {
    assert.equal(serialized.includes(prohibited), false)
  }
})

test('only cataloged Feature 009 results project into bounded stable verification metadata', () => {
  const refs = projectAssetVersionVerificationRefs([
    {
      kind: 'uncataloged',
      resultDiscriminator: 'ignored-result',
      signalId: 'ignored-result',
      assetId: 'asset-private-id',
      assetName: 'Private Asset Name',
      dimension: 'evidence',
      status: 'pass',
      finding: 'private finding',
      owner: 'private@example.com',
      evaluatedAt: FIRST_TIME,
      category: 'recorded-fact',
      evidence: [{ label: 'private evidence', reference: HASH_B }],
      inspectedInputs: [],
      belief: 'uncataloged',
      missingEvidence: 'none',
      passCondition: 'none',
      remediation: 'none',
      invalidation: 'none',
    },
    {
      kind: 'cataloged',
      resultKey: 'scope:asset:check:result',
      resultDiscriminator: 'result-1',
      signalId: 'result-1',
      checkId: 'asset.open-format.v1',
      assetId: 'asset-private-id',
      assetName: 'Private Asset Name',
      dimension: 'context',
      status: 'pass',
      finding: 'private finding',
      owner: 'private@example.com',
      evaluatedAt: FIRST_TIME,
      category: 'deterministic-finding',
      evidence: [
        { label: 'unsafe copy', reference: 'not-a-hash' },
        { label: 'safe hash', reference: HASH_B },
        { label: 'lower safe hash', reference: HASH_A },
      ],
      inspectedInputs: ['asset.format'],
      belief: 'deterministic',
      missingEvidence: 'none',
      passCondition: 'open',
      remediation: 'export',
      invalidation: 'format changes',
      definition: {
        id: 'asset.open-format.v1',
        version: 1,
        dimension: 'context',
        title: 'Open format',
        question: 'Open?',
        importance: 'Portability',
        rule: 'Fixed',
        inspectedInputs: ['asset.format'],
        outcomes: ['pass'],
        passCondition: 'Open',
        missingCondition: 'Missing',
        remediation: 'Export',
        invalidation: 'Format changes',
      },
    },
  ])

  assert.deepEqual(refs, [{
    checkId: 'asset.open-format.v1',
    resultId: 'result-1',
    status: 'pass',
    evaluatedAt: FIRST_TIME,
    safeEvidenceHash: HASH_A,
  }])
  assert.equal(JSON.stringify(refs).includes('private'), false)
})

test('cataloged date-only check observations normalize to one deterministic UTC timestamp', () => {
  const refs = projectAssetVersionVerificationRefs([{
    kind: 'cataloged',
    resultKey: 'scope:asset:check:result',
    resultDiscriminator: 'ctx-voice:format',
    signalId: 'ctx-voice:format',
    checkId: 'asset.open-format.v1',
    assetId: 'ctx-voice',
    assetName: 'Voice & context pack',
    dimension: 'context',
    status: 'pass',
    finding: 'Stored as markdown',
    owner: 'private@example.com',
    evaluatedAt: '2026-07-24',
    category: 'deterministic-finding',
    evidence: [{ label: 'Registry format field' }],
    inspectedInputs: ['asset.format'],
    belief: 'deterministic',
    missingEvidence: 'none',
    passCondition: 'open',
    remediation: 'export',
    invalidation: 'format changes',
    definition: {
      id: 'asset.open-format.v1',
      version: 1,
      dimension: 'context',
      title: 'Open format',
      question: 'Open?',
      importance: 'Portability',
      rule: 'Fixed',
      inspectedInputs: ['asset.format'],
      outcomes: ['pass'],
      passCondition: 'Open',
      missingCondition: 'Missing',
      remediation: 'Export',
      invalidation: 'Format changes',
    },
  }])

  assert.deepEqual(refs, [{
    checkId: 'asset.open-format.v1',
    resultId: 'ctx-voice:format',
    status: 'pass',
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  }])
})

test('recording has stable qualified identity and ignores observation times for equivalence', async () => {
  const verificationRefs = [{
    checkId: 'asset.open-format.v1',
    resultId: 'result-1',
    status: 'pass',
    evaluatedAt: FIRST_TIME,
    safeEvidenceHash: HASH_A,
  }]
  const first = await recordAssetVersion(asset(), {
    recordedAt: FIRST_TIME,
    sourceRefHashes: [HASH_B, HASH_A],
    verificationRefs,
  }, deterministicHash)
  assert.equal(first.status, 'recorded')
  assert.match(first.version.id, /^av1_[0-9a-f]{32}$/)
  assert.equal(first.asset.currentVersionId, first.version.id)
  assert.deepEqual(first.version.sourceRefHashes, [HASH_A, HASH_B])

  const copyWithDifferentOrder = asset({
    versions: first.asset.versions,
    currentVersionId: first.asset.currentVersionId,
    coverage: [...asset().coverage].reverse(),
    providerDependencies: [...asset().providerDependencies].reverse(),
    dependsOn: [...asset().dependsOn].reverse(),
  })
  const duplicate = await recordAssetVersion(copyWithDifferentOrder, {
    recordedAt: SECOND_TIME,
    sourceRefHashes: [HASH_A, HASH_B],
    verificationRefs: verificationRefs.map((reference) => ({
      ...reference,
      evaluatedAt: SECOND_TIME,
    })),
  }, deterministicHash)
  assert.equal(duplicate.status, 'deduplicated')
  assert.equal(duplicate.version.id, first.version.id)
  assert.deepEqual(duplicate.asset, copyWithDifferentOrder)

  const independentCopy = await recordAssetVersion(asset({
    coverage: [...asset().coverage].reverse(),
  }), {
    recordedAt: FIRST_TIME,
    sourceRefHashes: [HASH_A, HASH_B],
    verificationRefs,
  }, deterministicHash)
  assert.equal(independentCopy.version.id, first.version.id)

  const differentQualifiedIdentity = await recordAssetVersion(asset(), {
    recordedAt: FIRST_TIME,
    sourceRefHashes: [HASH_A],
    verificationRefs: verificationRefs.map((reference) => ({
      ...reference,
      status: 'fail',
    })),
  }, deterministicHash)
  assert.notEqual(differentQualifiedIdentity.version.id, first.version.id)
})

test('check status changes record pass-fail regressions and fail-pass recoveries', async () => {
  const verificationRef = (status, evaluatedAt) => [{
    checkId: 'asset.open-format.v1',
    resultId: 'result-1',
    status,
    evaluatedAt,
    safeEvidenceHash: HASH_A,
  }]
  const first = await recordAssetVersion(asset(), {
    recordedAt: FIRST_TIME,
    sourceRefHashes: [HASH_A],
    verificationRefs: verificationRef('pass', FIRST_TIME),
  }, deterministicHash)
  const failed = await recordAssetVersion(first.asset, {
    recordedAt: SECOND_TIME,
    sourceRefHashes: [HASH_A],
    verificationRefs: verificationRef('fail', SECOND_TIME),
  }, deterministicHash)

  assert.equal(failed.status, 'recorded')
  assert.equal(failed.asset.versions.length, 2)
  assert.equal(failed.version.verificationRefs[0].status, 'fail')
  assert.equal(
    compareCurrentAssetVersions(failed.asset).items
      .find((item) => item.key === 'check:asset.open-format.v1:result-1').state,
    'regression',
  )

  const recoveredAt = '2026-07-24T10:00:00.000Z'
  const recovered = await recordAssetVersion(failed.asset, {
    recordedAt: recoveredAt,
    sourceRefHashes: [HASH_A],
    verificationRefs: verificationRef('pass', recoveredAt),
  }, deterministicHash)

  assert.equal(recovered.status, 'recorded')
  assert.equal(recovered.asset.versions.length, 3)
  assert.equal(
    compareCurrentAssetVersions(recovered.asset).items
      .find((item) => item.key === 'check:asset.open-format.v1:result-1').state,
    'recovery',
  )
})

test('safe evidence and source reference changes each record a distinct version', async () => {
  const baseVerification = {
    checkId: 'asset.open-format.v1',
    resultId: 'result-1',
    status: 'pass',
    evaluatedAt: FIRST_TIME,
    safeEvidenceHash: HASH_A,
  }
  const first = await recordAssetVersion(asset(), {
    recordedAt: FIRST_TIME,
    sourceRefHashes: [HASH_A],
    verificationRefs: [baseVerification],
  }, deterministicHash)
  const evidenceChanged = await recordAssetVersion(first.asset, {
    recordedAt: SECOND_TIME,
    sourceRefHashes: [HASH_A],
    verificationRefs: [{
      ...baseVerification,
      evaluatedAt: SECOND_TIME,
      safeEvidenceHash: HASH_B,
    }],
  }, deterministicHash)
  const sourceChanged = await recordAssetVersion(evidenceChanged.asset, {
    recordedAt: '2026-07-24T10:00:00.000Z',
    sourceRefHashes: [HASH_B],
    verificationRefs: [{
      ...baseVerification,
      evaluatedAt: '2026-07-24T10:00:00.000Z',
      safeEvidenceHash: HASH_B,
    }],
  }, deterministicHash)

  assert.equal(evidenceChanged.status, 'recorded')
  assert.equal(sourceChanged.status, 'recorded')
  assert.equal(sourceChanged.asset.versions.length, 3)
  assert.notEqual(first.version.id, evidenceChanged.version.id)
  assert.notEqual(evidenceChanged.version.id, sourceChanged.version.id)
})

test('explicit append retains 50 versions, advances the pointer, and drops aliases to evicted versions', async () => {
  const snapshots = Array.from({ length: ASSET_VERSION_LIMITS.versionsPerAsset }, (_, index) => {
    const recordedAt = new Date(Date.parse(FIRST_TIME) + index * 60_000).toISOString()
    return version(
      `av1_${index.toString(16).padStart(32, '0')}`,
      recordedAt,
      projectAssetVersionSnapshot(asset({ supportedVersion: String(index) })),
    )
  })
  const subject = asset({
    versions: snapshots,
    currentVersionId: snapshots.at(-1).id,
    versionAliases: [{ name: 'oldest', versionId: snapshots[0].id }],
    supportedVersion: 'next',
  })

  const result = await recordAssetVersion(subject, {
    recordedAt: new Date(Date.parse(FIRST_TIME) + 50 * 60_000).toISOString(),
    sourceRefHashes: [],
    verificationRefs: [],
  }, deterministicHash)

  assert.equal(result.status, 'recorded')
  assert.equal(result.asset.versions.length, ASSET_VERSION_LIMITS.versionsPerAsset)
  assert.equal(result.asset.versions[0].id, snapshots[1].id)
  assert.equal(result.asset.currentVersionId, result.version.id)
  assert.deepEqual(result.asset.versionAliases, [])
})

test('aliases add, move, and remove case-insensitively without mutating versions', () => {
  const snapshot = projectAssetVersionSnapshot(asset())
  const first = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, snapshot)
  const second = version(`av1_${'2'.repeat(32)}`, SECOND_TIME, {
    ...snapshot,
    sharedByDesign: false,
  })
  const subject = asset({
    versions: [first, second],
    currentVersionId: second.id,
  })
  const versionsBefore = structuredClone(subject.versions)

  const added = assignAssetVersionAlias(subject, ' Preferred ', first.id)
  assert.deepEqual(added.versionAliases, [{ name: 'Preferred', versionId: first.id }])
  const moved = assignAssetVersionAlias(added, 'preferred', second.id)
  assert.deepEqual(moved.versionAliases, [{ name: 'preferred', versionId: second.id }])
  const removed = removeAssetVersionAlias(moved, 'PREFERRED')
  assert.deepEqual(removed.versionAliases, [])
  assert.deepEqual(removed.versions, versionsBefore)

  assert.throws(() => assignAssetVersionAlias(subject, 'production=true', first.id), /alias/i)
  assert.throws(() => assignAssetVersionAlias(subject, 'valid', 'av1_deadbeef'), /target/i)
})

test('comparison follows the fixed regression, recovery, changed, and unchanged transition rules', () => {
  const previousSnapshot = projectAssetVersionSnapshot(asset())
  const currentSnapshot = projectAssetVersionSnapshot(asset({
    format: 'proprietary',
    sharedByDesign: false,
    registryState: 'missing',
    coverage: [{ platform: 'Alpha', lastVerified: '2026-07-24' }],
    providerDependencies: [
      { provider: 'Zulu Provider', capability: 'chat' },
      { provider: 'Alpha Provider', capability: 'embeddings', fallback: 'Local' },
    ],
    dependsOn: ['dependency-z', 'dependency-new'],
  }))
  const previous = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, previousSnapshot, {
    verificationRefs: [
      { checkId: 'check.accepted', resultId: 'stable', status: 'accepted', evaluatedAt: FIRST_TIME },
      { checkId: 'check.pass', resultId: 'stable', status: 'pass', evaluatedAt: FIRST_TIME },
    ],
  })
  const current = version(`av1_${'2'.repeat(32)}`, SECOND_TIME, currentSnapshot, {
    verificationRefs: [
      { checkId: 'check.accepted', resultId: 'stable', status: 'pass', evaluatedAt: SECOND_TIME },
      { checkId: 'check.pass', resultId: 'stable', status: 'warn', evaluatedAt: SECOND_TIME },
    ],
  })

  const comparison = compareAssetVersions(current, previous)
  assert.equal(comparison.state, 'ready')
  const byKey = new Map(comparison.items.map((item) => [item.key, item]))
  assert.equal(byKey.get('fact:format').state, 'regression')
  assert.equal(byKey.get('fact:shared-by-design').state, 'regression')
  assert.equal(byKey.get('fact:registry-state').state, 'regression')
  assert.equal(byKey.get('coverage:Zulu').state, 'regression')
  assert.equal(byKey.get('fallback:Zulu Provider:chat').state, 'regression')
  assert.equal(byKey.get('fallback:Alpha Provider:embeddings').state, 'recovery')
  assert.equal(byKey.get('dependency:dependency-new').state, 'changed')
  assert.equal(byKey.get('check:check.pass:stable').state, 'regression')
  assert.equal(byKey.get('check:check.accepted:stable').state, 'changed')
  assert.equal(byKey.get('coverage:Alpha').state, 'unchanged')

  const recovery = compareAssetVersions(previous, current)
  const recoveryByKey = new Map(recovery.items.map((item) => [item.key, item]))
  assert.equal(recoveryByKey.get('fact:format').state, 'recovery')
  assert.equal(recoveryByKey.get('fact:shared-by-design').state, 'recovery')
  assert.equal(recoveryByKey.get('fact:registry-state').state, 'recovery')
  assert.equal(recoveryByKey.get('check:check.pass:stable').state, 'recovery')
  assert.equal(recoveryByKey.get('check:check.accepted:stable').state, 'changed')
  assert.equal('score' in comparison, false)
  assert.equal('verdict' in comparison, false)
})

test('current comparison uses only the immediately previous recorded version and reports no prior version', () => {
  const snapshot = projectAssetVersionSnapshot(asset())
  const first = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, snapshot)
  const second = version(`av1_${'2'.repeat(32)}`, SECOND_TIME, {
    ...snapshot,
    sharedByDesign: false,
  })

  assert.equal(compareCurrentAssetVersions(asset({
    versions: [first],
    currentVersionId: first.id,
  })).state, 'no-previous-version')

  const comparison = compareCurrentAssetVersions(asset({
    versions: [first, second],
    currentVersionId: second.id,
  }))
  assert.equal(comparison.state, 'ready')
  assert.equal(comparison.previousVersionId, first.id)
  assert.equal(comparison.currentVersionId, second.id)
})

test('comparison preserves every meaningful item before bounded unchanged context', () => {
  const unchangedCoverage = Array.from({ length: 100 }, (_, index) => ({
    platform: `platform-${index.toString().padStart(3, '0')}`,
  }))
  const previousSnapshot = projectAssetVersionSnapshot(asset({
    coverage: unchangedCoverage,
    providerDependencies: [],
    dependsOn: [],
  }))
  const currentSnapshot = projectAssetVersionSnapshot(asset({
    coverage: unchangedCoverage,
    providerDependencies: [],
    dependsOn: [],
  }))
  const previous = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, previousSnapshot, {
    verificationRefs: [{
      checkId: 'check.late',
      resultId: 'result',
      status: 'pass',
      evaluatedAt: FIRST_TIME,
    }],
  })
  const current = version(`av1_${'2'.repeat(32)}`, SECOND_TIME, currentSnapshot, {
    verificationRefs: [{
      checkId: 'check.late',
      resultId: 'result',
      status: 'fail',
      evaluatedAt: SECOND_TIME,
    }],
  })
  const comparison = compareAssetVersions(current, previous)

  assert.equal(comparison.state, 'ready')
  assert.equal(comparison.items.length, ASSET_VERSION_LIMITS.comparisonItems)
  assert.equal(comparison.items[0].key, 'check:check.late:result')
  assert.equal(comparison.items[0].state, 'regression')
  assert.equal(comparison.totalMeaningfulItems, 1)
  assert.equal(comparison.truncated, true)
  assert.equal(comparison.omittedUnchangedCount, 5)
  assert.equal('score' in comparison, false)
  assert.equal('verdict' in comparison, false)
})

test('comparison returns explicit unavailable when meaningful changes alone exceed 100', () => {
  const previousSnapshot = projectAssetVersionSnapshot(asset({ dependsOn: [] }))
  const currentSnapshot = projectAssetVersionSnapshot(asset({
    dependsOn: Array.from({ length: 101 }, (_, index) => `dependency-${index.toString().padStart(3, '0')}`),
  }))
  const previous = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, previousSnapshot)
  const current = version(`av1_${'2'.repeat(32)}`, SECOND_TIME, currentSnapshot)
  const comparison = compareAssetVersions(current, previous)

  assert.equal(comparison.state, 'unavailable-too-many-changes')
  assert.deepEqual(comparison.items, [])
  assert.equal(comparison.totalMeaningfulItems, 101)
  assert.equal(comparison.totalItems >= comparison.totalMeaningfulItems, true)
  assert.equal(comparison.truncated, true)
})

test('verified import rejects forged recorded and portable derivative identities', async () => {
  const snapshot = projectAssetVersionSnapshot(asset())
  const recorded = await verifiedVersion(FIRST_TIME, snapshot)
  const versionedAsset = asset({
    versions: [recorded],
    currentVersionId: recorded.id,
  })
  const registry = {
    schemaVersion: 2,
    platforms: [],
    updatedAt: FIRST_TIME,
    assets: [versionedAsset],
  }
  assert.ok(await normalizeRegistryVerified(registry, sha256, { now: FIRST_TIME }))
  assert.equal(await verifyAssetVersionHistoryIdentity(versionedAsset, sha256), true)

  const forged = structuredClone(registry)
  forged.assets[0].versions[0].id = `av1_${'f'.repeat(32)}`
  forged.assets[0].currentVersionId = forged.assets[0].versions[0].id
  assert.equal(await normalizeRegistryVerified(forged, sha256, { now: FIRST_TIME }), undefined)

  const derivativeWithoutId = {
    schemaVersion: 1,
    recordedAt: recorded.recordedAt,
    sourceRefHashes: [...recorded.sourceRefHashes],
    verificationRefs: recorded.verificationRefs.map(reference => ({ ...reference })),
    snapshot: {
      ...recorded.snapshot,
      providerDependencies: [],
    },
    qualification: 'portable-projection',
    derivedFromVersionId: recorded.id,
  }
  const derivative = {
    ...derivativeWithoutId,
    id: await computeAssetVersionId(derivativeWithoutId, sha256),
  }
  assert.match(derivative.id, /^av1p_[0-9a-f]{32}$/)
  assert.equal(await verifyAssetVersionHistoryIdentity(asset({
    versions: [derivative],
    currentVersionId: derivative.id,
  }), sha256), true)
  const recordedFromPortable = await recordAssetVersion(asset({
    providerDependencies: [],
    versions: [derivative],
    currentVersionId: derivative.id,
  }), {
    recordedAt: SECOND_TIME,
    sourceRefHashes: [],
    verificationRefs: [],
  }, sha256)
  assert.equal(recordedFromPortable.status, 'recorded')
  assert.equal(recordedFromPortable.version.qualification, undefined)
  derivative.id = `av1p_${'f'.repeat(32)}`
  assert.equal(await verifyAssetVersionHistoryIdentity(asset({
    versions: [derivative],
    currentVersionId: derivative.id,
  }), sha256), false)
})

test('browser identity preimage matches the shared Node compiler SHA-256 vector', async () => {
  const vector = {
    schemaVersion: 1,
    recordedAt: '2026-07-24T09:00:00.000Z',
    sourceRefHashes: [HASH_A],
    verificationRefs: [{
      checkId: 'check.vector',
      resultId: 'result.vector',
      status: 'pass',
      evaluatedAt: '2026-07-24T08:59:00.000Z',
      safeEvidenceHash: HASH_B,
    }],
    snapshot: {
      format: 'markdown',
      sharedByDesign: true,
      registryState: 'active',
      coverage: [{ platform: 'codex', lastVerified: '2026-07-24' }],
      providerDependencies: [{ provider: 'local', capability: 'files' }],
      dependencyIds: ['dep.vector'],
    },
  }
  assert.equal(
    await computeAssetVersionId(vector, sha256),
    'av1_24d2312e59552d3fa431d6037c7e8767',
  )
})

test('canonical ISO validation rejects impossible dates, offsets, and non-canonical fractions', () => {
  for (const valid of [
    '2024-02-29',
    '2026-07-24',
  ]) assert.equal(isCanonicalIsoDate(valid), true, valid)
  for (const invalid of [
    '2026-02-29',
    '2026-02-30',
    '2026-04-31',
    '0000-01-01',
  ]) assert.equal(isCanonicalIsoDate(invalid), false, invalid)

  for (const valid of [
    '2026-07-24T09:00:00Z',
    '2026-07-24T09:00:00.000Z',
  ]) assert.equal(isCanonicalIsoTimestamp(valid), true, valid)
  for (const invalid of [
    '2026-02-30T09:00:00.000Z',
    '2026-07-24T24:00:00.000Z',
    '2026-07-24T09:00:00.00Z',
    '2026-07-24T09:00:00+00:00',
  ]) assert.equal(isCanonicalIsoTimestamp(invalid), false, invalid)

  assert.throws(() => projectAssetVersionSnapshot(asset({
    coverage: [{ platform: 'Codex', lastVerified: '2026-02-30' }],
  })), /real canonical ISO date/)
})

test('schema2 normalization preserves absent metadata and strictly rejects invalid present shapes', () => {
  const versionless = {
    schemaVersion: 2,
    platforms: [],
    updatedAt: FIRST_TIME,
    assets: [asset()],
  }
  const normalizedVersionless = normalizeRegistry(versionless, { now: FIRST_TIME })
  assert.ok(normalizedVersionless)
  assert.equal('versions' in normalizedVersionless.assets[0], false)
  assert.equal('versionAliases' in normalizedVersionless.assets[0], false)
  assert.equal('currentVersionId' in normalizedVersionless.assets[0], false)

  const snapshot = projectAssetVersionSnapshot(asset())
  const validVersion = version(`av1_${'1'.repeat(32)}`, FIRST_TIME, snapshot)
  const versionedAsset = asset({
    versions: [validVersion],
    versionAliases: [{ name: 'preferred', versionId: validVersion.id }],
    currentVersionId: validVersion.id,
  })
  assert.equal(validateAssetVersionMetadata(versionedAsset), true)
  assert.deepEqual(
    normalizeRegistry({ ...versionless, assets: [versionedAsset] }, { now: FIRST_TIME })?.assets[0],
    versionedAsset,
  )

  const passVersion = version(`av1_${'3'.repeat(32)}`, FIRST_TIME, snapshot, {
    verificationRefs: [{
      checkId: 'asset.open-format.v1',
      resultId: 'result-1',
      status: 'pass',
      evaluatedAt: FIRST_TIME,
      safeEvidenceHash: HASH_A,
    }],
  })
  const failVersion = version(`av1_${'4'.repeat(32)}`, SECOND_TIME, snapshot, {
    verificationRefs: [{
      ...passVersion.verificationRefs[0],
      status: 'fail',
      evaluatedAt: SECOND_TIME,
    }],
  })
  const qualifiedHistory = asset({
    versions: [passVersion, failVersion],
    currentVersionId: failVersion.id,
  })
  assert.equal(validateAssetVersionMetadata(qualifiedHistory), true)
  assert.ok(normalizeRegistry(
    { ...versionless, assets: [qualifiedHistory] },
    { now: SECOND_TIME },
  ))

  const equivalentRepeat = version(`av1_${'5'.repeat(32)}`, SECOND_TIME, snapshot, {
    verificationRefs: [{
      ...passVersion.verificationRefs[0],
      evaluatedAt: SECOND_TIME,
    }],
  })
  assert.equal(validateAssetVersionMetadata(asset({
    versions: [passVersion, equivalentRepeat],
    currentVersionId: equivalentRepeat.id,
  })), false)

  const tooManyVersions = Array.from(
    { length: ASSET_VERSION_LIMITS.versionsPerAsset + 1 },
    (_, index) => version(
      `av1_${index.toString(16).padStart(32, '0')}`,
      new Date(Date.parse(FIRST_TIME) + index * 60_000).toISOString(),
      projectAssetVersionSnapshot(asset({ supportedVersion: String(index) })),
    ),
  )
  const tooManyHashes = Array.from(
    { length: ASSET_VERSION_LIMITS.sourceRefHashesPerVersion + 1 },
    (_, index) => index.toString(16).padStart(64, '0'),
  )
  const invalidAssets = [
    asset({ versions: [{ ...validVersion, schemaVersion: 2 }], currentVersionId: validVersion.id }),
    asset({
      versions: [{ ...validVersion, unexpected: 'unsupported' }],
      currentVersionId: validVersion.id,
    }),
    asset({
      versions: [{
        ...validVersion,
        snapshot: { ...validVersion.snapshot, owner: 'private@example.com' },
      }],
      currentVersionId: validVersion.id,
    }),
    asset({ versions: [validVersion, validVersion], currentVersionId: validVersion.id }),
    asset({
      versions: tooManyVersions,
      currentVersionId: tooManyVersions.at(-1).id,
    }),
    asset({
      versions: [{ ...validVersion, sourceRefHashes: tooManyHashes }],
      currentVersionId: validVersion.id,
    }),
    asset({ versions: [validVersion], currentVersionId: `av1_${'2'.repeat(32)}` }),
    asset({
      versions: [validVersion],
      currentVersionId: validVersion.id,
      versionAliases: [{ name: 'preferred', versionId: `av1_${'2'.repeat(32)}` }],
    }),
    asset({
      versions: [validVersion],
      currentVersionId: validVersion.id,
      versionAliases: [
        { name: 'Preferred', versionId: validVersion.id },
        { name: 'preferred', versionId: validVersion.id },
      ],
    }),
    asset({
      versions: [validVersion],
      currentVersionId: validVersion.id,
      versionAliases: Array.from({ length: ASSET_VERSION_LIMITS.aliasesPerVersion + 1 }, (_, index) => ({
        name: `alias-${index}`,
        versionId: validVersion.id,
      })),
    }),
  ]
  for (const invalid of invalidAssets) {
    assert.equal(validateAssetVersionMetadata(invalid), false)
    assert.equal(normalizeRegistry({ ...versionless, assets: [invalid] }, { now: FIRST_TIME }), undefined)
  }
})

test('construction fails closed on invalid hashes, verification shapes, and bounded labels', async () => {
  await assert.rejects(
    recordAssetVersion(asset(), {
      recordedAt: FIRST_TIME,
      sourceRefHashes: ['not-a-hash'],
      verificationRefs: [],
    }, deterministicHash),
    /hash/i,
  )
  await assert.rejects(
    recordAssetVersion(asset(), {
      recordedAt: FIRST_TIME,
      sourceRefHashes: [],
      verificationRefs: [{
        checkId: 'x'.repeat(ASSET_VERSION_LIMITS.labelLength + 1),
        resultId: 'result',
        status: 'pass',
        evaluatedAt: FIRST_TIME,
      }],
    }, deterministicHash),
    /verification/i,
  )
  await assert.rejects(
    recordAssetVersion(asset(), {
      recordedAt: FIRST_TIME,
      sourceRefHashes: [],
      verificationRefs: [],
    }, async () => 'not-sha256'),
    /SHA-256/i,
  )
})
