import assert from 'node:assert/strict'
import test from 'node:test'
import { contentHash, createEvidenceEnvelope } from '../envelope.ts'
import { APPROVED_RELEASE_RUNTIMES, calculateReleaseGate, evidenceQualification, isOperationalEvidence, RELEASE_RUN_WINDOW_MS, releaseEvidenceRecords, validateReleaseEvidenceManifest } from '../../src/lib/release-gate.ts'
import type { EvidenceEnvelopeV1, ReleaseEvidenceSourceId, ReleaseEvidenceManifestV1 } from '../../src/types.ts'
import { RELEASE_EVIDENCE_SOURCE_IDS, REQUIRED_RELEASE_FAILURE_CASES } from '../../src/types.ts'

const RUN_ID = 'release-run-001'
const TARGET = 'operator-owned-loopback'
const NOW = '2026-07-16T12:00:00.000Z'

test('amended runtime gate requires Codex CLI, Claude Code, and Pi', () => {
  assert.deepEqual(APPROVED_RELEASE_RUNTIMES, ['codex-cli', 'claude-code', 'pi'])
})

test('legacy evidence remains compatible but non-operational', () => {
  const legacy = createEvidenceEnvelope({
    source: 'agent-beacon', evidenceKind: 'runtime-event', observedAt: NOW, importedAt: NOW,
    subject: { externalId: 'legacy-session', type: 'agent' }, outcome: 'observed', summary: 'Legacy event.',
    provenance: { artifactName: 'runtime.jsonl', artifactContentHash: contentHash('legacy'), parserId: 'beacon', parserVersion: '1.0.0', verification: 'not-applicable' },
  })
  assert.equal(evidenceQualification(legacy), 'manual')
  assert.equal(isOperationalEvidence(legacy), false)
  assert.equal(isOperationalEvidence(legacy, RUN_ID), false)
})

test('complete manifest requires all five operational categories and three runtime sessions', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  const result = calculateReleaseGate(manifest, evidence, NOW)

  assert.equal(result.ready, true)
  assert.equal(result.status, 'passed')
  assert.deepEqual(result.runtimeCoverage, ['codex-cli', 'claude-code', 'pi'])
  assert.deepEqual(Object.keys(result.sources).sort(), [...RELEASE_EVIDENCE_SOURCE_IDS].sort())
  assert.deepEqual(result.blockers, [])
})

test('wrong target and unavailable Pipelock verification block independently', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  const pipelock = evidence.find((item) => item.source === 'pipelock')!
  const wrongTarget = { ...pipelock, operational: { ...pipelock.operational!, targetId: 'unexpected-target' } }
  const unavailable = {
    ...pipelock,
    id: 'f'.repeat(64),
    provenance: { ...pipelock.provenance, verification: 'unavailable' as const },
  }
  manifest.sources.pipelock.evidenceIds = [wrongTarget.id, unavailable.id]
  const result = calculateReleaseGate(manifest, [...evidence.filter((item) => item !== pipelock), wrongTarget, unavailable], NOW)
  assert.equal(result.ready, false)
  assert.ok(result.blockers.includes('pipelock:target-mismatch'))
  assert.ok(result.blockers.includes('pipelock:untrusted-verification'))
})

test('a disabled Pi extension blocks only Pi runtime coverage', () => {
  const evidence = createOperationalEvidence().filter(item => item.operational?.runtime !== 'pi')
  const manifest = createManifest(evidence)
  const result = calculateReleaseGate(manifest, evidence, NOW)
  assert.equal(result.ready, false)
  assert.ok(result.blockers.includes('runtime-telemetry:runtime-missing:pi'))
  assert.equal(result.sources.praxen.state, 'current')
  assert.equal(result.sources.pipelock.state, 'current')
})

