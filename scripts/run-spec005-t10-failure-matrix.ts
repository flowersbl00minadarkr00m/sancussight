import assert from 'node:assert/strict'
import { appendFile, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { EvidenceEnvelopeV1, EvidenceSourceId, ReleaseEvidenceManifestV1, ReleaseEvidenceSourceId } from '../src/types.ts'
import { RELEASE_EVIDENCE_SOURCE_IDS, REQUIRED_RELEASE_FAILURE_CASES } from '../src/types.ts'
import { calculateReleaseGate } from '../src/lib/release-gate.ts'
import {
  assertDescriptorEnvironment,
  bindReleaseRunDescriptor,
  descriptorRunRoot,
} from '../src/lib/release-run-descriptor.ts'
import { AIMapAdapter } from '../collector/adapters/aimap.ts'
import { PipelockAdapter } from '../collector/adapters/pipelock.ts'
import { PraxenAdapter } from '../collector/adapters/praxen.ts'
import { RampartAdapter } from '../collector/adapters/rampart.ts'
import { RuntimeTelemetryAdapter } from '../collector/adapters/runtime-telemetry.ts'
import type { EvidenceAdapter } from '../collector/adapters/types.ts'
import { CollectorConfigStore } from '../collector/config-store.ts'
import { contentHash, createEvidenceEnvelope } from '../collector/envelope.ts'
import { EvidenceStore } from '../collector/evidence-store.ts'
import { LocalCollectorService } from '../collector/main.ts'

const releaseDescriptor = bindReleaseRunDescriptor()
assertDescriptorEnvironment(releaseDescriptor)
const runId = releaseDescriptor.releaseRunId
const observedAt = new Date().toISOString()
const outputDirectory = descriptorRunRoot(releaseDescriptor)
const workspace = await mkdtemp(join(tmpdir(), 'sancussight-t10-matrix-'))
const results: Array<{ case: string; status: 'passed' | 'failed'; observedAt: string; proof: string[] }> = []

async function runCase(name: string, action: () => Promise<string[]>): Promise<void> {
  try {
    results.push({ case: name, status: 'passed', observedAt: new Date().toISOString(), proof: await action() })
  } catch (error) {
    results.push({ case: name, status: 'failed', observedAt: new Date().toISOString(), proof: [error instanceof Error ? error.message : 'Unknown failure'] })
  }
}

try {
  const baselineEvidence = releaseEvidence(observedAt)
  const baselineManifest = releaseManifest(baselineEvidence)

  await runCase('source-stopped', async () => {
    const data = join(workspace, 'source-stopped-data')
    const source = join(workspace, 'source-stopped-source')
    await mkdir(source, { recursive: true })
    let stopped = true
    const sourceAdapter: EvidenceAdapter = {
      id: 'praxen', async validate() {}, async collect(_path, _checkpoint, importedAt) {
        if (stopped) throw new Error('producer stopped')
        return { accepted: [releaseRecord('praxen', importedAt)], rejected: [], lag: 0, checkpoint: { source: 'praxen', cursor: importedAt, updatedAt: importedAt } }
      },
    }
    const healthyAdapter: EvidenceAdapter = { id: 'aimap', async validate() {}, async collect(_path, _checkpoint, importedAt) { return { accepted: [], rejected: [], lag: 0, checkpoint: { source: 'aimap', cursor: importedAt, updatedAt: importedAt } } } }
    const service = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), new Map<EvidenceSourceId, EvidenceAdapter>([['praxen', sourceAdapter], ['aimap', healthyAdapter]]), join(workspace, 'no-manifest.json'))
    await service.initialize()
    await service.configure('praxen', { artifactPath: source })
    await service.configure('aimap', { artifactPath: source })
    await service.refresh('praxen'); await service.refresh('aimap')
    assert.equal((await service.getSources()).find(item => item.id === 'praxen')?.health, 'failed')
    assert.equal((await service.getSources()).find(item => item.id === 'aimap')?.health, 'current')
    stopped = false
    await service.refresh('praxen')
    assert.equal((await service.getSources()).find(item => item.id === 'praxen')?.health, 'current')
    assert.equal((await service.getEvidence()).items.length, 1)
    service.close()
    return ['Stopped producer failed only Praxen.', 'Healthy AIMap adapter remained current.', 'Fresh Praxen evidence restored current health.']
  })

  await runCase('telemetry-bridge-stopped', async () => {
    const evidence = baselineEvidence.filter(item => !['codex-cli', 'claude-code'].includes(item.operational?.runtime ?? ''))
    const manifest = releaseManifest(evidence)
    const gate = calculateReleaseGate(manifest, evidence, observedAt)
    assert.ok(gate.blockers.includes('runtime-telemetry:runtime-missing:codex-cli'))
    assert.ok(gate.blockers.includes('runtime-telemetry:runtime-missing:claude-code'))
    assert.equal(gate.sources.praxen.state, 'current')
    return ['Codex and Claude coverage blocked.', 'Pi and all non-telemetry categories remained current.']
  })

  await runCase('pi-extension-disabled', async () => {
    const evidence = baselineEvidence.filter(item => item.operational?.runtime !== 'pi')
    const gate = calculateReleaseGate(releaseManifest(evidence), evidence, observedAt)
    assert.ok(gate.blockers.includes('runtime-telemetry:runtime-missing:pi'))
    assert.equal(gate.sources.praxen.state, 'current')
    return ['Only Pi runtime coverage was missing.', 'Other release categories remained current.']
  })

  await runCase('malformed-runtime-event', async () => runtimeRejectionCase('prompt', 'private'))
  await runCase('privacy-setting-mismatch', async () => runtimeRejectionCase('contentCapture', true))

  await runCase('artifact-inaccessible', async () => {
    await assert.rejects(() => new RuntimeTelemetryAdapter().collect(join(workspace, 'missing-artifact'), undefined, observedAt))
    return ['Inaccessible source failed without deleting or changing retained baseline evidence.']
  })

  await runCase('unsupported-format', async () => {
    const root = join(workspace, 'unsupported-praxen'); await mkdir(root, { recursive: true })
    await writeFile(join(root, 'report.json'), JSON.stringify({ schema_version: '99.0', findings: [] }))
    const result = await new PraxenAdapter().collect(root, undefined, observedAt)
    assert.equal(result.accepted.length, 0); assert.equal(result.rejected.length, 1)
    return ['Unsupported Praxen schema was wholly rejected.', 'No evidence was accepted.']
  })

  await runCase('invalid-pipelock-signature', async () => {
    const root = join(workspace, 'invalid-pipelock'); await mkdir(root, { recursive: true })
    const packetPath = resolve('collector', '__tests__', 'fixtures', 'pipelock-packet.json')
    const packetText = await readFile(packetPath, 'utf8')
    await copyFile(packetPath, join(root, 'packet.json'))
    await writeFile(join(root, 'verification.json'), JSON.stringify({ schemaVersion: 1, packetContentHash: contentHash(packetText), verdict: 'invalid', chainValid: false, signatureValid: false, trustedSignerFingerprint: 'a'.repeat(64), verifierId: 'pipelock-verifier', verifierVersion: '3.1.0', observedAt, runId }))
    const result = await new PipelockAdapter().collect(root, undefined, observedAt)
    assert.equal(result.accepted.length, 0); assert.ok(result.rejected.length > 0)
    return ['Invalid signature and chain could not produce verified evidence.']
  })

  await runCase('rampart-execution-error', async () => {
    const root = join(workspace, 'rampart-error'); await mkdir(root, { recursive: true })
    const report = rampartReport('error')
    await writeFile(join(root, 'report.json'), JSON.stringify(report))
    const collected = await new RampartAdapter().collect(root, undefined, observedAt)
    assert.equal(collected.accepted[0]?.outcome, 'fail')
    const evidence = baselineEvidence.filter(item => item.source !== 'rampart').concat(collected.accepted)
    const gate = calculateReleaseGate(releaseManifest(evidence), evidence, observedAt)
    assert.ok(gate.blockers.includes('rampart:non-passing-result'))
    return ['Infrastructure error remained a failed evidence record.', 'Release gate rejected the non-passing RAMPART result.']
  })

  await runCase('aimap-out-of-scope', async () => {
    const root = join(workspace, 'aimap-out-of-scope'); await mkdir(root, { recursive: true })
    const authorization = aimapAuthorization()
    const report = aimapReport(authorization); report.target.port = 11435
    await writeFile(join(root, 'authorization.json'), JSON.stringify(authorization)); await writeFile(join(root, 'export.json'), JSON.stringify(report))
    const result = await new AIMapAdapter().collect(root, undefined, observedAt)
    assert.equal(result.accepted.length, 0); assert.equal(result.rejected.length, 1)
    return ['Out-of-scope port was rejected as a whole export.', 'No partial finding qualified.']
  })

  await runCase('collector-restart', async () => {
    const data = join(workspace, 'restart-data'); const store = new EvidenceStore(data); await store.initialize()
    const retained = releaseRecord('praxen', observedAt)
    await store.accept([retained], { source: 'praxen', cursor: 'retained', updatedAt: observedAt })
    const restarted = new LocalCollectorService(new CollectorConfigStore(data), new EvidenceStore(data), new Map(), join(workspace, 'no-manifest.json'))
    await restarted.initialize(); assert.equal((await restarted.getEvidence()).items[0]?.id, retained.id); restarted.close()
    return ['Accepted evidence survived a new collector service instance.']
  })

  await runCase('duplicate-replay', async () => {
    const root = join(workspace, 'runtime-replay'); await mkdir(root, { recursive: true })
    await writeFile(join(root, 'runtime-telemetry.jsonl'), `${JSON.stringify(runtimeEvent('replay'))}\n`)
    const adapter = new RuntimeTelemetryAdapter(); const first = await adapter.collect(root, undefined, observedAt); const replay = await adapter.collect(root, first.checkpoint, observedAt)
    assert.equal(first.accepted.length, 1); assert.equal(replay.accepted.length, 0)
    return ['Deterministic replay produced no second accepted envelope.']
  })

  await runCase('artifact-rotation', async () => {
    const root = join(workspace, 'runtime-rotation'); await mkdir(root, { recursive: true })
    const file = join(root, 'runtime-telemetry.jsonl'); await writeFile(file, `${JSON.stringify(runtimeEvent('rotation-old'))}\n`)
    const adapter = new RuntimeTelemetryAdapter(); const first = await adapter.collect(root, undefined, observedAt)
    await copyFile(file, join(root, 'runtime-telemetry.jsonl.1')); await writeFile(file, `${JSON.stringify(runtimeEvent('rotation-newer'))}\n`)
    const rotated = await adapter.collect(root, first.checkpoint, observedAt)
    assert.equal(rotated.accepted.length, 1); assert.equal(rotated.accepted[0]?.provenance.sourceRecordId, 'rotation-newer')
    return ['Rotated duplicate was ignored.', 'Fresh replacement event was accepted exactly once.']
  })

  await runCase('source-upgrade-mismatch', async () => {
    const changed = baselineEvidence.map(item => item.source === 'aimap' ? { ...item, operational: { ...item.operational!, sourceVersion: 'unsupported-upgrade' } } : item)
    const gate = calculateReleaseGate(baselineManifest, changed, observedAt)
    assert.ok(gate.blockers.includes('aimap:version-mismatch')); assert.equal(gate.sources.praxen.state, 'current')
    return ['Unsupported AIMap version blocked only AIMap.', 'Unrelated sources remained current.']
  })

  await runCase('successful-recovery', async () => {
    const gate = calculateReleaseGate(baselineManifest, baselineEvidence, observedAt)
    assert.equal(gate.ready, true); assert.equal(gate.status, 'passed')
    return ['Fresh valid evidence for all categories and runtimes restored a passing isolated gate.']
  })

  await mkdir(outputDirectory, { recursive: true })
  const report = {
    schemaVersion: 1,
    releaseRunId: runId,
    startedAt: releaseDescriptor.startedAt,
    runtimeTargetId: releaseDescriptor.runtimeTargetId,
    observedAt,
    qualification: 'operational-failure-exercise',
    cases: results,
    summary: { passed: results.filter(item => item.status === 'passed').length, failed: results.filter(item => item.status === 'failed').length },
    limits: ['Failure inputs are isolated copies or fixed local test seams.', 'No upstream policy, signing key, raw prompt/response, scan payload, credential, or unrestricted workspace content is retained.'],
  }
  await writeFile(join(outputDirectory, 'failure-matrix.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  process.stdout.write(`${JSON.stringify(report.summary)}\n${join(outputDirectory, 'failure-matrix.json')}\n`)
  if (report.summary.failed) process.exitCode = 1
} finally {
  await rm(workspace, { recursive: true, force: true })
}

async function runtimeRejectionCase(key: string, value: unknown): Promise<string[]> {
  const root = join(workspace, `runtime-${key}`); await mkdir(root, { recursive: true })
  const file = join(root, 'runtime-telemetry.jsonl'); await writeFile(file, `${JSON.stringify(runtimeEvent(`${key}-baseline`))}\n`)
  const adapter = new RuntimeTelemetryAdapter(); const baseline = await adapter.collect(root, undefined, observedAt)
  await appendFile(file, `${JSON.stringify({ ...runtimeEvent(`${key}-invalid`), [key]: value })}\n`)
  const rejected = await adapter.collect(root, baseline.checkpoint, observedAt)
  assert.equal(rejected.accepted.length, 0); assert.equal(rejected.rejected.length, 1)
  assert.equal(JSON.parse(rejected.checkpoint.cursor).artifacts['runtime-telemetry.jsonl'].processedBytes, JSON.parse(baseline.checkpoint.cursor).artifacts['runtime-telemetry.jsonl'].processedBytes)
  await writeFile(file, `${JSON.stringify(runtimeEvent(`${key}-recovered`))}\n`)
  const recovered = await adapter.collect(root, rejected.checkpoint, observedAt); assert.equal(recovered.accepted.length, 1)
  return ['Invalid event was rejected without advancing processed bytes.', 'Replacement with a fresh allowlisted event recovered once.']
}

function runtimeEvent(eventId: string) {
  return { schemaVersion: 1, eventId, sessionId: `session-${eventId}`, runtime: 'codex-cli', provider: 'codex-otel', transport: 'otlp-http', providerVersion: '1.0.0', eventType: 'turn.completed', observedAt, outcome: 'succeeded', releaseRunId: runId, contentCapture: false, operational: { qualification: 'operational', sourceVersion: '1.0.0', runId, targetId: releaseDescriptor.runtimeTargetId, contractVersion: 'runtime-telemetry-v1', runtime: 'codex-cli', telemetryProvider: 'codex-otel', telemetryTransport: 'otlp-http', telemetryProviderVersion: '1.0.0' } }
}

function releaseRecord(source: ReleaseEvidenceSourceId, time: string, runtime?: 'codex-cli' | 'claude-code' | 'pi'): EvidenceEnvelopeV1 {
  const verification = source === 'pipelock' ? 'verified' : 'not-applicable'
  return createEvidenceEnvelope({ source, evidenceKind: `${source}-evidence`, observedAt: time, importedAt: time, subject: { externalId: `${source}-target`, type: runtime ? 'agent' : 'workflow' }, outcome: source === 'rampart' ? 'pass' : 'observed', summary: `${source} evidence observed.`, provenance: { artifactName: `${source}.json`, artifactContentHash: contentHash(`${source}:${runtime ?? 'single'}:${time}`), sourceRecordId: `${source}:${runtime ?? 'single'}`, parserId: `${source}-parser`, parserVersion: '1.0.0', verification }, operational: { qualification: 'operational', sourceVersion: '1.0.0', runId, targetId: runtime ? releaseDescriptor.runtimeTargetId : 'operator-owned-target', contractVersion: '1.0.0', ...(runtime ? { runtime } : {}) } })
}

function releaseEvidence(time: string): EvidenceEnvelopeV1[] {
  return RELEASE_EVIDENCE_SOURCE_IDS.flatMap(source => source === 'runtime-telemetry' ? ['codex-cli', 'claude-code', 'pi'].map(runtime => releaseRecord(source, time, runtime as 'codex-cli' | 'claude-code' | 'pi')) : [releaseRecord(source, time)])
}

function releaseManifest(evidence: readonly EvidenceEnvelopeV1[]): ReleaseEvidenceManifestV1 {
  return { schemaVersion: 1, releaseRunId: runId, startedAt: releaseDescriptor.startedAt, runtimes: ['codex-cli', 'claude-code', 'pi'], sources: Object.fromEntries(RELEASE_EVIDENCE_SOURCE_IDS.map(source => [source, { version: '1.0.0', targetId: source === 'runtime-telemetry' ? releaseDescriptor.runtimeTargetId : 'operator-owned-target', contractVersion: '1.0.0', evidenceIds: evidence.filter(item => item.source === source).map(item => item.id), verification: source === 'pipelock' ? 'verified' : 'not-applicable', operational: true }])) as Record<ReleaseEvidenceSourceId, ReleaseEvidenceManifestV1['sources'][ReleaseEvidenceSourceId]>, failureCases: Object.fromEntries(REQUIRED_RELEASE_FAILURE_CASES.map(item => [item, 'passed'])), status: 'in-progress', untestedBoundaries: [] }
}

function rampartReport(status: 'error') {
  return { schemaVersion: 1, sourceVersion: '1.0.0', runId, targetId: 'operator-owned-target', suiteVersion: 'spec005-t10-v1', evaluatorVersion: 'deterministic-v1', results: [{ resultId: 'execution-error', scenarioId: 'infrastructure-error', status, safe: false, summary: 'Fixed execution error', harmCategory: 'infrastructure', strategy: 'fixed-error', durationMs: 1, observedAt }], operational: { qualification: 'operational', sourceVersion: '1.0.0', runId, targetId: 'operator-owned-target', contractVersion: '1.0.0' } }
}

function aimapAuthorization() {
  return { schemaVersion: 1, authorizationId: `authorization-${runId}`, owner: 'local-operator', purpose: 'Fixed T10 loopback scope rejection exercise', target: { host: '127.0.0.1', port: 11434, protocol: 'http' as const, templates: ['ollama-fingerprint'] }, validFrom: new Date(Date.parse(observedAt) - 60_000).toISOString(), validUntil: new Date(Date.parse(observedAt) + 60_000).toISOString(), releaseRunId: runId }
}

function aimapReport(authorization: ReturnType<typeof aimapAuthorization>) {
  return { schemaVersion: 1, sourceVersion: '1.0.0', scanId: `scan-${runId}`, authorizationId: authorization.authorizationId, runId, status: 'completed' as const, target: { ...authorization.target }, completedAt: observedAt, operational: { qualification: 'operational', sourceVersion: '1.0.0', runId, targetId: 'operator-owned-target', contractVersion: '1.0.0' }, findings: [{ findingId: 'fingerprint', endpointId: 'loopback-ollama-11434', hostname: '127.0.0.1', port: 11434, protocol: 'http' as const, authStatus: 'unknown' as const, riskScore: 1, riskFactors: ['fingerprint-only'], template: 'ollama-fingerprint', severity: 'informational' as const, title: 'Loopback fingerprint' }] }
}
