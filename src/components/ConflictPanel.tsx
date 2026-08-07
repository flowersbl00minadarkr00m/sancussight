interface Props {
  sourceName: string
  onReloadSource: () => void
  onExportWorkingCopy: () => void
  onKeepWorking: () => void
}

export function ConflictPanel({ sourceName, onReloadSource, onExportWorkingCopy, onKeepWorking }: Props) {
  return (
    <section className="conflict-panel" aria-labelledby="conflict-title">
      <div>
        <p className="eyebrow">Source conflict</p>
        <h2 id="conflict-title">Both the working copy and {sourceName} changed.</h2>
        <p>No version was selected or merged. Source write-back remains blocked until you reload or replace the source.</p>
      </div>
      <div className="conflict-actions">
        <button type="button" className="btn btn-primary" onClick={onReloadSource}>Reload source</button>
        <button type="button" className="btn" onClick={onExportWorkingCopy}>Export working copy</button>
        <button type="button" className="btn" onClick={onKeepWorking}>Keep working</button>
      </div>
    </section>
  )
}
