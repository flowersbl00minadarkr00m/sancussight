import type { InteroperabilityProfileId } from '../types.ts'

export type InteroperabilityOperationKind =
  | 'openlineage-import'
  | 'telemetry-alignment'
  | 'unsigned-statement'

export interface InteroperabilityReasonCountV1 {
  code: string
  count: number
}

export interface InteroperabilityPreviewSnapshotV1 {
  schemaVersion: 1
  profileId: InteroperabilityProfileId
  operationKind: InteroperabilityOperationKind
  createdAt: string
  acceptedCount: number
  rejectedCount: number
  omittedCount: number
  reasonCodeCounts: InteroperabilityReasonCountV1[]
  safeHashes: string[]
  persistenceState: 'available'
  confirmationDigest?: string
}

export interface InteroperabilityRepositoryRecord {
  id: number
  snapshot: unknown
}

export interface InteroperabilityAtomicRecordResult {
  recorded: boolean
  records: InteroperabilityRepositoryRecord[]
}

export interface InteroperabilityRepository {
  list(): Promise<InteroperabilityRepositoryRecord[]>
  recordAtomically(
    snapshot: InteroperabilityPreviewSnapshotV1,
  ): Promise<InteroperabilityAtomicRecordResult>
  clear(): Promise<void>
}

export const INTEROPERABILITY_SNAPSHOT_FIELDS = Object.freeze([
  'schemaVersion',
  'profileId',
  'operationKind',
  'createdAt',
  'acceptedCount',
  'rejectedCount',
  'omittedCount',
  'reasonCodeCounts',
  'safeHashes',
  'persistenceState',
  'confirmationDigest',
] as const)

export const INTEROPERABILITY_STORE_LIMITS = Object.freeze({
  maxPerProfile: 20,
  maxGlobal: 100,
  maxReasonCodes: 100,
  maxSafeHashes: 500,
})

export type InteroperabilityListResult =
  | {
      availability: 'available'
      snapshots: InteroperabilityPreviewSnapshotV1[]
    }
  | {
      availability: 'unavailable'
      snapshots: []
    }

export type InteroperabilityRecordResult =
  | {
      availability: 'available'
      recorded: boolean
      current: InteroperabilityPreviewSnapshotV1
      snapshots: InteroperabilityPreviewSnapshotV1[]
    }
  | {
      availability: 'unavailable'
      recorded: false
      current: InteroperabilityPreviewSnapshotV1
      snapshots: []
    }

export type InteroperabilityClearResult =
  | { availability: 'available' }
  | { availability: 'unavailable' }

const DATABASE_NAME = 'sancussight-standards-interoperability-v1'
const STORE_NAME = 'previews'
const DATABASE_VERSION = 1
const PROFILE_IDS = new Set<InteroperabilityProfileId>([
  'openlineage-run-event-core-1.0.5',
  'otel-genai-metadata-preview-1',
  'openinference-metadata-preview-1',
  'sancussight-in-toto-statement-1',
])
const OPERATIONS = new Set<InteroperabilityOperationKind>([
  'openlineage-import',
  'telemetry-alignment',
  'unsigned-statement',
])
const RAW_SHA256 = /^[0-9a-f]{64}$/u
const PREFIXED_SHA256 = /^sha256:[0-9a-f]{64}$/u
const REASON_CODE = /^[a-z0-9][a-z0-9.-]{0,79}$/u

export class InteroperabilityPreviewStore {
  private readonly repository: InteroperabilityRepository

  constructor(
    repository: InteroperabilityRepository =
      new IndexedDbInteroperabilityRepository(),
  ) {
    this.repository = repository
  }

  async list(): Promise<InteroperabilityListResult> {
    try {
      const records = await this.repository.list()
      const validated = validRecords(records)
      if (!validated) throw new Error('Interoperability preview storage contains invalid records.')
      return {
        availability: 'available',
        snapshots: validated.map(record => record.snapshot),
      }
    } catch {
      return { availability: 'unavailable', snapshots: [] }
    }
  }

