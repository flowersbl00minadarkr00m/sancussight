import type { EvidenceSourceState } from '../../types.ts'
import type {
  CanonicalRef,
  GovernanceBinding,
  GovernanceEventV1,
  GovernanceRelation,
  GovernanceTruth,
} from './model.ts'

export type LineageRole = 'intent' | 'runtime' | 'agent' | 'action' | 'decision' | 'approval' | 'effect' | 'outcome' | 'proof' | 'finding'
export type LineageState = 'complete' | 'incomplete' | 'conflicting' | 'stale'
export type LineageEdgeState = 'observed' | 'confirmed' | 'inferred' | 'unresolved' | 'conflicting'

export interface LineageNode {
  id: string
  role: LineageRole
  ref?: CanonicalRef
  eventIds: string[]
  truths: GovernanceTruth[]
  sourceIds: string[]
  status: 'observed' | 'inferred' | 'confirmed' | 'verified' | 'missing' | 'conflicting'
}

export interface LineageEdge {
  id: string
  from: string
  to: string
  relation: string
  basis: LineageEdgeState
  state: 'linked' | 'unresolved' | 'conflicting'
  evidenceRefs: string[]
}

export interface LineageGap {
  code: 'missing-intent' | 'missing-action' | 'missing-decision' | 'missing-effect' | 'missing-outcome' | 'missing-proof' | 'unresolved-edge' | 'conflict' | 'stale-source' | 'expired-decision' | 'revoked-decision' | 'verified-without-effect'
  message: string
  eventIds: string[]
}

export interface LineageSummary {
  id: string
  caseId?: string
  actionId?: string
  state: LineageState
  complete: boolean
  auditComplete: boolean
  enforcementProven: boolean
  nodes: LineageNode[]
  edges: LineageEdge[]
  gaps: LineageGap[]
}

const ROLE_ORDER: readonly LineageRole[] = ['intent', 'runtime', 'agent', 'action', 'decision', 'approval', 'effect', 'outcome', 'proof']

export function buildLineage(
  events: readonly GovernanceEventV1[],
  bindings: readonly GovernanceBinding[] = [],
  sourceStates: readonly EvidenceSourceState[] = [],
  now = new Date().toISOString(),
): LineageSummary[] {
  const groups = new Map<string, GovernanceEventV1[]>()
  for (const event of events) {
    const key = lineageGroupKey(event)
    const group = groups.get(key) ?? []
    group.push(event)
    groups.set(key, group)
  }
  return [...groups.entries()].map(([key, group]) => buildGroup(key, group, bindings, sourceStates, now))
}

