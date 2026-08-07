import type { EvidenceOutcome } from '../../src/types.ts'
import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'
import { parseOperationalMetadata } from './operational.ts'

interface BeaconEvent {
  timestamp?: string
  schema_version?: string
  severity?: string
  message?: string
  event?: { kind?: string; action?: string; category?: string }
  endpoint?: { hostname?: string; agent_version?: string }
  harness?: { name?: string; version?: string }
  session?: { id?: string }
  command?: { exit_code?: number; duration_ms?: number }
  approval?: { status?: string }
  operational?: unknown
  sancussight?: { operational?: unknown }
}

const BEACON_FILE = /^(runtime|inventory_state)\.jsonl(?:\.\d+)?$/
const ALLOWED_ATTRIBUTES = ['eventKind', 'eventAction', 'eventCategory', 'severity', 'harness', 'harnessVersion', 'agentVersion', 'exitCode', 'durationMs', 'approvalStatus']

export class AgentBeaconAdapter implements EvidenceAdapter {
  readonly id = 'agent-beacon' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) {
    this.reader = reader
  }

  async validate(path: string): Promise<void> {
    const artifacts = await this.reader.list(path, (name) => BEACON_FILE.test(name))
    if (!artifacts.length) throw new Error('Select the Agent Beacon logs directory containing runtime.jsonl or inventory_state.jsonl.')
    const firstLine = (await this.reader.readText(artifacts[0])).split(/\r?\n/, 1)[0]
    if (firstLine) validateBeaconEvent(JSON.parse(firstLine))
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    let lag = 0
    const artifacts = await this.reader.list(path, (name) => BEACON_FILE.test(name))

    for (const artifactPath of artifacts) {
      const metadata = await this.reader.inspect(artifactPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      const text = await this.reader.readText(artifactPath)
      const finalNewline = Math.max(text.lastIndexOf('\n'), text.lastIndexOf('\r'))
      const complete = finalNewline >= 0 ? text.slice(0, finalNewline + 1) : ''
      lag += Buffer.byteLength(text.slice(complete.length))
      const hash = contentHash(complete)
      if (Object.values(previous.artifacts).some((artifact) => artifact.contentHash === hash)) {
        next.artifacts[metadata.name] = {
          size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity,
          contentHash: hash, processedBytes: Buffer.byteLength(complete),
        }
        continue
      }

      for (const [index, line] of complete.split(/\r?\n/).entries()) {
        if (!line.trim()) continue
        try {
          const event = validateBeaconEvent(JSON.parse(line))
          const externalId = event.session?.id ?? event.harness?.name ?? event.endpoint?.hostname ?? 'beacon-runtime'
          const eventAction = event.event?.action ?? 'runtime.observed'
          const recordHash = contentHash(line)
          accepted.push(createEvidenceEnvelope({
            source: this.id,
            evidenceKind: metadata.name === 'inventory_state.jsonl' ? 'inventory-state' : event.event?.kind ?? 'runtime-event',
            observedAt: event.timestamp!,
            importedAt,
            subject: { externalId, type: event.session?.id ? 'agent' : 'runtime' },
            outcome: beaconOutcome(event),
            summary: `Agent Beacon observed ${eventAction}${event.harness?.name ? ` for ${event.harness.name}` : ''}.`,
            provenance: {
              artifactName: metadata.name,
              artifactContentHash: recordHash,
              sourceRecordId: recordHash,
              parserId: 'agent-beacon-jsonl', parserVersion: '1.0.0', verification: 'not-applicable',
            },
            attributes: {
              eventKind: event.event?.kind, eventAction, eventCategory: event.event?.category,
              severity: event.severity, harness: event.harness?.name, harnessVersion: event.harness?.version,
              agentVersion: event.endpoint?.agent_version, exitCode: event.command?.exit_code,
              durationMs: event.command?.duration_ms, approvalStatus: event.approval?.status,
            },
            allowedAttributeKeys: ALLOWED_ATTRIBUTES,
            ...(parseOperationalMetadata(event.operational ?? event.sancussight?.operational) ? { operational: parseOperationalMetadata(event.operational ?? event.sancussight?.operational) } : {}),
          }))
        } catch {
          rejected.push({
            id: contentHash(`${metadata.name}:${index}:${line}`), source: this.id,
            artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt,
            errorCode: 'invalid-beacon-record', guidance: 'Confirm Beacon emits endpoint schema_version 1.0 JSONL.',
          })
        }
      }
      next.artifacts[metadata.name] = {
        size: metadata.size,
        mtimeMs: metadata.mtimeMs,
        identity: metadata.identity,
        contentHash: hash,
        processedBytes: Buffer.byteLength(complete),
      }
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag }
  }
}

function validateBeaconEvent(value: unknown): BeaconEvent {
  if (!value || typeof value !== 'object') throw new Error('Invalid Beacon event.')
  const event = value as BeaconEvent
  if (event.schema_version !== '1.0' || !event.timestamp || Number.isNaN(Date.parse(event.timestamp))) throw new Error('Unsupported Beacon event.')
  return event
}

function beaconOutcome(event: BeaconEvent): EvidenceOutcome {
  if (typeof event.command?.exit_code === 'number' && event.command.exit_code !== 0) return 'fail'
  if (['high', 'critical'].includes(event.severity?.toLowerCase() ?? '')) return 'warn'
  return 'observed'
}
