import type { EvidenceRuntimeId, OperationalProvenance } from '../../src/types.ts'

export function parseOperationalMetadata(value: unknown): OperationalProvenance | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const item = value as Partial<OperationalProvenance>
  if (!isQualification(item.qualification) || !bounded(item.sourceVersion, 80) || !bounded(item.runId, 160) || !bounded(item.targetId, 160) || !bounded(item.contractVersion, 80)) return undefined
  if (item.configurationHash !== undefined && !/^[a-f0-9]{64}$/.test(item.configurationHash)) return undefined
  if (item.workerRemitHash !== undefined && !/^[a-f0-9]{64}$/.test(item.workerRemitHash)) return undefined
  if (item.runtime !== undefined && !isRuntime(item.runtime)) return undefined
  if (item.telemetryProvider !== undefined && !['agent-beacon', 'codex-otel', 'claude-otel', 'pi-extension'].includes(item.telemetryProvider)) return undefined
  if (item.telemetryTransport !== undefined && !['jsonl', 'otlp-http', 'otlp-grpc'].includes(item.telemetryTransport)) return undefined
  if (item.telemetryProviderVersion !== undefined && !bounded(item.telemetryProviderVersion, 80)) return undefined
  return {
    qualification: item.qualification,
    sourceVersion: item.sourceVersion,
    runId: item.runId,
    targetId: item.targetId,
    contractVersion: item.contractVersion,
    ...(item.configurationHash ? { configurationHash: item.configurationHash } : {}),
    ...(item.workerRemitHash ? { workerRemitHash: item.workerRemitHash } : {}),
    ...(item.runtime ? { runtime: item.runtime } : {}),
    ...(item.telemetryProvider ? { telemetryProvider: item.telemetryProvider } : {}),
    ...(item.telemetryTransport ? { telemetryTransport: item.telemetryTransport } : {}),
    ...(item.telemetryProviderVersion ? { telemetryProviderVersion: item.telemetryProviderVersion } : {}),
  }
}

function bounded(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) }
function isRuntime(value: unknown): value is EvidenceRuntimeId { return value === 'codex-cli' || value === 'claude-code' || value === 'pi' }
function isQualification(value: unknown): value is OperationalProvenance['qualification'] { return ['operational', 'isolated-qa', 'demo', 'fixture', 'replay', 'manual'].includes(String(value)) }
