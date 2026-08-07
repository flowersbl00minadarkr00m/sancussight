import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const origin = 'http://127.0.0.1:4182'
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const expectedSections = ['Summary', 'Portability', 'Dependencies', 'Evidence', 'Decisions', 'History']
const results = []
const consoleIssues = []
const pageErrors = []
const requests = []
let fixtureSequence = 0

function record(name, details = {}) {
  results.push({ name, verdict: 'PASS', ...details })
}

function capture(page, label) {
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleIssues.push({ label, type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push({ label, message: error.message }))
  page.on('request', request => requests.push({ label, url: request.url(), method: request.method() }))
}

async function clearBrowserState(page) {
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    localStorage.clear()
    sessionStorage.clear()
    const databases = await indexedDB.databases()
    await Promise.all(databases.filter(item => item.name).map(item => new Promise(resolve => {
      const request = indexedDB.deleteDatabase(item.name)
      request.onsuccess = resolve
      request.onerror = resolve
      request.onblocked = resolve
    })))
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory()
      for await (const [name] of root.entries()) {
        await root.removeEntry(name, { recursive: true })
      }
    }
  })
}

async function exportDemoFixture(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })
  const page = await context.newPage()
  capture(page, 'fixture-export')
  await clearBrowserState(page)
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  await page.locator('details.utility-menu > summary').click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export demo JSON' }).click()
  const download = await downloadPromise
  const temporaryPath = await download.path()
  assert.ok(temporaryPath)
  const registry = JSON.parse(await readFile(temporaryPath, 'utf8'))
  registry.provenance = {
    mode: 'local',
    sourceUpdatedAt: registry.provenance?.sourceUpdatedAt ?? registry.updatedAt,
  }
  registry.updatedAt = '2026-07-24T17:00:00.000Z'
  await context.close()
  return registry
}

async function installFixturePicker(context, registry, options = {}) {
  fixtureSequence += 1
  const filename = options.filename ?? `feature012-t3-${fixtureSequence}.json`
  await context.addInitScript(({ raw, filename: initialFilename, initialWritePermission }) => {
    const control = {
      filename: initialFilename,
      initialRaw: raw,
      readPermission: 'granted',
      writePermission: initialWritePermission,
      failWrite: false,
      handle: undefined,
      originals: undefined,
    }
    window.__feature012T3 = {
      setReadPermission(value) {
        control.readPermission = value
      },
      setWritePermission(value) {
        control.writePermission = value
      },
      setFailWrite(value) {
        control.failWrite = value
      },
      async readRaw() {
        return (await control.handle.getFile()).text()
      },
      async externalWrite(value) {
        const writable = await control.originals.createWritable.call(control.handle)
        await writable.write(value)
        await writable.close()
      },
      permissions() {
        return { read: control.readPermission, write: control.writePermission }
      },
    }
    window.showOpenFilePicker = async () => {
      const root = await navigator.storage.getDirectory()
      const handle = await root.getFileHandle(control.filename, { create: true })
      const prototype = Object.getPrototypeOf(handle)
      if (!control.originals) {
        control.originals = {
          queryPermission: prototype.queryPermission,
          requestPermission: prototype.requestPermission,
          createWritable: prototype.createWritable,
        }
        prototype.queryPermission = async function ({ mode = 'read' } = {}) {
          return mode === 'readwrite' ? control.writePermission : control.readPermission
        }
        prototype.requestPermission = async function ({ mode = 'read' } = {}) {
          return mode === 'readwrite' ? control.writePermission : control.readPermission
        }
        prototype.createWritable = async function (...args) {
          if (control.failWrite) throw new DOMException('Synthetic disposable fixture write failure', 'NotAllowedError')
          return control.originals.createWritable.apply(this, args)
        }
      }
      control.handle = handle
      const writable = await control.originals.createWritable.call(handle)
      await writable.write(control.initialRaw)
      await writable.close()
      return [handle]
    }
  }, {
    raw: JSON.stringify(registry, null, 2),
    filename,
    initialWritePermission: options.writePermission ?? 'granted',
  })
  return filename
}

