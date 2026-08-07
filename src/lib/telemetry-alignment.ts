import type { EvidenceEnvelopeV1 } from '../types.ts'
import { getInteroperabilityProfile } from './standards-profiles.ts'

export type TelemetryAlignmentProfileId =
  | 'otel-genai-metadata-preview-1'
  | 'openinference-metadata-preview-1'

export type TelemetryAlignmentState =
  | 'aligned'
  | 'omitted-private'
  | 'unsupported'
  | 'missing'
  | 'not-applicable'

export interface TelemetryAlignmentRowV1 {
  profileId: TelemetryAlignmentProfileId
  state: TelemetryAlignmentState
  sourceField: string
  targetField: string
  limitation: string
  sourceRef?: string
  value?: string | number | boolean
}

export interface TelemetryAlignmentProfileSummaryV1 {
  profileId: TelemetryAlignmentProfileId
  projectionVersion: 1
  upstreamVersion: string
  stability: 'development' | 'experimental'
  limitation: string
}

export interface TelemetryAlignmentPreviewV1 {
  schemaVersion: 1
  projectionVersion: 1
  inputKind: 'accepted-runtime-metadata'
  qualification: 'profile-qualified-metadata-alignment-only'
  acceptedCount: number
  rejectedCount: number
  profiles: TelemetryAlignmentProfileSummaryV1[]
  rows: TelemetryAlignmentRowV1[]
}

export type TelemetryAlignmentResultV1 =
  | { ok: true; preview: TelemetryAlignmentPreviewV1 }
  | { ok: false; errorCode: 'unsupported-profile' }

export const PROHIBITED_TELEMETRY_CONTENT_FAMILIES = Object.freeze([
  'prompt',
  'response',
  'reasoning',
  'tool-arguments',
  'tool-results',
  'document',
  'image',
  'url',
  'credential',
  'user-identity',
] as const)

const DEFAULT_PROFILES: readonly TelemetryAlignmentProfileId[] = Object.freeze([
  'openinference-metadata-preview-1',
  'otel-genai-metadata-preview-1',
])

const ALLOWED_ATTRIBUTE_KEYS = new Set([
  'runtime',
  'provider',
  'transport',
  'providerVersion',
  'eventType',
  'durationMs',
  'toolName',
  'approvalState',
  'outcome',
])
const RUNTIMES = new Set(['codex-cli', 'claude-code', 'pi'])
const PROVIDERS = new Set(['agent-beacon', 'codex-otel', 'claude-otel', 'pi-extension'])
const TRANSPORTS = new Set(['jsonl', 'otlp-http', 'otlp-grpc'])
const OUTCOMES = new Set(['succeeded', 'failed', 'blocked', 'observed'])
const APPROVAL_STATES = new Set(['approved', 'denied', 'not-required', 'unknown'])
const SAFE_TOKEN = /^[A-Za-z0-9._:+-]{1,80}$/u
const RAW_SHA256 = /^[0-9a-f]{64}$/u
const KNOWN_OPERATION = /^(?:agent|runtime|session|tool|turn)[.:_-][A-Za-z0-9._:-]{1,72}$/u

interface AcceptedRuntimeMetadata {
  sourceRef: string
  runtime: string
  provider: string
  transport: string
  providerVersion: string
  eventType: string
  outcome: string
  durationMs?: number
  toolName?: string
  approvalState?: string
}

export function projectTelemetryAlignment(
  evidence: readonly EvidenceEnvelopeV1[],
  requestedProfiles: readonly string[] = DEFAULT_PROFILES,
): TelemetryAlignmentResultV1 {
  const profileIds = normalizeProfiles(requestedProfiles)
  if (!profileIds) return { ok: false, errorCode: 'unsupported-profile' }

  const accepted: AcceptedRuntimeMetadata[] = []
  let rejectedCount = 0
  for (const candidate of evidence) {
    const metadata = acceptedRuntimeMetadata(candidate)
    if (metadata) accepted.push(metadata)
    else rejectedCount += 1
  }
  accepted.sort((left, right) => compareText(left.sourceRef, right.sourceRef))

  const rows: TelemetryAlignmentRowV1[] = []
  for (const profileId of profileIds) {
    rows.push(...privacyRows(profileId))
    if (accepted.length === 0) {
      rows.push({
        profileId,
        state: 'missing',
        sourceField: 'accepted-runtime-evidence',
        targetField: 'profile.metadata',
        limitation: 'No accepted runtime-telemetry evidence is available for this metadata-only preview.',
      })
      continue
    }
    for (const metadata of accepted) {
      rows.push(...alignmentRows(profileId, metadata))
    }
  }
  rows.sort(compareRows)

  return {
    ok: true,
    preview: {
      schemaVersion: 1,
      projectionVersion: 1,
      inputKind: 'accepted-runtime-metadata',
      qualification: 'profile-qualified-metadata-alignment-only',
      acceptedCount: accepted.length,
      rejectedCount,
      profiles: profileIds.map(profileSummary),
      rows,
    },
  }
}

