import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createInitialGovernanceAdapters } from '../adapters/index.ts'
import { FindMnemoAdapter } from '../adapters/findmnemo.ts'
import { FlowSensaAdapter } from '../adapters/flowsensa.ts'
import { RuntimeInventoryAdapter } from '../adapters/runtime-inventory.ts'

const NOW = '2026-07-16T12:00:00.000Z'

test('FindMnemo accepts current observed-work and legacy mnemosync identifiers', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-findmnemo-'))
  try {
    await writeFile(join(root, 'bundle.json'), JSON.stringify({ schemaVersion: 'findmnemo.observed-work.v1', records: [{ id: 'work-001', caseId: 'case-001', intentSummary: 'Prepare a bounded report.', truth: 'observed', actorId: 'agent-001' }] }))
    await writeFile(join(root, 'legacy.json'), JSON.stringify({ schema_version: '1.0.0', sourceType: 'mnemosync', id: 'legacy-001', case_id: 'legacy-case', intent: 'Legacy work context.' }))
    const result = await new FindMnemoAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 2)
    assert.equal(result.accepted[0].type, 'work.intent-recorded')
    assert.equal(result.accepted[0].truth.assertion, 'observed')
    assert.equal(result.accepted[1].source.id, 'findmnemo')
    assert.equal(result.rejected.length, 0)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('FlowSensa preserves observed versus inferred workflow facts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-flowsensa-'))
  try {
    await writeFile(join(root, 'projection.json'), JSON.stringify({ schemaVersion: 'flowsensa.governance.v1', events: [
      { id: 'transition-001', workflowId: 'workflow-001', transitionId: 'transition-001', truth: 'observed', summary: 'Read local input.' },
      { id: 'transition-002', workflowId: 'workflow-001', transitionId: 'transition-002', truth: 'inferred', confidence: 0.8, summary: 'Likely handoff.' },
    ] }))
    const result = await new FlowSensaAdapter().collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 2)
    assert.equal(result.accepted[0].truth.assertion, 'observed')
    assert.equal(result.accepted[1].truth.assertion, 'inferred')
    assert.equal(result.accepted[1].truth.confidence, 0.8)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('runtime inventory is allowlisted and rejects secrets or environment content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sancussight-inventory-'))
  try {
    await writeFile(join(root, 'inventory.json'), JSON.stringify({ schemaVersion: 1, runtime: { id: 'codex-cli', version: '1.0.0' }, assets: [
      { kind: 'runtime', id: 'codex-cli', version: '1.0.0', purpose: 'Local coding runtime' },
      { kind: 'mcp-server', id: 'local-tools', permissionsSummary: 'Read-only local tools' },
    ] }))
    const adapter = new RuntimeInventoryAdapter()
    const result = await adapter.collect(root, undefined, NOW)
    assert.equal(result.accepted.length, 2)
    assert.equal(result.accepted[0].type, 'inventory.observed')
    await writeFile(join(root, 'bad.json'), JSON.stringify({ schemaVersion: 1, runtime: { id: 'codex-cli', version: '1.0.0', env: { TOKEN: 'secret' } }, assets: [{ kind: 'runtime', id: 'codex-cli' }] }))
    const bad = await adapter.collect(root, result.checkpoint, NOW)
    assert.ok(bad.rejected.some((item) => item.errorCode === 'unsupported-runtime-inventory'))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('governance adapter catalog exposes only fixed native sources', () => {
  assert.deepEqual([...createInitialGovernanceAdapters().keys()].sort(), ['findmnemo', 'flowsensa', 'runtime-inventory'])
})
