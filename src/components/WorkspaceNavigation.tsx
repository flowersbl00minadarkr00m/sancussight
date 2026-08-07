import { useRef, useState } from 'react'
import type { ViewId } from '../types'
import { ADVANCED_NAV_ITEMS, PRIMARY_NAV_ITEMS } from '../types'

interface Props {
  view: ViewId
  queueCount: number
  evidenceSourcesActive: boolean
  onSelect: (view: ViewId) => void
  onOpenEvidenceSources: () => void
}

export function WorkspaceNavigation({ view, queueCount, evidenceSourcesActive, onSelect, onOpenEvidenceSources }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const advancedTrigger = useRef<HTMLButtonElement>(null)
  const advancedActive = evidenceSourcesActive || ADVANCED_NAV_ITEMS.some(item => item.id === view)

  function closeAdvanced(restoreFocus = false) {
    setAdvancedOpen(false)
    if (restoreFocus) advancedTrigger.current?.focus()
  }

  return (
    <nav className="workspace-nav" aria-label="Workspace">
      <div className="primary-nav" aria-label="Primary workspace views">
        {PRIMARY_NAV_ITEMS.map(item => (
          <button
            type="button"
            key={item.id}
            className={view === item.id ? `nav-command nav-command-${item.id} nav-command-active` : `nav-command nav-command-${item.id}`}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
            {item.id === 'queue' && queueCount > 0 ? <span className="nav-count"> {queueCount}</span> : null}
          </button>
        ))}
      </div>

      <div
        className="advanced-nav"
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeAdvanced()
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault()
            closeAdvanced(true)
          }
        }}
      >
        <button
          ref={advancedTrigger}
          type="button"
          className={advancedActive ? 'nav-command nav-command-active' : 'nav-command'}
          aria-expanded={advancedOpen}
          aria-controls="advanced-nav-menu"
          onClick={() => setAdvancedOpen(open => !open)}
        >
          Advanced
        </button>
        {advancedOpen && (
          <div id="advanced-nav-menu" className="advanced-nav-menu">
            {ADVANCED_NAV_ITEMS.map(item => (
              item.id === 'evidence-sources' ? (
                <button
                  type="button"
                  key={item.id}
                  aria-current={evidenceSourcesActive ? 'page' : undefined}
                  onClick={() => {
                    onOpenEvidenceSources()
                    closeAdvanced()
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <button
                  type="button"
                  key={item.id}
                  aria-current={view === item.id ? 'page' : undefined}
                  onClick={() => {
                    onSelect(item.id)
                    closeAdvanced()
                  }}
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
