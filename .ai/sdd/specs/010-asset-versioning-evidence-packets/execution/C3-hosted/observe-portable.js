async (page) => {
  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search assets' }).fill('portable skill')
  await page.getByRole('button', { name: 'portable skill', exact: true }).click()
  const text = (await page.locator('.asset-version-history').innerText())
    .replace(/\s+/g, ' ')
    .trim()
  await page.setViewportSize({ width: 320, height: 900 })
  const selected = await page.evaluate(() => ({
    activeText: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    catalogVisible: Boolean(document.querySelector('.assets-catalog-region')),
    passportVisible: Boolean(document.querySelector('.asset-passport-region')),
  }))
  await page.getByRole('button', { name: 'Back to assets' }).click()
  const afterBack = await page.evaluate(() => ({
    activeText: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    catalogVisible: Boolean(document.querySelector('.assets-catalog-region')),
    passportVisible: Boolean(document.querySelector('.asset-passport-region')),
  }))
  await page.setViewportSize({ width: 1280, height: 900 })
  return {
    hasPortableQualification: text.includes('Current portable projection'),
    hasSourcePointer: text.includes('Source recorded version'),
    disclaimsRecordedFacts: text.includes('not the original recorded facts'),
    selected,
    afterBack,
  }
}
