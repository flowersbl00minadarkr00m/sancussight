import { mkdir, open, readFile, rename, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { EvidenceEnvelopeV1, EvidenceSourceId, EvidenceVerification } from '../src/types.ts'
import { atomicWriteJson } from './config-store.ts'
import { validateEvidenceEnvelope } from './envelope.ts'

const MAX_DEDUPE_IDS = 250_000
const MAX_ACCEPTED_PER_SOURCE = 10_000
const MAX_REJECTED_PER_SOURCE = 1_000

export interface SourceCheckpoint {
  source: EvidenceSourceId
  cursor: string
  updatedAt: string
  artifactIdentity?: string
}

export interface RejectedEvidence {
  id: string
  source: EvidenceSourceId
  artifactName: string
  rejectedAt: string
  errorCode: string
  guidance: string
  verification?: EvidenceVerification
}

interface CheckpointDocument {
  schemaVersion: 1
  sources: Partial<Record<EvidenceSourceId, SourceCheckpoint>>
}

interface FileCache<T> {
  revision: string
  records: T[]
}

export class EvidenceStore {
  readonly dataDirectory: string
  readonly acceptedPath: string
  readonly rejectedPath: string
  readonly checkpointsPath: string
  readonly activityPath: string
  private readonly acceptedIds = new Set<string>()
  private readonly rejectedIds = new Set<string>()
  private readonly acceptedCountBySource = new Map<EvidenceSourceId, number>()
  private readonly rejectedCountBySource = new Map<EvidenceSourceId, number>()
  private checkpoints: CheckpointDocument = { schemaVersion: 1, sources: {} }
  private acceptedCache?: FileCache<EvidenceEnvelopeV1>
  private rejectedCache?: FileCache<RejectedEvidence>

  constructor(dataDirectory: string) {
    this.dataDirectory = dataDirectory
    this.acceptedPath = resolve(dataDirectory, 'evidence.jsonl')
    this.rejectedPath = resolve(dataDirectory, 'rejected.jsonl')
    this.checkpointsPath = resolve(dataDirectory, 'checkpoints.json')
    this.activityPath = resolve(dataDirectory, 'activity.jsonl')
  }

  async initialize(): Promise<void> {
    await mkdir(this.dataDirectory, { recursive: true })
    this.acceptedIds.clear()
    this.rejectedIds.clear()
    this.acceptedCountBySource.clear()
    this.rejectedCountBySource.clear()
    for (const envelope of await this.readAccepted()) {
      this.acceptedIds.add(envelope.id)
      this.acceptedCountBySource.set(envelope.source, (this.acceptedCountBySource.get(envelope.source) ?? 0) + 1)
      if (this.acceptedIds.size > MAX_DEDUPE_IDS) throw new Error('Evidence index exceeds the supported personal-registry limit.')
    }
    for (const rejection of await this.readRejected()) {
      this.rejectedIds.add(rejection.id)
      this.rejectedCountBySource.set(rejection.source, (this.rejectedCountBySource.get(rejection.source) ?? 0) + 1)
    }
    this.checkpoints = await this.readCheckpoints()
  }

  hasAccepted(id: string): boolean {
    return this.acceptedIds.has(id)
  }

  getCheckpoint(source: EvidenceSourceId): SourceCheckpoint | undefined {
    return this.checkpoints.sources[source]
  }

  async accept(envelopes: readonly EvidenceEnvelopeV1[], checkpoint: SourceCheckpoint): Promise<number> {
    const fresh = envelopes.filter((envelope) => {
      if (!validateEvidenceEnvelope(envelope)) throw new Error('Invalid normalized evidence envelope.')
      return !this.acceptedIds.has(envelope.id)
    })
    await appendJsonLines(this.acceptedPath, fresh)
    if (fresh.length) this.acceptedCache = undefined
    for (const envelope of fresh) {
      this.acceptedIds.add(envelope.id)
      this.acceptedCountBySource.set(envelope.source, (this.acceptedCountBySource.get(envelope.source) ?? 0) + 1)
    }
    const nextCheckpoints: CheckpointDocument = {
      schemaVersion: 1,
      sources: { ...this.checkpoints.sources, [checkpoint.source]: checkpoint },
    }
    await atomicWriteJson(this.checkpointsPath, nextCheckpoints)
    this.checkpoints = nextCheckpoints
    if (fresh.some((envelope) => (this.acceptedCountBySource.get(envelope.source) ?? 0) > MAX_ACCEPTED_PER_SOURCE)) await this.compact()
    return fresh.length
  }

  async reject(rejection: RejectedEvidence): Promise<boolean> {
    if (this.rejectedIds.has(rejection.id)) return false
    await appendJsonLines(this.rejectedPath, [sanitizeRejection(rejection)])
    this.rejectedCache = undefined
    this.rejectedIds.add(rejection.id)
    this.rejectedCountBySource.set(rejection.source, (this.rejectedCountBySource.get(rejection.source) ?? 0) + 1)
    if ((this.rejectedCountBySource.get(rejection.source) ?? 0) > MAX_REJECTED_PER_SOURCE) await this.compact()
    return true
  }

  async readAccepted(): Promise<EvidenceEnvelopeV1[]> {
    const revision = await fileRevision(this.acceptedPath)
    if (this.acceptedCache?.revision === revision) return [...this.acceptedCache.records]
    const records = [...new Map((await readJsonLines(this.acceptedPath, validateEvidenceEnvelope)).map((record) => [record.id, record])).values()]
    this.acceptedCache = { revision: await fileRevision(this.acceptedPath), records }
    return [...records]
  }

  async readRejected(): Promise<RejectedEvidence[]> {
    const revision = await fileRevision(this.rejectedPath)
    if (this.rejectedCache?.revision === revision) return [...this.rejectedCache.records]
    const records = [...new Map((await readJsonLines(this.rejectedPath, isRejectedEvidence)).map((record) => [record.id, record])).values()]
    this.rejectedCache = { revision: await fileRevision(this.rejectedPath), records }
    return [...records]
  }

  async removeSource(source: EvidenceSourceId): Promise<void> {
    const retainedEvidence = (await this.readAccepted()).filter((item) => item.source !== source)
    const retainedRejected = (await this.readRejected()).filter((item) => item.source !== source)
    await replaceJsonLines(this.acceptedPath, retainedEvidence)
    await replaceJsonLines(this.rejectedPath, retainedRejected)
    this.acceptedCache = undefined
    this.rejectedCache = undefined
    const next = { ...this.checkpoints.sources }
    delete next[source]
    this.checkpoints = { schemaVersion: 1, sources: next }
    await atomicWriteJson(this.checkpointsPath, this.checkpoints)
    await this.initialize()
  }

  async compact(): Promise<void> {
    const accepted = retainPerSource(await this.readAccepted(), MAX_ACCEPTED_PER_SOURCE, (item) => item.source, (item) => item.importedAt)
    const rejected = retainPerSource(await this.readRejected(), MAX_REJECTED_PER_SOURCE, (item) => item.source, (item) => item.rejectedAt)
    await replaceJsonLines(this.acceptedPath, accepted)
    await replaceJsonLines(this.rejectedPath, rejected)
    this.acceptedCache = undefined
    this.rejectedCache = undefined
    await this.initialize()
  }

  private async readCheckpoints(): Promise<CheckpointDocument> {
    try {
      const value = JSON.parse(await readFile(this.checkpointsPath, 'utf8')) as CheckpointDocument
      if (value.schemaVersion !== 1 || !value.sources) throw new Error('Collector checkpoints are incompatible.')
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
  try {
    await handle.writeFile(values.map((value) => `${JSON.stringify(value)}\n`).join(''), 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
}

async function replaceJsonLines(path: string, values: readonly unknown[]): Promise<void> {
  await mkdir(resolve(path, '..'), { recursive: true })
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`
  const handle = await open(temporaryPath, 'wx', 0o600)
  try {
    await handle.writeFile(values.map((value) => `${JSON.stringify(value)}\n`).join(''), 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  try {
    await rename(temporaryPath, path)
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

async function readJsonLines<T>(path: string, validate: (value: unknown) => value is T): Promise<T[]> {
  try {
    const text = await readFile(path, 'utf8')
    return text.split(/\r?\n/).filter(Boolean).map((line) => {
      const value: unknown = JSON.parse(line)
      if (!validate(value)) throw new Error('Collector data contains an incompatible record.')
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

function sanitizeRejection(value: RejectedEvidence): RejectedEvidence {
  return {
    ...value,
    artifactName: value.artifactName.replaceAll('\\', '/').split('/').filter(Boolean).at(-1)?.slice(0, 160) ?? 'evidence',
    guidance: value.guidance.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').slice(0, 240),
  }
}

function isRejectedEvidence(value: unknown): value is RejectedEvidence {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<RejectedEvidence>
  return typeof item.id === 'string' && typeof item.source === 'string' && typeof item.errorCode === 'string'
}

function isMissingFile(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
}

function retainPerSource<T>(
  records: T[],
  limit: number,
  source: (record: T) => EvidenceSourceId,
  timestamp: (record: T) => string,
): T[] {
  const groups = new Map<EvidenceSourceId, T[]>()
  for (const record of records) {
    const group = groups.get(source(record)) ?? []
    group.push(record)
    groups.set(source(record), group)
  }
  return [...groups.values()].flatMap((group) => group.sort((left, right) => timestamp(left).localeCompare(timestamp(right))).slice(-limit))
}
