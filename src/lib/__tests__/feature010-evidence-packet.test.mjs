import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import {
  buildAssetVersionEvidencePacket,
  buildExitDrillEvidencePacket,
  canonicalizeEvidencePacketPayload,
  computeEvidencePacketId,
  downloadEvidencePacket,
  validateEvidencePacket,
} from '../evidence-packet.ts'
import { computeAssetVersionId } from '../asset-versions.ts'

const sha256 = async input => createHash('sha256').update(input).digest('hex')
const hex = character => character.repeat(64)

function versionFixture(overrides = {}) {
  const withoutId = {
    schemaVersion: 1,
    recordedAt: '2026-07-24T09:00:00.000Z',
    sourceRefHashes: [hex('a')],
    verificationRefs: [{
      checkId: 'portability.format.v1',
      resultId: 'result-001',
      status: 'pass',
      evaluatedAt: '2026-07-24T08:55:00.000Z',
      safeEvidenceHash: hex('b'),
    }],
    snapshot: {
      format: 'markdown',
      sharedByDesign: true,
      registryState: 'active',
      supportedVersion: '1.0',
      coverage: [{ platform: 'Codex', lastVerified: '2026-07-24' }],
      providerDependencies: [{
        provider: 'Codex',
        capability: 'local-files',
        fallback: 'Claude Code',
      }],
      dependencyIds: ['dependency-001'],
    },
    ...overrides,
  }
  delete withoutId.id
  const projection = withoutId.qualification === 'portable-projection'
    ? {
        derivedFromVersionId: withoutId.derivedFromVersionId,
        qualification: withoutId.qualification,
        recordedAt: withoutId.recordedAt,
        snapshot: withoutId.snapshot,
        sourceRefHashes: withoutId.sourceRefHashes,
        verificationRefs: withoutId.verificationRefs,
      }
    : {
        recordedAt: withoutId.recordedAt,
        snapshot: withoutId.snapshot,
        sourceRefHashes: withoutId.sourceRefHashes,
        verificationRefs: withoutId.verificationRefs,
      }
  const digest = createHash('sha256')
    .update(canonicalizeEvidencePacketPayload(projection))
    .digest('hex')
  return {
    ...withoutId,
    id: `${withoutId.qualification === 'portable-projection' ? 'av1p' : 'av1'}_${digest.slice(0, 32)}`,
  }
}

function previousVersionFixture() {
  return versionFixture({
    recordedAt: '2026-07-24T08:00:00.000Z',
    snapshot: {
      ...versionFixture().snapshot,
      format: 'proprietary',
    },
  })
}

async function assetPacket(overrides = {}) {
  return buildAssetVersionEvidencePacket({
    assetId: 'private-asset-id',
    assetKind: 'skill',
    version: versionFixture(),
    previousVersion: previousVersionFixture(),
    exportedAt: '2026-07-24T10:00:00.000Z',
    humanDecisions: [{
      kind: 'risk-acceptance',
      status: 'accepted',
      recordedAt: '2026-07-24T09:30:00.000Z',
      decisionRefHash: hex('c'),
    }],
    missingEvidence: [{
      kind: 'external-verification',
      referenceHash: hex('d'),
    }],
    ...overrides,
  }, sha256)
}

test('asset-version packets are deterministic across export time and contain only hashed subject identity', async () => {
  const first = await assetPacket()
  const second = await assetPacket({ exportedAt: '2026-07-24T11:00:00.000Z' })

  assert.equal(first.packetId, second.packetId)
  assert.notEqual(first.exportedAt, second.exportedAt)
  assert.match(first.subject.subjectHash, /^sha256:[0-9a-f]{64}$/)
  assert.equal(JSON.stringify(first).includes('private-asset-id'), false)
  assert.equal(first.predicate.kind, 'asset-version')
  assert.equal(first.qualification, 'recorded')
  assert.deepEqual(first.producer, { name: 'SancusSight', contractVersion: 1 })
  assert.equal(await validateEvidencePacket(first, sha256), true)

  const changed = await assetPacket({
    version: versionFixture({
      snapshot: {
        ...versionFixture().snapshot,
        sharedByDesign: false,
      },
    }),
    previousVersion: undefined,
  })
  assert.notEqual(first.packetId, changed.packetId)
})

