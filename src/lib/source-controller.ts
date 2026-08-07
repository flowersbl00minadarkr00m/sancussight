import type {
  FileConnectionState,
  PersistedFileConnection,
  Registry,
  RegistrySession,
  SourcePermission,
  WorkingRegistryCache,
} from '../types'
import type { ConnectionStore } from './connection-store.ts'
import { createConnectionActivity } from './connection-store.ts'
import type { FileConnectorAdapter, PersistentFileHandle, SourceRead } from './file-connector.ts'
import { contentMatches, fingerprintSource, metadataMatches } from './file-connector.ts'
import { normalizeRegistry, prepareLocalSave } from './session.ts'
import { canWriteSource, createSourceState, transitionSourceState } from './source-state.ts'

export type SourceOperationOutcome =
  | 'success'
  | 'cancelled'
  | 'error'
  | 'conflict'
  | 'permission-required'
  | 'unavailable'

export interface SourceOperationResult {
  outcome: SourceOperationOutcome
  session?: RegistrySession
  message?: string
}

export class SourceController {
  private activeConnection?: PersistedFileConnection
  private refreshPromise?: Promise<SourceOperationResult>
  private readonly adapter: FileConnectorAdapter
  private readonly store: ConnectionStore
  private readonly now: () => string

  constructor(
    adapter: FileConnectorAdapter,
    store: ConnectionStore,
    now: () => string = () => new Date().toISOString(),
  ) {
    this.adapter = adapter
    this.store = store
    this.now = now
  }

  isPersistentAccessSupported(): boolean {
    return this.adapter.isSupported()
  }

  async connect(confirmReplace?: (sourceName: string) => boolean): Promise<SourceOperationResult> {
    if (!this.adapter.isSupported()) return { outcome: 'unavailable', message: 'Persistent file access is unavailable.' }

    try {
      const handle = await this.adapter.pickSource()
      if (!handle) return { outcome: 'cancelled', message: 'File selection cancelled.' }

      const read = await this.adapter.read(handle)
      const registry = parseRegistry(read.raw)
      if (!registry) return { outcome: 'error', message: 'The selected file is not a valid SancusSight registry.' }

      if (registry.provenance?.mode === 'demo') {
        return {
          outcome: 'success',
          session: { registry, mode: 'demo', sourceKind: 'demo', dirty: false },
          message: 'Demo provenance was preserved; the file was not connected as canonical evidence.',
        }
      }

      const existingCache = await this.store.loadCache()
      if (existingCache && !(confirmReplace?.(handle.name) ?? false)) {
        return { outcome: 'cancelled', message: 'Replacement cancelled. The current workspace was not changed.' }
      }

      const acceptedFingerprint = await fingerprintSource(read)
      const writePermission = toSourcePermission(await this.adapter.queryPermission(handle, 'readwrite'))
      const state: FileConnectionState = {
        kind: 'file',
        sourceName: handle.name,
        readPermission: 'granted',
        writePermission,
        syncState: 'current',
        lastReadAt: this.now(),
        acceptedFingerprint,
      }
      const session: RegistrySession = {
        registry,
        mode: 'local',
        sourceKind: 'file',
        dirty: false,
        connection: state,
        cacheState: 'authoritative-read',
      }
      const persisted: PersistedFileConnection = { id: 'canonical', handle, state }
      await this.store.saveConnectionAndCache(persisted, toCache(session, this.now()))
      this.activeConnection = persisted
      await this.record('connect', 'succeeded', handle.name)
      return { outcome: 'success', session, message: `Connected ${handle.name}.` }
    } catch (error) {
      return { outcome: 'error', message: boundedError(error, 'The registry could not be connected.') }
    }
  }

