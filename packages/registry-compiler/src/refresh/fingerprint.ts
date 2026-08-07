import { createHash } from 'node:crypto'

import type { AssetProposal } from '../contracts.ts'

/**
 * Build a stable change fingerprint from the bounded proposal contract.
 * Observation time is deliberately excluded so an unchanged refresh is a no-op.
 */
export function proposalFingerprint(proposal: AssetProposal): string {
  const stable = {
    ...proposal,
    provenance: proposal.provenance.map(({ observedAt: _observedAt, ...source }) => source),
  }
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex')
}
