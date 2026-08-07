import type {
  OpenLineageCodeCountV1,
  OpenLineageEventType,
  OpenLineageImportResultV1,
  OpenLineageOmissionCode,
  OpenLineagePreviewV1,
  OpenLineageProjectedRecordV1,
  OpenLineageRejectionCode,
  OpenLineageSafeHashKind,
  OpenLineageSafeHashV1,
} from '../types.ts'

export const OPENLINEAGE_IMPORT_LIMITS = Object.freeze({
  maxBytes: 1024 * 1024,
  maxRecords: 500,
  maxEntitiesPerRecord: 500,
  maxIdentifierLength: 1024,
  maxUriLength: 2048,
})

export type OpenLineageSha256 = (input: string) => Promise<string>

export interface OpenLineageImportInput {
  text: string
  byteLength: number
  importedAt: string
}

const PROFILE_ID = 'openlineage-run-event-core-1.0.5' as const
const PINNED_SCHEMA_URL =
  'https://openlineage.io/spec/1-0-5/OpenLineage.json#/definitions/RunEvent'
const EVENT_TYPES = new Set<OpenLineageEventType>([
  'START',
  'RUNNING',
  'COMPLETE',
  'ABORT',
  'FAIL',
  'OTHER',
])
const TOP_LEVEL_KEYS = new Set([
  'eventTime',
  'eventType',
  'run',
  'job',
  'inputs',
  'outputs',
  'producer',
  'schemaURL',
])
const RUN_KEYS = new Set(['runId', 'facets'])
const JOB_KEYS = new Set(['namespace', 'name', 'facets'])
const INPUT_DATASET_KEYS = new Set([
  'namespace',
  'name',
  'facets',
  'inputFacets',
])
const OUTPUT_DATASET_KEYS = new Set([
  'namespace',
  'name',
  'facets',
  'outputFacets',
])
const RAW_SHA256_PATTERN = /^[0-9a-f]{64}$/u
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
const RFC3339_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/u
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/u

interface ParsedRecords {
  inputKind: 'json' | 'jsonl'
  records: ParsedRecord[]
  tooMany?: true
}

interface ParsedRecord {
  value?: unknown
  parseError?: true
}

interface ProjectedRecord {
  record: OpenLineageProjectedRecordV1
  omissions: OpenLineageOmissionCode[]
}

interface ValidatedDataset {
  namespace: string
  name: string
  omittedFacetCount: number
}

interface ValidatedRecord {
  eventType: OpenLineageEventType
  eventTime: string
  producer: string
  schemaURL: string
  runId: string
  runHasFacets: boolean
  jobNamespace: string
  jobName: string
  jobHasFacets: boolean
  inputs: ValidatedDataset[]
  outputs: ValidatedDataset[]
}

