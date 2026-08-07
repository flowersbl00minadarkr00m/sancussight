import { mkdir, open, readFile, rename, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { LOGICAL_ASSET_KINDS, type GovernanceBinding, type GovernanceEventV1 } from '../src/domain/governance/model.ts'
import { validateGovernanceEvent } from './governance-event.ts'
import { atomicWriteJson } from './config-store.ts'

const MAX_DEDUPE_IDS = 250_000
const MAX_EVENTS_PER_SOURCE = 100_000
const MAX_REJECTED_PER_SOURCE = 1_000
const MAX_BINDINGS = 100_000

export interface GovernanceCheckpoint {
  source: string
  cursor: string
  updatedAt: string
  artifactIdentity?: string
}

export interface RejectedGovernanceEvent {
  id: string
  source: string
  artifactName: string
  rejectedAt: string
  errorCode: string
  guidance: string
}

interface CheckpointDocument {
  schemaVersion: 1
  sources: Record<string, GovernanceCheckpoint>
}

interface FileCache<T> {
  revision: string
  records: T[]
}

export interface GovernancePage {
  events: GovernanceEventV1[]
  nextCursor?: string
}

export class GovernanceStore {
  readonly dataDirectory: string
  readonly acceptedPath: string
  readonly rejectedPath: string
  readonly checkpointsPath: string
  readonly bindingsPath: string
  private readonly acceptedIds = new Set<string>()
  private readonly rejectedIds = new Set<string>()
  private readonly eventCountBySource = new Map<string, number>()
  private readonly rejectedCountBySource = new Map<string, number>()
  private readonly bindingIds = new Set<string>()
  private checkpoints: CheckpointDocument = { schemaVersion: 1, sources: {} }
  private eventsCache?: FileCache<GovernanceEventV1>
  private rejectedCache?: FileCache<RejectedGovernanceEvent>
  private bindingsCache?: FileCache<GovernanceBinding>

  constructor(dataDirectory: string) {
    this.dataDirectory = dataDirectory
    this.acceptedPath = resolve(dataDirectory, 'governance-events.jsonl')
    this.rejectedPath = resolve(dataDirectory, 'governance-rejected.jsonl')
    this.checkpointsPath = resolve(dataDirectory, 'governance-checkpoints.json')
    this.bindingsPath = resolve(dataDirectory, 'governance-bindings.jsonl')
  }

  async initialize(): Promise<void> {
    await mkdir(this.dataDirectory, { recursive: true })
    this.acceptedIds.clear(); this.rejectedIds.clear(); this.eventCountBySource.clear(); this.rejectedCountBySource.clear()
    for (const event of await this.readEvents()) {
      this.acceptedIds.add(event.id)
      this.eventCountBySource.set(event.source.id, (this.eventCountBySource.get(event.source.id) ?? 0) + 1)
      if (this.acceptedIds.size > MAX_DEDUPE_IDS) throw new Error('Governance event index exceeds the supported personal-registry limit.')
    }
    for (const rejection of await this.readRejected()) {
      this.rejectedIds.add(rejection.id)
      this.rejectedCountBySource.set(rejection.source, (this.rejectedCountBySource.get(rejection.source) ?? 0) + 1)
    }
    this.bindingIds.clear()
    for (const binding of await this.readBindings()) {
      this.bindingIds.add(binding.id)
      if (this.bindingIds.size > MAX_BINDINGS) throw new Error('Governance binding index exceeds the supported personal-registry limit.')
    }
    this.checkpoints = await this.readCheckpoints()
  }

  getCheckpoint(source: string): GovernanceCheckpoint | undefined { return this.checkpoints.sources[source] }
  hasEvent(id: string): boolean { return this.acceptedIds.has(id) }

  async accept(events: readonly GovernanceEventV1[], checkpoint: GovernanceCheckpoint): Promise<number> {
    if (events.some((event) => !validateGovernanceEvent(event))) throw new Error('Invalid GovernanceEventV1 record.')
    const fresh = events.filter((event) => !this.acceptedIds.has(event.id))
    await appendJsonLines(this.acceptedPath, fresh)
    if (fresh.length) this.eventsCache = undefined
    for (const event of fresh) {
      this.acceptedIds.add(event.id)
      this.eventCountBySource.set(event.source.id, (this.eventCountBySource.get(event.source.id) ?? 0) + 1)
    }
    const next: CheckpointDocument = { schemaVersion: 1, sources: { ...this.checkpoints.sources, [checkpoint.source]: checkpoint } }
    await atomicWriteJson(this.checkpointsPath, next)
    this.checkpoints = next
    if (fresh.some((event) => (this.eventCountBySource.get(event.source.id) ?? 0) > MAX_EVENTS_PER_SOURCE)) await this.compact()
    return fresh.length
  }

  /** Append a SancusSight-owned governance event without advancing any producer checkpoint. */
  async appendLocal(events: readonly GovernanceEventV1[]): Promise<number> {
    if (events.some((event) => !validateGovernanceEvent(event))) throw new Error('Invalid GovernanceEventV1 record.')
    const fresh = events.filter((event) => !this.acceptedIds.has(event.id))
    await appendJsonLines(this.acceptedPath, fresh)
    if (fresh.length) this.eventsCache = undefined
    for (const event of fresh) {
      this.acceptedIds.add(event.id)
      this.eventCountBySource.set(event.source.id, (this.eventCountBySource.get(event.source.id) ?? 0) + 1)
    }
    return fresh.length
  }

  async reject(rejection: RejectedGovernanceEvent): Promise<boolean> {
    if (this.rejectedIds.has(rejection.id)) return false
    await appendJsonLines(this.rejectedPath, [sanitizeRejection(rejection)])
    this.rejectedCache = undefined
    this.rejectedIds.add(rejection.id)
    this.rejectedCountBySource.set(rejection.source, (this.rejectedCountBySource.get(rejection.source) ?? 0) + 1)
    if ((this.rejectedCountBySource.get(rejection.source) ?? 0) > MAX_REJECTED_PER_SOURCE) await this.compact()
    return true
  }

  async readEvents(): Promise<GovernanceEventV1[]> {
    const revision = await fileRevision(this.acceptedPath)
    if (this.eventsCache?.revision === revision) return [...this.eventsCache.records]
    const records = [...new Map((await readJsonLines(this.acceptedPath, validateGovernanceEvent)).map((record) => [record.id, record])).values()]
    this.eventsCache = { revision: await fileRevision(this.acceptedPath), records }
    return [...records]
  }

  async readRejected(): Promise<RejectedGovernanceEvent[]> {
    const revision = await fileRevision(this.rejectedPath)
    if (this.rejectedCache?.revision === revision) return [...this.rejectedCache.records]
    const records = [...new Map((await readJsonLines(this.rejectedPath, isRejectedGovernanceEvent)).map((record) => [record.id, record])).values()]
    this.rejectedCache = { revision: await fileRevision(this.rejectedPath), records }
    return [...records]
  }

  async readBindings(): Promise<GovernanceBinding[]> {
    const revision = await fileRevision(this.bindingsPath)
    if (this.bindingsCache?.revision === revision) return [...this.bindingsCache.records]
    const records = [...new Map((await readJsonLines(this.bindingsPath, isGovernanceBinding)).map((record) => [record.id, record])).values()]
    this.bindingsCache = { revision: await fileRevision(this.bindingsPath), records }
    return [...records]
  }

  async appendBinding(binding: GovernanceBinding): Promise<boolean> {
    if (!isGovernanceBinding(binding)) throw new Error('Invalid governance binding.')
    if (this.bindingIds.has(binding.id)) return false
    await appendJsonLines(this.bindingsPath, [binding])
    this.bindingsCache = undefined
    this.bindingIds.add(binding.id)
    return true
  }

  async pageEvents(options: { cursor?: string; limit?: number; source?: string } = {}): Promise<GovernancePage> {
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 500)
    const source = options.source
    const events = (await this.readEvents()).filter((event) => !source || event.source.id === source)
    const offset = decodeCursor(options.cursor)
    const page = events.slice(offset, offset + limit)
    return {
      events: page,
      ...(offset + page.length < events.length ? { nextCursor: encodeCursor(offset + page.length) } : {}),
    }
  }

  async compact(): Promise<void> {
    const events = await this.readEvents()
    const grouped = new Map<string, GovernanceEventV1[]>()
    for (const event of events) grouped.set(event.source.id, [...(grouped.get(event.source.id) ?? []), event])
    const retained = [...grouped.values()].flatMap((group) => group.sort((left, right) => left.observedAt.localeCompare(right.observedAt)).slice(-MAX_EVENTS_PER_SOURCE))
    const rejected = await this.readRejected()
    const rejectedBySource = new Map<string, RejectedGovernanceEvent[]>()
    for (const item of rejected) rejectedBySource.set(item.source, [...(rejectedBySource.get(item.source) ?? []), item])
    const retainedRejected = [...rejectedBySource.values()].flatMap((group) => group.sort((left, right) => left.rejectedAt.localeCompare(right.rejectedAt)).slice(-MAX_REJECTED_PER_SOURCE))
    await replaceJsonLines(this.acceptedPath, retained)
    await replaceJsonLines(this.rejectedPath, retainedRejected)
    this.eventsCache = undefined
    this.rejectedCache = undefined
    await this.initialize()
  }

  private async readCheckpoints(): Promise<CheckpointDocument> {
    try {
      const value = JSON.parse(await readFile(this.checkpointsPath, 'utf8')) as CheckpointDocument
      if (value.schemaVersion !== 1 || !value.sources || typeof value.sources !== 'object') throw new Error('Governance checkpoints are incompatible.')
      return value
    } catch (error) {
      if (isMissingFile(error)) return { schemaVersion: 1, sources: {} }
      throw error
    }
  }
}

