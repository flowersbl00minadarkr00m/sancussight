import assert from 'node:assert/strict'
import test from 'node:test'
import { createGovernanceBundle, isGovernanceBundleSafe, manualizeGovernanceProjection, parseGovernanceBundle } from '../../src/domain/governance/export.ts'
import { canonicalJson, createCanonicalRef, sha256Hex } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import { createHostedBinding, createHostedHumanDecision } from '../../src/domain/governance/manual.ts'
import type { GovernanceReadModel } from '../../src/domain/governance/project.ts'

const NOW = '2026-07-17T08:00:00.000Z'

function model(): GovernanceReadModel {
  return {
    generatedAt: NOW,
    inventory: [{ id: 'a'.repeat(64), title: 'C:\\Users\\ExampleUser\\private-agent', kind: 'agent', eventType: 'inventory.observed', observedAt: NOW, sourceIds: ['runtime-inventory'], eventIds: ['b'.repeat(64)], status: 'current', truth: { assertion: 'observed', authority: 'runtime' }, qualification: 'manual', verification: 'not-applicable', provenance: [{ producerId: 'runtime-inventory', producerVersion: '1.0.0', sourceRecordId: 'agent-001', artifactName: 'inventory.json', artifactContentHash: 'c'.repeat(64), parserId: 'runtime', parserVersion: '1.0.0', contractVersion: 'runtime-v1', qualification: 'manual', verification: 'not-applicable' }], gapCodes: [], asset: { kind: 'agent', id: 'a'.repeat(64), namespace: 'runtime-inventory', label: 'C:\\Users\\ExampleUser\\private-agent' }, historyEventIds: ['b'.repeat(64)], owner: 'operator@example.test' }],
    activity: [], controls: [], decisions: [], outcomes: [], lineage: [], sourceStates: [{ sourceId: 'runtime-inventory', health: 'current', eventCount: 1, gaps: [] }], gaps: [], eventCount: 1,
  }
}

test('governance export sanitizes paths and user identifiers while preserving opaque references', () => {
  const bundle = createGovernanceBundle(model(), { mode: 'local-collector', exportedAt: NOW })
  const raw = JSON.stringify(bundle)
  assert.equal(raw.includes('C:\\Users\\ExampleUser'), false)
  assert.equal(raw.includes('operator@example.test'), false)
  assert.equal(bundle.projection.inventory[0].id, 'a'.repeat(64))
  assert.equal(bundle.projection.inventory[0].asset.id, 'a'.repeat(64))
  assert.equal(isGovernanceBundleSafe(bundle), true)
  assert.equal(parseGovernanceBundle(bundle)?.qualification, 'local')
})

test('governance import rejects prohibited or incompatible bundles and upgrades the bounded legacy shape', () => {
  assert.equal(parseGovernanceBundle({ schemaVersion: 1, bundleType: 'sancussight-governance', mode: 'hosted-manual', qualification: 'manual', exportedAt: NOW, generatedAt: NOW, projection: {}, missingEvidence: [] }), undefined)
  assert.equal(parseGovernanceBundle({ schemaVersion: 1, bundleType: 'sancussight-governance', mode: 'hosted-manual', qualification: 'manual', exportedAt: NOW, generatedAt: NOW, projection: model(), missingEvidence: [], prompt: 'do not retain' }), undefined)
  const legacy = parseGovernanceBundle({ schemaVersion: 0, readModel: model() })
  assert.equal(legacy?.mode, 'hosted-manual')
})

test('manual projection removes local freshness claims without changing lineage identifiers', () => {
  const projection = manualizeGovernanceProjection(model())
  assert.equal(projection.sourceStates[0].health, 'unknown')
  assert.ok(projection.sourceStates[0].gaps.includes('manual-import'))
  assert.equal(projection.inventory[0].id, 'a'.repeat(64))
})

