import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertNoProhibitedKeys,
  discoverAdapters,
  discoverAgentConfigs,
  discoverCommands,
  discoverControls,
  discoverEvidenceContracts,
  discoverEvaluations,
  discoverLoops,
  discoverMcps,
  discoverPlugins,
  discoverSkills,
  discoverWorkflows,
  mergeProposals,
} from '../index.ts'
import type { DiscoveryContext, ReadOnlyFileSystemPort } from '../contracts.ts'

const manifest = {
  items: [
    {
      id: 'shared',
      stable_id: 'skill:shared',
      name: 'Shared metadata item',
      provider: 'operator',
      platform: 'windows',
      capabilities: ['review'],
      lifecycle: 'active',
      version: '1.0.0',
      repository_url: 'https://github.com/example/shared',
    },
    {
      id: 'no-provider',
      name: 'Provider absent but bounded',
      platform: 'windows',
      lifecycle: 'active',
    },
    {
      id: 'unsafe',
      name: 'Unsafe item',
      command_arguments: ['never retained'],
    },
    {
      id: 'malformed',
      lifecycle: 'active',
    },
    {
      id: 'collision-a',
      name: 'Uncertain collision',
      platform: 'windows',
    },
    {
      id: 'collision-b',
      name: 'Uncertain collision',
      platform: 'macos',
    },
    {
      id: 'stable-a',
      stable_id: 'stable:a',
      name: 'Conflicting identity',
    },
    {
      id: 'stable-b',
      stable_id: 'stable:b',
      name: 'Conflicting identity',
    },
  ],
}

const fileSystem: ReadOnlyFileSystemPort = {
  listDirectory: () => [],
  readMetadata: relativePath => ({ relativePath, kind: 'file', sizeBytes: 1, modifiedAt: '2026-07-20T00:00:00.000Z', extension: '.json' }),
  readAllowlistedManifest: () => manifest,
}

function context(platform: 'windows' | 'macos'): DiscoveryContext {
  return {
    runId: `run-${platform}`,
    now: '2026-07-20T00:00:00.000Z',
    platform,
    root: {
      rootId: 'fixture-root',
      sourceType: 'skills',
      platform,
      portableAlias: 'root:fixture',
      status: 'inspected',
      itemCount: 100,
    },
    fileSystem,
  }
}

test('fixed adapters cover each supported inventory family without content capture', () => {
  const windows = context('windows')
  const results = [
    discoverSkills(windows, 'skills.json'),
    discoverPlugins(windows, 'plugins.json'),
    discoverCommands(windows, 'commands.json'),
    discoverLoops(windows, 'loops.json'),
    discoverWorkflows(windows, 'workflows.json'),
    discoverMcps(windows, 'mcps.json'),
    discoverAgentConfigs(windows, 'agent-configs.json'),
    discoverControls(windows, 'controls.json'),
    discoverEvaluations(windows, 'evaluations.json'),
    discoverEvidenceContracts(windows, 'evidence-contracts.json'),
    discoverAdapters(windows, 'adapters.json'),
  ]
  assert.equal(results.length, 11)
  assert.ok(results.every(result => result.proposals.length === 6))
  assert.ok(results.every(result => result.skipped.some(item => item.category === 'sensitive')))
  assert.ok(results.every(result => result.skipped.some(item => item.category === 'unsupported')))
  results.forEach(result => assertNoProhibitedKeys(result))
  assert.doesNotMatch(JSON.stringify(results), /never retained/)
  assert.doesNotMatch(JSON.stringify(results), /command_arguments/)
})

test('merge combines stable duplicates with platform coverage and provenance', () => {
  const first = discoverSkills(context('windows'), 'skills.json')
  const second = discoverSkills(context('macos'), 'skills.json')
  const merged = mergeProposals([...first.proposals, ...second.proposals])
  const shared = merged.proposals.find(proposal => proposal.stableId === 'skill:shared')
  assert.ok(shared)
  assert.deepEqual(shared?.platforms.sort(), ['macos', 'windows'])
  assert.equal(shared?.provenance.length, 2)
  assert.equal(merged.collisions.length, 3)
  assert.ok(merged.collisions.every(collision => collision.proposalIds.length >= 2))
  assert.equal(merged.proposals.filter(proposal => proposal.displayName === 'Uncertain collision').length, 4)
  assertNoProhibitedKeys(merged)
})

test('unchanged fixtures produce deterministic adapter output', () => {
  const first = discoverSkills(context('windows'), 'skills.json')
  const second = discoverSkills(context('windows'), 'skills.json')
  assert.deepEqual(first, second)
})
