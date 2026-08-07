import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join, normalize, resolve, sep } from 'node:path'
import { contentHash, createEvidenceEnvelope } from '../collector/envelope.ts'

// Verification-only fixture server for Spec 005 T15. It is intentionally not
// imported by the app, the collector, or the production build.
const allowedStates = new Set(['complete', 'missing-target', 'stale-target'])
const stateArgument = process.argv[process.argv.indexOf('--state') + 1] ?? 'complete'
if (!allowedStates.has(stateArgument)) throw new Error(`Unsupported T15 fixture state: ${stateArgument}`)

const state = stateArgument
const port = Number(process.argv[process.argv.indexOf('--port') + 1] ?? 43127)
const distRoot = resolve(process.cwd(), 'dist')
const runId = `t15-fixture-${state}`
const nowMs = Date.now()
const now = new Date(nowMs).toISOString()
const startedAt = new Date(nowMs - (state === 'stale-target' ? 32 * 60_000 : 60_000)).toISOString()
const currentObservedAt = new Date(nowMs - 15_000).toISOString()
const staleObservedAt = new Date(nowMs - 31 * 60_000 - 1_000).toISOString()
const sancusSightRemit = 'a'.repeat(64)
const sddExecRemit = 'b'.repeat(64)

const evidence = makeEvidence()
const manifest = makeManifest(evidence)
const progress = {
  stale: false,
  snapshot: {
    schemaVersion: 1,
    releaseRunId: runId,
    state: 'completed',
    stage: 'finalizing',
    producerId: 'praxen',
    targetId: 'sdd-exec',
    currentIndex: 8,
    total: 8,
    updatedAt: now,
    messageCode: 'complete',
  },
}

const sourceCatalog = [
  ['agent-beacon', 'Agent Beacon', 'Runtime and inventory JSONL'],
  ['runtime-telemetry', 'Runtime telemetry', 'Sanitized Codex, Claude, and Pi JSONL'],
  ['praxen', 'Praxen', 'Machine-readable assessment report'],
  ['pipelock', 'Pipelock', 'Signed receipt or Audit Packet'],
  ['rampart', 'RAMPART', 'Sanitized safety-test report'],
  ['aimap', 'AIMap', 'Authorized completed-scan export'],
]

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? `127.0.0.1:${port}`}`)
  try {
    if (requestUrl.pathname === '/api/v1/status') {
      return json(response, { version: 1, mode: 'local-collector', health: 'fixture', csrfToken: 't15-fixture-token' })
    }
    if (requestUrl.pathname === '/api/v1/sources') {
      return json(response, { items: sourceCatalog.map(([id, displayName, evidenceType]) => ({
        id, displayName, evidenceType, health: id === 'agent-beacon' ? 'not-configured' : 'current', rejectedCount: 0,
      })) })
    }
    if (requestUrl.pathname === '/api/v1/evidence') return json(response, { items: evidence })
    if (requestUrl.pathname === '/api/v1/rejected') return json(response, { items: [] })
    if (requestUrl.pathname === '/api/v1/release-manifest') return json(response, { manifest })
    if (requestUrl.pathname === '/api/v1/release-progress') return json(response, progress)
    if (requestUrl.pathname === '/api/v1/governance/events') return json(response, { items: [] })
    if (requestUrl.pathname === '/api/v1/governance/summary') return json(response, {
      generatedAt: now, inventory: [], activity: [], controls: [], decisions: [], outcomes: [], lineage: [], sourceStates: [], gaps: [], eventCount: 0,
    })
    if (requestUrl.pathname.startsWith('/api/v1/')) return json(response, { error: 'fixture-route-not-supported' }, 404)
    return await staticAsset(response, requestUrl.pathname)
  } catch (error) {
    return json(response, { error: error instanceof Error ? error.message : 'fixture-error' }, 500)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`T15 verification-only fixture server: http://127.0.0.1:${port}/?state=${state}#demo`)
})

function makeEvidence() {
  const records = []
  const runtimeTarget = 'local-ai-runtime'
  for (const runtime of ['codex-cli', 'claude-code', 'pi']) {
    records.push(record({
      source: 'runtime-telemetry', evidenceKind: `${runtime}.session`, targetId: runtimeTarget,
      observedAt: currentObservedAt, verification: 'not-applicable', runtime,
      summary: `Fixture metadata for ${runtime}; no content captured.`,
      provider: runtime === 'pi' ? 'pi-extension' : runtime === 'codex-cli' ? 'codex-otel' : 'claude-otel', transport: runtime === 'pi' ? 'jsonl' : 'otlp-http',
    }))
  }
  records.push(record({
    source: 'praxen', evidenceKind: 'finding', targetId: 'sancussight', workerRemitHash: sancusSightRemit,
    observedAt: currentObservedAt, summary: 'Fixture finding for the approved SancusSight target.',
  }))
  records.push(record({
    source: 'praxen', evidenceKind: 'finding', targetId: 'sdd-exec', workerRemitHash: sddExecRemit,
    observedAt: state === 'stale-target' ? staleObservedAt : new Date(nowMs - 8_000).toISOString(),
    summary: 'Fixture finding for the approved sdd-exec target.',
  }))
  records.push(record({
    source: 'pipelock', evidenceKind: 'verification', targetId: 'fixture-workflow',
    observedAt: currentObservedAt, verification: 'verified', summary: 'Fixture allow/block receipt verification.',
  }))
  records.push(record({
    source: 'rampart', evidenceKind: 'safety-test', targetId: 'fixture-agent',
    observedAt: currentObservedAt, outcome: 'pass', summary: 'Fixture safe result with bounded metadata.',
  }))
  records.push(record({
    source: 'aimap', evidenceKind: 'scan-finding', targetId: 'fixture-loopback',
    observedAt: currentObservedAt, summary: 'Fixture authorized scan finding with bounded metadata.',
  }))

  if (state === 'missing-target') return records.filter((item) => item.operational?.targetId !== 'sdd-exec')
  return records
}

