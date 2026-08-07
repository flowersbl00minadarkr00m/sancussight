import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const manifestPath = resolve(currentDirectory, 'local-dist-manifest.json')
const reportPath = resolve(currentDirectory, 'hosted-static-results.json')
const canonicalOrigin = 'https://sancussight.vercel.app'

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
assert.equal(manifest.schemaVersion, 1)
assert.equal(manifest.kind, 'static-output')
assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0)

const results = []
for (const expected of manifest.files) {
  const pathname = expected.path === 'index.html'
    ? '/'
    : `/${expected.path.split('/').map(encodeURIComponent).join('/')}`
  const response = await fetch(`${canonicalOrigin}${pathname}`, {
    redirect: 'error',
    headers: {
      accept: '*/*',
      'cache-control': 'no-cache',
    },
  })
  assert.equal(response.status, 200, `${pathname} returned ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  assert.equal(bytes.length, expected.bytes, `${pathname} byte length drift`)
  assert.equal(sha256, expected.sha256, `${pathname} SHA-256 drift`)
  results.push({
    path: expected.path,
    url: `${canonicalOrigin}${pathname}`,
    status: response.status,
    bytes: bytes.length,
    sha256,
    verdict: 'PASS',
  })
}

await writeFile(reportPath, `${JSON.stringify({
  canonicalOrigin,
  checkedAt: new Date().toISOString(),
  files: results,
  verdict: 'PASS',
}, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({
  canonicalOrigin,
  fileCount: results.length,
  verdict: 'PASS',
}, null, 2))