test('each required runtime must be individually fresh', () => {
  const later = new Date(Date.parse(NOW) + 60_000).toISOString()
  const evidence = createOperationalEvidence().map((item) => item.operational?.runtime === 'codex-cli'
    ? item
    : { ...item, observedAt: later })
  const manifest = createManifest(evidence)
  const outside = new Date(Date.parse(NOW) + RELEASE_RUN_WINDOW_MS + 1).toISOString()
  const result = calculateReleaseGate(manifest, evidence, outside)

  assert.equal(result.ready, false)
  assert.ok(result.blockers.includes('runtime-telemetry:runtime-stale:codex-cli'))
  assert.equal(result.sources.praxen.state, 'current')
})

test('existing Agent Beacon operational envelopes satisfy their runtime without relabeling', () => {
  const original = createOperationalEvidence()
  const codex = original.find(item => item.operational?.runtime === 'codex-cli')!
  const beacon = createEvidenceEnvelope({
    source: 'agent-beacon', evidenceKind: codex.evidenceKind, observedAt: codex.observedAt, importedAt: codex.importedAt,
    subject: codex.subject, outcome: codex.outcome, summary: 'Existing Agent Beacon operational evidence.',
    provenance: { ...codex.provenance, artifactName: 'runtime.jsonl', parserId: 'agent-beacon-jsonl' },
    operational: { ...codex.operational!, telemetryProvider: 'agent-beacon', telemetryTransport: 'jsonl', telemetryProviderVersion: '1.0.1' },
  })
  const evidence = original.filter(item => item.id !== codex.id).concat(beacon)
  const result = calculateReleaseGate(createManifest(evidence), evidence, NOW)
  assert.equal(result.ready, true)
  assert.equal(evidence.find(item => item.id === beacon.id)?.source, 'agent-beacon')
})

test('Praxen Worker Remit hash is an explicit qualification boundary', () => {
  const evidence = createOperationalEvidence().map((item) => item.source === 'praxen'
    ? { ...item, operational: { ...item.operational!, workerRemitHash: 'b'.repeat(64) } }
    : item)
  const manifest = createManifest(evidence)
  manifest.sources.praxen.workerRemitHash = 'c'.repeat(64)
  const result = calculateReleaseGate(manifest, evidence, NOW)
  assert.equal(result.ready, false)
  assert.ok(result.blockers.includes('praxen:worker-remit-mismatch'))
})

test('RAMPART unsafe, undetermined, and error outcomes cannot satisfy the gate', () => {
  for (const outcome of ['fail', 'warn'] as const) {
    const evidence = createOperationalEvidence().map((item) => item.source === 'rampart'
      ? { ...item, outcome, attributes: { status: outcome === 'fail' ? 'error' : 'undetermined' } }
      : item)
    const result = calculateReleaseGate(createManifest(evidence), evidence, NOW)
    assert.equal(result.ready, false)
    assert.ok(result.blockers.includes('rampart:non-passing-result'))
  }
})

