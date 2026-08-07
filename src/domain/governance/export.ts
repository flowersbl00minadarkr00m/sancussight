import { sha256Hex } from './canonicalize.ts'
import { GOVERNANCE_EVENT_TYPES, LOGICAL_ASSET_KINDS, type CanonicalRef, type GovernanceBinding, type GovernanceEventV1 } from './model.ts'
import type { GovernanceReadModel } from './project.ts'

export type GovernanceBundleMode = 'local-collector' | 'hosted-manual'

export interface GovernanceBundleV1 {
  schemaVersion: 1
  bundleType: 'sancussight-governance'
  mode: GovernanceBundleMode
  qualification: 'local' | 'manual'
  exportedAt: string
  generatedAt: string
  projection: GovernanceReadModel
  missingEvidence: GovernanceReadModel['gaps']
  /** Optional retained history allows hosted/manual SancusSight-owned writes to remain auditable. */
  events?: GovernanceEventV1[]
  bindings?: GovernanceBinding[]
}

const PROHIBITED_KEYS = new Set(['prompt', 'prompts', 'response', 'responses', 'chainOfThought', 'chain_of_thought', 'credential', 'credentials', 'secret', 'secrets', 'privateKey', 'private_key', 'commandOutput', 'command_output', 'workspaceContent', 'workspace_content', 'toolArguments', 'tool_arguments', 'toolResults', 'tool_results'])
const ABSOLUTE_IDENTIFIER = /(?:[A-Za-z]:[\\/]|\\\\|\/Users\/|\/home\/|\/private\/|C:\\Users\\)/i

export function createGovernanceBundle(model: GovernanceReadModel, options: { mode: GovernanceBundleMode; exportedAt?: string; events?: readonly GovernanceEventV1[]; bindings?: readonly GovernanceBinding[] }): GovernanceBundleV1 {
  const projection = sanitizeModel(model)
  const bundle: GovernanceBundleV1 = {
    schemaVersion: 1,
    bundleType: 'sancussight-governance',
    mode: options.mode,
    qualification: options.mode === 'local-collector' ? 'local' : 'manual',
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    generatedAt: projection.generatedAt,
    projection,
    missingEvidence: projection.gaps,
    ...(options.events ? { events: sanitizeValue(options.events) as GovernanceEventV1[] } : {}),
    ...(options.bindings ? { bindings: sanitizeValue(options.bindings) as GovernanceBinding[] } : {}),
  }
  if (!isGovernanceBundleSafe(bundle)) throw new Error('Governance export contains disallowed content.')
  return bundle
}

export function parseGovernanceBundle(value: unknown): GovernanceBundleV1 | undefined {
  if (isGovernanceBundle(value)) return value
  if (isRecord(value) && value.schemaVersion === 0 && isRecord(value.readModel)) {
    try { return createGovernanceBundle(value.readModel as GovernanceReadModel, { mode: 'hosted-manual' }) } catch { return undefined }
  }
  return undefined
}

export function isGovernanceBundleSafe(value: unknown): boolean {
  return !containsProhibitedKey(value) && !containsAbsoluteIdentifier(value)
}

export function manualizeGovernanceProjection(model: GovernanceReadModel): GovernanceReadModel {
  return {
    ...model,
    sourceStates: model.sourceStates.map(source => ({ ...source, health: source.health === 'current' ? 'unknown' : source.health, gaps: [...new Set([...source.gaps, 'manual-import'])] })),
  }
}

function sanitizeModel(model: GovernanceReadModel): GovernanceReadModel {
  return sanitizeValue(model) as GovernanceReadModel
}

function sanitizeValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return sanitizeText(value, key)
  if (Array.isArray(value)) return value.map(item => sanitizeValue(item, key)).filter(item => item !== undefined)
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      if (PROHIBITED_KEYS.has(childKey)) continue
      const next = sanitizeValue(childValue, childKey)
      if (next !== undefined) output[childKey] = next
    }
    return output
  }
  return value
}

function sanitizeText(value: string, key: string): string {
  const bounded = value.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 320)
  if (ABSOLUTE_IDENTIFIER.test(bounded) || key === 'owner' || key === 'decidedBy' || key === 'destination') return `alias:${sha256Hex(`${key}\n${bounded}`).slice(0, 16)}`
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(bounded)) return `alias:${sha256Hex(`${key}\n${bounded}`).slice(0, 16)}`
  return bounded
}

function isGovernanceBundle(value: unknown): value is GovernanceBundleV1 {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.bundleType !== 'sancussight-governance' || !['local-collector', 'hosted-manual'].includes(String(value.mode)) || !['local', 'manual'].includes(String(value.qualification)) || typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt)) || typeof value.generatedAt !== 'string' || Number.isNaN(Date.parse(value.generatedAt)) || !isRecord(value.projection) || !Array.isArray(value.missingEvidence)) return false
  if (!hasOnlyKeys(value, ['schemaVersion', 'bundleType', 'mode', 'qualification', 'exportedAt', 'generatedAt', 'projection', 'missingEvidence', 'events', 'bindings'])) return false
  if (!hasOnlyKeys(value.projection, ['generatedAt', 'inventory', 'activity', 'controls', 'decisions', 'outcomes', 'lineage', 'sourceStates', 'gaps', 'eventCount'])) return false
  return Array.isArray(value.projection.inventory) && Array.isArray(value.projection.activity) && Array.isArray(value.projection.controls) && Array.isArray(value.projection.decisions) && Array.isArray(value.projection.outcomes) && Array.isArray(value.projection.lineage) && Array.isArray(value.projection.sourceStates) && Array.isArray(value.projection.gaps) && typeof value.projection.eventCount === 'number'
    && (value.events === undefined || (Array.isArray(value.events) && value.events.every(isGovernanceEventRecord)))
    && (value.bindings === undefined || (Array.isArray(value.bindings) && value.bindings.every(isGovernanceBindingRecord)))
    && isGovernanceBundleSafe(value)
}

