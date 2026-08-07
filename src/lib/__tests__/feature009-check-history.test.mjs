import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CheckHistoryStore,
  CHECK_HISTORY_SNAPSHOT_FIELDS,
  createMemoryCheckHistoryRepository,
  hashRegistryScope,
  hashSafeEvidence,
} from '../check-history-store.ts'

const SCOPE_A = 'a'.repeat(64)
const SCOPE_B = 'b'.repeat(64)
const ASSET_ID = 'asset-history'
const CHECK_ID = 'portability.provider-fallback.v1'
const RESULT_A = 'asset-history:dep-PrimaryCloud-chat'
const RESULT_B = 'asset-history:dep-SecondCloud-embeddings'

function input(overrides = {}) {
  return {
    registryScopeHash: SCOPE_A,
    assetId: ASSET_ID,
    checkId: CHECK_ID,
    resultDiscriminator: RESULT_A,
    status: 'fail',
    evaluatedAt: '2026-07-23T00:00:00.000Z',
    safeEvidenceRef: 'evidence:reader-safe',
    ...overrides,
  }
}

test('registry scope hashing is deterministic, order-independent, and retains no preimage', async () => {
  const first = {
    schemaVersion: 2,
    assets: [
      { id: 'asset-b', stableId: 'stable:b', location: 'private/b.md' },
      { id: 'asset-a', stableId: 'stable:a', location: 'private/a.md' },
    ],
  }
  const reordered = {
    schemaVersion: 2,
    assets: [...first.assets].reverse(),
  }

  const firstHash = await hashRegistryScope(first)
  const reorderedHash = await hashRegistryScope(reordered)
  const changedHash = await hashRegistryScope({
    schemaVersion: 2,
    assets: [{ id: 'asset-a', stableId: 'stable:changed' }],
  })

  assert.match(firstHash, /^[a-f0-9]{64}$/)
  assert.equal(firstHash, reorderedHash)
  assert.notEqual(firstHash, changedHash)
  assert.doesNotMatch(firstHash, /stable|asset|private/)

  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)
  await store.record(input({ registryScopeHash: firstHash }))
  const serialized = JSON.stringify(await repository.list())
  for (const preimageValue of ['stable:a', 'stable:b', 'asset-a', 'asset-b', 'private/a.md']) {
    assert.equal(serialized.includes(preimageValue), false)
  }
})

test('the fixed snapshot allowlist excludes raw and sensitive input while hashing the safe reference', async () => {
  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)
  const oversizedInput = input({
    finding: 'RAW_FINDING_SENTINEL',
    evidence: 'RAW_EVIDENCE_SENTINEL',
    envelope: {
      attributes: { secret: 'ENVELOPE_ATTRIBUTE_SENTINEL' },
      provenance: { artifactName: 'PRIVATE_PATH_SENTINEL' },
    },
    path: 'PRIVATE_PATH_SENTINEL',
    prompt: 'PROMPT_SENTINEL',
    response: 'RESPONSE_SENTINEL',
    credential: 'CREDENTIAL_SENTINEL',
    registry: {
      assets: [{ id: 'REGISTRY_OBJECT_SENTINEL' }],
    },
  })

  const result = await store.record(oversizedInput)
  const entries = await repository.list()
  const serialized = JSON.stringify(entries)

  assert.equal(result.availability, 'available')
  assert.equal(result.recorded, true)
  assert.equal(entries.length, 1)
  assert.deepEqual(
    Object.keys(entries[0].snapshot).sort(),
    [...CHECK_HISTORY_SNAPSHOT_FIELDS].sort(),
  )
  assert.equal(
    entries[0].snapshot.safeEvidenceHash,
    await hashSafeEvidence(oversizedInput.status, oversizedInput.safeEvidenceRef),
  )
  for (const forbidden of [
    'RAW_FINDING_SENTINEL',
    'RAW_EVIDENCE_SENTINEL',
    'ENVELOPE_ATTRIBUTE_SENTINEL',
    'PRIVATE_PATH_SENTINEL',
    'PROMPT_SENTINEL',
    'RESPONSE_SENTINEL',
    'CREDENTIAL_SENTINEL',
    'REGISTRY_OBJECT_SENTINEL',
    oversizedInput.safeEvidenceRef,
  ]) {
    assert.equal(serialized.includes(forbidden), false)
  }
})

