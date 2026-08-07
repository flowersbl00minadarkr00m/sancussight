import assert from 'node:assert/strict'
import test from 'node:test'

import { projectCheckResult } from '../check-catalog.ts'
import { buildClaimLineage } from '../claim-lineage.ts'
import { evidenceSignals } from '../evidence.ts'
import { evaluateAsset } from '../registry.ts'

const TODAY = '2026-07-23T00:00:00.000Z'

function asset(overrides = {}) {
  return {
    id: 'lineage-asset',
    name: 'Lineage asset',
    kind: 'workflow',
    format: 'markdown',
    location: 'workflows/lineage.md',
    owner: 'Mira',
    sensitivity: 'internal',
    lastReviewed: TODAY,
    sharedByDesign: true,
    coverage: [],
    providerDependencies: [
      { provider: 'PrimaryCloud', capability: 'chat', fallback: 'LocalRunner' },
    ],
    evidence: [],
    primaryProvider: 'PrimaryCloud',
    fallbackProvider: 'LocalRunner',
    lastSubstitutionDrill: TODAY,
    ...overrides,
  }
}

function registry(subject) {
  return {
    schemaVersion: 2,
    platforms: ['PrimaryCloud', 'LocalRunner'],
    updatedAt: TODAY,
    assets: [subject],
  }
}

function providerResult(subject = asset(), context = {}) {
  const signal = evaluateAsset(subject, registry(subject), TODAY)
    .find((item) => item.checkId === 'portability.provider-fallback.v1')
  assert.ok(signal)
  return projectCheckResult(signal, {
    registryScope: 'registry:lineage',
    ...context,
  })
}

function envelope(idCharacter, outcome, overrides = {}) {
  return {
    schemaVersion: 1,
    id: idCharacter.repeat(64),
    source: 'agent-beacon',
    evidenceKind: 'provider-fallback-observation',
    observedAt: TODAY,
    importedAt: TODAY,
    subject: {
      stableId: 'stable:lineage-asset',
      externalId: 'lineage-asset',
      type: 'workflow',
    },
    outcome,
    summary: `${outcome} observation`,
    provenance: {
      artifactName: `${idCharacter}.json`,
      artifactContentHash: idCharacter.repeat(64),
      parserId: 'fixture',
      parserVersion: '1',
      verification: 'verified',
    },
    operational: {
      qualification: 'operational',
      sourceVersion: '1',
      runId: 'run-009',
      targetId: 'lineage-asset',
      contractVersion: 'contract-1',
    },
    attributes: {},
    ...overrides,
  }
}

test('missing evidence produces a typed node, missing edges, and an explicit gap', () => {
  const subject = asset({
    evidenceBindings: [{ source: 'agent-beacon', externalId: 'lineage-asset' }],
  })
  const signal = evidenceSignals(registry(subject), [])[0]
  const result = projectCheckResult(signal, { registryScope: 'registry:lineage' })
  const lineage = buildClaimLineage(result, { asset: subject })

  assert.equal(result.kind, 'cataloged')
  assert.ok(lineage.nodes.some((node) => node.truthClass === 'missing-evidence'))
  assert.ok(lineage.edges.some((edge) => edge.state === 'missing'))
  assert.deepEqual(lineage.gaps.map((gap) => gap.state), ['missing'])
})

test('narrative-only and stale evidence remain qualified rather than verified', () => {
  const subject = asset()
  const inferred = buildClaimLineage(providerResult(subject), {
    asset: subject,
    narrativeOnly: true,
  })
  assert.ok(inferred.edges.some((edge) => edge.state === 'inferred'))
  assert.ok(inferred.gaps.some((gap) => gap.state === 'inferred'))

  const staleEnvelope = envelope('b', 'pass')
  const stale = buildClaimLineage(providerResult(subject, {
    safeEvidence: [{
      label: 'Retained source evidence',
      reference: staleEnvelope.id,
      sourceHealth: 'stale',
    }],
  }), {
    asset: subject,
    evidence: [staleEnvelope],
  })
  assert.ok(stale.edges.some((edge) => edge.state === 'stale'))
  assert.ok(stale.edges.some((edge) => edge.state === 'verified'))
})

