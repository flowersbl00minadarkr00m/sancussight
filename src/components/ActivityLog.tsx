import { useEffect, useState } from 'react'
import type { ActivityEntry, EvidenceEnvelopeV1 } from '../types'
import { connectionActivityToEntry, mergeActivityEntries, parseActivityLog, EMBEDDED_ACTIVITY_LOG } from '../lib/activity'
import { IndexedDbConnectionStore } from '../lib/connection-store'
import { Eyebrow, Card } from './Shared'
import { evidenceActivity } from '../lib/evidence'

const ACTION_TONES: Record<string, string> = {
  diagnostic: 'navy', verify: 'moss', review: 'amber', drill: 'accept',
  gotcha: 'rust', build: 'navy', fix: 'moss',
}

const AGENT_LABELS: Record<string, string> = {
  pi: 'Pi',
  codex: 'Codex',
  claude: 'Claude',
  human: 'Human',
}

export function ActivityLog({ evidence = [] }: { evidence?: EvidenceEnvelopeV1[] }) {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => mergeActivityEntries(evidenceActivity(evidence), parseActivityLog(EMBEDDED_ACTIVITY_LOG)))

  useEffect(() => {
    let active = true
    new IndexedDbConnectionStore().listActivity()
      .then(connectionEntries => {
        if (!active) return
        setEntries(current => mergeActivityEntries(connectionEntries.map(connectionActivityToEntry), current))
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    setEntries(current => mergeActivityEntries(evidenceActivity(evidence), current))
  }, [evidence])
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterAction, setFilterAction] = useState('all')

  const agents = [...new Set(entries.map(e => e.agent))]
  const actions = [...new Set(entries.map(e => e.action))]

  const filtered = entries.filter(e => {
    if (filterAgent !== 'all' && e.agent !== filterAgent) return false
    if (filterAction !== 'all' && e.action !== filterAction) return false
    return true
  })

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jsonl,.json,.txt'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      file.text().then(raw => {
        const parsed = parseActivityLog(raw)
        if (parsed.length > 0) {
          // Merge: newer entries from import replace embedded ones
          const existing = new Map(entries.map(e => [`${e.ts}-${e.session}-${e.action}`, e]))
          for (const p of parsed) {
            existing.set(`${p.ts}-${p.session}-${p.action}`, p)
          }
          setEntries([...existing.values()].sort((a, b) => b.ts.localeCompare(a.ts)))
        }
      })
    }
    input.click()
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <Eyebrow>Activity log — agent actions across the portability stack</Eyebrow>
        <div className="flex gap-2">
          <select
            className="font-mono rounded-sm border border-(--color-line-strong) bg-(--color-card-strong) px-2 py-1 text-[0.72rem]"
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
          >
            <option value="all">All agents</option>
            {agents.map(a => (
              <option key={a} value={a}>{AGENT_LABELS[a] ?? a}</option>
            ))}
          </select>
          <select
            className="font-mono rounded-sm border border-(--color-line-strong) bg-(--color-card-strong) px-2 py-1 text-[0.72rem]"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          >
            <option value="all">All actions</option>
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button type="button" className="btn" onClick={handleImport}>
            IMPORT JSONL
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-(--color-muted) py-8 text-center">
          No activity entries match the current filters. Import a JSONL log file to populate.
        </p>
      ) : (
        <div className="space-y-0.5 max-h-[70vh] overflow-y-auto">
          {filtered.map(entry => (
            <div
              key={`${entry.ts}-${entry.session}-${entry.action}-${entry.asset}`}
              className="flex items-start gap-3 py-2 px-2 rounded-sm hover:bg-(--color-card-strong) border-b border-(--color-line)"
            >
              <span className={`activity-action activity-action-${ACTION_TONES[entry.action] ?? 'slate'}`}>
                {entry.action.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-(--color-ink)">
                    {entry.asset ? `${entry.asset}` : entry.summary}
                  </span>
                  {entry.asset && (
                    <span className="text-[0.75rem] text-(--color-muted) truncate">{entry.summary}</span>
                  )}
                </div>
                <div className="font-mono text-[0.72rem] text-(--color-muted) mt-0.5">
                  {AGENT_LABELS[entry.agent] ?? entry.agent} · {fmtDate(entry.ts)} · session: {entry.session.slice(0, 8)}…
                  {entry.evidence && <span> · evidence: {entry.evidence}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 border-t border-(--color-line) pt-2 flex items-center justify-between gap-3 text-[0.72rem] text-(--color-muted)">
        <span>{filtered.length} entries · embedded log + any imported files</span>
        <span className="font-mono">
          Format: JSONL · canonical: vault/system/activity-log.jsonl
        </span>
      </div>
    </Card>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}
