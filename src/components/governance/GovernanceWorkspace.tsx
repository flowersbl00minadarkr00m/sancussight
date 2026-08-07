import { useMemo, useRef, useState } from 'react'
import type { GovernanceBinding, HumanDecisionPayload } from '../../domain/governance/model'
import type { GovernanceReadModel } from '../../domain/governance/project'
import { ActivityLedger } from './ActivityLedger'
import { ControlLedger } from './ControlLedger'
import { DecisionLedger } from './DecisionLedger'
import { GovernanceDetail } from './GovernanceDetail'
import { GovernanceTabs } from './GovernanceTabs'
import { InventoryLedger } from './InventoryLedger'
import { LineageInspector } from './LineageInspector'
import { OutcomeLedger } from './OutcomeLedger'
import type { GovernanceLedgerTab, GovernanceRow } from './types'
import type { GovernanceLoadState } from '../../lib/use-governance'

interface Props {
  model: GovernanceReadModel
  status: GovernanceLoadState
  message: string
  bounded: boolean
  onRecordDecision?: (input: HumanDecisionPayload) => Promise<void>
  onConfirmBinding?: (input: Omit<GovernanceBinding, 'id'>) => Promise<void>
  onImportBundle?: (raw: string) => Promise<void>
  onExportBundle?: () => string | Promise<string>
  onClearBundle?: () => Promise<void>
}

export function GovernanceWorkspace({ model, status, message, bounded, onRecordDecision, onConfirmBinding, onImportBundle, onExportBundle, onClearBundle }: Props) {
  const [tab, setTab] = useState<GovernanceLedgerTab>('inventory')
  const [selected, setSelected] = useState<GovernanceRow>()
  const [lineageId, setLineageId] = useState<string>()
  const [importMessage, setImportMessage] = useState('')
  const originRef = useRef<HTMLElement | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const selectedLineage = useMemo(() => lineageId ? model.lineage.find(item => item.id === lineageId || item.actionId === lineageId || item.caseId === lineageId) : undefined, [lineageId, model.lineage])
  const priority = useMemo(() => priorityRow(model), [model])
  const openLineage = (id: string) => { setLineageId(id); setSelected(undefined) }
  const selectRow = (row: GovernanceRow) => { originRef.current = document.activeElement as HTMLElement | null; setSelected(row) }
  const closeDetail = () => { setSelected(undefined); window.requestAnimationFrame(() => originRef.current?.focus()) }
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onImportBundle) return
    try { await onImportBundle(await file.text()); setImportMessage(`Imported ${file.name} as a manual governance snapshot.`) } catch (error) { setImportMessage(error instanceof Error ? error.message : 'Governance snapshot import failed.') }
  }
  const exportFile = async () => {
    if (!onExportBundle) return
    const blob = new Blob([await onExportBundle()], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `sancussight-governance-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const bindingTarget = selected && 'asset' in selected ? model.inventory.find(row => row.asset.id !== selected.asset.id)?.asset : undefined
  return <div className="governance-workspace">
    <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={event => void importFile(event)} />
    <section className="governance-hero"><div><span className="eyebrow">LOCAL AGENT GOVERNANCE</span><h1>Five ledgers, one accountable chain.</h1><p>Inspect inventory, activity, controls, decisions, outcomes, and evidence-backed lineage without turning SancusSight into an upstream operator.</p><div className="governance-export-actions"><button type="button" className="btn btn-secondary" onClick={() => importRef.current?.click()}>IMPORT SNAPSHOT</button><button type="button" className="btn btn-secondary" onClick={() => void exportFile()}>EXPORT SNAPSHOT</button>{onClearBundle && <button type="button" className="text-command" onClick={() => void onClearBundle()}>CLEAR MANUAL</button>}</div>{importMessage && <p className="governance-form-message" role="status">{importMessage}</p>}</div><div className={`governance-mode governance-mode-${status}`}><strong>{status === 'live' ? 'LOCAL COLLECTOR' : status === 'manual' ? 'HOSTED / MANUAL' : status.toUpperCase()}</strong><span>{message}</span></div></section>
    <div className="governance-source-strip"><span><strong>{model.eventCount}</strong> bounded events</span><span><strong>{model.gaps.length}</strong> visible gaps</span><span><strong>{model.lineage.length}</strong> lineages</span>{bounded && <span>cursor-bounded view</span>}</div>
    <div className="governance-tier-strip" aria-label="Recommendation tiers"><span>OBSERVE · record only</span><span>ADVISE · explain and request evidence</span><span>CONFIRM · expiring upstream approval</span><span>BLOCK · recommend upstream denial</span></div>
    {model.sourceStates.length ? <div className="governance-health-strip" aria-label="Governance source health">{model.sourceStates.map(source => <span key={source.sourceId}><strong>{source.sourceId}</strong> · {source.health} · {source.eventCount} events{source.gaps.length ? ` · ${source.gaps.join(', ')}` : ''}</span>)}</div> : null}
    {selectedLineage ? <LineageInspector lineage={selectedLineage} onBack={() => setLineageId(undefined)} /> : <>
      <GovernanceTabs active={tab} onChange={next => { setTab(next); setSelected(undefined) }} />
      <div className="governance-main-grid">
        <div className="governance-ledger-column">
          {!selected && priority ? <button type="button" className="governance-priority" onClick={() => { originRef.current = document.activeElement as HTMLElement | null; setSelected(priority) }}><span className="eyebrow">PRIORITY REVIEW</span><strong>{priority.title}</strong><span>{priority.status} · {priority.gapCodes.join(', ') || 'routine observation'} · open for provenance</span></button> : null}
          {tab === 'inventory' && <InventoryLedger rows={model.inventory} onSelect={selectRow} />}
          {tab === 'activity' && <ActivityLedger rows={model.activity} onSelect={selectRow} />}
          {tab === 'controls' && <ControlLedger rows={model.controls} onSelect={selectRow} />}
          {tab === 'decisions' && <DecisionLedger rows={model.decisions} onSelect={selectRow} />}
          {tab === 'outcomes' && <OutcomeLedger rows={model.outcomes} onSelect={selectRow} />}
        </div>
        {selected ? <GovernanceDetail row={selected} onClose={closeDetail} onOpenLineage={openLineage} onRecordDecision={status === 'live' || (status === 'manual' && model.eventCount > 0) ? onRecordDecision : undefined} onConfirmBinding={status === 'live' || (status === 'manual' && model.eventCount > 0) ? onConfirmBinding : undefined} bindingTarget={bindingTarget} /> : <section className="governance-inspector-placeholder"><span className="eyebrow">INSPECTOR</span><h2>Select a row</h2><p>Keyboard users can tab through native ledger buttons, inspect provenance, and return to this list. No action here executes, installs, scans, blocks, or mutates an upstream tool.</p></section>}
      </div>
    </>}
  </div>
}

function priorityRow(model: GovernanceReadModel): GovernanceRow | undefined {
  const gap = model.controls.find(row => !row.enforcementProven || row.gapCodes.length) ?? model.inventory.find(row => row.gapCodes.includes('material-change'))
  if (gap) return gap
  const inactive = model.decisions.find(row => !row.active)
  if (inactive) return inactive
  return model.activity[0] ?? model.outcomes[0] ?? model.inventory[0]
}
