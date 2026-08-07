import React from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../../../src/index.css'
import { CheckCatalog } from '../../../../../../src/components/CheckCatalog'
import { ClaimLineageInspector } from '../../../../../../src/components/ClaimLineageInspector'
import { projectCheckResult } from '../../../../../../src/lib/check-catalog'
import { buildClaimLineage } from '../../../../../../src/lib/claim-lineage'
import type {
  CheckSelectionIntent,
  EvidenceEnvelopeV1,
  EvidenceSourceState,
  Registry,
  Signal,
} from '../../../../../../src/types'

const EXACT_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const SECOND_ID = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const UNRELATED_ID = 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
const SCOPE_HASH = 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'

const asset = {
  id: 'asset-c2-lineage',
  stableId: 'synthetic:c2:lineage:v1',
  name: 'Synthetic C2 lineage asset',
  kind: 'workflow' as const,
  format: 'markdown',
  location: 'synthetic/c2-lineage.md',
  owner: 'Synthetic operator',
  sensitivity: 'internal' as const,
  lastReviewed: '2026-07-23',
  sharedByDesign: true,
  coverage: [],
  providerDependencies: [],
  evidence: [],
  evidenceBindings: [{ source: 'agent-beacon' as const, externalId: 'same-asset-unrelated' }],
}

const registry: Registry = {
  schemaVersion: 2,
  platforms: ['primary-cloud', 'local-runner'],
  updatedAt: '2026-07-23T21:00:00.000Z',
  assets: [asset],
  provenance: {
    mode: 'local',
    sourceUpdatedAt: '2026-07-23T21:00:00.000Z',
  },
}

function envelope(
  id: string,
  externalId: string,
  outcome: EvidenceEnvelopeV1['outcome'],
  summary: string,
  observedAt: string,
): EvidenceEnvelopeV1 {
  return {
    schemaVersion: 1,
    id,
    source: 'agent-beacon',
    evidenceKind: 'synthetic-c2-lineage-observation',
    observedAt,
    importedAt: '2026-07-23T21:05:00.000Z',
    subject: {
      stableId: asset.stableId,
      externalId,
      type: 'workflow',
    },
    outcome,
    summary,
    provenance: {
      artifactName: `${externalId}.json`,
      artifactContentHash: id,
      parserId: 'synthetic-c2-fixture',
      parserVersion: '1',
      verification: 'verified',
    },
    operational: {
      qualification: 'fixture',
      sourceVersion: '1',
      runId: `run-${externalId}`,
      targetId: asset.id,
      contractVersion: 'synthetic-c2-contract-v1',
    },
    attributes: {
      fixture: true,
    },
  }
}

const exactEnvelope = envelope(
  EXACT_ID,
  'exact-accepted',
  'pass',
  'EXACT_ACCEPTED_SENTINEL',
  '2026-07-23T21:02:00.000Z',
)
const secondEnvelope = envelope(
  SECOND_ID,
  'exact-conflict-peer',
  'fail',
  'EXACT_CONFLICT_PEER_SENTINEL',
  '2026-07-23T21:01:00.000Z',
)
const unrelatedEnvelope = envelope(
  UNRELATED_ID,
  'same-asset-unrelated',
  'fail',
  'UNRELATED_SAME_ASSET_SENTINEL',
  '2026-07-23T21:03:00.000Z',
)
const sources: EvidenceSourceState[] = [{
  id: 'agent-beacon',
  displayName: 'Agent Beacon',
  evidenceType: 'synthetic-c2-lineage-observation',
  health: 'stale',
  rejectedCount: 0,
}]

function signal(id: string, evidenceRef?: string): Signal {
  return {
    id,
    checkId: 'portability.provider-fallback.v1',
    evaluatedAt: '2026-07-23T21:00:00.000Z',
    dimension: 'continuity',
    assetId: asset.id,
    assetName: asset.name,
    status: 'pass',
    condition: 'Every provider-specific dependency names an approved fallback',
    finding: 'Synthetic dependency has an approved fallback',
    evidence: evidenceRef ? 'Exact accepted synthetic evidence' : 'Registry providerDependencies',
    ...(evidenceRef ? { evidenceRef } : {}),
    owner: 'Synthetic operator',
  }
}

const unrelatedSignal = signal('asset-c2-lineage:dep-unrelated')
const exactSignal = signal('asset-c2-lineage:dep-exact', EXACT_ID)
const historyStore = {
  async read() {
    return { availability: 'unavailable' as const }
  },
  async clear() {
    return { state: 'cleared' as const }
  },
}

function CatalogCase({
  signalValue,
  evidence,
}: {
  signalValue: Signal
  evidence: EvidenceEnvelopeV1[]
}) {
  const [intent, setIntent] = React.useState<CheckSelectionIntent>({
    checkId: signalValue.checkId,
    signalId: signalValue.id,
    assetId: signalValue.assetId,
    origin: 'attention',
  })
  return (
    <CheckCatalog
      registry={registry}
      signals={[signalValue]}
      attentionSignals={[signalValue]}
      evidence={evidence}
      sources={sources}
      intent={intent}
      registryScopeHash={SCOPE_HASH}
      historyRevision={0}
      historyStore={historyStore}
      onIntentChange={setIntent}
      onOpenAsset={() => undefined}
      onHistoryCleared={() => undefined}
    />
  )
}

createRoot(document.querySelector('[data-root="unrelated"]')!).render(
  <CatalogCase signalValue={unrelatedSignal} evidence={[unrelatedEnvelope]} />,
)
createRoot(document.querySelector('[data-root="exact"]')!).render(
  <CatalogCase signalValue={exactSignal} evidence={[exactEnvelope, unrelatedEnvelope]} />,
)

const conflictResult = projectCheckResult(exactSignal, {
  registryScope: SCOPE_HASH,
  safeEvidence: [
    {
      label: 'agent-beacon / accepted-pass',
      reference: exactEnvelope.id,
      observedAt: exactEnvelope.observedAt,
      sourceHealth: 'current',
    },
    {
      label: 'agent-beacon / accepted-fail',
      reference: secondEnvelope.id,
      observedAt: secondEnvelope.observedAt,
      sourceHealth: 'current',
    },
  ],
})
const conflictLineage = buildClaimLineage(conflictResult, {
  asset,
  evidence: [exactEnvelope, secondEnvelope],
  sources: [{ ...sources[0], health: 'current' }],
})
createRoot(document.querySelector('[data-root="conflict"]')!).render(
  <ClaimLineageInspector lineage={conflictLineage} />,
)
