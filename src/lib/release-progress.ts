import type { ReleaseProgressSnapshotV1 } from '../types.ts'
import { RELEASE_EVIDENCE_SOURCE_IDS } from '../types.ts'

export const RELEASE_PROGRESS_STALE_WINDOW_MS = 90 * 1000

const STATES = ['queued', 'running', 'waiting', 'completed', 'failed', 'cancelled'] as const
const STAGES = ['preflight', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap', 'failure-recovery', 'bundling', 'finalizing'] as const
const MESSAGE_CODES = ['starting', 'processing', 'waiting-for-producer', 'checkpointing', 'rendering', 'complete', 'failed', 'cancelled'] as const
const KEYS = new Set([
  'schemaVersion', 'contractVersion', 'releaseRunId', 'producerId', 'targetId',
  'state', 'stage', 'startedAt', 'updatedAt', 'messageCode', 'completedUnits', 'totalUnits',
])

export interface ReleaseProgressValidation {
  valid: boolean
  errors: string[]
  snapshot?: ReleaseProgressSnapshotV1
}

export interface ReleaseProgressRead {
  snapshot?: ReleaseProgressSnapshotV1
  stale: boolean
  errors: string[]
}

export function validateReleaseProgressSnapshot(value: unknown): ReleaseProgressValidation {
  const errors: string[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, errors: ['progress:not-an-object'] }
  const raw = value as Record<string, unknown>
  for (const key of Object.keys(raw)) if (!KEYS.has(key)) errors.push(`progress:unknown-field:${key}`)
  if (raw.schemaVersion !== 1) errors.push('progress:unsupported-schema')
  if (raw.contractVersion !== 'release-progress-v1') errors.push('progress:contract-version')
  if (!safeToken(raw.releaseRunId, 160)) errors.push('progress:release-run-id')
  if (typeof raw.producerId !== 'string' || !(RELEASE_EVIDENCE_SOURCE_IDS as readonly string[]).includes(raw.producerId)) errors.push('progress:producer')
  if (!safeToken(raw.targetId, 160)) errors.push('progress:target')
  if (!STATES.includes(raw.state as typeof STATES[number])) errors.push('progress:state')
  if (!STAGES.includes(raw.stage as typeof STAGES[number])) errors.push('progress:stage')
  if (!MESSAGE_CODES.includes(raw.messageCode as typeof MESSAGE_CODES[number])) errors.push('progress:message-code')
  if (!isoDate(raw.startedAt)) errors.push('progress:started-at')
  if (!isoDate(raw.updatedAt)) errors.push('progress:updated-at')
  if (isoDate(raw.startedAt) && isoDate(raw.updatedAt) && Date.parse(raw.updatedAt as string) < Date.parse(raw.startedAt as string)) {
    errors.push('progress:updated-before-start')
  }
  const hasCompleted = raw.completedUnits !== undefined
  const hasTotal = raw.totalUnits !== undefined
  if (hasCompleted !== hasTotal) errors.push('progress:counts-incomplete')
  if (hasCompleted && (!integer(raw.completedUnits) || (raw.completedUnits as number) < 0)) errors.push('progress:completed-units')
  if (hasTotal && (!integer(raw.totalUnits) || (raw.totalUnits as number) <= 0)) errors.push('progress:total-units')
  if (hasCompleted && hasTotal && integer(raw.completedUnits) && integer(raw.totalUnits) && (raw.completedUnits as number) > (raw.totalUnits as number)) {
    errors.push('progress:completed-exceeds-total')
  }
  return errors.length
    ? { valid: false, errors }
    : { valid: true, errors: [], snapshot: raw as unknown as ReleaseProgressSnapshotV1 }
}

export function progressPercent(snapshot: ReleaseProgressSnapshotV1): number | undefined {
  if (snapshot.completedUnits === undefined || snapshot.totalUnits === undefined || snapshot.totalUnits <= 0) return undefined
  return Math.max(0, Math.min(100, Math.round((snapshot.completedUnits / snapshot.totalUnits) * 100)))
}

export function isProgressStale(snapshot: ReleaseProgressSnapshotV1, now: string): boolean {
  if (!isoDate(now)) return true
  return Date.parse(now) - Date.parse(snapshot.updatedAt) > RELEASE_PROGRESS_STALE_WINDOW_MS
}

function safeToken(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && /^[A-Za-z0-9._:/-]+$/.test(value)
}

function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value)
}

function isoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}