function makeManifest(records) {
  const sourceIds = ['runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap']
  const sources = Object.fromEntries(sourceIds.map((source) => {
    const sourceRecords = records.filter((item) => item.source === source)
    const targetIds = [...new Set(sourceRecords.map((item) => item.operational.targetId))]
    const requiredTargets = source === 'praxen'
      ? [
          targetSummary(records, 'sancussight', sancusSightRemit),
          { targetId: 'sdd-exec', evidenceIds: records.filter((item) => item.source === 'praxen' && item.operational.targetId === 'sdd-exec').map((item) => item.id), latestObservedAt: state === 'stale-target' ? staleObservedAt : new Date(nowMs - 8_000).toISOString(), workerRemitHash: sddExecRemit },
        ]
      : [targetSummary(records, targetIds[0], undefined)]
    const sourceEvidence = records.filter((item) => item.source === source)
    return [source, {
      version: '1.0.0', targetId: targetIds[0] ?? (source === 'praxen' ? 'sancussight' : 'fixture-target'),
      ...(source === 'praxen' ? { targetIds: ['sancussight', 'sdd-exec'] } : {}),
      contractVersion: `${source}-fixture-v1`, evidenceIds: sourceEvidence.map((item) => item.id),
      latestObservedAt: latest(sourceEvidence.map((item) => item.observedAt)),
      verification: source === 'pipelock' ? 'verified' : 'not-applicable', operational: true,
      requiredTargets,
      ...(source === 'praxen' ? { workerRemitHash: sancusSightRemit, workerRemitHashes: [sancusSightRemit, sddExecRemit] } : {}),
    }]
  }))
  return {
    schemaVersion: 1, releaseRunId: runId, startedAt, completedAt: now,
    runtimes: ['codex-cli', 'claude-code', 'pi'], sources,
    failureCases: Object.fromEntries(['source-stopped', 'telemetry-bridge-stopped', 'pi-extension-disabled', 'malformed-runtime-event', 'privacy-setting-mismatch', 'artifact-inaccessible', 'unsupported-format', 'invalid-pipelock-signature', 'rampart-execution-error', 'aimap-out-of-scope', 'collector-restart', 'duplicate-replay', 'artifact-rotation', 'source-upgrade-mismatch', 'successful-recovery'].map((name) => [name, 'passed'])),
    status: 'passed', untestedBoundaries: [],
  }
}

function targetSummary(records, targetId, workerRemitHash) {
  const targetRecords = records.filter((item) => item.source === 'praxen' ? item.operational.targetId === targetId : item.operational.targetId === targetId)
  return {
    targetId, evidenceIds: targetRecords.map((item) => item.id),
    latestObservedAt: latest(targetRecords.map((item) => item.observedAt)),
    ...(workerRemitHash ? { workerRemitHash } : {}),
  }
}

function record({ source, evidenceKind, targetId, observedAt, summary, verification = 'not-applicable', outcome = 'observed', runtime, workerRemitHash, provider, transport }) {
  return createEvidenceEnvelope({
    source, evidenceKind, observedAt, importedAt: now,
    subject: { externalId: targetId, type: source === 'runtime-telemetry' ? 'agent' : 'workflow' },
    outcome, summary,
    provenance: { artifactName: `${source}-t15-fixture.json`, artifactContentHash: contentHash(`${runId}:${source}:${targetId}:${observedAt}`), parserId: `${source}-t15-fixture`, parserVersion: '1.0.0', verification },
    operational: { qualification: 'operational', sourceVersion: '1.0.0', runId, targetId, contractVersion: `${source}-fixture-v1`, ...(runtime ? { runtime, telemetryProvider: provider, telemetryTransport: transport, telemetryProviderVersion: 'fixture-1.0.0' } : {}), ...(workerRemitHash ? { workerRemitHash } : {}) },
    ...(source === 'rampart' ? { attributes: { status: 'safe' } } : {}),
  })
}

function latest(values) {
  return [...values].sort((left, right) => Date.parse(right) - Date.parse(left))[0]
}

async function staticAsset(response, pathname) {
  const requested = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '')
  const filePath = resolve(distRoot, normalize(requested))
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) return json(response, { error: 'asset-not-found' }, 404)
  let actualPath = filePath
  try {
    const metadata = await stat(actualPath)
    if (!metadata.isFile()) throw new Error('not-file')
  } catch {
    actualPath = join(distRoot, 'index.html')
  }
  response.setHeader('Content-Type', contentType(actualPath))
  if (actualPath.endsWith('index.html')) {
    const html = await readFile(actualPath, 'utf8')
    const fixtureBanner = `<aside role="note" style="position:fixed;z-index:100;right:12px;bottom:12px;max-width:360px;border:1px solid #8b620e;background:#f6ead0;color:#182630;padding:8px 10px;font:12px/1.35 ui-monospace,monospace;box-shadow:0 4px 14px rgba(24,38,48,.18)">T15 verification-only fixture · ${state} · synthetic QA data — not release evidence</aside>`
    response.end(html.replace('<head>', '<head><meta name="sancussight-mode" content="local-collector">').replace('<body>', `<body>${fixtureBanner}`))
    return
  }
  createReadStream(actualPath).pipe(response)
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.png')) return 'image/png'
  return 'application/octet-stream'
}

function json(response, value, status = 200) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(value))
}
