import type { AssetKind, AssetProposal, IdentityConfidence } from '../contracts.ts'

export interface ProposalIdentity {
  identityKey: string
  fallbackKey: string
  confidence: IdentityConfidence
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function fallbackIdentityKey(kind: AssetKind, displayName: string): string {
  return `${kind}:name:${normalize(displayName) || 'unnamed'}`
}

export function identityFor(input: Pick<AssetProposal, 'kind' | 'displayName' | 'stableId'>): ProposalIdentity {
  const fallbackKey = fallbackIdentityKey(input.kind, input.displayName)
  const stableId = input.stableId ? normalize(input.stableId) : ''
  return stableId
    ? { identityKey: `${input.kind}:stable:${stableId}`, fallbackKey, confidence: 'high' }
    : { identityKey: fallbackKey, fallbackKey, confidence: 'medium' }
}
