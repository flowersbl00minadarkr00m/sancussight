import type {
  AssetProposal,
  BoundedReference,
  ProposalProvenance,
} from '../contracts.ts'
import { identityFor } from './identity.ts'

export interface ProposalCollision {
  fallbackKey: string
  proposalIds: string[]
  reason: 'conflicting-stable-identities' | 'insufficient-identity-confidence'
}

export interface ProposalMergeResult {
  proposals: AssetProposal[]
  collisions: ProposalCollision[]
}

function unique<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  const output: T[] = []
  for (const item of items) {
    const identity = key(item)
    if (seen.has(identity)) continue
    seen.add(identity)
    output.push(item)
  }
  return output
}

function mergeGroup(group: AssetProposal[]): AssetProposal {
  const sorted = [...group].sort((a, b) => a.proposalId.localeCompare(b.proposalId))
  const first = sorted[0]
  if (!first) throw new Error('Cannot merge an empty proposal group')
  const sensitivity = sorted.some(item => item.sensitivity === 'sensitive')
    ? 'sensitive'
    : sorted.some(item => item.sensitivity === 'internal') ? 'internal' : 'public'
  const provenance = unique(sorted.flatMap(item => item.provenance), provenanceKey)
  const locations = unique(sorted.flatMap(item => item.locations), item => `${item.rootId}:${item.relativePath}:${item.portableAlias}`)
  const references = unique(sorted.flatMap(item => item.references ?? []), referenceKey)
  const aliases = unique(sorted.flatMap(item => item.aliases ?? []), alias => alias.toLocaleLowerCase())
  const platforms = unique(sorted.flatMap(item => item.platforms), platform => platform.toLocaleLowerCase())
  const capabilities = unique(sorted.flatMap(item => item.capabilities ?? []), capability => capability.toLocaleLowerCase())
  const warnings = unique(sorted.flatMap(item => item.warnings), warning => warning)

  return {
    ...first,
    identityConfidence: 'high',
    platforms,
    locations,
    references: references.length > 0 ? references : undefined,
    aliases: aliases.length > 0 ? aliases : undefined,
    capabilities: capabilities.length > 0 ? capabilities : undefined,
    provenance,
    sensitivity,
    selectedByDefault: sorted.every(item => item.selectedByDefault),
    warnings,
  }
}

function referenceKey(reference: BoundedReference): string {
  return `${reference.kind}:${reference.reference}:${reference.rootId ?? ''}:${reference.relativePath ?? ''}`
}

function provenanceKey(provenance: ProposalProvenance): string {
  return `${provenance.sourceType}:${provenance.sourceId}:${provenance.adapterId}:${provenance.rootId}:${provenance.platform ?? ''}:${provenance.relativePath ?? ''}`
}

export function mergeProposals(input: AssetProposal[]): ProposalMergeResult {
  const normalized = input.map(proposal => {
    const identity = identityFor(proposal)
    return { ...proposal, identityKey: identity.identityKey, identityConfidence: identity.confidence }
  })
  const fallbackGroups = new Map<string, AssetProposal[]>()
  for (const proposal of normalized) {
    const group = fallbackGroups.get(identityFor(proposal).fallbackKey) ?? []
    group.push(proposal)
    fallbackGroups.set(identityFor(proposal).fallbackKey, group)
  }

  const collisions: ProposalCollision[] = []
  const collisionIds = new Set<string>()
  for (const [fallbackKey, group] of fallbackGroups) {
    const stableIds = new Set(group.map(item => item.stableId).filter(Boolean))
    if (group.length > 1 && (stableIds.size > 1 || stableIds.size === 0)) {
      const reason = stableIds.size > 1 ? 'conflicting-stable-identities' : 'insufficient-identity-confidence'
      const proposalIds = group.map(item => item.proposalId).sort()
      collisions.push({ fallbackKey, proposalIds, reason })
      proposalIds.forEach(id => collisionIds.add(id))
    }
  }

  const identityGroups = new Map<string, AssetProposal[]>()
  for (const proposal of normalized) {
    const group = identityGroups.get(proposal.identityKey) ?? []
    group.push(proposal)
    identityGroups.set(proposal.identityKey, group)
  }

  const merged: AssetProposal[] = []
  for (const group of identityGroups.values()) {
    if (group.some(item => collisionIds.has(item.proposalId))) {
      merged.push(...group.map(item => ({
        ...item,
        provenance: unique(item.provenance, provenanceKey),
      })))
    } else {
      merged.push(group.length > 1 ? mergeGroup(group) : group[0]!)
    }
  }

  return {
    proposals: merged.sort((a, b) => a.proposalId.localeCompare(b.proposalId)),
    collisions: collisions.sort((a, b) => a.fallbackKey.localeCompare(b.fallbackKey)),
  }
}
