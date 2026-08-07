async (page) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: undefined,
    })
  })
  await page.goto('https://sancussight.vercel.app')
  await page.getByRole('link', { name: 'Explore sample' }).click()
  await page.getByRole('button', { name: /^Attention/ }).click()
  await page.locator('.check-result-list button')
    .filter({ hasText: 'portability.provider-fallback.v1' }).first().click()
  await page.waitForTimeout(250)
  const detail = await page.locator('.check-catalog-detail-region').innerText()
  await page.screenshot({
    path: 'C:/Users/henry/sancussight/.ai/sdd/specs/009-claim-lineage-check-catalog/execution/T5R2-hosted/04-history-unavailable.png',
    fullPage: true,
  })
  return {
    indexedDbRemovedBeforeLoad: await page.evaluate(() => globalThis.indexedDB === undefined),
    exactNotice: detail.includes('Local history unavailable. The current result remains usable.'),
    currentResultUsable: detail.includes('Provider dependency fallback')
      && detail.includes('Current result')
      && detail.includes('Open Asset Passport'),
    noPreviousFabrication: !detail.includes('Previous distinct result'),
    url: page.url(),
  }
}
