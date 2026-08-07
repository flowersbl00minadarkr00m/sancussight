import type { CheckResultSnapshot, SignalStatus } from '../types'

const DB_NAME = 'sancussight-check-history'
const DB_VERSION = 1
const STORE_NAME = 'snapshots'
const MAX_STREAM_SNAPSHOTS = 20
const MAX_GLOBAL_SNAPSHOTS = 1_000

const SIGNAL_STATUSES = new Set<SignalStatus>([
  'pass',
  'warn',
  'fail',
  'accepted',
  'unknown',
])

export const CHECK_HISTORY_SNAPSHOT_FIELDS = [
  'registryScopeHash',
  'assetId',
  'checkId',
  'resultDiscriminator',
  'status',
  'evaluatedAt',
  'safeEvidenceHash',
] as const satisfies readonly (keyof CheckResultSnapshot)[]

export interface RegistryScopeInput {
  schemaVersion: number
  assets: readonly {
    id: string
    stableId?: string
  }[]
}

export interface CheckHistoryRecordInput {
  registryScopeHash: string
  assetId: string
  checkId: string
  resultDiscriminator: string
  status: SignalStatus
  evaluatedAt: string
  safeEvidenceRef?: string
}

export interface AvailableCheckHistory {
  availability: 'available'
  current?: CheckResultSnapshot
  previous?: CheckResultSnapshot
}

export interface RecordedCheckHistory extends AvailableCheckHistory {
  recorded: boolean
}

export type CheckHistoryReadResult =
  | AvailableCheckHistory
  | { availability: 'unavailable' }

export type CheckHistoryRecordResult =
  | RecordedCheckHistory
  | { availability: 'unavailable' }

export type CheckHistoryClearResult =
  | { state: 'cleared' }
  | { state: 'unavailable' }

export interface CheckHistoryEntry {
  key: number
  snapshot: CheckResultSnapshot
}

export interface CheckHistoryRepository {
  list(): Promise<CheckHistoryEntry[]>
  add(snapshot: CheckResultSnapshot): Promise<number>
  delete(keys: readonly number[]): Promise<void>
  clear(): Promise<void>
}

export class CheckHistoryStore {
  private operationQueue: Promise<void> = Promise.resolve()
  private readonly repository: CheckHistoryRepository

  constructor(repository: CheckHistoryRepository = new IndexedDbCheckHistoryRepository()) {
    this.repository = repository
  }

  record(input: CheckHistoryRecordInput): Promise<CheckHistoryRecordResult> {
    return this.runExclusive(async () => {
      try {
        const snapshot = await buildSnapshot(input)
        const existing = validEntries(await this.repository.list())
        const stream = entriesForStream(existing, snapshot)
        const latest = stream.at(-1)?.snapshot

        if (latest && equivalentSnapshot(latest, snapshot)) {
          return {
            availability: 'available',
            recorded: false,
            ...comparisonFromEntries(stream),
          }
        }

        const key = await this.repository.add(snapshot)
        const withNewEntry = sortEntries([
          ...existing,
          { key, snapshot: copySnapshot(snapshot) },
        ])
        const deletionKeys = retentionDeletionKeys(withNewEntry, snapshot)

        if (deletionKeys.length > 0) {
          await this.repository.delete(deletionKeys)
        }

        const retained = withNewEntry.filter((entry) => !deletionKeys.includes(entry.key))
        return {
          availability: 'available',
          recorded: true,
          ...comparisonFromEntries(entriesForStream(retained, snapshot)),
        }
      } catch {
        return { availability: 'unavailable' }
      }
    })
  }

  read(
    registryScopeHash: string,
    assetId: string,
    checkId: string,
    resultDiscriminator: string,
  ): Promise<CheckHistoryReadResult> {
    return this.runExclusive(async () => {
      try {
        const entries = validEntries(await this.repository.list())
        return {
          availability: 'available',
          ...comparisonFromEntries(entriesForStream(entries, {
            registryScopeHash,
            assetId,
            checkId,
            resultDiscriminator,
          })),
        }
      } catch {
        return { availability: 'unavailable' }
      }
    })
  }