  async record(value: unknown): Promise<InteroperabilityRecordResult> {
    if (!validateInteroperabilityPreviewSnapshot(value)) {
      throw new TypeError('Interoperability preview snapshot has an unsafe or unsupported shape.')
    }
    const current = normalizeSnapshot(value)
    try {
      const result = await this.repository.recordAtomically(current)
      const records = validRecords(result.records)
      if (!records) {
        throw new Error('Interoperability preview storage contains invalid records.')
      }
      return {
        availability: 'available',
        recorded: result.recorded,
        current,
        snapshots: records.map(record => record.snapshot),
      }
    } catch {
      return {
        availability: 'unavailable',
        recorded: false,
        current: value,
        snapshots: [],
      }
    }
  }

  async clear(): Promise<InteroperabilityClearResult> {
    try {
      await this.repository.clear()
      return { availability: 'available' }
    } catch {
      return { availability: 'unavailable' }
    }
  }
}

export function validateInteroperabilityPreviewSnapshot(
  value: unknown,
): value is InteroperabilityPreviewSnapshotV1 {
  if (!isPlainRecord(value)) return false
  const keys = Object.keys(value)
  const hasConfirmation = Object.hasOwn(value, 'confirmationDigest')
  const expectedCount = hasConfirmation ? 11 : 10
  if (keys.length !== expectedCount
    || keys.some(key => !INTEROPERABILITY_SNAPSHOT_FIELDS.includes(
      key as typeof INTEROPERABILITY_SNAPSHOT_FIELDS[number],
    ))
    || value.schemaVersion !== 1
    || typeof value.profileId !== 'string'
    || !PROFILE_IDS.has(value.profileId as InteroperabilityProfileId)
    || typeof value.operationKind !== 'string'
    || !OPERATIONS.has(value.operationKind as InteroperabilityOperationKind)
    || !profileMatchesOperation(
      value.profileId as InteroperabilityProfileId,
      value.operationKind as InteroperabilityOperationKind,
    )
    || !isCanonicalTimestamp(value.createdAt)
    || !isCount(value.acceptedCount)
    || !isCount(value.rejectedCount)
    || !isCount(value.omittedCount)
    || !Array.isArray(value.reasonCodeCounts)
    || value.reasonCodeCounts.length > INTEROPERABILITY_STORE_LIMITS.maxReasonCodes
    || !value.reasonCodeCounts.every(isReasonCount)
    || hasDuplicateReasonCodes(value.reasonCodeCounts)
    || !Array.isArray(value.safeHashes)
    || value.safeHashes.length > INTEROPERABILITY_STORE_LIMITS.maxSafeHashes
    || !value.safeHashes.every(hash => typeof hash === 'string' && RAW_SHA256.test(hash))
    || new Set(value.safeHashes).size !== value.safeHashes.length
    || value.persistenceState !== 'available') return false

  if (value.operationKind === 'unsigned-statement') {
    return hasConfirmation
      && typeof value.confirmationDigest === 'string'
      && PREFIXED_SHA256.test(value.confirmationDigest)
  }
  return !hasConfirmation
}

export function createMemoryInteroperabilityRepository(): InteroperabilityRepository {
  let nextId = 1
  let records: InteroperabilityRepositoryRecord[] = []
  let mutationQueue: Promise<void> = Promise.resolve()

  function queueMutation<T>(mutation: () => T | Promise<T>): Promise<T> {
    const operation = mutationQueue.then(mutation)
    mutationQueue = operation.then(
      () => undefined,
      () => undefined,
    )
    return operation
  }

  return {
    async list() {
      await mutationQueue
      return records.map(record => ({
        id: record.id,
        snapshot: structuredClone(record.snapshot),
      }))
    },
    recordAtomically(snapshot) {
      return queueMutation(() => {
        const before = validRecords(records)
        if (!before) {
          throw new Error('Interoperability preview storage contains invalid records.')
        }
        if (hasEquivalentLatestForProfile(before, snapshot)) {
          return {
            recorded: false,
            records: cloneRepositoryRecords(before),
          }
        }

        const id = nextId
        nextId += 1
        records.push({ id, snapshot: structuredClone(snapshot) })
        const after = validRecords(records)
        if (!after) {
          throw new Error('Interoperability preview storage contains invalid records.')
        }
        const keepIds = retainedIds(after)
        records = records.filter(record => keepIds.has(record.id))
        return {
          recorded: true,
          records: cloneRepositoryRecords(
            after.filter(record => keepIds.has(record.id)),
          ),
        }
      })
    },
    clear() {
      return queueMutation(() => {
        records = []
      })
    },
  }
}

