import type { EvidenceSourceHealth, EvidenceSourceState, EvidenceVerification } from '../../types.ts'
import type {
  CanonicalRef,
  GovernanceBinding,
  GovernanceEventV1,
  GovernanceProvenance,
} from './model.ts'
import { buildLineage, type LineageGap, type LineageSummary } from './lineage.ts'

export type GovernanceRowStatus = 'current' | 'stale' | 'failed' | 'removed' | 'expired' | 'revoked' | 'conflicting' | 'unresolved' | 'observed' | 'inferred' | 'verified' | 'unverified'

export interface GovernanceLedgerRow {
  id: string
  title: string
  kind: string
  eventType: GovernanceEventV1['type']
  observedAt: string
  sourceIds: string[]
  eventIds: string[]
  status: GovernanceRowStatus
  truth: GovernanceEventV1['truth']
  qualification: GovernanceProvenance['qualification']
  verification: EvidenceVerification
  provenance: GovernanceProvenance[]
  gapCodes: string[]
}

export interface InventoryLedgerRow extends GovernanceLedgerRow {
  asset: CanonicalRef
  version?: string
  owner?: string
  purpose?: string
  permissionsSummary?: string
  historyEventIds: string[]
}

export interface ActivityLedgerRow extends GovernanceLedgerRow {
  summary: string
  actionId?: string
  caseId?: string
  effectType?: string
  destination?: string
  sensitivity?: string
  reversibility?: string
  privilege?: string
  permissionBreadth?: string
  policyPresent?: boolean
  fresh?: boolean
  inferred?: boolean
}

export interface ControlLedgerRow extends GovernanceLedgerRow {
  actionId: string
  decision: string
  policyId: string
  policyVersion: string
  reason: string
  enforcementProven: boolean
}

export interface DecisionLedgerRow extends GovernanceLedgerRow {
  actionId: string
  decision: string
  policyId: string
  policyVersion: string
  scopeHash?: string
  decidedBy?: string
  effectiveAt?: string
  expiresAt?: string
  active: boolean
  supersedesDecisionId?: string
}

export interface OutcomeLedgerRow extends GovernanceLedgerRow {
  result: string
  summary: string
  actionId?: string
  effectId?: string
  verified: boolean
}

export interface GovernanceSourceProjection {
  sourceId: string
  health: EvidenceSourceHealth | 'unknown'
  eventCount: number
  lastObservedAt?: string
  gaps: string[]
}

export interface GovernanceReadModel {
  generatedAt: string
  inventory: InventoryLedgerRow[]
  activity: ActivityLedgerRow[]
  controls: ControlLedgerRow[]
  decisions: DecisionLedgerRow[]
  outcomes: OutcomeLedgerRow[]
  lineage: LineageSummary[]
  sourceStates: GovernanceSourceProjection[]
  gaps: GovernanceGap[]
  eventCount: number
}

export interface GovernanceGap {
  code: string
  message: string
  eventIds: string[]
  sourceIds: string[]
  severity: 'high' | 'medium' | 'low'
}

export interface GovernanceReadModelInput {
  events: readonly GovernanceEventV1[]
  bindings?: readonly GovernanceBinding[]
  sourceStates?: readonly EvidenceSourceState[]
  now: string
}

export function buildGovernanceReadModel(input: GovernanceReadModelInput): GovernanceReadModel {
  const events = dedupeEvents(input.events)
  const sourceStates = projectSources(events, input.sourceStates ?? [])
  const inventory = projectInventory(events, sourceStates, input.now)
  const activity = projectActivity(events, sourceStates)
  const controls = projectControls(events, sourceStates)
  const decisions = projectDecisions(events, sourceStates, input.now)
  const outcomes = projectOutcomes(events, sourceStates)
  const lineage = buildLineage(events, input.bindings ?? [], input.sourceStates ?? [], input.now)
    .filter(item => item.nodes.some(node => ['intent', 'action', 'decision', 'approval', 'effect', 'outcome', 'proof'].includes(node.role)))
  const gaps = [
    ...inventory.flatMap(row => row.gapCodes.map(code => rowGap(code, `Inventory claim for ${row.title} requires reassessment.`, row.eventIds, row.sourceIds, code === 'conflict' ? 'high' : 'medium'))),
    ...lineage.flatMap(item => item.gaps.map(gap => lineageGap(gap, item))),
    ...sourceStates.flatMap(source => source.gaps.map(code => rowGap(code, `Source ${source.sourceId} is degraded; retained history remains available.`, [], [source.sourceId], 'medium'))),
  ]
  return {
    generatedAt: input.now,
    inventory,
    activity,
    controls,
    decisions,
    outcomes,
    lineage,
    sourceStates,
    gaps: dedupeGaps(gaps),
    eventCount: events.length,
  }
}

