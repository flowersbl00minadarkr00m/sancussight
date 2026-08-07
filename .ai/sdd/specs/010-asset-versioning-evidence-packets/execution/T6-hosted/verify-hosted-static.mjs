import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist')
const baseUrl = new URL(process.argv[3] ?? 'https://sancussight.vercel.app/')

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))
  return nested.flat()
}

const paths = (await filesUnder(root)).sort((left, right) => (
  relative(root, left).localeCompare(relative(root, right), 'en', { sensitivity: 'variant' })
))
const lines = []
const results = []
let totalBytes = 0

for (const path of paths) {
  const local = await readFile(path)
  const name = relative(root, path).split(sep).join('/')
  const response = await fetch(new URL(name, baseUrl), { redirect: 'follow', cache: 'no-store' })
  const hosted = Buffer.from(await response.arrayBuffer())
  const localHash = createHash('sha256').update(local).digest('hex').toUpperCase()
  const hostedHash = createHash('sha256').update(hosted).digest('hex').toUpperCase()
  const info = await stat(path)
  const match = response.status === 200
    && info.size === hosted.length
    && localHash === hostedHash
  results.push({
    path: name,
    status: response.status,
    localBytes: info.size,
    hostedBytes: hosted.length,
    localHash,
    hostedHash,
    match,
  })
  lines.push(`${hostedHash}\t${hosted.length}\t${name}`)
  totalBytes += hosted.length
}

const serialized = `${lines.join('\n')}\n`
const manifestSha256 = createHash('sha256').update(serialized).digest('hex').toUpperCase()
const result = {
  baseUrl: baseUrl.href,
  fileCount: paths.length,
  totalBytes,
  serializedBytes: Buffer.byteLength(serialized),
  manifestSha256,
  allMatch: results.every(item => item.match),
  files: results,
}

console.log(JSON.stringify(result))
if (!result.allMatch) process.exitCode = 1