  async restore(): Promise<SourceOperationResult> {
    try {
      const cache = await this.store.loadCache()
      if (!cache) return { outcome: 'unavailable', message: 'No saved registry workspace was found.' }

      const persisted = await this.store.loadConnection()
      if (!persisted) {
        return { outcome: 'success', session: sessionFromCache(cache), message: 'Imported snapshot restored.' }
      }

      this.activeConnection = persisted
      const permission = toSourcePermission(await this.adapter.queryPermission(asPersistentHandle(persisted.handle), 'read'))
      if (permission !== 'granted') {
        const session = withPermissionRequired(sessionFromCache(cache, persisted.state), persisted.state, permission)
        await this.persistSession(session, persisted)
        await this.record('permission', 'blocked', persisted.state.sourceName, 'Read permission is required.')
        return { outcome: 'permission-required', session, message: 'Permission is required to verify the canonical file.' }
      }

      return this.refresh(sessionFromCache(cache, persisted.state), 'focus')
    } catch (error) {
      return { outcome: 'error', message: boundedError(error, 'The saved workspace could not be restored.') }
    }
  }

  refresh(session: RegistrySession, reason: 'manual' | 'focus' = 'manual'): Promise<SourceOperationResult> {
    if (this.refreshPromise) return this.refreshPromise
    const operation = this.checkSource(session, reason).finally(() => {
      if (this.refreshPromise === operation) this.refreshPromise = undefined
    })
    this.refreshPromise = operation
    return operation
  }

  async reauthorize(session: RegistrySession): Promise<SourceOperationResult> {
    const persisted = await this.getConnection()
    if (!persisted) return { outcome: 'unavailable', session, message: 'No canonical source is connected.' }

    try {
      const permission = toSourcePermission(await this.adapter.requestPermission(asPersistentHandle(persisted.handle), 'read'))
      if (permission !== 'granted') {
        const next = withPermissionRequired(session, persisted.state, permission)
        await this.persistSession(next, persisted)
        await this.record('permission', 'blocked', persisted.state.sourceName, 'Read permission was not granted.')
        return { outcome: 'permission-required', session: next, message: 'Read permission was not granted.' }
      }
      return this.refresh(session, 'manual')
    } catch (error) {
      return { outcome: 'error', session, message: boundedError(error, 'Permission could not be restored.') }
    }
  }

  async save(session: RegistrySession): Promise<SourceOperationResult> {
    const persisted = await this.getConnection()
    if (!persisted || !session.connection) return { outcome: 'unavailable', session, message: 'No canonical source is connected.' }

    const sourceState = sourceStateFromSession(session)
    if (!canWriteSource(sourceState)) {
      return {
        outcome: sourceState.syncState === 'conflict' ? 'conflict' : 'error',
        session,
        message: sourceState.syncState === 'conflict' ? 'Resolve the source conflict before saving.' : 'There are no writable source changes.',
      }
    }

    const handle = asPersistentHandle(persisted.handle)
    try {
      let writePermission = toSourcePermission(await this.adapter.queryPermission(handle, 'readwrite'))
      if (writePermission !== 'granted') {
        writePermission = toSourcePermission(await this.adapter.requestPermission(handle, 'readwrite'))
      }
      if (writePermission !== 'granted') {
        const connection = { ...session.connection, writePermission }
        const next = { ...session, connection }
        await this.persistSession(next, persisted)
        await this.record('permission', 'blocked', connection.sourceName, 'Write permission was not granted.')
        return { outcome: 'permission-required', session: next, message: 'Write permission was not granted.' }
      }

      const preflightRead = await this.adapter.read(handle)
      const preflightFingerprint = await fingerprintSource(preflightRead)
      if (!contentMatches(preflightFingerprint, session.connection.acceptedFingerprint)) {
        const conflicted = transitionSourceState(sourceState, { type: 'save-preflight-changed' })
        const next = withSourceState(session, conflicted)
        await this.persistSession(next, persisted)
        await this.record('conflict', 'blocked', session.connection.sourceName, 'Source changed before write.')
        return { outcome: 'conflict', session: next, message: 'The canonical file changed. Resolve the conflict before saving.' }
      }

      const registryToWrite = prepareLocalSave(session.registry, this.now())
      const content = JSON.stringify({ ...registryToWrite, schemaVersion: 2 }, null, 2)
      await this.adapter.write(handle, content)

      const verificationRead = await this.adapter.read(handle)
      const verificationFingerprint = await fingerprintSource(verificationRead)
      const expectedFingerprint = await fingerprintSource({
        raw: content,
        size: new TextEncoder().encode(content).byteLength,
        lastModified: verificationRead.lastModified,
      })
      const verifiedRegistry = parseRegistry(verificationRead.raw)
      if (!verifiedRegistry || !contentMatches(verificationFingerprint, expectedFingerprint)) {
        const failed = transitionSourceState(sourceState, { type: 'save-preflight-changed' })
        const next = withSourceState(session, failed)
        await this.persistSession(next, persisted)
        await this.record('write', 'failed', session.connection.sourceName, 'Post-write verification failed.')
        return { outcome: 'error', session: next, message: 'The source write could not be verified. Refresh before retrying.' }
      }

      const succeeded = transitionSourceState(sourceState, { type: 'write-succeeded' })
      const connection: FileConnectionState = {
        ...session.connection,
        ...connectionFields(succeeded),
        writePermission: 'granted',
        acceptedFingerprint: verificationFingerprint,
        lastReadAt: this.now(),
        error: undefined,
      }
      const next: RegistrySession = {
        ...session,
        registry: verifiedRegistry,
        dirty: false,
        connection,
        cacheState: 'authoritative-read',
      }
      await this.persistSession(next, persisted)
      await this.record('write', 'succeeded', connection.sourceName)
      return { outcome: 'success', session: next, message: `Saved ${connection.sourceName}.` }
    } catch (error) {
      const failed = transitionSourceState(sourceState, { type: 'write-failed', error: boundedError(error, 'Source write failed.') })
      const next = withSourceState(session, failed)
      try { await this.persistSession(next, persisted) } catch { /* Preserve the in-memory recovery copy. */ }
      await this.record('write', 'failed', session.connection.sourceName, 'Source write failed.')
      return { outcome: 'error', session: next, message: boundedError(error, 'The source could not be saved.') }
    }
  }

