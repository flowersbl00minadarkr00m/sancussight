async (page) => {
  await page.setViewportSize({ width: 320, height: 900 })
  const catalog = page.locator('.assets-catalog-region')
  const passport = page.locator('.asset-passport-region')
  const selected = {
    catalogVisible: await catalog.isVisible(),
    passportVisible: await passport.isVisible(),
    focus: await page.evaluate(() => ({
      tag: document.activeElement?.tagName || '',
      text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    })),
    width: await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    })),
  }
  await page.getByRole('button', { name: 'Back to assets' }).click()
  const backed = {
    catalogVisible: await catalog.isVisible(),
    passportVisible: await passport.isVisible(),
    focus: await page.evaluate(() => ({
      tag: document.activeElement?.tagName || '',
      text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' '),
    })),
    width: await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    })),
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  return { selected, backed }
}