test('Exit Drill packets export statuses and hashed subjects without workflow names, asset names, or notes', async () => {
  const result = {
    workflowId: 'workflow-private-001',
    workflowName: 'Workflow owner@example.com',
    targetPlatform: 'Claude Code',
    verdict: 'breaks',
    items: [
      {
        assetId: 'asset-private-002',
        assetName: 'Private prompt library',
        status: 'locked',
        note: 'Raw prompt: never export this response or C:\\Users\\owner\\secret.txt',
      },
      {
        assetId: 'asset-private-001',
        assetName: 'Credentials',
        status: 'missing',
        note: 'api_key=do-not-export',
      },
    ],
  }
  const packet = await buildExitDrillEvidencePacket({
    result,
    exportedAt: '2026-07-24T10:00:00.000Z',
    observedAt: '2026-07-24T09:58:00.000Z',
  }, sha256)
  const serialized = JSON.stringify(packet)

  assert.equal(packet.predicate.kind, 'exit-drill')
  assert.deepEqual(packet.predicate.items.map(item => item.status).sort(), ['locked', 'missing'])
  assert.ok(packet.predicate.items.every(item => /^sha256:[0-9a-f]{64}$/.test(item.subjectHash)))
  for (const prohibited of [
    result.workflowId,
    result.workflowName,
    ...result.items.flatMap(item => [item.assetId, item.assetName, item.note]),
  ]) {
    assert.equal(serialized.includes(prohibited), false)
  }
  assert.equal(await validateEvidencePacket(packet, sha256), true)
})

test('tampering, unsupported versions, unsafe nested keys, and oversized collections fail closed', async () => {
  const original = await assetPacket()

  const tampered = structuredClone(original)
  tampered.qualification = 'deterministic'
  tampered.packetId = await computeEvidencePacketId(tampered, sha256)
  assert.equal(await validateEvidencePacket(tampered, sha256), false)

  const unsupported = structuredClone(original)
  unsupported.schemaVersion = 2
  unsupported.packetId = await computeEvidencePacketId(unsupported, sha256)
  assert.equal(await validateEvidencePacket(unsupported, sha256), false)

  const nestedPrompt = structuredClone(original)
  nestedPrompt.predicate.prompt = 'raw prompt: do not export'
  nestedPrompt.packetId = await computeEvidencePacketId(nestedPrompt, sha256)
  assert.equal(await validateEvidencePacket(nestedPrompt, sha256), false)

  const registryObject = structuredClone(original)
  registryObject.registry = { assets: [{ owner: 'owner@example.com' }] }
  registryObject.packetId = await computeEvidencePacketId(registryObject, sha256)
  assert.equal(await validateEvidencePacket(registryObject, sha256), false)

  const oversized = structuredClone(original)
  oversized.verification = Array.from({ length: 33 }, (_, index) => ({
    checkId: `check-${String(index).padStart(2, '0')}`,
    resultId: `result-${String(index).padStart(2, '0')}`,
    status: 'pass',
    evaluatedAt: '2026-07-24T09:00:00.000Z',
  }))
  oversized.packetId = await computeEvidencePacketId(oversized, sha256)
  assert.equal(await validateEvidencePacket(oversized, sha256), false)

  const oversizedComparison = structuredClone(original)
  oversizedComparison.comparison.items = Array.from({ length: 101 }, (_, index) => ({
    key: `fact:item-${String(index).padStart(3, '0')}`,
    label: `Item ${index}`,
    state: 'unchanged',
    previous: 'recorded',
    current: 'recorded',
    basis: 'recorded-fact',
  }))
  oversizedComparison.packetId = await computeEvidencePacketId(oversizedComparison, sha256)
  assert.equal(await validateEvidencePacket(oversizedComparison, sha256), false)

  const oversizedDecisions = structuredClone(original)
  oversizedDecisions.humanDecisions = Array.from({ length: 33 }, (_, index) => ({
    kind: `decision-${String(index).padStart(2, '0')}`,
    status: 'accepted',
    recordedAt: '2026-07-24T09:30:00.000Z',
    decisionRefHash: `sha256:${hex((index % 10).toString())}`,
  }))
  oversizedDecisions.packetId = await computeEvidencePacketId(oversizedDecisions, sha256)
  assert.equal(await validateEvidencePacket(oversizedDecisions, sha256), false)
})