  async saveWorkingCopy(session: RegistrySession): Promise<void> {
    const persisted = await this.getConnection()
    if (session.connection && persisted) {
      await this.persistSession(session, persisted)
      return
    }
    await this.store.saveCache(toCache(session, this.now()))
  }

  async replaceWithSnapshot(session: RegistrySession): Promise<void> {
    await this.store.replaceWithSnapshot(toCache(session, this.now()))
    const sourceName = this.activeConnection?.state.sourceName
    this.activeConnection = undefined
    await this.record('replace', 'succeeded', sourceName, 'Connected source replaced by an imported snapshot.')
  }

  async reloadSource(session: RegistrySession): Promise<SourceOperationResult> {
    if (!session.connection) return { outcome: 'unavailable', session, message: 'No canonical source is connected.' }
    const reloadable: RegistrySession = {
      ...session,
      dirty: false,
      connection: { ...session.connection, syncState: 'external-change' },
    }
    return this.refresh(reloadable, 'manual')
  }

  async disconnect(): Promise<void> {
    const sourceName = this.activeConnection?.state.sourceName
    await this.store.disconnect()
    this.activeConnection = undefined
    await this.record('disconnect', 'succeeded', sourceName)
  }

  private async checkSource(session: RegistrySession, reason: 'manual' | 'focus'): Promise<SourceOperationResult> {
    const persisted = await this.getConnection()
    if (!persisted || !session.connection) return { outcome: 'unavailable', session, message: 'No canonical source is connected.' }

    const handle = asPersistentHandle(persisted.handle)
    try {
      const permission = toSourcePermission(await this.adapter.queryPermission(handle, 'read'))
      if (permission !== 'granted') {
        const next = withPermissionRequired(session, session.connection, permission)
        await this.persistSession(next, persisted)
        return { outcome: 'permission-required', session: next, message: 'Permission is required to read the canonical file.' }
      }

      if (reason === 'focus' && session.connection.acceptedFingerprint) {
        const metadata = await this.adapter.getMetadata(handle)
        if (metadataMatches(metadata, session.connection.acceptedFingerprint)) {
          const unchanged = transitionSourceState(sourceStateFromSession(session), { type: 'source-unchanged' })
          const next = withSourceState(session, unchanged)
          await this.persistSession(next, persisted)
          return { outcome: 'success', session: next }
        }
      }

      const read = await this.adapter.read(handle)
      return this.acceptSourceRead(session, persisted, read, reason)
    } catch (error) {
      const connection = {
        ...session.connection,
        syncState: 'permission-required' as const,
        readPermission: 'prompt' as const,
        error: boundedError(error, 'Source read failed.'),
      }
      const next = { ...session, connection, cacheState: 'recovery-only' as const }
      try { await this.persistSession(next, persisted) } catch { /* Keep in-memory cache. */ }
      await this.record('refresh', 'failed', connection.sourceName, 'Source read failed.')
      return { outcome: 'error', session: next, message: boundedError(error, 'The canonical file could not be read.') }
    }
  }

