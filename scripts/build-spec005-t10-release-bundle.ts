import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { calculateReleaseGate, validateReleaseEvidenceManifest } from '../src/lib/release-gate.ts'
import { selectCanonicalTargetEvidence } from '../src/lib/release-evidence-selection.ts'
import {
  RELEASE_EVIDENCE_SOURCE_IDS,
  REQUIRED_RELEASE_FAILURE_CASES,
  type EvidenceEnvelopeV1,
  type EvidenceRuntimeId,
  type ReleaseEvidenceManifestV1,
  type ReleaseEvidenceSourceId,
} from '../src/types.ts'

const runId = process.env.SANCUSSIGHT_RELEASE_RUN_ID ?? ''
if (!/^[A-Za-z0-9._-]{1,160}$/.test(runId)) throw new Error('SANCUSSIGHT_RELEASE_RUN_ID must be a bounded release token.')
const localAppData = process.env.LOCALAPPDATA
if (!localAppData) throw new Error('LOCALAPPDATA is required.')

const collectorRoot = process.env.SANCUSSIGHT_COLLECTOR_DATA_DIR
  ? resolve(process.env.SANCUSSIGHT_COLLECTOR_DATA_DIR)
  : join(homedir(), '.sancussight', 'collector-data')
const operationRoot = join(localAppData, 'SancusSight', 'operations')
const matrix = JSON.parse(await readFile(join(operationRoot, 'runs', runId, 'failure-matrix.json'), 'utf8')) as {
  releaseRunId: string
  observedAt: string
  cases: Array<{ case: string; status: string; observedAt: string; proof: string[] }>
}
if (matrix.releaseRunId !== runId) throw new Error('Failure matrix run identity does not match.')

const evidence = (await readFile(join(collectorRoot, 'evidence.jsonl'), 'utf8'))
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EvidenceEnvelopeV1)
const runEvidence = evidence.filter((item) => item.operational?.qualification === 'operational' && item.operational.runId === runId)
const requiredRuntimes: EvidenceRuntimeId[] = ['codex-cli', 'claude-code', 'pi']

function latest(items: EvidenceEnvelopeV1[]): EvidenceEnvelopeV1 {
  const item = [...items].sort((left, right) =>
    Date.parse(right.observedAt) - Date.parse(left.observedAt)
    || left.provenance.artifactContentHash.localeCompare(right.provenance.artifactContentHash)
    || left.id.localeCompare(right.id))[0]
  if (!item) throw new Error('Required release evidence is missing.')
  return item
}

const selected = new Map<ReleaseEvidenceSourceId, EvidenceEnvelopeV1[]>()
const targetSelections = new Map<ReleaseEvidenceSourceId, ReleaseEvidenceManifestV1['sources'][ReleaseEvidenceSourceId]['requiredTargets']>()
selected.set('runtime-telemetry', requiredRuntimes.map((runtime) => latest(runEvidence.filter((item) =>
  (item.source === 'runtime-telemetry' || item.source === 'agent-beacon') && item.attributes.runtime === runtime))))
const runtimeRecords = selected.get('runtime-telemetry')!
const runtimeTargetIds = [...new Set(runtimeRecords.map((record) => record.operational!.targetId))]
if (runtimeTargetIds.length !== 1) throw new Error('runtime-telemetry target identity is inconsistent.')
targetSelections.set('runtime-telemetry', [{
  targetId: runtimeTargetIds[0], evidenceIds: runtimeRecords.map((record) => record.id),
  latestObservedAt: latest(runtimeRecords).observedAt,
}])
for (const source of RELEASE_EVIDENCE_SOURCE_IDS.filter((item) => item !== 'runtime-telemetry')) {
  const records = runEvidence.filter((item) => item.source === source)
  const requiredTargets = source === 'praxen'
    ? [
        { targetId: 'sancussight', workerRemitHash: '1f28de633bf3249a07370128c9afeeab25bcba50dc2635a0f55e61f2d5944033' },
        { targetId: 'sdd-exec', workerRemitHash: 'abf7f7f9d31db0c92ea4ada61f1d70d89a49c05a7c2af5145e8e58d4211e5da1' },
      ]
    : [{ targetId: latest(records).operational!.targetId }]
  const selection = selectCanonicalTargetEvidence({ source, evidence: records, releaseRunId: runId, requiredTargets })
  selected.set(source, selection.records)
  targetSelections.set(source, selection.requiredTargets)
}

