import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'
import { EvidenceStore } from '../evidence-store.ts'
import { GovernanceConfigStore } from '../governance-config-store.ts'
import { GovernanceService } from '../governance-service.ts'
import { GovernanceStore } from '../governance-store.ts'

const NOW = '2026-07-18T12:00:00.000Z'

test('production governance service projects accepted evidence into the export', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-governance-production-'))
  try {
    const evidence = new EvidenceStore(data)
    await evidence.initialize()
    const envelope = createEvidenceEnvelope({
      source: 'praxen', evidenceKind: 'behavior-finding', observedAt: NOW, importedAt: NOW,
      subject: { externalId: 'agent-001', type: 'agent' }, outcome: 'warn', summary: 'Bounded finding retained.',
      provenance: { artifactName: 'assessment.json', artifactContentHash: contentHash('assessment'), parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
    })
    await evidence.accept([envelope], { source: 'praxen', cursor: '1', updatedAt: NOW })
    const store = new GovernanceStore(data)
    await store.initialize()
    const service = new GovernanceService(store, undefined, evidence)
    await service.initialize()
    const model = await service.readModel(NOW)
    assert.equal(model.eventCount, 1)
    assert.equal((await service.exportBundle(NOW)).events?.length, 1)
  } finally { await rm(data, { recursive: true, force: true }) }
})

test('evidence projection bounds producer context identifiers before governance validation', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-governance-context-'))
  try {
    const evidence = new EvidenceStore(data)
    await evidence.initialize()
    const envelope = createEvidenceEnvelope({
      source: 'pipelock', evidenceKind: 'audit-packet', observedAt: NOW, importedAt: NOW,
      subject: { externalId: 'workflow/with-slash', type: 'workflow' }, outcome: 'pass', summary: 'Bounded packet.',
      provenance: { artifactName: 'packet.json', artifactContentHash: contentHash('packet'), sourceRecordId: 'record with spaces', parserId: 'pipelock', parserVersion: '1.0.0', verification: 'verified' },
      operational: { qualification: 'operational', sourceVersion: '1.0.0', runId: 'run-1', targetId: 'workflow/with-slash', contractVersion: 'pipelock-v1', configurationHash: 'a'.repeat(64) },
    })
    await evidence.accept([envelope], { source: 'pipelock', cursor: '1', updatedAt: NOW })
    const store = new GovernanceStore(data); await store.initialize()
    const service = new GovernanceService(store, undefined, evidence); await service.initialize()
    assert.equal((await service.readModel(NOW)).eventCount, 1)
  } finally { await rm(data, { recursive: true, force: true }) }
})

test('configured native runtime inventory is collected by the production governance service', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-governance-native-'))
  const source = await mkdtemp(join(tmpdir(), 'sancussight-governance-native-source-'))
  try {
    await writeFile(join(source, 'inventory.json'), JSON.stringify({ schemaVersion: 1, runtime: { id: 'codex-cli', version: '1.0.0' }, assets: [{ kind: 'runtime', id: 'codex-cli', version: '1.0.0', purpose: 'Bounded fixture runtime' }] }))
    const config = new GovernanceConfigStore(data)
    await config.save({ schemaVersion: 1, pollIntervalMs: 15_000, sources: [{ id: 'runtime-inventory', artifactPath: source, enabled: true }] })
    const store = new GovernanceStore(data)
    await store.initialize()
    const service = new GovernanceService(store, undefined, undefined, config)
    await service.initialize()
    const model = await service.readModel(NOW)
    assert.equal(model.eventCount, 1)
    assert.equal((await service.listSourceStates()).find(state => state.id === 'runtime-inventory')?.health, 'current')
  } finally { await rm(data, { recursive: true, force: true }); await rm(source, { recursive: true, force: true }) }
})
