import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { isProgressStale, progressPercent, validateReleaseProgressSnapshot } from '../../src/lib/release-progress.ts'
import { ReleaseProgressStore } from '../release-progress-store.ts'

const NOW = '2026-07-21T12:00:00.000Z'

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    contractVersion: 'release-progress-v1',
    releaseRunId: 'release-run-001',
    producerId: 'praxen',
    targetId: 'sancussight',
    state: 'running',
    stage: 'praxen',
    startedAt: '2026-07-21T11:55:00.000Z',
    updatedAt: NOW,
    messageCode: 'processing',
    ...overrides,
  }
}

test('progress contract accepts bounded metadata and computes a determinate percentage', () => {
  const validation = validateReleaseProgressSnapshot(snapshot({ completedUnits: 3, totalUnits: 4 }))
  assert.equal(validation.valid, true)
  assert.equal(progressPercent(validation.snapshot!), 75)
})

test('progress contract rejects unknown fields, free-text-like payloads, and invalid counts', () => {
  const validation = validateReleaseProgressSnapshot(snapshot({ prompt: 'do not retain', completedUnits: 5, totalUnits: 4 }))
  assert.equal(validation.valid, false)
  assert.ok(validation.errors.includes('progress:unknown-field:prompt'))
  assert.ok(validation.errors.includes('progress:completed-exceeds-total'))
})

test('stale heartbeats never imply completion', () => {
  const validation = validateReleaseProgressSnapshot(snapshot({ state: 'completed', completedUnits: 4, totalUnits: 4, updatedAt: '2026-07-21T11:55:00.000Z' }))
  assert.equal(validation.valid, true)
  assert.equal(isProgressStale(validation.snapshot!, NOW), true)
  assert.equal(progressPercent(validation.snapshot!), 100)
})

test('progress store hides malformed file details and reports stale status', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-progress-'))
  const path = join(root, 'current.json')
  try {
    await writeFile(path, JSON.stringify(snapshot({ updatedAt: '2026-07-21T11:55:00.000Z' })))
    const read = await new ReleaseProgressStore(path).read(NOW)
    assert.equal(read.snapshot?.releaseRunId, 'release-run-001')
    assert.equal(read.stale, true)
    assert.deepEqual(read.errors, ['progress:stale'])
    await writeFile(path, JSON.stringify({ prompt: 'sensitive' }))
    const invalid = await new ReleaseProgressStore(path).read(NOW)
    assert.equal(invalid.snapshot, undefined)
    assert.deepEqual(invalid.errors, ['progress:invalid'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
