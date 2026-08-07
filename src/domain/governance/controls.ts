import type { EvidenceVerification } from '../../types.ts'
import type {
  ActivityLedgerRow,
  ControlLedgerRow,
  DecisionLedgerRow,
  GovernanceReadModel,
} from './project.ts'

export type FrictionTier = 'observe' | 'advise' | 'confirm' | 'block'
export type RecommendationConfidence = 'high' | 'medium' | 'low'

export interface PersonalControlPredicates {
  effectTypes?: string[]
  externalDestination?: boolean
  sensitivities?: string[]
  sensitivityNot?: string[]
  privileges?: string[]
  reversibilities?: string[]
  permissionBreadths?: string[]
  policyPresent?: boolean
  fresh?: boolean
  approvalMatch?: boolean
  novelty?: boolean
  lineageGap?: boolean
  sourceDegraded?: boolean
}

export interface PersonalControlDefinition {
  id: string
  dimension: string
  outcome: string
  consequence: string
  defaultTier: FrictionTier
  predicates: PersonalControlPredicates
  expectedEvidence: string[]
  references: { aicm: string[] }
}

export interface PersonalControlProfile {
  schemaVersion: 1
  profileId: string
  version: string
  attribution: { dimensions: string; aicm: string }
  dimensions: Array<{ id: string; label: string }>
  controls: PersonalControlDefinition[]
}

export interface ControlFact {
  id: string
  actionId?: string
  effectType?: string
  destination?: string
  sensitivity?: string
  privilege?: string
  reversibility?: string
  permissionBreadth?: string
  policyPresent?: boolean
  fresh?: boolean
  novelty?: boolean
  lineageGapCodes?: string[]
  sourceDegraded?: boolean
  activeApproval?: boolean
  truth: 'declared' | 'observed' | 'inferred' | 'human-confirmed' | 'enforced' | 'verified'
  verification: EvidenceVerification
  qualification: string
}

export interface ControlEvaluationInput {
  actions?: readonly ControlFact[]
  activity?: readonly ActivityLedgerRow[]
  controls?: readonly ControlLedgerRow[]
  decisions?: readonly DecisionLedgerRow[]
  gaps?: readonly { code: string; eventIds: string[] }[]
  sourceStates?: readonly { health: string }[]
}

export interface ControlRecommendation {
  controlId: string
  actionId: string
  applicable: true
  tier: FrictionTier
  consequence: string
  requiredEvidence: string[]
  applicabilityBasis: string[]
  confidence: RecommendationConfidence
  reasonCodes: string[]
  enforcementProven: boolean
  activeApproval: boolean
  authorityNote: string
  references: string[]
  evidenceGaps: string[]
}

export function evaluatePersonalControls(
  readModel: ControlEvaluationInput | GovernanceReadModel,
  profile: PersonalControlProfile,
  now: string,
): ControlRecommendation[] {
  const actions = normalizeFacts(readModel)
  const recommendations: ControlRecommendation[] = []
  for (const action of actions) {
    for (const control of profile.controls) {
      const match = matchControl(control.predicates, action, readModel)
      if (!match.applicable) continue
      const reasonCodes = [...match.reasonCodes]
      const evidenceGaps = [...match.unknowns]
      const activeApproval = action.activeApproval ?? activeApprovalFor(readModel, action.actionId, now)
      const tier = chooseTier(control.defaultTier, action, activeApproval, evidenceGaps)
      if (tier === 'confirm' && !activeApproval) reasonCodes.push('approval-missing')
      if (tier === 'block') reasonCodes.push('deterministic-denial-recommended')
      if (evidenceGaps.length) reasonCodes.push('unknown-fact')
      const enforcementProven = action.truth === 'inferred' || action.truth === 'declared' ? false : enforcementFor(readModel, action.actionId)
      recommendations.push({
        controlId: control.id,
        actionId: action.actionId ?? action.id,
        applicable: true,
        tier,
        consequence: control.consequence,
        requiredEvidence: control.expectedEvidence,
        applicabilityBasis: [...new Set(match.basis)],
        confidence: confidenceFor(action, evidenceGaps),
        reasonCodes: [...new Set(reasonCodes)],
        enforcementProven,
        activeApproval,
        authorityNote: enforcementProven
          ? 'A qualifying verified receipt is visible for this action; this recommendation does not initiate or change upstream enforcement.'
          : 'This is a deterministic recommendation only. It cannot authorize, block, or claim enforcement upstream.',
        references: control.references.aicm,
        evidenceGaps,
      })
    }
  }
  return recommendations.sort((left, right) => tierRank(right.tier) - tierRank(left.tier) || left.actionId.localeCompare(right.actionId) || left.controlId.localeCompare(right.controlId))
}