export async function parseOpenLineageImport(
  input: OpenLineageImportInput,
  sha256: OpenLineageSha256,
): Promise<OpenLineageImportResultV1> {
  if (!isCanonicalUtcTimestamp(input.importedAt)) return importError('invalid-import-time')
  if (!Number.isSafeInteger(input.byteLength) || input.byteLength < 0) {
    return importError('byte-length-mismatch')
  }
  if (input.byteLength > OPENLINEAGE_IMPORT_LIMITS.maxBytes) {
    return importError('file-too-large')
  }

  const measuredByteLength = new TextEncoder().encode(input.text).byteLength
  if (measuredByteLength > OPENLINEAGE_IMPORT_LIMITS.maxBytes) {
    return importError('file-too-large')
  }
  if (measuredByteLength !== input.byteLength) {
    return importError('byte-length-mismatch')
  }
  if (input.text.trim().length === 0) return importError('empty-input')

  const parsed = parseRecords(input.text)
  if (parsed.tooMany || parsed.records.length > OPENLINEAGE_IMPORT_LIMITS.maxRecords) {
    return importError('too-many-records')
  }

  const accepted: OpenLineageProjectedRecordV1[] = []
  const rejectionCounts = new Map<OpenLineageRejectionCode, number>()
  const omissionCounts = new Map<OpenLineageOmissionCode, number>()

  for (const candidate of parsed.records) {
    if (candidate.parseError) {
      increment(rejectionCounts, 'malformed-json')
      continue
    }

    const validation = validateRecord(candidate.value)
    if (typeof validation === 'string') {
      increment(rejectionCounts, validation)
      continue
    }

    try {
      const projected = await projectRecord(validation, sha256)
      accepted.push(projected.record)
      for (const code of projected.omissions) increment(omissionCounts, code)
    } catch {
      increment(rejectionCounts, 'hash-failed')
    }
  }

  accepted.sort(compareProjectedRecords)
  const safeHashes = uniqueSortedHashes(
    accepted.flatMap(record => record.safeHashes),
  )
  const eventTypeCounts = countCodes(
    accepted.map(record => record.eventType),
  )
  const rejectionCodeCounts = mapCounts(rejectionCounts)
  const omissionCodeCounts = mapCounts(omissionCounts)
  const omittedCount = omissionCodeCounts.reduce(
    (total, entry) => total + entry.count,
    0,
  )

  const preview: OpenLineagePreviewV1 = {
    schemaVersion: 1,
    profileId: PROFILE_ID,
    projectionVersion: 1,
    qualification: 'profile-qualified-metadata-only',
    inputKind: parsed.inputKind,
    importedAt: input.importedAt,
    recordCount: parsed.records.length,
    acceptedCount: accepted.length,
    rejectedCount: parsed.records.length - accepted.length,
    omittedCount,
    eventTypeCounts,
    rejectionCodeCounts,
    omissionCodeCounts,
    records: accepted,
    safeHashes,
  }

  return { ok: true, preview }
}

function parseRecords(text: string): ParsedRecords {
  try {
    const parsed: unknown = JSON.parse(text)
    return {
      inputKind: 'json',
      records: Array.isArray(parsed)
        ? parsed.map(value => ({ value }))
        : [{ value: parsed }],
    }
  } catch {
    const lines = text
      .split(/\r?\n/u)
      .filter(line => line.trim().length > 0)
    if (lines.length > OPENLINEAGE_IMPORT_LIMITS.maxRecords) {
      return {
        inputKind: 'jsonl',
        records: [],
        tooMany: true,
      }
    }
    return {
      inputKind: 'jsonl',
      records: lines.map(line => {
        try {
          const value: unknown = JSON.parse(line)
          return { value }
        } catch {
          return { parseError: true }
        }
      }),
    }
  }
}

function validateRecord(value: unknown): ValidatedRecord | OpenLineageRejectionCode {
  if (!isPlainObject(value)) return 'record-not-object'
  if (!hasOnlyKeys(value, TOP_LEVEL_KEYS)) return 'unknown-top-level-key'
  if (value.schemaURL !== PINNED_SCHEMA_URL) return 'unsupported-schema-url'
  if (typeof value.eventType !== 'string' || !EVENT_TYPES.has(value.eventType as OpenLineageEventType)) {
    return 'unsupported-event-type'
  }

  const eventTime = canonicalEventTimestamp(value.eventTime)
  if (!eventTime) return 'invalid-event-time'
  if (!isBoundedUri(value.producer)) return 'invalid-producer'

  const run = validateRun(value.run)
  if (typeof run === 'string') return run
  const job = validateJob(value.job)
  if (typeof job === 'string') return job
  const inputs = validateDatasets(value.inputs, true)
  if (typeof inputs === 'string') return inputs
  const outputs = validateDatasets(value.outputs, false)
  if (typeof outputs === 'string') return outputs

  return {
    eventType: value.eventType as OpenLineageEventType,
    eventTime,
    producer: value.producer,
    schemaURL: value.schemaURL,
    runId: run.runId,
    runHasFacets: run.hasFacets,
    jobNamespace: job.namespace,
    jobName: job.name,
    jobHasFacets: job.hasFacets,
    inputs,
    outputs,
  }
}

