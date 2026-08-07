import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import type { EvidenceSourceId, EvidenceSourceState, ReleaseEvidenceManifestV1 } from '../src/types.ts'
import { validateReleaseEvidenceManifest } from '../src/lib/release-gate.ts'
import type { ReleaseProgressRead } from '../src/lib/release-progress.ts'
import { createInitialAdapters } from './adapters/index.ts'
import type { EvidenceAdapter } from './adapters/types.ts'
import { CollectorConfigStore } from './config-store.ts'
import { EvidenceStore } from './evidence-store.ts'
import { ReleaseProgressStore } from './release-progress-store.ts'
import { GovernanceService } from './governance-service.ts'
import { GovernanceConfigStore } from './governance-config-store.ts'
import { GovernanceStore } from './governance-store.ts'
import { CollectorScheduler } from './scheduler.ts'
import { startCollectorServer, type CollectorService, type ConfigureSourceInput } from './server.ts'

const SOURCE_CATALOG: Record<EvidenceSourceId, Pick<EvidenceSourceState, 'displayName' | 'evidenceType'>> = {
  'agent-beacon': { displayName: 'Agent Beacon', evidenceType: 'Runtime and inventory JSONL' },
  'runtime-telemetry': { displayName: 'Runtime telemetry', evidenceType: 'Sanitized Codex, Claude, and Pi JSONL' },
  praxen: { displayName: 'Praxen', evidenceType: 'Machine-readable assessment report' },
  pipelock: { displayName: 'Pipelock', evidenceType: 'Signed receipt or Audit Packet' },
  rampart: { displayName: 'RAMPART', evidenceType: 'Sanitized safety-test report' },
  aimap: { displayName: 'AIMap', evidenceType: 'Authorized completed-scan export' },
}

export class LocalCollectorService implements CollectorService {
  private states = new Map<EvidenceSourceId, EvidenceSourceState>()
  private readonly configStore: CollectorConfigStore
  private readonly evidenceStore: EvidenceStore
  private readonly adapters: Map<EvidenceSourceId, EvidenceAdapter>
  private readonly configuredSources = new Set<EvidenceSourceId>()
  private readonly scheduler: CollectorScheduler
  private readonly releaseManifestPath: string
  private readonly progressStore: ReleaseProgressStore

  constructor(configStore: CollectorConfigStore, evidenceStore: EvidenceStore, adapters = createInitialAdapters(), releaseManifestPath = resolve(process.env.LOCALAPPDATA ?? homedir(), 'SancusSight', 'operations', 'manifests', 'current-release.json'), progressStore = new ReleaseProgressStore()) {
    this.configStore = configStore
    this.evidenceStore = evidenceStore
    this.adapters = adapters
    this.releaseManifestPath = releaseManifestPath
    this.progressStore = progressStore
    this.scheduler = new CollectorScheduler((source) => this.collectSource(source))
    for (const [id, catalog] of Object.entries(SOURCE_CATALOG) as [EvidenceSourceId, typeof SOURCE_CATALOG[EvidenceSourceId]][]) {
      this.states.set(id, { id, ...catalog, health: 'not-configured', rejectedCount: 0 })
    }
  }

  async initialize(): Promise<void> {
    await this.evidenceStore.initialize()
    const config = await this.configStore.load()
    const accepted = await this.evidenceStore.readAccepted()
    const rejected = await this.evidenceStore.readRejected()
    for (const source of config.sources) {
      if (source.enabled) this.configuredSources.add(source.id)
      const current = this.states.get(source.id)!
      const sourceEvidence = accepted.filter((item) => item.source === source.id)
      const lastAcceptedAt = sourceEvidence.map((item) => item.importedAt).sort().at(-1)
      this.states.set(source.id, {
        ...current,
        health: source.enabled ? 'stale' : 'not-configured',
        checkpoint: this.evidenceStore.getCheckpoint(source.id)?.cursor,
        ...(lastAcceptedAt ? { lastAcceptedAt } : {}),
        rejectedCount: rejected.filter((item) => item.source === source.id).length,
      })
    }
    this.scheduler.start(() => [...this.configuredSources])
  }

  async getSources(): Promise<EvidenceSourceState[]> {
    return [...this.states.values()]
  }

  async configure(source: EvidenceSourceId, input: ConfigureSourceInput): Promise<EvidenceSourceState> {
    await this.adapters.get(source)!.validate(input.artifactPath)
    const config = await this.configStore.load()
    const sources = config.sources.filter((item) => item.id !== source)
    sources.push({ id: source, artifactPath: input.artifactPath, enabled: true })
    await this.configStore.save({ ...config, sources })
    this.configuredSources.add(source)
    const next = { ...this.states.get(source)!, health: 'stale' as const, errorCode: undefined }
    this.states.set(source, next)
    return next
  }

  async refresh(source: EvidenceSourceId): Promise<EvidenceSourceState> {
    await this.scheduler.refresh(source)
    return this.states.get(source)!
  }