export class IndexedDbInteroperabilityRepository implements InteroperabilityRepository {
  private database?: Promise<IDBDatabase>

  async list(): Promise<InteroperabilityRepositoryRecord[]> {
    const database = await this.open()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const [values] = await Promise.all([
      requestResult<unknown[]>(transaction.objectStore(STORE_NAME).getAll()),
      transactionDone(transaction),
    ])
    return indexedDbRepositoryRecords(values)
  }

  async recordAtomically(
    snapshot: InteroperabilityPreviewSnapshotV1,
  ): Promise<InteroperabilityAtomicRecordResult> {
    const database = await this.open()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const completion = transactionDone(transaction)
    try {
      const values = await requestResult<unknown[]>(store.getAll())
      const before = validRecords(indexedDbRepositoryRecords(values))
      if (!before) {
        throw new Error('Interoperability preview storage contains invalid records.')
      }
      if (hasEquivalentLatestForProfile(before, snapshot)) {
        await completion
        return {
          recorded: false,
          records: cloneRepositoryRecords(before),
        }
      }

      const id = await requestResult<IDBValidKey>(store.add({ snapshot }))
      if (typeof id !== 'number' || !Number.isSafeInteger(id)) {
        throw new Error('Interoperability preview storage returned an invalid key.')
      }
      const after = validRecords([...before, { id, snapshot }])
      if (!after) {
        throw new Error('Interoperability preview storage contains invalid records.')
      }
      const keepIds = retainedIds(after)
      for (const record of after) {
        if (!keepIds.has(record.id)) store.delete(record.id)
      }
      await completion
      return {
        recorded: true,
        records: cloneRepositoryRecords(
          after.filter(record => keepIds.has(record.id)),
        ),
      }
    } catch (error) {
      try {
        transaction.abort()
      } catch {
        // The transaction may already have aborted because of the request error.
      }
      await completion.catch(() => undefined)
      throw error
    }
  }

  async clear(): Promise<void> {
    const database = await this.open()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    await Promise.all([
      requestResult(transaction.objectStore(STORE_NAME).clear()),
      transactionDone(transaction),
    ])
  }

  private open(): Promise<IDBDatabase> {
    this.database ??= new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(new Error('IndexedDB is unavailable.'))
        return
      }
      const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
      }
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed.'))
      request.onblocked = () => reject(new Error('IndexedDB open was blocked.'))
      request.onsuccess = () => resolve(request.result)
    })
    return this.database
  }
}

function validRecords(
  records: readonly InteroperabilityRepositoryRecord[],
): Array<{ id: number; snapshot: InteroperabilityPreviewSnapshotV1 }> | undefined {
  if (records.some(record => (
    !Number.isSafeInteger(record.id)
    || record.id < 1
    || !validateInteroperabilityPreviewSnapshot(record.snapshot)
  ))) return undefined
  return records
    .map(record => ({
      id: record.id,
      snapshot: normalizeSnapshot(
        record.snapshot as InteroperabilityPreviewSnapshotV1,
      ),
    }))
    .sort((left, right) => (
      compareText(right.snapshot.createdAt, left.snapshot.createdAt)
      || right.id - left.id
    ))
}

