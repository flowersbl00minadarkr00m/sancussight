async (page) => {
  const origin = 'https://sancussight.vercel.app'
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-hosted'
  const comparisonFixture = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T5-browser/simulated-comparison.json'
  const requests = []
  const consoleMessages = []
  const pageErrors = []
  page.on('request', request => requests.push({
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
  }))
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleMessages.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))

  const active = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName || '',
    id: document.activeElement?.id || '',
    text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  const pageText = async locator => (await locator.innerText()).replace(/\s+/g, ' ').trim()
  const selectAsset = async name => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    const search = page.getByRole('searchbox', { name: 'Search assets' })
    await search.fill(name)
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForTimeout(220)
  }

  const resetCdp = await page.context().newCDPSession(page)
  await resetCdp.send('Emulation.clearDeviceMetricsOverride')
  await resetCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Explore sample' }).click()
  await page.waitForTimeout(250)

  await selectAsset('Voice & context pack')
  const noHistoryText = await pageText(page.locator('.asset-version-history'))
  const noHistoryAssetCount = await page.locator('.asset-version-list > li').count()
  await page.screenshot({ path: `${evidenceDir}/01-hosted-no-history.png`, fullPage: true })

  await page.getByRole('button', { name: 'Record current version' }).click()
  await page.getByText('Current version recorded and selected.', { exact: true }).waitFor()
  const firstRecordText = await pageText(page.locator('.asset-version-history'))
  const firstRecordCount = await page.locator('.asset-version-list > li').count()
  await page.getByRole('button', { name: 'Record current version' }).click()
  await page.getByText('Already recorded. The equivalent current state did not change version history.', { exact: true }).waitFor()
  const dedupeCount = await page.locator('.asset-version-list > li').count()

  await page.getByLabel('Alias label').fill('Preferred')
  await page.getByRole('button', { name: 'Add or move alias' }).click()
  const aliasText = await pageText(page.locator('.asset-version-history'))
  await page.getByRole('button', { name: 'Remove alias Preferred' }).click()
  const aliasRemovalText = await pageText(page.locator('.asset-version-history'))

  const assetExport = page.locator('.asset-version-history .evidence-packet-export')
    .getByRole('button', { name: 'Export Evidence Packet' })
  const [assetDownload] = await Promise.all([
    page.waitForEvent('download'),
    assetExport.click(),
  ])
  const assetSuggestedFilename = assetDownload.suggestedFilename()
  await assetDownload.saveAs(`${evidenceDir}/asset-version-evidence-packet.json`)
  await page.getByText(/Evidence Packet downloaded as sancussight-evidence-packet-asset-version-/).waitFor()
  const assetExportStatus = await pageText(page.locator('.asset-version-history .evidence-packet-status'))

  await page.getByRole('button', { name: 'Exit Drills', exact: true }).click()
  const exitResultText = await pageText(page.locator('.exit-packet-export').locator('..'))
  const exitExport = page.locator('.exit-packet-export')
    .getByRole('button', { name: 'Export Evidence Packet' })
  const [exitDownload] = await Promise.all([
    page.waitForEvent('download'),
    exitExport.click(),
  ])
  const exitSuggestedFilename = exitDownload.suggestedFilename()
  await exitDownload.saveAs(`${evidenceDir}/exit-drill-evidence-packet.json`)
  await page.getByText(/Evidence Packet downloaded as sancussight-evidence-packet-exit-drill-/).waitFor()
  const exitExportStatus = await pageText(page.locator('.exit-packet-export .evidence-packet-status'))

  page.once('dialog', dialog => dialog.accept())
  await page.locator('input[type=file]').first().setInputFiles(comparisonFixture)
  await page.waitForTimeout(400)
  await selectAsset('Simulated comparison fixture')
  const comparisonText = await pageText(page.locator('.asset-version-comparison'))
  const comparisonStates = await page.locator('.asset-version-comparison li strong').allInnerTexts()
  await page.screenshot({ path: `${evidenceDir}/02-hosted-fixture-comparison.png`, fullPage: true })

  await page.setViewportSize({ width: 320, height: 900 })
  await page.waitForTimeout(220)
  const narrowPassportBefore = await page.locator('.asset-passport-region').count()
  const narrowCatalogBefore = await page.locator('.assets-catalog-region').count()
  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForTimeout(180)
  const focusAfterBack = await active()
  const narrowPassportAfterBack = await page.locator('.asset-passport-region').count()
  const narrowCatalogAfterBack = await page.locator('.assets-catalog-region').count()
  await page.getByRole('button', { name: 'Simulated comparison fixture', exact: true }).click()
  await page.waitForTimeout(180)
  const focusOnPassport = await active()
  const overflow320 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.assets-workspace')?.getAttribute('data-layout') || '',
  }))

  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 900,
    screenWidth: 640,
    screenHeight: 1800,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await page.waitForTimeout(220)
  const zoom200 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    visualViewportWidth: window.visualViewport?.width,
    visualViewportScale: window.visualViewport?.scale,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.assets-workspace')?.getAttribute('data-layout') || '',
  }))
  await page.screenshot({ path: `${evidenceDir}/03-hosted-narrow-zoom200.png`, fullPage: true })

  await cdp.send('Emulation.clearDeviceMetricsOverride')
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await page.setViewportSize({ width: 1280, height: 900 })
  const routes = {}
  for (const label of ['Home', 'Assets', 'Exit Drills', 'Attention']) {
    await page.getByRole('button', { name: new RegExp(`^${label}`) }).click()
    await page.waitForTimeout(100)
    routes[label] = {
      hash: await page.evaluate(() => location.hash),
      current: await page.getByRole('button', { name: new RegExp(`^${label}`) }).getAttribute('aria-current'),
      mainHasContent: await page.locator('main').innerText().then(value => value.trim().length > 0),
    }
  }
  await page.getByRole('button', { name: 'Advanced', exact: true }).click()
  await page.getByRole('button', { name: 'Evidence Sources', exact: true }).click()
  await page.waitForTimeout(120)
  routes['Evidence Sources'] = {
    visible: await page.getByRole('heading', { name: /Evidence Sources/i }).count() > 0,
    mainHasContent: await page.locator('main').innerText().then(value => value.trim().length > 0),
  }

  const footerText = (await page.locator('footer').innerText()).trim()
  const footerLinks = await page.locator('footer a').evaluateAll(links => (
    links.map(link => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))
  ))
  const normalizedRequests = requests.filter(request => request.url.startsWith('http'))
  const network = {
    count: normalizedRequests.length,
    origins: [...new Set(normalizedRequests.map(request => new URL(request.url).origin))],
    methods: [...new Set(normalizedRequests.map(request => request.method))],
    unexpectedExternal: normalizedRequests.filter(request => new URL(request.url).origin !== origin),
    nonGet: normalizedRequests.filter(request => request.method !== 'GET'),
  }

  return {
    deploymentOrigin: origin,
    realDemo: {
      noHistory: noHistoryText.includes('No recorded versions.')
        && noHistoryText.includes('Recording is explicit and creates no earlier history.'),
      noHistoryAssetCount,
      firstRecord: firstRecordText.includes('Current version recorded and selected.')
        && firstRecordText.includes('No previous version recorded.'),
      firstRecordCount,
      deduplicated: dedupeCount === firstRecordCount,
      aliasLabelOnly: aliasText.includes('Version aliases are labels only.')
        && aliasText.includes('Alias Preferred now labels the selected recorded version.'),
      aliasRemovedWithoutFactMutation: aliasRemovalText.includes('Alias Preferred removed. Recorded version facts were not changed.'),
    },
    downloads: {
      assetSuggestedFilename,
      assetExportStatus,
      exitSuggestedFilename,
      exitExportStatus,
      exitProjectionOnly: exitResultText.includes('It does not persist or execute an Exit Drill and makes no provider request.'),
    },
    fixtureAssistedComparison: {
      label: 'Fixture-assisted hosted state — simulated comparison, not production data',
      hasRegression: comparisonText.includes('regression:'),
      hasRecovery: comparisonText.includes('recovery:'),
      hasChanged: comparisonText.includes('changed:'),
      hasUnchanged: comparisonText.includes('unchanged:'),
      states: comparisonStates,
    },
    narrow: {
      passportBefore: narrowPassportBefore,
      catalogBefore: narrowCatalogBefore,
      passportAfterBack: narrowPassportAfterBack,
      catalogAfterBack: narrowCatalogAfterBack,
      focusAfterBack,
      focusOnPassport,
      overflow320,
      zoom200,
    },
    routes,
    footer: { text: footerText, links: footerLinks },
    runtime: {
      consoleMessages,
      pageErrors,
      network,
    },
  }
}
