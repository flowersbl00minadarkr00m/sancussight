import type { ConnectionNotice, RegistrySession } from '../types'

interface SourceWriteStripProps {
  session: RegistrySession
  feedback?: ConnectionNotice
  onSaveSource: () => void
}

export function SourceWriteStrip({ session, feedback, onSaveSource }: SourceWriteStripProps) {
  const connection = session.connection
  if (session.sourceKind !== 'file' || !connection) return null

  const pending = feedback?.operationPhase === 'pending'
  const conflicted = connection.syncState === 'conflict'
  const permissionRequired = connection.syncState === 'permission-required'
  const unsaved = session.dirty || connection.syncState === 'unsaved' || conflicted
  const canSave = session.dirty && connection.syncState === 'unsaved' && !pending

  if (!unsaved && !feedback) return null

  const title = pending
    ? 'Saving to source'
    : conflicted
      ? 'Unsaved changes — Conflict'
      : permissionRequired
        ? 'Unsaved changes — Permission required'
        : unsaved
          ? 'Unsaved changes'
          : 'Saved to source'
  const tone = conflicted || permissionRequired || feedback?.tone === 'error'
    ? 'error'
    : pending || unsaved
      ? 'pending'
      : 'success'

  return (
    <div
      className={`source-write-strip source-write-strip-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="source-write-copy">
        <strong>{title}</strong>
        <span>
          {feedback?.message
            ?? (conflicted
              ? 'Resolve the source conflict before saving.'
              : permissionRequired
                ? 'Restore source permission before saving.'
                : `Changes are held in the recovery cache for ${connection.sourceName}.`)}
        </span>
      </div>
      {canSave && (
        <button type="button" className="btn btn-primary" onClick={onSaveSource}>
          Save to source
        </button>
      )}
    </div>
  )
}
