import type { AIMapAuthorizationManifestV1, AIMapFindingV1, AIMapOperationalExportV1, AIMapTargetV1 } from '../../src/types.ts'
import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'
import { parseOperationalMetadata } from './operational.ts'

const ALLOWED_ATTRIBUTES = ['findingId', 'endpointId', 'hostname', 'port', 'protocol', 'authStatus', 'riskScore', 'riskFactors', 'template', 'severity', 'scanId', 'authorizationId', 'sourceVersion']

export class AIMapAdapter implements EvidenceAdapter {
  readonly id = 'aimap' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const authorization = await readAuthorization(this.reader, path)
    const files = await exportFiles(this.reader, path)
    if (!files.length) throw new Error('Select a completed AIMap sanitized export and matching authorization manifest.')
    validateExport(JSON.parse(await this.reader.readText(files[0])), authorization)
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted: AdapterCollection['accepted'] = []
    const rejected: AdapterCollection['rejected'] = []
    let authorization: AIMapAuthorizationManifestV1
    try { authorization = await readAuthorization(this.reader, path) } catch {
      return { accepted, rejected: [{ id: 'aimap-authorization-missing', source: this.id, artifactName: 'authorization.json', rejectedAt: importedAt, errorCode: 'aimap-authorization-missing', guidance: 'Provide an exact unexpired AIMap authorization manifest beside the sanitized export.' }], checkpoint: checkpointFor(this.id, next, importedAt), lag: 0 }
    }
    for (const reportPath of await exportFiles(this.reader, path)) {
      const metadata = await this.reader.inspect(reportPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      const text = await this.reader.readText(reportPath)
      const hash = contentHash(text)
      try {
        const report = validateExport(JSON.parse(text), authorization)
        const operational = parseOperationalMetadata(report.operational)
        for (const finding of report.findings) accepted.push(createEnvelope(report, finding, metadata.name, hash, importedAt, operational))
        next.artifacts[metadata.name] = { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash }
      } catch {
        rejected.push({ id: hash, source: this.id, artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt, errorCode: 'unsupported-aimap-export', guidance: 'Provide a completed AIMap export matching the exact unexpired authorization target and scope without raw network or exploitation data.' })
      }
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag: 0 }
  }
}

function createEnvelope(report: AIMapOperationalExportV1, finding: AIMapFindingV1, artifactName: string, artifactHash: string, importedAt: string, operational: ReturnType<typeof parseOperationalMetadata>) {
  return createEvidenceEnvelope({
    source: 'aimap', evidenceKind: 'attack-surface-finding', observedAt: report.completedAt, importedAt,
    subject: { externalId: report.target.host, type: 'agent' }, outcome: ['critical', 'high'].includes(finding.severity) ? 'fail' : finding.severity === 'medium' ? 'warn' : finding.severity === 'low' ? 'observed' : 'observed', summary: finding.title,
    provenance: { artifactName, artifactContentHash: artifactHash, sourceRecordId: finding.findingId, parserId: 'aimap-operational', parserVersion: '1.0.0', verification: 'not-applicable' },
    attributes: { findingId: finding.findingId, endpointId: finding.endpointId, hostname: finding.hostname, port: finding.port, protocol: finding.protocol, authStatus: finding.authStatus, riskScore: finding.riskScore, riskFactors: finding.riskFactors?.join(',').slice(0, 240), template: finding.template, severity: finding.severity, scanId: report.scanId, authorizationId: report.authorizationId, sourceVersion: report.sourceVersion },
    allowedAttributeKeys: ALLOWED_ATTRIBUTES,
    ...(operational ? { operational } : {}),
  })
}

async function exportFiles(reader: ReadOnlyArtifactReader, path: string): Promise<string[]> { return reader.list(path, (name) => name.toLowerCase().endsWith('.json') && name.toLowerCase() !== 'authorization.json') }

async function readAuthorization(reader: ReadOnlyArtifactReader, path: string): Promise<AIMapAuthorizationManifestV1> {
  const files = await reader.list(path, (name) => name.toLowerCase() === 'authorization.json')
  if (!files.length) throw new Error('authorization')
  return validateAuthorization(JSON.parse(await reader.readText(files[0])))
}

