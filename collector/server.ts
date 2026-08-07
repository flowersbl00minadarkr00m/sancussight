import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import type { EvidenceEnvelopeV1, EvidenceSourceId, EvidenceSourceState, ReleaseEvidenceManifestV1 } from '../src/types.ts'
import type { ReleaseProgressRead } from '../src/lib/release-progress.ts'
import type { RejectedEvidence } from './evidence-store.ts'
import { applySecurityHeaders, expectedOrigin, isExpectedHost, SessionStore } from './security.ts'
import type { GovernancePage } from './governance-store.ts'
import { GovernanceServiceError, type ConfirmedBindingInput, type GovernanceService, type GovernanceSourceState, type HumanDecisionInput } from './governance-service.ts'
import type { GovernanceNativeSourceId } from '../src/domain/governance/model.ts'
import type { GovernanceReadModel } from '../src/domain/governance/project.ts'

const SOURCE_IDS = new Set<EvidenceSourceId>(['agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap'])
const MAX_BODY_BYTES = 32 * 1024
const GOVERNANCE_SOURCES = new Set(['agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap', 'findmnemo', 'flowsensa', 'runtime-inventory', 'sancussight'])
const GOVERNANCE_NATIVE_SOURCES = new Set<GovernanceNativeSourceId>(['findmnemo', 'flowsensa', 'runtime-inventory'])
const MAX_SUMMARY_ROWS = 100
const MAX_SUMMARY_GAPS = 200

export interface ConfigureSourceInput {
  artifactPath: string
}

export interface CollectorService {
  getSources(): Promise<EvidenceSourceState[]>
  configure(source: EvidenceSourceId, input: ConfigureSourceInput): Promise<EvidenceSourceState>
  refresh(source: EvidenceSourceId): Promise<EvidenceSourceState>
  disconnect(source: EvidenceSourceId): Promise<void>
  getEvidence(cursor?: string): Promise<{ items: EvidenceEnvelopeV1[]; nextCursor?: string }>
  getRejected(cursor?: string): Promise<{ items: RejectedEvidence[]; nextCursor?: string }>
  getReleaseManifest?(): Promise<ReleaseEvidenceManifestV1 | undefined>
  getReleaseProgress?(): Promise<ReleaseProgressRead>
  retryRejected(id: string): Promise<void>
  close?(): void | Promise<void>
}

export interface CollectorServerOptions {
  port?: number
  staticDirectory: string
  service: CollectorService
  governance?: GovernanceApiService
  governanceService?: GovernanceApiService
}

export interface GovernanceApiService {
  listEvents(options?: { cursor?: string; limit?: number; source?: string }): Promise<GovernancePage>
  readModel(now: string): Promise<GovernanceReadModel>
  appendHumanDecision(input: HumanDecisionInput): Promise<unknown>
  appendBinding(input: ConfirmedBindingInput): Promise<unknown>
  exportBundle?(): Promise<unknown>
  listSourceStates?(): Promise<GovernanceSourceState[]>
  configureSource?(id: GovernanceNativeSourceId, artifactPath: string): Promise<GovernanceSourceState>
  refreshSource?(id: GovernanceNativeSourceId): Promise<GovernanceSourceState>
  disconnectSource?(id: GovernanceNativeSourceId): Promise<void>
  close?(): Promise<void>
}

export interface RunningCollectorServer {
  server: Server
  port: number
  origin: string
  close(): Promise<void>
}

export async function startCollectorServer(options: CollectorServerOptions): Promise<RunningCollectorServer> {
  const sessions = new SessionStore()
  const governance = options.governanceService ?? options.governance
  let listeningPort = options.port ?? 43117
  const server = createServer((request, response) => {
    void handleRequest(request, response, listeningPort, options.staticDirectory, options.service, sessions, governance)
  })
  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(listeningPort, '127.0.0.1', () => resolvePromise())
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Collector failed to bind to loopback.')
  listeningPort = address.port
  return {
    server,
    port: listeningPort,
    origin: expectedOrigin(listeningPort),
    close: async () => {
      await new Promise<void>((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()))
      await governance?.close?.()
      await options.service.close?.()
    },
  }
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  port: number,
  staticDirectory: string,
  service: CollectorService,
  sessions: SessionStore,
  governance: GovernanceApiService | undefined,
): Promise<void> {
  applySecurityHeaders(response)
  if (!isExpectedHost(request.headers.host, port)) return json(response, 421, { error: 'host-rejected' })
  const requestOrigin = `http://${request.headers.host}`

  try {
    const url = new URL(request.url ?? '/', requestOrigin)
    if (url.pathname.startsWith('/api/v1/')) {
      await handleApi(request, response, url, requestOrigin, service, sessions, governance)
      return
    }
    await serveStatic(response, url.pathname, staticDirectory)
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const code = error instanceof HttpError ? error.code : 'collector-error'
    json(response, status, { error: code })
  }
}

