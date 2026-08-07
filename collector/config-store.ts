import { chmod, mkdir, open, readFile, rename, rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, relative, resolve } from 'node:path'
import type { EvidenceSourceId } from '../src/types.ts'

export interface CollectorSourceConfig {
  id: EvidenceSourceId
  artifactPath: string
  enabled: boolean
}

export interface CollectorConfig {
  schemaVersion: 1
  pollIntervalMs: number
  sources: CollectorSourceConfig[]
}

export const EMPTY_COLLECTOR_CONFIG: CollectorConfig = {
  schemaVersion: 1,
  pollIntervalMs: 15_000,
  sources: [],
}

export class CollectorConfigStore {
  readonly dataDirectory: string
  readonly configPath: string

  constructor(dataDirectory: string) {
    this.dataDirectory = dataDirectory
    this.configPath = resolve(dataDirectory, 'config.json')
  }

  async load(): Promise<CollectorConfig> {
    try {
      const value = JSON.parse(await readFile(this.configPath, 'utf8')) as Partial<CollectorConfig>
      if (value.schemaVersion !== 1 || !Array.isArray(value.sources)) throw new Error('Collector configuration is incompatible.')
      return {
        schemaVersion: 1,
        pollIntervalMs: clampPollInterval(value.pollIntervalMs),
        sources: value.sources.map(validateSourceConfig),
      }
    } catch (error) {
      if (isMissingFile(error)) return structuredClone(EMPTY_COLLECTOR_CONFIG)
      throw error
    }
  }

  async save(config: CollectorConfig): Promise<void> {
    for (const source of config.sources) assertSourceOutsideCollector(this.dataDirectory, source.artifactPath)
    await atomicWriteJson(this.configPath, {
      schemaVersion: 1,
      pollIntervalMs: clampPollInterval(config.pollIntervalMs),
      sources: config.sources.map(validateSourceConfig),
    })
  }
}

export async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await chmod(dirname(path), 0o700)
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`
  const handle = await open(temporaryPath, 'wx', 0o600)
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  try {
    await rename(temporaryPath, path)
    await chmod(path, 0o600)
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

export function assertSourceOutsideCollector(dataDirectory: string, sourcePath: string): void {
  const dataRoot = resolve(dataDirectory)
  const source = resolve(sourcePath)
  const relationship = relative(dataRoot, source)
  if (!relationship || (!relationship.startsWith('..') && !relationship.startsWith(`..\\`))) {
    throw new Error('Source artifacts must be outside the collector-owned data directory.')
  }
}

function validateSourceConfig(value: CollectorSourceConfig): CollectorSourceConfig {
  if (!['agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap'].includes(value.id)) throw new Error('Unknown evidence source.')
  if (typeof value.artifactPath !== 'string' || !value.artifactPath.trim()) throw new Error('Source artifact path is required.')
  return { id: value.id, artifactPath: resolve(value.artifactPath), enabled: value.enabled !== false }
}

function clampPollInterval(value: unknown): number {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 15_000
  return Math.min(300_000, Math.max(5_000, Math.round(numeric)))
}

function isMissingFile(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
}
