import type { OutcomeLedgerRow } from '../../domain/governance/project'
import { LedgerFrame } from './InventoryLedger'

export function OutcomeLedger({ rows, onSelect }: { rows: readonly OutcomeLedgerRow[]; onSelect: (row: OutcomeLedgerRow) => void }) {
  return <LedgerFrame label="Outcomes" count={rows.length} empty="No observed effects, outcomes, or proof records are available.">
    {rows.map(row => <button type="button" className="governance-ledger-row" key={`${row.eventIds.join('|')}`} onClick={() => onSelect(row)}>
      <span className="governance-row-main"><strong>{row.summary}</strong><small>{row.result} · {row.verified ? 'verified result' : 'verification unavailable'}</small></span>
      <span className="governance-row-meta">{row.sourceIds.join(', ')}<br />{new Date(row.observedAt).toLocaleString()}</span>
      <span className="status-badge governance-status">{row.status}</span>
    </button>)}
  </LedgerFrame>
}
