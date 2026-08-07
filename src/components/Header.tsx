import type { Registry, RegistrySession } from '../types'
import { BrandLockup } from './BrandLockup'
import { SourceStatus } from './SourceStatus'

interface Props {
  registry: Registry
  session: RegistrySession
  persistentAccessSupported: boolean
  onConnect: () => void
  onImportSnapshot: () => void
  onRefresh: () => void
  onReauthorize: () => void
  onExport: () => void
  onShare: () => void
  onReset: () => void
  onHome: () => void
}

export function Header({
  registry,
  session,
  persistentAccessSupported,
  onConnect,
  onImportSnapshot,
  onRefresh,
  onReauthorize,
  onExport,
  onShare,
  onReset,
  onHome,
}: Props) {
  return (
    <header className="workspace-header">
      <button type="button" className="wordmark" onClick={onHome} aria-label="Return to SancusSight entry">
        <BrandLockup />
      </button>

      <SourceStatus session={session} registry={registry} onRefresh={onRefresh} onReauthorize={onReauthorize} />

      <div className="header-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={session.mode === 'demo' ? onConnect : onExport}
        >
          {session.mode === 'demo'
            ? (persistentAccessSupported ? 'Connect file' : 'Import snapshot')
            : 'Export registry'}
        </button>
        <details className="utility-menu">
          <summary className="btn">Utilities</summary>
          <div className="utility-menu-panel">
            <button type="button" onClick={onShare}>Share card</button>
            {session.mode === 'demo' && <button type="button" onClick={onExport}>Export demo JSON</button>}
            <button type="button" onClick={onImportSnapshot}>Import snapshot</button>
            {session.mode === 'local' && persistentAccessSupported && <button type="button" onClick={onConnect}>Replace source</button>}
            <button type="button" onClick={onHome}>Return to entry</button>
            <button type="button" className="danger-command" onClick={onReset}>{session.mode === 'demo' ? 'Reset demo' : 'Disconnect and clear cache'}</button>
          </div>
        </details>
      </div>
    </header>
  )
}
