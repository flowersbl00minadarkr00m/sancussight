async (page) => {
  const fixtureDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T4-browser'
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5R2-hosted'
  const active = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName || '',
    id: document.activeElement?.id || '',
    text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  const text = async (locator) => (await locator.innerText()).toLowerCase()
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
    return text(page.locator('.check-catalog-detail-region'))
  }

  await page.keyboard.press('Control+0')
  const resetCdp = await page.context().newCDPSession(page)
  await resetCdp.send('Emulation.clearDeviceMetricsOverride')
  await resetCdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await page.setViewportSize({ width: 1280, height: 900 })

  await page.getByRole('button', { name: /^Attention/ }).click()
  const search = page.getByRole('searchbox', { name: 'Search checks and current results' })
  await search.fill('candidate.bundle-readiness.v1')
  await page.locator('.check-definition-list button').filter({ hasText: 'candidate.bundle-readiness.v1' }).click()
  await page.waitForTimeout(180)
  const definitionText = await text(page.locator('.check-catalog-detail-region'))

  await selectAsset('Synthetic provider workflow')
  const verifiedText = await openCheck('Every provider-specific dependency names an approved fallback')
  const providerText = await text(page.locator('.check-catalog-detail-region'))
  const listBox = await page.locator('.check-catalog-list-region').boundingBox()
  const detailBox = await page.locator('.check-catalog-detail-region').boundingBox()
  const noPrevious = providerText.includes('no previous result recorded')
  await page.screenshot({ path: `${evidenceDir}/01-provider-result-desktop.png`, fullPage: true })

  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  const passportHeadingBefore = await page.locator('#asset-passport-heading').innerText()
  const passportFocusBefore = await active()
  await openCheck('Every provider-specific dependency names an approved fallback')
  const roundTripId = await page.locator('#check-detail-heading + p').innerText()
  await page.getByRole('button', { name: 'Open Asset Passport' }).click()
  const passportHeadingAfter = await page.locator('#asset-passport-heading').innerText()
  const passportFocusAfter = await active()

  await selectAsset('Synthetic missing evidence target')
  const missingText = await openCheck('Configured evidence binding has an accepted observation')

  await selectAsset('Synthetic accepted risk target')
  const inferredText = await openCheck('Canonical copy is stored in an open, exportable format')

  await page.locator('input[type=file]').nth(1).setInputFiles(`${fixtureDir}/synthetic-evidence-stale.json`)
  await page.waitForTimeout(500)
  await selectAsset('Synthetic lineage target')
  const staleText = await openCheck('Accepted asset retains identity')

  await page.locator('input[type=file]').nth(1).setInputFiles(`${fixtureDir}/synthetic-evidence-conflict.json`)
  await page.waitForTimeout(500)
  await selectAsset('Synthetic lineage target')
  const conflictText = await openCheck('Accepted asset retains identity')

  await page.getByRole('button', { name: /^Attention/ }).click()
  const uncataloged = page.locator('.check-result-list button').filter({ hasText: 'Uncataloged observation' }).first()
  await uncataloged.click()
  const uncatalogedText = await text(page.locator('.check-catalog-detail-region'))
  await page.screenshot({ path: `${evidenceDir}/02-uncataloged-conflict.png`, fullPage: true })

  await page.setViewportSize({ width: 320, height: 800 })
  await page.waitForTimeout(180)
  if (await page.getByRole('button', { name: 'Back to checks' }).count()) {
    await page.getByRole('button', { name: 'Back to checks' }).click()
  }
  const narrowListBefore = await page.locator('.check-catalog-list-region').count()
  const narrowDetailBefore = await page.locator('.check-catalog-detail-region').count()
  await search.fill('candidate.bundle-readiness.v1')
  const narrowTarget = page.locator('.check-definition-list button')
    .filter({ hasText: 'candidate.bundle-readiness.v1' })
  await narrowTarget.click()
  await page.waitForTimeout(220)
  const focusEntry = await active()
  const narrowListAfter = await page.locator('.check-catalog-list-region').count()
  const narrowDetailAfter = await page.locator('.check-catalog-detail-region').count()
  await page.getByRole('button', { name: 'Back to checks' }).click()
  await page.waitForTimeout(220)
  const focusReturn = await active()
  const overflow320 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.check-catalog-workspace')?.getAttribute('data-layout') || '',
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
  await page.waitForTimeout(220)
  const zoom200 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    visualViewportWidth: window.visualViewport?.width,
    visualViewportScale: window.visualViewport?.scale,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    layout: document.querySelector('.check-catalog-workspace')?.getAttribute('data-layout') || '',
  }))
  await page.screenshot({ path: `${evidenceDir}/03-narrow-zoom200.png`, fullPage: true })

  const footer = await page.locator('footer').innerText()
  const footerLinks = await page.locator('footer a').evaluateAll((links) => (
    links.map((link) => ({ text: link.textContent?.trim(), href: link.getAttribute('href') }))
  ))
  const resources = await page.evaluate(() => {
    const urls = performance.getEntriesByType('resource').map((entry) => entry.name)
    return {
      count: urls.length,
      origins: [...new Set(urls.map((url) => new URL(url).origin))],
      unexpectedExternal: urls.filter((url) => new URL(url).origin !== location.origin),
    }
  })

  return {
    definitionOnly: {
      searchable: definitionText.includes('candidate bundle readiness'),
      noResult: definitionText.includes('no result selected'),
      noAssetLineage: definitionText.includes('asset-specific claim lineage is not constructed'),
    },
    nonPassing: {
      exactRule: providerText.includes('pass for a dependency with a recorded fallback; otherwise fail.'),
      remediation: providerText.includes('record and test an approved fallback for every provider-specific dependency.'),
      invalidation: providerText.includes('the result changes when a dependency or its recorded fallback changes.'),
      noPrevious,
    },
    passportRoundTrip: {
      before: passportHeadingBefore,
      beforeFocus: passportFocusBefore,
      checkId: roundTripId,
      after: passportHeadingAfter,
      afterFocus: passportFocusAfter,
    },
    relationships: {
      verified: verifiedText.includes('verified relationship'),
      missing: missingText.includes('missing relationship') && missingText.includes('explicit gaps'),
      inferred: inferredText.includes('inferred relationship') && inferredText.includes('human decision'),
      stale: staleText.includes('stale relationship'),
      conflicting: conflictText.includes('conflicting relationship')
        && conflictText.includes('bounded latest observations conflict'),
    },
    uncataloged: {
      visible: uncatalogedText.includes('uncataloged observation'),
      noInventedRule: uncatalogedText.includes('no stable rule, passing condition, lineage contract, or remediation has been invented'),
      noInventedLineage: uncatalogedText.includes('sancussight has not invented a rule or relationship'),
    },
    desktop: {
      list: listBox,
      detail: detailBox,
      adjacent: Boolean(listBox && detailBox && listBox.x + listBox.width <= detailBox.x + 1),
    },
    narrow: {
      listBefore: narrowListBefore,
      detailBefore: narrowDetailBefore,
      listAfter: narrowListAfter,
      detailAfter: narrowDetailAfter,
      focusEntry,
      focusReturn,
      overflow320,
      zoom200,
    },
    footer: {
      text: footer.trim(),
      links: footerLinks,
    },
    resources,
  }
}