async function openConnectedFixture(browser, registry, label, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 1280, height: 900 },
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
    reducedMotion: options.reducedMotion ?? 'no-preference',
  })
  const filename = await installFixturePicker(context, registry, options)
  const page = await context.newPage()
  capture(page, label)
  await clearBrowserState(page)
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open existing registry' }).click()
  try {
    await page.locator('.assets-catalog-region').waitFor({ timeout: 5000 })
  } catch {
    const notices = await page.locator('.connection-notice').allTextContents()
    const body = (await page.locator('body').innerText()).slice(0, 2000)
    throw new Error(`Fixture connection did not reach Assets. Notices=${JSON.stringify(notices)} Body=${JSON.stringify(body)}`)
  }
  await page.locator('.asset-link').first().click()
  await page.locator('#asset-passport-heading').waitFor()
  return { context, page, filename }
}

async function mutateSelected(page) {
  const summary = page.locator('.detail-section').filter({ hasText: 'Summary' }).first()
  await summary.getByRole('button', { name: 'Record review today' }).click()
  await page.locator('.source-write-strip').getByText('Unsaved changes', { exact: true }).waitFor()
}

async function acceptNextDialog(page) {
  page.once('dialog', dialog => dialog.accept())
}

async function dismissNextDialog(page) {
  page.once('dialog', dialog => dialog.dismiss())
}

async function saveAndWait(page) {
  await acceptNextDialog(page)
  await page.getByRole('button', { name: 'Save to source' }).click()
  await page.getByText('Saved to source', { exact: true }).waitFor()
}

async function inspectHeaderAndPassport(page, filename) {
  const header = page.locator('.workspace-header')
  const headerText = await header.innerText()
  assert.match(headerText, new RegExp(filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(headerText, /Current/)
  assert.match(headerText, /Last read/)
  assert.match(headerText, /Read: granted \/ Write: granted/)
  assert.equal(await header.getByRole('button', { name: 'Save to source' }).count(), 0)
  assert.equal(await page.locator('.asset-passport-region .source-write-strip').count(), 0)

  const disclosures = page.locator('.asset-passport-region details.detail-section')
  assert.equal(await disclosures.count(), 6)
  const names = await disclosures.locator('summary .passport-section-title').allTextContents()
  assert.deepEqual(names, expectedSections)
  const initialOpen = await disclosures.evaluateAll(items => items.map(item => ({
    name: item.querySelector('.passport-section-title')?.textContent?.trim(),
    open: item.open,
  })))
  assert.deepEqual(initialOpen, expectedSections.map((name, index) => ({ name, open: index === 0 })))

  const portabilitySummary = disclosures.nth(1).locator('summary')
  await portabilitySummary.focus()
  await portabilitySummary.press('Enter')
  assert.equal(await disclosures.nth(1).evaluate(item => item.open), true)
  const marker = await portabilitySummary.evaluate(item => ({
    display: getComputedStyle(item).display,
    listStyleType: getComputedStyle(item).listStyleType,
    markerContent: getComputedStyle(item, '::marker').content,
    focusVisible: item.matches(':focus-visible'),
  }))
  assert.equal(marker.focusVisible, true)
  assert.notEqual(marker.display, 'none')

  const evidence = disclosures.nth(3)
  const history = disclosures.nth(5)
  await evidence.locator('summary').press('Enter')
  await history.locator('summary').press('Enter')
  assert.match(await evidence.innerText(), /Evidence bindings/i)
  assert.match(await history.innerText(), /Record current version/i)
  return { disclosures, marker }
}

async function runPrimaryScenario(browser, registry) {
  const { context, page, filename } = await openConnectedFixture(browser, registry, 'primary')
  const { disclosures, marker } = await inspectHeaderAndPassport(page, filename)
  const selectedName = await page.locator('#asset-passport-heading').innerText()
  const evidence = disclosures.nth(3)
  const history = disclosures.nth(5)

  await mutateSelected(page)
  assert.equal(await evidence.evaluate(item => item.open), true)
  assert.equal(await history.evaluate(item => item.open), true)
  assert.equal(await page.locator('.asset-passport-region .source-write-strip').count(), 1)
  assert.equal(await page.locator('.workspace-header').getByRole('button', { name: 'Save to source' }).count(), 0)

  await dismissNextDialog(page)
  await page.getByRole('button', { name: 'Save to source' }).click()
  await page.getByText('Save cancelled. Unsaved changes remain in the recovery cache.').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 1)

  await saveAndWait(page)
  const savedRaw = await page.evaluate(() => window.__feature012T3.readRaw())
  const savedRegistry = JSON.parse(savedRaw)
  const savedAsset = savedRegistry.assets.find(asset => asset.name === selectedName)
  assert.equal(savedAsset.lastReviewed, new Date().toISOString().slice(0, 10))
  assert.match(await page.locator('.source-context').innerText(), /Current/)
  assert.equal(await evidence.evaluate(item => item.open), true)
  assert.equal(await history.evaluate(item => item.open), true)
  await history.getByRole('button', { name: 'Record current version' }).click()
  await history.getByText(/Evidence Packet/i).waitFor()
  assert.equal(await history.evaluate(item => item.open), true)
  await saveAndWait(page)

  const secondRow = page.locator('.asset-link').nth(1)
  const secondName = await secondRow.innerText()
  await secondRow.click()
  assert.equal(await page.locator('#asset-passport-heading').innerText(), secondName)
  const reset = await page.locator('.asset-passport-region details.detail-section').evaluateAll(items => items.map(item => item.open))
  assert.deepEqual(reset, [true, false, false, false, false, false])

  const footer = await page.locator('footer.workspace-footer').evaluate(node => ({
    children: node.children.length,
    anchors: node.querySelectorAll('a').length,
    text: node.textContent.trim(),
    href: node.querySelector('a')?.href,
  }))
  assert.deepEqual(footer, {
    children: 1,
    anchors: 1,
    text: 'https://sancussight.vercel.app',
    href: 'https://sancussight.vercel.app/',
  })

  await page.setViewportSize({ width: 320, height: 900 })
  const row = page.locator('.asset-link', { hasText: secondName }).first()
  await row.waitFor()
  await row.click()
  await page.waitForFunction(() => document.activeElement?.id === 'asset-passport-heading')
  assert.equal(await page.locator('#asset-passport-heading').evaluate(node => document.activeElement === node), true)
  assert.equal(await page.locator('.assets-catalog-region').evaluate(node => getComputedStyle(node).display), 'none')
  assert.notEqual(await page.locator('.asset-passport-region').evaluate(node => getComputedStyle(node).display), 'none')
  assert.equal(await page.locator('.asset-passport-region').count(), 1)
  assert.equal(await page.locator('.assets-catalog-region').count(), 1)
  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForFunction(name => document.activeElement?.textContent?.trim() === name, secondName)
  assert.equal(await row.evaluate(node => document.activeElement === node), true)
  assert.equal(await row.getAttribute('aria-current'), 'true')

  await page.screenshot({ path: join(outputDirectory, 'primary-narrow.png'), fullPage: true })
  record('current -> mutation -> unsaved -> cancel -> confirm -> verified save', {
    source: filename,
    selectedAsset: selectedName,
    savedLastReviewed: savedAsset.lastReviewed,
  })
  record('Header truth and single selected-Passport write ownership', {
    headerSaveActions: 0,
    passportStripsWhenDirty: 1,
  })
  record('six native disclosures, keyboard marker/focus, content, rerender stability, and asset reset', {
    sections: expectedSections,
    marker,
    reset,
  })
  record('selected row/Passport association, narrow focus entry, Back restoration, routes/footer basis', {
    selectedAsset: secondName,
    footer,
  })
  await context.close()
}

async function runPermissionScenario(browser, registry) {
  const { context, page } = await openConnectedFixture(browser, registry, 'permission', { writePermission: 'denied' })
  await mutateSelected(page)
  await acceptNextDialog(page)
  await page.getByRole('button', { name: 'Save to source' }).click()
  await page.getByText('Write permission was not granted.').waitFor()
  assert.match(await page.locator('.source-write-strip').innerText(), /Unsaved changes/i)
  assert.match(await page.locator('.source-context').innerText(), /Write: denied/)
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 1)
  await page.evaluate(() => window.__feature012T3.setWritePermission('granted'))
  await saveAndWait(page)
  assert.match(await page.locator('.source-context').innerText(), /Write: granted/)
  record('permission-required feedback and recovery', {
    deniedFeedback: 'Write permission was not granted.',
    recovered: true,
  })
  await context.close()
}

async function runFailureScenario(browser, registry) {
  const { context, page } = await openConnectedFixture(browser, registry, 'failure')
  await mutateSelected(page)
  await page.evaluate(() => window.__feature012T3.setFailWrite(true))
  await acceptNextDialog(page)
  await page.getByRole('button', { name: 'Save to source' }).click()
  await page.waitForTimeout(500)
  const failureText = await page.locator('.source-write-strip').innerText()
  assert.match(failureText, /Synthetic disposable fixture write failure|The source write failed|Source write failed|browser blocked source access/i)
  assert.match(await page.locator('.source-write-strip').innerText(), /Unsaved changes/i)
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 1)
  await page.evaluate(() => window.__feature012T3.setFailWrite(false))
  await saveAndWait(page)
  record('write failure feedback and recovery', {
    failureText,
    failureRetainedDirty: true,
    recovered: true,
  })
  await context.close()
}

async function runConflictScenario(browser, registry) {
  const { context, page } = await openConnectedFixture(browser, registry, 'conflict')
  await mutateSelected(page)
  const changed = structuredClone(registry)
  changed.updatedAt = '2026-07-24T17:30:00.000Z'
  changed.assets[0].owner = 'external-fixture-owner'
  await page.evaluate(raw => window.__feature012T3.externalWrite(raw), JSON.stringify(changed, null, 2))
  await acceptNextDialog(page)
  await page.getByRole('button', { name: 'Save to source' }).click()
  await page.waitForTimeout(500)
  assert.match(await page.locator('.source-write-strip').innerText(), /Unsaved changes.*Conflict/is)
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 0)
  await page.getByRole('heading', { name: /Both the working copy and/ }).waitFor()
  await acceptNextDialog(page)
  await page.getByRole('button', { name: 'Reload source' }).click()
  await page.getByText(/Refreshed .*feature012-t3.*\.json/).waitFor()
  assert.match(await page.locator('.source-context').innerText(), /Current/)
  record('fresh preflight conflict block and recovery', {
    writerBlocked: true,
    recoveredBy: 'Reload source',
  })
  await context.close()
}

async function runDemoAndSnapshotScenario(browser, registry) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  capture(page, 'demo-snapshot')
  await clearBrowserState(page)
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  await page.locator('.asset-link').first().click()
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 0)
  assert.equal(await page.locator('.source-write-strip').count(), 0)
  assert.match(await page.locator('.source-context').innerText(), /Demo data/)

  await page.locator('details.utility-menu > summary').click()
  const input = page.locator('input[type="file"][accept="application/json,.json"]')
  assert.equal(await input.count(), 1)
  await acceptNextDialog(page)
  await input.setInputFiles({
    name: 'feature012-snapshot.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(registry, null, 2)),
  })
  await page.waitForTimeout(500)
  const snapshotNotices = await page.locator('.connection-notice').allTextContents()
  assert.ok(
    snapshotNotices.some(text => /Snapshot imported from feature012-snapshot.json/.test(text)),
    `Unexpected snapshot import result: ${JSON.stringify(snapshotNotices)}`,
  )
  await page.locator('.asset-link').first().click()
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 0)
  assert.equal(await page.locator('.source-write-strip').count(), 0)
  assert.match(await page.locator('.source-context').innerText(), /Snapshot/)
  record('demo and snapshot expose no canonical-write action', {
    demoSaveActions: 0,
    snapshotSaveActions: 0,
  })
  await context.close()
}

