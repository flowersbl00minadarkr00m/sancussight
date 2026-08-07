import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, rm, utimes, writeFile } from 'node:fs/promises'
import { once } from 'node:events'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import {
  assertDescriptorEnvironment,
  assertObservationWithinReleaseRun,
  createReleaseRunDescriptorBinder,
  parseReleaseRunDescriptorText,
  readReleaseRunDescriptor,
  resolveReleaseRunDescriptorPath,
  type ReleaseRunDescriptorV1,
} from '../../src/lib/release-run-descriptor.ts'
import { startOtlpBridge } from '../../operations/telemetry/otlp-bridge.ts'
import { registerSancusSightTelemetry } from '../../operations/telemetry/pi-extension.ts'

const STARTED_AT = '2026-07-23T20:00:00.000Z'
const TARGET_ID = 'sancussight-local-runtimes'

test('descriptor parser accepts exactly the canonical five fields and the checked-in schema agrees', async () => {
  const descriptor = descriptorValue('fixture-parser')
  assert.deepEqual(parseReleaseRunDescriptorText(`${JSON.stringify(descriptor)}\n`), descriptor)

  const schema = JSON.parse(await readFile(join(process.cwd(), 'contracts', 'release-run-descriptor-v1.schema.json'), 'utf8'))
  assert.equal(schema.additionalProperties, false)
  assert.deepEqual(schema.required, ['schemaVersion', 'releaseRunId', 'startedAt', 'runtimeTargetId', 'purpose'])
  assert.equal(schema.properties.runtimeTargetId.const, TARGET_ID)
  assert.equal(schema.properties.purpose.const, 'a002-t16')
})

test('descriptor parser rejects BOM, unknown/duplicate/missing fields, malformed values, and legacy manifests', async () => {
  const valid = descriptorValue('fixture-invalid')
  const invalid: Array<[string, string | Record<string, unknown>, RegExp]> = [
    ['bom', `\ufeff${JSON.stringify(valid)}`, /BOM_FORBIDDEN/],
    ['unknown', { ...valid, extra: true }, /FIELDS_INVALID|UNKNOWN_FIELD/],
    ['missing', { ...valid, purpose: undefined }, /FIELDS_INVALID/],
    ['version', { ...valid, schemaVersion: 2 }, /SCHEMA_VERSION_INVALID/],
    ['run-id', { ...valid, releaseRunId: '../escape' }, /RUN_ID_INVALID/],
    ['timestamp-offset', { ...valid, startedAt: '2026-07-23T20:00:00.000+00:00' }, /STARTED_AT_INVALID/],
    ['timestamp-noncanonical', { ...valid, startedAt: '2026-07-23T20:00:00Z' }, /STARTED_AT_INVALID/],
    ['target', { ...valid, runtimeTargetId: 'local-ai-runtime' }, /RUNTIME_TARGET_INVALID/],
    ['purpose', { ...valid, purpose: 'legacy-release' }, /PURPOSE_INVALID/],
  ]
  for (const [name, value, pattern] of invalid) {
    const text = typeof value === 'string' ? value : JSON.stringify(value)
    assert.throws(() => parseReleaseRunDescriptorText(text), pattern, name)
  }
  const duplicate = JSON.stringify(valid).replace('"purpose":"a002-t16"', '"purpose":"a002-t16","purpose":"a002-t16"')
  assert.throws(() => parseReleaseRunDescriptorText(duplicate), /DUPLICATE_FIELD/)

  const localAppData = await mkdtemp(join(tmpdir(), 'sancussight-t16r4-legacy-fixture-'))
  try {
    const legacyPath = join(localAppData, 'operations', 'manifests', 'release-run.json')
    await mkdir(dirname(legacyPath), { recursive: true })
    await writeFile(legacyPath, JSON.stringify(valid))
    assert.throws(() => readReleaseRunDescriptor(legacyPath, localAppData), /PATH_MISMATCH/)
  } finally {
    await rm(localAppData, { recursive: true, force: true })
  }
})

test('descriptor path is canonical and binder refuses rewrite or process rebind', async () => {
  const localAppData = await mkdtemp(join(tmpdir(), 'sancussight-t16r4-bind-fixture-'))
  try {
    const firstPath = await writeDescriptor(localAppData, descriptorValue('fixture-bind-1'))
    const secondPath = await writeDescriptor(localAppData, descriptorValue('fixture-bind-2'))
    await utimes(firstPath, new Date('2030-01-01T00:00:00.000Z'), new Date('2030-01-01T00:00:00.000Z'))
    assert.equal(readReleaseRunDescriptor(firstPath, localAppData).descriptor.startedAt, STARTED_AT)
    const binder = createReleaseRunDescriptorBinder()
    const first = binder.bind(firstPath, localAppData)
    assert.equal(first.descriptorPath, resolveReleaseRunDescriptorPath('fixture-bind-1', localAppData))
    assert.equal(binder.bind(firstPath, localAppData), first)
    assert.throws(() => binder.bind(secondPath, localAppData), /REBIND_FORBIDDEN/)

    await writeFile(firstPath, `${JSON.stringify({ ...descriptorValue('fixture-bind-1'), startedAt: '2026-07-23T20:00:01.000Z' })}\n`)
    assert.throws(() => binder.bind(firstPath, localAppData), /REBIND_FORBIDDEN/)
  } finally {
    await rm(localAppData, { recursive: true, force: true })
  }
})

