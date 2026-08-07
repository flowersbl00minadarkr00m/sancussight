import type { Registry, RegistrySession } from '../types'
import { SYNC_STATE_LABELS } from '../lib/source-state'

interface Props {
  registry: Registry
  session: RegistrySession
  onRefresh: () => void
  onReauthorize: () => void
}

export function SourceStatus({ registry, session, onRefresh, onReauthorize }: Props) {
  if (session.mode === 'demo') {
    return (
      <div className="source-context">
        <span className="source-badge source-badge-demo">Demo data</span>
        <span className="source-freshness">Synthetic workspace</span>
        <SourceCounts registry={registry} />
      </div>
    )
  }

  if (!session.connection) {
    return (
      <div className="source-context">
        <span className="source-badge source-badge-snapshot">Snapshot</span>
        <span className="source-freshness">Imported copy; no live source</span>
        <SourceCounts registry={registry} />
      </div>
    )
  }

  const connection = session.connection
  const lastRead = connection.lastReadAt ? new Date(connection.lastReadAt).toLocaleString() : 'Not currently readable'
  const permissionRequired = connection.syncState === 'permission-required'

  return (
    <div className="source-context source-context-connected">
      <span className="source-name" title={connection.sourceName}>{connection.sourceName}</span>
      <span className={`sync-state sync-state-${connection.syncState}`}>{SYNC_STATE_LABELS[connection.syncState]}</span>
      <span className="source-freshness">Last read {lastRead}</span>
      <span className="source-permission">
        Read: {connection.readPermission} / Write: {connection.writePermission}
      </span>
      {permissionRequired ? (
        <button type="button" className="source-text-action" onClick={onReauthorize}>Reauthorize</button>
      ) : (
        <button type="button" className="source-icon-action" onClick={onRefresh} aria-label="Refresh from source" title="Refresh from source">&#8635;</button>
      )}
    </div>
  )
}

function SourceCounts({ registry }: { registry: Registry }) {
  return <span className="source-counts">{registry.assets.length} assets / {registry.platforms.length} platforms</span>
}
