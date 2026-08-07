import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const paths = {
  app: new URL('../../App.tsx', import.meta.url),
  registry: new URL('../../components/Registry.tsx', import.meta.url),
  history: new URL('../../components/AssetVersionHistory.tsx', import.meta.url),
  packetExport: new URL('../../components/EvidencePacketExport.tsx', import.meta.url),
  exit: new URL('../../components/ExitTest.tsx', import.meta.url),
  css: new URL('../../index.css', import.meta.url),
}

async function source(name) {
  return readFile(paths[name], 'utf8')
}

test('App owns explicit version and alias mutations through the registry update path', async () => {
  const app = await source('app')

  assert.match(app, /async function handleRecordAssetVersion/)
  assert.match(app, /hashRegistryScope\(activeRegistry\)/)
  assert.match(app, /projectCheckResult\(signal,\s*\{\s*registryScope:\s*scopeHash\s*\}\)/s)
  assert.match(app, /projectAssetVersionVerificationRefs\(catalogedResults\)/)
  assert.match(app, /await recordAssetVersion\(/)
  assert.match(app, /if \(result\.status === 'recorded'\)\s*\{\s*updateRegistry\(/s)
  assert.match(app, /assignAssetVersionAlias\(asset, name, versionId\)/)
  assert.match(app, /removeAssetVersionAlias\(asset, name\)/)
  assert.match(app, /onRecordVersion=\{handleRecordAssetVersion\}/)
  assert.match(app, /onAssignVersionAlias=\{handleAssignAssetVersionAlias\}/)
  assert.match(app, /onRemoveVersionAlias=\{handleRemoveAssetVersionAlias\}/)
})

test('the canonical six-section Asset Passport gains one bounded History implementation', async () => {
  const [registry, history] = await Promise.all([source('registry'), source('history')])
  const sectionTitles = [...registry.matchAll(/<DetailSection title="([^"]+)"/g)].map(match => match[1])

  assert.deepEqual(sectionTitles, [
    'Summary',
    'Portability',
    'Dependencies',
    'Evidence',
    'Decisions',
    'History',
  ])
  assert.equal((registry.match(/<AssetVersionHistory/g) ?? []).length, 1)

  for (const stateText of [
    'No recorded versions.',
    'Record current version',
    'Already recorded.',
    'Current recorded version',
    'No previous version recorded.',
    'Current versus previous recorded version',
    'Version aliases are labels only.',
    'Add or move alias',
  ]) {
    assert.match(history, new RegExp(stateText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  assert.match(history, /<strong>\{item\.state\}: \{item\.label\}<\/strong>/)
  assert.match(history, /Basis: \{basisLabel\(item\.basis\)\}/)
  assert.match(history, /aria-current=\{isCurrent \? 'true' : undefined\}/)
  assert.match(history, /maxLength=\{64\}/)
  assert.match(history, /<input/)
  assert.match(history, /<select/)
  assert.match(history, /<button/)
  assert.doesNotMatch(history, /\b(score|rating|percentile|generated narrative)\b/i)
})

test('asset and current Exit Drill packet controls report local pending, success, and failure honestly', async () => {
  const [history, packetExport, exit] = await Promise.all([
    source('history'),
    source('packetExport'),
    source('exit'),
  ])

  assert.match(history, /buildAssetVersionEvidencePacket/)
  assert.match(history, /assetId:\s*asset\.stableId \?\? asset\.id/)
  assert.match(history, /previousVersion/)
  assert.match(history, /Comparison unavailable\./)
  assert.match(history, /meaningful changes exceed the 100-item truthfulness limit/)
  assert.match(history, /portable projection/)
  assert.match(history, /not the original recorded facts/)
  assert.match(packetExport, /Preparing and validating the Evidence Packet\./)
  assert.match(packetExport, /Export failed\. No download was claimed\./)
  assert.match(packetExport, /Evidence Packet downloaded as/)
  assert.match(packetExport, /role="status"/)
  assert.match(packetExport, /aria-live="polite"/)
  assert.match(packetExport, /downloadEvidencePacket\(packet, browserSha256\)/)

  const currentResultBlock = exit.slice(exit.indexOf('{result && ('))
  assert.match(currentResultBlock, /<EvidencePacketExport/)
  assert.match(currentResultBlock, /buildExitDrillEvidencePacket/)
  assert.match(currentResultBlock, /does not persist or execute an Exit Drill/)
  assert.equal((exit.match(/<EvidencePacketExport/g) ?? []).length, 1)

  const combined = `${history}\n${packetExport}\n${exit}`
  assert.doesNotMatch(combined, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|analytics)\b/)
})

test('Feature 010 styles wrap identifiers and stack controls without changing the canonical layout selectors', async () => {
  const css = await source('css')

  for (const selector of [
    '.asset-version-history',
    '.asset-version-list',
    '.asset-version-alias-controls',
    '.asset-version-comparison',
    '.evidence-packet-export',
    '.exit-packet-export',
  ]) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')))
  }
  assert.match(css, /\.asset-version-list code\s*\{[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(css, /\.evidence-packet-status\s*\{[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(css, /@media \(max-width: 520px\)\s*\{[\s\S]*\.asset-version-alias-controls\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(css, /\.assets-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(24rem, 1\.1fr\) minmax\(22rem, 0\.9fr\)/s)
  assert.match(css, /\.assets-workspace\.assets-view-catalog \.asset-passport-region\s*\{\s*display:\s*none;/)
  assert.match(css, /\.assets-workspace\.assets-view-passport \.assets-catalog-region\s*\{\s*display:\s*none;/)
})
