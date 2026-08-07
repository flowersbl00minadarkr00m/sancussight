import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluatePersonalControls, type PersonalControlProfile } from '../../src/domain/governance/controls.ts'

const profile: PersonalControlProfile = {
  schemaVersion: 1, profileId: 'test-profile', version: '1.0.0',
  attribution: { dimensions: 'curated', aicm: 'attributed only' },
  dimensions: [
    { id: 'risk-boundary', label: 'Risk' },
    { id: 'human-accountability', label: 'Accountability' },
    { id: 'technical-lifecycle', label: 'Lifecycle' },
    { id: 'responsible-use', label: 'Use' },
  ],
  controls: [
    control('observe-local', 'responsible-use', 'observe', { effectTypes: ['read'], externalDestination: false }),
    control('advise-novel', 'technical-lifecycle', 'advise', { novelty: true }),
    control('confirm-publish', 'human-accountability', 'confirm', { effectTypes: ['publish'], externalDestination: true }),
    control('block-secret', 'risk-boundary', 'block', { sensitivities: ['secret'], externalDestination: true }),
  ],
}

test('personal controls emit deterministic observe, advise, confirm, and block tiers', () => {
  const recommendations = evaluatePersonalControls({
    actions: [
      fact('local-read', { effectType: 'read', destination: 'workspace:local' }),
      fact('new-tool', { effectType: 'network', destination: 'workspace:local', novelty: true }),
      fact('publish', { effectType: 'publish', destination: 'https://operator-owned.example' }),
      fact('secret-egress', { effectType: 'network', destination: 'https://operator-owned.example', sensitivity: 'secret' }),
    ],
  }, profile, '2026-07-16T12:00:00.000Z')
  assert.equal(recommendations.find(item => item.controlId === 'observe-local' && item.actionId === 'local-read')?.tier, 'observe')
  assert.equal(recommendations.find(item => item.controlId === 'advise-novel' && item.actionId === 'new-tool')?.tier, 'advise')
  assert.equal(recommendations.find(item => item.controlId === 'confirm-publish' && item.actionId === 'publish')?.tier, 'confirm')
  assert.equal(recommendations.find(item => item.controlId === 'block-secret' && item.actionId === 'secret-egress')?.tier, 'block')
})

test('unknown facts create evidence gaps and never become permissive observe', () => {
  const recommendations = evaluatePersonalControls({ actions: [fact('unknown-read', { effectType: 'read' })] }, profile, '2026-07-16T12:00:00.000Z')
  const recommendation = recommendations.find(item => item.controlId === 'observe-local')
  assert.equal(recommendation?.tier, 'advise')
  assert.ok(recommendation?.evidenceGaps.includes('destination-unknown'))
  assert.ok(recommendation?.reasonCodes.includes('unknown-fact'))
})

test('inferred facts cannot satisfy deterministic enforcement authority', () => {
  const inferred = { ...fact('inferred-publish', { effectType: 'publish', destination: 'https://operator-owned.example' }), truth: 'inferred' as const }
  const recommendations = evaluatePersonalControls({ actions: [inferred], controls: [{ actionId: 'inferred-publish', enforcementProven: true } as never] }, profile, '2026-07-16T12:00:00.000Z')
  assert.ok(recommendations.every(item => item.enforcementProven === false))
})

function control(id: string, dimension: string, defaultTier: 'observe' | 'advise' | 'confirm' | 'block', predicates: PersonalControlProfile['controls'][number]['predicates']) {
  return { id, dimension, outcome: 'Bounded outcome.', consequence: 'Bounded consequence.', defaultTier, predicates, expectedEvidence: ['action.observed'], references: { aicm: ['AICM-TEST-01'] } }
}

function fact(id: string, values: Partial<{ effectType: string; destination: string; sensitivity: string; novelty: boolean }>) {
  return { id, actionId: id, ...values, truth: 'observed' as const, verification: 'verified' as const, qualification: 'operational' }
}
