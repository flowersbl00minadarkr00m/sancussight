import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const verifierUrl = new URL('../../../../../../scripts/verify-feature012-build-inputs.ts', import.meta.url)

function digestManifest(hashes) {
  const manifest = Object.entries(hashes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, hash]) => `${file}\0${hash}\n`)
    .join('')
  return createHash('sha256').update(manifest).digest('hex')
}

const scratch = await mkdtemp(join(tmpdir(), 'sancussight-feature012-c5-config-'))
let result

try {
  await Promise.all([
    mkdir(join(scratch, 'config', 'nested'), { recursive: true }),
    mkdir(join(scratch, 'src'), { recursive: true }),
    mkdir(join(scratch, 'public'), { recursive: true }),
  ])

  await Promise.all([
    writeFile(join(scratch, 'src', 'app.ts'), 'export const app = true\n'),
    writeFile(join(scratch, 'public', 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n'),
    writeFile(
      join(scratch, 'vite.config.ts'),
      [
        "import { r2BuildBase } from './config/r2-build-helper'",
        '',
        'export default { base: r2BuildBase }',
        '',
      ].join('\n'),
    ),
    writeFile(
      join(scratch, 'config', 'r2-build-helper.ts'),
      [
        "import { r2TransitiveBase } from './nested/r2-transitive-helper'",
        '',
        'export const r2BuildBase = r2TransitiveBase',
        '',
      ].join('\n'),
    ),
    writeFile(
      join(scratch, 'config', 'nested', 'r2-transitive-helper.ts'),
      "export const r2TransitiveBase = '/r2-hidden-config-input/'\n",
    ),
  ])

  const {
    assertExactInputs,
    discoverDeclaredInputUniverse,
    hashDeclaredInputs,
  } = await import(verifierUrl)

  const declaredInputs = await discoverDeclaredInputUniverse(scratch)
  const expectedInputs = [
    'config/nested/r2-transitive-helper.ts',
    'config/r2-build-helper.ts',
    'public/favicon.svg',
    'src/app.ts',
    'vite.config.ts',
  ]
  assert.deepEqual(declaredInputs, expectedInputs)

  assert.throws(
    () => assertExactInputs(
      declaredInputs.filter(file => file !== 'public/favicon.svg'),
      expectedInputs,
    ),
    /missing declared build inputs:\npublic\/favicon\.svg/,
  )
  assert.throws(
    () => assertExactInputs(
      declaredInputs,
      expectedInputs.filter(file => file !== 'src/app.ts'),
    ),
    /undeclared build inputs:\nsrc\/app\.ts/,
  )
  assert.throws(
    () => assertExactInputs(declaredInputs, [
      'public/favicon.svg',
      'src/app.ts',
      'vite.config.ts',
    ]),
    /undeclared build inputs:\nconfig\/nested\/r2-transitive-helper\.ts\nconfig\/r2-build-helper\.ts/,
  )
  assert.doesNotThrow(() => assertExactInputs(declaredInputs, expectedInputs))

  const initialHashes = await hashDeclaredInputs(declaredInputs, scratch)
  assert.deepEqual(Object.keys(initialHashes), expectedInputs)
  const initialDigest = digestManifest(initialHashes)

  await writeFile(
    join(scratch, 'config', 'nested', 'r2-transitive-helper.ts'),
    "export const r2TransitiveBase = '/c5-transitive-change/'\n",
  )
  const changedHashes = await hashDeclaredInputs(declaredInputs, scratch)
  const changedDigest = digestManifest(changedHashes)

  assert.notEqual(
    changedHashes['config/nested/r2-transitive-helper.ts'],
    initialHashes['config/nested/r2-transitive-helper.ts'],
  )
  assert.equal(
    changedHashes['config/r2-build-helper.ts'],
    initialHashes['config/r2-build-helper.ts'],
  )
  assert.notEqual(changedDigest, initialDigest)

  result = {
    verdict: 'PASS',
    scratchIsolation: true,
    exactR2DirectHelper: 'config/r2-build-helper.ts',
    transitiveHelper: 'config/nested/r2-transitive-helper.ts',
    discoveredInputs: declaredInputs,
    missingExistingUniverseRejected: true,
    extraExistingUniverseRejected: true,
    undeclaredDirectAndTransitiveHelpersRejected: true,
    declaredHelpersIncludedAndHashed: true,
    initialDigest,
    changedDigest,
    transitiveChangeAlteredDeclaredInputDigest: true,
  }
} finally {
  await rm(scratch, { recursive: true, force: true })
}

console.log(JSON.stringify({ ...result, scratchRemoved: true }, null, 2))
