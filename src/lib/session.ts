import type { Registry, RegistryProvenance } from '../types'
import {
  type Sha256,
  validateAssetVersionMetadata,
  verifyAssetVersionHistoryIdentity,
} from './asset-versions.ts'

interface NormalizeOptions {
  now?: string
  refreshTimestamp?: boolean
  defaultMode?: RegistryProvenance['mode']
}

export function createDemoRegistry(seed: Registry, now = new Date().toISOString()): Registry {
  const clone = structuredClone(seed)
  return {
    ...clone,
    updatedAt: now,
    provenance: {
      mode: 'demo',
      sourceUpdatedAt: seed.provenance?.sourceUpdatedAt ?? seed.updatedAt,
    },
  }
}

export function normalizeRegistry(value: unknown, options: NormalizeOptions = {}): Registry | undefined {
  if (!isRecord(value)) return undefined
  if (!Array.isArray(value.assets) || !Array.isArray(value.platforms)) return undefined
  if (!value.assets.every(isImportableAsset)) return undefined

  const now = options.now ?? new Date().toISOString()
  const explicitProvenance = readProvenance(value.provenance)
  const sourceUpdatedAt = explicitProvenance?.sourceUpdatedAt
    ?? (typeof value.updatedAt === 'string' ? value.updatedAt : now)
  const mode = explicitProvenance?.mode ?? options.defaultMode ?? 'local'
  const connectedAt = mode === 'local' ? explicitProvenance?.connectedAt ?? now : undefined

  return {
    schemaVersion: 2,
    platforms: value.platforms.filter((platform): platform is string => typeof platform === 'string'),
    assets: value.assets as Registry['assets'],
    updatedAt: options.refreshTimestamp || typeof value.updatedAt !== 'string' ? now : value.updatedAt,
    provenance: {
      mode,
      sourceUpdatedAt,
      ...(connectedAt ? { connectedAt } : {}),
    },
  }
}

export async function normalizeRegistryVerified(
  value: unknown,
  sha256: Sha256,
  options: NormalizeOptions = {},
): Promise<Registry | undefined> {
  const registry = normalizeRegistry(value, options)
  if (!registry) return undefined
  const identities = await Promise.all(registry.assets.map((asset) => (
    verifyAssetVersionHistoryIdentity(asset, sha256)
  )))
  return identities.every(Boolean) ? registry : undefined
}

export async function verifyRegistryAssetVersionIdentities(
  registry: Registry,
  sha256: Sha256,
): Promise<boolean> {
  const identities = await Promise.all(registry.assets.map((asset) => (
    verifyAssetVersionHistoryIdentity(asset, sha256)
  )))
  return identities.every(Boolean)
}

export function prepareLocalSave(registry: Registry, now = new Date().toISOString()): Registry {
  return {
    ...registry,
    schemaVersion: 2,
    updatedAt: now,
    provenance: {
      mode: 'local',
      connectedAt: registry.provenance?.connectedAt ?? now,
      sourceUpdatedAt: now,
    },
  }
}

function readProvenance(value: unknown): RegistryProvenance | undefined {
  if (!isRecord(value)) return undefined
  if (value.mode !== 'demo' && value.mode !== 'local') return undefined
  if (typeof value.sourceUpdatedAt !== 'string') return undefined
  if (value.connectedAt !== undefined && typeof value.connectedAt !== 'string') return undefined
  return {
    mode: value.mode,
    sourceUpdatedAt: value.sourceUpdatedAt,
    ...(typeof value.connectedAt === 'string' ? { connectedAt: value.connectedAt } : {}),
  }
}

function isImportableAsset(value: unknown): value is Registry['assets'][number] {
  if (!isRecord(value)) return false
  if (!['id', 'name', 'kind', 'format', 'location', 'sensitivity'].every(key => typeof value[key] === 'string')) return false
  if (typeof value.sharedByDesign !== 'boolean') return false
  if (!Array.isArray(value.coverage) || !value.coverage.every(entry =>
    isRecord(entry) && typeof entry.platform === 'string' && (entry.lastVerified === undefined || typeof entry.lastVerified === 'string')
  )) return false
  if (!Array.isArray(value.providerDependencies) || !value.providerDependencies.every(dependency =>
    isRecord(dependency) && typeof dependency.provider === 'string' && typeof dependency.capability === 'string' &&
    (dependency.fallback === undefined || typeof dependency.fallback === 'string')
  )) return false
  if (!Array.isArray(value.evidence) || !value.evidence.every(point =>
    isRecord(point) && typeof point.label === 'string' && typeof point.date === 'string'
  )) return false
  if (value.dependsOn !== undefined && !isStringArray(value.dependsOn)) return false
  if (value.consumingProducts !== undefined && !isStringArray(value.consumingProducts)) return false
  if (value.evidenceBindings !== undefined && (!Array.isArray(value.evidenceBindings) || !value.evidenceBindings.every(binding =>
    isRecord(binding) && ['agent-beacon', 'praxen', 'pipelock'].includes(String(binding.source)) && typeof binding.externalId === 'string'
  ))) return false
  if (!validateAssetVersionMetadata(value)) return false

  if (value.actionControl !== undefined) {
    const control = value.actionControl
    if (!isRecord(control) || typeof control.authority !== 'string' || typeof control.confirmation !== 'string' || typeof control.reversible !== 'boolean') return false
    if (!isStringArray(control.requiredControls) || !isStringArray(control.evidenceNeeds)) return false
  }
  if (value.acceptedAsset !== undefined) {
    const accepted = value.acceptedAsset
    if (!isRecord(accepted) || typeof accepted.decisionRationale !== 'string' || typeof accepted.sourceProvenance !== 'string' || typeof accepted.scope !== 'string') return false
  }
  if (value.candidateTool !== undefined) {
    const tool = value.candidateTool
    if (!isRecord(tool)) return false
    if (!['sourceUrl', 'license', 'attributionNotes', 'evidenceType', 'dataEgress', 'trustBoundary', 'maintenanceStatus', 'integrationLevel', 'disposition', 'dispositionRationale', 'assessmentStatus']
      .every(key => typeof tool[key] === 'string')) return false
    if (!isStringArray(tool.runtimeRequirements) || !isStringArray(tool.knownUseConstraints) || !isStringArray(tool.dimensions) || !isStringArray(tool.supportedChecks)) return false
  }
  return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}
