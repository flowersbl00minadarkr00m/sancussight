import type { GovernanceBundleV1 } from '../domain/governance/export'

const DB_NAME = 'sancussight-governance'
const DB_VERSION = 1
const STORE_NAME = 'snapshots'
const SNAPSHOT_KEY = 'manual'

export class GovernanceSnapshotStore {
  async load(): Promise<GovernanceBundleV1 | undefined> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const record = await requestResult<StoredGovernanceSnapshot | undefined>(transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY))
    await transactionComplete(transaction)
    return record?.bundle
  }

  async save(bundle: GovernanceBundleV1): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put({ id: SNAPSHOT_KEY, savedAt: new Date().toISOString(), bundle } satisfies StoredGovernanceSnapshot)
    await transactionComplete(transaction)
  }

  async clear(): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(SNAPSHOT_KEY)
    await transactionComplete(transaction)
  }
}

interface StoredGovernanceSnapshot { id: string; savedAt: string; bundle: GovernanceBundleV1 }

let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable.'))
  if (!databasePromise) {
    const request = globalThis.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    databasePromise = requestResult(request)
  }
  return databasePromise
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error('Governance snapshot storage failed.')) })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onabort = () => reject(transaction.error ?? new Error('Governance snapshot transaction aborted.')); transaction.onerror = () => reject(transaction.error ?? new Error('Governance snapshot transaction failed.')) })
}
