import type { ActivityEntry, Asset, EvidenceEnvelopeV1, EvidenceSourceState, Registry, ReleaseEvidenceManifestV1, Signal } from '../types'
import { validateReleaseEvidenceManifest } from './release-gate.ts'

export type EvidenceMatch = 'stable-id' | 'binding' | 'unmapped'

export interface CorrelatedEvidence {
  envelope: EvidenceEnvelopeV1
  match: EvidenceMatch
  asset?: Asset
}

export interface EvidenceCorrelation {
  matched: CorrelatedEvidence[]
  unmapped: CorrelatedEvidence[]
}

export function correlateEvidence(registry: Registry, evidence: readonly EvidenceEnvelopeV1[]): EvidenceCorrelation {
  const matched: CorrelatedEvidence[] = []
  const unmapped: CorrelatedEvidence[] = []

  for (const envelope of evidence) {
    const stableMatch = envelope.subject.stableId
      ? registry.assets.find((asset) => asset.stableId === envelope.subject.stableId)
      : undefined
    const bindingMatch = stableMatch ?? registry.assets.find((asset) => asset.evidenceBindings?.some(
      (binding) => binding.source === envelope.source && binding.externalId === envelope.subject.externalId,
    ))
    const correlation: CorrelatedEvidence = bindingMatch
      ? { envelope, asset: bindingMatch, match: stableMatch ? 'stable-id' : 'binding' }
      : { envelope, match: 'unmapped' }
    if (bindingMatch) matched.push(correlation)
    else unmapped.push(correlation)
  }

  return { matched, unmapped }
}

export function parseEvidenceSnapshot(raw: string): EvidenceEnvelopeV1[] | undefined {
  return parseEvidenceBundle(raw)?.evidence
}

export function parseEvidenceBundle(raw: string): { evidence: EvidenceEnvelopeV1[]; releaseManifest?: ReleaseEvidenceManifestV1 } | undefined {
  try {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
    }
    const records = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && 'evidence' in parsed && Array.isArray(parsed.evidence) ? parsed.evidence : [parsed]
    if (!records.every(isEvidenceEnvelope)) return undefined
    const releaseManifest = parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'releaseManifest' in parsed
      ? (parsed as { releaseManifest?: unknown }).releaseManifest
      : undefined
    if (releaseManifest !== undefined && !validateReleaseEvidenceManifest(releaseManifest).valid) return undefined
    return {
      evidence: [...new Map(records.map((record) => [record.id, record])).values()],
      ...(releaseManifest ? { releaseManifest: releaseManifest as ReleaseEvidenceManifestV1 } : {}),
    }
  } catch {
    return undefined
  }
}

export function confirmEvidenceBinding(registry: Registry, assetId: string, envelope: EvidenceEnvelopeV1): Registry {
  if (!registry.assets.some((asset) => asset.id === assetId)) throw new Error('Selected registry asset was not found.')
  return {
    ...registry,
    assets: registry.assets.map((asset) => {
      if (asset.id !== assetId) return asset
      const binding = { source: envelope.source, externalId: envelope.subject.externalId }
      const existing = asset.evidenceBindings ?? []
      if (existing.some((item) => item.source === binding.source && item.externalId === binding.externalId)) return asset
      return { ...asset, evidenceBindings: [...existing, binding] }
    }),
  }
}

export function evidenceSignals(
  registry: Registry,
  evidence: readonly EvidenceEnvelopeV1[],
  sources: readonly EvidenceSourceState[] = [],
): Signal[] {
  const correlation = correlateEvidence(registry, evidence)
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const signals = correlation.matched.map(({ envelope, asset }): Signal => {
    const source = sourceById.get(envelope.source)
    const sourceDegraded = source && source.health !== 'current'
    const status = sourceDegraded && envelope.outcome === 'pass'
      ? 'warn'
      : envelope.outcome === 'observed' ? 'unknown' : envelope.outcome
    return {
      id: `evidence:${envelope.id}`,
      dimension: evidenceDimension(asset!),
      assetId: asset!.id,
      assetName: asset!.name,
      status,
      category: 'recorded-fact',
      condition: 'Fresh source evidence supports the registered claim',
      finding: sourceDegraded
        ? `${source!.displayName} evidence is retained but ${source!.health.replace('-', ' ')}.`
        : envelope.summary,
      evidence: `${envelope.source} evidence ${envelope.id.slice(0, 12)}`,
      evidenceRef: envelope.id,
      observedAt: envelope.observedAt,
      owner: asset!.owner ?? 'unowned',
      ...(status === 'fail' || status === 'warn' || status === 'unknown'
        ? { action: sourceDegraded ? 'Restore the evidence source and refresh.' : 'Inspect the source evidence and decide the registry response.' }
        : {}),
    }
  })

  for (const asset of registry.assets) {
    if (!asset.evidenceBindings?.length) continue
    const bindingsWithEvidence = new Set(correlation.matched.filter((item) => item.asset?.id === asset.id).map((item) => `${item.envelope.source}:${item.envelope.subject.externalId}`))
    for (const binding of asset.evidenceBindings) {
      if (bindingsWithEvidence.has(`${binding.source}:${binding.externalId}`)) continue
      signals.push({
        id: `evidence-missing:${asset.id}:${binding.source}:${binding.externalId}`,
        checkId: 'evidence.binding-presence.v1',
        evaluatedAt: registry.updatedAt,
        dimension: evidenceDimension(asset), assetId: asset.id, assetName: asset.name,
        status: 'unknown', category: 'missing-evidence',
        condition: 'Configured evidence binding has an accepted observation',
        finding: `No accepted ${binding.source} evidence matches ${binding.externalId}.`,
        evidence: 'Registry evidence binding without a matching normalized record',
        owner: asset.owner ?? 'unowned', action: 'Refresh the source or inspect unmapped and rejected evidence.',
      })
    }
  }
  return signals
}

export function evidenceActivity(evidence: readonly EvidenceEnvelopeV1[]): ActivityEntry[] {
  return evidence.map((envelope) => ({
    ts: envelope.importedAt,
    agent: envelope.source,
    action: 'evidence-imported',
    asset: envelope.subject.externalId,
    summary: envelope.summary,
    session: envelope.id,
    evidence: envelope.id,
  }))
}

export function classifySignal(signal: Signal): NonNullable<Signal['category']> {
  if (signal.category) return signal.category
  if (signal.status === 'accepted') return 'human-decision'
  return 'deterministic-finding'
}

function evidenceDimension(asset: Asset): Signal['dimension'] {
  if (asset.kind === 'control' || asset.kind === 'ontology-action') return 'controls'
  if (asset.kind === 'workflow') return 'continuity'
  return 'evidence'
}

function isEvidenceEnvelope(value: unknown): value is EvidenceEnvelopeV1 {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<EvidenceEnvelopeV1>
  return item.schemaVersion === 1
    && typeof item.id === 'string' && /^[a-f0-9]{64}$/.test(item.id)
    && ['agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap'].includes(String(item.source))
    && typeof item.evidenceKind === 'string'
    && typeof item.observedAt === 'string'
    && typeof item.importedAt === 'string'
    && !!item.subject && typeof item.subject.externalId === 'string'
    && !!item.provenance && /^[a-f0-9]{64}$/.test(item.provenance.artifactContentHash)
    && !!item.attributes && typeof item.attributes === 'object'
}
