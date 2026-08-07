import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  INTEROPERABILITY_SNAPSHOT_FIELDS,
  INTEROPERABILITY_STORE_LIMITS,
  InteroperabilityPreviewStore,
  createMemoryInteroperabilityRepository,
  validateInteroperabilityPreviewSnapshot,
} from '../interoperability-store.ts'

const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)

function snapshot(overrides = {}) {
  return {
    schemaVersion: 1,
    profileId: 'openlineage-run-event-core-1.0.5',
    operationKind: 'openlineage-import',
    createdAt: '2026-07-24T14:00:00.000Z',
    acceptedCount: 1,
    rejectedCount: 0,
    omittedCount: 0,
    reasonCodeCounts: [],
    safeHashes: [HASH_A],
    persistenceState: 'available',
    ...overrides,
  }
}

test('the exact snapshot allowlist rejects extensions, unsafe hashes, and raw input families', () => {
  assert.deepEqual(INTEROPERABILITY_SNAPSHOT_FIELDS, [
    'schemaVersion',
    'profileId',
    'operationKind',
    'createdAt',
    'acceptedCount',
    'rejectedCount',
    'omittedCount',
    'reasonCodeCounts',
    'safeHashes',
    'persistenceState',
    'confirmationDigest',
  ])
  assert.equal(validateInteroperabilityPreviewSnapshot(snapshot()), true)
  assert.equal(validateInteroperabilityPreviewSnapshot(snapshot({ producer: 'https://private.invalid' })), false)
  assert.equal(validateInteroperabilityPreviewSnapshot(snapshot({ safeHashes: ['raw-dataset-name'] })), false)
  assert.equal(validateInteroperabilityPreviewSnapshot(snapshot({ reasonCodeCounts: [{ code: 'bad code', count: 1 }] })), false)

  const hostile = {
    ...snapshot(),
    fileBytes: 'FILE_BYTES_SENTINEL',
    facets: { prompt: 'PROMPT_SENTINEL' },
    registry: { assets: ['REGISTRY_SENTINEL'] },
    path: 'C:\\private\\dataset.jsonl',
    url: 'https://private.invalid',
    credential: 'CREDENTIAL_SENTINEL',
    identity: 'IDENTITY_SENTINEL',
    response: 'RESPONSE_SENTINEL',
    reasoning: 'REASONING_SENTINEL',
    toolPayload: 'TOOL_PAYLOAD_SENTINEL',
  }
  assert.equal(validateInteroperabilityPreviewSnapshot(hostile), false)
})

test('recording sanitizes by validation and deduplicates only equivalent consecutive previews', async () => {
  const repository = createMemoryInteroperabilityRepository()
  const store = new InteroperabilityPreviewStore(repository)

  const first = await store.record(snapshot())
  const duplicate = await store.record(snapshot({ createdAt: '2026-07-24T14:01:00.000Z' }))
  const changed = await store.record(snapshot({
    createdAt: '2026-07-24T14:02:00.000Z',
    safeHashes: [HASH_B],
  }))

  assert.deepEqual(
    [first.availability, duplicate.availability, changed.availability],
    ['available', 'available', 'available'],
  )
  assert.equal(first.recorded, true)
  assert.equal(duplicate.recorded, false)
  assert.equal(changed.recorded, true)
  assert.equal((await store.list()).snapshots.length, 2)
  const serialized = JSON.stringify(await repository.list())
  for (const sentinel of ['FILE_BYTES_SENTINEL', 'PROMPT_SENTINEL', 'CREDENTIAL_SENTINEL']) {
    assert.equal(serialized.includes(sentinel), false)
  }
})

test('equivalence is consecutive within a profile even when another profile was recorded between', async () => {
  const store = new InteroperabilityPreviewStore(createMemoryInteroperabilityRepository())
  await store.record(snapshot())
  await store.record(snapshot({
    profileId: 'otel-genai-metadata-preview-1',
    operationKind: 'telemetry-alignment',
    createdAt: '2026-07-24T14:01:00.000Z',
    safeHashes: [HASH_B],
  }))

  const duplicate = await store.record(snapshot({
    createdAt: '2026-07-24T14:02:00.000Z',
  }))

  assert.equal(duplicate.availability, 'available')
  assert.equal(duplicate.recorded, false)
  assert.equal((await store.list()).snapshots.length, 2)
})

test('concurrent equivalent records deterministically persist exactly one snapshot', async () => {
  const repository = createMemoryInteroperabilityRepository()
  const store = new InteroperabilityPreviewStore(repository)

  const results = await Promise.all([
    store.record(snapshot()),
    store.record(snapshot({ createdAt: '2026-07-24T14:01:00.000Z' })),
    store.record(snapshot({ createdAt: '2026-07-24T14:02:00.000Z' })),
  ])

  assert.deepEqual(results.map(result => result.availability), [
    'available',
    'available',
    'available',
  ])
  assert.deepEqual(results.map(result => result.recorded), [true, false, false])
  assert.equal((await repository.list()).length, 1)
  assert.equal((await store.list()).snapshots.length, 1)
})

