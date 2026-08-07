import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'
import { parseOperationalMetadata } from './operational.ts'
import { basename, dirname, resolve, sep } from 'node:path'

interface PraxenFinding {
  id: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'
  summary: string
  policy_rule_ids?: string | null
  raise_category?: string
  owasp_llm?: string | null
  owasp_agentic?: string | null
  confidence?: string
}

interface PraxenReport {
  schema_version: string
  praxen_version: string
  scan: { agent: string; agent_slug: string; scan_timestamp: string }
  findings: PraxenFinding[]
  positives?: Array<{ title: string; description: string }>
  operational?: unknown
  sancussight?: { operational?: unknown; runnerBinding?: unknown }
}

const ALLOWED_FINDING_ATTRIBUTES = ['severity', 'confidence', 'policyRuleIds', 'raiseCategory', 'owaspLlm', 'owaspAgentic']
const SHA256 = /^[a-f0-9]{64}$/
const ROLE_NAME = /^(?:staging|canonical|rendered)\/[A-Za-z0-9._-]{1,180}$/
const BINDING_KEYS = [
  'bindingVersion', 'producer', 'releaseRunId', 'targetId', 'workerRemitHash',
  'sourceVersion', 'contractVersion', 'canonicalArtifactContentHash',
  'producerObservedAt', 'claudeCliVersion', 'selectedModel', 'praxenPluginVersion',
  'converterScriptHash', 'rendererScriptHash', 'runnerVersion',
  'canonicalRoleName', 'sourceRoles',
]
const SOURCE_ROLE_KEYS = ['draft', 'canonical', 'renderedHtml', 'renderedText']
const FORBIDDEN_PRIVACY_KEYS = /^(?:prompt|response|reasoning|chainOfThought|credential|credentials|privateKey|secret|secrets|toolArguments|toolResults|rawToolPayload|rawContent)$/i

export class PraxenAdapter implements EvidenceAdapter {
  readonly id = 'praxen' as const
  private readonly reader: ReadOnlyArtifactReader

  constructor(reader = new ReadOnlyArtifactReader()) { this.reader = reader }

