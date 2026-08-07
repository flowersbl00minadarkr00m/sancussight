import { isAbsolute } from 'node:path'

import {
  assertNoProhibitedKeys,
  type AssetKind,
  type AssetProposal,
  type BoundedReference,
  type DiscoveryContext,
  type DiscoveryResult,
  type Lifecycle,
  type Platform,
  type SourceType,
} from '../contracts.ts'
import { classifyMetadata } from '../privacy/classify.ts'
import { identityFor } from '../proposals/identity.ts'

export interface FixedAdapterConfig {
  adapterId: string
  sourceType: SourceType
  kind: AssetKind
  defaultManifestPath: string
}

interface ItemRecord {
  id: string
  stableId?: string
  name: string
  aliases: string[]
  provider?: string
  platforms: Platform[]
  version?: string
  format?: string
  lifecycle: Lifecycle
  owner?: string
  relativePath?: string
  capabilities: string[]
  references: BoundedReference[]
}

const LIFECYCLES = new Set<Lifecycle>(['active', 'draft', 'deprecated', 'archived', 'missing', 'unknown'])

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function stringList(value: unknown, limit = 32): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map(item => item.trim()).slice(0, limit)
    : []
}

function lifecycle(value: unknown): Lifecycle {
  const candidate = stringValue(value)
  return candidate && LIFECYCLES.has(candidate as Lifecycle) ? candidate as Lifecycle : 'unknown'
}

function relativePath(value: unknown): string | undefined {
  const candidate = stringValue(value)?.replaceAll('\\', '/')
  if (!candidate || isAbsolute(candidate) || candidate === '..' || candidate.startsWith('../')) return undefined
  return candidate
}

function references(value: Record<string, unknown>): BoundedReference[] {
  const output: BoundedReference[] = []
  const repository = stringValue(value.repository_url)
  if (repository) output.push({ kind: 'repository', reference: repository })
  for (const deployment of stringList(value.production_urls)) output.push({ kind: 'deployment', reference: deployment })
  const sourceUrl = stringValue(value.source_url)
  if (sourceUrl) output.push({ kind: 'repository', reference: sourceUrl })
  for (const artifact of stringList(value.artifact_paths)) {
    const path = relativePath(artifact)
    if (path) output.push({ kind: 'artifact', reference: path, relativePath: path })
  }
  return output
}

function parseItem(candidate: unknown, context: DiscoveryContext): ItemRecord | undefined {
  const value = record(candidate)
  if (!value) return undefined
  const id = stringValue(value.id) ?? stringValue(value.identifier)
  const name = stringValue(value.name) ?? stringValue(value.label)
  if (!id || !name) return undefined
  const platforms = stringList(value.platforms)
  const platform = stringValue(value.platform)
  if (platform) platforms.push(platform)
  const uniquePlatforms = [...new Set([context.platform, ...platforms].map(item => item as Platform))]
  return {
    id,
    stableId: stringValue(value.stable_id) ?? stringValue(value.stableId),
    name,
    aliases: stringList(value.aliases),
    provider: stringValue(value.provider),
    platforms: uniquePlatforms,
    version: stringValue(value.version),
    format: stringValue(value.format),
    lifecycle: lifecycle(value.lifecycle),
    owner: stringValue(value.owner),
    relativePath: relativePath(value.relative_path) ?? relativePath(value.source_path),
    capabilities: stringList(value.capabilities ?? value.enabled_capabilities),
    references: references(value),
  }
}

