import type {
  AssetKind,
  EvidencePacketQualificationV1,
  EvidencePacketV1,
} from '../types.ts'
import {
  assertEvidencePacket,
  canonicalizeEvidencePacketPayload,
  type EvidencePacketDownloadAnchor,
  type EvidencePacketSha256,
} from './evidence-packet.ts'

export const IN_TOTO_STATEMENT_TYPE_V1 = 'https://in-toto.io/Statement/v1' as const
export const SANCUSSIGHT_PREDICATE_TYPE_V1 =
  'https://sancussight.vercel.app/spec/evidence-packet-interoperability/v1' as const
export const SANCUSSIGHT_STATEMENT_PROFILE_V1 =
  'sancussight-in-toto-statement-1' as const

export interface SancusSightStatementV1 {
  _type: typeof IN_TOTO_STATEMENT_TYPE_V1
  subject: [{
    name: 'sancussight-evidence-packet'
    digest: {
      sha256: string
    }
  }]
  predicateType: typeof SANCUSSIGHT_PREDICATE_TYPE_V1
  predicate: {
    schemaVersion: 1
    packetType: 'sancussight-evidence-packet'
    packetDigest: string
    subjectKind: AssetKind
    qualification: EvidencePacketQualificationV1
    verificationCount: number
    missingEvidenceCount: number
    unsigned: true
    externallyVerified: false
  }
}

export interface BuildUnsignedInTotoStatementInput {
  packet: unknown
  exportedAt: string
  profileId?: string
  predicateType?: string
}

export type BuildUnsignedInTotoStatementResult =
  | {
      ok: true
      profileId: typeof SANCUSSIGHT_STATEMENT_PROFILE_V1
      exportedAt: string
      statement: SancusSightStatementV1
      canonicalJson: string
      confirmationDigest: string
    }
  | {
      ok: false
      errorCode:
        | 'unsupported-profile'
        | 'unsupported-predicate-type'
        | 'invalid-export-time'
        | 'invalid-packet'
        | 'invalid-digest'
        | 'crypto-unavailable'
        | 'hash-failed'
    }

export interface StatementDownloadRuntime {
  BlobCtor?: typeof Blob
  createObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
  createAnchor?: () => EvidencePacketDownloadAnchor
}

export type StatementDownloadResult =
  | {
      ok: true
      filename: string
      confirmationDigest: string
    }
  | {
      ok: false
      errorCode:
        | 'invalid-statement'
        | 'invalid-digest'
        | 'crypto-unavailable'
        | 'hash-failed'
        | 'download-unavailable'
        | 'download-failed'
    }

const RAW_SHA256 = /^[0-9a-f]{64}$/u
const ASSET_KINDS = new Set<AssetKind>([
  'context',
  'skill',
  'prompt-template',
  'intent-context',
  'workflow',
  'control',
  'evaluation',
  'ontology-object',
  'ontology-link',
  'ontology-action',
  'schema',
  'evidence-contract',
  'consumer-adapter',
  'candidate-tool',
  'accepted-asset',
])
const QUALIFICATIONS = new Set<EvidencePacketQualificationV1>([
  'recorded',
  'portable-projection',
  'deterministic',
  'manual',
  'missing',
])

