import type {
  AssetKind,
  AssetVersionComparisonV1,
  AssetVersionV1,
  EvidencePacketDecisionV1,
  EvidencePacketMissingV1,
  EvidencePacketV1,
  EvidencePacketVerificationV1,
  ExitTestResult,
  SignalStatus,
} from '../types.ts'
import {
  compareAssetVersions,
  isCanonicalIsoDate,
  isCanonicalIsoTimestamp,
  verifyAssetVersionIdentity,
} from './asset-versions.ts'

export const EVIDENCE_PACKET_LIMITS = Object.freeze({
  textLength: 160,
  verificationRefs: 32,
  humanDecisions: 32,
  missingEvidence: 32,
  comparisonItems: 100,
  exitDrillItems: 100,
})

export type EvidencePacketSha256 = (input: string) => Promise<string>

export interface EvidencePacketDecisionInput {
  kind: string
  status: string
  recordedAt: string
  decisionRefHash: string
}

export interface EvidencePacketMissingInput {
  kind: string
  referenceHash?: string
}

export interface BuildAssetVersionEvidencePacketInput {
  assetId: string
  assetKind: AssetKind
  version: AssetVersionV1
  previousVersion?: AssetVersionV1
  exportedAt: string
  humanDecisions?: readonly EvidencePacketDecisionInput[]
  missingEvidence?: readonly EvidencePacketMissingInput[]
}

export interface BuildExitDrillEvidencePacketInput {
  result: ExitTestResult
  exportedAt: string
  observedAt: string
  sourceRefHashes?: readonly string[]
  humanDecisions?: readonly EvidencePacketDecisionInput[]
  missingEvidence?: readonly EvidencePacketMissingInput[]
}

export interface EvidencePacketDownloadRuntime {
  BlobCtor?: typeof Blob
  createObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
  createAnchor?: () => EvidencePacketDownloadAnchor
}

export interface EvidencePacketDownloadAnchor {
  href: string
  download: string
  click: () => void
  remove?: () => void
}

export type EvidencePacketDownloadResult =
  | { ok: true; filename: string }
  | { ok: false; error: string }

const PACKET_ID_PATTERN = /^sha256:[0-9a-f]{64}$/
const RAW_SHA256_PATTERN = /^[0-9a-f]{64}$/
const VERSION_ID_PATTERN = /^(?:av1|av1p)_[0-9a-f]{32}$/
const RECORDED_VERSION_ID_PATTERN = /^av1_[0-9a-f]{32}$/
const PORTABLE_VERSION_ID_PATTERN = /^av1p_[0-9a-f]{32}$/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/u
const ABSOLUTE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|(?:^|\s)\/(?:Users|home|private|var|etc|tmp)\/|\.\.[\\/])/iu
const URL_PATTERN = /(?:https?|file):\/\/|www\./iu
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu
const PRIVATE_KEY_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/u
const CREDENTIAL_VALUE_PATTERN = /(?:\b(?:password|passwd|api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|client[-_ ]?secret)\s*[:=]|\bbearer\s+[A-Za-z0-9._~+/-]{8,}|\bsk[-_][A-Za-z0-9]{8,})/iu
const RAW_CONTENT_PATTERN = /\braw\s+(?:prompt|response|finding|evidence|registry)\b|(?:prompt|response|finding)\s*:\s*\S/iu

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
const SIGNAL_STATUSES = new Set<SignalStatus>(['pass', 'warn', 'fail', 'accepted', 'unknown'])
const EXIT_ITEM_STATUSES = new Set(['ok', 'unverified', 'missing', 'locked'])
const EXIT_VERDICTS = new Set(['survives', 'degrades', 'breaks'])
const QUALIFICATIONS = new Set([
  'recorded',
  'portable-projection',
  'deterministic',
  'manual',
  'missing',
])
const COMPARISON_STATES = new Set(['regression', 'recovery', 'changed', 'unchanged'])
const COMPARISON_BASES = new Set(['recorded-fact', 'deterministic-check'])
const PROHIBITED_KEYS = new Set([
  'prompt',
  'prompts',
  'response',
  'responses',
  'credential',
  'credentials',
  'secret',
  'secrets',
  'token',
  'tokens',
  'privatekey',
  'path',
  'filepath',
  'location',
  'owner',
  'attributes',
  'finding',
  'findings',
  'registry',
  'registries',
  'payload',
  'rawcontent',
  'workspacecontent',
  'toolarguments',
  'toolresults',
])

