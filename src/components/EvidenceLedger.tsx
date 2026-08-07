import { useState } from 'react'
import { Database } from 'lucide-react'
import type { AssetFindingGroup, DimensionRollup, EvidenceEnvelopeV1, Registry, Signal, SignalStatus } from '../types'
import { DIMENSION_LABELS } from '../types'
import { classifySignal, correlateEvidence } from '../lib/evidence'
import { EvidenceDetail } from './EvidenceDetail'
import { StatusBadge } from './Shared'

interface Props {
  registry: Registry
  rollups: DimensionRollup[]
  groups: AssetFindingGroup[]
  signals: Signal[]
  evidence: EvidenceEnvelopeV1[]
  onSelectAsset: (id: string) => void
  onOpenQueue: () => void
  onBind: (envelope: EvidenceEnvelopeV1, assetId: string) => void
  /** Omitted while the sample workspace has no evidence sources to open. */
  onOpenSources?: () => void
}

export function EvidenceLedger({ registry, rollups, groups, signals, evidence, onSelectAsset, onOpenQueue, onBind, onOpenSources }: Props) {
  const correlation = correlateEvidence(registry, evidence)
  const unmappedSubjects = [...new Map(correlation.unmapped.map((item) => [`${item.envelope.source}:${item.envelope.subject.externalId}`, item.envelope])).values()]
  const visibleGroups = groups.slice(0, 8)
  const hasMoreGroups = groups.length > visibleGroups.length
  const categories = {
    facts: evidence.length,
    findings: signals.filter((signal) => classifySignal(signal) === 'deterministic-finding').length,
    missing: signals.filter((signal) => classifySignal(signal) === 'missing-evidence').length,
    decisions: signals.filter((signal) => classifySignal(signal) === 'human-decision').length,
  }

  return (
    <div className="evidence-ledger">
      <header className="ledger-heading">
        <div><span className="eyebrow">Evidence ledger</span><h1>Trust conditions requiring attention</h1></div>
        <div className="ledger-heading-actions">
          {onOpenSources && <button type="button" className="mobile-source-command" onClick={onOpenSources}><Database size={15} />Sources</button>}
          <button type="button" className="text-command" onClick={onOpenQueue}>Open full queue</button>
        </div>
      </header>

      <section className="dimension-strip" aria-label="Five governance dimensions">
        {rollups.map((rollup) => {
          const worst: SignalStatus = rollup.fail ? 'fail' : rollup.warn ? 'warn' : rollup.unknown ? 'unknown' : rollup.accepted ? 'accepted' : 'pass'
          return (
            <div key={rollup.dimension}>
              <span>{DIMENSION_LABELS[rollup.dimension]}</span>
              <strong className={`dimension-state dimension-state-${worst}`}>{worst}</strong>
              <small>{rollup.fail} fail / {rollup.warn} warn / {rollup.unknown} unknown</small>
            </div>
          )
        })}
      </section>

      <section className="evidence-category-strip" aria-label="Evidence categories">
        <div><span>Recorded facts</span><strong>{categories.facts}</strong></div>
        <div><span>Deterministic findings</span><strong>{categories.findings}</strong></div>
        <div><span>Missing evidence</span><strong>{categories.missing}</strong></div>
        <div><span>Human decisions</span><strong>{categories.decisions}</strong></div>
      </section>

      <section className="ledger-section">
        <div className="ledger-section-heading"><div><span className="eyebrow">Needs attention</span><p>Worst conditions first, grouped by owned asset.</p></div><strong>{groups.length} assets</strong></div>
        {visibleGroups.length ? (
          <ol className="ledger-rows">
            {visibleGroups.map((group) => (
              <li key={group.assetId}>
                <StatusBadge status={group.worstStatus} />
                <button type="button" onClick={() => onSelectAsset(group.assetId)}>{group.assetName}</button>
                <span className="ledger-finding">{group.signals[0]?.finding}</span>
                <em>{group.findingCount}</em>
              </li>
            ))}
          </ol>
        ) : <p className="empty-state">No non-passing conditions are recorded.</p>}
        {hasMoreGroups && <button type="button" className="text-command ledger-more-command" onClick={onOpenQueue}>Show all {groups.length} assets in attention queue</button>}
      </section>

      {unmappedSubjects.length > 0 && (
        <details className="ledger-section ledger-disclosure" open={unmappedSubjects.length <= 3}>
          <summary className="ledger-section-heading"><div><span className="eyebrow">Unmapped evidence</span><p>Explicit binding required before governance correlation.</p></div><strong>{unmappedSubjects.length}</strong></summary>
          <div className="unmapped-list">
            {unmappedSubjects.map((envelope) => <UnmappedRow key={`${envelope.source}:${envelope.subject.externalId}`} envelope={envelope} registry={registry} onBind={onBind} />)}
          </div>
        </details>
      )}

      <details className="ledger-section ledger-disclosure" open={evidence.length > 0 && evidence.length <= 20}>
        <summary className="ledger-section-heading"><div><span className="eyebrow">Accepted evidence</span><p>Normalized references, not copied raw telemetry.</p></div><strong>{evidence.length}</strong></summary>
        <EvidenceDetail records={[...correlation.matched, ...correlation.unmapped]} />
      </details>
    </div>
  )
}

function UnmappedRow({ envelope, registry, onBind }: { envelope: EvidenceEnvelopeV1; registry: Registry; onBind: Props['onBind'] }) {
  const [assetId, setAssetId] = useState(registry.assets[0]?.id ?? '')
  return (
    <div>
      <span><strong>{envelope.subject.externalId}</strong><small>{envelope.source} / {envelope.evidenceKind}</small></span>
      <select value={assetId} onChange={(event) => setAssetId(event.target.value)} aria-label={`Asset binding for ${envelope.subject.externalId}`}>
        {registry.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
      </select>
      <button type="button" className="btn" disabled={!assetId} onClick={() => onBind(envelope, assetId)}>Bind</button>
    </div>
  )
}
