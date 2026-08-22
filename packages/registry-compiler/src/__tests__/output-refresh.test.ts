import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import type { AssetProposal, ReviewDecision } from '../contracts.ts'
import { writeAtomicSet } from '../output/atomic.ts'
import { assertPortableRegistrySafe } from '../output/portable.ts'
import { assertRegistryImportable, serializeConfirmedProposals, type LocalRegistry } from '../output/local.ts'
import { computeRefreshDiff } from '../refresh/diff.ts'

function proposal(id: string, sensitivity: AssetProposal['sensitivity'] = 'internal'): AssetProposal {
  return {
    proposalId: `skill:${id}`,
    identityKey: `skill:stable:${id}`,
    identityConfidence: 'high',
    kind: 'skill',
    displayName: id === 'new' ? 'New metadata skill' : 'Old metadata skill',
    stableId: `skill:${id}`,
    format: 'json',
    lifecycle: 'active',
    sensitivity,
    platforms: ['windows', 'macos'],
    locations: [{ rootId: 'workspace', relativePath: `skills/${id}.json`, localPath: `C:/Users/ExampleUser/.sancussight/skills/${id}.json`, portableAlias: `project:skill-${id}` }],
    provenance: [{ sourceType: 'skills', sourceId: id, adapterId: 'skills-manifest', adapterVersion: '1.0.0', rootId: 'workspace', platform: 'windows', relativePath: 'skills.json', observedAt: '2026-07-20T00:00:00.000Z' }],
    selectedByDefault: true,
    warnings: [],
  }
}

function decision(proposalId: string, action: ReviewDecision['decision'] = 'select'): ReviewDecision {
  return { proposalId, decision: action }
}

test('local and portable serializers produce schema-valid, privacy-safe registries and archive missing assets', () => {
  const old = proposal('old')
  const current = proposal('new')
  const previous: LocalRegistry = serializeConfirmedProposals([old], [decision(old.proposalId)], { runId: 'prior', now: '2026-07-19T00:00:00.000Z' }).local
  const previousSidecar = serializeConfirmedProposals([old], [decision(old.proposalId)], { runId: 'prior', now: '2026-07-19T00:00:00.000Z' }).sidecar
  const outputs = serializeConfirmedProposals([current], [decision(current.proposalId)], {
    runId: 'current',
    now: '2026-07-20T00:00:00.000Z',
    previousRegistry: previous,
    previousSidecar,
    inspectedRoots: 2,
    adapterCount: 11,
  })

  assertRegistryImportable(outputs.local)
  assertPortableRegistrySafe(outputs.portable)
  assert.equal(outputs.local.assets.some(asset => asset.registryState === 'missing'), true)
  assert.equal(outputs.portable.assets.some(asset => asset.registryState === 'missing'), true)
  assert.doesNotMatch(JSON.stringify(outputs.portable), /C:\\Users|\/home\/|henry/i)
  assert.equal(outputs.summary.selectedCount, 1)
  assert.equal(outputs.summary.skippedCount, 0)

  const diff = computeRefreshDiff(previousSidecar, [current], [{ fallbackKey: 'skill:name:collision', proposalIds: ['skill:new'], reason: 'insufficient-identity-confidence' }])
  assert.deepEqual(diff.additions, ['skill:new'])
  assert.deepEqual(diff.disappeared, ['skill:old'])
  assert.deepEqual(diff.archived, ['skill:old'])
  assert.deepEqual(diff.duplicates, ['skill:new'])
})

test('sensitive confirmed proposals are excluded before output serialization', () => {
  const sensitive = proposal('sensitive', 'sensitive')
  const outputs = serializeConfirmedProposals([sensitive], [decision(sensitive.proposalId)], { runId: 'sensitive-run', now: '2026-07-20T00:00:00.000Z' })
  assert.equal(outputs.local.assets.length, 0)
  assert.equal(outputs.portable.assets.length, 0)
  assert.equal(outputs.skippedReport.skipped[0]?.category, 'sensitive')
  assert.doesNotMatch(JSON.stringify(outputs), /C:\\Users|prompt|response|reasoning|credential|token/i)
})

test('atomic replacement creates backups and keeps prior files on validation or locked-file failure', () => {
  const root = mkdtempSync(join(tmpdir(), 'sancussight-atomic-'))
  try {
    const first = join(root, 'first.json')
    const second = join(root, 'second.json')
    writeFileSync(first, '{"old":1}\n')
    const successful = writeAtomicSet([{ path: first, value: { fresh: 1 } }, { path: second, value: { fresh: 2 } }], { now: '2026-07-20T00:00:00.000Z' })
    assert.equal(JSON.parse(readFileSync(first, 'utf8')).fresh, 1)
    assert.equal(successful.backups.length, 1)
    const beforeValidation = readFileSync(first, 'utf8')
    assert.throws(() => writeAtomicSet([{ path: first, value: { rejected: true } }], { validate: () => { throw new Error('validation failed') } }))
    assert.equal(readFileSync(first, 'utf8'), beforeValidation)

    let renameCount = 0
    const failingFs = {
      exists: existsSync,
      mkdir: (path: string) => mkdirSync(path, { recursive: true }),
      write: (path: string, value: string) => writeFileSync(path, value, { encoding: 'utf8', flag: 'wx' }),
      rename: (from: string, to: string) => { renameCount += 1; if (renameCount === 2) throw new Error('locked target'); renameSync(from, to) },
      unlink: unlinkSync,
    }
    const beforeLockedFirst = readFileSync(first, 'utf8')
    const beforeLockedSecond = readFileSync(second, 'utf8')
    assert.throws(() => writeAtomicSet([{ path: first, value: { locked: 1 } }, { path: second, value: { locked: 2 } }], { fileSystem: failingFs }))
    assert.equal(readFileSync(first, 'utf8'), beforeLockedFirst)
    assert.equal(readFileSync(second, 'utf8'), beforeLockedSecond)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
