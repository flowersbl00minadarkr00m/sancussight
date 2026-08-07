import assert from 'node:assert/strict'
import { createDemoRegistry, normalizeRegistry, prepareLocalSave } from '../src/lib/session.ts'
import { groupFlaggedByAsset } from '../src/lib/findings.ts'
import { parseAppRoute } from '../src/lib/route.ts'
import { canWriteSource, createSourceState, getSourceActions, SYNC_STATE_LABELS, transitionSourceState } from '../src/lib/source-state.ts'
import { createConnectionActivity, createMemoryConnectionStore, disconnectConnectionState, migrateLegacyLocalRegistry } from '../src/lib/connection-store.ts'
import type { FileConnectorAdapter, PersistentFileHandle, SourceRead } from '../src/lib/file-connector.ts'
import { SourceController } from '../src/lib/source-controller.ts'
import { connectionActivityToEntry, mergeActivityEntries } from '../src/lib/activity.ts'
import { confirmEvidenceBinding, correlateEvidence, evidenceActivity, evidenceSignals, parseEvidenceSnapshot } from '../src/lib/evidence.ts'
import { evaluateAll, runExitTest } from '../src/lib/registry.ts'
import { CollectorClient } from '../src/lib/collector-client.ts'
import type { EvidenceEnvelopeV1, Registry, Signal } from '../src/types.ts'

const NOW = '2026-07-11T10:00:00.000Z'
const seed: Registry = {
  schemaVersion: 2,
  platforms: ['alpha'],
  updatedAt: '2026-07-01T00:00:00.000Z',
  assets: [],
}

const demo = createDemoRegistry(seed, NOW)
assert.equal(demo.provenance?.mode, 'demo')
assert.notEqual(demo, seed)
demo.platforms.push('beta')
assert.deepEqual(seed.platforms, ['alpha'])

const legacy = normalizeRegistry(seed, { now: NOW, refreshTimestamp: true })
assert.equal(legacy?.provenance?.mode, 'local')
assert.equal(legacy?.provenance?.sourceUpdatedAt, seed.updatedAt)

const explicitDemo = normalizeRegistry(demo, { now: NOW, refreshTimestamp: true })
assert.equal(explicitDemo?.provenance?.mode, 'demo')
assert.equal(normalizeRegistry({ platforms: [], assets: [{}] }), undefined)

const saved = prepareLocalSave(seed, NOW)
assert.equal(saved.provenance?.mode, 'local')
assert.equal(saved.updatedAt, NOW)

const signals: Signal[] = [
  { id: 'a-warn', assetId: 'a', assetName: 'Alpha', dimension: 'controls', status: 'warn', condition: '', finding: 'Warn', evidence: '', owner: 'h' },
  { id: 'a-fail', assetId: 'a', assetName: 'Alpha', dimension: 'controls', status: 'fail', condition: '', finding: 'Fail', evidence: '', owner: 'h' },
  { id: 'b-unknown', assetId: 'b', assetName: 'Beta', dimension: 'evidence', status: 'unknown', condition: '', finding: 'Unknown', evidence: '', owner: 'h' },
  { id: 'b-pass', assetId: 'b', assetName: 'Beta', dimension: 'evidence', status: 'pass', condition: '', finding: 'Pass', evidence: '', owner: 'h' },
]
const groups = groupFlaggedByAsset(signals)
assert.equal(groups.length, 2)
assert.equal(groups[0].assetId, 'a')
assert.equal(groups[0].worstStatus, 'fail')
assert.equal(groups[0].findingCount, 2)
assert.equal(groups[1].findingCount, 1)

assert.equal(parseAppRoute(''), 'landing')
assert.equal(parseAppRoute('#DEMO'), 'demo')
assert.equal(parseAppRoute('#workspace'), 'workspace')
assert.equal(parseAppRoute('#unknown'), 'landing')

const dirtySource = transitionSourceState(createSourceState(), { type: 'local-edit' })
const conflictedSource = transitionSourceState(dirtySource, { type: 'source-changed-valid' })
assert.equal(conflictedSource.syncState, 'conflict')
assert.equal(conflictedSource.dirty, true)
assert.equal(conflictedSource.externalChange, true)
assert.equal(canWriteSource(conflictedSource), false)
assert.deepEqual(getSourceActions(conflictedSource), ['refresh', 'replace-source', 'disconnect', 'export-working-copy', 'reload-source', 'keep-working'])