test('unrelated same-asset envelopes and asset evidence bindings never qualify a result lineage', () => {
  const subject = asset({
    stableId: 'stable:lineage-asset',
    evidenceBindings: [{ source: 'agent-beacon', externalId: 'lineage-asset' }],
  })
  const unrelated = envelope('a', 'fail')
  const result = providerResult(subject)
  const lineage = buildClaimLineage(result, {
    asset: subject,
    evidence: [unrelated],
    sources: [{
      id: 'agent-beacon',
      displayName: 'Agent Beacon',
      evidenceType: 'workflow observation',
      health: 'stale',
      rejectedCount: 0,
    }],
  })

  assert.equal(lineage.nodes.some((node) => node.reference === unrelated.id), false)
  assert.equal(lineage.nodes.some((node) => node.id === `evidence:${unrelated.id}`), false)
  assert.equal(lineage.edges.some((edge) => edge.from === `evidence:${unrelated.id}`), false)
  assert.equal(lineage.edges.some((edge) => edge.state === 'stale'), false)
  assert.equal(lineage.edges.some((edge) => edge.state === 'conflicting'), false)
})

test('conflicting accepted observations are bounded and preserve every applicable node kind', () => {
  const subject = asset({
    stableId: 'stable:lineage-asset',
    evidenceBindings: [{ source: 'agent-beacon', externalId: 'lineage-asset' }],
  })
  const pass = envelope('c', 'pass')
  const fail = envelope('d', 'fail', { observedAt: '2026-07-22T00:00:00.000Z' })
  const result = providerResult(subject, {
    safeEvidence: [
      { label: 'Pass observation', reference: pass.id },
      { label: 'Fail observation', reference: fail.id },
    ],
  })
  const lineage = buildClaimLineage(result, {
    asset: subject,
    evidence: [pass, fail, envelope('e', 'warn')],
    sources: [{
      id: 'agent-beacon',
      displayName: 'Agent Beacon',
      evidenceType: 'workflow observation',
      health: 'current',
      rejectedCount: 0,
    }],
    decision: {
      id: 'decision-009',
      label: 'Operator accepted the bounded response.',
    },
  })

  assert.deepEqual(lineage.nodes.map((node) => node.kind), [
    'target',
    'evidence',
    'evidence',
    'producer',
    'run',
    'contract',
    'claim',
    'decision',
  ])
  assert.equal(lineage.bounded, true)
  assert.equal(lineage.maxNodes, 8)
  assert.equal(lineage.nodes.length, 8)
  assert.equal(lineage.nodes.filter((node) => node.kind === 'evidence').length, 2)
  assert.deepEqual(
    lineage.edges
      .filter((edge) => edge.from === 'target:lineage-asset')
      .map((edge) => edge.to),
    [`evidence:${pass.id}`, `evidence:${fail.id}`],
  )
  assert.ok(lineage.edges.some((edge) => edge.state === 'conflicting'))
  assert.ok(lineage.gaps.some((gap) => gap.state === 'conflicting'))
  assert.match(lineage.edges[0].explanation, /incompatible claims/)
})

test('verified binding language does not overclaim external truth', () => {
  const lineage = buildClaimLineage(providerResult(), { asset: asset() })
  assert.deepEqual(lineage.nodes.map((node) => node.kind), [
    'target',
    'evidence',
    'contract',
    'claim',
  ])
  assert.ok(lineage.edges.every((edge) => edge.state === 'verified'))
  assert.ok(lineage.edges.every((edge) => /does not independently prove/.test(edge.explanation)))
})

test('uncataloged observations receive no invented rule, edge, or remediation contract', () => {
  const result = projectCheckResult({
    id: 'external:observation',
    dimension: 'evidence',
    assetId: 'lineage-asset',
    assetName: 'Lineage asset',
    status: 'unknown',
    condition: 'Source condition',
    finding: 'Source observation',
    evidence: 'Source-qualified evidence',
    owner: 'Mira',
    category: 'recorded-fact',
  }, { registryScope: 'registry:lineage' })
  const lineage = buildClaimLineage(result)

  assert.equal(result.kind, 'uncataloged')
  assert.deepEqual(lineage.nodes, [])
  assert.deepEqual(lineage.edges, [])
  assert.equal(lineage.gaps[0].kind, 'contract')
  assert.match(lineage.gaps[0].explanation, /no rule or lineage edge is invented/)
})
