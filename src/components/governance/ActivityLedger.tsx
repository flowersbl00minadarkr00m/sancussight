import type { ActivityLedgerRow } from '../../domain/governance/project'
import { LedgerFrame } from './InventoryLedger'

export function ActivityLedger({ rows, onSelect }: { rows: readonly ActivityLedgerRow[]; onSelect: (row: ActivityLedgerRow) => void }) {
  return <LedgerFrame label="Activity" count={rows.length} empty="No bounded work, action, effect, or finding observations are available.">
    {rows.map(row => <button type="button" className="governance-ledger-row" key={`${row.eventIds.join('|')}`} onClick={() => onSelect(row)}>
      <span className="governance-row-main"><strong>{row.summary}</strong><small>{row.eventType} · {row.actionId ? `action ${row.actionId.slice(0, 10)}…` : 'action unresolved'}</small></span>
      <span className="governance-row-meta">{row.sourceIds.join(', ')}<br />{new Date(row.observedAt).toLocaleString()}</span>
      <span className="status-badge governance-status">{row.status}</span>
    </button>)}
  </LedgerFrame>
}
