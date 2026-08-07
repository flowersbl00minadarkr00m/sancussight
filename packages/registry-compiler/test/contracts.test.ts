import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  assertNoProhibitedKeys,
  isContractSafe,
  validateAssetProposal,
} from '../src/contracts.ts'
import type { AssetProposal } from '../src/contracts.ts'

const fixturePath = fileURLToPath(new URL('./fixtures/safe-proposal.json', import.meta.url))
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as AssetProposal

test('safe contract fixture contains metadata only', () => {
  assert.doesNotThrow(() => assertNoProhibitedKeys(fixture))
  assert.equal(isContractSafe(fixture), true)
  assert.doesNotThrow(() => validateAssetProposal(fixture))
})

test('prohibited field names fail closed before proposal construction', () => {
  const unsafe = { ...fixture, metadata: { commandArguments: ['never accepted'] } }
  assert.equal(isContractSafe(unsafe), false)
  assert.throws(() => assertNoProhibitedKeys(unsafe), /prohibited field/i)
})
