import assert from 'node:assert/strict'
import { appendFile, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { AgentBeaconAdapter } from '../adapters/agent-beacon.ts'
import { PipelockAdapter } from '../adapters/pipelock.ts'
import { PraxenAdapter } from '../adapters/praxen.ts'
import { RuntimeTelemetryAdapter } from '../adapters/runtime-telemetry.ts'
import { contentHash } from '../envelope.ts'

const NOW = '2026-07-16T12:00:00.000Z'
const OPERATIONAL = { qualification: 'operational', sourceVersion: '1.0.0', runId: 'run-001', targetId: 'target-001', contractVersion: 'source-v1', runtime: 'codex-cli' }

function praxenCanonical() {
  return {
    schema_version: '2.0',
    praxen_version: '1.1.0',
    scan: { agent: 'Operator Agent', agent_slug: 'operator-agent', scan_timestamp: NOW },
    findings: [{ id: 'finding-001', severity: 'High', summary: 'Bounded finding', policy_rule_ids: 'R-01' }],
  }
}

function runnerProjection(canonical: ReturnType<typeof praxenCanonical>, canonicalHash: string) {
  const workerRemitHash = 'b'.repeat(64)
  return {
    ...structuredClone(canonical),
    operational: {
      qualification: 'operational',
      sourceVersion: '1.1.0',
      runId: 'run-001',
      targetId: 'operator-agent',
      contractVersion: 'praxen-v2',
      configurationHash: 'c'.repeat(64),
      workerRemitHash,
    },
    sancussight: {
      runnerBinding: {
        bindingVersion: 1,
        producer: 'sancussight-praxen-runner',
        releaseRunId: 'run-001',
        targetId: 'operator-agent',
        workerRemitHash,
        sourceVersion: '1.1.0',
        contractVersion: 'praxen-v2',
        canonicalArtifactContentHash: canonicalHash,
        producerObservedAt: NOW,
        claudeCliVersion: '2.1.214',
        selectedModel: 'haiku',
        praxenPluginVersion: '1.1.0',
        converterScriptHash: 'd'.repeat(64),
        rendererScriptHash: 'e'.repeat(64),
        runnerVersion: 't16r-v1',
        canonicalRoleName: 'canonical/operator-agent-findings.json',
        sourceRoles: {
          draft: 'staging/operator-agent-step-9.9-draft.md',
          canonical: 'canonical/operator-agent-findings.json',
          renderedHtml: 'rendered/operator-agent-analysis.html',
          renderedText: 'rendered/operator-agent-analysis.txt',
        },
      },
    },
  }
}

test('runtime telemetry retains provider truth and drops forbidden content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-runtime-telemetry-'))
  try {
    const event = {
      schemaVersion: 1, eventId: 'event-001', sessionId: 'session-001', runtime: 'codex-cli',
      provider: 'codex-otel', transport: 'otlp-http', providerVersion: '1.2.3', eventType: 'turn.completed',
      observedAt: NOW, outcome: 'succeeded', releaseRunId: 'run-001', contentCapture: false,
      operational: { ...OPERATIONAL, contractVersion: 'runtime-telemetry-v1', telemetryProvider: 'codex-otel', telemetryTransport: 'otlp-http', telemetryProviderVersion: '1.2.3' },
    }
    await writeFile(join(root, 'runtime-telemetry.jsonl'), `${JSON.stringify(event)}\n`)
    const adapter = new RuntimeTelemetryAdapter()
    const result = await adapter.collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].source, 'runtime-telemetry')
    assert.equal(result.accepted[0].operational?.telemetryProvider, 'codex-otel')
    assert.equal(result.accepted[0].attributes.provider, 'codex-otel')
    assert.equal('prompt' in result.accepted[0].attributes, false)
    assert.equal('toolArguments' in result.accepted[0].attributes, false)
    await appendFile(join(root, 'runtime-telemetry.jsonl'), [
      { ...event, eventId: 'event-unsafe-prompt', prompt: 'must be rejected' },
      { ...event, eventId: 'event-unsafe-setting', contentCapture: true },
      { ...event, eventId: 'event-unsupported', schemaVersion: 2 },
    ].map(item => JSON.stringify(item)).join('\n') + '\n')
    const privacyUnsafe = await adapter.collect(root, result.checkpoint, NOW)
    assert.equal(privacyUnsafe.accepted.length, 0)
    assert.equal(privacyUnsafe.rejected.length, 1)
    assert.equal(JSON.parse(privacyUnsafe.checkpoint.cursor).artifacts['runtime-telemetry.jsonl'].processedBytes, JSON.parse(result.checkpoint.cursor).artifacts['runtime-telemetry.jsonl'].processedBytes)

    await writeFile(join(root, 'runtime-telemetry.jsonl'), `${JSON.stringify({ ...event, eventId: 'event-recovered', observedAt: '2026-07-16T12:01:00.000Z' })}\n`)
    const recovered = await adapter.collect(root, privacyUnsafe.checkpoint, NOW)
    assert.equal(recovered.accepted.length, 1)
    assert.equal(recovered.rejected.length, 0)
    const replay = await adapter.collect(root, recovered.checkpoint, NOW)
    assert.equal(replay.accepted.length, 0)
    await copyFile(join(root, 'runtime-telemetry.jsonl'), join(root, 'runtime-telemetry.jsonl.1'))
    const rotated = await adapter.collect(root, recovered.checkpoint, NOW)
    assert.equal(rotated.accepted.length, 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Agent Beacon carries explicit runtime/run/target metadata without prompt content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-beacon-operational-'))
  try {
    await writeFile(join(root, 'runtime.jsonl'), `${JSON.stringify({ timestamp: NOW, schema_version: '1.0', event: { kind: 'agent_runtime', action: 'session.started', category: 'runtime' }, endpoint: { hostname: 'workstation', agent_version: '1.0.0' }, session: { id: 'session-1' }, operational: OPERATIONAL, prompt: { text: 'private prompt' } })}\n`)
    const result = await new AgentBeaconAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].operational?.runId, 'run-001')
    assert.equal('prompt' in result.accepted[0].attributes, false)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Praxen operational qualification requires a runner-bound canonical artifact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-praxen-operational-'))
  try {
    const canonicalRoot = join(root, 'canonical')
    const operationalRoot = join(root, 'operational')
    await mkdir(canonicalRoot)
    await mkdir(operationalRoot)
    const canonical = praxenCanonical()
    const canonicalText = `${JSON.stringify(canonical, null, 2)}\n`
    await writeFile(join(canonicalRoot, 'operator-agent-findings.json'), canonicalText)
    await writeFile(join(operationalRoot, 'operator-agent-operational.json'), JSON.stringify(runnerProjection(canonical, contentHash(canonicalText))))
    const result = await new PraxenAdapter().collect(operationalRoot, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].operational?.targetId, 'operator-agent')
    assert.equal(result.accepted[0].operational?.workerRemitHash, 'b'.repeat(64))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Praxen rejects tampered runner bindings, privacy violations, and direct canonical-looking operational JSON', async () => {
  const cases = [
    {
      name: 'wrong run',
      mutate: (report: ReturnType<typeof runnerProjection>) => { report.operational.runId = 'wrong-run' },
    },
    {
      name: 'wrong target',
      mutate: (report: ReturnType<typeof runnerProjection>) => { report.sancussight.runnerBinding.targetId = 'wrong-target' },
    },
    {
      name: 'wrong version',
      mutate: (report: ReturnType<typeof runnerProjection>) => { report.sancussight.runnerBinding.praxenPluginVersion = '9.9.9' },
    },
    {
      name: 'wrong canonical hash',
      mutate: (report: ReturnType<typeof runnerProjection>) => { report.sancussight.runnerBinding.canonicalArtifactContentHash = 'f'.repeat(64) },
    },
    {
      name: 'privacy key',
      mutate: (report: ReturnType<typeof runnerProjection>) => { Object.assign(report, { prompt: 'private' }) },
    },
  ]
  for (const fixture of cases) {
    const root = await mkdtemp(join(tmpdir(), `sancussight-praxen-${fixture.name.replaceAll(' ', '-')}-`))
    try {
      const canonicalRoot = join(root, 'canonical')
      const operationalRoot = join(root, 'operational')
      await mkdir(canonicalRoot)
      await mkdir(operationalRoot)
      const canonical = praxenCanonical()
      const canonicalText = `${JSON.stringify(canonical, null, 2)}\n`
      await writeFile(join(canonicalRoot, 'operator-agent-findings.json'), canonicalText)
      const report = runnerProjection(canonical, contentHash(canonicalText))
      fixture.mutate(report)
      await writeFile(join(operationalRoot, 'operator-agent-operational.json'), JSON.stringify(report))
      const result = await new PraxenAdapter().collect(operationalRoot, undefined, NOW)
      assert.equal(result.accepted.length, 0, fixture.name)
      assert.equal(result.rejected.length, 1, fixture.name)
    } finally { await rm(root, { recursive: true, force: true }) }
  }

  const directRoot = await mkdtemp(join(tmpdir(), 'sancussight-praxen-direct-model-'))
  try {
    const operationalRoot = join(directRoot, 'operational')
    await mkdir(operationalRoot)
    await writeFile(join(operationalRoot, 'model-authored.json'), JSON.stringify(praxenCanonical()))
    const rejected = await new PraxenAdapter().collect(operationalRoot, undefined, NOW)
    assert.equal(rejected.accepted.length, 0)
    assert.equal(rejected.rejected.length, 1)
  } finally { await rm(directRoot, { recursive: true, force: true }) }
})

