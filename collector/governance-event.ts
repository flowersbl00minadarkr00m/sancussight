import type {
  CanonicalRef,
  GovernanceEventV1,
  GovernancePayload,
  GovernanceProvenance,
  GovernanceRelation,
  GovernanceTruth,
  LogicalAssetKind,
} from '../src/domain/governance/model.ts'
import {
  GOVERNANCE_EVENT_TYPES,
  LOGICAL_ASSET_KINDS,
} from '../src/domain/governance/model.ts'
import { governanceEventId } from '../src/domain/governance/canonicalize.ts'

const HEX_64 = /^[a-f0-9]{64}$/
const SAFE_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/
const QUALIFICATIONS = ['operational', 'isolated-qa', 'demo', 'fixture', 'replay', 'manual'] as const
const VERIFICATIONS = ['verified', 'failed', 'unavailable', 'not-applicable'] as const
const ASSERTIONS = ['declared', 'observed', 'inferred', 'human-confirmed', 'enforced', 'verified'] as const
const AUTHORITIES = ['agent', 'runtime', 'workflow-system', 'policy-engine', 'human', 'assurance-tool', 'sancussight'] as const
const RELATION_TYPES = ['initiated-by', 'part-of-case', 'proposed-by', 'evaluated-by', 'approved-by', 'executed-as', 'produced', 'validated-by', 'supersedes'] as const
const RELATION_BASES = ['observed', 'confirmed', 'inferred', 'conflicting', 'unresolved'] as const
const PROHIBITED_KEYS = new Set(['prompt', 'prompts', 'response', 'responses', 'chainOfThought', 'chain_of_thought', 'credential', 'credentials', 'secret', 'secrets', 'privateKey', 'private_key', 'commandOutput', 'command_output', 'workspaceContent', 'workspace_content', 'toolArguments', 'tool_arguments', 'toolResults', 'tool_results'])

export interface GovernanceValidationResult {
  valid: boolean
  event?: GovernanceEventV1
  errorCode?: 'unsupported-version' | 'unsupported-type' | 'prohibited-field' | 'invalid-contract' | 'invalid-authority'
  guidance?: string
}

export function createGovernanceEvent(input: Omit<GovernanceEventV1, 'id'>): GovernanceEventV1 {
  const id = governanceEventId({
    type: input.type,
    sourceId: input.source.id,
    sourceRecordId: input.provenance.sourceRecordId,
    subject: input.subject,
    payload: input.payload,
    relations: input.relations,
    parserVersion: input.provenance.parserVersion,
  })
  const event = { ...input, id } as GovernanceEventV1
  const result = parseGovernanceEvent(event)
  if (!result.valid || !result.event) throw new Error(result.guidance ?? 'Invalid governance event.')
  return result.event
}

export function validateGovernanceEvent(value: unknown): value is GovernanceEventV1 {
  return parseGovernanceEvent(value).valid
}

export function parseGovernanceEvent(value: unknown): GovernanceValidationResult {
  if (containsProhibitedKey(value)) return rejection('prohibited-field', 'Remove prohibited content fields before governance ingestion.')
  if (!isRecord(value)) return rejection('invalid-contract', 'Provide one GovernanceEventV1 object.')
  if (value.schemaVersion !== 1) return rejection('unsupported-version', 'Use GovernanceEventV1 schemaVersion 1.')
  if (typeof value.type !== 'string' || !GOVERNANCE_EVENT_TYPES.includes(value.type as typeof GOVERNANCE_EVENT_TYPES[number])) return rejection('unsupported-type', 'Use a supported GovernanceEventV1 event type.')
  if (!hasOnlyKeys(value, ['schemaVersion', 'id', 'type', 'observedAt', 'importedAt', 'source', 'subject', 'context', 'truth', 'payload', 'relations', 'provenance'])) return rejection('invalid-contract', 'Remove unknown governance envelope fields.')
  if (!isId(value.id) || !isIso(value.observedAt) || !isIso(value.importedAt)) return rejection('invalid-contract', 'Provide bounded IDs and ISO timestamps.')
  if (!isSource(value.source) || !isCanonicalRef(value.subject) || !isContext(value.context)) return rejection('invalid-contract', 'Provide a bounded source, subject, and context.')
  const truth = validateTruth(value.truth)
  if (!truth.valid) return rejection('invalid-authority', truth.error ?? 'Truth and authority combination is not supported.')
  if (!isProvenance(value.provenance)) return rejection('invalid-contract', 'Provide allowlisted governance provenance.')
  const truthValue = value.truth as GovernanceTruth
  if (truthValue.assertion === 'enforced' && (value.provenance.qualification !== 'operational' || value.provenance.verification !== 'verified')) return rejection('invalid-authority', 'Enforced evidence requires operational verified provenance.')
  if (truthValue.assertion === 'verified' && value.provenance.verification !== 'verified') return rejection('invalid-authority', 'Verified evidence requires verified provenance.')
  if (!isPayload(value.type as GovernanceEventV1['type'], value.payload)) return rejection('invalid-contract', 'Provide the payload fields required by the event type.')
  if (!Array.isArray(value.relations) || value.relations.length > 32 || !value.relations.every(isRelation)) return rejection('invalid-contract', 'Provide bounded typed relations.')
  return { valid: true, event: value as unknown as GovernanceEventV1 }
}

