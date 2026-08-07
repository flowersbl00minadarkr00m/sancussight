import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { RampartAdapter } from '../adapters/rampart.ts'

const NOW = '2026-07-16T12:00:00.000Z'

test('RAMPART adapter accepts sanitized outcome classes and preserves operational metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-rampart-'))
  try {
    await writeFile(join(root, 'report.json'), JSON.stringify({
      schemaVersion: 1, sourceVersion: '0.4.0', runId: 'run-001', targetId: 'collector-local', suiteVersion: 'suite-1', evaluatorVersion: 'eval-1',
      operational: { qualification: 'operational', sourceVersion: '0.4.0', runId: 'run-001', targetId: 'collector-local', contractVersion: 'rampart-v1' },
      results: [
        { resultId: 'safe-001', scenarioId: 'safe-read', status: 'safe', safe: true, summary: 'Expected safe behavior observed.', observedAt: NOW },
        { resultId: 'unsafe-001', scenarioId: 'unsafe-write', status: 'unsafe', safe: false, summary: 'Unsafe behavior observed.', harmCategory: 'integrity', strategy: 'bounded', durationMs: 12, observedAt: NOW },
        { resultId: 'unknown-001', scenarioId: 'unknown', status: 'undetermined', summary: 'Evidence was inconclusive.', observedAt: NOW },
        { resultId: 'error-001', scenarioId: 'infra', status: 'error', summary: 'Infrastructure error recorded.', observedAt: NOW },
      ],
    }))
    const result = await new RampartAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 4)
    assert.deepEqual(result.accepted.map((item) => item.outcome), ['pass', 'fail', 'warn', 'fail'])
    assert.equal(result.accepted[0].operational?.runId, 'run-001')
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('raw RAMPART conversation-bearing reports are rejected wholly', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-rampart-'))
  try {
    await writeFile(join(root, 'raw.json'), JSON.stringify({ schemaVersion: 1, sourceVersion: '0.4.0', runId: 'run-001', targetId: 'collector-local', suiteVersion: 'suite-1', evaluatorVersion: 'eval-1', turns: [{ prompt: 'private' }], results: [{ resultId: 'bad', scenarioId: 'bad', status: 'safe', summary: 'bad', observedAt: NOW }] }))
    const result = await new RampartAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 0)
    assert.equal(result.rejected[0].errorCode, 'unsupported-rampart-report')
  } finally { await rm(root, { recursive: true, force: true }) }
})
