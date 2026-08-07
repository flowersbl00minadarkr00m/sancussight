import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock3, Download, FolderOpen, RefreshCw, ShieldAlert, Trash2, Unplug, Upload } from 'lucide-react'
import type { EvidenceSourceHealth, EvidenceSourceId, EvidenceSourceState, RejectedEvidenceSummary } from '../types'
import type { CollectorMode } from '../lib/use-collector'
import { EVIDENCE_ADAPTER_CATALOG } from '../lib/evidence-catalog'

interface Props {
  mode: CollectorMode
  sources: EvidenceSourceState[]
  rejected: RejectedEvidenceSummary[]
  error?: string
  onConfigure: (source: EvidenceSourceId, path: string) => Promise<void>
  onRefresh: (source: EvidenceSourceId) => Promise<void>
  onDisconnect: (source: EvidenceSourceId) => Promise<void>
  onRetryRejected: (id: string) => Promise<void>
  onRetryCollector: () => Promise<void>
  snapshotCount: number
  onImportSnapshot: (raw: string) => Promise<number>
  onExportSnapshot: () => string
  onClearSnapshot: () => Promise<void>
  onNotice: (message: string, error?: boolean) => void
}

const HEALTH_LABELS: Record<EvidenceSourceHealth, string> = {
  current: 'Current', stale: 'Stale', failed: 'Failed',
  'permission-required': 'Permission required', 'not-configured': 'Not configured',
}

