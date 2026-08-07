import assert from 'node:assert/strict'
import { appendFile, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createCanonicalRef } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import { GovernanceStore } from '../governance-store.ts'
import { projectEvidenceEnvelope } from '../adapters/projections/evidence-envelope.ts'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'

const NOW = '2026-07-16T12:00:00.000Z'

test('governance events persist, replay idempotently, and checkpoint after durable append', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-governance-'))
  try {
    const store = new GovernanceStore(root)
    await store.initialize()
    const event = sampleEvent('record-001')
    const checkpoint = { source: 'findmnemo', cursor: '1', updatedAt: NOW }
    assert.equal(await store.accept([event], checkpoint), 1)
    assert.equal(await store.accept([event], checkpoint), 0)
    assert.equal(store.getCheckpoint('findmnemo')?.cursor, '1')
    const restarted = new GovernanceStore(root)
    await restarted.initialize()
    assert.equal((await restarted.readEvents()).length, 1)
    assert.equal((await readFile(restarted.acceptedPath, 'utf8')).split('\n').filter(Boolean).length, 1)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('paging uses bounded opaque cursors and source filters', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-governance-'))
  try {
    const store = new GovernanceStore(root)
    await store.initialize()
    const events = Array.from({ length: 7 }, (_, index) => sampleEvent(`record-${index}`))
    await store.accept(events, { source: 'runtime-inventory', cursor: '7', updatedAt: NOW })
    const first = await store.pageEvents({ limit: 3 })
    assert.equal(first.events.length, 3)
    assert.ok(first.nextCursor)
    assert.equal(first.nextCursor?.includes('3'), false)
    const second = await store.pageEvents({ limit: 3, cursor: first.nextCursor, source: 'agent-beacon' })
    assert.equal(second.events.length, 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('cached event reads return defensive arrays and notice external appends', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-governance-'))
  try {
    const store = new GovernanceStore(root)
    await store.initialize()
    const firstEvent = sampleEvent('cache-1')
    await store.appendLocal([firstEvent])
    const first = await store.readEvents()
    first.length = 0
    assert.equal((await store.readEvents()).length, 1)
    await appendFile(store.acceptedPath, `${JSON.stringify(sampleEvent('cache-2'))}\n`, 'utf8')
    assert.equal((await store.readEvents()).length, 2)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('100,000 minimized events remain page-bounded', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-governance-'))
  try {
    const store = new GovernanceStore(root)
    await store.initialize()
    const events = Array.from({ length: 100_000 }, (_, index) => sampleEvent(`bulk-${index}`))
    assert.equal(await store.accept(events, { source: 'runtime-inventory', cursor: '100000', updatedAt: NOW }), 100_000)
    const page = await store.pageEvents({ limit: 500 })
    assert.equal(page.events.length, 500)
    assert.ok(page.nextCursor)
    assert.ok(JSON.stringify(page.events).length < 600_000)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('evidence envelopes project without duplicating the canonical envelope', () => {
  const envelope = createEvidenceEnvelope({
    source: 'pipelock', evidenceKind: 'audit-packet', observedAt: NOW, importedAt: NOW,
    subject: { externalId: 'workflow:publish', type: 'workflow' }, outcome: 'pass', summary: 'One mediated action allowed.',
    provenance: { artifactName: 'packet.json', artifactContentHash: contentHash('packet'), sourceRecordId: 'packet-001', parserId: 'pipelock', parserVersion: '1.0.0', verification: 'verified' },
    operational: { qualification: 'operational', sourceVersion: '3.1.0', runId: 'run-001', targetId: 'workflow-001', contractVersion: 'pipelock-v1' },
  })
  const projected = projectEvidenceEnvelope(envelope)
  assert.equal(projected.source.id, 'pipelock')
  assert.equal(projected.provenance.sourceRecordId, 'packet-001')
  assert.equal(projected.provenance.qualification, 'operational')
  assert.equal(projected.provenance.verification, 'verified')
  assert.equal(projected.type, 'control.decided')
  assert.notEqual(projected.id, envelope.id)
})

function sampleEvent(sourceRecordId: string) {
  const action = createCanonicalRef('action', 'runtime-inventory', `action-${sourceRecordId}`)
  return createGovernanceEvent({
    schemaVersion: 1, type: 'action.observed', observedAt: NOW, importedAt: NOW,
    source: { id: 'runtime-inventory', version: '1.0.0' }, subject: action, context: { actionId: action.id },
    truth: { assertion: 'observed', authority: 'runtime' }, payload: { action, effectType: 'read' }, relations: [],
    provenance: { producerId: 'runtime-inventory', producerVersion: '1.0.0', sourceRecordId, artifactName: 'inventory.json', artifactContentHash: 'a'.repeat(64), parserId: 'runtime-inventory', parserVersion: '1.0.0', contractVersion: 'runtime-inventory-v1', qualification: 'manual', verification: 'not-applicable' },
  })
}