const changedInvalid = transitionSourceState(createSourceState(), { type: 'source-changed-invalid', error: 'Invalid registry' })
assert.equal(changedInvalid.syncState, 'external-change')
assert.equal(changedInvalid.error, 'Invalid registry')

const permissionRequired = transitionSourceState(dirtySource, { type: 'permission-changed', mode: 'read', permission: 'prompt' })
assert.equal(permissionRequired.syncState, 'permission-required')
assert.equal(permissionRequired.dirty, true)
const reauthorized = transitionSourceState(permissionRequired, { type: 'permission-changed', mode: 'read', permission: 'granted' })
assert.equal(reauthorized.syncState, 'unsaved')

const preflightConflict = transitionSourceState(dirtySource, { type: 'save-preflight-changed' })
assert.equal(preflightConflict.syncState, 'conflict')
assert.equal(canWriteSource(preflightConflict), false)

const writeFailed = transitionSourceState(dirtySource, { type: 'write-failed', error: 'Disk full' })
assert.equal(writeFailed.syncState, 'unsaved')
assert.equal(writeFailed.dirty, true)
const writeSucceeded = transitionSourceState(dirtySource, { type: 'write-succeeded' })
assert.equal(writeSucceeded.syncState, 'current')
assert.equal(writeSucceeded.dirty, false)

assert.deepEqual(Object.values(SYNC_STATE_LABELS), [
  'Current',
  'Unsaved changes',
  'Changed externally',
  'Conflict',
  'Permission required',
])

const memoryStore = createMemoryConnectionStore()
const legacyStorage = createFakeStorage(JSON.stringify(seed))
assert.equal(await migrateLegacyLocalRegistry(memoryStore, legacyStorage, NOW), 'migrated')
assert.equal((await memoryStore.loadCache())?.sourceKind, 'snapshot')
assert.equal(legacyStorage.getItem('sancussight:v1'), null)

const activity = createConnectionActivity('connect', 'succeeded', 'C:\\private\\ai-registry.json', NOW)
assert.equal(activity.sourceName, 'ai-registry.json')
await memoryStore.appendActivity(activity)
const replacementSnapshot = { ...(await memoryStore.loadCache())!, sourceKind: 'snapshot' as const }
await memoryStore.replaceWithSnapshot(replacementSnapshot)
assert.equal(await memoryStore.loadConnection(), undefined)
assert.equal((await memoryStore.loadCache())?.sourceKind, 'snapshot')
await disconnectConnectionState(memoryStore, legacyStorage)
assert.equal(await memoryStore.loadConnection(), undefined)
assert.equal(await memoryStore.loadCache(), undefined)
assert.equal((await memoryStore.listActivity()).length, 1)

const controllerStore = createMemoryConnectionStore()
const fakeConnector = createFakeConnector(JSON.stringify(seed))
const controller = new SourceController(fakeConnector, controllerStore, () => NOW)
const connected = await controller.connect()
assert.equal(connected.outcome, 'success')
assert.equal(connected.session?.connection?.syncState, 'current')
if (!connected.session) throw new Error('Expected connected session')
const dirtyConnected = { ...connected.session, dirty: true, connection: { ...connected.session.connection!, syncState: 'unsaved' as const } }
fakeConnector.setRaw(JSON.stringify({ ...seed, updatedAt: '2026-07-12T00:00:00.000Z' }))
const blockedSave = await controller.save(dirtyConnected)
assert.equal(blockedSave.outcome, 'conflict')
assert.equal(fakeConnector.writeCount(), 0)

const refreshStore = createMemoryConnectionStore()
const refreshConnector = createFakeConnector(JSON.stringify(seed))
const refreshController = new SourceController(refreshConnector, refreshStore, () => NOW)
const refreshConnected = await refreshController.connect()
if (!refreshConnected.session) throw new Error('Expected refresh session')
refreshConnector.setRaw(JSON.stringify({ ...seed, updatedAt: '2026-07-12T01:00:00.000Z' }))
const refreshed = await refreshController.refresh(refreshConnected.session)
assert.equal(refreshed.outcome, 'success')
assert.equal(refreshed.session?.registry.updatedAt, '2026-07-12T01:00:00.000Z')
assert.equal(refreshed.session?.connection?.syncState, 'current')