export function EvidenceSources({ mode, sources, rejected, error, onConfigure, onRefresh, onDisconnect, onRetryRejected, onRetryCollector, snapshotCount, onImportSnapshot, onExportSnapshot, onClearSnapshot, onNotice }: Props) {
  const [selectedId, setSelectedId] = useState<EvidenceSourceId>('agent-beacon')
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const snapshotInput = useRef<HTMLInputElement>(null)
  const selected = sources.find((source) => source.id === selectedId) ?? sources[0]
  const selectedRejects = useMemo(() => rejected.filter((item) => item.source === selected?.id), [rejected, selected?.id])

  useEffect(() => {
    const urgent = sources.find((source) => source.health === 'failed' || source.health === 'permission-required')
    if (urgent && selected?.health !== 'failed' && selected?.health !== 'permission-required') setSelectedId(urgent.id)
  }, [selected?.health, sources])

  async function handleSnapshotImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const count = await onImportSnapshot(await file.text())
      onNotice(`${count} normalized evidence ${count === 1 ? 'record' : 'records'} imported as a manual snapshot.`)
    } catch (error) {
      onNotice(error instanceof Error ? error.message : 'Evidence snapshot import failed.', true)
    }
  }

  function handleSnapshotExport() {
    const url = URL.createObjectURL(new Blob([onExportSnapshot()], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sancussight-evidence-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  async function handleSnapshotClear() {
    if (!window.confirm('Remove the manual evidence snapshot from this browser? Original source artifacts will not be changed.')) return
    try {
      await onClearSnapshot()
      onNotice('Manual evidence snapshot removed. Source artifacts were not changed.')
    } catch {
      onNotice('The manual evidence snapshot could not be removed.', true)
    }
  }

  return (
    <aside className={`evidence-source-rail ${mobileExpanded ? 'source-rail-mobile-expanded' : 'source-rail-mobile-collapsed'}`} aria-label="Evidence sources">
      <div className="source-rail-heading">
        <div>
          <span className="eyebrow">Evidence sources</span>
          <strong>{modeLabel(mode)}</strong>
        </div>
        <div className="source-rail-heading-actions">
          {mode === 'degraded' && (
            <button type="button" className="icon-command" onClick={() => void onRetryCollector()} title="Retry collector" aria-label="Retry collector">
              <RefreshCw size={16} />
            </button>
          )}
          <button
            type="button"
            className="icon-command source-rail-toggle"
            onClick={() => setMobileExpanded((current) => !current)}
            aria-expanded={mobileExpanded}
            aria-controls="evidence-source-details"
            title={mobileExpanded ? 'Collapse evidence connections' : 'Expand evidence connections'}
            aria-label={mobileExpanded ? 'Collapse evidence connections' : 'Expand evidence connections'}
          >
            {mobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div id="evidence-source-details">
        {error && <p className="source-rail-alert"><AlertTriangle size={14} />{error}</p>}

        {mode === 'hosted' && (
          <div className="snapshot-actions">
            <input ref={snapshotInput} className="hidden" type="file" accept="application/json,.json,.jsonl" onChange={handleSnapshotImport} />
            <button type="button" onClick={() => snapshotInput.current?.click()}><Upload size={14} />Import snapshot</button>
            <button type="button" disabled={!snapshotCount} onClick={handleSnapshotExport}><Download size={14} />Export</button>
            <button type="button" disabled={!snapshotCount} className="danger-command" onClick={() => void handleSnapshotClear()}><Trash2 size={14} />Clear</button>
          </div>
        )}

        <div className="source-list" role="list">
          {sources.map((source) => (
            <button
              type="button"
              role="listitem"
              key={source.id}
              className={selected?.id === source.id ? 'source-row source-row-active' : 'source-row'}
              onClick={() => setSelectedId(source.id)}
            >
              <HealthIcon health={mode === 'hosted' ? 'not-configured' : source.health} />
              <span><strong>{source.displayName}</strong><small>{source.evidenceType}</small></span>
              <em>{HEALTH_LABELS[mode === 'hosted' ? 'not-configured' : source.health]}</em>
            </button>
          ))}
        </div>

        {selected && (
          <SourceDetail
            mode={mode}
            source={selected}
            rejects={selectedRejects}
            onConfigure={onConfigure}
            onRefresh={onRefresh}
            onDisconnect={onDisconnect}
            onRetryRejected={onRetryRejected}
            onNotice={onNotice}
          />
        )}

        <details className="later-adapters">
          <summary>Later adapters</summary>
          <div>
            {EVIDENCE_ADAPTER_CATALOG.filter((entry) => entry.readiness !== 'available').map((entry) => (
              <p key={entry.id}><strong>{entry.displayName}</strong><span>{entry.boundary}</span></p>
            ))}
          </div>
        </details>
      </div>
    </aside>
  )
}

interface SourceDetailProps {
  mode: CollectorMode
  source: EvidenceSourceState
  rejects: RejectedEvidenceSummary[]
  onConfigure: Props['onConfigure']
  onRefresh: Props['onRefresh']
  onDisconnect: Props['onDisconnect']
  onRetryRejected: Props['onRetryRejected']
  onNotice: Props['onNotice']
}

function SourceDetail({ mode, source, rejects, onConfigure, onRefresh, onDisconnect, onRetryRejected, onNotice }: SourceDetailProps) {
  const [path, setPath] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingPath, setEditingPath] = useState(source.health === 'not-configured')
  const live = mode === 'live'

  useEffect(() => {
    setPath('')
    setEditingPath(source.health === 'not-configured')
  }, [source.id, source.health])

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true)
    try {
      await action()
      onNotice(success)
    } catch (error) {
      onNotice(error instanceof Error ? error.message : 'Evidence source operation failed.', true)
    } finally {
      setBusy(false)
    }
  }

  async function handleConfigure(event: React.FormEvent) {
    event.preventDefault()
    if (!path.trim()) return
    await run(() => onConfigure(source.id, path.trim()), `${source.displayName} connected and refreshed.`)
    setPath('')
  }

  function handleDisconnect() {
    if (!window.confirm(`Disconnect ${source.displayName} and remove only SancusSight-collected state? Source artifacts will remain untouched.`)) return
    void run(() => onDisconnect(source.id), `${source.displayName} disconnected. Source artifacts were not changed.`)
  }

  return (
    <section className="source-detail" aria-label={`${source.displayName} source details`}>
      <dl>
        <div><dt>Last accepted</dt><dd>{source.lastAcceptedAt ? formatTime(source.lastAcceptedAt) : 'None'}</dd></div>
        <div><dt>Rejected</dt><dd>{source.rejectedCount}</dd></div>
        {source.lag ? <div><dt>Lag</dt><dd>{source.lag} bytes</dd></div> : null}
      </dl>

      {mode === 'hosted' ? (
        <p className="source-guidance">Viewer only: import a snapshot here. Source files and credentials stay wherever the collector runs.</p>
      ) : mode === 'degraded' ? (
        <p className="source-guidance">Collector unavailable. Retained records keep their original freshness.</p>
      ) : source.health === 'failed' || source.health === 'permission-required' ? (
        <p className="source-guidance">{source.health === 'permission-required' ? 'Restore read permission or update the source path.' : 'Inspect rejected evidence or update the source path.'}</p>
      ) : null}

      {live && (source.health === 'not-configured' || editingPath) && (
        <form className="source-path-form" onSubmit={handleConfigure}>
          <label htmlFor={`source-path-${source.id}`}>{source.health === 'not-configured' ? 'Evidence path' : 'Replace path'}</label>
          <div>
            <FolderOpen size={15} aria-hidden="true" />
            <input id={`source-path-${source.id}`} value={path} onChange={(event) => setPath(event.target.value)} placeholder="Local directory or packet path" autoComplete="off" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy || !path.trim()}>Connect</button>
        </form>
      )}

      {live && source.health !== 'not-configured' && (
        <div className="source-detail-actions">
          <button type="button" className="icon-text-command" disabled={busy} onClick={() => void run(() => onRefresh(source.id), `${source.displayName} refreshed.`)}><RefreshCw size={15} />Refresh</button>
          <button type="button" className="icon-text-command" disabled={busy} onClick={() => setEditingPath((current) => !current)}><FolderOpen size={15} />{editingPath ? 'Cancel' : 'Change path'}</button>
          <button type="button" className="icon-text-command danger-command" disabled={busy} onClick={handleDisconnect}><Unplug size={15} />Disconnect</button>
        </div>
      )}

      {rejects.length > 0 && (
        <div className="source-rejects">
          <strong>Latest rejection</strong>
          <p>{rejects.at(-1)?.guidance}</p>
          {live && <button type="button" className="icon-text-command" disabled={busy} onClick={() => void run(() => onRetryRejected(rejects.at(-1)!.id), 'Rejected evidence retried against the current source configuration.')}><RefreshCw size={14} />Retry</button>}
        </div>
      )}
    </section>
  )
}

function HealthIcon({ health }: { health: EvidenceSourceHealth }) {
  if (health === 'current') return <CheckCircle2 className="health-current" size={16} aria-hidden="true" />
  if (health === 'stale') return <Clock3 className="health-stale" size={16} aria-hidden="true" />
  if (health === 'failed' || health === 'permission-required') return <ShieldAlert className="health-failed" size={16} aria-hidden="true" />
  return <span className="health-unconfigured" aria-hidden="true" />
}

function modeLabel(mode: CollectorMode): string {
  if (mode === 'live') return 'Local evidence collector'
  if (mode === 'connecting') return 'Connecting'
  if (mode === 'degraded') return 'Local collector degraded'
  return 'Hosted / manual viewer'
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