test('equivalent consecutive results dedupe and changed results expose one previous distinct snapshot', async () => {
  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)

  const first = await store.record(input())
  const duplicate = await store.record(input({
    evaluatedAt: '2026-07-23T01:00:00.000Z',
  }))
  const changed = await store.record(input({
    status: 'pass',
    evaluatedAt: '2026-07-23T02:00:00.000Z',
  }))

  assert.equal(first.recorded, true)
  assert.equal(duplicate.recorded, false)
  assert.equal(changed.recorded, true)
  assert.equal((await repository.list()).length, 2)
  assert.equal(changed.current?.status, 'pass')
  assert.equal(changed.current?.evaluatedAt, '2026-07-23T02:00:00.000Z')
  assert.equal(changed.previous?.status, 'fail')
  assert.equal(changed.previous?.evaluatedAt, '2026-07-23T00:00:00.000Z')
})

test('history streams are isolated by registry scope, asset, check ID, and result discriminator', async () => {
  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)

  await store.record(input({ registryScopeHash: SCOPE_A, status: 'fail' }))
  await store.record(input({ registryScopeHash: SCOPE_B, status: 'pass' }))
  await store.record(input({ assetId: 'asset-other', status: 'warn' }))
  await store.record(input({ checkId: 'asset.named-owner.v1', status: 'unknown' }))

  const scopeA = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  const scopeB = await store.read(SCOPE_B, ASSET_ID, CHECK_ID, RESULT_A)
  const otherAsset = await store.read(SCOPE_A, 'asset-other', CHECK_ID, RESULT_A)
  const otherCheck = await store.read(SCOPE_A, ASSET_ID, 'asset.named-owner.v1', RESULT_A)

  assert.equal(scopeA.current?.status, 'fail')
  assert.equal(scopeB.current?.status, 'pass')
  assert.equal(otherAsset.current?.status, 'warn')
  assert.equal(otherCheck.current?.status, 'unknown')
  assert.equal(scopeA.previous, undefined)
})

test('same-family sibling results dedupe and compare in independent streams', async () => {
  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)

  await store.record(input({
    resultDiscriminator: RESULT_A,
    status: 'pass',
  }))
  await store.record(input({
    resultDiscriminator: RESULT_B,
    status: 'fail',
  }))
  await store.record(input({
    resultDiscriminator: RESULT_A,
    status: 'pass',
    evaluatedAt: '2026-07-23T01:00:00.000Z',
  }))
  await store.record(input({
    resultDiscriminator: RESULT_B,
    status: 'fail',
    evaluatedAt: '2026-07-23T01:00:00.000Z',
  }))

  assert.equal((await repository.list()).length, 2)
  const firstA = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  const firstB = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_B)
  assert.equal(firstA.current?.status, 'pass')
  assert.equal(firstA.previous, undefined)
  assert.equal(firstB.current?.status, 'fail')
  assert.equal(firstB.previous, undefined)

  await store.record(input({
    resultDiscriminator: RESULT_A,
    status: 'warn',
    evaluatedAt: '2026-07-23T02:00:00.000Z',
  }))
  const changedA = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  const unchangedB = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_B)
  assert.equal(changedA.current?.status, 'warn')
  assert.equal(changedA.previous?.status, 'pass')
  assert.equal(unchangedB.current?.status, 'fail')
  assert.equal(unchangedB.previous, undefined)
})