export async function buildAssetVersionEvidencePacket(
  input: BuildAssetVersionEvidencePacketInput,
  sha256: EvidencePacketSha256,
): Promise<EvidencePacketV1> {
  if (!isAssetVersion(input.version)) throw new Error('Asset version packet input is invalid.')
  if (!await verifyAssetVersionIdentity(input.version, sha256)) {
    throw new Error('Asset version identity verification failed.')
  }
  if (input.previousVersion) {
    if (!isAssetVersion(input.previousVersion)
      || !await verifyAssetVersionIdentity(input.previousVersion, sha256)) {
      throw new Error('Previous asset version identity verification failed.')
    }
  }
  const comparison: AssetVersionComparisonV1 = input.previousVersion
    ? compareAssetVersions(input.version, input.previousVersion)
    : {
        state: 'no-previous-version',
        currentVersionId: input.version.id,
        items: [],
      }

  const subjectHash = await hashReference(
    `asset-subject\n${input.assetKind}\n${input.assetId}`,
    sha256,
  )
  const snapshotHash = await hashReference(
    canonicalizeEvidencePacketPayload(input.version.snapshot),
    sha256,
  )
  const packet: EvidencePacketV1 = {
    schemaVersion: 1,
    packetType: 'sancussight-evidence-packet',
    packetId: placeholderPacketId(),
    exportedAt: input.exportedAt,
    subject: {
      kind: input.assetKind,
      subjectHash,
    },
    predicate: {
      kind: 'asset-version',
      versionId: input.version.id,
      recordedAt: input.version.recordedAt,
      snapshotHash,
      ...(input.version.qualification === 'portable-projection'
        ? { derivedFromVersionId: input.version.derivedFromVersionId }
        : {}),
    },
    producer: {
      name: 'SancusSight',
      contractVersion: 1,
    },
    run: {
      observedAt: input.version.recordedAt,
      sourceRefHashes: normalizeHashReferences(input.version.sourceRefHashes),
    },
    qualification: input.version.qualification ?? 'recorded',
    verification: projectVerification(input.version),
    humanDecisions: projectHumanDecisions(input.humanDecisions ?? []),
    missingEvidence: projectMissingEvidence(input.missingEvidence ?? []),
    comparison,
  }
  return finalizePacket(packet, sha256)
}

export async function buildExitDrillEvidencePacket(
  input: BuildExitDrillEvidencePacketInput,
  sha256: EvidencePacketSha256,
): Promise<EvidencePacketV1> {
  if (!isIsoTimestamp(input.observedAt)) {
    throw new Error('Exit Drill observedAt must be a valid ISO timestamp.')
  }
  if (!isExitTestResult(input.result)) throw new Error('Exit Drill packet input is invalid.')
  if (input.result.items.length > EVIDENCE_PACKET_LIMITS.exitDrillItems) {
    throw new Error('Exit Drill items exceed the packet limit.')
  }

  const subjectHash = await hashReference(`exit-drill-subject\n${input.result.workflowId}`, sha256)
  const items = await Promise.all(input.result.items.map(async (item) => ({
    subjectHash: await hashReference(`exit-drill-item\n${item.assetId}`, sha256),
    status: item.status,
  })))
  items.sort((left, right) => (
    compareText(left.subjectHash, right.subjectHash)
    || compareText(left.status, right.status)
  ))

  const packet: EvidencePacketV1 = {
    schemaVersion: 1,
    packetType: 'sancussight-evidence-packet',
    packetId: placeholderPacketId(),
    exportedAt: input.exportedAt,
    subject: {
      kind: 'workflow',
      subjectHash,
    },
    predicate: {
      kind: 'exit-drill',
      targetPlatform: input.result.targetPlatform,
      verdict: input.result.verdict,
      items,
    },
    producer: {
      name: 'SancusSight',
      contractVersion: 1,
    },
    run: {
      observedAt: input.observedAt,
      sourceRefHashes: normalizeHashReferences(input.sourceRefHashes ?? []),
    },
    qualification: 'deterministic',
    verification: [],
    humanDecisions: projectHumanDecisions(input.humanDecisions ?? []),
    missingEvidence: projectMissingEvidence(input.missingEvidence ?? []),
  }
  return finalizePacket(packet, sha256)
}

