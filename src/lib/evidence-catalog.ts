import type { AdapterCatalogEntry, EvidenceSourceId, EvidenceSourceState } from '../types.ts'

export const EVIDENCE_ADAPTER_CATALOG: readonly AdapterCatalogEntry[] = [
  { id: 'agent-beacon', displayName: 'Agent Beacon', evidenceType: 'Runtime and inventory JSONL', readiness: 'available', boundary: 'Read-only local logs' },
  { id: 'runtime-telemetry', displayName: 'Runtime telemetry', evidenceType: 'Sanitized Codex, Claude, and Pi metadata JSONL', readiness: 'available', boundary: 'Read-only fixed contract; bridges and extensions remain operator-side' },
  { id: 'praxen', displayName: 'Praxen', evidenceType: 'Canonical findings JSON 2.0', readiness: 'available', boundary: 'Read-only report directory' },
  { id: 'pipelock', displayName: 'Pipelock', evidenceType: 'Audit Packet v0', readiness: 'available', boundary: 'Read-only packets; trusted verification is explicit' },
  { id: 'rampart', displayName: 'RAMPART', evidenceType: 'Sanitized safety test results', readiness: 'available', boundary: 'Read-only sanitized JSON report; test execution remains external' },
  { id: 'kiji-privacy-proxy', displayName: 'Kiji Privacy Proxy', evidenceType: 'Sanitized privacy events', readiness: 'contract-review-required', boundary: 'Exclude sensitive mappings and payload content' },
  { id: 'aimap', displayName: 'AIMap', evidenceType: 'Authorized completed scan findings', readiness: 'available', boundary: 'Read-only export; scan initiation and scope remain external' },
]

export function emptyEvidenceSources(): EvidenceSourceState[] {
  return EVIDENCE_ADAPTER_CATALOG.filter((entry): entry is AdapterCatalogEntry & { id: EvidenceSourceId } => entry.readiness === 'available')
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      evidenceType: entry.evidenceType,
      health: 'not-configured',
      rejectedCount: 0,
    }))
}
