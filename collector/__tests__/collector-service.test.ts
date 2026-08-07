import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import type { EvidenceSourceId } from '../../src/types.ts'
import type { EvidenceAdapter } from '../adapters/types.ts'
import { CollectorConfigStore } from '../config-store.ts'
import { EvidenceStore } from '../evidence-store.ts'
import { LocalCollectorService } from '../main.ts'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'

test('one adapter failure does not interrupt another source', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-service-data-'))
  const source = await mkdtemp(join(tmpdir(), 'sancussight-service-source-'))
  try {
    const failing: EvidenceAdapter = {
      id: 'agent-beacon', async validate() {}, async collect() { throw new Error('failed source') },
    }
    const current: EvidenceAdapter = {
      id: 'praxen', async validate() {}, async collect(_path, _checkpoint, importedAt) {
        return { accepted: [], rejected: [], lag: 0, checkpoint: { source: 'praxen', cursor: '{"ok":true}', updatedAt: importedAt } }
      },
    }
    const permission: EvidenceAdapter = {
      id: 'pipelock', async validate() {}, async collect() { throw Object.assign(new Error('denied'), { code: 'EACCES' }) },
    }
    const adapters = new Map<EvidenceSourceId, EvidenceAdapter>([['agent-beacon', failing], ['praxen', current], ['pipelock', permission]])
    const service = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), adapters)
    await service.initialize()
    await service.configure('agent-beacon', { artifactPath: source })
    await service.configure('praxen', { artifactPath: source })
    await service.configure('pipelock', { artifactPath: source })
    await service.refresh('agent-beacon')
    await service.refresh('praxen')
    await service.refresh('pipelock')
    const states = await service.getSources()
    assert.equal(states.find((item) => item.id === 'agent-beacon')?.health, 'failed')
    assert.equal(states.find((item) => item.id === 'praxen')?.health, 'current')
    assert.equal(states.find((item) => item.id === 'pipelock')?.health, 'permission-required')
  } finally {
    await rm(data, { recursive: true, force: true })
    await rm(source, { recursive: true, force: true })
  }
})

test('successful recovery clears the prior source error code', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-service-recovery-'))
  const source = await mkdtemp(join(tmpdir(), 'sancussight-service-recovery-source-'))
  try {
    let shouldFail = true
    const recovering: EvidenceAdapter = {
      id: 'praxen',
      async validate() {},
      async collect(_path, checkpoint, importedAt) {
        if (shouldFail) return {
          accepted: [],
          rejected: [{ id: 'rejection-1', source: 'praxen', artifactName: 'report.json', rejectedAt: importedAt, errorCode: 'unsupported-version', guidance: 'Use a supported report.' }],
          checkpoint: checkpoint ?? { source: 'praxen', cursor: '', updatedAt: importedAt },
          lag: 0,
        }
        const envelope = createEvidenceEnvelope({
          source: 'praxen', evidenceKind: 'behavior-finding', observedAt: importedAt, importedAt,
          subject: { externalId: 'recovered-agent', type: 'agent' }, outcome: 'pass', summary: 'Recovered source observation.',
          provenance: { artifactName: 'report.json', artifactContentHash: contentHash('recovered'), sourceRecordId: 'recovered-1', parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
        })
        return { accepted: [envelope], rejected: [], checkpoint: { source: 'praxen', cursor: '1', updatedAt: importedAt }, lag: 0 }
      },
    }
    const service = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), new Map([['praxen', recovering]]))
    await service.initialize()
    await service.configure('praxen', { artifactPath: source })
    await service.refresh('praxen')
    assert.equal((await service.getSources()).find(item => item.id === 'praxen')?.errorCode, 'unsupported-version')
    shouldFail = false
    await service.refresh('praxen')
    const recovered = (await service.getSources()).find(item => item.id === 'praxen')
    assert.equal(recovered?.health, 'current')
    assert.equal(recovered?.errorCode, undefined)
    service.close()
  } finally {
    await rm(data, { recursive: true, force: true })
    await rm(source, { recursive: true, force: true })
  }
})

test('restart reconstructs retained evidence freshness and stale health', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-service-data-'))
  const source = await mkdtemp(join(tmpdir(), 'sancussight-service-source-'))
  try {
    const config = new CollectorConfigStore(data)
    await config.save({ schemaVersion: 1, pollIntervalMs: 15_000, sources: [{ id: 'praxen', artifactPath: source, enabled: true }] })
    const store = new EvidenceStore(data)
    await store.initialize()
    const importedAt = '2026-07-12T13:00:00.000Z'
    const envelope = createEvidenceEnvelope({
      source: 'praxen', evidenceKind: 'behavior-finding', observedAt: importedAt, importedAt,
      subject: { externalId: 'agent-1', type: 'agent' }, outcome: 'warn', summary: 'Observed finding.',
      provenance: { artifactName: 'report.json', artifactContentHash: contentHash('{}'), parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
    })
    await store.accept([envelope], { source: 'praxen', cursor: '{}', updatedAt: importedAt })
    const service = new LocalCollectorService(config, new EvidenceStore(data), new Map())
    await service.initialize()
    const state = (await service.getSources()).find((item) => item.id === 'praxen')
    assert.equal(state?.health, 'stale')
    assert.equal(state?.lastAcceptedAt, importedAt)
  } finally {
    await rm(data, { recursive: true, force: true })
    await rm(source, { recursive: true, force: true })
  }
})

test('bounded evidence pages present newest observations first', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-service-data-'))
  try {
    const store = new EvidenceStore(data)
    await store.initialize()
    const evidence = Array.from({ length: 105 }, (_, index) => {
      const observedAt = new Date(Date.UTC(2026, 6, 17, 12, index)).toISOString()
      return createEvidenceEnvelope({
        source: 'praxen', evidenceKind: 'behavior-finding', observedAt, importedAt: observedAt,
        subject: { externalId: `agent-${index}`, type: 'agent' }, outcome: 'warn', summary: `Observed finding ${index}.`,
        provenance: { artifactName: 'report.json', artifactContentHash: contentHash(String(index)), sourceRecordId: `finding-${index}`, parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
      })
    })
    await store.accept(evidence, { source: 'praxen', cursor: '{}', updatedAt: evidence.at(-1)!.importedAt })
    const service = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), new Map())
    await service.initialize()
    const first = await service.getEvidence()
    assert.equal(first.items.length, 100)
    assert.equal(first.items[0].observedAt, evidence.at(-1)!.observedAt)
    assert.equal(first.items.at(-1)!.observedAt, evidence[5].observedAt)
    assert.ok(first.nextCursor)
    service.close()
  } finally {
    await rm(data, { recursive: true, force: true })
  }
})