export async function buildUnsignedInTotoStatement(
  input: BuildUnsignedInTotoStatementInput,
  sha256: EvidencePacketSha256,
): Promise<BuildUnsignedInTotoStatementResult> {
  if ((input.profileId ?? SANCUSSIGHT_STATEMENT_PROFILE_V1)
    !== SANCUSSIGHT_STATEMENT_PROFILE_V1) {
    return { ok: false, errorCode: 'unsupported-profile' }
  }
  if ((input.predicateType ?? SANCUSSIGHT_PREDICATE_TYPE_V1)
    !== SANCUSSIGHT_PREDICATE_TYPE_V1) {
    return { ok: false, errorCode: 'unsupported-predicate-type' }
  }
  if (!isCanonicalIsoTimestamp(input.exportedAt)) {
    return { ok: false, errorCode: 'invalid-export-time' }
  }

  try {
    await assertEvidencePacket(input.packet, sha256)
  } catch (error) {
    return { ok: false, errorCode: hashErrorCode(error, 'invalid-packet') }
  }
  const packet = input.packet as EvidencePacketV1
  const packetDigest = packet.packetId.slice('sha256:'.length)
  const statement: SancusSightStatementV1 = {
    _type: IN_TOTO_STATEMENT_TYPE_V1,
    subject: [{
      name: 'sancussight-evidence-packet',
      digest: { sha256: packetDigest },
    }],
    predicateType: SANCUSSIGHT_PREDICATE_TYPE_V1,
    predicate: {
      schemaVersion: 1,
      packetType: 'sancussight-evidence-packet',
      packetDigest,
      subjectKind: packet.subject.kind,
      qualification: packet.qualification,
      verificationCount: packet.verification.length,
      missingEvidenceCount: packet.missingEvidence.length,
      unsigned: true,
      externallyVerified: false,
    },
  }
  if (!validateUnsignedInTotoStatement(statement)) {
    return { ok: false, errorCode: 'invalid-packet' }
  }

  const canonicalJson = canonicalizeEvidencePacketPayload(statement)
  let digest: string
  try {
    digest = await sha256(canonicalJson)
  } catch (error) {
    return { ok: false, errorCode: hashErrorCode(error, 'hash-failed') }
  }
  if (!RAW_SHA256.test(digest)) return { ok: false, errorCode: 'invalid-digest' }

  return {
    ok: true,
    profileId: SANCUSSIGHT_STATEMENT_PROFILE_V1,
    exportedAt: input.exportedAt,
    statement,
    canonicalJson,
    confirmationDigest: `sha256:${digest}`,
  }
}

export function validateUnsignedInTotoStatement(
  value: unknown,
): value is SancusSightStatementV1 {
  if (!hasExactKeys(value, ['_type', 'subject', 'predicateType', 'predicate'])
    || value._type !== IN_TOTO_STATEMENT_TYPE_V1
    || value.predicateType !== SANCUSSIGHT_PREDICATE_TYPE_V1
    || !Array.isArray(value.subject)
    || value.subject.length !== 1
    || !hasExactKeys(value.subject[0], ['name', 'digest'])
    || value.subject[0].name !== 'sancussight-evidence-packet'
    || !hasExactKeys(value.subject[0].digest, ['sha256'])
    || typeof value.subject[0].digest.sha256 !== 'string'
    || !RAW_SHA256.test(value.subject[0].digest.sha256)
    || !hasExactKeys(value.predicate, [
      'schemaVersion',
      'packetType',
      'packetDigest',
      'subjectKind',
      'qualification',
      'verificationCount',
      'missingEvidenceCount',
      'unsigned',
      'externallyVerified',
    ])) return false

  const predicate = value.predicate
  return predicate.schemaVersion === 1
    && predicate.packetType === 'sancussight-evidence-packet'
    && typeof predicate.packetDigest === 'string'
    && RAW_SHA256.test(predicate.packetDigest)
    && predicate.packetDigest === value.subject[0].digest.sha256
    && typeof predicate.subjectKind === 'string'
    && ASSET_KINDS.has(predicate.subjectKind as AssetKind)
    && typeof predicate.qualification === 'string'
    && QUALIFICATIONS.has(predicate.qualification as EvidencePacketQualificationV1)
    && isNonNegativeInteger(predicate.verificationCount)
    && isNonNegativeInteger(predicate.missingEvidenceCount)
    && predicate.unsigned === true
    && predicate.externallyVerified === false
}

