import type {
  ConnectionActivity,
  ConnectionOperation,
  PersistedFileConnection,
  WorkingRegistryCache,
} from '../types'
import { normalizeRegistry } from './session.ts'

const DB_NAME = 'sancussight'
const DB_VERSION = 1
const CONNECTION_STORE = 'connections'
const CACHE_STORE = 'cache'
const ACTIVITY_STORE = 'activity'
const LEGACY_STORAGE_KEY = 'sancussight:v1'

export interface LegacyStorage {
  getItem(key: string): string | null
  removeItem(key: string): void
}

export interface ConnectionStore {
  loadConnection(): Promise<PersistedFileConnection | undefined>
  loadCache(): Promise<WorkingRegistryCache | undefined>
  saveConnectionAndCache(connection: PersistedFileConnection, cache: WorkingRegistryCache): Promise<void>
  replaceWithSnapshot(cache: WorkingRegistryCache): Promise<void>
  saveCache(cache: WorkingRegistryCache): Promise<void>
  appendActivity(activity: ConnectionActivity): Promise<void>
  listActivity(): Promise<ConnectionActivity[]>
  disconnect(): Promise<void>
}

export class IndexedDbConnectionStore implements ConnectionStore {
  async loadConnection(): Promise<PersistedFileConnection | undefined> {
    const db = await openDatabase()
    return readRecord<PersistedFileConnection>(db, CONNECTION_STORE, 'canonical')
  }

  async loadCache(): Promise<WorkingRegistryCache | undefined> {
    const db = await openDatabase()
    return readRecord<WorkingRegistryCache>(db, CACHE_STORE, 'working')
  }

  async saveConnectionAndCache(connection: PersistedFileConnection, cache: WorkingRegistryCache): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction([CONNECTION_STORE, CACHE_STORE], 'readwrite')
    transaction.objectStore(CONNECTION_STORE).put(connection)
    transaction.objectStore(CACHE_STORE).put(cache)
    await transactionComplete(transaction)
  }

  async saveCache(cache: WorkingRegistryCache): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction(CACHE_STORE, 'readwrite')
    transaction.objectStore(CACHE_STORE).put(cache)
    await transactionComplete(transaction)
  }

  async replaceWithSnapshot(cache: WorkingRegistryCache): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction([CONNECTION_STORE, CACHE_STORE], 'readwrite')
    transaction.objectStore(CONNECTION_STORE).delete('canonical')
    transaction.objectStore(CACHE_STORE).put(cache)
    await transactionComplete(transaction)
  }

  async appendActivity(activity: ConnectionActivity): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction(ACTIVITY_STORE, 'readwrite')
    transaction.objectStore(ACTIVITY_STORE).put(activity)
    await transactionComplete(transaction)
  }

  async listActivity(): Promise<ConnectionActivity[]> {
    const db = await openDatabase()
    const transaction = db.transaction(ACTIVITY_STORE, 'readonly')
    const completed = transactionComplete(transaction)
    const records = await requestResult<ConnectionActivity[]>(transaction.objectStore(ACTIVITY_STORE).getAll())
    await completed
    return records.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
  }

  async disconnect(): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction([CONNECTION_STORE, CACHE_STORE], 'readwrite')
    transaction.objectStore(CONNECTION_STORE).delete('canonical')
    transaction.objectStore(CACHE_STORE).delete('working')
    await transactionComplete(transaction)
  }
}

export function createMemoryConnectionStore(): ConnectionStore {
  let connection: PersistedFileConnection | undefined
  let cache: WorkingRegistryCache | undefined
  const activity: ConnectionActivity[] = []

  return {
    async loadConnection() { return connection },
    async loadCache() { return cache },
    async saveConnectionAndCache(nextConnection, nextCache) {
      connection = nextConnection
      cache = nextCache
    },
    async saveCache(nextCache) { cache = nextCache },
    async replaceWithSnapshot(nextCache) {
      connection = undefined
      cache = nextCache
    },
    async appendActivity(entry) { activity.push(entry) },
    async listActivity() { return [...activity].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)) },
    async disconnect() {
      connection = undefined
      cache = undefined
    },
  }
}

export async function migrateLegacyLocalRegistry(
  store: ConnectionStore,
  storage: LegacyStorage,
  now = new Date().toISOString(),
): Promise<'migrated' | 'skipped' | 'invalid'> {
  if (await store.loadCache()) return 'skipped'

  const raw = storage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return 'skipped'

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return 'invalid'
  }

  const registry = normalizeRegistry(value, { defaultMode: 'local' })
  if (!registry || registry.provenance?.mode !== 'local') return 'invalid'

  await store.saveCache({
    id: 'working',
    registry,
    sourceKind: 'snapshot',
    dirty: false,
    savedAt: now,
  })
  storage.removeItem(LEGACY_STORAGE_KEY)
  return 'migrated'
}

export async function disconnectConnectionState(store: ConnectionStore, storage?: LegacyStorage): Promise<void> {
  await store.disconnect()
  storage?.removeItem(LEGACY_STORAGE_KEY)
}

export function createConnectionActivity(
  operation: ConnectionOperation,
  outcome: ConnectionActivity['outcome'],
  sourceName?: string,
  occurredAt = new Date().toISOString(),
  detail?: string,
): ConnectionActivity {
  return {
    id: globalThis.crypto.randomUUID(),
    occurredAt,
    operation,
    outcome,
    ...(sourceName ? { sourceName: safeSourceName(sourceName) } : {}),
    ...(detail ? { detail: safeDetail(detail) } : {}),
  }
}

export function safeSourceName(value: string): string {
  const normalized = value.replaceAll('\\', '/').split('/').filter(Boolean).at(-1) ?? 'Local registry'
  return normalized.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160) || 'Local registry'
}

function safeDetail(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').slice(0, 240)
}

let databasePromise: Promise<IDBDatabase> | undefined

async function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) throw new Error('IndexedDB is unavailable in this browser.')

  if (!databasePromise) {
    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(CONNECTION_STORE)) db.createObjectStore(CONNECTION_STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE, { keyPath: 'id' })
    }
    databasePromise = requestResult(request).then((db) => {
      db.onversionchange = () => {
        db.close()
        databasePromise = undefined
      }
      return db
    }).catch((error) => {
      databasePromise = undefined
      throw error
    })
  }

  return databasePromise
}

async function readRecord<T>(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const transaction = db.transaction(storeName, 'readonly')
  const completed = transactionComplete(transaction)
  const value = await requestResult<T | undefined>(transaction.objectStore(storeName).get(key))
  await completed
  return value
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
  })
}
