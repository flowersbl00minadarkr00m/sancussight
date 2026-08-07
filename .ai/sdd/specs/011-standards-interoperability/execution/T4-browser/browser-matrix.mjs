import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const origin = 'http://127.0.0.1:4173'
const featureDatabase = 'sancussight-standards-interoperability-v1'
const rawPrivateValues = [
  '0176a8c2-fe01-7439-87e6-56a1a1b4029f',
  'synthetic-private-job-namespace',
  'synthetic-private-job-name',
  'synthetic-private-input-namespace',
  'synthetic-private-input-name',
  'synthetic-private-output-namespace',
  'synthetic-private-output-name',
  'https://producer.example/synthetic-client',
  'synthetic-facet-secret-owner@example.com-C:\\Users\\synthetic\\secret.txt',
  'synthetic-accepted-session-reference',
  'synthetic-accepted-event-reference',
  'synthetic-runtime-telemetry.jsonl',
  'Synthetic accepted runtime metadata.',
]
const expectedSnapshotFields = [
  'acceptedCount',
  'confirmationDigest',
  'createdAt',
  'omittedCount',
  'operationKind',
  'persistenceState',
  'profileId',
  'reasonCodeCounts',
  'rejectedCount',
  'safeHashes',
  'schemaVersion',
]
const results = []

function record(name, details = {}) {
  results.push({ name, verdict: 'PASS', ...details })
}

function fixture(name) {
  return join(outputDirectory, name)
}

function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Non-finite number')
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  const entries = Object.keys(value).sort().map(key => (
    `${JSON.stringify(key)}:${canonicalize(value[key])}`
  ))
  return `{${entries.join(',')}}`
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex')
}

async function waitForOperation(page, index) {
  await page.waitForFunction(operationIndex => {
    const status = document.querySelectorAll('.interoperability-status')[operationIndex]
    return status && !status.classList.contains('interoperability-status-pending')
  }, index)
}

async function openStandardsWorkspace(page) {
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Advanced' }).click()
  await page.getByRole('button', { name: 'Evidence Sources' }).click()
  await page.getByRole('heading', { name: 'Standards Interoperability' }).waitFor()
}

async function readFeatureRecords(page) {
  return page.evaluate(async databaseName => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    if (!database.objectStoreNames.contains('previews')) {
      database.close()
      return []
    }
    const transaction = database.transaction('previews', 'readonly')
    const records = await new Promise((resolve, reject) => {
      const request = transaction.objectStore('previews').getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
    return records
  }, featureDatabase)
}

async function dumpOtherDatabases(page) {
  return page.evaluate(async excludedName => {
    const databaseInfos = await indexedDB.databases()
    const output = {}
    for (const info of databaseInfos) {
      if (!info.name || info.name === excludedName) continue
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open(info.name)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })
      const stores = {}
      for (const storeName of Array.from(database.objectStoreNames)) {
        const transaction = database.transaction(storeName, 'readonly')
        stores[storeName] = await new Promise((resolve, reject) => {
          const request = transaction.objectStore(storeName).getAll()
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result)
        })
        await new Promise((resolve, reject) => {
          transaction.oncomplete = resolve
          transaction.onerror = () => reject(transaction.error)
          transaction.onabort = () => reject(transaction.error)
        })
      }
      database.close()
      output[info.name] = stores
    }
    return output
  }, featureDatabase)
}

async function seedRetentionRecords(page) {
  await page.evaluate(async databaseName => {
    const profiles = [
      ['openlineage-run-event-core-1.0.5', 'openlineage-import'],
      ['otel-genai-metadata-preview-1', 'telemetry-alignment'],
      ['openinference-metadata-preview-1', 'telemetry-alignment'],
      ['sancussight-in-toto-statement-1', 'unsigned-statement'],
    ]
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction('previews', 'readwrite')
    const store = transaction.objectStore('previews')
    let sequence = 1
    for (const [profileId, operationKind] of profiles) {
      for (let index = 0; index < 26; index += 1) {
        const hash = sequence.toString(16).padStart(64, '0')
        const snapshot = {
          schemaVersion: 1,
          profileId,
          operationKind,
          createdAt: new Date(Date.UTC(2026, 6, 23, 0, sequence)).toISOString(),
          acceptedCount: 1,
          rejectedCount: 0,
          omittedCount: 0,
          reasonCodeCounts: [],
          safeHashes: [hash],
          persistenceState: 'available',
          ...(operationKind === 'unsigned-statement'
            ? { confirmationDigest: `sha256:${hash}` }
            : {}),
        }
        store.add({ snapshot })
        sequence += 1
      }
    }
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
  }, featureDatabase)
}

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