  clear(): Promise<CheckHistoryClearResult> {
    return this.runExclusive(async () => {
      try {
        await this.repository.clear()
        return { state: 'cleared' }
      } catch {
        return { state: 'unavailable' }
      }
    })
  }

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.operationQueue.then(operation, operation)
    this.operationQueue = pending.then(() => undefined, () => undefined)
    return pending
  }
}

export class IndexedDbCheckHistoryRepository implements CheckHistoryRepository {
  async list(): Promise<CheckHistoryEntry[]> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const completed = transactionComplete(transaction)
    const objectStore = transaction.objectStore(STORE_NAME)
    const snapshotsRequest = objectStore.getAll()
    const keysRequest = objectStore.getAllKeys()
    const [snapshots, keys] = await Promise.all([
      requestResult<unknown[]>(snapshotsRequest),
      requestResult<IDBValidKey[]>(keysRequest),
    ])
    await completed

    if (snapshots.length !== keys.length) {
      throw new Error('Check history storage returned inconsistent records.')
    }

    return snapshots.flatMap((snapshot, index) => {
      const key = keys[index]
      if (typeof key !== 'number' || !isCheckResultSnapshot(snapshot)) return []
      return [{ key, snapshot: copySnapshot(snapshot) }]
    })
  }

  async add(snapshot: CheckResultSnapshot): Promise<number> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const completed = transactionComplete(transaction)
    const key = await requestResult<IDBValidKey>(
      transaction.objectStore(STORE_NAME).add(copySnapshot(snapshot)),
    )
    await completed

    if (typeof key !== 'number') {
      throw new Error('Check history storage returned an invalid key.')
    }
    return key
  }

  async delete(keys: readonly number[]): Promise<void> {
    if (keys.length === 0) return

    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const completed = transactionComplete(transaction)
    const objectStore = transaction.objectStore(STORE_NAME)
    for (const key of keys) objectStore.delete(key)
    await completed
  }

  async clear(): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const completed = transactionComplete(transaction)
    transaction.objectStore(STORE_NAME).clear()
    await completed
  }
}

export function createMemoryCheckHistoryRepository(
  initialSnapshots: readonly CheckResultSnapshot[] = [],
): CheckHistoryRepository {
  let nextKey = 1
  let entries = initialSnapshots.map((snapshot) => ({
    key: nextKey++,
    snapshot: copySnapshot(snapshot),
  }))

  return {
    async list() {
      return entries.map((entry) => ({
        key: entry.key,
        snapshot: copySnapshot(entry.snapshot),
      }))
    },
    async add(snapshot) {
      const key = nextKey++
      entries.push({ key, snapshot: copySnapshot(snapshot) })
      return key
    },
    async delete(keys) {
      const keySet = new Set(keys)
      entries = entries.filter((entry) => !keySet.has(entry.key))
    },
    async clear() {
      entries = []
    },
  }
}

export async function hashRegistryScope(registry: RegistryScopeInput): Promise<string> {
  const stableAssetIds = registry.assets
    .map((asset) => asset.stableId?.trim() || asset.id)
    .sort()

  return sha256(JSON.stringify({
    schemaVersion: registry.schemaVersion,
    stableAssetIds,
  }))
}

export function hashSafeEvidence(
  status: SignalStatus,
  safeEvidenceRef?: string,
): Promise<string> {
  return sha256(JSON.stringify({
    status,
    safeEvidenceRef: safeEvidenceRef ?? null,
  }))
}

async function buildSnapshot(input: CheckHistoryRecordInput): Promise<CheckResultSnapshot> {
  if (!isSha256(input.registryScopeHash)) {
    throw new Error('Registry scope hash must be a SHA-256 digest.')
  }
  if (
    !input.assetId
    || !input.checkId
    || !input.resultDiscriminator
    || !SIGNAL_STATUSES.has(input.status)
  ) {
    throw new Error('Check history input is invalid.')
  }

  const evaluatedAt = new Date(input.evaluatedAt)
  if (Number.isNaN(evaluatedAt.getTime())) {
    throw new Error('Check history evaluation time is invalid.')
  }

  return {
    registryScopeHash: input.registryScopeHash,
    assetId: input.assetId,
    checkId: input.checkId,
    resultDiscriminator: input.resultDiscriminator,
    status: input.status,
    evaluatedAt: evaluatedAt.toISOString(),
    safeEvidenceHash: await hashSafeEvidence(input.status, input.safeEvidenceRef),
  }
}

