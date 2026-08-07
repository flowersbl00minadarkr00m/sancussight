import type { ReleaseEvidenceManifestV1 } from '../types'
import { RELEASE_ORCHESTRATION_WINDOW_MS } from '../lib/release-gate'
import { progressPercent, type ReleaseProgressRead } from '../lib/release-progress'
import type { CollectorMode } from '../lib/use-collector'

interface Props {
  mode: CollectorMode
  progress?: ReleaseProgressRead
  manifest?: ReleaseEvidenceManifestV1
  currentSourceCount: number
}

const PRODUCER_LABELS: Record<string, string> = {
  'runtime-telemetry': 'Runtime telemetry',
  praxen: 'Praxen',
  pipelock: 'Pipelock',
  rampart: 'RAMPART',
  aimap: 'AIMap',
}

const STAGE_LABELS: Record<string, string> = {
  preflight: 'Preflight',
  'runtime-telemetry': 'Runtime telemetry',
  praxen: 'Praxen assessment',
  pipelock: 'Pipelock verification',
  rampart: 'RAMPART safety run',
  aimap: 'AIMap export',
  'failure-recovery': 'Failure and recovery checks',
  bundling: 'Sanitized bundle',
  finalizing: 'Finalizing release evidence',
}

const STATE_LABELS: Record<string, string> = {
  queued: 'Queued', running: 'Running', waiting: 'Waiting', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled',
}

export function ReleaseProgressPanel({ mode, progress, manifest, currentSourceCount }: Props) {
  if (mode === 'hosted' || mode === 'degraded' && !progress) {
    return <section className="release-progress release-progress-unavailable" aria-labelledby="release-progress-title">
      <div className="release-section-heading"><div><span className="eyebrow">Run visibility</span><h2 id="release-progress-title">Live progress unavailable</h2></div></div>
      <p>Hosted or disconnected evidence can show the final gate, but it cannot report a live producer heartbeat from this device.</p>
    </section>
  }

  const snapshot = progress?.snapshot
  const stale = progress?.stale ?? true
  const percent = snapshot && !stale ? progressPercent(snapshot) : undefined
  const startedAt = snapshot?.startedAt ?? manifest?.startedAt
  const deadline = startedAt ? new Date(Date.parse(startedAt) + RELEASE_ORCHESTRATION_WINDOW_MS) : undefined
  const elapsed = startedAt ? formatDuration(Math.max(0, Date.now() - Date.parse(startedAt))) : 'Not available'
  const stateText = snapshot && !stale ? STATE_LABELS[snapshot.state] : 'Waiting for a current heartbeat'
  const stageText = snapshot && !stale ? STAGE_LABELS[snapshot.stage] : 'No current producer stage reported'
  const producerText = snapshot && !stale ? `${PRODUCER_LABELS[snapshot.producerId]} · ${snapshot.targetId}` : 'No active producer selected'
  const ariaText = percent === undefined ? 'Progress is indeterminate; completion is not inferred.' : `${percent}% complete`

  return <section className="release-progress" aria-labelledby="release-progress-title">
    <div className="release-section-heading">
      <div><span className="eyebrow">Run visibility</span><h2 id="release-progress-title">Producer progress</h2></div>
      <span className={`release-progress-state ${stale ? 'release-progress-state-stale' : ''}`}>{stateText}</span>
    </div>
    <div className="release-progress-track" aria-label="Release producer progress">
      {percent === undefined
        ? <div className="release-progress-indeterminate" role="progressbar" aria-valuetext={ariaText} aria-label={ariaText} />
        : <progress max={100} value={percent} aria-label={ariaText}>{ariaText}</progress>}
    </div>
    <p className="release-progress-summary"><strong>{producerText}</strong><span>{stageText}{snapshot && !stale ? ` · ${snapshot.messageCode}` : ''}</span></p>
    <dl className="release-progress-details">
      <div><dt>Run</dt><dd>{snapshot && !stale ? snapshot.releaseRunId : manifest?.releaseRunId ?? 'Not available'}</dd></div>
      <div><dt>Sources current</dt><dd>{currentSourceCount}/5</dd></div>
      <div><dt>Heartbeat</dt><dd>{snapshot ? `${stale ? 'Stale · ' : ''}${formatTime(snapshot.updatedAt)}` : 'Not available'}</dd></div>
      <div><dt>Elapsed orchestration</dt><dd>{elapsed}</dd></div>
      <div><dt>Orchestration deadline</dt><dd>{deadline ? formatTime(deadline.toISOString()) : 'Not available'} · 30 min max</dd></div>
    </dl>
    <p className="release-progress-note">Progress is advisory and does not qualify evidence. Every source, runtime, and required target must independently satisfy the same current-run 30-minute boundary at final evaluation.</p>
  </section>
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}