function isGovernanceEventRecord(value: unknown): value is GovernanceEventV1 {
  if (!isRecord(value) || value.schemaVersion !== 1 || !GOVERNANCE_EVENT_TYPES.includes(value.type as typeof GOVERNANCE_EVENT_TYPES[number]) || !hasOnlyKeys(value, ['schemaVersion', 'id', 'type', 'observedAt', 'importedAt', 'source', 'subject', 'context', 'truth', 'payload', 'relations', 'provenance'])) return false
  if (!isHex(value.id) || !isIso(value.observedAt) || !isIso(value.importedAt) || !isSource(value.source) || !isCanonicalRef(value.subject) || !isContext(value.context) || !isTruth(value.truth) || !isProvenance(value.provenance) || !isRecord(value.payload) || !Array.isArray(value.relations) || value.relations.length > 32 || !value.relations.every(isRelation)) return false
  return true
}

function isGovernanceBindingRecord(value: unknown): value is GovernanceBinding {
  if (!isRecord(value) || !hasOnlyKeys(value, ['id', 'from', 'to', 'scopeHash', 'confirmedAt', 'confirmedBy', 'evidenceRefs'])) return false
  return isHex(value.id) && isCanonicalRef(value.from) && isCanonicalRef(value.to) && value.from.id !== value.to.id && isHex(value.scopeHash) && isIso(value.confirmedAt) && isToken(value.confirmedBy) && Array.isArray(value.evidenceRefs) && value.evidenceRefs.length <= 32 && value.evidenceRefs.every(isHex)
}

function isSource(value: unknown): boolean { return isRecord(value) && hasOnlyKeys(value, ['id', 'version', 'recordType']) && isToken(value.id) && isToken(value.version) && (value.recordType === undefined || isText(value.recordType, 80)) }
function isContext(value: unknown): boolean { return isRecord(value) && hasOnlyKeys(value, ['caseId', 'actionId', 'workflowId', 'runtimeId', 'targetId']) && Object.values(value).every(item => item === undefined || isToken(item)) }
function isTruth(value: unknown): boolean { return isRecord(value) && hasOnlyKeys(value, ['assertion', 'authority', 'confidence']) && ['declared', 'observed', 'inferred', 'human-confirmed', 'enforced', 'verified'].includes(String(value.assertion)) && ['agent', 'runtime', 'workflow-system', 'policy-engine', 'human', 'assurance-tool', 'sancussight'].includes(String(value.authority)) && (value.confidence === undefined || typeof value.confidence === 'number') }
function isProvenance(value: unknown): boolean { return isRecord(value) && hasOnlyKeys(value, ['producerId', 'producerVersion', 'sourceRecordId', 'artifactName', 'artifactContentHash', 'parserId', 'parserVersion', 'contractVersion', 'qualification', 'verification']) && isToken(value.producerId) && isToken(value.producerVersion) && isToken(value.sourceRecordId) && isText(value.artifactName, 160) && isHex(value.artifactContentHash) && isToken(value.parserId) && isToken(value.parserVersion) && isToken(value.contractVersion) && ['operational', 'isolated-qa', 'demo', 'fixture', 'replay', 'manual'].includes(String(value.qualification)) && ['verified', 'failed', 'unavailable', 'not-applicable'].includes(String(value.verification)) }
function isRelation(value: unknown): boolean { return isRecord(value) && hasOnlyKeys(value, ['type', 'target', 'basis', 'evidenceRefs']) && ['initiated-by', 'part-of-case', 'proposed-by', 'evaluated-by', 'approved-by', 'executed-as', 'produced', 'validated-by', 'supersedes'].includes(String(value.type)) && isCanonicalRef(value.target) && ['observed', 'confirmed', 'inferred', 'conflicting', 'unresolved'].includes(String(value.basis)) && (value.evidenceRefs === undefined || (Array.isArray(value.evidenceRefs) && value.evidenceRefs.length <= 32 && value.evidenceRefs.every(isHex))) }
function isCanonicalRef(value: unknown): value is CanonicalRef { return isRecord(value) && hasOnlyKeys(value, ['kind', 'id', 'namespace', 'label']) && LOGICAL_ASSET_KINDS.includes(value.kind as typeof LOGICAL_ASSET_KINDS[number]) && isHex(value.id) && isToken(value.namespace) && (value.label === undefined || isText(value.label, 160)) }
function isHex(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) }
function isToken(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(value) }
function isText(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) }
function isIso(value: unknown): value is string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) }

function containsProhibitedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsProhibitedKey)
  if (!isRecord(value)) return false
  return Object.entries(value).some(([key, nested]) => PROHIBITED_KEYS.has(key) || containsProhibitedKey(nested))
}

function containsAbsoluteIdentifier(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsAbsoluteIdentifier)
  if (typeof value === 'string') return ABSOLUTE_IDENTIFIER.test(value)
  if (!isRecord(value)) return false
  return Object.values(value).some(containsAbsoluteIdentifier)
}

function isRecord(value: unknown): value is Record<string, any> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean { const allowed = new Set(keys); return Object.keys(value).every(key => allowed.has(key)) }
