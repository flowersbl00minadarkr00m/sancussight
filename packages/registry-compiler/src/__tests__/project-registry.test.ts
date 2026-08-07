import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { discoverProjectRegistry } from '../adapters/project-registry.ts'
import { ReadOnlyFileSystem } from '../fs/read-only.ts'
import { normalizeConfirmedRoot } from '../fs/roots.ts'

test('canonical project registry adapter emits bounded proposals and safe skips', () => {
  const rootPath = mkdtempSync(join(tmpdir(), 'sancussight-project-registry-'))
  try {
    mkdirSync(join(rootPath, 'projects', 'sancussight'), { recursive: true })
    const registry = {
      schema_version: '1.0.0',
      projects: [
        {
          id: 'sancussight',
          name: 'SancusSight',
          aliases: ['sancus'],
          lifecycle: 'active',
          root_id: 'workspace',
          relative_path: 'projects/sancussight',
          repository_url: 'https://github.com/example/sancussight',
          production_urls: ['https://sancussight.example'],
          requirements: [{ path: '.ai/sdd/requirements.md', status: 'approved' }],
        },
        {
          id: 'escape',
          name: 'Escape',
          lifecycle: 'active',
          root_id: 'workspace',
          relative_path: '../outside',
        },
        {
          id: 'unsafe',
          name: 'Unsafe',
          lifecycle: 'active',
          root_id: 'workspace',
          relative_path: 'projects/unsafe',
          command_arguments: ['never retained'],
        },
      ],
    }
    writeFileSync(join(rootPath, 'registry.json'), JSON.stringify(registry))
    writeFileSync(join(rootPath, 'local-roots.json'), JSON.stringify({ roots: { workspace: rootPath } }))

    const confirmedRoot = normalizeConfirmedRoot('project-registry', rootPath)
    const result = discoverProjectRegistry({
      runId: 'run-test',
      now: '2026-07-20T00:00:00.000Z',
      platform: 'windows',
      root: {
        rootId: confirmedRoot.rootId,
        sourceType: 'project-registry',
        platform: 'windows',
        portableAlias: confirmedRoot.portableAlias,
        status: 'inspected',
        itemCount: 10,
      },
      fileSystem: new ReadOnlyFileSystem(confirmedRoot),
    })

    assert.equal(result.proposals.length, 1)
    assert.equal(result.proposals[0]?.stableId, 'project:sancussight')
    assert.equal(result.proposals[0]?.sensitivity, 'internal')
    assert.ok(result.proposals[0]?.references?.some(reference => reference.kind === 'repository'))
    assert.ok(result.skipped.some(item => item.category === 'out-of-scope'))
    assert.ok(result.skipped.some(item => item.category === 'sensitive'))
    assert.doesNotMatch(JSON.stringify(result), /never retained/)
    assert.doesNotMatch(JSON.stringify(result), /command_arguments/)
  } finally {
    rmSync(rootPath, { recursive: true, force: true })
  }
})