export async function downloadUnsignedInTotoStatement(
  projection: unknown,
  sha256: EvidencePacketSha256,
  runtime: StatementDownloadRuntime = {},
): Promise<StatementDownloadResult> {
  if (!isBuiltProjection(projection)) {
    return { ok: false, errorCode: 'invalid-statement' }
  }
  const statement = projection.statement
  const canonicalJson = canonicalizeEvidencePacketPayload(statement)
  if (projection.canonicalJson !== canonicalJson) {
    return { ok: false, errorCode: 'invalid-statement' }
  }
  let digest: string
  try {
    digest = await sha256(canonicalJson)
  } catch (error) {
    return { ok: false, errorCode: hashErrorCode(error, 'hash-failed') }
  }
  if (!RAW_SHA256.test(digest)) return { ok: false, errorCode: 'invalid-digest' }
  if (projection.confirmationDigest !== `sha256:${digest}`) {
    return { ok: false, errorCode: 'invalid-statement' }
  }

  const BlobCtor = runtime.BlobCtor ?? globalThis.Blob
  const createObjectURL = runtime.createObjectURL
    ?? globalThis.URL?.createObjectURL?.bind(globalThis.URL)
  const revokeObjectURL = runtime.revokeObjectURL
    ?? globalThis.URL?.revokeObjectURL?.bind(globalThis.URL)
  const createAnchor = runtime.createAnchor ?? (() => {
    if (typeof document === 'undefined') {
      throw new Error('Browser download capability is unavailable.')
    }
    return document.createElement('a')
  })
  if (!BlobCtor || !createObjectURL || !revokeObjectURL || !createAnchor) {
    return { ok: false, errorCode: 'download-unavailable' }
  }

  let objectUrl: string | undefined
  let anchor: EvidencePacketDownloadAnchor | undefined
  try {
    const blob = new BlobCtor([canonicalJson], {
      type: 'application/json;charset=utf-8',
    })
    objectUrl = createObjectURL(blob)
    anchor = createAnchor()
    const filename = `sancussight-unsigned-statement-${digest.slice(0, 12)}.json`
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    return {
      ok: true,
      filename,
      confirmationDigest: `sha256:${digest}`,
    }
  } catch {
    return { ok: false, errorCode: 'download-failed' }
  } finally {
    anchor?.remove?.()
    if (objectUrl !== undefined) revokeObjectURL(objectUrl)
  }
}

function hashErrorCode(
  error: unknown,
  fallback: 'invalid-packet',
): 'invalid-packet' | 'invalid-digest' | 'crypto-unavailable'
function hashErrorCode(
  error: unknown,
  fallback: 'hash-failed',
): 'invalid-digest' | 'crypto-unavailable' | 'hash-failed'
function hashErrorCode(
  error: unknown,
  fallback: 'invalid-packet' | 'hash-failed',
): 'invalid-packet' | 'invalid-digest' | 'crypto-unavailable' | 'hash-failed' {
  const message = error instanceof Error ? error.message : ''
  if (/Web Crypto|SHA-256 is unavailable/iu.test(message)) return 'crypto-unavailable'
  if (/64 lowercase hexadecimal|digest adapter|invalid digest/iu.test(message)) {
    return 'invalid-digest'
  }
  return fallback
}

function isCanonicalIsoTimestamp(value: string): boolean {
  if (typeof value !== 'string') return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isBuiltProjection(value: unknown): value is Extract<
  BuildUnsignedInTotoStatementResult,
  { ok: true }
> {
  return hasExactKeys(value, [
    'ok',
    'profileId',
    'exportedAt',
    'statement',
    'canonicalJson',
    'confirmationDigest',
  ])
    && value.ok === true
    && value.profileId === SANCUSSIGHT_STATEMENT_PROFILE_V1
    && typeof value.exportedAt === 'string'
    && isCanonicalIsoTimestamp(value.exportedAt)
    && validateUnsignedInTotoStatement(value.statement)
    && typeof value.canonicalJson === 'string'
    && typeof value.confirmationDigest === 'string'
    && /^sha256:[0-9a-f]{64}$/u.test(value.confirmationDigest)
}

function hasExactKeys(
  value: unknown,
  expected: readonly string[],
): value is Record<string, unknown> {
  return isPlainRecord(value)
    && Object.keys(value).length === expected.length
    && expected.every(key => Object.hasOwn(value, key))
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype
}
