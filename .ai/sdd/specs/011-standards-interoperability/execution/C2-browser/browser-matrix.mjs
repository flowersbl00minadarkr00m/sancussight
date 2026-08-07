import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'file:///C:/Users/henry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const origin = 'http://127.0.0.1:4175'
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const featureDatabase = 'sancussight-standards-interoperability-v1'
const featureStore = 'previews'
const results = []

const facetSentinels = Object.freeze([
  'C2_RUN_FACET_94c0_SENTINEL',
  'C2_JOB_FACET_94c0_SENTINEL',
  'C2_INPUT_BASE_FACET_94c0_SENTINEL',
  'C2_INPUT_DIRECTION_FACET_94c0_SENTINEL',
  'C2_OUTPUT_BASE_FACET_94c0_SENTINEL',
  'C2_OUTPUT_DIRECTION_FACET_94c0_SENTINEL',
])

const officialFacetEvent = Object.freeze({
  eventTime: '2026-07-24T15:30:00.000Z',
  eventType: 'COMPLETE',
  run: {
    runId: '0176a8c2-fe01-7439-87e6-56a1a1b4029f',
    facets: { c2Run: { value: facetSentinels[0] } },
  },
  job: {
    namespace: 'c2-private-job-namespace',
    name: 'c2-private-job-name',
    facets: { c2Job: { value: facetSentinels[1] } },
  },
  inputs: [{
    namespace: 'c2-private-input-namespace',
    name: 'c2-private-input-name',
    facets: { c2Base: { value: facetSentinels[2] } },
    inputFacets: { c2Input: { value: facetSentinels[3] } },
  }],
  outputs: [{
    namespace: 'c2-private-output-namespace',
    name: 'c2-private-output-name',
    facets: { c2Base: { value: facetSentinels[4] } },
    outputFacets: { c2Output: { value: facetSentinels[5] } },
  }],
  producer: 'https://producer.example/c2-private-client',
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

async function openDatabase(page, databaseName = featureDatabase) {
  return page.evaluate(async name => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(name)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    database.close()
    return true
  }, databaseName)
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
  return page.evaluate(async ({ databaseName, storeName, value: rawValue }) => {
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
  }, { databaseName: featureDatabase, storeName: featureStore, value })
}

async function dumpOtherDatabases(page) {
  return page.evaluate(async excludedName => {
    const infos = await indexedDB.databases()
    const output = {}
    for (const info of infos) {
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

async function holdFeatureStore(page) {
  await page.evaluate(async ({ databaseName, storeName }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    window.__c2ReleasePersistence = false
    window.__c2PersistenceBlocker = { database, transaction }
    const keepAlive = () => {
      if (window.__c2ReleasePersistence) return
      const request = store.get(-1)
      request.onsuccess = keepAlive
      request.onerror = keepAlive
    }
    keepAlive()
  }, { databaseName: featureDatabase, storeName: featureStore })
}

async function releaseFeatureStore(page) {
  await page.evaluate(() => {
    window.__c2ReleasePersistence = true
    const blocker = window.__c2PersistenceBlocker
    if (blocker) {
      blocker.transaction.oncomplete = () => blocker.database.close()
      blocker.transaction.onerror = () => blocker.database.close()
      blocker.transaction.onabort = () => blocker.database.close()
    }
  })
}

async function seedRetentionRecords(page) {
  await page.evaluate(async ({ databaseName, storeName }) => {
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
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    let sequence = 1
    for (const [profileId, operationKind] of profiles) {
      for (let index = 0; index < 26; index += 1) {
        const hash = sequence.toString(16).padStart(64, '0')
        store.add({
          snapshot: {
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
          },
        })
        sequence += 1
      }
    }
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
  }, { databaseName: featureDatabase, storeName: featureStore })
}

function attachInstrumentation(context, telemetry) {
  context.on('page', page => {
    page.on('console', message => {
      telemetry.consoleMessages.push({ type: message.type(), text: message.text() })
    })
    page.on('pageerror', error => telemetry.pageErrors.push(error.message))
    page.on('request', request => telemetry.requests.push(request.url()))
  })
  return context.addInitScript(({ databaseName, storeName }) => {
    window.__c2DigestInputs = []
    window.__c2FeatureAdds = 0

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
            window.__c2DigestInputs.push(new TextDecoder().decode(view))
          } catch {
            window.__c2DigestInputs.push('[unreadable-digest-input]')
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
            window.__c2FeatureAdds += 1
          }
          return originalAdd.apply(this, args)
        },
      })
    }
  }, { databaseName: featureDatabase, storeName: featureStore })
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
  const telemetry = { consoleMessages: [], pageErrors: [], requests: [] }
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  await attachInstrumentation(context, telemetry)
  const page = await context.newPage()

  await openStandardsWorkspace(page)
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent?.trim()),
    'Standards Interoperability',
  )
  record('focus enters the Standards Interoperability workspace')

  const openLineageInput = page.locator('.standards-interoperability input[type="file"]').first()
  const facetFile = syntheticJsonFile('synthetic-c2-official-facets.json', officialFacetEvent)
  await openLineageInput.setInputFiles(facetFile)
  await waitForOperation(page, 0)

  const facetStatus = await page.locator('.interoperability-status').first().innerText()
  const facetSummary = await page.locator('.interoperability-summary').first().innerText()
  assert.match(facetStatus, /1 accepted, 0 rejected, 6 omitted/)
  assert.match(facetSummary, /ACCEPTED\s+1/)
  assert.match(facetSummary, /REJECTED\s+0/)
  assert.match(facetSummary, /OMITTED\s+6/)

  const facetRecords = await readFeatureRecords(page)
  assert.equal(facetRecords.length, 1)
  assert.deepEqual(facetRecords[0].snapshot.reasonCodeCounts, [
    { code: 'input-dataset-facets-omitted', count: 2 },
    { code: 'job-facets-omitted', count: 1 },
    { code: 'output-dataset-facets-omitted', count: 2 },
    { code: 'run-facets-omitted', count: 1 },
  ])
  assert.equal(facetRecords[0].snapshot.acceptedCount, 1)
  assert.equal(facetRecords[0].snapshot.rejectedCount, 0)
  assert.equal(facetRecords[0].snapshot.omittedCount, 6)
  record('official base/input/output facet containers are accepted as six exact omissions', {
    status: facetStatus,
    reasonCodeCounts: facetRecords[0].snapshot.reasonCodeCounts,
  })

  const bodyAfterFacet = await page.locator('body').innerText()
  const digestInputs = await page.evaluate(() => window.__c2DigestInputs)
  const serializedFacetRecords = JSON.stringify(facetRecords)
  const serializedConsole = JSON.stringify(telemetry.consoleMessages)
  assertNoSentinels(bodyAfterFacet, 'DOM')
  assertNoSentinels(facetSummary, 'current-preview')
  assertNoSentinels(serializedFacetRecords, 'IndexedDB')
  assertNoSentinels(JSON.stringify(digestInputs), 'SHA-256-preimages')
  assertNoSentinels(serializedConsole, 'console/logs')
  assert.ok(facetRecords[0].snapshot.safeHashes.every(hash => /^[0-9a-f]{64}$/u.test(hash)))
  record('hostile unique facet sentinels are absent from current preview, DOM, safe hashes/preimages, console/logs, and IndexedDB', {
    facetContainers: facetSentinels.length,
    digestPreimagesInspected: digestInputs.length,
    safeHashesInspected: facetRecords[0].snapshot.safeHashes.length,
  })

  const unrelatedBeforeClear = await dumpOtherDatabases(page)
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Clear preview history' }).click()
  await page.waitForFunction(() => (
    document.activeElement === document.getElementById('standards-interoperability-heading')
  ))
  assert.equal((await readFeatureRecords(page)).length, 0)
  assert.deepEqual(await dumpOtherDatabases(page), unrelatedBeforeClear)
  record('Feature 011 clear is isolated and returns useful focus', {
    untouchedDatabases: Object.keys(unrelatedBeforeClear).sort(),
  })

  await holdFeatureStore(page)
  const addsBeforeConcurrent = await page.evaluate(() => window.__c2FeatureAdds)
  const firstImport = openLineageInput.setInputFiles(facetFile)
  await page.locator('.interoperability-status-pending').first().waitFor()
  const secondImport = openLineageInput.setInputFiles(facetFile)
  await Promise.all([firstImport, secondImport])
  await page.waitForTimeout(100)
  assert.equal(await page.evaluate(() => window.__c2FeatureAdds), addsBeforeConcurrent)
  assert.equal(await page.locator('.interoperability-status-pending').count(), 1)
  await releaseFeatureStore(page)
  await waitForOperation(page, 0)
  await page.waitForFunction(async ({ databaseName, storeName }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    const transaction = database.transaction(storeName, 'readonly')
    const count = await new Promise((resolve, reject) => {
      const request = transaction.objectStore(storeName).count()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
    database.close()
    return count === 1
  }, { databaseName: featureDatabase, storeName: featureStore })
  const concurrentRecords = await readFeatureRecords(page)
  const addsAfterConcurrent = await page.evaluate(() => window.__c2FeatureAdds)
  assert.equal(concurrentRecords.length, 1)
  assert.equal(addsAfterConcurrent - addsBeforeConcurrent, 1)
  assert.equal(await page.locator('.interoperability-history li').count(), 1)
  record('two equivalent imports overlap pending persistence and deterministically record then deduplicate', {
    operations: 2,
    persistedWhileBlocked: 0,
    indexedDbAddCalls: addsAfterConcurrent - addsBeforeConcurrent,
    persistedSnapshots: concurrentRecords.length,
    outcomes: ['recorded', 'deduplicated'],
  })

  const unrelatedBeforeCorruption = await dumpOtherDatabases(page)
  const invalidSentinel = 'C2_INVALID_PERSISTED_RECORD_SENTINEL'
  await addRawFeatureRecord(page, {
    snapshot: { schemaVersion: 999, raw: invalidSentinel },
  })
  await page.reload({ waitUntil: 'networkidle' })
  await openStandardsWorkspace(page, { navigate: false })
  await page.getByText(/Browser persistence is unavailable/).waitFor()
  const historySection = page.locator('section[aria-labelledby="preview-history-heading"]')
  const unavailableHistory = await historySection.innerText()
  assert.match(unavailableHistory, /Preview history is unavailable/)
  assert.doesNotMatch(unavailableHistory, /No interoperability preview history is stored/)
  assert.equal(await page.getByRole('button', { name: 'Clear preview history' }).isDisabled(), true)
  assertNoSentinels(await page.locator('body').innerText(), 'invalid-record-DOM')
  assert.equal((await page.locator('body').innerText()).includes(invalidSentinel), false)
  assert.deepEqual(await dumpOtherDatabases(page), unrelatedBeforeCorruption)

  await openLineageInput.setInputFiles(facetFile)
  await waitForOperation(page, 0)
  const unavailableCurrentStatus = await page.locator('.interoperability-status').first().innerText()
  assert.match(unavailableCurrentStatus, /current in-memory preview remains usable/)
  assert.match(await page.locator('.interoperability-summary').first().innerText(), /ACCEPTED\s+1/)
  record('invalid Feature 011 record yields unavailable history, preserves current preview, and leaves unrelated stores unchanged', {
    status: unavailableCurrentStatus,
    unrelatedDatabases: Object.keys(unrelatedBeforeCorruption).sort(),
  })
  await context.close()

  const regressionTelemetry = { consoleMessages: [], pageErrors: [], requests: [] }
  const regressionContext = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 900 },
  })
  await attachInstrumentation(regressionContext, regressionTelemetry)
  const regressionPage = await regressionContext.newPage()
  await openStandardsWorkspace(regressionPage, { keyboard: true })
  assert.equal(
    await regressionPage.evaluate(() => document.activeElement?.textContent?.trim()),
    'Standards Interoperability',
  )

  const alignmentButton = regressionPage.getByRole('button', {
    name: 'Refresh and retain alignment preview',
  })
  await alignmentButton.focus()
  await regressionPage.keyboard.press('Enter')
  await waitForOperation(regressionPage, 1)
  const alignmentStatus = await regressionPage.locator('.interoperability-status').nth(1).innerText()
  assert.match(alignmentStatus, /0 accepted runtime records/)
  const alignmentStates = await regressionPage.locator('.interoperability-state').allTextContents()
  assert.ok(alignmentStates.includes('missing'))
  assert.ok(alignmentStates.includes('omitted-private'))
  record('keyboard controls and empty telemetry alignment remain available', {
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
  const statementStatus = await regressionPage.locator('.interoperability-status').nth(2).innerText()
  assert.match(statementStatus, /Unsigned Statement validated in memory/)
  assert.match(statementStatus, /not externally verified/)
  const downloadPromise = regressionPage.waitForEvent('download')
  await regressionPage.getByRole('button', { name: 'Download unsigned Statement' }).click()
  const download = await downloadPromise
  await download.saveAs(artifact(download.suggestedFilename()))
  await waitForOperation(regressionPage, 2)
  const statement = JSON.parse(await readFile(artifact(download.suggestedFilename()), 'utf8'))
  assert.equal(statement._type, 'https://in-toto.io/Statement/v1')
  assert.equal(statement.predicate.unsigned, true)
  assert.equal(statement.predicate.externallyVerified, false)
  record('valid unsigned Statement validation and local download remain available', {
    filename: download.suggestedFilename(),
  })

  const regressionInput = regressionPage.locator(
    '.standards-interoperability input[type="file"]',
  ).first()
  await regressionInput.setInputFiles(facetFile)
  await waitForOperation(regressionPage, 0)
  await seedRetentionRecords(regressionPage)
  const changedEvent = {
    ...officialFacetEvent,
    eventTime: '2026-07-24T15:31:00.000Z',
    run: { ...officialFacetEvent.run, runId: '0176a8c2-fe01-7439-87e6-56a1a1b40290' },
  }
  await regressionInput.setInputFiles(
    syntheticJsonFile('synthetic-c2-retention-trigger.json', changedEvent),
  )
  await waitForOperation(regressionPage, 0)
  const retained = await readFeatureRecords(regressionPage)
  const retainedByProfile = Object.fromEntries([
    ...new Set(retained.map(item => item.snapshot.profileId)),
  ].map(profileId => [
    profileId,
    retained.filter(item => item.snapshot.profileId === profileId).length,
  ]))
  assert.deepEqual(retainedByProfile, {
    'openinference-metadata-preview-1': 20,
    'openlineage-run-event-core-1.0.5': 20,
    'otel-genai-metadata-preview-1': 20,
    'sancussight-in-toto-statement-1': 20,
  })
  assert.equal(retained.length, 80)
  record('profile isolation and 20-per-profile retention remain deterministic', {
    total: retained.length,
    retainedByProfile,
  })

  const unrelatedBeforeFinalClear = await dumpOtherDatabases(regressionPage)
  regressionPage.once('dialog', dialog => dialog.accept())
  await regressionPage.getByRole('button', { name: 'Clear preview history' }).click()
  await regressionPage.waitForFunction(() => (
    document.activeElement === document.getElementById('standards-interoperability-heading')
  ))
  assert.equal((await readFeatureRecords(regressionPage)).length, 0)
  assert.deepEqual(await dumpOtherDatabases(regressionPage), unrelatedBeforeFinalClear)

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
      workspaceCount: document.querySelectorAll('.standards-interoperability').length,
      railCount: document.querySelectorAll('.evidence-source-rail').length,
      heading: document.getElementById('standards-interoperability-heading')?.textContent?.trim(),
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
      tableOverflow: (table?.scrollWidth ?? 0) - (table?.clientWidth ?? 0),
      workspaceCount: document.querySelectorAll('.standards-interoperability').length,
      railCount: document.querySelectorAll('.evidence-source-rail').length,
      activeHeading:
        document.getElementById('standards-interoperability-heading')?.textContent?.trim(),
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
  record('effective-200 reload explicitly reopens and measures Standards Interoperability', effective200)
  await cdp.send('Emulation.clearDeviceMetricsOverride')

  const allConsole = [...telemetry.consoleMessages, ...regressionTelemetry.consoleMessages]
  const consoleProblems = allConsole.filter(message => (
    message.type === 'warning' || message.type === 'error'
  ))
  const allPageErrors = [...telemetry.pageErrors, ...regressionTelemetry.pageErrors]
  const allRequests = [...telemetry.requests, ...regressionTelemetry.requests]
  const externalRequests = allRequests.filter(url => {
    const parsed = new URL(url)
    return parsed.protocol !== 'blob:' && parsed.origin !== origin
  })
  assert.deepEqual(consoleProblems, [])
  assert.deepEqual(allPageErrors, [])
  assert.deepEqual(externalRequests, [])
  assertNoSentinels(JSON.stringify(allConsole), 'all-console/logs')
  record('clean console/page errors and loopback same-origin-only traffic', {
    consoleWarningsOrErrors: consoleProblems.length,
    pageErrors: allPageErrors.length,
    requestCount: allRequests.length,
    origins: [...new Set(allRequests.map(url => new URL(url).origin))],
  })
  await regressionContext.close()

  const unavailableTelemetry = { consoleMessages: [], pageErrors: [], requests: [] }
  const unavailableContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  unavailableContext.on('page', unavailablePage => {
    unavailablePage.on('console', message => unavailableTelemetry.consoleMessages.push({
      type: message.type(),
      text: message.text(),
    }))
    unavailablePage.on('pageerror', error => unavailableTelemetry.pageErrors.push(error.message))
    unavailablePage.on('request', request => unavailableTelemetry.requests.push(request.url()))
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
  const unavailableInput = unavailablePage.locator(
    '.standards-interoperability input[type="file"]',
  ).first()
  await unavailableInput.setInputFiles(facetFile)
  await waitForOperation(unavailablePage, 0)
  const unavailableStatus = await unavailablePage.locator(
    '.interoperability-status',
  ).first().innerText()
  assert.match(unavailableStatus, /current in-memory preview remains usable/)
  assert.match(await unavailablePage.locator('.interoperability-summary').first().innerText(), /OMITTED\s+6/)
  await unavailablePage.screenshot({
    path: artifact('indexeddb-unavailable-current-preview.png'),
    fullPage: true,
  })
  record('IndexedDB-unavailable mode preserves the current sanitized result', {
    status: unavailableStatus,
  })
  await unavailableContext.close()

  assert.deepEqual(
    unavailableTelemetry.consoleMessages.filter(message => (
      message.type === 'warning' || message.type === 'error'
    )),
    [],
  )
  assert.deepEqual(unavailableTelemetry.pageErrors, [])
  assert.deepEqual(
    unavailableTelemetry.requests.filter(url => {
      const parsed = new URL(url)
      return parsed.protocol !== 'blob:' && parsed.origin !== origin
    }),
    [],
  )

  await writeFile(
    artifact('browser-matrix-results.json'),
    `${JSON.stringify({
      browser: 'Google Chrome',
      executablePath: chromePath,
      origin,
      fixtureQualification: 'All C2 inputs are explicitly synthetic fixtures; they are not production evidence.',
      matrixScope: 'All four R1 findings, C1 corrections, and fix-caused regressions only.',
      results,
    }, null, 2)}\n`,
    'utf8',
  )
  console.log(JSON.stringify({ passed: results.length, results }, null, 2))
} finally {
  await browser.close()
}
