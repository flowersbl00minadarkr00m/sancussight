async (page) => {
  const origin = 'https://sancussight.vercel.app'
  const evidenceDir = 'C:/Users/henry/sancussight/.ai/sdd/specs/010-asset-versioning-evidence-packets/execution/T6-hosted'
  const requests = []
  const consoleMessages = []
  const pageErrors = []
  page.on('request', request => requests.push({ method: request.method(), url: request.url() }))
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', error => pageErrors.push(error.message))
  const active = () => page.evaluate(() => ({
    tag: document.activeElement?.tagName || '',
    id: document.activeElement?.id || '',
    text: (document.activeElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }))
  const text = async locator => (await locator.innerText()).replace(/\s+/g, ' ').trim()

  await page.getByRole('button', { name: 'Assets', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search assets' }).fill('Simulated comparison fixture')
  await page.getByRole('button', { name: 'Simulated comparison fixture', exact: true }).click()
  await page.waitForTimeout(180)
  const comparison = await text(page.locator('.asset-version-comparison'))
  const states = await page.locator('.asset-version-comparison li strong').allInnerTexts()
  await page.screenshot({ path: `${evidenceDir}/02-hosted-fixture-comparison.png`, fullPage: true })

  await page.setViewportSize({ width: 320, height: 900 })
  await page.waitForTimeout(180)
  const before = {
    passport: await page.locator('.asset-passport-region').count(),
    catalog: await page.locator('.assets-catalog-region').count(),
  }
  await page.getByRole('button', { name: 'Back to assets' }).click()
  await page.waitForTimeout(140)
  const afterBack = {
    passport: await page.locator('.asset-passport-region').count(),
    catalog: await page.locator('.assets-catalog-region').count(),
    focus: await active(),
  }
  await page.getByRole('button', { name: 'Simulated comparison fixture', exact: true }).click()
  await page.waitForTimeout(140)
  const focusOnPassport = await active()
  const overflow320 = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
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
  await page.waitForTimeout(180)
  const zoom200 = await page.evaluate(() => ({
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
    const button = page.getByRole('button', { name: new RegExp(`^${label}`) })
    await button.click()
    await page.waitForTimeout(80)
    routes[label] = {
      current: await button.getAttribute('aria-current'),
      mainHasContent: (await page.locator('main').innerText()).trim().length > 0,
    }
  }
  await page.getByRole('button', { name: 'Advanced', exact: true }).click()
  await page.getByRole('button', { name: 'Evidence Sources', exact: true }).click()
  await page.waitForTimeout(100)
  routes['Evidence Sources'] = {
    visible: await page.getByText('Evidence Sources', { exact: true }).count() > 0,
    mainHasContent: (await page.locator('main').innerText()).trim().length > 0,
  }
  const footer = {
    text: (await page.locator('footer').innerText()).trim(),
    links: await page.locator('footer a').evaluateAll(links => links.map(link => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href'),
    }))),
  }
  const httpRequests = requests.filter(item => item.url.startsWith('http'))
  return {
    fixtureAssistedComparison: {
      label: 'Fixture-assisted hosted state — simulated comparison, not production data',
      regression: comparison.includes('regression:'),
      recovery: comparison.includes('recovery:'),
      changed: comparison.includes('changed:'),
      unchanged: comparison.includes('unchanged:'),
      states,
    },
    narrow: { before, afterBack, focusOnPassport, overflow320, zoom200 },
    routes,
    footer,
    runtime: {
      consoleMessages,
      pageErrors,
      origins: [...new Set(httpRequests.map(item => new URL(item.url).origin))],
      methods: [...new Set(httpRequests.map(item => item.method))],
      unexpectedExternal: httpRequests.filter(item => new URL(item.url).origin !== origin),
      nonGet: httpRequests.filter(item => item.method !== 'GET'),
    },
  }
}
