import assert from 'node:assert/strict'
import test from 'node:test'
import { createEvidenceEnvelope } from '../envelope.ts'
import { selectCanonicalTargetEvidence } from '../../src/lib/release-evidence-selection.ts'

const RUN = 'a002-selection-run'

test('selects complete canonical groups independently and deterministically', () => {
  const records = [
    record('a'.repeat(64), 'sancussight', '2026-07-21T12:00:00Z', 'b'.repeat(64), '1'.repeat(64)),
    record('b'.repeat(64), 'sancussight', '2026-07-21T12:00:00Z', 'b'.repeat(64), '1'.repeat(64)),
    record('c'.repeat(64), 'sancussight', '2026-07-21T12:00:00Z', 'a'.repeat(64), '1'.repeat(64)),
    record('d'.repeat(64), 'sdd-exec', '2026-07-21T11:58:00Z', 'c'.repeat(64), '2'.repeat(64)),
    record('e'.repeat(64), 'unapproved', '2026-07-21T12:01:00Z', 'a'.repeat(64)),
  ]
  const result = selectCanonicalTargetEvidence({
    source: 'praxen', evidence: records, releaseRunId: RUN,
    requiredTargets: [
      { targetId: 'sancussight', workerRemitHash: '1'.repeat(64) },
      { targetId: 'sdd-exec', workerRemitHash: '2'.repeat(64) },
    ],
  })
  assert.deepEqual(result.records.map((item) => item.id), ['c'.repeat(64), 'd'.repeat(64)])
  assert.deepEqual(result.requiredTargets.map((target) => target.targetId), ['sancussight', 'sdd-exec'])
})

test('fails closed for a missing target or remit mismatch', () => {
  const evidence = [record('a'.repeat(64), 'sancussight', '2026-07-21T12:00:00Z', 'a'.repeat(64), '1'.repeat(64))]
  assert.throws(() => selectCanonicalTargetEvidence({
    source: 'praxen', evidence, releaseRunId: RUN,
    requiredTargets: [{ targetId: 'sancussight', workerRemitHash: '2'.repeat(64) }],
  }), /praxen:target-missing:sancussight/)
})

function record(id: string, targetId: string, observedAt: string, artifactContentHash: string, workerRemitHash?: string) {
  return { ...createEvidenceEnvelope({
    source: 'praxen', evidenceKind: 'finding', observedAt, importedAt: observedAt,
    subject: { externalId: targetId, type: 'workflow' }, outcome: 'observed', summary: 'bounded',
    provenance: { artifactName: 'report.json', artifactContentHash, parserId: 'praxen', parserVersion: '1.0.0', verification: 'not-applicable' },
    operational: { qualification: 'operational', sourceVersion: '1.1.0', runId: RUN, targetId, contractVersion: '2.0.0', ...(workerRemitHash ? { workerRemitHash } : {}) },
  }), id }
}
