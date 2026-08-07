import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const evidenceDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(evidenceDirectory, '..', '..', '..', '..', '..', '..')

function normalizedRelative(root, path) {
  return relative(root, path).split(sep).join('/')
}

async function walk(directory, excludeTests = false) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excludeTests && entry.isDirectory() && entry.name === '__tests__') continue
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(absolute, excludeTests))
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

async function sourceFiles() {
  const rootEntries = await readdir(projectRoot, { withFileTypes: true })
  const rootInputs = rootEntries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name => (
      name === 'index.html'
      || name === 'package.json'
      || name === 'package-lock.json'
      || /^tsconfig(?:\.[^.]+)?\.json$/.test(name)
      || /^(?:vite|tailwind|postcss)\.config\.[cm]?[jt]s$/.test(name)
      || /^\.env(?:\..+)?$/.test(name)
    ))
    .map(name => join(projectRoot, name))

  return [
    ...rootInputs,
    ...await walk(join(projectRoot, 'src'), true),
    ...await walk(join(projectRoot, 'public')),
  ].sort((left, right) => normalizedRelative(projectRoot, left).localeCompare(normalizedRelative(projectRoot, right)))
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

async function snapshot(path) {
  const files = await sourceFiles()
  const value = await manifest(projectRoot, files)
  assert.equal(value.entries.length, 92, 'expected the C2-reviewed 92-input universe')
  await writeJson(path, value)
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: value.entries.length,
    lockfile: value.entries.find(entry => entry.path === 'package-lock.json'),
    output: path,
  }, null, 2))
}

async function compareSource(path) {
  const baseline = JSON.parse(await readFile(path, 'utf8'))
  const current = await manifest(projectRoot, await sourceFiles())
  assert.equal(current.entries.length, 92, 'expected the C2-reviewed 92-input universe')
  assert.equal(comparable(current), comparable(baseline), 'source/config/lock manifest drift')
  console.log(JSON.stringify({
    verdict: 'PASS',
    entries: current.entries.length,
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
