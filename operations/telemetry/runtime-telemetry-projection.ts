import { createHash, randomUUID } from 'node:crypto'
import type { EvidenceRuntimeId, RuntimeTelemetryEventV1, RuntimeTelemetryProvider, RuntimeTelemetryTransport } from '../../src/types.ts'

const FORBIDDEN_ATTRIBUTE = /(?:^|[._-])(?:prompt|response|reasoning|thought|command|arguments?|content|message|path|secret|credential|private[_-]?key|tool[_-]?(?:input|output))(?:$|[._-])/i
const SAFE_METADATA_ATTRIBUTE = /^(?:prompt_length|model_reasoning_effort|reasoning_effort|http\.response\.status_code)$/i

export interface ProjectionContext {
  releaseRunId: string
  targetId: string
  providerVersion: string
  qualification: 'operational' | 'isolated-qa' | 'manual'
  transport: RuntimeTelemetryTransport
}

export interface MetadataEventInput {
  eventId?: string
  sessionId: string
  runtime: EvidenceRuntimeId
  provider: RuntimeTelemetryProvider
  eventType: string
  observedAt?: string
  outcome?: RuntimeTelemetryEventV1['outcome']
  durationMs?: number
  toolName?: string
  approvalState?: RuntimeTelemetryEventV1['approvalState']
}

export function createRuntimeTelemetryEvent(input: MetadataEventInput, context: ProjectionContext): RuntimeTelemetryEventV1 {
  const observedAt = input.observedAt && !Number.isNaN(Date.parse(input.observedAt)) ? input.observedAt : new Date().toISOString()
  return {
    schemaVersion: 1,
    eventId: safeToken(input.eventId ?? randomUUID(), 160, 'eventId'),
    sessionId: safeToken(input.sessionId, 160, 'sessionId'),
    runtime: input.runtime,
    provider: input.provider,
    transport: context.transport,
    providerVersion: safeToken(context.providerVersion, 80, 'providerVersion'),
    eventType: safeToken(input.eventType, 80, 'eventType'),
    observedAt,
    outcome: input.outcome ?? 'observed',
    ...(input.durationMs !== undefined && Number.isFinite(input.durationMs) && input.durationMs >= 0 ? { durationMs: input.durationMs } : {}),
    ...(input.toolName ? { toolName: safeToken(input.toolName, 80, 'toolName') } : {}),
    ...(input.approvalState ? { approvalState: input.approvalState } : {}),
    releaseRunId: safeToken(context.releaseRunId, 160, 'releaseRunId'),
    contentCapture: false,
    operational: {
      qualification: context.qualification,
      sourceVersion: '1.0.0',
      runId: safeToken(context.releaseRunId, 160, 'releaseRunId'),
      targetId: safeToken(context.targetId, 160, 'targetId'),
      contractVersion: 'runtime-telemetry-v1',
      runtime: input.runtime,
      telemetryProvider: input.provider,
      telemetryTransport: context.transport,
      telemetryProviderVersion: safeToken(context.providerVersion, 80, 'providerVersion'),
    },
  }
}

export function projectOtlpLogs(payload: unknown, context: Omit<ProjectionContext, 'transport'>): RuntimeTelemetryEventV1[] {
  if (!isRecord(payload) || !Array.isArray(payload.resourceLogs)) throw new Error('Expected an OTLP JSON logs payload.')
  const projected: RuntimeTelemetryEventV1[] = []
  let firstRejection: Error | undefined
  for (const resourceLog of payload.resourceLogs) {
    if (!isRecord(resourceLog)) continue
    const resourceAttributes = otlpAttributes(isRecord(resourceLog.resource) ? resourceLog.resource.attributes : undefined)
    for (const scopeLog of Array.isArray(resourceLog.scopeLogs) ? resourceLog.scopeLogs : []) {
      if (!isRecord(scopeLog)) continue
      for (const record of Array.isArray(scopeLog.logRecords) ? scopeLog.logRecords : []) {
        if (!isRecord(record)) continue
        try {
          const attributes = otlpAttributes(record.attributes)
          assertNoForbiddenAttributes(attributes)
          const serviceName = stringValue(resourceAttributes['service.name'])
          const runtime = runtimeFrom(serviceName, stringValue(attributes['runtime.name']))
          const provider = runtime === 'codex-cli' ? 'codex-otel' : 'claude-otel'
          const attributeEventType = firstToken(attributes, ['event.name', 'event.type', 'gen_ai.operation.name'])
          const eventType = attributeEventType ?? safeBodyEventType(record.body) ?? safeToken(stringValue(record.severityText) || 'runtime.observed', 80, 'eventType')
          const sessionId = firstToken(attributes, ['session.id', 'session_id', 'conversation.id', 'gen_ai.conversation.id'])
          if (!sessionId) throw new Error('OTLP runtime event is missing a bounded session identifier.')
          const providerVersion = stringValue(resourceAttributes['service.version']) || context.providerVersion
          const eventId = safeEventId(record, runtime, eventType, sessionId)
          projected.push(createRuntimeTelemetryEvent({
            eventId, sessionId, runtime, provider, eventType,
            observedAt: otlpTimestamp(record.timeUnixNano, record.observedTimeUnixNano),
            outcome: otlpOutcome(attributes, record.severityText),
            ...(numberValue(attributes['duration_ms']) !== undefined ? { durationMs: numberValue(attributes['duration_ms']) } : {}),
            ...(firstToken(attributes, ['tool.name', 'tool_name', 'gen_ai.tool.name']) ? { toolName: firstToken(attributes, ['tool.name', 'tool_name', 'gen_ai.tool.name']) } : {}),
            ...(approvalState(attributes) ? { approvalState: approvalState(attributes) } : {}),
          }, { ...context, providerVersion, transport: 'otlp-http' }))
        } catch (error) {
          firstRejection ??= error instanceof Error ? error : new Error('Runtime telemetry projection failed.')
        }
      }
    }
  }
  if (!projected.length && firstRejection) throw firstRejection
  return projected
}

