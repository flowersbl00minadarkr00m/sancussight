import assert from 'node:assert/strict'
import test from 'node:test'

import { createReviewSession } from '../review/session.ts'
import { startReviewServer } from '../review/server.ts'
import type { ReviewBundle } from '../review/session.ts'

const bundle: ReviewBundle = {
  runId: 'review-test-run',
  roots: [{
    rootId: 'fixture-root',
    sourceType: 'skills',
    platform: 'windows',
    portableAlias: 'root:fixture',
    status: 'inspected',
    itemCount: 1,
  }],
  proposals: [{
    proposalId: 'skill:one',
    identityKey: 'skill:stable:skill-one',
    identityConfidence: 'high',
    kind: 'skill',
    displayName: 'Review-safe skill',
    stableId: 'skill:one',
    lifecycle: 'active',
    sensitivity: 'internal',
    platforms: ['windows'],
    locations: [{ rootId: 'fixture-root', relativePath: 'skills.json', portableAlias: 'root:fixture' }],
    provenance: [{ sourceType: 'skills', sourceId: 'one', adapterId: 'skills-manifest', adapterVersion: '1.0.0', rootId: 'fixture-root', platform: 'windows', relativePath: 'skills.json', observedAt: '2026-07-20T00:00:00.000Z' }],
    selectedByDefault: true,
    warnings: [],
  }],
  skipped: [{ sourceType: 'skills', boundedIdentifier: 'unsafe', category: 'sensitive', guidance: 'Excluded by privacy boundary.' }],
  diagnostics: [],
}

test('review server serves bounded bundle and consumes one-time confirmation', async () => {
  const confirmed: unknown[] = []
  const server = await startReviewServer({
    session: createReviewSession(bundle),
    onConfirm: decisions => { confirmed.push(decisions) },
  })
  try {
    const page = await fetch(server.url)
    assert.equal(page.status, 200)
    const html = await page.text()
    assert.match(html, /Review proposed registry metadata/)
    assert.doesNotMatch(html, /fonts\.googleapis|https:\/\//)

    const session = await fetch(`${server.origin}/api/session?token=${encodeURIComponent(server.token)}`)
    assert.equal(session.status, 200)
    const payload = await session.json() as ReviewBundle
    assert.equal(payload.proposals.length, 1)
    assert.doesNotMatch(JSON.stringify(payload), /prompt|response|reasoning|credential|never retained/i)

    const confirmedResponse = await fetch(`${server.origin}/api/confirm?token=${encodeURIComponent(server.token)}`, {
      method: 'POST',
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [{ proposalId: 'skill:one', decision: 'select' }] }),
    })
    assert.equal(confirmedResponse.status, 200)
    assert.equal(confirmed.length, 1)

    const replay = await fetch(server.url)
    assert.equal(replay.status, 409)
  } finally {
    await server.close()
  }
})

test('review server rejects invalid origins, tokens, routes, and oversized mutations', async () => {
  const server = await startReviewServer({ session: createReviewSession(bundle) })
  try {
    const invalidToken = await fetch(`${server.origin}/api/session?token=invalid`)
    assert.equal(invalidToken.status, 401)

    const invalidOrigin = await fetch(`${server.origin}/api/confirm?token=${encodeURIComponent(server.token)}`, {
      method: 'POST',
      headers: { Origin: 'http://example.invalid', 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [] }),
    })
    assert.equal(invalidOrigin.status, 401)

    const unknownRoute = await fetch(`${server.origin}/external`)
    assert.equal(unknownRoute.status, 404)

    const unknownProposal = await fetch(`${server.origin}/api/confirm?token=${encodeURIComponent(server.token)}`, {
      method: 'POST',
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [{ proposalId: 'skill:missing', decision: 'select' }] }),
    })
    assert.equal(unknownProposal.status, 400)

    const oversized = await fetch(`${server.origin}/api/confirm?token=${encodeURIComponent(server.token)}`, {
      method: 'POST',
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [], padding: 'x'.repeat(70_000) }),
    })
    assert.equal(oversized.status, 413)
  } finally {
    await server.close()
  }
})

test('cancel consumes the session without invoking confirmation', async () => {
  let cancelled = 0
  const server = await startReviewServer({ session: createReviewSession(bundle), onCancel: () => { cancelled += 1 } })
  try {
    const response = await fetch(`${server.origin}/api/cancel?token=${encodeURIComponent(server.token)}`, {
      method: 'POST',
      headers: { Origin: server.origin, 'Content-Type': 'application/json' },
      body: '{}',
    })
    assert.equal(response.status, 200)
    assert.equal(cancelled, 1)
    const replay = await fetch(server.url)
    assert.equal(replay.status, 409)
  } finally {
    await server.close()
  }
})