test('descriptor time authority accepts the exact deadline and rejects substitutions around it', () => {
  const descriptor = descriptorValue('fixture-time')
  assert.doesNotThrow(() => assertObservationWithinReleaseRun(descriptor, STARTED_AT, STARTED_AT))
  assert.doesNotThrow(() => assertObservationWithinReleaseRun(descriptor, '2026-07-23T20:30:00.000Z', '2026-07-23T20:30:00.000Z'))
  assert.throws(() => assertObservationWithinReleaseRun(descriptor, '2026-07-23T19:59:59.999Z', STARTED_AT), /PRE_RUN/)
  assert.throws(() => assertObservationWithinReleaseRun(descriptor, '2026-07-23T20:00:00.001Z', STARTED_AT), /FUTURE/)
  assert.throws(() => assertObservationWithinReleaseRun(descriptor, '2026-07-23T20:30:00.001Z', '2026-07-23T20:30:00.001Z'), /AFTER_DEADLINE/)
  assert.throws(() => assertObservationWithinReleaseRun(descriptor, STARTED_AT, '2026-07-23T20:30:00.001Z'), /EVALUATION_AFTER_DEADLINE/)
})

test('conflicting legacy environment identity fails instead of overriding the descriptor', () => {
  const descriptor = descriptorValue('fixture-environment')
  assert.doesNotThrow(() => assertDescriptorEnvironment(descriptor, {}))
  assert.doesNotThrow(() => assertDescriptorEnvironment(descriptor, {
    SANCUSSIGHT_RELEASE_RUN_ID: descriptor.releaseRunId,
    SANCUSSIGHT_RUNTIME_TARGET_ID: descriptor.runtimeTargetId,
  }))
  assert.throws(() => assertDescriptorEnvironment(descriptor, { SANCUSSIGHT_RELEASE_RUN_ID: 'stale-run' }), /ENV_RUN_MISMATCH/)
  assert.throws(() => assertDescriptorEnvironment(descriptor, { SANCUSSIGHT_RUNTIME_TARGET_ID: 'wrong-target' }), /ENV_TARGET_MISMATCH/)
})

test('OTLP exposes descriptor identity before listen and emits nothing on startup mismatch', async () => {
  const localAppData = await mkdtemp(join(tmpdir(), 'sancussight-t16r4-otlp-fixture-'))
  try {
    const descriptorPath = await writeDescriptor(localAppData, descriptorValue('fixture-otlp'))
    const exposure: string[] = []
    const started = startOtlpBridge({
      descriptorPath,
      localAppDataRoot: localAppData,
      environment: {},
      outputPath: join(localAppData, 'isolated-output', 'runtime-telemetry.jsonl'),
      port: 0,
      binder: createReleaseRunDescriptorBinder(),
      exposeIdentity(identity) { exposure.push(identity.releaseRunId) },
    })
    assert.deepEqual(exposure, ['fixture-otlp'])
    assert.equal(started.identity.runtimeTargetId, TARGET_ID)
    await once(started.server, 'listening')
    const address = started.server.address()
    assert.ok(address && typeof address === 'object')
    await writeFile(descriptorPath, `${JSON.stringify({ ...descriptorValue('fixture-otlp'), startedAt: '2026-07-23T20:00:01.000Z' })}\n`)
    const response = await fetch(`http://127.0.0.1:${address.port}/v1/logs`, {
      method: 'POST',
      body: JSON.stringify({ resourceLogs: [] }),
      headers: { 'Content-Type': 'application/json' },
    })
    assert.equal(response.status, 400)
    await new Promise<void>((resolveClose, rejectClose) => started.server.close(error => error ? rejectClose(error) : resolveClose()))

    let exposedWrongIdentity = false
    assert.throws(() => startOtlpBridge({
      descriptorPath,
      localAppDataRoot: localAppData,
      environment: { SANCUSSIGHT_RELEASE_RUN_ID: 'stale-run' },
      port: 0,
      binder: createReleaseRunDescriptorBinder(),
      exposeIdentity() { exposedWrongIdentity = true },
    }), /ENV_RUN_MISMATCH/)
    assert.equal(exposedWrongIdentity, false)
    assert.throws(() => startOtlpBridge({
      descriptorPath,
      localAppDataRoot: localAppData,
      environment: { SANCUSSIGHT_RUNTIME_TARGET_ID: 'wrong-target' },
      port: 0,
      binder: createReleaseRunDescriptorBinder(),
      exposeIdentity() { exposedWrongIdentity = true },
    }), /ENV_TARGET_MISMATCH/)
    assert.equal(exposedWrongIdentity, false)
    await assert.rejects(() => access(join(localAppData, 'isolated-output', 'runtime-telemetry.jsonl')))
  } finally {
    await rm(localAppData, { recursive: true, force: true })
  }
})

