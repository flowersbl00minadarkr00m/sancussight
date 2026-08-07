import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const origin = 'https://sancussight.vercel.app'
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const expectedSections = ['Summary', 'Portability', 'Dependencies', 'Evidence', 'Decisions', 'History']
const results = []
const consoleIssues = []
const pageErrors = []
const requests = []

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
  })
}

async function inspectDemo(page) {
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  const headerText = await page.locator('.workspace-header').innerText()
  assert.match(headerText, /Demo data/)
  assert.match(headerText, /Synthetic workspace/)
  assert.doesNotMatch(headerText, /Write: granted/)
  assert.equal(await page.locator('.workspace-header').getByRole('button', { name: 'Save to source' }).count(), 0)
  await page.locator('.asset-link').first().click()
  assert.equal(await page.locator('.source-write-strip').count(), 0)

  const disclosures = page.locator('.asset-passport-region details.detail-section')
  assert.equal(await disclosures.count(), 6)
  assert.deepEqual(await disclosures.locator('summary .passport-section-title').allTextContents(), expectedSections)
  assert.deepEqual(await disclosures.evaluateAll(items => items.map(item => item.open)), [true, false, false, false, false, false])

  const portabilitySummary = disclosures.nth(1).locator('summary')
  await portabilitySummary.focus()
  await portabilitySummary.press('Enter')
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

  const selectedName = await page.locator('#asset-passport-heading').innerText()
  await disclosures.nth(0).getByRole('button', { name: 'Record review today' }).click()
  assert.equal(await evidence.evaluate(item => item.open), true)
  assert.equal(await history.evaluate(item => item.open), true)
  assert.equal(await page.locator('.source-write-strip').count(), 0)

  const secondRow = page.locator('.asset-link').nth(1)
  const secondName = await secondRow.innerText()
  await secondRow.click()
  assert.equal(await page.locator('#asset-passport-heading').innerText(), secondName)
  assert.deepEqual(
    await page.locator('.asset-passport-region details.detail-section').evaluateAll(items => items.map(item => item.open)),
    [true, false, false, false, false, false],
  )

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

  results.push({
    name: 'hosted demo source truth, disclosures, content ownership, rerender stability, changed-asset reset, and footer',
    verdict: 'PASS',
    headerText,
    selectedName,
    secondName,
    marker,
    footer,
  })
}

async function inspectSnapshot(page) {
  await page.locator('details.utility-menu > summary').click()
  const input = page.locator('input[type="file"][accept="application/json,.json"]')
  assert.equal(await input.count(), 1)
  page.once('dialog', dialog => dialog.accept())
  await input.setInputFiles({
    name: 'feature012-hosted-snapshot.json',
    mimeType: 'application/json',
    buffer: await readFile(join(outputDirectory, '..', 'T3-browser', 'disposable-registry-fixture.json')),
  })
  await page.waitForTimeout(400)
  assert.equal(await page.getByRole('button', { name: 'Save to source' }).count(), 0)
  assert.equal(await page.locator('.source-write-strip').count(), 0)
  results.push({
    name: 'hosted snapshot import exposes no canonical-write action or native-file authority',
    verdict: 'PASS',
  })
}

async function inspectNarrow(browser) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  capture(page, 'narrow-effective-200')
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  const row = page.locator('.asset-link').first()
  const name = await row.innerText()
  await row.click()
  await page.waitForFunction(() => document.activeElement?.id === 'asset-passport-heading')
  assert.equal(await page.locator('#asset-passport-heading').innerText(), name)
  assert.equal(await page.locator('.assets-catalog-region').evaluate(node => getComputedStyle(node).display), 'none')
  assert.equal(await page.locator('.asset-passport-region').count(), 1)
  assert.equal(await page.locator('.assets-catalog-region').count(), 1)

  const metrics = await page.evaluate(() => {
    const root = document.documentElement
    return {
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      pageOverflow: root.scrollWidth - root.clientWidth,
      passports: document.querySelectorAll('.asset-passport-region').length,
      strips: document.querySelectorAll('.source-write-strip').length,
      disclosures: document.querySelectorAll('.asset-passport-region details.detail-section').length,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })
  assert.equal(metrics.innerWidth, 320)
  assert.ok(Math.abs(metrics.devicePixelRatio - 2) < 0.01)
  assert.equal(metrics.pageOverflow, 0)
  assert.equal(metrics.passports, 1)
  assert.equal(metrics.strips, 0)
  assert.equal(metrics.disclosures, 6)
  assert.equal(metrics.reducedMotion, true)

  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForFunction(expected => document.activeElement?.textContent?.trim() === expected, name)
  assert.equal(await row.evaluate(node => document.activeElement === node), true)
  assert.equal(await row.getAttribute('aria-current'), 'true')
  await page.screenshot({ path: join(outputDirectory, 'hosted-effective-200.png'), fullPage: true })
  results.push({
    name: 'hosted selected-row association, narrow entry/Back focus, 320 CSS px, effective 200%, zero page overflow, and one responsive DOM',
    verdict: 'PASS',
    selectedAsset: name,
    metrics,
  })
  await context.close()
}

async function inspectRoutes(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  capture(page, 'routes')
  await page.goto(`${origin}/#landing`, { waitUntil: 'networkidle' })
  await page.locator('.landing-page').waitFor()
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  await page.locator('.assets-catalog-region').waitFor()
  await page.goto(`${origin}/#unknown-route`, { waitUntil: 'networkidle' })
  await page.locator('.landing-page').waitFor()
  results.push({
    name: 'hosted landing, demo, and unknown hash-route fallback',
    verdict: 'PASS',
  })
  await context.close()
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
})

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  capture(page, 'demo-snapshot')
  await clearBrowserState(page)
  await inspectDemo(page)
  await inspectSnapshot(page)
  await page.screenshot({ path: join(outputDirectory, 'hosted-primary.png'), fullPage: true })
  await context.close()
  await inspectNarrow(browser)
  await inspectRoutes(browser)

  const foreignRequests = requests.filter(item => {
    const url = new URL(item.url)
    return url.origin !== origin
  })
  assert.deepEqual(consoleIssues, [])
  assert.deepEqual(pageErrors, [])
  assert.deepEqual(foreignRequests, [])
  results.push({
    name: 'hosted clean console/page errors and canonical-origin-only static requests',
    verdict: 'PASS',
    consoleIssues: 0,
    pageErrors: 0,
    requestCount: requests.length,
    foreignRequests: 0,
  })

  const report = {
    verdict: 'PASS',
    browser: {
      name: 'Google Chrome',
      executablePath: chromePath,
      version: await browser.version(),
    },
    origin,
    limitations: [
      'No public-host file write was automated.',
      'No native file handle was fabricated; demo and imported snapshot modes were verified to expose no canonical-write action.',
      'Local connected-file write permission, preflight, write, and recovery evidence remains owned by T3.',
    ],
    results,
    consoleIssues,
    pageErrors,
    requests,
  }
  await writeFile(join(outputDirectory, 'hosted-browser-results.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({
    verdict: report.verdict,
    browser: report.browser,
    checks: results.length,
    consoleIssues: consoleIssues.length,
    pageErrors: pageErrors.length,
    requests: requests.length,
    foreignRequests: foreignRequests.length,
  }, null, 2))
} catch (error) {
  await writeFile(join(outputDirectory, 'hosted-browser-failure.json'), JSON.stringify({
    verdict: 'FAIL',
    error: error instanceof Error ? error.stack : String(error),
    results,
    consoleIssues,
    pageErrors,
    requests,
  }, null, 2))
  throw error
} finally {
  await browser.close()
}
