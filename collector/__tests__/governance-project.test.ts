import assert from 'node:assert/strict'
import test from 'node:test'
import type { EvidenceSourceState } from '../../src/types.ts'
import type { GovernanceEventV1 } from '../../src/domain/governance/model.ts'
import { createCanonicalRef } from '../../src/domain/governance/canonicalize.ts'
import { buildGovernanceReadModel } from '../../src/domain/governance/project.ts'
import { createGovernanceEvent } from '../governance-event.ts'

const NOW = '2026-07-16T12:00:00.000Z'
const CASE = createCanonicalRef('work-case', 'findmnemo', 'case-001', 'Publish report')
const ACTION = createCanonicalRef('action', 'agent-beacon', 'action-001', 'Publish report')
const RUNTIME = createCanonicalRef('runtime', 'runtime-inventory', 'codex-cli-001', 'Codex CLI')
const EFFECT = createCanonicalRef('effect', 'agent-beacon', 'effect-001', 'Report published')
const OUTCOME = createCanonicalRef('outcome', 'flowsensa', 'outcome-001', 'Accepted')

test('pure projector builds five ledgers and a stable complete lineage', () => {
  const events = completeEvents()
  const model = buildGovernanceReadModel({ events, now: NOW })
  assert.equal(model.eventCount, events.length)
  assert.equal(model.inventory.length, 1)
  assert.ok(model.activity.some(row => row.eventType === 'action.observed'))
  assert.equal(model.controls.length, 1)
  assert.equal(model.decisions.length, 2)
  assert.equal(model.outcomes.length, 3)
  assert.equal(model.lineage.length, 1)
  assert.equal(model.lineage[0].complete, true)
  assert.equal(model.lineage[0].auditComplete, true)
  assert.equal(model.lineage[0].enforcementProven, false)
})

test('removing an effect leaves history and prevents audit completion', () => {
  const events = completeEvents().filter(event => event.type !== 'effect.observed')
  const model = buildGovernanceReadModel({ events, now: NOW })
  assert.equal(model.lineage[0].auditComplete, false)
  assert.ok(model.gaps.some(gap => gap.code === 'missing-effect' || gap.code === 'verified-without-effect'))
  assert.equal(model.controls[0].enforcementProven, false)
})

test('conflicting inventory versions and stale source health remain local gaps', () => {
  const first = inventoryEvent('1.0.0', 'inventory-001', '2026-07-16T11:00:00.000Z')
  const second = inventoryEvent('2.0.0', 'inventory-002', '2026-07-16T11:30:00.000Z')
  const state: EvidenceSourceState = { id: 'agent-beacon', displayName: 'Agent Beacon', evidenceType: 'Runtime JSONL', health: 'stale', rejectedCount: 0 }
  const model = buildGovernanceReadModel({ events: [first, second], sourceStates: [state], now: NOW })
  assert.equal(model.inventory[0].status, 'conflicting')
  assert.ok(model.inventory[0].gapCodes.includes('conflict'))
  assert.ok(model.gaps.some(gap => gap.code === 'stale-source'))
})

test('inferred activity and expired or revoked decisions stay visible but inactive', () => {
  const inferred = make('action.proposed', ACTION, 'flowsensa', 'inferred-action-001', { action: ACTION, effectType: 'publish', sensitivity: 'unknown', reversibility: 'unknown', privilege: 'unknown' }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'inferred', authority: 'workflow-system', confidence: 0.55 })
  const expired = make('human.decided', ACTION, 'sancussight', 'expired-approval-001', { decision: 'approve', actionId: ACTION.id, policyId: 'policy-publish', policyVersion: '1.0.0', scopeHash: 'c'.repeat(64), rationale: 'Expired approval remains inspectable.', decidedBy: 'operator', effectiveAt: '2026-07-15T12:00:00.000Z', expiresAt: '2026-07-15T13:00:00.000Z', evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'human-confirmed', authority: 'human' })
  const revoked = make('human.decided', ACTION, 'sancussight', 'revoked-approval-001', { decision: 'revoke', actionId: ACTION.id, policyId: 'policy-publish', policyVersion: '1.0.0', scopeHash: 'd'.repeat(64), rationale: 'Revocation remains inspectable.', decidedBy: 'operator', effectiveAt: NOW, evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'human-confirmed', authority: 'human' })
  const model = buildGovernanceReadModel({ events: [inferred, expired, revoked], now: NOW })
  assert.ok(model.activity.some(row => row.status === 'inferred'))
  assert.ok(model.decisions.some(row => row.status === 'expired' && !row.active))
  assert.ok(model.decisions.some(row => row.status === 'revoked' && !row.active))
})