function isPayload(type: GovernanceEventV1['type'], value: unknown): value is GovernancePayload {
  if (!isRecord(value)) return false
  switch (type) {
    case 'inventory.observed':
      return hasOnlyKeys(value, ['asset', 'state', 'version', 'owner', 'purpose', 'permissionsSummary'])
        && isCanonicalRef(value.asset) && isOneOf(value.state, ['observed', 'declared', 'inferred', 'stale', 'unverified'])
        && optionalText(value.version, 80) && optionalText(value.owner, 160) && optionalText(value.purpose, 240) && optionalText(value.permissionsSummary, 240)
    case 'inventory.removed':
      return hasOnlyKeys(value, ['asset', 'removalReason']) && isCanonicalRef(value.asset) && isOneOf(value.removalReason, ['observed', 'confirmed'])
    case 'work.intent-recorded':
      return hasOnlyKeys(value, ['case', 'intentSummary', 'actor', 'objectRefs']) && isCanonicalRef(value.case)
        && boundedText(value.intentSummary, 320) && optionalRef(value.actor) && optionalRefs(value.objectRefs)
    case 'action.proposed':
    case 'action.observed':
      return isActionPayload(value)
    case 'control.decided':
      return hasOnlyKeys(value, ['actionId', 'decision', 'policyId', 'policyVersion', 'reason'])
        && safeToken(value.actionId) && isOneOf(value.decision, ['allow', 'block', 'advise', 'confirm', 'escalate', 'redact', 'constrain'])
        && safeToken(value.policyId) && safeToken(value.policyVersion, 80) && boundedText(value.reason, 240)
    case 'human.decided':
      return hasOnlyKeys(value, ['decision', 'actionId', 'policyId', 'policyVersion', 'scopeHash', 'rationale', 'decidedBy', 'effectiveAt', 'expiresAt', 'supersedesDecisionId', 'evidenceRefs'])
        && isOneOf(value.decision, ['approve', 'reject', 'override', 'exception', 'revoke']) && safeToken(value.actionId)
        && safeToken(value.policyId) && safeToken(value.policyVersion, 80) && isId(value.scopeHash)
        && boundedText(value.rationale, 320) && safeToken(value.decidedBy) && isIso(value.effectiveAt)
        && optionalIso(value.expiresAt) && optionalToken(value.supersedesDecisionId) && refs(value.evidenceRefs)
    case 'effect.observed':
      return hasOnlyKeys(value, ['effect', 'actionId', 'result', 'summary']) && isCanonicalRef(value.effect)
        && safeToken(value.actionId) && isOneOf(value.result, ['succeeded', 'failed', 'blocked', 'rolled-back', 'unknown']) && boundedText(value.summary, 320)
    case 'outcome.observed':
      return hasOnlyKeys(value, ['outcome', 'actionId', 'result', 'summary']) && isCanonicalRef(value.outcome)
        && optionalToken(value.actionId) && isOneOf(value.result, ['accepted', 'rejected', 'failed', 'undetermined', 'rolled-back']) && boundedText(value.summary, 320)
    case 'outcome.verified':
      return hasOnlyKeys(value, ['outcome', 'verifier', 'result', 'evidenceRefs']) && isCanonicalRef(value.outcome)
        && safeToken(value.verifier) && isOneOf(value.result, ['verified', 'failed', 'undetermined']) && refs(value.evidenceRefs)
    case 'finding.observed':
      return hasOnlyKeys(value, ['finding', 'severity', 'summary', 'category']) && isCanonicalRef(value.finding)
        && isOneOf(value.severity, ['critical', 'high', 'medium', 'low', 'informational']) && boundedText(value.summary, 320) && optionalText(value.category, 80)
  }
}

function isActionPayload(value: Record<string, unknown>): boolean {
  return hasOnlyKeys(value, ['action', 'actor', 'effectType', 'destination', 'sensitivity', 'reversibility', 'privilege'])
    && isCanonicalRef(value.action) && optionalRef(value.actor)
    && isOneOf(value.effectType, ['read', 'write', 'delete', 'publish', 'execute', 'network', 'configure', 'other'])
    && optionalText(value.destination, 160) && optionalText(value.sensitivity, 20)
    && optionalText(value.reversibility, 20) && optionalText(value.privilege, 20)
}

function isSource(value: unknown): boolean {
  return isRecord(value) && hasOnlyKeys(value, ['id', 'version', 'recordType']) && safeToken(value.id) && safeToken(value.version, 80) && optionalText(value.recordType, 80)
}

