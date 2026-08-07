import type { EvidenceOutcome, RuntimeTelemetryEventV1 } from '../../src/types.ts'
import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { parseOperationalMetadata } from './operational.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'

const TELEMETRY_FILE = /^runtime-telemetry\.jsonl(?:\.\d+)?$/
const EVENT_KEYS = new Set(['schemaVersion', 'eventId', 'sessionId', 'runtime', 'provider', 'transport', 'providerVersion', 'eventType', 'observedAt', 'outcome', 'durationMs', 'toolName', 'approvalState', 'releaseRunId', 'contentCapture', 'operational'])
const ALLOWED_ATTRIBUTES = ['runtime', 'provider', 'transport', 'providerVersion', 'eventType', 'durationMs', 'toolName', 'approvalState', 'outcome']

export class RuntimeTelemetryAdapter implements EvidenceAdapter {
  readonly id = 'runtime-telemetry' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const artifacts = await this.reader.list(path, (name) => TELEMETRY_FILE.test(name))
    if (!artifacts.length) throw new Error('Select a directory containing runtime-telemetry.jsonl.')
    const firstLine = (await this.reader.readText(artifacts[0])).split(/\r?\n/, 1)[0]
    if (firstLine) validateRuntimeTelemetryEvent(JSON.parse(firstLine))
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    let lag = 0
    for (const artifactPath of await this.reader.list(path, (name) => TELEMETRY_FILE.test(name))) {
      const metadata = await this.reader.inspect(artifactPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity && prior.processedBytes === metadata.size) continue
      const text = await this.reader.readText(artifactPath)
      const bytes = Buffer.from(text)
      const priorBytes = prior?.processedBytes ?? 0
      const prefixMatches = !!prior && priorBytes <= bytes.length && contentHash(bytes.subarray(0, priorBytes)) === prior.contentHash
      const processedBefore = prior?.identity === metadata.identity && metadata.size >= priorBytes && prefixMatches ? priorBytes : 0
      const pending = bytes.subarray(processedBefore).toString('utf8')
      const finalNewline = Math.max(pending.lastIndexOf('\n'), pending.lastIndexOf('\r'))
      const complete = finalNewline >= 0 ? pending.slice(0, finalNewline + 1) : ''
      let processedBytes = processedBefore
      let rejectedRecord = false
      const lines = complete.match(/[^\r\n]*(?:\r\n|\n|\r)/g) ?? []
      const completeBytes = Buffer.byteLength(complete)
      const completeHash = contentHash(bytes.subarray(0, processedBefore + completeBytes))
      if (!prior && Object.values(previous.artifacts).some((artifact) => artifact.contentHash === completeHash)) {
        next.artifacts[metadata.name] = cursor(metadata, completeHash, processedBefore + completeBytes)
        continue
      }
      for (const [index, rawLine] of lines.entries()) {
        const line = rawLine.replace(/[\r\n]+$/, '')
        if (!line.trim()) { processedBytes += Buffer.byteLength(rawLine); continue }
        try {
          const event = validateRuntimeTelemetryEvent(JSON.parse(line))
          const operational = parseOperationalMetadata(event.operational)
          if (operational && (operational.runtime !== event.runtime || operational.telemetryProvider !== event.provider || operational.telemetryTransport !== event.transport || operational.telemetryProviderVersion !== event.providerVersion || operational.runId !== event.releaseRunId)) {
            throw new Error('Runtime telemetry operational metadata mismatch.')
          }
          const recordHash = contentHash(line)
          accepted.push(createEvidenceEnvelope({
            source: this.id,
            evidenceKind: event.eventType,
            observedAt: event.observedAt,
            importedAt,
            subject: { externalId: event.sessionId, type: 'agent' },
            outcome: telemetryOutcome(event.outcome),
            summary: `Runtime telemetry observed ${event.eventType} for ${event.runtime} via ${event.provider}.`,
            provenance: {
              artifactName: metadata.name, artifactContentHash: recordHash, sourceRecordId: event.eventId,
              parserId: 'runtime-telemetry-jsonl', parserVersion: '1.0.0', verification: 'not-applicable',
            },
            attributes: {
              runtime: event.runtime, provider: event.provider, transport: event.transport,
              providerVersion: event.providerVersion, eventType: event.eventType, durationMs: event.durationMs,
              toolName: event.toolName, approvalState: event.approvalState, outcome: event.outcome,
            },
            allowedAttributeKeys: ALLOWED_ATTRIBUTES,
            ...(operational ? { operational } : {}),
          }))
          processedBytes += Buffer.byteLength(rawLine)
        } catch {
          rejected.push({
            id: contentHash(`${metadata.name}:${index}:${line}`), source: this.id,
            artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt,
            errorCode: 'invalid-runtime-telemetry-record',
            guidance: 'Use RuntimeTelemetryEventV1 with contentCapture false and only allowlisted metadata fields.',
          })
          rejectedRecord = true
          break
        }
      }
      lag += bytes.length - processedBytes
      const hash = contentHash(bytes.subarray(0, processedBytes))
      next.artifacts[metadata.name] = cursor(metadata, hash, processedBytes)
      if (rejectedRecord) continue
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag }
  }
}

