import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import {
  OPENLINEAGE_IMPORT_LIMITS,
  parseOpenLineageImport,
} from '../openlineage-import.ts'
import {
  INTEROPERABILITY_PROFILES,
  getInteroperabilityProfile,
} from '../standards-profiles.ts'

const sha256 = async input => createHash('sha256').update(input).digest('hex')
const importedAt = '2026-07-24T13:00:00.000Z'
const schemaURL = 'https://openlineage.io/spec/1-0-5/OpenLineage.json#/definitions/RunEvent'

function eventFixture(overrides = {}) {
  return {
    eventTime: '2026-07-24T12:34:56.789+00:00',
    eventType: 'COMPLETE',
    run: {
      runId: '0176a8c2-fe01-7439-87e6-56a1a1b4029f',
    },
    job: {
      namespace: 'private-job-namespace',
      name: 'private-job-name',
    },
    inputs: [{
      namespace: 'private-input-namespace',
      name: 'private-input-name',
    }],
    outputs: [{
      namespace: 'private-output-namespace',
      name: 'private-output-name',
    }],
    producer: 'https://producer.example/private-client',
    schemaURL,
    ...overrides,
  }
}

function asInput(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return {
    text,
    byteLength: new TextEncoder().encode(text).byteLength,
    importedAt,
  }
}

test('the profile registry is exact, immutable, source-qualified, and policy-free', () => {
  assert.deepEqual(
    INTEROPERABILITY_PROFILES.map(profile => profile.id),
    [
      'openlineage-run-event-core-1.0.5',
      'otel-genai-metadata-preview-1',
      'openinference-metadata-preview-1',
      'sancussight-in-toto-statement-1',
    ],
  )
  assert.ok(INTEROPERABILITY_PROFILES.every(Object.isFrozen))
  assert.ok(Object.isFrozen(INTEROPERABILITY_PROFILES))

  const openLineage = getInteroperabilityProfile('openlineage-run-event-core-1.0.5')
  assert.deepEqual(openLineage, {
    schemaVersion: 1,
    id: 'openlineage-run-event-core-1.0.5',
    projectionVersion: 1,
    upstreamName: 'OpenLineage',
    upstreamVersion: '1.0.5',
    upstreamProfile: 'RunEvent core',
    stability: 'stable',
    sourceUrl: 'https://openlineage.io/spec/1-0-5/OpenLineage.json',
    acceptedInputKind: 'local-json-or-jsonl',
    limitation: 'Metadata-only RunEvent core preview; facets are omitted and the result is not verified SancusSight evidence.',
  })
  assert.equal(getInteroperabilityProfile('unknown-profile'), undefined)
  assert.equal(INTEROPERABILITY_PROFILES.some(profile => /policy/i.test(profile.id)), false)
})

test('supported records return canonical metadata and domain-separated hashes without raw identifiers', async () => {
  const result = await parseOpenLineageImport(asInput(eventFixture()), sha256)

  assert.equal(result.ok, true)
  assert.equal(result.preview.acceptedCount, 1)
  assert.equal(result.preview.rejectedCount, 0)
  assert.equal(result.preview.omittedCount, 0)
  assert.deepEqual(result.preview.eventTypeCounts, [{ code: 'COMPLETE', count: 1 }])
  assert.equal(result.preview.records[0].eventTime, '2026-07-24T12:34:56.789Z')
  assert.deepEqual(
    {
      inputCount: result.preview.records[0].inputCount,
      outputCount: result.preview.records[0].outputCount,
    },
    { inputCount: 1, outputCount: 1 },
  )
  assert.ok(result.preview.safeHashes.every(item => /^sha256:[0-9a-f]{64}$/.test(item.hash)))
  assert.equal(new Set(result.preview.safeHashes.map(item => item.hash)).size, 7)

  const serialized = JSON.stringify(result)
  for (const raw of [
    'private-job-namespace',
    'private-job-name',
    'private-input-namespace',
    'private-input-name',
    'private-output-namespace',
    'private-output-name',
    '0176a8c2-fe01-7439-87e6-56a1a1b4029f',
    'https://producer.example/private-client',
    schemaURL,
  ]) {
    assert.equal(serialized.includes(raw), false, raw)
  }

  const sameValue = eventFixture({
    job: {
      namespace: 'private-job-namespace',
      name: 'private-job-namespace',
    },
  })
  const separated = await parseOpenLineageImport(asInput(sameValue), sha256)
  const jobHashes = separated.preview.safeHashes.filter(item => item.kind.startsWith('job-'))
  assert.equal(jobHashes.length, 2)
  assert.notEqual(jobHashes[0].hash, jobHashes[1].hash)
})

