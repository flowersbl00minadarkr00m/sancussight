import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const origin = 'http://127.0.0.1:4176'
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const featureDatabase = 'sancussight-standards-interoperability-v1'
const featureStore = 'previews'
const results = []
const allTelemetry = []

const facetSentinels = Object.freeze([
  'C5_RUN_FACET_94f9_SENTINEL',
  'C5_JOB_FACET_94f9_SENTINEL',
  'C5_INPUT_BASE_FACET_94f9_SENTINEL',
  'C5_INPUT_DIRECTION_FACET_94f9_SENTINEL',
  'C5_OUTPUT_BASE_FACET_94f9_SENTINEL',
  'C5_OUTPUT_DIRECTION_FACET_94f9_SENTINEL',
])

const officialFacetEvent = Object.freeze({
  eventTime: '2026-07-24T16:40:00.000Z',
  eventType: 'COMPLETE',
  run: {
    runId: '0176a8c2-fe01-7439-87e6-56a1a1b405f9',
    facets: { c5Run: { value: facetSentinels[0] } },
  },
  job: {
    namespace: 'c5-private-job-namespace',
    name: 'c5-private-job-name',
    facets: { c5Job: { value: facetSentinels[1] } },
  },
  inputs: [{
    namespace: 'c5-private-input-namespace',
    name: 'c5-private-input-name',
    facets: { c5Base: { value: facetSentinels[2] } },
    inputFacets: { c5Input: { value: facetSentinels[3] } },
  }],
  outputs: [{
    namespace: 'c5-private-output-namespace',
    name: 'c5-private-output-name',
    facets: { c5Base: { value: facetSentinels[4] } },
    outputFacets: { c5Output: { value: facetSentinels[5] } },
  }],
  producer: 'https://producer.example/c5-private-client',
  schemaURL: 'https://openlineage.io/spec/1-0-5/OpenLineage.json#/definitions/RunEvent',
})

function record(name, details = {}) {
  results.push({ name, verdict: 'PASS', ...details })
}

function artifact(name) {
  return join(outputDirectory, name)
}

function syntheticJsonFile(name, value) {
  return {
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value), 'utf8'),
  }
}

function snapshot({
  profileId = 'openlineage-run-event-core-1.0.5',
  operationKind = 'openlineage-import',
  createdAt = '2026-07-24T16:40:00.000Z',
  hash = 'a'.repeat(64),
  confirmationDigest,
} = {}) {
  return {
    schemaVersion: 1,
    profileId,
    operationKind,
    createdAt,
    acceptedCount: 1,
    rejectedCount: 0,
    omittedCount: 0,
    reasonCodeCounts: [],
    safeHashes: [hash],
    persistenceState: 'available',
    ...(confirmationDigest ? { confirmationDigest } : {}),
  }
}

async function waitForOperation(page, index) {
  await page.waitForFunction(operationIndex => {
    const status = document.querySelectorAll('.interoperability-status')[operationIndex]
    return status && !status.classList.contains('interoperability-status-pending')
  }, index)
}

async function openStandardsWorkspace(page, { navigate = true, keyboard = false } = {}) {
  if (navigate) await page.goto(`${origin}/#demo`, { waitUntil: 'networkidle' })
  const advanced = page.getByRole('button', { name: 'Advanced' })
  if (keyboard) {
    await advanced.focus()
    await page.keyboard.press('Enter')
    const evidenceSources = page.getByRole('button', { name: 'Evidence Sources' })
    await evidenceSources.focus()
    await page.keyboard.press('Enter')
  } else {
    await advanced.click()
    await page.getByRole('button', { name: 'Evidence Sources' }).click()
  }
  await page.getByRole('heading', { name: 'Standards Interoperability' }).waitFor()
}

async function initializeRealStore(page) {
  await page.evaluate(async () => {
    const module = await import('/src/lib/interoperability-store.ts')
    window.__c5Store = new module.InteroperabilityPreviewStore()
  })
}

