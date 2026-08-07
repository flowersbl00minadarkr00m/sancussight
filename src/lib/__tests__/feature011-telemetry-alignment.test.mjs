import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PROHIBITED_TELEMETRY_CONTENT_FAMILIES,
  projectTelemetryAlignment,
} from '../telemetry-alignment.ts'

const hex = character => character.repeat(64)

function runtimeEvidence(overrides = {}) {
  return {
    schemaVersion: 1,
    id: hex('a'),
    source: 'runtime-telemetry',
    evidenceKind: 'tool.completed',
    observedAt: '2026-07-24T12:00:00.000Z',
    importedAt: '2026-07-24T12:01:00.000Z',
    subject: {
      externalId: 'accepted-session-reference',
      type: 'agent',
    },
    outcome: 'pass',
    summary: 'Accepted runtime metadata.',
    provenance: {
      artifactName: 'runtime-telemetry.jsonl',
      artifactContentHash: hex('b'),
      sourceRecordId: 'accepted-event-reference',
      parserId: 'runtime-telemetry-jsonl',
      parserVersion: '1.0.0',
      verification: 'not-applicable',
    },
    attributes: {
      runtime: 'codex-cli',
      provider: 'codex-otel',
      transport: 'otlp-http',
      providerVersion: '1.2.3',
      eventType: 'tool.completed',
      durationMs: 42,
      toolName: 'shell',
      approvalState: 'approved',
      outcome: 'succeeded',
    },
    ...overrides,
  }
}

test('accepted runtime evidence becomes fixed profile-qualified metadata rows only', () => {
  const result = projectTelemetryAlignment([runtimeEvidence()])

  assert.equal(result.ok, true)
  assert.equal(result.preview.acceptedCount, 1)
  assert.equal(result.preview.rejectedCount, 0)
  assert.deepEqual(
    result.preview.profiles.map(profile => profile.profileId),
    ['openinference-metadata-preview-1', 'otel-genai-metadata-preview-1'],
  )
  assert.ok(result.preview.rows.length > PROHIBITED_TELEMETRY_CONTENT_FAMILIES.length * 2)
  assert.ok(result.preview.rows.every(row => (
    typeof row.profileId === 'string'
    && typeof row.state === 'string'
    && typeof row.sourceField === 'string'
    && typeof row.targetField === 'string'
    && typeof row.limitation === 'string'
  )))
  assert.ok(result.preview.rows.some(row => (
    row.profileId === 'otel-genai-metadata-preview-1'
    && row.sourceField === 'attributes.eventType'
    && row.targetField === 'gen_ai.operation.name'
    && row.state === 'aligned'
    && row.value === 'tool.completed'
  )))
  assert.ok(result.preview.rows.some(row => (
    row.profileId === 'openinference-metadata-preview-1'
    && row.targetField === 'openinference.span.kind'
    && row.state === 'aligned'
    && row.value === 'TOOL'
  )))
  assert.ok(result.preview.rows.some(row => (
    row.sourceField === 'evidence.id'
    && row.value === `sha256:${hex('a')}`
  )))

  const serialized = JSON.stringify(result)
  for (const raw of [
    'accepted-session-reference',
    'accepted-event-reference',
    'runtime-telemetry.jsonl',
    'Accepted runtime metadata.',
  ]) {
    assert.equal(serialized.includes(raw), false, raw)
  }
  assert.equal(/conformant|certified|otlp payload/i.test(serialized), false)
})

test('prohibited content families are explicit omitted-private rows with no value', () => {
  const result = projectTelemetryAlignment([runtimeEvidence()])
  assert.equal(result.ok, true)

  for (const profileId of [
    'openinference-metadata-preview-1',
    'otel-genai-metadata-preview-1',
  ]) {
    for (const family of PROHIBITED_TELEMETRY_CONTENT_FAMILIES) {
      const row = result.preview.rows.find(candidate => (
        candidate.profileId === profileId
        && candidate.sourceField === `prohibited-content.${family}`
      ))
      assert.ok(row, `${profileId}:${family}`)
      assert.equal(row.state, 'omitted-private')
      assert.equal(Object.hasOwn(row, 'value'), false)
    }
  }

  const privateValue = 'owner@example.com C:\\Users\\owner\\secret.txt'
  const hostile = runtimeEvidence({
    attributes: {
      ...runtimeEvidence().attributes,
      prompt: privateValue,
      'tool.arguments': privateValue,
    },
  })
  const rejected = projectTelemetryAlignment([hostile])
  assert.equal(rejected.ok, true)
  assert.equal(rejected.preview.acceptedCount, 0)
  assert.equal(rejected.preview.rejectedCount, 1)
  assert.equal(JSON.stringify(rejected).includes(privateValue), false)
})

test('unknown profiles fail closed and empty or unsupported input stays explicit', () => {
  const unknown = projectTelemetryAlignment(
    [runtimeEvidence()],
    ['otel-genai-metadata-preview-1', 'unknown-profile'],
  )
  assert.deepEqual(unknown, {
    ok: false,
    errorCode: 'unsupported-profile',
  })

  const noRuntime = projectTelemetryAlignment([{
    ...runtimeEvidence(),
    source: 'praxen',
  }])
  assert.equal(noRuntime.ok, true)
  assert.equal(noRuntime.preview.acceptedCount, 0)
  assert.equal(noRuntime.preview.rejectedCount, 1)
  assert.ok(noRuntime.preview.rows.some(row => row.state === 'missing'))

  const unknownOperation = projectTelemetryAlignment([runtimeEvidence({
    attributes: {
      ...runtimeEvidence().attributes,
      eventType: 'vendor.private-operation',
      toolName: undefined,
    },
  })])
  assert.equal(unknownOperation.ok, true)
  assert.ok(unknownOperation.preview.rows.some(row => (
    row.sourceField === 'attributes.eventType'
    && row.state === 'unsupported'
    && !Object.hasOwn(row, 'value')
  )))
})

test('alignment is deterministic, stable-sorted, and copy-independent', () => {
  const firstInput = runtimeEvidence()
  const secondInput = runtimeEvidence({
    id: hex('c'),
    attributes: {
      ...runtimeEvidence().attributes,
      runtime: 'pi',
      provider: 'pi-extension',
      transport: 'jsonl',
      eventType: 'agent.ended',
      toolName: undefined,
    },
  })
  const first = projectTelemetryAlignment([firstInput, secondInput])
  const second = projectTelemetryAlignment([secondInput, firstInput])

  assert.deepEqual(first, second)
  firstInput.attributes.runtime = 'claude-code'
  firstInput.attributes.provider = 'claude-otel'
  assert.equal(JSON.stringify(first).includes('claude-code'), false)

  const returned = first.preview.rows.find(row => Object.hasOwn(row, 'value'))
  returned.value = 'mutated'
  const fresh = projectTelemetryAlignment([runtimeEvidence(), secondInput])
  assert.equal(JSON.stringify(fresh).includes('"mutated"'), false)
})