export async function computeEvidencePacketId(
  packet: EvidencePacketV1,
  sha256: EvidencePacketSha256,
): Promise<string> {
  const digest = await sha256(canonicalizeEvidencePacketPayload(packetDigestPayload(packet)))
  if (!RAW_SHA256_PATTERN.test(digest)) {
    throw new Error('SHA-256 adapter must return 64 lowercase hexadecimal characters.')
  }
  return `sha256:${digest}`
}

export async function assertEvidencePacket(
  value: unknown,
  sha256: EvidencePacketSha256,
): Promise<void> {
  if (!isEvidencePacketShape(value)) throw new Error('Evidence Packet shape or content is invalid.')
  const expected = await computeEvidencePacketId(value, sha256)
  if (value.packetId !== expected) throw new Error('Evidence Packet digest does not match its payload.')
}

export async function validateEvidencePacket(
  value: unknown,
  sha256: EvidencePacketSha256,
): Promise<boolean> {
  try {
    await assertEvidencePacket(value, sha256)
    return true
  } catch {
    return false
  }
}

export function canonicalizeEvidencePacketPayload(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Canonical JSON cannot contain a non-finite number.')
    }
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeEvidencePacketPayload).join(',')}]`
  }
  if (isPlainRecord(value)) {
    const keys = Object.keys(value).sort(compareText)
    return `{${keys.map((key) => (
      `${JSON.stringify(key)}:${canonicalizeEvidencePacketPayload(value[key])}`
    )).join(',')}}`
  }
  throw new Error('Canonical JSON supports only null, finite numbers, strings, booleans, arrays, and plain objects.')
}

export async function browserSha256(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle || typeof TextEncoder === 'undefined') {
    throw new Error('Web Crypto SHA-256 is unavailable.')
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function downloadEvidencePacket(
  packet: unknown,
  sha256: EvidencePacketSha256,
  runtime: EvidencePacketDownloadRuntime = {},
): Promise<EvidencePacketDownloadResult> {
  try {
    await assertEvidencePacket(packet, sha256)
  } catch (error) {
    return { ok: false, error: errorMessage(error, 'Evidence Packet validation failed.') }
  }
  const validatedPacket = packet as EvidencePacketV1

  const BlobCtor = runtime.BlobCtor ?? globalThis.Blob
  const createObjectURL = runtime.createObjectURL ?? globalThis.URL?.createObjectURL?.bind(globalThis.URL)
  const revokeObjectURL = runtime.revokeObjectURL ?? globalThis.URL?.revokeObjectURL?.bind(globalThis.URL)
  const createAnchor = runtime.createAnchor ?? (() => {
    if (typeof document === 'undefined') throw new Error('Browser download capability is unavailable.')
    return document.createElement('a')
  })
  if (!BlobCtor || !createObjectURL || !revokeObjectURL || !createAnchor) {
    return { ok: false, error: 'Browser Blob download capability is unavailable.' }
  }

  let objectUrl: string | undefined
  let anchor: EvidencePacketDownloadAnchor | undefined
  try {
    const canonicalPacket = canonicalizeEvidencePacketPayload(validatedPacket)
    const blob = new BlobCtor([canonicalPacket], { type: 'application/json;charset=utf-8' })
    objectUrl = createObjectURL(blob)
    anchor = createAnchor()
    const kind = validatedPacket.predicate.kind === 'asset-version' ? 'asset-version' : 'exit-drill'
    const filename = `sancussight-evidence-packet-${kind}-${validatedPacket.packetId.slice(7, 19)}.json`
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    return { ok: true, filename }
  } catch (error) {
    return { ok: false, error: errorMessage(error, 'Evidence Packet download failed.') }
  } finally {
    anchor?.remove?.()
    if (objectUrl !== undefined) revokeObjectURL(objectUrl)
  }
}

async function finalizePacket(
  packet: EvidencePacketV1,
  sha256: EvidencePacketSha256,
): Promise<EvidencePacketV1> {
  if (!isEvidencePacketShape(packet)) throw new Error('Evidence Packet projection is unsafe or invalid.')
  const finalized = {
    ...packet,
    packetId: await computeEvidencePacketId(packet, sha256),
  }
  await assertEvidencePacket(finalized, sha256)
  return finalized
}

function packetDigestPayload(packet: EvidencePacketV1): Omit<EvidencePacketV1, 'packetId' | 'exportedAt'> {
  const {
    packetId: _packetId,
    exportedAt: _exportedAt,
    ...payload
  } = packet
  return payload
}

function projectVerification(version: AssetVersionV1): EvidencePacketVerificationV1[] {
  if (version.verificationRefs.length > EVIDENCE_PACKET_LIMITS.verificationRefs) {
    throw new Error('Verification references exceed the packet limit.')
  }
  return version.verificationRefs.map((reference) => ({
    checkId: reference.checkId,
    resultId: reference.resultId,
    status: reference.status,
    evaluatedAt: reference.evaluatedAt,
    ...(reference.safeEvidenceHash
      ? { safeEvidenceHash: normalizeHashReference(reference.safeEvidenceHash) }
      : {}),
  }))
}

function projectHumanDecisions(
  decisions: readonly EvidencePacketDecisionInput[],
): EvidencePacketDecisionV1[] {
  if (decisions.length > EVIDENCE_PACKET_LIMITS.humanDecisions) {
    throw new Error('Human decisions exceed the packet limit.')
  }
  return decisions.map((decision) => ({
    kind: decision.kind,
    status: decision.status,
    recordedAt: decision.recordedAt,
    decisionRefHash: normalizeHashReference(decision.decisionRefHash),
  })).sort((left, right) => compareText(
    `${left.kind}:${left.status}:${left.recordedAt}:${left.decisionRefHash}`,
    `${right.kind}:${right.status}:${right.recordedAt}:${right.decisionRefHash}`,
  ))
}

function projectMissingEvidence(
  missing: readonly EvidencePacketMissingInput[],
): EvidencePacketMissingV1[] {
  if (missing.length > EVIDENCE_PACKET_LIMITS.missingEvidence) {
    throw new Error('Missing-evidence entries exceed the packet limit.')
  }
  return missing.map((entry) => ({
    kind: entry.kind,
    status: 'missing' as const,
    ...(entry.referenceHash ? { referenceHash: normalizeHashReference(entry.referenceHash) } : {}),
  })).sort((left, right) => compareText(
    `${left.kind}:${left.referenceHash ?? ''}`,
    `${right.kind}:${right.referenceHash ?? ''}`,
  ))
}

function isEvidencePacketShape(value: unknown): value is EvidencePacketV1 {
  if (!isPlainRecord(value)) return false
  if (!hasOnlyKeys(value, [
    'schemaVersion',
    'packetType',
    'packetId',
    'exportedAt',
    'subject',
    'predicate',
    'producer',
    'run',
    'qualification',
    'verification',
    'humanDecisions',
    'missingEvidence',
    'comparison',
  ])) return false
  if (!hasRequiredKeys(value, [
    'schemaVersion',
    'packetType',
    'packetId',
    'exportedAt',
    'subject',
    'predicate',
    'producer',
    'run',
    'qualification',
    'verification',
    'humanDecisions',
    'missingEvidence',
  ])) return false
  if (value.schemaVersion !== 1
    || value.packetType !== 'sancussight-evidence-packet'
    || typeof value.packetId !== 'string'
    || !PACKET_ID_PATTERN.test(value.packetId)
    || typeof value.exportedAt !== 'string'
    || !isIsoTimestamp(value.exportedAt)
    || !isSubject(value.subject)
    || !isPredicate(value.predicate)
    || !isProducer(value.producer)
    || !isRun(value.run)
    || typeof value.qualification !== 'string'
    || !QUALIFICATIONS.has(value.qualification)
    || !isVerificationCollection(value.verification)
    || !isDecisionCollection(value.humanDecisions)
    || !isMissingCollection(value.missingEvidence)
    || (Object.hasOwn(value, 'comparison') && !isComparison(value.comparison))) return false
  if (isPlainRecord(value.predicate) && value.predicate.kind === 'asset-version') {
    if (typeof value.predicate.versionId !== 'string') return false
    const isPortableId = PORTABLE_VERSION_ID_PATTERN.test(value.predicate.versionId)
    if (isPortableId) {
      if (value.qualification !== 'portable-projection'
        || !Object.hasOwn(value.predicate, 'derivedFromVersionId')) return false
    } else if (!RECORDED_VERSION_ID_PATTERN.test(value.predicate.versionId)
      || value.qualification !== 'recorded'
      || Object.hasOwn(value.predicate, 'derivedFromVersionId')) return false
  } else if (isPlainRecord(value.predicate)
    && value.predicate.kind === 'exit-drill'
    && value.qualification !== 'deterministic') {
    return false
  }
  return !containsProhibitedContent(value)
}

function isSubject(value: unknown): boolean {
  return hasExactKeys(value, ['kind', 'subjectHash'])
    && typeof value.kind === 'string'
    && ASSET_KINDS.has(value.kind as AssetKind)
    && isHashReference(value.subjectHash)
}

function isPredicate(value: unknown): boolean {
  if (!isPlainRecord(value) || typeof value.kind !== 'string') return false
  if (value.kind === 'asset-version') {
    return hasOnlyKeys(value, [
      'kind',
      'versionId',
      'recordedAt',
      'snapshotHash',
      'derivedFromVersionId',
    ])
      && hasRequiredKeys(value, ['kind', 'versionId', 'recordedAt', 'snapshotHash'])
      && typeof value.versionId === 'string'
      && VERSION_ID_PATTERN.test(value.versionId)
      && typeof value.recordedAt === 'string'
      && isIsoTimestamp(value.recordedAt)
      && isHashReference(value.snapshotHash)
      && (!Object.hasOwn(value, 'derivedFromVersionId')
        || (typeof value.derivedFromVersionId === 'string'
          && VERSION_ID_PATTERN.test(value.derivedFromVersionId)))
  }
  if (value.kind === 'exit-drill') {
    if (!hasExactKeys(value, ['kind', 'targetPlatform', 'verdict', 'items'])
      || !isSafeText(value.targetPlatform)
      || typeof value.verdict !== 'string'
      || !EXIT_VERDICTS.has(value.verdict)
      || !Array.isArray(value.items)
      || value.items.length > EVIDENCE_PACKET_LIMITS.exitDrillItems
      || !value.items.every(isExitDrillItem)) return false
    return isSortedBy(value.items as Array<{ subjectHash: string; status: string }>, (item) => (
      `${item.subjectHash}:${item.status}`
    ))
  }
  return false
}

function isExitDrillItem(value: unknown): boolean {
  return hasExactKeys(value, ['subjectHash', 'status'])
    && isHashReference(value.subjectHash)
    && typeof value.status === 'string'
    && EXIT_ITEM_STATUSES.has(value.status)
}

function isProducer(value: unknown): boolean {
  return hasExactKeys(value, ['name', 'contractVersion'])
    && value.name === 'SancusSight'
    && value.contractVersion === 1
}

function isRun(value: unknown): boolean {
  return hasExactKeys(value, ['observedAt', 'sourceRefHashes'])
    && typeof value.observedAt === 'string'
    && isIsoTimestamp(value.observedAt)
    && Array.isArray(value.sourceRefHashes)
    && value.sourceRefHashes.length <= EVIDENCE_PACKET_LIMITS.verificationRefs
    && value.sourceRefHashes.every(isHashReference)
    && isStrictlySortedUnique(value.sourceRefHashes as string[])
}

function isVerificationCollection(value: unknown): boolean {
  return Array.isArray(value)
    && value.length <= EVIDENCE_PACKET_LIMITS.verificationRefs
    && value.every(isVerification)
    && isSortedBy(value as EvidencePacketVerificationV1[], verificationKey, true)
}

function isVerification(value: unknown): boolean {
  if (!isPlainRecord(value)
    || !hasOnlyKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt', 'safeEvidenceHash'])
    || !hasRequiredKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt'])) return false
  return isSafeText(value.checkId)
    && isSafeText(value.resultId)
    && typeof value.status === 'string'
    && SIGNAL_STATUSES.has(value.status as SignalStatus)
    && typeof value.evaluatedAt === 'string'
    && isIsoTimestamp(value.evaluatedAt)
    && (!Object.hasOwn(value, 'safeEvidenceHash') || isHashReference(value.safeEvidenceHash))
}

function isDecisionCollection(value: unknown): boolean {
  return Array.isArray(value)
    && value.length <= EVIDENCE_PACKET_LIMITS.humanDecisions
    && value.every((decision) => (
      hasExactKeys(decision, ['kind', 'status', 'recordedAt', 'decisionRefHash'])
      && isSafeText(decision.kind)
      && isSafeText(decision.status)
      && typeof decision.recordedAt === 'string'
      && isIsoTimestamp(decision.recordedAt)
      && isHashReference(decision.decisionRefHash)
    ))
    && isSortedBy(
      value as EvidencePacketDecisionV1[],
      decision => `${decision.kind}:${decision.status}:${decision.recordedAt}:${decision.decisionRefHash}`,
    )
}

function isMissingCollection(value: unknown): boolean {
  return Array.isArray(value)
    && value.length <= EVIDENCE_PACKET_LIMITS.missingEvidence
    && value.every((entry) => (
      isPlainRecord(entry)
      && hasOnlyKeys(entry, ['kind', 'status', 'referenceHash'])
      && hasRequiredKeys(entry, ['kind', 'status'])
      && isSafeText(entry.kind)
      && entry.status === 'missing'
      && (!Object.hasOwn(entry, 'referenceHash') || isHashReference(entry.referenceHash))
    ))
    && isSortedBy(
      value as EvidencePacketMissingV1[],
      entry => `${entry.kind}:${entry.referenceHash ?? ''}`,
    )
}

function isComparison(value: unknown): value is AssetVersionComparisonV1 {
  if (!isPlainRecord(value) || typeof value.state !== 'string') return false
  if (value.state === 'no-previous-version') {
    return hasOnlyKeys(value, ['state', 'currentVersionId', 'items'])
      && hasRequiredKeys(value, ['state', 'items'])
      && (!Object.hasOwn(value, 'currentVersionId')
        || (typeof value.currentVersionId === 'string'
          && VERSION_ID_PATTERN.test(value.currentVersionId)))
      && Array.isArray(value.items)
      && value.items.length === 0
  }
  if (value.state === 'unavailable-too-many-changes') {
    return hasExactKeys(value, [
      'state',
      'currentVersionId',
      'previousVersionId',
      'items',
      'totalItems',
      'totalMeaningfulItems',
      'truncated',
      'omittedUnchangedCount',
    ])
      && typeof value.currentVersionId === 'string'
      && VERSION_ID_PATTERN.test(value.currentVersionId)
      && typeof value.previousVersionId === 'string'
      && VERSION_ID_PATTERN.test(value.previousVersionId)
      && Array.isArray(value.items)
      && value.items.length === 0
      && isNonNegativeInteger(value.totalItems)
      && isNonNegativeInteger(value.totalMeaningfulItems)
      && value.totalMeaningfulItems > EVIDENCE_PACKET_LIMITS.comparisonItems
      && value.totalItems >= value.totalMeaningfulItems
      && value.truncated === true
      && isNonNegativeInteger(value.omittedUnchangedCount)
      && value.omittedUnchangedCount === value.totalItems - value.totalMeaningfulItems
  }
  if (value.state !== 'ready'
    || !hasExactKeys(value, [
      'state',
      'currentVersionId',
      'previousVersionId',
      'items',
      'totalItems',
      'totalMeaningfulItems',
      'truncated',
      'omittedUnchangedCount',
    ])
    || typeof value.currentVersionId !== 'string'
    || !VERSION_ID_PATTERN.test(value.currentVersionId)
    || typeof value.previousVersionId !== 'string'
    || !VERSION_ID_PATTERN.test(value.previousVersionId)
    || !Array.isArray(value.items)
    || value.items.length > EVIDENCE_PACKET_LIMITS.comparisonItems
    || !isNonNegativeInteger(value.totalItems)
    || !isNonNegativeInteger(value.totalMeaningfulItems)
    || typeof value.truncated !== 'boolean'
    || !isNonNegativeInteger(value.omittedUnchangedCount)
    || value.totalMeaningfulItems > value.items.length
    || value.totalItems !== value.items.length + value.omittedUnchangedCount
    || value.truncated !== (value.omittedUnchangedCount > 0)) return false
  const meaningfulCount = value.items.filter((item) => (
    isPlainRecord(item) && item.state !== 'unchanged'
  )).length
  return meaningfulCount === value.totalMeaningfulItems && value.items.every((item) => (
    hasExactKeys(item, ['key', 'label', 'state', 'previous', 'current', 'basis'])
    && isSafeText(item.key)
    && isSafeText(item.label)
    && typeof item.state === 'string'
    && COMPARISON_STATES.has(item.state)
    && isSafeText(item.previous)
    && isSafeText(item.current)
    && typeof item.basis === 'string'
    && COMPARISON_BASES.has(item.basis)
  ))
}

function isAssetVersion(value: unknown): value is AssetVersionV1 {
  if (!isPlainRecord(value)) return false
  const portable = value.qualification === 'portable-projection'
  const expectedKeys = portable
    ? [
        'schemaVersion',
        'id',
        'recordedAt',
        'sourceRefHashes',
        'verificationRefs',
        'snapshot',
        'qualification',
        'derivedFromVersionId',
      ]
    : ['schemaVersion', 'id', 'recordedAt', 'sourceRefHashes', 'verificationRefs', 'snapshot']
  if (!hasExactKeys(value, expectedKeys)) return false
  if (value.schemaVersion !== 1
    || typeof value.id !== 'string'
    || !(portable ? PORTABLE_VERSION_ID_PATTERN : RECORDED_VERSION_ID_PATTERN).test(value.id)
    || (portable && (typeof value.derivedFromVersionId !== 'string'
      || !VERSION_ID_PATTERN.test(value.derivedFromVersionId)))
    || typeof value.recordedAt !== 'string'
    || !isIsoTimestamp(value.recordedAt)
    || !Array.isArray(value.sourceRefHashes)
    || value.sourceRefHashes.length > EVIDENCE_PACKET_LIMITS.verificationRefs
    || !value.sourceRefHashes.every((hash) => typeof hash === 'string' && RAW_SHA256_PATTERN.test(hash))
    || !isStrictlySortedUnique(value.sourceRefHashes as string[])
    || !Array.isArray(value.verificationRefs)
    || value.verificationRefs.length > EVIDENCE_PACKET_LIMITS.verificationRefs
    || !value.verificationRefs.every(isAssetVersionVerification)
    || !isSortedBy(value.verificationRefs as Array<{ checkId: string; resultId: string }>, verificationKey, true)
    || !isSnapshot(value.snapshot)) return false
  return true
}

function isAssetVersionVerification(value: unknown): boolean {
  if (!isPlainRecord(value)
    || !hasOnlyKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt', 'safeEvidenceHash'])
    || !hasRequiredKeys(value, ['checkId', 'resultId', 'status', 'evaluatedAt'])) return false
  return isSafeText(value.checkId)
    && isSafeText(value.resultId)
    && typeof value.status === 'string'
    && SIGNAL_STATUSES.has(value.status as SignalStatus)
    && typeof value.evaluatedAt === 'string'
    && isIsoTimestamp(value.evaluatedAt)
    && (!Object.hasOwn(value, 'safeEvidenceHash')
      || (typeof value.safeEvidenceHash === 'string' && RAW_SHA256_PATTERN.test(value.safeEvidenceHash)))
}

function isSnapshot(value: unknown): boolean {
  if (!isPlainRecord(value)
    || !hasOnlyKeys(value, [
      'format',
      'sharedByDesign',
      'registryState',
      'supportedVersion',
      'coverage',
      'providerDependencies',
      'dependencyIds',
    ])
    || !hasRequiredKeys(value, [
      'format',
      'sharedByDesign',
      'registryState',
      'coverage',
      'providerDependencies',
      'dependencyIds',
    ])) return false
  if (!isSafeText(value.format)
    || typeof value.sharedByDesign !== 'boolean'
    || !['active', 'archived', 'missing'].includes(String(value.registryState))
    || (Object.hasOwn(value, 'supportedVersion') && !isSafeText(value.supportedVersion))
    || !Array.isArray(value.coverage)
    || !value.coverage.every((entry) => (
      isPlainRecord(entry)
      && hasOnlyKeys(entry, ['platform', 'lastVerified'])
      && hasRequiredKeys(entry, ['platform'])
      && isSafeText(entry.platform)
      && (!Object.hasOwn(entry, 'lastVerified')
        || (typeof entry.lastVerified === 'string' && isCanonicalIsoDate(entry.lastVerified)))
    ))
    || !Array.isArray(value.providerDependencies)
    || !value.providerDependencies.every((dependency) => (
      isPlainRecord(dependency)
      && hasOnlyKeys(dependency, ['provider', 'capability', 'fallback'])
      && hasRequiredKeys(dependency, ['provider', 'capability'])
      && isSafeText(dependency.provider)
      && isSafeText(dependency.capability)
      && (!Object.hasOwn(dependency, 'fallback') || isSafeText(dependency.fallback))
    ))
    || !Array.isArray(value.dependencyIds)
    || !value.dependencyIds.every(isSafeText)) return false
  return true
}

function isExitTestResult(value: unknown): value is ExitTestResult {
  if (!hasExactKeys(value, ['workflowId', 'workflowName', 'targetPlatform', 'verdict', 'items'])
    || typeof value.workflowId !== 'string'
    || typeof value.workflowName !== 'string'
    || !isSafeText(value.targetPlatform)
    || typeof value.verdict !== 'string'
    || !EXIT_VERDICTS.has(value.verdict)
    || !Array.isArray(value.items)) return false
  return value.items.every((item) => (
    hasExactKeys(item, ['assetId', 'assetName', 'status', 'note'])
    && typeof item.assetId === 'string'
    && typeof item.assetName === 'string'
    && typeof item.status === 'string'
    && EXIT_ITEM_STATUSES.has(item.status)
    && typeof item.note === 'string'
  ))
}

function containsProhibitedContent(value: unknown): boolean {
  if (typeof value === 'string') return isProhibitedString(value)
  if (Array.isArray(value)) return value.some(containsProhibitedContent)
  if (!isPlainRecord(value)) return false
  return Object.entries(value).some(([key, child]) => (
    PROHIBITED_KEYS.has(normalizeKey(key)) || containsProhibitedContent(child)
  ))
}

function isSafeText(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= EVIDENCE_PACKET_LIMITS.textLength
    && !isProhibitedString(value)
}

function isProhibitedString(value: string): boolean {
  return CONTROL_CHARACTER_PATTERN.test(value)
    || ABSOLUTE_PATH_PATTERN.test(value)
    || URL_PATTERN.test(value)
    || EMAIL_PATTERN.test(value)
    || PRIVATE_KEY_PATTERN.test(value)
    || CREDENTIAL_VALUE_PATTERN.test(value)
    || RAW_CONTENT_PATTERN.test(value)
}

function normalizeHashReferences(values: readonly string[]): string[] {
  if (values.length > EVIDENCE_PACKET_LIMITS.verificationRefs) {
    throw new Error('Source reference hashes exceed the packet limit.')
  }
  return [...new Set(values.map(normalizeHashReference))].sort(compareText)
}

function normalizeHashReference(value: string): string {
  if (RAW_SHA256_PATTERN.test(value)) return `sha256:${value}`
  if (PACKET_ID_PATTERN.test(value)) return value
  throw new Error('Safe references must be lowercase SHA-256 hashes.')
}

async function hashReference(
  preimage: string,
  sha256: EvidencePacketSha256,
): Promise<string> {
  const digest = await sha256(preimage)
  if (!RAW_SHA256_PATTERN.test(digest)) {
    throw new Error('SHA-256 adapter must return 64 lowercase hexadecimal characters.')
  }
  return `sha256:${digest}`
}

function isHashReference(value: unknown): value is string {
  return typeof value === 'string' && PACKET_ID_PATTERN.test(value)
}

function isIsoTimestamp(value: string): boolean {
  return isCanonicalIsoTimestamp(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function verificationKey(value: { checkId: string; resultId: string }): string {
  return `${value.checkId}:${value.resultId}`
}

function isSortedBy<T>(
  values: readonly T[],
  key: (value: T) => string,
  requireUnique = false,
): boolean {
  const keys = values.map(key)
  if (requireUnique && new Set(keys).size !== keys.length) return false
  for (let index = 1; index < keys.length; index += 1) {
    if (compareText(keys[index - 1], keys[index]) > 0) return false
  }
  return true
}

function isStrictlySortedUnique(values: readonly string[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (compareText(values[index - 1], values[index]) >= 0) return false
  }
  return true
}

function hasExactKeys(
  value: unknown,
  expected: readonly string[],
): value is Record<string, unknown> {
  return isPlainRecord(value)
    && Object.keys(value).length === expected.length
    && expected.every((key) => Object.hasOwn(value, key))
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key))
}

function hasRequiredKeys(value: Record<string, unknown>, required: readonly string[]): boolean {
  return required.every((key) => Object.hasOwn(value, key))
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.getPrototypeOf(value) === Object.prototype
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/gu, '')
}

function placeholderPacketId(): string {
  return `sha256:${'0'.repeat(64)}`
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