function otlpAttributes(value: unknown): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}
  if (!Array.isArray(value)) return result
  for (const item of value) {
    if (!isRecord(item) || typeof item.key !== 'string' || !isRecord(item.value)) continue
    const parsed = item.value.stringValue ?? item.value.boolValue ?? item.value.intValue ?? item.value.doubleValue
    if (typeof parsed === 'string' || typeof parsed === 'boolean' || (typeof parsed === 'number' && Number.isFinite(parsed))) result[item.key] = parsed
  }
  return result
}

function assertNoForbiddenAttributes(attributes: Record<string, unknown>): void {
  const forbidden = Object.keys(attributes).find((key) => FORBIDDEN_ATTRIBUTE.test(key) && !SAFE_METADATA_ATTRIBUTE.test(key) && !/(?:[._-](?:id|count|type|name))$/i.test(key))
  if (forbidden) throw new Error(`OTLP event contains prohibited attribute key: ${forbidden.slice(0, 120)}`)
}

function safeBodyEventType(value: unknown): string | undefined {
  if (value === undefined) return undefined
  const body = isRecord(value) ? stringValue(value.stringValue) : ''
  if (!body) throw new Error('OTLP body is not a bounded event-name token.')
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(body) || FORBIDDEN_ATTRIBUTE.test(body)) throw new Error('OTLP body contains non-metadata content.')
  return body
}

function runtimeFrom(serviceName: string, explicit: string): 'codex-cli' | 'claude-code' {
  const value = `${explicit} ${serviceName}`.toLowerCase()
  if (value.includes('codex')) return 'codex-cli'
  if (value.includes('claude')) return 'claude-code'
  throw new Error('OTLP service is not an approved runtime.')
}

function safeEventId(record: Record<string, unknown>, runtime: string, eventType: string, sessionId: string): string {
  const candidate = stringValue(record.traceId) || stringValue(record.spanId)
  return candidate ? safeToken(candidate, 160, 'eventId') : createHash('sha256').update(`${runtime}\n${eventType}\n${sessionId}\n${stringValue(record.timeUnixNano)}`).digest('hex')
}

function otlpTimestamp(...values: unknown[]): string {
  const milliseconds = values.map(value => typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.trunc(value / 1_000_000)
    : typeof value === 'string' && /^\d+$/.test(value) && BigInt(value) > 0n
      ? Number(BigInt(value) / 1_000_000n)
      : Number.NaN).find(Number.isFinite) ?? Number.NaN
  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : new Date().toISOString()
}

function otlpOutcome(attributes: Record<string, string | number | boolean>, severity: unknown): RuntimeTelemetryEventV1['outcome'] {
  if (attributes.blocked === true || String(attributes.decision).toLowerCase() === 'block') return 'blocked'
  if (attributes.success === false || /error|fatal/i.test(stringValue(severity))) return 'failed'
  if (attributes.success === true) return 'succeeded'
  return 'observed'
}

function approvalState(attributes: Record<string, string | number | boolean>): RuntimeTelemetryEventV1['approvalState'] | undefined {
  const value = String(attributes['approval.state'] ?? attributes.decision ?? '').toLowerCase()
  if (value === 'allow' || value === 'approved') return 'approved'
  if (value === 'deny' || value === 'denied' || value === 'block') return 'denied'
  return undefined
}

function firstToken(attributes: Record<string, string | number | boolean>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = stringValue(attributes[key])
    if (value) return safeToken(value, 160, key)
  }
  return undefined
}

function numberValue(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function stringValue(value: unknown): string { return typeof value === 'string' ? value : '' }
function isRecord(value: unknown): value is Record<string, any> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function safeToken(value: string, max: number, field: string): string {
  const normalized = value.trim()
  if (!normalized || normalized.length > max || /[\u0000-\u001f\u007f\\/]/.test(normalized)) throw new Error(`${field} is not a bounded metadata token.`)
  return normalized
}
