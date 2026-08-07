import type { ControlLedgerRow } from '../../domain/governance/project'
import { LedgerFrame } from './InventoryLedger'

export function ControlLedger({ rows, onSelect }: { rows: readonly ControlLedgerRow[]; onSelect: (row: ControlLedgerRow) => void }) {
  return <LedgerFrame label="Controls" count={rows.length} empty="No policy or control decisions are available for inspection.">
    {rows.map(row => <button type="button" className="governance-ledger-row" key={`${row.eventIds.join('|')}`} onClick={() => onSelect(row)}>
      <span className="governance-row-main"><strong>{row.policyId} / {row.decision}</strong><small>{row.reason}</small></span>
      <span className="governance-row-meta">{row.policyVersion}<br />{row.enforcementProven ? 'verified enforcement evidence' : 'not enforcement proof'}</span>
      <span className="status-badge governance-status">{row.status}</span>
    </button>)}
  </LedgerFrame>
}
