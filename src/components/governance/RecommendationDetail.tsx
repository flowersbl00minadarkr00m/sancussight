import type { ControlLedgerRow } from '../../domain/governance/project'

export function RecommendationDetail({ row }: { row: ControlLedgerRow }) {
  return <section className="governance-recommendation" aria-label="Recommendation detail">
    <span className="eyebrow">RECOMMENDATION DETAIL</span>
    <h3>{row.policyId} / {row.decision}</h3>
    <p>{row.enforcementProven ? 'Verified upstream evidence is visible for this action.' : 'This is a deterministic recommendation context only; SancusSight cannot enforce it upstream.'}</p>
    <dl className="governance-detail-grid"><div><dt>Consequence</dt><dd>{row.reason}</dd></div><div><dt>Authority</dt><dd>{row.enforcementProven ? 'Upstream verified control' : 'SancusSight recommendation'}</dd></div><div><dt>Policy</dt><dd>{row.policyVersion}</dd></div><div><dt>Required action</dt><dd>Inspect source and use the upstream control boundary if a change is needed.</dd></div></dl>
  </section>
}
