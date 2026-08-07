import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CATALOG_MISSING_VALUE,
  buildAssetCatalogIndex,
  queryAssetCatalog,
} from '../asset-catalog.ts'
import { normalizeRegistry } from '../session.ts'

const TODAY = '2026-07-23T00:00:00.000Z'

function asset(overrides = {}) {
  return {
    id: 'asset-default',
    name: 'Default asset',
    kind: 'skill',
    format: 'markdown',
    location: 'skills/default.md',
    sensitivity: 'internal',
    sharedByDesign: true,
    coverage: [],
    providerDependencies: [],
    evidence: [],
    ...overrides,
  }
}

function signal(assetId, status, overrides = {}) {
  return {
    id: `${assetId}:${status}`,
    dimension: 'skills',
    assetId,
    assetName: assetId,
    status,
    condition: 'deterministic condition',
    finding: 'deterministic finding',
    evidence: 'recorded fields',
    owner: 'owner',
    ...overrides,
  }
}

test('compiler lifecycle values remain import-compatible and unsupported values are missing', () => {
  for (const registryState of ['active', 'archived', 'missing']) {
    const registry = normalizeRegistry({
      schemaVersion: 2,
      platforms: [],
      updatedAt: TODAY,
      assets: [asset({ registryState })],
    }, { now: TODAY })

    assert.equal(registry?.assets[0].registryState, registryState)
    const index = buildAssetCatalogIndex(registry.assets, [], TODAY)
    assert.deepEqual(index.entries[0].facetValues.lifecycle, [registryState])
  }

  const unsupported = asset({ registryState: 'retired' })
  const index = buildAssetCatalogIndex([unsupported], [], TODAY)
  assert.deepEqual(index.entries[0].facetValues.lifecycle, [CATALOG_MISSING_VALUE])
  assert.equal(index.facets.lifecycle.availability, 'unavailable')
})

test('search covers only the approved bounded recorded fields', () => {
  const recorded = asset({
    id: 'asset-search',
    name: 'Portable Playbook',
    kind: 'workflow',
    owner: 'Mira',
    primaryProvider: 'PrimaryCloud',
    fallbackProvider: 'FallbackCloud',
    providerDependencies: [{ provider: 'DependencyCloud', capability: 'chat', fallback: 'LocalRunner' }],
    coverage: [{ platform: 'CoverageCloud' }],
    stableId: 'stable:portable-playbook',
    format: 'yaml',
    location: 'workflows/playbook.yaml',
    purpose: 'This field is intentionally outside search',
  })
  const index = buildAssetCatalogIndex([recorded], [], TODAY)

  for (const query of [
    'portable playbook',
    'workflow',
    'mira',
    'primarycloud',
    'fallbackcloud',
    'dependencycloud',
    'localrunner',
    'coveragecloud',
    'stable:portable',
    'yaml',
    'workflows/playbook',
  ]) {
    assert.deepEqual(queryAssetCatalog(index, { search: query }).entries.map(entry => entry.asset.id), ['asset-search'])
  }
  assert.equal(queryAssetCatalog(index, { search: 'intentionally outside search' }).entries.length, 0)
})

test('all six facets use recorded facts or deterministic states', () => {
  const complete = asset({
    id: 'asset-complete',
    owner: 'Mira',
    kind: 'workflow',
    registryState: 'active',
    primaryProvider: 'PrimaryCloud',
    fallbackProvider: 'FallbackCloud',
    providerDependencies: [{ provider: 'DependencyCloud', capability: 'chat', fallback: 'LocalRunner' }],
    coverage: [
      { platform: 'CoverageCloud', lastVerified: '2026-07-10' },
      { platform: 'OldCoverage', lastVerified: '2026-05-01' },
    ],
    evidence: [{ label: 'Recent review', date: '2026-07-20' }],
  })
  const index = buildAssetCatalogIndex([
    complete,
    asset({ id: 'asset-stale', evidence: [{ label: 'Old evidence', date: '2026-05-01' }] }),
  ], [
    signal('asset-complete', 'pass'),
    signal('asset-complete', 'warn'),
  ], TODAY)

  assert.deepEqual(index.entries[0].facetValues, {
    owner: ['Mira'],
    kind: ['workflow'],
    lifecycle: ['active'],
    portability: ['warn'],
    provider: ['CoverageCloud', 'DependencyCloud', 'FallbackCloud', 'LocalRunner', 'OldCoverage', 'PrimaryCloud'],
    evidenceFreshness: ['current'],
  })
  assert.deepEqual(index.entries[1].facetValues.evidenceFreshness, ['stale'])
  assert.deepEqual(Object.keys(index.facets), [
    'owner',
    'kind',
    'lifecycle',
    'portability',
    'provider',
    'evidenceFreshness',
  ])
})

