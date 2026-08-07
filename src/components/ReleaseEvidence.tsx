import { useMemo } from 'react'
import type { EvidenceEnvelopeV1, EvidenceRuntimeId, ReleaseEvidenceManifestV1, ReleaseEvidenceSourceId } from '../types'
import { RELEASE_EVIDENCE_SOURCE_IDS, REQUIRED_RELEASE_FAILURE_CASES } from '../types'
import { calculateReleaseGate, releaseEvidenceRecords } from '../lib/release-gate'
import type { ReleaseProgressRead } from '../lib/release-progress'
import type { CollectorMode } from '../lib/use-collector'
import { ReleaseProgressPanel } from './ReleaseProgressPanel'

interface Props {
  mode: CollectorMode
  evidence: EvidenceEnvelopeV1[]
  manifest?: ReleaseEvidenceManifestV1
  progress?: ReleaseProgressRead
}

const SOURCE_LABELS: Record<ReleaseEvidenceSourceId, string> = {
  'runtime-telemetry': 'Runtime telemetry',
  praxen: 'Praxen',
  pipelock: 'Pipelock',
  rampart: 'RAMPART',
  aimap: 'AIMap',
}

const STATE_LABELS: Record<string, string> = {
  missing: 'Missing qualifying evidence',
  'non-operational': 'Non-operational evidence',
  'wrong-run': 'Run mismatch',
  'wrong-target': 'Target mismatch',
  'wrong-version': 'Version mismatch',
  incompatible: 'Contract mismatch',
  stale: 'Stale evidence',
  untrusted: 'Verification not trusted',
  failed: 'Failed evidence',
  current: 'Current for this run',
}

const TARGET_STATE_CLASSES: Record<string, string> = {
  current: 'release-target-current',
  missing: 'release-target-blocked',
  'non-operational': 'release-target-blocked',
  'wrong-run': 'release-target-blocked',
  'wrong-target': 'release-target-blocked',
  'wrong-version': 'release-target-blocked',
  incompatible: 'release-target-blocked',
  stale: 'release-target-blocked',
  untrusted: 'release-target-blocked',
  failed: 'release-target-blocked',
}