  private async acceptSourceRead(
    session: RegistrySession,
    persisted: PersistedFileConnection,
    read: SourceRead,
    reason: 'manual' | 'focus',
  ): Promise<SourceOperationResult> {
    const fingerprint = await fingerprintSource(read)
    const sourceState = sourceStateFromSession(session)

    if (contentMatches(fingerprint, session.connection?.acceptedFingerprint)) {
      const unchanged = transitionSourceState(sourceState, { type: 'source-unchanged' })
      const connection: FileConnectionState = {
        ...session.connection!,
        ...connectionFields(unchanged),
        readPermission: 'granted',
        acceptedFingerprint: fingerprint,
        lastReadAt: this.now(),
        error: undefined,
      }
      const next = { ...session, connection, cacheState: 'authoritative-read' as const }
      await this.persistSession(next, persisted)
      await this.record('refresh', 'succeeded', connection.sourceName, reason)
      return { outcome: 'success', session: next, message: 'The canonical file is unchanged.' }
    }

    const registry = parseRegistry(read.raw)
    if (!registry) {
      const invalid = transitionSourceState(sourceState, { type: 'source-changed-invalid', error: 'The changed source is not a valid registry.' })
      const next = { ...withSourceState(session, invalid), cacheState: 'recovery-only' as const }
      await this.persistSession(next, persisted)
      await this.record('refresh', 'failed', session.connection?.sourceName, 'Changed source was invalid.')
      return {
        outcome: invalid.syncState === 'conflict' ? 'conflict' : 'error',
        session: next,
        message: 'The canonical file changed but is invalid. The last valid working copy remains active.',
      }
    }

    if (session.dirty) {
      const conflicted = transitionSourceState(sourceState, { type: 'source-changed-valid' })
      const next = { ...withSourceState(session, conflicted), cacheState: 'recovery-only' as const }
      await this.persistSession(next, persisted)
      await this.record('conflict', 'blocked', session.connection?.sourceName, 'Source and working copy both changed.')
      return { outcome: 'conflict', session: next, message: 'The source and working copy both changed.' }
    }

    const current = transitionSourceState(sourceState, { type: 'source-changed-valid' })
    const connection: FileConnectionState = {
      ...session.connection!,
      ...connectionFields(current),
      readPermission: 'granted',
      acceptedFingerprint: fingerprint,
      lastReadAt: this.now(),
      error: undefined,
    }
    const next: RegistrySession = {
      ...session,
      registry,
      mode: registry.provenance?.mode ?? 'local',
      dirty: false,
      connection,
      cacheState: 'authoritative-read',
    }
    await this.persistSession(next, persisted)
    await this.record('refresh', 'succeeded', connection.sourceName, reason)
    return { outcome: 'success', session: next, message: `Refreshed ${connection.sourceName}.` }
  }

  private async getConnection(): Promise<PersistedFileConnection | undefined> {
    if (this.activeConnection) return this.activeConnection
    try {
      this.activeConnection = await this.store.loadConnection()
      return this.activeConnection
    } catch {
      return undefined
    }
  }

