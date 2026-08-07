import type { SourceFingerprint } from '../types'

export interface PersistentFileHandle extends FileSystemFileHandle {
  queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>
  createWritable(): Promise<FileSystemWritableFileStream>
}

export interface SourceMetadata {
  size: number
  lastModified: number
}

export interface SourceRead extends SourceMetadata {
  raw: string
}

export interface FileConnectorAdapter {
  isSupported(): boolean
  pickSource(): Promise<PersistentFileHandle | undefined>
  queryPermission(handle: PersistentFileHandle, mode: 'read' | 'readwrite'): Promise<PermissionState>
  requestPermission(handle: PersistentFileHandle, mode: 'read' | 'readwrite'): Promise<PermissionState>
  getMetadata(handle: PersistentFileHandle): Promise<SourceMetadata>
  read(handle: PersistentFileHandle): Promise<SourceRead>
  write(handle: PersistentFileHandle, content: string): Promise<void>
}

interface FilePickerWindow extends Window {
  showOpenFilePicker(options?: {
    id?: string
    multiple?: boolean
    types?: Array<{ description?: string; accept: Record<string, string[]> }>
  }): Promise<PersistentFileHandle[]>
}

export class BrowserFileConnector implements FileConnectorAdapter {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window && window.isSecureContext
  }

  async pickSource(): Promise<PersistentFileHandle | undefined> {
    if (!this.isSupported()) return undefined
    try {
      const [handle] = await (window as unknown as FilePickerWindow).showOpenFilePicker({
        id: 'sancussight-registry',
        multiple: false,
        types: [{ description: 'SancusSight registry', accept: { 'application/json': ['.json'] } }],
      })
      return handle
    } catch (error) {
      if (isAbortError(error)) return undefined
      throw error
    }
  }

  queryPermission(handle: PersistentFileHandle, mode: 'read' | 'readwrite'): Promise<PermissionState> {
    return handle.queryPermission({ mode })
  }

  requestPermission(handle: PersistentFileHandle, mode: 'read' | 'readwrite'): Promise<PermissionState> {
    return handle.requestPermission({ mode })
  }

  async getMetadata(handle: PersistentFileHandle): Promise<SourceMetadata> {
    const file = await handle.getFile()
    return { size: file.size, lastModified: file.lastModified }
  }

  async read(handle: PersistentFileHandle): Promise<SourceRead> {
    const file = await handle.getFile()
    return { raw: await file.text(), size: file.size, lastModified: file.lastModified }
  }

  async write(handle: PersistentFileHandle, content: string): Promise<void> {
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
  }
}

export async function fingerprintSource(read: SourceRead): Promise<SourceFingerprint> {
  const bytes = new TextEncoder().encode(read.raw)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  const contentHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return { size: read.size, lastModified: read.lastModified, contentHash }
}

export function metadataMatches(metadata: SourceMetadata, fingerprint?: SourceFingerprint): boolean {
  return Boolean(fingerprint && metadata.size === fingerprint.size && metadata.lastModified === fingerprint.lastModified)
}

export function contentMatches(left?: SourceFingerprint, right?: SourceFingerprint): boolean {
  return Boolean(left && right && left.contentHash === right.contentHash)
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
