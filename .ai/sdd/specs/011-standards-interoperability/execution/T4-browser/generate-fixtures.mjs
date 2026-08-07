import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildExitDrillEvidencePacket } from '../../../../../../src/lib/evidence-packet.ts'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const schemaURL = 'https://openlineage.io/spec/1-0-5/OpenLineage.json#/definitions/RunEvent'
const sha256 = async input => createHash('sha256').update(input).digest('hex')
const hex = character => character.repeat(64)

function openLineageEvent(overrides = {}) {
  return {
    eventTime: '2026-07-24T12:34:56.789+00:00',
    eventType: 'COMPLETE',
    run: { runId: '0176a8c2-fe01-7439-87e6-56a1a1b4029f' },
    job: {
      namespace: 'synthetic-private-job-namespace',
      name: 'synthetic-private-job-name',
    },
    inputs: [{
      namespace: 'synthetic-private-input-namespace',
      name: 'synthetic-private-input-name',
    }],
    outputs: [{
      namespace: 'synthetic-private-output-namespace',
      name: 'synthetic-private-output-name',
    }],
    producer: 'https://synthetic-user:synthetic-password@producer.example/client',
    schemaURL,
    ...overrides,
  }
}

const safeEvent = openLineageEvent({
  producer: 'https://producer.example/synthetic-client',
})
const facetSecret = 'synthetic-facet-secret-owner@example.com-C:\\Users\\synthetic\\secret.txt'
const facetEvent = openLineageEvent({
  eventTime: '2026-07-24T12:35:00Z',
  producer: 'https://producer.example/synthetic-client',
  run: {
    ...safeEvent.run,
    facets: { hostile: { prompt: facetSecret } },
  },
  job: {
    ...safeEvent.job,
    facets: { sourceCode: { location: facetSecret } },
  },
  inputs: [{
    ...safeEvent.inputs[0],
    facets: { schema: { fields: [{ name: facetSecret }] } },
  }],
  outputs: [{
    ...safeEvent.outputs[0],
    facets: { dataQuality: { assertion: facetSecret } },
  }],
})

const validPacket = await buildExitDrillEvidencePacket({
  result: {
    workflowId: 'synthetic-private-workflow-id',
    workflowName: 'Synthetic private workflow',
    targetPlatform: 'Codex',
    verdict: 'survives',
    items: [{
      assetId: 'synthetic-private-asset-id',
      assetName: 'Synthetic private asset',
      status: 'ok',
      note: 'Synthetic private note.',
    }],
  },
  exportedAt: '2026-07-24T12:00:00.000Z',
  observedAt: '2026-07-24T11:59:00.000Z',
  sourceRefHashes: [hex('a')],
  missingEvidence: [{ kind: 'external-verification' }],
}, sha256)
const tamperedPacket = structuredClone(validPacket)
tamperedPacket.qualification = 'verified-by-someone'

const runtimeEvidence = {
  schemaVersion: 1,
  id: hex('a'),
  source: 'runtime-telemetry',
  evidenceKind: 'tool.completed',
  observedAt: '2026-07-24T12:00:00.000Z',
  importedAt: '2026-07-24T12:01:00.000Z',
  subject: {
    externalId: 'synthetic-accepted-session-reference',
    type: 'agent',
  },
  outcome: 'pass',
  summary: 'Synthetic accepted runtime metadata.',
  provenance: {
    artifactName: 'synthetic-runtime-telemetry.jsonl',
    artifactContentHash: hex('b'),
    sourceRecordId: 'synthetic-accepted-event-reference',
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
}

const files = new Map([
  ['synthetic-openlineage-safe.json', `${JSON.stringify(safeEvent, null, 2)}\n`],
  ['synthetic-openlineage-safe.jsonl', [
    JSON.stringify({ ...safeEvent, eventType: 'START' }),
    JSON.stringify(safeEvent),
  ].join('\n') + '\n'],
  ['synthetic-openlineage-mixed.jsonl', [
    JSON.stringify({ ...safeEvent, eventType: 'START' }),
    JSON.stringify(facetEvent),
    '{"malformed"',
    JSON.stringify({
      ...safeEvent,
      schemaURL: 'https://example.test/unknown-schema',
    }),
    JSON.stringify({ ...safeEvent, eventType: 'PAUSED' }),
  ].join('\n') + '\n'],
  ['synthetic-runtime-evidence.json', `${JSON.stringify({
    schemaVersion: 1,
    exportedAt: '2026-07-24T12:02:00.000Z',
    evidence: [runtimeEvidence],
  }, null, 2)}\n`],
  ['synthetic-valid-evidence-packet.json', `${JSON.stringify(validPacket, null, 2)}\n`],
  ['synthetic-tampered-evidence-packet.json', `${JSON.stringify(tamperedPacket, null, 2)}\n`],
])

await mkdir(outputDirectory, { recursive: true })
for (const [name, body] of files) {
  await writeFile(new URL(name, import.meta.url), body, 'utf8')
}

console.log(`Generated ${files.size} explicitly synthetic Feature 011 browser fixtures.`)