function normalizeProfiles(
  requested: readonly string[],
): TelemetryAlignmentProfileId[] | undefined {
  const unique = [...new Set(requested)]
  if (unique.length === 0 || unique.some(profile => !DEFAULT_PROFILES.includes(
    profile as TelemetryAlignmentProfileId,
  ))) return undefined
  return unique.sort(compareText) as TelemetryAlignmentProfileId[]
}

function profileSummary(
  profileId: TelemetryAlignmentProfileId,
): TelemetryAlignmentProfileSummaryV1 {
  const profile = getInteroperabilityProfile(profileId)
  if (!profile || (profile.stability !== 'development' && profile.stability !== 'experimental')) {
    throw new Error('Pinned telemetry alignment profile is unavailable.')
  }
  return {
    profileId,
    projectionVersion: 1,
    upstreamVersion: profile.upstreamVersion,
    stability: profile.stability,
    limitation: 'Metadata alignment preview only; no telemetry emission, content projection, or implementation-wide compatibility claim.',
  }
}

function acceptedRuntimeMetadata(value: unknown): AcceptedRuntimeMetadata | undefined {
  if (!isPlainRecord(value)
    || value.schemaVersion !== 1
    || value.source !== 'runtime-telemetry'
    || typeof value.id !== 'string'
    || !RAW_SHA256.test(value.id)
    || !isPlainRecord(value.attributes)) return undefined

  const attributes = value.attributes
  if (Object.keys(attributes).some(key => !ALLOWED_ATTRIBUTE_KEYS.has(key))) return undefined
  const runtime = safeToken(attributes.runtime)
  const provider = safeToken(attributes.provider)
  const transport = safeToken(attributes.transport)
  const providerVersion = safeToken(attributes.providerVersion)
  const eventType = safeToken(attributes.eventType)
  const outcome = safeToken(attributes.outcome)
  if (!runtime || !provider || !transport || !providerVersion || !eventType || !outcome
    || !RUNTIMES.has(runtime)
    || !PROVIDERS.has(provider)
    || !TRANSPORTS.has(transport)
    || !OUTCOMES.has(outcome)
    || (runtime === 'pi') !== (provider === 'pi-extension')
    || (runtime === 'codex-cli' && provider === 'claude-otel')
    || (runtime === 'claude-code' && provider === 'codex-otel')) return undefined

  const durationMs = attributes.durationMs
  if (durationMs !== undefined
    && (typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs < 0)) {
    return undefined
  }
  const toolName = optionalSafeToken(attributes.toolName)
  if (attributes.toolName !== undefined && !toolName) return undefined
  const approvalState = optionalSafeToken(attributes.approvalState)
  if (attributes.approvalState !== undefined
    && (!approvalState || !APPROVAL_STATES.has(approvalState))) return undefined

  return {
    sourceRef: `sha256:${value.id}`,
    runtime,
    provider,
    transport,
    providerVersion,
    eventType,
    outcome,
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(toolName ? { toolName } : {}),
    ...(approvalState ? { approvalState } : {}),
  }
}

function alignmentRows(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
): TelemetryAlignmentRowV1[] {
  const rows: TelemetryAlignmentRowV1[] = [{
    profileId,
    state: 'aligned',
    sourceField: 'evidence.id',
    targetField: 'sancussight.source_ref.sha256',
    limitation: 'A safe hash reference identifies the accepted SancusSight envelope, not a trace or span.',
    sourceRef: metadata.sourceRef,
    value: metadata.sourceRef,
  }]

  if (profileId === 'otel-genai-metadata-preview-1') {
    rows.push(
      aligned(profileId, metadata, 'attributes.runtime', 'service.name', metadata.runtime),
      aligned(profileId, metadata, 'attributes.provider', 'gen_ai.provider.name', metadata.provider),
      aligned(profileId, metadata, 'attributes.transport', 'network.transport', metadata.transport),
      knownOperationRow(profileId, metadata, 'gen_ai.operation.name'),
      optionalRow(profileId, metadata, 'attributes.toolName', 'gen_ai.tool.name', metadata.toolName),
      unsupportedRow(profileId, metadata, 'attributes.outcome', 'sancussight.outcome'),
      optionalUnsupportedRow(profileId, metadata, 'attributes.durationMs', 'sancussight.duration_ms', metadata.durationMs),
      optionalUnsupportedRow(profileId, metadata, 'attributes.approvalState', 'sancussight.approval_state', metadata.approvalState),
    )
  } else {
    rows.push(
      aligned(profileId, metadata, 'attributes.provider', 'llm.provider', metadata.provider),
      aligned(profileId, metadata, 'attributes.runtime', 'sancussight.runtime', metadata.runtime),
      knownOperationRow(profileId, metadata, 'gen_ai.operation.name'),
      openInferenceKindRow(profileId, metadata),
      optionalRow(profileId, metadata, 'attributes.toolName', 'tool.name', metadata.toolName),
      unsupportedRow(profileId, metadata, 'attributes.outcome', 'sancussight.outcome'),
      optionalUnsupportedRow(profileId, metadata, 'attributes.durationMs', 'sancussight.duration_ms', metadata.durationMs),
      optionalUnsupportedRow(profileId, metadata, 'attributes.approvalState', 'sancussight.approval_state', metadata.approvalState),
    )
  }
  return rows
}

