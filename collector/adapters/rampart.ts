import type { RampartOperationalReportV1, RampartOperationalResultV1 } from '../../src/types.ts'
import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'
import { parseOperationalMetadata } from './operational.ts'

const ALLOWED_ATTRIBUTES = ['resultId', 'scenarioId', 'status', 'safe', 'harmCategory', 'strategy', 'durationMs', 'suiteVersion', 'evaluatorVersion']

export class RampartAdapter implements EvidenceAdapter {
  readonly id = 'rampart' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const files = await this.reader.jsonFiles(path)
    if (!files.length) throw new Error('Select a sanitized RAMPART operational report.')
    validateReport(JSON.parse(await this.reader.readText(files[0])))
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    for (const reportPath of await this.reader.jsonFiles(path)) {
      const metadata = await this.reader.inspect(reportPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      const text = await this.reader.readText(reportPath)
      const hash = contentHash(text)
      try {
        const report = validateReport(JSON.parse(text))
        const operational = parseOperationalMetadata(report.operational)
        for (const result of report.results) accepted.push(createEnvelope(report, result, metadata.name, hash, importedAt, operational))
        next.artifacts[metadata.name] = { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash }
      } catch {
        rejected.push({ id: hash, source: this.id, artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt, errorCode: 'unsupported-rampart-report', guidance: 'Export a sanitized RampartOperationalReportV1 without turns, prompts, responses, tool data, evaluator rationale, or secrets.' })
      }
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag: 0 }
  }
}

function createEnvelope(report: RampartOperationalReportV1, result: RampartOperationalResultV1, artifactName: string, artifactHash: string, importedAt: string, operational: ReturnType<typeof parseOperationalMetadata>) {
  return createEvidenceEnvelope({
    source: 'rampart', evidenceKind: 'safety-test-result', observedAt: result.observedAt, importedAt,
    subject: { externalId: report.targetId, type: 'agent' }, outcome: result.status === 'safe' ? 'pass' : result.status === 'unsafe' || result.status === 'error' ? 'fail' : 'warn',
    summary: result.summary, provenance: { artifactName, artifactContentHash: artifactHash, sourceRecordId: result.resultId, parserId: 'rampart-operational', parserVersion: '1.0.0', verification: 'not-applicable' },
    attributes: { resultId: result.resultId, scenarioId: result.scenarioId, status: result.status, safe: result.safe, harmCategory: result.harmCategory, strategy: result.strategy, durationMs: result.durationMs, suiteVersion: report.suiteVersion, evaluatorVersion: report.evaluatorVersion },
    allowedAttributeKeys: ALLOWED_ATTRIBUTES,
    ...(operational ? { operational } : {}),
  })
}

function validateReport(value: unknown): RampartOperationalReportV1 {
  if (containsProhibited(value) || !value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid RAMPART report.')
  const report = value as Partial<RampartOperationalReportV1>
  if (report.schemaVersion !== 1 || !bounded(report.sourceVersion, 80) || !bounded(report.runId, 160) || !bounded(report.targetId, 160) || !bounded(report.suiteVersion, 80) || !bounded(report.evaluatorVersion, 80) || !Array.isArray(report.results) || !report.results.length || !report.results.every(isResult) || (report.operational !== undefined && !parseOperationalMetadata(report.operational))) throw new Error('Unsupported RAMPART report.')
  return report as RampartOperationalReportV1
}

function isResult(value: unknown): value is RampartOperationalResultV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const result = value as Partial<RampartOperationalResultV1>
  if (!hasOnlyKeys(value as Record<string, unknown>, ['resultId', 'scenarioId', 'status', 'safe', 'summary', 'harmCategory', 'strategy', 'durationMs', 'observedAt'])) return false
  if (!bounded(result.resultId, 160) || !bounded(result.scenarioId, 160) || !['safe', 'unsafe', 'undetermined', 'error'].includes(String(result.status)) || !bounded(result.summary, 320) || !result.observedAt || Number.isNaN(Date.parse(result.observedAt))) return false
  if (result.safe !== undefined && typeof result.safe !== 'boolean') return false
  if (result.durationMs !== undefined && (typeof result.durationMs !== 'number' || !Number.isFinite(result.durationMs) || result.durationMs < 0)) return false
  return boundedOptional(result.harmCategory, 80) && boundedOptional(result.strategy, 160)
}

function containsProhibited(value: unknown): boolean { if (Array.isArray(value)) return value.some(containsProhibited); if (!value || typeof value !== 'object') return false; return Object.entries(value as Record<string, unknown>).some(([key, nested]) => ['turns', 'prompts', 'responses', 'prompt', 'response', 'toolArguments', 'toolResults', 'evaluatorRationale', 'secret', 'credentials', 'privateKey'].includes(key) || containsProhibited(nested)) }
function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean { const allowed = new Set(keys); return Object.keys(value).every((key) => allowed.has(key)) }
function bounded(value: unknown, max: number): value is string { return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) }
function boundedOptional(value: unknown, max: number): value is string | undefined { return value === undefined || bounded(value, max) }
