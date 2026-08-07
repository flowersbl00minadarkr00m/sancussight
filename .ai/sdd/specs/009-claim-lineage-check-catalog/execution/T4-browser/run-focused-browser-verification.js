async (page) => {
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T4-browser'
  const lowerText = async (locator) => (await locator.innerText()).toLowerCase()
  const active = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id || '',
    text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  const selectAsset = async (name) => {
    await page.getByRole('button', { name: 'Assets', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Search assets' }).fill(name)
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForTimeout(220)
  }
  const openCheck = async (condition) => {
    await page.locator('.signal-list > li').filter({ hasText: condition }).first()
      .getByRole('button', { name: 'Open check explanation' }).click()
    await page.waitForTimeout(220)
    return lowerText(page.locator('.check-catalog-detail-region'))
  }

  await page.keyboard.press('Control+0')
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: /^Attention/ }).click()
  if (await page.getByRole('button', { name: 'Back to checks' }).count()) {
    await page.getByRole('button', { name: 'Back to checks' }).click()
  }
  const search = page.getByRole('searchbox', { name: 'Search checks and current results' })
  await search.fill('candidate.bundle-readiness.v1')
  await page.locator('.check-definition-list button').filter({ hasText: 'candidate.bundle-readiness.v1' }).click()
  await page.waitForTimeout(180)
  const definitionText = await lowerText(page.locator('.check-catalog-detail-region'))

  await selectAsset('Synthetic provider workflow')
  const verifiedText = await openCheck('Every provider-specific dependency names an approved fallback')

  await selectAsset('Synthetic missing evidence target')
  const missingText = await openCheck('Configured evidence binding has an accepted observation')

  await selectAsset('Synthetic accepted risk target')
  const inferredText = await openCheck('Canonical copy is stored in an open, exportable format')

  await page.locator('input[type=file]').nth(1).setInputFiles(`${evidenceDir}/synthetic-evidence-stale.json`)
  await page.waitForTimeout(500)
  await selectAsset('Synthetic lineage target')
  const staleText = await openCheck('Accepted asset retains identity')

  await page.locator('input[type=file]').nth(1).setInputFiles(`${evidenceDir}/synthetic-evidence-conflict.json`)
  await page.waitForTimeout(500)
  await selectAsset('Synthetic lineage target')
  const conflictText = await openCheck('Accepted asset retains identity')

  await page.getByRole('button', { name: /^Attention/ }).click()
  await page.setViewportSize({ width: 320, height: 800 })
  if (await page.getByRole('button', { name: 'Back to checks' }).count()) {
    await page.getByRole('button', { name: 'Back to checks' }).click()
  }
  await search.fill('candidate.bundle-readiness.v1')
  const narrowTarget = page.locator('.check-definition-list button').filter({ hasText: 'candidate.bundle-readiness.v1' })
  await narrowTarget.click()
  await page.waitForTimeout(250)
  const focusEntry = await active()
  await page.getByRole('button', { name: 'Back to checks' }).click()
  await page.waitForTimeout(700)
  const focusReturn = await active()
  const selectedRowText = await page.locator('button[aria-current=true]').innerText()

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
  await page.waitForTimeout(200)
  const zoom = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    visualViewportWidth: window.visualViewport?.width,
    visualViewportScale: window.visualViewport?.scale,
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.check-catalog-workspace')?.getAttribute('data-layout'),
  }))
  await page.screenshot({ path: `${evidenceDir}/09-chromium-zoom-200.png`, fullPage: true })

  return {
    definitionOnly: {
      noCurrentResultDefinition: definitionText.includes('no current result'),
      noResultSelected: definitionText.includes('no result selected'),
      noAssetLineage: definitionText.includes('asset-specific claim lineage is not constructed'),
    },
    relationships: {
      verified: verifiedText.includes('verified relationship'),
      missing: missingText.includes('missing relationship') && missingText.includes('explicit gaps'),
      inferred: inferredText.includes('inferred relationship') && inferredText.includes('human decision'),
      stale: staleText.includes('stale relationship'),
      conflicting: conflictText.includes('conflicting relationship') && conflictText.includes('bounded latest observations conflict'),
    },
    focus: {
      entry: focusEntry,
      return: focusReturn,
      returnedToSelectedRow: focusReturn.tag === 'BUTTON'
        && focusReturn.text.toLowerCase().includes('candidate bundle readiness'),
      selectedRowText,
    },
    zoom200: zoom,
  }
}