function validateRuntimeTelemetryEvent(value: unknown): RuntimeTelemetryEventV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid runtime telemetry event.')
  const raw = value as Record<string, unknown>
  if (Object.keys(raw).some((key) => !EVENT_KEYS.has(key))) throw new Error('Runtime telemetry contains a non-allowlisted field.')
  const event = raw as unknown as RuntimeTelemetryEventV1
  if (event.schemaVersion !== 1 || !bounded(event.eventId, 160) || !bounded(event.sessionId, 160) || !bounded(event.providerVersion, 80) || !bounded(event.eventType, 80) || !bounded(event.releaseRunId, 160)) throw new Error('Runtime telemetry identity is invalid.')
  if (!['codex-cli', 'claude-code', 'pi'].includes(event.runtime) || !['agent-beacon', 'codex-otel', 'claude-otel', 'pi-extension'].includes(event.provider) || !['jsonl', 'otlp-http', 'otlp-grpc'].includes(event.transport)) throw new Error('Runtime telemetry provider is unsupported.')
  if ((event.runtime === 'pi') !== (event.provider === 'pi-extension')) throw new Error('Runtime telemetry runtime/provider pairing is invalid.')
  if ((event.runtime === 'codex-cli' && event.provider === 'claude-otel') || (event.runtime === 'claude-code' && event.provider === 'codex-otel')) throw new Error('Runtime telemetry runtime/provider pairing is invalid.')
  if (!['succeeded', 'failed', 'blocked', 'observed'].includes(event.outcome) || event.contentCapture !== false || Number.isNaN(Date.parse(event.observedAt))) throw new Error('Runtime telemetry state is invalid.')
  if (event.durationMs !== undefined && (!Number.isFinite(event.durationMs) || event.durationMs < 0)) throw new Error('Runtime telemetry duration is invalid.')
  if (event.toolName !== undefined && !bounded(event.toolName, 80)) throw new Error('Runtime telemetry tool name is invalid.')
  if (event.approvalState !== undefined && !['approved', 'denied', 'not-required', 'unknown'].includes(event.approvalState)) throw new Error('Runtime telemetry approval state is invalid.')
  if (event.operational !== undefined && !parseOperationalMetadata(event.operational)) throw new Error('Runtime telemetry operational metadata is invalid.')
  return event
}

function telemetryOutcome(value: RuntimeTelemetryEventV1['outcome']): EvidenceOutcome {
  return value === 'succeeded' ? 'pass' : value === 'failed' || value === 'blocked' ? 'fail' : 'observed'
}

function cursor(metadata: { size: number; mtimeMs: number; identity: string }, hash: string, processedBytes: number) {
  return { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash, processedBytes }
}

function bounded(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value)
}
