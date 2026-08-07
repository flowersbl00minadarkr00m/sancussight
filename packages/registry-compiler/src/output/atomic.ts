import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute } from 'node:path'

export interface AtomicWriteEntry {
  path: string
  value: unknown
}

export interface AtomicWriteOptions {
  now?: string
  validate?: (value: unknown, path: string) => void
  fileSystem?: AtomicFileSystem
}

export interface AtomicFileSystem {
  exists: (path: string) => boolean
  mkdir: (path: string) => void
  write: (path: string, value: string) => void
  rename: (from: string, to: string) => void
  unlink: (path: string) => void
}

export interface AtomicWriteResult {
  backups: string[]
  paths: string[]
}

export class AtomicWriteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AtomicWriteError'
  }
}

const defaultFileSystem: AtomicFileSystem = {
  exists: existsSync,
  mkdir: path => mkdirSync(path, { recursive: true }),
  write: (path, value) => writeFileSync(path, value, { encoding: 'utf8', flag: 'wx' }),
  rename: renameSync,
  unlink: path => unlinkSync(path),
}

function backupPath(path: string, now: string): string {
  const stamp = now.replace(/[^0-9A-Za-z-]/g, '-')
  return `${path}.backup-${stamp}`
}

export function writeAtomicSet(entries: AtomicWriteEntry[], options: AtomicWriteOptions = {}): AtomicWriteResult {
  if (entries.length === 0) throw new AtomicWriteError('No output files were provided')
  const fileSystem = options.fileSystem ?? defaultFileSystem
  const now = options.now ?? new Date().toISOString()
  const prepared = entries.map(entry => {
    if (!isAbsolute(entry.path)) throw new AtomicWriteError('Atomic output paths must be absolute')
    options.validate?.(entry.value, entry.path)
    return {
      ...entry,
      text: `${JSON.stringify(entry.value, null, 2)}\n`,
      temp: `${entry.path}.tmp-${randomBytes(8).toString('hex')}`,
      backup: backupPath(entry.path, now),
    }
  })

  const movedBackups: typeof prepared = []
  const committed: typeof prepared = []
  try {
    prepared.forEach(entry => {
      fileSystem.mkdir(dirname(entry.path))
      fileSystem.write(entry.temp, entry.text)
    })
    prepared.forEach(entry => {
      if (fileSystem.exists(entry.path)) {
        fileSystem.rename(entry.path, entry.backup)
        movedBackups.push(entry)
      }
    })
    prepared.forEach(entry => {
      fileSystem.rename(entry.temp, entry.path)
      committed.push(entry)
    })
    return { backups: movedBackups.map(entry => entry.backup), paths: prepared.map(entry => entry.path) }
  } catch (error) {
    for (const entry of committed.reverse()) {
      try { if (fileSystem.exists(entry.path)) fileSystem.unlink(entry.path) } catch { /* best-effort rollback */ }
    }
    for (const entry of movedBackups.reverse()) {
      try { if (fileSystem.exists(entry.backup)) fileSystem.rename(entry.backup, entry.path) } catch { /* best-effort rollback */ }
    }
    for (const entry of prepared) {
      try { if (fileSystem.exists(entry.temp)) fileSystem.unlink(entry.temp) } catch { /* best-effort cleanup */ }
    }
    const message = error instanceof Error ? error.message : 'Atomic output replacement failed'
    throw new AtomicWriteError(message)
  }
}

export function writeAtomicJson(path: string, value: unknown, options: AtomicWriteOptions = {}): AtomicWriteResult {
  return writeAtomicSet([{ path, value }], options)
}
