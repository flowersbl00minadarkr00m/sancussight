import type { GovernanceLedgerTab } from './types'

const TABS: readonly { id: GovernanceLedgerTab; label: string }[] = [
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'activity', label: 'ACTIVITY' },
  { id: 'controls', label: 'CONTROLS' },
  { id: 'decisions', label: 'DECISIONS' },
  { id: 'outcomes', label: 'OUTCOMES' },
]

export function GovernanceTabs({ active, onChange }: { active: GovernanceLedgerTab; onChange: (tab: GovernanceLedgerTab) => void }) {
  return (
    <div className="governance-tabs" role="tablist" aria-label="Governance ledgers">
      {TABS.map(tab => (
        <button type="button" role="tab" key={tab.id} aria-selected={active === tab.id} className={active === tab.id ? 'governance-tab governance-tab-active' : 'governance-tab'} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
