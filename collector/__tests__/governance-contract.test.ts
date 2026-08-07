import assert from 'node:assert/strict'
import test from 'node:test'
import { createCanonicalRef, governanceEventId, sha256Hex } from '../../src/domain/governance/canonicalize.ts'
import type { GovernanceEventV1, GovernancePayload } from '../../src/domain/governance/model.ts'
import { createGovernanceEvent, parseGovernanceEvent, validateGovernanceEvent } from '../governance-event.ts'

const NOW = '2026-07-16T12:00:00.000Z'
const HASH = 'a'.repeat(64)
const subject = createCanonicalRef('action', 'runtime', 'action-001', 'Publish report')

test('SHA-256 and canonical IDs are stable across property order and replay', () => {
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  const first = createEvent({ payload: { action: subject, effectType: 'publish', sensitivity: 'internal' } })
  const second = createEvent({ payload: { sensitivity: 'internal', effectType: 'publish', action: subject } })
  assert.equal(first.id, second.id)
  assert.equal(governanceEventId({ type: first.type, sourceId: first.source.id, sourceRecordId: first.provenance.sourceRecordId, subject: first.subject, payload: first.payload, relations: first.relations, parserVersion: first.provenance.parserVersion }), first.id)
})

test('valid event round-trips with bounded provenance and typed payload', () => {
  const event = createEvent({ payload: { action: subject, effectType: 'read', privilege: 'user' } })
  assert.equal(validateGovernanceEvent(event), true)
  assert.equal(parseGovernanceEvent(JSON.parse(JSON.stringify(event))).valid, true)
})

test('unknown versions, event types, prohibited fields, and unknown keys reject without echoing content', () => {
  const event = createEvent({ payload: { action: subject, effectType: 'read' } })
  const unknownVersion = { ...event, schemaVersion: 2 }
  const unknownType = { ...event, type: 'action.unknown' }
  const prohibited = { ...event, payload: { ...(event.payload as unknown as Record<string, unknown>), prompt: 'do not retain this' } }
  const unknownKey = { ...event, extra: 'not allowed' }
  assert.equal(parseGovernanceEvent(unknownVersion).errorCode, 'unsupported-version')
  assert.equal(parseGovernanceEvent(unknownType).errorCode, 'unsupported-type')
  const prohibitedResult = parseGovernanceEvent(prohibited)
  assert.equal(prohibitedResult.errorCode, 'prohibited-field')
  assert.equal(prohibitedResult.guidance?.includes('do not retain'), false)
  assert.equal(parseGovernanceEvent(unknownKey).valid, false)
})

test('inferred records require confidence and cannot claim enforced authority', () => {
  const inferred = createEvent({ truth: { assertion: 'inferred', authority: 'workflow-system', confidence: 0.5 }, payload: { action: subject, effectType: 'network' } })
  assert.equal(parseGovernanceEvent({ ...inferred, truth: { ...inferred.truth, confidence: undefined } }).valid, false)
  assert.throws(() => createEvent({ truth: { assertion: 'enforced', authority: 'agent' }, payload: { action: subject, effectType: 'write' } }))
})

test('identity input rejects raw paths so cross-source refs remain opaque', () => {
  assert.throws(() => createCanonicalRef('tool', 'runtime', 'C:\\Users\\operator\\secret.exe'))
})

function createEvent(overrides: Partial<Pick<GovernanceEventV1, 'truth' | 'payload'>>): GovernanceEventV1 {
  const payload = overrides.payload ?? ({ action: subject, effectType: 'read' } as GovernancePayload)
  return createGovernanceEvent({
    schemaVersion: 1,
    type: 'action.observed',
    observedAt: NOW,
    importedAt: NOW,
    source: { id: 'agent-beacon', version: '1.0.0', recordType: 'runtime-event' },
    subject,
    context: { actionId: subject.id },
    truth: overrides.truth ?? { assertion: 'observed', authority: 'runtime' },
    payload,
    relations: [],
    provenance: {
      producerId: 'agent-beacon', producerVersion: '1.0.0', sourceRecordId: 'record-001', artifactName: 'runtime.jsonl',
      artifactContentHash: HASH, parserId: 'agent-beacon-parser', parserVersion: '1.0.0', contractVersion: '1.0.0',
      qualification: 'manual', verification: 'not-applicable',
    },
  })
}
