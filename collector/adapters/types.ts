import type { EvidenceEnvelopeV1, EvidenceSourceId } from '../../src/types.ts'
import type { RejectedEvidence, SourceCheckpoint } from '../evidence-store.ts'

export interface AdapterCollection {
  accepted: EvidenceEnvelopeV1[]
  rejected: RejectedEvidence[]
  checkpoint: SourceCheckpoint
  lag: number
}

export interface EvidenceAdapter {
  readonly id: EvidenceSourceId
  validate(path: string): Promise<void>
  collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection>
}

export interface ArtifactCursor {
  size: number
  mtimeMs: number
  identity: string
  contentHash: string
  processedBytes?: number
}

export interface AdapterCursorV1 {
  version: 1
  artifacts: Record<string, ArtifactCursor>
}

export function parseAdapterCursor(checkpoint: SourceCheckpoint | undefined): AdapterCursorV1 {
  if (!checkpoint?.cursor) return { version: 1, artifacts: {} }
  try {
    const value = JSON.parse(checkpoint.cursor) as AdapterCursorV1
    return value.version === 1 && value.artifacts ? value : { version: 1, artifacts: {} }
  } catch {
    return { version: 1, artifacts: {} }
  }
}

export function checkpointFor(source: EvidenceSourceId, cursor: AdapterCursorV1, updatedAt: string): SourceCheckpoint {
  return { source, cursor: JSON.stringify(cursor), updatedAt }
}
