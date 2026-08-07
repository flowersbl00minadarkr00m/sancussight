import { contentHash, safeArtifactName } from '../envelope.ts'
import type { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import type { ArtifactCursor } from './types.ts'

export interface GovernanceCursorV1 {
  version: 1
  artifacts: Record<string, ArtifactCursor>
}

export function parseGovernanceCursor(cursor: { cursor: string } | undefined): GovernanceCursorV1 {
  if (!cursor?.cursor) return { version: 1, artifacts: {} }
  try {
    const value = JSON.parse(cursor.cursor) as GovernanceCursorV1
    return value.version === 1 && value.artifacts ? value : { version: 1, artifacts: {} }
  } catch { return { version: 1, artifacts: {} } }
}

export function checkpointForGovernance(source: string, cursor: GovernanceCursorV1, updatedAt: string) {
  return { source, cursor: JSON.stringify(cursor), updatedAt }
}

export async function governanceFiles(reader: ReadOnlyArtifactReader, path: string): Promise<string[]> {
  return reader.list(path, (name) => name.toLowerCase().endsWith('.json') || name.toLowerCase().endsWith('.jsonl'))
}

export async function readJsonDocuments(reader: ReadOnlyArtifactReader, path: string): Promise<{ path: string; name: string; hash: string; value: unknown }[]> {
  const documents: { path: string; name: string; hash: string; value: unknown }[] = []
  for (const file of await governanceFiles(reader, path)) {
    const metadata = await reader.inspect(file)
    const text = await reader.readText(file)
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (metadata.name.toLowerCase().endsWith('.jsonl')) {
      for (const line of lines) documents.push({ path: file, name: metadata.name, hash: contentHash(line), value: JSON.parse(line) })
    } else {
      documents.push({ path: file, name: metadata.name, hash: contentHash(text), value: JSON.parse(text) })
    }
  }
  return documents
}

export function safeExternalId(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim().replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 160)
  return normalized || fallback
}

export function rejection(id: string, source: string, artifactName: string, rejectedAt: string, errorCode: string, guidance: string) {
  return { id, source, artifactName: safeArtifactName(artifactName), rejectedAt, errorCode, guidance }
}

export function artifactCursor(metadata: { name: string; size: number; mtimeMs: number; identity: string }, hash: string, processedBytes?: number): ArtifactCursor {
  return { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash, ...(processedBytes === undefined ? {} : { processedBytes }) }
}