async function handleApi(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  requestOrigin: string,
  service: CollectorService,
  sessions: SessionStore,
  governance: GovernanceApiService | undefined,
): Promise<void> {
  const method = request.method ?? 'GET'
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const validation = sessions.validateMutation(request, requestOrigin)
    if (!validation.ok) return json(response, 403, { error: validation.code })
  }

  if (method === 'GET' && url.pathname === '/api/v1/status') {
    const existing = sessions.read(request)
    const session = existing ?? sessions.issue(response)
    const sources = await service.getSources()
    return json(response, 200, {
      version: 1,
      mode: 'local-collector',
      health: aggregateHealth(sources),
      csrfToken: session.csrfToken,
    })
  }
  if (method === 'GET' && url.pathname === '/api/v1/sources') return json(response, 200, { items: await service.getSources() })
  if (method === 'GET' && url.pathname === '/api/v1/evidence') return json(response, 200, await service.getEvidence(url.searchParams.get('cursor') ?? undefined))
  if (method === 'GET' && url.pathname === '/api/v1/rejected') return json(response, 200, await service.getRejected(url.searchParams.get('cursor') ?? undefined))
  if (method === 'GET' && url.pathname === '/api/v1/release-manifest') return json(response, 200, { manifest: await service.getReleaseManifest?.() })
  if (method === 'GET' && url.pathname === '/api/v1/release-progress') return json(response, 200, await service.getReleaseProgress?.() ?? { stale: true, errors: ['progress:unavailable'] })

  if (url.pathname.startsWith('/api/v1/governance/')) {
    if (!governance) throw new HttpError(503, 'governance-unavailable')
    return handleGovernanceApi(request, response, url, method, governance)
  }

  const sourceMatch = /^\/api\/v1\/sources\/([^/]+)(?:\/(configure|refresh))?$/.exec(url.pathname)
  if (sourceMatch) {
    if (GOVERNANCE_NATIVE_SOURCES.has(sourceMatch[1] as GovernanceNativeSourceId)) {
      if (!governance?.configureSource || !governance.refreshSource || !governance.disconnectSource) throw new HttpError(503, 'governance-unavailable')
      const source = sourceMatch[1] as GovernanceNativeSourceId
      if (method === 'POST' && sourceMatch[2] === 'configure') {
        const body = await readJsonBody(request)
        if (typeof body.artifactPath !== 'string' || !body.artifactPath.trim()) throw new HttpError(400, 'artifact-path-required')
        try { return json(response, 200, await governance.configureSource(source, body.artifactPath)) } catch (error) { throw governanceError(error) }
      }
      if (method === 'POST' && sourceMatch[2] === 'refresh') {
        try { return json(response, 200, await governance.refreshSource(source)) } catch (error) { throw governanceError(error) }
      }
      if (method === 'DELETE' && !sourceMatch[2]) {
        try { await governance.disconnectSource(source); response.writeHead(204).end(); return } catch (error) { throw governanceError(error) }
      }
      throw new HttpError(404, 'route-not-found')
    }
    const source = parseSourceId(sourceMatch[1])
    if (method === 'POST' && sourceMatch[2] === 'configure') {
      const body = await readJsonBody(request)
      if (typeof body.artifactPath !== 'string' || !body.artifactPath.trim()) throw new HttpError(400, 'artifact-path-required')
      try {
        return json(response, 200, await service.configure(source, { artifactPath: body.artifactPath }))
      } catch {
        throw new HttpError(400, 'invalid-source')
      }
    }
    if (method === 'POST' && sourceMatch[2] === 'refresh') return json(response, 200, await service.refresh(source))
    if (method === 'DELETE' && !sourceMatch[2]) {
      await service.disconnect(source)
      response.writeHead(204).end()
      return
    }
  }

  const retryMatch = /^\/api\/v1\/rejected\/([^/]+)\/retry$/.exec(url.pathname)
  if (method === 'POST' && retryMatch) {
    await service.retryRejected(decodeURIComponent(retryMatch[1]))
    response.writeHead(204).end()
    return
  }
  throw new HttpError(404, 'route-not-found')
}