test('two store instances sharing one repository atomically deduplicate equivalent records', async () => {
  const repository = createMemoryInteroperabilityRepository()
  const firstStore = new InteroperabilityPreviewStore(repository)
  const secondStore = new InteroperabilityPreviewStore(repository)

  const results = await Promise.all([
    firstStore.record(snapshot()),
    secondStore.record(snapshot({ createdAt: '2026-07-24T14:01:00.000Z' })),
  ])

  assert.deepEqual(results.map(result => result.availability), [
    'available',
    'available',
  ])
  assert.deepEqual(results.map(result => result.recorded), [true, false])
  assert.equal((await repository.list()).length, 1)
  assert.equal((await firstStore.list()).snapshots.length, 1)
  assert.equal((await secondStore.list()).snapshots.length, 1)
})

test('the IndexedDB repository keeps equivalence, insertion, and retention in one readwrite transaction', () => {
  const source = readFileSync(
    new URL('../interoperability-store.ts', import.meta.url),
    'utf8',
  )
  const repositoryStart = source.indexOf(
    'export class IndexedDbInteroperabilityRepository',
  )
  const atomicStart = source.indexOf(
    'async recordAtomically(',
    repositoryStart,
  )
  const clearStart = source.indexOf(
    'async clear()',
    atomicStart,
  )
  const atomicSource = source.slice(atomicStart, clearStart)

  assert.notEqual(repositoryStart, -1)
  assert.notEqual(atomicStart, -1)
  assert.notEqual(clearStart, -1)
  assert.equal(
    (atomicSource.match(/database\.transaction\(STORE_NAME, 'readwrite'\)/gu) ?? []).length,
    1,
  )
  assert.match(atomicSource, /store\.getAll\(\)/u)
  assert.match(atomicSource, /hasEquivalentLatestForProfile\(before, snapshot\)/u)
  assert.match(atomicSource, /store\.add\(\{ snapshot \}\)/u)
  assert.match(atomicSource, /store\.delete\(record\.id\)/u)
  assert.doesNotMatch(atomicSource, /this\.(?:list|put|delete)\(/u)
})

test('retention is deterministic at 20 per profile and 100 globally', async () => {
  assert.deepEqual(INTEROPERABILITY_STORE_LIMITS, {
    maxPerProfile: 20,
    maxGlobal: 100,
    maxReasonCodes: 100,
    maxSafeHashes: 500,
  })
  const store = new InteroperabilityPreviewStore(createMemoryInteroperabilityRepository())
  for (let index = 0; index < 24; index += 1) {
    const suffix = index.toString(16).padStart(2, '0')
    await store.record(snapshot({
      createdAt: `2026-07-24T14:${index.toString().padStart(2, '0')}:00.000Z`,
      safeHashes: [`${suffix}${'a'.repeat(62)}`],
    }))
  }

  const result = await store.list()
  assert.equal(result.availability, 'available')
  assert.equal(result.snapshots.length, 20)
  assert.equal(result.snapshots[0].createdAt, '2026-07-24T14:23:00.000Z')
  assert.equal(result.snapshots.at(-1).createdAt, '2026-07-24T14:04:00.000Z')
})

test('clear removes only the dedicated preview repository', async () => {
  const repository = createMemoryInteroperabilityRepository()
  const unrelated = { feature010Packets: 3, feature009Checks: 9 }
  const store = new InteroperabilityPreviewStore(repository)
  await store.record(snapshot())

  const result = await store.clear()

  assert.equal(result.availability, 'available')
  assert.deepEqual(await repository.list(), [])
  assert.deepEqual(unrelated, { feature010Packets: 3, feature009Checks: 9 })
})

test('repository failure is honest and leaves the validated current preview usable', async () => {
  const repository = {
    async list() { throw new Error('IndexedDB unavailable') },
    async put() { throw new Error('IndexedDB unavailable') },
    async delete() { throw new Error('IndexedDB unavailable') },
    async clear() { throw new Error('IndexedDB unavailable') },
  }
  const store = new InteroperabilityPreviewStore(repository)
  const current = snapshot()

  const recordResult = await store.record(current)
  const listResult = await store.list()
  const clearResult = await store.clear()

  assert.equal(recordResult.availability, 'unavailable')
  assert.equal(recordResult.current, current)
  assert.equal(listResult.availability, 'unavailable')
  assert.equal(clearResult.availability, 'unavailable')
})

test('invalid persisted records cannot appear as healthy empty history or accept a new write', async () => {
  let putCalls = 0
  const repository = {
    async list() {
      return [{ id: 1, snapshot: { schemaVersion: 999, raw: 'INVALID_SENTINEL' } }]
    },
    async put() {
      putCalls += 1
      return 2
    },
    async delete() {},
    async clear() {},
  }
  const store = new InteroperabilityPreviewStore(repository)

  const listResult = await store.list()
  const recordResult = await store.record(snapshot())

  assert.deepEqual(listResult, { availability: 'unavailable', snapshots: [] })
  assert.equal(recordResult.availability, 'unavailable')
  assert.equal(recordResult.recorded, false)
  assert.equal(putCalls, 0)
})
