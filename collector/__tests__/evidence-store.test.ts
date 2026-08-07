import assert from 'node:assert/strict'
import { appendFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { CollectorConfigStore } from '../config-store.ts'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'
import { EvidenceStore } from '../evidence-store.ts'

const NOW = '2026-07-12T12:00:00.000Z'

test('accepted evidence is deterministic, redacted, and idempotent after restart', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-collector-'))
  try {
    const raw = JSON.stringify({ agent_id: 'agent-1', event: 'tool-call', prompt: 'secret prompt' })
    const envelope = createEvidenceEnvelope({
      source: 'agent-beacon',
      evidenceKind: 'runtime-event',
      observedAt: NOW,
      importedAt: NOW,
      subject: { externalId: 'agent-1', type: 'agent' },
      outcome: 'observed',
      summary: 'Agent runtime event observed.',
      provenance: {
        artifactName: 'C:\\private\\runtime.jsonl',
        artifactContentHash: contentHash(raw),
        sourceRecordId: 'record-1',
        parserId: 'agent-beacon-runtime',
        parserVersion: '1.0.0',
        verification: 'not-applicable',
      },
      attributes: { event: 'tool-call', prompt: 'secret prompt' },
      allowedAttributeKeys: ['event'],
    })
    assert.equal(envelope.provenance.artifactName, 'runtime.jsonl')
    assert.deepEqual(envelope.attributes, { event: 'tool-call' })

    const store = new EvidenceStore(root)
    await store.initialize()
    assert.equal(await store.accept([envelope], { source: 'agent-beacon', cursor: '1', updatedAt: NOW }), 1)

    const restarted = new EvidenceStore(root)
    await restarted.initialize()
    assert.equal(await restarted.accept([envelope], { source: 'agent-beacon', cursor: '1', updatedAt: NOW }), 0)
    assert.equal((await restarted.readAccepted()).length, 1)
    assert.equal((await readFile(restarted.acceptedPath, 'utf8')).split('\n').filter(Boolean).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('rejections do not advance checkpoints', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-collector-'))
  try {
    const store = new EvidenceStore(root)
    await store.initialize()
    await store.reject({
      id: 'reject-1', source: 'praxen', artifactName: '/private/report.json', rejectedAt: NOW,
      errorCode: 'unsupported-version', guidance: 'Export a supported Praxen JSON report.',
    })
    await store.reject({
      id: 'reject-1', source: 'praxen', artifactName: '/private/report.json', rejectedAt: NOW,
      errorCode: 'unsupported-version', guidance: 'Export a supported Praxen JSON report.',
    })
    assert.equal(store.getCheckpoint('praxen'), undefined)
    assert.equal((await store.readRejected())[0].artifactName, 'report.json')
    assert.equal((await store.readRejected()).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('cached accepted reads return defensive arrays and notice external appends', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-collector-'))
  try {
    const store = new EvidenceStore(root)
    await store.initialize()
    const envelope = createEvidenceEnvelope({
      source: 'agent-beacon', evidenceKind: 'runtime-event', observedAt: NOW, importedAt: NOW,
      subject: { externalId: 'agent-cache', type: 'agent' }, outcome: 'observed', summary: 'Cached read fixture.',
      provenance: { artifactName: 'runtime.jsonl', artifactContentHash: contentHash('cache-1'), sourceRecordId: 'cache-1', parserId: 'fixture', parserVersion: '1.0.0', verification: 'not-applicable' },
    })
    await store.accept([envelope], { source: 'agent-beacon', cursor: '1', updatedAt: NOW })
    const first = await store.readAccepted()
    first.length = 0
    assert.equal((await store.readAccepted()).length, 1)
    const second = { ...envelope, id: `${'b'.repeat(64)}` }
    await appendFile(store.acceptedPath, `${JSON.stringify(second)}\n`, 'utf8')
    assert.equal((await store.readAccepted()).length, 2)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('configuration rejects collector-owned source paths and deletion leaves source artifacts untouched', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-collector-'))
  const sourceRoot = await mkdtemp(join(tmpdir(), 'sancussight-source-'))
  const sourcePath = join(sourceRoot, 'runtime.jsonl')
  try {
    await writeFile(sourcePath, '{}\n')
    const config = new CollectorConfigStore(root)
    await assert.rejects(() => config.save({
      schemaVersion: 1, pollIntervalMs: 15_000,
      sources: [{ id: 'agent-beacon', artifactPath: join(root, 'source.jsonl'), enabled: true }],
    }))
    await config.save({
      schemaVersion: 1, pollIntervalMs: 15_000,
      sources: [{ id: 'agent-beacon', artifactPath: sourcePath, enabled: true }],
    })
    const store = new EvidenceStore(root)
    await store.initialize()
    await store.removeSource('agent-beacon')
    assert.equal(await readFile(sourcePath, 'utf8'), '{}\n')
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(sourceRoot, { recursive: true, force: true })
  }
})
