import type { GovernanceNativeSourceId, GovernanceEventV1 } from '../../src/domain/governance/model.ts'
import type { GovernanceCheckpoint, RejectedGovernanceEvent } from '../governance-store.ts'

export interface GovernanceAdapterCollection {
  accepted: GovernanceEventV1[]
  rejected: RejectedGovernanceEvent[]
  checkpoint: GovernanceCheckpoint
  lag: number
}

export interface GovernanceAdapter {
  readonly id: GovernanceNativeSourceId
  validate(path: string): Promise<void>
  collect(path: string, checkpoint: GovernanceCheckpoint | undefined, importedAt: string): Promise<GovernanceAdapterCollection>
}