test('facets are omitted wholesale and their hostile values never enter the projection', async () => {
  const secret = 'facet-secret-owner@example.com-C:\\Users\\owner\\secret.txt'
  const hashPreimages = []
  const event = eventFixture({
    run: {
      ...eventFixture().run,
      facets: {
        hostile: {
          deeply: { nested: [{ prompt: secret }] },
        },
      },
    },
    job: {
      ...eventFixture().job,
      facets: { sourceCode: { location: secret } },
    },
    inputs: [{
      ...eventFixture().inputs[0],
      facets: { schema: { fields: [{ name: secret }] } },
      inputFacets: { dataQualityMetrics: { rowCount: secret } },
    }],
    outputs: [{
      ...eventFixture().outputs[0],
      facets: { dataQuality: { assertion: secret } },
      outputFacets: { outputStatistics: { rowCount: secret } },
    }],
  })

  const result = await parseOpenLineageImport(asInput(event), async input => {
    hashPreimages.push(input)
    return sha256(input)
  })

  assert.equal(result.ok, true)
  assert.equal(result.preview.acceptedCount, 1)
  assert.equal(result.preview.omittedCount, 6)
  assert.deepEqual(result.preview.omissionCodeCounts, [
    { code: 'input-dataset-facets-omitted', count: 2 },
    { code: 'job-facets-omitted', count: 1 },
    { code: 'output-dataset-facets-omitted', count: 2 },
    { code: 'run-facets-omitted', count: 1 },
  ])
  assert.equal(JSON.stringify(result).includes(secret), false)
  assert.equal(hashPreimages.some(preimage => preimage.includes(secret)), false)
})

test('JSONL isolates malformed and unsupported records while preserving safe projections', async () => {
  const unknownSchema = eventFixture({ schemaURL: 'https://example.test/unknown-schema' })
  const unknownType = eventFixture({ eventType: 'PAUSED' })
  const unknownKey = { ...eventFixture(), surprise: 'do-not-trust' }
  const text = [
    JSON.stringify(eventFixture({ eventType: 'START' })),
    '{"not valid"',
    JSON.stringify(unknownSchema),
    JSON.stringify(unknownType),
    JSON.stringify(unknownKey),
    JSON.stringify(eventFixture({ eventTime: '2026-07-24T12:35:00Z' })),
  ].join('\n')

  const result = await parseOpenLineageImport(asInput(text), sha256)

  assert.equal(result.ok, true)
  assert.equal(result.preview.acceptedCount, 2)
  assert.equal(result.preview.rejectedCount, 4)
  assert.deepEqual(result.preview.rejectionCodeCounts, [
    { code: 'malformed-json', count: 1 },
    { code: 'unknown-top-level-key', count: 1 },
    { code: 'unsupported-event-type', count: 1 },
    { code: 'unsupported-schema-url', count: 1 },
  ])
  assert.deepEqual(
    result.preview.records.map(record => record.eventTime),
    ['2026-07-24T12:34:56.789Z', '2026-07-24T12:35:00.000Z'],
  )
  assert.equal(JSON.stringify(result).includes('do-not-trust'), false)
})