  private async persistSession(session: RegistrySession, persisted: PersistedFileConnection): Promise<void> {
    if (!session.connection) {
      await this.store.saveCache(toCache(session, this.now()))
      return
    }
    const connection = { ...persisted, state: session.connection }
    await this.store.saveConnectionAndCache(connection, toCache(session, this.now()))
    this.activeConnection = connection
  }

  private async record(
    operation: Parameters<typeof createConnectionActivity>[0],
    outcome: Parameters<typeof createConnectionActivity>[1],
    sourceName?: string,
    detail?: string,
  ): Promise<void> {
    try {
      await this.store.appendActivity(createConnectionActivity(operation, outcome, sourceName, this.now(), detail))
    } catch {
      // Activity failure must not invalidate an otherwise safe source operation.
    }
  }
}

function parseRegistry(raw: string): Registry | undefined {
  try {
    return normalizeRegistry(JSON.parse(raw), { defaultMode: 'local' })
  } catch {
    return undefined
  }
}

function toCache(session: RegistrySession, savedAt: string): WorkingRegistryCache {
  return {
    id: 'working',
    registry: session.registry,
    sourceKind: session.sourceKind ?? (session.mode === 'demo' ? 'demo' : 'snapshot'),
    dirty: session.dirty ?? false,
    savedAt,
    ...(session.connection?.acceptedFingerprint ? { acceptedFingerprint: session.connection.acceptedFingerprint } : {}),
    ...(session.connection ? { connection: session.connection } : {}),
  }
}

function sessionFromCache(cache: WorkingRegistryCache, connection = cache.connection): RegistrySession {
  return {
    registry: cache.registry,
    mode: cache.registry.provenance?.mode ?? 'local',
    sourceKind: connection ? 'file' : cache.sourceKind,
    dirty: cache.dirty,
    ...(connection ? { connection } : {}),
    cacheState: connection ? 'recovery-only' : 'authoritative-read',
  }
}

function withPermissionRequired(
  session: RegistrySession,
  connection: FileConnectionState,
  permission: SourcePermission,
): RegistrySession {
  const sourceState = transitionSourceState(sourceStateFromSession(session), {
    type: 'permission-changed',
    mode: 'read',
    permission,
  })
  return {
    ...withSourceState(session, sourceState),
    connection: { ...connection, ...connectionFields(sourceState), readPermission: permission },
    cacheState: 'recovery-only',
  }
}

function sourceStateFromSession(session: RegistrySession) {
  const connection = session.connection
  return createSourceState({
    syncState: connection?.syncState ?? (session.dirty ? 'unsaved' : 'current'),
    dirty: session.dirty ?? false,
    externalChange: connection?.syncState === 'external-change' || connection?.syncState === 'conflict',
    readPermission: connection?.readPermission ?? 'granted',
    writePermission: connection?.writePermission ?? 'prompt',
    error: connection?.error,
  })
}

function withSourceState(session: RegistrySession, state: ReturnType<typeof createSourceState>): RegistrySession {
  if (!session.connection) return { ...session, dirty: state.dirty }
  return {
    ...session,
    dirty: state.dirty,
    connection: { ...session.connection, ...connectionFields(state) },
  }
}

function connectionFields(state: ReturnType<typeof createSourceState>) {
  return {
    syncState: state.syncState,
    readPermission: state.readPermission,
    writePermission: state.writePermission,
    ...(state.error ? { error: state.error } : { error: undefined }),
  }
}

function toSourcePermission(permission: PermissionState): SourcePermission {
  return permission
}

function asPersistentHandle(handle: FileSystemFileHandle): PersistentFileHandle {
  return handle as PersistentFileHandle
}

function boundedError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback
  if (error.name === 'NotFoundError') return 'The canonical file is unavailable. Reauthorize it, connect a replacement, or export the recovery copy.'
  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'The browser blocked source access. Reauthorize the file or connect a replacement.'
  if (error.name === 'QuotaExceededError') return 'Browser recovery storage is full. Export the working copy before continuing.'
  const message = error.message.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').slice(0, 200)
  return message || fallback
}