export function ReleaseEvidence({ mode, evidence, manifest, progress }: Props) {
  const result = useMemo(() => {
    const now = new Date().toISOString()
    return calculateReleaseGate(manifest ?? unloadedManifest(now), evidence, now)
  }, [evidence, manifest])
  const localReady = mode === 'live' && !!manifest && result.ready
  const statusTitle = localReady ? 'Ready for release' : result.status === 'expired' ? 'Release evidence expired' : 'Not ready for release'
  const statusDetail = mode === 'hosted' && manifest
    ? 'This is an imported snapshot; it cannot prove what is current on this device.'
    : !manifest
      ? (mode === 'hosted' ? 'Hosted / manual evidence cannot provide local freshness.' : 'No qualifying release manifest is loaded.')
      : localReady ? 'All required operational evidence and failure cases pass this manifest.' : `${result.blockers.length} release condition${result.blockers.length === 1 ? ' remains' : 's remain'}.`
  const plainMeaning = localReady
    ? 'All required evidence categories and failure checks are current for this release window.'
    : result.status === 'expired'
      ? 'The evidence was valid for an earlier release window, but that window has closed. A fresh run is required.'
      : result.blockers.length > 0
        ? `${result.blockers.length} required check${result.blockers.length === 1 ? ' is' : 's are'} still missing, stale, or unverified.`
        : 'Load a release manifest to evaluate the evidence window.'

  const referencedBySource = useMemo(() => {
    const grouped = new Map<ReleaseEvidenceSourceId, EvidenceEnvelopeV1[]>()
    if (manifest) for (const source of RELEASE_EVIDENCE_SOURCE_IDS) grouped.set(source, releaseEvidenceRecords(manifest, evidence, source))
    return grouped
  }, [evidence, manifest])

  return (
    <section className="release-evidence" aria-labelledby="release-evidence-title">
      <header className="release-heading">
        <div>
          <span className="eyebrow">Spec 005 gate</span>
          <h1 id="release-evidence-title">Release evidence</h1>
          <p>Five-category operational proof, including three real AI runtimes, is evaluated here as a point-in-time gate.</p>
        </div>
        <div className={`release-status ${localReady ? 'release-status-passed' : 'release-status-blocked'}`} role="status" aria-live="polite">
          <strong>{statusTitle}</strong>
          <span>{statusDetail}</span>
        </div>
      </header>

      <div className="release-notice">
        <strong>What this check means</strong>
        <p>{plainMeaning} SancusSight only reports the loaded manifest and normalized evidence; it does not install, run, scan, or change upstream tools.</p>
      </div>

      <ReleaseProgressPanel
        mode={mode}
        progress={progress}
        manifest={manifest}
        currentSourceCount={Object.values(result.sources).filter(source => source.state === 'current').length}
      />

      <section className="release-section" aria-labelledby="release-sources-title">
        <div className="release-section-heading">
          <div>
            <span className="eyebrow">Source gates</span>
            <h2 id="release-sources-title">All five evidence categories are required</h2>
          </div>
          <span className="release-count">{result.sources ? Object.values(result.sources).filter(source => source.state === 'current').length : 0}/5 current</span>
        </div>
        <div className="release-source-list">
          {RELEASE_EVIDENCE_SOURCE_IDS.map(source => {
            const gate = result.sources[source]
            const records = referencedBySource.get(source) ?? []
            const latest = [...records].sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))[0]
            return (
              <details className="release-source-card" key={source}>
                <summary className="release-source-title">
                  <div><strong>{SOURCE_LABELS[source]}</strong><span>{records.length === 0 ? 'No qualifying evidence' : (gate.state === 'missing' ? 'No manifest reference' : STATE_LABELS[gate.state])}</span></div>
                  <em>{gate.verification}</em>
                </summary>
                <dl className="release-source-details">
                  <div><dt>Qualification</dt><dd>{latest ? 'Operational record observed' : 'Not available'}</dd></div>
                  <div><dt>Version</dt><dd>{latest?.operational?.sourceVersion ?? 'Not available'}</dd></div>
                  <div><dt>Target</dt><dd>{latest?.operational?.targetId ?? 'Not available'}</dd></div>
                  <div><dt>Run</dt><dd>{latest?.operational?.runId ?? 'Not available'}</dd></div>
                  <div><dt>Observed</dt><dd>{latest ? formatTime(latest.observedAt) : 'Not available'}</dd></div>
                  <div><dt>Freshness</dt><dd>{gate.fresh ? 'Within gate window' : 'Not established'}</dd></div>
                </dl>
                {gate.targets && gate.targets.length > 0 && (
                  <div className="release-targets" aria-label={`${SOURCE_LABELS[source]} required targets`}>
                    <strong>Required targets</strong>
                    <ul>
                      {gate.targets.map(target => (
                        <li className={TARGET_STATE_CLASSES[target.state] ?? 'release-target-blocked'} key={target.targetId}>
                          <div>
                            <b>{target.targetId}</b>
                            <span className="release-target-state" data-state={target.state}>{STATE_LABELS[target.state]}</span>
                          </div>
                          <dl>
                            <div><dt>Run qualification</dt><dd>{target.state === 'current' ? 'Qualifies' : 'Does not qualify'}</dd></div>
                            <div><dt>Observed</dt><dd>{target.latestObservedAt ? formatTime(target.latestObservedAt) : 'Not available'}</dd></div>
                            <div><dt>Evidence</dt><dd>{target.evidenceIds.length}</dd></div>
                          </dl>
                          {target.blockers[0] && <p>{target.blockers[0]}</p>}
                        </li>
                      ))}
                    </ul>
                    {gate.targets.some(target => target.state !== 'current') && (
                      <p className="release-target-recovery">Rerun the affected target within the active release run if time remains; otherwise start a new release run.</p>
                    )}
                  </div>
                )}
                {gate.blockers.length > 0 && <p className="release-source-blocker">{gate.blockers[0]}</p>}
              </details>
            )
          })}
        </div>
      </section>

      <section className="release-section release-two-column">
        <div>
          <div className="release-section-heading"><div><span className="eyebrow">Runtime coverage</span><h2>Correctly attributed sessions</h2></div></div>
          <ul className="release-check-list">
            {([['codex-cli', 'Codex CLI'], ['claude-code', 'Claude Code'], ['pi', 'Pi']] as const).map(([runtime, label]) => <li key={runtime}><span>{label}</span><strong>{runtimeStatus(runtime, result.runtimeCoverage, referencedBySource.get('runtime-telemetry') ?? [])}</strong></li>)}
          </ul>
        </div>
        <div>
          <div className="release-section-heading"><div><span className="eyebrow">Failure and recovery</span><h2>Mandatory cases</h2></div></div>
          <details className="release-check-details">
            <summary>{REQUIRED_RELEASE_FAILURE_CASES.length} required cases · {Object.values(result.failureCases).filter(value => value === 'passed').length} passed</summary>
          <ul className="release-check-list">
            {REQUIRED_RELEASE_FAILURE_CASES.map(failureCase => <li key={failureCase}><span>{failureCase}</span><strong>{result.failureCases[failureCase]}</strong></li>)}
          </ul>
          </details>
        </div>
      </section>

      <section className="release-section" aria-labelledby="release-blockers-title">
        <div className="release-section-heading"><div><span className="eyebrow">Decision</span><h2 id="release-blockers-title">Exact unmet conditions</h2></div></div>
        <details className="release-blocker-details">
          <summary>Show {result.blockers.length} exact conditions</summary>
        <ul className="release-blockers">
          {result.blockers.slice(0, 24).map(blocker => <li key={blocker}>{blocker}</li>)}
        </ul>
        {result.blockers.length > 24 && <p className="release-more">{result.blockers.length - 24} additional conditions remain.</p>}
        </details>
      </section>

      <footer className="release-footer">This view reports evidence qualification and readiness only. It is not a security, compliance, or continuous-monitoring claim.</footer>
    </section>
  )
}