export function discoverFixedInventory(context: DiscoveryContext, config: FixedAdapterConfig, manifestPath = config.defaultManifestPath): DiscoveryResult {
  const proposals: AssetProposal[] = []
  const observations: DiscoveryResult['observations'] = []
  const skipped: DiscoveryResult['skipped'] = []
  const diagnostics: DiscoveryResult['diagnostics'] = []
  let manifest: unknown

  try {
    manifest = context.fileSystem.readAllowlistedManifest(manifestPath)
  } catch {
    diagnostics.push({
      code: 'INVENTORY_MANIFEST_UNREADABLE',
      severity: 'warning',
      message: 'The fixed inventory manifest could not be read as a bounded JSON manifest.',
      sourceType: config.sourceType,
    })
    return {
      sourceType: config.sourceType,
      adapterId: config.adapterId,
      adapterVersion: '1.0.0',
      observedAt: context.now,
      inspectedRoots: [{ ...context.root, itemCount: 0, status: 'unreadable' }],
      observations,
      proposals,
      skipped,
      diagnostics,
    }
  }

  const root = record(manifest)
  const items = Array.isArray(root?.items) ? root.items.slice(0, context.root.itemCount || 10_000) : []
  if (!root || !Array.isArray(root.items)) {
    diagnostics.push({
      code: 'INVENTORY_MANIFEST_SHAPE_INVALID',
      severity: 'warning',
      message: 'The fixed inventory manifest must contain an items array.',
      sourceType: config.sourceType,
    })
  }

  for (const candidate of items) {
    const itemValue = record(candidate)
    const parsed = parseItem(candidate, context)
    const identifier = itemValue?.id ?? itemValue?.identifier
    if (!parsed) {
      const classification = classifyMetadata(candidate, identifier)
      skipped.push({
        sourceType: config.sourceType,
        boundedIdentifier: classification.skipped?.boundedIdentifier ?? 'redacted-item',
        category: classification.skipped?.category ?? 'unsupported',
        guidance: classification.skipped?.guidance ?? 'The inventory item did not match the supported metadata contract.',
      })
      continue
    }
    const classification = classifyMetadata(candidate, parsed.id)
    if (!classification.include) {
      skipped.push({
        sourceType: config.sourceType,
        boundedIdentifier: classification.skipped?.boundedIdentifier ?? parsed.id,
        category: classification.skipped?.category ?? 'sensitive',
        guidance: classification.skipped?.guidance ?? 'The inventory item was excluded by the privacy boundary.',
      })
      continue
    }

    const stableId = parsed.stableId
    const provisional: AssetProposal = {
      proposalId: `${config.kind}:${parsed.id}`,
      identityKey: '',
      identityConfidence: 'low',
      kind: config.kind,
      displayName: parsed.name,
      stableId,
      aliases: parsed.aliases,
      format: parsed.format ?? 'json',
      version: parsed.version,
      owner: parsed.owner,
      provider: parsed.provider,
      capabilities: parsed.capabilities,
      lifecycle: parsed.lifecycle,
      sensitivity: classification.sensitivity,
      platforms: parsed.platforms,
      locations: [{
        rootId: context.root.rootId,
        relativePath: parsed.relativePath ?? manifestPath,
        portableAlias: context.root.portableAlias,
      }],
      references: parsed.references,
      provenance: [{
        sourceType: config.sourceType,
        sourceId: parsed.id,
        adapterId: config.adapterId,
        adapterVersion: '1.0.0',
        rootId: context.root.rootId,
        platform: context.platform,
        relativePath: manifestPath,
        observedAt: context.now,
      }],
      selectedByDefault: parsed.lifecycle === 'active' && classification.sensitivity !== 'sensitive',
      warnings: parsed.lifecycle === 'unknown' ? ['Inventory lifecycle is unrecognized.'] : [],
    }
    const identity = identityFor(provisional)
    const proposal = { ...provisional, identityKey: identity.identityKey, identityConfidence: identity.confidence }
    assertNoProhibitedKeys(proposal)
    proposals.push(proposal)
    observations.push({
      observationId: `${config.adapterId}:${parsed.id}:${context.runId}`,
      sourceType: config.sourceType,
      adapterId: config.adapterId,
      adapterVersion: '1.0.0',
      observedAt: context.now,
      platform: parsed.platforms[0] ?? context.platform,
      kind: config.kind,
      provider: parsed.provider,
      capabilities: parsed.capabilities,
      stableId,
      displayName: parsed.name,
      format: parsed.format ?? 'json',
      version: parsed.version,
      owner: parsed.owner,
      lifecycle: parsed.lifecycle,
      source: {
        sourceType: config.sourceType,
        sourceId: parsed.id,
        rootId: context.root.rootId,
        relativePath: manifestPath,
        portableAlias: context.root.portableAlias,
      },
    })
  }

  return {
    sourceType: config.sourceType,
    adapterId: config.adapterId,
    adapterVersion: '1.0.0',
    observedAt: context.now,
    inspectedRoots: [{ ...context.root, itemCount: proposals.length, status: 'inspected' }],
    observations,
    proposals,
    skipped,
    diagnostics,
  }
}