try {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  const consoleProblems = []
  const pageErrors = []
  const requests = []
  page.on('console', message => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleProblems.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('request', request => requests.push(request.url()))

  await openStandardsWorkspace(page)
  const focusedEntry = await page.evaluate(() => document.activeElement?.textContent?.trim())
  assert.equal(focusedEntry, 'Standards Interoperability')
  const desktopLayout = await page.evaluate(() => {
    const workspace = document.querySelector('.standards-interoperability')?.getBoundingClientRect()
    const rail = document.querySelector('.evidence-source-rail')?.getBoundingClientRect()
    return {
      workspace: workspace && { left: workspace.left, right: workspace.right, width: workspace.width },
      rail: rail && { left: rail.left, right: rail.right, width: rail.width },
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  assert.ok(desktopLayout.workspace && desktopLayout.rail)
  assert.ok(desktopLayout.workspace.right <= desktopLayout.rail.left + 1)
  assert.equal(desktopLayout.pageOverflow, 0)
  record('desktop workspace and existing Evidence Sources rail', desktopLayout)

  assert.match(await page.locator('body').innerText(), /No accepted runtime telemetry is available/)
  await page.getByRole('button', { name: 'Refresh and retain alignment preview' }).click()
  await waitForOperation(page, 1)
  assert.match(await page.locator('.interoperability-status').nth(1).innerText(), /0 accepted runtime records/)
  const emptyAlignmentStates = await page.locator('.interoperability-state').allTextContents()
  assert.ok(emptyAlignmentStates.includes('missing'))
  assert.ok(emptyAlignmentStates.includes('omitted-private'))
  record('empty/no-runtime telemetry alignment', {
    accepted: 0,
    states: [...new Set(emptyAlignmentStates)],
  })

  const openLineageInput = page.locator('.standards-interoperability input[type="file"]').first()
  await openLineageInput.setInputFiles(fixture('synthetic-openlineage-safe.json'))
  await waitForOperation(page, 0)
  assert.match(await page.locator('.interoperability-status').first().innerText(), /1 accepted, 0 rejected, 0 omitted/)
  assert.match(await page.locator('.interoperability-summary').first().innerText(), /INPUT KIND\s+json/)
  assert.match(await page.evaluate(() => document.activeElement?.textContent ?? ''), /Latest sanitized import/)
  const firstCount = (await readFeatureRecords(page)).length
  await openLineageInput.setInputFiles(fixture('synthetic-openlineage-safe.json'))
  await waitForOperation(page, 0)
  const dedupedCount = (await readFeatureRecords(page)).length
  assert.equal(dedupedCount, firstCount)
  record('safe OpenLineage JSON and per-profile equivalence dedupe', {
    recordsBeforeRepeat: firstCount,
    recordsAfterRepeat: dedupedCount,
  })

  await openLineageInput.setInputFiles(fixture('synthetic-openlineage-safe.jsonl'))
  await waitForOperation(page, 0)
  assert.match(await page.locator('.interoperability-status').first().innerText(), /2 accepted, 0 rejected, 0 omitted/)
  record('safe OpenLineage JSONL')

  await openLineageInput.setInputFiles(fixture('synthetic-openlineage-mixed.jsonl'))
  await waitForOperation(page, 0)
  const mixedStatus = await page.locator('.interoperability-status').first().innerText()
  assert.match(mixedStatus, /2 accepted, 3 rejected, 4 omitted/)
  record('mixed safe/malformed/unknown/facet isolation', { status: mixedStatus })

  const featureRecords = await readFeatureRecords(page)
  const latestOpenLineage = [...featureRecords]
    .reverse()
    .find(recordValue => recordValue.snapshot.operationKind === 'openlineage-import')
  const latestReasonCodes = latestOpenLineage.snapshot.reasonCodeCounts.map(item => item.code)
  for (const code of [
    'malformed-json',
    'unsupported-schema-url',
    'unsupported-event-type',
    'run-facets-omitted',
    'job-facets-omitted',
    'input-dataset-facets-omitted',
    'output-dataset-facets-omitted',
  ]) {
    assert.ok(latestReasonCodes.includes(code), code)
  }
  const serializedRecords = JSON.stringify(featureRecords)
  for (const raw of rawPrivateValues) assert.equal(serializedRecords.includes(raw), false, raw)
  assert.equal(serializedRecords.includes(await readFile(fixture('synthetic-openlineage-mixed.jsonl'), 'utf8')), false)
  for (const recordValue of featureRecords) {
    assert.deepEqual(Object.keys(recordValue).sort(), ['id', 'snapshot'])
    const keys = Object.keys(recordValue.snapshot).sort()
    assert.ok(keys.every(key => expectedSnapshotFields.includes(key)))
    assert.ok(keys.length === 10 || keys.length === 11)
    assert.ok(recordValue.snapshot.safeHashes.every(hash => /^[0-9a-f]{64}$/.test(hash)))
  }
  record('exact IndexedDB allowlist and raw-value/file-byte/hash-preimage privacy negatives', {
    database: featureDatabase,
    store: 'previews',
    inspectedRecords: featureRecords.length,
  })

  const evidenceSnapshotInput = page.locator('.evidence-source-rail input[type="file"]')
  await evidenceSnapshotInput.setInputFiles(fixture('synthetic-runtime-evidence.json'))
  await page.getByText(/1 normalized evidence record imported as a manual snapshot/).waitFor()
  await page.getByRole('button', { name: 'Refresh and retain alignment preview' }).click()
  await waitForOperation(page, 1)
  const populatedStatus = await page.locator('.interoperability-status').nth(1).innerText()
  assert.match(populatedStatus, /1 accepted runtime record aligned/)
  const alignmentText = await page.locator('.interoperability-table').innerText()
  assert.match(alignmentText, /gen_ai\.operation\.name/)
  assert.match(alignmentText, /tool\.completed/)
  assert.match(alignmentText, /openinference\.span\.kind/)
  for (const raw of rawPrivateValues.slice(9)) {
    assert.equal(alignmentText.includes(raw), false, raw)
  }
  record('populated accepted-runtime telemetry alignment', { status: populatedStatus })

  const statementInput = page.locator('.standards-interoperability input[type="file"]').nth(1)
  await statementInput.setInputFiles(fixture('synthetic-valid-evidence-packet.json'))
  await waitForOperation(page, 2)
  const validStatus = await page.locator('.interoperability-status').nth(2).innerText()
  assert.match(validStatus, /Unsigned Statement validated in memory/)
  assert.match(validStatus, /not externally verified/)
  assert.match(await page.evaluate(() => document.activeElement?.textContent ?? ''), /Statement validation/)
  const statementSummary = await page.locator('.interoperability-summary').nth(1).innerText()
  assert.match(statementSummary, /Unsigned · not externally verified/)
  const confirmationDigest = statementSummary.match(/sha256:[0-9a-f]{64}/)?.[0]
  assert.ok(confirmationDigest)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download unsigned Statement' }).click()
  const download = await downloadPromise
  const downloadPath = fixture(download.suggestedFilename())
  await download.saveAs(downloadPath)
  await waitForOperation(page, 2)
  const downloadedBytes = await readFile(downloadPath, 'utf8')
  const downloadedStatement = JSON.parse(downloadedBytes)
  const validPacket = JSON.parse(await readFile(fixture('synthetic-valid-evidence-packet.json'), 'utf8'))
  assert.equal(downloadedBytes, canonicalize(downloadedStatement))
  assert.equal(downloadedStatement._type, 'https://in-toto.io/Statement/v1')
  assert.equal(downloadedStatement.subject[0].digest.sha256, validPacket.packetId.slice('sha256:'.length))
  assert.equal(downloadedStatement.predicate.unsigned, true)
  assert.equal(downloadedStatement.predicate.externallyVerified, false)
  assert.equal(`sha256:${digest(downloadedBytes)}`, confirmationDigest)
  for (const forbidden of ['signature', 'dsse', 'certificate', 'key', 'identity', 'transparencyLog', 'externalVerifier']) {
    assert.equal(JSON.stringify(downloadedStatement).includes(`"${forbidden}"`), false)
  }
  record('valid Statement canonical download, digest, and exact unsigned truth', {
    filename: download.suggestedFilename(),
    confirmationDigest,
  })

  await statementInput.setInputFiles(fixture('synthetic-tampered-evidence-packet.json'))
  await waitForOperation(page, 2)
  const tamperedStatus = await page.locator('.interoperability-status').nth(2).innerText()
  assert.match(tamperedStatus, /invalid or unsupported/)
  assert.equal(await page.getByRole('button', { name: 'Download unsigned Statement' }).isDisabled(), true)
  record('tampered Evidence Packet rejection', { status: tamperedStatus })

  await statementInput.setInputFiles(fixture('synthetic-valid-evidence-packet.json'))
  await waitForOperation(page, 2)
  await page.evaluate(() => {
    window.__t4OriginalAnchorClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = () => {
      throw new Error('Synthetic browser download denial')
    }
  })
  await page.getByRole('button', { name: 'Download unsigned Statement' }).click()
  await waitForOperation(page, 2)
  const failedDownloadStatus = await page.locator('.interoperability-status').nth(2).innerText()
  assert.match(failedDownloadStatus, /Local download failed/)
  assert.match(failedDownloadStatus, /No successful download is claimed/)
  await page.evaluate(() => {
    HTMLAnchorElement.prototype.click = window.__t4OriginalAnchorClick
    delete window.__t4OriginalAnchorClick
  })
  record('download failure makes no false success claim', { status: failedDownloadStatus })

  await seedRetentionRecords(page)
  await openLineageInput.setInputFiles(fixture('synthetic-openlineage-safe.jsonl'))
  await waitForOperation(page, 0)
  const retainedRecords = await readFeatureRecords(page)
  const retainedByProfile = Object.fromEntries([
    ...new Set(retainedRecords.map(item => item.snapshot.profileId)),
  ].map(profileId => [
    profileId,
    retainedRecords.filter(item => item.snapshot.profileId === profileId).length,
  ]))
  assert.equal(retainedRecords.length, 80)
  assert.deepEqual(retainedByProfile, {
    'openinference-metadata-preview-1': 20,
    'openlineage-run-event-core-1.0.5': 20,
    'otel-genai-metadata-preview-1': 20,
    'sancussight-in-toto-statement-1': 20,
  })
  assert.ok(retainedRecords.length <= 100)
  record('20/profile and 100/global browser retention', {
    total: retainedRecords.length,
    retainedByProfile,
    note: 'Four pinned profiles make the 20/profile cap bind at 80, below the global cap of 100.',
  })

  const otherDatabasesBeforeClear = await dumpOtherDatabases(page)
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Clear preview history' }).click()
  await page.waitForFunction(() => {
    const heading = document.getElementById('standards-interoperability-heading')
    return document.activeElement === heading
  })
  assert.equal((await readFeatureRecords(page)).length, 0)
  const otherDatabasesAfterClear = await dumpOtherDatabases(page)
  assert.deepEqual(otherDatabasesAfterClear, otherDatabasesBeforeClear)
  assert.match(await page.locator('.interoperability-empty').filter({ hasText: /No interoperability preview history/ }).innerText(), /No interoperability/)
  record('Feature 011-only clear, useful focus, and Feature 009/010 isolation', {
    untouchedDatabases: Object.keys(otherDatabasesBeforeClear).sort(),
  })

  await page.screenshot({
    path: fixture('desktop-standards-workspace.png'),
    fullPage: true,
  })

  await page.setViewportSize({ width: 320, height: 900 })
  await page.evaluate(() => window.scrollTo(0, 0))
  const narrow = await page.evaluate(() => {
    const tableWrap = document.querySelector('.interoperability-table-wrap')
    const hash = document.querySelector('.interoperability-hash')
    return {
      viewport: window.innerWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      tableScrollWidth: tableWrap?.scrollWidth,
      tableClientWidth: tableWrap?.clientWidth,
      hashScrollWidth: hash?.scrollWidth,
      hashClientWidth: hash?.clientWidth,
      workspaceCount: document.querySelectorAll('.standards-interoperability').length,
      railCount: document.querySelectorAll('.evidence-source-rail').length,
    }
  })
  assert.equal(narrow.viewport, 320)
  assert.equal(narrow.pageScrollWidth, narrow.pageClientWidth)
  assert.ok(narrow.tableScrollWidth > narrow.tableClientWidth)
  assert.ok(narrow.hashScrollWidth <= narrow.hashClientWidth)
  assert.equal(narrow.workspaceCount, 1)
  assert.equal(narrow.railCount, 1)
  await page.screenshot({
    path: fixture('narrow-320-standards-workspace.png'),
    fullPage: true,
  })
  record('320 CSS pixels, long hashes, internal table overflow, and zero page overflow', narrow)

  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await page.reload({ waitUntil: 'networkidle' })
  const effectiveZoom = await page.evaluate(() => ({
    viewport: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio,
    pageScrollWidth: document.documentElement.scrollWidth,
    pageClientWidth: document.documentElement.clientWidth,
  }))
  assert.equal(effectiveZoom.viewport, 320)
  assert.equal(effectiveZoom.devicePixelRatio, 2)
  assert.equal(effectiveZoom.pageScrollWidth, effectiveZoom.pageClientWidth)
  await page.screenshot({
    path: fixture('effective-200-percent.png'),
    fullPage: true,
  })
  record('effective 200% Chromium metrics with zero page overflow', effectiveZoom)
  await cdp.send('Emulation.clearDeviceMetricsOverride')

  await page.goto(`${origin}/#landing`, { waitUntil: 'networkidle' })
  assert.equal(new URL(page.url()).hash, '#landing')
  await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  assert.equal(new URL(page.url()).hash, '#demo')
  const footerLinks = page.locator('footer a')
  assert.equal(await footerLinks.count(), 1)
  assert.equal((await footerLinks.first().innerText()).trim(), 'https://sancussight.vercel.app')
  assert.equal(await footerLinks.first().getAttribute('href'), 'https://sancussight.vercel.app')
  await page.goto(`${origin}/#unknown`, { waitUntil: 'networkidle' })
  assert.match(await page.locator('body').innerText(), /READ-ONLY AI EVIDENCE WORKSPACE/i)
  record('existing routes and canonical one-link footer')

  assert.equal(consoleProblems.length, 0, JSON.stringify(consoleProblems))
  assert.equal(pageErrors.length, 0, JSON.stringify(pageErrors))
  const nonLoopbackRequests = requests.filter(url => {
    const parsed = new URL(url)
    return parsed.protocol !== 'blob:' && parsed.origin !== origin
  })
  assert.deepEqual(nonLoopbackRequests, [])
  record('zero Feature 011 console warnings/errors and loopback/same-origin-only traffic', {
    consoleProblems: consoleProblems.length,
    pageErrors: pageErrors.length,
    requests: requests.length,
    origins: [...new Set(requests.map(url => new URL(url).origin))],
  })

  await context.close()

  const unavailableContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  await unavailableContext.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      value: undefined,
    })
  })
  const unavailablePage = await unavailableContext.newPage()
  await openStandardsWorkspace(unavailablePage)
  await unavailablePage.getByText(/Browser persistence is unavailable/).waitFor()
  const unavailableInput = unavailablePage.locator('.standards-interoperability input[type="file"]').first()
  await unavailableInput.setInputFiles(fixture('synthetic-openlineage-safe.json'))
  await waitForOperation(unavailablePage, 0)
  const unavailableStatus = await unavailablePage.locator('.interoperability-status').first().innerText()
  assert.match(unavailableStatus, /in-memory preview remains usable/)
  assert.match(await unavailablePage.locator('.interoperability-summary').first().innerText(), /1/)
  await unavailablePage.screenshot({
    path: fixture('indexeddb-unavailable.png'),
    fullPage: true,
  })
  record('honest IndexedDB unavailable state with usable in-memory preview', {
    status: unavailableStatus,
  })
  await unavailableContext.close()

  await writeFile(
    fixture('browser-matrix-results.json'),
    `${JSON.stringify({
      browser: 'Google Chrome',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      origin,
      fixtureQualification: 'Explicitly synthetic; not production evidence.',
      results,
    }, null, 2)}\n`,
    'utf8',
  )
  console.log(JSON.stringify({ passed: results.length, results }, null, 2))
} finally {
  await browser.close()
}