const saveStore = createMemoryConnectionStore()
const saveConnector = createFakeConnector(JSON.stringify(seed))
const saveController = new SourceController(saveConnector, saveStore, () => NOW)
const saveConnected = await saveController.connect()
if (!saveConnected.session) throw new Error('Expected save session')
const saveDirty = { ...saveConnected.session, dirty: true, connection: { ...saveConnected.session.connection!, syncState: 'unsaved' as const } }
const savedSource = await saveController.save(saveDirty)
assert.equal(savedSource.outcome, 'success')
assert.equal(savedSource.session?.connection?.syncState, 'current')
assert.equal(savedSource.session?.dirty, false)
assert.equal(saveConnector.writeCount(), 1)

saveConnector.setReadPermission('prompt')
const restoredWithoutPermission = await new SourceController(saveConnector, saveStore, () => NOW).restore()
assert.equal(restoredWithoutPermission.outcome, 'permission-required')
assert.equal(restoredWithoutPermission.session?.cacheState, 'recovery-only')

const failedStore = createMemoryConnectionStore()
const failedConnector = createFakeConnector(JSON.stringify(seed))
const failedController = new SourceController(failedConnector, failedStore, () => NOW)
const failedConnected = await failedController.connect()
if (!failedConnected.session) throw new Error('Expected failed-write session')
failedConnector.setWriteFailure(true)
const failedDirty = { ...failedConnected.session, dirty: true, connection: { ...failedConnected.session.connection!, syncState: 'unsaved' as const } }
const failedSourceWrite = await failedController.save(failedDirty)
assert.equal(failedSourceWrite.outcome, 'error')
assert.equal(failedSourceWrite.session?.connection?.syncState, 'unsaved')
assert.equal(failedSourceWrite.session?.dirty, true)

const uncertainStore = createMemoryConnectionStore()
const uncertainConnector = createFakeConnector(JSON.stringify(seed))
const uncertainController = new SourceController(uncertainConnector, uncertainStore, () => NOW)
const uncertainConnected = await uncertainController.connect()
if (!uncertainConnected.session) throw new Error('Expected uncertain-write session')
uncertainConnector.setCorruptAfterWrite(true)
const uncertainDirty = { ...uncertainConnected.session, dirty: true, connection: { ...uncertainConnected.session.connection!, syncState: 'unsaved' as const } }
const uncertainWrite = await uncertainController.save(uncertainDirty)
assert.equal(uncertainWrite.outcome, 'error')
assert.equal(uncertainWrite.session?.connection?.syncState, 'conflict')

const retainedStore = createMemoryConnectionStore()
const retainedConnector = createFakeConnector(JSON.stringify(seed))
const retainedController = new SourceController(retainedConnector, retainedStore, () => NOW)
const retainedConnected = await retainedController.connect()
if (!retainedConnected.session) throw new Error('Expected retained session')
const replacementCancelled = await retainedController.connect(() => false)
assert.equal(replacementCancelled.outcome, 'cancelled')
assert.equal((await retainedStore.loadConnection())?.state.sourceName, 'ai-registry.json')
const writesBeforeDisconnect = retainedConnector.writeCount()
await retainedController.disconnect()
assert.equal(retainedConnector.writeCount(), writesBeforeDisconnect)
const retainedActivity = await retainedStore.listActivity()
assert.equal(retainedActivity.at(-1)?.operation, 'disconnect')
const mergedActivity = mergeActivityEntries(retainedActivity.map(connectionActivityToEntry), retainedActivity.map(connectionActivityToEntry))
assert.equal(mergedActivity.length, retainedActivity.length)

