import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHECK_CATALOG,
  projectCheckResult,
  resolveCheckDefinition,
  searchCheckDefinitions,
} from '../check-catalog.ts'
import { evidenceSignals } from '../evidence.ts'
import { evaluateAsset } from '../registry.ts'

const TODAY = '2026-07-23T00:00:00.000Z'

function asset(overrides = {}) {
  return {
    id: 'workflow-provider-fallback',
    name: 'Provider fallback workflow',
    kind: 'workflow',
    format: 'markdown',
    location: 'workflows/provider-fallback.md',
    owner: 'Mira',
    sensitivity: 'internal',
    sharedByDesign: true,
    coverage: [],
    providerDependencies: [
      { provider: 'PrimaryCloud', capability: 'chat' },
    ],
    evidence: [],
    primaryProvider: 'PrimaryCloud',
    fallbackProvider: 'LocalRunner',
    lastSubstitutionDrill: TODAY,
    ...overrides,
  }
}

function registry(assets) {
  return {
    schemaVersion: 2,
    platforms: ['PrimaryCloud', 'LocalRunner'],
    updatedAt: TODAY,
    assets,
  }
}

test('provider fallback starts from a stable definition and exact passing remediation', () => {
  const subject = asset()
  const signal = evaluateAsset(subject, registry([subject]), TODAY)
    .find((item) => item.id.includes(':dep-'))

  assert.ok(signal)
  assert.equal(signal.checkId, 'portability.provider-fallback.v1')
  assert.equal(signal.evaluatedAt, TODAY)

  const definition = resolveCheckDefinition(signal.checkId)
  assert.equal(definition?.id, 'portability.provider-fallback.v1')
  assert.equal(
    definition?.remediation,
    'Record and test an approved fallback for every provider-specific dependency.',
  )

  const result = projectCheckResult(signal, { registryScope: 'registry:test' })
  assert.equal(result.kind, 'cataloged')
  assert.equal(result.definition?.id, definition?.id)
  assert.equal(result.remediation, definition?.remediation)
  assert.equal(result.passCondition, definition?.passCondition)
})

test('the catalog has one unique versioned definition for every emitted deterministic family', () => {
  const governed = asset({
    id: 'findmnemo-governed',
    name: 'FindMnemo governed workflow',
    format: 'proprietary',
    owner: undefined,
    lastReviewed: undefined,
    fallbackProvider: undefined,
    lastSubstitutionDrill: undefined,
    evidenceBindings: [{ source: 'agent-beacon', externalId: 'findmnemo-governed' }],
    actionControl: {
      authority: 'automated-write',
      requiredControls: [],
      confirmation: '',
      reversible: false,
      evidenceNeeds: [],
    },
    stableId: 'findmnemo:governed',
    supportedVersion: '1',
    sourceProduct: 'FindMnemo',
    producingProduct: '',
    consumingProducts: [],
    ontologyCategory: 'object',
    acceptedAsset: {
      decisionRationale: 'Compatibility with MnemoSync is recorded.',
      sourceProvenance: '',
      scope: '',
    },
    candidateTool: {
      sourceUrl: '',
      license: '',
      attributionNotes: '',
      evidenceType: '',
      runtimeRequirements: [],
      dataEgress: 'unknown',
      trustBoundary: '',
      maintenanceStatus: '',
      knownUseConstraints: [],
      dimensions: [],
      supportedChecks: [],
      integrationLevel: 'bundled-dependency',
      disposition: 'deferred',
      dispositionRationale: '',
      assessmentStatus: 'detailed',
    },
  })
  const covered = asset({
    id: 'covered-skill',
    name: 'Covered skill',
    kind: 'skill',
    coverage: [],
    providerDependencies: [],
  })
  const activeRegistry = registry([governed, covered])
  const emitted = [
    ...evaluateAsset(governed, activeRegistry, TODAY),
    ...evaluateAsset(covered, activeRegistry, TODAY),
    ...evidenceSignals(activeRegistry, []),
  ]
  const emittedIds = new Set(emitted.map((signal) => signal.checkId))

  assert.equal(CHECK_CATALOG.length, 20)
  assert.equal(new Set(CHECK_CATALOG.map((definition) => definition.id)).size, CHECK_CATALOG.length)
  assert.deepEqual(
    [...emittedIds].sort(),
    CHECK_CATALOG.map((definition) => definition.id).sort(),
  )
  for (const signal of emitted) {
    assert.ok(signal.checkId)
    assert.equal(resolveCheckDefinition(signal.checkId)?.id, signal.checkId)
    assert.equal(signal.evaluatedAt, signal.checkId === 'evidence.binding-presence.v1'
      ? activeRegistry.updatedAt
      : TODAY)
  }
  for (const definition of CHECK_CATALOG) {
    assert.equal(definition.version, 1)
    assert.match(definition.id, /^[a-z]+(?:[.-][a-z]+)*\.v1$/)
    assert.doesNotMatch(definition.id, /findmnemo-governed|covered-skill|PrimaryCloud|2026/)
  }
})

