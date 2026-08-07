import type { EvidenceEnvelopeV1 } from '../../../src/types.ts'
import type { CanonicalRef, GovernanceEventV1 } from '../../../src/domain/governance/model.ts'
import { createCanonicalRef } from '../../../src/domain/governance/canonicalize.ts'
import { createGovernanceEvent } from '../../governance-event.ts'

export function projectEvidenceEnvelope(envelope: EvidenceEnvelopeV1): GovernanceEventV1 {
  const subject = evidenceRef(envelope)
  const provenance = {
    producerId: envelope.source,
    producerVersion: envelope.operational?.sourceVersion ?? envelope.provenance.parserVersion,
    sourceRecordId: safeSourceRecordId(envelope.provenance.sourceRecordId ?? envelope.id),
    artifactName: envelope.provenance.artifactName,
    artifactContentHash: envelope.provenance.artifactContentHash,
    parserId: envelope.provenance.parserId,
    parserVersion: envelope.provenance.parserVersion,
    contractVersion: envelope.operational?.contractVersion ?? `evidence-envelope-v${envelope.schemaVersion}`,
    qualification: envelope.operational?.qualification ?? 'manual',
    verification: envelope.provenance.verification,
  } as const
  const truth = envelope.provenance.verification === 'verified'
    ? { assertion: 'verified' as const, authority: 'assurance-tool' as const }
    : { assertion: 'observed' as const, authority: envelope.source === 'agent-beacon' || envelope.source === 'runtime-telemetry' ? 'runtime' as const : 'assurance-tool' as const }
  const context = {
    ...(envelope.operational?.runtime ? { runtimeId: safeSourceRecordId(envelope.operational.runtime) } : {}),
    ...(envelope.operational?.targetId ? { targetId: safeSourceRecordId(envelope.operational.targetId) } : {}),
    actionId: envelope.id,
  }
  if (envelope.evidenceKind === 'inventory-state') {
    return createGovernanceEvent({
      schemaVersion: 1, type: 'inventory.observed', observedAt: envelope.observedAt, importedAt: envelope.importedAt,
      source: { id: envelope.source, version: provenance.producerVersion, recordType: envelope.evidenceKind }, subject, context, truth,
      payload: { asset: subject, state: 'observed', version: provenance.producerVersion }, relations: [], provenance,
    })
  }
  if (envelope.source === 'pipelock' || envelope.evidenceKind === 'audit-packet') {
    const decision = envelope.outcome === 'pass' ? 'allow' : envelope.outcome === 'fail' ? 'block' : 'advise'
    return createGovernanceEvent({
      schemaVersion: 1, type: 'control.decided', observedAt: envelope.observedAt, importedAt: envelope.importedAt,
      source: { id: envelope.source, version: provenance.producerVersion, recordType: envelope.evidenceKind }, subject, context, truth,
      payload: { actionId: envelope.id, decision, policyId: `source:${envelope.source}`, policyVersion: provenance.parserVersion, reason: envelope.summary }, relations: [], provenance,
    })
  }
  if (envelope.evidenceKind.includes('finding') || envelope.evidenceKind === 'verified-positive' || ['rampart', 'aimap'].includes(envelope.source)) {
    return createGovernanceEvent({
      schemaVersion: 1, type: 'finding.observed', observedAt: envelope.observedAt, importedAt: envelope.importedAt,
      source: { id: envelope.source, version: provenance.producerVersion, recordType: envelope.evidenceKind }, subject, context, truth,
      payload: { finding: subject, severity: severityFor(envelope.outcome), summary: envelope.summary }, relations: [], provenance,
    })
  }
  return createGovernanceEvent({
    schemaVersion: 1, type: 'action.observed', observedAt: envelope.observedAt, importedAt: envelope.importedAt,
    source: { id: envelope.source, version: provenance.producerVersion, recordType: envelope.evidenceKind }, subject, context, truth,
    payload: { action: subject, effectType: 'other', sensitivity: 'unknown', reversibility: 'unknown', privilege: 'unknown' }, relations: [], provenance,
  })
}

function safeSourceRecordId(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 160)
  return normalized || 'evidence-record'
}

function evidenceRef(envelope: EvidenceEnvelopeV1): CanonicalRef {
  const externalId = envelope.subject.externalId.replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 160) || envelope.id.slice(0, 32)
  const kind = envelope.subject.type === 'agent' ? 'agent' : envelope.subject.type === 'workflow' ? 'workflow' : envelope.subject.type === 'runtime' ? 'runtime' : envelope.subject.type === 'control' ? 'control' : 'action'
  return createCanonicalRef(kind, `evidence:${envelope.source}`, externalId)
}

function severityFor(outcome: EvidenceEnvelopeV1['outcome']): 'critical' | 'high' | 'medium' | 'low' | 'informational' {
  return outcome === 'fail' ? 'high' : outcome === 'warn' ? 'medium' : outcome === 'pass' ? 'low' : 'informational'
}