function retentionDeletionKeys(
  entries: readonly CheckHistoryEntry[],
  streamIdentity: Pick<
    CheckResultSnapshot,
    'registryScopeHash' | 'assetId' | 'checkId' | 'resultDiscriminator'
  >,
): number[] {
  const deletions = new Set<number>()
  const streamEntries = entriesForStream(entries, streamIdentity)

  for (const entry of streamEntries.slice(0, -MAX_STREAM_SNAPSHOTS)) {
    deletions.add(entry.key)
  }

  const globallyRetained = entries.filter((entry) => !deletions.has(entry.key))
  const globalOverflow = Math.max(0, globallyRetained.length - MAX_GLOBAL_SNAPSHOTS)
  for (const entry of globallyRetained.slice(0, globalOverflow)) {
    deletions.add(entry.key)
  }

  return [...deletions]
}

function entriesForStream(
  entries: readonly CheckHistoryEntry[],
  identity: Pick<
    CheckResultSnapshot,
    'registryScopeHash' | 'assetId' | 'checkId' | 'resultDiscriminator'
  >,
): CheckHistoryEntry[] {
  return entries.filter((entry) => (
    entry.snapshot.registryScopeHash === identity.registryScopeHash
    && entry.snapshot.assetId === identity.assetId
    && entry.snapshot.checkId === identity.checkId
    && entry.snapshot.resultDiscriminator === identity.resultDiscriminator
  ))
}

function comparisonFromEntries(
  entries: readonly CheckHistoryEntry[],
): Pick<AvailableCheckHistory, 'current' | 'previous'> {
  const current = entries.at(-1)?.snapshot
  const previous = entries.at(-2)?.snapshot
  return {
    ...(current ? { current: copySnapshot(current) } : {}),
    ...(previous ? { previous: copySnapshot(previous) } : {}),
  }
}

function sortEntries(entries: readonly CheckHistoryEntry[]): CheckHistoryEntry[] {
  return [...entries].sort((left, right) => left.key - right.key)
}

function validEntries(entries: readonly CheckHistoryEntry[]): CheckHistoryEntry[] {
  return sortEntries(entries).filter((entry) => (
    Number.isInteger(entry.key)
    && entry.key > 0
    && isCheckResultSnapshot(entry.snapshot)
  ))
}

function equivalentSnapshot(
  left: CheckResultSnapshot,
  right: CheckResultSnapshot,
): boolean {
  return left.status === right.status
    && left.safeEvidenceHash === right.safeEvidenceHash
}

function copySnapshot(snapshot: CheckResultSnapshot): CheckResultSnapshot {
  return {
    registryScopeHash: snapshot.registryScopeHash,
    assetId: snapshot.assetId,
    checkId: snapshot.checkId,
    resultDiscriminator: snapshot.resultDiscriminator,
    status: snapshot.status,
    evaluatedAt: snapshot.evaluatedAt,
    safeEvidenceHash: snapshot.safeEvidenceHash,
  }
}

function isCheckResultSnapshot(value: unknown): value is CheckResultSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CheckResultSnapshot>
  return isSha256(candidate.registryScopeHash)
    && typeof candidate.assetId === 'string'
    && candidate.assetId.length > 0
    && typeof candidate.checkId === 'string'
    && candidate.checkId.length > 0
    && typeof candidate.resultDiscriminator === 'string'
    && candidate.resultDiscriminator.length > 0
    && typeof candidate.status === 'string'
    && SIGNAL_STATUSES.has(candidate.status as SignalStatus)
    && typeof candidate.evaluatedAt === 'string'
    && !Number.isNaN(Date.parse(candidate.evaluatedAt))
    && isSha256(candidate.safeEvidenceHash)
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
}

async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Cryptographic hashing is unavailable.')
  }

  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('IndexedDB is unavailable.'))
  }

  if (!databasePromise) {
    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { autoIncrement: true })
      }
    }
    databasePromise = requestResult(request).then((database) => {
      database.onversionchange = () => {
        database.close()
        databasePromise = undefined
      }
      return database
    }).catch((error) => {
      databasePromise = undefined
      throw error
    })
  }

  return databasePromise
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Check history storage request failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Check history transaction was aborted.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('Check history transaction failed.'))
  })
}