async function handleGovernanceApi(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  method: string,
  governance: GovernanceApiService,
): Promise<void> {
  if (method === 'GET' && url.pathname === '/api/v1/governance/events') {
    assertQueryKeys(url, ['cursor', 'limit', 'source'])
    const source = url.searchParams.get('source') ?? undefined
    if (source && !GOVERNANCE_SOURCES.has(source)) throw new HttpError(400, 'source-filter-not-allowed')
    const page = await governance.listEvents({ cursor: parseCursor(url.searchParams.get('cursor')), limit: parseLimit(url.searchParams.get('limit')), source })
    return json(response, 200, { items: page.events, ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}) })
  }
  if (method === 'GET' && url.pathname === '/api/v1/governance/summary') {
    if (url.searchParams.size) throw new HttpError(400, 'query-not-allowed')
    return json(response, 200, boundedGovernanceSummary(await governance.readModel(new Date().toISOString())))
  }
  if (method === 'GET' && url.pathname === '/api/v1/governance/inventory') {
    assertQueryKeys(url, ['cursor', 'limit'])
    const model = await governance.readModel(new Date().toISOString())
    return json(response, 200, pageProjection(model.inventory, url.searchParams.get('cursor'), url.searchParams.get('limit')))
  }
  if (method === 'GET' && url.pathname === '/api/v1/governance/controls') {
    assertQueryKeys(url, ['cursor', 'limit'])
    const model = await governance.readModel(new Date().toISOString())
    return json(response, 200, pageProjection(model.controls, url.searchParams.get('cursor'), url.searchParams.get('limit')))
  }
  if (method === 'GET' && url.pathname === '/api/v1/governance/export') {
    if (url.searchParams.size) throw new HttpError(400, 'query-not-allowed')
    if (!governance.exportBundle) throw new HttpError(503, 'governance-export-unavailable')
    return json(response, 200, await governance.exportBundle())
  }
  const lineageMatch = /^\/api\/v1\/governance\/lineage\/([^/]+)$/.exec(url.pathname)
  if (method === 'GET' && lineageMatch) {
    if (url.searchParams.size) throw new HttpError(400, 'query-not-allowed')
    const id = decodeURIComponent(lineageMatch[1])
    if (!/^(?:case|action):[a-f0-9]{64}$/.test(id) && !/^[a-f0-9]{64}$/.test(id)) throw new HttpError(400, 'lineage-id-invalid')
    const model = await governance.readModel(new Date().toISOString())
    const lineage = model.lineage.find((item) => item.id === id || item.actionId === id || item.caseId === id)
    if (!lineage) throw new HttpError(404, 'lineage-not-found')
    return json(response, 200, lineage)
  }
  if (method === 'POST' && url.pathname === '/api/v1/governance/decisions') {
    requireJsonContentType(request)
    const body = await readJsonBody(request)
    try {
      return json(response, 201, await governance.appendHumanDecision(body as unknown as HumanDecisionInput))
    } catch (error) {
      throw governanceError(error)
    }
  }
  if (method === 'POST' && url.pathname === '/api/v1/governance/bindings') {
    requireJsonContentType(request)
    const body = await readJsonBody(request)
    try {
      return json(response, 201, await governance.appendBinding(body as unknown as ConfirmedBindingInput))
    } catch (error) {
      throw governanceError(error)
    }
  }
  throw new HttpError(404, 'route-not-found')
}

function boundedGovernanceSummary(model: GovernanceReadModel): GovernanceReadModel {
  return {
    ...model,
    inventory: model.inventory.slice(0, MAX_SUMMARY_ROWS),
    activity: model.activity.slice(0, MAX_SUMMARY_ROWS),
    controls: model.controls.slice(0, MAX_SUMMARY_ROWS),
    decisions: model.decisions.slice(0, MAX_SUMMARY_ROWS),
    outcomes: model.outcomes.slice(0, MAX_SUMMARY_ROWS),
    lineage: model.lineage.slice(0, MAX_SUMMARY_ROWS),
    gaps: model.gaps.slice(0, MAX_SUMMARY_GAPS),
  }
}