function projectInventory(events: readonly GovernanceEventV1[], sources: readonly GovernanceSourceProjection[], now: string): InventoryLedgerRow[] {
  const grouped = new Map<string, GovernanceEventV1[]>()
  for (const event of events.filter(item => item.type === 'inventory.observed' || item.type === 'inventory.removed')) {
    const asset = inventoryAsset(event)
    if (!asset) continue
    const group = grouped.get(asset.id) ?? []
    group.push(event)
    grouped.set(asset.id, group)
  }
  return [...grouped.values()].map(history => {
    const ordered = [...history].sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
    const latest = ordered[0]
    const asset = inventoryAsset(latest)!
    const payload = latest.payload as unknown as Record<string, unknown>
    const removed = latest.type === 'inventory.removed'
    const states = history.map(event => (event.payload as unknown as Record<string, unknown>).state).filter(Boolean)
    const conflict = hasConflictingInventory(history)
    const source = sourceFor(latest, sources)
    const status: GovernanceRowStatus = removed ? 'removed' : conflict ? 'conflicting' : source?.health === 'failed' ? 'failed' : source?.health === 'stale' ? 'stale' : states.includes('inferred') ? 'inferred' : states.includes('unverified') ? 'unverified' : 'current'
    const gapCodes = [
      ...(conflict ? ['conflict'] : []),
      ...(source?.gaps ?? []),
      ...(hasMaterialChange(history) ? ['material-change'] : []),
      ...(removed ? [] : states.includes('stale') ? ['stale'] : []),
    ]
    return {
      ...baseRow(latest, asset.label ?? asset.id, 'inventory', status, source),
      asset,
      ...(typeof payload.version === 'string' ? { version: payload.version } : {}),
      ...(typeof payload.owner === 'string' ? { owner: payload.owner } : {}),
      ...(typeof payload.purpose === 'string' ? { purpose: payload.purpose } : {}),
      ...(typeof payload.permissionsSummary === 'string' ? { permissionsSummary: payload.permissionsSummary } : {}),
      historyEventIds: history.map(event => event.id),
      gapCodes: [...new Set(gapCodes)],
    }
  }).sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt) || left.title.localeCompare(right.title))
}

function projectActivity(events: readonly GovernanceEventV1[], sources: readonly GovernanceSourceProjection[]): ActivityLedgerRow[] {
  return events.filter(event => !['inventory.observed', 'inventory.removed', 'human.decided'].includes(event.type)).map(event => {
    const payload = event.payload as unknown as Record<string, unknown>
    const source = sourceFor(event, sources)
    return {
      ...baseRow(event, event.subject.label ?? event.subject.id, event.subject.kind, rowStatus(event, source), source),
      summary: textField(payload.summary) ?? textField(payload.reason) ?? event.type,
      actionId: event.context.actionId ?? textField(payload.actionId),
      caseId: event.context.caseId,
      ...(textField(payload.effectType) ? { effectType: textField(payload.effectType) } : {}),
      ...(textField(payload.destination) ? { destination: textField(payload.destination) } : {}),
      ...(textField(payload.sensitivity) ? { sensitivity: textField(payload.sensitivity) } : {}),
      ...(textField(payload.reversibility) ? { reversibility: textField(payload.reversibility) } : {}),
      ...(textField(payload.privilege) ? { privilege: textField(payload.privilege) } : {}),
      ...(textField(payload.permissionBreadth) ? { permissionBreadth: textField(payload.permissionBreadth) } : {}),
      ...(typeof payload.policyPresent === 'boolean' ? { policyPresent: payload.policyPresent } : {}),
      ...(typeof payload.fresh === 'boolean' ? { fresh: payload.fresh } : {}),
      inferred: event.truth.assertion === 'inferred',
    }
  }).sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
}