const failureCases = Object.fromEntries(REQUIRED_RELEASE_FAILURE_CASES.map((name) => {
  const exercised = matrix.cases.find((item) => item.case === name)
  if (!exercised || exercised.status !== 'passed') throw new Error(`Failure case did not pass: ${name}`)
  return [name, 'passed' as const]
}))

const sources = Object.fromEntries(RELEASE_EVIDENCE_SOURCE_IDS.map((source) => {
  const records = selected.get(source) ?? []
  const operational = records.map((item) => item.operational!)
  const targetIds = [...new Set(operational.map((item) => item.targetId))]
  const workerRemitHashes = [...new Set(operational.map((item) => item.workerRemitHash).filter((item): item is string => !!item))]
  const versions = [...new Set(operational.map((item) => item.sourceVersion))]
  const contracts = [...new Set(operational.map((item) => item.contractVersion))]
  const verification = [...new Set(records.map((item) => item.provenance.verification))]
  const requiredTargets = targetSelections.get(source) ?? []
  if (versions.length !== 1 || contracts.length !== 1 || verification.length !== 1) throw new Error(`${source} provenance is inconsistent.`)
  return [source, {
    version: versions[0], targetId: targetIds[0], ...(targetIds.length > 1 ? { targetIds } : {}),
    contractVersion: contracts[0], evidenceIds: records.map((item) => item.id),
    latestObservedAt: latest(records).observedAt, verification: verification[0], operational: true,
    requiredTargets,
    ...(workerRemitHashes[0] ? { workerRemitHash: workerRemitHashes[0] } : {}),
    ...(workerRemitHashes.length > 1 ? { workerRemitHashes } : {}),
  }]
})) as ReleaseEvidenceManifestV1['sources']

const now = new Date().toISOString()
const manifest: ReleaseEvidenceManifestV1 = {
  schemaVersion: 1, releaseRunId: runId, startedAt: matrix.observedAt, completedAt: now,
  runtimes: requiredRuntimes, sources, failureCases, status: 'passed', untestedBoundaries: [],
}
const validation = validateReleaseEvidenceManifest(manifest)
if (!validation.valid) throw new Error(`Release manifest is invalid: ${validation.errors.join(', ')}`)
const gate = calculateReleaseGate(manifest, evidence, now)
if (!gate.ready || gate.status !== 'passed') throw new Error(`Release gate is blocked: ${gate.blockers.join(', ')}`)

const referenced = [...selected.values()].flat()
const serializedEvidence = JSON.stringify(referenced, null, 2)
if (/C:\\\\Users\\\\|\/Users\/|\/home\/|"(?:prompt|response|reasoning|content|toolArguments|toolResults|credential|privateKey)"\s*:/i.test(serializedEvidence)) {
  throw new Error('Sanitized evidence bundle privacy check failed.')
}

const manifestRoot = join(operationRoot, 'manifests')
const bundleRoot = join(process.cwd(), 'artifacts', 'qa', 'spec005', `t10-release-${runId}`)
await mkdir(manifestRoot, { recursive: true })
await mkdir(bundleRoot, { recursive: true })
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`
await writeFile(join(manifestRoot, 'current-release.json'), manifestText, 'utf8')
await writeFile(join(bundleRoot, 'release-manifest.json'), manifestText, 'utf8')
await writeFile(join(bundleRoot, 'referenced-evidence.json'), `${serializedEvidence}\n`, 'utf8')
await writeFile(join(bundleRoot, 'failure-matrix.json'), `${JSON.stringify(matrix, null, 2)}\n`, 'utf8')
await writeFile(join(bundleRoot, 'gate-result.json'), `${JSON.stringify(gate, null, 2)}\n`, 'utf8')
await writeFile(join(bundleRoot, 'README.md'), `# Spec 005 T10 sanitized release evidence\n\nRelease run: \`${runId}\`\n\nThis bundle contains only the validated release manifest, referenced normalized evidence, the bounded failure/recovery matrix, and the calculated gate result. It excludes prompts, responses, reasoning, credentials, private keys, raw receipts, raw scan payloads, and unrestricted workspace content.\n`, 'utf8')
console.log(JSON.stringify({ runId, ready: gate.ready, sources: Object.fromEntries([...selected].map(([source, records]) => [source, records.length])), bundleRoot }))
