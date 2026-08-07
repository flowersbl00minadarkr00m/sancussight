import type { ReactNode } from 'react'
import type { InventoryLedgerRow } from '../../domain/governance/project'

export function InventoryLedger({ rows, onSelect }: { rows: readonly InventoryLedgerRow[]; onSelect: (row: InventoryLedgerRow) => void }) {
  return <LedgerFrame label="Logical assets" count={rows.length} empty="No bounded inventory observations are available.">
    {rows.map(row => <button type="button" className="governance-ledger-row" key={`${row.id}:${row.eventIds.join('|')}`} onClick={() => onSelect(row)}>
      <span className="governance-row-main"><strong>{row.title}</strong><small>{row.kind} · {row.version ?? 'version unknown'} · {row.status}</small></span>
      <span className="governance-row-meta">{row.sourceIds.join(', ')}<br />{new Date(row.observedAt).toLocaleString()}</span>
      <span className="status-badge governance-status">{row.status}</span>
    </button>)}
  </LedgerFrame>
}

function LedgerFrame({ label, count, empty, children }: { label: string; count: number; empty: string; children: ReactNode }) {
  return <section className="governance-ledger" aria-label={label}>
    <div className="governance-ledger-heading"><div><span className="eyebrow">GOVERNANCE / {label.toUpperCase()}</span><h2>{label}</h2></div><span className="governance-count">{count} ROWS</span></div>
    {count ? <div className="governance-row-list">{children}</div> : <p className="governance-empty">{empty}</p>}
  </section>
}

export { LedgerFrame }
