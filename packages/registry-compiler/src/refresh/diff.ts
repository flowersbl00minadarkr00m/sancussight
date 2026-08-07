import type { AssetProposal, RefreshDiff } from '../contracts.ts'
import type { ProposalCollision } from '../proposals/merge.ts'
import type { RefreshSidecar } from '../output/local.ts'
import { proposalFingerprint } from './fingerprint.ts'

export function computeRefreshDiff(previous: RefreshSidecar | undefined, current: AssetProposal[], collisions: ProposalCollision[] = []): RefreshDiff {
  const priorEntries = previous?.entries ?? []
  const priorById = new Map(priorEntries.map(entry => [entry.proposalId, entry]))
  const currentById = new Map(current.map(proposal => [proposal.proposalId, proposal]))
  const additions: string[] = []
  const modifications: string[] = []
  for (const proposal of current) {
    const prior = priorById.get(proposal.proposalId)
    if (!prior || prior.state !== 'active') additions.push(proposal.proposalId)
    else if (prior.fingerprint !== proposalFingerprint(proposal)) modifications.push(proposal.proposalId)
  }
  const disappeared = priorEntries
    .filter(entry => entry.state === 'active' && !currentById.has(entry.proposalId))
    .map(entry => entry.proposalId)
  return {
    additions: additions.sort(),
    modifications: modifications.sort(),
    duplicates: collisions.flatMap(collision => collision.proposalIds).sort(),
    disappeared: disappeared.sort(),
    archived: [...disappeared].sort(),
  }
}