function aligned(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
  sourceField: string,
  targetField: string,
  value: string | number | boolean,
): TelemetryAlignmentRowV1 {
  return {
    profileId,
    state: 'aligned',
    sourceField,
    targetField,
    limitation: 'Compatible metadata meaning in this pinned preview profile only.',
    sourceRef: metadata.sourceRef,
    value,
  }
}

function knownOperationRow(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
  targetField: string,
): TelemetryAlignmentRowV1 {
  if (!KNOWN_OPERATION.test(metadata.eventType)) {
    return {
      profileId,
      state: 'unsupported',
      sourceField: 'attributes.eventType',
      targetField,
      limitation: 'The bounded event token is not in the fixed SancusSight operation-family map.',
      sourceRef: metadata.sourceRef,
    }
  }
  return aligned(
    profileId,
    metadata,
    'attributes.eventType',
    targetField,
    metadata.eventType,
  )
}

function openInferenceKindRow(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
): TelemetryAlignmentRowV1 {
  const value = metadata.toolName || metadata.eventType.startsWith('tool.')
    ? 'TOOL'
    : metadata.eventType.startsWith('agent.')
      ? 'AGENT'
      : metadata.eventType.startsWith('turn.') || metadata.eventType.startsWith('session.')
        ? 'CHAIN'
        : undefined
  if (!value) {
    return {
      profileId,
      state: 'unsupported',
      sourceField: 'attributes.eventType',
      targetField: 'openinference.span.kind',
      limitation: 'No fixed OpenInference operation-kind candidate exists for this metadata token.',
      sourceRef: metadata.sourceRef,
    }
  }
  return aligned(
    profileId,
    metadata,
    'attributes.eventType',
    'openinference.span.kind',
    value,
  )
}

function optionalRow(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
  sourceField: string,
  targetField: string,
  value: string | undefined,
): TelemetryAlignmentRowV1 {
  return value === undefined
    ? {
        profileId,
        state: 'missing',
        sourceField,
        targetField,
        limitation: 'The accepted envelope does not contain this optional metadata field.',
        sourceRef: metadata.sourceRef,
      }
    : aligned(profileId, metadata, sourceField, targetField, value)
}

function unsupportedRow(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
  sourceField: string,
  targetField: string,
): TelemetryAlignmentRowV1 {
  return {
    profileId,
    state: 'unsupported',
    sourceField,
    targetField,
    limitation: 'Retained as SancusSight qualification metadata and not projected as a standard attribute.',
    sourceRef: metadata.sourceRef,
  }
}

function optionalUnsupportedRow(
  profileId: TelemetryAlignmentProfileId,
  metadata: AcceptedRuntimeMetadata,
  sourceField: string,
  targetField: string,
  value: unknown,
): TelemetryAlignmentRowV1 {
  return value === undefined
    ? {
        profileId,
        state: 'not-applicable',
        sourceField,
        targetField,
        limitation: 'The optional SancusSight qualification field is absent.',
        sourceRef: metadata.sourceRef,
      }
    : unsupportedRow(profileId, metadata, sourceField, targetField)
}

function privacyRows(profileId: TelemetryAlignmentProfileId): TelemetryAlignmentRowV1[] {
  return PROHIBITED_TELEMETRY_CONTENT_FAMILIES.map(family => ({
    profileId,
    state: 'omitted-private',
    sourceField: `prohibited-content.${family}`,
    targetField: privateTarget(profileId, family),
    limitation: 'This content family is prohibited at the SancusSight boundary; no value is accepted or projected.',
  }))
}

function privateTarget(profileId: TelemetryAlignmentProfileId, family: string): string {
  const prefix = profileId === 'openinference-metadata-preview-1'
    ? 'openinference.content'
    : 'otel.gen_ai.content'
  return `${prefix}.${family}`
}

function safeToken(value: unknown): string | undefined {
  return typeof value === 'string' && SAFE_TOKEN.test(value) ? value : undefined
}

function optionalSafeToken(value: unknown): string | undefined {
  return value === undefined ? undefined : safeToken(value)
}

function compareRows(left: TelemetryAlignmentRowV1, right: TelemetryAlignmentRowV1): number {
  return compareText(left.profileId, right.profileId)
    || compareText(left.sourceField, right.sourceField)
    || compareText(left.sourceRef ?? '', right.sourceRef ?? '')
    || compareText(left.targetField, right.targetField)
    || compareText(left.state, right.state)
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype
}
