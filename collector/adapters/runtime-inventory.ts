import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { createCanonicalRef } from '../../src/domain/governance/canonicalize.ts'
import { LOGICAL_ASSET_KINDS, type LogicalAssetKind } from '../../src/domain/governance/model.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import type { GovernanceCheckpoint } from '../governance-store.ts'
import type { GovernanceAdapter, GovernanceAdapterCollection } from './governance-types.ts'
import { artifactCursor, checkpointForGovernance, parseGovernanceCursor, readJsonDocuments, rejection, safeExternalId } from './governance-helpers.ts'

export class RuntimeInventoryAdapter implements GovernanceAdapter {
  readonly id = 'runtime-inventory' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const documents = await readJsonDocuments(this.reader, path)
    if (!documents.length || !documents.some((document) => isInventoryDocument(document.value))) throw new Error('Select an allowlisted Codex CLI/Claude Code runtime inventory snapshot.')
  }

  async collect(path: string, checkpoint: GovernanceCheckpoint | undefined, importedAt: string): Promise<GovernanceAdapterCollection> {
    const previous = parseGovernanceCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    for (const document of await readJsonDocuments(this.reader, path)) {
      const metadata = await this.reader.inspect(document.path)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      try {
        const inventory = parseInventory(document.value)
        for (const [index, asset] of inventory.assets.entries()) accepted.push(createInventoryEvent(inventory, asset, document.name, document.hash, importedAt, index))
        next.artifacts[metadata.name] = artifactCursor(metadata, document.hash)
      } catch {
        rejected.push(rejection(`${document.hash}:runtime-inventory`, this.id, document.name, importedAt, 'unsupported-runtime-inventory', 'Provide only the allowlisted runtime, model, MCP, tool, plugin, policy, and permission fields.'))
      }
    }
    return { accepted, rejected, checkpoint: checkpointForGovernance(this.id, next, importedAt), lag: 0 }
  }
}

interface InventoryDocument { runtimeId: string; runtimeVersion: string; observedAt?: string; assets: InventoryAsset[] }
interface InventoryAsset { kind: LogicalAssetKind; id: string; label?: string; version?: string; owner?: string; purpose?: string; permissionsSummary?: string; state?: 'observed' | 'declared' | 'inferred' | 'stale' | 'unverified' }

function parseInventory(value: unknown): InventoryDocument {
  if (!isInventoryDocument(value)) throw new Error('unsupported')
  const document = value as Record<string, unknown>
  const runtime = document.runtime as Record<string, unknown>
  const rawAssets = Array.isArray(document.assets) ? document.assets : []
  const assets = rawAssets.map((asset) => {
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) throw new Error('asset')
    const item = asset as Record<string, unknown>
    if (!isLogicalKind(item.kind) || typeof item.id !== 'string' || !item.id.trim()) throw new Error('asset')
    if (Object.keys(item).some((key) => !['kind', 'id', 'label', 'version', 'owner', 'purpose', 'permissionsSummary', 'state'].includes(key))) throw new Error('asset-fields')
    return { kind: item.kind, id: safeExternalId(item.id, 'asset'), ...(typeof item.label === 'string' ? { label: item.label.slice(0, 160) } : {}), ...(typeof item.version === 'string' ? { version: item.version.slice(0, 80) } : {}), ...(typeof item.owner === 'string' ? { owner: item.owner.slice(0, 160) } : {}), ...(typeof item.purpose === 'string' ? { purpose: item.purpose.slice(0, 240) } : {}), ...(typeof item.permissionsSummary === 'string' ? { permissionsSummary: item.permissionsSummary.slice(0, 240) } : {}), ...(item.state ? { state: item.state as InventoryAsset['state'] } : {}) }
  })
  if (!assets.length) throw new Error('assets')
  return { runtimeId: safeExternalId(runtime.id, 'runtime'), runtimeVersion: String(runtime.version ?? 'unknown').slice(0, 80), ...(typeof document.observedAt === 'string' ? { observedAt: document.observedAt } : {}), assets }
}

function createInventoryEvent(inventory: InventoryDocument, asset: InventoryAsset, artifactName: string, artifactHash: string, importedAt: string, index: number) {
  const ref = createCanonicalRef(asset.kind, 'runtime-inventory', asset.id, asset.label)
  return createGovernanceEvent({
    schemaVersion: 1, type: 'inventory.observed', observedAt: dateOr(importedAt, inventory.observedAt), importedAt,
    source: { id: 'runtime-inventory', version: inventory.runtimeVersion, recordType: 'runtime-inventory.v1' }, subject: ref,
    context: { runtimeId: inventory.runtimeId }, truth: { assertion: asset.state === 'inferred' ? 'inferred' : asset.state === 'declared' ? 'declared' : 'observed', authority: 'runtime', ...(asset.state === 'inferred' ? { confidence: 0.5 } : {}) },
    payload: { asset: ref, state: asset.state ?? 'observed', ...(asset.version ? { version: asset.version } : {}), ...(asset.owner ? { owner: asset.owner } : {}), ...(asset.purpose ? { purpose: asset.purpose } : {}), ...(asset.permissionsSummary ? { permissionsSummary: asset.permissionsSummary } : {}) }, relations: [],
    provenance: { producerId: 'runtime-inventory', producerVersion: inventory.runtimeVersion, sourceRecordId: safeExternalId(`${inventory.runtimeId}-${asset.id}-${index}`, `asset-${index}`), artifactName, artifactContentHash: artifactHash, parserId: 'runtime-inventory', parserVersion: '1.0.0', contractVersion: 'runtime-inventory-v1', qualification: 'manual', verification: 'not-applicable' },
  })
}

function isInventoryDocument(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const document = value as Record<string, unknown>
  if (![1, 'runtime-inventory.v1'].includes(document.schemaVersion as never) || !document.runtime || typeof document.runtime !== 'object' || Array.isArray(document.runtime) || !Array.isArray(document.assets)) return false
  const runtime = document.runtime as Record<string, unknown>
  return typeof runtime.id === 'string' && typeof runtime.version === 'string' && !containsProhibited(value)
}
function containsProhibited(value: unknown): boolean { if (Array.isArray(value)) return value.some(containsProhibited); if (!value || typeof value !== 'object') return false; return Object.entries(value as Record<string, unknown>).some(([key, nested]) => ['environmentVariables', 'env', 'token', 'tokens', 'credential', 'credentials', 'secret', 'promptFile', 'commandLine'].includes(key) || containsProhibited(nested)) }
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function isLogicalKind(value: unknown): value is LogicalAssetKind { return typeof value === 'string' && (LOGICAL_ASSET_KINDS as readonly string[]).includes(value) }
function dateOr(fallback: string, value: unknown): string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback }
