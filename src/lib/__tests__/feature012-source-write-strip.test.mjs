import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const paths = {
  app: new URL('../../App.tsx', import.meta.url),
  header: new URL('../../components/Header.tsx', import.meta.url),
  registry: new URL('../../components/Registry.tsx', import.meta.url),
  strip: new URL('../../components/SourceWriteStrip.tsx', import.meta.url),
  sourceStatus: new URL('../../components/SourceStatus.tsx', import.meta.url),
  css: new URL('../../index.css', import.meta.url),
}

async function source(name) {
  return readFile(paths[name], 'utf8')
}

test('App keeps the existing controller save path and owns bounded deliberate-write feedback', async () => {
  const app = await source('app')

  assert.equal((app.match(/sourceController\.save\(session\)/g) ?? []).length, 1)
  assert.match(app, /window\.confirm\(\s*`Save \$\{session\.registry\.assets\.length\} assets to \$\{session\.connection\.sourceName\}\?/)
  assert.match(app, /const \[sourceWriteFeedback, setSourceWriteFeedback\] = useState<ConnectionNotice>\(\)/)
  assert.match(app, /message: `Saving changes to \$\{session\.connection\.sourceName\}\.\.\.`,\s*operationPhase: 'pending'/)
  assert.match(app, /setSourceWriteFeedback\(feedback \? \{ \.\.\.feedback, operationPhase: 'settled' \} : undefined\)/)
  assert.match(app, /current\?\.tone === 'success' \? undefined : current/)
  assert.ok((app.match(/setSourceWriteFeedback\(undefined\)/g) ?? []).length >= 4)
  assert.match(app, /sourceWriteFeedback=\{sourceWriteFeedback\}/)
  assert.match(app, /onSaveSource=\{handleSaveSource\}/)
})

test('Header has no source save action and retains compact global source truth', async () => {
  const [header, sourceStatus] = await Promise.all([source('header'), source('sourceStatus')])

  assert.doesNotMatch(header, /onSaveSource|Save to source|showSave|blockSave/)
  assert.match(header, /<SourceStatus session=\{session\} registry=\{registry\}/)
  assert.match(header, /onClick=\{session\.mode === 'demo' \? onConnect : onExport\}/)

  for (const truth of [
    'connection.sourceName',
    'SYNC_STATE_LABELS[connection.syncState]',
    'Last read {lastRead}',
    'Read: {connection.readPermission} / Write: {connection.writePermission}',
  ]) {
    assert.ok(sourceStatus.includes(truth), `missing global source truth: ${truth}`)
  }
})

test('one selected Passport owns the contextual strip and non-file modes cannot render it', async () => {
  const [registry, strip] = await Promise.all([source('registry'), source('strip')])

  assert.equal((registry.match(/<SourceWriteStrip/g) ?? []).length, 1)
  assert.match(registry, /<SourceWriteStrip[\s\S]*session=\{session\}[\s\S]*feedback=\{sourceWriteFeedback\}[\s\S]*onSaveSource=\{onSaveSource\}/)
  assert.match(strip, /session\.sourceKind !== 'file' \|\| !connection/)
  assert.match(strip, /return null/)
  assert.match(strip, /Unsaved changes/)
  assert.match(strip, />\s*Save to source\s*</)
  assert.match(strip, /connection\.syncState === 'conflict'/)
  assert.match(strip, /connection\.syncState === 'permission-required'/)
  assert.match(strip, /feedback\?\.operationPhase === 'pending'/)
  assert.doesNotMatch(strip, /startsWith\(|Saving changes to/)
  assert.match(strip, /session\.dirty && connection\.syncState === 'unsaved' && !pending/)
  assert.match(strip, /role=\{tone === 'error' \? 'alert' : 'status'\}/)
  assert.doesNotMatch(strip, /\b(sourceController|BrowserFileConnector|fetch|XMLHttpRequest|WebSocket)\b/)
})

test('Feature 012 status and strip styles remain textual, compact, and narrow-safe', async () => {
  const css = await source('css')

  assert.match(css, /\.source-context\s*\{[^}]*font-size:\s*0\.7rem/s)
  assert.match(css, /\.source-write-strip\s*\{[^}]*display:\s*flex/s)
  assert.match(css, /\.source-write-copy span\s*\{[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(css, /\.source-write-strip-error\s*\{[^}]*color-rust/s)
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.source-write-strip\s*\{[^}]*flex-direction:\s*column/s)
})
