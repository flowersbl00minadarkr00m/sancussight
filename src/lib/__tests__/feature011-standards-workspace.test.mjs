import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const paths = {
  app: new URL('../../App.tsx', import.meta.url),
  component: new URL('../../components/StandardsInteroperability.tsx', import.meta.url),
  evidenceSources: new URL('../../components/EvidenceSources.tsx', import.meta.url),
  css: new URL('../../index.css', import.meta.url),
}

async function source(name) {
  return readFile(paths[name], 'utf8')
}

test('Evidence Sources owns one conditional Standards Interoperability main workspace', async () => {
  const [app, component, evidenceSources] = await Promise.all([
    source('app'),
    source('component'),
    source('evidenceSources'),
  ])

  assert.equal((app.match(/<StandardsInteroperability/g) ?? []).length, 1)
  assert.match(app, /evidenceSourcesActive\s*\?\s*\(/)
  assert.match(app, /evidence=\{collector\.state\.evidence\}/)
  assert.match(app, /<EvidenceSources/)
  assert.doesNotMatch(evidenceSources, /StandardsInteroperability/)
  assert.doesNotMatch(app, /id:\s*['"]interoperability['"]/)
  assert.match(component, /id="standards-interoperability-heading"/)
  assert.match(component, /headingRef\.current\?\.focus\(\)/)
})

test('workspace renders native local actions, every explicit empty/failure state, and permanent non-claims', async () => {
  const component = await source('component')

  assert.match(component, /type="file"[^>]*accept="application\/json,\.json,\.jsonl"/)
  assert.match(component, /safeHashes:\s*preview\.safeHashes\.map\(item => item\.hash\.slice\('sha256:'\.length\)\)/)
  assert.match(component, /Telemetry alignment/)
  assert.match(component, /No accepted runtime telemetry is available/)
  assert.match(component, /Unsupported profile or input/)
  assert.match(component, /Evidence Packet is invalid/)
  assert.match(component, /No interoperability preview history is stored/)
  assert.match(component, /Preview history is unavailable/)
  assert.match(component, /Browser persistence is unavailable/)
  assert.match(component, /Unsigned/)
  assert.match(component, /not externally verified/)
  assert.match(component, /does not claim conformance, certification, evidence truth, or authenticated provenance/)
  assert.match(component, /role="status"/)
  assert.match(component, />\s*Clear preview history\s*</)
})

test('workspace has no network, scoring, signer, DSSE, policy-runtime, or duplicate responsive DOM path', async () => {
  const [component, app] = await Promise.all([source('component'), source('app')])
  const combined = `${component}\n${app}`

  assert.doesNotMatch(combined, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|analytics)\s*\(/)
  assert.doesNotMatch(component, /\b(score|rating|percentile)\b/i)
  assert.doesNotMatch(component, /\b(signer|DSSE|policy engine|policy runtime)\b/i)
  assert.doesNotMatch(component, /matchMedia|innerWidth|mobileMarkup|desktopMarkup/)
})

test('Feature 011 CSS owns focus, long-hash wrapping, internal table overflow, and narrow stacking', async () => {
  const css = await source('css')

  assert.match(css, /\.standards-interoperability/)
  assert.match(css, /\.interoperability-hash[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(css, /\.interoperability-table-wrap[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.standards-interoperability\s+:focus-visible/)
  assert.match(css, /@media \(max-width:\s*520px\)[\s\S]*\.interoperability-actions/)
})
