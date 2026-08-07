import { createHash } from 'node:crypto'
import type {
  EvidenceEnvelopeV1,
  EvidenceOutcome,
  OperationalProvenance,
  EvidenceSourceId,
  EvidenceSubjectType,
  EvidenceVerification,
} from '../src/types.ts'

const MAX_SUMMARY_LENGTH = 320
const MAX_ATTRIBUTE_COUNT = 32
const MAX_ATTRIBUTE_KEY_LENGTH = 64
const MAX_ATTRIBUTE_VALUE_LENGTH = 240

export interface EvidenceEnvelopeInput {
  source: EvidenceSourceId
  evidenceKind: string
  observedAt: string
  importedAt: string
  subject: {
    stableId?: string
    externalId: string
    type: EvidenceSubjectType
  }
  outcome: EvidenceOutcome
  summary: string
  provenance: {
    artifactName: string
    artifactContentHash: string
    sourceRecordId?: string
    parserId: string
    parserVersion: string
    verification: EvidenceVerification
  }
  operational?: OperationalProvenance
  attributes?: Record<string, unknown>
  allowedAttributeKeys?: readonly string[]
}

export function createEvidenceEnvelope(input: EvidenceEnvelopeInput): EvidenceEnvelopeV1 {
  assertIsoDate(input.observedAt, 'observedAt')
  assertIsoDate(input.importedAt, 'importedAt')

  const parserMajor = parserMajorVersion(input.provenance.parserVersion)
  const canonicalRecordIdentity = input.provenance.sourceRecordId ?? canonicalJson({
    evidenceKind: input.evidenceKind,
    observedAt: input.observedAt,
    subject: input.subject,
    outcome: input.outcome,
    summary: input.summary,
    attributes: filterAttributes(input.attributes, input.allowedAttributeKeys),
    operational: input.operational,
  })
  const id = sha256([
    input.source,
    input.provenance.artifactContentHash,
    canonicalRecordIdentity,
    `${input.provenance.parserId}@${parserMajor}`,
  ].join('\n'))

  return {
    schemaVersion: 1,
    id,
    source: input.source,
    evidenceKind: boundedText(input.evidenceKind, 80, 'evidenceKind'),
    observedAt: input.observedAt,
    importedAt: input.importedAt,
    subject: {
      ...(input.subject.stableId ? { stableId: boundedText(input.subject.stableId, 160, 'stableId') } : {}),
      externalId: boundedText(input.subject.externalId, 160, 'externalId'),
      type: input.subject.type,
    },
    outcome: input.outcome,
    summary: boundedText(input.summary, MAX_SUMMARY_LENGTH, 'summary'),
    provenance: {
      artifactName: safeArtifactName(input.provenance.artifactName),
      artifactContentHash: requireSha256(input.provenance.artifactContentHash),
      ...(input.provenance.sourceRecordId
        ? { sourceRecordId: boundedText(input.provenance.sourceRecordId, 160, 'sourceRecordId') }
        : {}),
      parserId: boundedText(input.provenance.parserId, 80, 'parserId'),
      parserVersion: boundedText(input.provenance.parserVersion, 32, 'parserVersion'),
      verification: input.provenance.verification,
    },
    attributes: filterAttributes(input.attributes, input.allowedAttributeKeys),
    ...(input.operational ? { operational: normalizeOperationalProvenance(input.operational) } : {}),
  }
}

export function validateEvidenceEnvelope(value: unknown): value is EvidenceEnvelopeV1 {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<EvidenceEnvelopeV1>
  return envelope.schemaVersion === 1
    && typeof envelope.id === 'string'
    && /^[a-f0-9]{64}$/.test(envelope.id)
    && typeof envelope.source === 'string'
    && typeof envelope.evidenceKind === 'string'
    && typeof envelope.observedAt === 'string'
    && typeof envelope.importedAt === 'string'
    && !!envelope.subject
    && typeof envelope.subject.externalId === 'string'
    && !!envelope.provenance
    && /^[a-f0-9]{64}$/.test(envelope.provenance.artifactContentHash)
    && !!envelope.attributes
    && typeof envelope.attributes === 'object'
    && (!envelope.operational || isOperationalProvenance(envelope.operational))
}

