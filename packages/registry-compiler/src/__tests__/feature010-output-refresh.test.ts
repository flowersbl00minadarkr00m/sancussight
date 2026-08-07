import assert from 'node:assert/strict'
import test from 'node:test'

import type { AssetProposal, ReviewDecision } from '../contracts.ts'
import {
  assertRegistryImportable,
  computeRegistryAssetVersionId,
  serializeConfirmedProposals,
  type LocalRegistry,
  type RegistryAssetVersionV1,
} from '../output/local.ts'
import { assertPortableRegistrySafe } from '../output/portable.ts'

const NOW = '2026-07-24T10:00:00.000Z'

function proposal(id: string): AssetProposal {
  return {
    proposalId: `skill:${id}`,
    identityKey: `skill:stable:${id}`,
    identityConfidence: 'high',
    kind: 'skill',
    displayName: `${id} skill`,
    stableId: `skill:${id}`,
    format: 'json',
    lifecycle: 'active',
    sensitivity: 'internal',
    platforms: ['linux', 'windows'],
    locations: [{
      rootId: 'workspace',
      relativePath: `skills/${id}.json`,
      localPath: `C:/Users/local/.sancussight/skills/${id}.json`,
      portableAlias: `project:skill-${id}`,
    }],
    provenance: [{
      sourceType: 'skills',
      sourceId: id,
      adapterId: 'skills-manifest',
      adapterVersion: '1.0.0',
      rootId: 'workspace',
      platform: 'windows',
      relativePath: 'skills.json',
      observedAt: '2026-07-23T10:00:00.000Z',
    }],
    selectedByDefault: true,
    warnings: [],
  }
}

function decision(proposalId: string): ReviewDecision {
  return { proposalId, decision: 'select' }
}

function version(): RegistryAssetVersionV1 {
  const withoutId: Omit<RegistryAssetVersionV1, 'id'> = {
    schemaVersion: 1,
    recordedAt: '2026-07-23T11:00:00.000Z',
    sourceRefHashes: ['1'.repeat(64)],
    verificationRefs: [{
      checkId: 'check:portable',
      resultId: 'result:one',
      status: 'pass',
      evaluatedAt: '2026-07-23T10:30:00.000Z',
      safeEvidenceHash: '2'.repeat(64),
    }],
    snapshot: {
      format: 'json',
      sharedByDesign: true,
      registryState: 'active',
      supportedVersion: '1.0',
      coverage: [{ platform: 'linux' }, { platform: 'windows', lastVerified: '2026-07-23' }],
      providerDependencies: [{
        provider: 'C:\\Users\\henry\\secret-provider',
        capability: 'prompt capability',
        fallback: 'henry@example.com',
      }],
      dependencyIds: ['dependency:portable'],
    },
  }
  return {
    ...withoutId,
    id: computeRegistryAssetVersionId(withoutId),
  }
}

const VERSION_ID = version().id

function registryWithHistory(id = 'stable'): LocalRegistry {
  const selected = proposal(id)
  const registry = serializeConfirmedProposals(
    [selected],
    [decision(selected.proposalId)],
    { runId: 'seed', now: '2026-07-23T12:00:00.000Z' },
  ).local
  registry.assets[0].versions = [version()]
  registry.assets[0].versionAliases = [{ name: 'preferred', versionId: VERSION_ID }]
  registry.assets[0].currentVersionId = VERSION_ID
  assertRegistryImportable(registry)
  return registry
}

test('Feature 010 compiler keeps version-free schema2 output compatible and creates no history', () => {
  const selected = proposal('new')
  const outputs = serializeConfirmedProposals(
    [selected],
    [decision(selected.proposalId)],
    { runId: 'version-free', now: NOW },
  )

  for (const registry of [outputs.local, outputs.portable]) {
    const asset = registry.assets[0]
    assert.equal(Object.hasOwn(asset, 'versions'), false)
    assert.equal(Object.hasOwn(asset, 'versionAliases'), false)
    assert.equal(Object.hasOwn(asset, 'currentVersionId'), false)
    assertRegistryImportable(registry)
  }
})

test('Feature 010 stable refresh preserves local history and creates truthful portable derivatives', () => {
  const previous = registryWithHistory()
  const selected = proposal('stable')
  selected.displayName = 'refreshed display name'
  const priorHistory = structuredClone({
    versions: previous.assets[0].versions,
    versionAliases: previous.assets[0].versionAliases,
    currentVersionId: previous.assets[0].currentVersionId,
  })

  const outputs = serializeConfirmedProposals(
    [selected],
    [decision(selected.proposalId)],
    { runId: 'refresh', now: NOW, previousRegistry: previous },
  )
  const localAsset = outputs.local.assets[0]
  const portableAsset = outputs.portable.assets[0]

  assert.deepEqual({
    versions: localAsset.versions,
    versionAliases: localAsset.versionAliases,
    currentVersionId: localAsset.currentVersionId,
  }, priorHistory)
  assert.equal(localAsset.versions?.length, 1)
  assert.equal(localAsset.name, 'refreshed display name')

  const portableVersion = portableAsset.versions?.[0]
  assert.match(portableVersion?.id ?? '', /^av1p_[0-9a-f]{32}$/)
  assert.notEqual(portableVersion?.id, VERSION_ID)
  assert.equal(portableVersion?.qualification, 'portable-projection')
  assert.equal(portableVersion?.derivedFromVersionId, VERSION_ID)
  assert.deepEqual(portableAsset.versionAliases, [{
    name: 'preferred',
    versionId: portableVersion?.id,
  }])
  assert.equal(portableAsset.currentVersionId, portableVersion?.id)
  assert.deepEqual(portableAsset.versions?.[0]?.snapshot.providerDependencies, [{
    provider: 'local-reference',
    capability: 'redacted-capability',
    fallback: 'local-identity',
  }])
  assertPortableRegistrySafe(outputs.portable)
  assert.doesNotMatch(
    JSON.stringify(portableAsset.versions),
    /C:\\|Users|henry|secret|prompt|@|owner|evidence\s*:/i,
  )
})

