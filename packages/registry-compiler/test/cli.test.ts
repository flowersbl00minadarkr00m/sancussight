import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { CLI_VERSION } from '../src/cli.ts'

const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url))
const packageJson = JSON.parse(readFileSync(join(dirname(cli), '..', 'package.json'), 'utf8')) as { version?: string; bin?: Record<string, string>; exports?: Record<string, unknown> }

function invoke(...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
}

test('CLI help lists the bounded routes', () => {
  const result = invoke('--help')
  assert.equal(result.status, 0)
  assert.match(result.stdout, /compile\s+Discover bounded local metadata/)
  assert.match(result.stdout, /Read-only boundary/)
})

test('package metadata, CLI version, and exports agree', () => {
  assert.equal(packageJson.version, CLI_VERSION)
  assert.equal(packageJson.bin?.['sancussight-registry'], './dist/cli.js')
  assert.deepEqual(packageJson.exports?.['.'], { types: './dist/index.d.ts', import: './dist/index.js' })
})

test('unknown commands fail closed', () => {
  const result = invoke('launch')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /Unknown command: launch/)
})

test('unknown and unsafe options fail closed without passthrough', () => {
  const unknown = invoke('compile', '--surprise')
  assert.equal(unknown.status, 2)
  assert.match(unknown.stderr, /Unknown option: --surprise/)

  const unsafe = invoke('compile', '--exec', 'whoami')
  assert.equal(unsafe.status, 2)
  assert.match(unsafe.stderr, /Unsupported unsafe option: --exec/)
})

test('recognized compiler routes require an explicit read-only root', () => {
  const result = invoke('compile')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /At least one --root path is required/)
})