export function contentHash(content: string | Uint8Array): string {
  return sha256(content)
}

export function safeArtifactName(value: string): string {
  const name = value.replaceAll('\\', '/').split('/').filter(Boolean).at(-1) ?? 'evidence'
  return boundedText(name.replace(/[\u0000-\u001f\u007f]/g, ''), 160, 'artifactName')
}

function filterAttributes(
  attributes: Record<string, unknown> | undefined,
  allowedKeys: readonly string[] | undefined,
): Record<string, string | number | boolean> {
  if (!attributes || !allowedKeys?.length) return {}
  const allowed = new Set(allowedKeys)
  const entries = Object.entries(attributes)
    .filter((entry): entry is [string, string | number | boolean] => allowed.has(entry[0]) && isAttributeValue(entry[1]))
    .slice(0, MAX_ATTRIBUTE_COUNT)
    .map(([key, value]) => [
      boundedText(key, MAX_ATTRIBUTE_KEY_LENGTH, 'attribute key'),
      typeof value === 'string' ? value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH) : value,
    ] as const)
  return Object.fromEntries(entries)
}

function isAttributeValue(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))
}

function boundedText(value: string, maxLength: number, field: string): string {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${field} is required.`)
  return normalized.slice(0, maxLength)
}

function requireSha256(value: string): string {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('artifactContentHash must be a SHA-256 hex digest.')
  return value
}

function parserMajorVersion(value: string): string {
  const major = /^(?:v)?(\d+)/.exec(value)?.[1]
  if (!major) throw new Error('parserVersion must begin with a numeric major version.')
  return major
}

function normalizeOperationalProvenance(value: OperationalProvenance): OperationalProvenance {
  if (!isOperationalProvenance(value)) throw new Error('Operational provenance is incomplete or invalid.')
  return {
    qualification: value.qualification,
    sourceVersion: boundedText(value.sourceVersion, 80, 'sourceVersion'),
    runId: boundedText(value.runId, 160, 'runId'),
    targetId: boundedText(value.targetId, 160, 'targetId'),
    contractVersion: boundedText(value.contractVersion, 80, 'contractVersion'),
    ...(value.configurationHash ? { configurationHash: requireSha256(value.configurationHash) } : {}),
    ...(value.workerRemitHash ? { workerRemitHash: requireSha256(value.workerRemitHash) } : {}),
    ...(value.runtime ? { runtime: value.runtime } : {}),
    ...(value.telemetryProvider ? { telemetryProvider: value.telemetryProvider } : {}),
    ...(value.telemetryTransport ? { telemetryTransport: value.telemetryTransport } : {}),
    ...(value.telemetryProviderVersion ? { telemetryProviderVersion: boundedText(value.telemetryProviderVersion, 80, 'telemetryProviderVersion') } : {}),
  }
}

function isOperationalProvenance(value: unknown): value is OperationalProvenance {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<OperationalProvenance>
  return ['operational', 'isolated-qa', 'demo', 'fixture', 'replay', 'manual'].includes(String(item.qualification))
    && typeof item.sourceVersion === 'string' && item.sourceVersion.length > 0
    && typeof item.runId === 'string' && item.runId.length > 0
    && typeof item.targetId === 'string' && item.targetId.length > 0
    && typeof item.contractVersion === 'string' && item.contractVersion.length > 0
    && (!item.configurationHash || /^[a-f0-9]{64}$/.test(item.configurationHash))
    && (!item.workerRemitHash || /^[a-f0-9]{64}$/.test(item.workerRemitHash))
    && (!item.runtime || item.runtime === 'codex-cli' || item.runtime === 'claude-code' || item.runtime === 'pi')
    && (!item.telemetryProvider || ['agent-beacon', 'codex-otel', 'claude-otel', 'pi-extension'].includes(item.telemetryProvider))
    && (!item.telemetryTransport || ['jsonl', 'otlp-http', 'otlp-grpc'].includes(item.telemetryTransport))
    && (!item.telemetryProviderVersion || (typeof item.telemetryProviderVersion === 'string' && item.telemetryProviderVersion.length <= 80))
}

function assertIsoDate(value: string, field: string): void {
  if (Number.isNaN(Date.parse(value))) throw new Error(`${field} must be an ISO date.`)
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}
