async (page) => {
  const active = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName || '',
    id: document.activeElement?.id || '',
    text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search assets' }).fill('Simulated comparison fixture')
  await page.setViewportSize({ width: 320, height: 900 })
  await page.waitForTimeout(160)
  await page.getByRole('button', { name: 'Simulated comparison fixture', exact: true }).click()
  await page.waitForTimeout(120)
  const comparisonStates = (await page.locator('.asset-version-comparison li strong').allInnerTexts())
    .map(value => value.toLowerCase())
  const selected = {
    catalogVisible: await page.locator('.assets-catalog-region').isVisible(),
    passportVisible: await page.locator('.asset-passport-region').isVisible(),
    focus: await active(),
  }
  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForTimeout(120)
  const backed = {
    catalogVisible: await page.locator('.assets-catalog-region').isVisible(),
    passportVisible: await page.locator('.asset-passport-region').isVisible(),
    focus: await active(),
  }
  await page.getByRole('button', { name: 'Simulated comparison fixture', exact: true }).click()
  await page.waitForTimeout(120)
  const reentered = {
    catalogVisible: await page.locator('.assets-catalog-region').isVisible(),
    passportVisible: await page.locator('.asset-passport-region').isVisible(),
    focus: await active(),
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: 'Advanced', exact: true }).click()
  await page.getByRole('button', { name: 'Evidence Sources', exact: true }).click()
  await page.waitForTimeout(100)
  return {
    fixtureAssistedComparison: {
      label: 'Fixture-assisted hosted state — simulated comparison, not production data',
      regression: comparisonStates.some(value => value.startsWith('regression:')),
      recovery: comparisonStates.some(value => value.startsWith('recovery:')),
      changed: comparisonStates.some(value => value.startsWith('changed:')),
      unchanged: comparisonStates.some(value => value.startsWith('unchanged:')),
      states: comparisonStates,
    },
    narrowVisibility: { selected, backed, reentered },
    evidenceSourcesVisible: await page.locator('[aria-label="Evidence sources"]').isVisible(),
    footer: {
      text: (await page.locator('footer').innerText()).trim(),
      links: await page.locator('footer a').evaluateAll(links => links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
      }))),
    },
  }
}
