import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { ReadOnlyFileSystem } from '../fs/read-only.ts'
import {
  normalizeConfirmedRoot,
  RootBoundaryError,
} from '../fs/roots.ts'

function withTempRoot(run: (rootPath: string) => void): void {
  const rootPath = mkdtempSync(join(tmpdir(), 'sancussight-registry-'))
  try {
    run(rootPath)
  } finally {
    rmSync(rootPath, { recursive: true, force: true })
  }
}

test('out-of-root paths cannot be read', () => {
  withTempRoot(rootPath => {
    writeFileSync(join(rootPath, 'inside.json'), '{}')
    const outsidePath = join(rootPath, '..', 'outside-registry.json')
    writeFileSync(outsidePath, '{}')
    try {
      const fileSystem = new ReadOnlyFileSystem(normalizeConfirmedRoot('test', rootPath))
      assert.throws(() => fileSystem.readMetadata('../outside-registry.json'), RootBoundaryError)
    } finally {
      rmSync(outsidePath, { force: true })
    }
  })
})

test('oversized files fail closed at the metadata seam', () => {
  withTempRoot(rootPath => {
    writeFileSync(join(rootPath, 'large.json'), 'x'.repeat(20))
    const root = normalizeConfirmedRoot('test', rootPath, { maxFileBytes: 10 })
    const fileSystem = new ReadOnlyFileSystem(root)
    assert.throws(() => fileSystem.readMetadata('large.json'), /size limit/i)
  })
})

test('malformed and unsupported manifests are isolated', () => {
  withTempRoot(rootPath => {
    writeFileSync(join(rootPath, 'malformed.json'), '{')
    writeFileSync(join(rootPath, 'notes.txt'), 'not a manifest')
    const fileSystem = new ReadOnlyFileSystem(normalizeConfirmedRoot('test', rootPath))
    assert.throws(() => fileSystem.readAllowlistedManifest('malformed.json'), /malformed/i)
    assert.throws(() => fileSystem.readAllowlistedManifest('notes.txt'), /only bounded JSON/i)
  })
})

test('link escapes cannot be read', t => {
  withTempRoot(rootPath => {
    const outsidePath = mkdtempSync(join(tmpdir(), 'sancussight-outside-'))
    const linkPath = join(rootPath, 'outside-link')
    try {
      writeFileSync(join(outsidePath, 'secret.json'), '{}')
      try {
        symlinkSync(outsidePath, linkPath, 'junction')
      } catch {
        t.skip('native link creation is unavailable in this environment')
        return
      }
      const fileSystem = new ReadOnlyFileSystem(normalizeConfirmedRoot('test', rootPath))
      assert.throws(() => fileSystem.readMetadata('outside-link/secret.json'), RootBoundaryError)
      assert.throws(() => fileSystem.listDirectory(), RootBoundaryError)
    } finally {
      rmSync(outsidePath, { recursive: true, force: true })
    }
  })
})

test('directory listing is bounded and metadata-only', () => {
  withTempRoot(rootPath => {
    mkdirSync(join(rootPath, 'nested'))
    writeFileSync(join(rootPath, 'a.json'), '{}')
    writeFileSync(join(rootPath, 'b.json'), '{}')
    const fileSystem = new ReadOnlyFileSystem(normalizeConfirmedRoot('test', rootPath, { maxEntryCount: 2 }))
    assert.throws(() => fileSystem.listDirectory(), /entry limit/i)
  })
})