test('asset packet comparison is derived from verified versions and caller claims cannot override it', async () => {
  const packet = await assetPacket({
    comparison: {
      state: 'ready',
      currentVersionId: versionFixture().id,
      previousVersionId: previousVersionFixture().id,
      items: [{
        key: 'fact:format',
        label: 'Format',
        state: 'regression',
        previous: 'proprietary',
        current: 'markdown',
        basis: 'recorded-fact',
      }],
    },
  })
  assert.equal(packet.comparison.state, 'ready')
  assert.equal(
    packet.comparison.items.find(item => item.key === 'fact:format').state,
    'recovery',
  )
})

test('asset packet rejects forged identities and truthfully qualifies portable derivatives', async () => {
  const forged = versionFixture()
  forged.id = `av1_${'f'.repeat(32)}`
  await assert.rejects(
    assetPacket({ version: forged }),
    /identity verification failed/,
  )

  const source = versionFixture()
  const derivativeWithoutId = {
    schemaVersion: 1,
    recordedAt: source.recordedAt,
    sourceRefHashes: [...source.sourceRefHashes],
    verificationRefs: source.verificationRefs.map(reference => ({ ...reference })),
    snapshot: {
      ...source.snapshot,
      providerDependencies: [],
    },
    qualification: 'portable-projection',
    derivedFromVersionId: source.id,
  }
  const derivative = {
    ...derivativeWithoutId,
    id: await computeAssetVersionId(derivativeWithoutId, sha256),
  }
  const packet = await assetPacket({
    version: derivative,
    previousVersion: undefined,
  })
  assert.equal(packet.qualification, 'portable-projection')
  assert.equal(packet.predicate.versionId, derivative.id)
  assert.equal(packet.predicate.derivedFromVersionId, source.id)
  assert.equal(await validateEvidencePacket(packet, sha256), true)
})

test('packet boundaries reject impossible or non-canonical dates and timestamps', async () => {
  for (const exportedAt of [
    '2026-02-30T10:00:00.000Z',
    '2026-07-24T10:00:00+00:00',
    '2026-07-24T10:00:00.00Z',
  ]) {
    await assert.rejects(assetPacket({ exportedAt }), /unsafe or invalid/)
  }
  await assert.rejects(
    assetPacket({
      version: versionFixture({
        snapshot: {
          ...versionFixture().snapshot,
          coverage: [{ platform: 'Codex', lastVerified: '2026-02-30' }],
        },
      }),
    }),
    /packet input is invalid/,
  )
})

test('paths, URLs, email identity, secrets, raw content, and overlong values are rejected even with a recomputed digest', async () => {
  const unsafeValues = [
    'C:\\Users\\owner\\secret.txt',
    '/home/owner/private.json',
    'https://example.com/private',
    'owner@example.com',
    'api_key=topsecretvalue',
    'client_secret=topsecretvalue',
    'Bearer abcdefghijklmnop',
    '-----BEGIN PRIVATE KEY-----',
    'raw prompt: system instructions',
    'raw response from provider',
    'raw finding copied from the registry',
    'raw evidence copied from the registry',
    'x'.repeat(161),
  ]

  for (const unsafe of unsafeValues) {
    const packet = await buildExitDrillEvidencePacket({
      result: {
        workflowId: 'workflow-001',
        workflowName: 'Safe workflow',
        targetPlatform: 'Codex',
        verdict: 'survives',
        items: [],
      },
      exportedAt: '2026-07-24T10:00:00.000Z',
      observedAt: '2026-07-24T09:58:00.000Z',
    }, sha256)
    packet.predicate.targetPlatform = unsafe
    packet.packetId = await computeEvidencePacketId(packet, sha256)
    assert.equal(await validateEvidencePacket(packet, sha256), false, unsafe)
  }
})

