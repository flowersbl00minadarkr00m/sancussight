import {
  assertNoProhibitedKeys,
  type Sensitivity,
  type SkipCategory,
  type SkippedItem,
} from '../contracts.ts'

export interface MetadataClassification {
  include: boolean
  sensitivity: Sensitivity
  skipped?: SkippedItem
}

function boundedIdentifier(value: unknown): string {
  if (typeof value !== 'string') return 'redacted-item'
  const safe = value.trim().replace(/[^a-zA-Z0-9._:-]/g, '-').slice(0, 80)
  return safe || 'redacted-item'
}

function skipped(category: SkipCategory, identifier: unknown, guidance: string): MetadataClassification {
  return {
    include: false,
    sensitivity: category === 'sensitive' ? 'sensitive' : 'internal',
    skipped: {
      sourceType: 'project-registry',
      boundedIdentifier: boundedIdentifier(identifier),
      category,
      guidance,
    },
  }
}

export function classifyMetadata(metadata: unknown, identifier?: unknown): MetadataClassification {
  try {
    assertNoProhibitedKeys(metadata)
  } catch {
    return skipped('sensitive', identifier, 'Sensitive or credential-adjacent metadata was excluded.')
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return skipped('unsupported', identifier, 'The source record is not a supported metadata object.')
  }

  const record = metadata as Record<string, unknown>
  if (record.sensitivity === 'sensitive' || record.visibility === 'secret') {
    return skipped('sensitive', identifier, 'Sensitive metadata requires an explicit safe source contract.')
  }
  if (record.sensitivity === 'public' || record.visibility === 'public') {
    return { include: true, sensitivity: 'public' }
  }
  return { include: true, sensitivity: 'internal' }
}

export function classifyReadFailure(identifier: unknown, category: Extract<SkipCategory, 'unreadable' | 'unsupported' | 'out-of-scope'>, guidance: string): MetadataClassification {
  return skipped(category, identifier, guidance)
}
