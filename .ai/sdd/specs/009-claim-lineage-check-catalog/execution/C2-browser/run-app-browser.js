async (page) => {
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/C2-browser'
  const fixtureV1 = `${evidenceDir}/synthetic-siblings-v1.json`
  const fixtureV2 = `${evidenceDir}/synthetic-siblings-v2.json`
  const checkCondition = 'Every provider-specific dependency names an approved fallback'
  const expectedFields = [
    'assetId',
    'checkId',
    'evaluatedAt',
    'registryScopeHash',
    'resultDiscriminator',
    'safeEvidenceHash',
    'status',
  ]

  const activeElement = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName ?? '',
    id: document.activeElement?.id ?? '',
    text: (document.activeElement?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  const waitForRecords = async (minimum) => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const records = await readRecords()
      if (records.length >= minimum) return records
      await page.waitForTimeout(100)
    }
    return readRecords()
  }
  const readRecords = () => page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sancussight-check-history')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('snapshots', 'readonly')
    const store = transaction.objectStore('snapshots')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })
  const providerRecords = records => records.filter(record => (
    record.assetId === 'asset-c2-siblings'
    && record.checkId === 'portability.provider-fallback.v1'
  ))
  const streamCounts = records => Object.fromEntries(
    [...new Set(providerRecords(records).map(record => record.resultDiscriminator).filter(Boolean))]
      .map(discriminator => [
        discriminator,
        providerRecords(records).filter(record => record.resultDiscriminator === discriminator).length,
      ]),
  )
  const importFixture = async (path, replace) => {
    await page.locator('input[type=file]').first().setInputFiles(path)
    await page.waitForSelector('.workspace-shell')
    await page.waitForTimeout(500)
  }
  const selectAsset = async () => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    const search = page.getByRole('searchbox', { name: 'Search assets' })
    await search.fill('Synthetic sibling workflow')
    await page.getByRole('button', { name: 'Synthetic sibling workflow', exact: true }).click()
    await page.waitForTimeout(180)
  }
  const openSibling = async capability => {
    const item = page.locator('.signal-list > li')
      .filter({ hasText: checkCondition })
      .filter({ hasText: capability })
      .first()
    const rowText = await item.innerText()
    await item.getByRole('button', { name: 'Open check explanation' }).click()
    await page.waitForTimeout(250)
    return {
      rowText,
      detailText: await page.locator('.check-catalog-detail-region').innerText(),
      focus: await activeElement(),
    }
  }

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.evaluate(() => {
    window.confirm = () => true
  })
  await page.evaluate(() => new Promise(resolve => {
    const request = indexedDB.deleteDatabase('sancussight-check-history')
    request.onsuccess = request.onerror = request.onblocked = () => resolve(undefined)
  }))
  await importFixture(fixtureV1, false)
  const initialRecords = await waitForRecords(2)
  const initialProviderRecords = providerRecords(initialRecords)
  const initialFieldSets = [...new Set(initialProviderRecords.map(record => Object.keys(record).sort().join(',')))]
  const initialCounts = streamCounts(initialRecords)

  await selectAsset()
  const siblingRows = await page.locator('.signal-list > li')
    .filter({ hasText: checkCondition }).allInnerTexts()
  const chatInitial = await openSibling('(chat)')
  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(180)
  const embeddingsInitial = await openSibling('embeddings')
  const initialDiscriminators = [
    ...new Set(initialProviderRecords.map(record => record.resultDiscriminator)),
  ]
  await page.screenshot({ path: `${evidenceDir}/02-sibling-results-initial.png`, fullPage: true })

  await importFixture(fixtureV1, true)
  const repeatedRecords = await waitForRecords(initialRecords.length)
  const repeatedCounts = streamCounts(repeatedRecords)

  await importFixture(fixtureV2, true)
  const changedRecords = await waitForRecords(repeatedRecords.length + 1)
  const changedCounts = streamCounts(changedRecords)
  await selectAsset()
  const embeddingsChanged = await openSibling('embeddings')
  const changedCurrentSection = await page.locator('.check-detail-section')
    .filter({ hasText: 'Current result' }).innerText()
  const changedPreviousSection = await page.locator('.check-detail-section')
    .filter({ hasText: 'Previous result' }).innerText()
  await page.screenshot({ path: `${evidenceDir}/03-sibling-changed-history.png`, fullPage: true })

  const validProviderRecord = providerRecords(changedRecords)[0]
  await page.evaluate(async legacy => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sancussight-check-history')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('snapshots', 'readwrite')
    transaction.objectStore('snapshots').add(legacy)
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined)
      transaction.onerror = transaction.onabort = () => reject(transaction.error)
    })
  }, {
    registryScopeHash: validProviderRecord.registryScopeHash,
    assetId: 'asset-c2-siblings',
    checkId: 'portability.provider-fallback.v1',
    status: 'warn',
    evaluatedAt: '2026-07-01T00:00:00.000Z',
    safeEvidenceHash: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  })
  const recordsWithLegacy = await readRecords()
  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(150)
  const chatAfterLegacy = await openSibling('(chat)')
  const chatPreviousSection = await page.locator('.check-detail-section')
    .filter({ hasText: 'Previous result' }).innerText()

  const listBox = await page.locator('.check-catalog-list-region').boundingBox()
  const detailBox = await page.locator('.check-catalog-detail-region').boundingBox()
  const desktopGeometry = {
    list: listBox,
    detail: detailBox,
    adjacent: Boolean(listBox && detailBox && listBox.x + listBox.width <= detailBox.x + 1),
  }

  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(150)
  const passportEntryFocus = await activeElement()
  const passportHeading = await page.locator('#asset-passport-heading').innerText()
  const embeddingsRoundTrip = await openSibling('embeddings')
  const checkEntryFocus = await activeElement()
  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(150)
  const passportReturnFocus = await activeElement()

  await page.getByRole('button', { name: /^Attention/ }).click()
  await page.waitForTimeout(120)
  await page.getByRole('button', { name: 'Clear history' }).click()
  await page.waitForTimeout(250)
  const clearNotice = await page.locator('.check-catalog-workspace').innerText()
  const recordsAfterClear = await readRecords()

  const coreCurrentRows = providerRecords(recordsWithLegacy).filter(record => record.resultDiscriminator)
  const coreLegacyRows = providerRecords(recordsWithLegacy).filter(record => !record.resultDiscriminator)
  const coreForbiddenFields = [
    'registry',
    'evidence',
    'finding',
    'displayCopy',
    'path',
    'prompt',
    'response',
    'credential',
    'scopePreimage',
    'evidencePreimage',
  ]
  return {
    siblingIdentity: {
      rowCount: siblingRows.length,
      rowTexts: siblingRows,
      initialDiscriminators,
      discriminatorsDistinct: initialDiscriminators.length === 2,
      chatIdentityVisible: chatInitial.detailText.includes('asset-c2-siblings:dep-primary-cloud-chat'),
      embeddingsIdentityVisible: embeddingsInitial.detailText.includes('asset-c2-siblings:dep-primary-cloud-embeddings'),
    },
    independentHistory: {
      initialCounts,
      repeatedCounts,
      identicalRepeatDeduped: JSON.stringify(initialCounts) === JSON.stringify(repeatedCounts),
      changedCounts,
      exactlyOneStreamChanged: Object.entries(changedCounts).filter(([key, count]) => (
        count !== initialCounts[key]
      )).length === 1,
      changedCurrentPass: changedCurrentSection.toLowerCase().includes('pass'),
      changedPreviousFail: changedPreviousSection.toLowerCase().includes('fail'),
      unchangedSiblingNoPrevious: chatPreviousSection.toLowerCase().includes('no previous result recorded'),
    },
    storage: {
      expectedFields,
      initialFieldSets,
      currentRowsCount: coreCurrentRows.length,
      currentRowsExactAllowlist: coreCurrentRows.every(record => (
        JSON.stringify(Object.keys(record).sort()) === JSON.stringify(expectedFields)
      )),
      currentRowsForbiddenFieldsAbsent: coreCurrentRows.every(record => (
        coreForbiddenFields.every(field => !(field in record))
      )),
      legacyRowsPhysicallyPresent: coreLegacyRows.length === 1,
      legacyFieldSets: coreLegacyRows.map(record => Object.keys(record).sort()),
    },
    regressions: {
      desktopGeometry,
      passportRoundTrip: {
        heading: passportHeading,
        entryFocus: passportEntryFocus,
        checkFocus: checkEntryFocus,
        returnFocus: passportReturnFocus,
        selectedEmbeddings: embeddingsRoundTrip.detailText.toLowerCase().includes('embeddings'),
      },
      clearHistory: {
        noticeVisible: clearNotice.includes('Local check-result history cleared. Current results remain available.'),
        physicalRecordCountAfterClear: recordsAfterClear.length,
        currentResultStillUsable: clearNotice.includes('Current result'),
      },
    },
  }

  await page.setViewportSize({ width: 320, height: 800 })
  await page.waitForTimeout(180)
  if (await page.getByRole('button', { name: 'Back to checks' }).count()) {
    await page.getByRole('button', { name: 'Back to checks' }).click()
  }
  const narrowBefore = {
    listCount: await page.locator('.check-catalog-list-region').count(),
    detailCount: await page.locator('.check-catalog-detail-region').count(),
  }
  const narrowTarget = page.locator('.check-definition-list button')
    .filter({ hasText: 'portability.provider-fallback.v1' }).first()
  await narrowTarget.click()
  await page.waitForTimeout(180)
  const narrowEntryFocus = await activeElement()
  const narrowAfterSelect = {
    listCount: await page.locator('.check-catalog-list-region').count(),
    detailCount: await page.locator('.check-catalog-detail-region').count(),
  }
  await page.getByRole('button', { name: 'Back to checks' }).click()
  await page.waitForTimeout(180)
  const narrowBackFocus = await activeElement()
  const overflow320 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))

  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 800,
    screenWidth: 640,
    screenHeight: 1600,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await page.waitForTimeout(180)
  const zoom200 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    visualViewportWidth: window.visualViewport?.width,
    visualViewportScale: window.visualViewport?.scale,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.check-catalog-workspace')?.getAttribute('data-layout'),
  }))
  await page.screenshot({ path: `${evidenceDir}/04-narrow-zoom200.png`, fullPage: true })

  const currentRows = providerRecords(recordsWithLegacy).filter(record => record.resultDiscriminator)
  const legacyRows = providerRecords(recordsWithLegacy).filter(record => !record.resultDiscriminator)
  const forbiddenFields = [
    'registry',
    'evidence',
    'finding',
    'displayCopy',
    'path',
    'prompt',
    'response',
    'credential',
    'scopePreimage',
    'evidencePreimage',
  ]
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource').map(entry => entry.name)
    return {
      count: entries.length,
      unexpectedExternal: entries.filter(url => new URL(url).origin !== location.origin),
    }
  })

  return {
    siblingIdentity: {
      rowCount: siblingRows.length,
      rowTexts: siblingRows,
      initialDiscriminators,
      discriminatorsDistinct: initialDiscriminators.length === 2,
      chatInitial,
      embeddingsInitial,
    },
    independentHistory: {
      initialCounts,
      repeatedCounts,
      identicalRepeatDeduped: JSON.stringify(initialCounts) === JSON.stringify(repeatedCounts),
      changedCounts,
      exactlyOneStreamChanged: Object.entries(changedCounts).filter(([key, count]) => (
        count !== initialCounts[key]
      )).length === 1,
      changedCurrentPass: changedCurrentSection.toLowerCase().includes('pass'),
      changedPreviousFail: changedPreviousSection.toLowerCase().includes('fail'),
      unchangedSiblingNoPrevious: chatPreviousSection.toLowerCase().includes('no previous result recorded'),
      embeddingsChanged,
      chatAfterLegacy,
    },
    storage: {
      expectedFields,
      initialFieldSets,
      currentRowsCount: currentRows.length,
      currentRowsExactAllowlist: currentRows.every(record => (
        JSON.stringify(Object.keys(record).sort()) === JSON.stringify(expectedFields)
      )),
      currentRowsForbiddenFieldsAbsent: currentRows.every(record => (
        forbiddenFields.every(field => !(field in record))
      )),
      legacyRowsPhysicallyPresent: legacyRows.length === 1,
      legacyFieldSets: legacyRows.map(record => Object.keys(record).sort()),
    },
    regressions: {
      desktopGeometry,
      passportRoundTrip: {
        heading: passportHeading,
        entryFocus: passportEntryFocus,
        checkFocus: checkEntryFocus,
        returnFocus: passportReturnFocus,
        selectedEmbeddings: embeddingsRoundTrip.detailText.toLowerCase().includes('embeddings'),
      },
      clearHistory: {
        noticeVisible: clearNotice.includes('Local check-result history cleared. Current results remain available.'),
        physicalRecordCountAfterClear: recordsAfterClear.length,
        currentResultStillUsable: clearNotice.includes('Current result'),
      },
      narrow: {
        before: narrowBefore,
        afterSelect: narrowAfterSelect,
        entryFocus: narrowEntryFocus,
        backFocus: narrowBackFocus,
        overflow320,
        zoom200,
      },
    },
    resources,
  }
}
