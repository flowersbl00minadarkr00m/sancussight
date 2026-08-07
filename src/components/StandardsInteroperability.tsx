import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, RefObject } from 'react'
import type { EvidenceEnvelopeV1, OpenLineagePreviewV1 } from '../types'
import { browserSha256 } from '../lib/evidence-packet'
import {
  type BuildUnsignedInTotoStatementResult,
  buildUnsignedInTotoStatement,
  downloadUnsignedInTotoStatement,
} from '../lib/in-toto-statement'
import {
  type InteroperabilityPreviewSnapshotV1,
  InteroperabilityPreviewStore,
} from '../lib/interoperability-store'
import {
  OPENLINEAGE_IMPORT_LIMITS,
  parseOpenLineageImport,
} from '../lib/openlineage-import'
import { INTEROPERABILITY_PROFILES } from '../lib/standards-profiles'
import {
  type TelemetryAlignmentPreviewV1,
  projectTelemetryAlignment,
} from '../lib/telemetry-alignment'

interface Props {
  evidence: readonly EvidenceEnvelopeV1[]
}

type OperationState =
  | { state: 'idle'; message: string }
  | { state: 'pending'; message: string }
  | { state: 'success'; message: string }
  | { state: 'failure'; message: string }

type StatementProjection = Extract<
  BuildUnsignedInTotoStatementResult,
  { ok: true }
>

const previewStore = new InteroperabilityPreviewStore()
const PACKET_FILE_LIMIT_BYTES = 1024 * 1024

