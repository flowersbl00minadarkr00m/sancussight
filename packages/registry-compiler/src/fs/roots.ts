import { lstatSync, realpathSync } from 'node:fs'
import type { Stats } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

export const DEFAULT_MAX_ENTRY_COUNT = 512
export const DEFAULT_MAX_FILE_BYTES = 256 * 1024

export interface ConfirmedRoot {
  rootId: string
  path: string
  platform: string
  portableAlias: string
  maxEntryCount: number
  maxFileBytes: number
}

export interface RootOptions {
  platform?: string
  portableAlias?: string
  maxEntryCount?: number
  maxFileBytes?: number
}

export class RootBoundaryError extends Error {
  constructor(message = 'Path is outside the confirmed root') {
    super(message)
    this.name = 'RootBoundaryError'
  }
}

export class RootConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RootConfigurationError'
  }
}

function isLink(stats: Stats): boolean {
  return stats.isSymbolicLink()
}

function normalized(value: string): string {
  return resolve(value).toLocaleLowerCase()
}

export function isPathWithinRoot(rootPath: string, candidatePath: string): boolean {
  const root = normalized(rootPath)
  const candidate = normalized(candidatePath)
  const remainder = relative(root, candidate)
  return remainder === '' || (!remainder.startsWith('..') && !isAbsolute(remainder))
}

function realPathIfPresent(path: string): string {
  try {
    return realpathSync.native(path)
  } catch {
    return resolve(path)
  }
}

export function normalizeConfirmedRoot(rootId: string, inputPath: string, options: RootOptions = {}): ConfirmedRoot {
  if (!rootId || !inputPath) throw new RootConfigurationError('Root identity and path are required')

  const candidate = resolve(inputPath)
  let stats: Stats
  try {
    stats = lstatSync(candidate)
  } catch {
    throw new RootConfigurationError('Confirmed root does not exist')
  }
  if (!stats.isDirectory() || isLink(stats)) {
    throw new RootConfigurationError('Confirmed root must be a real directory')
  }

  const canonical = realPathIfPresent(candidate)
  if (!isPathWithinRoot(canonical, candidate) || !isPathWithinRoot(candidate, canonical)) {
    throw new RootConfigurationError('Confirmed root resolves outside itself')
  }

  const maxEntryCount = options.maxEntryCount ?? DEFAULT_MAX_ENTRY_COUNT
  const maxFileBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES
  if (!Number.isSafeInteger(maxEntryCount) || maxEntryCount < 1 || maxEntryCount > 100_000) {
    throw new RootConfigurationError('Invalid entry bound')
  }
  if (!Number.isSafeInteger(maxFileBytes) || maxFileBytes < 1 || maxFileBytes > 50 * 1024 * 1024) {
    throw new RootConfigurationError('Invalid file-size bound')
  }

  return {
    rootId,
    path: canonical,
    platform: options.platform ?? process.platform,
    portableAlias: options.portableAlias ?? `root:${rootId}`,
    maxEntryCount,
    maxFileBytes,
  }
}

export function resolveConfirmedPath(root: ConfirmedRoot, requestedPath: string): string {
  if (!requestedPath || isAbsolute(requestedPath)) throw new RootBoundaryError()
  const candidate = resolve(root.path, requestedPath)
  if (!isPathWithinRoot(root.path, candidate)) throw new RootBoundaryError()

  // Resolve the full path, including every ancestor, before any metadata read.
  // This prevents an in-root textual path such as `link/file.json` from
  // traversing a junction or symlink to an external directory.
  const canonicalCandidate = realPathIfPresent(candidate)
  if (!isPathWithinRoot(root.path, canonicalCandidate)) throw new RootBoundaryError()

  let stat: Stats
  try {
    stat = lstatSync(candidate)
  } catch {
    throw new RootBoundaryError('Path does not exist inside the confirmed root')
  }

  if (isLink(stat)) {
    const target = realPathIfPresent(candidate)
    if (!isPathWithinRoot(root.path, target)) throw new RootBoundaryError()
  }

  return candidate
}

export function assertResolvedPathWithinRoot(root: ConfirmedRoot, candidate: string): void {
  if (!isPathWithinRoot(root.path, candidate)) throw new RootBoundaryError()
}