function isContext(value: unknown): boolean {
  return isRecord(value) && hasOnlyKeys(value, ['caseId', 'actionId', 'workflowId', 'runtimeId', 'targetId'])
    && optionalToken(value.caseId) && optionalToken(value.actionId) && optionalToken(value.workflowId) && optionalToken(value.runtimeId) && optionalToken(value.targetId)
}

function isCanonicalRef(value: unknown): value is CanonicalRef {
  return isRecord(value) && hasOnlyKeys(value, ['kind', 'id', 'namespace', 'label'])
    && isOneOf(value.kind, ['agent', 'runtime', 'model', 'mcp-server', 'tool', 'plugin', 'loop', 'workflow', 'policy', 'permission-set', 'data-object', 'control', 'work-case', 'action', 'approval', 'effect', 'outcome'])
    && isId(value.id) && safeToken(value.namespace) && optionalText(value.label, 160)
}

function isProvenance(value: unknown): value is GovernanceProvenance {
  return isRecord(value) && hasOnlyKeys(value, ['producerId', 'producerVersion', 'sourceRecordId', 'artifactName', 'artifactContentHash', 'parserId', 'parserVersion', 'contractVersion', 'qualification', 'verification'])
    && safeToken(value.producerId) && safeToken(value.producerVersion, 80) && safeToken(value.sourceRecordId)
    && safeArtifactName(value.artifactName) && HEX_64.test(String(value.artifactContentHash))
    && safeToken(value.parserId, 80) && safeToken(value.parserVersion, 80) && safeToken(value.contractVersion, 80)
    && isOneOf(value.qualification, QUALIFICATIONS) && isOneOf(value.verification, VERIFICATIONS)
}

function isRelation(value: unknown): value is GovernanceRelation {
  return isRecord(value) && hasOnlyKeys(value, ['type', 'target', 'basis', 'evidenceRefs'])
    && isOneOf(value.type, RELATION_TYPES) && isCanonicalRef(value.target) && isOneOf(value.basis, RELATION_BASES) && optionalRefs(value.evidenceRefs)
}

function validateTruth(value: unknown): { valid: boolean; error?: string } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['assertion', 'authority', 'confidence']) || !isOneOf(value.assertion, ASSERTIONS) || !isOneOf(value.authority, AUTHORITIES)) {
    return { valid: false, error: 'Provide a supported truth and authority state.' }
  }
  if (value.confidence !== undefined && (typeof value.confidence !== 'number' || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1)) return { valid: false, error: 'Confidence must be a number between 0 and 1.' }
  if (value.assertion === 'inferred' && value.confidence === undefined) return { valid: false, error: 'Inferred evidence requires confidence.' }
  if (value.assertion === 'enforced' && !['runtime', 'policy-engine'].includes(String(value.authority))) return { valid: false, error: 'Enforced evidence requires a runtime or policy-engine authority.' }
  if (value.assertion === 'enforced' && !isOperationalQualification(value) ) return { valid: false, error: 'Enforced evidence requires operational verified provenance.' }
  if (value.assertion === 'verified' && !['runtime', 'policy-engine', 'assurance-tool'].includes(String(value.authority))) return { valid: false, error: 'Verified evidence requires an independent verifier authority.' }
  return { valid: true }
}

function isOperationalQualification(value: Record<string, unknown>): boolean {
  return value.authority === 'runtime' || value.authority === 'policy-engine'
}

function rejection(errorCode: GovernanceValidationResult['errorCode'], guidance: string): GovernanceValidationResult {
  return { valid: false, errorCode, guidance }
}

function containsProhibitedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsProhibitedKey)
  if (!isRecord(value)) return false
  return Object.entries(value).some(([key, nested]) => PROHIBITED_KEYS.has(key) || containsProhibitedKey(nested))
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isId(value: unknown): value is string { return typeof value === 'string' && HEX_64.test(value) }
function safeToken(value: unknown, max = 160): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max && SAFE_TOKEN.test(value) }
function optionalToken(value: unknown): value is string | undefined { return value === undefined || safeToken(value) }
function boundedText(value: unknown, max: number): value is string { return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) }
function optionalText(value: unknown, max: number): value is string | undefined { return value === undefined || boundedText(value, max) }
function isIso(value: unknown): value is string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) }
function optionalIso(value: unknown): value is string | undefined { return value === undefined || isIso(value) }
function optionalRef(value: unknown): value is CanonicalRef | undefined { return value === undefined || isCanonicalRef(value) }
function optionalRefs(value: unknown): value is string[] | undefined { return value === undefined || refs(value) }
function refs(value: unknown): value is string[] { return Array.isArray(value) && value.length <= 32 && value.every((item) => isId(item)) }
function safeArtifactName(value: unknown): value is string { return typeof value === 'string' && value.length > 0 && value.length <= 160 && !/[\\/\u0000-\u001f\u007f]/.test(value) }
function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] { return typeof value === 'string' && values.includes(value) }
