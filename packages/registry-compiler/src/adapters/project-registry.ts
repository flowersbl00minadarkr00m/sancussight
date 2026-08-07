import { isAbsolute, relative, resolve } from 'node:path'

import {
  assertNoProhibitedKeys,
  type AssetProposal,
  type BoundedReference,
  type DiscoveryContext,
  type DiscoveryResult,
  type Lifecycle,
  type SourceObservation,
} from '../contracts.ts'
import { classifyMetadata } from '../privacy/classify.ts'

const REGISTRY_MANIFEST = 'registry.json'
const ROOTS_MANIFEST = 'local-roots.json'
const LIFECYCLES = new Set<Lifecycle>(['active', 'draft', 'deprecated', 'archived', 'missing', 'unknown'])

interface RegistryProject {
  id: string
  name: string
  aliases: string[]
  lifecycle: Lifecycle
  rootId: string
  relativePath: string
  repositoryUrl?: string
  productionUrls: string[]
  requirements: Array<{ path: string; status: string }>
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 64) : []
}

function lifecycle(value: unknown): Lifecycle {
  const candidate = stringValue(value)
  return candidate && LIFECYCLES.has(candidate as Lifecycle) ? candidate as Lifecycle : 'unknown'
}

function safeRelativePath(value: unknown): string | undefined {
  const candidate = stringValue(value)?.replaceAll('\\', '/')
  if (!candidate || isAbsolute(candidate)) return undefined
  const normalized = candidate.split('/').filter(Boolean).join('/')
  if (normalized === '..' || normalized.startsWith('../')) return undefined
  return normalized
}

function projectRelativePath(value: unknown): string | undefined {
  const candidate = stringValue(value)?.replaceAll('\\', '/')
  return candidate && !isAbsolute(candidate) ? candidate : undefined
}

function projectFromRecord(value: unknown): RegistryProject | undefined {
  const candidate = record(value)
  if (!candidate) return undefined
  const id = stringValue(candidate.id)
  const name = stringValue(candidate.name)
  const rootId = stringValue(candidate.root_id)
  const relativePath = projectRelativePath(candidate.relative_path)
  if (!id || !name || !rootId || !relativePath) return undefined
  const requirements = Array.isArray(candidate.requirements)
    ? candidate.requirements.flatMap(item => {
      const requirement = record(item)
      const path = safeRelativePath(requirement?.path)
      const status = stringValue(requirement?.status)
      return path && status ? [{ path, status }] : []
    }).slice(0, 128)
    : []
  return {
    id,
    name,
    aliases: stringList(candidate.aliases),
    lifecycle: lifecycle(candidate.lifecycle),
    rootId,
    relativePath,
    repositoryUrl: stringValue(candidate.repository_url),
    productionUrls: stringList(candidate.production_urls),
    requirements,
  }
}

function referencesFor(project: RegistryProject): BoundedReference[] {
  const references: BoundedReference[] = []
  if (project.repositoryUrl) references.push({ kind: 'repository', reference: project.repositoryUrl })
  for (const url of project.productionUrls) references.push({ kind: 'deployment', reference: url })
  for (const requirement of project.requirements) {
    references.push({ kind: 'artifact', reference: requirement.status, rootId: project.rootId, relativePath: requirement.path })
  }
  return references
}

