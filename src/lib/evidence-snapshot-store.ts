import type { EvidenceEnvelopeV1, ReleaseEvidenceManifestV1 } from '../types'

const DB_NAME = 'sancussight-evidence'
const STORE_NAME = 'snapshots'
const SNAPSHOT_KEY = 'manual'

interface StoredEvidenceSnapshot {
  id: typeof SNAPSHOT_KEY
  savedAt: string
  evidence: EvidenceEnvelopeV1[]
  releaseManifest?: ReleaseEvidenceManifestV1
}

export class EvidenceSnapshotStore {
  async load(): Promise<{ evidence: EvidenceEnvelopeV1[]; releaseManifest?: ReleaseEvidenceManifestV1 }> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const record = await requestResult<StoredEvidenceSnapshot | undefined>(transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY))
    await transactionComplete(transaction)
    return { evidence: record?.evidence ?? [], ...(record?.releaseManifest ? { releaseManifest: record.releaseManifest } : {}) }
  }

  async save(evidence: EvidenceEnvelopeV1[], releaseManifest?: ReleaseEvidenceManifestV1): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const completed = transactionComplete(transaction)
    transaction.objectStore(STORE_NAME).put({ id: SNAPSHOT_KEY, savedAt: new Date().toISOString(), evidence, ...(releaseManifest ? { releaseManifest } : {}) } satisfies StoredEvidenceSnapshot)
    await completed
  }

  async clear(): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const completed = transactionComplete(transaction)
    transaction.objectStore(STORE_NAME).delete(SNAPSHOT_KEY)
    await completed
  }
}

let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable.'))
  if (!databasePromise) {
    const request = globalThis.indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    databasePromise = requestResult(request).then((database) => {
      database.onversionchange = () => { database.close(); databasePromise = undefined }
      return database
    }).catch((error) => { databasePromise = undefined; throw error })
  }
  return databasePromise
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Evidence snapshot storage failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Evidence snapshot transaction was aborted.'))
    transaction.onerror = () => reject(transaction.error ?? new Error('Evidence snapshot transaction failed.'))
  })
}