function normalizeFacts(readModel: ControlEvaluationInput | GovernanceReadModel): ControlFact[] {
  if ('actions' in readModel && readModel.actions) return [...readModel.actions]
  const model = readModel as GovernanceReadModel
  const degraded = model.sourceStates.some(source => ['stale', 'failed', 'not-configured'].includes(source.health))
  return model.activity.filter(row => row.eventType === 'action.observed' || row.eventType === 'action.proposed').map(row => ({
    id: row.id,
    actionId: row.actionId ?? row.id,
    effectType: row.effectType,
    destination: row.destination,
    sensitivity: row.sensitivity,
    privilege: row.privilege,
    reversibility: row.reversibility,
    permissionBreadth: row.permissionBreadth,
    policyPresent: row.policyPresent,
    fresh: row.fresh,
    novelty: model.inventory.some(item => item.gapCodes.includes('material-change') && item.status !== 'removed'),
    lineageGapCodes: model.gaps.map(gap => gap.code),
    sourceDegraded: degraded,
    truth: row.truth.assertion,
    verification: row.verification,
    qualification: row.qualification,
  }))
}

function matchControl(predicates: PersonalControlPredicates, action: ControlFact, readModel: ControlEvaluationInput | GovernanceReadModel): { applicable: boolean; basis: string[]; reasonCodes: string[]; unknowns: string[] } {
  const basis: string[] = []
  const reasonCodes: string[] = []
  const unknowns: string[] = []
  const mismatch: string[] = []
  if (predicates.effectTypes) {
    if (!action.effectType) unknowns.push('effect-type-unavailable')
    else if (!predicates.effectTypes.includes(action.effectType)) mismatch.push('effect-type-not-applicable')
    else { basis.push(`effect:${action.effectType}`); reasonCodes.push('consequential-effect') }
  }
  if (predicates.externalDestination !== undefined) {
    const external = externalDestination(action.destination)
    if (external === undefined) unknowns.push('destination-unknown')
    else if (external !== predicates.externalDestination) mismatch.push('destination-not-applicable')
    else { basis.push(`external-destination:${external}`); if (external) reasonCodes.push('external-destination') }
  }
  if (predicates.sensitivities) {
    if (!action.sensitivity) unknowns.push('sensitivity-unknown')
    else if (!predicates.sensitivities.includes(action.sensitivity)) mismatch.push('sensitivity-not-applicable')
    else { basis.push(`sensitivity:${action.sensitivity}`); reasonCodes.push('sensitive-data') }
  }
  if (predicates.sensitivityNot) {
    if (!action.sensitivity) unknowns.push('sensitivity-unknown')
    else if (predicates.sensitivityNot.includes(action.sensitivity)) mismatch.push('sensitivity-excluded')
    else basis.push(`sensitivity-not:${action.sensitivity}`)
  }
  if (predicates.privileges) {
    if (!action.privilege) unknowns.push('privilege-unknown')
    else if (!predicates.privileges.includes(action.privilege)) mismatch.push('privilege-not-applicable')
    else { basis.push(`privilege:${action.privilege}`); reasonCodes.push('privileged-action') }
  }
  if (predicates.reversibilities) {
    if (!action.reversibility) unknowns.push('reversibility-unknown')
    else if (!predicates.reversibilities.includes(action.reversibility)) mismatch.push('reversibility-not-applicable')
    else basis.push(`reversibility:${action.reversibility}`)
  }
  if (predicates.permissionBreadths) {
    if (!action.permissionBreadth) unknowns.push('permission-breadth-unknown')
    else if (!predicates.permissionBreadths.includes(action.permissionBreadth)) mismatch.push('permission-breadth-not-applicable')
    else { basis.push(`permission-breadth:${action.permissionBreadth}`); reasonCodes.push('permission-breadth') }
  }
  if (predicates.policyPresent !== undefined) {
    if (action.policyPresent === undefined) unknowns.push('policy-presence-unknown')
    else if (action.policyPresent !== predicates.policyPresent) mismatch.push('policy-presence-not-applicable')
    else basis.push(`policy-present:${action.policyPresent}`)
  }
  if (predicates.fresh !== undefined) {
    if (action.fresh === undefined) unknowns.push('freshness-unknown')
    else if (action.fresh !== predicates.fresh) mismatch.push('freshness-not-applicable')
    else { basis.push(`fresh:${action.fresh}`); if (!action.fresh) reasonCodes.push('stale-evidence') }
  }
  if (predicates.approvalMatch !== undefined) {
    if (action.activeApproval === undefined) unknowns.push('approval-match-unknown')
    else if (action.activeApproval !== predicates.approvalMatch) mismatch.push('approval-match-not-applicable')
    else { basis.push(`approval-match:${action.activeApproval}`); if (!action.activeApproval) reasonCodes.push('approval-missing') }
  }
  if (predicates.novelty) {
    if (action.novelty === undefined) unknowns.push('novelty-unknown')
    else if (!action.novelty) mismatch.push('not-novel')
    else { basis.push('material-change'); reasonCodes.push('new-asset') }
  }
  if (predicates.lineageGap) {
    const gaps = action.lineageGapCodes ?? (readModel as ControlEvaluationInput).gaps?.map(gap => gap.code) ?? []
    if (!gaps.length) unknowns.push('lineage-unknown')
    else { basis.push(`lineage-gap:${gaps[0]}`); reasonCodes.push('lineage-gap') }
  }
  if (predicates.sourceDegraded) {
    const degraded = action.sourceDegraded ?? (readModel as ControlEvaluationInput).sourceStates?.some(source => ['stale', 'failed', 'not-configured'].includes(source.health))
    if (degraded === undefined) unknowns.push('source-health-unknown')
    else if (!degraded) mismatch.push('source-current')
    else { basis.push('source-degraded'); reasonCodes.push('source-degraded') }
  }
  return { applicable: mismatch.length === 0, basis, reasonCodes, unknowns }
}