function validateRun(
  value: unknown,
): { runId: string; hasFacets: boolean } | 'invalid-run' | 'unknown-run-key' {
  if (!isPlainObject(value)) return 'invalid-run'
  if (!hasOnlyKeys(value, RUN_KEYS)) return 'unknown-run-key'
  if (typeof value.runId !== 'string' || !UUID_PATTERN.test(value.runId)) {
    return 'invalid-run'
  }
  return {
    runId: value.runId,
    hasFacets: Object.hasOwn(value, 'facets'),
  }
}

function validateJob(
  value: unknown,
): { namespace: string; name: string; hasFacets: boolean } | 'invalid-job' | 'unknown-job-key' {
  if (!isPlainObject(value)) return 'invalid-job'
  if (!hasOnlyKeys(value, JOB_KEYS)) return 'unknown-job-key'
  if (!isBoundedIdentifier(value.namespace) || !isBoundedIdentifier(value.name)) {
    return 'invalid-job'
  }
  return {
    namespace: value.namespace,
    name: value.name,
    hasFacets: Object.hasOwn(value, 'facets'),
  }
}

function validateDatasets(
  value: unknown,
  inputs: boolean,
): ValidatedDataset[]
  | 'invalid-inputs'
  | 'invalid-outputs'
  | 'invalid-dataset'
  | 'unknown-dataset-key' {
  if (value === undefined) return []
  if (!Array.isArray(value)) return inputs ? 'invalid-inputs' : 'invalid-outputs'
  if (value.length > OPENLINEAGE_IMPORT_LIMITS.maxEntitiesPerRecord) {
    return inputs ? 'invalid-inputs' : 'invalid-outputs'
  }

  const result: ValidatedDataset[] = []
  const allowedKeys = inputs ? INPUT_DATASET_KEYS : OUTPUT_DATASET_KEYS
  const directionFacetKey = inputs ? 'inputFacets' : 'outputFacets'
  for (const dataset of value) {
    if (!isPlainObject(dataset)) return 'invalid-dataset'
    if (!hasOnlyKeys(dataset, allowedKeys)) return 'unknown-dataset-key'
    if (!isBoundedIdentifier(dataset.namespace) || !isBoundedIdentifier(dataset.name)) {
      return 'invalid-dataset'
    }
    result.push({
      namespace: dataset.namespace,
      name: dataset.name,
      omittedFacetCount:
        Number(Object.hasOwn(dataset, 'facets'))
        + Number(Object.hasOwn(dataset, directionFacetKey)),
    })
  }
  return result
}

async function projectRecord(
  value: ValidatedRecord,
  sha256: OpenLineageSha256,
): Promise<ProjectedRecord> {
  const safeHashes: OpenLineageSafeHashV1[] = [
    await hashIdentity('producer', [value.producer], sha256),
    await hashIdentity('schema', [value.schemaURL], sha256),
    await hashIdentity('run', [value.runId], sha256),
    await hashIdentity('job-namespace', [value.jobNamespace], sha256),
    await hashIdentity('job-name', [value.jobName], sha256),
  ]

  for (const dataset of value.inputs) {
    safeHashes.push(
      await hashIdentity(
        'input-dataset',
        [dataset.namespace, dataset.name],
        sha256,
      ),
    )
  }
  for (const dataset of value.outputs) {
    safeHashes.push(
      await hashIdentity(
        'output-dataset',
        [dataset.namespace, dataset.name],
        sha256,
      ),
    )
  }

  const omissions: OpenLineageOmissionCode[] = []
  if (value.runHasFacets) omissions.push('run-facets-omitted')
  if (value.jobHasFacets) omissions.push('job-facets-omitted')
  for (const dataset of value.inputs) {
    for (let index = 0; index < dataset.omittedFacetCount; index += 1) {
      omissions.push('input-dataset-facets-omitted')
    }
  }
  for (const dataset of value.outputs) {
    for (let index = 0; index < dataset.omittedFacetCount; index += 1) {
      omissions.push('output-dataset-facets-omitted')
    }
  }

  return {
    record: {
      eventType: value.eventType,
      eventTime: value.eventTime,
      inputCount: value.inputs.length,
      outputCount: value.outputs.length,
      safeHashes: uniqueSortedHashes(safeHashes),
    },
    omissions,
  }
}

