import { useMemo, useState } from 'react'
import type { ExitTestResult, Registry, Signal } from '../types'
import { getWorkflows, runExitTest, runOntologyExitTest } from '../lib/registry'
import {
  browserSha256,
  buildExitDrillEvidencePacket,
} from '../lib/evidence-packet'
import { Card, Eyebrow } from './Shared'
import { EvidencePacketExport } from './EvidencePacketExport'

const GLYPH_MAP: Record<ExitTestResult['items'][number]['status'], string> = {
  ok: 'OK', unverified: '?', missing: 'X', locked: 'L',
}

const VERDICT_NOTES: Record<string, string> = {
  survives: 'Every dependency is portable and verified on the target.',
  degrades: 'The workflow would run, but on unverified or stale ground.',
  breaks: 'At least one dependency does not survive the move.',
}

export function ExitTest({ registry, today, signals = [], onSelectAsset }: { registry: Registry; today: string; signals?: Signal[]; onSelectAsset: (assetId: string) => void }) {
  const workflows = getWorkflows(registry)
  const canonicalAssetIds = useMemo(() => new Set(registry.assets.map(asset => asset.id)), [registry.assets])
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflows[0]?.id ?? '')
  const workflow = workflows.find(item => item.id === selectedWorkflow) ?? workflows[0]
  const targets = registry.platforms.filter(platform => platform !== workflow?.primaryProvider)
  const [target, setTarget] = useState(targets[0] ?? registry.platforms[0] ?? '')
  const result = useMemo(
    () => workflow && target ? runExitTest(registry, workflow.id, target, today, signals) : undefined,
    [registry, workflow, target, today, signals],
  )
  const ontologyResult = useMemo(() => runOntologyExitTest(registry), [registry])

  return (
    <div className="space-y-4">
      <Card>
        <Eyebrow>Exit test - what breaks if this workflow moves tomorrow?</Eyebrow>
        <div className="exit-controls">
          <label>Workflow<select value={workflow?.id ?? ''} onChange={event => setSelectedWorkflow(event.target.value)}>{workflows.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Target platform<select value={target} onChange={event => setTarget(event.target.value)}>{targets.map(platform => <option key={platform} value={platform}>{platform}</option>)}</select></label>
        </div>

        {result && (
          <>
            <Verdict verdict={result.verdict} note={`${result.workflowName} moves to ${result.targetPlatform}. ${VERDICT_NOTES[result.verdict]}`} />
            <ul className="exit-item-list">
              {result.items.map(item => (
                <ExitItem
                  key={`${item.assetId}-${item.note}`}
                  label={item.assetName}
                  status={item.status}
                  note={item.note}
                  assetId={canonicalAssetIds.has(item.assetId) ? item.assetId : undefined}
                  onSelectAsset={onSelectAsset}
                />
              ))}
              {result.items.length === 0 && <li className="empty-state">This workflow declares no dependencies. Review the registry before treating it as portable.</li>}
            </ul>
            <p className="method-note">Checks registered formats, coverage, verification, fallbacks, and owners. It does not guarantee equivalent model behavior.</p>
            <div className="exit-packet-export">
              <EvidencePacketExport
                note="Exports only this current deterministic result. It does not persist or execute an Exit Drill and makes no provider request."
                buildPacket={() => {
                  const exportedAt = new Date().toISOString()
                  return buildExitDrillEvidencePacket({
                    result,
                    exportedAt,
                    observedAt: exportedAt,
                  }, browserSha256)
                }}
              />
            </div>
          </>
        )}
      </Card>

      <Card>
        <Eyebrow>Ontology exit test - schema, identity, evidence, action, consumer</Eyebrow>
        <Verdict verdict={ontologyResult.verdict} note={`${ontologyResult.scenarioName}. ${VERDICT_NOTES[ontologyResult.verdict]}`} />
        <ul className="exit-item-list">
          {ontologyResult.items.map(item => (
            <ExitItem
              key={item.id}
              label={item.label}
              status={item.status}
              note={item.note}
              riskType={item.status === 'ok' ? undefined : `${item.riskType} risk`}
            />
          ))}
        </ul>
        <p className="method-note">This reports registry evidence gaps, not a security assessment or permission to execute candidate tools.</p>
      </Card>
    </div>
  )
}

function ExitItem({ label, status, note, riskType, assetId, onSelectAsset }: { label: string; status: ExitTestResult['items'][number]['status']; note: string; riskType?: string; assetId?: string; onSelectAsset?: (assetId: string) => void }) {
  return (
    <li>
      <span className={`exit-glyph exit-glyph-${status}`}>{GLYPH_MAP[status]}</span>
      {assetId && onSelectAsset
        ? <button type="button" className="text-command exit-asset-command" onClick={() => onSelectAsset(assetId)}>{label}</button>
        : <strong>{label}</strong>}
      <span>{riskType && <small>{riskType}</small>}{note}</span>
    </li>
  )
}

function Verdict({ verdict, note }: { verdict: 'survives' | 'degrades' | 'breaks'; note: string }) {
  return (
    <div className={`verdict verdict-${verdict}`}>
      <strong>{verdict}</strong>
      <span>{note}</span>
    </div>
  )
}
