import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const cssUrl = new URL('../../index.css', import.meta.url)
const packageUrl = new URL('../../../package.json', import.meta.url)
const verifierUrl = new URL('../../../scripts/verify-feature012-build-inputs.ts', import.meta.url)

test('Tailwind scans only declared application inputs', async () => {
  const css = await readFile(cssUrl, 'utf8')

  assert.match(css, /^@import "tailwindcss" source\(none\);/m)
  assert.match(css, /^@source "\.\.\/index\.html";$/m)
  assert.match(css, /^@source "\.\/";$/m)
  assert.match(css, /^@source not "\.\/lib\/__tests__";$/m)
  assert.doesNotMatch(css, /@source "[^"]*(?:output|outputs|artifacts|\.ai|playwright)/)
})

test('the continuity verifier is additive and fails closed around the declared boundary', async () => {
  const [packageJson, verifier] = await Promise.all([
    readFile(packageUrl, 'utf8').then(JSON.parse),
    readFile(verifierUrl, 'utf8'),
  ])

  assert.equal(
    packageJson.scripts['verify:feature012-build-inputs'],
    'node scripts/verify-feature012-build-inputs.ts',
  )
  assert.match(verifier, /EXPECTED_BUILD_INPUTS/)
  assert.match(verifier, /missing declared build inputs/)
  assert.match(verifier, /undeclared build inputs/)
  assert.match(verifier, /feature012-adversarial-tailwind-candidate\.html/)
  assert.match(verifier, /class="resize"/)
  assert.match(verifier, /baseline builds are not byte-identical/)
  assert.match(verifier, /outside-boundary candidate changed bundle bytes/)
})

test('the continuity verifier closes over direct and transitive Vite config helpers', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'sancussight-feature012-config-'))
  try {
    await Promise.all([
      mkdir(join(scratch, 'config', 'nested'), { recursive: true }),
      mkdir(join(scratch, 'src'), { recursive: true }),
      mkdir(join(scratch, 'public'), { recursive: true }),
    ])
    await writeFile(
      join(scratch, 'vite.config.ts'),
      [
        "import { r2BuildBase } from './config/r2-build-helper'",
        '',
        'export default { base: r2BuildBase }',
        '',
      ].join('\n'),
    )
    await writeFile(
      join(scratch, 'config', 'r2-build-helper.ts'),
      [
        "import { r2TransitiveBase } from './nested/r2-transitive-helper'",
        '',
        'export const r2BuildBase = r2TransitiveBase',
        '',
      ].join('\n'),
    )
    await writeFile(
      join(scratch, 'config', 'nested', 'r2-transitive-helper.ts'),
      "export const r2TransitiveBase = '/r2-hidden-config-input/'\n",
    )

    const {
      assertExactInputs,
      discoverDeclaredInputUniverse,
      hashDeclaredInputs,
    } = await import(verifierUrl)
    const declaredInputs = await discoverDeclaredInputUniverse(scratch)

    assert.deepEqual(declaredInputs, [
      'config/nested/r2-transitive-helper.ts',
      'config/r2-build-helper.ts',
      'vite.config.ts',
    ])
    assert.throws(
      () => assertExactInputs(declaredInputs, ['vite.config.ts']),
      /undeclared build inputs:\nconfig\/nested\/r2-transitive-helper\.ts\nconfig\/r2-build-helper\.ts/,
    )
    assert.doesNotThrow(() => assertExactInputs(declaredInputs, declaredInputs))

    const initialHashes = await hashDeclaredInputs(declaredInputs, scratch)
    assert.deepEqual(Object.keys(initialHashes), declaredInputs)
    await writeFile(
      join(scratch, 'config', 'nested', 'r2-transitive-helper.ts'),
      "export const r2TransitiveBase = '/declared-config-change/'\n",
    )
    const changedHashes = await hashDeclaredInputs(declaredInputs, scratch)
    assert.notEqual(
      changedHashes['config/nested/r2-transitive-helper.ts'],
      initialHashes['config/nested/r2-transitive-helper.ts'],
    )
    assert.equal(
      changedHashes['config/r2-build-helper.ts'],
      initialHashes['config/r2-build-helper.ts'],
    )
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
})
