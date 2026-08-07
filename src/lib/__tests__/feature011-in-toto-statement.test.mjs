import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildExitDrillEvidencePacket,
  canonicalizeEvidencePacketPayload,
} from '../evidence-packet.ts'
import {
  IN_TOTO_STATEMENT_TYPE_V1,
  SANCUSSIGHT_PREDICATE_TYPE_V1,
  buildUnsignedInTotoStatement,
  downloadUnsignedInTotoStatement,
  validateUnsignedInTotoStatement,
} from '../in-toto-statement.ts'

const sha256 = async input => createHash('sha256').update(input).digest('hex')
const hex = character => character.repeat(64)

async function packetFixture() {
  return buildExitDrillEvidencePacket({
    result: {
      workflowId: 'private-workflow-id',
      workflowName: 'Private workflow name',
      targetPlatform: 'Codex',
      verdict: 'survives',
      items: [{
        assetId: 'private-asset-id',
        assetName: 'Private asset name',
        status: 'ok',
        note: 'Private note.',
      }],
    },
    exportedAt: '2026-07-24T12:00:00.000Z',
    observedAt: '2026-07-24T11:59:00.000Z',
    sourceRefHashes: [hex('a')],
    missingEvidence: [{ kind: 'external-verification' }],
  }, sha256)
}

test('a validated packet builds one exact unsigned Statement v1 and confirmation digest', async () => {
  const packet = await packetFixture()
  const result = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, sha256)

  assert.equal(result.ok, true)
  assert.deepEqual(result.statement, {
    _type: IN_TOTO_STATEMENT_TYPE_V1,
    subject: [{
      name: 'sancussight-evidence-packet',
      digest: {
        sha256: packet.packetId.slice(7),
      },
    }],
    predicateType: SANCUSSIGHT_PREDICATE_TYPE_V1,
    predicate: {
      schemaVersion: 1,
      packetType: 'sancussight-evidence-packet',
      packetDigest: packet.packetId.slice(7),
      subjectKind: packet.subject.kind,
      qualification: packet.qualification,
      verificationCount: packet.verification.length,
      missingEvidenceCount: packet.missingEvidence.length,
      unsigned: true,
      externallyVerified: false,
    },
  })
  assert.equal(validateUnsignedInTotoStatement(result.statement), true)
  assert.equal(result.canonicalJson, canonicalizeEvidencePacketPayload(result.statement))
  assert.equal(
    result.confirmationDigest,
    `sha256:${await sha256(result.canonicalJson)}`,
  )
  assert.equal(JSON.stringify(result).includes('private-workflow-id'), false)
  assert.equal(JSON.stringify(result).includes('Private workflow name'), false)
})

test('tampered packets, unsafe values, profiles, predicate types, and digests fail closed', async () => {
  const packet = await packetFixture()
  const tampered = structuredClone(packet)
  tampered.qualification = 'verified-by-someone'
  const unsafe = structuredClone(packet)
  unsafe.subject.kind = 'owner@example.com'

  for (const candidate of [tampered, unsafe]) {
    const result = await buildUnsignedInTotoStatement({
      packet: candidate,
      exportedAt: '2026-07-24T12:05:00.000Z',
    }, sha256)
    assert.equal(result.ok, false)
    assert.equal('statement' in result, false)
  }

  const unknownProfile = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T12:05:00.000Z',
    profileId: 'unknown-profile',
  }, sha256)
  assert.deepEqual(unknownProfile, { ok: false, errorCode: 'unsupported-profile' })

  const unknownPredicate = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T12:05:00.000Z',
    predicateType: 'https://example.test/private-predicate',
  }, sha256)
  assert.deepEqual(unknownPredicate, { ok: false, errorCode: 'unsupported-predicate-type' })

  const invalidDigest = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, async () => 'not-a-digest')
  assert.deepEqual(invalidDigest, { ok: false, errorCode: 'invalid-digest' })
})

