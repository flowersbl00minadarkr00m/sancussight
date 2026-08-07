import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { createPiTelemetryContext } from '../../operations/telemetry/pi-context.ts'
import { createRuntimeTelemetryEvent, projectOtlpLogs } from '../../operations/telemetry/runtime-telemetry-projection.ts'

const NOW_NANOS = '1784203200000000000'
const context = { releaseRunId: 'run-001', targetId: 'local-ai-runtime', providerVersion: '1.2.3', qualification: 'operational' as const }

test('OTLP projection accepts bounded metadata and rejects content-bearing attributes', () => {
  const payload = otlpPayload([
    attribute('event.name', 'turn.completed'),
    attribute('session.id', 'session-001'),
    attribute('tool.name', 'bash'),
    attribute('success', true),
  ])
  const [event] = projectOtlpLogs(payload, context)
  assert.equal(event.runtime, 'codex-cli')
  assert.equal(event.provider, 'codex-otel')
  assert.equal(event.contentCapture, false)
  assert.equal(event.toolName, 'bash')
  assert.equal(JSON.stringify(event).includes('command'), false)

  const unsafe = otlpPayload([attribute('event.name', 'turn.completed'), attribute('session.id', 'session-001'), attribute('prompt', 'private')])
  assert.throws(() => projectOtlpLogs(unsafe, context), /prohibited attribute key/)

  const metadataOnly = otlpPayload([
    attribute('event.name', 'turn.completed'),
    attribute('session.id', 'session-001'),
    attribute('prompt.id', 'prompt-opaque-001'),
    attribute('skill_path_count', 3),
    attribute('prompt_length', 0),
    attribute('model_reasoning_effort', 'low'),
    attribute('reasoning_effort', 'medium'),
    attribute('http.response.status_code', 200),
  ])
  assert.equal(projectOtlpLogs(metadataOnly, context).length, 1)
})

test('OTLP projection rejects an unsafe record without discarding safe records in the same batch', () => {
  const payload = {
    resourceLogs: [{
      resource: { attributes: [attribute('service.name', 'codex-cli'), attribute('service.version', '1.2.3')] },
      scopeLogs: [{ logRecords: [
        { timeUnixNano: NOW_NANOS, traceId: 'b'.repeat(32), body: { kvlistValue: { values: [] } }, attributes: [attribute('event.name', 'session.started'), attribute('session.id', 'session-002')] },
        { timeUnixNano: NOW_NANOS, traceId: 'c'.repeat(32), attributes: [attribute('event.name', 'user_prompt'), attribute('session.id', 'session-002'), attribute('prompt', 'private')] },
      ] }],
    }],
  }
  const events = projectOtlpLogs(payload, context)
  assert.equal(events.length, 1)
  assert.equal(events[0].eventType, 'session.started')
})

test('OTLP projection accepts JSON numeric nanosecond timestamps from native exporters', () => {
  const payload = otlpPayload([attribute('event.name', 'turn.completed'), attribute('session.id', 'session-003')])
  payload.resourceLogs[0].scopeLogs[0].logRecords[0].timeUnixNano = 1784203200000000000 as unknown as string
  const [event] = projectOtlpLogs(payload, context)
  assert.equal(event.observedAt, '2026-07-16T12:00:00.000Z')
})

test('OTLP projection uses the observation timestamp when an exporter reports zero event time', () => {
  const payload = otlpPayload([attribute('event.name', 'turn.completed'), attribute('session.id', 'session-004')])
  const record = payload.resourceLogs[0].scopeLogs[0].logRecords[0] as Record<string, unknown>
  record.timeUnixNano = 0
  record.observedTimeUnixNano = 1784203200000000000
  const [event] = projectOtlpLogs(payload, context)
  assert.equal(event.observedAt, '2026-07-16T12:00:00.000Z')
})

test('Pi projection contains lifecycle metadata only and extension never reads sensitive event payloads', async () => {
  const event = createRuntimeTelemetryEvent({ sessionId: 'pi-session-001', runtime: 'pi', provider: 'pi-extension', eventType: 'tool.completed', toolName: 'bash', outcome: 'succeeded' }, { ...context, transport: 'jsonl' })
  const serialized = JSON.stringify(event)
  assert.equal(event.contentCapture, false)
  for (const forbidden of ['prompt', 'response', 'reasoning', 'command', 'toolArguments', 'toolResult', 'path']) assert.equal(serialized.includes(forbidden), false)

  const extension = await readFile(join(process.cwd(), 'operations', 'telemetry', 'pi-extension.ts'), 'utf8')
  for (const forbidden of ['event.input', 'event.content', 'event.details', 'event.message', 'event.toolResults', 'getSessionFile']) assert.equal(extension.includes(forbidden), false)
})

test('Pi extension uses the shared runtime target identity for an operational release run', () => {
  const context = createPiTelemetryContext({
    SANCUSSIGHT_RELEASE_RUN_ID: 'run-002',
    SANCUSSIGHT_RUNTIME_TARGET_ID: 'sancussight-local-runtimes',
    SANCUSSIGHT_PI_VERSION: '0.80.10',
  })
  assert.equal(context.targetId, 'sancussight-local-runtimes')
  assert.equal(context.releaseRunId, 'run-002')
  assert.equal(context.qualification, 'operational')
  assert.equal(context.transport, 'jsonl')
  assert.equal(createPiTelemetryContext({ SANCUSSIGHT_RELEASE_RUN_ID: 'run-003' }).targetId, 'local-ai-runtime')
})

test('Pi extension is wired to the shared context seam', async () => {
  const extension = await readFile(join(process.cwd(), 'operations', 'telemetry', 'pi-extension.ts'), 'utf8')
  assert.match(extension, /createPiTelemetryContext\(\)/)
})

function otlpPayload(attributes: unknown[]) {
  return {
    resourceLogs: [{
      resource: { attributes: [attribute('service.name', 'codex-cli'), attribute('service.version', '1.2.3')] },
      scopeLogs: [{ logRecords: [{ timeUnixNano: NOW_NANOS, traceId: 'a'.repeat(32), severityText: 'INFO', attributes }] }],
    }],
  }
}

function attribute(key: string, value: string | boolean | number) {
  return { key, value: typeof value === 'boolean' ? { boolValue: value } : typeof value === 'number' ? { intValue: value } : { stringValue: value } }
}
