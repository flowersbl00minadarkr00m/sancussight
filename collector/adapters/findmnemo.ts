import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { createCanonicalRef } from '../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../governance-event.ts'
import type { GovernanceCheckpoint } from '../governance-store.ts'
import type { GovernanceAdapter, GovernanceAdapterCollection } from './governance-types.ts'
import { artifactCursor, checkpointForGovernance, parseGovernanceCursor, readJsonDocuments, rejection, safeExternalId } from './governance-helpers.ts'

export class FindMnemoAdapter implements GovernanceAdapter {
  readonly id = 'findmnemo' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const documents = await readJsonDocuments(this.reader, path)
    if (!documents.length) throw new Error('Select a FindMnemo observed-work or WorkEvent JSON/JSONL export.')
    const records = toRecords(documents[0].value)
    if (!records.length) throw new Error('FindMnemo export contains no supported work records.')
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
        for (const [index, record] of records.entries()) accepted.push(createWorkEvent(record, document.name, document.hash, importedAt, index))
        next.artifacts[metadata.name] = artifactCursor(metadata, document.hash)
      } catch {
        rejected.push(rejection(`${document.hash}:findmnemo`, this.id, document.name, importedAt, 'unsupported-findmnemo-export', 'Provide a supported FindMnemo observed-work or WorkEvent 1.0.0 export without prohibited content.'))
      }
    }
    return { accepted, rejected, checkpoint: checkpointForGovernance(this.id, next, importedAt), lag: 0 }
  }
}

function createWorkEvent(record: Record<string, unknown>, artifactName: string, artifactHash: string, importedAt: string, index: number) {
  const caseId = safeExternalId(record.caseId ?? record.case_id ?? record.workId ?? record.work_id ?? record.id, `case-${index}`)
  const recordId = safeExternalId(record.id ?? record.eventId ?? record.event_id, `record-${index}`)
  const summary = boundedSummary(record.intentSummary ?? record.intent_summary ?? record.summary ?? record.objective, 'Observed FindMnemo work context.')
  const caseRef = createCanonicalRef('work-case', 'findmnemo', caseId)
  const actorValue = record.actorId ?? record.actor_id ?? record.agentId ?? record.agent_id
  const actor = actorValue === undefined ? undefined : createCanonicalRef('agent', 'findmnemo', safeExternalId(actorValue, 'actor'))
  const observed = record.truth === 'observed' || record.truthState === 'observed' || record.truth_state === 'observed' || record.observed === true
  return createGovernanceEvent({
    schemaVersion: 1, type: 'work.intent-recorded', observedAt: dateOr(importedAt, record.observedAt ?? record.observed_at), importedAt,
    source: { id: 'findmnemo', version: String(record.schemaVersion ?? record.schema_version ?? '1.0.0'), recordType: String(record.sourceType ?? record.source_type ?? 'findmnemo.observed-work') },
    subject: caseRef, context: { caseId: caseRef.id },
    truth: observed ? { assertion: 'observed', authority: 'workflow-system' } : { assertion: 'declared', authority: 'agent' },
    payload: { case: caseRef, intentSummary: summary, ...(actor ? { actor } : {}) }, relations: [],
    provenance: { producerId: 'findmnemo', producerVersion: '1.0.0', sourceRecordId: recordId, artifactName, artifactContentHash: artifactHash, parserId: 'findmnemo-governance', parserVersion: '1.0.0', contractVersion: 'findmnemo-governance-v1', qualification: 'manual', verification: 'not-applicable' },
  })
}

function toRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord)
  if (!isRecord(value)) return []
  if (Array.isArray(value.records)) return value.records.filter(isRecord)
  if (Array.isArray(value.events)) return value.events.filter(isRecord)
  if (typeof value.sourceType === 'string' || typeof value.source_type === 'string' || value.schemaVersion === 'findmnemo.observed-work.v1' || value.schema_version === '1.0.0') return [value]
  return []
}

function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function dateOr(fallback: string, value: unknown): string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback }
function boundedSummary(value: unknown, fallback: string): string { return typeof value === 'string' && value.trim() && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim().slice(0, 320) : fallback }