function projectControls(events: readonly GovernanceEventV1[], sources: readonly GovernanceSourceProjection[]): ControlLedgerRow[] {
  return events.filter(event => event.type === 'control.decided').map(event => {
    const payload = event.payload as unknown as Record<string, unknown>
    const source = sourceFor(event, sources)
    const enforcementProven = event.truth.assertion === 'enforced' && event.provenance.qualification === 'operational' && event.provenance.verification === 'verified'
    return {
      ...baseRow(event, textField(payload.policyId) ?? event.subject.id, 'control', enforcementProven ? 'verified' : rowStatus(event, source), source),
      actionId: textField(payload.actionId) ?? event.context.actionId ?? event.subject.id,
      decision: textField(payload.decision) ?? 'unknown',
      policyId: textField(payload.policyId) ?? 'unknown',
      policyVersion: textField(payload.policyVersion) ?? 'unknown',
      reason: textField(payload.reason) ?? 'No bounded reason recorded.',
      enforcementProven,
    }
  }).sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
}

function projectDecisions(events: readonly GovernanceEventV1[], sources: readonly GovernanceSourceProjection[], now: string): DecisionLedgerRow[] {
  const decisionEvents = events.filter(event => event.type === 'human.decided' || event.type === 'control.decided')
  const supersededIds = new Set(decisionEvents.map(event => textField((event.payload as unknown as Record<string, unknown>).supersedesDecisionId)).filter(Boolean))
  const rows = decisionEvents.map(event => {
    const payload = event.payload as unknown as Record<string, unknown>
    const source = sourceFor(event, sources)
    const effectiveAt = textField(payload.effectiveAt)
    const expiresAt = textField(payload.expiresAt)
    const revoked = textField(payload.decision) === 'revoke'
    const notYetEffective = !!effectiveAt && Date.parse(effectiveAt) > Date.parse(now)
    const expired = !!expiresAt && Date.parse(expiresAt) <= Date.parse(now)
    const superseded = supersededIds.has(event.id)
    const active = !revoked && !expired && !notYetEffective && !superseded && (event.truth.assertion === 'human-confirmed' || event.type === 'control.decided' && event.provenance.verification === 'verified')
    const status: GovernanceRowStatus = revoked ? 'revoked' : expired ? 'expired' : superseded || notYetEffective ? 'unresolved' : active ? 'current' : rowStatus(event, source)
    return {
      ...baseRow(event, textField(payload.policyId) ?? event.subject.id, 'decision', status, source),
      actionId: textField(payload.actionId) ?? event.context.actionId ?? event.subject.id,
      decision: textField(payload.decision) ?? 'unknown',
      policyId: textField(payload.policyId) ?? 'unknown',
      policyVersion: textField(payload.policyVersion) ?? 'unknown',
      ...(textField(payload.scopeHash) ? { scopeHash: textField(payload.scopeHash) } : {}),
      ...(textField(payload.decidedBy) ? { decidedBy: textField(payload.decidedBy) } : {}),
      ...(effectiveAt ? { effectiveAt } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      active,
      ...(textField(payload.supersedesDecisionId) ? { supersedesDecisionId: textField(payload.supersedesDecisionId) } : {}),
      gapCodes: [
        ...(revoked ? ['revoked-decision'] : []),
        ...(expired ? ['expired-decision'] : []),
        ...(notYetEffective ? ['decision-not-yet-effective'] : []),
        ...(superseded ? ['superseded-decision'] : []),
        ...(event.truth.assertion === 'inferred' ? ['inferred-not-authoritative'] : []),
      ],
    }
  })
  return rows.sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
}

function projectOutcomes(events: readonly GovernanceEventV1[], sources: readonly GovernanceSourceProjection[]): OutcomeLedgerRow[] {
  return events.filter(event => event.type === 'effect.observed' || event.type === 'outcome.observed' || event.type === 'outcome.verified').map(event => {
    const payload = event.payload as unknown as Record<string, unknown>
    const source = sourceFor(event, sources)
    const verified = event.type === 'outcome.verified' && event.provenance.verification === 'verified' && event.truth.assertion === 'verified'
    return {
      ...baseRow(event, event.subject.label ?? event.subject.id, 'outcome', verified ? 'verified' : rowStatus(event, source), source),
      result: textField(payload.result) ?? 'unknown',
      summary: textField(payload.summary) ?? event.type,
      actionId: textField(payload.actionId) ?? event.context.actionId,
      ...(isRef(payload.effect) ? { effectId: payload.effect.id } : {}),
      verified,
    }
  }).sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
}

function projectSources(events: readonly GovernanceEventV1[], states: readonly EvidenceSourceState[]): GovernanceSourceProjection[] {
  const ids = new Set([...states.map(state => state.id), ...events.map(event => event.source.id)])
  return [...ids].map(sourceId => {
    const sourceEvents = events.filter(event => event.source.id === sourceId)
    const state = states.find(item => item.id === sourceId)
    const health: GovernanceSourceProjection['health'] = state?.health ?? 'unknown'
    return {
      sourceId,
      health,
      eventCount: sourceEvents.length,
      lastObservedAt: latest(sourceEvents.map(event => event.observedAt)),
      gaps: health === 'stale' ? ['stale-source'] : health === 'failed' ? ['source-failed'] : health === 'not-configured' ? ['source-not-configured'] : [],
    }
  }).sort((left, right) => left.sourceId.localeCompare(right.sourceId))
}

function baseRow(event: GovernanceEventV1, title: string, kind: string, status: GovernanceRowStatus, source?: GovernanceSourceProjection): GovernanceLedgerRow {
  return {
    id: event.subject.id,
    title,
    kind,
    eventType: event.type,
    observedAt: event.observedAt,
    sourceIds: [event.source.id],
    eventIds: [event.id],
    status,
    truth: event.truth,
    qualification: event.provenance.qualification,
    verification: event.provenance.verification,
    provenance: [event.provenance],
    gapCodes: source?.gaps ?? [],
  }
}

function rowStatus(event: GovernanceEventV1, source?: GovernanceSourceProjection): GovernanceRowStatus {
  if (source?.health === 'failed') return 'failed'
  if (source?.health === 'stale') return 'stale'
  if (event.truth.assertion === 'inferred') return 'inferred'
  if (event.truth.assertion === 'verified') return 'verified'
  if (event.provenance.verification !== 'verified') return 'unverified'
  return 'observed'
}

function inventoryAsset(event: GovernanceEventV1): CanonicalRef | undefined {
  const payload = event.payload as unknown as Record<string, unknown>
  return isRef(payload.asset) ? payload.asset : undefined
}

function hasConflictingInventory(events: readonly GovernanceEventV1[]): boolean {
  const versions = new Set(events.map(event => textField((event.payload as unknown as Record<string, unknown>).version)).filter(Boolean))
  const owners = new Set(events.map(event => textField((event.payload as unknown as Record<string, unknown>).owner)).filter(Boolean))
  return versions.size > 1 || owners.size > 1
}

function hasMaterialChange(events: readonly GovernanceEventV1[]): boolean {
  if (events.length < 2) return false
  const ordered = [...events].sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt))
  const before = ordered.at(-2)!.payload as unknown as Record<string, unknown>
  const after = ordered.at(-1)!.payload as unknown as Record<string, unknown>
  return ['version', 'owner', 'purpose', 'permissionsSummary'].some(key => textField(before[key]) !== textField(after[key]))
}

