import assert from 'node:assert/strict'
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { AgentBeaconAdapter } from '../adapters/agent-beacon.ts'
import { PipelockAdapter } from '../adapters/pipelock.ts'
import { PraxenAdapter } from '../adapters/praxen.ts'

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const NOW = '2026-07-12T13:00:00.000Z'

test('Agent Beacon imports complete records, excludes sensitive fields, and deduplicates rotation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-beacon-'))
  try {
    const fixture = join(fixtures, 'agent-beacon-runtime.jsonl')
    await copyFile(fixture, join(root, 'runtime.jsonl'))
    const adapter = new AgentBeaconAdapter()
    await adapter.validate(root)
    const first = await adapter.collect(root, undefined, NOW)
    assert.equal(first.accepted.length, 1)
    assert.equal(first.accepted[0].outcome, 'observed')
    assert.equal(JSON.stringify(first.accepted[0]).includes('secret prompt'), false)
    assert.equal(JSON.stringify(first.accepted[0]).includes('secret command body'), false)

    await copyFile(fixture, join(root, 'runtime.jsonl.1'))
    const rotated = await adapter.collect(root, first.checkpoint, NOW)
    assert.equal(rotated.accepted.length, 0)

    await writeFile(join(root, 'runtime.jsonl'), `${await readFile(fixture, 'utf8')}{"schema_version":"1.0"}`)
    const partial = await adapter.collect(root, first.checkpoint, NOW)
    assert.equal(partial.accepted.length, 0)
    assert.ok(partial.lag > 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Praxen accepts schema 2.0 wholly and rejects unsupported reports wholly', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-praxen-'))
  try {
    await copyFile(join(fixtures, 'praxen-findings.json'), join(root, 'report.json'))
    const adapter = new PraxenAdapter()
    const accepted = await adapter.collect(root, undefined, NOW)
    assert.equal(accepted.accepted.length, 2)
    assert.equal(accepted.accepted[0].outcome, 'fail')
    assert.equal(JSON.stringify(accepted.accepted).includes('private/workspace'), false)
    assert.equal(JSON.stringify(accepted.accepted).includes('sensitive source excerpt'), false)

    const incompatible = JSON.parse(await readFile(join(fixtures, 'praxen-findings.json'), 'utf8'))
    incompatible.schema_version = '3.0'
    await writeFile(join(root, 'unsupported.json'), JSON.stringify(incompatible))
    const rejected = await adapter.collect(root, accepted.checkpoint, NOW)
    assert.equal(rejected.rejected.length, 1)
    assert.equal(rejected.accepted.length, 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('Pipelock verification states remain explicit and failed packets are quarantined', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-pipelock-'))
  try {
    await copyFile(join(fixtures, 'pipelock-packet.json'), join(root, 'packet.json'))
    for (const state of ['verified', 'unavailable'] as const) {
      const result = await new PipelockAdapter(undefined, async () => state).collect(root, undefined, NOW)
      assert.equal(result.accepted[0].provenance.verification, state)
    }
    const failed = await new PipelockAdapter(undefined, async () => 'failed').collect(root, undefined, NOW)
    assert.equal(failed.accepted.length, 0)
    assert.equal(failed.rejected[0].verification, 'failed')
  } finally { await rm(root, { recursive: true, force: true }) }
})