function buildGroup(
  key: string,
  events: readonly GovernanceEventV1[],
  bindings: readonly GovernanceBinding[],
  sourceStates: readonly EvidenceSourceState[],
  now: string,
): LineageSummary {
  const ordered = [...events].sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt) || left.id.localeCompare(right.id))
  const nodes = new Map<string, LineageNode>()
  const roleEvents = new Map<LineageRole, GovernanceEventV1[]>()
  for (const event of ordered) {
    const role = roleFor(event)
    if (!role) continue
    const ref = refFor(event, role)
    const id = `${role}:${ref?.id ?? event.id}`
    const node = nodes.get(id) ?? { id, role, ...(ref ? { ref } : {}), eventIds: [], truths: [], sourceIds: [], status: statusFor(event) }
    node.eventIds.push(event.id)
    node.truths.push(event.truth)
    if (!node.sourceIds.includes(event.source.id)) node.sourceIds.push(event.source.id)
    node.status = mergeNodeStatus(node.status, statusFor(event))
    nodes.set(id, node)
    const items = roleEvents.get(role) ?? []
    items.push(event)
    roleEvents.set(role, items)
  }

  const gaps: LineageGap[] = []
  const edges: LineageEdge[] = []
  const first = (role: LineageRole): GovernanceEventV1 | undefined => roleEvents.get(role)?.[0]
  const nodeForRole = (role: LineageRole): LineageNode | undefined => {
    const event = first(role)
    if (!event) return undefined
    const ref = refFor(event, role)
    return nodes.get(`${role}:${ref?.id ?? event.id}`)
  }
  const link = (fromRole: LineageRole, toRole: LineageRole, relation: string, missingCode: LineageGap['code']) => {
    const from = nodeForRole(fromRole)
    const to = nodeForRole(toRole)
    if (!from || !to) {
      if (from && !to) gaps.push({ code: missingCode, message: `${toRole} is not traceably observed for this lineage.`, eventIds: from.eventIds })
      return
    }
    const fromEvent = first(fromRole)!
    const toEvent = first(toRole)!
    const basis = relationBasis(fromEvent, toEvent, bindings)
    const state = basis === 'unresolved' ? 'unresolved' : basis === 'conflicting' ? 'conflicting' : 'linked'
    edges.push({ id: `${from.id}->${to.id}`, from: from.id, to: to.id, relation, basis, state, evidenceRefs: [...new Set([...from.eventIds, ...to.eventIds])] })
    if (state !== 'linked') gaps.push({ code: state === 'conflicting' ? 'conflict' : 'unresolved-edge', message: `${fromRole} to ${toRole} remains ${basis}.`, eventIds: [...from.eventIds, ...to.eventIds] })
  }

  const intent = nodeForRole('intent')
  const action = nodeForRole('action')
  const decision = nodeForRole('decision')
  const approval = nodeForRole('approval')
  const effect = nodeForRole('effect')
  const outcome = nodeForRole('outcome')
  const proof = nodeForRole('proof')
  if (!intent) gaps.push({ code: 'missing-intent', message: 'No stable or confirmed work intent is linked.', eventIds: ordered.map(event => event.id) })
  if (!action) gaps.push({ code: 'missing-action', message: 'No stable or confirmed action is linked.', eventIds: ordered.map(event => event.id) })
  if (!decision) gaps.push({ code: 'missing-decision', message: 'No policy or control decision is linked.', eventIds: ordered.map(event => event.id) })
  if (!outcome) gaps.push({ code: 'missing-outcome', message: 'No observed outcome is linked.', eventIds: ordered.map(event => event.id) })
  link('intent', 'action', 'initiated-by', 'missing-action')
  link('action', 'decision', 'evaluated-by', 'missing-decision')
  if (approval) link('decision', 'approval', 'approved-by', 'missing-decision')
  link(approval ? 'approval' : 'decision', 'effect', 'produced', 'missing-effect')
  link('effect', 'outcome', 'validated-by', 'missing-outcome')
  link('outcome', 'proof', 'validated-by', 'missing-proof')

  if (proof && !effect) gaps.push({ code: 'verified-without-effect', message: 'A verified outcome has no traceable observed effect.', eventIds: proof.eventIds })
  const expiredOrRevoked = decisionState(events, now)
  if (expiredOrRevoked) gaps.push(expiredOrRevoked)
  const stale = ordered.some(event => sourceStates.some(source => source.id === event.source.id && ['stale', 'failed'].includes(source.health)))
  if (stale) gaps.push({ code: 'stale-source', message: 'A source contributing to this lineage is stale or failed; historical events remain unchanged.', eventIds: ordered.map(event => event.id) })

  const complete = !!intent && !!action && !!decision && !!outcome && edges.every(edge => edge.state === 'linked')
  const auditComplete = complete && !!effect && !!proof && gaps.every(gap => !['missing-effect', 'missing-proof', 'verified-without-effect', 'expired-decision', 'revoked-decision', 'stale-source'].includes(gap.code))
  const enforcementProven = auditComplete && decision?.status === 'verified' && effect?.status === 'verified' && proof?.status === 'verified'
  const state: LineageState = gaps.some(gap => gap.code === 'conflict') ? 'conflicting' : stale ? 'stale' : complete ? 'complete' : 'incomplete'
  return { id: key, caseId: first('intent')?.context.caseId, actionId: first('action')?.context.actionId, state, complete, auditComplete, enforcementProven, nodes: [...nodes.values()], edges, gaps: dedupeGaps(gaps) }
}

function roleFor(event: GovernanceEventV1): LineageRole | undefined {
  if (event.type === 'work.intent-recorded') return 'intent'
  if (event.type === 'action.proposed' || event.type === 'action.observed') return 'action'
  if (event.type === 'control.decided') return 'decision'
  if (event.type === 'human.decided') return 'approval'
  if (event.type === 'effect.observed') return 'effect'
  if (event.type === 'outcome.observed') return 'outcome'
  if (event.type === 'outcome.verified') return 'proof'
  if (event.type === 'finding.observed') return 'finding'
  if (event.type === 'inventory.observed') return event.subject.kind === 'runtime' ? 'runtime' : 'agent'
  return undefined
}