function pageProjection<T>(items: readonly T[], cursorValue: string | null, limitValue: string | null): { items: T[]; nextCursor?: string } {
  const cursor = parseCursor(cursorValue)
  const limit = parseLimit(limitValue) ?? 100
  const offset = cursor ? Number(Buffer.from(cursor, 'base64url').toString('utf8')) : 0
  const page = items.slice(offset, offset + limit)
  return { items: page, ...(offset + page.length < items.length ? { nextCursor: Buffer.from(String(offset + page.length), 'utf8').toString('base64url') } : {}) }
}

function parseLimit(value: string | null): number | undefined {
  if (value === null) return undefined
  if (!/^(?:[1-9]|[1-9][0-9]|100)$/.test(value)) throw new HttpError(400, 'limit-invalid')
  return Number(value)
}

function parseCursor(value: string | null): string | undefined {
  if (value === null) return undefined
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new HttpError(400, 'cursor-invalid')
  let decoded: string
  try { decoded = Buffer.from(value, 'base64url').toString('utf8') } catch { throw new HttpError(400, 'cursor-invalid') }
  if (!/^(?:0|[1-9][0-9]*)$/.test(decoded) || Buffer.from(decoded, 'utf8').toString('base64url') !== value) throw new HttpError(400, 'cursor-invalid')
  return value
}

function assertQueryKeys(url: URL, allowed: readonly string[]): void {
  const allow = new Set(allowed)
  for (const key of url.searchParams.keys()) if (!allow.has(key)) throw new HttpError(400, 'query-not-allowed')
}

function requireJsonContentType(request: IncomingMessage): void {
  const contentType = request.headers['content-type']
  if (typeof contentType !== 'string' || !contentType.toLowerCase().startsWith('application/json')) throw new HttpError(415, 'content-type-required')
}

function governanceError(error: unknown): HttpError {
  if (!(error instanceof GovernanceServiceError)) return error instanceof HttpError ? error : new HttpError(400, 'governance-write-rejected')
  const notFound = error.code.endsWith('-not-found')
  return new HttpError(notFound ? 404 : 400, error.code)
}

async function serveStatic(response: ServerResponse, pathname: string, staticDirectory: string): Promise<void> {
  const root = resolve(staticDirectory)
  const requested = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '')
  let path = resolve(root, requested)
  if (path !== root && !path.startsWith(`${root}${sep}`)) throw new HttpError(404, 'asset-not-found')
  try {
    const metadata = await stat(path)
    if (!metadata.isFile()) throw new HttpError(404, 'asset-not-found')
  } catch {
    path = resolve(root, 'index.html')
  }
  response.setHeader('Content-Type', contentType(path))
  if (path.endsWith('index.html')) {
    const html = await readFile(path, 'utf8')
    response.end(html.replace('<head>', '<head><meta name="sancussight-mode" content="local-collector">'))
    return
  }
  await new Promise<void>((resolvePromise, reject) => {
    createReadStream(path).on('error', reject).on('end', resolvePromise).pipe(response)
  })
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'body-too-large')
    chunks.push(buffer)
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'invalid-json')
  }
}

function parseSourceId(value: string): EvidenceSourceId {
  if (!SOURCE_IDS.has(value as EvidenceSourceId)) throw new HttpError(404, 'unknown-adapter')
  return value as EvidenceSourceId
}

function aggregateHealth(sources: EvidenceSourceState[]): string {
  if (sources.some((source) => source.health === 'failed')) return 'failed'
  if (sources.some((source) => source.health === 'permission-required')) return 'permission-required'
  if (sources.some((source) => source.health === 'stale')) return 'stale'
  if (sources.some((source) => source.health === 'current')) return 'current'
  return 'not-configured'
}

function json(response: ServerResponse, status: number, value: unknown): void {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.writeHead(status).end(JSON.stringify(value))
}

function contentType(path: string): string {
  return ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png' } as Record<string, string>)[extname(path)] ?? 'application/octet-stream'
}

class HttpError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string) {
    super(code)
    this.status = status
    this.code = code
  }
}