test('Statement validation rejects extensions, digest mismatch, and false truth labels', async () => {
  const built = await buildUnsignedInTotoStatement({
    packet: await packetFixture(),
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, sha256)
  assert.equal(built.ok, true)

  const extended = structuredClone(built.statement)
  extended.signature = 'not-allowed'
  assert.equal(validateUnsignedInTotoStatement(extended), false)

  const mismatch = structuredClone(built.statement)
  mismatch.subject[0].digest.sha256 = hex('f')
  assert.equal(validateUnsignedInTotoStatement(mismatch), false)

  const signed = structuredClone(built.statement)
  signed.predicate.unsigned = false
  signed.predicate.externallyVerified = true
  assert.equal(validateUnsignedInTotoStatement(signed), false)
})

test('canonical Statement output is deterministic and copy-independent', async () => {
  const packet = await packetFixture()
  const first = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, sha256)
  const second = await buildUnsignedInTotoStatement({
    packet,
    exportedAt: '2026-07-24T13:05:00.000Z',
  }, sha256)

  assert.equal(first.ok, true)
  assert.equal(second.ok, true)
  assert.deepEqual(first.statement, second.statement)
  assert.equal(first.canonicalJson, second.canonicalJson)
  assert.equal(first.confirmationDigest, second.confirmationDigest)

  packet.subject.kind = 'context'
  assert.equal(first.statement.predicate.subjectKind, 'workflow')
  first.statement.predicate.subjectKind = 'context'
  const fresh = await buildUnsignedInTotoStatement({
    packet: await packetFixture(),
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, sha256)
  assert.equal(fresh.statement.predicate.subjectKind, 'workflow')
})

test('local download independently validates, writes canonical bytes, and fails without a claim', async () => {
  const built = await buildUnsignedInTotoStatement({
    packet: await packetFixture(),
    exportedAt: '2026-07-24T12:05:00.000Z',
  }, sha256)
  assert.equal(built.ok, true)

  const calls = []
  let downloadedBlob
  const anchor = {
    href: '',
    download: '',
    click: () => calls.push('click'),
    remove: () => calls.push('remove'),
  }
  const result = await downloadUnsignedInTotoStatement(built, sha256, {
    BlobCtor: Blob,
    createObjectURL: blob => {
      downloadedBlob = blob
      calls.push(`create:${blob.type}`)
      return 'blob:sancussight-statement'
    },
    revokeObjectURL: url => calls.push(`revoke:${url}`),
    createAnchor: () => anchor,
  })

  assert.equal(result.ok, true)
  assert.match(result.filename, /^sancussight-unsigned-statement-[0-9a-f]{12}\.json$/)
  assert.equal(await downloadedBlob.text(), built.canonicalJson)
  assert.equal(result.confirmationDigest, built.confirmationDigest)
  assert.deepEqual(calls, [
    'create:application/json;charset=utf-8',
    'click',
    'remove',
    'revoke:blob:sancussight-statement',
  ])

  const invalid = structuredClone(built)
  invalid.statement.predicate.packetDigest = hex('f')
  const noClick = await downloadUnsignedInTotoStatement(invalid, sha256, {
    BlobCtor: Blob,
    createObjectURL: () => {
      throw new Error('must not create URL')
    },
    revokeObjectURL: () => {},
    createAnchor: () => anchor,
  })
  assert.deepEqual(noClick, { ok: false, errorCode: 'invalid-statement' })

  const unavailable = await downloadUnsignedInTotoStatement(
    built,
    async () => {
      throw new Error('Web Crypto SHA-256 is unavailable.')
    },
  )
  assert.deepEqual(unavailable, { ok: false, errorCode: 'crypto-unavailable' })

  const failedCalls = []
  const failed = await downloadUnsignedInTotoStatement(built, sha256, {
    BlobCtor: Blob,
    createObjectURL: () => 'blob:failed',
    revokeObjectURL: url => failedCalls.push(`revoke:${url}`),
    createAnchor: () => ({
      href: '',
      download: '',
      click: () => {
        throw new Error('download blocked')
      },
      remove: () => failedCalls.push('remove'),
    }),
  })
  assert.deepEqual(failed, { ok: false, errorCode: 'download-failed' })
  assert.deepEqual(failedCalls, ['remove', 'revoke:blob:failed'])
})

test('the public custom predicate schema pins the exact unsigned allowlisted shape', async () => {
  const schema = JSON.parse(await readFile(new URL(
    '../../../public/spec/evidence-packet-interoperability-v1.schema.json',
    import.meta.url,
  ), 'utf8'))

  assert.equal(schema.$id, SANCUSSIGHT_PREDICATE_TYPE_V1)
  assert.equal(schema.type, 'object')
  assert.equal(schema.additionalProperties, false)
  assert.deepEqual(schema.required, [
    'schemaVersion',
    'packetType',
    'packetDigest',
    'subjectKind',
    'qualification',
    'verificationCount',
    'missingEvidenceCount',
    'unsigned',
    'externallyVerified',
  ])
  assert.deepEqual(Object.keys(schema.properties), schema.required)
  assert.equal(schema.properties.packetDigest.pattern, '^[0-9a-f]{64}$')
  assert.equal(schema.properties.unsigned.const, true)
  assert.equal(schema.properties.externallyVerified.const, false)
  for (const forbidden of [
    'signature',
    'dsse',
    'certificate',
    'key',
    'identity',
    'transparencyLog',
    'externalVerifier',
  ]) {
    assert.equal(Object.hasOwn(schema.properties, forbidden), false)
  }
})