test('paired Praxen targets with unequal timestamps qualify independently', () => {
  const evidence = createOperationalEvidence()
  const original = evidence.find((item) => item.source === 'praxen')!
  const earlier = new Date(Date.parse(NOW) - 60_000).toISOString()
  const workflow = {
    ...original,
    id: 'e'.repeat(64),
    observedAt: earlier,
    subject: { ...original.subject, externalId: 'sdd-exec' },
    operational: { ...original.operational!, targetId: 'sdd-exec', workerRemitHash: 'd'.repeat(64) },
  }
  const sancussight = {
    ...original,
    operational: { ...original.operational!, targetId: 'sancussight', workerRemitHash: 'b'.repeat(64) },
  }
  const manifest = createManifest(evidence)
  manifest.sources.praxen.targetId = 'sancussight'
  manifest.sources.praxen.targetIds = ['sancussight', 'sdd-exec']
  manifest.sources.praxen.workerRemitHash = 'b'.repeat(64)
  manifest.sources.praxen.workerRemitHashes = ['b'.repeat(64), 'd'.repeat(64)]
  manifest.sources.praxen.evidenceIds = [sancussight.id, workflow.id]
  manifest.sources.praxen.latestObservedAt = NOW
  manifest.sources.praxen.requiredTargets = [
    { targetId: 'sancussight', evidenceIds: [sancussight.id], latestObservedAt: NOW, workerRemitHash: 'b'.repeat(64) },
    { targetId: 'sdd-exec', evidenceIds: [workflow.id], latestObservedAt: earlier, workerRemitHash: 'd'.repeat(64) },
  ]
  manifest.startedAt = earlier

  const accepted = calculateReleaseGate(manifest, [...evidence.filter((item) => item !== original), sancussight, workflow], NOW)
  assert.equal(accepted.sources.praxen.state, 'current')
  assert.equal(accepted.sources.praxen.operational, true)
  assert.deepEqual(accepted.sources.praxen.targets?.map((target) => [target.targetId, target.latestObservedAt]), [
    ['sancussight', NOW],
    ['sdd-exec', earlier],
  ])

  const contradictory = structuredClone(manifest)
  contradictory.sources.praxen.targetIds = ['sancussight']
  assert.ok(validateReleaseEvidenceManifest(contradictory).errors.includes('praxen:required-target-id-summary'))

  const missing = calculateReleaseGate(manifest, [...evidence.filter((item) => item !== original), sancussight], NOW)
  assert.ok(missing.blockers.includes('praxen:target-missing:sdd-exec'))

  const wrongRemit = { ...workflow, operational: { ...workflow.operational, workerRemitHash: 'f'.repeat(64) } }
  const incompatible = calculateReleaseGate(manifest, [...evidence.filter((item) => item !== original), sancussight, wrongRemit], NOW)
  assert.ok(incompatible.blockers.includes('praxen:target-worker-remit-mismatch:sdd-exec'))
})

test('a previously passed manifest fails closed after the shared run boundary', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  manifest.status = 'passed'
  const result = calculateReleaseGate(manifest, evidence, new Date(Date.parse(NOW) + RELEASE_RUN_WINDOW_MS + 1).toISOString())
  assert.equal(result.ready, false)
  assert.equal(result.status, 'blocked')
  assert.ok(result.blockers.includes('runtime-telemetry:stale-evidence'))
  assert.ok(result.blockers.includes('manifest:orchestration-window-exceeded'))
})

test('orchestration window allows exactly thirty minutes but rejects an overrun', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  manifest.completedAt = new Date(Date.parse(NOW) + RELEASE_RUN_WINDOW_MS).toISOString()
  const exact = calculateReleaseGate(manifest, evidence, manifest.completedAt)
  assert.equal(exact.blockers.includes('manifest:orchestration-window-exceeded'), false)
  assert.equal(exact.ready, true)

  manifest.completedAt = new Date(Date.parse(NOW) + RELEASE_RUN_WINDOW_MS + 1).toISOString()
  const overrun = calculateReleaseGate(manifest, evidence, manifest.completedAt)
  assert.ok(overrun.blockers.includes('manifest:orchestration-window-exceeded'))
})

test('producer observedAt is authoritative for pre-run and future evidence', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  const runtime = evidence.find((item) => item.operational?.runtime === 'codex-cli')!
  const importedNow = { ...runtime, observedAt: new Date(Date.parse(NOW) - 1).toISOString(), importedAt: NOW }
  const preRunEvidence = evidence.map((item) => item === runtime ? importedNow : item)
  const preRun = calculateReleaseGate(createManifest(preRunEvidence), preRunEvidence, NOW)
  assert.ok(preRun.blockers.includes('runtime-telemetry:pre-run-evidence'))

  const future = { ...runtime, observedAt: new Date(Date.parse(NOW) + 1).toISOString(), importedAt: NOW }
  const futureEvidence = evidence.map((item) => item === runtime ? future : item)
  const futureResult = calculateReleaseGate(createManifest(futureEvidence), futureEvidence, NOW)
  assert.ok(futureResult.blockers.includes('runtime-telemetry:future-evidence'))
})