async function readFeatureRecords(page) {
  return page.evaluate(async ({ databaseName, storeName }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    if (!database.objectStoreNames.contains(storeName)) {
      database.close()
      return []
    }
    const transaction = database.transaction(storeName, 'readonly')
    const records = await new Promise((resolve, reject) => {
      const request = transaction.objectStore(storeName).getAll()
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
  }, { databaseName: featureDatabase, storeName: featureStore })
}

async function addRawFeatureRecord(page, value) {
  return page.evaluate(async ({ databaseName, storeName, rawValue }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction(storeName, 'readwrite')
    const id = await new Promise((resolve, reject) => {
      const request = transaction.objectStore(storeName).add(rawValue)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
    return id
  }, { databaseName: featureDatabase, storeName: featureStore, rawValue: value })
}

async function holdFeatureStore(page, milliseconds = 800) {
  await page.evaluate(async ({ databaseName, storeName, holdMs }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    window.__c5ReleasePersistence = false
    window.__c5Blocker = { database, transaction }
    setTimeout(() => {
      window.__c5ReleasePersistence = true
    }, holdMs)
    const keepAlive = () => {
      if (window.__c5ReleasePersistence) return
      const request = store.get(-1)
      request.onsuccess = keepAlive
      request.onerror = keepAlive
    }
    keepAlive()
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
    transaction.onabort = () => database.close()
  }, {
    databaseName: featureDatabase,
    storeName: featureStore,
    holdMs: milliseconds,
  })
}

async function createUnrelatedDatabase(page) {
  return page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('c5-synthetic-unrelated-history', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('records')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction('records', 'readwrite')
    transaction.objectStore('records').put(
      { kind: 'synthetic-control', value: 'C5_UNRELATED_SENTINEL' },
      'control',
    )
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
  })
}

async function readUnrelatedDatabase(page) {
  return page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('c5-synthetic-unrelated-history')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction('records', 'readonly')
    const value = await new Promise((resolve, reject) => {
      const request = transaction.objectStore('records').get('control')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    database.close()
    return value
  })
}

function attachInstrumentation(context) {
  const telemetry = { consoleMessages: [], pageErrors: [], requests: [] }
  allTelemetry.push(telemetry)
  context.on('page', page => {
    page.on('console', message => {
      telemetry.consoleMessages.push({ type: message.type(), text: message.text() })
    })
    page.on('pageerror', error => telemetry.pageErrors.push(error.message))
    page.on('request', request => telemetry.requests.push(request.url()))
  })
  return context.addInitScript(({ databaseName, storeName }) => {
    window.__c5DigestInputs = []
    window.__c5FeatureAdds = 0
    if (globalThis.SubtleCrypto) {
      const originalDigest = SubtleCrypto.prototype.digest
      Object.defineProperty(SubtleCrypto.prototype, 'digest', {
        configurable: true,
        writable: true,
        value(algorithm, data) {
          try {
            const view = data instanceof ArrayBuffer
              ? new Uint8Array(data)
              : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
            window.__c5DigestInputs.push(new TextDecoder().decode(view))
          } catch {
            window.__c5DigestInputs.push('[unreadable-digest-input]')
          }
          return originalDigest.call(this, algorithm, data)
        },
      })
    }
    if (globalThis.IDBObjectStore) {
      const originalAdd = IDBObjectStore.prototype.add
      Object.defineProperty(IDBObjectStore.prototype, 'add', {
        configurable: true,
        writable: true,
        value(...args) {
          if (this.name === storeName && this.transaction.db.name === databaseName) {
            window.__c5FeatureAdds += 1
          }
          return originalAdd.apply(this, args)
        },
      })
    }
  }, { databaseName: featureDatabase, storeName: featureStore }).then(() => telemetry)
}

function assertNoSentinels(serialized, label) {
  for (const sentinel of facetSentinels) {
    assert.equal(serialized.includes(sentinel), false, `${label}:${sentinel}`)
  }
}

await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
})

try {
  const atomicContext = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  await attachInstrumentation(atomicContext)
  const firstPage = await atomicContext.newPage()
  const secondPage = await atomicContext.newPage()
  await Promise.all([
    firstPage.goto(`${origin}/#demo`, { waitUntil: 'networkidle' }),
    secondPage.goto(`${origin}/#demo`, { waitUntil: 'networkidle' }),
  ])
  await Promise.all([initializeRealStore(firstPage), initializeRealStore(secondPage)])
  assert.deepEqual(await firstPage.evaluate(() => window.__c5Store.clear()), {
    availability: 'available',
  })
  await holdFeatureStore(firstPage)

  const firstSnapshot = snapshot()
  const secondSnapshot = snapshot({ createdAt: '2026-07-24T16:40:01.000Z' })
  const firstRecordPromise = firstPage.evaluate(
    value => window.__c5Store.record(value),
    firstSnapshot,
  )
  await firstPage.waitForTimeout(50)
  const secondRecordPromise = secondPage.evaluate(
    value => window.__c5Store.record(value),
    secondSnapshot,
  )
  const [firstRecord, secondRecord] = await Promise.all([
    firstRecordPromise,
    secondRecordPromise,
  ])

  assert.equal(firstRecord.availability, 'available')
  assert.equal(secondRecord.availability, 'available')
  assert.deepEqual(
    [firstRecord.recorded, secondRecord.recorded],
    [true, false],
  )
  assert.equal(firstRecord.snapshots.length, 1)
  assert.equal(secondRecord.snapshots.length, 1)
  const [firstView, secondView, firstRaw, secondRaw] = await Promise.all([
    firstPage.evaluate(() => window.__c5Store.list()),
    secondPage.evaluate(() => window.__c5Store.list()),
    readFeatureRecords(firstPage),
    readFeatureRecords(secondPage),
  ])
  assert.equal(firstView.availability, 'available')
  assert.equal(secondView.availability, 'available')
  assert.equal(firstView.snapshots.length, 1)
  assert.equal(secondView.snapshots.length, 1)
  assert.deepEqual(firstView.snapshots, secondView.snapshots)
  assert.equal(firstRaw.length, 1)
  assert.deepEqual(firstRaw, secondRaw)
  const serializedAtomic = JSON.stringify({
    firstRecord,
    secondRecord,
    firstView,
    secondView,
    firstRaw,
    secondRaw,
  })
  assert.doesNotMatch(
    serializedAtomic,
    /private|credential|prompt|response|reasoning|toolPayload|unavailable/iu,
  )
  assert.equal(
    await firstPage.evaluate(() => window.__c5FeatureAdds)
      + await secondPage.evaluate(() => window.__c5FeatureAdds),
    1,
  )
  record('two independently loaded page/store contexts atomically record then deduplicate one equivalent IndexedDB snapshot', {
    pages: 2,
    origin,
    database: featureDatabase,
    store: featureStore,
    outcomes: ['recorded', 'deduplicated'],
    availability: [firstRecord.availability, secondRecord.availability],
    persistedSnapshots: firstRaw.length,
    firstContextSnapshots: firstView.snapshots.length,
    secondContextSnapshots: secondView.snapshots.length,
    indexedDbAddCalls:
      await firstPage.evaluate(() => window.__c5FeatureAdds)
      + await secondPage.evaluate(() => window.__c5FeatureAdds),
    privacySearch: 'no raw/private value or unavailable state in returned or retained atomic evidence',
  })
  await atomicContext.close()

  const findingContext = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  const findingTelemetry = await attachInstrumentation(findingContext)
  const findingPage = await findingContext.newPage()
  await openStandardsWorkspace(findingPage)
  assert.equal(
    await findingPage.evaluate(() => document.activeElement?.textContent?.trim()),
    'Standards Interoperability',
  )
  record('focus enters the Standards Interoperability workspace')

  const lineageInput = findingPage.locator(
    '.standards-interoperability input[type="file"]',
  ).first()
  const facetFile = syntheticJsonFile(
    'synthetic-c5-official-facets.json',
    officialFacetEvent,
  )
  await lineageInput.setInputFiles(facetFile)
  await waitForOperation(findingPage, 0)
  const facetStatus = await findingPage.locator(
    '.interoperability-status',
  ).first().innerText()
  const facetSummary = await findingPage.locator(
    '.interoperability-summary',
  ).first().innerText()
  assert.match(facetStatus, /1 accepted, 0 rejected, 6 omitted/)
  const facetRecords = await readFeatureRecords(findingPage)
  assert.equal(facetRecords.length, 1)
  assert.deepEqual(facetRecords[0].snapshot.reasonCodeCounts, [
    { code: 'input-dataset-facets-omitted', count: 2 },
    { code: 'job-facets-omitted', count: 1 },
    { code: 'output-dataset-facets-omitted', count: 2 },
    { code: 'run-facets-omitted', count: 1 },
  ])
  record('official base/input/output facet containers remain six wholesale omissions', {
    status: facetStatus,
    reasonCodeCounts: facetRecords[0].snapshot.reasonCodeCounts,
  })

  const facetEvidence = JSON.stringify({
    dom: await findingPage.locator('body').innerText(),
    current: facetSummary,
    indexedDb: facetRecords,
    digestPreimages: await findingPage.evaluate(() => window.__c5DigestInputs),
    console: findingTelemetry.consoleMessages,
  })
  assertNoSentinels(facetEvidence, 'facet-privacy')
  assert.ok(
    facetRecords[0].snapshot.safeHashes.every(
      hash => /^[0-9a-f]{64}$/u.test(hash),
    ),
  )
  record('hostile facet sentinels remain absent from DOM, preview, hashes/preimages, console, and IndexedDB', {
    sentinels: facetSentinels.length,
    digestPreimagesInspected:
      await findingPage.evaluate(() => window.__c5DigestInputs.length),
    safeHashesInspected: facetRecords[0].snapshot.safeHashes.length,
  })

  const invalidSentinel = 'C5_INVALID_PERSISTED_RECORD_SENTINEL'
  await addRawFeatureRecord(findingPage, {
    snapshot: { schemaVersion: 999, raw: invalidSentinel },
  })
  await findingPage.reload({ waitUntil: 'networkidle' })
  await openStandardsWorkspace(findingPage, { navigate: false })
  await findingPage.getByText(/Browser persistence is unavailable/).waitFor()
  const historySection = findingPage.locator(
    'section[aria-labelledby="preview-history-heading"]',
  )
  const unavailableHistory = await historySection.innerText()
  assert.match(unavailableHistory, /Preview history is unavailable/)
  assert.doesNotMatch(
    unavailableHistory,
    /No interoperability preview history is stored/,
  )
  assert.equal(
    await findingPage.getByRole(
      'button',
      { name: 'Clear preview history' },
    ).isDisabled(),
    true,
  )
  assert.equal(
    (await findingPage.locator('body').innerText()).includes(invalidSentinel),
    false,
  )
  await lineageInput.setInputFiles(facetFile)
  await waitForOperation(findingPage, 0)
  const unavailableCurrent = await findingPage.locator(
    '.interoperability-status',
  ).first().innerText()
  assert.match(unavailableCurrent, /current in-memory preview remains usable/)
  assert.match(
    await findingPage.locator('.interoperability-summary').first().innerText(),
    /ACCEPTED\s+1/,
  )
  record('corrupt history remains honestly unavailable while the current sanitized preview stays usable')
  await findingContext.close()

  const regressionContext = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  await attachInstrumentation(regressionContext)
  const regressionPage = await regressionContext.newPage()
  await openStandardsWorkspace(regressionPage, { keyboard: true })
  assert.equal(
    await regressionPage.evaluate(() => document.activeElement?.textContent?.trim()),
    'Standards Interoperability',
  )
  await initializeRealStore(regressionPage)
  await createUnrelatedDatabase(regressionPage)
  const unrelatedBefore = await readUnrelatedDatabase(regressionPage)

  const profiles = [
    ['openlineage-run-event-core-1.0.5', 'openlineage-import'],
    ['otel-genai-metadata-preview-1', 'telemetry-alignment'],
    ['openinference-metadata-preview-1', 'telemetry-alignment'],
    ['sancussight-in-toto-statement-1', 'unsigned-statement'],
  ]
  for (let profileIndex = 0; profileIndex < profiles.length; profileIndex += 1) {
    const [profileId, operationKind] = profiles[profileIndex]
    for (let index = 0; index < 26; index += 1) {
      const sequence = profileIndex * 26 + index + 1
      const hash = sequence.toString(16).padStart(64, '0')
      const value = snapshot({
        profileId,
        operationKind,
        createdAt: new Date(
          Date.UTC(2026, 6, 24, 17, 0, sequence),
        ).toISOString(),
        hash,
        ...(operationKind === 'unsigned-statement'
          ? { confirmationDigest: `sha256:${hash}` }
          : {}),
      })
      const retained = await regressionPage.evaluate(
        item => window.__c5Store.record(item),
        value,
      )
      assert.equal(retained.availability, 'available')
    }
  }
  const retentionResult = await regressionPage.evaluate(
    () => window.__c5Store.list(),
  )
  assert.equal(retentionResult.availability, 'available')
  assert.equal(retentionResult.snapshots.length, 80)
  const retainedByProfile = Object.fromEntries(profiles.map(([profileId]) => [
    profileId,
    retentionResult.snapshots.filter(item => item.profileId === profileId).length,
  ]))
  assert.deepEqual(retainedByProfile, {
    'openinference-metadata-preview-1': 20,
    'openlineage-run-event-core-1.0.5': 20,
    'otel-genai-metadata-preview-1': 20,
    'sancussight-in-toto-statement-1': 20,
  })
  record('profile isolation and 20-per-profile retention remain deterministic', {
    total: retentionResult.snapshots.length,
    retainedByProfile,
  })

  const alignmentButton = regressionPage.getByRole('button', {
    name: 'Refresh and retain alignment preview',
  })
  await alignmentButton.focus()
  await regressionPage.keyboard.press('Enter')
  await waitForOperation(regressionPage, 1)
  const alignmentStatus = await regressionPage.locator(
    '.interoperability-status',
  ).nth(1).innerText()
  assert.match(alignmentStatus, /0 accepted runtime records/)
  const alignmentStates = await regressionPage.locator(
    '.interoperability-state',
  ).allTextContents()
  assert.ok(alignmentStates.includes('missing'))
  assert.ok(alignmentStates.includes('omitted-private'))
  record('keyboard controls and empty telemetry alignment remain explicit', {
    status: alignmentStatus,
    states: [...new Set(alignmentStates)],
  })

  const statementInput = regressionPage.locator(
    '.standards-interoperability input[type="file"]',
  ).nth(1)
  const statementFixture = join(
    outputDirectory,
    '..',
    'T4-browser',
    'synthetic-valid-evidence-packet.json',
  )
  await statementInput.setInputFiles(statementFixture)
  await waitForOperation(regressionPage, 2)
  const statementStatus = await regressionPage.locator(
    '.interoperability-status',
  ).nth(2).innerText()
  assert.match(statementStatus, /Unsigned Statement validated in memory/)
  assert.match(statementStatus, /not externally verified/)
  const downloadPromise = regressionPage.waitForEvent('download')
  await regressionPage.getByRole(
    'button',
    { name: 'Download unsigned Statement' },
  ).click()
  const download = await downloadPromise
  await download.saveAs(artifact(download.suggestedFilename()))
  await waitForOperation(regressionPage, 2)
  const statement = JSON.parse(
    await readFile(artifact(download.suggestedFilename()), 'utf8'),
  )
  assert.equal(statement._type, 'https://in-toto.io/Statement/v1')
  assert.equal(statement.predicate.unsigned, true)
  assert.equal(statement.predicate.externallyVerified, false)
  record('valid unsigned Statement download remains exact and explicitly unauthenticated', {
    filename: download.suggestedFilename(),
  })

  regressionPage.once('dialog', dialog => dialog.accept())
  await regressionPage.getByRole(
    'button',
    { name: 'Clear preview history' },
  ).click()
  await regressionPage.waitForFunction(() => (
    document.activeElement
    === document.getElementById('standards-interoperability-heading')
  ))
  assert.equal((await readFeatureRecords(regressionPage)).length, 0)
  assert.deepEqual(await readUnrelatedDatabase(regressionPage), unrelatedBefore)
  record('Feature 011 clear is isolated and restores useful focus')

  await regressionPage.setViewportSize({ width: 320, height: 900 })
  const narrow = await regressionPage.evaluate(() => {
    const table = document.querySelector('.interoperability-table-wrap')
    return {
      viewport: window.innerWidth,
      dpr: window.devicePixelRatio,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      pageOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tableScrollWidth: table?.scrollWidth,
      tableClientWidth: table?.clientWidth,
      workspaceCount:
        document.querySelectorAll('.standards-interoperability').length,
      railCount: document.querySelectorAll('.evidence-source-rail').length,
      heading:
        document.getElementById(
          'standards-interoperability-heading',
        )?.textContent?.trim(),
    }
  })
  assert.equal(narrow.viewport, 320)
  assert.equal(narrow.pageOverflow, 0)
  assert.ok(narrow.tableScrollWidth > narrow.tableClientWidth)
  assert.equal(narrow.workspaceCount, 1)
  assert.equal(narrow.railCount, 1)
  assert.equal(narrow.heading, 'Standards Interoperability')
  await regressionPage.screenshot({
    path: artifact('narrow-320-standards-workspace.png'),
    fullPage: true,
  })
  record('320 CSS pixels preserve one workspace/rail and bounded table overflow', narrow)

  const cdp = await regressionContext.newCDPSession(regressionPage)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await regressionPage.reload({ waitUntil: 'networkidle' })
  await openStandardsWorkspace(regressionPage, { navigate: false })
  const effective200 = await regressionPage.evaluate(() => {
    const table = document.querySelector('.interoperability-table-wrap')
    return {
      viewport: window.innerWidth,
      dpr: window.devicePixelRatio,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      pageOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tableScrollWidth: table?.scrollWidth,
      tableClientWidth: table?.clientWidth,
      tableOverflow:
        (table?.scrollWidth ?? 0) - (table?.clientWidth ?? 0),
      workspaceCount:
        document.querySelectorAll('.standards-interoperability').length,
      railCount: document.querySelectorAll('.evidence-source-rail').length,
      activeHeading:
        document.getElementById(
          'standards-interoperability-heading',
        )?.textContent?.trim(),
    }
  })
  assert.equal(effective200.viewport, 320)
  assert.equal(effective200.dpr, 2)
  assert.equal(effective200.pageOverflow, 0)
  assert.ok(effective200.tableOverflow > 0)
  assert.equal(effective200.workspaceCount, 1)
  assert.equal(effective200.railCount, 1)
  assert.equal(effective200.activeHeading, 'Standards Interoperability')
  await regressionPage.screenshot({
    path: artifact('effective-200-percent.png'),
    fullPage: true,
  })
  record(
    'effective-200 reload explicitly reopens and measures Standards Interoperability',
    effective200,
  )
  await cdp.send('Emulation.clearDeviceMetricsOverride')
  await regressionContext.close()

  const unavailableContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  await attachInstrumentation(unavailableContext)
  await unavailableContext.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      value: undefined,
    })
  })
  const unavailablePage = await unavailableContext.newPage()
  await openStandardsWorkspace(unavailablePage)
  await unavailablePage.getByText(/Browser persistence is unavailable/).waitFor()
  const unavailableInput = unavailablePage.locator(
    '.standards-interoperability input[type="file"]',
  ).first()
  await unavailableInput.setInputFiles(
    syntheticJsonFile('synthetic-c5-unavailable-facets.json', officialFacetEvent),
  )
  await waitForOperation(unavailablePage, 0)
  const unavailableStatus = await unavailablePage.locator(
    '.interoperability-status',
  ).first().innerText()
  assert.match(unavailableStatus, /current in-memory preview remains usable/)
  assert.match(
    await unavailablePage.locator('.interoperability-summary').first().innerText(),
    /OMITTED\s+6/,
  )
  await unavailablePage.screenshot({
    path: artifact('indexeddb-unavailable-current-preview.png'),
    fullPage: true,
  })
  record('IndexedDB-unavailable mode preserves the current sanitized result', {
    status: unavailableStatus,
  })
  await unavailableContext.close()

  const consoleProblems = allTelemetry.flatMap(
    telemetry => telemetry.consoleMessages.filter(
      message => message.type === 'warning' || message.type === 'error',
    ),
  )
  const pageErrors = allTelemetry.flatMap(telemetry => telemetry.pageErrors)
  const requests = allTelemetry.flatMap(telemetry => telemetry.requests)
  const externalRequests = requests.filter(url => {
    const parsed = new URL(url)
    return parsed.protocol !== 'blob:' && parsed.origin !== origin
  })
  assert.deepEqual(consoleProblems, [])
  assert.deepEqual(pageErrors, [])
  assert.deepEqual(externalRequests, [])
  assertNoSentinels(JSON.stringify(consoleProblems), 'console')
  record('clean console/page errors and loopback same-origin-only traffic', {
    consoleWarningsOrErrors: consoleProblems.length,
    pageErrors: pageErrors.length,
    requestCount: requests.length,
    origins: [...new Set(requests.map(url => new URL(url).origin))],
  })

  const browserVersion = await browser.version()
  await writeFile(
    artifact('browser-matrix-results.json'),
    `${JSON.stringify({
      browser: 'Google Chrome',
      browserVersion,
      executablePath: chromePath,
      origin,
      fixtureQualification:
        'All C5 inputs are explicit synthetic fixtures; they are not production evidence.',
      matrixScope:
        'R1-SPEC-002 repository-wide atomic dedupe, the C4 correction, and preserved fix-caused regressions only.',
      results,
    }, null, 2)}\n`,
    'utf8',
  )
  console.log(JSON.stringify({ passed: results.length, results }, null, 2))
} finally {
  await browser.close()
}
