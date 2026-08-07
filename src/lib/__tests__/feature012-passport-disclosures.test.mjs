import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const registryUrl = new URL('../../components/Registry.tsx', import.meta.url)
const cssUrl = new URL('../../index.css', import.meta.url)

async function sources() {
  return Promise.all([
    readFile(registryUrl, 'utf8'),
    readFile(cssUrl, 'utf8'),
  ])
}

test('the selected Asset Passport has exactly six native asset-keyed disclosures with approved defaults', async () => {
  const [registry] = await sources()
  const sections = ['summary', 'portability', 'dependencies', 'evidence', 'decisions', 'history']

  assert.equal((registry.match(/<DetailSection\b/g) ?? []).length, 6)
  assert.equal((registry.match(/<details\b/g) ?? []).length, 1)
  assert.equal((registry.match(/<summary\b/g) ?? []).length, 1)

  for (const section of sections) {
    assert.ok(
      registry.includes(`key={\`\${asset.id}:${section}\`}`),
      `missing stable asset-qualified ${section} disclosure key`,
    )
  }

  assert.match(
    registry,
    /<DetailSection title="Summary"[^>]*key=\{`\$\{asset\.id\}:summary`\}[^>]*defaultOpen/,
  )
  for (const title of ['Portability', 'Dependencies', 'Evidence', 'Decisions', 'History']) {
    const openingTag = registry.match(new RegExp(`<DetailSection[^>]*title="${title}"[^>]*>`))?.[0] ?? ''
    assert.ok(openingTag, `missing ${title} disclosure`)
    assert.doesNotMatch(openingTag, /\bdefaultOpen\b/)
  }
})

test('DetailSection keeps browser-native disclosure semantics and bounded content', async () => {
  const [registry, css] = await sources()

  assert.match(registry, /function DetailSection\(\{ title, truthClass, defaultOpen = false, children \}/)
  assert.match(registry, /<details className="detail-section" open=\{defaultOpen\}>/)
  assert.match(registry, /<summary className="passport-section-heading">/)
  assert.match(registry, /<div className="passport-section-content">\s*\{children\}\s*<\/div>/)
  assert.doesNotMatch(registry, /<summary[^>]*(?:role|tabIndex|onKeyDown)=/)

  assert.match(css, /\.passport-section-heading::marker\s*\{[^}]*color:/s)
  assert.match(css, /\.passport-section-heading\s*\{[^}]*cursor:\s*pointer/s)
  assert.match(css, /\.passport-section-content\s*\{[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.passport-section-title[^{]*\{[^}]*overflow-wrap:\s*anywhere/s)
})

test('Evidence and History retain their existing content and callback owners', async () => {
  const [registry] = await sources()
  const evidence = registry.slice(
    registry.indexOf('title="Evidence"'),
    registry.indexOf('title="Decisions"'),
  )
  const history = registry.slice(
    registry.indexOf('title="History"'),
    registry.indexOf('function DetailSection'),
  )

  assert.match(evidence, /Evidence bindings/)
  assert.match(evidence, /asset\.evidenceBindings/)
  assert.match(evidence, /signals\.filter\(signal => signal\.dimension === 'evidence'\)/)

  assert.match(history, /<AssetVersionHistory/)
  assert.match(history, /onRecordVersion=\{\(\) => onRecordVersion\(asset\.id\)\}/)
  assert.match(history, /onAssignAlias=\{\(name, versionId\) => onAssignVersionAlias\(asset\.id, name, versionId\)\}/)
  assert.match(history, /onRemoveAlias=\{name => onRemoveVersionAlias\(asset\.id, name\)\}/)
  assert.match(history, /Registry source updated/)
  assert.match(history, /Last review/)
  assert.match(history, /Last substitution drill/)
  assert.match(history, /coverage verification/)
})
