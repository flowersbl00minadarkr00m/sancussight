import type { GovernanceReadModel } from '../../domain/governance/project'

export type GovernanceLedgerTab = 'inventory' | 'activity' | 'controls' | 'decisions' | 'outcomes'
export type GovernanceRow = GovernanceReadModel['inventory'][number] | GovernanceReadModel['activity'][number] | GovernanceReadModel['controls'][number] | GovernanceReadModel['decisions'][number] | GovernanceReadModel['outcomes'][number]

export function rowLabel(row: GovernanceRow): string {
  return row.title || row.id
}

export function shortId(value: string): string {
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value
}