test('legacy multi-target manifests remain readable but cannot qualify A-002', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  manifest.sources.praxen.targetIds = ['sancussight', 'sdd-exec']
  manifest.sources.praxen.workerRemitHashes = ['b'.repeat(64), 'd'.repeat(64)]
  assert.ok(validateReleaseEvidenceManifest(manifest).errors.includes('praxen:ambiguous-legacy-multi-target'))
  assert.equal(calculateReleaseGate(manifest, evidence, NOW).ready, false)
})

test('release presentation resolves only records referenced by the manifest', () => {
  const selected = createOperationalEvidence()[0]
  const unrelated = { ...selected, id: 'f'.repeat(64), observedAt: '2026-07-16T12:04:59.000Z', operational: { ...selected.operational!, runId: 'another-run' } }
  const manifest = createManifest([selected])
  manifest.sources['runtime-telemetry'].evidenceIds = [selected.id]
  assert.deepEqual(releaseEvidenceRecords(manifest, [unrelated, selected], 'runtime-telemetry').map((item) => item.id), [selected.id])
})

test('manifest validation rejects an incomplete source set and missing failure rows', () => {
  const evidence = createOperationalEvidence()
  const manifest = createManifest(evidence)
  delete (manifest.sources as Partial<typeof manifest.sources>).aimap
  delete manifest.failureCases[REQUIRED_RELEASE_FAILURE_CASES[0]]
  const validation = validateReleaseEvidenceManifest(manifest)
  assert.equal(validation.valid, false)
  assert.ok(validation.errors.includes('manifest:source-set'))
  assert.ok(validation.errors.includes(`aimap:manifest-entry`))
  assert.ok(validation.errors.includes(`failure:${REQUIRED_RELEASE_FAILURE_CASES[0]}`))
})

function createOperationalEvidence(): EvidenceEnvelopeV1[] {
  const records: EvidenceEnvelopeV1[] = []
  for (const source of RELEASE_EVIDENCE_SOURCE_IDS) {
    const runtimes = source === 'runtime-telemetry' ? ['codex-cli', 'claude-code', 'pi'] as const : [undefined]
    for (const runtime of runtimes) {
      const raw = `${source}:${runtime ?? 'single'}`
      records.push(createEvidenceEnvelope({
        source, evidenceKind: `${source}-evidence`, observedAt: NOW, importedAt: NOW,
        subject: { externalId: `${source}-target`, type: source === 'runtime-telemetry' ? 'agent' : 'workflow' },
        outcome: source === 'rampart' ? 'pass' : 'observed', summary: `${source} evidence observed.`,
        provenance: {
          artifactName: `${source}.json`, artifactContentHash: contentHash(raw), sourceRecordId: raw,
          parserId: `${source}-parser`, parserVersion: '1.0.0',
          verification: source === 'pipelock' ? 'verified' : 'not-applicable',
        },
        operational: {
          qualification: 'operational', sourceVersion: '1.0.0', runId: RUN_ID,
          targetId: TARGET, contractVersion: '1.0.0', ...(runtime ? { runtime } : {}),
        },
      }))
    }
  }
  return records
}

function createManifest(evidence: readonly EvidenceEnvelopeV1[]): ReleaseEvidenceManifestV1 {
  return {
    schemaVersion: 1, releaseRunId: RUN_ID, startedAt: NOW, runtimes: ['codex-cli', 'claude-code', 'pi'], status: 'in-progress', untestedBoundaries: [],
    sources: Object.fromEntries(RELEASE_EVIDENCE_SOURCE_IDS.map((source) => [source, {
      version: '1.0.0', targetId: TARGET, contractVersion: '1.0.0',
      evidenceIds: evidence.filter((item) => source === 'runtime-telemetry' ? item.source === source || item.source === 'agent-beacon' : item.source === source).map((item) => item.id),
      verification: source === 'pipelock' ? 'verified' : 'not-applicable', operational: true,
    }])) as Record<ReleaseEvidenceSourceId, ReleaseEvidenceManifestV1['sources'][ReleaseEvidenceSourceId]>,
    failureCases: Object.fromEntries(REQUIRED_RELEASE_FAILURE_CASES.map((failureCase) => [failureCase, 'passed'])),
  }
}