function refFor(event: GovernanceEventV1, role: LineageRole): CanonicalRef | undefined {
  const payload = event.payload as unknown as Record<string, unknown>
  if (role === 'intent') return payload.case as CanonicalRef
  if (role === 'action') return payload.action as CanonicalRef
  if (role === 'effect') return payload.effect as CanonicalRef
  if (role === 'outcome' || role === 'proof') return payload.outcome as CanonicalRef
  if (role === 'finding') return payload.finding as CanonicalRef
  return event.subject
}

function lineageGroupKey(event: GovernanceEventV1): string {
  const payload = event.payload as unknown as Record<string, unknown>
  const explicitCase = event.context.caseId ?? (isRef(payload.case) ? payload.case.id : undefined)
  if (explicitCase) return `case:${explicitCase}`
  const action = event.context.actionId ?? (typeof payload.actionId === 'string' ? payload.actionId : isRef(payload.action) ? payload.action.id : undefined)
  if (action) return `action:${action}`
  const relation = event.relations.find(item => item.type === 'part-of-case')
  if (relation) return `case:${relation.target.id}`
  return `event:${event.id}`
}

function relationBasis(from: GovernanceEventV1, to: GovernanceEventV1, bindings: readonly GovernanceBinding[]): LineageEdgeState {
  const explicit = [...from.relations, ...to.relations].find(relation => relation.target.id === to.subject.id || relation.target.id === from.subject.id)
  if (explicit) return explicit.basis
  const fromAction = from.context.actionId ?? actionId(from)
  const toAction = to.context.actionId ?? actionId(to)
  if (from.context.caseId && to.context.caseId && from.context.caseId === to.context.caseId && (!fromAction || !toAction || fromAction === toAction)) return 'observed'
  if (bindings.some(binding => (binding.from.id === from.subject.id && binding.to.id === to.subject.id) || (binding.from.id === to.subject.id && binding.to.id === from.subject.id))) return 'confirmed'
  return 'unresolved'
}

function actionId(event: GovernanceEventV1): string | undefined {
  const payload = event.payload as unknown as Record<string, unknown>
  if (typeof payload.actionId === 'string') return payload.actionId
  return isRef(payload.action) ? payload.action.id : undefined
}

function statusFor(event: GovernanceEventV1): LineageNode['status'] {
  if (event.truth.assertion === 'inferred') return 'inferred'
  if (event.truth.assertion === 'human-confirmed') return 'confirmed'
  if (event.truth.assertion === 'verified') return 'verified'
  return 'observed'
}

function mergeNodeStatus(current: LineageNode['status'], next: LineageNode['status']): LineageNode['status'] {
  if (current === next) return current
  if (current === 'conflicting' || next === 'conflicting') return 'conflicting'
  if (current === 'verified' || next === 'verified') return 'verified'
  if (current === 'confirmed' || next === 'confirmed') return 'confirmed'
  if (current === 'inferred' || next === 'inferred') return 'inferred'
  return 'observed'
}

function decisionState(events: readonly GovernanceEventV1[], now: string): LineageGap | undefined {
  const decision = events.find(event => event.type === 'human.decided')
  if (!decision) return undefined
  const payload = decision.payload as { decision?: string; expiresAt?: string }
  if (payload.decision === 'revoke') return { code: 'revoked-decision', message: 'The latest human decision is revoked and remains inactive.', eventIds: [decision.id] }
  if (payload.expiresAt && Date.parse(payload.expiresAt) <= Date.parse(now)) return { code: 'expired-decision', message: 'The human decision expired and remains visible but inactive.', eventIds: [decision.id] }
  return undefined
}

function isRef(value: unknown): value is CanonicalRef {
  return !!value && typeof value === 'object' && 'id' in value && typeof (value as { id?: unknown }).id === 'string'
}

function dedupeGaps(gaps: readonly LineageGap[]): LineageGap[] {
  const seen = new Set<string>()
  return gaps.filter(gap => {
    const key = `${gap.code}:${gap.eventIds.join(',')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