function chooseTier(defaultTier: FrictionTier, action: ControlFact, activeApproval: boolean, unknowns: readonly string[]): FrictionTier {
  let tier = defaultTier
  if (action.effectType && ['delete', 'execute'].includes(action.effectType) && action.privilege === 'unknown') tier = maxTier(tier, 'block')
  if (action.sensitivity === 'secret' && externalDestination(action.destination) === true) tier = maxTier(tier, 'block')
  if (action.effectType && ['write', 'delete', 'publish', 'execute'].includes(action.effectType) && !activeApproval) tier = maxTier(tier, 'confirm')
  if (action.privilege && ['elevated', 'admin'].includes(action.privilege) && !activeApproval) tier = maxTier(tier, 'confirm')
  if (unknowns.length && tier === 'observe') tier = 'advise'
  return tier
}

function activeApprovalFor(readModel: ControlEvaluationInput | GovernanceReadModel, actionId: string | undefined, now: string): boolean {
  if (!actionId || !('decisions' in readModel) || !readModel.decisions) return false
  return readModel.decisions.some(decision => decision.actionId === actionId && decision.active && (!decision.expiresAt || Date.parse(decision.expiresAt) > Date.parse(now)))
}

function enforcementFor(readModel: ControlEvaluationInput | GovernanceReadModel, actionId: string | undefined): boolean {
  if (!actionId || !('controls' in readModel) || !readModel.controls) return false
  return readModel.controls.some(control => control.actionId === actionId && control.enforcementProven)
}

function externalDestination(destination: string | undefined): boolean | undefined {
  if (!destination) return undefined
  const normalized = destination.trim().toLowerCase()
  if (normalized.startsWith('workspace:') || normalized.startsWith('file:') || normalized.startsWith('localhost:') || normalized.startsWith('127.0.0.1:') || normalized.startsWith('::1:')) return false
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('mcp:') || normalized.startsWith('network:')) return true
  return undefined
}

function confidenceFor(action: ControlFact, unknowns: readonly string[]): RecommendationConfidence {
  if (unknowns.length) return 'low'
  if (action.truth === 'inferred' || action.qualification === 'manual' || action.verification !== 'verified') return 'medium'
  return 'high'
}

function tierRank(tier: FrictionTier): number { return tier === 'block' ? 4 : tier === 'confirm' ? 3 : tier === 'advise' ? 2 : 1 }
function maxTier(left: FrictionTier, right: FrictionTier): FrictionTier { return tierRank(left) >= tierRank(right) ? left : right }
