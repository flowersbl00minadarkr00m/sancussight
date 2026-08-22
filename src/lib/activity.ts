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

// Default embedded activity log for the fictional demo registry.
export const EMBEDDED_ACTIVITY_LOG = `\
{"ts":"2026-07-01T23:00:00Z","agent":"reviewer","action":"diagnostic","asset":"demo-registry","summary":"Reviewed continuity coverage and recorded missing fallbacks for the quarterly exercise","session":"demo-review-003"}
{"ts":"2026-07-01T22:45:00Z","agent":"verifier","action":"verify","asset":"invoice-workflow","summary":"Verified the portable workflow fixture against two approved environments","session":"demo-verify-002"}
{"ts":"2026-07-01T22:30:00Z","agent":"operator","action":"review","asset":"context-pack","summary":"Reviewed the synthetic context pack and refreshed its evidence date","session":"demo-review-001"}
`