  async disconnect(source: EvidenceSourceId): Promise<void> {
    const config = await this.configStore.load()
    await this.configStore.save({ ...config, sources: config.sources.filter((item) => item.id !== source) })
    this.configuredSources.delete(source)
    await this.evidenceStore.removeSource(source)
    this.states.set(source, { id: source, ...SOURCE_CATALOG[source], health: 'not-configured', rejectedCount: 0 })
  }

  async getEvidence(cursor?: string): Promise<{ items: Awaited<ReturnType<EvidenceStore['readAccepted']>>; nextCursor?: string }> {
    const evidence = await this.evidenceStore.readAccepted()
    evidence.sort((left, right) => right.observedAt.localeCompare(left.observedAt) || left.id.localeCompare(right.id))
    return page(evidence, cursor)
  }

  async getRejected(cursor?: string): Promise<{ items: Awaited<ReturnType<EvidenceStore['readRejected']>>; nextCursor?: string }> {
    return page(await this.evidenceStore.readRejected(), cursor)
  }

  async getReleaseManifest(): Promise<ReleaseEvidenceManifestV1 | undefined> {
    try {
      const manifest = JSON.parse(await readFile(this.releaseManifestPath, 'utf8')) as ReleaseEvidenceManifestV1
      return validateReleaseEvidenceManifest(manifest).valid ? manifest : undefined
    } catch {
      return undefined
    }
  }

  async getReleaseProgress(): Promise<ReleaseProgressRead> {
    const progress = await this.progressStore.read()
    if (!progress.snapshot) return progress
    const manifest = await this.getReleaseManifest()
    if (manifest && progress.snapshot.releaseRunId !== manifest.releaseRunId) {
      return { stale: true, errors: ['progress:run-mismatch'] }
    }
    return progress
  }

  async retryRejected(id: string): Promise<void> {
    const rejection = (await this.evidenceStore.readRejected()).find((item) => item.id === id)
    if (!rejection) throw new Error('Rejected evidence record was not found.')
    await this.scheduler.refresh(rejection.source)
  }

  close(): void {
    this.scheduler.stop()
  }

  private async collectSource(source: EvidenceSourceId): Promise<void> {
    const attemptedAt = new Date().toISOString()
    const current = this.states.get(source)!
    this.states.set(source, { ...current, lastAttemptAt: attemptedAt })
    try {
      const config = await this.configStore.load()
      const sourceConfig = config.sources.find((item) => item.id === source && item.enabled)
      if (!sourceConfig) return
      const checkpoint = this.evidenceStore.getCheckpoint(source)
      const result = await this.adapters.get(source)!.collect(sourceConfig.artifactPath, checkpoint, attemptedAt)
      for (const rejection of result.rejected) await this.evidenceStore.reject(rejection)
      const checkpointChanged = result.checkpoint.cursor !== checkpoint?.cursor
      const acceptedCount = checkpointChanged || result.accepted.length
        ? await this.evidenceStore.accept(result.accepted, result.checkpoint)
        : 0
      const rejected = (await this.evidenceStore.readRejected()).filter((item) => item.source === source)
      const previousAcceptedAt = this.states.get(source)?.lastAcceptedAt
      this.states.set(source, {
        ...current,
        health: result.rejected.length && !acceptedCount && !checkpointChanged ? 'failed' : 'current',
        lastAttemptAt: attemptedAt,
        lastAcceptedAt: acceptedCount ? attemptedAt : previousAcceptedAt,
        checkpoint: checkpointChanged ? result.checkpoint.cursor : checkpoint?.cursor,
        lag: result.lag,
        rejectedCount: rejected.length,
        ...(result.rejected.length ? { errorCode: result.rejected[0].errorCode } : { errorCode: undefined }),
      })
    } catch (error) {
      const code = isPermissionError(error) ? 'permission-required' : 'collection-failed'
      this.states.set(source, { ...current, health: code === 'permission-required' ? 'permission-required' : 'failed', lastAttemptAt: attemptedAt, errorCode: code })
    }
  }
}

function page<T>(items: T[], cursor: string | undefined): { items: T[]; nextCursor?: string } {
  const start = Math.max(0, Number.parseInt(cursor ?? '0', 10) || 0)
  const pageItems = items.slice(start, start + 100)
  const next = start + pageItems.length
  return { items: pageItems, ...(next < items.length ? { nextCursor: String(next) } : {}) }
}

function isPermissionError(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && (error.code === 'EACCES' || error.code === 'EPERM')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.SANCUSSIGHT_PORT ?? 43117)
  const dataDirectory = resolve(process.env.SANCUSSIGHT_DATA_DIR ?? homedir(), '.sancussight', 'collector-data')
  const evidenceStore = new EvidenceStore(dataDirectory)
  const service = new LocalCollectorService(new CollectorConfigStore(dataDirectory), evidenceStore)
  const governanceStore = new GovernanceStore(dataDirectory)
  await service.initialize()
  await governanceStore.initialize()
  const governance = new GovernanceService(governanceStore, () => service.getSources(), evidenceStore, new GovernanceConfigStore(dataDirectory))
  await governance.initialize()
  const running = await startCollectorServer({ port, staticDirectory: resolve('dist'), service, governanceService: governance })
  process.stdout.write(`SancusSight local collector: ${running.origin}\n`)
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => void running.close().finally(() => process.exit(0)))
}
