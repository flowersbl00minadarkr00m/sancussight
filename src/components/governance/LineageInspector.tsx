import type { LineageSummary } from '../../domain/governance/lineage'

export function LineageInspector({ lineage, onBack }: { lineage?: LineageSummary; onBack: () => void }) {
  if (!lineage) return <section className="governance-lineage governance-empty-state"><span className="eyebrow">LINEAGE INSPECTOR</span><h2>No lineage selected</h2><p>Open a row to inspect stable or confirmed links. Missing evidence remains a visible gap.</p><button type="button" className="btn btn-secondary" onClick={onBack}>RETURN TO LEDGER</button></section>
  return <section className="governance-lineage" aria-label="Lineage inspector">
    <div className="governance-ledger-heading"><div><span className="eyebrow">LINEAGE INSPECTOR</span><h2>{lineage.state} · {lineage.actionId ? 'action lineage' : 'case lineage'}</h2></div><button type="button" className="text-command" onClick={onBack}>RETURN TO LEDGER</button></div>
    <p className="governance-lineage-note">{lineage.enforcementProven ? 'Verified enforcement evidence is present for this chain.' : 'Observability is not enforcement. Every unresolved or inferred edge remains non-authoritative.'}</p>
    <div className="governance-lineage-summary"><span>{lineage.nodes.length} nodes</span><span>{lineage.edges.length} edges</span><span>{lineage.gaps.length} gaps</span><span>{lineage.auditComplete ? 'audit complete' : 'audit incomplete'}</span></div>
    <ol className="governance-node-list">{lineage.nodes.map(node => <li key={node.id}><span className={`governance-node-status governance-node-${node.status}`}>{node.status}</span><div><strong>{node.role}</strong><small>{node.ref?.label ?? node.ref?.id ?? node.eventIds[0]}</small><small>{node.sourceIds.join(', ')} · {node.truths.map(truth => `${truth.assertion}/${truth.authority}`).join(', ')}</small></div></li>)}</ol>
    <div className="governance-edge-list"><h3>Edges</h3>{lineage.edges.map(edge => <div className="governance-edge" key={edge.id}><strong>{edge.relation}</strong><span>{edge.basis} · {edge.state}</span></div>)}</div>
    {lineage.gaps.length ? <div className="governance-gap-list"><h3>Gaps</h3>{lineage.gaps.map(gap => <p key={`${gap.code}:${gap.eventIds.join('|')}`}><strong>{gap.code}</strong> {gap.message}</p>)}</div> : null}
  </section>
}