async function hashIdentity(
  kind: OpenLineageSafeHashKind,
  components: readonly string[],
  sha256: OpenLineageSha256,
): Promise<OpenLineageSafeHashV1> {
  const preimage = [
    'sancussight:standards-interoperability:openlineage:v1',
    kind,
    ...components.map(component => `${component.length}:${component}`),
  ].join('\n')
  const digest = await sha256(preimage)
  if (!RAW_SHA256_PATTERN.test(digest)) throw new Error('Invalid SHA-256 result.')
  return { kind, hash: `sha256:${digest}` }
}

function canonicalEventTimestamp(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const match = RFC3339_PATTERN.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  if (
    month < 1
    || month > 12
    || day < 1
    || day > daysInMonth(year, month)
    || hour > 23
    || minute > 59
    || second > 59
  ) {
    return undefined
  }

  const zone = match[8]
  if (zone !== 'Z') {
    const zoneHour = Number(zone.slice(1, 3))
    const zoneMinute = Number(zone.slice(4, 6))
    if (zoneHour > 23 || zoneMinute > 59) return undefined
  }

  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return undefined
  return parsed.toISOString()
}

function isCanonicalUtcTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return false
  }
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= OPENLINEAGE_IMPORT_LIMITS.maxIdentifierLength
    && value.trim() === value
    && !CONTROL_CHARACTER_PATTERN.test(value)
}

function isBoundedUri(value: unknown): value is string {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length > OPENLINEAGE_IMPORT_LIMITS.maxUriLength
    || CONTROL_CHARACTER_PATTERN.test(value)
  ) {
    return false
  }
  try {
    const parsed = new URL(value)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:')
      && parsed.username.length === 0
      && parsed.password.length === 0
  } catch {
    return false
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): boolean {
  return Object.keys(value).every(key => allowed.has(key))
}

function compareProjectedRecords(
  left: OpenLineageProjectedRecordV1,
  right: OpenLineageProjectedRecordV1,
): number {
  return left.eventTime.localeCompare(right.eventTime)
    || left.eventType.localeCompare(right.eventType)
    || hashSortKey(left.safeHashes).localeCompare(hashSortKey(right.safeHashes))
}

function hashSortKey(hashes: readonly OpenLineageSafeHashV1[]): string {
  return hashes.map(item => `${item.kind}:${item.hash}`).join('|')
}

function uniqueSortedHashes(
  hashes: readonly OpenLineageSafeHashV1[],
): OpenLineageSafeHashV1[] {
  const unique = new Map<string, OpenLineageSafeHashV1>()
  for (const item of hashes) unique.set(`${item.kind}:${item.hash}`, item)
  return [...unique.values()].sort(
    (left, right) => left.kind.localeCompare(right.kind)
      || left.hash.localeCompare(right.hash),
  )
}

function increment<TCode extends string>(
  counts: Map<TCode, number>,
  code: TCode,
): void {
  counts.set(code, (counts.get(code) ?? 0) + 1)
}

function countCodes<TCode extends string>(
  codes: readonly TCode[],
): OpenLineageCodeCountV1<TCode>[] {
  const counts = new Map<TCode, number>()
  for (const code of codes) increment(counts, code)
  return mapCounts(counts)
}

function mapCounts<TCode extends string>(
  counts: ReadonlyMap<TCode, number>,
): OpenLineageCodeCountV1<TCode>[] {
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([code, count]) => ({ code, count }))
}

function importError(
  errorCode: Extract<OpenLineageImportResultV1, { ok: false }>['errorCode'],
): OpenLineageImportResultV1 {
  return {
    ok: false,
    profileId: PROFILE_ID,
    errorCode,
  }
}