test('Feature 010 missing assets retain valid history and new assets receive none', () => {
  const previous = registryWithHistory('missing')
  const newcomer = proposal('new')
  const outputs = serializeConfirmedProposals(
    [newcomer],
    [decision(newcomer.proposalId)],
    { runId: 'missing-and-new', now: NOW, previousRegistry: previous },
  )

  const missing = outputs.local.assets.find(asset => asset.stableId === 'skill:missing')
  const fresh = outputs.local.assets.find(asset => asset.stableId === 'skill:new')
  assert.equal(missing?.registryState, 'missing')
  assert.deepEqual(missing?.versions, previous.assets[0].versions)
  assert.deepEqual(missing?.versionAliases, previous.assets[0].versionAliases)
  assert.equal(missing?.currentVersionId, VERSION_ID)
  assert.equal(Object.hasOwn(fresh!, 'versions'), false)
  assert.equal(Object.hasOwn(fresh!, 'versionAliases'), false)
  assert.equal(Object.hasOwn(fresh!, 'currentVersionId'), false)
  assertPortableRegistrySafe(outputs.portable)
})

test('Feature 010 compiler fails closed on unsupported or invalid prior history', () => {
  const selected = proposal('stable')
  const unsupported = registryWithHistory()
  ;(unsupported.assets[0].versions![0] as { schemaVersion: number }).schemaVersion = 2
  assert.throws(
    () => serializeConfirmedProposals(
      [selected],
      [decision(selected.proposalId)],
      { runId: 'unsupported', now: NOW, previousRegistry: unsupported },
    ),
    /version history is invalid/,
  )

  const overBound = registryWithHistory()
  overBound.assets[0].versions![0].verificationRefs = Array.from({ length: 33 }, (_, index) => ({
    checkId: `check:${String(index).padStart(2, '0')}`,
    resultId: `result:${String(index).padStart(2, '0')}`,
    status: 'pass' as const,
    evaluatedAt: '2026-07-23T10:30:00.000Z',
  }))
  assert.throws(
    () => serializeConfirmedProposals(
      [selected],
      [decision(selected.proposalId)],
      { runId: 'over-bound', now: NOW, previousRegistry: overBound },
    ),
    /version history is invalid/,
  )

  const dangling = registryWithHistory()
  dangling.assets[0].currentVersionId = `av1_${'b'.repeat(32)}`
  assert.throws(
    () => serializeConfirmedProposals(
      [selected],
      [decision(selected.proposalId)],
      { runId: 'dangling', now: NOW, previousRegistry: dangling },
    ),
    /current version must point to the latest version/,
  )

  const forged = registryWithHistory()
  forged.assets[0].versions![0].id = `av1_${'f'.repeat(32)}`
  forged.assets[0].currentVersionId = forged.assets[0].versions![0].id
  assert.throws(
    () => serializeConfirmedProposals(
      [selected],
      [decision(selected.proposalId)],
      { runId: 'forged', now: NOW, previousRegistry: forged },
    ),
    /identity does not match its canonical preimage/,
  )
})

test('Feature 010 compiler rejects impossible and non-canonical ISO vectors', () => {
  const selected = proposal('stable')
  for (const recordedAt of [
    '2026-02-30T11:00:00.000Z',
    '2026-07-23T11:00:00+00:00',
    '2026-07-23T11:00:00.00Z',
  ]) {
    const invalid = registryWithHistory()
    invalid.assets[0].versions![0].recordedAt = recordedAt
    assert.throws(
      () => serializeConfirmedProposals(
        [selected],
        [decision(selected.proposalId)],
        { runId: `invalid-${recordedAt}`, now: NOW, previousRegistry: invalid },
      ),
      /version history is invalid/,
      recordedAt,
    )
  }

  const impossibleDate = registryWithHistory()
  impossibleDate.assets[0].versions![0].snapshot.coverage[1].lastVerified = '2026-02-30'
  assert.throws(
    () => serializeConfirmedProposals(
      [selected],
      [decision(selected.proposalId)],
      { runId: 'invalid-date', now: NOW, previousRegistry: impossibleDate },
    ),
    /version history is invalid/,
  )
})

test('Feature 010 compiler identity matches the shared browser SHA-256 vector', () => {
  assert.equal(computeRegistryAssetVersionId({
    schemaVersion: 1,
    recordedAt: '2026-07-24T09:00:00.000Z',
    sourceRefHashes: ['a'.repeat(64)],
    verificationRefs: [{
      checkId: 'check.vector',
      resultId: 'result.vector',
      status: 'pass',
      evaluatedAt: '2026-07-24T08:59:00.000Z',
      safeEvidenceHash: 'b'.repeat(64),
    }],
    snapshot: {
      format: 'markdown',
      sharedByDesign: true,
      registryState: 'active',
      coverage: [{ platform: 'codex', lastVerified: '2026-07-24' }],
      providerDependencies: [{ provider: 'local', capability: 'files' }],
      dependencyIds: ['dep.vector'],
    },
  }), 'av1_24d2312e59552d3fa431d6037c7e8767')
})