async function runResponsiveScenario(browser, registry) {
  const { context, page } = await openConnectedFixture(browser, registry, 'effective-200', {
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  await mutateSelected(page)
  const historySummary = page.locator('.detail-section').nth(5).locator('summary')
  await historySummary.press('Enter')
  const metrics = await page.evaluate(() => {
    const root = document.documentElement
    const contents = Array.from(document.querySelectorAll('.passport-section-content')).map(node => ({
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
    }))
    return {
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      pageOverflow: root.scrollWidth - root.clientWidth,
      passports: document.querySelectorAll('.asset-passport-region').length,
      strips: document.querySelectorAll('.source-write-strip').length,
      disclosures: document.querySelectorAll('.asset-passport-region details.detail-section').length,
      contents,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })
  assert.equal(metrics.innerWidth, 320)
  assert.ok(Math.abs(metrics.devicePixelRatio - 2) < 0.01)
  assert.equal(metrics.pageOverflow, 0)
  assert.equal(metrics.passports, 1)
  assert.equal(metrics.strips, 1)
  assert.equal(metrics.disclosures, 6)
  assert.equal(metrics.reducedMotion, true)
  assert.ok(metrics.contents.every(item => item.clientWidth > 0 && item.scrollWidth >= item.clientWidth))
  await page.screenshot({ path: join(outputDirectory, 'effective-200.png'), fullPage: true })
  record('320 CSS px and effective 200% layout', metrics)
  await context.close()
}

async function runRouteScenario(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  capture(page, 'routes')
  await page.goto(`${origin}/#landing`, { waitUntil: 'networkidle' })
  await page.locator('.landing-page').waitFor()
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  await page.locator('.assets-catalog-region').waitFor()
  await page.goto(`${origin}/#unknown-route`, { waitUntil: 'networkidle' })
  await page.locator('.landing-page').waitFor()
  record('landing, demo, and unknown-route fallback', {
    landing: true,
    demo: true,
    unknownFallback: true,
  })
  await context.close()
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: false,
})

try {
  const registry = await exportDemoFixture(browser)
  await writeFile(join(outputDirectory, 'disposable-registry-fixture.json'), `${JSON.stringify(registry, null, 2)}\n`)
  await runDemoAndSnapshotScenario(browser, registry)
  await runPrimaryScenario(browser, registry)
  await runPermissionScenario(browser, registry)
  await runFailureScenario(browser, registry)
  await runConflictScenario(browser, registry)
  await runResponsiveScenario(browser, registry)
  await runRouteScenario(browser)

  const foreignRequests = requests.filter(item => {
    const url = new URL(item.url)
    return url.origin !== origin
  })
  assert.deepEqual(consoleIssues, [])
  assert.deepEqual(pageErrors, [])
  assert.deepEqual(foreignRequests, [])
  record('clean console/page errors and same-origin-only traffic', {
    consoleIssues: consoleIssues.length,
    pageErrors: pageErrors.length,
    requestCount: requests.length,
    foreignRequests: foreignRequests.length,
  })

  const report = {
    browser: {
      product: 'Google Chrome',
      executablePath: chromePath,
      version: await browser.version(),
    },
    origin,
    results,
    consoleIssues,
    pageErrors,
    requests,
  }
  await writeFile(join(outputDirectory, 'browser-matrix-results.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    verdict: 'PASS',
    browser: report.browser,
    checks: results.length,
    consoleIssues: consoleIssues.length,
    pageErrors: pageErrors.length,
    requests: requests.length,
    foreignRequests: foreignRequests.length,
  }, null, 2))
} catch (error) {
  const failure = {
    verdict: 'FAIL',
    error: error.stack ?? String(error),
    results,
    consoleIssues,
    pageErrors,
    requests,
  }
  await writeFile(join(outputDirectory, 'browser-matrix-failure.json'), `${JSON.stringify(failure, null, 2)}\n`)
  console.error(error)
  process.exitCode = 1
} finally {
  await browser.close()
}