function unloadedManifest(now: string): ReleaseEvidenceManifestV1 {
  return {
    schemaVersion: 1,
    releaseRunId: 'release-manifest-not-loaded',
    startedAt: now,
    runtimes: ['codex-cli', 'claude-code', 'pi'],
    sources: Object.fromEntries(RELEASE_EVIDENCE_SOURCE_IDS.map(source => [source, {
      version: 'manifest-not-loaded',
      targetId: 'target-not-loaded',
      contractVersion: 'contract-not-loaded',
      evidenceIds: [],
      verification: 'not-applicable',
      operational: false,
    }])) as unknown as ReleaseEvidenceManifestV1['sources'],
    failureCases: Object.fromEntries(REQUIRED_RELEASE_FAILURE_CASES.map(failureCase => [failureCase, 'not-run'])),
    status: 'not-run',
    untestedBoundaries: ['release-manifest-not-loaded'],
  }
}

function runtimeStatus(runtime: EvidenceRuntimeId, coverage: readonly EvidenceRuntimeId[], records: readonly EvidenceEnvelopeV1[]): string {
  if (!coverage.includes(runtime)) return 'Missing'
  const latest = records.filter(record => record.operational?.runtime === runtime).sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))[0]
  const provider = latest?.operational?.telemetryProvider ?? (latest?.source === 'agent-beacon' ? 'agent-beacon' : undefined)
  const transport = latest?.operational?.telemetryTransport ?? (latest?.source === 'agent-beacon' ? 'jsonl' : undefined)
  return provider ? `Observed · ${provider}${transport ? ` / ${transport}` : ''}` : 'Observed'
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