test('accepted external facts stay uncataloged while only the missing binding evaluator gets a check ID', () => {
  const subject = asset({
    id: 'bound-asset',
    kind: 'skill',
    evidenceBindings: [{ source: 'agent-beacon', externalId: 'bound-external' }],
  })
  const envelope = {
    schemaVersion: 1,
    id: 'a'.repeat(64),
    source: 'agent-beacon',
    evidenceKind: 'workflow-observation',
    observedAt: TODAY,
    importedAt: TODAY,
    subject: {
      externalId: 'bound-external',
      type: 'workflow',
    },
    outcome: 'pass',
    summary: 'Accepted external observation',
    provenance: {
      artifactName: 'accepted.json',
      artifactContentHash: 'b'.repeat(64),
      parserId: 'fixture',
      parserVersion: '1',
      verification: 'verified',
    },
    attributes: {},
  }
  const accepted = evidenceSignals(registry([subject]), [envelope])
  const missing = evidenceSignals(registry([subject]), [])

  assert.equal(accepted.length, 1)
  assert.equal(accepted[0].category, 'recorded-fact')
  assert.equal(accepted[0].checkId, undefined)
  assert.equal(missing.length, 1)
  assert.equal(missing[0].category, 'missing-evidence')
  assert.equal(missing[0].checkId, 'evidence.binding-presence.v1')
})

test('search and result projection use stable fields and never infer a definition from copy', () => {
  assert.deepEqual(
    searchCheckDefinitions('provider dependency').map((definition) => definition.id),
    ['portability.provider-fallback.v1'],
  )

  const subject = asset()
  const original = evaluateAsset(subject, registry([subject]), TODAY)
    .find((signal) => signal.checkId === 'portability.provider-fallback.v1')
  assert.ok(original)

  const rewrittenCopy = {
    ...original,
    condition: 'Completely unrelated condition copy',
    finding: 'Completely unrelated finding copy',
  }
  const cataloged = projectCheckResult(rewrittenCopy, { registryScope: 'registry:test' })
  assert.equal(cataloged.kind, 'cataloged')
  assert.equal(cataloged.definition?.id, 'portability.provider-fallback.v1')
  assert.equal(cataloged.resultDiscriminator, original.id)

  const rewrittenAgain = projectCheckResult({
    ...rewrittenCopy,
    condition: 'A third condition string',
    finding: 'A third finding string',
  }, { registryScope: 'registry:test' })
  assert.equal(rewrittenAgain.resultDiscriminator, cataloged.resultDiscriminator)
  assert.equal(rewrittenAgain.resultKey, cataloged.resultKey)

  const sibling = evaluateAsset({
    ...subject,
    providerDependencies: [
      ...subject.providerDependencies,
      { provider: 'SecondCloud', capability: 'embeddings', fallback: 'LocalRunner' },
    ],
  }, registry([{
    ...subject,
    providerDependencies: [
      ...subject.providerDependencies,
      { provider: 'SecondCloud', capability: 'embeddings', fallback: 'LocalRunner' },
    ],
  }]), TODAY).find((signal) => signal.id.includes('SecondCloud'))
  assert.ok(sibling)
  const siblingResult = projectCheckResult(sibling, { registryScope: 'registry:test' })
  assert.equal(siblingResult.checkId, cataloged.checkId)
  assert.notEqual(siblingResult.resultDiscriminator, cataloged.resultDiscriminator)
  assert.notEqual(siblingResult.resultKey, cataloged.resultKey)

  const copiedKnownTextWithoutId = projectCheckResult({
    ...original,
    checkId: undefined,
    condition: original.condition,
    finding: original.finding,
  }, { registryScope: 'registry:test' })
  assert.equal(copiedKnownTextWithoutId.kind, 'uncataloged')
  assert.equal(copiedKnownTextWithoutId.definition, undefined)
  assert.equal(copiedKnownTextWithoutId.remediation, 'No cataloged remediation contract is available.')

  const unknownId = projectCheckResult({
    ...original,
    checkId: 'source.unknown.v1',
  }, { registryScope: 'registry:test' })
  assert.equal(unknownId.kind, 'uncataloged')
  assert.match(unknownId.belief, /source-qualified observation/)
})
