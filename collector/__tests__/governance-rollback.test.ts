import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createCanonicalRef, sha256Hex } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import { GovernanceStore } from '../governance-store.ts'
import { CollectorConfigStore } from '../config-store.ts'
import { EvidenceStore } from '../evidence-store.ts'
import { LocalCollectorService } from '../main.ts'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'

test('governance rollback leaves canonical evidence, config, native events, and export inputs intact', async () => {
  const data = await mkdtemp(join(tmpdir(), 'sancussight-governance-rollback-'))
  try {
    const evidenceStore = new EvidenceStore(data); await evidenceStore.initialize()
    const envelope = createEvidenceEnvelope({ source: 'pipelock', evidenceKind: 'audit-packet', observedAt: '2026-07-17T08:00:00.000Z', importedAt: '2026-07-17T08:00:00.000Z', subject: { externalId: 'workflow-001', type: 'workflow' }, outcome: 'pass', summary: 'Bounded receipt.', provenance: { artifactName: 'packet.json', artifactContentHash: contentHash('{}'), parserId: 'pipelock', parserVersion: '1.0.0', verification: 'verified' } })
    await evidenceStore.accept([envelope], { source: 'pipelock', cursor: 'cursor-1', updatedAt: envelope.importedAt })
    const action = createCanonicalRef('action', 'rollback-fixture', 'action-001')
    const event = createGovernanceEvent({ schemaVersion: 1, type: 'action.observed', observedAt: envelope.importedAt, importedAt: envelope.importedAt, source: { id: 'runtime-inventory', version: '1.0.0' }, subject: action, context: { actionId: action.id }, truth: { assertion: 'observed', authority: 'runtime' }, payload: { action, effectType: 'read' }, relations: [], provenance: { producerId: 'runtime-inventory', producerVersion: '1.0.0', sourceRecordId: 'action-001', artifactName: 'inventory.json', artifactContentHash: sha256Hex('rollback'), parserId: 'runtime-inventory', parserVersion: '1.0.0', contractVersion: 'runtime-inventory-v1', qualification: 'manual', verification: 'not-applicable' } })
    const governanceStore = new GovernanceStore(data); await governanceStore.initialize(); await governanceStore.appendLocal([event])
    const evidencePath = await readFile(evidenceStore.acceptedPath, 'utf8')
    const governancePath = await readFile(governanceStore.acceptedPath, 'utf8')
    const service = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), new Map())
    await service.initialize(); service.close()
    assert.equal(await readFile(evidenceStore.acceptedPath, 'utf8'), evidencePath)
    assert.equal(await readFile(governanceStore.acceptedPath, 'utf8'), governancePath)
    assert.equal((await new EvidenceStore(data).readAccepted()).length, 1)
    const restarted = new GovernanceStore(data); await restarted.initialize(); assert.equal((await restarted.readEvents()).length, 1)
  } finally { await rm(data, { recursive: true, force: true }) }
})