test('Praxen legacy canonical evidence remains readable but cannot qualify as operational A-002 evidence', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-praxen-legacy-'))
  try {
    const legacy = {
      ...praxenCanonical(),
      operational: {
        qualification: 'operational',
        sourceVersion: '1.1.0',
        runId: 'historical-run',
        targetId: 'operator-agent',
        contractVersion: 'praxen-v2',
        workerRemitHash: 'b'.repeat(64),
      },
    }
    await writeFile(join(root, 'legacy.json'), JSON.stringify(legacy))
    const result = await new PraxenAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].operational, undefined)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Pipelock fixed verification binds the exact packet hash and requires allow plus block for operational qualification', async () => {
  const fixtures = join(process.cwd(), 'collector', '__tests__', 'fixtures')
  const root = await mkdtemp(join(tmpdir(), 'sancussight-pipelock-operational-'))
  try {
    const packet = JSON.parse(await readFile(join(fixtures, 'pipelock-packet.json'), 'utf8'))
    const packetText = JSON.stringify(packet)
    await writeFile(join(root, 'packet.json'), packetText)
    await writeFile(join(root, 'verification.json'), JSON.stringify({ schemaVersion: 1, packetContentHash: contentHash(packetText), verdict: 'valid', chainValid: true, signatureValid: true, trustedSignerFingerprint: 'a'.repeat(64), verifierId: 'pipelock-verifier', verifierVersion: '3.1.0', observedAt: NOW, runId: 'run-001', operational: { ...OPERATIONAL, sourceVersion: '3.1.0', contractVersion: 'pipelock-v1' } }))
    const result = await new PipelockAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].provenance.verification, 'verified')
    assert.equal(result.accepted[0].operational?.qualification, 'operational')
    assert.equal(result.accepted[0].attributes.trustedSignerFingerprint, 'a'.repeat(64))
    await copyFile(join(root, 'verification.json'), join(root, 'verification-copy.json'))
    await writeFile(join(root, 'verification.json'), JSON.stringify({ schemaVersion: 1, packetContentHash: 'b'.repeat(64), verdict: 'valid', chainValid: true, signatureValid: true, trustedSignerFingerprint: 'a'.repeat(64), verifierId: 'pipelock-verify', verifierVersion: '3.1.0', observedAt: NOW }))
    const mismatch = await new PipelockAdapter().collect(root, undefined, NOW)
    assert.ok(mismatch.rejected.length >= 1)
  } finally { await rm(root, { recursive: true, force: true }) }
})
