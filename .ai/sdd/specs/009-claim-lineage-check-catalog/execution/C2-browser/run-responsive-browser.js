async (page) => {
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/C2-browser'
  const activeElement = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName ?? '',
    id: document.activeElement?.id ?? '',
    text: (document.activeElement?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))

  await page.setViewportSize({ width: 320, height: 800 })
  await page.waitForTimeout(220)
  if (await page.locator('.check-result-list').count() === 0) {
    await page.getByRole('button', { name: /^Attention/ }).click()
    await page.waitForTimeout(220)
  }
  if (await page.getByRole('button', { name: 'Back to checks' }).count()) {
    await page.getByRole('button', { name: 'Back to checks' }).click()
  }
  const before = {
    listCount: await page.locator('.check-catalog-list-region').count(),
    detailCount: await page.locator('.check-catalog-detail-region').count(),
  }
  const target = page.locator('.check-result-list button')
    .filter({ hasText: 'evidence.workflow-durability.v1' }).first()
  await target.click()
  await page.waitForTimeout(200)
  const entryFocus = await activeElement()
  const afterSelect = {
    listCount: await page.locator('.check-catalog-list-region').count(),
    detailCount: await page.locator('.check-catalog-detail-region').count(),
  }
  await page.getByRole('button', { name: 'Back to checks' }).click()
  await page.waitForTimeout(200)
  const backFocus = await activeElement()
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
  await page.waitForTimeout(200)
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
  return {
    mutuallyExclusiveDom: before.listCount === 1
      && before.detailCount === 0
      && afterSelect.listCount === 0
      && afterSelect.detailCount === 1,
    before,
    afterSelect,
    entryFocus,
    backFocus,
    focusEntryPassed: entryFocus.tag === 'H2' && entryFocus.id === 'check-detail-heading',
    backRestorationPassed: backFocus.tag === 'BUTTON'
      && backFocus.text.toLowerCase().includes('synthetic sibling workflow'),
    overflow320,
    zoom200,
    resourceBoundary: await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource').map(entry => entry.name)
      return {
        count: entries.length,
        unexpectedExternal: entries.filter(url => new URL(url).origin !== location.origin),
      }
    }),
  }
}
