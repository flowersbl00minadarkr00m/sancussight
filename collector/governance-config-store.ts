import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assertSourceOutsideCollector, atomicWriteJson } from './config-store.ts'
import type { GovernanceNativeSourceId } from '../src/domain/governance/model.ts'

export interface GovernanceSourceConfig {
  id: GovernanceNativeSourceId
  artifactPath: string
  enabled: boolean
}

export interface GovernanceConfig {
  schemaVersion: 1
  pollIntervalMs: number
  sources: GovernanceSourceConfig[]
}

const GOVERNANCE_SOURCE_IDS: readonly GovernanceNativeSourceId[] = ['findmnemo', 'flowsensa', 'runtime-inventory']

export const EMPTY_GOVERNANCE_CONFIG: GovernanceConfig = { schemaVersion: 1, pollIntervalMs: 15_000, sources: [] }

export class GovernanceConfigStore {
  readonly dataDirectory: string
  readonly configPath: string

  constructor(dataDirectory: string) {
    this.dataDirectory = dataDirectory
    this.configPath = resolve(dataDirectory, 'governance-config.json')
  }

  async load(): Promise<GovernanceConfig> {
    try {
      const value = JSON.parse(await readFile(this.configPath, 'utf8')) as Partial<GovernanceConfig>
      if (value.schemaVersion !== 1 || !Array.isArray(value.sources)) throw new Error('Governance configuration is incompatible.')
      return { schemaVersion: 1, pollIntervalMs: clampPollInterval(value.pollIntervalMs), sources: value.sources.map(validateSourceConfig) }
    } catch (error) {
      if (isMissingFile(error)) return structuredClone(EMPTY_GOVERNANCE_CONFIG)
      throw error
    }
  }

  async save(config: GovernanceConfig): Promise<void> {
    for (const source of config.sources) assertSourceOutsideCollector(this.dataDirectory, source.artifactPath)
    await atomicWriteJson(this.configPath, { schemaVersion: 1, pollIntervalMs: clampPollInterval(config.pollIntervalMs), sources: config.sources.map(validateSourceConfig) })
  }
}

function validateSourceConfig(value: GovernanceSourceConfig): GovernanceSourceConfig {
  if (!GOVERNANCE_SOURCE_IDS.includes(value.id)) throw new Error('Unknown governance source.')
  if (typeof value.artifactPath !== 'string' || !value.artifactPath.trim()) throw new Error('Governance source artifact path is required.')
  return { id: value.id, artifactPath: resolve(value.artifactPath), enabled: value.enabled !== false }
}

function clampPollInterval(value: unknown): number {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 15_000
  return Math.min(300_000, Math.max(5_000, Math.round(numeric)))
}

function isMissingFile(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT'
}