export function discoverProjectRegistry(context: DiscoveryContext, registryFile = REGISTRY_MANIFEST, rootsFile = ROOTS_MANIFEST): DiscoveryResult {
  const proposals: AssetProposal[] = []
  const observations: SourceObservation[] = []
  const skipped = [] as DiscoveryResult['skipped']
  const diagnostics = [] as DiscoveryResult['diagnostics']

  let registry: unknown
  let rootsManifest: unknown
  try {
    registry = context.fileSystem.readAllowlistedManifest(registryFile)
    rootsManifest = context.fileSystem.readAllowlistedManifest(rootsFile)
    assertNoProhibitedKeys(rootsManifest)
  } catch {
    diagnostics.push({
      code: 'PROJECT_REGISTRY_UNREADABLE',
      severity: 'error',
      message: 'The canonical project registry could not be read as a safe JSON manifest.',
      sourceType: 'project-registry',
    })
    return {
      sourceType: 'project-registry',
      adapterId: 'project-registry',
      adapterVersion: '1.0.0',
      observedAt: context.now,
      inspectedRoots: [{ ...context.root, itemCount: 0, status: 'unreadable' }],
      observations,
      proposals,
      skipped,
      diagnostics,
    }
  }

  const registryRecord = record(registry)
  const rootsRecord = record(rootsManifest)
  const projects = Array.isArray(registryRecord?.projects) ? registryRecord.projects.slice(0, context.root.itemCount || 10_000) : []
  const configuredRoots = record(rootsRecord?.roots) ?? {}
  if (!registryRecord || !Array.isArray(registryRecord.projects) || !rootsRecord || !record(rootsRecord.roots)) {
    diagnostics.push({
      code: 'PROJECT_REGISTRY_SHAPE_INVALID',
      severity: 'error',
      message: 'The canonical project registry shape is unsupported.',
      sourceType: 'project-registry',
    })
  }

  for (const candidate of projects) {
    const project = projectFromRecord(candidate)
    const identifier = record(candidate)?.id
    if (!project) {
      const classification = classifyMetadata(candidate, identifier)
      skipped.push({
        sourceType: 'project-registry',
        boundedIdentifier: classification.skipped?.boundedIdentifier ?? 'redacted-item',
        category: classification.skipped?.category ?? 'unsupported',
        guidance: classification.skipped?.guidance ?? 'The project record did not match the supported metadata contract.',
      })
      continue
    }

    const classification = classifyMetadata(candidate, project.id)
    if (!classification.include) {
      skipped.push(classification.skipped ?? {
        sourceType: 'project-registry',
        boundedIdentifier: project.id,
        category: 'sensitive',
        guidance: 'The project record was excluded by the privacy boundary.',
      })
      continue
    }

    const configuredRoot = stringValue(configuredRoots[project.rootId])
    if (!configuredRoot) {
      skipped.push({
        sourceType: 'project-registry',
        boundedIdentifier: project.id,
        category: 'out-of-scope',
        guidance: 'The project points to an unconfigured local root.',
      })
      continue
    }
    const localPath = resolve(configuredRoot, project.relativePath)
    if (!isPathInside(configuredRoot, localPath)) {
      skipped.push({
        sourceType: 'project-registry',
        boundedIdentifier: project.id,
        category: 'out-of-scope',
        guidance: 'The project path escapes its configured root.',
      })
      continue
    }

    const source = {
      sourceType: 'project-registry' as const,
      sourceId: project.id,
      rootId: context.root.rootId,
      relativePath: registryFile,
      portableAlias: context.root.portableAlias,
    }
    const provenance = {
      sourceType: 'project-registry' as const,
      sourceId: project.id,
      adapterId: 'project-registry',
      adapterVersion: '1.0.0',
      rootId: context.root.rootId,
      platform: context.platform,
      relativePath: registryFile,
      observedAt: context.now,
    }
    const stableId = `project:${project.id}`
    observations.push({
      observationId: `${stableId}:${context.runId}`,
      sourceType: 'project-registry',
      adapterId: 'project-registry',
      adapterVersion: '1.0.0',
      observedAt: context.now,
      platform: context.platform,
      kind: 'project',
      stableId,
      displayName: project.name,
      format: 'json',
      lifecycle: project.lifecycle,
      source,
    })
    proposals.push({
      proposalId: stableId,
      identityKey: stableId,
      identityConfidence: 'high',
      kind: 'project',
      displayName: project.name,
      stableId,
      aliases: project.aliases,
      format: 'json',
      lifecycle: project.lifecycle,
      sensitivity: classification.sensitivity,
      platforms: [context.platform],
      locations: [{
        rootId: project.rootId,
        relativePath: project.relativePath,
        localPath,
        portableAlias: `project:${project.id}`,
      }],
      references: referencesFor(project),
      provenance: [provenance],
      selectedByDefault: project.lifecycle === 'active',
      warnings: project.lifecycle === 'unknown' ? ['Project lifecycle is unrecognized.'] : [],
    })
  }

  return {
    sourceType: 'project-registry',
    adapterId: 'project-registry',
    adapterVersion: '1.0.0',
    observedAt: context.now,
    inspectedRoots: [{ ...context.root, itemCount: proposals.length, status: 'inspected' }],
    observations,
    proposals,
    skipped,
    diagnostics,
  }
}

function isPathInside(root: string, candidate: string): boolean {
  const remainder = relative(resolve(root), candidate)
  return remainder === '' || (!remainder.startsWith('..') && !isAbsolute(remainder))
}
