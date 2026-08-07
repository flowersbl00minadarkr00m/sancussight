import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createCanonicalRef, sha256Hex } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import { GovernanceService } from '../governance-service.ts'
import { GovernanceStore } from '../governance-store.ts'
import { startCollectorServer, type CollectorService } from '../server.ts'
import type { EvidenceSourceState } from '../../src/types.ts'

const states: EvidenceSourceState[] = [{ id: 'agent-beacon', displayName: 'Agent Beacon', evidenceType: 'JSONL', health: 'current', rejectedCount: 0 }]

function collectorService(): CollectorService {
  return {
    async getSources() { return states },
    async configure(source) { return { ...states[0], id: source } },
    async refresh() { return states[0] },
    async disconnect() {},
    async getEvidence() { return { items: [] } },
    async getRejected() { return { items: [] } },
    async retryRejected() {},
  }
}

function actionEvent() {
  const action = createCanonicalRef('action', 'fixture-agent', 'action-001', 'Read local fixture')
  const caseRef = createCanonicalRef('work-case', 'fixture-findmnemo', 'case-001', 'Fixture case')
  return createGovernanceEvent({
    schemaVersion: 1,
    type: 'action.observed',
    observedAt: '2026-07-16T12:00:00.000Z',
    importedAt: '2026-07-16T12:00:01.000Z',
    source: { id: 'agent-beacon', version: '1.0.0', recordType: 'fixture' },
    subject: action,
    context: { caseId: caseRef.id, actionId: action.id },
    truth: { assertion: 'observed', authority: 'runtime' },
    payload: { action, effectType: 'read', destination: 'workspace:fixture', sensitivity: 'internal', reversibility: 'high', privilege: 'user' },
    relations: [],
    provenance: { producerId: 'agent-beacon', producerVersion: '1.0.0', sourceRecordId: 'action-001', artifactName: 'fixture.json', artifactContentHash: sha256Hex('fixture'), parserId: 'fixture', parserVersion: '1.0.0', contractVersion: 'fixture-v1', qualification: 'fixture', verification: 'not-applicable' },
  })
}

function inventoryEvent() {
  const agent = createCanonicalRef('agent', 'fixture-agent', 'agent-001', 'Fixture agent')
  return createGovernanceEvent({
    schemaVersion: 1,
    type: 'inventory.observed',
    observedAt: '2026-07-16T11:59:00.000Z',
    importedAt: '2026-07-16T11:59:01.000Z',
    source: { id: 'runtime-inventory', version: '1.0.0', recordType: 'fixture' },
    subject: agent,
    context: {},
    truth: { assertion: 'observed', authority: 'runtime' },
    payload: { asset: agent, state: 'observed', version: '1.0.0', owner: 'operator' },
    relations: [],
    provenance: { producerId: 'runtime-inventory', producerVersion: '1.0.0', sourceRecordId: 'agent-001', artifactName: 'fixture.json', artifactContentHash: sha256Hex('fixture-agent'), parserId: 'fixture', parserVersion: '1.0.0', contractVersion: 'fixture-v1', qualification: 'fixture', verification: 'not-applicable' },
  })
}

test('governance API pages bounded projections and appends only local decisions/bindings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-governance-server-'))
  const staticRoot = await mkdtemp(join(tmpdir(), 'sancussight-governance-static-'))
  await mkdir(staticRoot, { recursive: true }); await writeFile(join(staticRoot, 'index.html'), '<!doctype html>')
  const store = new GovernanceStore(root); await store.initialize()
  const governance = new GovernanceService(store)
  const action = actionEvent(); const inventory = inventoryEvent(); await store.appendLocal([action, inventory])
  const running = await startCollectorServer({ port: 0, staticDirectory: staticRoot, service: collectorService(), governanceService: governance })
  try {
    const events = await fetch(`${running.origin}/api/v1/governance/events?limit=1`)
    assert.equal(events.status, 200)
    const eventBody = await events.json() as { items: unknown[] }
    assert.equal(eventBody.items.length, 1)
    const summary = await fetch(`${running.origin}/api/v1/governance/summary`)
    assert.equal(summary.status, 200)
    const summaryBody = await summary.json() as { eventCount: number; events?: unknown }
    assert.equal(summaryBody.eventCount, 2)
    assert.equal('events' in summaryBody, false)
    const exported = await fetch(`${running.origin}/api/v1/governance/export`)
    assert.equal(exported.status, 200)
    const exportBody = await exported.json() as { bundleType: string; qualification: string; projection: { eventCount: number } }
    assert.equal(exportBody.bundleType, 'sancussight-governance')
    assert.equal(exportBody.qualification, 'local')
    assert.equal(exportBody.projection.eventCount, 2)
    const controls = await fetch(`${running.origin}/api/v1/governance/controls?execute=1`)
    assert.equal(controls.status, 400)
    const lineage = await fetch(`${running.origin}/api/v1/governance/lineage/case:${action.context.caseId}`)
    assert.equal(lineage.status, 200)

    const status = await fetch(`${running.origin}/api/v1/status`)
    const statusBody = await status.json() as { csrfToken: string }
    const cookie = status.headers.get('set-cookie')!.split(';')[0]
    const decision = {
      decision: 'approve', actionId: action.subject.id, policyId: 'policy-local', policyVersion: '1',
      scopeHash: sha256Hex('scope-001'), rationale: 'Bounded fixture approval', decidedBy: 'operator',
      effectiveAt: '2026-07-16T12:00:02.000Z', evidenceRefs: [action.id],
    }
    const missingCsrf = await fetch(`${running.origin}/api/v1/governance/decisions`, { method: 'POST', headers: { cookie, origin: running.origin, 'content-type': 'application/json' }, body: JSON.stringify(decision) })
    assert.equal(missingCsrf.status, 403)
    const accepted = await fetch(`${running.origin}/api/v1/governance/decisions`, { method: 'POST', headers: { cookie, origin: running.origin, 'content-type': 'application/json', 'x-sancussight-csrf': statusBody.csrfToken }, body: JSON.stringify(decision) })
    assert.equal(accepted.status, 201)
    const invalid = await fetch(`${running.origin}/api/v1/governance/decisions`, { method: 'POST', headers: { cookie, origin: running.origin, 'content-type': 'application/json', 'x-sancussight-csrf': statusBody.csrfToken }, body: JSON.stringify({ ...decision, actionId: 'missing-action' }) })
    assert.equal(invalid.status, 404)
    const binding = await fetch(`${running.origin}/api/v1/governance/bindings`, { method: 'POST', headers: { cookie, origin: running.origin, 'content-type': 'application/json', 'x-sancussight-csrf': statusBody.csrfToken }, body: JSON.stringify({ from: action.subject, to: inventory.subject, scopeHash: sha256Hex('binding-scope'), confirmedAt: '2026-07-16T12:00:03.000Z', confirmedBy: 'operator', evidenceRefs: [action.id, inventory.id] }) })
    assert.equal(binding.status, 201)
    const tooLarge = await fetch(`${running.origin}/api/v1/governance/bindings`, { method: 'POST', headers: { cookie, origin: running.origin, 'content-type': 'application/json', 'x-sancussight-csrf': statusBody.csrfToken }, body: JSON.stringify({ payload: 'x'.repeat(40_000) }) })
    assert.equal(tooLarge.status, 413)
    const model = await governance.readModel('2026-07-16T12:01:00.000Z')
    assert.equal(model.decisions.length, 1)
    assert.equal((await governance.listBindings()).length, 1)
  } finally {
    await running.close(); await rm(root, { recursive: true, force: true }); await rm(staticRoot, { recursive: true, force: true })
  }
})