test('legacy discriminator-less snapshots are isolated from current result history', async () => {
  const legacySnapshot = {
    registryScopeHash: SCOPE_A,
    assetId: ASSET_ID,
    checkId: CHECK_ID,
    status: 'pass',
    evaluatedAt: '2026-07-22T00:00:00.000Z',
    safeEvidenceHash: await hashSafeEvidence('pass', 'legacy-reference'),
  }
  const repository = createMemoryCheckHistoryRepository([legacySnapshot])
  const store = new CheckHistoryStore(repository)

  const beforeRecord = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  assert.equal(beforeRecord.current, undefined)
  assert.equal(beforeRecord.previous, undefined)

  const current = await store.record(input())
  assert.equal(current.current?.resultDiscriminator, RESULT_A)
  assert.equal(current.previous, undefined)
  const afterRecord = await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  assert.equal(afterRecord.current?.resultDiscriminator, RESULT_A)
  assert.equal(afterRecord.previous, undefined)
})

test('retention keeps 20 distinct snapshots per stream and 1,000 globally', async () => {
  const perStreamRepository = createMemoryCheckHistoryRepository()
  const perStreamStore = new CheckHistoryStore(perStreamRepository)
  const statuses = ['fail', 'warn', 'pass', 'unknown', 'accepted']

  for (let index = 0; index < 22; index += 1) {
    await perStreamStore.record(input({
      status: statuses[index % statuses.length],
      evaluatedAt: `2026-07-23T${String(index).padStart(2, '0')}:00:00.000Z`,
      safeEvidenceRef: `evidence:${index}`,
    }))
  }

  const perStreamEntries = await perStreamRepository.list()
  const comparison = await perStreamStore.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)
  assert.equal(perStreamEntries.length, 20)
  assert.equal(comparison.current?.evaluatedAt, '2026-07-23T21:00:00.000Z')
  assert.equal(comparison.previous?.evaluatedAt, '2026-07-23T20:00:00.000Z')
  assert.equal(perStreamEntries.some((entry) => entry.snapshot.evaluatedAt.endsWith('T00:00:00.000Z')), false)
  assert.equal(perStreamEntries.some((entry) => entry.snapshot.evaluatedAt.endsWith('T01:00:00.000Z')), false)

  const globalRepository = createMemoryCheckHistoryRepository()
  const globalStore = new CheckHistoryStore(globalRepository)
  for (let index = 0; index < 1001; index += 1) {
    await globalStore.record(input({
      assetId: `asset-${String(index).padStart(4, '0')}`,
      safeEvidenceRef: `evidence:${index}`,
    }))
  }

  assert.equal((await globalRepository.list()).length, 1000)
  assert.equal((await globalStore.read(SCOPE_A, 'asset-0000', CHECK_ID, RESULT_A)).current, undefined)
  assert.equal((await globalStore.read(SCOPE_A, 'asset-1000', CHECK_ID, RESULT_A)).current?.assetId, 'asset-1000')
})

test('clear is explicit and storage failures return unavailable without blocking the caller', async () => {
  const repository = createMemoryCheckHistoryRepository()
  const store = new CheckHistoryStore(repository)
  await store.record(input())

  assert.deepEqual(await store.clear(), { state: 'cleared' })
  assert.equal((await store.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A)).current, undefined)

  const failure = new Error('simulated IndexedDB failure')
  const unavailableStore = new CheckHistoryStore({
    async list() { throw failure },
    async add() { throw failure },
    async delete() { throw failure },
    async clear() { throw failure },
  })
  const currentEvaluation = { status: 'fail', usable: true }

  assert.deepEqual(await unavailableStore.record(input()), { availability: 'unavailable' })
  assert.deepEqual(
    await unavailableStore.read(SCOPE_A, ASSET_ID, CHECK_ID, RESULT_A),
    { availability: 'unavailable' },
  )
  assert.deepEqual(await unavailableStore.clear(), { state: 'unavailable' })
  assert.deepEqual(currentEvaluation, { status: 'fail', usable: true })
})
