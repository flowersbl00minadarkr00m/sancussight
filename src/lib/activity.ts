import type { ActivityEntry, ConnectionActivity } from '../types'

// Parse JSONL string into ActivityEntry array
export function parseActivityLog(raw: string): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  for (const line of raw.trim().split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const obj = JSON.parse(trimmed)
      if (obj.ts && obj.agent && obj.action) {
        entries.push({
          ts: obj.ts,
          agent: obj.agent,
          action: obj.action,
          asset: obj.asset ?? '',
          summary: obj.summary ?? '',
          session: obj.session ?? '',
          evidence: obj.evidence,
        })
      }
    } catch {
      // skip malformed lines
    }
  }
  return entries.sort((a, b) => b.ts.localeCompare(a.ts))
}

export function connectionActivityToEntry(activity: ConnectionActivity): ActivityEntry {
  return {
    ts: activity.occurredAt,
    agent: 'sancussight',
    action: `source-${activity.operation}`,
    asset: activity.sourceName ?? 'local-registry',
    summary: `${activity.outcome}${activity.detail ? `: ${activity.detail}` : ''}`,
    session: activity.id,
  }
}

export function mergeActivityEntries(...groups: ActivityEntry[][]): ActivityEntry[] {
  const entries = new Map<string, ActivityEntry>()
  for (const group of groups) {
    for (const entry of group) {
      const key = entry.session || `${entry.ts}:${entry.agent}:${entry.action}:${entry.asset}`
      if (!entries.has(key)) entries.set(key, entry)
    }
  }
  return [...entries.values()].sort((left, right) => right.ts.localeCompare(left.ts))
}

// Default embedded activity log (this session + project context)
export const EMBEDDED_ACTIVITY_LOG = `\
{"ts":"2026-07-01T23:00:00Z","agent":"pi","action":"diagnostic","asset":"sancussight","summary":"Design diagnostic of SancusSight v1 — identified 5 weaknesses: no shared/non-shared distinction, dimension-concept mismatch, no activity log, no gotchas, not self-registered","session":"pi-2026-07-01-sancussight"}
{"ts":"2026-07-01T22:45:00Z","agent":"pi","action":"verify","asset":"findmnemo","summary":"Verified FindMnemo v3 build passes TypeScript + Vite, added demo data, wrote shared-brain memories, superseded v0 memories","session":"pi-2026-07-01-sancussight"}
{"ts":"2026-07-01T22:30:00Z","agent":"pi","action":"review","asset":"findmnemo","summary":"Reviewed FindMnemo v3 Hephaestus-style dashboard — confirmed file structure, storage architecture, component hierarchy","session":"pi-2026-07-01-sancussight"}
{"ts":"2026-07-01T22:00:00Z","agent":"pi","action":"review","asset":"findmnemo","summary":"Retrieved FindMnemo v0 from OneDrive (JSX kanban), discovered v3 at C:/Users/henry/mnemosync/ (TypeScript, Hephaestus-style)","session":"pi-2026-07-01-sancussight"}
{"ts":"2026-06-30T17:00:00Z","agent":"claude","action":"build","asset":"sancussight","summary":"Built SancusSight v1 — local-first portability registry with 5 dimensions, coverage matrix, exit tests, and share card","session":"claude-fable-5-sancussight"}
{"ts":"2026-06-30T17:00:00Z","agent":"claude","action":"build","asset":"findmnemo","summary":"Built FindMnemo v3 Hephaestus-style dashboard with collapsible sidebar, agent activity tracking, auto-ticket creation, and Gmail integration","session":"claude-fable-5-findmnemo-v3"}
`
