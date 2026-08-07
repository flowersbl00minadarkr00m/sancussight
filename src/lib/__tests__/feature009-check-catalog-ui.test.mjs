import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const paths = {
  app: new URL('../../App.tsx', import.meta.url),
  catalog: new URL('../../components/CheckCatalog.tsx', import.meta.url),
  lineage: new URL('../../components/ClaimLineageInspector.tsx', import.meta.url),
  queue: new URL('../../components/Queue.tsx', import.meta.url),
  registry: new URL('../../components/Registry.tsx', import.meta.url),
  css: new URL('../../index.css', import.meta.url),
}

async function source(name) {
  return readFile(paths[name], 'utf8')
}

test('Attention owns one canonical Check Catalog detail and App-owned intent', async () => {
  const [app, catalog, queue, registry] = await Promise.all([
    source('app'),
    source('catalog'),
    source('queue'),
    source('registry'),
  ])

  assert.match(queue, /export \{ CheckCatalog as Queue \}/)
  assert.doesNotMatch(queue, /<table|queue-mobile-list/)
  assert.match(app, /const \[checkIntent, setCheckIntent\]/)
  assert.match(app, /historyStore=\{checkHistoryStore\}/)
  assert.match(app, /onIntentChange=\{setCheckIntent\}/)
  assert.match(app, /resultDiscriminator:\s*signal\.id/)
  assert.match(catalog, /selectedResult\.resultDiscriminator/)
  assert.match(app, /querySelector<HTMLHeadingElement>\('#asset-passport-heading'\)\?\.focus\(\)/)
  assert.match(registry, />\s*Open check explanation\s*</)
  assert.equal((registry.match(/Open check explanation/g) ?? []).length, 1)

  for (const heading of [
    'Definition',
    'Current result',
    'Previous result',
    'Evidence inspected',
    'Claim lineage',
    'Remediation and invalidation',
  ]) {
    assert.match(catalog, new RegExp(`title="${heading}"`))
  }
})

test('catalog states are explicit and narrow list/detail uses one conditional DOM', async () => {
  const catalog = await source('catalog')

  for (const stateText of [
    'No result selected',
    'Uncataloged observation',
    'No previous result recorded',
    'Local history unavailable',
    'No current result',
    'Clear history',
    'Back to checks',
    'Open Asset Passport',
  ]) {
    assert.match(catalog, new RegExp(stateText))
  }

  assert.match(catalog, /const showList = !isNarrow \|\| narrowView === 'list'/)
  assert.match(catalog, /const showDetail = !isNarrow \|\| narrowView === 'detail'/)
  assert.match(catalog, /\{showList && \(/)
  assert.match(catalog, /\{showDetail && \(/)
  assert.match(catalog, /detailHeading\.current\?\.focus\(\)/)
  assert.match(catalog, /intent\.origin !== 'asset-passport'/)
  assert.match(catalog, /listButtons\.current\.get\(returnKey\)/)
})

test('lineage exposes all relationship and truth states as text without network or scoring', async () => {
  const [catalog, lineage] = await Promise.all([source('catalog'), source('lineage')])
  const combined = `${catalog}\n${lineage}`

  for (const state of ['verified', 'missing', 'inferred', 'stale', 'conflicting']) {
    assert.match(lineage, new RegExp(`${state}:`))
  }
  for (const truthClass of ['Recorded fact', 'Deterministic finding', 'Human decision', 'Missing evidence']) {
    assert.match(lineage, new RegExp(truthClass))
  }

  assert.doesNotMatch(combined, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|analytics)\b/)
  assert.doesNotMatch(combined, /\b(score|rating|percentile)\b/i)
})

test('lineage rendering preserves every bounded outgoing relationship in stable order', async () => {
  const lineage = await source('lineage')

  assert.match(lineage, /const edgesBySource = new Map<string, ClaimLineage\['edges'\]>/)
  assert.match(lineage, /sourceEdges\.push\(edge\)/)
  assert.match(lineage, /relationships=\{edgesBySource\.get\(node\.id\) \?\? \[\]\}/)
  assert.match(lineage, /relationships\.map\(\(relationship\) =>/)
  assert.doesNotMatch(lineage, /new Map\(lineage\.edges\.map\(edge => \[edge\.from, edge\]\)\)/)
})

test('Feature 009 CSS preserves adjacent desktop detail and bounded narrow layout', async () => {
  const css = await source('css')

  assert.match(css, /\.check-catalog-workspace\s*\{[^}]*grid-template-columns:/s)
  assert.match(css, /\.check-catalog-detail-region\s*\{[^}]*position:\s*sticky/s)
  assert.match(css, /@media \(max-width: 899px\)\s*\{[^}]*\.check-catalog-workspace/s)
  assert.match(css, /\.check-detail-grid\s*\{[^}]*minmax\(0, 1fr\)/s)
  assert.match(css, /\.claim-lineage-node\s*\{[^}]*overflow-wrap:\s*anywhere/s)
})