test('governance bundles retain validated history for hosted/manual SancusSight-owned writes', () => {
  const action = createCanonicalRef('action', 'fixture', 'action-001', 'Fixture action')
  const event = createGovernanceEvent({
    schemaVersion: 1, type: 'action.observed', observedAt: NOW, importedAt: NOW,
    source: { id: 'fixture', version: '1.0.0', recordType: 'fixture' }, subject: action, context: { actionId: action.id },
    truth: { assertion: 'observed', authority: 'runtime' }, payload: { action, effectType: 'read' }, relations: [],
    provenance: { producerId: 'fixture', producerVersion: '1.0.0', sourceRecordId: 'action-001', artifactName: 'fixture.json', artifactContentHash: sha256Hex('fixture'), parserId: 'fixture', parserVersion: '1.0.0', contractVersion: 'fixture-v1', qualification: 'fixture', verification: 'not-applicable' },
  })
  const decision = createHostedHumanDecision({ decision: 'approve', actionId: action.id, policyId: 'policy-fixture', policyVersion: '1', scopeHash: sha256Hex('scope'), rationale: 'Bounded hosted approval', decidedBy: 'operator', effectiveAt: NOW, evidenceRefs: [event.id] }, [event], NOW)
  const bundle = createGovernanceBundle(model(), { mode: 'hosted-manual', events: [event, decision], bindings: [] })
  const parsed = parseGovernanceBundle(bundle)
  assert.equal(parsed?.events?.length, 2)
  assert.equal(parsed?.bindings?.length, 0)
  assert.equal(parsed?.mode, 'hosted-manual')
})

test('hosted bindings require two retained canonical references and export with their evidence', () => {
  const action = createCanonicalRef('action', 'fixture', 'action-binding', 'Fixture action')
  const effect = createCanonicalRef('effect', 'fixture', 'effect-binding', 'Fixture effect')
  const actionEvent = createGovernanceEvent({
    schemaVersion: 1, type: 'action.observed', observedAt: NOW, importedAt: NOW,
    source: { id: 'fixture', version: '1.0.0', recordType: 'fixture' }, subject: action, context: { actionId: action.id },
    truth: { assertion: 'observed', authority: 'runtime' }, payload: { action, effectType: 'read' }, relations: [],
    provenance: { producerId: 'fixture', producerVersion: '1.0.0', sourceRecordId: 'action-binding', artifactName: 'fixture.json', artifactContentHash: sha256Hex('fixture-action'), parserId: 'fixture', parserVersion: '1.0.0', contractVersion: 'fixture-v1', qualification: 'fixture', verification: 'not-applicable' },
  })
  const effectEvent = createGovernanceEvent({
    schemaVersion: 1, type: 'effect.observed', observedAt: NOW, importedAt: NOW,
    source: { id: 'fixture', version: '1.0.0', recordType: 'fixture' }, subject: effect, context: { actionId: action.id },
    truth: { assertion: 'observed', authority: 'runtime' }, payload: { effect, actionId: action.id, result: 'succeeded', summary: 'Fixture effect observed.' }, relations: [],
    provenance: { producerId: 'fixture', producerVersion: '1.0.0', sourceRecordId: 'effect-binding', artifactName: 'fixture.json', artifactContentHash: sha256Hex('fixture-effect'), parserId: 'fixture', parserVersion: '1.0.0', contractVersion: 'fixture-v1', qualification: 'fixture', verification: 'not-applicable' },
  })
  const binding = createHostedBinding({ from: action, to: effect, scopeHash: sha256Hex('binding-scope'), confirmedAt: NOW, confirmedBy: 'operator', evidenceRefs: [actionEvent.id, effectEvent.id] }, [actionEvent, effectEvent])
  assert.equal(binding.id, sha256Hex(canonicalJson({ from: action, to: effect, scopeHash: sha256Hex('binding-scope'), confirmedAt: NOW, confirmedBy: 'operator', evidenceRefs: [actionEvent.id, effectEvent.id] })))
  const bundle = createGovernanceBundle(model(), { mode: 'hosted-manual', events: [actionEvent, effectEvent], bindings: [binding] })
  assert.equal(parseGovernanceBundle(bundle)?.bindings?.[0].id, binding.id)
})