test('filters use OR within a facet and AND between facets without mutating sources', () => {
  const assets = [
    asset({ id: 'a', name: 'Alpha', owner: 'Mira', kind: 'skill', registryState: 'active' }),
    asset({ id: 'b', name: 'Beta', owner: 'Noah', kind: 'skill', registryState: 'archived' }),
    asset({ id: 'c', name: 'Gamma', owner: 'Mira', kind: 'workflow', registryState: 'missing' }),
  ]
  const before = structuredClone(assets)
  const index = buildAssetCatalogIndex(assets, [], TODAY)
  const result = queryAssetCatalog(index, {
    facets: {
      owner: ['Mira', 'Noah'],
      lifecycle: ['active', 'archived'],
      kind: ['skill'],
    },
  })

  assert.deepEqual(result.entries.map(entry => entry.asset.id), ['a', 'b'])
  assert.deepEqual(assets, before)
  assert.equal(result.activeCriteriaCount, 5)
  assert.equal(result.activeCriteriaSummary, 'Owner: Mira or Noah · Kind: skill · Lifecycle: active or archived')
  assert.equal(result.resultSummary, '2 of 3 assets')
})

test('missing dimensions are explicit and wholly absent dimensions are unavailable', () => {
  const index = buildAssetCatalogIndex([
    asset({ id: 'missing-a' }),
    asset({ id: 'missing-b', owner: 'Mira' }),
  ], [], TODAY)

  assert.equal(index.facets.owner.availability, 'available')
  assert.equal(index.facets.owner.missingCount, 1)
  assert.deepEqual(index.facets.owner.values.map(item => [item.value, item.count]), [
    [CATALOG_MISSING_VALUE, 1],
    ['Mira', 1],
  ])
  assert.equal(index.facets.lifecycle.availability, 'unavailable')
  assert.equal(index.facets.lifecycle.missingCount, 2)
  assert.deepEqual(
    queryAssetCatalog(index, { facets: { owner: [CATALOG_MISSING_VALUE] } }).entries.map(entry => entry.asset.id),
    ['missing-a'],
  )
})

test('no-result and selected-outside-result summaries are deterministic and recoverable', () => {
  const index = buildAssetCatalogIndex([
    asset({ id: 'a', name: 'Alpha', owner: 'Mira' }),
    asset({ id: 'b', name: 'Beta', owner: 'Noah' }),
  ], [], TODAY)
  const result = queryAssetCatalog(index, {
    search: 'does-not-exist',
    facets: { owner: ['Mira'] },
  }, 'b')

  assert.equal(result.entries.length, 0)
  assert.equal(result.activeCriteriaCount, 2)
  assert.equal(result.activeCriteriaSummary, 'Search: “does-not-exist” · Owner: Mira')
  assert.equal(result.resultSummary, 'No assets match the active criteria (0 of 2)')
  assert.equal(result.selectedAssetOutsideResults, true)
  assert.equal(result.canClearCriteria, true)

  const clear = queryAssetCatalog(index, {}, 'b')
  assert.equal(clear.activeCriteriaSummary, 'No active criteria')
  assert.equal(clear.resultSummary, '2 assets')
  assert.equal(clear.selectedAssetOutsideResults, false)
  assert.equal(clear.canClearCriteria, false)
})