async function appendJsonLines(path: string, values: readonly unknown[]): Promise<void> {
  if (!values.length) return
  const handle = await open(path, 'a', 0o600)
  try { await handle.writeFile(values.map((value) => `${JSON.stringify(value)}\n`).join(''), 'utf8'); await handle.sync() } finally { await handle.close() }
}

async function replaceJsonLines(path: string, values: readonly unknown[]): Promise<void> {
  await mkdir(resolve(path, '..'), { recursive: true })
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`
  const handle = await open(temporaryPath, 'wx', 0o600)
  try { await handle.writeFile(values.map((value) => `${JSON.stringify(value)}\n`).join(''), 'utf8'); await handle.sync() } finally { await handle.close() }
  try { await rename(temporaryPath, path) } catch (error) { await rm(temporaryPath, { force: true }); throw error }
}

async function readJsonLines<T>(path: string, validate: (value: unknown) => value is T): Promise<T[]> {
  try {
    const text = await readFile(path, 'utf8')
    return text.split(/\r?\n/).filter(Boolean).map((line) => {
      const value: unknown = JSON.parse(line)
      if (!validate(value)) throw new Error('Governance data contains an incompatible record.')
      return value
    })
  } catch (error) {
    if (isMissingFile(error)) return []
    throw error
  }
}

async function fileRevision(path: string): Promise<string> {
  try {
    const metadata = await stat(path)
    return `${metadata.size}:${metadata.mtimeMs}:${metadata.ctimeMs}`
  } catch (error) {
    if (isMissingFile(error)) return 'missing'
    throw error
  }
}

function sanitizeRejection(value: RejectedGovernanceEvent): RejectedGovernanceEvent {
  return { ...value, artifactName: value.artifactName.replaceAll('\\', '/').split('/').filter(Boolean).at(-1)?.slice(0, 160) ?? 'governance', guidance: value.guidance.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').slice(0, 240) }
}

function isRejectedGovernanceEvent(value: unknown): value is RejectedGovernanceEvent {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<RejectedGovernanceEvent>
  return typeof item.id === 'string' && typeof item.source === 'string' && typeof item.errorCode === 'string'
}

function isGovernanceBinding(value: unknown): value is GovernanceBinding {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Partial<GovernanceBinding>
  return hasOnlyKeys(value as Record<string, unknown>, ['id', 'from', 'to', 'scopeHash', 'confirmedAt', 'confirmedBy', 'evidenceRefs'])
    && typeof item.id === 'string' && /^[a-f0-9]{64}$/.test(item.id)
    && isCanonicalRef(item.from) && isCanonicalRef(item.to)
    && typeof item.scopeHash === 'string' && /^[a-f0-9]{64}$/.test(item.scopeHash)
    && typeof item.confirmedAt === 'string' && !Number.isNaN(Date.parse(item.confirmedAt))
    && typeof item.confirmedBy === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(item.confirmedBy)
    && Array.isArray(item.evidenceRefs) && item.evidenceRefs.length <= 32 && item.evidenceRefs.every((id) => typeof id === 'string' && /^[a-f0-9]{64}$/.test(id))
}

function isCanonicalRef(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const ref = value as Record<string, unknown>
  return hasOnlyKeys(ref, ['kind', 'id', 'namespace', 'label'])
    && typeof ref.kind === 'string' && LOGICAL_ASSET_KINDS.includes(ref.kind as typeof LOGICAL_ASSET_KINDS[number]) && typeof ref.id === 'string' && /^[a-f0-9]{64}$/.test(ref.id)
    && typeof ref.namespace === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(ref.namespace)
    && (ref.label === undefined || (typeof ref.label === 'string' && ref.label.length <= 160 && !/[\u0000-\u001f\u007f]/.test(ref.label)))
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

function isMissingFile(error: unknown): boolean { return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT' }
function encodeCursor(value: number): string { return Buffer.from(String(value), 'utf8').toString('base64url') }
function decodeCursor(value: string | undefined): number { if (!value) return 0; try { const parsed = Number(Buffer.from(value, 'base64url').toString('utf8')); return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0 } catch { return 0 } }
