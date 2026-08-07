import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { request } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import type { EvidenceSourceState } from '../../src/types.ts'
import type { ReleaseProgressRead } from '../../src/lib/release-progress.ts'
import { startCollectorServer, type CollectorService } from '../server.ts'

const states: EvidenceSourceState[] = [
  { id: 'agent-beacon', displayName: 'Agent Beacon', evidenceType: 'JSONL', health: 'not-configured', rejectedCount: 0 },
]

function fakeService(): CollectorService {
  return {
    async getSources() { return states },
    async configure(source) { return { ...states[0], id: source, health: 'stale' } },
    async refresh() { return states[0] },
    async disconnect() {},
    async getEvidence() { return { items: [] } },
    async getRejected() { return { items: [] } },
    async getReleaseProgress(): Promise<ReleaseProgressRead> { return { stale: true, errors: ['progress:unavailable'] } },
    async retryRejected() {},
  }
}

test('loopback service issues a strict session and protects mutations', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-static-'))
  await mkdir(join(root, 'assets'))
  await writeFile(join(root, 'index.html'), '<!doctype html><title>SancusSight</title>')
  const running = await startCollectorServer({ port: 0, staticDirectory: root, service: fakeService() })
  try {
    assert.equal((running.server.address() as { address: string }).address, '127.0.0.1')
    const status = await fetch(`${running.origin}/api/v1/status`)
    assert.equal(status.status, 200)
    assert.match(status.headers.get('set-cookie') ?? '', /HttpOnly; SameSite=Strict/)
    assert.match(status.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/)
    const body = await status.json() as { csrfToken: string }
    const cookie = status.headers.get('set-cookie')!.split(';')[0]

    const missingOrigin = await fetch(`${running.origin}/api/v1/sources/agent-beacon/refresh`, {
      method: 'POST', headers: { cookie, 'x-sancussight-csrf': body.csrfToken },
    })
    assert.equal(missingOrigin.status, 403)

    const wrongCsrf = await fetch(`${running.origin}/api/v1/sources/agent-beacon/refresh`, {
      method: 'POST', headers: { cookie, origin: running.origin, 'x-sancussight-csrf': 'wrong' },
    })
    assert.equal(wrongCsrf.status, 403)

    const accepted = await fetch(`${running.origin}/api/v1/sources/agent-beacon/refresh`, {
      method: 'POST', headers: { cookie, origin: running.origin, 'x-sancussight-csrf': body.csrfToken },
    })
    assert.equal(accepted.status, 200)
  } finally {
    await running.close()
    await rm(root, { recursive: true, force: true })
  }
})

test('wrong host and unknown control routes are rejected', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-static-'))
  await writeFile(join(root, 'index.html'), '<!doctype html>')
  const running = await startCollectorServer({ port: 0, staticDirectory: root, service: fakeService() })
  try {
    assert.equal(await requestStatus(running.port, '/api/v1/status', 'attacker.example'), 421)
    const command = await fetch(`${running.origin}/api/v1/command`)
    assert.equal(command.status, 404)
  } finally {
    await running.close()
    await rm(root, { recursive: true, force: true })
  }
})

test('release progress is exposed as a read-only bounded route', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-static-'))
  await writeFile(join(root, 'index.html'), '<!doctype html>')
  const running = await startCollectorServer({ port: 0, staticDirectory: root, service: fakeService() })
  try {
    const response = await fetch(`${running.origin}/api/v1/release-progress`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { stale: true, errors: ['progress:unavailable'] })
  } finally {
    await running.close()
    await rm(root, { recursive: true, force: true })
  }
})

function requestStatus(port: number, path: string, host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const outgoing = request({ hostname: '127.0.0.1', port, path, headers: { host } }, (response) => {
      response.resume()
      response.on('end', () => resolve(response.statusCode ?? 0))
    })
    outgoing.on('error', reject)
    outgoing.end()
  })
}
