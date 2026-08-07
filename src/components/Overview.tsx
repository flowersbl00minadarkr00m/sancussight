import type { AssetFindingGroup, DimensionRollup, SignalStatus } from '../types'
import { DIMENSION_LABELS } from '../types'
import { Card, Eyebrow, StatusBadge } from './Shared'

const DIMENSION_IDEAL: Record<string, string> = {
  context: 'Open format, verified coverage, fresh review, no hidden provider memory.',
  skills: 'Inspectable runbook, cross-platform verification, named dependencies.',
  continuity: 'Approved fallback, current substitution drill, portable dependencies.',
  controls: 'Shared policies verified where agents run and reviewed on schedule.',
  evidence: 'Named owners, durable fixtures, and exceptions with expiry dates.',
}

interface Props {
  rollups: DimensionRollup[]
  groups: AssetFindingGroup[]
  onSelectAsset: (id: string) => void
  onOpenQueue: () => void
}

const STATUS_LABELS: Array<[keyof Omit<DimensionRollup, 'dimension'>, SignalStatus]> = [
  ['pass', 'pass'],
  ['warn', 'warn'],
  ['fail', 'fail'],
  ['accepted', 'accepted'],
  ['unknown', 'unknown'],
]

export function Overview({ rollups, groups, onSelectAsset, onOpenQueue }: Props) {
  const visibleGroups = groups.slice(0, 6)

  return (
    <div className="space-y-4">
      <section className="dimension-grid" aria-label="Portability dimensions">
        {rollups.map(rollup => {
          const worst: SignalStatus = rollup.fail > 0 ? 'fail' : rollup.warn > 0 ? 'warn' : rollup.unknown > 0 ? 'unknown' : rollup.accepted > 0 ? 'accepted' : 'pass'
          const visibleStatuses = STATUS_LABELS.filter(([key]) => rollup[key] > 0)
          return (
            <Card key={rollup.dimension}>
              <Eyebrow>{DIMENSION_LABELS[rollup.dimension]}</Eyebrow>
              <StatusBadge status={worst} />
              <div className="dimension-counts">
                {visibleStatuses.map(([key, status]) => (
                  <span key={key} className={`status-text status-text-${status}`}>{rollup[key]} {key}</span>
                ))}
              </div>
              <p className="dimension-ideal">{DIMENSION_IDEAL[rollup.dimension]}</p>
            </Card>
          )
        })}
      </section>

      <Card>
        <div className="section-heading-row">
          <div>
            <Eyebrow>Affected assets</Eyebrow>
            <p className="section-summary">Worst conditions first. Select an asset for every underlying finding and its evidence.</p>
          </div>
          <button type="button" className="text-command" onClick={onOpenQueue}>Open full Queue</button>
        </div>

        {visibleGroups.length === 0 ? (
          <p className="empty-state">No non-passing conditions are recorded for the active registry.</p>
        ) : (
          <ol className="finding-groups">
            {visibleGroups.map(group => (
              <li key={group.assetId}>
                <StatusBadge status={group.worstStatus} />
                <div className="finding-group-content">
                  <button type="button" className="asset-link" onClick={() => onSelectAsset(group.assetId)}>
                    {group.assetName}
                  </button>
                  <p>{group.signals[0]?.finding}</p>
                </div>
                <span className="finding-count">{group.findingCount} {group.findingCount === 1 ? 'finding' : 'findings'}</span>
              </li>
            ))}
          </ol>
        )}

        {groups.length > 6 && (
          <div className="bounded-note">
            Showing 6 of {groups.length} affected assets. <button type="button" className="text-command" onClick={onOpenQueue}>Review all signals</button>
          </div>
        )}
      </Card>
    </div>
  )
}