test('JSON arrays are deterministic and records reject invalid nested core shapes', async () => {
  const invalidRun = eventFixture({ run: { runId: 'not-a-uuid' } })
  const invalidJob = eventFixture({ job: { namespace: 'n', name: 'j', unknown: true } })
  const invalidDataset = eventFixture({ inputs: [{ namespace: 'n', name: 'd', extra: true }] })
  const invalidTimestamp = eventFixture({ eventTime: '2026-02-30T00:00:00Z' })

  const result = await parseOpenLineageImport(
    asInput([invalidDataset, eventFixture({ eventType: 'START' }), invalidRun, invalidJob, invalidTimestamp]),
    sha256,
  )

  assert.equal(result.ok, true)
  assert.equal(result.preview.acceptedCount, 1)
  assert.deepEqual(result.preview.rejectionCodeCounts, [
    { code: 'invalid-event-time', count: 1 },
    { code: 'invalid-run', count: 1 },
    { code: 'unknown-dataset-key', count: 1 },
    { code: 'unknown-job-key', count: 1 },
  ])
})

test('byte and record limits fail before partial projection and byte mismatch is explicit', async () => {
  const tooLarge = await parseOpenLineageImport({
    text: '{}',
    byteLength: OPENLINEAGE_IMPORT_LIMITS.maxBytes + 1,
    importedAt,
  }, sha256)
  assert.deepEqual(tooLarge, {
    ok: false,
    profileId: 'openlineage-run-event-core-1.0.5',
    errorCode: 'file-too-large',
  })

  const mismatch = await parseOpenLineageImport({
    text: '{}',
    byteLength: 1,
    importedAt,
  }, sha256)
  assert.equal(mismatch.ok, false)
  assert.equal(mismatch.errorCode, 'byte-length-mismatch')

  const records = Array.from(
    { length: OPENLINEAGE_IMPORT_LIMITS.maxRecords + 1 },
    () => eventFixture(),
  )
  const tooMany = await parseOpenLineageImport(asInput(records), sha256)
  assert.equal(tooMany.ok, false)
  assert.equal(tooMany.errorCode, 'too-many-records')
  assert.equal('preview' in tooMany, false)

  let hashCalls = 0
  const jsonl = Array.from(
    { length: OPENLINEAGE_IMPORT_LIMITS.maxRecords + 1 },
    () => JSON.stringify(eventFixture()),
  ).join('\n')
  const tooManyJsonl = await parseOpenLineageImport(
    asInput(jsonl),
    async input => {
      hashCalls += 1
      return sha256(input)
    },
  )
  assert.equal(tooManyJsonl.ok, false)
  assert.equal(tooManyJsonl.errorCode, 'too-many-records')
  assert.equal(hashCalls, 0)
})

test('invalid import timestamps and broken hash functions fail closed without echoing input', async () => {
  const invalidTime = await parseOpenLineageImport({
    ...asInput(eventFixture()),
    importedAt: 'not-a-time',
  }, sha256)
  assert.deepEqual(invalidTime, {
    ok: false,
    profileId: 'openlineage-run-event-core-1.0.5',
    errorCode: 'invalid-import-time',
  })

  const failedHash = await parseOpenLineageImport(
    asInput(eventFixture()),
    async () => 'not-a-sha256',
  )
  assert.equal(failedHash.ok, true)
  assert.equal(failedHash.preview.acceptedCount, 0)
  assert.deepEqual(failedHash.preview.rejectionCodeCounts, [
    { code: 'hash-failed', count: 1 },
  ])
  assert.equal(JSON.stringify(failedHash).includes('private-job-name'), false)

  const credentialedProducer = await parseOpenLineageImport(
    asInput(eventFixture({ producer: 'https://user:password@producer.example/client' })),
    sha256,
  )
  assert.equal(credentialedProducer.ok, true)
  assert.deepEqual(credentialedProducer.preview.rejectionCodeCounts, [
    { code: 'invalid-producer', count: 1 },
  ])
})
