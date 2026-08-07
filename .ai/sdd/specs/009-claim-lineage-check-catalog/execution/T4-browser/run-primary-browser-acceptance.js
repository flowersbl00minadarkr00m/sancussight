async (page) => {
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T4-browser'
  const observations = {}
  await page.keyboard.press('Control+0')

  const bodyText = () => page.locator('body').innerText()
  const activeElement = () => page.evaluate(() => {
    const active = document.activeElement
    return active
      ? {
          tag: active.tagName,
          id: active.id,
          text: (active.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
        }
      : null
  })
  const selectAsset = async (name) => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    const search = page.getByRole('searchbox', { name: 'Search assets' })
    await search.fill(name)
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForTimeout(250)
  }
  const openPassportCheck = async (conditionText) => {
    const item = page.locator('.signal-list > li').filter({ hasText: conditionText }).first()
    await item.getByRole('button', { name: 'Open check explanation' }).click()
    await page.waitForTimeout(250)
  }
  const openAttention = async () => {
    await page.getByRole('button', { name: /^Attention/ }).click()
    await page.waitForTimeout(200)
  }
  const readHistoryRecords = async () => page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sancussight-check-history')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = database.transaction('snapshots', 'readonly')
    const store = transaction.objectStore('snapshots')
    const values = await new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const keys = await new Promise((resolve, reject) => {
      const request = store.getAllKeys()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return {
      database: database.name,
      version: database.version,
      store: store.name,
      keyPath: store.keyPath,
      autoIncrement: store.autoIncrement,
      count: values.length,
      keyTypes: [...new Set(keys.map((key) => typeof key))],
      fieldSets: [...new Set(values.map((value) => Object.keys(value).sort().join(',')))],
      forbiddenFieldNamesPresent: values.some((value) => Object.keys(value).some((key) => (
        ['registry', 'evidence', 'finding', 'prompt', 'response', 'credential', 'path', 'scopePreimage', 'evidencePreimage'].includes(key)
      ))),
      reviewStreamCount: values.filter((value) => (
        value.assetId === 'asset-review' && value.checkId === 'asset.review-freshness.v1'
      )).length,
    }
  })

  await page.setViewportSize({ width: 1280, height: 900 })
  await openAttention()

  const search = page.getByRole('searchbox', { name: 'Search checks and current results' })
  await search.fill('asset.named-owner.v1')
  await page.locator('.check-definition-list button').filter({ hasText: 'asset.named-owner.v1' }).click()
  await page.waitForTimeout(150)
  const definitionText = await page.locator('.check-catalog-detail-region').innerText()
  observations.definitionOnly = {
    heading: await page.locator('#check-detail-heading').innerText(),
    noResultSelected: definitionText.includes('No result selected'),
    stableIdVisible: definitionText.includes('asset.named-owner.v1'),
    lineageNotConstructed: definitionText.includes('Asset-specific claim lineage is not constructed'),
  }
  await page.screenshot({ path: `${evidenceDir}/01-definition-only.png`, fullPage: true })

  await search.fill('')
  const providerResult = page.locator('.check-result-list button').filter({
    hasText: 'portability.provider-fallback.v1',
  }).first()
  await providerResult.click()
  await page.waitForTimeout(150)
  const providerText = await page.locator('.check-catalog-detail-region').innerText()
  const listBox = await page.locator('.check-catalog-list-region').boundingBox()
  const detailBox = await page.locator('.check-catalog-detail-region').boundingBox()
  observations.nonPassingResult = {
    exactRule: providerText.includes('Pass for a dependency with a recorded fallback; otherwise fail.'),
    remediation: providerText.includes('Record and test an approved fallback for every provider-specific dependency.'),
    invalidation: providerText.includes('The result changes when a dependency or its recorded fallback changes.'),
    verifiedRelationship: providerText.includes('Verified relationship'),
  }
  observations.desktopGeometry = {
    viewport: { width: 1280, height: 900 },
    list: listBox,
    detail: detailBox,
    adjacent: Boolean(listBox && detailBox && listBox.x + listBox.width <= detailBox.x + 1),
  }
  await page.screenshot({ path: `${evidenceDir}/02-provider-result-desktop.png`, fullPage: true })

  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(200)
  const passportFocus = await activeElement()
  const passportHeading = await page.locator('#asset-passport-heading').innerText()
  await openPassportCheck('Every provider-specific dependency names an approved fallback')
  const roundTripCheckId = await page.locator('#check-detail-heading + p').innerText()
  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.waitForTimeout(200)
  observations.passportRoundTrip = {
    firstPassportHeading: passportHeading,
    firstPassportFocus: passportFocus,
    selectedCheckId: roundTripCheckId,
    finalPassportHeading: await page.locator('#asset-passport-heading').innerText(),
    finalFocus: await activeElement(),
  }

  await selectAsset('Synthetic review target')
  await openPassportCheck('Reviewed by a human within')
  const previousBefore = await page.locator('.check-detail-section').filter({ hasText: 'Previous result' }).innerText()
  observations.historyBeforeChange = {
    noPrevious: previousBefore.includes('No previous result recorded'),
  }
  await page.screenshot({ path: `${evidenceDir}/03-no-previous-result.png`, fullPage: true })

  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  await page.getByRole('button', { name: 'Record review today' }).click()
  await page.waitForTimeout(700)
  const reviewItem = page.locator('.signal-list > li').filter({ hasText: 'Reviewed by a human within' }).first()
  const reviewStatusAfter = await reviewItem.locator('.status-badge').innerText()
  await reviewItem.getByRole('button', { name: 'Open check explanation' }).click()
  await page.waitForTimeout(450)
  const previousAfter = await page.locator('.check-detail-section').filter({ hasText: 'Previous result' }).innerText()
  observations.historyAfterChange = {
    currentStatus: reviewStatusAfter,
    previousWarnVisible: previousAfter.includes('WARN'),
    previousTimeVisible: previousAfter.includes('2026-01-01'),
  }
  await page.screenshot({ path: `${evidenceDir}/04-changed-result-previous.png`, fullPage: true })

  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  const beforeRepeat = await readHistoryRecords()
  await page.getByRole('button', { name: 'Record review today' }).click()
  await page.waitForTimeout(700)
  const afterRepeat = await readHistoryRecords()
  observations.identicalDedupe = {
    beforeStreamCount: beforeRepeat.reviewStreamCount,
    afterStreamCount: afterRepeat.reviewStreamCount,
    deduped: beforeRepeat.reviewStreamCount === afterRepeat.reviewStreamCount,
  }
  observations.indexedDb = afterRepeat

  await selectAsset('Synthetic missing evidence target')
  await openPassportCheck('Configured evidence binding has an accepted observation')
  const missingText = await page.locator('.check-catalog-detail-region').innerText()
  observations.missingRelationship = {
    visible: missingText.includes('Missing relationship'),
    explicitGap: missingText.includes('Explicit gaps'),
  }

  await selectAsset('Synthetic accepted risk target')
  await openPassportCheck('Canonical copy is stored in an open, exportable format')
  const inferredText = await page.locator('.check-catalog-detail-region').innerText()
  observations.inferredRelationship = {
    visible: inferredText.includes('Inferred relationship'),
    humanDecision: inferredText.includes('Human decision'),
  }

  await selectAsset('Synthetic lineage target')
  await openPassportCheck('Accepted asset retains identity')
  const staleText = await page.locator('.check-catalog-detail-region').innerText()
  observations.staleRelationship = {
    visible: staleText.includes('Stale relationship'),
    sourceQualification: staleText.includes('Retained evidence whose source or freshness is no longer current'),
  }
  await page.screenshot({ path: `${evidenceDir}/05-stale-lineage.png`, fullPage: true })

  await page.locator('input[type=file]').nth(1).setInputFiles(`${evidenceDir}/synthetic-evidence-conflict.json`)
  await page.waitForTimeout(650)
  await selectAsset('Synthetic lineage target')
  await openPassportCheck('Accepted asset retains identity')
  const conflictText = await page.locator('.check-catalog-detail-region').innerText()
  observations.conflictingRelationship = {
    visible: conflictText.includes('Conflicting relationship'),
    explicitGap: conflictText.includes('The bounded latest observations conflict'),
  }
  await page.screenshot({ path: `${evidenceDir}/06-conflicting-lineage.png`, fullPage: true })

  await openAttention()
  const uncatalogedButton = page.locator('.check-result-list button').filter({ hasText: 'Uncataloged observation' }).first()
  await uncatalogedButton.click()
  const uncatalogedText = await page.locator('.check-catalog-detail-region').innerText()
  observations.uncatalogedObservation = {
    visible: uncatalogedText.includes('Uncataloged observation'),
    noInventedRule: uncatalogedText.includes('No stable rule, passing condition, lineage contract, or remediation has been invented'),
    noInventedLineage: uncatalogedText.includes('SancusSight has not invented a rule or relationship'),
  }
  await page.screenshot({ path: `${evidenceDir}/07-uncataloged-observation.png`, fullPage: true })

  await page.setViewportSize({ width: 320, height: 800 })
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'Back to checks' }).click()
  const narrowListCount = await page.locator('.check-catalog-list-region').count()
  const narrowDetailCountBefore = await page.locator('.check-catalog-detail-region').count()
  const narrowTarget = page.locator('.check-definition-list button').first()
  const narrowTargetText = (await narrowTarget.innerText()).replace(/\s+/g, ' ').slice(0, 160)
  await narrowTarget.click()
  await page.waitForTimeout(180)
  const detailFocus = await activeElement()
  const narrowListAfterSelect = await page.locator('.check-catalog-list-region').count()
  const narrowDetailAfterSelect = await page.locator('.check-catalog-detail-region').count()
  await page.getByRole('button', { name: 'Back to checks' }).click()
  await page.waitForTimeout(180)
  const backFocus = await activeElement()
  const overflow320 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))

  await page.setViewportSize({ width: 640, height: 900 })
  await page.keyboard.press('Control++')
  await page.keyboard.press('Control++')
  await page.keyboard.press('Control++')
  await page.keyboard.press('Control++')
  await page.keyboard.press('Control++')
  await page.waitForTimeout(250)
  const zoom200 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    outerWidth: window.outerWidth,
    devicePixelRatio: window.devicePixelRatio,
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.check-catalog-workspace')?.getAttribute('data-layout'),
  }))
  observations.narrowAccessibility = {
    initialListCount: narrowListCount,
    initialDetailCount: narrowDetailCountBefore,
    afterSelectListCount: narrowListAfterSelect,
    afterSelectDetailCount: narrowDetailAfterSelect,
    selected: narrowTargetText,
    detailFocus,
    backFocus,
    overflow320,
    zoom200,
  }
  await page.screenshot({ path: `${evidenceDir}/08-narrow-320-zoom200.png`, fullPage: true })

  observations.resourceRequests = await page.evaluate(() => {
    const requests = performance.getEntriesByType('resource').map((entry) => entry.name)
    return {
      count: requests.length,
      origins: [...new Set(requests.map((url) => new globalThis.URL(url).origin))],
      unexpectedExternal: requests.filter((url) => new globalThis.URL(url).origin !== location.origin),
    }
  })
  observations.finalFocus = await activeElement()
  observations.bodyContainsRawSensitiveSentinel = (await bodyText()).includes('RAW_')

  return observations
}