function sourceFor(event: GovernanceEventV1, sources: readonly GovernanceSourceProjection[]): GovernanceSourceProjection | undefined {
  return sources.find(source => source.sourceId === event.source.id)
}

function lineageGap(gap: LineageGap, lineage: LineageSummary): GovernanceGap {
  return rowGap(gap.code, gap.message, gap.eventIds, lineage.nodes.flatMap(node => node.sourceIds), ['conflict', 'verified-without-effect'].includes(gap.code) ? 'high' : 'medium')
}

function rowGap(code: string, message: string, eventIds: string[], sourceIds: string[], severity: GovernanceGap['severity']): GovernanceGap {
  return { code, message, eventIds: [...new Set(eventIds)], sourceIds: [...new Set(sourceIds)], severity }
}

function dedupeEvents(events: readonly GovernanceEventV1[]): GovernanceEventV1[] {
  const seen = new Set<string>()
  return events.filter(event => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}

function dedupeGaps(gaps: readonly GovernanceGap[]): GovernanceGap[] {
  const seen = new Set<string>()
  return gaps.filter(gap => {
    const key = `${gap.code}:${gap.eventIds.join(',')}:${gap.sourceIds.join(',')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function latest(values: readonly string[]): string | undefined {
  return [...values].sort((left, right) => Date.parse(right) - Date.parse(left))[0]
}

function textField(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function isRef(value: unknown): value is CanonicalRef {
  return !!value && typeof value === 'object' && 'id' in value && typeof (value as { id?: unknown }).id === 'string'
}
