import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { createCanonicalRef } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import type { GovernanceCheckpoint } from '../governance-store.ts'
import type { GovernanceAdapter, GovernanceAdapterCollection } from './governance-types.ts'
import { artifactCursor, checkpointForGovernance, parseGovernanceCursor, readJsonDocuments, rejection, safeExternalId } from './governance-helpers.ts'

export class FlowSensaAdapter implements GovernanceAdapter {
  readonly id = 'flowsensa' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const documents = await readJsonDocuments(this.reader, path)
    if (!documents.length || !documents.some((document) => toRecords(document.value).length)) throw new Error('Select a FlowSensa governance projection containing workflow records.')
  }

  async collect(path: string, checkpoint: GovernanceCheckpoint | undefined, importedAt: string): Promise<GovernanceAdapterCollection> {
    const previous = parseGovernanceCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    for (const document of await readJsonDocuments(this.reader, path)) {
      const metadata = await this.reader.inspect(document.path)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      try {
        const records = toRecords(document.value)
        if (!records.length) throw new Error('empty')
        for (const [index, record] of records.entries()) accepted.push(createWorkflowEvent(record, document.name, document.hash, importedAt, index))
        next.artifacts[metadata.name] = artifactCursor(metadata, document.hash)
      } catch {
        rejected.push(rejection(`${document.hash}:flowsensa`, this.id, document.name, importedAt, 'unsupported-flowsensa-export', 'Provide a supported FlowSensa governance projection with bounded workflow fields.'))
      }
    }
    return { accepted, rejected, checkpoint: checkpointForGovernance(this.id, next, importedAt), lag: 0 }
  }
}

function createWorkflowEvent(record: Record<string, unknown>, artifactName: string, artifactHash: string, importedAt: string, index: number) {
  if (containsProhibited(record)) throw new Error('prohibited')
  const workflowId = safeExternalId(record.workflowId ?? record.workflow_id ?? record.loopId ?? record.loop_id, `workflow-${index}`)
  const actionId = safeExternalId(record.transitionId ?? record.transition_id ?? record.actionId ?? record.action_id ?? record.id, `transition-${index}`)
  const action = createCanonicalRef('action', 'flowsensa', actionId)
  const inferred = record.truth === 'inferred' || record.truthState === 'inferred' || record.truth_state === 'inferred' || record.derived === true
  const confidence = typeof record.confidence === 'number' ? record.confidence : inferred ? undefined : undefined
  if (inferred && confidence === undefined) throw new Error('inferred-confidence')
  const summary = boundedSummary(record.summary ?? record.transitionSummary ?? record.transition_summary ?? record.processRisk, 'Observed FlowSensa workflow transition.')
  const truth = inferred
    ? { assertion: 'inferred' as const, authority: 'workflow-system' as const, confidence }
    : { assertion: 'observed' as const, authority: 'workflow-system' as const }
  return createGovernanceEvent({
    schemaVersion: 1, type: 'action.observed', observedAt: dateOr(importedAt, record.observedAt ?? record.observed_at), importedAt,
    source: { id: 'flowsensa', version: String(record.schemaVersion ?? record.schema_version ?? '1.0.0'), recordType: 'flowsensa.governance.v1' },
    subject: action, context: { workflowId, actionId: action.id }, truth,
    payload: { action, effectType: effectType(record.effectType ?? record.effect_type), ...(record.destination ? { destination: boundedSummary(record.destination, 'bounded-destination').slice(0, 160) } : {}) }, relations: [],
    provenance: { producerId: 'flowsensa', producerVersion: '1.0.0', sourceRecordId: safeExternalId(record.id ?? actionId, `transition-${index}`), artifactName, artifactContentHash: artifactHash, parserId: 'flowsensa-governance', parserVersion: '1.0.0', contractVersion: 'flowsensa-governance-v1', qualification: 'manual', verification: 'not-applicable' },
  })
}

function toRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord)
  if (!isRecord(value)) return []
  if (Array.isArray(value.events)) return value.events.filter(isRecord)
  if (Array.isArray(value.transitions)) return value.transitions.filter(isRecord)
  if (Array.isArray(value.workflows)) return value.workflows.filter(isRecord)
  if (value.schemaVersion === 'flowsensa.governance.v1' || value.schema_version === 'flowsensa.governance.v1') return [value]
  return []
}

function containsProhibited(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsProhibited)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => ['prompt', 'response', 'toolArguments', 'toolResults', 'credentials', 'secret', 'workspaceContent'].includes(key) || containsProhibited(nested))
}
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function dateOr(fallback: string, value: unknown): string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback }
function boundedSummary(value: unknown, fallback: string): string { return typeof value === 'string' && value.trim() && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim().slice(0, 320) : fallback }
function effectType(value: unknown): 'read' | 'write' | 'delete' | 'publish' | 'execute' | 'network' | 'configure' | 'other' { return ['read', 'write', 'delete', 'publish', 'execute', 'network', 'configure'].includes(String(value)) ? value as never : 'other' }