function validateAuthorization(value: unknown): AIMapAuthorizationManifestV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('authorization')
  const item = value as Partial<AIMapAuthorizationManifestV1>
  if (item.schemaVersion !== 1 || !bounded(item.authorizationId, 160) || !bounded(item.owner, 160) || !bounded(item.purpose, 320) || !isTarget(item.target) || !item.validFrom || !item.validUntil || Number.isNaN(Date.parse(item.validFrom)) || Number.isNaN(Date.parse(item.validUntil)) || !bounded(item.releaseRunId, 160)) throw new Error('authorization')
  return item as AIMapAuthorizationManifestV1
}

function validateExport(value: unknown, authorization: AIMapAuthorizationManifestV1): AIMapOperationalExportV1 {
  if (containsProhibited(value) || !value || typeof value !== 'object' || Array.isArray(value)) throw new Error('export')
  const report = value as Partial<AIMapOperationalExportV1>
  if (report.schemaVersion !== 1 || !bounded(report.sourceVersion, 80) || !bounded(report.scanId, 160) || report.authorizationId !== authorization.authorizationId || report.runId !== authorization.releaseRunId || report.status !== 'completed' || !isTarget(report.target) || !report.completedAt || Number.isNaN(Date.parse(report.completedAt)) || !Array.isArray(report.findings) || !report.findings.every(isFinding) || (report.operational !== undefined && !parseOperationalMetadata(report.operational))) throw new Error('export')
  if (Date.parse(report.completedAt) < Date.parse(authorization.validFrom) || Date.parse(report.completedAt) > Date.parse(authorization.validUntil) || !sameTarget(report.target, authorization.target)) throw new Error('scope')
  return report as AIMapOperationalExportV1
}

function isFinding(value: unknown): value is AIMapFindingV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const finding = value as Partial<AIMapFindingV1>
  if (!bounded(finding.findingId, 160) || !bounded(finding.endpointId, 160) || !bounded(finding.hostname, 160) || typeof finding.port !== 'number' || !Number.isInteger(finding.port) || finding.port < 1 || finding.port > 65535 || !['http', 'https'].includes(String(finding.protocol)) || !['authenticated', 'unauthenticated', 'unknown'].includes(String(finding.authStatus)) || !bounded(finding.template, 160) || !['critical', 'high', 'medium', 'low', 'informational'].includes(String(finding.severity)) || !bounded(finding.title, 320)) return false
  if (finding.riskScore !== undefined && (typeof finding.riskScore !== 'number' || !Number.isFinite(finding.riskScore))) return false
  if (finding.riskFactors !== undefined && (!Array.isArray(finding.riskFactors) || finding.riskFactors.length > 16 || !finding.riskFactors.every((item) => bounded(item, 120)))) return false
  return hasOnlyKeys(value as Record<string, unknown>, ['findingId', 'endpointId', 'hostname', 'port', 'protocol', 'authStatus', 'riskScore', 'riskFactors', 'template', 'severity', 'title'])
}

function isTarget(value: unknown): value is AIMapTargetV1 { return !!value && typeof value === 'object' && !Array.isArray(value) && hasOnlyKeys(value as Record<string, unknown>, ['host', 'port', 'protocol', 'templates']) && bounded((value as AIMapTargetV1).host, 160) && typeof (value as AIMapTargetV1).port === 'number' && Number.isInteger((value as AIMapTargetV1).port) && (value as AIMapTargetV1).port > 0 && (value as AIMapTargetV1).port <= 65535 && ['http', 'https'].includes(String((value as AIMapTargetV1).protocol)) && Array.isArray((value as AIMapTargetV1).templates) && (value as AIMapTargetV1).templates.length <= 64 && (value as AIMapTargetV1).templates.every((item) => bounded(item, 160)) }
function sameTarget(left: AIMapTargetV1, right: AIMapTargetV1): boolean { return left.host === right.host && left.port === right.port && left.protocol === right.protocol && [...left.templates].sort().join('\n') === [...right.templates].sort().join('\n') }
function containsProhibited(value: unknown): boolean { if (Array.isArray(value)) return value.some(containsProhibited); if (!value || typeof value !== 'object') return false; return Object.entries(value as Record<string, unknown>).some(([key, nested]) => ['systemPrompt', 'toolSchemas', 'toolParameters', 'responseBody', 'curl', 'rawNuclei', 'geolocation', 'payload', 'exploitationOutput', 'prompts', 'responses'].includes(key) || containsProhibited(nested)) }
function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean { const allowed = new Set(keys); return Object.keys(value).every((key) => allowed.has(key)) }
function bounded(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) }
