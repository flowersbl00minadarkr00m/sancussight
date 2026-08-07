import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const files = [
  ['changed-first-evidence-packet.json', 'changed-first'],
  ['portable-derivative-evidence-packet.json', 'portable-derivative'],
]
const prohibitedKeyPattern = /^(prompt|response|rawcontent|registry|assetname|workflowname|location|owner|email|secret|token|apikey|clientsecret)$/iu
const prohibitedValuePattern = /(?:[A-Za-z]:\\|\/home\/|https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|api[_-]?key|client[_-]?secret|Bearer\s|BEGIN PRIVATE KEY|raw (?:prompt|response|finding|evidence))/iu
const results = []

for (const [file, expected] of files) {
  const raw = readFileSync(new URL(file, import.meta.url), 'utf8')
  const packet = JSON.parse(raw)
  const { packetId, exportedAt: _exportedAt, ...payload } = packet
  const digest = createHash('sha256').update(canonical(payload)).digest('hex')
  const result = {
    file,
    expected,
    canonicalDownload: raw === canonical(packet),
    packetIdMatches: packetId === `sha256:${digest}`,
    expectedSuggestedFilename: `sancussight-evidence-packet-${packet.predicate.kind}-${digest.slice(0, 12)}.json`,
    privacyIssues: inspect(packet),
    changedFirst: false,
    portableDerivative: false,
  }
  if (expected === 'changed-first') {
    result.changedFirst = (
      packet.qualification === 'recorded'
      && packet.comparison.state === 'ready'
      && packet.comparison.totalMeaningfulItems === 1
      && packet.comparison.truncated === true
      && packet.comparison.omittedUnchangedCount === 5
      && packet.comparison.items[0]?.key === 'check:check.late:result'
      && packet.comparison.items[0]?.state === 'regression'
      && packet.comparison.items[0]?.previous === 'pass'
      && packet.comparison.items[0]?.current === 'fail'
    )
  } else {
    result.portableDerivative = (
      packet.qualification === 'portable-projection'
      && /^av1p_[0-9a-f]{32}$/u.test(packet.predicate.versionId)
      && /^av1_[0-9a-f]{32}$/u.test(packet.predicate.derivedFromVersionId)
      && packet.predicate.versionId !== packet.predicate.derivedFromVersionId
      && packet.comparison.state === 'no-previous-version'
    )
  }
  results.push(result)
}

const pass = results.every(result => (
  result.canonicalDownload
  && result.packetIdMatches
  && result.privacyIssues.length === 0
  && (result.changedFirst || result.portableDerivative)
))

console.log(JSON.stringify({ pass, results }, null, 2))
if (!pass) process.exitCode = 1

function canonical(value) {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
}

function inspect(value, path = '$', issues = []) {
  if (typeof value === 'string' && prohibitedValuePattern.test(value)) {
    issues.push(`${path}: prohibited value`)
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, `${path}[${index}]`, issues))
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (prohibitedKeyPattern.test(key.replace(/[^a-z]/giu, ''))) {
        issues.push(`${path}.${key}: prohibited key`)
      }
      inspect(child, `${path}.${key}`, issues)
    }
  }
  return issues
}