const evidenceRegistry: Registry = {
  schemaVersion: 2,
  platforms: ['alpha'],
  updatedAt: NOW,
  assets: [{
    id: 'workflow-1', name: 'Invoice workflow', kind: 'workflow', format: 'json', location: 'registry.json',
    owner: 'henry', sensitivity: 'internal', sharedByDesign: true, coverage: [], providerDependencies: [], evidence: [],
    stableId: 'workflow:invoice', evidenceBindings: [{ source: 'praxen', externalId: 'invoice-agent' }],
  }],
}
const evidenceEnvelope: EvidenceEnvelopeV1 = {
  schemaVersion: 1, id: 'a'.repeat(64), source: 'praxen', evidenceKind: 'behavior-finding',
  observedAt: NOW, importedAt: NOW, subject: { externalId: 'invoice-agent', type: 'agent' },
  outcome: 'fail', summary: 'Declared policy is not enforced.', attributes: {},
  provenance: { artifactName: 'report.json', artifactContentHash: 'b'.repeat(64), parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
}
const beforeCorrelation = structuredClone(evidenceRegistry)
const correlated = correlateEvidence(evidenceRegistry, [evidenceEnvelope])
assert.equal(correlated.matched[0].asset?.id, 'workflow-1')
assert.equal(correlated.matched[0].match, 'binding')
assert.deepEqual(evidenceRegistry, beforeCorrelation)
assert.equal(evidenceSignals(evidenceRegistry, [evidenceEnvelope])[0].status, 'fail')
const evidenceExitTest = runExitTest(evidenceRegistry, 'workflow-1', 'beta', NOW.slice(0, 10), evidenceSignals(evidenceRegistry, [evidenceEnvelope]))
assert.equal(evidenceExitTest?.verdict, 'breaks')
assert.equal(evidenceExitTest?.items.some((item) => item.assetName === 'Invoice workflow evidence'), true)
assert.equal(evidenceActivity([evidenceEnvelope])[0].evidence, evidenceEnvelope.id)
assert.equal(parseEvidenceSnapshot(JSON.stringify({ schemaVersion: 1, evidence: [evidenceEnvelope, evidenceEnvelope] }))?.length, 1)
assert.equal(parseEvidenceSnapshot('{"schemaVersion":2}'), undefined)
const nameOnly = structuredClone(evidenceEnvelope)
nameOnly.id = 'c'.repeat(64)
nameOnly.subject.externalId = 'Invoice workflow'
assert.equal(correlateEvidence(evidenceRegistry, [nameOnly]).unmapped.length, 1)
const confirmedBinding = confirmEvidenceBinding(evidenceRegistry, 'workflow-1', nameOnly)
assert.equal(correlateEvidence(confirmedBinding, [nameOnly]).matched.length, 1)
assert.equal(confirmedBinding.assets[0].owner, evidenceRegistry.assets[0].owner)
assert.equal(confirmedBinding.assets[0].acceptedRisk, evidenceRegistry.assets[0].acceptedRisk)
assert.deepEqual(evaluateAll(evidenceRegistry, NOW.slice(0, 10)), evaluateAll(beforeCorrelation, NOW.slice(0, 10)))

let hostedRequests = 0
const hostedClient = new CollectorClient(false, async () => {
  hostedRequests += 1
  return new Response('{}')
})
assert.equal(await hostedClient.status(), undefined)
assert.equal(hostedRequests, 0)

let localStatusRequests = 0
const localClient = new CollectorClient(true, async () => {
  localStatusRequests += 1
  return new Response(JSON.stringify({ version: 1, mode: 'local-collector', health: 'current', csrfToken: 'token' }), { status: 200 })
})
await Promise.all([localClient.status(), localClient.status()])
assert.equal(localStatusRequests, 1)

console.log('Core provenance, grouping, route, source-state, and evidence-correlation assertions passed.')

function createFakeStorage(initial?: string) {
  const values = new Map<string, string>()
  if (initial) values.set('sancussight:v1', initial)
  return {
    getItem(key: string) { return values.get(key) ?? null },
    removeItem(key: string) { values.delete(key) },
  }
}

function createFakeConnector(initialRaw: string): FileConnectorAdapter & {
  setRaw(raw: string): void
  setReadPermission(permission: PermissionState): void
  setWriteFailure(value: boolean): void
  setCorruptAfterWrite(value: boolean): void
  writeCount(): number
} {
  let raw = initialRaw
  let lastModified = 1
  let writes = 0
  let readPermission: PermissionState = 'granted'
  let writeFailure = false
  let corruptAfterWrite = false
  const handle = { kind: 'file', name: 'ai-registry.json' } as PersistentFileHandle
  return {
    isSupported: () => true,
    pickSource: async () => handle,
    queryPermission: async (_handle, mode) => mode === 'read' ? readPermission : 'prompt',
    requestPermission: async () => 'granted',
    getMetadata: async () => ({ size: new TextEncoder().encode(raw).byteLength, lastModified }),
    read: async (): Promise<SourceRead> => ({ raw, size: new TextEncoder().encode(raw).byteLength, lastModified }),
    write: async (_handle, content) => {
      if (writeFailure) throw new Error('Simulated write failure')
      raw = content
      if (corruptAfterWrite) raw = '{"corrupted":true}'
      lastModified += 1
      writes += 1
    },
    setRaw(nextRaw) { raw = nextRaw; lastModified += 1 },
    setReadPermission(permission) { readPermission = permission },
    setWriteFailure(value) { writeFailure = value },
    setCorruptAfterWrite(value) { corruptAfterWrite = value },
    writeCount: () => writes,
  }
}