test('builders reject raw registry shapes, unsafe packet fields, invalid references, and excessive Exit Drill items', async () => {
  await assert.rejects(
    buildExitDrillEvidencePacket({
      result: {
        workflowId: 'workflow-001',
        workflowName: 'Workflow',
        targetPlatform: 'Codex',
        verdict: 'survives',
        items: [],
        registry: { assets: [] },
      },
      exportedAt: '2026-07-24T10:00:00.000Z',
      observedAt: '2026-07-24T09:58:00.000Z',
    }, sha256),
    /Exit Drill packet input is invalid/,
  )

  await assert.rejects(
    assetPacket({
      humanDecisions: [{
        kind: 'approval',
        status: 'accepted',
        recordedAt: '2026-07-24T09:30:00.000Z',
        decisionRefHash: 'not-a-hash',
      }],
    }),
    /lowercase SHA-256/,
  )

  await assert.rejects(
    buildExitDrillEvidencePacket({
      result: {
        workflowId: 'workflow-001',
        workflowName: 'Workflow',
        targetPlatform: 'Codex',
        verdict: 'survives',
        items: Array.from({ length: 101 }, (_, index) => ({
          assetId: `asset-${index}`,
          assetName: `Asset ${index}`,
          status: 'ok',
          note: 'Safe metadata note',
        })),
      },
      exportedAt: '2026-07-24T10:00:00.000Z',
      observedAt: '2026-07-24T09:58:00.000Z',
    }, sha256),
    /items exceed the packet limit/,
  )

  await assert.rejects(
    assetPacket({
      version: versionFixture({
        snapshot: {
          ...versionFixture().snapshot,
          location: 'C:\\Users\\owner\\registry.json',
        },
      }),
    }),
    /Asset version packet input is invalid/,
  )
})

test('canonical JSON is recursive, key-sorted, array-preserving, and rejects unsupported values', () => {
  assert.equal(
    canonicalizeEvidencePacketPayload({ z: [3, { b: true, a: null }], a: 'first' }),
    '{"a":"first","z":[3,{"a":null,"b":true}]}',
  )
  assert.throws(() => canonicalizeEvidencePacketPayload({ bad: undefined }), /supports only/)
  assert.throws(() => canonicalizeEvidencePacketPayload({ bad: Number.NaN }), /non-finite/)
  assert.throws(() => canonicalizeEvidencePacketPayload(new Date()), /plain objects/)
})

test('local Blob download validates first, clicks once, uses a bounded filename, and revokes its URL', async () => {
  const packet = await assetPacket()
  const calls = []
  const anchor = {
    href: '',
    download: '',
    click: () => calls.push('click'),
    remove: () => calls.push('remove'),
  }
  const result = await downloadEvidencePacket(packet, sha256, {
    BlobCtor: Blob,
    createObjectURL: blob => {
      calls.push(`create:${blob.type}`)
      return 'blob:sancussight-local'
    },
    revokeObjectURL: url => calls.push(`revoke:${url}`),
    createAnchor: () => anchor,
  })

  assert.equal(result.ok, true)
  assert.match(result.filename, /^sancussight-evidence-packet-asset-version-[0-9a-f]{12}\.json$/)
  assert.deepEqual(calls, [
    'create:application/json;charset=utf-8',
    'click',
    'remove',
    'revoke:blob:sancussight-local',
  ])
  assert.equal(anchor.href, 'blob:sancussight-local')
  assert.equal(anchor.download, result.filename)

  const invalid = structuredClone(packet)
  invalid.packetId = `sha256:${hex('f')}`
  const invalidResult = await downloadEvidencePacket(invalid, sha256, {
    BlobCtor: Blob,
    createObjectURL: () => {
      throw new Error('must not create URL')
    },
    revokeObjectURL: () => {},
    createAnchor: () => anchor,
  })
  assert.deepEqual(invalidResult, {
    ok: false,
    error: 'Evidence Packet digest does not match its payload.',
  })

  const unavailable = await downloadEvidencePacket(packet, async () => {
    throw new Error('Web Crypto SHA-256 is unavailable.')
  })
  assert.deepEqual(unavailable, {
    ok: false,
    error: 'Web Crypto SHA-256 is unavailable.',
  })
})
