import type { EvidenceEnvelopeV1, EvidenceVerification, ReleaseEvidenceSourceId, ReleaseRequiredTargetV1 } from '../types.ts'

export interface RequiredTargetSelection {
  targetId: string
  workerRemitHash?: string
}

export interface CanonicalTargetSelection {
  records: EvidenceEnvelopeV1[]
  requiredTargets: ReleaseRequiredTargetV1[]
}

export function selectCanonicalTargetEvidence(input: {
  source: ReleaseEvidenceSourceId
  evidence: readonly EvidenceEnvelopeV1[]
  releaseRunId: string
  requiredTargets: readonly RequiredTargetSelection[]
  version?: string
  contractVersion?: string
  verification?: EvidenceVerification
}): CanonicalTargetSelection {
  const targetIds = input.requiredTargets.map((target) => target.targetId)
  if (!targetIds.length || new Set(targetIds).size !== targetIds.length) throw new Error(`${input.source}:required-targets-invalid`)
  const selectedRecords: EvidenceEnvelopeV1[] = []
  const requiredTargets = input.requiredTargets.map((requiredTarget) => {
    const eligible = input.evidence.filter((record) =>
      record.source === input.source
      && record.operational?.qualification === 'operational'
      && record.operational.runId === input.releaseRunId
      && record.operational.targetId === requiredTarget.targetId
      && (!requiredTarget.workerRemitHash || record.operational.workerRemitHash === requiredTarget.workerRemitHash)
      && (!input.version || record.operational.sourceVersion === input.version)
      && (!input.contractVersion || record.operational.contractVersion === input.contractVersion)
      && (!input.verification || record.provenance.verification === input.verification),
    )
    const candidates = new Map<string, EvidenceEnvelopeV1[]>()
    for (const record of eligible) {
      const key = `${record.observedAt}\u0000${record.provenance.artifactContentHash}`
      const group = candidates.get(key) ?? []
      group.push(record)
      candidates.set(key, group)
    }
    const chosen = [...candidates.entries()].sort(([leftKey, leftRecords], [rightKey, rightRecords]) => {
      const [leftObserved, leftHash] = leftKey.split('\u0000')
      const [rightObserved, rightHash] = rightKey.split('\u0000')
      const observedOrder = Date.parse(rightObserved) - Date.parse(leftObserved)
      if (observedOrder) return observedOrder
      const hashOrder = leftHash.localeCompare(rightHash)
      if (hashOrder) return hashOrder
      return [...leftRecords].sort(byEvidenceId)[0].id.localeCompare([...rightRecords].sort(byEvidenceId)[0].id)
    })[0]?.[1]
    if (!chosen?.length) throw new Error(`${input.source}:target-missing:${requiredTarget.targetId}`)
    const records = [...chosen].sort(byEvidenceId)
    selectedRecords.push(...records)
    return {
      targetId: requiredTarget.targetId,
      evidenceIds: records.map((record) => record.id),
      latestObservedAt: records[0].observedAt,
      ...(requiredTarget.workerRemitHash ? { workerRemitHash: requiredTarget.workerRemitHash } : {}),
    }
  })
  return { records: selectedRecords, requiredTargets }
}

function byEvidenceId(left: EvidenceEnvelopeV1, right: EvidenceEnvelopeV1): number {
  return left.id.localeCompare(right.id)
}
