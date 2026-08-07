import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

function canonical(value) {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
}

const prohibitedKeyPattern = /^(prompt|response|rawcontent|registry|assetname|workflowname|location|owner|email|secret|token|apikey|clientsecret)$/i
const prohibitedValuePattern = /(?:[A-Za-z]:\\|\/home\/|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|api[_-]?key|client[_-]?secret|Bearer\s|BEGIN PRIVATE KEY|raw (?:prompt|response|finding|evidence))/i

function inspect(value, path = '$', issues = []) {
  if (typeof value === 'string' && prohibitedValuePattern.test(value)) issues.push(`${path}: prohibited value`)
  if (Array.isArray(value)) value.forEach((item, index) => inspect(item, `${path}[${index}]`, issues))
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (prohibitedKeyPattern.test(key.replace(/[^a-z]/gi, ''))) issues.push(`${path}.${key}: prohibited key`)
      inspect(child, `${path}.${key}`, issues)
    }
  }
  return issues
}

for (const [file, kind, suggested] of [
  ['asset-current-evidence-packet.json', 'asset-version', 'sancussight-evidence-packet-asset-version-19d123297867.json'],
  ['exit-drill-evidence-packet.json', 'exit-drill', 'sancussight-evidence-packet-exit-drill-f84f872b8685.json'],
]) {
  const raw = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8')
  const packet = JSON.parse(raw)
  const { packetId, exportedAt: _exportedAt, ...payload } = packet
  const digest = createHash('sha256').update(canonical(payload)).digest('hex')
  const expectedId = `sha256:${digest}`
  const expectedKeys = kind === 'asset-version'
    ? ['comparison', 'exportedAt', 'humanDecisions', 'missingEvidence', 'packetId', 'packetType', 'predicate', 'producer', 'qualification', 'run', 'schemaVersion', 'subject', 'verification']
    : ['exportedAt', 'humanDecisions', 'missingEvidence', 'packetId', 'packetType', 'predicate', 'producer', 'qualification', 'run', 'schemaVersion', 'subject', 'verification']
  const result = {
    file,
    kind,
    canonicalDownload: raw === canonical(packet),
    packetIdMatches: packetId === expectedId,
    filenameMatches: suggested === `sancussight-evidence-packet-${kind}-${digest.slice(0, 12)}.json`,
    exactTopLevelKeys: JSON.stringify(Object.keys(packet).sort()) === JSON.stringify(expectedKeys),
    subjectHash: /^sha256:[0-9a-f]{64}$/.test(packet.subject.subjectHash),
    predicateHashes: kind === 'asset-version'
      ? /^sha256:[0-9a-f]{64}$/.test(packet.predicate.snapshotHash)
      : packet.predicate.items.every(item => /^sha256:[0-9a-f]{64}$/.test(item.subjectHash)),
    privacyIssues: inspect(packet),
  }
  console.log(JSON.stringify(result))
  if (!result.canonicalDownload || !result.packetIdMatches || !result.filenameMatches
    || !result.exactTopLevelKeys || !result.subjectHash || !result.predicateHashes
    || result.privacyIssues.length) process.exitCode = 1
}
