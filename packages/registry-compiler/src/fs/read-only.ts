import { lstatSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import type { Stats } from 'node:fs'
import { extname, relative } from 'node:path'

import type {
  ReadOnlyDirectoryEntry,
  ReadOnlyMetadata,
} from '../contracts.ts'
import {
  assertResolvedPathWithinRoot,
  type ConfirmedRoot,
  resolveConfirmedPath,
  RootBoundaryError,
} from './roots.ts'

export class ReadOnlyLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReadOnlyLimitError'
  }
}

export class ManifestFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ManifestFormatError'
  }
}

function toRelative(root: ConfirmedRoot, absolutePath: string): string {
  const value = relative(root.path, absolutePath).replaceAll('\\', '/')
  return value === '' ? '.' : value
}

function kindOf(stats: Stats): ReadOnlyDirectoryEntry['kind'] {
  if (stats.isSymbolicLink()) return 'symlink'
  if (stats.isDirectory()) return 'directory'
  return 'file'
}

export class ReadOnlyFileSystem {
  public readonly root: ConfirmedRoot

  constructor(root: ConfirmedRoot) {
    this.root = root
  }

  listDirectory(relativePath = ''): ReadOnlyDirectoryEntry[] {
    const absolute = relativePath === '' ? this.root.path : resolveConfirmedPath(this.root, relativePath)
    let stats: Stats
    try {
      stats = statSync(absolute)
    } catch {
      throw new RootBoundaryError('Directory cannot be read')
    }
    if (!stats.isDirectory()) throw new RootBoundaryError('Directory cannot be read')

    const names = readdirSync(absolute)
    if (names.length > this.root.maxEntryCount) throw new ReadOnlyLimitError('Directory entry limit exceeded')

    return names.map(name => {
      const child = `${absolute}\\${name}`
      const childStats = lstatSync(child)
      if (childStats.isSymbolicLink()) {
        // Resolve the target only to prove it remains inside the authorized root;
        // callers never receive a dereference operation.
        const target = realpathSync.native(child)
        assertResolvedPathWithinRoot(this.root, target)
      }
      return {
        name,
        relativePath: toRelative(this.root, child),
        kind: kindOf(childStats),
        sizeBytes: childStats.isFile() ? childStats.size : 0,
        modifiedAt: childStats.mtime.toISOString(),
      }
    })
  }

  readMetadata(relativePath: string): ReadOnlyMetadata {
    const absolute = resolveConfirmedPath(this.root, relativePath)
    const stats = lstatSync(absolute)
    if (stats.isFile() && stats.size > this.root.maxFileBytes) {
      throw new ReadOnlyLimitError('File-size limit exceeded')
    }
    return {
      relativePath: toRelative(this.root, absolute),
      kind: kindOf(stats),
      sizeBytes: stats.isFile() ? stats.size : 0,
      modifiedAt: stats.mtime.toISOString(),
      extension: stats.isFile() ? extname(absolute).toLowerCase() || undefined : undefined,
    }
  }

  readAllowlistedManifest(relativePath: string): unknown {
    const metadata = this.readMetadata(relativePath)
    if (metadata.kind !== 'file' || metadata.extension !== '.json') {
      throw new ManifestFormatError('Only bounded JSON manifests are supported')
    }
    const absolute = resolveConfirmedPath(this.root, relativePath)
    const text = readFileSync(absolute, { encoding: 'utf8' })
    try {
      return JSON.parse(text.replace(/^\uFEFF/, '')) as unknown
    } catch {
      throw new ManifestFormatError('Manifest JSON is malformed')
    }
  }
}