test('Pi exposes descriptor identity before fake handler registration and refuses reused-process rebind', async () => {
  const localAppData = await mkdtemp(join(tmpdir(), 'sancussight-t16r4-pi-fixture-'))
  try {
    const firstPath = await writeDescriptor(localAppData, descriptorValue('fixture-pi-1'))
    const secondPath = await writeDescriptor(localAppData, descriptorValue('fixture-pi-2'))
    const outputPath = join(localAppData, 'isolated-pi-output', 'runtime-telemetry.jsonl')
    const events: string[] = []
    const handlers = new Map<string, (...args: unknown[]) => Promise<void>>()
    const fakePi = {
      on(name: string, handler: (...args: unknown[]) => Promise<void>) {
        events.push(`handler:${name}`)
        handlers.set(name, handler)
      },
    }
    const rejectedHandlers: string[] = []
    assert.throws(() => registerSancusSightTelemetry({
      on(name: string) { rejectedHandlers.push(name) },
    } as never, {
      descriptorPath: firstPath,
      localAppDataRoot: localAppData,
      environment: { SANCUSSIGHT_RUNTIME_TARGET_ID: 'wrong-target' },
      outputPath,
      binder: createReleaseRunDescriptorBinder(),
      exposeIdentity() { events.push('unexpected-target-identity') },
    }), /ENV_TARGET_MISMATCH/)
    assert.deepEqual(rejectedHandlers, [])
    assert.equal(events.includes('unexpected-target-identity'), false)

    const binder = createReleaseRunDescriptorBinder()
    const identity = registerSancusSightTelemetry(fakePi as never, {
      descriptorPath: firstPath,
      localAppDataRoot: localAppData,
      environment: { SANCUSSIGHT_PI_VERSION: 'fixture-version' },
      outputPath,
      binder,
      exposeIdentity(value) { events.push(`identity:${value.releaseRunId}`) },
    })
    assert.equal(identity.releaseRunId, 'fixture-pi-1')
    assert.equal(events[0], 'identity:fixture-pi-1')
    assert.ok(events[1]?.startsWith('handler:'))
    await handlers.get('agent_start')?.()
    const emitted = JSON.parse((await readFile(outputPath, 'utf8')).trim())
    assert.equal(emitted.releaseRunId, 'fixture-pi-1')
    assert.equal(emitted.operational.targetId, TARGET_ID)

    const beforeRewrite = await readFile(outputPath, 'utf8')
    await writeFile(firstPath, `${JSON.stringify({ ...descriptorValue('fixture-pi-1'), startedAt: '2026-07-23T20:00:01.000Z' })}\n`)
    await assert.rejects(() => handlers.get('agent_end')?.() ?? Promise.resolve(), /REBIND_FORBIDDEN/)
    assert.equal(await readFile(outputPath, 'utf8'), beforeRewrite)

    const handlerCount = handlers.size
    assert.throws(() => registerSancusSightTelemetry(fakePi as never, {
      descriptorPath: secondPath,
      localAppDataRoot: localAppData,
      environment: {},
      outputPath,
      binder,
      exposeIdentity() { events.push('unexpected-rebind-identity') },
    }), /REBIND_FORBIDDEN/)
    assert.equal(handlers.size, handlerCount)
    assert.equal(events.includes('unexpected-rebind-identity'), false)
  } finally {
    await rm(localAppData, { recursive: true, force: true })
  }
})

function descriptorValue(releaseRunId: string): ReleaseRunDescriptorV1 {
  return {
    schemaVersion: 1,
    releaseRunId,
    startedAt: STARTED_AT,
    runtimeTargetId: TARGET_ID,
    purpose: 'a002-t16',
  }
}

async function writeDescriptor(localAppData: string, descriptor: ReleaseRunDescriptorV1): Promise<string> {
  const path = resolveReleaseRunDescriptorPath(descriptor.releaseRunId, localAppData)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(descriptor, null, 2)}\n`, 'utf8')
  return path
}
