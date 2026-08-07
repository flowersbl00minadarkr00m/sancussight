import type { DecisionLedgerRow } from '../../domain/governance/project'
import { LedgerFrame } from './InventoryLedger'

export function DecisionLedger({ rows, onSelect }: { rows: readonly DecisionLedgerRow[]; onSelect: (row: DecisionLedgerRow) => void }) {
  return <LedgerFrame label="Decisions" count={rows.length} empty="No human or upstream decisions are available for inspection.">
    {rows.map(row => <button type="button" className="governance-ledger-row" key={`${row.eventIds.join('|')}`} onClick={() => onSelect(row)}>
      <span className="governance-row-main"><strong>{row.decision} · {row.policyId}</strong><small>{row.active ? 'active within recorded scope' : `inactive: ${row.gapCodes.join(', ') || row.status}`}</small></span>
      <span className="governance-row-meta">{row.decidedBy ?? 'authority unresolved'}<br />{row.expiresAt ? `expires ${new Date(row.expiresAt).toLocaleDateString()}` : 'no expiry recorded'}</span>
      <span className="status-badge governance-status">{row.status}</span>
    </button>)}
  </LedgerFrame>
}
