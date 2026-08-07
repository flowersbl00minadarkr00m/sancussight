import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const evidenceDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(evidenceDirectory, '..', '..', '..', '..', '..', '..')
const verifierUrl = new URL('../../../../../../scripts/verify-feature012-build-inputs.ts', import.meta.url)

function normalizedRelative(root, path) {
  return relative(root, path).split(sep).join('/')
}

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(absolute))
    if (entry.isFile()) files.push(absolute)
  }
  return files
}

async function hashFile(path) {
  const bytes = await readFile(path)
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
}

async function declaredSourceFiles() {
  const { discoverDeclaredInputUniverse } = await import(verifierUrl)
  const inputs = await discoverDeclaredInputUniverse(projectRoot)
  return inputs.map(path => join(projectRoot, ...path.split('/')))
}

async function manifest(root, files) {
  const entries = []
  for (const absolute of files) {
    const info = await stat(absolute)
    assert.equal(info.isFile(), true)
    entries.push({
      path: normalizedRelative(root, absolute),
      ...await hashFile(absolute),
    })
  }
  entries.sort((left, right) => left.path.localeCompare(right.path))
  return {
    generatedAt: new Date().toISOString(),
    root: root === projectRoot ? '<canonical-project>' : basename(root),
    entries,
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

function comparable(value) {
  return JSON.stringify(value.entries)
}

function digest(entries) {
  const canonical = entries
    .map(({ path, sha256 }) => `${path}\0${sha256}\n`)
    .join('')
  return createHash('sha256').update(canonical).digest('hex')
}

async function snapshot(path) {
  const value = await manifest(projectRoot, await declaredSourceFiles())
  assert.equal(value.entries.length, 92, 'expected the C5-reviewed 92-input universe')
  value.declaredInputDigest = digest(value.entries)
  await writeJson(path, value)
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: value.entries.length,
    declaredInputDigest: value.declaredInputDigest,
    lockfile: value.entries.find(entry => entry.path === 'package-lock.json'),
    output: path,
  }, null, 2))
}

async function compareSource(path) {
  const baseline = JSON.parse(await readFile(path, 'utf8'))
  const current = await manifest(projectRoot, await declaredSourceFiles())
  assert.equal(current.entries.length, 92, 'expected the C5-reviewed 92-input universe')
  assert.equal(comparable(current), comparable(baseline), 'source/config/lock manifest drift')
  assert.equal(digest(current.entries), baseline.declaredInputDigest, 'declared-input digest drift')
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: current.entries.length,
    declaredInputDigest: digest(current.entries),
    baseline: path,
  }, null, 2))
}

async function staticManifest(directory, path) {
  const root = resolve(directory)
  const value = await manifest(root, await walk(root))
  await writeJson(path, value)
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: value.entries.length,
    root,
    output: path,
  }, null, 2))
}

async function compareManifests(leftPath, rightPath) {
  const left = JSON.parse(await readFile(leftPath, 'utf8'))
  const right = JSON.parse(await readFile(rightPath, 'utf8'))
  assert.equal(comparable(right), comparable(left), `static manifest mismatch: ${leftPath} vs ${rightPath}`)
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: left.entries.length,
    left: leftPath,
    right: rightPath,
  }, null, 2))
}

async function fetchHosted(baseUrl, manifestPath, outputDirectory) {
  const expected = JSON.parse(await readFile(manifestPath, 'utf8'))
  const actualEntries = []
  for (const item of expected.entries) {
    const url = new URL(item.path, `${baseUrl.replace(/\/$/, '')}/`)
    const response = await fetch(url, { redirect: 'error' })
    assert.equal(response.status, 200, `${url} returned ${response.status}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    const output = join(outputDirectory, ...item.path.split('/'))
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, bytes)
    actualEntries.push({
      path: item.path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    })
  }
  assert.equal(JSON.stringify(actualEntries), comparable(expected), 'hosted bytes differ from reviewed artifact')
  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    entries: actualEntries,
  }
  await writeJson(join(evidenceDirectory, 'canonical-byte-verification.json'), result)
  console.log(JSON.stringify({
    verdict: 'PASS',
    baseUrl,
    entries: actualEntries.length,
    outputDirectory,
  }, null, 2))
}

const [command, ...args] = process.argv.slice(2)

if (command === 'snapshot') await snapshot(resolve(args[0]))
else if (command === 'compare-source') await compareSource(resolve(args[0]))
else if (command === 'manifest') await staticManifest(resolve(args[0]), resolve(args[1]))
else if (command === 'compare-manifests') await compareManifests(resolve(args[0]), resolve(args[1]))
else if (command === 'fetch-hosted') await fetchHosted(args[0], resolve(args[1]), resolve(args[2]))
else throw new Error(`unknown command: ${command}`)