  async validate(path: string): Promise<void> {
    const reports = await this.reader.jsonFiles(path)
    if (!reports.length) throw new Error('Select a Praxen reports directory containing canonical findings JSON.')
    await validateReport(JSON.parse(await this.reader.readText(reports[0])), reports[0], this.reader)
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    const reports = await this.reader.jsonFiles(path)
    for (const reportPath of reports) {
      const metadata = await this.reader.inspect(reportPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      const text = await this.reader.readText(reportPath)
      const hash = contentHash(text)
      try {
        const report = await validateReport(JSON.parse(text), reportPath, this.reader)
        const operational = report.sancussight?.runnerBinding
          ? parseOperationalMetadata(report.operational)
          : undefined
        for (const finding of report.findings) {
          accepted.push(createEvidenceEnvelope({
            source: this.id, evidenceKind: 'behavior-finding', observedAt: report.scan.scan_timestamp, importedAt,
            subject: { externalId: report.scan.agent_slug, type: 'agent' },
            outcome: ['Critical', 'High'].includes(finding.severity) ? 'fail' : finding.severity === 'Informational' ? 'observed' : 'warn',
            summary: finding.summary,
            provenance: { artifactName: metadata.name, artifactContentHash: hash, sourceRecordId: finding.id, parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
            attributes: { severity: finding.severity, confidence: finding.confidence, policyRuleIds: finding.policy_rule_ids, raiseCategory: finding.raise_category, owaspLlm: finding.owasp_llm, owaspAgentic: finding.owasp_agentic },
            allowedAttributeKeys: ALLOWED_FINDING_ATTRIBUTES,
            ...(operational ? { operational } : {}),
          }))
        }
        for (const [index, positive] of (report.positives ?? []).entries()) {
          accepted.push(createEvidenceEnvelope({
            source: this.id, evidenceKind: 'verified-positive', observedAt: report.scan.scan_timestamp, importedAt,
            subject: { externalId: report.scan.agent_slug, type: 'agent' }, outcome: 'pass', summary: positive.title,
            provenance: { artifactName: metadata.name, artifactContentHash: hash, sourceRecordId: `positive-${index}-${positive.title}`, parserId: 'praxen-findings', parserVersion: '2.0.0', verification: 'not-applicable' },
            ...(operational ? { operational } : {}),
          }))
        }
        next.artifacts[metadata.name] = { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash }
      } catch {
        rejected.push({ id: hash, source: this.id, artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt, errorCode: 'unsupported-praxen-report', guidance: 'Export canonical Praxen findings JSON with schema_version 2.0.' })
      }
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag: 0 }
  }
}

async function validateReport(value: unknown, reportPath: string, reader: ReadOnlyArtifactReader): Promise<PraxenReport> {
  if (!value || typeof value !== 'object') throw new Error('Invalid Praxen report.')
  const report = value as PraxenReport
  validateCanonicalFields(report)
  rejectForbiddenPrivacyKeys(report)
  if (report.sancussight?.runnerBinding) {
    await validateRunnerBinding(report, reportPath, reader)
  } else if (basename(dirname(reportPath)).toLowerCase() === 'operational') {
    throw new Error('Operational Praxen evidence requires a runner-created binding.')
  }
  return report
}

function validateCanonicalFields(report: PraxenReport): void {
  if (
    report.schema_version !== '2.0'
    || report.praxen_version !== '1.1.0'
    || !report.scan?.agent_slug
    || !report.scan.scan_timestamp
    || !Number.isFinite(Date.parse(report.scan.scan_timestamp))
    || !Array.isArray(report.findings)
  ) throw new Error('Unsupported Praxen report.')
  if (report.findings.some((finding) => !finding.id || !finding.summary || !finding.severity)) {
    throw new Error('Invalid Praxen finding.')
  }
}

async function validateRunnerBinding(
  report: PraxenReport,
  reportPath: string,
  reader: ReadOnlyArtifactReader,
): Promise<void> {
  const binding = report.sancussight?.runnerBinding
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) throw new Error('Invalid Praxen runner binding.')
  const value = binding as Record<string, unknown>
  if (!hasExactKeys(value, BINDING_KEYS)) throw new Error('Praxen runner binding fields are incomplete or unexpected.')
  if (
    value.bindingVersion !== 1
    || value.producer !== 'sancussight-praxen-runner'
    || value.sourceVersion !== '1.1.0'
    || value.praxenPluginVersion !== '1.1.0'
    || value.contractVersion !== 'praxen-v2'
    || value.runnerVersion !== 't16r-v1'
    || !['haiku', 'sonnet', 'opus'].includes(String(value.selectedModel))
    || !boundedToken(value.releaseRunId, 160)
    || !boundedToken(value.targetId, 160)
    || !boundedText(value.claudeCliVersion, 160)
    || !SHA256.test(String(value.workerRemitHash))
    || !SHA256.test(String(value.canonicalArtifactContentHash))
    || !SHA256.test(String(value.converterScriptHash))
    || !SHA256.test(String(value.rendererScriptHash))
  ) throw new Error('Praxen runner binding identity or version facts are invalid.')
  if (
    value.targetId !== report.scan.agent_slug
    || value.producerObservedAt !== report.scan.scan_timestamp
    || !Number.isFinite(Date.parse(String(value.producerObservedAt)))
  ) throw new Error('Praxen runner binding target or producer timestamp does not match canonical findings.')

  const operational = parseOperationalMetadata(report.operational)
  if (
    !operational
    || operational.qualification !== 'operational'
    || operational.runId !== value.releaseRunId
    || operational.targetId !== value.targetId
    || operational.workerRemitHash !== value.workerRemitHash
    || operational.sourceVersion !== value.sourceVersion
    || operational.contractVersion !== value.contractVersion
  ) throw new Error('Praxen operational metadata does not match its runner binding.')

  const sourceRoles = value.sourceRoles
  if (!sourceRoles || typeof sourceRoles !== 'object' || Array.isArray(sourceRoles)) {
    throw new Error('Praxen runner source roles are invalid.')
  }
  const roles = sourceRoles as Record<string, unknown>
  if (!hasExactKeys(roles, SOURCE_ROLE_KEYS) || Object.values(roles).some((role) => !ROLE_NAME.test(String(role)))) {
    throw new Error('Praxen runner source roles are incomplete, unexpected, or unsafe.')
  }
  if (value.canonicalRoleName !== roles.canonical || !ROLE_NAME.test(String(value.canonicalRoleName))) {
    throw new Error('Praxen canonical role is inconsistent.')
  }

  const attemptRoot = resolve(dirname(reportPath), '..')
  const canonicalPath = resolve(attemptRoot, String(value.canonicalRoleName).split('/').join(sep))
  if (!canonicalPath.startsWith(`${attemptRoot}${sep}`)) throw new Error('Praxen canonical role escapes the attempt directory.')
  const canonicalText = await reader.readText(canonicalPath)
  if (contentHash(canonicalText) !== value.canonicalArtifactContentHash) {
    throw new Error('Praxen canonical artifact hash does not match its runner binding.')
  }
  const canonical = JSON.parse(canonicalText) as PraxenReport
  validateCanonicalFields(canonical)
  rejectForbiddenPrivacyKeys(canonical)
  const projectionCanonical = structuredClone(report) as PraxenReport
  delete projectionCanonical.operational
  delete projectionCanonical.sancussight
  if (JSON.stringify(projectionCanonical) !== JSON.stringify(canonical)) {
    throw new Error('Praxen operational projection does not preserve the converter-created canonical fields.')
  }
}

function hasExactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort()
  return actual.length === expected.length && actual.every((key, index) => key === [...expected].sort()[index])
}

function boundedToken(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.length >= 1 && value.length <= max && /^[A-Za-z0-9._-]+$/.test(value)
}

function boundedText(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.trim().length >= 1 && value.length <= max && !/[\r\n]/.test(value)
}

function rejectForbiddenPrivacyKeys(value: unknown): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const item of value) rejectForbiddenPrivacyKeys(item)
    return
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PRIVACY_KEYS.test(key)) throw new Error('Praxen report crosses the privacy allowlist.')
    rejectForbiddenPrivacyKeys(child)
  }
}