export function StandardsInteroperability({ evidence }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const importResultRef = useRef<HTMLHeadingElement>(null)
  const statementResultRef = useRef<HTMLHeadingElement>(null)
  const [history, setHistory] = useState<InteroperabilityPreviewSnapshotV1[]>([])
  const [persistence, setPersistence] = useState<'loading' | 'available' | 'unavailable'>('loading')
  const [openLineagePreview, setOpenLineagePreview] = useState<OpenLineagePreviewV1>()
  const [statementProjection, setStatementProjection] = useState<StatementProjection>()
  const [importStatus, setImportStatus] = useState<OperationState>({
    state: 'idle',
    message: 'Select a local OpenLineage JSON or JSONL file.',
  })
  const [alignmentStatus, setAlignmentStatus] = useState<OperationState>({
    state: 'idle',
    message: 'Alignment uses accepted runtime metadata already present in this workspace.',
  })
  const [statementStatus, setStatementStatus] = useState<OperationState>({
    state: 'idle',
    message: 'Select a validated local Evidence Packet JSON file.',
  })
  const runtimeEvidence = useMemo(
    () => evidence.filter(item => item.source === 'runtime-telemetry'),
    [evidence],
  )
  const alignmentResult = useMemo(
    () => projectTelemetryAlignment(runtimeEvidence),
    [runtimeEvidence],
  )
  const alignment = alignmentResult.ok ? alignmentResult.preview : undefined

  useEffect(() => {
    headingRef.current?.focus()
    let cancelled = false
    void previewStore.list().then(result => {
      if (cancelled) return
      setPersistence(result.availability)
      setHistory(result.snapshots)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function retain(snapshot: InteroperabilityPreviewSnapshotV1) {
    const result = await previewStore.record(snapshot)
    setPersistence(result.availability)
    if (result.availability === 'available') setHistory(result.snapshots)
    return result.availability
  }

  async function handleOpenLineageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportStatus({ state: 'pending', message: 'Validating the local OpenLineage file…' })
    setOpenLineagePreview(undefined)
    if (file.size > OPENLINEAGE_IMPORT_LIMITS.maxBytes) {
      setImportStatus({
        state: 'failure',
        message: 'Import failed: file-too-large. No file bytes were retained.',
      })
      focusResult(importResultRef)
      return
    }

    try {
      const text = await file.text()
      const importedAt = new Date().toISOString()
      const result = await parseOpenLineageImport({
        text,
        byteLength: file.size,
        importedAt,
      }, browserSha256)
      if (!result.ok) {
        setImportStatus({
          state: 'failure',
          message: `Import failed: ${result.errorCode}. Unsupported profile or input was not retained.`,
        })
        focusResult(importResultRef)
        return
      }

      const preview = result.preview
      setOpenLineagePreview(preview)
      const availability = await retain({
        schemaVersion: 1,
        profileId: preview.profileId,
        operationKind: 'openlineage-import',
        createdAt: preview.importedAt,
        acceptedCount: preview.acceptedCount,
        rejectedCount: preview.rejectedCount,
        omittedCount: preview.omittedCount,
        reasonCodeCounts: [
          ...preview.rejectionCodeCounts,
          ...preview.omissionCodeCounts,
        ],
        safeHashes: preview.safeHashes.map(item => item.hash.slice('sha256:'.length)),
        persistenceState: 'available',
      })
      setImportStatus({
        state: 'success',
        message: `Sanitized import complete: ${preview.acceptedCount} accepted, ${preview.rejectedCount} rejected, ${preview.omittedCount} omitted. ${
          availability === 'available'
            ? 'The bounded preview is stored locally.'
            : 'Browser persistence is unavailable; the current in-memory preview remains usable.'
        }`,
      })
    } catch {
      setImportStatus({
        state: 'failure',
        message: 'Import failed locally. No file bytes or unprojected values were retained.',
      })
    }
    focusResult(importResultRef)
  }

  async function handleAlignmentPreview() {
    setAlignmentStatus({ state: 'pending', message: 'Preparing the metadata-only alignment preview…' })
    if (!alignmentResult.ok) {
      setAlignmentStatus({
        state: 'failure',
        message: 'Unsupported profile or input. No alignment preview was stored.',
      })
      return
    }
    const preview = alignmentResult.preview
    const safeHashes = [...new Set(preview.rows.flatMap(row => (
      row.sourceRef?.startsWith('sha256:')
        ? [row.sourceRef.slice('sha256:'.length)]
        : []
    )))]
    const createdAt = new Date().toISOString()
    let unavailable = false
    for (const profile of preview.profiles) {
      const rows = preview.rows.filter(row => row.profileId === profile.profileId)
      const availability = await retain({
        schemaVersion: 1,
        profileId: profile.profileId,
        operationKind: 'telemetry-alignment',
        createdAt,
        acceptedCount: preview.acceptedCount,
        rejectedCount: preview.rejectedCount,
        omittedCount: rows.filter(row => row.state === 'omitted-private').length,
        reasonCodeCounts: countStates(rows.map(row => row.state)),
        safeHashes,
        persistenceState: 'available',
      })
      if (availability === 'unavailable') unavailable = true
    }
    setAlignmentStatus({
      state: 'success',
      message: `${preview.acceptedCount} accepted runtime ${
        preview.acceptedCount === 1 ? 'record' : 'records'
      } aligned under pinned profiles. ${
        unavailable
          ? 'Browser persistence is unavailable; the current alignment remains visible.'
          : 'Sanitized alignment summaries are stored locally.'
      }`,
    })
  }

  async function handlePacketFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatementProjection(undefined)
    setStatementStatus({ state: 'pending', message: 'Validating the local Evidence Packet…' })
    if (file.size > PACKET_FILE_LIMIT_BYTES) {
      setStatementStatus({
        state: 'failure',
        message: 'Evidence Packet is invalid: the local file exceeds the bounded input size.',
      })
      focusResult(statementResultRef)
      return
    }

    try {
      const packet: unknown = JSON.parse(await file.text())
      const projection = await buildUnsignedInTotoStatement({
        packet,
        exportedAt: new Date().toISOString(),
      }, browserSha256)
      if (!projection.ok) {
        setStatementStatus({
          state: 'failure',
          message: `Evidence Packet is invalid or unsupported (${projection.errorCode}). No Statement was created.`,
        })
        focusResult(statementResultRef)
        return
      }
      setStatementProjection(projection)
      const availability = await retain({
        schemaVersion: 1,
        profileId: projection.profileId,
        operationKind: 'unsigned-statement',
        createdAt: projection.exportedAt,
        acceptedCount: 1,
        rejectedCount: 0,
        omittedCount: 0,
        reasonCodeCounts: [],
        safeHashes: [projection.statement.subject[0].digest.sha256],
        persistenceState: 'available',
        confirmationDigest: projection.confirmationDigest,
      })
      setStatementStatus({
        state: 'success',
        message: `Unsigned Statement validated in memory and ready for local download. It is not externally verified. ${
          availability === 'available'
            ? 'Only the bounded preview digest was stored.'
            : 'Browser persistence is unavailable; the validated in-memory Statement remains usable.'
        }`,
      })
    } catch {
      setStatementStatus({
        state: 'failure',
        message: 'Evidence Packet is invalid. No Statement or download claim was created.',
      })
    }
    focusResult(statementResultRef)
  }

  async function handleStatementDownload() {
    if (!statementProjection) return
    setStatementStatus({ state: 'pending', message: 'Preparing the local unsigned Statement download…' })
    const result = await downloadUnsignedInTotoStatement(statementProjection, browserSha256)
    setStatementStatus(result.ok
      ? {
          state: 'success',
          message: `${result.filename} downloaded locally. The Statement is unsigned and not externally verified.`,
        }
      : {
          state: 'failure',
          message: `Local download failed (${result.errorCode}). No successful download is claimed.`,
        })
    focusResult(statementResultRef)
  }

  async function handleClear() {
    if (!window.confirm('Clear only Feature 011 interoperability preview history from this browser? Evidence, registry, check, and version history will not be changed.')) return
    const result = await previewStore.clear()
    setPersistence(result.availability)
    if (result.availability === 'available') {
      setHistory([])
      setOpenLineagePreview(undefined)
      setStatementProjection(undefined)
      setImportStatus({ state: 'idle', message: 'Select a local OpenLineage JSON or JSONL file.' })
      setStatementStatus({ state: 'idle', message: 'Select a validated local Evidence Packet JSON file.' })
    }
    headingRef.current?.focus()
  }

  return (
    <article className="standards-interoperability" aria-labelledby="standards-interoperability-heading">
      <header className="interoperability-hero">
        <span className="eyebrow">Advanced evidence workspace</span>
        <h1 id="standards-interoperability-heading" ref={headingRef} tabIndex={-1}>Standards Interoperability</h1>
        <p>Inspect bounded structural mappings locally without turning imported metadata into verified SancusSight evidence.</p>
        <p className="interoperability-nonclaim">This workspace does not claim conformance, certification, evidence truth, or authenticated provenance.</p>
      </header>

      {persistence === 'unavailable' && (
        <p className="interoperability-alert" role="status">Browser persistence is unavailable. Current in-memory previews remain usable, but history and clear cannot be confirmed.</p>
      )}

      <section className="interoperability-section" aria-labelledby="interoperability-profiles-heading">
        <div className="interoperability-section-heading">
          <span className="eyebrow">Pinned contracts</span>
          <h2 id="interoperability-profiles-heading">Profiles and limits</h2>
        </div>
        <div className="interoperability-profile-grid">
          {INTEROPERABILITY_PROFILES.map(profile => (
            <article key={profile.id}>
              <strong>{profile.upstreamName}</strong>
              <span>{profile.upstreamProfile} · {profile.upstreamVersion} · {profile.stability}</span>
              <a className="interoperability-hash" href={profile.sourceUrl}>{profile.sourceUrl}</a>
              <p>{profile.limitation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="interoperability-section" aria-labelledby="openlineage-heading">
        <div className="interoperability-section-heading">
          <span className="eyebrow">Local metadata import</span>
          <h2 id="openlineage-heading">OpenLineage preview</h2>
        </div>
        <label className="interoperability-file">
          <span>Select JSON or JSONL</span>
          <input type="file" accept="application/json,.json,.jsonl" onChange={event => void handleOpenLineageFile(event)} />
        </label>
        <p role="status" className={`interoperability-status interoperability-status-${importStatus.state}`}>{importStatus.message}</p>
        <h3 ref={importResultRef} tabIndex={-1}>Latest sanitized import</h3>
        {openLineagePreview ? <PreviewSummary preview={openLineagePreview} /> : (
          <p className="interoperability-empty">No sanitized OpenLineage preview is available.</p>
        )}
      </section>

      <section className="interoperability-section" aria-labelledby="telemetry-alignment-heading">
        <div className="interoperability-section-heading">
          <span className="eyebrow">Accepted runtime metadata</span>
          <h2 id="telemetry-alignment-heading">Telemetry alignment</h2>
        </div>
        {!alignment || alignment.acceptedCount === 0 ? (
          <p className="interoperability-empty">No accepted runtime telemetry is available. The matrix keeps private-content omissions explicit without creating telemetry.</p>
        ) : (
          <p>{alignment.acceptedCount} accepted runtime {alignment.acceptedCount === 1 ? 'record' : 'records'} are available for metadata-only alignment.</p>
        )}
        <button type="button" className="btn" disabled={alignmentStatus.state === 'pending'} onClick={() => void handleAlignmentPreview()}>
          Refresh and retain alignment preview
        </button>
        <p role="status" className={`interoperability-status interoperability-status-${alignmentStatus.state}`}>{alignmentStatus.message}</p>
        {alignment ? <AlignmentTable preview={alignment} /> : <p>Unsupported profile or input.</p>}
      </section>

      <section className="interoperability-section" aria-labelledby="statement-heading">
        <div className="interoperability-section-heading">
          <span className="eyebrow">Local structural export</span>
          <h2 id="statement-heading">Unsigned in-toto Statement</h2>
        </div>
        <p>The fixed Statement projection contains no signature or external verification result.</p>
        <div className="interoperability-actions">
          <label className="interoperability-file">
            <span>Select Evidence Packet JSON</span>
            <input type="file" accept="application/json,.json" onChange={event => void handlePacketFile(event)} />
          </label>
          <button type="button" className="btn btn-primary" disabled={!statementProjection || statementStatus.state === 'pending'} onClick={() => void handleStatementDownload()}>
            Download unsigned Statement
          </button>
        </div>
        <p role="status" className={`interoperability-status interoperability-status-${statementStatus.state}`}>{statementStatus.message}</p>
        <h3 ref={statementResultRef} tabIndex={-1}>Statement validation</h3>
        {statementProjection ? (
          <dl className="interoperability-summary">
            <div><dt>Subject digest</dt><dd className="interoperability-hash">{statementProjection.statement.subject[0].digest.sha256}</dd></div>
            <div><dt>Confirmation digest</dt><dd className="interoperability-hash">{statementProjection.confirmationDigest}</dd></div>
            <div><dt>Qualification</dt><dd>{statementProjection.statement.predicate.qualification}</dd></div>
            <div><dt>Authentication</dt><dd>Unsigned · not externally verified</dd></div>
          </dl>
        ) : (
          <p className="interoperability-empty">No validated Statement is ready. Evidence Packet is invalid until local validation succeeds.</p>
        )}
      </section>

      <section className="interoperability-section" aria-labelledby="preview-history-heading">
        <div className="interoperability-section-heading interoperability-section-heading-actions">
          <div>
            <span className="eyebrow">Browser-local convenience</span>
            <h2 id="preview-history-heading">Preview history</h2>
          </div>
          <button type="button" className="btn danger-command" disabled={history.length === 0 || persistence !== 'available'} onClick={() => void handleClear()}>
            Clear preview history
          </button>
        </div>
        {persistence === 'unavailable' ? (
          <p className="interoperability-empty">Preview history is unavailable. Stored records could not be safely validated, so no healthy empty-history claim is shown.</p>
        ) : history.length === 0 ? (
          <p className="interoperability-empty">No interoperability preview history is stored.</p>
        ) : (
          <ul className="interoperability-history">
            {history.map(snapshot => (
              <li key={`${snapshot.profileId}:${snapshot.createdAt}:${snapshot.confirmationDigest ?? snapshot.safeHashes[0] ?? 'empty'}`}>
                <strong>{snapshot.profileId}</strong>
                <span>{snapshot.operationKind} · {formatTime(snapshot.createdAt)}</span>
                <span>{snapshot.acceptedCount} accepted · {snapshot.rejectedCount} rejected · {snapshot.omittedCount} omitted</span>
                {snapshot.confirmationDigest && <code className="interoperability-hash">{snapshot.confirmationDigest}</code>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="interoperability-limitations" aria-labelledby="interoperability-limitations-heading">
        <span className="eyebrow">Permanent limits</span>
        <h2 id="interoperability-limitations-heading">What this workspace never proves</h2>
        <ul>
          <li>Imported lineage metadata is an external, profile-qualified observation—not verified evidence or a lineage edge.</li>
          <li>Alignment is a field-level metadata preview—not telemetry emission or implementation-wide compatibility.</li>
          <li>The Statement is unsigned and not externally verified; structural wrapping does not authenticate provenance.</li>
          <li>No raw file bytes, identifiers, facets, content, paths, credentials, identity, prompts, responses, reasoning, tool payloads, documents, images, or hash preimages enter preview history.</li>
        </ul>
      </section>
    </article>
  )
}

function PreviewSummary({ preview }: { preview: OpenLineagePreviewV1 }) {
  return (
    <>
      <dl className="interoperability-summary">
        <div><dt>Profile</dt><dd>{preview.profileId}</dd></div>
        <div><dt>Input kind</dt><dd>{preview.inputKind}</dd></div>
        <div><dt>Accepted</dt><dd>{preview.acceptedCount}</dd></div>
        <div><dt>Rejected</dt><dd>{preview.rejectedCount}</dd></div>
        <div><dt>Omitted</dt><dd>{preview.omittedCount}</dd></div>
        <div><dt>Qualification</dt><dd>{preview.qualification}</dd></div>
      </dl>
      {preview.safeHashes.length > 0 && (
        <details>
          <summary>Safe entity hashes ({preview.safeHashes.length})</summary>
          <ul className="interoperability-hash-list">
            {preview.safeHashes.map(item => <li key={`${item.kind}:${item.hash}`}><span>{item.kind}</span><code className="interoperability-hash">{item.hash}</code></li>)}
          </ul>
        </details>
      )}
    </>
  )
}

function AlignmentTable({ preview }: { preview: TelemetryAlignmentPreviewV1 }) {
  return (
    <div className="interoperability-table-wrap" tabIndex={0} aria-label="Telemetry metadata alignment table">
      <table className="interoperability-table">
        <thead><tr><th>Profile</th><th>State</th><th>Source</th><th>Target</th><th>Value / limitation</th></tr></thead>
        <tbody>
          {preview.rows.map((row, index) => (
            <tr key={`${row.profileId}:${row.sourceField}:${row.sourceRef ?? ''}:${index}`}>
              <td>{row.profileId}</td>
              <td><span className={`interoperability-state interoperability-state-${row.state}`}>{row.state}</span></td>
              <td>{row.sourceField}</td>
              <td>{row.targetField}</td>
              <td className="interoperability-hash">{row.value === undefined ? row.limitation : String(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function countStates(states: readonly string[]) {
  const counts = new Map<string, number>()
  for (const state of states) counts.set(state, (counts.get(state) ?? 0) + 1)
  return [...counts]
    .map(([code, count]) => ({ code, count }))
    .sort((left, right) => compareText(left.code, right.code))
}

function focusResult(ref: RefObject<HTMLHeadingElement | null>) {
  window.requestAnimationFrame(() => ref.current?.focus())
}

function formatTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function compareText(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0
}
