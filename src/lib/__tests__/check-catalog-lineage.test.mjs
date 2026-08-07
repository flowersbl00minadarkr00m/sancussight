import assert from 'node:assert/strict'
import test from 'node:test'

import { projectCheckResult } from '../check-catalog.ts'
import { buildClaimLineage } from '../claim-lineage.ts'
import { evaluateAsset } from '../registry.ts'

const TODAY = '2026-07-23'

function workflow(overrides = {}) {
  return {
    id: 'workflow-a',
    name: 'Workflow A',
    kind: 'workflow',
    format: 'markdown',
    location: 'registry/workflow-a.md',
    owner: 'Mira',
    sensitivity: 'internal',
    lastReviewed: TODAY,
    sharedByDesign: true,
    coverage: [],
    providerDependencies: [],
    evidence: [],
    primaryProvider: 'Provider A',
    ...overrides,
  }
}

function registry(asset) {
  return {
    schemaVersion: 2,
    platforms: ['Provider A', 'Provider B'],
    updatedAt: TODAY,
    assets: [asset],
  }
}

test('provider fallback uses the approved stable rule and remediation', () => {
  const asset = workflow()
  const signal = evaluateAsset(asset, registry(asset), TODAY)
    .find((candidate) => candidate.id === `${asset.id}:concentration`)

  assert.ok(signal)
  assert.equal(signal.checkId, 'continuity.workflow-fallback.v1')
  assert.equal(signal.evaluatedAt, TODAY)

  const result = projectCheckResult(signal, { registryScope: 'fixture' })
  assert.equal(result.kind, 'cataloged')
  assert.equal(result.definition.id, 'continuity.workflow-fallback.v1')
  assert.equal(result.remediation, 'Approve and record a fallback provider, then verify the workflow can use it.')

  const lineage = buildClaimLineage(result, { asset })
  assert.deepEqual(lineage.nodes.map((node) => node.kind), ['target', 'evidence', 'contract', 'claim'])
  assert.ok(lineage.edges.every((edge) => edge.state === 'verified'))
})
