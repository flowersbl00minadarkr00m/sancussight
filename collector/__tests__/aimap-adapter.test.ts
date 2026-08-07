import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { AIMapAdapter } from '../adapters/aimap.ts'

const NOW = '2026-07-16T12:00:00.000Z'
const target = { host: '127.0.0.1', port: 8787, protocol: 'http' as const, templates: ['agent-endpoint'] }

test('AIMap accepts only completed findings matching an exact unexpired authorization', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-aimap-'))
  try {
    await writeFile(join(root, 'authorization.json'), JSON.stringify({ schemaVersion: 1, authorizationId: 'auth-001', owner: 'operator', purpose: 'Loopback governance test', target, validFrom: '2026-07-16T11:00:00.000Z', validUntil: '2026-07-16T13:00:00.000Z', releaseRunId: 'run-001' }))
    await writeFile(join(root, 'export.json'), JSON.stringify({ schemaVersion: 1, sourceVersion: '0.9.0', scanId: 'scan-001', authorizationId: 'auth-001', runId: 'run-001', status: 'completed', target, completedAt: NOW, operational: { qualification: 'operational', sourceVersion: '0.9.0', runId: 'run-001', targetId: 'loopback-8787', contractVersion: 'aimap-v1' }, findings: [{ findingId: 'finding-001', endpointId: 'endpoint-001', hostname: '127.0.0.1', port: 8787, protocol: 'http', authStatus: 'unauthenticated', riskScore: 4, riskFactors: ['bounded'], template: 'agent-endpoint', severity: 'medium', title: 'Bounded endpoint finding' }] }))
    const result = await new AIMapAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].operational?.targetId, 'loopback-8787')
    assert.equal(result.accepted[0].outcome, 'warn')
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('AIMap rejects incomplete, expired, out-of-scope, and raw-content exports wholly', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-aimap-'))
  try {
    await writeFile(join(root, 'authorization.json'), JSON.stringify({ schemaVersion: 1, authorizationId: 'auth-001', owner: 'operator', purpose: 'Loopback governance test', target, validFrom: '2026-07-16T11:00:00.000Z', validUntil: '2026-07-16T13:00:00.000Z', releaseRunId: 'run-001' }))
    await writeFile(join(root, 'bad.json'), JSON.stringify({ schemaVersion: 1, sourceVersion: '0.9.0', scanId: 'scan-002', authorizationId: 'auth-001', runId: 'run-001', status: 'completed', target: { ...target, port: 9999 }, completedAt: NOW, payload: 'raw', findings: [] }))
    const result = await new AIMapAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 0)
    assert.equal(result.rejected[0].errorCode, 'unsupported-aimap-export')
  } finally { await rm(root, { recursive: true, force: true }) }
})
