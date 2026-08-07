import type {
  EvidenceQualification,
  EvidenceVerification,
} from '../../types.ts'

export const GOVERNANCE_EVENT_TYPES = [
  'inventory.observed',
  'inventory.removed',
  'work.intent-recorded',
  'action.proposed',
  'action.observed',
  'control.decided',
  'human.decided',
  'effect.observed',
  'outcome.observed',
  'outcome.verified',
  'finding.observed',
] as const

export type GovernanceEventType = typeof GOVERNANCE_EVENT_TYPES[number]

export type GovernanceNativeSourceId = 'findmnemo' | 'flowsensa' | 'runtime-inventory'

export const LOGICAL_ASSET_KINDS = [
  'agent', 'runtime', 'model', 'mcp-server', 'tool', 'plugin', 'loop', 'workflow',
  'policy', 'permission-set', 'data-object', 'control', 'work-case', 'action',
  'approval', 'effect', 'outcome',
] as const

export type LogicalAssetKind = typeof LOGICAL_ASSET_KINDS[number]

export interface CanonicalRef {
  kind: LogicalAssetKind
  id: string
  namespace: string
  label?: string
}

export interface GovernanceSource {
  id: string
  version: string
  recordType?: string
}

export interface GovernanceContext {
  caseId?: string
  actionId?: string
  workflowId?: string
  runtimeId?: string
  targetId?: string
}

export type GovernanceAssertion = 'declared' | 'observed' | 'inferred' | 'human-confirmed' | 'enforced' | 'verified'
export type GovernanceAuthority = 'agent' | 'runtime' | 'workflow-system' | 'policy-engine' | 'human' | 'assurance-tool' | 'sancussight'

export interface GovernanceTruth {
  assertion: GovernanceAssertion
  authority: GovernanceAuthority
  confidence?: number
}

export type GovernanceRelationType =
  | 'initiated-by'
  | 'part-of-case'
  | 'proposed-by'
  | 'evaluated-by'
  | 'approved-by'
  | 'executed-as'
  | 'produced'
  | 'validated-by'
  | 'supersedes'

export type GovernanceRelationBasis = 'observed' | 'confirmed' | 'inferred' | 'conflicting' | 'unresolved'

export interface GovernanceRelation {
  type: GovernanceRelationType
  target: CanonicalRef
  basis: GovernanceRelationBasis
  evidenceRefs?: string[]
}

export interface GovernanceProvenance {
  producerId: string
  producerVersion: string
  sourceRecordId: string
  artifactName: string
  artifactContentHash: string
  parserId: string
  parserVersion: string
  contractVersion: string
  qualification: EvidenceQualification
  verification: EvidenceVerification
}

export interface InventoryObservedPayload {
  asset: CanonicalRef
  state: 'observed' | 'declared' | 'inferred' | 'stale' | 'unverified'
  version?: string
  owner?: string
  purpose?: string
  permissionsSummary?: string
}

export interface InventoryRemovedPayload {
  asset: CanonicalRef
  removalReason: 'observed' | 'confirmed'
}

export interface WorkIntentPayload {
  case: CanonicalRef
  intentSummary: string
  actor?: CanonicalRef
  objectRefs?: CanonicalRef[]
}

export interface ActionPayload {
  action: CanonicalRef
  actor?: CanonicalRef
  effectType: 'read' | 'write' | 'delete' | 'publish' | 'execute' | 'network' | 'configure' | 'other'
  destination?: string
  sensitivity?: 'public' | 'internal' | 'sensitive' | 'secret' | 'unknown'
  reversibility?: 'high' | 'medium' | 'low' | 'unknown'
  privilege?: 'none' | 'user' | 'elevated' | 'admin' | 'unknown'
}

export interface ControlDecisionPayload {
  actionId: string
  decision: 'allow' | 'block' | 'advise' | 'confirm' | 'escalate' | 'redact' | 'constrain'
  policyId: string
  policyVersion: string
  reason: string
}

export interface HumanDecisionPayload {
  decision: 'approve' | 'reject' | 'override' | 'exception' | 'revoke'
  actionId: string
  policyId: string
  policyVersion: string
  scopeHash: string
  rationale: string
  decidedBy: string
  effectiveAt: string
  expiresAt?: string
  supersedesDecisionId?: string
  evidenceRefs: string[]
}

export interface EffectPayload {
  effect: CanonicalRef
  actionId: string
  result: 'succeeded' | 'failed' | 'blocked' | 'rolled-back' | 'unknown'
  summary: string
}

export interface OutcomePayload {
  outcome: CanonicalRef
  actionId?: string
  result: 'accepted' | 'rejected' | 'failed' | 'undetermined' | 'rolled-back'
  summary: string
}

export interface VerifiedOutcomePayload {
  outcome: CanonicalRef
  verifier: string
  result: 'verified' | 'failed' | 'undetermined'
  evidenceRefs: string[]
}

export interface FindingPayload {
  finding: CanonicalRef
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  summary: string
  category?: string
}

export type GovernancePayload =
  | InventoryObservedPayload
  | InventoryRemovedPayload
  | WorkIntentPayload
  | ActionPayload
  | ControlDecisionPayload
  | HumanDecisionPayload
  | EffectPayload
  | OutcomePayload
  | VerifiedOutcomePayload
  | FindingPayload

export interface GovernanceEventV1 {
  schemaVersion: 1
  id: string
  type: GovernanceEventType
  observedAt: string
  importedAt: string
  source: GovernanceSource
  subject: CanonicalRef
  context: GovernanceContext
  truth: GovernanceTruth
  payload: GovernancePayload
  relations: GovernanceRelation[]
  provenance: GovernanceProvenance
}

export interface HumanDecisionRecord extends GovernanceEventV1 {
  type: 'human.decided'
  payload: HumanDecisionPayload
}

export interface GovernanceBinding {
  id: string
  from: CanonicalRef
  to: CanonicalRef
  scopeHash: string
  confirmedAt: string
  confirmedBy: string
  evidenceRefs: string[]
}