function normalizeSnapshot(
  value: InteroperabilityPreviewSnapshotV1,
): InteroperabilityPreviewSnapshotV1 {
  return {
    schemaVersion: 1,
    profileId: value.profileId,
    operationKind: value.operationKind,
    createdAt: value.createdAt,
    acceptedCount: value.acceptedCount,
    rejectedCount: value.rejectedCount,
    omittedCount: value.omittedCount,
    reasonCodeCounts: [...value.reasonCodeCounts]
      .map(entry => ({ code: entry.code, count: entry.count }))
      .sort((left, right) => compareText(left.code, right.code)),
    safeHashes: [...value.safeHashes].sort(),
    persistenceState: 'available',
    ...(value.confirmationDigest
      ? { confirmationDigest: value.confirmationDigest }
      : {}),
  }
}

function equivalentPreview(
  left: InteroperabilityPreviewSnapshotV1,
  right: InteroperabilityPreviewSnapshotV1,
): boolean {
  const { createdAt: _leftCreatedAt, ...leftComparable } = left
  const { createdAt: _rightCreatedAt, ...rightComparable } = right
  return JSON.stringify(leftComparable) === JSON.stringify(rightComparable)
}

function hasEquivalentLatestForProfile(
  records: ReadonlyArray<{
    id: number
    snapshot: InteroperabilityPreviewSnapshotV1
  }>,
  snapshot: InteroperabilityPreviewSnapshotV1,
): boolean {
  const latestForProfile = records.find(
    record => record.snapshot.profileId === snapshot.profileId,
  )
  return !!latestForProfile
    && equivalentPreview(latestForProfile.snapshot, snapshot)
}

function cloneRepositoryRecords(
  records: ReadonlyArray<{
    id: number
    snapshot: InteroperabilityPreviewSnapshotV1
  }>,
): InteroperabilityRepositoryRecord[] {
  return records.map(record => ({
    id: record.id,
    snapshot: structuredClone(record.snapshot),
  }))
}

function indexedDbRepositoryRecords(
  values: readonly unknown[],
): InteroperabilityRepositoryRecord[] {
  return values.map(value => {
    if (!isPlainRecord(value)
      || typeof value.id !== 'number'
      || !Number.isSafeInteger(value.id)
      || value.id < 1
      || !Object.hasOwn(value, 'snapshot')) {
      throw new Error('Interoperability preview storage contains an invalid record envelope.')
    }
    return { id: value.id, snapshot: value.snapshot }
  })
}

function retainedIds(
  records: ReadonlyArray<{ id: number; snapshot: InteroperabilityPreviewSnapshotV1 }>,
): Set<number> {
  const counts = new Map<InteroperabilityProfileId, number>()
  const retained = new Set<number>()
  for (const record of records) {
    if (retained.size >= INTEROPERABILITY_STORE_LIMITS.maxGlobal) break
    const count = counts.get(record.snapshot.profileId) ?? 0
    if (count >= INTEROPERABILITY_STORE_LIMITS.maxPerProfile) continue
    counts.set(record.snapshot.profileId, count + 1)
    retained.add(record.id)
  }
  return retained
}

function profileMatchesOperation(
  profileId: InteroperabilityProfileId,
  operationKind: InteroperabilityOperationKind,
): boolean {
  if (operationKind === 'openlineage-import') {
    return profileId === 'openlineage-run-event-core-1.0.5'
  }
  if (operationKind === 'unsigned-statement') {
    return profileId === 'sancussight-in-toto-statement-1'
  }
  return profileId === 'otel-genai-metadata-preview-1'
    || profileId === 'openinference-metadata-preview-1'
}

function isReasonCount(value: unknown): value is InteroperabilityReasonCountV1 {
  return isPlainRecord(value)
    && Object.keys(value).length === 2
    && Object.hasOwn(value, 'code')
    && Object.hasOwn(value, 'count')
    && typeof value.code === 'string'
    && REASON_CODE.test(value.code)
    && isCount(value.count)
}

function hasDuplicateReasonCodes(values: readonly unknown[]): boolean {
  const codes = values.map(value => isPlainRecord(value) ? value.code : undefined)
  return new Set(codes).size !== codes.length
}

function isCount(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0
    && value <= 1_000_000
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function requestResult<T = undefined>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
    request.onsuccess = () => resolve(request.result)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
  })
}
