import type { CorrelatedEvidence } from '../lib/evidence'

export function EvidenceDetail({ records }: { records: CorrelatedEvidence[] }) {
  if (!records.length) return <p className="empty-state">No normalized evidence has been accepted.</p>
  return (
    <ol className="evidence-record-list">
      {records.slice(0, 8).map(({ envelope, asset, match }) => (
        <li key={envelope.id}>
          <div>
            <span className={`evidence-outcome evidence-outcome-${envelope.outcome}`}>{envelope.outcome}</span>
            <strong>{envelope.summary}</strong>
          </div>
          <p>{envelope.source} / {envelope.evidenceKind} / {asset?.name ?? 'Unmapped'} / {match}</p>
          <small>{new Date(envelope.observedAt).toLocaleString()} / {envelope.provenance.verification} / {envelope.id.slice(0, 12)}</small>
        </li>
      ))}
    </ol>
  )
}