test('future and superseded human decisions remain visible but inactive', () => {
  const future = make('human.decided', ACTION, 'sancussight', 'future-approval-001', { decision: 'approve', actionId: ACTION.id, policyId: 'policy-publish', policyVersion: '1.0.0', scopeHash: 'e'.repeat(64), rationale: 'Approval begins later.', decidedBy: 'operator', effectiveAt: '2026-07-16T13:00:00.000Z', evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'human-confirmed', authority: 'human' })
  const superseding = make('human.decided', ACTION, 'sancussight', 'superseding-approval-001', { decision: 'approve', actionId: ACTION.id, policyId: 'policy-publish', policyVersion: '1.0.1', scopeHash: 'f'.repeat(64), rationale: 'Replacement approval.', decidedBy: 'operator', effectiveAt: NOW, supersedesDecisionId: future.id, evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'human-confirmed', authority: 'human' })
  const model = buildGovernanceReadModel({ events: [future, superseding], now: NOW })
  assert.ok(model.decisions.some(row => row.eventIds.includes(future.id) && row.gapCodes.includes('superseded-decision') && !row.active))
  assert.ok(model.decisions.some(row => row.eventIds.includes(superseding.id) && row.active))
})

function completeEvents(): GovernanceEventV1[] {
  return [
    make('work.intent-recorded', CASE, 'findmnemo', 'intent-001', { case: CASE, intentSummary: 'Publish the approved report.', actor: RUNTIME }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'observed', authority: 'human' }),
    make('action.observed', ACTION, 'agent-beacon', 'action-001', { action: ACTION, actor: RUNTIME, effectType: 'publish', destination: 'operator-owned-target', sensitivity: 'internal', reversibility: 'medium', privilege: 'user' }, { caseId: CASE.id, actionId: ACTION.id, runtimeId: RUNTIME.id }, { assertion: 'observed', authority: 'runtime' }),
    make('control.decided', ACTION, 'pipelock', 'decision-001', { actionId: ACTION.id, decision: 'allow', policyId: 'policy-publish', policyVersion: '1.0.0', reason: 'Approved workflow path.' }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'verified', authority: 'assurance-tool' }, 'verified', 'operational'),
    make('human.decided', ACTION, 'sancussight', 'approval-001', { decision: 'approve', actionId: ACTION.id, policyId: 'policy-publish', policyVersion: '1.0.0', scopeHash: 'b'.repeat(64), rationale: 'Approved for the bounded operator-owned target.', decidedBy: 'operator', effectiveAt: NOW, evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'human-confirmed', authority: 'human' }),
    make('effect.observed', EFFECT, 'agent-beacon', 'effect-001', { effect: EFFECT, actionId: ACTION.id, result: 'succeeded', summary: 'The bounded publish effect completed.' }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'observed', authority: 'runtime' }),
    make('outcome.observed', OUTCOME, 'flowsensa', 'outcome-001', { outcome: OUTCOME, actionId: ACTION.id, result: 'accepted', summary: 'Workflow accepted the result.' }, { caseId: CASE.id, actionId: ACTION.id, workflowId: 'workflow-001' }, { assertion: 'observed', authority: 'workflow-system' }),
    make('outcome.verified', OUTCOME, 'pipelock', 'proof-001', { outcome: OUTCOME, verifier: 'receipt-verifier', result: 'verified', evidenceRefs: [] }, { caseId: CASE.id, actionId: ACTION.id }, { assertion: 'verified', authority: 'assurance-tool' }, 'verified', 'operational'),
    inventoryEvent('1.0.0', 'runtime-001', '2026-07-16T10:00:00.000Z'),
  ]
}

function inventoryEvent(version: string, recordId: string, observedAt: string): GovernanceEventV1 {
  return make('inventory.observed', RUNTIME, 'agent-beacon', recordId, { asset: RUNTIME, state: 'observed', version, purpose: 'Local runtime inventory' }, { runtimeId: RUNTIME.id }, { assertion: 'observed', authority: 'runtime' }, 'not-applicable', 'manual', observedAt)
}

function make(type: GovernanceEventV1['type'], subject: GovernanceEventV1['subject'], sourceId: string, sourceRecordId: string, payload: unknown, context: GovernanceEventV1['context'], truth: GovernanceEventV1['truth'], verification: 'verified' | 'not-applicable' = 'not-applicable', qualification: 'operational' | 'manual' = 'manual', observedAt = NOW): GovernanceEventV1 {
  return createGovernanceEvent({
    schemaVersion: 1, type, observedAt, importedAt: NOW,
    source: { id: sourceId, version: '1.0.0', recordType: type }, subject, context, truth,
    payload: payload as never, relations: [],
    provenance: { producerId: sourceId, producerVersion: '1.0.0', sourceRecordId, artifactName: `${sourceId}.json`, artifactContentHash: 'a'.repeat(64), parserId: `${sourceId}-parser`, parserVersion: '1.0.0', contractVersion: '1.0.0', qualification, verification },
  })
}
